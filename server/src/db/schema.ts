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
    isBusinessAccount: boolean("is_business_account").default(false),
    businessName: text("business_name"),
    businessEmail: text("business_email"),
    businessPhone: text("business_phone"),
    website: text("website"),
    businessDescription: text("business_description"),
    logoUrl: text("logo_url"),
    verified: boolean("is_verified").default(false),
    subscriptionTier: text("subscription_tier"),
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
    notificationPreferences: jsonb("notification_preferences")
      .default({
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
      })
      .$type<NotificationPreferences>(),
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
    status: text("status").notNull().default("pending"), // pending, approved, rejected
    proof: text("proof"), // Document/evidence for ownership
    approvedAt: timestamp("approved_at"),
    approvedBy: text("approved_by").references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // A user can only claim a place once
      userPlaceUnique: unique().on(table.userId, table.placeId),
    };
  }
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
export const usersRelations = relations(user, ({ many }) => ({
  reviews: many(Review),
  favorites: many(Favourite),
  placeClaims: many(Claim),
  session: many(session),
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
  user: one(user, {
    fields: [Claim.userId],
    references: [user.id],
  }),
  approver: one(user, {
    fields: [Claim.approvedBy],
    references: [user.id],
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

export type NotificationPreferences = {
  email: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;

    // Business/Admin
    placeUpdates: boolean; // for claimed venues
    claimStatus: boolean;
    reportStatus: boolean;

    // Digest
    weeklyDigest: boolean;

    // Marketing
    marketing: boolean;
    newsletter: boolean;
  };
  push: {
    // Engagement
    reviewReplies: boolean;
    reviewLikes: boolean;
    newReviewsOnFavourites: boolean;

    // Discovery
    nearbyPlaces: boolean;
    favourites: boolean;

    // Business/Admin
    claimStatus: boolean;
  };
};
