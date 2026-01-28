-- Resume Fix Schema Migration
-- Adds generation_type enum and column
-- Drops unused columns: download_url, artifacts_github_url, conversation

-- Create the generation_type enum
CREATE TYPE "public"."generation_type" AS ENUM('new', 'resume');--> statement-breakpoint

-- Add generation_type column with default 'new'
ALTER TABLE "generation_requests" ADD COLUMN "generation_type" "generation_type" DEFAULT 'new' NOT NULL;--> statement-breakpoint

-- Drop unused columns
ALTER TABLE "generation_requests" DROP COLUMN IF EXISTS "download_url";--> statement-breakpoint
ALTER TABLE "generation_requests" DROP COLUMN IF EXISTS "artifacts_github_url";--> statement-breakpoint
ALTER TABLE "generation_requests" DROP COLUMN IF EXISTS "conversation";
