# Skills Migration Plan - Executive Summary

## Quick Overview

**Document**: `docs/skills-migration-app-generator.md` (1674 lines)

**Purpose**: Comprehensive plan to transform the monolithic app-generator pipeline into a modular, skills-based architecture

**Problem Solved**: 55% storage bug rate + auth issues + no validation → 0% bugs with automated validation

---

## The Problem

### Current State

**Monolithic Pipeline**: 1020-line `pipeline-prompt.md`
- Lines 1-934: Dense instructions
- Line 935: Subagents finally mentioned (TOO LATE)
- Lines 936-1020: Subagent guidance

**Critical Issues**:

1. **Drizzle Schema Without Client** (55% bug rate)
   ```typescript
   // ✅ schema.ts created
   export const users = pgTable('users', { ... });

   // ❌ server/lib/db.ts NOT created
   // Result: App uses PostgREST → 55% bugs
   ```

2. **Auth Inconsistencies** (30% failure rate)
   - 93 lines of auth boilerplate in main prompt
   - No validation that auth works
   - Token verification issues common

3. **No Systematic Validation**
   - Stage 3: Validate is generic
   - No validation scripts
   - Issues found at runtime

4. **Subagents Buried** (Easy to miss)
   - Mentioned at line 935 of 1020
   - Critical guidance at the end

## The Solution

### New Architecture

**Core Pipeline**: 200 lines (orchestration only)
**Skills**: 15-20 specialized modules (auto-invoked)
**Validation**: Built-in at every step

```
.claude/skills/
├── _core/
│   ├── pipeline-orchestrator/       # 200-line slim pipeline
│   └── subagent-coordinator/        # Subagent guidance
│
├── backend/
│   ├── drizzle-orm-setup/           # ✅ EXISTS - Prevents 55% bugs
│   ├── auth-scaffolding/            # NEW - Auth system
│   ├── api-routes-patterns/         # NEW - Route templates
│   └── ... (4 more)
│
├── frontend/
│   ├── api-client-setup/            # NEW - Dynamic headers
│   ├── auth-context/                # NEW - Auth state
│   ├── protected-routes/            # NEW - Route protection
│   └── ... (3 more)
│
├── validation/
│   ├── build-validation/            # NEW - TypeScript/ESLint
│   ├── runtime-validation/          # NEW - Server startup
│   └── integration-testing/         # NEW - Browser tests
│
└── subagents/
    ├── schema-designer-skill/       # NEW - Wraps subagent
    └── ... (7 more wrappers)
```

### Key Innovation: Subagent Wrappers

**Pattern**: Skill wraps subagent + adds validation

```
User task
  → Skill auto-invokes
  → Skill delegates to subagent
  → Subagent completes
  → Skill validates output
  → Done or fix
```

**Example**: `schema-designer-skill`

1. Delegates to `schema_designer` subagent
2. Validates Zod schema exists
3. Validates Drizzle schema exists
4. **CRITICAL**: Invokes `drizzle-orm-setup` skill to create client
5. Validates complete setup
6. Reports success or errors

**Result**: Impossible to skip creating Drizzle client (the 55% bug cause)

---

## Detailed Skill Designs

### 1. auth-scaffolding (NEW)

**Purpose**: Complete auth system with factory pattern

**Source**: Lines 117-209 (93 lines) → skill

**Creates**:
- `server/lib/auth/factory.ts` - Factory pattern
- `server/lib/auth/mock-adapter.ts` - Development
- `server/lib/auth/supabase-adapter.ts` - Production
- `server/middleware/auth.ts` - Auth middleware
- `server/routes/auth.ts` - Auth routes

**Validation**:
```bash
./scripts/validate-auth.sh
# Checks all files exist, routes registered, endpoints work
```

**Why**: Auth is 93 lines in main prompt, repeated in subagents

### 2. api-client-setup (NEW)

**Purpose**: ts-rest client with dynamic auth headers

**Source**: Lines 382-435 → skill

**Critical Pattern**:
```typescript
baseHeaders: {
  get Authorization() {  // ✅ Getter property (ts-rest v3)
    const token = getToken();
    return token ? `Bearer ${token}` : '';
  },
}
```

**Validation**: Client includes auth header on requests

**Why**: Common mistake is static header (evaluated once at load)

### 3. auth-context (NEW)

**Purpose**: React auth state with persistence

**Source**: Lines 436-498 → skill

**Creates**:
- `AuthContext.tsx` - Context + hooks
- `ProtectedRoute.tsx` - Route protection
- Auth helpers (login, logout, persistence)

**Validation**: Auth persists on refresh, redirects work

**Why**: 62 lines of boilerplate, easy to get wrong

### 4. build-validation (NEW)

**Purpose**: Automated quality gate

**Creates**: Validation script that runs:
1. TypeScript compilation
2. ESLint
3. Build process

**Exit codes**: 0 = pass, 1 = fail (CI/CD compatible)

**Why**: Currently no automated validation

---

## Implementation Phases

### Phase 1: Critical Backend (Week 1)

**Goal**: Fix 80% of bugs

**Tasks**:
1. Test existing drizzle-orm-setup skill
2. Create auth-scaffolding skill
3. Create api-routes-patterns skill
4. Test with simple CRUD app

**Success**: Backend generates with 0% bugs

### Phase 2: Frontend (Week 2)

**Goal**: Consistent, working UIs

**Tasks**:
1. Create api-client-setup skill
2. Create auth-context skill
3. Create protected-routes skill
4. Create design-system skill
5. Create component-patterns skill

**Success**: Frontend with working auth flow

### Phase 3: Validation (Week 3)

**Goal**: Systematic quality gates

**Tasks**:
1. Create build-validation skill
2. Create runtime-validation skill
3. Create integration-testing skill
4. Update Stage 3 in pipeline

**Success**: All apps validate automatically

### Phase 4: Subagent Wrapping (Week 4)

**Goal**: Enhanced subagents

**Tasks**:
1-8. Create wrapper for each of 8 subagents

**Success**: Subagents auto-validate after completion

### Phase 5: Pipeline Refactoring (Week 5)

**Goal**: Slim, skills-first pipeline

**Tasks**:
1. Create pipeline-prompt-v3.md (200 lines)
2. Extract all patterns into skills
3. Move subagent info to top
4. Test with multiple apps

**Success**: Pipeline < 250 lines, same quality

---

## Impact Analysis

### Before Skills

| Metric | Current |
|--------|---------|
| Pipeline length | 1020 lines |
| Drizzle client bugs | 55% of apps |
| Auth issues | 30% of apps |
| Validation | Manual |
| Bug detection | Runtime |
| Subagent guidance | Line 935 (late) |

### After Skills

| Metric | Target |
|--------|--------|
| Pipeline length | 200 lines |
| Drizzle client bugs | 0% (validated) |
| Auth issues | 0% (tested) |
| Validation | Automated |
| Bug detection | Generation time |
| Subagent guidance | Top of pipeline |

### ROI

**Investment**: 162 hours (4 weeks)

**Savings per app**: 4 hours (no debugging, automated validation)

**Break-even**: 40 apps (~10 weeks at 1 app/day)

**Long-term**: Compound savings, easier maintenance, better quality

---

## Quick Reference

### Document Sections

| Section | Lines | Purpose |
|---------|-------|---------|
| **Problem Analysis** | 1-150 | What's broken and why |
| **Current Architecture** | 151-250 | How it works now |
| **Proposed Architecture** | 251-400 | How it should work |
| **Skill Designs** | 401-1400 | Complete skill implementations |
| **Implementation Phases** | 1401-1600 | Step-by-step roadmap |
| **Success Metrics** | 1601-1674 | Measuring impact |

### Key Insights

1. **Schema ≠ Client**
   - Having Drizzle schema doesn't mean having Drizzle client
   - RaiseIQ has schema but uses PostgREST → 55% bugs
   - Solution: Validate client exists, not just schema

2. **Auth = 93 Lines of Boilerplate**
   - Currently in main prompt
   - Repeated in subagents
   - Solution: One skill with validation

3. **Subagents Need Validation**
   - Subagents are great, but no validation after completion
   - Easy to forget critical steps (like Drizzle client)
   - Solution: Wrapper skills that validate

4. **Validation Should Be Automated**
   - Currently: "Run type-check, lint, build" (generic)
   - No scripts, manual checking
   - Solution: Skills with validation scripts

### For Implementation

**Start here**:
1. Read full plan: `docs/skills-migration-app-generator.md`
2. Create skills directory: `.claude/skills/backend/`
3. Begin Phase 1: auth-scaffolding skill
4. Follow roadmap week by week

**Each skill needs**:
1. SKILL.md with YAML frontmatter
2. Validation script (bash or TypeScript)
3. Templates (if applicable)
4. Testing with real app

**Success criteria**:
- Skill auto-invokes correctly
- Validation script catches issues
- Generated code works first time

---

## Next Actions

### Immediate (This Week)

1. **Review plan with team**
   - Read: `docs/skills-migration-app-generator.md`
   - Discuss: Phases and timeline
   - Decide: Start Phase 1 or adjust plan

2. **Test existing skills**
   - Run: `.claude/skills/drizzle-orm-setup/scripts/validate-drizzle.sh`
   - Verify: Validation works on RaiseIQ
   - Document: Any issues found

3. **Create first new skill**
   - Implement: auth-scaffolding skill
   - Test: Generate app with auth
   - Validate: Auth endpoints work

### Short-term (Next 2 Weeks)

- Complete Phase 1 (backend skills)
- Complete Phase 2 (frontend skills)
- Test with 2-3 real apps
- Measure: Bug rate improvement

### Long-term (Next Month)

- Complete all 5 phases
- Create pipeline-prompt-v3.md
- Test with 10+ apps
- Measure: ROI and quality

---

## Conclusion

**The Problem**: Monolithic 1020-line pipeline with subagents buried at line 935, causing 55% bug rate

**The Solution**: Skills-first architecture with 200-line pipeline + 15-20 specialized skills + automated validation

**Key Innovation**: Subagent wrapper skills that add validation layer without changing subagents

**Expected Impact**: 55% → 0% bug rate, single-pass app generation, easier maintenance

**Investment**: 4 weeks (162 hours)

**ROI**: Positive after 40 apps (~10 weeks)

**Status**: ✅ **Plan complete, ready for implementation**

---

**Full Document**: `docs/skills-migration-app-generator.md` (1674 lines)
**Date**: 2025-01-21
**Next Step**: Review plan and start Phase 1
