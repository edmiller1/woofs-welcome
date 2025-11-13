import { and, asc, between, eq, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "../db";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import {
  City,
  Favourite,
  Place,
  PlaceImage,
  placeTypeEnum,
  Review,
} from "../db/schema";
import { Cloudinary } from "../lib/cloudinary";
import { Google } from "../lib/google";
import {
  calculateDistance,
  checkIsFavourited,
  getBoundingBox,
  optimizePlaceImages,
} from "../lib/helpers";
import {
  GetExplorePlacesQuery,
  GetPlacesQuery,
  SearchPlacesNavbarQuery,
} from "../routes/place/schemas";
import { count } from "drizzle-orm";

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

  /**
   * Get places in explore page
   */
  static async getExplorePlaces(
    query: GetExplorePlacesQuery,
    userId: string | undefined
  ) {
    try {
      const {
        city,
        types,
        dogAccess,
        page,
        limit = 20,
        minRating,
        sortBy,
      } = query;

      const conditions = [];

      // Filter by city
      if (city) {
        const cityRecord = await db.query.City.findFirst({
          where: eq(City.name, city),
        });

        console.log("Filtering by city:", cityRecord);

        if (cityRecord) {
          conditions.push(eq(Place.cityId, cityRecord.id));
        }
      }

      // Filter by types (comma-separated string to array)
      if (types) {
        console.log("🏷️ Filtering by types:", types);
        const typeArray = types.split(",");
        conditions.push(
          or(
            ...typeArray.map(
              (type) => sql`${Place.types}::text[] && ARRAY[${type}]::text[]`
            )
          )
        );
      }

      // Filter by dog access
      if (dogAccess === "indoor") {
        conditions.push(eq(Place.indoorAllowed, true));
      } else if (dogAccess === "outdoor") {
        conditions.push(eq(Place.outdoorAllowed, true));
      }

      // Filter by minimum rating
      if (minRating) {
        conditions.push(sql`${Place.rating}::numeric >= ${minRating}`);
      }

      // Determine sort order
      let orderBy;
      switch (sortBy) {
        case "rating":
          orderBy = [sql`${Place.rating} DESC NULLS LAST`];
          break;
        case "recent":
          orderBy = [sql`${Place.createdAt} DESC`];
          break;
        case "name":
          orderBy = [asc(Place.name)];
          break;
        default:
          orderBy = [sql`${Place.rating} DESC NULLS LAST`];
      }

      // Calculate offset
      const offset = page * limit;

      // Fetch places with filters
      const places = await db.query.Place.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          images: true,
          reviews: {
            limit: 5,
            orderBy: [sql`${Review.createdAt} DESC`],
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          city: {
            with: {
              region: true,
            },
          },
          activeClaim: true,
        },
        limit: limit,
        offset: offset,
        orderBy: orderBy,
      });

      // Get total count for pagination metadata
      const [totalCount] = await db
        .select({ count: count() })
        .from(Place)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Optimize images
      const optimizedPlaces = await optimizePlaceImages(places);

      // Check favorites if user is logged in
      let placesWithFavourites = optimizedPlaces;

      if (userId) {
        const placeIds = optimizedPlaces.map((p) => p.id);
        const favourites = await db.query.Favourite.findMany({
          where: and(
            eq(Favourite.userId, userId),
            inArray(Favourite.placeId, placeIds)
          ),
        });
        const favouriteIds = new Set(favourites.map((f) => f.placeId));

        placesWithFavourites = optimizedPlaces.map((place) => ({
          ...place,
          hasFavourited: favouriteIds.has(place.id),
        }));
      }

      return {
        places: placesWithFavourites,
        pagination: {
          page,
          limit,
          total: totalCount.count,
          totalPages: Math.ceil(totalCount.count / limit),
          hasMore: (page + 1) * limit < totalCount.count,
        },
      };
    } catch (error) {
      console.error("Error fetching places:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch places", {
        originalError: error,
      });
    }
  }

  /**
   * Search places for navbar (name and location)
   */
  static async searchPlacesNavbar(
    query: SearchPlacesNavbarQuery,
    userId: string | undefined
  ) {
    try {
      const { q, limit = 10 } = query;

      console.log("🔍 Searching places with query:", q);

      //Search for places by name or location
      const places = await db.query.Place.findMany({
        where: or(
          sql`LOWER(${Place.name}) LIKE LOWER(${"%" + q + "%"})`,
          sql`EXISTS (
          SELECT 1 FROM ${City}
          WHERE ${City.id} = ${Place.cityId}
          AND LOWER(${City.name}) LIKE LOWER(${"%" + q + "%"})
        )`
        ),
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
        limit: limit,
        orderBy: [sql`${Place.rating} DESC NULLS LAST`],
      });

      // Optimize images
      const optimizedPlaces = await optimizePlaceImages(places);

      let placesWithFavourites = optimizedPlaces;

      if (userId) {
        const placeIds = optimizedPlaces.map((p) => p.id);
        const favourites = await db.query.Favourite.findMany({
          where: and(
            eq(Favourite.userId, userId),
            inArray(Favourite.placeId, placeIds)
          ),
        });
        const favouriteIds = new Set(favourites.map((f) => f.placeId));

        placesWithFavourites = optimizedPlaces.map((place) => ({
          ...place,
          hasFavourited: favouriteIds.has(place.id),
        }));
      }

      return placesWithFavourites;
    } catch (error) {
      console.error("Error searching places:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to search places", {
        originalError: error,
      });
    }
  }
}
