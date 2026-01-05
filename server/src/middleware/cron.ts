import { Context, Next } from "hono";

export const verifyCronSecret = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
