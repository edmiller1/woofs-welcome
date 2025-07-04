import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { place as Place, placeImages, user as User } from "../../db/schema";
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

    const place = await db.query.place.findFirst({
      where: eq(Place.slug, slug),
      with: {
        district: true,
        images: true,
      },
    });

    if (!place) {
      return c.json({ error: "Place not found" }, 404);
    }

    const placesData = await Google.searchPlaces(
      place.name,
      place.district?.name
    );

    const images = await Google.getPlacePhotos(
      placesData[0].place_id,
      process.env.GOOGLE_PLACES_API_KEY!
    );

    if (place.images.length === 0) {
      // Add google images to the place
      await db.insert(placeImages).values(
        images.map((image, index) => ({
          placeId: place.id,
          url: image,
          index,
          google: true,
        }))
      );
    }
    //console.log(images);

    return c.json(images);
  } catch (error) {
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});
