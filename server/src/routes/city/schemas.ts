import { z } from "zod";

/**
 * City Schemas
 */

// Get City by Slug Schema
export const citySlugParamSchema = z.object({
  slug: z.string().min(1, "City slug is required"),
});

// Get city Places and Events Schema
export const cityPlacesAndEventsSchema = z.object({
  eventSort: z.enum(["new", "upcoming", "surprise"]).optional(),
  placeSort: z.enum(["popular", "new", "verified", "surprise"]).optional(),
});

export type CitySlugParam = z.infer<typeof citySlugParamSchema>;
export type CityPlacesAndEventsQuery = z.infer<
  typeof cityPlacesAndEventsSchema
>;
