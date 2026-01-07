import {
  pgTable,
  text,
  uuid,
  varchar,
  boolean,
  numeric,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { InferSelectModel, relations, sql } from "drizzle-orm";
import { index } from "drizzle-orm/pg-core";

export const placeTypeEnum = pgEnum("place_type", [
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
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "in_review",
  "resolved",
  "dismissed",
  "closed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "claim_submitted",
  "claim_approved",
  "claim_rejected",
  "review_reply",
  "review_like",
  "new_review_on_favourite",
  "place_update",
]);

export const notificationContextEnum = pgEnum("notification_context", [
  "personal",
  "business",
]);

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
    imagePublicId: text("image_public_id"),
    provider: varchar("provider", { length: 255 }),
    isAdmin: boolean("is_admin").default(false),
    isProfilePublic: boolean("is_profile_public").default(true),
    activeContext: text("active_context").default("personal"), // 'personal' | 'business'
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    notificationPreferences: jsonb("notification_preferences")
      .default({
        email: {
          reviewReplies: true,
          reviewLikes: true,
          newReviewsOnFavourites: true,
          marketing: false,
          newsletter: false,
          nearbyPlaces: false,
          reportStatus: true,
        },
        push: {
          reviewReplies: true,
          reviewLikes: true,
          newReviewsOnFavourites: true,
          nearbyPlaces: false,
        },
      })
      .$type<UserNotificationPreferences>(),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const Business = pgTable(
  "business",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Business identity
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    website: text("website"),
    description: text("description"),

    // Branding
    logoUrl: text("logo_url"),
    logoPublicId: text("logo_public_id"),

    // Verification & subscription
    verified: boolean("verified").default(false).notNull(),
    verifiedAt: timestamp("verified_at"),
    subscriptionTier: text("subscription_tier").default("free"), // 'free', 'basic', 'premium'
    subscriptionExpiresAt: timestamp("subscription_expires_at"),

    notificationPreferences: jsonb("notification_preferences")
      .default({
        email: {
          reviewReplies: true,
          reviewLikes: true,
          newReviewsOnFavourites: true,
          placeUpdates: true,
          claimStatus: true,
          reportStatus: true,
          marketing: false,
          newsletter: false,
        },
        push: {
          reviewReplies: true,
          reviewLikes: true,
          newReviewsOnPlaces: true,
          nearbyPlaces: false,
          claimStatus: true,
        },
      })
      .$type<BusinessNotificationPreferences>(),

    // Timestamps
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    ownerIdx: index("business_owner_idx").on(table.ownerId),
    emailIdx: index("business_email_idx").on(table.email),
  })
);

export const Island = pgTable(
  "island",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("island_slug_idx").on(table.slug),
    nameIdx: index("island_name_lower_idx").on(sql`lower(${table.name})`),
  })
);

export const Region = pgTable(
  "region",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    image: text("image"),
    islandId: uuid("island_id")
      .notNull()
      .references(() => Island.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("region_slug_idx").on(table.slug),
    islandIdx: index("region_island_idx").on(table.islandId),
    nameIdx: index("region_name_lower_idx").on(sql`lower(${table.name})`),
  })
);

export const City = pgTable(
  "city",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    regionId: uuid("region_id")
      .notNull()
      .references(() => Region.id),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    isPopular: boolean("is_popular").default(false),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("city_slug_idx").on(table.slug),
    regionIdIdx: index("city_region_idx").on(table.regionId),
    nameIdx: index("city_name_lower_idx").on(sql`lower(${table.name})`),
  })
);

export const Place = pgTable(
  "place",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    types: placeTypeEnum("types").array().notNull(),
    description: text("description"),
    // Location references
    cityId: uuid("city_id").references(() => City.id),
    address: text("address"),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    // Contact info
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    hours: jsonb("hours"), // Store opening hours as JSON
    // Dog-specific info
    dogPolicy: text("dog_policy"),
    indoorAllowed: boolean("indoor_allowed").default(false),
    outdoorAllowed: boolean("outdoor_allowed").default(false),
    hasDogMenu: boolean("has_dog_menu").default(false), // for restaurants

    // Metrics and flags
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
    reviewsCount: integer("reviews_count").default(0),
    isVerified: boolean("is_verified").default(false),
    isFeatured: boolean("is_featured").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    claimedBy: text("claimed_by").references(() => Business.id),
    claimedAt: timestamp("claimed_at"),

    // Analytics (denormalized for quick access)
    totalViews: integer("total_views").default(0).notNull(),
    viewsThisMonth: integer("views_this_month").default(0).notNull(),
    analyticsLastUpdated: timestamp("analytics_last_updated"),
  },
  (table) => ({
    slugIdx: index("place_slug_idx").on(table.slug),
    cityIdx: index("place_city_idx").on(table.cityId),
    cityRatingIdx: index("place_city_rating_idx").on(
      table.cityId,
      table.rating.desc()
    ),
    featuredIdx: index("place_featured_idx")
      .on(table.isFeatured)
      .where(sql`${table.isFeatured} = true`),
    claimedByIdx: index("place_claimed_by_idx").on(table.claimedBy),
  })
);

export const PlaceImage = pgTable(
  "place_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    url: text("url").notNull(),
    caption: text("caption"),
    altText: text("alt_text"),
    isPrimary: boolean("is_primary").default(false),
    source: text("source").notNull(), // 'google', 'user_upload', 'admin', 'scraper', etc.
    uploadedBy: text("uploaded_by").references(() => user.id), // null for google/scraped images
    isApproved: boolean("is_approved").default(true), // for moderation
    displayOrder: integer("display_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    displayOrderIdx: index("place_image_display_order_idx").on(
      table.placeId,
      table.displayOrder
    ),
    isPrimaryIdx: index("place_image_is_primary_idx").on(
      table.placeId,
      table.isPrimary
    ),
  })
);

export const PlaceView = pgTable(
  "place_view",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    sessionId: text("session_id").notNull(),

    // Metadata
    source: text("source"), // 'search', 'map', 'direct', 'business_profile'
    referrer: text("referrer"),
    city: text("city"),
    region: text("region"),
    country: text("country").default("NZ"),
    deviceType: text("device_type"), // 'mobile', 'desktop', 'tablet'

    // Timing
    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
    timeOnPage: integer("time_on_page"), // seconds (added when view ends)
  },
  (table) => ({
    placeIdIdx: index("place_view_place_id_idx").on(table.placeId),
    viewedAtIdx: index("place_view_viewed_at_idx").on(table.viewedAt),
    placeViewedIdx: index("place_view_place_viewed_idx").on(
      table.placeId,
      table.viewedAt
    ),
    sessionIdx: index("place_view_session_idx").on(table.sessionId),
  })
);

// Daily aggregated analytics (permanent)
export const PlaceDailyAnalytics = pgTable(
  "place_daily_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),

    date: timestamp("date").notNull(), // Midnight of the day

    // View metrics
    totalViews: integer("total_views").default(0).notNull(),
    uniqueViews: integer("unique_views").default(0).notNull(), // Unique sessions

    // Source breakdown
    viewsBySource: jsonb("views_by_source")
      .$type<Record<string, number>>()
      .default({}),

    // Geographic breakdown
    viewsByCity: jsonb("views_by_city")
      .$type<Array<{ city: string; views: number }>>()
      .default([]),
    viewsByRegion: jsonb("views_by_region")
      .$type<Record<string, number>>()
      .default({}),

    // Engagement
    avgTimeOnPage: integer("avg_time_on_page"), // seconds

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    placeDateIdx: index("place_daily_analytics_place_date_idx").on(
      table.placeId,
      table.date
    ),
    dateIdx: index("place_daily_analytics_date_idx").on(table.date),
  })
);

export const Review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id").references(() => Business.id),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    visitDate: timestamp("visit_date"),

    // Experience details
    numDogs: integer("num_dogs"), // Number of dogs with the reviewer
    dogBreeds: text("dog_breeds").array(), // Array of dog breed
    timeOfVisit: text("time_of_visit"), // "morning", "afternoon", "evening"

    isFirstVisit: boolean("is_first_visit").default(true),
    likesCount: integer("likes_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // A user can only review a place once
    userPlaceUnique: unique().on(table.userId, table.placeId),
    placeIdx: index("review_place_idx").on(table.placeId),
    userIdx: index("review_user_idx").on(table.userId),
    placeCreatedAtIdx: index("review_created_at_idx").on(
      table.placeId,
      table.createdAt.desc()
    ),
    helpfulReviewsIdx: index("review_helpful_idx").on(
      table.placeId,
      table.likesCount.desc()
    ),
  })
);

export const ReviewImage = pgTable(
  "review_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    url: text("url").notNull(),
    altText: text("alt_text"), // 'google', 'user_upload', 'admin', 'scraper', etc.
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewIdIdx: index("review_image_place_idx").on(table.reviewId),
  })
);

export const ReviewLike = pgTable(
  "review_like",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reviewId: uuid("review_id")
      .notNull()
      .references(() => Review.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id").references(() => Business.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // A user can only like a review once
    userReviewUnique: unique().on(table.userId, table.reviewId),
    reviewIdx: index("review_like_review_idx").on(table.reviewId),
  })
);

export const ReviewReport = pgTable("review_report", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => Review.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(), // e.g., "spam", "inappropriate", "fake", "offensive"
  details: text("details"), // Optional explanation from user
  status: reportStatusEnum("status").notNull().default("pending"), // pending, reviewed, dismissed, action_taken
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by").references(() => user.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Favourite = pgTable(
  "favourite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // A user can only favourite a place once
    userPlaceUnique: unique().on(table.userId, table.placeId),
    userIdx: index("favourite_user_idx").on(table.userId),
  })
);

export const Claim = pgTable(
  "claim",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessId: text("business_id")
      .notNull()
      .references(() => Business.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),

    // Contact verification
    businessEmail: varchar("business_email", { length: 255 }).notNull(),
    businessPhone: varchar("business_phone", { length: 50 }).notNull(),

    // Role/authorization
    role: varchar("role", { length: 100 }).notNull(),

    // Document uploads
    verificationDocuments: jsonb("verification_documents").$type<string[]>(),

    // Admin review
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),

    // Metadata
    claimedAt: timestamp("claimed_at").notNull().defaultNow(),
    approvedAt: timestamp("approved_at"),
    additionalNotes: text("additional_notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    businessPlaceUnique: unique().on(table.businessId, table.placeId),
    statusIdx: index("claim_status_idx").on(table.status),
    businessIdx: index("claim_business_idx").on(table.businessId),
    placeIdx: index("claim_place_idx").on(table.placeId),
  })
);

// Track which places a business account manages
export const BusinessPlace = pgTable(
  "business_place",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: text("business_id")
      .notNull()
      .references(() => Business.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    claimId: uuid("claim_id")
      .notNull()
      .references(() => Claim.id),

    // Permissions (future: allow different access levels)
    canEdit: boolean("can_edit").notNull().default(true),
    canRespond: boolean("can_respond").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    // One business account can only claim a place once
    uniqueBusinessPlace: unique().on(table.businessId, table.placeId),
    businessIdx: index("business_places_business_idx").on(table.businessId),
    placeIdx: index("business_places_place_idx").on(table.placeId),
    claimIdx: index("business_places_claim_idx").on(table.claimId),
  })
);

export const Notification = pgTable(
  "notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    //Context determines which notification settings to check
    context: notificationContextEnum("context").notNull().default("personal"),

    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),

    relatedClaimId: uuid("related_claim_id").references(() => Claim.id, {
      onDelete: "cascade",
    }),
    relatedPlaceId: uuid("related_place_id").references(() => Place.id, {
      onDelete: "cascade",
    }),
    relatedReviewId: uuid("related_review_id").references(() => Review.id, {
      onDelete: "cascade",
    }),

    // Metadata
    data: jsonb("data").$type<Record<string, any>>(), // Extra data like place name, image URL, etc.

    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notification_user_id_idx").on(table.userId),
    userContextIdx: index("notification_user_context_idx").on(
      table.userId,
      table.context
    ),
    userUnreadIdx: index("notification_user_unread_idx").on(
      table.userId,
      table.isRead,
      table.context
    ),
    createdAtIdx: index("notification_created_at_idx").on(
      table.createdAt.desc()
    ),
  })
);

export const Tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  category: text("category"), // e.g., amenity, feature, service
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const PlaceTag = pgTable(
  "place_tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => Tag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // A place can only have a specific tag once
    placeTagUnique: unique().on(table.placeId, table.tagId),
    placeIdIdx: index("place_tag_place_idx").on(table.placeId),
    tagIdIdx: index("place_tag_tag_idx").on(table.tagId),
  })
);

export const DogBreed = pgTable("dog_breed", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(user, ({ many, one }) => ({
  reviews: many(Review),
  favorites: many(Favourite),
  session: many(session),
  business: one(Business),
  notifications: many(Notification),
}));

export const businessRelations = relations(Business, ({ many }) => ({
  places: many(BusinessPlace),
  favourites: many(Favourite),
  reviews: many(Review),
  placeClaims: many(Claim),
}));

export const businessPlaceRelations = relations(BusinessPlace, ({ one }) => ({
  business: one(Business, {
    fields: [BusinessPlace.businessId],
    references: [Business.id],
  }),
  place: one(Place, {
    fields: [BusinessPlace.placeId],
    references: [Place.id],
  }),
  claim: one(Claim, {
    fields: [BusinessPlace.claimId],
    references: [Claim.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const islandRelations = relations(Island, ({ many }) => ({
  regions: many(Region),
}));

export const regionRelations = relations(Region, ({ many, one }) => ({
  cities: many(City),
  island: one(Island, {
    fields: [Region.islandId],
    references: [Island.id],
  }),
}));

export const cityRelations = relations(City, ({ one, many }) => ({
  region: one(Region, {
    fields: [City.regionId],
    references: [Region.id],
  }),
  places: many(Place),
}));

export const placeRelations = relations(Place, ({ one, many }) => ({
  city: one(City, {
    fields: [Place.cityId],
    references: [City.id],
  }),
  images: many(PlaceImage),
  reviews: many(Review),
  favorites: many(Favourite),
  activeClaim: one(Claim, {
    fields: [Place.id],
    references: [Claim.placeId],
  }),
  placeTags: many(PlaceTag),
}));

export const placeImageRelations = relations(PlaceImage, ({ one }) => ({
  place: one(Place, {
    fields: [PlaceImage.placeId],
    references: [Place.id],
  }),
  uploadedByUser: one(user, {
    fields: [PlaceImage.uploadedBy],
    references: [user.id],
  }),
}));

export const reviewRelations = relations(Review, ({ one, many }) => ({
  place: one(Place, {
    fields: [Review.placeId],
    references: [Place.id],
  }),
  user: one(user, {
    fields: [Review.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [Review.businessId],
    references: [Business.id],
  }),
  images: many(ReviewImage),
  likes: many(ReviewLike),
  reports: many(ReviewReport),
}));

export const reviewImageRelations = relations(ReviewImage, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewImage.reviewId],
    references: [Review.id],
  }),
}));

export const reviewLikeRelations = relations(ReviewLike, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewLike.reviewId],
    references: [Review.id],
  }),
  user: one(user, {
    fields: [ReviewLike.userId],
    references: [user.id],
  }),
  business: one(Business, {
    fields: [ReviewLike.businessId],
    references: [Business.id],
  }),
}));

export const reviewReportRelations = relations(ReviewReport, ({ one }) => ({
  review: one(Review, {
    fields: [ReviewReport.reviewId],
    references: [Review.id],
  }),
  reporter: one(user, {
    fields: [ReviewReport.userId],
    references: [user.id],
  }),
  reviewer: one(user, {
    fields: [ReviewReport.reviewedBy],
    references: [user.id],
  }),
}));

export const favouriteRelations = relations(Favourite, ({ one }) => ({
  place: one(Place, {
    fields: [Favourite.placeId],
    references: [Place.id],
  }),
  user: one(user, {
    fields: [Favourite.userId],
    references: [user.id],
  }),
}));

export const claimRelations = relations(Claim, ({ one }) => ({
  place: one(Place, {
    fields: [Claim.placeId],
    references: [Place.id],
  }),
  business: one(Business, {
    fields: [Claim.businessId],
    references: [Business.id],
  }),
  approver: one(user, {
    fields: [Claim.reviewedBy],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(Notification, ({ one }) => ({
  user: one(user, {
    fields: [Notification.userId],
    references: [user.id],
  }),
  relatedClaim: one(Claim, {
    fields: [Notification.relatedClaimId],
    references: [Claim.id],
  }),
  relatedPlace: one(Place, {
    fields: [Notification.relatedPlaceId],
    references: [Place.id],
  }),
  relatedReview: one(Review, {
    fields: [Notification.relatedReviewId],
    references: [Review.id],
  }),
}));

export const tagRelations = relations(Tag, ({ many }) => ({
  placeTags: many(PlaceTag),
}));

export const placeTagsRelations = relations(PlaceTag, ({ one }) => ({
  place: one(Place, {
    fields: [PlaceTag.placeId],
    references: [Place.id],
  }),
  tag: one(Tag, {
    fields: [PlaceTag.tagId],
    references: [Tag.id],
  }),
}));

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type UserSelect = InferSelectModel<typeof user>;
export type BusinessSelect = InferSelectModel<typeof Business>;
export type NewBusiness = typeof Business.$inferInsert;
export type PlaceSelect = InferSelectModel<typeof Place>;
export type PlaceImageSelect = InferSelectModel<typeof PlaceImage>;
export type ReviewSelect = InferSelectModel<typeof Review>;
export type CitySelect = InferSelectModel<typeof City>;
export type RegionSelect = InferSelectModel<typeof Region>;
export type IslandSelect = InferSelectModel<typeof Island>;
export type FavouriteSelect = InferSelectModel<typeof Favourite>;
export type ClaimSelect = InferSelectModel<typeof Claim>;
export type TagSelect = InferSelectModel<typeof Tag>;
export type PlaceTagSelect = InferSelectModel<typeof PlaceTag>;
export type ReviewLikeSelect = InferSelectModel<typeof ReviewLike>;
export type ReviewReportSelect = InferSelectModel<typeof ReviewReport>;
export type ReviewImageSelect = InferSelectModel<typeof ReviewImage>;
export type NotificationSelect = InferSelectModel<typeof Notification>;

export type BusinessWithOwner = BusinessSelect & {
  owner: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type FavouriteWithPlaceSelect = FavouriteSelect & {
  place: PlaceWithImagesSelect | null;
};

export type CityWithRegionSelect = CitySelect & {
  region: RegionSelect;
};

export type PlaceWithCityAndRegionSelect = PlaceSelect & {
  city: CityWithRegionSelect | null;
  images: PlaceImageSelect[];
};

export type UserReviewSelect = ReviewSelect & {
  images: ReviewImageSelect[];
  likes: ReviewLikeSelect[];
  reports: ReviewReportSelect[];
};

export type PlaceWithImagesSelect = PlaceSelect & {
  images: PlaceImageSelect[];
};

export type IslandPlaceWithSingleImageSelect = {
  id: string;
  name: string;
  slug: string;
  types: (
    | "Park"
    | "Restaurant"
    | "Hotel"
    | "Motel"
    | "AirBnb"
    | "Store"
    | "Café"
    | "Bar"
    | "Dog Park"
    | "Beach"
    | "Walk"
    | "Hike"
    | "Service"
    | "Activity"
    | "Lake"
    | "River"
    | "Trail"
  )[];
  description: string | null;
  rating: string | null;
  reviewsCount: number | null;
  isVerified: boolean | null;
  cityName: string;
  citySlug: string;
  regionName: string;
  regionSlug: string;
  imageUrl: string | null;
};

export type RegionPlaceWithSingleImageSelect = {
  id: string;
  name: string;
  slug: string;
  types: (
    | "Park"
    | "Restaurant"
    | "Hotel"
    | "Motel"
    | "AirBnb"
    | "Store"
    | "Café"
    | "Bar"
    | "Dog Park"
    | "Beach"
    | "Walk"
    | "Hike"
    | "Service"
    | "Activity"
    | "Lake"
    | "River"
    | "Trail"
  )[];
  description: string | null;
  rating: string | null;
  reviewsCount: number | null;
  isVerified: boolean | null;
  cityName: string;
  citySlug: string;
  islandName: string;
  islandSlug: string;
  imageUrl: string | null;
};

// User notification preferences (personal context)
export type UserNotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;
    reportStatus: boolean;

    // Marketing
    marketing: boolean;
    newsletter: boolean;

    // Discovery
    nearbyPlaces: boolean;
  };
  push: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;
    reportStatus: boolean;

    // Discovery
    nearbyPlaces: boolean;
  };
};

// Business notification preferences (business context)
export type BusinessNotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnPlaces: boolean;

    // Business/Admin
    placeUpdates: boolean;
    claimStatus: boolean;
    reportStatus: boolean;

    // Marketing
    marketing: boolean;
    newsletter: boolean;
  };
  push: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnPlaces: boolean;
    reportStatus: boolean;

    // Discovery
    nearbyPlaces: boolean;

    // Business/Admin
    claimStatus: boolean;
  };
};
