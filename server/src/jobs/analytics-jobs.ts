import { getCurrentHourKey } from "../lib/redis";
import { AnalyticsRepository } from "../repositories/analytics.repository";

/**
 * Flush batched views to database
 * Run every 5 minutes
 */
export async function flushViewsJob() {
  console.log("🔄 Starting view flush job...");

  try {
    const now = new Date();

    // Flush previous hour (safe, complete data)
    const prevHour = new Date(now.getTime() - 3600000);
    const prevHourKey = getCurrentHourKey.call({
      getTime: () => prevHour.getTime(),
    } as Date);

    await AnalyticsRepository.flushToDatabase(prevHourKey);

    console.log("✅ View flush job completed");
  } catch (error) {
    console.error("❌ View flush job failed:", error);
  }
}

/**
 * Aggregate daily analytics
 * Run at 1 AM every day
 */
export async function aggregateDailyAnalyticsJob() {
  console.log("🔄 Starting daily analytics aggregation...");

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await AnalyticsRepository.aggregateDailyAnalytics(yesterday);

    console.log("✅ Daily analytics aggregation completed");
  } catch (error) {
    console.error("❌ Daily analytics aggregation failed:", error);
  }
}

/**
 * Clean up old Redis keys
 * Run at 2 AM every day
 */
export async function cleanupRedisKeysJob() {
  console.log("🔄 Starting Redis cleanup...");

  try {
    await AnalyticsRepository.cleanupRedisKeys();

    console.log("✅ Redis cleanup completed");
  } catch (error) {
    console.error("❌ Redis cleanup failed:", error);
  }
}
