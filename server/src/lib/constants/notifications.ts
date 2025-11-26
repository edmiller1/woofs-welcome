import { NotificationPreferences } from "../../db/schema";

// These notification types bypass user preferences - always sent
export const REQUIRED_NOTIFICATIONS = [
  "security_alert",
  "account_deletion",
  "terms_update",
  "privacy_update",
  "password_reset",
] as const;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,

    // Business/Admin
    placeUpdates: true,
    claimStatus: true,
    reportStatus: true,

    // Digest
    weeklyDigest: true,

    // Marketing
    marketing: false,
    newsletter: false,
  },
  push: {
    // Engagement
    reviewReplies: true,
    reviewLikes: true,
    newReviewsOnFavourites: true,

    // Discovery
    nearbyPlaces: false,
    favourites: true,

    // Business/Admin
    claimStatus: true,
  },
};

// For better type safety and documentation
export const NOTIFICATION_TYPES = {
  EMAIL: {
    REVIEW_REPLIES: "reviewReplies",
    REVIEW_LIKES: "reviewLikes",
    NEW_REVIEWS_ON_FAVOURITES: "newReviewsOnFavourites",
    PLACE_UPDATES: "placeUpdates",
    CLAIM_STATUS: "claimStatus",
    REPORT_STATUS: "reportStatus",
    WEEKLY_DIGEST: "weeklyDigest",
    MARKETING: "marketing",
    NEWSLETTER: "newsletter",
  },
  PUSH: {
    REVIEW_REPLIES: "reviewReplies",
    REVIEW_LIKES: "reviewLikes",
    NEW_REVIEWS_ON_FAVOURITES: "newReviewsOnFavourites",
    NEARBY_PLACES: "nearbyPlaces",
    FAVOURITES: "favourites",
    CLAIM_STATUS: "claimStatus",
  },
} as const;
