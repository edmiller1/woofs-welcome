CREATE TYPE "public"."plan" AS ENUM('Free', 'Pro', 'Premium');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('Listing', 'Event', 'Advertisement');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "advertisements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" "type" DEFAULT 'Advertisement',
	"image" text NOT NULL,
	"business_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" uuid,
	"plan" "plan" DEFAULT 'Free',
	"contact_name" text NOT NULL,
	"business_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "businesses_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"event_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"country" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"list_id" uuid,
	"business_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"type" "type" DEFAULT 'Event'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listing_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"listing_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"region" text NOT NULL,
	"country" text NOT NULL,
	"latitude" numeric NOT NULL,
	"longitude" numeric NOT NULL,
	"list_id" uuid,
	"business_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"type" "type"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lists" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opening_hours" (
	"id" uuid PRIMARY KEY NOT NULL,
	"day" integer NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"listing_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" uuid,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "event_images" ADD CONSTRAINT "event_images_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "events" ADD CONSTRAINT "events_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listings" ADD CONSTRAINT "listings_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listings" ADD CONSTRAINT "listings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lists" ADD CONSTRAINT "lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opening_hours" ADD CONSTRAINT "opening_hours_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
