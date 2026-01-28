-- Add pool_index column for tracking multi-generation pool assignments
-- This enables running multiple concurrent generations per user

ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS pool_index INTEGER;

COMMENT ON COLUMN generation_requests.pool_index IS 'Index of the Supabase pool assigned to this generation (1-based). NULL when not actively generating or pool not assigned.';

-- Create index for efficient queries on active generations by pool
CREATE INDEX IF NOT EXISTS generation_requests_pool_idx ON generation_requests(pool_index) WHERE pool_index IS NOT NULL;
