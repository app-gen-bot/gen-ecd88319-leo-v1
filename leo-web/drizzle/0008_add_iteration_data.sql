-- Migration: Add iteration_data column for per-iteration cost tracking
-- This stores an array of {iteration, cost, duration} objects

-- Add iteration_data JSONB column to generation_requests
ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS iteration_data JSONB;

-- Add comment explaining the column structure
COMMENT ON COLUMN generation_requests.iteration_data IS 'Array of {iteration: number, cost: number, duration: number} objects tracking per-iteration costs and durations';
