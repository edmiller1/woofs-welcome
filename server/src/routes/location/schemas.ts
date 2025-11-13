import { z } from "zod";

/**
 * Location Schemas
 */

// Search locations
export const searchLocationsSchema = z.object({
  query: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(100, "Search query too long"),
});

export type SearchLocationsQuery = z.infer<typeof searchLocationsSchema>;
