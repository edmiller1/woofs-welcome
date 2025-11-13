import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { Favourite, user } from "../db/schema";
import { Cloudinary } from "../lib/cloudinary";
import { AppError, DatabaseError, UnauthorizedError } from "../lib/errors";
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

  static async getFavourites(userId: string) {
    try {
      const favourites = await db.query.Favourite.findMany({
        where: eq(Favourite.userId, userId),
        with: {
          place: {
            with: {
              images: {
                limit: 1,
              },
              city: {
                with: {
                  region: true,
                },
              },
            },
          },
        },
        limit: 12,
        orderBy: [desc(Favourite.createdAt)],
      });

      return favourites.map((fav) => fav.place);
    } catch (error) {
      console.error("Error fetching favourites:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch favourites", {
        originalError: error,
      });
    }
  }
}
