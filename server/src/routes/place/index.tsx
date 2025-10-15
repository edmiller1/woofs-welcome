import { Hono } from "hono";
import { db } from "../../db";
import { and, between, eq, ne, sql } from "drizzle-orm";
import { Favourite, Place, PlaceImage, placeTypeEnum } from "../../db/schema";
import { Google } from "../../lib/google";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import {
  calculateDistance,
  checkIsFavourited,
  getBoundingBox,
  optimizePlaceImages,
} from "../../lib/helpers";
import { Cloudinary } from "../../lib/cloudinary";
import {
  readRateLimiter,
  favouriteRateLimiter,
} from "../../middleware/rate-limit";
import {
  BadRequestError,
  NotFoundError,
  DatabaseError,
  AppError,
  UnauthorizedError,
} from "../../lib/errors";

export const placeRouter = new Hono();

// Get a place by Slug
placeRouter.get(
  "/:slug",
  readRateLimiter,
  optionalAuthMiddleware,
  async (c) => {
    try {
      const { slug } = c.req.param();
      if (!slug) {
        throw new BadRequestError("Slug is required");
      }

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
      const auth = c.get("user");

      if (auth) {
        isFavourited = await checkIsFavourited(auth.id, place.id);
      }

      return c.json({ ...place, isFavourited });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch place", {
        originalError: error,
      });
    }
  }
);

placeRouter.get("/", readRateLimiter, async (c) => {
  const places = await db.query.Place.findMany({
    with: {
      images: true,
      city: {
        with: {
          region: true,
        },
      },
    },
  });

  return c.json(places, 200);
});

// Favourite a place
placeRouter.post(
  "/:placeId/favourite",
  authMiddleware,
  favouriteRateLimiter,
  async (c) => {
    try {
      const auth = c.get("user");
      console.log("Auth: ", auth);

      if (!auth) {
        throw new UnauthorizedError("No auth token");
      }

      const placeId = c.req.param("placeId");

      if (!placeId) {
        throw new BadRequestError("Place ID is required");
      }

      const place = await db.query.Place.findFirst({
        where: eq(Place.id, placeId),
      });

      if (!place) {
        throw new NotFoundError("Place");
      }

      const existingFavourite = await db.query.Favourite.findFirst({
        where: and(
          eq(Favourite.userId, auth.id),
          eq(Favourite.placeId, placeId)
        ),
      });

      if (existingFavourite) {
        await db
          .delete(Favourite)
          .where(eq(Favourite.id, existingFavourite.id));
        return c.json({ success: true, action: "removed" }, 200);
      } else {
        await db.insert(Favourite).values({
          userId: auth.id,
          placeId: placeId,
          createdAt: new Date(),
        });
        return c.json({ success: true, action: "added" }, 200);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError(
        "Failed adding or removing place to/from favourites",
        {
          originalError: error,
        }
      );
    }
  }
);

placeRouter.get("/list/types", async (c) => {
  try {
    const types = placeTypeEnum.enumValues;

    return c.json(types, 200);
  } catch (error) {
    console.error("Error fetching place types:", error);
    return c.json({ error: "Failed to fetch place types" }, 500);
  }
});

placeRouter.get("/list/random", async (c) => {
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

    return c.json({ places: optimizedPlaces }, 200);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch random places", {
      originalError: error,
    });
  }
});

placeRouter.get("/nearby/:slug", optionalAuthMiddleware, async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
    });

    if (!place) {
      throw new NotFoundError("Place");
    }

    const lat = parseFloat(c.req.query("lat") || "0");
    const lng = parseFloat(c.req.query("lng") || "0");
    const radius = parseFloat(c.req.query("radius") || "5"); // Default 5km
    const excludeId = place.id; // Exclude current place
    const limit = parseInt("10"); // Default 10 places

    if (!lat || !lng) {
      return c.json({ error: "Latitude and longitude are required" }, 400);
    }

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
    const auth = c.get("user");

    if (auth) {
      isFavourited = await checkIsFavourited(auth.id, place.id);
    }

    return c.json({
      places: placesWithDistance.map((p) => ({ ...p, isFavourited })),
      center: { lat, lng },
      radius,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch nearby places", {
      originalError: error,
    });
  }
});
