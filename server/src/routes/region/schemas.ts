import { z } from "zod";

/**
 * Region Schemas
 */

// Get Region by Slug Schema
export const regionSlugParamSchema = z.object({
  slug: z.string().min(1, "Region slug is required"),
});

// Get region Places and Events Schema
export const regionPlacesAndEventsSchema = z.object({
  eventSort: z.enum(["new", "upcoming", "surprise"]).optional(),
  placeSort: z.enum(["popular", "new", "verified", "surprise"]).optional(),
});

export type RegionSlugParam = z.infer<typeof regionSlugParamSchema>;
export type RegionPlacesAndEventsQuery = z.infer<
  typeof regionPlacesAndEventsSchema
>;
