import { z } from "zod";

/**
 * City Schemas
 */

// Get City by Slug Schema
export const citySlugParamSchema = z.object({
  slug: z.string().min(1, "City slug is required"),
});

export type CitySlugParam = z.infer<typeof citySlugParamSchema>;
