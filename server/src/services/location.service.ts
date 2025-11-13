import { eq, ilike, or, sql } from "drizzle-orm";
import { db } from "../db";
import { City, Place, Region } from "../db/schema";
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
      const cities = await db
        .select({
          id: City.id,
          name: City.name,
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

      const regions = await db
        .select({
          id: Region.id,
          name: Region.name,
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

      return [
        ...cities.map((city) => ({
          type: "city" as const,
          id: city.id,
          name: city.name,
          region: city.region,
          placeCount: city.placeCount,
          displayName: city.region ? `${city.name}, ${city.region}` : city.name,
        })),
        ...regions.map((region) => ({
          type: "region" as const,
          id: region.id,
          name: region.name,
          region: null,
          placeCount: region.placeCount,
          displayName: region.name,
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
