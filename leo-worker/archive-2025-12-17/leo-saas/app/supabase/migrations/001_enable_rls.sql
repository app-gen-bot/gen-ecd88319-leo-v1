-- Enable Row Level Security on generation_requests table
-- CRITICAL: Without RLS, anyone with the anon key can access ALL data

-- Step 1: Convert user_id column from TEXT to UUID for type safety
ALTER TABLE generation_requests
ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

-- Step 2: Enable RLS on the table
ALTER TABLE generation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only INSERT their own generation requests
-- auth.uid() returns UUID, matches user_id UUID column
CREATE POLICY "Users can create their own generations"
ON generation_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only SELECT their own generation requests
CREATE POLICY "Users can view their own generations"
ON generation_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own generation requests
-- (Needed for status updates, download URLs, etc.)
CREATE POLICY "Users can update their own generations"
ON generation_requests FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own generation requests
CREATE POLICY "Users can delete their own generations"
ON generation_requests FOR DELETE
USING (auth.uid() = user_id);

-- Note: The server uses the SERVICE_ROLE_KEY (not anon key) for backend operations
-- Service role key bypasses RLS and can access all data (as intended)
