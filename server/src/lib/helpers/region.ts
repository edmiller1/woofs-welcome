import { and, desc, eq, gte, or, sql } from "drizzle-orm";
import { db } from "../../db";
import {
  City,
  FavouriteWithPlaceSelect,
  Island,
  Place,
  PlaceImage,
  PlaceWithCityAndRegionSelect,
  Region,
  RegionPlaceWithSingleImageSelect,
} from "../../db/schema";
import { getResponsiveImageUrls } from "../helpers";

export const getPlacesByPlaceSort = async (
  regionId: string,
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
        .where(and(eq(Region.id, regionId), gte(Place.rating, "4.0")))
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
            eq(Region.id, regionId),
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
        .where(and(eq(Place.isVerified, true), eq(Region.id, regionId)))
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
        .where(eq(Region.id, regionId))
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
        .where(and(eq(Region.id, regionId), gte(Place.rating, "4.0")))
        .orderBy(desc(Place.rating))
        .limit(20);
      break;
  }

  return filteredPlaces;
};

// Single image
export const optimizePlaceImage = async (
  places: RegionPlaceWithSingleImageSelect[]
) => {
  return places.map((place) => ({
    ...place,
    imageUrl: getResponsiveImageUrls(place.imageUrl!),
  }));
};

export const optimizeImageForPlace = async (
  places: FavouriteWithPlaceSelect[]
) => {
  return places.map((place) => ({
    ...place,
    images: getResponsiveImageUrls(place.place?.images[0].publicId!),
  }));
};
