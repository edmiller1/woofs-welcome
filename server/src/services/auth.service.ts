import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { Favourite, user } from "../db/schema";
import { Cloudinary } from "../lib/cloudinary";
import { AppError, DatabaseError, UnauthorizedError } from "../lib/errors";
import { sanitizePlainText } from "../lib/sanitize";
import { count } from "drizzle-orm";
import { optimizePlaceImage } from "../lib/helpers/region";
import { optimizePlaceImages } from "../lib/helpers";

/**
 * Auth Service
 *
 * Handles all auth-related business logic
 */

export class AuthService {
  /**
   * Welcome user
   */
  static async WelcomeUser(userId: string, name?: string, image?: string) {
    try {
      const sanitizedName = sanitizePlainText(name);

      if (!sanitizedName || sanitizedName.length < 2) {
        throw new Error("Name must be at least 2 characters");
      }

      if (sanitizedName.length > 50) {
        throw new Error("Name must be less than 50 characters");
      }

      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(sanitizedName)) {
        throw new Error(
          "Name can only contain letters, spaces, hyphens, and apostrophes"
        );
      }

      let userImage = { id: "", url: "" };

      if (image) {
        userImage = await Cloudinary.upload(image, "ww-profile-images");
      }

      if (userImage.id) {
        await db
          .update(user)
          .set({
            name: sanitizedName,
            image: userImage.url,
            imagePublicId: userImage.id,
          })
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

  static async getProfileFavourites(
    userId: string,
    limit: number = 12,
    offset: number = 0
  ) {
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
        limit: limit,
        offset: offset,
        orderBy: [desc(Favourite.createdAt)],
      });

      const [{ count: totalCount }] = await db
        .select({ count: count() })
        .from(Favourite)
        .where(eq(Favourite.userId, userId));

      const places = favourites.map((fav) => fav.place);
      const hasMore = offset + places.length < totalCount;
      const optimizedPlaces = await optimizePlaceImages(places);

      return {
        data: optimizedPlaces,
        total: totalCount,
        hasMore: hasMore,
      };
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

  static async getUserProfile(userId: string) {
    try {
      const userProfile = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      return userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch user profile", {
        originalError: error,
      });
    }
  }

  static async updateProfile(userId: string, name?: string, image?: string) {
    try {
      // Get current user first
      const userRecord = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userRecord) {
        throw new Error("User not found");
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      // Only validate and update name if it's provided
      if (name !== undefined) {
        const sanitizedName = sanitizePlainText(name);

        if (!sanitizedName || sanitizedName.length < 2) {
          throw new Error("Name must be at least 2 characters");
        }

        if (sanitizedName.length > 50) {
          throw new Error("Name must be less than 50 characters");
        }

        const nameRegex = /^[a-zA-Z\s'-]+$/;
        if (!nameRegex.test(sanitizedName)) {
          throw new Error(
            "Name can only contain letters, spaces, hyphens, and apostrophes"
          );
        }

        updateData.name = sanitizedName;
      }

      // Only process image if it's provided
      if (image !== undefined) {
        // Delete old image if exists
        if (userRecord.imagePublicId) {
          try {
            await Cloudinary.deleteAvatar(userRecord.imagePublicId);
          } catch (error) {
            console.error("Failed to delete old avatar:", error);
            // Continue anyway - don't fail the whole update
          }
        }

        // Upload new image
        const userImage = await Cloudinary.upload(image, "ww-profile-images");
        updateData.image = userImage.url;
        updateData.imagePublicId = userImage.id;
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length > 1) {
        await db.update(user).set(updateData).where(eq(user.id, userId));
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to update user profile", {
        originalError: error,
      });
    }
  }

  /**
   * Soft delete user account
   */
  static async deleteAccount(userId: string) {
    try {
      await db
        .update(user)
        .set({ deletedAt: new Date() })
        .where(eq(user.id, userId));

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to delete user account", {
        originalError: error,
      });
    }
  }
}
