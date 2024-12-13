import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { invalidateSessionToken } from "@acme/auth";
import { eq } from "@acme/db";
import { User } from "@acme/db/schema";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.User.findFirst({
      where: eq(User.id, ctx.session?.user.id),
    });
    return user;
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
  signOut: protectedProcedure.mutation(async (opts) => {
    if (!opts.ctx.token) {
      return { success: false };
    }
    await invalidateSessionToken(opts.ctx.token);
    return { success: true };
  }),
  getDatabaseSyncStatusForBusiness: publicProcedure.query(async ({ ctx }) => {
    const auth = ctx.session;

    if (!auth) {
      return { isSynced: false };
    }

    const user = await ctx.db.query.User.findFirst({
      where: eq(User.id, auth.user.id),
    });

    console.log("USER IN DB:", user);

    if (!user) {
      await ctx.db.update(User).set({
        name: auth.user.name,
        image: auth.user.image,
        email: auth.user.email!,
        isBusiness: true,
        businessName: "",
      });
    }

    return { isSynced: true };
  }),
  updateBusinessName: protectedProcedure
    .input(z.object({ businessName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const auth = ctx.session;

      if (!auth) {
        return { success: false };
      }

      await ctx.db
        .update(User)
        .set({
          businessName: input.businessName,
        })
        .where(eq(User.id, auth.user.id));

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
