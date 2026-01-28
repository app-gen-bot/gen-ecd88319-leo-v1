# Leo Implementation - Start Here

**Date**: 2025-11-10
**Status**: P0 fixes complete, ready for feature implementation

---

## Implementation Order (User Prioritized)

### Priority 1: App Name Input Field (30-60 min) ⭐ START HERE
**File**: `/home/ec2-user/leo-saas/jake/USER_ISSUES_REFINED.md` (lines 70-99)

**What to Build**:
- Add input field to console page between header and user prompt
- Validate: max 30 chars, lowercase + numbers + hyphens only
- Pattern: `/^[a-z0-9-]+$/`
- Optional field (defaults to prompt-derived name if empty)
- Pass to Leo container via WSI protocol

**Example Validation**:
```typescript
const maxLength = 30;
const pattern = /^[a-z0-9-]+$/;

if (appName.length > maxLength) {
  error = "App name must be 30 characters or less";
}
if (!pattern.test(appName)) {
  error = "Use lowercase letters, numbers, and hyphens only";
}
```

**Good Names**:
- ✅ "task-manager" (12 chars)
- ✅ "ai-chess-trainer" (16 chars)
- ❌ "lets-build-an-ai-based-trainer" (31 chars - too long)

---

### Priority 2: Deploy-to-Fly.io (3-5 hours) ⭐ MAJOR FEATURE
**File**: `/home/ec2-user/leo-saas/jake/USER_ISSUES_REFINED.md` (lines 144-269)
**Reference**: `/home/ec2-user/leo-saas/examples/saas-implementation.tar.gz`

**What to Build**:
1. Deploy button in DashboardPage (shows for completed gens with GitHub URL)
2. DeployModal component with progress tracking
3. POST /api/generations/:id/deploy endpoint
4. fly-deployment-manager.ts (core deployment logic)
5. templates/fly-toml.ts (config generation)
6. Update github-manager.ts to add fly.toml to repos

**Study V1 Implementation**:
```bash
cd /home/ec2-user/leo-saas/examples
tar -xzf saas-implementation.tar.gz
cd saas

# Study these 6 files:
cat app/server/lib/fly-deployment-manager.ts  # CORE
cat app/server/lib/github-manager.ts          # Adds fly.toml
cat app/server/routes/generations.ts          # API endpoint
cat app/server/lib/templates/fly-toml.ts      # Config
cat app/client/src/pages/DashboardPage.tsx    # Deploy button
cat app/client/src/components/DeployModal.tsx # UI
```

**Deployment Flow**:
```
Deploy button → DeployModal → POST /api/generations/:id/deploy
→ flyDeploymentManager.deployApp():
  1. Clone GitHub repo
  2. flyctl apps create <name>
  3. flyctl deploy --app <name> --now
  4. Extract URL from output
  5. Clean up temp dir
→ Update generation.deploymentUrl
→ Show "Your app is live!" + URL
```

**Environment Needed**:
- `FLY_API_TOKEN` environment variable
- `flyctl` CLI in orchestrator container

---

### Priority 3: Console State Loss (1-2 hours)
**File**: `/home/ec2-user/leo-saas/jake/USER_ISSUES_REFINED.md` (lines 11-37)

**What to Build**:
- Save console state on navigation/refresh
- URL params: `/console?generation=abc123` OR localStorage
- Restore state when returning to console
- Add "View in Console" button on Apps page
- Reconnect to WebSocket if generation still running

**Questions to Answer**:
- URL params or localStorage? (Recommend URL params for shareability)
- Load full logs from beginning or just current state?
- Auto-prompt to resume incomplete generations?

---

### Priority 4: Cancel Generation (1-2 hours)
**File**: `/home/ec2-user/leo-saas/jake/USER_ISSUES_REFINED.md` (lines 40-67)

**What to Build**:
- "Cancel" button in console UI (shows during generation)
- WebSocket message to Leo container to stop
- Container cleanup (kill process gracefully)
- Update generation status to "cancelled"
- Clean up resources (temp directories, etc.)

**Questions to Answer**:
- Immediate kill or graceful shutdown?
- Keep partial artifacts or delete?
- Separate "Cancel" vs "Pause" buttons?

---

### Priority 5: App Name Truncation - SKIP ✅
**Reason**: Resolved by Priority 1 (app name input with 30 char limit)
- No truncation logic needed
- Short names solve the GitHub issue
- Input validation prevents long names

---

## Implementation Rules

### Git Workflow
1. **One fix = One commit** (for easy rollback)
2. **Commit message format**: `feat: <description>` or `fix: <description>`
3. **Test before committing**: Verify each fix works
4. **Push after each commit**: `git push origin ec2`

### Branch
- Work in: `ec2` branch (both leo-saas and leo-container repos)

### Testing
- P0 fixes are DONE: git (`587498c`) + skills (`e72a0a3`)
- New image: `leo-container:e72a0a3` has both fixes
- Safe to test on EC2 or locally

---

## Getting Started

### Read These Files:
1. `USER_ISSUES_REFINED.md` - Complete issue details
2. `examples/README.md` (leo-saas) - Deploy-to-fly study guide
3. `EXAMPLES_AND_ISSUES_READY.md` - Context and setup

### Start Command:
```bash
cd /home/ec2-user/leo-saas

# Read the issues:
cat jake/USER_ISSUES_REFINED.md

# Start with Priority 1 (App Name Input Field)
# Add input field to console UI
# Max 30 chars, pattern: ^[a-z0-9-]+$
```

---

## Expected Timeline

- **Priority 1** (App name input): 30-60 minutes
- **Priority 2** (Deploy-to-fly): 3-5 hours (study + implement)
- **Priority 3** (Console state): 1-2 hours
- **Priority 4** (Cancel generation): 1-2 hours

**Total**: 6-10 hours of implementation

---

## Success Criteria

✅ **Priority 1**: Users can specify short app names (max 30 chars)
✅ **Priority 2**: Users can click "Deploy" and get a live Fly.io URL
✅ **Priority 3**: Console state persists across refresh/navigation
✅ **Priority 4**: Users can cancel running generations

---

**Ready to start! Begin with Priority 1 (App Name Input Field)**
