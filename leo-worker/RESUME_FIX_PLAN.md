# Resume App Fix Plan

**Date:** 2024-12-17
**Status:** Code Complete - Migration Pending

## Problem

When resuming an app generation:
1. A new `generation_requests` record is created with `github_url: null`
2. The container tries to push to a repo that doesn't exist
3. WebSocket handler incorrectly creates DB records (violates separation of concerns)

## Root Cause

1. **REST API** doesn't accept `githubUrl` in create schema
2. **WebSocket handler** creates new DB records instead of just relaying to container
3. **Dropdown** doesn't include `deployment_url` needed for resume

## Architecture Principles

| Layer | Responsibility |
|-------|---------------|
| **REST API** | All DB reads/writes (CRUD) |
| **WebSocket** | Real-time relay only - browser <-> container, NO DB operations |
| **Container/Orchestrator** | Manages container lifecycle, receives commands via WebSocket |

## Schema Changes

### DROP Columns
- `download_url` - S3 not used, GitHub is source of truth
- `conversation` - Always null, logs stream via WebSocket
- `artifacts_github_url` - Can be derived as `${github_url}-artifacts`

### ADD Columns
- `generation_type`: enum `'new' | 'resume'`

### KEEP & FIX
- `deployment_url` - Must be populated from container's `flyio_url` on completion

## Data Flow

### New App Generation
```
Frontend -> REST API creates record:
  - app_id: NEW UUID (auto-generated)
  - generation_type: 'new'
  - github_url: null (populated on completion)
  - deployment_url: null (populated on completion)

Frontend -> WebSocket sends start_generation with request_id
WebSocket -> Relays to container (NO DB operations)
Container -> Completes, sends all_work_complete with github_url, flyio_url
WebSocket -> Updates DB with github_url, deployment_url
```

### Resume App Generation
```
Frontend -> User selects app from dropdown (has appId, githubUrl, deploymentUrl)
Frontend -> REST API creates record:
  - app_id: SAME as original (from dropdown)
  - generation_type: 'resume'
  - github_url: COPIED from original
  - deployment_url: COPIED from original

Frontend -> WebSocket sends start_generation with request_id
WebSocket -> Relays to container (NO DB operations)
Container -> Clones from github_url, continues work
```

## Implementation Steps

### 1. Schema Changes
**Files:** `apps/leo-saas/app/shared/schema.ts`, `apps/leo-saas/app/shared/schema.zod.ts`

- Add `generationType` enum: `'new' | 'resume'`
- Add `generationType` column to `generationRequests`
- Remove `downloadUrl`, `conversation`, `artifactsGithubUrl` columns
- Update `createGenerationRequestSchema` to accept: `appId?`, `githubUrl?`, `deploymentUrl?`, `generationType`

### 2. Update Dropdown API
**File:** `apps/leo-saas/app/server/lib/storage/database-storage.ts`

- Add `deploymentUrl` to `getUserApps()` query result

### 3. Update Apps Contract
**File:** `apps/leo-saas/app/shared/contracts/apps.contract.ts`

- Add `deploymentUrl` to `userAppSummarySchema`

### 4. Update Frontend
**File:** `apps/leo-saas/app/client/src/pages/ConsolePage.tsx`

- Pass all copied fields to REST API for resume:
  - `appId` (same as original)
  - `githubUrl` (copied)
  - `deploymentUrl` (copied)
  - `generationType: 'resume'`

### 5. Fix WebSocket Handler
**File:** `apps/leo-saas/app/server/lib/websocket-server.ts`

- Remove `storage.createGenerationRequest()` call from `start_generation` case
- Just use the `request_id` from the message to relay to orchestrator

### 6. Verify Completion Handler
**File:** `apps/leo-saas/app/server/lib/websocket-server.ts`

- Ensure `deployment_url` is saved from container's `flyio_url` on `all_work_complete`

### 7. Generate Migration
```bash
cd apps/leo-saas/app
npx drizzle-kit generate
```

### 8. Apply Migration
```bash
LEO_DATABASE_URL="..." npx drizzle-kit migrate
```

## Testing

1. Create new app - verify `generation_type: 'new'`, fields populated on completion
2. Resume app - verify `generation_type: 'resume'`, `app_id`/`github_url`/`deployment_url` copied
3. Verify dropped columns don't cause errors
4. Verify container receives correct `github_url` for resume and clones successfully

## Rollback

If issues arise:
```sql
ALTER TABLE "generation_requests" ADD COLUMN "download_url" TEXT;
ALTER TABLE "generation_requests" ADD COLUMN "conversation" JSONB;
ALTER TABLE "generation_requests" ADD COLUMN "artifacts_github_url" TEXT;
ALTER TABLE "generation_requests" DROP COLUMN "generation_type";
```
