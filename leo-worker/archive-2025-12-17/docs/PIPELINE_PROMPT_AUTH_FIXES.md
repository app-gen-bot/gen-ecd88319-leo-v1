# Pipeline Prompt Auth Fixes - Concise Action Plan

**Date**: 2025-11-21
**Issue**: Two auth patterns in pipeline-prompt.md are incorrect/incomplete

---

## Fix #1: API Client Authorization Header Pattern

**Location**: `docs/pipeline-prompt.md` lines 752-760

**CURRENT (WRONG)**:
```typescript
baseHeaders: {
  'Content-Type': 'application/json',
  // CRITICAL: Use getter property, NOT function - ts-rest v3 requirement
  get Authorization() {  // ❌ WRONG - getters don't work with ts-rest v3
    const token = localStorage.getItem('auth_token');
    return token ? `Bearer ${token}` : '';
  },
},
```

**REPLACE WITH**:
```typescript
baseHeaders: {
  'Content-Type': 'application/json',
  // CRITICAL: Use arrow function for dynamic headers - ts-rest v3 requirement
  Authorization: () => {  // ✅ CORRECT - arrow function returning string
    const token = localStorage.getItem('auth_token');
    return token ? `Bearer ${token}` : '';
  },
},
```

**Update comment on line 754** from:
> `// CRITICAL: Use getter property, NOT function - ts-rest v3 requirement`

To:
> `// CRITICAL: Use arrow function for dynamic headers - ts-rest v3 requirement`

---

## Fix #2: Server Auth Middleware Application

**Location**: Add new section after line 520 in `pipeline-prompt.md`

**INSERT NEW SECTION**:

```markdown
#### Server-Side: Auth Middleware Application Pattern

**CRITICAL**: Auth middleware must be applied at Express router level BEFORE ts-rest endpoints.

**File: `server/index.ts`**

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '../shared/contracts/index.js';
import { createAppRouter } from './routes/index.js';
import { createStorage } from './lib/storage/factory.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

async function main() {
  const storage = await createStorage();
  const appRouter = createAppRouter(storage);

  // Create API router
  const apiRouter = express.Router();

  // ✅ CRITICAL: Apply auth middleware BEFORE createExpressEndpoints
  // This ensures req.user is set for all protected routes
  apiRouter.use((req, res, next) => {
    if (req.path === '/auth/login' || req.path === '/auth/signup') {
      next(); // Skip auth for login/signup
    } else {
      authMiddleware()(req, res, next); // Apply to all other routes
    }
  });

  // Mount ts-rest endpoints
  createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
  app.use('/api', apiRouter);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
  });

  const port = parseInt(process.env.PORT || '5001', 10);
  app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
}

main().catch(console.error);
```

**Why This Pattern**:
1. **Express middleware runs BEFORE route handlers** - middleware must be registered before endpoints
2. **Sets req.user** - auth middleware extracts JWT and attaches user to request
3. **Conditional application** - skip auth for login/signup, apply to everything else
4. **Type safety** - req.user available in all protected route handlers

**Alternative: Per-Route Middleware** (shown in examples below):
```typescript
// Can also apply per-route in ts-rest handlers (more verbose):
list: {
  middleware: [authMiddleware()],
  handler: async ({ req }) => { /* ... */ }
}
```

**Choose global middleware pattern** for cleaner server setup. Per-route middleware is shown in examples for educational purposes but global pattern is preferred.
```

---

## Why These Fixes Matter

**Issue #1 (getter vs arrow function)**:
- Getter properties evaluated once at initialization
- Arrow functions called per-request
- Result: Token never sent → 401 on all protected endpoints

**Issue #2 (missing Express middleware)**:
- Per-route middleware shown but not Express-level pattern
- Agent may generate server/index.ts without middleware application
- Result: req.user undefined → 401 on all protected endpoints

---

## Implementation

1. Edit `docs/pipeline-prompt.md` lines 752-760 (Fix #1)
2. Insert new section after line 520 (Fix #2)
3. Test by generating new app with auth

---

## Verification

After fixes, generated apps should have:
- `client/src/lib/api-client.ts` with `Authorization: () => { ... }`
- `server/index.ts` with Express middleware before `createExpressEndpoints`

Both verified working in `apps/smart-todo-ai1/app/`.
