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
