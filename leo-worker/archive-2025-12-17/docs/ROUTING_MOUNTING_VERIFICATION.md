# Routing & Mounting Verification

**Analysis Date:** 2025-11-17
**Issue:** Verify routing changes still work after removing `/api` prefix from docs

---

## Two Patterns Found in Generated Apps

### Pattern A: Dadcoin (CORRECT - New Pattern)

**Contract Paths (NO `/api`):**
```typescript
// apps/dadcoin/app/shared/contracts/auth.contract.ts
path: '/auth/signup'
path: '/auth/login'
path: '/auth/me'
```

**Route Composition:**
```typescript
// server/routes/index.ts - Composes all routers
export const appRouter = s.router(contract, {
  auth: authRouter,
  families: familiesRouter,
  // ... more routers
});
```

**Server Mounting:**
```typescript
// server/index.ts - Single createExpressEndpoints call
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true
});

app.use('/api', apiRouter);  // ✅ Mounts at /api
```

**Result:** Routes at `/api/auth/signup`, `/api/auth/login` ✅

---

### Pattern B: Fizzcard (OLD Pattern - Has Issues)

**Contract Paths (HAS `/api`):**
```typescript
// apps/Fizzcard_copy/app/shared/contracts/badges.contract.ts
path: '/api/badges/my-badges'    // ❌ Has /api prefix
path: '/api/badges/available'    // ❌ Has /api prefix
```

**Route Files (Per-Entity createExpressEndpoints):**
```typescript
// server/routes/badges.ts
const badgesHandlers = s.router(badgesContract, {...});
export const badgesRouter = express.Router();
createExpressEndpoints(badgesContract, badgesHandlers, badgesRouter);
```

**Server Mounting:**
```typescript
// server/index.ts - NO /api prefix
app.use(authRouter);      // ❌ Mounted at root
app.use(cardsRouter);     // ❌ Mounted at root
app.use(badgesRouter);    // ❌ Mounted at root
```

**Result:** Routes at `/api/badges/my-badges` (works because `/api` is IN the contract)

---

## Analysis: Will Our Changes Work?

### ✅ Pattern A (Dadcoin) - WORKS PERFECTLY

Our documentation changes **match exactly** what dadcoin does:
1. Contract paths relative: `path: '/auth/signup'` ✅
2. Uses ts-rest composition: `s.router(contract, {...})` ✅
3. Single createExpressEndpoints call in server/index.ts ✅
4. Mounts at `/api`: `app.use('/api', apiRouter)` ✅

**Verification:**
- Contracts: NO `/api` prefix
- Mounting: AT `/api`
- Final URLs: `/api/auth/signup` ✅

---

### ⚠️ Pattern B (Fizzcard) - ALREADY BROKEN

Fizzcard **already violates** our documented pattern:
1. Contract paths have `/api`: `path: '/api/badges/my-badges'` ❌
2. Individual createExpressEndpoints per route file ❌
3. Mounts at root: `app.use(badgesRouter)` ❌

**Our docs wouldn't have helped Fizzcard anyway** because:
- It hardcodes `/api` in contracts (wrong)
- It mounts at root instead of `/api` (wrong)
- It calls createExpressEndpoints multiple times (inefficient)

Fizzcard works by accident (because `/api` is in the contract).

---

## What Pipeline-Prompt.md Should Generate

Based on dadcoin (the correct pattern):

### 1. Contract Paths (Relative, NO `/api`)
```typescript
// shared/contracts/users.contract.ts
export const usersContract = c.router({
  list: {
    method: 'GET',
    path: '/users',  // ✅ NO /api
  }
});
```

### 2. Individual Route Files (Export Handlers)
```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  list: {
    middleware: [authMiddleware()],
    handler: async ({ query, req }) => {
      return { status: 200, body: await req.app.locals.storage.getUsers(query) };
    }
  }
});
```

### 3. Route Composition (Combine All)
```typescript
// server/routes/index.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';

const s = initServer();

export const appRouter = s.router(contract, {
  auth: authRouter,
  users: usersRouter,
  // ... more routers
});
```

### 4. Server Mounting (Single createExpressEndpoints)
```typescript
// server/index.ts
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true
});

app.use('/api', apiRouter);  // ✅ Mount at /api
```

---

## Remaining Issues in pipeline-prompt.md

### Issue 1: Lines 690-709 Still Show Express Pattern
```typescript
// ❌ WRONG: Line 690 shows Express routing
router.get('/api/metrics/campaigns/:id', authMiddleware(), async (req, res) => {
```

**Should be ts-rest:**
```typescript
// ✅ CORRECT: ts-rest handler
{
  method: 'GET',
  path: '/metrics/campaigns/:id',  // No /api
  // ... handler
}
```

### Issue 2: Lines 773-799 Show Old Express Mounting
```typescript
// ❌ WRONG: Lines 773-799 show old pattern
import authRoutes from './routes/auth';
import apiRoutes from './routes';
app.use('/api', authRoutes);
app.use('/api', apiRoutes);
```

**Should be:**
```typescript
// ✅ CORRECT: ts-rest composition pattern
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter);
app.use('/api', apiRouter);
```

---

## Summary

✅ **Our changes are CORRECT** - They match the dadcoin pattern (newest and cleanest)
✅ **Pattern A apps will work perfectly** - They already use relative paths
⚠️ **Pattern B apps already broken** - They violate the documented pattern anyway
❌ **pipeline-prompt.md needs more fixes** - Lines 690-709, 773-799 still show old patterns

## Next Steps

1. Fix remaining Express examples in pipeline-prompt.md:
   - Lines 690-709: Replace with ts-rest pattern
   - Lines 773-799: Replace with ts-rest composition pattern
2. All new apps will generate with Pattern A (correct)
3. Old apps (Fizzcard) will continue working as-is (not generating new code anyway)
