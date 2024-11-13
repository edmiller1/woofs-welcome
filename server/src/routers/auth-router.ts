import { db } from "../db";
import { router } from "../__internals/router";
import { privateProcedure, publicProcedure } from "../procedures";
import { kindeClient, sessionManager } from "../kinde";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const authRouter = router({
  register: publicProcedure.query(async ({ c, ctx }) => {
    const registerUrl = await kindeClient.register(sessionManager(c));
    return c.redirect(registerUrl.toString());
  }),
  login: publicProcedure.query(async ({ c, ctx }) => {
    const loginUrl = await kindeClient.login(sessionManager(c));
    return c.redirect(loginUrl.toString());
  }),
  callback: publicProcedure.query(async ({ c, ctx }) => {
    const url = new URL(c.req.url);
    await kindeClient.handleRedirectToApp(sessionManager(c), url);
    return c.redirect("/");
  }),
  logout: privateProcedure.query(async ({ c, ctx }) => {
    const logoutUrl = await kindeClient.logout(sessionManager(c));
    return c.redirect(logoutUrl.toString());
  }),
  currentUser: privateProcedure.query(async ({ c, ctx }) => {
    const profile = await kindeClient.getUserProfile(sessionManager(c));

    return c.json(profile);
  }),
  getDatabaseSyncStatusForBusiness: publicProcedure.query(
    async ({ c, ctx }) => {
      const auth = await kindeClient.getUserProfile(sessionManager(c));

      if (!auth) {
        return c.json({ isSynced: false });
      }

      const business = await db
        .select()
        .from(schema.businessesTable)
        .where(eq(schema.businessesTable.externalId, auth.id))
        .limit(1);

      console.log("business exists", business);

      if (!business) {
        await db.insert(schema.businessesTable).values({
          externalId: auth.id,
          plan: "Free",
          contactName: auth.given_name + auth.family_name,
          businessName: "",
          email: auth.email,
          phone: "",
        });
      }

      return c.json({ isSynced: true });
    }
  ),
  getDatabaseSyncStatusForUser: publicProcedure.query(async ({ c, ctx }) => {
    const auth = await kindeClient.getUserProfile(sessionManager(c));

    if (!auth) {
      return c.json({ isSynced: false });
    }

    const user = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.externalId, auth.id))
      .limit(1);

    console.log("user exists", user);

    if (!user) {
      await db.insert(schema.usersTable).values({
        externalId: auth.id,
        email: auth.email,
        name: auth.given_name + auth.family_name,
      });
    }

    return c.json({ isSynced: true });
  }),
});
