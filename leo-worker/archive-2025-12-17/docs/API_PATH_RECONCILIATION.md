# API Path Reconciliation: `/api` Prefix Confusion

**Date**: 2025-11-24
**Issue**: Confusion about whether `/api` should be in contract paths, baseUrl, or server mount points

---

## TL;DR: The Correct Pattern

**✅ CORRECT PATTERN (Established)**:

```typescript
// Contract: NO /api prefix (paths relative to mount point)
export const authContract = c.router({
  login: {
    path: '/auth/login',  // ✅ NO /api
  }
});

// Server: Mount directly on app (ts-rest adds paths as-is)
createExpressEndpoints(appRouter, app, { ... });
// Result: Routes accessible at /auth/login (no prefix yet)

// Client: Include /api in baseUrl
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // ✅ Include /api here
});
// Client calls: /api/auth/login
```

**Final URL**: `http://localhost:5001/api/auth/login`

---

## Two Implementations Discovered

### Implementation 1: naijadomot (Express Router Pattern)

**Files Examined**:
- `apps/naijadomot/app/client/src/lib/api-client.ts:17`
- `apps/naijadomot/app/server/index.ts:764`
- `apps/naijadomot/app/shared/contracts/auth.contract.ts:33`

**Pattern**:
```typescript
// Contract (auth.contract.ts)
path: '/auth/login'  // NO /api prefix

// Server (index.ts:764)
const apiRouter = express.Router();
createExpressEndpoints(contract, router, apiRouter, { jsonQuery: true });
app.use('/api', apiRouter);  // ← Mount point adds /api

// Client (api-client.ts:17)
baseUrl: 'http://localhost:5001/api'  // ← Include /api
```

**How it works**:
1. Contract path: `/auth/login`
2. Mounted on Express Router: no prefix yet
3. Router mounted at `/api`: becomes `/api/auth/login`
4. Client baseUrl includes `/api`: calls `/api/auth/login`

✅ **Result**: `/api/auth/login` (correct)

---

### Implementation 2: matchmind (Direct App Mount Pattern)

**Files Examined**:
- `apps/matchmind/app/client/src/lib/api-client.ts:10`
- `apps/matchmind/app/server/index.ts:122`
- `apps/matchmind/app/shared/contracts/auth.contract.ts:10`

**Pattern**:
```typescript
// Contract (auth.contract.ts)
path: '/auth/login'  // NO /api prefix

// Server (index.ts:122)
createExpressEndpoints(appRouter, app, { ... });  // ← Mount directly on app

// Middleware (index.ts:84)
app.use('/api', (req, res, next) => {
  // Auth middleware for /api/* routes
});

// Client (api-client.ts:10)
baseUrl: `${API_URL}/api`  // ← Include /api
```

**How it works**:
1. Contract path: `/auth/login`
2. Mounted directly on app with `createExpressEndpoints`
3. ts-rest creates routes at contract paths: `/auth/login` (NOT `/api/auth/login`)
4. Client baseUrl includes `/api`: tries to call `/api/auth/login`

⚠️ **Issue**: Routes are at `/auth/login` but client tries `/api/auth/login`

❌ **Result**: 404 error (route mismatch!)

---

## The Root Confusion

### What Caused the Confusion?

The confusion stems from **two different mounting patterns** in Express + ts-rest:

#### Pattern A: Express Router with Prefix (naijadomot)
```typescript
const apiRouter = express.Router();
createExpressEndpoints(contract, router, apiRouter);
app.use('/api', apiRouter);  // ← /api added here
```
- Routes in contract are relative
- `/api` prefix added by Express Router mounting
- Works correctly ✅

#### Pattern B: Direct App Mount (matchmind - WRONG)
```typescript
createExpressEndpoints(appRouter, app);  // ← Routes added directly to app
// Routes are now at /auth/login, /queries, etc.
```
- Routes added at exact contract paths
- NO `/api` prefix (not added anywhere!)
- Client expects `/api` but routes are at root
- Results in 404 errors ❌

---

## What About Contracts with `/api` Prefix?

### ❌ ANTI-PATTERN: Including `/api` in Contract Paths

```typescript
// ❌ WRONG: Including /api in contract
export const authContract = c.router({
  login: {
    path: '/api/auth/login',  // ❌ Has /api prefix
  }
});

// Server
const apiRouter = express.Router();
createExpressEndpoints(contract, router, apiRouter);
app.use('/api', apiRouter);  // ← Another /api added

// Result: /api/api/auth/login (DOUBLE PREFIX! 404!)
```

**Why this is wrong**:
1. Contract paths should be **relative to mount point**
2. Adding `/api` in contract + mounting at `/api` = double prefix
3. This is the "double `/api`" issue the user mentioned

---

## The Correct Solution for matchmind

**Problem**: matchmind mounts routes directly on app but client expects `/api` prefix

**Fix Option 1: Use Express Router Pattern (Recommended)**

```typescript
// server/index.ts
const apiRouter = express.Router();

// Apply middleware to apiRouter
apiRouter.use((req, res, next) => {
  // Auth middleware logic
  ...
});

// Mount ts-rest routes on apiRouter
createExpressEndpoints(appRouter, apiRouter, {
  globalMiddleware: [],
  logInitialization: NODE_ENV === 'development',
  responseValidation: NODE_ENV === 'development',
});

// Mount apiRouter at /api
app.use('/api', apiRouter);
```

**Fix Option 2: Add `/api` to Contract Paths (NOT Recommended)**

```typescript
// Change ALL contract paths to include /api
export const authContract = c.router({
  login: {
    path: '/api/auth/login',  // Add /api to every path
  }
});

// Client baseUrl EXCLUDES /api
baseUrl: API_URL  // NO /api suffix
```

**Why Option 1 is better**:
- Follows Express best practices
- Contracts remain reusable
- API versioning easier (`/api/v1`, `/api/v2`)
- Middleware organization clearer

---

## Official Patterns from Documentation

### From `docs/pipeline-prompt.md` (Lines 73, 596-597, 637, 759-767)

**Contract Path Pattern**:
```markdown
1. Contract path consistency (no /api prefix)
```

**Server Mounting Pattern**:
```typescript
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
app.use('/api', apiRouter);  // ← Mount at /api
```

**Comment in pipeline-prompt.md:759-767**:
```typescript
// CRITICAL: Mount all ts-rest routes at /api prefix
// Contract paths: /auth/login → /api/auth/login
// Contract paths: /users → /api/users
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true
});
app.use('/api', apiRouter);
```

**Client Pattern**:
```typescript
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // ← Include /api in baseUrl
  ...
});
```

### From `docs/patterns/code_writer/TS_REST_V3_API.md` (Line 46)

**ts-rest v3 Breaking Change**:
```typescript
// ✅ CORRECT (ts-rest v3)
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // Full path including /api!
  jsonQuery: true,
  ...
});
```

**Note**: v3 removed `basePath` option - must include full path in `baseUrl`

### From `~/.claude/skills/api-architect/SKILL.md`

**Pattern #1: Contract Path Consistency**:
```typescript
// ✅ CORRECT: Paths relative to mount point
export const usersContract = c.router({
  getUsers: {
    path: '/users',  // NO /api prefix
  }
});

// server/index.ts
app.use('/api', createExpressEndpoints(contract, router));
// Result: /api/users (correct!)
```

---

## Path Flow Visualization

### ✅ Correct Flow (naijadomot)

```
Contract:           /auth/login
                         ↓
createExpressEndpoints   |  (adds routes to Express Router)
                         ↓
Express Router:     /auth/login  (no prefix yet)
                         ↓
app.use('/api')          |  (mounts router at /api)
                         ↓
Final Route:        /api/auth/login  ✅
                         ↓
Client baseUrl:     http://localhost:5001/api
                         ↓
Client calls:       /api/auth/login  ✅ Match!
```

### ❌ Incorrect Flow (matchmind current state)

```
Contract:           /auth/login
                         ↓
createExpressEndpoints   |  (adds routes directly to app)
                         ↓
Final Route:        /auth/login  (no /api prefix!)
                         ↓
Client baseUrl:     http://localhost:5001/api
                         ↓
Client calls:       /api/auth/login  ❌ 404! No such route!
```

### ❌ Double Prefix Anti-Pattern

```
Contract:           /api/auth/login  (includes /api - WRONG!)
                         ↓
createExpressEndpoints   |  (adds to router)
                         ↓
Express Router:     /api/auth/login
                         ↓
app.use('/api')          |  (mounts router at /api)
                         ↓
Final Route:        /api/api/auth/login  ❌ Double prefix!
                         ↓
Client baseUrl:     http://localhost:5001/api
                         ↓
Client calls:       /api/auth/login  ❌ 404! Route is /api/api/...!
```

---

## Validation Checks

### Check Contract Paths

```bash
# Verify NO /api prefix in contract paths
grep -r "path:.*'/api/" apps/*/app/shared/contracts/
# Expected: ZERO matches

# Verify paths are relative
grep -r "path:.*'/" apps/*/app/shared/contracts/ | head -5
# Expected: All paths start with / but NOT /api
```

### Check Server Mounting

```bash
# Check if using Express Router pattern
grep -A 5 "createExpressEndpoints" apps/*/app/server/index.ts | grep "app.use('/api'"
# Expected: Should use Express Router + app.use('/api', router)

# OR check if mounting directly on app
grep "createExpressEndpoints.*app," apps/*/app/server/index.ts
# Expected: SHOULD BE EMPTY (don't mount directly on app)
```

### Check Client baseUrl

```bash
# Verify baseUrl includes /api
grep "baseUrl.*\/api" apps/*/app/client/src/lib/api-client.ts
# Expected: All matches should show /api in baseUrl
```

---

## Summary: The Reconciliation

### What Was Causing Confusion

1. **Two mounting patterns** seen in codebase (Express Router vs direct app)
2. **ts-rest v3 breaking changes** (removed `basePath`, need full path in `baseUrl`)
3. **Attempting to fix** by adding `/api` to contracts (created double prefix)

### What Is Correct

| Component | Pattern | Reasoning |
|-----------|---------|-----------|
| **Contract paths** | NO `/api` prefix | Paths relative to mount point |
| **Server mounting** | Express Router + `app.use('/api', router)` | Standard Express pattern for API prefix |
| **Client baseUrl** | Include `/api`: `${API_URL}/api` | ts-rest v3 requires full path |

### The Rule

> **Contract paths are ALWAYS relative to their mount point.**
>
> The `/api` prefix is added by:
> 1. **Server**: Mounting router at `/api` with `app.use('/api', router)`
> 2. **Client**: Including `/api` in `baseUrl`
>
> **NEVER** include `/api` in contract paths themselves!

---

## ⚠️ CRITICAL: MatchMind Server is BROKEN

**Discovery**: When testing matchmind server, found critical error:

```
❌ Failed to start server: Error: [ts-rest] Expected AppRoute but received AppRouter
    at recursivelyApplyExpressRouter
    at createExpressEndpoints
    at startServer (/apps/matchmind/app/server/index.ts:122:3)
```

**Root Cause**: matchmind is calling `createExpressEndpoints` incorrectly:

```typescript
// CURRENT (apps/matchmind/app/server/index.ts:122)
createExpressEndpoints(appRouter, app, {  // ❌ WRONG SIGNATURE
  globalMiddleware: [],
  ...
});
```

**The Problem**:
- `createExpressEndpoints` signature: `(contract, router, expressApp, options)`
- matchmind is passing: `(appRouter, app, options)` ← Missing the contract!
- `appRouter` is an `AppRouter` (ts-rest server router object)
- But first arg should be `contract` (the API contract definition)

**The Fix**:
```typescript
// apps/matchmind/app/server/index.ts
import { contract } from '@shared/contracts/index.js';

// CORRECT: Pass contract, then router, then app
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  globalMiddleware: [],
  logInitialization: NODE_ENV === 'development',
  responseValidation: NODE_ENV === 'development',
});

app.use('/api', apiRouter);  // Mount at /api
```

**This explains everything!** The "confusion" was because matchmind's server has been broken and never worked properly. The todo item about "fixing API client baseUrl" was trying to fix the wrong thing - the client was correct, the **server mounting was broken**.

## Action Items for MatchMind (URGENT)

1. ❌ **Server is currently broken** - Cannot start, crashes immediately
2. ⚠️ **Fix signature** - Use correct `createExpressEndpoints(contract, appRouter, apiRouter, options)`
3. ⚠️ **Add Express Router** - Mount routes on Express Router, not directly on app
4. ⚠️ **Mount at `/api`** - Add `app.use('/api', apiRouter)`
5. ✅ **Client is correct** - baseUrl already includes `/api` (don't change!)
6. ✅ **Contracts are correct** - Paths exclude `/api` (don't change!)

---

## References

- **Pipeline Prompt**: `docs/pipeline-prompt.md:73, 596-597, 637, 759-767`
- **ts-rest v3 Pattern**: `docs/patterns/code_writer/TS_REST_V3_API.md`
- **Dynamic Auth Headers**: `docs/patterns/api_architect/DYNAMIC_AUTH_HEADERS.md`
- **API Architect Skill**: `~/.claude/skills/api-architect/SKILL.md` (Pattern #1)
- **naijadomot Example**: `apps/naijadomot/app/` (correct implementation)
- **ts-rest Express Module**: [ts-rest Documentation](https://ts-rest.com/)

**Sources**:
- [How to create REST API with Express and ts-rest](https://ahmadrosid.com/blog/express-with-ts-rest)
- [ts-rest GitHub Repository](https://github.com/ts-rest/ts-rest)
- [ts-rest Express Module](https://www.npmjs.com/package/@ts-rest/express)

---

## Conclusion

The confusion was caused by seeing two different server mounting patterns and attempting various fixes. The **established correct pattern** is:

1. ✅ Contract paths: **NO** `/api` prefix (relative paths)
2. ✅ Server: Use **Express Router** + mount at `/api`
3. ✅ Client: Include `/api` in **baseUrl**

This pattern is documented in pipeline-prompt.md, official patterns, and working examples like naijadomot.

**MatchMind's current issue (if any)**: May be mounting directly on app instead of using Express Router, which would cause 404s if client expects `/api` prefix.

**The fix**: Switch to Express Router pattern as shown in naijadomot and official documentation.
