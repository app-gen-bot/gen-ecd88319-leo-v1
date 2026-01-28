# Complete Routing Reconciliation: `/api` Prefix + ts-rest Patterns

**Date:** 2025-01-17
**Analysis Type:** Comprehensive Routing Architecture Fix
**Status:** 🔴 CRITICAL - Two Linked Issues Causing Generation Problems

---

## Executive Summary

You're absolutely right - **EVERYTHING should use ts-rest**, but the pipeline-prompt.md shows **pure Express routing** which is outdated and wrong. There are **TWO linked issues**:

### Issue 1: `/api` Prefix Confusion
- Pattern files conflict on whether to include `/api` in paths
- Causes Writer-Critic loops and 404 errors

### Issue 2: Express vs ts-rest Pattern Confusion
- **Reality:** Generated apps (like dadcoin) use ts-rest for ALL routes including auth
- **Documentation:** pipeline-prompt.md shows pure Express routing
- **Result:** Agents generate wrong code patterns

**These issues ARE linked** - both stem from outdated examples in pipeline-prompt.md.

---

## Part 1: What Generated Apps Actually Do (The Truth)

### Real Example: dadcoin App

**1. Auth Uses ts-rest Contract:**
```typescript
// shared/contracts/auth.contract.ts
export const authContract = c.router({
  signup: {
    method: 'POST',
    path: '/auth/signup',  // ✅ Relative path, NO /api
    body: signupSchema,
    responses: { 201: authResponseSchema, ... }
  },
  login: {
    method: 'POST',
    path: '/auth/login',  // ✅ Relative path, NO /api
    body: loginSchema,
    responses: { 200: authResponseSchema, ... }
  },
  // ... more auth endpoints
});
```

**2. Auth Implementation Uses initServer:**
```typescript
// server/routes/auth.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const authRouter = s.router(contract.auth, {
  signup: {
    handler: async ({ body, req }) => {
      // ✅ Typed handler with body/req
      const result = await auth.signup(body.email, body.password, ...);
      return {
        status: 201 as const,
        body: result
      };
    }
  },
  login: {
    handler: async ({ body, req }) => {
      // ✅ Typed handler
      const result = await auth.login(body.email, body.password);
      return {
        status: 200 as const,
        body: result
      };
    }
  },
  // ... more handlers
});
```

**3. Resource Routes Use Same Pattern:**
```typescript
// server/routes/ledger.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const ledgerRouter = s.router(contract.ledger, {
  list: {
    handler: async ({ query, req }) => {
      // ✅ Typed query parameters
      const entries = await storage.getLedgerEntries({...});
      return {
        status: 200 as const,
        body: { entries, total, ... }
      };
    }
  },
  // ... more handlers
});
```

**4. Server Mounts Everything with createExpressEndpoints:**
```typescript
// server/index.ts
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';  // Combines all routers

// Create API router
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true,
  requestValidationErrorHandler: (err, req, res) => {
    return res.status(400).json({ error: 'Validation error', ... });
  }
});

// Mount at /api prefix
app.use('/api', apiRouter);
// Result: /api/auth/login, /api/auth/signup, /api/ledger/list, etc.
```

**5. Main Contract Composition:**
```typescript
// shared/contracts/index.ts
export const contract = c.router({
  auth: authContract,        // ✅ Auth is a ts-rest contract
  families: familiesContract,
  quests: questsContract,
  store: storeContract,
  ledger: ledgerContract,
  // ... all entities as contracts
});
```

**6. Frontend Uses Typed Client:**
```typescript
// client/src/lib/api-client.ts
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});

// Usage in components - FULLY TYPED!
const { data } = await apiClient.auth.login({ body: { email, password } });
const { data } = await apiClient.ledger.list({ query: { limit: 50 } });
```

---

## Part 2: What Documentation Says (The Lie)

### pipeline-prompt.md Shows Pure Express Routing

**Lines 726-756: Auth Routes (WRONG PATTERN):**
```typescript
// ❌ WRONG: Pure Express routing (pipeline-prompt.md)
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/auth/signup', async (req, res) => {
  // Implement signup
});
```

**Lines 758-783: Resource Routes (WRONG PATTERN):**
```typescript
// ❌ WRONG: Pure Express routing (pipeline-prompt.md)
router.get('/api/resource', async (req, res) => {
  const items = await storage.getResource();
  res.json(items);
});

router.post('/api/resource', authMiddleware(), async (req, res) => {
  const item = await storage.createResource({
    ...req.body,
    userId: req.user.id
  });
  res.json(item);
});
```

**What's Missing:**
- ❌ No `import { initServer } from '@ts-rest/express';`
- ❌ No `initServer()` and `s.router()` usage
- ❌ No typed handlers with `{ body, query, params, req }`
- ❌ No typed responses with `{ status: 200 as const, body: ... }`
- ❌ No `createExpressEndpoints()` mounting
- ❌ Routes include `/api` prefix (double prefix issue!)

---

## Part 3: Why Both Issues Are Linked

### The Connection

1. **ts-rest contracts define relative paths** → NO `/api` prefix needed
2. **Pure Express routes use absolute paths** → Might include `/api` (inconsistent)
3. **pipeline-prompt.md shows Express routing** → Agents generate wrong pattern
4. **Pattern files show mixed examples** → Some with `/api`, some without
5. **Quality assurer enforces CONTRACT_PATH_CONSISTENCY** → Rejects `/api` prefixes
6. **Writer regenerates with same wrong pattern** → Infinite loop

**Root Cause:** Documentation doesn't match reality. Generated apps use ts-rest correctly, but pipeline-prompt.md teaches pure Express.

### Why ts-rest Solves Both Issues

✅ **Type Safety:** Frontend knows exactly what endpoints exist and what they return
✅ **Path Consistency:** Contracts define paths once, used everywhere
✅ **No Double Prefix:** Paths are relative by design
✅ **Contract-First:** Frontend and backend share the same contract definition
✅ **Validation:** Request/response validation automatic
✅ **DX:** Full autocomplete and type checking

---

## Part 4: The Correct Pattern (One True Way)

### For EVERY Route (Auth + Resources)

**1. Create ts-rest Contract:**
```typescript
// shared/contracts/users.contract.ts
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { usersSchema, insertUsersSchema, updateUsersSchema } from '../schema.zod';

const c = initContract();

export const usersContract = c.router({
  list: {
    method: 'GET',
    path: '/users',  // ✅ Relative path (NO /api)
    query: z.object({ limit: z.coerce.number().max(50).default(20) }),
    responses: {
      200: z.array(usersSchema),
      401: z.object({ error: z.string() }),
    },
  },
  get: {
    method: 'GET',
    path: '/users/:id',  // ✅ Relative path
    responses: {
      200: usersSchema,
      404: z.object({ error: z.string() }),
    },
  },
  create: {
    method: 'POST',
    path: '/users',  // ✅ Relative path
    body: insertUsersSchema,
    responses: {
      201: usersSchema,
      400: z.object({ error: z.string() }),
    },
  },
  // ... update, delete
});
```

**2. Implement Route Handler with initServer:**
```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { IStorage } from '../lib/storage/factory.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  list: {
    middleware: [authMiddleware()],  // ✅ Auth middleware
    handler: async ({ query, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const users = await storage.getUsers({ limit: query.limit });
      return {
        status: 200 as const,  // ✅ Typed response
        body: users
      };
    }
  },
  get: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const user = await storage.getUserById(params.id);
      if (!user) {
        return {
          status: 404 as const,
          body: { error: 'User not found' }
        };
      }
      return {
        status: 200 as const,
        body: user
      };
    }
  },
  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const user = await storage.createUser({
        ...body,
        // Auto-inject userId if needed
      });
      return {
        status: 201 as const,
        body: user
      };
    }
  },
  // ... update, delete handlers
});
```

**3. Compose All Contracts:**
```typescript
// shared/contracts/index.ts
import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract';
import { usersContract } from './users.contract';
import { postsContract } from './posts.contract';
// ... all contracts

const c = initContract();

export const contract = c.router({
  auth: authContract,      // ✅ Auth is a contract
  users: usersContract,
  posts: postsContract,
  // ... all entities
});

export type AppContract = typeof contract;
```

**4. Combine All Routers:**
```typescript
// server/routes/index.ts
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
import { postsRouter } from './posts.routes.js';
// ... all routers

// Combine all routers for createExpressEndpoints
export const appRouter = {
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter,
  // ... all routers
};
```

**5. Mount with createExpressEndpoints:**
```typescript
// server/index.ts
import express from 'express';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const app = express();

// Create API router
const apiRouter = express.Router();

// ✅ Mount all routes via ts-rest
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,  // Enable query string JSON parsing
  responseValidation: true,  // Validate responses match contract
  requestValidationErrorHandler: (err, req, res) => {
    console.error('[Validation Error]', err);
    return res.status(400).json({
      error: 'Validation error',
      details: err.body || err.query || err.params
    });
  }
});

// ✅ Mount at /api prefix
app.use('/api', apiRouter);

// Result: Contract paths are relative
// - /auth/login → /api/auth/login
// - /users → /api/users
// - /users/:id → /api/users/:id
```

**6. Use Typed Client:**
```typescript
// client/src/lib/api-client.ts
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});

// ✅ FULLY TYPED USAGE
// Frontend knows all available endpoints and their types
const loginResult = await apiClient.auth.login({
  body: { email, password }
});
// loginResult.status: 200 | 401 | 404
// loginResult.body: AuthResponse | { error: string }

const usersResult = await apiClient.users.list({
  query: { limit: 20 }
});
// usersResult.body: User[]
```

---

## Part 5: Resolution Plan (Both Issues)

### Files to Update

#### Priority 1: pipeline-prompt.md (CRITICAL)

**Section 2.1.2 (Lines 117-158): ts-rest Contracts**
- ✅ Already correct! Shows contract creation pattern
- ✅ Shows relative paths (NO /api prefix)
- Keep as-is

**Section 2.2.4 (Lines 688-783): API Routes - COMPLETE REWRITE NEEDED**

Replace pure Express examples with ts-rest patterns:

**OLD (Lines 726-756):**
```typescript
router.post('/auth/login', async (req, res) => { ... });
router.post('/auth/signup', async (req, res) => { ... });
```

**NEW:**
```typescript
// server/routes/auth.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { auth } from '../lib/auth/factory.js';

const s = initServer();

export const authRouter = s.router(contract.auth, {
  login: {
    handler: async ({ body, req }) => {
      try {
        const result = await auth.login(body.email, body.password);
        return {
          status: 200 as const,
          body: result
        };
      } catch (error) {
        return {
          status: 401 as const,
          body: { error: 'Invalid credentials' }
        };
      }
    }
  },
  signup: {
    handler: async ({ body, req }) => {
      const result = await auth.signup(body.email, body.password, body.name);
      return {
        status: 201 as const,
        body: result
      };
    }
  },
  // ... more auth handlers
});
```

**OLD (Lines 758-783):**
```typescript
router.get('/api/resource', async (req, res) => { ... });
router.post('/api/resource', authMiddleware(), async (req, res) => { ... });
```

**NEW:**
```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authMiddleware } from '../middleware/auth.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  list: {
    middleware: [authMiddleware()],
    handler: async ({ query, req }) => {
      const storage = req.app.locals.storage;
      const users = await storage.getUsers(query);
      return {
        status: 200 as const,
        body: users
      };
    }
  },
  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;
      const user = await storage.createUser({
        ...body,
        // Auto-inject fields from req.user if needed
        userId: req.user?.id
      });
      return {
        status: 201 as const,
        body: user
      };
    }
  },
});
```

**Section 2.2.4 (Lines 876-914): server/index.ts - UPDATE**

**OLD:**
```typescript
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
```

**NEW:**
```typescript
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

// Create API router
const apiRouter = express.Router();

// Mount all routes via ts-rest
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true,
  requestValidationErrorHandler: (err, req, res) => {
    return res.status(400).json({
      error: 'Validation error',
      details: err.body || err.query || err.params
    });
  }
});

// Mount at /api prefix
app.use('/api', apiRouter);
```

**Add New Section: Router Composition**

After line 783, add:
```markdown
**File: `server/routes/index.ts`**
```typescript
// Combine all routers for ts-rest
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
// ... import all routers

export const appRouter = {
  auth: authRouter,
  users: usersRouter,
  // ... all routers matching contract structure
};
```

#### Priority 2: Pattern Files (Fix /api Examples)

All files from previous analysis (see APPGENERATOR_ROUTING_ANALYSIS_AND_RESOLUTION.md):
1. `QUERY_SCHEMA_PLACEMENT.md` - Remove `/api` from examples
2. `AUTO_INJECTED_FIELDS.md` - Remove `/api` from examples
3. `CORE_IDENTITY.md` - Remove `/api` from examples
4. `RESPONSE_SERIALIZATION.md` - Remove `/api` from examples
5. `HTTP_STATUS_CODES.md` - Remove `/api` from examples

**ALSO UPDATE** to show ts-rest patterns instead of Express routing.

#### Priority 3: Add New Pattern File

**Create:** `docs/patterns/api_architect/TS_REST_SERVER_PATTERN.md`

```markdown
# Pattern: ts-rest Server-Side Implementation

**Source:** ts-rest v3 best practices
**Impact:** Full type safety, automatic validation, contract-first development

---

## The Pattern

ALL routes (auth + resources) use ts-rest's `initServer()` pattern:

### 1. Contract Definition
```typescript
// shared/contracts/entity.contract.ts
export const entityContract = c.router({
  list: {
    method: 'GET',
    path: '/entity',  // Relative path
    query: querySchema,
    responses: { 200: z.array(entitySchema) }
  }
});
```

### 2. Server Implementation
```typescript
// server/routes/entity.routes.ts
import { initServer } from '@ts-rest/express';

const s = initServer();

export const entityRouter = s.router(contract.entity, {
  list: {
    middleware: [authMiddleware()],
    handler: async ({ query, req }) => {
      return {
        status: 200 as const,
        body: await storage.getEntity(query)
      };
    }
  }
});
```

### 3. Mount with createExpressEndpoints
```typescript
// server/index.ts
createExpressEndpoints(contract, appRouter, apiRouter, {...});
app.use('/api', apiRouter);
```

---

## Benefits

✅ Full TypeScript type safety (frontend ↔ backend)
✅ Automatic request/response validation
✅ No manual route path management
✅ Contract-first development
✅ Compile-time error checking
✅ Frontend knows all endpoints

---

## Anti-Patterns

❌ Pure Express routing (loses type safety)
❌ Manual validation (contract already defines it)
❌ Separate auth/resource patterns (use same for all)
```

#### Priority 4: Update Validation Checklist

**File:** `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md`

Add new check:

```markdown
## ts-rest Pattern Check

- [ ] All routes use `initServer()` pattern
- [ ] All route files import from `@ts-rest/express`
- [ ] server/index.ts uses `createExpressEndpoints()`
- [ ] No pure Express routing (no `router.get()`, `router.post()` without ts-rest)

### Validation:
```bash
# Check for initServer usage
grep -r "initServer()" server/routes/
# Expected: All route files use it

# Check for createExpressEndpoints
grep "createExpressEndpoints" server/index.ts
# Expected: One match

# Check for pure Express routing (should be ZERO)
grep -r "router\.(get|post|put|delete)(" server/routes/ | grep -v "initServer"
# Expected: ZERO matches (all routes should use ts-rest)
```
```

---

## Part 6: Implementation Steps

### Step 1: Update pipeline-prompt.md (60 min)
1. Rewrite Section 2.2.4 (lines 688-914) with ts-rest patterns
2. Add router composition section
3. Update server/index.ts mounting pattern
4. Add reference to TS_REST_SERVER_PATTERN.md

### Step 2: Create TS_REST_SERVER_PATTERN.md (20 min)
1. Document the pattern comprehensively
2. Include examples for auth and resources
3. Add anti-patterns section
4. Add validation commands

### Step 3: Update Pattern Files (40 min)
1. Fix /api prefix in 5 pattern files
2. Update examples to show ts-rest instead of Express
3. Add references to TS_REST_SERVER_PATTERN.md

### Step 4: Update Validation Checklist (10 min)
1. Add ts-rest pattern check
2. Add validation commands
3. Document expected vs actual

### Step 5: Test with Generation (30 min)
1. Generate test app: `uv run python run-app-generator.py "Create a blog" --app-name test-tsrest`
2. Verify contracts created for all entities including auth
3. Verify all routes use `initServer()` pattern
4. Verify server/index.ts uses `createExpressEndpoints()`
5. Verify NO `/api` in contract paths
6. Verify NO pure Express routing
7. Test app works: `npm install && npm run dev`
8. Verify API calls succeed (no 404s)

### Step 6: Quality Assurer Verification (15 min)
1. Run quality_assurer on test app
2. Expected: All checks pass (routing + ts-rest pattern)
3. If fails: Review and fix implementation

**Total Time:** ~3 hours

---

## Part 7: Success Criteria

### Quantitative
- ✅ 100% of routes use ts-rest `initServer()` pattern
- ✅ ZERO `/api` prefixes in contract paths
- ✅ ZERO pure Express routing (all via ts-rest)
- ✅ 100% of entities have contracts (including auth)
- ✅ server/index.ts uses `createExpressEndpoints()`
- ✅ ZERO Writer-Critic loops for routing issues
- ✅ quality_assurer passes on first validation

### Qualitative
- ✅ Frontend has full type safety for API calls
- ✅ Autocomplete works for all endpoints
- ✅ Contract changes automatically update types
- ✅ Generated apps work on first `npm run dev`
- ✅ Developers understand pattern immediately
- ✅ ONE clear standard across all documentation

---

## Part 8: Why This Matters

### Current State (Mixed Patterns)
- ❌ Documentation shows Express, apps use ts-rest
- ❌ Agents confused about correct pattern
- ❌ Some routes might be Express, some ts-rest
- ❌ Type safety incomplete
- ❌ Manual validation required
- ❌ Frontend/backend can drift

### Future State (ts-rest Everywhere)
- ✅ ONE consistent pattern
- ✅ Full type safety end-to-end
- ✅ Automatic validation
- ✅ Contract-first development
- ✅ Agents generate correct code
- ✅ Zero routing-related issues

---

## Part 9: Quick Reference

### The One True Pattern

```typescript
// 1. CONTRACT (shared/contracts/entity.contract.ts)
export const entityContract = c.router({
  list: { method: 'GET', path: '/entity', ... }
});

// 2. ROUTE (server/routes/entity.routes.ts)
const s = initServer();
export const entityRouter = s.router(contract.entity, {
  list: { handler: async ({ query, req }) => {...} }
});

// 3. COMPOSE (server/routes/index.ts)
export const appRouter = {
  entity: entityRouter,
  // ... all routers
};

// 4. MOUNT (server/index.ts)
createExpressEndpoints(contract, appRouter, apiRouter, {...});
app.use('/api', apiRouter);

// 5. CLIENT (client/src/lib/api-client.ts)
export const apiClient = initClient(contract, {...});
```

### Validation Commands

```bash
# Verify ts-rest usage
grep -r "initServer()" server/routes/ | wc -l
# Expected: Number of route files

# Verify NO /api in contracts
grep -r "path: '/api" shared/contracts/
# Expected: ZERO matches

# Verify NO pure Express
grep -rE "router\.(get|post|put|delete)\(" server/routes/ | grep -v "s\.router"
# Expected: ZERO matches

# Verify createExpressEndpoints
grep "createExpressEndpoints" server/index.ts
# Expected: ONE match
```

---

## Conclusion

**You're 100% correct:** Everything SHOULD use ts-rest, and the two issues (``/api` prefix + Express vs ts-rest) ARE linked. Both stem from outdated pipeline-prompt.md examples.

**The Fix:**
1. Update pipeline-prompt.md to show ts-rest patterns (not Express)
2. Fix pattern files to remove `/api` and show ts-rest
3. Add comprehensive TS_REST_SERVER_PATTERN.md
4. Update validation checklists

**Expected Outcome:**
- ✅ All routes use ts-rest (auth + resources)
- ✅ Full type safety end-to-end
- ✅ Zero routing confusion
- ✅ Apps work on first generation
- ✅ ONE clear, consistent standard

**Timeline:** ~3 hours implementation + testing

