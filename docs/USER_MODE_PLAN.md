# User Mode Plan - Leo SaaS Role-Based Experience

**Generated**: 2025-01-30
**Status**: Research & Planning (No Code Changes)

---

## 1. Goal Summary

Implement three user roles with differentiated experiences:

| Role | Console Shows | New App | Apps Visible |
|------|---------------|---------|--------------|
| **Dev** | Full logs (current) | Yes | Their own apps |
| **User+** | Friendly summaries | Yes | Their own apps |
| **User** | Friendly summaries | No | Only assigned apps |

---

## 2. Current State Analysis

### 2.1 User Data Model

**Location**: `leo-web/shared/schema.ts`

```typescript
// Existing role enum (line 14)
export const userRoleEnum = pgEnum('user_role', ['user', 'dev', 'admin']);

// Profiles table (line 48-69)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),           // Supabase Auth UUID
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull().default('user'),  // ← Current role field
  status: userStatusEnum('status').notNull().default('pending_approval'),
  // ... other fields
});
```

**Observation**: Current roles are `user`, `dev`, `admin`. We need to add `user_plus` (or repurpose existing `user` role).

### 2.2 Console Output Flow

```
leo-worker (Python)                  leo-web (Node.js)                Browser (React)

┌─────────────────┐                 ┌─────────────────┐              ┌─────────────────┐
│ LogStreamer     │                 │ WSI Server      │              │ ConsolePage.tsx │
│ log_streamer.py │   WebSocket    │ wsi-server.ts   │   WebSocket  │ useWsi.ts       │
│                 │ ─────────────> │                 │ ──────────>  │                 │
│ Captures Python │   log message  │ Routes message  │   log message│ messages[]      │
│ logging + stdout│   type: "log"  │ to browser      │   to hook    │                 │
└─────────────────┘                 └─────────────────┘              └────────┬────────┘
                                                                              │
                                                                              ▼
                                                                     ┌─────────────────┐
                                                                     │ REPLTerminal    │
                                                                     │ (xterm.js)      │
                                                                     │                 │
                                                                     │ formatWSIMessage│
                                                                     │ → ANSI colors   │
                                                                     └─────────────────┘
```

**Key Files**:
1. `leo-worker/src/runtime/wsi/log_streamer.py` - Captures Python logs, sends via WSI
2. `leo-worker/src/runtime/wsi/protocol.py` - `create_log_message()` function
3. `leo-web/server/lib/wsi/wsi-server.ts` - Routes messages to browser
4. `leo-web/client/src/hooks/useWsi.ts` - React hook receiving messages
5. `leo-web/client/src/components/terminal/REPLTerminal.tsx` - Renders in xterm.js

### 2.3 Process Monitor (Summarizer)

**Location**: `leo-worker/src/leo/monitor/`

The existing `HaikuAnalyzer` in `summarizer.py` already produces summaries:

```python
# summarizer.py line 27-52
ANALYZER_SYSTEM_PROMPT = """You are an agent trajectory analyzer...

Output JSON only with this structure:
{
  "summary": "2-3 sentences describing what the agent accomplished...",
  "trajectory": {
    "score": "EFFICIENT|GOOD|STRUGGLING|INEFFICIENT",
    "signals": ["signal 1", "signal 2"]
  }
}
"""
```

The `ProcessMonitorStreamer` in `streamer.py` sends `process_monitor` messages via WSI.

**Issue**: This is for trajectory analysis (every 60s), not for user-friendly status updates. We need a different approach for friendly mode.

### 2.4 Apps Page Data Fetching

**Location**: `leo-web/client/src/pages/AppsPage.tsx`

```typescript
// Line 57-83
const { data: generations } = useQuery({
  queryKey: ['generations'],
  queryFn: async () => {
    const response = await fetch('/api/generations', {
      credentials: 'include',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    return response.json() as Promise<GenerationRequestWithApp[]>;
  },
});
```

**Server-side** (line 487-506 of `generations.ts`):
```typescript
router.get('/api/generations', authMiddleware, async (req: Request, res: Response) => {
  const requests = await storage.getGenerationRequests(req.user.id);
  res.status(200).json(requests);
});
```

**Observation**: Currently queries by `user_id` only. Need to add "assigned apps" query for `user` role.

### 2.5 New App Button Locations

1. **AppsPage.tsx** (line 258-263):
   ```tsx
   <Link href="/console">
     <Button className="leo-btn-primary px-5 py-2.5 text-sm">
       <Plus className="h-4 w-4 mr-2" />
       New App
     </Button>
   </Link>
   ```

2. **AppLayout.tsx** (line 53-64) - Navigation "Console" link (goes to /console)

3. **HomePage.tsx** - Public landing page with "Start Building" button

---

## 3. Proposed Changes

### 3.1 Data Model Changes

**Add `user_plus` role to enum**:

```sql
-- Migration: Add user_plus role
ALTER TYPE user_role ADD VALUE 'user_plus' AFTER 'user';
```

**Schema change** (`shared/schema.ts`):
```typescript
export const userRoleEnum = pgEnum('user_role', ['user', 'user_plus', 'dev', 'admin']);
```

**Add app_assignments table** (for `user` role assigned apps):

```typescript
// New table: app_assignments
export const appAssignments = pgTable('app_assignments', {
  id: serial('id').primaryKey(),
  appId: integer('app_id').notNull().references(() => apps.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => profiles.id),  // Admin who assigned
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
}, (table) => ({
  appUserUnique: unique('app_assignments_app_user_unique').on(table.appId, table.userId),
  userIdIdx: index('app_assignments_user_id_idx').on(table.userId),
}));
```

### 3.2 Console Output Mode

**Option A: Server-Side Filtering (Recommended)**

Add a new message type `friendly_log` that leo-worker sends alongside regular logs:

```python
# New message type in protocol.py
def create_friendly_log_message(message: str, category: str) -> FriendlyLogMessage:
    """Create user-friendly log message for non-dev users."""
    return {
        "type": "friendly_log",
        "message": message,      # "Setting up your project..."
        "category": category,    # "setup" | "building" | "testing" | "deploying" | "done"
        "timestamp": datetime.now().isoformat() + "Z"
    }
```

**Leo-worker would emit both**:
- `log` messages (for dev mode)
- `friendly_log` messages (for user/user+ mode)

**Browser filters based on user role**:
```typescript
// In useWsi.ts or REPLTerminal.tsx
const messagesToShow = useMemo(() => {
  if (profile?.role === 'dev' || profile?.role === 'admin') {
    return messages.filter(m => m.type !== 'friendly_log');  // Show regular logs
  }
  return messages.filter(m => m.type === 'friendly_log');    // Show friendly only
}, [messages, profile?.role]);
```

**Option B: Client-Side Summarization**

Use the existing `process_monitor` messages to display summaries, but this has 60s latency.

**Recommendation**: Option A - emit friendly logs at key milestones.

### 3.3 Friendly Log Categories & Messages

**Categories** (sent from leo-worker at key points):

| Phase | Friendly Message | Technical Trigger |
|-------|------------------|-------------------|
| Setup | "Setting up your project..." | After `start_generation` received |
| Planning | "Planning your app architecture..." | When plan.md is being written |
| Schema | "Designing your database..." | Phase 2 starting |
| Building | "Building your features..." | Phases 3-7 |
| Testing | "Testing everything works..." | quality_assurer subagent |
| Deploying | "Deploying to production..." | Fly.io deployment |
| Done | "Your app is ready!" | `all_work_complete` |
| Error | "Encountered an issue, working on it..." | Non-fatal errors |

### 3.4 Apps Page Visibility

**Storage layer changes** (`leo-web/server/lib/storage/drizzle-storage.ts`):

```typescript
// New method: Get apps visible to a user based on role
async getVisibleApps(userId: string, userRole: string): Promise<App[]> {
  if (userRole === 'user') {
    // Only assigned apps
    return db
      .select({ app: apps })
      .from(apps)
      .innerJoin(appAssignments, eq(apps.id, appAssignments.appId))
      .where(eq(appAssignments.userId, userId));
  }
  // dev, user_plus, admin: own apps
  return db.select().from(apps).where(eq(apps.userId, userId));
}
```

**Route change** (`generations.ts`):
```typescript
router.get('/api/generations', authMiddleware, async (req: Request, res: Response) => {
  const profile = await storage.getProfileById(req.user.id);
  const requests = await storage.getGenerationRequests(req.user.id, profile?.role);
  res.status(200).json(requests);
});
```

### 3.5 New App Button Visibility

**In `AppsPage.tsx` and `AppLayout.tsx`**:

```tsx
// Import AuthContext to get profile
const { profile } = useAuth();

// Conditionally render based on role
{profile?.role !== 'user' && (
  <Link href="/console">
    <Button>New App</Button>
  </Link>
)}
```

**Note**: `user` role cannot create new apps, only view assigned ones.

---

## 4. Implementation Order

### Phase 1: Data Model (Day 1)
1. Add `user_plus` to `userRoleEnum` in `shared/schema.ts`
2. Create `app_assignments` table schema
3. Run migration: `npm run db:push`
4. Add storage methods for assignment CRUD

### Phase 2: Friendly Logs (Day 2-3)
1. Add `friendly_log` message type to WSI protocol (both Python and TypeScript)
2. Add friendly log emission points in `wsi/client.py`:
   - After `_handle_start_generation`
   - At major phase transitions
   - On `all_work_complete`
   - On recoverable errors
3. Update `useWsi.ts` to handle `friendly_log` messages
4. Create `FriendlyTerminal.tsx` component (simpler than xterm.js)
5. Update `ConsolePage.tsx` to switch between terminals based on role

### Phase 3: Apps Visibility (Day 4)
1. Add `getVisibleApps()` to storage layer
2. Update `/api/generations` route to use role-based filtering
3. Add `/api/apps/:id/assign` endpoint for admin assignment
4. Add `/api/apps/:id/unassign` endpoint
5. Update `AppsPage.tsx` to show assignment info for admins

### Phase 4: UI Gating (Day 5)
1. Hide "New App" button for `user` role in `AppsPage.tsx`
2. Hide "Console" nav item for `user` role in `AppLayout.tsx`
3. Redirect `/console` to `/apps` for `user` role
4. Add assignment UI in app detail page (admin only)

### Phase 5: Testing & Polish (Day 6)
1. E2E tests for each role
2. Role switching in settings (for testing)
3. Documentation updates

---

## 5. Open Questions

### Q1: Friendly Log Granularity
**Question**: How often should friendly logs appear? Every phase transition, or only major milestones?

**Recommendation**: Major milestones only (6-8 messages total per generation). Too frequent updates are noisy.

### Q2: User+ vs Dev Distinction
**Question**: Should User+ see any additional info beyond friendly logs? (e.g., iteration count, cost)

**Recommendation**: Yes, show iteration progress bar and cost, but not raw terminal output.

### Q3: Admin App Assignment UI
**Question**: Where should admins assign apps to users? A dedicated admin page, or inline on app detail?

**Options**:
- A) New `/admin/apps/:id/assign` page
- B) Modal in app detail page
- C) Bulk assignment page

**Recommendation**: B) Modal in app detail page - keeps it simple.

### Q4: Existing Users
**Question**: What happens to existing `user` role accounts?

**Options**:
- A) Migrate all `user` → `user_plus` (breaking change for future)
- B) Migrate all `user` → `user_plus`, then use `user` for restricted role
- C) Keep existing behavior, new role is just `viewer` (different name)

**Recommendation**: B) - Migrate existing users to `user_plus`, use `user` for the new restricted role.

### Q5: App Resume for Assigned Users
**Question**: Should `user` role be able to resume/modify assigned apps, or only view?

**Options**:
- A) View only (read-only access)
- B) Can resume with modifications
- C) Can resume but limited iterations (cost control)

**Recommendation**: A) View only initially. Add resume capability later if needed.

---

## 6. File Reference Summary

| Area | Key Files |
|------|-----------|
| Schema | `leo-web/shared/schema.ts` |
| WSI Protocol | `leo-worker/src/runtime/wsi/protocol.py`, `leo-web/server/lib/wsi/wsi-server.ts` |
| Log Streaming | `leo-worker/src/runtime/wsi/log_streamer.py` |
| Console UI | `leo-web/client/src/pages/ConsolePage.tsx` |
| Terminal | `leo-web/client/src/components/terminal/REPLTerminal.tsx` |
| WSI Hook | `leo-web/client/src/hooks/useWsi.ts` |
| Apps Page | `leo-web/client/src/pages/AppsPage.tsx` |
| Navigation | `leo-web/client/src/components/layout/AppLayout.tsx` |
| Storage | `leo-web/server/lib/storage/drizzle-storage.ts` |
| Routes | `leo-web/server/routes/generations.ts`, `leo-web/server/routes/apps.ts` |
| Auth Context | `leo-web/client/src/contexts/AuthContext.tsx` |

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Friendly log timing off | Medium | Add configurable phases in config file |
| Migration breaks existing users | High | Add migration script that preserves `user_plus` behavior |
| Assignment table not synced with app deletion | Low | FK constraint with `ON DELETE CASCADE` |
| Role check bypass | High | Add role check in both frontend AND backend |
| xterm.js performance for friendly mode | Low | Use simple DOM-based component instead |

---

## 8. Success Criteria

1. **Dev role**: Full terminal output, identical to current behavior
2. **User+ role**: Friendly logs only, can create apps, sees own apps
3. **User role**: Friendly logs only, cannot create apps, sees only assigned apps
4. **Admin**: Can assign apps to users, sees all roles' perspectives
5. **No regression**: Existing dev users experience no change
