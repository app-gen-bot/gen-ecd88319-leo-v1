-- Migration: Add iteration_snapshots table for history tracking and rollback
-- Date: 2025-11-04
-- Description: Stores snapshots of each iteration for history viewing and rollback functionality

-- Create snapshot_type enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE snapshot_type AS ENUM ('automatic', 'manual', 'checkpoint');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create iteration_snapshots table
CREATE TABLE IF NOT EXISTS iteration_snapshots (
  id SERIAL PRIMARY KEY,
  generation_request_id INTEGER NOT NULL REFERENCES generation_requests(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,
  snapshot_type snapshot_type NOT NULL DEFAULT 'automatic',
  files_snapshot TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS iteration_snapshots_generation_id_idx ON iteration_snapshots(generation_request_id);
CREATE INDEX IF NOT EXISTS iteration_snapshots_number_idx ON iteration_snapshots(generation_request_id, iteration_number);

-- Add comment
COMMENT ON TABLE iteration_snapshots IS 'Stores snapshots of each iteration for history viewing and rollback';
COMMENT ON COLUMN iteration_snapshots.generation_request_id IS 'Foreign key to generation_requests table';
COMMENT ON COLUMN iteration_snapshots.iteration_number IS 'Iteration number (1-based)';
COMMENT ON COLUMN iteration_snapshots.snapshot_type IS 'Type of snapshot: automatic (created on each iteration), manual (user-created), or checkpoint (important milestone)';
COMMENT ON COLUMN iteration_snapshots.files_snapshot IS 'JSON string of file tree at this iteration';
COMMENT ON COLUMN iteration_snapshots.prompt_used IS 'Prompt that created this iteration';
COMMENT ON COLUMN iteration_snapshots.metadata IS 'Additional metadata: tokensUsed, duration, changedFiles, summary';
