// src/lib/validation/notifications.ts
import { z } from "zod";

// Schema for user preferences (all fields required when present)
const userEmailPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnFavourites: z.boolean().optional(),
  reportStatus: z.boolean(),
  marketing: z.boolean(),
  newsletter: z.boolean(),
  nearbyPlaces: z.boolean(),
});

const userPushPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnFavourites: z.boolean().optional(),
  reportStatus: z.boolean(),
  nearbyPlaces: z.boolean(),
});

// Full notification preferences for user
export const userNotificationPreferencesSchema = z.object({
  email: userEmailPreferencesSchema,
  push: userPushPreferencesSchema,
});

// Partial schema for PATCH for user
export const userPartialNotificationPreferencesSchema = z
  .object({
    email: userEmailPreferencesSchema.partial().optional(),
    push: userPushPreferencesSchema.partial().optional(),
  })
  .refine((data) => data.email !== undefined || data.push !== undefined, {
    message: "At least one channel (email or push) must be provided",
  });

// Schema for business preferences (all fields required when present)
const businessEmailPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnPlaces: z.boolean(),
  placeUpdates: z.boolean(),
  claimStatus: z.boolean(),
  reportStatus: z.boolean(),
  marketing: z.boolean(),
  newsletter: z.boolean(),
});

const businessPushPreferencesSchema = z.object({
  reviewReplies: z.boolean(),
  reviewLikes: z.boolean(),
  newReviewsOnPlaces: z.boolean(),
  reportStatus: z.boolean(),
  nearbyPlaces: z.boolean(),
  claimStatus: z.boolean(),
});

// Full notification preferences for business
export const businessNotificationPreferencesSchema = z.object({
  email: businessEmailPreferencesSchema,
  push: businessPushPreferencesSchema,
});

// Partial schema for PATCH for business
export const businessPartialNotificationPreferencesSchema = z
  .object({
    email: businessEmailPreferencesSchema.partial().optional(),
    push: businessPushPreferencesSchema.partial().optional(),
  })
  .refine((data) => data.email !== undefined || data.push !== undefined, {
    message: "At least one channel (email or push) must be provided",
  });

// Create Notification Schema
export const createNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  context: z.enum(["personal", "business"]),
  businessId: z.string().optional(),
  type: z.enum([
    "claim_submitted",
    "claim_approved",
    "claim_rejected",
    "review_reply",
    "review_like",
    "new_review_on_favourite",
    "place_update",
  ]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  relatedClaimId: z.string().uuid("Invalid claim ID").optional(),
  relatedPlaceId: z.string().uuid("Invalid place ID").optional(),
  relatedReviewId: z.string().uuid("Invalid review ID").optional(),
  data: z.any().optional(),
});

export const notificationParamSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID"),
});

export type NotificationParamInput = z.infer<typeof notificationParamSchema>;

// Type exports for use in your code
export type UserNotificationPreferencesInput = z.infer<
  typeof userNotificationPreferencesSchema
>;
export type UserPartialNotificationPreferencesInput = z.infer<
  typeof userPartialNotificationPreferencesSchema
>;

export type BusinessNotificationPreferencesInput = z.infer<
  typeof businessNotificationPreferencesSchema
>;
export type BusinessPartialNotificationPreferencesInput = z.infer<
  typeof businessPartialNotificationPreferencesSchema
>;

export type CreateNotificationParams = z.infer<typeof createNotificationSchema>;

export type NotificationType =
  | "claim_submitted"
  | "claim_approved"
  | "claim_rejected"
  | "review_reply"
  | "review_like"
  | "new_review_on_favourite"
  | "place_update";

export type NotificationContext = "personal" | "business";
