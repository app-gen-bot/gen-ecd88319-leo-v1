---
name: supabase-project-setup
description: >
  Create Supabase project using MCP tool.
category: infrastructure
priority: P0
---

# Supabase Project Setup

## One-Step Setup

Use the MCP tool - it handles everything automatically:

```
mcp__supabase_setup__create_supabase_project(
  app_name="your-app-name",
  app_dir="/workspace/app",
  region="us-east-1"
)
```

## What the MCP Tool Does

1. Creates Supabase project via CLI
2. Polls API until project is ACTIVE_HEALTHY (~90 seconds)
3. Retrieves exact pooler URL from Supabase API
4. Gets API keys (anon, service_role)
5. Generates `.env` with all credentials
6. Creates `supabase/` directory structure

## Output

The tool creates `.env` with:

```bash
SUPABASE_URL=https://{project_ref}.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres.{ref}:{pass}@{pooler_host}:6543/postgres
AUTH_MODE=supabase
STORAGE_MODE=database
```

## Prerequisites

- Supabase CLI installed and authenticated
- `SUPABASE_ACCESS_TOKEN` environment variable set (for API calls)

## After Setup

Use `DATABASE_URL` with `prepare: false` in `server/lib/db.ts`:

```typescript
const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  prepare: false,  // REQUIRED for Supabase transaction pooler
});
```
