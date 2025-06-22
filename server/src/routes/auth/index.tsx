import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { User } from "../../db/schema";
import { Resend } from "resend";
import { Welcome } from "../../emails/welcome";
import { authMiddleware } from "../../middleware/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authRouter = new Hono();

//Create a new user profile
authRouter.post("/create", authMiddleware, async (c) => {
  try {
    const auth = c.get("user");

    console.log(auth);

    if (!auth) {
      return c.json({ error: "Unauthorized", isSynced: false }, 401);
    }

    const user = await db.query.User.findFirst({
      where: eq(User.externalId, auth.id),
    });

    if (!user) {
      //Create new user
      await db.insert(User).values({
        externalId: auth.id,
        email: auth.email!,
        fullName: auth.user_metadata.full_name
          ? auth.user_metadata.full_name
          : auth.user_metadata.firstname + " " + auth.user_metadata.lastname ||
            "",
        avatarUrl: auth.user_metadata.avatar_url,
        provider: auth.identities?.[0].provider ?? "",
        isAdmin: false,
        isBusinessAccount: auth.user_metadata.is_business_account ?? false,
        businessName: auth.user_metadata.business_name ?? "",
        businessEmail: auth.user_metadata.business_email ?? "",
        businessPhone: auth.user_metadata.business_phone ?? "",
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
    if (!auth.user_metadata.is_business_account) {
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
});
