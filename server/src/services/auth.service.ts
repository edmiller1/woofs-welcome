import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema";
import { Cloudinary } from "../lib/cloudinary";
import { AppError, DatabaseError } from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";

/**
 * Auth Service
 *
 * Handles all auth-related business logic
 */

export class AuthService {
  /**
   * Welcome user
   */
  static async WelcomeUser(userId: string, name: string, image?: string) {
    try {
      const sanitizedName = sanitizePlainText(name);

      if (!sanitizedName || sanitizedName.length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      let userImage = { id: "", url: "" };

      if (image) {
        userImage = await Cloudinary.upload(image, "ww-profile-images");
      }

      if (userImage.id) {
        await db
          .update(user)
          .set({ name: sanitizedName, image: userImage.url })
          .where(eq(user.id, userId));
      } else {
        await db
          .update(user)
          .set({ name: sanitizedName })
          .where(eq(user.id, userId));
      }

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch city", {
        originalError: error,
      });
    }
  }
}
