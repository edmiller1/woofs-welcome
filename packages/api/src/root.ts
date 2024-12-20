import { authRouter } from "./router/auth";
import { paymentRouter } from "./router/payment";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  payment: paymentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
