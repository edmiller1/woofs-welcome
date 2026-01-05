import {
  aggregateDailyAnalyticsJob,
  cleanupRedisKeysJob,
  flushViewsJob,
} from "../jobs/analytics-jobs";

export class CronService {
  /**
   * GET /cron/flush-views
   * Flush batched views to database
   * Run every 5 minutes
   */
  static async flushViews() {
    try {
      console.log("📊 Cron job triggered: flush-views");
      await flushViewsJob();
      return { success: true, job: "flush-views" };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to flush views");
    }
  }

  /**
   * GET /cron/aggregate-daily
   * Aggregate daily analytics
   * Run at 1 AM daily
   */
  static async aggregateDaily() {
    try {
      console.log("📊 Cron job triggered: aggregate-daily");
      await aggregateDailyAnalyticsJob();
      return { success: true, job: "aggregate-daily" };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to aggregate daily analytics");
    }
  }

  /**
   * GET /cron/cleanup-redis
   * Clean up old Redis keys
   * Run at 2 AM daily
   */
  static async cleanupRedis() {
    try {
      console.log("📊 Cron job triggered: cleanup-redis");
      await cleanupRedisKeysJob();
      return { success: true, job: "cleanup-redis" };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to cleanup Redis keys");
    }
  }
}
