# CRITICAL: Pipeline Routing Pattern Analysis & Recommendation

**Date:** November 15, 2025
**Issue:** Conflicting routing guidance in app-factory pipeline
**Impact:** Apps generate with routing confusion, Quality Assurer loops, 404 errors
**Status:** REQUIRES DECISION

---

## The Core Problem

The app-factory pipeline documentation has **incomplete/conflicting guidance** for ts-rest routing patterns.

###Documentation Says:

**`docs/pipeline-prompt.md` (lines 131-158):**
```typescript
// ✅ CORRECT: Paths relative to mount point
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // NO /api prefix
  }
});

// Server
app.use('/api', usersRoutes);  // Mount at /api
```

**`docs/patterns/api_architect/CONTRACT_PATH_CONSISTENCY.md`:**
- Says: "NO /api prefix in contracts"
- Says: "Paths relative to mount point"
- Says: "Mount at /api in server"

**`docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md` (Check 4):**
- Validates: NO /api in contract paths
- Validates: Routes mounted at /api in server/index.ts

---

## The Missing Piece

**NONE of these documents explain how the ts-rest CLIENT uses relative-path contracts!**

### The Problem:

```typescript
// Contract (pipeline standard)
path: '/users'  // Relative path, no /api

// Server mounts at /api
app.use('/api', usersRoutes);
// Server has route at: /api/users ✅

// Client uses same contract
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013'
});

// Client calls: baseUrl + contract path
// = http://localhost:5013/users ❌ WRONG!
// Should be: http://localhost:5013/api/users
```

**THE ISSUE:** ts-rest client concatenates `baseUrl + contractPath`, but contract path doesn't include `/api`!

---

## Two Valid Patterns for ts-rest

### Pattern A: Absolute Paths (AdFlux Current)

**Contracts:**
```typescript
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/api/users',  // ✅ Includes /api (absolute)
  }
});
```

**Server:**
```typescript
app.use(usersRoutes);  // ✅ Mount directly (no /api prefix)
```

**Client:**
```typescript
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013'  // ✅ No /api in baseUrl
});

// Client calls: baseUrl + contract path
// = http://localhost:5013/api/users ✅ CORRECT!
```

**Pros:**
- ✅ Simple - what you see is what you get
- ✅ Client works without configuration
- ✅ Contract path matches actual URL
- ✅ No mounting complexity

**Cons:**
- ❌ Violates current pipeline standard
- ❌ Quality Assurer Check 4 fails
- ❌ Not compatible with plain Express pattern

---

### Pattern B: Relative Paths with basePath (Pipeline Intended?)

**Contracts:**
```typescript
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // ✅ Relative path (no /api)
  }
});
```

**Server (with ts-rest v3):**
```typescript
import { createExpressEndpoints } from '@ts-rest/express';

// Option 1: Mount at /api
app.use('/api', usersRoutes);

// Option 2: Use basePath in createExpressEndpoints (NOT DOCUMENTED IN PIPELINE!)
createExpressEndpoints(contract, router, app, {
  basePath: '/api',  // ← This is the missing piece!
});
```

**Client:**
```typescript
// CLIENT CANNOT WORK with relative paths unless...
// Option 1: Include /api in baseUrl
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013/api'  // ⚠️ Requires /api in baseUrl!
});

// Option 2: Use apiPrefix option (ts-rest v4+)
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013',
  apiPrefix: '/api',  // ⚠️ May not exist in ts-rest v3!
});
```

**Pros:**
- ✅ Matches pipeline documentation
- ✅ Quality Assurer Check 4 passes
- ✅ Consistent with plain Express pattern

**Cons:**
- ❌ Requires baseUrl to include /api (confusing)
- ❌ OR requires ts-rest v4+ features
- ❌ More complex configuration
- ❌ Pipeline docs don't explain client setup!

---

## Root Cause: Pipeline Documentation Gap

The pipeline documents were written for **plain Express routes**, then ts-rest was added without updating the client-side guidance.

**Plain Express (works fine):**
```typescript
// Route file defines: router.get('/users', ...)
// Server mounts: app.use('/api', usersRoutes)
// Result: /api/users ✅
// No client contracts, so no problem!
```

**ts-rest (documentation incomplete):**
```typescript
// Contract defines: path: '/users'
// Server mounts: app.use('/api', usersRoutes)
// Result: /api/users ✅ Server works

// Client uses same contract: path: '/users'
// Client calls: baseUrl + '/users'
// Result: http://localhost:5013/users ❌ Client FAILS!
```

---

## Recommendations

### Option 1: Keep AdFlux Pattern (Pattern A) ⭐ RECOMMENDED

**Action:** Update pipeline documentation to support BOTH patterns

**Changes needed in app-factory:**

1. **Update `docs/pipeline-prompt.md`:**

```markdown
#### 2.1.2 ts-rest Contracts

**IMPORTANT:** There are two valid patterns for ts-rest routes:

**Pattern A: Absolute Paths (Recommended for ts-rest)**
```typescript
// Contract includes /api prefix
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/api/users',  // Absolute path with /api
  }
});

// Server mounts directly (no /api prefix)
app.use(usersRoutes);

// Client works without configuration
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013'  // No /api in baseUrl
});
```

**Pattern B: Relative Paths (For plain Express compatibility)**
```typescript
// Contract uses relative paths
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // Relative path, no /api
  }
});

// Server mounts at /api
app.use('/api', usersRoutes);

// Client includes /api in baseUrl
const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5013/api'  // Must include /api!
});
```

**Choose ONE pattern per project and use consistently.**
```

2. **Update `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md`:**

```markdown
## Check 4: Route Path Consistency

**For Plain Express routes:**
- [ ] Route paths are relative (no /api prefix)
- [ ] Routes mounted at /api in server/index.ts

**For ts-rest routes, choose ONE pattern:**

**Pattern A (Absolute Paths - Simpler):**
- [ ] Contract paths include /api prefix (absolute paths)
- [ ] Routes mounted directly (no /api prefix in server/index.ts)
- [ ] Client baseUrl does NOT include /api

**Pattern B (Relative Paths - Express Compatible):**
- [ ] Contract paths do NOT include /api (relative paths)
- [ ] Routes mounted at /api in server/index.ts
- [ ] Client baseUrl INCLUDES /api suffix
```

3. **Create new pattern doc:** `docs/patterns/api_architect/TS_REST_ROUTING_PATTERNS.md`

(Full content in separate document)

---

### Option 2: Force Pipeline Pattern (Pattern B)

**Action:** Update AdFlux to match pipeline standard

**Changes needed in AdFlux:**

1. Remove `/api` from all contract paths
2. Mount all routes at `/api` in server/index.ts
3. Update client baseUrl to include `/api`:
   ```typescript
   const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5013') + '/api';
   ```

**Pros:**
- ✅ Matches current pipeline docs
- ✅ Quality Assurer passes

**Cons:**
- ❌ More complex client configuration
- ❌ baseUrl with `/api` suffix is confusing
- ❌ Requires changing all 11 contracts
- ❌ May break when VITE_API_URL already includes /api

---

## Decision Matrix

| Criterion | Option 1 (Update Pipeline) | Option 2 (Update AdFlux) |
|-----------|---------------------------|--------------------------|
| **Effort** | Medium (update docs) | High (change 11 contracts + client) |
| **Risk** | Low (documentation only) | Medium (code changes) |
| **Clarity** | High (absolute paths clearer) | Low (baseUrl + /api confusing) |
| **Compatibility** | Works with ts-rest v3 | Requires specific config |
| **Future-proof** | Yes (standard pattern) | Depends on ts-rest version |
| **Quality Assurer** | Need to update checks | Passes current checks |

---

## Recommended Action Plan

### Immediate (AdFlux):

1. **Keep current pattern** (Pattern A - absolute paths)
2. Document the pattern in AdFlux README
3. Add comment in contracts explaining the choice

### Short-term (app-factory):

1. Update pipeline-prompt.md to document BOTH patterns
2. Update CONTRACT_PATH_CONSISTENCY.md with ts-rest specifics
3. Update VALIDATION_CHECKLIST.md Check 4 to support both patterns
4. Create TS_REST_ROUTING_PATTERNS.md guide

### Long-term (app-factory):

1. Add pipeline generation option to choose pattern
2. Generate quality assurer checks based on chosen pattern
3. Add validation script that detects which pattern is used
4. Update all example apps to use consistent pattern

---

## Why This Happened

1. **Pipeline evolution:** Started with Express, added ts-rest later
2. **Documentation lag:** ts-rest client usage not documented
3. **Pattern assumption:** Assumed ts-rest works like Express (it doesn't for client)
4. **Quality check mismatch:** Checks written for Express, applied to ts-rest

---

## Files to Update (Recommended: Option 1)

### In app-factory repository:

1. `docs/pipeline-prompt.md` - Add ts-rest pattern section
2. `docs/patterns/api_architect/CONTRACT_PATH_CONSISTENCY.md` - Add ts-rest specifics
3. `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md` - Update Check 4
4. `docs/patterns/api_architect/TS_REST_ROUTING_PATTERNS.md` - New comprehensive guide

### In AdFlux repository:

1. `README.md` - Document chosen pattern (Pattern A)
2. `shared/contracts/README.md` - Explain absolute path choice
3. No code changes needed!

---

## Conclusion

The routing confusion comes from **incomplete ts-rest documentation in the pipeline**, not from AdFlux being wrong.

**AdFlux uses a valid ts-rest pattern** (Pattern A - absolute paths). The pipeline documentation needs updating to acknowledge both patterns and explain when to use each.

**Recommended:** Keep AdFlux as-is, update pipeline docs to support both patterns. This avoids risky code changes and provides clearer guidance for future apps.

---

## Next Steps

1. Get decision: Keep AdFlux pattern OR migrate to pipeline pattern?
2. If keep: Update app-factory docs (Option 1)
3. If migrate: Implement AdFlux changes (Option 2)
4. Add validation scripts for chosen pattern
5. Update quality assurer to support chosen pattern

**Decision Required:** Which option to proceed with?
