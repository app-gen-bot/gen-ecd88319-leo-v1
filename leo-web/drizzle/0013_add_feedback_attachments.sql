-- Migration: Add attachments column to user_feedback table
-- Allows storing image attachments with feedback submissions

ALTER TABLE "user_feedback" ADD COLUMN IF NOT EXISTS "attachments" jsonb;
