import { Context, Next } from "hono";
import { createClient, User as supabaseUser } from "@supabase/supabase-js";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { supabaseClient } from "../supabase";
import { User } from "../db/schema";

declare module "hono" {
  interface ContextVariableMap {
    user: supabaseUser;
    userId: string;
  }
}

// Authentication middleware
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  console.log(authHeader)

  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (error || !user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    // Add user to context
    c.set("user", user);
    await next();
  } catch (err) {
    return c.json({ error: "Internal server error" }, 500);
  }
};

// Business account middleware - simplified for MVP
export const businessMiddleware = async (c: Context, next: Next) => {
  const auth = c.get("user");

  if (!auth) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const user = await db.query.User.findFirst({
    where: eq(User.externalId, auth.id),
  });

  if (!user) {
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

export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    await next();
    return;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (error || !user) {
      await next();
      return;
    }
    c.set("user", user);
    await next();
  } catch (err) {
    console.log(err);
    await next();
  }
};
