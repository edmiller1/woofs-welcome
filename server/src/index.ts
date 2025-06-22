import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { showRoutes } from "hono/dev";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "your-production-domain",
    maxAge: 86400, // Cache preflight request results for 24 hours
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true, // If you're sending cookies or auth headers
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use("/api/auth", authMiddleware);

app.route("/api/auth", authRouter);

showRoutes(app);

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
