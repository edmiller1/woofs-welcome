import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { Place, PlaceDailyAnalytics, PlaceView } from "../db/schema";
import { getCurrentDateKey, getCurrentHourKey, redis } from "../lib/redis";
import { randomUUID } from "crypto";

interface ViewEventData {
  placeId: string;
  userId?: string | null;
  sessionId: string;
  source?: string;
  referrer?: string;
  city?: string;
  region?: string;
  deviceType?: string;
}

interface ViewCountResult {
  counted: boolean;
  reason?: string;
}

export class AnalyticsRepository {
  /**
   * Record a view event in Redis
   * Fast response, batched writes to database
   */
  static async recordView(data: ViewEventData): Promise<ViewCountResult> {
    const { placeId, sessionId } = data;

    // 1. Deduplication: Check if this session viewed this place recently (30 min)
    const dedupKey = `view:dedup:${placeId}:${sessionId}`;
    const alreadyViewed = await redis.get(dedupKey);

    if (alreadyViewed) {
      return { counted: false, reason: "duplicate" };
    }

    // 2. Rate limiting: Max 5 views per session per place per hour
    const rateLimitKey = `view:ratelimit:${sessionId}:${placeId}:${getCurrentHourKey()}`;
    const viewCount = await redis.get(rateLimitKey);

    if (viewCount && parseInt(viewCount as string) >= 5) {
      return { counted: false, reason: "rate_limit" };
    }

    // 3. Mark as viewed (30 min expiry)
    await redis.setex(dedupKey, 1800, "1");

    // 4. Increment rate limit counter (1 hour expiry)
    await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 3600);

    // 5. Increment counters in Redis
    const placeKey = `place:${placeId}:views`;
    const dateKey = getCurrentDateKey();

    // Use pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Total views (persists)
    pipeline.hincrby(placeKey, "total", 1);

    // Today's views (reset daily)
    pipeline.hincrby(placeKey, `day:${dateKey}`, 1);

    // This hour's views (for real-time dashboard)
    pipeline.hincrby(placeKey, `hour:${getCurrentHourKey()}`, 1);

    // Unique sessions today
    pipeline.sadd(`place:${placeId}:sessions:${dateKey}`, sessionId);

    // Track by source
    if (data.source) {
      pipeline.hincrby(`place:${placeId}:sources:${dateKey}`, data.source, 1);
    }

    // Track by city
    if (data.city) {
      pipeline.zincrby(`place:${placeId}:cities:${dateKey}`, 1, data.city);
    }

    await pipeline.exec();

    // 6. Add to pending batch (for database write)
    const batchKey = `views:batch:${getCurrentHourKey()}`;
    const viewEvent = JSON.stringify({
      id: randomUUID(),
      placeId: data.placeId,
      userId: data.userId || null,
      sessionId: data.sessionId,
      source: data.source || null,
      referrer: data.referrer || null,
      city: data.city || null,
      region: data.region || null,
      deviceType: data.deviceType || null,
      viewedAt: new Date().toISOString(),
    });

    await redis.rpush(batchKey, viewEvent);
    await redis.expire(batchKey, 7200); // 2 hour expiry

    return { counted: true };
  }

  /**
   * Get real-time view statistics from Redis
   */
  static async getRealtimeStats(placeId: string) {
    const placeKey = `place:${placeId}:views`;
    const dateKey = getCurrentDateKey();
    const hourKey = getCurrentHourKey();

    const [viewData, uniqueSessions] = await Promise.all([
      redis.hgetall(placeKey),
      redis.scard(`place:${placeId}:sessions:${dateKey}`),
    ]);

    return {
      total: parseInt((viewData?.[`total`] as string) || "0"),
      today: parseInt((viewData?.[`day:${dateKey}`] as string) || "0"),
      thisHour: parseInt((viewData?.[`hour:${hourKey}`] as string) || "0"),
      uniqueToday: uniqueSessions || 0,
    };
  }

  /**
   * Get view breakdown by source (real-time)
   */
  static async getViewsBySource(placeId: string, date?: string) {
    const dateKey = date || getCurrentDateKey();
    const sources = await redis.hgetall(`place:${placeId}:sources:${dateKey}`);

    if (!sources) return [];

    return Object.entries(sources).map(([source, count]) => ({
      source,
      views: parseInt(count as string),
    }));
  }

  /**
   * Get view breakdown by city (real-time)
   */
  static async getViewsByCity(placeId: string, date?: string) {
    const dateKey = date || getCurrentDateKey();
    const cities = await redis.zrange(
      `place:${placeId}:cities:${dateKey}`,
      0,
      9,
      { withScores: true }
    );

    if (!cities || cities.length === 0) return [];

    const result: Array<{ city: string; views: number }> = [];
    for (let i = 0; i < cities.length; i += 2) {
      result.push({
        city: cities[i] as string,
        views: parseInt(cities[i + 1] as string),
      });
    }

    return result;
  }

  /**
   * Flush batched views to PostgreSQL
   * Called by cron job every 5 minutes
   */
  static async flushToDatabase(hourKey: string) {
    const batchKey = `views:batch:${hourKey}`;

    // Get all pending views
    const viewsJson = await redis.lrange(batchKey, 0, -1);

    if (!viewsJson || viewsJson.length === 0) {
      console.log(`No views to flush for ${hourKey}`);
      return { flushed: 0 };
    }

    const views = viewsJson.map((json) => JSON.parse(json as string));

    console.log(`📊 Flushing ${views.length} views to database (${hourKey})`);

    try {
      // Insert all views into database
      if (views.length > 0) {
        await db.insert(PlaceView).values(
          views.map((view) => ({
            id: view.id,
            placeId: view.placeId,
            userId: view.userId,
            sessionId: view.sessionId,
            source: view.source,
            referrer: view.referrer,
            city: view.city,
            region: view.region,
            country: "NZ",
            deviceType: view.deviceType,
            viewedAt: new Date(view.viewedAt),
            timeOnPage: null,
          }))
        );
      }

      // Update place total counts
      const viewsByPlace = views.reduce(
        (acc, view) => {
          acc[view.placeId] = (acc[view.placeId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      for (const [placeId, count] of Object.entries(viewsByPlace)) {
        await db
          .update(Place)
          .set({
            totalViews: sql`${Place.totalViews} + ${count}`,
            analyticsLastUpdated: new Date(),
          })
          .where(eq(Place.id, placeId));
      }

      // Delete the batch from Redis
      await redis.del(batchKey);

      console.log(`✅ Successfully flushed ${views.length} views`);

      return { flushed: views.length };
    } catch (error) {
      console.error(`❌ Failed to flush views for ${hourKey}:`, error);
      // Don't delete the batch if flush failed - will retry next run
      throw error;
    }
  }

  /**
   * Aggregate daily analytics
   * Called by cron job at end of day
   */
  static async aggregateDailyAnalytics(date: Date) {
    const dateKey = getCurrentDateKey();

    console.log(`📊 Aggregating analytics for ${dateKey}`);

    // Get all places that had views today
    const placeKeys = await redis.keys(`place:*:views`);

    for (const key of placeKeys) {
      const placeId = key.split(":")[1];

      const [totalViews, uniqueSessions, sources, cities] = await Promise.all([
        redis.hget(key, `day:${dateKey}`),
        redis.scard(`place:${placeId}:sessions:${dateKey}`),
        this.getViewsBySource(placeId, dateKey),
        this.getViewsByCity(placeId, dateKey),
      ]);

      if (!totalViews || parseInt(totalViews as string) === 0) {
        continue; // No views for this place today
      }

      // Get average time on page from database
      const avgTimeResult = await db
        .select({
          avg: sql<number>`AVG(${PlaceView.timeOnPage})::int`,
        })
        .from(PlaceView)
        .where(
          and(
            eq(PlaceView.placeId, placeId),
            gte(PlaceView.viewedAt, new Date(date.setHours(0, 0, 0, 0))),
            lte(PlaceView.viewedAt, new Date(date.setHours(23, 59, 59, 999)))
          )
        );

      // Aggregate sources into object
      const viewsBySource = sources.reduce(
        (acc, { source, views }) => {
          acc[source] = views;
          return acc;
        },
        {} as Record<string, number>
      );

      // Store in daily analytics table
      await db.insert(PlaceDailyAnalytics).values({
        id: randomUUID(),
        placeId,
        date: new Date(date.setHours(0, 0, 0, 0)),
        totalViews: parseInt(totalViews as string),
        uniqueViews: uniqueSessions || 0,
        viewsBySource,
        viewsByCity: cities,
        avgTimeOnPage: avgTimeResult[0]?.avg || null,
      });
    }

    console.log(`✅ Daily analytics aggregated for ${placeKeys.length} places`);
  }

  /**
   * Clean up Redis keys
   * Called by cron job
   */
  static async cleanupRedisKeys() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getCurrentDateKey();

    // Clean up yesterday's temporary keys
    const keysToDelete = await redis.keys(`*:${yesterdayKey}`);

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      console.log(`🧹 Cleaned up ${keysToDelete.length} Redis keys`);
    }
  }

  /**
   * Get historical analytics from database
   */
  static async getHistoricalAnalytics(
    placeId: string,
    startDate: Date,
    endDate: Date
  ) {
    const analytics = await db.query.PlaceDailyAnalytics.findMany({
      where: and(
        eq(PlaceDailyAnalytics.placeId, placeId),
        gte(PlaceDailyAnalytics.date, startDate),
        lte(PlaceDailyAnalytics.date, endDate)
      ),
      orderBy: [desc(PlaceDailyAnalytics.date)],
    });

    return analytics;
  }
}
