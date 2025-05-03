import { Hono } from "hono";
import { authRouter } from "./routes/auth";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use("/api/auth", authMiddleware);

app.route("/api/auth", authRouter);

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
