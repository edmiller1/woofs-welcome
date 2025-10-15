import { z } from "zod";

/**
 * Island Schemas
 */

// Get Island by Slug Schema
export const islandSlugParamSchema = z.object({
  slug: z.string().min(1, "Island slug is required"),
});

export type IslandSlugParam = z.infer<typeof islandSlugParamSchema>;
