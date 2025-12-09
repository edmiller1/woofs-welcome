import {
  and,
  arrayContains,
  desc,
  eq,
  gte,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../db";
import { City, Favourite, Place, PlaceImage, Region } from "../db/schema";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { count } from "drizzle-orm";
import { optimizePlaceImage } from "../lib/helpers/island";
import { sum } from "drizzle-orm";
import { getResponsiveImageUrls, validatePlaceFilter } from "../lib/helpers";
import { getPlacesByPlaceSort } from "../lib/helpers/city";

/**
 * City Service
 *
 * Handles all city-related business logic
 */

export class CityService {
  /**
   * Get a city
   */
  static async getCity(slug: string, userId?: string) {
    try {
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
        throw new NotFoundError("City");
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
        .where(and(eq(Place.cityId, city.id), gte(Place.rating, "4.0")))
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
        .where(eq(Place.cityId, city.id));

      const result = {
        ...city,
        ...(city.image && {
          optimizedImage: getResponsiveImageUrls(city.image),
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
        throw error;
      }
      throw new DatabaseError("Failed to fetch city", {
        originalError: error,
      });
    }
  }

  static async getCityPlacesAndEvents(
    slug: string,
    filters: {
      placeSort?: string;
      eventSort?: string;
    },
    userId?: string
  ) {
    try {
      const city = await db.query.City.findFirst({
        where: eq(City.slug, slug),
        with: {
          region: true,
        },
      });

      if (!city) {
        throw new NotFoundError("City");
      }

      const placeFilterType = validatePlaceFilter(filters.placeSort);

      const places = await getPlacesByPlaceSort(city.id, placeFilterType);

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
      console.error("Error fetching city places and events:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch city places and events", {
        originalError: error,
      });
    }
  }
}
