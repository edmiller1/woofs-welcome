import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { Welcome } from "../../emails/welcome";
import { authMiddleware } from "../../middleware/auth";
import { CreateProfileInput, createProfileSchema } from "./types";
import { zValidator } from "@hono/zod-validator";
import { user } from "../../db/schema";
import { Cloudinary } from "../../lib/cloudinary";
import { env } from "../../config/env";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  UnauthorizedError,
  ValidationError,
} from "../../lib/errors";
import { sanitizePlainText } from "../../lib/sanitize";
import { validateBody } from "../../middleware/validate";
import { UpdateProfileInput, updateProfileSchema } from "./schemas";
import { AuthService } from "../../services/auth.service";
import { readRateLimiter } from "../../middleware/rate-limit";

const resend = new Resend(env.RESEND_API_KEY);

export const authRouter = new Hono();

//Create a new user profile
authRouter.post(
  "/createProfile",
  authMiddleware,
  zValidator("json", createProfileSchema),
  async (c) => {
    try {
      const auth = c.get("user");

      if (!auth) {
        throw new UnauthorizedError("No auth token");
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

      const dbUser = await db.query.user.findFirst({
        where: eq(user.id, auth.id),
      });

      if (!dbUser) {
        //Create new user
        await db.insert(user).values({
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
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to create user", {
        originalError: error,
      });
    }
  }
);

authRouter.get("/check-emails/:email", async (c) => {
  try {
    const email = c.req.param("email");

    if (!email) {
      throw new BadRequestError("Email parameter is required");
    }

    const emailExists = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (emailExists) {
      return c.json({ exists: true }, 200);
    } else {
      return c.json({ exists: false }, 200);
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to check emails", {
      originalError: error,
    });
  }
});

authRouter.post(
  "/welcome",
  authMiddleware,
  validateBody(updateProfileSchema),
  async (c) => {
    const auth = c.get("user");

    if (!auth) throw new UnauthorizedError("No auth token");

    const { name, image } = c.get("validatedBody") as UpdateProfileInput;

    const result = await AuthService.WelcomeUser(auth.id, name, image);

    return c.json(result, 200);
  }
);

authRouter.get("/favourites", readRateLimiter, authMiddleware, async (c) => {
  const auth = c.get("user");

  if (!auth) throw new UnauthorizedError();

  const result = await AuthService.getFavourites(auth.id);

  return c.json(result, 200);
});
