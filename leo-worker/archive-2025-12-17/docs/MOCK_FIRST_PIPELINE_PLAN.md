# Mock-First Development Pipeline Plan

**Date**: 2025-11-22
**Status**: PROPOSAL
**Priority**: P0 - Architectural change

---

## TL;DR

**Problem**: Supabase setup happens too early (Stage 2.2.1), before app is validated
**Solution**: Develop with mock auth + in-memory storage, validate, THEN migrate to Supabase
**Impact**: Faster iteration, local testing, no wasted Supabase projects for broken apps

---

## Current Pipeline Order (BROKEN)

```
Stage 1: Plan Generation
  └─> Creates plan/plan.md

Stage 2.1: Schema Design
  └─> Invokes schema-designer skill
  └─> Creates schema.zod.ts, schema.ts

Stage 2.2: API Contracts
  └─> Invokes api-architect skill
  └─> Creates shared/contracts/*.contract.ts

Stage 2.2.1: Supabase Setup ← TOO EARLY! 🔴
  └─> Invokes supabase-project-setup skill
  └─> Creates Supabase project
  └─> Pushes schema migration
  └─> Generates .env files

Stage 2.2.2: Database Client Setup
  └─> Invokes drizzle-orm-setup skill
  └─> Creates server/lib/db.ts

Stage 2.3: Backend Implementation
  └─> Creates auth adapters (mock + Supabase)
  └─> Creates storage adapters (memory + Supabase)
  └─> Creates routes

Stage 2.4: UI Design System
  └─> Invokes ui-designer skill
  └─> Creates index.css, tailwind.config.ts

Stage 2.5: Frontend Implementation
  └─> Creates pages, components

Stage 2.6: Quality Assurance
  └─> Invokes quality_assurer subagent
  └─> Validates code, tests functionality

Stage 2.7: Chrome DevTools Testing
  └─> Tests in browser
  └─> Verifies visual rendering
```

**Problem**: Supabase project created before:
- ❌ Backend code written
- ❌ Frontend implemented
- ❌ Application tested
- ❌ Validation passed

**Result**: If app has issues, we've wasted time creating Supabase infrastructure

---

## Proposed Pipeline Order (MOCK-FIRST)

```
Stage 1: Plan Generation
  └─> Creates plan/plan.md

Stage 2.1: Schema Design
  └─> Invokes schema-designer skill
  └─> Creates schema.zod.ts, schema.ts

Stage 2.2: API Contracts
  └─> Invokes api-architect skill
  └─> Creates shared/contracts/*.contract.ts

Stage 2.3: Backend Implementation (MOCK + MEMORY) ← NEW
  └─> Creates auth adapters (mock ONLY at this stage)
  └─> Creates storage adapters (memory ONLY at this stage)
  └─> Creates routes
  └─> Uses .env.development:
      AUTH_MODE=mock
      STORAGE_MODE=memory

Stage 2.4: UI Design System
  └─> Invokes ui-designer skill
  └─> Creates index.css, tailwind.config.ts

Stage 2.5: Frontend Implementation
  └─> Creates pages, components
  └─> Uses mock auth (john@app.com / Demo2025_)

Stage 2.6: Quality Assurance (LOCAL)
  └─> Invokes quality_assurer subagent
  └─> Validates code with mock/memory
  └─> Tests all CRUD operations
  └─> Verifies auth flows

Stage 2.7: Chrome DevTools Testing (LOCAL)
  └─> Tests in browser with mock data
  └─> Verifies visual rendering
  └─> Checks console errors
  └─> Validates user flows

Stage 2.8: Supabase Project Setup ← MOVED HERE! ✅
  └─> Invokes supabase-project-setup skill
  └─> Creates Supabase project
  └─> Pushes schema migration
  └─> Generates .env.production

Stage 2.9: Supabase Migration
  └─> Switches to AUTH_MODE=supabase
  └─> Switches to STORAGE_MODE=supabase
  └─> Verifies real database works
  └─> Re-runs quality checks

Stage 2.10: Final Validation (PRODUCTION)
  └─> Tests with real Supabase
  └─> Verifies auth endpoints
  └─> Confirms data persistence
```

**Benefits**:
- ✅ Faster local iteration (no network delays)
- ✅ No wasted Supabase projects
- ✅ Can test fully offline
- ✅ Infrastructure only created for validated apps

---

## Key Changes Required

### 1. Pipeline-Prompt.md Updates

**Section 2.2.1** (Supabase Project Provisioning):
```markdown
<!-- BEFORE -->
**🔧 MANDATORY**: Invoke `supabase-project-setup` skill IMMEDIATELY after schema design.

<!-- AFTER -->
**🔧 MANDATORY**: Invoke `supabase-project-setup` skill AFTER local validation completes (Stage 2.8).

**Why delay**: Apps should be tested with mock/memory first to avoid creating Supabase projects for broken apps.
```

**Section 2.3** (Backend Implementation):
```markdown
<!-- ADD THIS -->
**CRITICAL: Start with Mock + Memory**

All backend development uses mock auth and in-memory storage:
- AUTH_MODE=mock (no real credentials)
- STORAGE_MODE=memory (no database)

**Why**: Fast iteration, local testing, no infrastructure dependencies.

**Migration to Supabase**: Happens in Stage 2.8 after validation.
```

**Section 2.9** (New - Supabase Migration):
```markdown
<!-- ADD NEW SECTION -->
### 2.9 Supabase Migration (After Validation)

**Prerequisites**:
- ✅ All quality checks passed (Stage 2.6)
- ✅ Chrome DevTools testing passed (Stage 2.7)
- ✅ Supabase project created (Stage 2.8)

**Migration Steps**:

1. **Switch Environment Variables**:
   ```bash
   # Copy .env.production to .env
   cp .env.production .env
   ```

2. **Verify Supabase Adapters**:
   - ✅ server/lib/auth/supabase-adapter.ts exists
   - ✅ server/lib/storage/supabase-storage.ts exists
   - ✅ server/lib/db.ts configured with DATABASE_URL

3. **Test Real Database**:
   ```bash
   AUTH_MODE=supabase STORAGE_MODE=supabase npm run dev
   ```

4. **Verify Core Operations**:
   - Login with test account
   - Create/read/update/delete entities
   - Check data persists in Supabase dashboard
   - Verify auth.users table updated

**Rollback Plan**: If Supabase migration fails, revert to mock/memory:
```bash
cp .env.development .env
AUTH_MODE=mock STORAGE_MODE=memory npm run dev
```
```

### 2. Default Environment Configuration

**Current** `.env.development`:
```bash
# Development (local testing)
AUTH_MODE=mock
STORAGE_MODE=memory
PORT=5000
```

**Keep this** - it's correct! Mock/memory for development.

**Current** `.env.production`:
```bash
# Production (Supabase)
AUTH_MODE=supabase
STORAGE_MODE=supabase
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

**Generated by** `supabase-project-setup` skill in Stage 2.8.

### 3. Stage Ordering Documentation

Update the Example Multi-Task Delegation section:

```python
# Stage 1: Plan
Task("Create plan", "...", "general-purpose")

# Stage 2.1: Schema Design (FOUNDATION)
Skill("schema-designer")
# Creates schema.zod.ts, schema.ts

# Stage 2.2: API Contracts
Skill("api-architect")
# Creates contracts/*.contract.ts

# Stage 2.3: Backend Implementation (MOCK + MEMORY)
Skill("code-writer")
# Creates server/routes/*.ts with mock auth + memory storage
# Uses .env.development (AUTH_MODE=mock, STORAGE_MODE=memory)

# Stage 2.4: UI Design System
Skill("ui-designer")
# Creates index.css, tailwind.config.ts

# Stage 2.5: Frontend Implementation
Skill("code-writer")
# Creates client/src/pages/*.tsx, components

# Stage 2.6: Quality Assurance (LOCAL VALIDATION)
Task("Validate application", "...", "quality_assurer")
# Tests with mock/memory
# Verifies CRUD operations
# Checks auth flows

# Stage 2.7: Chrome DevTools Testing (LOCAL)
# Manual or automated browser testing
# Verify visual rendering
# Check console errors

# Stage 2.8: Supabase Setup (AFTER VALIDATION)
Skill("supabase-project-setup")
# Creates Supabase project
# Pushes schema migration
# Generates .env.production

# Stage 2.9: Supabase Migration
# Switch to AUTH_MODE=supabase, STORAGE_MODE=supabase
# Verify real database works
# Re-run quality checks

# Stage 2.10: Final Validation (PRODUCTION)
Task("Validate with Supabase", "...", "quality_assurer")
# Confirms production setup works
```

---

## Implementation Checklist

### ✅ Prerequisites (Already Done)

- [x] Auth adapter factory pattern supports mock/supabase modes
- [x] Storage adapter factory pattern supports memory/supabase modes
- [x] .env.development defaults to mock/memory
- [x] .env.production uses Supabase credentials
- [x] MockAuthAdapter with standard credentials (john@app.com / Demo2025_)
- [x] MemoryStorage with in-memory data

### 🔲 Changes Needed

**pipeline-prompt.md**:
- [ ] Update Section 2.2.1: Change "IMMEDIATELY after schema" to "AFTER validation (Stage 2.8)"
- [ ] Update Section 2.3: Add "CRITICAL: Start with Mock + Memory" guidance
- [ ] Add NEW Section 2.9: Supabase Migration procedure
- [ ] Update Example Multi-Task Delegation: Show new stage order
- [ ] Add migration rollback plan

**Validation**:
- [ ] quality_assurer must work with mock/memory (already does)
- [ ] Chrome DevTools testing must work locally (already does)
- [ ] Add Stage 2.9 validation that confirms Supabase migration worked

**Documentation**:
- [ ] Update README template to explain mock → Supabase flow
- [ ] Add troubleshooting section for migration issues

---

## Migration Workflow Detail

### Phase 1: Local Development (Mock + Memory)

**Environment**:
```bash
AUTH_MODE=mock
STORAGE_MODE=memory
```

**What works**:
- ✅ Auth: john@app.com / Demo2025_, admin@app.com / Demo2025_
- ✅ CRUD: All operations work (in-memory, lost on restart)
- ✅ Testing: Full local validation
- ✅ Iteration: Fast, no network delays

**What doesn't work**:
- ❌ Data persistence (lost on server restart)
- ❌ Real auth (Supabase auth.users table)
- ❌ Production deployment

### Phase 2: Supabase Migration

**Triggers**: After Stage 2.7 (Chrome DevTools) passes

**Actions**:
1. Invoke `supabase-project-setup` skill
2. Wait for project creation (~2-3 min)
3. Schema pushed via `supabase db push`
4. .env.production generated

**Environment Switch**:
```bash
cp .env.production .env
# OR
AUTH_MODE=supabase STORAGE_MODE=supabase npm run dev
```

**What changes**:
- ✅ Auth: Real Supabase auth.users table
- ✅ CRUD: PostgreSQL persistence
- ✅ Data: Survives server restarts

**Verification**:
1. Login creates entry in auth.users (check Supabase dashboard)
2. Created entities persist after server restart
3. All CRUD operations still work

### Phase 3: Production Deployment

**Environment**:
```bash
# Fly.io secrets
fly secrets set AUTH_MODE=supabase
fly secrets set STORAGE_MODE=supabase
fly secrets set DATABASE_URL=postgresql://...
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_ANON_KEY=...
```

**Validation**: Same quality checks, but with production data

---

## Rollback Strategy

If Supabase migration fails:

```bash
# 1. Revert environment
cp .env.development .env

# 2. Restart server
npm run dev

# 3. Verify mock/memory works
# Login with john@app.com / Demo2025_
# CRUD operations work (in-memory)

# 4. Debug Supabase issue
# Check Supabase dashboard
# Verify DATABASE_URL correct
# Confirm schema pushed
```

**Common Issues**:
- Database connection string wrong
- Supabase project not fully initialized (wait 30s)
- Schema migration failed
- Auth tables missing

---

## Benefits of Mock-First Approach

### Development Speed
- ⚡ No network latency
- ⚡ Instant restarts
- ⚡ Fast iteration

### Cost Efficiency
- 💰 No wasted Supabase projects for broken apps
- 💰 Only create infrastructure for validated apps

### Testing Flexibility
- 🧪 Full offline testing
- 🧪 Consistent mock data
- 🧪 No flaky network tests

### Risk Reduction
- 🛡️ Validate before infrastructure
- 🛡️ Catch bugs locally
- 🛡️ Easy rollback to mock

---

## Potential Issues & Solutions

### Issue 1: Developers forget to migrate to Supabase

**Solution**: Add reminder in final stage
```markdown
**🚨 BEFORE DEPLOYMENT**: Ensure Stage 2.8 (Supabase Setup) completed!

Check:
- [ ] .env.production exists
- [ ] Supabase project created
- [ ] Schema pushed to database
- [ ] AUTH_MODE=supabase works
```

### Issue 2: Tests pass with mock but fail with Supabase

**Solution**: Re-run quality checks in Stage 2.9
```python
# After Supabase migration
Task("Validate with Supabase", "Run full test suite with AUTH_MODE=supabase", "quality_assurer")
```

### Issue 3: Schema doesn't match Drizzle migration

**Solution**: Already solved! We use `supabase db push` which is schema-driven:
- Drizzle schema → Supabase schema (one-way sync)
- No migration drift

---

## Timeline for Implementation

**Total Time**: ~2 hours

1. **Update pipeline-prompt.md** (30 min)
   - Modify Section 2.2.1
   - Add Section 2.9
   - Update example delegation

2. **Test new pipeline order** (60 min)
   - Generate test app with mock/memory
   - Validate locally
   - Migrate to Supabase
   - Verify production works

3. **Documentation** (30 min)
   - Update README template
   - Add troubleshooting guide
   - Document rollback procedure

---

## Success Criteria

**Before declaring complete**:
1. Generate test app following new pipeline
2. Stages 2.1-2.7 complete with mock/memory
3. Stage 2.8 creates Supabase project
4. Stage 2.9 migration succeeds
5. Stage 2.10 validation passes with real DB
6. Deployment to Fly.io works

---

**Status**: 📋 PROPOSAL COMPLETE
**Next Step**: Review and approve, then implement changes
**Priority**: P0 - Improves development workflow significantly
