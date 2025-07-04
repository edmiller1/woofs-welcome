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

const app = new Hono();

app.use("*", logger());
app.use("*", cors({
  origin: process.env.NODE_ENV === "development" ? "http://localhost:5173" : "your-production-domain",
  maxAge: 86400,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.on(["POST", "GET"], "/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

// Your custom routes
app.use("/api/user", authMiddleware);
app.route("/api/auth", betterAuthRouter);
app.route("/api/user", authRouter);
app.route("/api/place", placeRouter);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

showRoutes(app);

export default {
  port: process.env.PORT || 9000,
  fetch: app.fetch,
};