-- Apps Table Migration
-- Creates a stable apps table with unique (user_id, app_name) constraint
-- Links generation_requests to apps via FK for proper resume functionality
-- Migrates existing data by deduplicating apps

-- Step 1: Create the apps table
CREATE TABLE "apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"app_uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"app_name" text NOT NULL,
	"github_url" text,
	"deployment_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apps_user_app_unique" UNIQUE("user_id", "app_name")
);--> statement-breakpoint

-- Create index on user_id for fast lookups
CREATE INDEX "apps_user_id_idx" ON "apps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "apps_app_uuid_idx" ON "apps" USING btree ("app_uuid");--> statement-breakpoint

-- Step 2: Migrate existing data - deduplicate by keeping the most recent generation per (user_id, app_name)
-- This inserts unique apps based on existing generation_requests
INSERT INTO "apps" ("app_uuid", "user_id", "app_name", "github_url", "deployment_url", "created_at", "updated_at")
SELECT DISTINCT ON (user_id, app_name)
  app_id as app_uuid,
  user_id,
  app_name,
  github_url,
  deployment_url,
  created_at,
  updated_at
FROM "generation_requests"
ORDER BY user_id, app_name, updated_at DESC;--> statement-breakpoint

-- Step 3: Add app_ref_id column to generation_requests (nullable initially for migration)
ALTER TABLE "generation_requests" ADD COLUMN "app_ref_id" integer;--> statement-breakpoint

-- Step 4: Populate app_ref_id by matching app_id (UUID) to apps.app_uuid
UPDATE "generation_requests" gr
SET "app_ref_id" = a.id
FROM "apps" a
WHERE gr.app_id = a.app_uuid;--> statement-breakpoint

-- Step 5: Make app_ref_id NOT NULL after data migration
ALTER TABLE "generation_requests" ALTER COLUMN "app_ref_id" SET NOT NULL;--> statement-breakpoint

-- Step 6: Add foreign key constraint
ALTER TABLE "generation_requests" ADD CONSTRAINT "generation_requests_app_ref_id_apps_id_fk"
  FOREIGN KEY ("app_ref_id") REFERENCES "apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Step 7: Create index on app_ref_id
CREATE INDEX "generation_requests_app_ref_id_idx" ON "generation_requests" USING btree ("app_ref_id");
