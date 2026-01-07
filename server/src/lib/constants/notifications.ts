import {
  BusinessNotificationPreferences,
  UserNotificationPreferences,
} from "../../db/schema";

// These notification types bypass user preferences - always sent
export const REQUIRED_NOTIFICATIONS = [
  "security_alert",
  "account_deletion",
  "terms_update",
  "privacy_update",
] as const;

export const DEFAULT_USER_NOTIFICATION_PREFERENCES: UserNotificationPreferences =
  {
    email: {
      // Engagement
      reviewReplies: true,
      reviewLikes: true,
      newReviewsOnFavourites: true,
      reportStatus: true,

      // Marketing
      marketing: false,
      newsletter: false,

      // Discovery
      nearbyPlaces: false,
    },
    push: {
      // Engagement
      reviewReplies: true,
      reviewLikes: true,
      reportStatus: true,
      newReviewsOnFavourites: true,

      // Discovery
      nearbyPlaces: false,
    },
  };

export const DEFAULT_BUSINESS_NOTIFICATION_PREFERENCES: BusinessNotificationPreferences =
  {
    email: {
      // Engagement
      reviewReplies: true,
      reviewLikes: true,
      newReviewsOnPlaces: true,
      reportStatus: true,

      // Marketing
      marketing: false,
      newsletter: false,

      // Admin
      claimStatus: true,
      placeUpdates: true,
    },
    push: {
      // Engagement
      reviewReplies: true,
      reviewLikes: true,
      reportStatus: true,
      newReviewsOnPlaces: true,

      // Discovery
      nearbyPlaces: false,

      // Admin
      claimStatus: true,
    },
  };

// For better type safety and documentation
export const NOTIFICATION_TYPES = {
  EMAIL: {
    REVIEW_REPLIES: "reviewReplies",
    REVIEW_LIKES: "reviewLikes",
    NEW_REVIEWS_ON_FAVOURITES: "newReviewsOnFavourites",
    NEW_REVIEWS_ON_PLACES: "newReviewsOnPlaces",
    REPORT_STATUS: "reportStatus",
    PLACE_UPDATES: "placeUpdates",
    CLAIM_STATUS: "claimStatus",
    MARKETING: "marketing",
    NEWSLETTER: "newsletter",
    NEARBY_PLACES: "nearbyPlaces",
  },
  PUSH: {
    REVIEW_REPLIES: "reviewReplies",
    REVIEW_LIKES: "reviewLikes",
    NEW_REVIEWS_ON_FAVOURITES: "newReviewsOnFavourites",
    NEW_REVIEWS_ON_PLACES: "newReviewsOnPlaces",
    REPORT_STATUS: "reportStatus",
    NEARBY_PLACES: "nearbyPlaces",
    CLAIM_STATUS: "claimStatus",
  },
} as const;
