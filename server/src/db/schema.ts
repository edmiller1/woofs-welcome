import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
  uuid,
  serial,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["Free", "Pro", "Premium"]);
export const typeEnum = pgEnum("type", ["Listing", "Event", "Advertisement"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  externalId: uuid("external_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  externalId: uuid("external_id").unique(),
  plan: planEnum().default("Free"),
  contactName: text("contact_name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const listingsTable = pgTable("listings", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  latitude: decimal("latitude").notNull(),
  longitude: decimal("longitude").notNull(),
  listId: uuid("list_id").references(() => listsTable.id),
  businessId: serial("business_id").references(() => businessesTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),

  type: typeEnum(),
});

export const listingImagesTable = pgTable("listing_images", {
  id: uuid("id").primaryKey(),
  url: text("url").notNull(),
  listingId: uuid("listing_id").references(() => listingsTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  country: text("country").notNull(),
  latitude: decimal("latitude").notNull(),
  longitude: decimal("longitude").notNull(),
  listId: uuid("list_id").references(() => listsTable.id),
  businessId: serial("business_id").references(() => businessesTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),

  type: typeEnum().default("Event"),
});

export const eventImagesTable = pgTable("event_images", {
  id: uuid("id").primaryKey(),
  url: text("url").notNull(),
  eventId: uuid("event_id").references(() => eventsTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const openingHoursTable = pgTable("opening_hours", {
  id: uuid("id").primaryKey(),
  day: integer("day").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  listingId: uuid("listing_id").references(() => listingsTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const AdvertisementsTables = pgTable("advertisements", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: typeEnum().default("Advertisement"),
  image: text("image").notNull(),
  businessId: serial("business_id").references(() => businessesTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const listsTable = pgTable("lists", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  userId: serial("user_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});
