import { Hono } from "hono";
import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { Favourite, Place, PlaceImage } from "../../db/schema";
import { Resend } from "resend";
import { Google } from "../../lib/google";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { checkIsFavourited } from "../../lib/helpers";
import { Cloudinary } from "../../lib/cloudinary";

const resend = new Resend(process.env.RESEND_API_KEY);

export const placeRouter = new Hono();

// Get a place by Slug
placeRouter.get("/:slug", optionalAuthMiddleware, async (c) => {
  try {
    const { slug } = c.req.param();
    if (!slug) {
      return c.json({ error: "Slug is required" }, 400);
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
      return c.json({ error: "Place not found" }, 404);
    }

    if (place.images.length === 0) {
      try {
        const placesData = await Google.searchPlaces(
          place.name,
          place.city?.name
        );

        const images = await Google.getPlacePhotos(
          placesData[0].place_id,
          process.env.GOOGLE_PLACES_API_KEY!
        );

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
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});

placeRouter.get("/", async (c) => {
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

  return c.json(places);
});

// Favorite a place
placeRouter.post("/:placeId/favourite", authMiddleware, async (c) => {
  try {
    const auth = c.get("user");
    console.log("Auth: ", auth);

    if (!auth) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const placeId = c.req.param("placeId");

    if (!placeId) {
      return c.json({ error: "Place ID is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.id, placeId),
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    const existingFavourite = await db.query.Favourite.findFirst({
      where: and(eq(Favourite.userId, auth.id), eq(Favourite.placeId, placeId)),
    });

    if (existingFavourite) {
      await db.delete(Favourite).where(eq(Favourite.id, existingFavourite.id));
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
    console.error("Error adding or removing place to/from favourites:", error);
    return c.json(
      { error: "Failed adding or removing place to/from favourites" },
      500
    );
  }
});
