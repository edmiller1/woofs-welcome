import { and, between, eq, ne, sql } from "drizzle-orm";
import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { Favourite, Place, PlaceImage, placeTypeEnum } from "../db/schema";
import { Cloudinary } from "../lib/cloudinary";
import { Google } from "../lib/google";
import {
  calculateDistance,
  checkIsFavourited,
  getBoundingBox,
  optimizePlaceImages,
} from "../lib/helpers";

/**
 * Place Service
 *
 * Handles all place-related business logic
 */
export class PlaceService {
  /**
   * Get a place
   */
  static async getPlace(slug: string, userId: string | undefined) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
        with: {
          city: {
            with: {
              region: {
                with: {
                  island: true,
                },
              },
            },
          },
          images: true,
          activeClaim: true,
        },
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      if (place.images.length === 0) {
        try {
          const placesData = await Google.searchPlaces(
            place.name,
            place.city?.name
          );

          const images = await Google.getPlacePhotos(placesData[0].place_id);

          if (!images || images.length === 0) {
            console.log("No images found from Google Places");
            return;
          }

          console.log(
            `Found ${images.length} images, uploading to Cloudinary...`
          );

          // Upload all images
          const cloudImages = await Promise.allSettled(
            images.map(async (image, index) => {
              const cloudImage = await Cloudinary.uploadGoogleImage(
                image,
                place.slug,
                index
              );

              if (cloudImage) {
                return {
                  ...cloudImage,
                  source: "google",
                  placeId: place.id,
                };
              }
              throw new Error("Upload failed");
            })
          );

          // Extract successful uploads
          const successfulUploads = cloudImages
            .filter((result) => result.status === "fulfilled")
            .map(
              (result) =>
                (
                  result as PromiseFulfilledResult<{
                    url: string;
                    publicId: string;
                    displayOrder: number;
                    placeId: string;
                    source: string;
                  }>
                ).value
            );

          const failedUploads = cloudImages.filter(
            (result) => result.status === "rejected"
          );

          console.log(`✅ ${successfulUploads.length} successful uploads`);
          console.log(`❌ ${failedUploads.length} failed uploads`);

          if (successfulUploads.length > 0) {
            await db.insert(PlaceImage).values(successfulUploads);
            console.log(
              `✅ Saved ${successfulUploads.length} images to database`
            );
          }
        } catch (error) {
          console.error("Error in image processing:", error);
        }
      }

      let isFavourited = false;

      if (userId) {
        isFavourited = await checkIsFavourited(userId, place.id);
      }

      return {
        ...place,
        isFavourited,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch place", {
        originalError: error,
      });
    }
  }

  /**
   * Favourite a place
   */
  static async togglePlaceLike(userId: string, placeId: string) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const existingFavourite = await db.query.Favourite.findFirst({
        where: and(
          eq(Favourite.userId, userId),
          eq(Favourite.placeId, placeId)
        ),
      });

      if (existingFavourite) {
        await db
          .delete(Favourite)
          .where(eq(Favourite.id, existingFavourite.id));
        return { success: true, action: "removed" };
      } else {
        await db.insert(Favourite).values({
          userId: userId,
          placeId: placeId,
          createdAt: new Date(),
        });
        return { success: true, action: "added" };
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to update place like", {
        originalError: error,
      });
    }
  }

  /**
   * Get all place types
   */
  static async getPlaceTypes() {
    return placeTypeEnum.enumValues;
  }

  /**
   * Get 20 random places for homepage
   */
  static async getRandomPlaces() {
    try {
      const places = await db.query.Place.findMany({
        orderBy: [sql`RANDOM()`],
        limit: 20,
        with: {
          images: true,
          city: {
            with: {
              region: true,
            },
          },
        },
      });

      const optimizedPlaces = await optimizePlaceImages(places);

      return optimizedPlaces;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch random places", {
        originalError: error,
      });
    }
  }

  /**
   * Get nearby places
   */
  static async getNearbyPlaces(
    slug: string,
    lat: number,
    lng: number,
    radius: number,
    limit: number,
    userId: string | undefined
  ) {
    try {
      const place = await db.query.Place.findFirst({
        where: eq(Place.slug, slug),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const excludeId = place.id;
      const bbox = getBoundingBox(lat, lng, radius);

      const conditions = [
        between(
          sql`CAST(${Place.latitude} AS DECIMAL)`,
          bbox.minLat.toString(),
          bbox.maxLat.toString()
        ),
        between(
          sql`CAST(${Place.longitude} AS DECIMAL)`,
          bbox.minLng.toString(),
          bbox.maxLng.toString()
        ),
      ];

      // Exclude current place
      if (excludeId) {
        conditions.push(ne(Place.id, excludeId));
      }

      const places = await db.query.Place.findMany({
        where: and(...conditions),
        limit: limit * 2,
        with: {
          city: {
            with: {
              region: {
                with: {
                  island: true,
                },
              },
            },
          },
          images: true,
          activeClaim: true,
        },
      });

      // Calculate actual distances and filter by radius
      const placesWithDistance = places
        .map((place) => {
          const distance = calculateDistance(
            lat,
            lng,
            parseFloat(place.latitude || "0"),
            parseFloat(place.longitude || "0")
          );
          return { ...place, distance };
        })
        .filter((place) => place.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      let isFavourited = false;

      if (userId) {
        isFavourited = await checkIsFavourited(userId, place.id);
      }

      return {
        places: placesWithDistance.map((p) => ({ ...p, isFavourited })),
        center: { lat, lng },
        radius,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch nearby places", {
        originalError: error,
      });
    }
  }
}
