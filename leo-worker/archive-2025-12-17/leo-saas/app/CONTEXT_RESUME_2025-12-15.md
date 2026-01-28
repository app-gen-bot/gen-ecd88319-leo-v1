# CONTEXT RESUME - 2025-12-15

## Session Summary

Setting up Leo SaaS with WSI Server integration and Supabase database pooling.

## What Was Completed

### 1. WSI Server Integration (Previous Session)
- Wired WSI Server to Express in `server/index.ts`
- Browser connects to `/wsi` endpoint
- Container spawning works via DockerManager
- Full E2E flow tested successfully

### 2. Supabase Pool Credentials Setup (This Session)
All three locations now have consistent Leo Pipeline Configuration:

**Files updated:**
- `~/.secrets/dev.env` - Central secrets
- `/Users/jake/dev/app-factory/remote/.env` - Leo Remote CLI
- `/Users/jake/dev/app-factory/apps/leo-saas/app/.env.local` - Leo SaaS server

**Credentials configured:**
```
SUPABASE_URL=https://flhrcbbdmgflzgicgeua.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:ZKFUOQbve2OywGGX@db.flhrcbbdmgflzgicgeua.supabase.co:5432/postgres
DATABASE_URL_POOLING=postgresql://postgres.flhrcbbdmgflzgicgeua:ZKFUOQbve2OywGGX@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Container Manager Updated
- `server/lib/wsi/container-manager.ts` now passes both `DATABASE_URL` and `DATABASE_URL_POOLING` to containers
- Lines 217-223 updated

### 4. Chrome DevTools MCP Server
- Added via: `claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest`
- Config saved to `/Users/jake/.claude.json`
- Chrome launched with: `--remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile`
- **Session restart needed** to pick up MCP tools

## Next Steps

1. **Verify Chrome DevTools MCP works** - After restart, test with `/mcp` command
2. **Test generation via browser** - Navigate to http://localhost:5013 and test a generation
3. **Update pipeline prompts** - Tell agent to use both DATABASE_URL and DATABASE_URL_POOLING in generated apps

## Key Files to Reference

| File | Purpose |
|------|---------|
| `server/lib/wsi/wsi-server.ts` | WSI Server implementation |
| `server/lib/wsi/container-manager.ts` | Docker container spawning |
| `server/lib/wsi/supabase-pool.ts` | Supabase credential pool manager |
| `.env.local` | Leo SaaS local dev config |
| `/Users/jake/dev/app-factory/docs/pipeline-prompt-v2.md` | Agent pipeline prompts |

## Running the Server

```bash
cd /Users/jake/dev/app-factory/apps/leo-saas/app
npm run dev
```

Server runs on http://localhost:5013 with WSI at ws://localhost:5013/wsi

## Chrome Debugging

If Chrome isn't running with debugging:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-debug-profile &
```

## Branch

Current branch: `jake/leo-remote-v2`
