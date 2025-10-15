import { Hono } from "hono";
import { Resend } from "resend";
import { db } from "../../db";
import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { City, Place, PlaceImage, Region } from "../../db/schema";
import { getResponsiveImageUrls } from "../../lib/helpers";
import {
  AppError,
  BadRequestError,
  DatabaseError,
  NotFoundError,
} from "../../lib/errors";
import { validateParams } from "../../middleware/validate";
import { RegionSlugParam, regionSlugParamSchema } from "./schemas";

export const regionRouter = new Hono();

regionRouter.get("/:slug", validateParams(regionSlugParamSchema), async (c) => {
  try {
    const { slug } = c.get("validatedParams") as RegionSlugParam;

    if (!slug) {
      throw new BadRequestError("Slug is required");
    }

    const region = await db.query.Region.findFirst({
      where: eq(Region.slug, slug),
      with: {
        island: true,
      },
    });

    if (!region) {
      throw new NotFoundError("Region");
    }

    const [regionStats] = await db
      .select({
        totalPlaces: count(),
        totalStores: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Store'] THEN 1 END`
        ),
        totalAdventures: count(
          sql`CASE WHEN ${Place.types}::text[] && ARRAY['Walk', 'Hike', 'Trail'] THEN 1 END`
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

    const cities = await db
      .select({
        city: City,
        placeCount: count(Place.id),
      })
      .from(City)
      .leftJoin(Place, eq(Place.cityId, City.id))
      .where(eq(City.regionId, region.id))
      .groupBy(City.id)
      .orderBy(desc(count(Place.id)))
      .limit(8);

    // Fetch food spots (Bars, Restaurants, Cafés)
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
          eq(City.regionId, region.id),
          or(
            arrayContains(Place.types, ["Café"]),
            arrayContains(Place.types, ["Restaurant"]),
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

    const foodSpotsWithImages = foodSpots.map((place) => ({
      ...place,
      // Convert numeric fields
      rating: place.rating ? Number(place.rating) : 0,
      latitude: place.latitude ? Number(place.latitude) : null,
      longitude: place.longitude ? Number(place.longitude) : null,
      // Add images
      images: imagesByFoodSpotPlaceId[place.id] || [],
    }));

    // Hotels, Motels, Airbnbs
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
          eq(City.regionId, region.id),
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

    const staysWithImages = stays.map((place) => ({
      ...place,
      // Convert numeric fields
      rating: place.rating ? Number(place.rating) : 0,
      latitude: place.latitude ? Number(place.latitude) : null,
      longitude: place.longitude ? Number(place.longitude) : null,
      // Add images
      images: imagesByStayPlaceId[place.id] || [],
    }));

    // Adventures
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
          eq(City.regionId, region.id),
          or(
            arrayContains(Place.types, ["Hike"]),
            arrayContains(Place.types, ["Walk"]),
            arrayContains(Place.types, ["Lake"]),
            arrayContains(Place.types, ["Trail"]),
            arrayContains(Place.types, ["River"])
          )
        )
      )
      .limit(12);

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

    const adventuresWithImages = adventures.map((place) => ({
      ...place,
      // Convert numeric fields
      rating: place.rating ? Number(place.rating) : 0,
      latitude: place.latitude ? Number(place.latitude) : null,
      longitude: place.longitude ? Number(place.longitude) : null,
      // Add images
      images: imagesByAdventurePlaceId[place.id] || [],
    }));

    const retailPlaces = await db
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
        and(eq(City.regionId, region.id), arrayContains(Place.types, ["Store"]))
      )
      .limit(12);

    const retailPlaceIds = retailPlaces.map((place) => place.id);

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

    const retailPlacesWithImages = retailPlaces.map((place) => ({
      ...place,
      // Convert numeric fields
      rating: place.rating ? Number(place.rating) : 0,
      latitude: place.latitude ? Number(place.latitude) : null,
      longitude: place.longitude ? Number(place.longitude) : null,
      // Add images
      images: imagesByRetailPlaceId[place.id] || [],
    }));

    const result = {
      region,
      stats: regionStats,
      cities: cities.map((c) => ({
        ...c.city,
        optimizedImage: getResponsiveImageUrls(c.city.image!),
      })),
      foodSpots: foodSpotsWithImages,
      stays: staysWithImages,
      adventures: adventuresWithImages,
      retailPlaces: retailPlacesWithImages,
    };

    return c.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new DatabaseError("Failed to fetch region", {
      originalError: error,
    });
  }
});
