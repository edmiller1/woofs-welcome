import { and, arrayContains, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../db";
import { City, Island, Place, PlaceImage, Region } from "../db/schema";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { extractPublicId, getResponsiveImageUrls } from "../lib/helpers";

/**
 * Island Service
 *
 * Handles all island-related business logic
 */

export class IslandService {
  /**
   * Get an island
   */
  static async getIsland(slug: string) {
    try {
      const island = await db.query.Island.findFirst({
        where: eq(Island.slug, slug),
        with: {
          regions: true,
        },
      });

      if (!island) {
        throw new NotFoundError("Island");
      }

      const popularCities = await db
        .select({
          id: City.id,
          name: City.name,
          slug: City.slug,
          regionName: Region.name,
          regionSlug: Region.slug,
          image: City.image,
          placeCount: sql<number>`COUNT(${Place.id})`,
        })
        .from(City)
        .innerJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(Place, eq(Place.cityId, City.id))
        .where(eq(Region.islandId, island.id))
        .groupBy(
          City.id,
          City.name,
          City.slug,
          City.image,
          Region.name,
          Region.slug
        )
        .having(sql`COUNT(${Place.id}) > 0`)
        .orderBy(desc(sql`COUNT(${Place.id})`))
        .limit(8);

      const processedPopularCities = popularCities.map((city) => ({
        id: city.id,
        name: city.name,
        slug: city.slug,
        regionName: city.regionName,
        regionSlug: city.regionSlug,
        placeCount: Number(city.placeCount),
        optimizedImage: city.image
          ? getResponsiveImageUrls(extractPublicId(city.image))
          : null,
      }));

      const verifiedPlaces = await db
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
        .where(and(eq(Region.islandId, island.id), eq(Place.isVerified, true)))
        .limit(4);

      const verifiedPlaceIds = verifiedPlaces.map((place) => place.id);
      const verifiedPlaceImages = await db.query.PlaceImage.findMany({
        where: inArray(PlaceImage.placeId, verifiedPlaceIds),
        orderBy: [
          PlaceImage.placeId,
          PlaceImage.displayOrder,
          PlaceImage.isPrimary,
        ],
      });

      const imagesByVerifiedPlaceId = verifiedPlaceImages.reduce(
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

      const verifiedPlacesWithImages = verifiedPlaces.map((place) => ({
        ...place,
        // Convert numeric fields
        rating: place.rating ? Number(place.rating) : 0,
        latitude: place.latitude ? Number(place.latitude) : null,
        longitude: place.longitude ? Number(place.longitude) : null,
        // Add images
        images: imagesByVerifiedPlaceId[place.id] || [],
      }));

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
            eq(Region.islandId, island.id),
            or(
              arrayContains(Place.types, ["Café"]),
              arrayContains(Place.types, ["Restaurant"]),
              arrayContains(Place.types, ["Bar"])
            )
          )
        )
        .orderBy(Place.name)
        .limit(8);

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
            eq(Region.islandId, island.id),
            and(arrayContains(Place.types, ["Store"]))
          )
        )
        .orderBy(Place.name)
        .limit(8);

      const retailSpotPlaceIds = retailSpots.map((place) => place.id);
      const retailplaceImages = await db.query.PlaceImage.findMany({
        where: inArray(PlaceImage.placeId, retailSpotPlaceIds),
        orderBy: [
          PlaceImage.placeId,
          PlaceImage.displayOrder,
          PlaceImage.isPrimary,
        ],
      });

      const imagesByRetailSpotPlaceId = retailplaceImages.reduce(
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

      const retailSpotsWithImages = retailSpots.map((place) => ({
        ...place,
        // Convert numeric fields
        rating: place.rating ? Number(place.rating) : 0,
        latitude: place.latitude ? Number(place.latitude) : null,
        longitude: place.longitude ? Number(place.longitude) : null,
        // Add images
        images: imagesByRetailSpotPlaceId[place.id] || [],
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
            eq(Region.islandId, island.id),
            or(
              arrayContains(Place.types, ["Hike"]),
              arrayContains(Place.types, ["Walk"])
            )
          )
        )
        .orderBy(Place.name)
        .limit(8);

      const adventurePlaceIds = adventures.map((place) => place.id);

      const adventureplaceImages = await db.query.PlaceImage.findMany({
        where: inArray(PlaceImage.placeId, adventurePlaceIds),
        orderBy: [
          PlaceImage.placeId,
          PlaceImage.displayOrder,
          PlaceImage.isPrimary,
        ],
      });

      const imagesByAdventurePlaceId = adventureplaceImages.reduce(
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

      const result = {
        ...island,
        ...(island.image && {
          optimizedImage: getResponsiveImageUrls(island.image),
        }),
        regions: island.regions.map((region) => ({
          ...region,
          ...(region.image && {
            optimizedImage: getResponsiveImageUrls(region.image),
          }),
        })),
        popularCities: processedPopularCities,
        foodSpots: foodSpotsWithImages,
        retailSpots: retailSpotsWithImages,
        adventures: adventuresWithImages,
        verifiedPlaces: verifiedPlacesWithImages,
      };

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch place", {
        originalError: error,
      });
    }
  }
}
