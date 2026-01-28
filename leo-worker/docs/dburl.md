# Database URL Unification Plan

## Goal

Use a **single DATABASE_URL** in the pooled format given for both Drizzle migrations and runtime:

```
postgresql://postgres.{project_ref}:{password}@aws-{N}-{region}.pooler.supabase.com:6543/postgres
```

---

## Research Findings

### The Prepared Statements Problem

PgBouncer (Supabase's connection pooler) runs in **transaction mode** which doesn't support prepared statements. The `postgres.js` driver uses prepared statements by default.

| Component | Uses Prepared Statements? | Solution |
|-----------|---------------------------|----------|
| **postgres.js (runtime)** | Yes, by default | `{ prepare: false }` option |
| **drizzle-kit (migrations)** | No evidence it does | Works with pooled URL |

### What Official Drizzle Docs Show

From the [Drizzle + Supabase Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase):

1. **Uses ONE `DATABASE_URL`** for both `drizzle.config.ts` AND runtime
2. **Recommends connection pooling**
3. Shows `{ prepare: false }` for runtime only (not for drizzle.config.ts)

```typescript
// drizzle.config.ts - single pooled URL works
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // Pooled URL
  },
});

// Runtime - needs prepare: false
const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle({ client });
```

### Why drizzle-kit Works with Pooled Connections

1. **drizzle-kit doesn't expose `prepare: false` option** - The config only takes a URL string
2. **Official examples use pooled URLs** - If migrations failed, Drizzle would document a workaround
3. **Migration queries are simple** - DDL statements (CREATE TABLE, ALTER) don't typically use prepared statements the same way SELECT/INSERT do

### Key Insight

The `?pgbouncer=true` URL parameter is **Prisma-specific** - it tells Prisma to disable prepared statements. Each driver has its own method:

| Driver | Method to Disable Prepared Statements |
|--------|---------------------------------------|
| Prisma | `?pgbouncer=true` in URL |
| postgres.js | `{ prepare: false }` in options |
| node-postgres | Omit "name" in query definitions |
| drizzle-kit | Not needed (doesn't use them) |

---

## Conclusion: Use Option A (Unified Pooled URL)

A single pooled `DATABASE_URL` works for Drizzle because:

1. **drizzle-kit** - Doesn't rely on prepared statements for migrations
2. **Runtime** - Needs `{ prepare: false }` in postgres.js client options (not in URL)

---

## Implementation

### 1. MCP Tool Output (No Change Needed)

The current MCP tool already outputs a single `DATABASE_URL`:

```python
# vendor/cc-tools/cc_tools/supabase_setup/server.py (lines 320-331)
env_content = f"""
SUPABASE_URL=https://{project_ref}.supabase.co
SUPABASE_ANON_KEY={anon_key}
SUPABASE_SERVICE_ROLE_KEY={service_key}
DATABASE_URL={database_url}
AUTH_MODE=supabase
STORAGE_MODE={storage_mode}
"""
```

This is correct. No changes needed.

### 2. drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // Single pooled URL
  },
});
```

### 3. server/lib/db.ts (Runtime)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set');
}

// CRITICAL: prepare: false required for Supabase transaction pooler
const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false,  // Required for pooler (port 6543)
});

export const db = drizzle(client, { schema });
export { schema };
```

### 4. Update SKILL.md Files

**Files to update**:
- `~/.claude/skills/supabase-project-setup/SKILL.md`
- `~/.claude/skills/drizzle-orm-setup/SKILL.md`

**Changes**:
- Remove "two URL" requirement
- Remove "DO NOT VIOLATE" rules about separate URLs
- Simplify to single `DATABASE_URL` guidance
- Keep `prepare: false` requirement for runtime

---

## Updated .env Format

```bash
# Supabase API
SUPABASE_URL=https://{project_ref}.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Single Database URL (pooled) - works for BOTH migrations AND runtime
DATABASE_URL=postgresql://postgres.{project_ref}:{password}@aws-1-{region}.pooler.supabase.com:6543/postgres

# App configuration
AUTH_MODE=supabase
STORAGE_MODE=database
```

---

## Checklist

After setup, verify:

- [ ] `.env` has single `DATABASE_URL` (pooled, port 6543)
- [ ] `drizzle.config.ts` uses `DATABASE_URL`
- [ ] `server/lib/db.ts` uses `DATABASE_URL` with `prepare: false`
- [ ] Migrations work: `npx drizzle-kit push`
- [ ] Runtime queries work: App can read/write data

---

## References

- [Drizzle + Supabase Tutorial](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase)
- [Drizzle Connect Supabase](https://orm.drizzle.team/docs/connect-supabase)
- [Drizzle Get Started Supabase](https://orm.drizzle.team/docs/get-started/supabase-existing)
- [Supabase Disabling Prepared Statements](https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL)
- [drizzle-kit push docs](https://orm.drizzle.team/docs/drizzle-kit-push)
