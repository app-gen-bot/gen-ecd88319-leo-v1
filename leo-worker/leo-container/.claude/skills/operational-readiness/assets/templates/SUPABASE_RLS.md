# Supabase Row Level Security (RLS)

## Overview

This document describes the Row Level Security policies implemented for the application database.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Supabase Project** | [TODO: Project ID] |

## RLS Status Summary

| Table | RLS Enabled | Policies | Status |
|-------|-------------|----------|--------|
| users | [Yes/No] | [N] | [Compliant/Needs Review] |
| [table2] | [Yes/No] | [N] | [Compliant/Needs Review] |
| [table3] | [Yes/No] | [N] | [Compliant/Needs Review] |

## Table Policies

### Table: `users`

**RLS Enabled**: Yes

| Policy Name | Operation | Using Expression | Check Expression |
|-------------|-----------|------------------|------------------|
| Users can view own profile | SELECT | `auth.uid() = id` | - |
| Users can update own profile | UPDATE | `auth.uid() = id` | `auth.uid() = id` |
| Users cannot delete accounts | DELETE | `false` | - |

**SQL**:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Prevent user deletion via API
CREATE POLICY "Users cannot delete accounts"
  ON users FOR DELETE
  USING (false);
```

---

### Table: `[table_name]`

**RLS Enabled**: [Yes/No]

| Policy Name | Operation | Using Expression | Check Expression |
|-------------|-----------|------------------|------------------|
| [Policy name] | [SELECT/INSERT/UPDATE/DELETE] | [Expression] | [Expression] |

**SQL**:
```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- [Add policy SQL here]
```

---

## Common RLS Patterns

### Pattern 1: User Owns Resource

For tables where users own their own data:

```sql
-- Users can only see their own items
CREATE POLICY "Users see own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create items for themselves
CREATE POLICY "Users create own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own items
CREATE POLICY "Users update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own items
CREATE POLICY "Users delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

### Pattern 2: Team/Organization Access

For tables with team-based access:

```sql
-- Users can see items in their organization
CREATE POLICY "Org members see items"
  ON items FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  );
```

### Pattern 3: Public Read, Authenticated Write

For tables with public content:

```sql
-- Anyone can read public items
CREATE POLICY "Public read"
  ON items FOR SELECT
  USING (is_public = true);

-- Only authenticated users can create
CREATE POLICY "Authenticated create"
  ON items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Pattern 4: Admin Override

For administrative access:

```sql
-- Admins can do everything
CREATE POLICY "Admin full access"
  ON items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Tables Without RLS

The following tables do NOT have RLS enabled:

| Table | Reason | Risk | Mitigation |
|-------|--------|------|------------|
| [table] | [Reason] | [Low/Med/High] | [How risk is mitigated] |

**Note**: All tables should have RLS enabled. Tables without RLS should be documented with justification and added to WAIVER.md if appropriate.

## Verification Queries

### Check RLS Status

```sql
-- List all tables and their RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### List All Policies

```sql
-- List all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test Policy (as specific user)

```sql
-- Set role to test user
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';

-- Try to select from table
SELECT * FROM items;

-- Reset role
RESET ROLE;
```

## Migration Considerations

When adding RLS to existing tables:

1. **Backup first**: Always backup before modifying RLS
2. **Test in staging**: Verify policies don't break functionality
3. **Enable RLS last**: Add policies before enabling RLS
4. **Monitor logs**: Watch for access denied errors after deployment

```sql
-- Safe migration order
BEGIN;

-- 1. Add policies (while RLS is still disabled)
CREATE POLICY "policy_name" ON table_name ...;

-- 2. Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 3. Verify (should work if policies are correct)
SET ROLE authenticated;
SELECT * FROM table_name LIMIT 1;
RESET ROLE;

COMMIT;
```

## Security Checklist

- [ ] All tables have RLS enabled
- [ ] All tables have at least one SELECT policy
- [ ] INSERT policies include WITH CHECK
- [ ] UPDATE policies include both USING and WITH CHECK
- [ ] No policies use `true` without good reason
- [ ] Admin access is properly restricted
- [ ] Public tables are intentionally public
- [ ] Policies tested with different user roles

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
