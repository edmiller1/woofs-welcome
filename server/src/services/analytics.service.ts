import { eq } from "drizzle-orm";
import { NotFoundError, UnauthorizedError } from "../lib/errors";
import { subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Business, Place } from "../db/schema";
import { db } from "../db";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { getUserBusiness } from "../lib/helpers";

export class AnalyticsService {
  /**
   * Get comprehensive analytics for a business owner
   */
  static async getPlaceAnalytics(
    placeId: string,
    businessId: string,
    userId: string
  ) {
    try {
      const business = await db.query.Business.findFirst({
        where: eq(Business.id, businessId),
      });

      if (!business) {
        throw new NotFoundError("Business not found");
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
      });

      if (!place) {
        throw new NotFoundError("Place not found");
      }

      const isOwner = await getUserBusiness(userId);

      if (!isOwner) {
        throw new UnauthorizedError("You do not have access to this business");
      }

      const ownsPlace = place.ownerId === businessId;

      if (!ownsPlace) {
        throw new UnauthorizedError("You do not own this place");
      }

      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Get real-time stats from Redis
      const realtimeStats = await AnalyticsRepository.getRealtimeStats(placeId);
      const viewsBySource = await AnalyticsRepository.getViewsBySource(placeId);
      const viewsByCity = await AnalyticsRepository.getViewsByCity(placeId);

      // Get historical data from database
      const last30Days = await AnalyticsRepository.getHistoricalAnalytics(
        placeId,
        thirtyDaysAgo,
        now
      );

      const thisMonth = await AnalyticsRepository.getHistoricalAnalytics(
        placeId,
        thisMonthStart,
        now
      );

      const lastMonth = await AnalyticsRepository.getHistoricalAnalytics(
        placeId,
        lastMonthStart,
        lastMonthEnd
      );

      // Calculate totals
      const thisMonthTotal = thisMonth.reduce(
        (sum, day) => sum + day.totalViews,
        0
      );
      const lastMonthTotal = lastMonth.reduce(
        (sum, day) => sum + day.totalViews,
        0
      );

      const trend = this.calculateTrend(thisMonthTotal, lastMonthTotal);

      return {
        summary: {
          views: {
            current: thisMonthTotal,
            previous: lastMonthTotal,
            change: trend,
            trend: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
          },
          realtime: realtimeStats,
        },
        viewsOverTime: last30Days
          .map((day) => ({
            date: day.date.toISOString().split("T")[0],
            views: day.totalViews,
            uniqueViews: day.uniqueViews,
          }))
          .reverse(),
        viewsBySource,
        viewsByCity,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new Error("Failed to fetch place analytics");
    }
  }

  static calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
