-- ============================================================================
-- REPL Autonomous Mode Migration
-- ============================================================================
-- Adds fields to support iterative/autonomous generation mode with pause/resume
-- Maintains backward compatibility by adding defaults for all new fields
-- Run this in Supabase SQL Editor or via migration tool

BEGIN;

-- 1. Add 'paused' status to generation_status enum
ALTER TYPE generation_status ADD VALUE IF NOT EXISTS 'paused';

-- 2. Create generation_mode enum
DO $$ BEGIN
    CREATE TYPE generation_mode AS ENUM ('single-shot', 'autonomous');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Type generation_mode already exists, skipping creation';
END $$;

-- 3. Add mode column with default 'single-shot' (preserves V1 behavior)
ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS mode generation_mode NOT NULL DEFAULT 'single-shot';

-- 4. Add initial_prompt column (stores first prompt that started generation)
-- For existing rows, backfill from prompt field
ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS initial_prompt TEXT;

-- Backfill initial_prompt from prompt for existing rows
UPDATE generation_requests
SET initial_prompt = prompt
WHERE initial_prompt IS NULL;

-- Now make it NOT NULL after backfill
ALTER TABLE generation_requests
ALTER COLUMN initial_prompt SET NOT NULL;

-- 5. Add max_iterations column (default 10, range 1-20)
ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS max_iterations INTEGER NOT NULL DEFAULT 10;

-- Add check constraint to enforce range
DO $$ BEGIN
    ALTER TABLE generation_requests
    ADD CONSTRAINT max_iterations_range CHECK (max_iterations >= 1 AND max_iterations <= 20);
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint max_iterations_range already exists, skipping creation';
END $$;

-- 6. Add current_iteration column (default 0)
ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS current_iteration INTEGER NOT NULL DEFAULT 0;

-- Add check constraint to ensure non-negative
DO $$ BEGIN
    ALTER TABLE generation_requests
    ADD CONSTRAINT current_iteration_min CHECK (current_iteration >= 0);
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Constraint current_iteration_min already exists, skipping creation';
END $$;

-- 7. Add conversation column (JSONB array of conversation turns, nullable)
ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS conversation JSONB;

-- 8. Create index on mode for filtering autonomous vs single-shot requests
CREATE INDEX IF NOT EXISTS idx_generation_requests_mode ON generation_requests(mode);

-- 9. Create composite index on user_id + mode for efficient querying
CREATE INDEX IF NOT EXISTS idx_generation_requests_user_mode ON generation_requests(user_id, mode);

-- 10. Add comments for documentation
COMMENT ON COLUMN generation_requests.mode IS 'Generation mode: single-shot (V1) or autonomous (V2 REPL)';
COMMENT ON COLUMN generation_requests.initial_prompt IS 'First prompt that started the generation session';
COMMENT ON COLUMN generation_requests.max_iterations IS 'Maximum number of iterations for autonomous mode (1-20)';
COMMENT ON COLUMN generation_requests.current_iteration IS 'Current iteration number in autonomous mode';
COMMENT ON COLUMN generation_requests.conversation IS 'JSONB array of conversation turns for autonomous mode';

COMMIT;

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'generation_requests'
  AND column_name IN ('mode', 'initial_prompt', 'max_iterations', 'current_iteration', 'conversation')
ORDER BY ordinal_position;
