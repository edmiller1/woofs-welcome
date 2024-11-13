import { db } from "./db";
import { j } from "./__internals/j";
import * as schema from "./db/schema";
import { HTTPException } from "hono/http-exception";
import { kindeClient, sessionManager } from "./kinde";
import { eq } from "drizzle-orm";

const authMiddleware = j.middleware(async ({ c, next }) => {
  const profile = await kindeClient.getUserProfile(sessionManager(c));

  if (!profile) throw new HTTPException(401, { message: "Unauthorized" });

  const user = await db
    .select()
    .from(schema.usersTable)
    .where(eq(schema.usersTable.externalId, profile.id))
    .limit(1);

  const business = await db
    .select()
    .from(schema.businessesTable)
    .where(eq(schema.businessesTable.externalId, profile.id))
    .limit(1);

  if (!user && !business)
    throw new HTTPException(401, { message: "Unauthorized" });

  if (user) {
    return next({ user });
  }

  if (business) {
    return next({ business });
  }
});

/**
 * Public (unauthenticated) procedures
 *
 * This is the base piece you use to build new queries and mutations on your API.
 */
export const baseProcedure = j.procedure;
export const publicProcedure = baseProcedure;
export const privateProcedure = publicProcedure.use(authMiddleware);
