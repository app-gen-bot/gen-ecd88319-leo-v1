# Pattern 16: Server Mounting & ts-rest Endpoints

**Source**: matchmind production failure, naijadomot success pattern
**Impact**: Prevents server crashes on startup, ensures /api routes work correctly

---

## The Problem

**Incorrect `createExpressEndpoints` usage causes immediate server crash:**

```typescript
// ❌ WRONG: Missing contract parameter
// server/index.ts
createExpressEndpoints(appRouter, app, {
  globalMiddleware: [],
  logInitialization: NODE_ENV === 'development',
});

// Error:
// ❌ [ts-rest] Expected AppRoute but received AppRouter
//    at createExpressEndpoints
// Server crashes immediately on startup
```

**Why this fails**:
- `createExpressEndpoints` signature: `(contract, router, expressApp, options)`
- Code above passes: `(appRouter, app, options)` ← Missing contract!
- `appRouter` is a ts-rest server router (wrong type for first argument)
- First parameter MUST be the contract definition

---

## The Solution

**Use Express Router pattern with correct `createExpressEndpoints` signature:**

```typescript
// server/index.ts
import express from 'express';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5001');

// ... middleware setup ...

// ✅ CORRECT: Express Router pattern for /api mounting
const apiRouter = express.Router();

createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: NODE_ENV === 'development',
  logInitialization: NODE_ENV === 'development',
});

app.use('/api', apiRouter);  // ← Mounts all routes at /api prefix

// ... error handlers, server start ...
```

---

## Complete Working Example

```typescript
/**
 * Express Server with ts-rest API
 *
 * CRITICAL: Import dotenv/config FIRST
 */
import 'dotenv/config';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createExpressEndpoints } from '@ts-rest/express';
import { createStorage } from './lib/storage/factory.js';
import { auth } from './lib/auth/factory.js';
import { authMiddleware, requireRole } from './middleware/auth.js';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const PORT = parseInt(process.env.PORT || '5001');
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  console.log('🚀 Starting Server...');
  console.log(`📝 Environment: ${NODE_ENV}`);

  // Initialize storage (async)
  const storage = await createStorage();
  console.log('✅ Storage initialized');

  // Create Express app
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Store instances in app.locals
  app.locals.storage = storage;
  app.locals.auth = auth;

  // Health check (no auth required)
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
    });
  });

  // ============================================================================
  // CRITICAL: ts-rest API Routes Mounting
  // ============================================================================

  /**
   * Mount all ts-rest routes at /api prefix
   *
   * Contract paths: /auth/login → /api/auth/login
   * Contract paths: /users     → /api/users
   *
   * IMPORTANT:
   * 1. Create Express Router first
   * 2. Mount ts-rest endpoints on router (NOT directly on app!)
   * 3. Mount router at /api
   */
  const apiRouter = express.Router();

  // Apply auth middleware to /api routes (optional - skip auth for login/signup)
  apiRouter.use((req, res, next) => {
    if (req.path === '/auth/login' || req.path === '/auth/signup') {
      return next();
    }
    authMiddleware()(req, res, next);
  });

  // Mount ts-rest routes on Express Router
  createExpressEndpoints(contract, appRouter, apiRouter, {
    jsonQuery: true,
    responseValidation: NODE_ENV === 'development',
    logInitialization: NODE_ENV === 'development',
    requestValidationErrorHandler: (err, req, res) => {
      console.error('[Validation Error]:', err);
      res.status(400).json({
        error: 'Validation failed',
        details: err.body || err.pathParams || err.query,
      });
    },
  });

  // Mount the router at /api prefix
  app.use('/api', apiRouter);

  console.log('✅ API routes mounted at /api');

  // ============================================================================
  // Error Handling
  // ============================================================================

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path,
    });
  });

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('[Server Error]:', err);
    res.status(500).json({
      error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  // ============================================================================
  // Start Server
  // ============================================================================

  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📍 API endpoints: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
```

---

## Why Express Router Pattern?

### Benefits

1. **API Prefix**: All routes automatically get `/api` prefix
2. **Middleware Organization**: Apply middleware to all API routes at once
3. **Versioning**: Easy to add `/api/v1`, `/api/v2` later
4. **Separation**: Non-API routes (health, static files) stay separate
5. **Standard Pattern**: Express best practice for organizing routes

### How It Works

```
Contract path: /auth/login
         ↓
createExpressEndpoints adds to Express Router
         ↓
Express Router: /auth/login (no prefix yet)
         ↓
app.use('/api', apiRouter) mounts router at /api
         ↓
Final route: /api/auth/login ✅
         ↓
Client calls: baseUrl: ${API_URL}/api
         ↓
Request: /api/auth/login ✅ Match!
```

---

## createExpressEndpoints Signature

```typescript
createExpressEndpoints<TRouter>(
  contract,      // ← Type: AppRouter (contract definition)
  router,        // ← Type: ServerInferResponses<TRouter> (ts-rest server router)
  expressApp,    // ← Type: IRouter (Express Router or App)
  options?: {    // ← Optional configuration
    jsonQuery?: boolean;              // Enable JSON query params
    responseValidation?: boolean;     // Validate responses in dev
    logInitialization?: boolean;      // Log route registration
    requestValidationErrorHandler?: (err, req, res) => void;
    globalMiddleware?: Middleware[];  // Apply to all routes
  }
): void
```

**Parameter Details**:

1. **contract** (Required):
   - The API contract from `@shared/contracts/index.js`
   - Defines all endpoint shapes (paths, methods, bodies, responses)
   - Type: `AppRouter` from ts-rest

2. **router** (Required):
   - The ts-rest server router from `server/routes/index.js`
   - Contains all handler implementations
   - Created with `initServer().router(contract, handlers)`
   - Type: `ServerInferResponses<TRouter>`

3. **expressApp** (Required):
   - Express Router instance (`express.Router()`)
   - Can also be Express app, but Router is preferred
   - Routes will be added to this router
   - Type: `IRouter` (Express)

4. **options** (Optional):
   - `jsonQuery: true` - Enable JSON query parameters
   - `responseValidation: true` - Validate response schemas (development only!)
   - `logInitialization: true` - Log each route as it's registered
   - `requestValidationErrorHandler` - Custom validation error handling

---

## Common Mistakes

### ❌ Mistake 1: Missing Contract Parameter

```typescript
// ❌ WRONG: Only 2 arguments (missing contract)
createExpressEndpoints(appRouter, app, { jsonQuery: true });

// Error: [ts-rest] Expected AppRoute but received AppRouter
```

**Fix**: Add contract as first parameter
```typescript
// ✅ CORRECT
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
```

---

### ❌ Mistake 2: Direct App Mount (No Express Router)

```typescript
// ❌ WRONG: Mounting directly on app (no /api prefix)
createExpressEndpoints(contract, appRouter, app, { jsonQuery: true });

// Result: Routes at /auth/login (missing /api)
// Client expects: /api/auth/login
// Actual route:   /auth/login
// → 404 errors!
```

**Fix**: Use Express Router + mount at /api
```typescript
// ✅ CORRECT
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
app.use('/api', apiRouter);  // ← Adds /api prefix
```

---

### ❌ Mistake 3: Wrong Parameter Order

```typescript
// ❌ WRONG: Parameters in wrong order
createExpressEndpoints(contract, app, appRouter, { jsonQuery: true });

// Error: Type mismatch - app is not a ts-rest router
```

**Fix**: Correct order: contract → appRouter → expressRouter
```typescript
// ✅ CORRECT
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
```

---

### ❌ Mistake 4: Using Individual Route Modules

```typescript
// ❌ WRONG: Mounting individual route modules
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', itemsRoutes);

// Problems:
// - No type safety
// - No contract validation
// - Harder to maintain
```

**Fix**: Use single createExpressEndpoints call with composed contract
```typescript
// ✅ CORRECT
const apiRouter = express.Router();
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
app.use('/api', apiRouter);

// All routes (auth, users, items) mounted at once
// Full type safety from contracts
```

---

## Validation Checks

### Check 1: Verify Express Router Pattern

```bash
# Check if Express Router is created
grep "express.Router()" apps/*/app/server/index.ts
# Expected: const apiRouter = express.Router();

# Check if createExpressEndpoints uses 3 parameters
grep -A 2 "createExpressEndpoints" apps/*/app/server/index.ts
# Expected: createExpressEndpoints(contract, appRouter, apiRouter, { ... });

# Check if router is mounted at /api
grep "app.use('/api'" apps/*/app/server/index.ts
# Expected: app.use('/api', apiRouter);
```

### Check 2: Test Server Starts Successfully

```bash
cd apps/your-app/app
npm run dev

# Expected output:
# ✅ Server running on http://localhost:5001
# 📍 API endpoints: http://localhost:5001/api
```

### Check 3: Test API Routes Work

```bash
# Test health endpoint (no auth)
curl http://localhost:5001/health

# Expected: {"status":"ok","timestamp":"..."}

# Test API endpoint (with /api prefix)
curl http://localhost:5001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: Success or validation error (NOT 404!)
```

---

## Integration with Client

**Client expects `/api` prefix** (from TS_REST_V3_API.md pattern):

```typescript
// client/src/lib/api-client.ts
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // ← Includes /api
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
```

**Flow**:
1. Client `baseUrl`: `http://localhost:5001/api`
2. Contract path: `/auth/login`
3. Full URL: `http://localhost:5001/api/auth/login`
4. Server mount: `app.use('/api', apiRouter)`
5. Express sees: `/api/auth/login` → matches! ✅

---

## Related Patterns

- **Pattern #10**: `TS_REST_V3_API.md` - Client baseUrl with /api
- **Pattern #5**: `ESM_IMPORTS.md` - Import .js extensions for server
- **api_architect**: `CONTRACT_PATH_CONSISTENCY.md` - No /api in contract paths

---

## Why This Matters

**Without correct server mounting**:
- ❌ Server crashes immediately on startup
- ❌ Hours lost debugging type errors
- ❌ No routes work, even if client is correct

**With correct pattern**:
- ✅ Server starts successfully
- ✅ All routes work at `/api/*`
- ✅ Type-safe end-to-end
- ✅ Zero debugging time

**Evidence**:
- matchmind: Broken mounting → server crash
- naijadomot: Correct mounting → works perfectly

---

## Final Checklist

Before marking server code complete:

- [ ] Express Router created: `const apiRouter = express.Router()`
- [ ] createExpressEndpoints has 3 parameters: `(contract, appRouter, apiRouter, ...)`
- [ ] Router mounted at /api: `app.use('/api', apiRouter)`
- [ ] Server starts without errors: `npm run dev` succeeds
- [ ] Health endpoint works: `curl localhost:PORT/health`
- [ ] API endpoint works: `curl localhost:PORT/api/...` (not 404)
- [ ] Client baseUrl includes /api: `${API_URL}/api`

**If ANY check fails, FIX before completing!**

---

**Remember**: This pattern prevents server crashes. Follow it exactly every time you generate `server/index.ts`.
