import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { CronService } from "../../services/cron.service";

export const cronRouter = new Hono();

cronRouter.get("/cron/flush-views", async (c) => {
  const result = await CronService.flushViews();

  return c.json(result, 200);
});

cronRouter.get("/cron/aggregate-daily", async (c) => {
  const result = await CronService.aggregateDaily();

  return c.json(result, 200);
});

cronRouter.get("/cron/cleanup-redis", async (c) => {
  const result = await CronService.cleanupRedis();

  return c.json(result, 200);
});
