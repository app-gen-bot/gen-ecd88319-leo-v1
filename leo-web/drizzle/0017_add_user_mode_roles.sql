-- Migration: Add user_plus role and app_assignments table
-- This enables role-based app visibility and friendly console mode

-- Step 1: Add user_plus role to enum
-- Note: In PostgreSQL, we need to add new enum values manually
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user_plus' BEFORE 'dev';

-- Step 2: Migrate existing 'user' role users to 'user_plus'
-- (existing users should retain current behavior - can create apps and see own apps)
UPDATE profiles SET role = 'user_plus' WHERE role = 'user';

-- Step 3: Create app_assignments table
CREATE TABLE IF NOT EXISTS app_assignments (
  id SERIAL PRIMARY KEY,
  app_id INTEGER NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  can_resume BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (app_id, user_id)
);

-- Step 4: Add indexes for performance
CREATE INDEX IF NOT EXISTS app_assignments_user_id_idx ON app_assignments(user_id);
CREATE INDEX IF NOT EXISTS app_assignments_app_id_idx ON app_assignments(app_id);

-- Step 5: Enable RLS on app_assignments
ALTER TABLE app_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own assignments
CREATE POLICY "Users can see their own assignments"
  ON app_assignments
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS Policy: Admins and devs can manage assignments
CREATE POLICY "Admins and devs can manage assignments"
  ON app_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'dev')
    )
  );
