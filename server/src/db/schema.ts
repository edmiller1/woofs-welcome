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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable(
  "user",
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
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
    createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
    emailNotifications: boolean("email_notifications").default(true),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const session = pgTable("session", {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const place = pgTable("place", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  type: text("type").array().notNull(), // park, restaurant, hotel, store, etc.
  description: text("description"),
  // Location references
  localityId: uuid("locality_id").references(() => locality.id),
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

export const placeImages = pgTable("place_image", {
  id: uuid("id").primaryKey().defaultRandom(),
  placeId: uuid("place_id")
    .notNull()
    .references(() => place.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  index: integer("index").notNull().default(0), // Order of images
})

export const region = pgTable("region", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  islandGroup: text("island_group").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const district = pgTable("district", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  regionId: uuid("region_id")
    .notNull()
    .references(() => region.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const locality = pgTable(
  "locality",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    districtId: uuid("district_id")
      .notNull()
      .references(() => district.id),
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

export const review = pgTable(
  "review",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
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

export const favourite = pgTable(
  "favourite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: uuid("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // A user can only favourite a place once
      userPlaceUnique: unique().on(table.userId, table.placeId),
    };
  }
);

export const claim = pgTable(
  "claim",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
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

export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  category: text("category"), // e.g., amenity, feature, service
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const placeTag = pgTable(
  "place_tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    placeId: uuid("place_id")
      .notNull()
      .references(() => place.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
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
export const usersRelations = relations(user, ({ many }) => ({
  reviews: many(review),
  favorites: many(favourite),
  placeClaims: many(claim),
}));

export const regionRelations = relations(region, ({ many }) => ({
  districts: many(district),
}));

export const districtRelations = relations(district, ({ one, many }) => ({
  region: one(region, {
    fields: [district.regionId],
    references: [region.id],
  }),
  localities: many(locality),
}));

export const localityRelations = relations(locality, ({ one, many }) => ({
  district: one(district, {
    fields: [locality.districtId],
    references: [district.id],
  }),
  places: many(place),
}));

export const placeRelations = relations(place, ({ one, many }) => ({
  locality: one(locality, {
    fields: [place.localityId],
    references: [locality.id],
  }),
  reviews: many(review),
  favorites: many(favourite),
  claims: many(claim),
  placeTags: many(placeTag),
  images: many(placeImages),
  tags: many(tag),
  region: one(region),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  place: one(place, {
    fields: [review.placeId],
    references: [place.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));

export const favouriteRelations = relations(favourite, ({ one }) => ({
  place: one(place, {
    fields: [favourite.placeId],
    references: [place.id],
  }),
  user: one(user, {
    fields: [favourite.userId],
    references: [user.id],
  }),
}));

export const claimRelations = relations(claim, ({ one }) => ({
  place: one(place, {
    fields: [claim.placeId],
    references: [place.id],
  }),
  user: one(user, {
    fields: [claim.userId],
    references: [user.id],
  }),
  approver: one(user, {
    fields: [claim.approvedBy],
    references: [user.id],
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  placeTags: many(placeTag),
}));

export const placeTagsRelations = relations(placeTag, ({ one }) => ({
  place: one(place, {
    fields: [placeTag.placeId],
    references: [place.id],
  }),
  tag: one(tag, {
    fields: [placeTag.tagId],
    references: [tag.id],
  }),
}));

export const placeImagesRelations = relations(placeImages, ({ one }) => ({
  place: one(place, {
    fields: [placeImages.placeId],
    references: [place.id],
  }),
}));

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}