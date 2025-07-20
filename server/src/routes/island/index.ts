import { Hono } from "hono";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { Island } from "../../db/schema";
import { optimizeImage } from "../../lib/helpers";

export const islandRouter = new Hono();

islandRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Slug is required" }, 400);
    }

    const island = await db.query.Island.findFirst({
      where: eq(Island.slug, slug),
      with: {
        regions: {
          with: {
            cities: {
              with: {
                places: {
                  with: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!island) {
      return c.json({ error: "Island not found" }, 404);
    }

    const optimizedIsland = {
      ...island,
      image: optimizeImage(island.image!), // Optimize island image
      regions: island.regions.map((region) => ({
        ...region,
        image: optimizeImage(region.image!, 320, 240), // Optimize region images
        cities: region.cities.map((city) => ({
          ...city,
          image: optimizeImage(city.image!, 280, 210), // Optimize city images
          places: city.places.map((place) => ({
            ...place,
            // Optimize place photos if they exist
            photos:
              place.images?.map((image) =>
                optimizeImage(image.url, 400, 300)
              ) || [],
          })),
        })),
      })),
    };

    return c.json(optimizedIsland);
  } catch (error) {
    console.error("Error fetching island:", error);
    return c.json({ error: "Failed to fetch island" }, 500);
  }
});
