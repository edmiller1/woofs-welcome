import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { Welcome } from "../../emails/welcome";
import { authMiddleware } from "../../middleware/auth";
import { CreateProfileInput, createProfileSchema } from "./types";
import { zValidator } from "@hono/zod-validator";
import { User } from "../../db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authRouter = new Hono();

//Create a new user profile
authRouter.post(
  "/createProfile",
  authMiddleware,
  zValidator("json", createProfileSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      console.log(auth);

      if (!auth) {
        return c.json({ error: "Unauthorized", isSynced: false }, 401);
      }

      const validatedData = c.req.valid("json") as CreateProfileInput;

      const {
        firstName,
        lastName,
        isBusinessAccount,
        provider,
        businessName,
        businessEmail,
        businessPhone,
      } = validatedData;

      const user = await db.query.User.findFirst({
        where: eq(User.id, auth.id),
      });

      if (!user) {
        //Create new user
        await db.insert(User).values({
          id: auth.id,
          email: auth.email,
          name: auth.name ?? `${firstName} ${lastName}`,
          image: auth.image ?? "",
          provider: provider ?? "Google",
          isAdmin: false,
          isBusinessAccount: isBusinessAccount ?? false,
          businessName: businessName ?? "",
          businessEmail: businessEmail ?? "",
          businessPhone: businessPhone ?? "",
          createdAt: new Date(),
        });

        // Send welcome email
        const { error } = await resend.emails.send({
          from: "Woofs Welcome <hello@woofswelcome.app>",
          to: auth.email!,
          subject: "Welcome",
          react: <Welcome />,
        });

        if (error) {
          throw new Error("Failed to send welcome email");
        }
      }

      let route = "";
      if (!isBusinessAccount) {
        route = "/";
      } else {
        route = "/dashboard";
      }

      const returnData = {
        redirectUrl:
          process.env.NODE_ENV === "production"
            ? `www.woofs-welcome.app${route}`
            : `http://localhost:5173${route}`,
        isSynced: true,
      };

      return c.json(returnData, 200);
    } catch (error) {
      return c.json({ error: "Failed to create user" }, 500);
    }
  }
);
