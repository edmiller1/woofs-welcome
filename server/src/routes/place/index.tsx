import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Place, PlaceImage } from "../../db/schema";
import { Resend } from "resend";
import { Google } from "../../lib/google";

const resend = new Resend(process.env.RESEND_API_KEY);

export const placeRouter = new Hono();

// Get a place by Slug
placeRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();
    if (!slug) {
      return c.json({ error: "Slug is required" }, 400);
    }

    const place = await db.query.Place.findFirst({
      where: eq(Place.slug, slug),
      with: {
        city: true,
        images: true,
      },
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    if (place.images.length === 0) {
      const placesData = await Google.searchPlaces(
        place.name,
        place.city?.name
      );

      const images = await Google.getPlacePhotos(
        placesData[0].place_id,
        process.env.GOOGLE_PLACES_API_KEY!
      );
      // Add google images to the place
      await db.insert(PlaceImage).values(
        images.map((image, index) => ({
          placeId: place.id,
          url: image,
          source: "Google",
        }))
      );
      //console.log(images);
    }

    return c.json(place);
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
