import { Hono } from "hono";
import { Resend } from "resend";
import { db } from "../../db";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { City, Place, PlaceImage, Region } from "../../db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export const regionRouter = new Hono();

regionRouter.get("/:slug", async (c) => {
  try {
    const { slug } = c.req.param();

    if (!slug) {
      return c.json({ error: "Slug is required" }, 400);
    }

    // 1. Get the region first
    const region = await db.query.Region.findFirst({
      where: eq(Region.slug, slug),
      with: {
        island: true,
      },
    });

    if (!region) {
      return c.json({ error: "Region not found" }, 404);
    }

    // 2. Get region statistics with proper casting
    const [regionStats] = await db
      .select({
        totalPlaces: count(),
        totalStores: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Store'] THEN 1 END`
        ),
        totalAdventures: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Walk', 'Hike', 'Park'] THEN 1 END`
        ),
        totalStays: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hotel', 'Motel', 'AirBnb'] THEN 1 END`
        ),
        totalEats: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Restaurant', 'Café'] THEN 1 END`
        ),
      })
      .from(Place)
      .innerJoin(City, eq(Place.cityId, City.id))
      .where(eq(City.regionId, region.id));

    // 3. Get top 6 cities by place count
    const topCities = await db
      .select({
        city: City,
        placeCount: count(Place.id),
      })
      .from(City)
      .leftJoin(Place, eq(Place.cityId, City.id))
      .where(eq(City.regionId, region.id))
      .groupBy(City.id)
      .orderBy(desc(count(Place.id)))
      .limit(6);

    // 4. Get places with all their images
    const cityIds = topCities.map((c) => c.city.id);

    const placesWithAllImages = await db.query.Place.findMany({
      where: inArray(Place.cityId, cityIds),
      with: {
        images: {
          orderBy: [desc(PlaceImage.isPrimary), asc(PlaceImage.displayOrder)],
        },
      },
      orderBy: [
        desc(Place.isVerified),
        desc(Place.isFeatured),
        desc(Place.rating),
        desc(Place.createdAt),
      ],
    });

    // 5. Group and limit places per city
    const citiesWithPlaces = topCities.map(({ city, placeCount }) => {
      const cityPlaces = placesWithAllImages
        .filter((p) => p.cityId === city.id)
        .slice(0, 9)
        .map((p) => ({
          ...p,
          primaryImage:
            p.images.find((img) => img.isPrimary) || p.images[0] || null,
        }));

      return {
        ...city,
        placeCount,
        places: cityPlaces,
      };
    });

    const result = {
      region,
      stats: regionStats,
      cities: citiesWithPlaces,
    };

    return c.json(result);
  } catch (error) {
    console.error("Error fetching region:", error);
    return c.json({ error: "Failed to fetch region" }, 500);
  }
});
