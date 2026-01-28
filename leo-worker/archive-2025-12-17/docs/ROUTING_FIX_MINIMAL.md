# Routing Fix - Minimal Implementation Plan

**Goal:** Fix `/api` prefix + ts-rest confusion with MINIMAL changes. Remove bloat.

---

## Changes Required (4 files, ~30 min total)

### 1. pipeline-prompt.md - Lines 726-783 (REPLACE)

**REMOVE:** All pure Express examples (58 lines)
**ADD:** Minimal ts-rest example (15 lines)

```typescript
**Routes use ts-rest for type safety:**

// server/routes/entity.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();
export const entityRouter = s.router(contract.entity, {
  list: {
    middleware: [authMiddleware()],
    handler: async ({ query, req }) => {
      return { status: 200 as const, body: await storage.getEntity(query) };
    }
  }
});

// server/index.ts
createExpressEndpoints(contract, appRouter, apiRouter);
app.use('/api', apiRouter);  // Mounts all routes at /api
```

**Result:** -43 lines, clearer pattern

---

### 2. Fix 5 Pattern Files (remove `/api` only)

**Files:**
- `patterns/schema_designer/QUERY_SCHEMA_PLACEMENT.md` (lines 18, 30, 82, 93)
- `patterns/schema_designer/AUTO_INJECTED_FIELDS.md` (lines 87, 244)
- `patterns/api_architect/CORE_IDENTITY.md` (line 58)
- `patterns/api_architect/RESPONSE_SERIALIZATION.md` (lines 58, 88, 118, 148)
- `patterns/api_architect/HTTP_STATUS_CODES.md` (line 59)

**Change:** Replace `/api/` with `/` in route paths
- `router.get('/api/campaigns'` → `router.get('/campaigns'`
- `path: '/api/users'` → `path: '/users'`

**Total:** ~10 line edits across 5 files

---

### 3. validation checklist - Add 1 line

**File:** `patterns/quality_assurer/VALIDATION_CHECKLIST.md`

**Add after line 54:**
```markdown
- [ ] Check 5: Routes use initServer (grep "initServer()" server/routes/)
```

---

### 4. Contract Path Consistency - Trim

**File:** `patterns/api_architect/CONTRACT_PATH_CONSISTENCY.md`

**REMOVE:** Lines 60-125 (verbose examples)
**KEEP:** Core rule + auth pattern

**Result:** 173 lines → 60 lines

---

## Implementation Commands

```bash
# 1. Update pipeline-prompt.md
# Lines 726-783: Replace with minimal ts-rest example above

# 2. Fix /api in pattern files (automated)
cd docs/patterns
sed -i '' "s|'/api/campaigns'|'/campaigns'|g" schema_designer/*.md
sed -i '' "s|'/api/items'|'/items'|g" schema_designer/*.md
sed -i '' "s|'/api/users'|'/users'|g" api_architect/*.md
sed -i '' "s|'/api/games'|'/games'|g" api_architect/*.md

# 3. Trim CONTRACT_PATH_CONSISTENCY.md
# Remove lines 60-125 (verbose route examples)

# 4. Add validation check
# Add "Check 5: Routes use initServer" to VALIDATION_CHECKLIST.md
```

---

## Validation

```bash
# Verify NO /api in paths
grep -r "'/api/" docs/patterns/ | grep -v "WRONG"
# Expected: 0 matches

# Generate test app
uv run python run-app-generator.py "Create blog" --app-name test-fix

# Check generated code
grep "initServer()" apps/test-fix/app/server/routes/*.ts | wc -l
# Expected: Number of route files

grep "path: '/api" apps/test-fix/app/shared/contracts/*.ts
# Expected: 0 matches
```

---

## Before/After Size Comparison

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| pipeline-prompt.md | 1712 lines | 1669 lines | -43 lines (-2.5%) |
| CONTRACT_PATH_CONSISTENCY.md | 173 lines | 60 lines | -113 lines (-65%) |
| **Total** | **1885 lines** | **1729 lines** | **-156 lines (-8%)** |

**Net Result:** Less bloat, same clarity, ONE pattern.

---

## What We're NOT Doing (Bloat Avoided)

❌ Creating new TS_REST_SERVER_PATTERN.md (unnecessary - pattern shown in pipeline-prompt.md)
❌ Adding verbose explanations (patterns are self-documenting)
❌ Duplicating examples across files (refer to pipeline-prompt.md)
❌ Multiple validation sections (one checklist is enough)

---

## Timeline

- Update pipeline-prompt.md: 10 min
- Run sed commands: 2 min
- Trim CONTRACT_PATH_CONSISTENCY.md: 5 min
- Update validation checklist: 2 min
- Test with generated app: 10 min
- **Total: 30 min**

