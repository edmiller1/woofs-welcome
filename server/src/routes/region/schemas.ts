import { z } from "zod";

/**
 * Region Schemas
 */

// Get Region by Slug Schema
export const regionSlugParamSchema = z.object({
  slug: z.string().min(1, "Region slug is required"),
});

export type RegionSlugParam = z.infer<typeof regionSlugParamSchema>;
