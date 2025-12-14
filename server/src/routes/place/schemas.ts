import { z } from "zod";

/**
 * Place Schemas
 */

// Get Place by Slug Schema
export const placeSlugParamSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
});

export type PlaceSlugParam = z.infer<typeof placeSlugParamSchema>;

// Favorite Place Schema
export const placeIdParamSchema = z.object({
  placeId: z.string().uuid("Invalid place ID"),
});

export type PlaceIdParam = z.infer<typeof placeIdParamSchema>;

// Get Places Query Schema
export const getPlacesQuerySchema = z.object({
  city: z.string().optional(),
  type: z
    .enum([
      "Park",
      "Restaurant",
      "Hotel",
      "Motel",
      "AirBnb",
      "Store",
      "Café",
      "Bar",
      "Dog Park",
      "Beach",
      "Walk",
      "Hike",
      "Service",
      "Activity",
      "Lake",
      "River",
      "Trail",
    ])
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional()
    .default("0"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default("20"),
  rating: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(5))
    .optional(),
  sortBy: z.enum(["rating", "recent", "name"]).optional().default("rating"),
});

export type GetPlacesQuery = z.infer<typeof getPlacesQuerySchema>;

// Nearby Places Query Schema
export const nearbyPlacesQuerySchema = z.object({
  lat: z
    .string()
    .regex(/^-?\d+\.?\d*$/)
    .transform(Number)
    .pipe(z.number().min(-90).max(90, "Invalid latitude")),
  lng: z
    .string()
    .regex(/^-?\d+\.?\d*$/)
    .transform(Number)
    .pipe(z.number().min(-180).max(180, "Invalid longitude")),
  radius: z
    .string()
    .regex(/^\d+\.?\d*$/)
    .transform(Number)
    .pipe(z.number().min(1).max(50, "Radius must be between 1 and 50 km"))
    .optional()
    .default("5"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(20))
    .optional()
    .default("10"),
});

export type NearbyPlacesQuery = z.infer<typeof nearbyPlacesQuerySchema>;

// Search Places Query Schema
export const searchPlacesQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query too long"),
  city: z.string().optional(),
  type: z
    .enum([
      "Park",
      "Restaurant",
      "Hotel",
      "Motel",
      "AirBnb",
      "Store",
      "Café",
      "Bar",
      "Dog Park",
      "Beach",
      "Walk",
      "Hike",
      "Service",
      "Activity",
      "Lake",
      "River",
      "Trail",
    ])
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional()
    .default("0"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default("20"),
});

export type SearchPlacesQuery = z.infer<typeof searchPlacesQuerySchema>;

export const getExplorePlacesQuerySchema = z.object({
  location: z.string().optional(),
  types: z
    .enum([
      "Park",
      "Restaurant",
      "Hotel",
      "Motel",
      "AirBnb",
      "Store",
      "Café",
      "Bar",
      "Dog Park",
      "Beach",
      "Walk",
      "Hike",
      "Service",
      "Activity",
      "Lake",
      "River",
      "Trail",
    ])
    .optional(),
  dogAccess: z.enum(["indoor", "outdoor", "both"]).optional(),
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(0))
    .optional()
    .default("0"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default("20"),
  minRating: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(5))
    .optional(),
  sortBy: z.enum(["rating", "recent", "name"]).optional().default("rating"),
  isNew: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  isVerified: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
});

export type GetExplorePlacesQuery = z.infer<typeof getExplorePlacesQuerySchema>;

export const searchPlacesNavbarQuerySchema = z.object({
  q: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(100, "Search query too long"),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(10))
    .optional()
    .default("10"),
});

export type SearchPlacesNavbarQuery = z.infer<
  typeof searchPlacesNavbarQuerySchema
>;
