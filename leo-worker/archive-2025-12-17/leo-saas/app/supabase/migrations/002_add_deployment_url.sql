-- Add deployment_url column to generation_requests table
-- This stores the Fly.io deployed app URL after successful deployment

ALTER TABLE generation_requests
ADD COLUMN IF NOT EXISTS deployment_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN generation_requests.deployment_url IS 'Fly.io deployed app URL (e.g., https://gen-2611882e-53.fly.dev)';
