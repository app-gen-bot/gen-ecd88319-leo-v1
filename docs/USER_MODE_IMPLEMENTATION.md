# User Mode Implementation

This document details the implementation of user roles for Leo SaaS, enabling different experiences for developer and non-developer users.

## Overview

Three distinct user experiences are now supported:

| Role | Console View | App Creation | App Visibility |
|------|-------------|--------------|----------------|
| `user` | Friendly logs only | ❌ No | Only assigned apps |
| `user_plus` | Friendly logs only | ✅ Yes | Own apps |
| `dev` | Full terminal logs | ✅ Yes | Own apps |
| `admin` | Full terminal logs | ✅ Yes | All apps + can assign |

## Files Changed

### Leo Worker (Python)

| File | Change |
|------|--------|
| `leo-worker/src/runtime/wsi/protocol.py` | Added `FriendlyLogMessage` type and `create_friendly_log_message()` factory |
| `leo-worker/src/runtime/wsi/client.py` | Added friendly log messages at key lifecycle points (startup, iteration, deploy, complete) |
| `leo-worker/src/leo/monitor/summarizer.py` | Added `FriendlySummarizer` class for user-friendly status messages |
| `leo-worker/src/leo/monitor/streamer.py` | Emits both `process_monitor` (devs) and `friendly_log` (users) messages |
| `leo-worker/src/leo/monitor/__init__.py` | Exported new `FriendlySummarizer` and `FriendlyUpdate` types |

### Leo Web (Node.js/React)

| File | Change |
|------|--------|
| `leo-web/shared/schema.ts` | Added `user_plus` to `userRoleEnum`, added `appAssignments` table |
| `leo-web/shared/schema.zod.ts` | Added `user_plus` to role enum, added `AppAssignment` schema and types |
| `leo-web/server/lib/storage/factory.ts` | Added app assignment operations to `IStorage` interface |
| `leo-web/server/lib/storage/database-storage.ts` | Implemented app assignment CRUD and role-based filtering |
| `leo-web/server/routes/generations.ts` | Updated GET /api/generations to use role-based filtering |
| `leo-web/server/routes/assignments.ts` | **NEW** - CRUD endpoints for app assignments |
| `leo-web/server/middleware/auth.ts` | Now fetches user role from profiles table (not just user_metadata) |
| `leo-web/server/index.ts` | Registered assignments routes |
| `leo-web/client/src/lib/wsi-client.ts` | Added `FriendlyLogMessage` type and event |
| `leo-web/client/src/hooks/useWsi.ts` | Added `friendlyLogs` state, `filterMessagesByRole()` helper |
| `leo-web/client/src/pages/AppsPage.tsx` | Hide "New App" button for `user` role |
| `leo-web/client/src/components/layout/AppLayout.tsx` | Hide Console nav link for `user` role |

### Database Migration

| File | Change |
|------|--------|
| `leo-web/drizzle/0017_add_user_mode_roles.sql` | Adds `user_plus` to enum, migrates existing users, creates `app_assignments` table |

## Migration Guide

### 1. Run the Database Migration

```bash
cd leo-web
npm run db:migrate
```

This will:
1. Add `user_plus` value to `user_role` enum
2. Migrate all existing `user` role users to `user_plus` (preserving current behavior)
3. Create the `app_assignments` table with RLS policies

### 2. Deploy Leo Worker

Build and deploy the updated leo-worker container with the new friendly log functionality.

### 3. Deploy Leo Web

Build and deploy the updated leo-web with:
- Updated frontend (UI gating)
- Updated backend (role-based filtering, assignment endpoints)

## API Documentation

### App Assignments

#### List My Assignments
```
GET /api/assignments
Authorization: Bearer <token>

Response: AppAssignment[]
```

#### List Users Assigned to App
```
GET /api/apps/:appId/assignments
Authorization: Bearer <token>
Required Role: admin, dev

Response: AppAssignment[]
```

#### Assign User to App
```
POST /api/apps/:appId/assignments
Authorization: Bearer <token>
Required Role: admin, dev

Body:
{
  "userId": "uuid",
  "canResume": false  // optional, default false
}

Response: AppAssignment
```

#### Update Assignment
```
PATCH /api/apps/:appId/assignments/:userId
Authorization: Bearer <token>
Required Role: admin, dev

Body:
{
  "canResume": true  // optional
}

Response: AppAssignment
```

#### Remove Assignment
```
DELETE /api/apps/:appId/assignments/:userId
Authorization: Bearer <token>
Required Role: admin, dev

Response: 204 No Content
```

## WSI Protocol Changes

### New Message Type: `friendly_log`

Sent at key generation phases for non-developer users.

```typescript
interface FriendlyLogMessage {
  type: "friendly_log";
  message: string;    // User-friendly message
  category: string;   // "setup" | "planning" | "building" | "testing" | "deploying" | "done" | "working"
  timestamp: string;  // ISO timestamp
  generation_id?: string;
  request_id?: number;
}
```

### Message Categories

| Category | Example Messages |
|----------|-----------------|
| `setup` | "Getting everything ready for your app..." |
| `planning` | "Designing your app's structure..." |
| `building` | "Building your features..." |
| `testing` | "Making sure everything works correctly..." |
| `deploying` | "Saving your app to the cloud..." |
| `done` | "Your app is ready!" |
| `working` | "Making progress on your app..." |

### Console Filtering

The `filterMessagesByRole()` function in `useWsi.ts` filters messages based on user role:

- **Dev/Admin**: See all messages (full terminal output)
- **User/User+**: See only friendly_log messages + essential messages (ready, all_work_complete, error, iteration_complete, progress)

## Testing

### Manual Testing Checklist

1. **User Role**
   - [ ] Cannot see Console nav link
   - [ ] Cannot see "New App" button
   - [ ] Only sees assigned apps on Apps page
   - [ ] Console shows friendly logs (not terminal output)

2. **User+ Role**
   - [ ] Can see "New App" button
   - [ ] Can see Console nav link
   - [ ] Sees own apps on Apps page
   - [ ] Console shows friendly logs

3. **Dev Role**
   - [ ] Can see all navigation
   - [ ] Sees own apps on Apps page
   - [ ] Console shows full terminal output
   - [ ] Can assign apps to users

4. **Admin Role**
   - [ ] Full access to all features
   - [ ] Can assign any app to any user
   - [ ] Can see all apps (if desired)

### Database Verification

```sql
-- Check role distribution
SELECT role, COUNT(*) FROM profiles GROUP BY role;

-- Check app assignments
SELECT a.app_name, p.email, aa.can_resume
FROM app_assignments aa
JOIN apps a ON a.id = aa.app_id
JOIN profiles p ON p.id = aa.user_id;
```

## Rollback

To rollback this change:

1. Revert the database migration manually:
```sql
-- WARNING: This will affect users with 'user_plus' role
UPDATE profiles SET role = 'user' WHERE role = 'user_plus';
DROP TABLE app_assignments;
```

2. Deploy previous versions of leo-worker and leo-web

## Architecture Notes

### Why `user_plus` Instead of Modifying `user`?

Adding a new role (`user_plus`) instead of changing the behavior of `user` provides:

1. **Backward Compatibility**: Existing users are migrated to `user_plus`, preserving their current experience
2. **Clear Intent**: `user` role is explicitly for restricted users who can only see assigned apps
3. **Future Flexibility**: Additional roles can be added without breaking existing users

### Friendly Log Generation

The `FriendlySummarizer` uses GPT-4o-mini to generate user-friendly summaries from agent activity. It:
- Costs ~$0.001 per summary
- Falls back to rule-based summaries if API is unavailable
- Never includes technical jargon or AI/model references

### Role Lookup Caching

The auth middleware caches profile roles for 2 minutes to avoid excessive database queries. This means role changes may take up to 2 minutes to take effect.
