import {
  pgTable,
  serial,
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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const User = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    externalId: text("external_id").notNull(),
    fullName: text("full_name"),
    email: varchar("email", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    emailNotifications: boolean("email_notifications").default(true),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const Place = pgTable("place", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  type: text("type").notNull(), // park, restaurant, hotel, store, etc.
  description: text("description"),
  // Location references
  localityId: uuid("locality_id").references(() => Locality.id),
  address: text("address"),
  latitude: numeric("latitude", { precision: 10, scale: 6 }),
  longitude: numeric("longitude", { precision: 10, scale: 6 }),
  // Contact info
  phone: text("phone"),
  website: text("website"),
  hours: jsonb("hours"), // Store opening hours as JSON
  // Dog-specific info
  dogPolicy: text("dog_policy"),
  leashRequired: boolean("leash_required"),
  hasWater: boolean("has_water").default(false),
  hasWasteBags: boolean("has_waste_bags").default(false),
  indoorAllowed: boolean("indoor_allowed").default(false),
  outdoorAllowed: boolean("outdoor_allowed").default(false),
  dogSizeLimit: text("dog_size_limit"), // small, medium, large, any
  feeDetails: text("fee_details"),
  amenities: text("amenities").array(),
  photos: text("photos").array(),
  // Metrics and flags
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),
  isVerified: boolean("is_verified").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Region = pgTable("region", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  islandGroup: text("island_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const District = pgTable("district", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  regionId: uuid("region_id")
    .notNull()
    .references(() => Region.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Locality = pgTable(
  "locality",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => District.id),
    postalCode: text("postal_code"),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    isPopular: boolean("is_popular").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Localities can have the same name in different districts
    // but they should be unique within a district
  },
  (table) => {
    return {
      nameDistrictUnique: unique().on(table.name, table.districtId),
    };
  }
);

export const Review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => Place.id, { onDelete: "cascade" }),
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
    userId: uuid("user_id")
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
    userId: uuid("user_id")
      .notNull()
      .references(() => User.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // pending, approved, rejected
    proof: text("proof"), // Document/evidence for ownership
    approvedAt: timestamp("approved_at"),
    approvedBy: uuid("approved_by").references(() => User.id),
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

export const regionRelations = relations(Region, ({ many }) => ({
  districts: many(District),
}));

export const districtRelations = relations(District, ({ one, many }) => ({
  region: one(Region, {
    fields: [District.regionId],
    references: [Region.id],
  }),
  localities: many(Locality),
}));

export const localityRelations = relations(Locality, ({ one, many }) => ({
  district: one(District, {
    fields: [Locality.districtId],
    references: [District.id],
  }),
  places: many(Place),
}));

export const placeRelations = relations(Place, ({ one, many }) => ({
  locality: one(Locality, {
    fields: [Place.localityId],
    references: [Locality.id],
  }),
  reviews: many(Review),
  favorites: many(Favourite),
  claims: many(Claim),
  placeTags: many(PlaceTag),
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
