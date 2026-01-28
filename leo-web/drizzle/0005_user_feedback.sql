-- User Feedback table for feature requests and bug reports
-- Migration: 0005_user_feedback.sql

-- Create feedback type enum
DO $$ BEGIN
  CREATE TYPE "public"."feedback_type" AS ENUM('feature_request', 'bug_report');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create feedback status enum
DO $$ BEGIN
  CREATE TYPE "public"."feedback_status" AS ENUM('new', 'reviewed', 'in_progress', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS "user_feedback" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL,
  "type" "feedback_type" NOT NULL,
  "content" text NOT NULL,
  "status" "feedback_status" NOT NULL DEFAULT 'new',
  "source_page" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "user_feedback" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_feedback_status_idx" ON "user_feedback" USING btree ("status");

-- Enable RLS
ALTER TABLE "user_feedback" ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own feedback
CREATE POLICY "Users can view own feedback" ON "user_feedback"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON "user_feedback"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON "user_feedback"
  FOR ALL
  USING (auth.role() = 'service_role');
