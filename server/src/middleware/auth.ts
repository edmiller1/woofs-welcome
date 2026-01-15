import { Context, Next } from "hono";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { session, user } from "../db/schema";
import { Session, User as betterAuthUser } from "better-auth/types";
import { auth } from "../lib/auth";
import { getUserBusiness } from "../lib/helpers";

declare module "hono" {
  interface ContextVariableMap {
    user: betterAuthUser | null;
    session: Session | null;
    userContext: "personal" | "business";
    isAdmin: boolean;
  }
}

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");
    const token = authHeader?.split(" ")[1] || "";

    if (!token) {
      console.log("No token provided");
      return c.json({ error: "Unauthorized - No token" }, 401);
    }

    const userSession = await db.query.session.findFirst({
      where: eq(session.token, token),
      with: {
        user: true,
      },
    });

    if (!userSession) {
      return c.json({ error: "Unauthorized - Invalid session" }, 401);
    }

    // Check if session is expired
    if (userSession.expiresAt < new Date()) {
      return c.json({ error: "Unauthorized - Session expired" }, 401);
    }

    // get user context
    const userContext = c.req.header("X-User-Context") || "personal";

    const isAdmin = userSession.user.isAdmin as boolean;

    c.set("user", userSession.user);
    c.set("session", userSession);
    c.set("userContext", userContext as "personal" | "business");
    c.set("isAdmin", isAdmin);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Unauthorized - Server error" }, 401);
  }
};

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1] || "";

  if (!token) {
    return next();
  }

  const userSession = await db.query.session.findFirst({
    where: eq(session.token, token),
    with: {
      user: true,
    },
  });

  if (!userSession) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", userSession.user);
  c.set("session", userSession);
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

  const isBusinessAccount = await getUserBusiness(auth.id);

  if (!isBusinessAccount) {
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
