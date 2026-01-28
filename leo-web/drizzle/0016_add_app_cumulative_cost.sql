-- Migration: Add cumulative cost tracking to apps table
-- Aggregates total cost across all generations for an app

ALTER TABLE apps ADD COLUMN IF NOT EXISTS cumulative_cost TEXT DEFAULT '0';

COMMENT ON COLUMN apps.cumulative_cost IS 'Total USD cost across all generations (e.g. "1.2345")';
