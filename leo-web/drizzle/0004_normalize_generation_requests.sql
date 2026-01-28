-- Normalize generation_requests to 3NF
-- Remove redundant columns that can be derived from apps table via app_ref_id FK

-- Step 1: Add new column for github commit tracking
ALTER TABLE "generation_requests" ADD COLUMN "github_commit" text;

-- Step 2: Drop redundant columns (order matters for dependencies)
-- First drop the indexes that reference these columns
DROP INDEX IF EXISTS "generation_requests_user_id_idx";
DROP INDEX IF EXISTS "generation_requests_app_id_idx";

-- Now drop the columns
ALTER TABLE "generation_requests" DROP COLUMN "app_id";
ALTER TABLE "generation_requests" DROP COLUMN "user_id";
ALTER TABLE "generation_requests" DROP COLUMN "app_name";
ALTER TABLE "generation_requests" DROP COLUMN "github_url";
ALTER TABLE "generation_requests" DROP COLUMN "deployment_url";

-- Step 3: Drop unused iteration_snapshots table
DROP TABLE IF EXISTS "iteration_snapshots";

-- Step 4: Drop the snapshot_type enum (no longer needed)
DROP TYPE IF EXISTS "snapshot_type";
