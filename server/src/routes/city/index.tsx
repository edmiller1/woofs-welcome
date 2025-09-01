import { Hono } from "hono";
import { db } from "../../db";
import { and, arrayContains, count, eq, inArray, or, sql } from "drizzle-orm";
import { City, Place, PlaceImage, Region } from "../../db/schema";

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
        region: {
          with: {
            island: true,
          },
        },
      },
    });

    if (!city) {
      return c.json({ error: "City not found" }, 404);
    }

    const [cityStats] = await db
      .select({
        totalPlaces: count(),
        totalStores: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Store'] THEN 1 END`
        ),
        totalAdventures: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Walk', 'Hike', 'Trail'] THEN 1 END`
        ),
        totalStays: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hotel', 'Motel', 'Airbnb'] THEN 1 END`
        ),
        totalEats: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Restaurant', 'Café'] THEN 1 END`
        ),
      })
      .from(Place)
      .where(eq(Place.cityId, city.id));

    const foodSpots = await db
      .select({
        id: Place.id,
        name: Place.name,
        slug: Place.slug,
        types: Place.types,
        description: Place.description,
        address: Place.address,
        latitude: Place.latitude,
        longitude: Place.longitude,
        phone: Place.phone,
        website: Place.website,
        hours: Place.hours,
        dogPolicy: Place.dogPolicy,
        indoorAllowed: Place.indoorAllowed,
        outdoorAllowed: Place.outdoorAllowed,
        rating: Place.rating,
        reviewsCount: Place.reviewsCount,
        isVerified: Place.isVerified,
        isFeatured: Place.isFeatured,
        cityName: City.name,
        citySlug: City.slug,
        regionName: Region.name,
        regionSlug: Region.slug,
      })
      .from(Place)
      .innerJoin(City, eq(Place.cityId, City.id))
      .innerJoin(Region, eq(City.regionId, Region.id))
      .where(
        and(
          eq(Place.cityId, city.id),
          or(
            arrayContains(Place.types, ["Bar"]),
            arrayContains(Place.types, ["Café"]),
            arrayContains(Place.types, ["Bar"])
          )
        )
      )
      .limit(12);

    const foodSpotPlaceIds = foodSpots.map((place) => place.id);

    const foodSpotplaceImages = await db.query.PlaceImage.findMany({
      where: inArray(PlaceImage.placeId, foodSpotPlaceIds),
      orderBy: [
        PlaceImage.placeId,
        PlaceImage.displayOrder,
        PlaceImage.isPrimary,
      ],
    });

    const imagesByFoodSpotPlaceId = foodSpotplaceImages.reduce(
      (acc, image) => {
        if (!acc[image.placeId]) {
          acc[image.placeId] = [];
        }
        acc[image.placeId].push({
          id: image.id,
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          isPrimary: image.isPrimary,
          source: image.source,
          isApproved: image.isApproved,
          displayOrder: image.displayOrder,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    const foodSpotsWithImages = foodSpots.map((spot) => ({
      ...spot,
      images: imagesByFoodSpotPlaceId[spot.id] || [],
    }));

    const stays = await db
      .select({
        id: Place.id,
        name: Place.name,
        slug: Place.slug,
        types: Place.types,
        description: Place.description,
        address: Place.address,
        latitude: Place.latitude,
        longitude: Place.longitude,
        phone: Place.phone,
        website: Place.website,
        hours: Place.hours,
        dogPolicy: Place.dogPolicy,
        indoorAllowed: Place.indoorAllowed,
        outdoorAllowed: Place.outdoorAllowed,
        rating: Place.rating,
        reviewsCount: Place.reviewsCount,
        isVerified: Place.isVerified,
        isFeatured: Place.isFeatured,
        cityName: City.name,
        citySlug: City.slug,
        regionName: Region.name,
        regionSlug: Region.slug,
      })
      .from(Place)
      .innerJoin(City, eq(Place.cityId, City.id))
      .innerJoin(Region, eq(City.regionId, Region.id))
      .where(
        and(
          eq(Place.cityId, city.id),
          or(
            arrayContains(Place.types, ["Hotel"]),
            arrayContains(Place.types, ["Motel"]),
            arrayContains(Place.types, ["AirBnb"])
          )
        )
      )
      .limit(12);

    const stayPlaceIds = stays.map((place) => place.id);

    const stayPlaceImages = await db.query.PlaceImage.findMany({
      where: inArray(PlaceImage.placeId, stayPlaceIds),
      orderBy: [
        PlaceImage.placeId,
        PlaceImage.displayOrder,
        PlaceImage.isPrimary,
      ],
    });

    const imagesByStayPlaceId = stayPlaceImages.reduce(
      (acc, image) => {
        if (!acc[image.placeId]) {
          acc[image.placeId] = [];
        }
        acc[image.placeId].push({
          id: image.id,
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          isPrimary: image.isPrimary,
          source: image.source,
          isApproved: image.isApproved,
          displayOrder: image.displayOrder,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    const staysWithImages = stays.map((spot) => ({
      ...spot,
      images: imagesByStayPlaceId[spot.id] || [],
    }));

    const adventures = await db
      .select({
        id: Place.id,
        name: Place.name,
        slug: Place.slug,
        types: Place.types,
        description: Place.description,
        address: Place.address,
        latitude: Place.latitude,
        longitude: Place.longitude,
        phone: Place.phone,
        website: Place.website,
        hours: Place.hours,
        dogPolicy: Place.dogPolicy,
        indoorAllowed: Place.indoorAllowed,
        outdoorAllowed: Place.outdoorAllowed,
        rating: Place.rating,
        reviewsCount: Place.reviewsCount,
        isVerified: Place.isVerified,
        isFeatured: Place.isFeatured,
        cityName: City.name,
        citySlug: City.slug,
        regionName: Region.name,
        regionSlug: Region.slug,
      })
      .from(Place)
      .innerJoin(City, eq(Place.cityId, City.id))
      .innerJoin(Region, eq(City.regionId, Region.id))
      .where(
        and(
          eq(Place.cityId, city.id),
          or(
            arrayContains(Place.types, ["Hike"]),
            arrayContains(Place.types, ["Trail"]),
            arrayContains(Place.types, ["Walk"])
          )
        )
      );

    const adventurePlaceIds = adventures.map((place) => place.id);

    const adventurePlaceImages = await db.query.PlaceImage.findMany({
      where: inArray(PlaceImage.placeId, adventurePlaceIds),
      orderBy: [
        PlaceImage.placeId,
        PlaceImage.displayOrder,
        PlaceImage.isPrimary,
      ],
    });

    const imagesByAdventurePlaceId = adventurePlaceImages.reduce(
      (acc, image) => {
        if (!acc[image.placeId]) {
          acc[image.placeId] = [];
        }
        acc[image.placeId].push({
          id: image.id,
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          isPrimary: image.isPrimary,
          source: image.source,
          isApproved: image.isApproved,
          displayOrder: image.displayOrder,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    const adventuresWithImages = adventures.map((spot) => ({
      ...spot,
      images: imagesByAdventurePlaceId[spot.id] || [],
    }));

    const retailSpots = await db
      .select({
        id: Place.id,
        name: Place.name,
        slug: Place.slug,
        types: Place.types,
        description: Place.description,
        address: Place.address,
        latitude: Place.latitude,
        longitude: Place.longitude,
        phone: Place.phone,
        website: Place.website,
        hours: Place.hours,
        dogPolicy: Place.dogPolicy,
        indoorAllowed: Place.indoorAllowed,
        outdoorAllowed: Place.outdoorAllowed,
        rating: Place.rating,
        reviewsCount: Place.reviewsCount,
        isVerified: Place.isVerified,
        isFeatured: Place.isFeatured,
        cityName: City.name,
        citySlug: City.slug,
        regionName: Region.name,
        regionSlug: Region.slug,
      })
      .from(Place)
      .innerJoin(City, eq(Place.cityId, City.id))
      .innerJoin(Region, eq(City.regionId, Region.id))
      .where(
        and(
          eq(Place.cityId, city.id),
          or(arrayContains(Place.types, ["Store"]))
        )
      );

    const retailPlaceIds = retailSpots.map((place) => place.id);

    const retailPlaceImages = await db.query.PlaceImage.findMany({
      where: inArray(PlaceImage.placeId, retailPlaceIds),
      orderBy: [
        PlaceImage.placeId,
        PlaceImage.displayOrder,
        PlaceImage.isPrimary,
      ],
    });

    const imagesByRetailPlaceId = retailPlaceImages.reduce(
      (acc, image) => {
        if (!acc[image.placeId]) {
          acc[image.placeId] = [];
        }
        acc[image.placeId].push({
          id: image.id,
          url: image.url,
          caption: image.caption,
          altText: image.altText,
          isPrimary: image.isPrimary,
          source: image.source,
          isApproved: image.isApproved,
          displayOrder: image.displayOrder,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    const retailSpotsWithImages = retailSpots.map((spot) => ({
      ...spot,
      images: imagesByRetailPlaceId[spot.id] || [],
    }));

    return c.json({
      city,
      stats: cityStats,
      foodSpots: foodSpotsWithImages,
      stays: staysWithImages,
      adventures: adventuresWithImages,
      retail: retailSpotsWithImages,
    });
  } catch (error) {
    console.error("Error fetching place:", error);
    return c.json({ error: "Failed to fetch place" }, 500);
  }
});
