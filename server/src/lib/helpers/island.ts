import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { db } from "../../db";
import { City, Place, PlaceImage, Region } from "../../db/schema";
import { IslandPlaceWithSingleImageSelect } from "../../db/schema";
import { getResponsiveImageUrls } from "../helpers";

export const getPlacesByPlaceSort = async (
  islandId: string,
  placeSort: "popular" | "new" | "verified" | "surprise"
) => {
  let filteredPlaces;

  switch (placeSort) {
    case "popular":
      filteredPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          cityName: City.name,
          citySlug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          imageUrl: PlaceImage.url,
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true))
        )
        .where(and(eq(Region.islandId, islandId), gte(Place.rating, "4.0")))
        .orderBy(desc(Place.rating))
        .limit(20);
      break;
    case "new":
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

      filteredPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          cityName: City.name,
          citySlug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          imageUrl: PlaceImage.url,
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true))
        )
        .where(
          and(
            eq(Region.islandId, islandId),
            or(
              gte(Place.createdAt, twoMonthsAgo),
              gte(Place.updatedAt, twoMonthsAgo)
            )
          )
        )
        .orderBy(
          desc(Place.createdAt), // Newly created first
          desc(Place.updatedAt) // Then by update time
        )
        .limit(20);
      break;
    case "verified":
      filteredPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          cityName: City.name,
          citySlug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          imageUrl: PlaceImage.url,
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true))
        )
        .where(and(eq(Place.isVerified, true), eq(Region.islandId, islandId)))
        .orderBy(desc(Place.updatedAt))
        .limit(20);
      break;
    case "surprise":
      filteredPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          cityName: City.name,
          citySlug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          imageUrl: PlaceImage.url,
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true))
        )
        .where(eq(Region.islandId, islandId))
        .orderBy(sql`RANDOM()`)
        .limit(20);
      break;
    default:
      //popular
      filteredPlaces = await db
        .select({
          id: Place.id,
          name: Place.name,
          slug: Place.slug,
          types: Place.types,
          description: Place.description,
          rating: Place.rating,
          reviewsCount: Place.reviewsCount,
          isVerified: Place.isVerified,
          cityName: City.name,
          citySlug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          imageUrl: PlaceImage.url,
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(
          PlaceImage,
          and(eq(PlaceImage.placeId, Place.id), eq(PlaceImage.isPrimary, true))
        )
        .where(and(eq(Region.islandId, islandId), gte(Place.rating, "4.0")))
        .orderBy(desc(Place.rating))
        .limit(20);
      break;
  }

  return filteredPlaces;
};

// Single image
export const optimizePlaceImage = async (
  places: IslandPlaceWithSingleImageSelect[]
) => {
  return places.map((place) => ({
    ...place,
    imageUrl: getResponsiveImageUrls(place.imageUrl!),
  }));
};
