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
import { relations } from "drizzle-orm";

export const placeTypeEnum = pgEnum("place_type", [
  "Park",
  "Restaurant",
  "Hotel",
  "Motel",
  "AirBnb",
  "Store",
  "Café",
  "Beach",
  "Walk",
  "Hike",
  "Service",
  "Activity",
]);

export const User = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified")
      .$defaultFn(() => false)
      .notNull(),
    image: text("image"),
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
    emailNotifications: boolean("email_notifications").default(true),
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
    .references(() => User.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
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

export const Island = pgTable("island", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Region = pgTable("region", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  image: text("image"),
  islandId: uuid("island_id")
    .notNull()
    .references(() => Island.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const City = pgTable("city", {
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
});

export const Place = pgTable("place", {
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
  website: text("website"),
  hours: jsonb("hours"), // Store opening hours as JSON
  // Dog-specific info
  dogPolicy: text("dog_policy"),
  indoorAllowed: boolean("indoor_allowed").default(false),
  outdoorAllowed: boolean("outdoor_allowed").default(false),
  // Metrics and flags
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const PlaceImage = pgTable("place_image", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => Place.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  altText: text("alt_text"),
  isPrimary: boolean("is_primary").default(false),
  source: text("source").notNull(), // 'google', 'user_upload', 'admin', 'scraper', etc.
  uploadedBy: text("uploaded_by").references(() => User.id), // null for google/scraped images
  isApproved: boolean("is_approved").default(true), // for moderation
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    content: text("content"),
    visitDate: timestamp("visit_date"),
    photos: text("photos").array(),
    helpfulCount: integer("helpful_count").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // A user can only review a place once
      userPlaceUnique: unique().on(table.userId, table.placeId),
    };
  }
);

export const Favourite = pgTable(
  "favourite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // A user can only favourite a place once
      userPlaceUnique: unique().on(table.userId, table.placeId),
    };
  }
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
      .references(() => User.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending, approved, rejected
    proof: text("proof"), // Document/evidence for ownership
    approvedAt: timestamp("approved_at"),
    approvedBy: text("approved_by").references(() => User.id),
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
  (table) => {
    return {
      // A place can only have a specific tag once
      placeTagUnique: unique().on(table.placeId, table.tagId),
    };
  }
);

// Define relationships
export const usersRelations = relations(User, ({ many }) => ({
  reviews: many(Review),
  favorites: many(Favourite),
  placeClaims: many(Claim),
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
  claims: many(Claim),
  placeTags: many(PlaceTag),
}));

export const placeImageRelations = relations(PlaceImage, ({ one }) => ({
  place: one(Place, {
    fields: [PlaceImage.placeId],
    references: [Place.id],
  }),
  uploadedByUser: one(User, {
    fields: [PlaceImage.uploadedBy],
    references: [User.id],
  }),
}));

export const reviewRelations = relations(Review, ({ one }) => ({
  place: one(Place, {
    fields: [Review.placeId],
    references: [Place.id],
  }),
  user: one(User, {
    fields: [Review.userId],
    references: [User.id],
  }),
}));

export const favouriteRelations = relations(Favourite, ({ one }) => ({
  place: one(Place, {
    fields: [Favourite.placeId],
    references: [Place.id],
  }),
  user: one(User, {
    fields: [Favourite.userId],
    references: [User.id],
  }),
}));

export const claimRelations = relations(Claim, ({ one }) => ({
  place: one(Place, {
    fields: [Claim.placeId],
    references: [Place.id],
  }),
  user: one(User, {
    fields: [Claim.userId],
    references: [User.id],
  }),
  approver: one(User, {
    fields: [Claim.approvedBy],
    references: [User.id],
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
