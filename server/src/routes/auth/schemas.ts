import { z } from "zod";

/**
 * Auth Schemas
 */

// Create Profile Schema
export const createProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  image: z.string().optional(),
  // Add other profile fields as needed
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

// Update Profile Schema (Welcome screen)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  image: z.string().optional(), // Base64 image
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Check Email Schema (path param)
export const emailParamSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type EmailParam = z.infer<typeof emailParamSchema>;

//Get profile favourites schema
export const getProfileFavouritesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

export type GetProfileFavouritesInput = z.infer<
  typeof getProfileFavouritesSchema
>;

export const getProfileReviewsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  offset: z.coerce.number().int().min(0).default(0),
});

export type GetProfileReviewsInput = z.infer<typeof getProfileReviewsSchema>;

export const deleteReviewSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  reviewId: z.string().uuid("Invalid review ID"),
});

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
