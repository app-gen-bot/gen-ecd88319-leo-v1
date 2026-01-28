-- Migration: Add app_credentials table for credential persistence
-- Stores references to Supabase Vault secrets for each app's environment variables
-- Note: Vault extension must be enabled via Supabase Dashboard (already enabled on leo-dev)

-- Create app_credentials table
CREATE TABLE IF NOT EXISTS app_credentials (
  id SERIAL PRIMARY KEY,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  env_key TEXT NOT NULL,
  vault_secret_id UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS app_credentials_app_id_idx ON app_credentials(app_id);

-- Create unique constraint (app_id, env_key)
ALTER TABLE app_credentials
ADD CONSTRAINT app_credentials_app_env_unique UNIQUE (app_id, env_key);
