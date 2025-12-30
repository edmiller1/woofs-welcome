import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, emailOTP, oneTap } from "better-auth/plugins";
import { db } from "../db";
import { resend } from "./resend";
import { createOtpEmailHtml } from "../emails/create-otp-email";
import { createWelcomeEmail } from "../emails/create-welcome-email";
import { eq } from "drizzle-orm";
import { user } from "../db/schema";
import * as schema from "../db/schema";
import { env } from "../config/env";
import {
  getBusiness,
  getUserBusiness,
  getUserPrivacySettings,
  getUserProvider,
} from "./helpers";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      partitioned: true, // New browser standards will mandate this for foreign cookies
    },
  },
  emailAndPassword: {
    enabled: true, // This should enable sign-up/sign-in routes
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: env.GOOGLE_REDIRECT_URI,
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const provider = await getUserProvider(user.id);
      const isProfilePublic = await getUserPrivacySettings(user.id);
      const isBusinessAccount = await getUserBusiness(user.id);
      const userBusiness = await getBusiness(user.id);
      return {
        user: {
          ...user,
          provider: provider || "google",
          isProfilePublic: isProfilePublic ?? true,
          isBusinessAccount,
          business: userBusiness,
        },
        session,
      };
    }),
    oneTap(),
    emailOTP({
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      async sendVerificationOTP({ email, otp, type }) {
        console.log("Sending OTP:", {
          email,
          otp: otp.slice(0, 2) + "****",
          type,
        });
        const subject = "Sign in to Woofs Welcome";

        const { error } = await resend.emails.send({
          from: "Woofs Welcome <hello@woofswelcome.app>",
          to: email,
          subject,
          html: createOtpEmailHtml(otp, "sign-in"),
        });

        if (error) {
          console.error("Failed to send OTP email:", error);
          throw new Error("Failed to send verification email");
        }
        console.log("OTP email sent successfully");
      },
    }),
  ],
  basePath: "/api/auth",
  trustedOrigins: [env.CLIENT_BASE_URL],
  secret: env.BETTER_AUTH_SECRET,
  databaseHooks: {
    user: {
      additionalFields: {
        isProfilePublic: {
          type: "boolean",
          required: false,
          defaultValue: true,
          returned: true,
        },
        firstName: {
          type: "string",
          required: false,
        },
        lastName: {
          type: "string",
          required: false,
        },
        provider: {
          type: "string",
          required: false,
          default: "google",
          returned: true,
        },
        businessName: {
          type: "string",
          required: false,
        },
        businessEmail: {
          type: "string",
          required: false,
        },
        businessPhone: {
          type: "string",
          required: false,
        },
        website: {
          type: "string",
          required: false,
        },
        businessDescription: {
          type: "string",
          required: false,
        },
        logoUrl: {
          type: "string",
          required: false,
        },
      },
      create: {
        after: async (user) => {
          console.log("User created:", user);
          // Send welcome email
          const { error } = await resend.emails.send({
            from: "Woofs Welcome <hello@woofswelcome.app>",
            to: user.email!,
            subject: "Welcome",
            html: createWelcomeEmail(),
          });
          if (error) {
            console.error("Failed to send welcome email:", error);
          }
        },
      },
    },
    hooks: {
      after: [
        {
          matcher(context: any) {
            return (
              context.type === "credential.signIn" ||
              context.type === "credential.signUp"
            );
          },
          handler: async (ctx: any) => {
            // Update provider to "email" for email/OTP auth
            await db
              .update(user)
              .set({ provider: "email" })
              .where(eq(user.id, ctx.user.id));
          },
        },
        {
          matcher(context: any) {
            return (
              context.type === "oauth.signIn" || context.type === "oauth.signUp"
            );
          },
          handler: async (ctx: any) => {
            // Update provider to the OAuth provider (google, etc.)
            const provider = ctx.account?.providerId || "google";
            await db
              .update(user)
              .set({ provider })
              .where(eq(user.id, ctx.user.id));
          },
        },
      ],
    },
  },
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
