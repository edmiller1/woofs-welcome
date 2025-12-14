import { eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import { City, Island, Place, Region } from "../db/schema";
import { AppError, DatabaseError, NotFoundError } from "../lib/errors";
import { extractPublicId, getResponsiveImageUrls } from "../lib/helpers";

/**
 * Location service
 * Handles all location-related logic
 */

export class LocationService {
  /**
   * Get all locations via search
   */
  static async searchLocations(query: string) {
    try {
      //Search cities
      const cities = await db
        .select({
          id: City.id,
          name: City.name,
          slug: City.slug,
          region: Region.name,
          placeCount: sql<number>`COUNT(DISTINCT ${Place.id})::int`,
        })
        .from(City)
        .leftJoin(Region, eq(City.regionId, Region.id))
        .leftJoin(Place, eq(Place.cityId, City.id))
        .where(ilike(City.name, `%${query}%`))
        .groupBy(City.id, City.name, Region.name)
        .having(sql`COUNT(DISTINCT ${Place.id}) > 0`)
        .orderBy(sql`COUNT(DISTINCT ${Place.id}) DESC`);

      //Search regions
      const regions = await db
        .select({
          id: Region.id,
          name: Region.name,
          slug: Region.slug,
          region: sql<string>`NULL`,
          placeCount: sql<number>`COUNT(DISTINCT ${Place.id})::int`,
        })
        .from(Region)
        .leftJoin(City, eq(City.regionId, Region.id))
        .leftJoin(Place, eq(Place.cityId, City.id))
        .where(ilike(Region.name, `%${query}%`))
        .groupBy(Region.id, Region.name)
        .having(sql`COUNT(DISTINCT ${Place.id}) > 0`)
        .orderBy(sql`COUNT(DISTINCT ${Place.id}) DESC`);

      //Search islands
      // Search islands
      const islands = await db
        .select({
          slug: Island.slug,
          name: Island.name,
          placeCount: sql<number>`COUNT(DISTINCT ${Place.id})::int`,
        })
        .from(Island)
        .leftJoin(Region, eq(Region.islandId, Island.id))
        .leftJoin(City, eq(City.regionId, Region.id))
        .leftJoin(Place, eq(Place.cityId, City.id))
        .where(ilike(Island.name, `%${query}%`))
        .groupBy(Island.slug, Island.name)
        .having(sql`COUNT(DISTINCT ${Place.id}) > 0`)
        .orderBy(sql`COUNT(DISTINCT ${Place.id}) DESC`);

      return [
        ...cities.map((city) => ({
          type: "city" as const,
          id: city.id,
          name: city.name,
          slug: city.slug,
          region: city.region,
          placeCount: city.placeCount,
          displayName: city.region ? `${city.name}, ${city.region}` : city.name,
        })),
        ...regions.map((region) => ({
          type: "region" as const,
          id: region.id,
          name: region.name,
          slug: region.slug,
          region: null,
          placeCount: region.placeCount,
          displayName: region.name,
        })),
        ...islands.map((island) => ({
          type: "island" as const,
          slug: island.slug,
          name: island.name,
          placeCount: island.placeCount,
          displayName: `${island.name} (Island)`,
        })),
      ];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new DatabaseError("Failed to fetch locations", {
        originalError: error,
      });
    }
  }
}
