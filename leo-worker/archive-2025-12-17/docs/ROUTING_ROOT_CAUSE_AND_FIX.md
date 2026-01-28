# Routes Generator Root Cause Analysis & Fix

**Date:** 2025-11-17
**Issue:** Pipeline generates plain Express routes instead of ts-rest handlers

---

## Root Cause

**Routes Generator System Prompt** (`src/app_factory_leonardo_replit/agents/routes_generator/system_prompt.py`)

### Lines 252-263: ENFORCES WRONG PATTERN
```python
## CRITICAL: API Route Prefix Requirement

**IMPORTANT**: ALL API routes MUST include the `/api/` prefix in their definitions.

```typescript
// ✅ CORRECT - Routes include /api prefix
router.get("/api/users", async (req, res) => { ... });
router.post("/api/properties", async (req, res) => { ... });

// ❌ WRONG - Missing /api prefix (will cause 404 errors)
router.get("/users", async (req, res) => { ... });
```
```

### Lines 277-343: ENTIRE EXAMPLE SECTION IS PLAIN EXPRESS
All code examples show `router.get("/api/entities", ...)` pattern - **ZERO ts-rest examples!**

---

**Routes Generator Critic** (`src/app_factory_leonardo_replit/agents/routes_generator/critic/system_prompt.py`)

### Lines 67-100: VALIDATES WRONG PATTERN
```python
### 5. API Route Prefix Pattern Validation (CRITICAL)

**CRITICAL**: Routes MUST include `/api/` prefix in their path definitions

**Required Pattern:**
```typescript
router.get('/api/items', async (req, res) => { /* GET all */ });
```
```

---

## Why This is Wrong

### Current (Wrong) Pattern - Plain Express with `/api` hardcoded:
```typescript
// server/routes.ts
router.get("/api/users", async (req, res) => {
  const users = await storage.getUsers();
  res.json(users);
});
```

**Problems:**
1. ❌ No type safety - contracts exist but unused
2. ❌ Frontend/backend types drift
3. ❌ Hardcoded `/api` violates ts-rest mounting principle
4. ❌ Can't use `createExpressEndpoints()` composition
5. ❌ Manual request/response handling (error-prone)

### Correct Pattern - ts-rest with Contract Composition:
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
      return { status: 200 as const, body: users };
    }
  },
  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;
      const user = await storage.createUser({
        ...body,
        userId: req.user.id  // Auto-inject from auth
      });
      return { status: 201 as const, body: user };
    }
  }
});
```

```typescript
// server/routes/index.ts - Composition
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { usersRouter } from './users.routes.js';
import { authRouter } from './auth.routes.js';

const s = initServer();

export const appRouter = s.router(contract, {
  auth: authRouter,
  users: usersRouter,
  // ... more routers
});
```

```typescript
// server/index.ts - Single Mount Point
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: true
});

app.use('/api', apiRouter);  // Mount ALL routes at /api
```

**Benefits:**
1. ✅ Full type safety across frontend/backend
2. ✅ Contract defines paths once (single source of truth)
3. ✅ Automatic request/response validation
4. ✅ Composable router structure
5. ✅ Clean separation: contracts (shared) vs handlers (server)

---

## The Fix

### 1. Routes Generator System Prompt
**File:** `src/app_factory_leonardo_replit/agents/routes_generator/system_prompt.py`

**Replace lines 252-428 with:**
```python
## CRITICAL: ts-rest Integration Requirement

**IMPORTANT**: ALL routes MUST use ts-rest for type-safe API implementation.

### Architecture Pattern

1. **Contracts** (already generated in `shared/contracts/*.contract.ts`):
   - Define API shape with Zod validation
   - Paths are RELATIVE (no `/api` prefix)
   - Single source of truth for frontend and backend

2. **Route Handlers** (your job to generate):
   - Use `initServer()` from `@ts-rest/express`
   - Implement handlers matching contract structure
   - Return `{ status, body }` objects (NOT `res.json()`)
   - Add middleware for auth/validation

3. **Route Composition** (`server/routes/index.ts`):
   - Combine all entity routers
   - Match contract structure exactly
   - Export `appRouter` for mounting

4. **Server Mounting** (`server/index.ts` - already done):
   - Uses `createExpressEndpoints(contract, appRouter, apiRouter)`
   - Mounts at `/api` prefix
   - Enables response validation

### Example Implementation

For an entity called `users` with contract at `shared/contracts/users.contract.ts`:

```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authMiddleware } from '../middleware/auth.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  // Match contract operation names exactly
  list: {
    middleware: [authMiddleware()],  // Auth for protected routes
    handler: async ({ query, req }) => {
      const storage = req.app.locals.storage;
      const users = await storage.getUsers(query);
      return { status: 200 as const, body: users };
    }
  },

  getById: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage;
      const user = await storage.getUser(params.id);

      if (!user) {
        return { status: 404 as const, body: { error: 'User not found' } };
      }

      return { status: 200 as const, body: user };
    }
  },

  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;

      try {
        const user = await storage.createUser({
          ...body,
          userId: req.user.id  // Auto-inject from auth context
        });

        return { status: 201 as const, body: user };
      } catch (error) {
        if (error.code === '23505') {  // Unique constraint
          return { status: 409 as const, body: { error: 'User already exists' } };
        }
        throw error;
      }
    }
  },

  update: {
    middleware: [authMiddleware()],
    handler: async ({ params, body, req }) => {
      const storage = req.app.locals.storage;
      const user = await storage.updateUser(params.id, body);

      if (!user) {
        return { status: 404 as const, body: { error: 'User not found' } };
      }

      return { status: 200 as const, body: user };
    }
  },

  delete: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage;
      const deleted = await storage.deleteUser(params.id);

      if (!deleted) {
        return { status: 404 as const, body: { error: 'User not found' } };
      }

      return { status: 204 as const, body: undefined };
    }
  }
});
```

```typescript
// server/routes/index.ts - Composition
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authRouter } from './auth.routes.js';
import { usersRouter } from './users.routes.js';
// Import other entity routers...

const s = initServer();

export const appRouter = s.router(contract, {
  auth: authRouter,
  users: usersRouter,
  // Add other routers matching contract structure...
});
```

### Handler Signature

```typescript
// Handler receives destructured params
handler: async ({ params, query, body, req }) => {
  // params - URL path parameters (e.g., :id)
  // query - Query string parameters
  // body - Request body (already validated by contract)
  // req - Express request (for app.locals.storage, req.user, etc.)

  // MUST return { status, body }
  return {
    status: 200 as const,  // Must use 'as const' for type safety
    body: { /* ... */ }
  };
}
```

### Common Patterns

**Protected Routes (Require Auth):**
```typescript
{
  middleware: [authMiddleware()],
  handler: async ({ req, body }) => {
    const userId = req.user.id;  // From auth middleware
    // ...
  }
}
```

**Auto-Injected Fields (Security):**
```typescript
create: {
  handler: async ({ body, req }) => {
    const item = await storage.createItem({
      ...body,
      userId: req.user.id,      // Server controls ownership
      createdBy: req.user.id    // Server sets creator
    });
    return { status: 201, body: item };
  }
}
```

**Error Handling:**
```typescript
handler: async ({ params }) => {
  const item = await storage.getItem(params.id);

  if (!item) {
    return { status: 404 as const, body: { error: 'Not found' } };
  }

  return { status: 200 as const, body: item };
}
```

**Business Logic Endpoints (From Plan):**
```typescript
// If plan says "Users can view their upcoming bookings"
getUpcoming: {
  middleware: [authMiddleware()],
  handler: async ({ req }) => {
    const bookings = await storage.getBookings({
      userId: req.user.id,
      startDate: new Date().toISOString()
    });
    return { status: 200, body: bookings };
  }
}
```

### What You Must Generate

For EACH entity in the schema:

1. **Individual Route File** (`server/routes/{entity}.routes.ts`):
   - Import `initServer` from `@ts-rest/express`
   - Import contract from `@shared/contracts/index.js`
   - Import `authMiddleware` for protected routes
   - Create router with `s.router(contract.{entity}, { handlers })`
   - Export router: `export const {entity}Router = ...`

2. **Route Composition File** (`server/routes/index.ts`):
   - Import all entity routers
   - Combine using `s.router(contract, { ... })`
   - Export `appRouter`

### Implementation Steps

1. Read the contracts directory to understand all entities and operations
2. Read the plan to identify business logic endpoints
3. For each entity, create a route file with ts-rest handlers
4. Create the composition file (`server/routes/index.ts`)
5. Validate with OXC (if available)

### Critical Requirements

- ❌ NEVER use `router.get()`, `router.post()` - use `s.router()` instead
- ❌ NEVER use `res.json()`, `res.status()` - return `{ status, body }` objects
- ❌ NEVER hardcode `/api` in paths - contracts define paths
- ✅ ALWAYS use `initServer()` from `@ts-rest/express`
- ✅ ALWAYS match contract operation names exactly
- ✅ ALWAYS return `{ status: X as const, body: Y }`
- ✅ ALWAYS use `authMiddleware()` for protected routes
- ✅ ALWAYS auto-inject userId/createdBy from `req.user`
```

### 2. Routes Generator Critic System Prompt
**File:** `src/app_factory_leonardo_replit/agents/routes_generator/critic/system_prompt.py`

**Replace lines 67-100 with:**
```python
### 5. ts-rest Pattern Validation (CRITICAL)

**CRITICAL**: Routes MUST use ts-rest handlers, NOT plain Express routes.

**Required Pattern:**
```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  list: {
    handler: async ({ query, req }) => {
      return { status: 200 as const, body: await storage.getUsers(query) };
    }
  }
});

// server/routes/index.ts
export const appRouter = s.router(contract, {
  users: usersRouter,
  // ... other routers
});
```

**Validation Checks:**
```
routes_files = glob("server/routes/*.routes.ts")

for file in routes_files:
    content = Read(file)

    # CHECK 1: Must import initServer
    if "import { initServer } from '@ts-rest/express'" not in content:
        decision = "continue"
        errors = f"CRITICAL: {file} missing ts-rest import! Must import initServer from @ts-rest/express"

    # CHECK 2: Must import contract
    if "from '@shared/contracts" not in content:
        decision = "continue"
        errors = f"CRITICAL: {file} must import contract from @shared/contracts/index.js"

    # CHECK 3: Must use s.router() pattern
    if "s.router(contract." not in content:
        decision = "continue"
        errors = f"CRITICAL: {file} must use s.router(contract.entity, handlers) pattern"

    # CHECK 4: Must export router
    if "export const" not in content and "Router" not in content:
        decision = "continue"
        errors = f"CRITICAL: {file} must export the router (e.g., export const usersRouter)"

    # CHECK 5: Handlers must return { status, body }
    if "return { status:" not in content:
        decision = "continue"
        errors = f"CRITICAL: {file} handlers must return {{ status, body }} objects, not use res.json()"

    # CHECK 6: Must NOT use plain Express routing
    if "router.get(" in content or "router.post(" in content:
        decision = "continue"
        errors = f"CRITICAL: {file} uses plain Express routing! Use ts-rest s.router() instead"

# CHECK 7: Composition file must exist
composition = Read("server/routes/index.ts")
if not composition:
    decision = "continue"
    errors = "CRITICAL: server/routes/index.ts missing! Must create route composition file"

if composition:
    # CHECK 8: Must export appRouter
    if "export const appRouter" not in composition:
        decision = "continue"
        errors = "CRITICAL: server/routes/index.ts must export appRouter"

    # CHECK 9: Must compose all routers
    if "s.router(contract, {" not in composition:
        decision = "continue"
        errors = "CRITICAL: server/routes/index.ts must use s.router(contract, { ... }) to compose routers"
```
```

---

## Expected Outcome

After fix:
1. ✅ All route files use `initServer()` and `s.router()`
2. ✅ Handlers return `{ status, body }` objects
3. ✅ No hardcoded `/api` prefix in route handlers
4. ✅ Type safety across frontend/backend
5. ✅ Contracts are actually USED (not ignored)
6. ✅ Single mount point in `server/index.ts` via `createExpressEndpoints()`

Apps will match **Pattern 1 (Dadcoin)** - the correct ts-rest architecture.
