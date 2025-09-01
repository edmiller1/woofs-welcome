import { Context, Next } from "hono";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema";
import { Session, User as betterAuthUser } from "better-auth/types";
import { auth } from "../lib/auth";

declare module "hono" {
  interface ContextVariableMap {
    user: betterAuthUser | null;
    session: Session | null;
  }
}

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  await next();
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

// Business account middleware - simplified for MVP
export const businessMiddleware = async (c: Context, next: Next) => {
  const auth = c.get("user");

  if (!auth) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, auth.id),
  });

  if (!dbUser) {
    return c.json(
      {
        error: "User not found",
        message: "User not found",
      },
      404
    );
  }

  if (!user.isBusinessAccount) {
    return c.json(
      {
        error: "Business account required",
        message: "This operation requires a business account",
      },
      403
    );
  }

  await next();
};
