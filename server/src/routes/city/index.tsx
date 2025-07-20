import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Google } from "../../lib/google";
import { City } from "../../db/schema";

export const cityRouter = new Hono();

cityRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "No slug provided" }, 400);
    }

    const city = await db.query.City.findFirst({
      where: eq(City.slug, slug),
      with: {
        places: true,
      },
    });

    if (!city) {
      return c.json({ error: "City not found" }, 404);
    }

    if (!city.image) {
      const placesData = await Google.searchRegionOrCity(city.name);

      const image = await Google.getRegionOrCityPhoto(
        placesData[0].place_id,
        process.env.GOOGLE_PLACES_API_KEY!
      );

      console.log(image);

      if (image) {
        await db
          .update(City)
          .set({
            image: image as string,
          })
          .where(eq(City.slug, slug));
      }
    }
    return c.json(city);
  } catch (error) {
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});
