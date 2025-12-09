import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  City,
  Favourite,
  Island,
  Place,
  PlaceImage,
  Region,
} from "../db/schema";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { getResponsiveImageUrls, validatePlaceFilter } from "../lib/helpers";
import { count } from "drizzle-orm";
import { sum } from "drizzle-orm";
import {
  getPlacesByPlaceSort,
  optimizePlaceImage,
} from "../lib/helpers/island";

/**
 * Island Service
 *
 * Handles all island-related business logic
 */

export class IslandService {
  /**
   * Get an island
   */
  static async getIsland(slug: string, userId?: string) {
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

      const popularPlaces = await db
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
        .where(and(eq(Region.islandId, island.id), gte(Place.rating, "4.0")))
        .orderBy(desc(Place.rating))
        .limit(6);

      const optimizedPlaces = await optimizePlaceImage(popularPlaces);

      // Check favorites if user is logged in
      let placesWithFavourites = optimizedPlaces;

      if (userId) {
        const placeIds = optimizedPlaces.map((p) => p.id);
        const favourites = await db.query.Favourite.findMany({
          where: and(
            eq(Favourite.userId, userId),
            inArray(Favourite.placeId, placeIds)
          ),
        });
        const favouriteIds = new Set(favourites.map((f) => f.placeId));
        placesWithFavourites = optimizedPlaces.map((place) => ({
          ...place,
          hasFavourited: favouriteIds.has(place.id),
        }));
      }

      // Get stats - count places by type for this island
      const stats = await db
        .select({
          totalPlaces: count(),
          totalAdventures: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hike', 'Walk', 'Trail']::text[] THEN 1 ELSE 0 END`
          ).mapWith(Number),
          totalEats: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Restaurant', 'Bar', 'Café']::text[] THEN 1 ELSE 0 END`
          ).mapWith(Number),
          totalStays: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Hotel', 'Motel', 'AirBnb']::text[] THEN 1 ELSE 0 END`
          ).mapWith(Number),
          totalStores: sum(
            sql`CASE WHEN ${Place.types}::text[] && ARRAY['Retail']::text[] THEN 1 ELSE 0 END`
          ).mapWith(Number),
        })
        .from(Place)
        .innerJoin(City, eq(Place.cityId, City.id))
        .innerJoin(Region, eq(City.regionId, Region.id))
        .where(eq(Region.islandId, island.id));

      const result = {
        ...island,
        ...(island.image && {
          optimizedImage: getResponsiveImageUrls(island.image),
        }),
        popularPlaces: optimizedPlaces,
        stats: stats[0] || {
          totalPlaces: 0,
          totalAdventures: 0,
          totalEats: 0,
          totalStays: 0,
          totalStores: 0,
        },
      };

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Island service error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to fetch island", {
        originalError: error,
      });
    }
  }

  static async getIslandPlacesAndEvents(
    slug: string,
    filters: {
      eventSort?: string;
      placeSort?: string;
    },
    userId?: string
  ) {
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

      const placeFilterType = validatePlaceFilter(filters.placeSort);

      const places = await getPlacesByPlaceSort(island.id, placeFilterType);

      const optimizedPlaces = await optimizePlaceImage(places);

      let placesWithFavourites = optimizedPlaces;

      if (userId) {
        const placeIds = optimizedPlaces.map((p) => p.id);
        const favourites = await db.query.Favourite.findMany({
          where: and(
            eq(Favourite.userId, userId),
            inArray(Favourite.placeId, placeIds)
          ),
        });
        const favouriteIds = new Set(favourites.map((f) => f.placeId));
        placesWithFavourites = optimizedPlaces.map((place) => ({
          ...place,
          hasFavourited: favouriteIds.has(place.id),
        }));
      }

      //events can be added later

      return {
        places: placesWithFavourites,
        events: [],
      };
    } catch (error) {
      if (error instanceof AppError) {
        console.error("Island service error:", error);
        throw error;
      }
      throw new DatabaseError("Failed to fetch island places and events", {
        originalError: error,
      });
    }
  }
}
