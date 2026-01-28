-- Migration: Add cost and duration tracking to generation_requests
-- These fields are populated from the all_work_complete WSI message

-- Add total_cost column (stored as text for precision)
ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS total_cost TEXT;

-- Add total_duration column (seconds as integer)
ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS total_duration INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN generation_requests.total_cost IS 'USD cost from all_work_complete message (e.g. "0.0523")';
COMMENT ON COLUMN generation_requests.total_duration IS 'Total generation duration in seconds from all_work_complete message';
