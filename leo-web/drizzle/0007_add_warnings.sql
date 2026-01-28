-- Migration: Add warnings column to generation_requests
-- This stores warnings from all_work_complete WSI message (RLS, security issues, etc.)

-- Add warnings column (JSONB for array of warning objects)
ALTER TABLE generation_requests ADD COLUMN IF NOT EXISTS warnings JSONB;

-- Add comment for documentation
COMMENT ON COLUMN generation_requests.warnings IS 'Array of {code, message, details: {remediation_url}} from all_work_complete message';
