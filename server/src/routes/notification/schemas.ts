// src/lib/validation/notifications.ts
import { z } from "zod";

// Schema for individual channel preferences (all fields required when present)
const emailPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnFavourites: z.boolean(),
  placeUpdates: z.boolean(),
  claimStatus: z.boolean(),
  reportStatus: z.boolean(),
  weeklyDigest: z.boolean(),
  marketing: z.boolean(),
  newsletter: z.boolean(),
});

const pushPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnFavourites: z.boolean(),
  nearbyPlaces: z.boolean(),
  favourites: z.boolean(),
  claimStatus: z.boolean(),
});

// Full notification preferences (for PUT if you add it later)
export const notificationPreferencesSchema = z.object({
  email: emailPreferencesSchema,
  push: pushPreferencesSchema,
});

// Partial schema for PATCH (all fields optional)
export const partialNotificationPreferencesSchema = z
  .object({
    email: emailPreferencesSchema.partial().optional(),
    push: pushPreferencesSchema.partial().optional(),
  })
  .refine((data) => data.email !== undefined || data.push !== undefined, {
    message: "At least one channel (email or push) must be provided",
  });

// Type exports for use in your code
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
export type PartialNotificationPreferencesInput = z.infer<
  typeof partialNotificationPreferencesSchema
>;
