import { z } from "zod";

/**
 * Island Schemas
 */

// Get Island by Slug Schema
export const islandSlugParamSchema = z.object({
  slug: z.string().min(1, "Island slug is required"),
});

// Get places by island slug and filters
export const islandPlacesAndEventsSchema = z.object({
  eventSort: z.enum(["new", "upcoming", "surprise"]).optional(),
  placeSort: z.enum(["popular", "new", "verified", "surprise"]).optional(),
});

export type IslandSlugParam = z.infer<typeof islandSlugParamSchema>;
export type IslandPlacesAndEventsQuery = z.infer<
  typeof islandPlacesAndEventsSchema
>;
