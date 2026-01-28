-- Add claude_oauth_token column to profiles table
-- Developer token (BYOT - Bring Your Own Token) for dev/admin roles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claude_oauth_token text;

-- Add comment for documentation
COMMENT ON COLUMN profiles.claude_oauth_token IS 'Developer Claude OAuth token (BYOT). Required for dev/admin roles to run generations.';
