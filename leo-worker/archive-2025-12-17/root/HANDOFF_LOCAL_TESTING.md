# Local Testing Handoff - P0 Git Fix Verification

**Date**: 2025-11-10
**Status**: Ready for local testing
**Context**: EC2 investigation complete, one fix applied, ready for local verification

---

## Executive Summary

**P0 Issues Fixed**: Both critical blockers resolved
1. **Git fix**: `leo-container:587498c` - Added git to Dockerfile
2. **Skills fix**: `leo-container:e72a0a3` - Added .claude directory to image

**Status**: Both fixes committed, images built, ready for local testing
**Next Step**: Test locally to verify both fixes work

**Why Local Testing**: EC2 TEST environment revealed frontend connects to PROD backend (port mismatch). Local testing avoids production conflicts.

---

## Background Context - What Happened on EC2

### 1. P0 Issues Identified

Two critical issues blocking all app generations:

**A. Git Not Found (FIXED)**
- **Error**: `[Errno 2] No such file or directory: 'git'`
- **Root Cause**: Dockerfile missing `git` in apt-get install (line 29)
- **Fix Applied**: Added `git` to `/home/ec2-user/leo-container/Dockerfile`
- **Commit**: `587498c`
- **Verification**: `docker run --rm leo-container:587498c git --version` → `git version 2.47.3` ✅

**B. Skills Not Found (FIXED)**
- **Error**: `.claude/skills/` directory not available in container
- **Root Cause**: Dockerfile doesn't copy `.claude/` directory into image
- **Fix Applied**: Added `COPY .claude/ ./.claude/` to Dockerfile
- **Commit**: `e72a0a3`
- **Verification**: `docker run --rm leo-container:e72a0a3 ls /app/.claude/skills/` shows all skills ✅

### 2. What Was Attempted on EC2

**TEST Environment Created**:
- Location: `/home/ec2-user/TEST/leo-saas-test`
- Port: 5015 (to avoid PROD ports 5013-5014)
- Manager.ts modified to use `leo-container:587498c`
- .env created with PORT=5015

**Why It Didn't Work**:
- Frontend (vite) started on port 5015 ✅
- Backend (Express) did NOT start ❌
- Frontend connected to PROD backend on port 5013 (wrong!)
- No containers spawned with new `587498c` image

**Lesson Learned**: Local testing is cleaner - no port conflicts, full control over both frontend/backend.

---

## Your Mission - Local Testing

### Objective

Verify that the git fix (`587498c`) works correctly:
1. Build new container image locally
2. Update leo-saas to use new image
3. Start a generation
4. Verify git commands execute without errors

### Prerequisites

1. **Pull Latest Code**:
   ```bash
   # Leo-container repo (has git fix)
   cd ~/path/to/leo-container
   git pull origin ec2

   # Leo-saas repo (has documentation)
   cd ~/path/to/leo-saas
   git pull origin ec2
   ```

2. **Verify Git Fix in Dockerfile**:
   ```bash
   cd ~/path/to/leo-container
   grep "apt-get install" Dockerfile
   # Should see: apt-get install -y curl git && \
   #                                      ^^^^
   ```

### Step-by-Step Testing

#### Phase 1: Build New Image

```bash
cd ~/path/to/leo-container
docker build -t leo-container:587498c .

# Verify git installed
docker run --rm leo-container:587498c git --version
# Expected: git version 2.47.3
```

#### Phase 2: Update Leo-SaaS to Use New Image

**File**: `app/server/docker/manager.ts`

**Current (line 115)**:
```typescript
this.IMAGE_NAME = 'leo-container:4ecc845'; // OLD - no git, no skills
```

**Change to**:
```typescript
this.IMAGE_NAME = 'leo-container:e72a0a3'; // NEW - with BOTH fixes (git + skills)
```

**Note**: Image `e72a0a3` includes BOTH fixes:
- Git installed (from `587498c`)
- Skills directory included (from `e72a0a3`)

#### Phase 3: Start Leo-SaaS Locally

```bash
cd ~/path/to/leo-saas/app
npm run dev
# Should start on http://localhost:5013 (or your configured port)
```

#### Phase 4: Run Test Generation

1. Open browser: `http://localhost:5013` (or your port)
2. Start a simple generation: "Build a hello world app"
3. Monitor backend logs for git commands and skills usage

**✅ Success Indicators - Git Fix**:
```bash
# In backend logs, you should see:
[Container] Executing: git init
[Container] Initialized empty Git repository in /workspace/app/...
[Container] Executing: git add .
[Container] Executing: git commit -m "Initial commit"
[Container] [main (root-commit) abc1234] Initial commit
```

**✅ Success Indicators - Skills Fix**:
```bash
# In backend logs, you should see skills being used:
[Container] Loading skill: drizzle-orm-setup
[Container] Skill path: /app/.claude/skills/drizzle-orm-setup
# Or similar messages indicating skills are accessible
```

**❌ Failure Indicators**:
```bash
# Should NOT see:
[Errno 2] No such file or directory: 'git'
# Should NOT see:
Skills directory not found: .claude/skills/
```

#### Phase 5: Verify Generated App

```bash
cd ~/path/to/generated-app
ls -la
# Should see .git/ directory
git log
# Should see commit history
```

---

## What to Do After Testing

### If Both Fixes Work ✅

1. **Commit the manager.ts change**:
   ```bash
   cd ~/path/to/leo-saas
   git add app/server/docker/manager.ts
   git commit -m "feat: Update to leo-container:e72a0a3 (both P0 fixes verified)"
   git push origin ec2
   ```

2. **Deploy to Production** (if comfortable):
   - The fixes are already built into `leo-container:e72a0a3`
   - Simply update manager.ts on EC2 production to use `e72a0a3`
   - Restart the orchestrator container
   - Test with a simple generation

### If Git Fix Doesn't Work ❌

1. **Check Docker logs**:
   ```bash
   docker logs <container-id>
   ```

2. **Verify git installation**:
   ```bash
   docker run --rm -it leo-container:587498c bash
   which git
   git --version
   ```

3. **Document the issue** and report back

---

## Key Files to Reference

### Documentation (in leo-saas repo, jake/ directory)

1. **USER_ISSUES_REFINED.md** - Root cause analysis for both P0 issues
2. **P0_ISSUES_INVESTIGATION_REPORT.md** - Detailed investigation timeline
3. **CONTEXT_REHYDRATION.md** - Full context dump (if you need more background)
4. **TEST_PORT_5014.md** or **TEST_SETUP_SUMMARY.md** - EC2 TEST attempt (reference only)

### Code Files

1. **leo-container/Dockerfile** - Git fix applied (line 29)
2. **leo-saas/app/server/docker/manager.ts** - Image configuration (line 115)
3. **leo-saas/app/.env** - Port configuration

---

## Important Reminders

### One Fix at a Time

**Why**: Each fix needs its own commit for rollback capability
- ✅ Git fix: Committed as `587498c`
- ⏳ Skills fix: Waiting for git verification
- 🚫 Don't combine fixes: If one breaks, can't isolate which one

### No Runtime Mounts for Fargate

**WRONG Approach** (was attempted, then reverted):
```typescript
Binds: ['/host/.claude:/app/.claude:ro']  // ❌ Won't work on Fargate
```

**CORRECT Approach**:
```dockerfile
COPY apps/.claude/ ./.claude/  # ✅ Bake into image
```

**Why**: Containers run on Fargate (cloud) - must be independent of host filesystem.

### Container Image Tagging

- Use **commit hashes** as image tags: `leo-container:587498c`
- **Never** use `:latest` for production testing
- This allows precise rollback if needed

---

## Summary for Quick Start

```bash
# 1. Pull latest code (both repos updated with both fixes)
cd ~/leo-container && git pull origin ec2
cd ~/leo-saas && git pull origin ec2

# 2. Build new image with BOTH fixes
cd ~/leo-container
docker build -t leo-container:e72a0a3 .

# 3. Verify both fixes in image
docker run --rm leo-container:e72a0a3 git --version
docker run --rm leo-container:e72a0a3 ls /app/.claude/skills/

# 4. Update manager.ts to use e72a0a3

# 5. Start leo-saas
cd ~/leo-saas/app && npm run dev

# 6. Test generation and check logs for BOTH git commands AND skills usage

# 7. If successful, commit manager.ts change and optionally deploy to EC2 production
```

---

## Questions to Answer During Testing

1. ✅ Does `git --version` work in the container?
2. ✅ Do git commands execute during generation without errors?
3. ✅ Is the generated app a valid git repository?
4. ✅ Are skills accessible at `/app/.claude/skills/`?
5. ✅ Do Claude Code skills load during generation?
6. ✅ Are there any new errors or warnings in logs?

---

## Contact/Handoff Notes

- EC2 PROD environment (ports 5013-5014) remains UNTOUCHED
- All changes are committed and pushed to `ec2` branch
- **BOTH fixes are committed**: Git (`587498c`) and Skills (`e72a0a3`)
- **BOTH images built**: Ready for testing
- Local testing avoids EC2 port conflicts and production risk

**Timeline**:
- 2025-11-10: P0 investigation completed
- 2025-11-10: Git fix committed (`587498c`)
- 2025-11-10: Skills fix committed (`e72a0a3`)
- **Both fixes ready for local testing**

**After successful local verification**, update manager.ts and optionally deploy to EC2 production.

---

**Prepared by**: Claude (EC2 investigation session)
**Ready for**: Local AI testing
**Next Session Goal**: Verify BOTH fixes work, then deploy to production
