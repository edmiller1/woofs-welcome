import type { TRPCRouterRecord } from "@trpc/server";

import { eq } from "@acme/db";
import { User } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const paymentRouter = {
  getBusinessPlan: protectedProcedure.query(async ({ ctx }) => {
    const business = await ctx.db.query.User.findFirst({
      where: eq(User.id, ctx.session?.user.id),
    });

    if (!business) {
      throw new Error("Business not authenticated");
    }

    return { plan: business.plan };
  }),
} satisfies TRPCRouterRecord;
