# Schema Cleanup Plan: generation_requests Table

**Date:** 2024-12-17
**Status:** Planned

## Overview

Clean up the `generation_requests` table to remove unused columns and properly populate existing ones.

## Column Analysis

| Column | Current Status | Action |
|--------|---------------|--------|
| `download_url` | Being populated but redundant | **DROP** - GitHub is single source of truth |
| `artifacts_github_url` | Never populated | **KEEP** - Auto-derive from `github_url + '-artifacts'` |
| `deployment_url` | Only populated by manual deploy endpoint | **KEEP** - Populate from container's `flyio_url` |
| `conversation` (jsonb) | Always null | **DROP** - Real-time logs stream via WebSocket |

## Implementation Plan

### Phase 1: Container Protocol Changes

**File:** `remote/container/leo_container/wsi_server/protocol.py`

1. Add `flyio_url` field to `AllWorkCompleteMessage`:
   ```python
   class AllWorkCompleteMessage(WSIMessage):
       # ... existing fields ...
       flyio_url: Optional[str] = None  # Detected from fly.toml
   ```

2. Update `create_all_work_complete_message()`:
   ```python
   def create_all_work_complete_message(
       completion_reason: str,
       app_path: str,
       total_iterations: int,
       session_id: Optional[str] = None,
       total_duration: Optional[int] = None,
       github_url: Optional[str] = None,
       s3_url: Optional[str] = None,
       flyio_url: Optional[str] = None,  # Add this
   ) -> AllWorkCompleteMessage:
   ```

### Phase 2: Container Client Changes

**File:** `remote/container/leo_container/wsi_client/client.py`

In `_finish_generation()`, pass detected flyio_url:
```python
# Around line 1189
complete_msg = create_all_work_complete_message(
    completion_reason=completion_reason,
    app_path=app_path,
    total_iterations=self.iteration_state["current_iteration"],
    session_id=self.agent.current_session_id,
    total_duration=self.iteration_state["total_duration"],
    github_url=github_url,
    flyio_url=artifacts.flyio_url if artifacts else None,  # Add this
)
```

### Phase 3: SaaS WSI Server Changes

**File:** `apps/leo-saas/app/server/lib/wsi/wsi-server.ts`

Update `handleAllWorkComplete()`:
```typescript
private async handleAllWorkComplete(msg: AllWorkCompleteMessage): Promise<void> {
  if (!this.currentRequestId) return;

  // Derive artifacts URL from github_url
  const artifactsGithubUrl = msg.github_url
    ? msg.github_url.replace(/\/$/, '') + '-artifacts'
    : null;

  try {
    await storage.updateGenerationRequest(this.currentRequestId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      githubUrl: msg.github_url,
      artifactsGithubUrl: artifactsGithubUrl,  // Derived
      deploymentUrl: msg.flyio_url,             // From container
      lastSessionId: msg.session_id,
    });
    // ... logging
  } catch (error) {
    // ... error handling
  }
}
```

### Phase 4: Schema Changes

**Files to update:**
- `apps/leo-saas/app/shared/schema.ts`
- `apps/leo-saas/app/shared/schema.zod.ts`

1. Remove from schema.ts:
   - `downloadUrl` column
   - `conversation` column

2. Remove from schema.zod.ts:
   - `conversationTurnSchema`
   - `conversation` field from all generation request schemas

3. Generate migration:
   ```bash
   npx drizzle-kit generate
   ```

4. The migration SQL will be:
   ```sql
   ALTER TABLE "generation_requests" DROP COLUMN "download_url";
   ALTER TABLE "generation_requests" DROP COLUMN "conversation";
   ```

5. Apply migration:
   ```bash
   LEO_DATABASE_URL="..." npx drizzle-kit migrate
   ```

### Phase 5: Code Cleanup

Remove references to dropped columns:
- `server/lib/storage/database-storage.ts` - Remove conversation parsing code
- `server/routes/generations.ts` - Remove `conversation: null` from create
- `client/src/lib/wsi-client.ts` - Remove `download_url` from types (if used)
- `server/lib/wsi/wsi-server.ts` - Remove `downloadUrl` from completion handler

## Testing

1. Run generation end-to-end
2. Verify `github_url` is populated
3. Verify `artifacts_github_url` is derived correctly
4. Verify `deployment_url` is populated from container (if fly.toml exists)
5. Verify dropped columns don't cause errors

## Rollback

If issues arise:
```sql
ALTER TABLE "generation_requests" ADD COLUMN "download_url" TEXT;
ALTER TABLE "generation_requests" ADD COLUMN "conversation" JSONB;
```
