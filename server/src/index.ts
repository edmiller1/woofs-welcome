// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { showRoutes } from "hono/dev";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";
import { auth } from "./lib/auth";
import betterAuthRouter from "./routes/better-auth";
import { placeRouter } from "./routes/place";
import { regionRouter } from "./routes/region";
import { cityRouter } from "./routes/city";
import { islandRouter } from "./routes/island";
import { reviewRouter } from "./routes/review";
import { env, validateEnv } from "./config/env";
import {
  globalRateLimiter,
  authRateLimiter,
  sessionRateLimiter,
} from "./middleware/rate-limit";
import { errorHandler } from "./middleware/error-handler";
import { sitemapRouter } from "./routes/sitemap";
import { locationRouter } from "./routes/location";
import { notificationRouter } from "./routes/notification";
import { businessRouter } from "./routes/business";
import { analyticsRouter } from "./routes/analytics";
import { cronRouter } from "./routes/cron";
import { verifyCronSecret } from "./middleware/cron";
import { claimRouter } from "./routes/claim";

validateEnv();

const app = new Hono();

app.use("*", globalRateLimiter); // (200 req / 15min total)
app.use("*", logger());
app.use(
  "*",
  cors({
    origin:
      env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://www.woofswelcome.app",
    maxAge: 86400,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

app.use("/api/auth/get-session", sessionRateLimiter);
app.use("/api/auth/email-otp/*", authRateLimiter);
app.use("/api/auth/sign-in/*", authRateLimiter);
app.use("/api/auth/sign-up/*", authRateLimiter);
app.use("/api/user", authMiddleware);
app.use("/api/cron", verifyCronSecret);

// custom routes
app.route("/api/auth", betterAuthRouter);
app.route("/api/user", authRouter);
app.route("/api/business", businessRouter);
app.route("/api/place", placeRouter);
app.route("/api/region", regionRouter);
app.route("/api/city", cityRouter);
app.route("/api/island", islandRouter);
app.route("/api/review", reviewRouter);
app.route("/api/location", locationRouter);
app.route("/api/notification", notificationRouter);
app.route("/api/analytics", analyticsRouter);
app.route("/api/cron", cronRouter);
app.route("/api/claim", claimRouter);
app.route("sitemap.xml", sitemapRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError(errorHandler);

showRoutes(app);

export default {
  port: env.PORT || 9000,
  fetch: app.fetch,
};
