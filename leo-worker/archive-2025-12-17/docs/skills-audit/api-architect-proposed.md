---
name: api-architect
description: >
  Design RESTful APIs with proper contracts and authentication.
  Use when creating or modifying shared/contracts/*.contract.ts and server/routes/*.ts.
  Ensures path consistency, status codes, and response serialization.
category: implementation
priority: P0
---

# API Architect

## When to Use

**MANDATORY** when:
- Creating `shared/contracts/*.contract.ts` or `server/routes/*.ts`
- Adding/modifying API endpoints
- User mentions "API", "routes", "endpoints", "contracts"

---

## Core Patterns (6 Critical)

### 1. Contract Path Consistency

**Problem**: Including `/api` in contract paths causes double prefix (`/api/api/users`).

```typescript
// ✅ CORRECT: Paths relative to mount point
export const usersContract = c.router({
  list: {
    method: 'GET',
    path: '/users',  // NO /api prefix
    responses: { 200: z.array(userSchema) }
  }
});

// server/index.ts - mount at /api
app.use('/api', apiRouter);
// Result: GET /api/users (correct!)

// ❌ WRONG: Including /api in contract path
path: '/api/users'  // Results in /api/api/users (404!)
```

**Rule**: Contract paths are relative to mount point. Never include `/api`.

---

### 2. Dynamic Auth Headers (Client)

**Problem**: Static auth headers don't update when token changes.

```typescript
// ✅ CORRECT: Getter property for dynamic headers
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // Include /api in baseUrl
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    }
  }
});

// ❌ WRONG: Static header value (only set once at init!)
baseHeaders: {
  Authorization: `Bearer ${getAuthToken()}`
}
```

**Rule**: Use getter property (`get Authorization()`) for dynamic token injection.

---

### 3. ESM Import Extensions

**Problem**: ESM requires `.js` extension for local imports.

```typescript
// ✅ CORRECT: Use .js extension for all local imports
import { userSchema } from '../schema.zod.js';
import { contract } from '../../shared/contracts/index.js';
import { authRouter } from './auth.routes.js';

// ❌ WRONG: Missing extension (works in some bundlers but not all)
import { userSchema } from '../schema.zod';
```

**Rule**: Always use `.js` extension for local TypeScript file imports.

---

### 4. HTTP Status Codes

**Problem**: Missing status codes break type safety.

```typescript
// ✅ CORRECT: Complete status coverage
responses: {
  200: userSchema,             // GET success
  201: userSchema,             // POST created
  400: z.object({ error: z.string() }),  // Validation error
  401: z.object({ error: z.string() }),  // Unauthorized
  404: z.object({ error: z.string() }),  // Not found
}

// ❌ WRONG: Only success codes
responses: { 200: userSchema }  // No error handling!
```

**Status Code Rules**:
- GET: 200 (OK)
- POST: 201 (Created)
- PUT/PATCH: 200 (OK)
- DELETE: 200 with `{ message: z.string() }` or 204 with `z.void()`
- Always include: 400, 401, 404

---

### 5. Path Parameters

**Problem**: Without explicit pathParams, type safety is lost.

```typescript
// ✅ CORRECT: Explicit pathParams validation
getById: {
  method: 'GET',
  path: '/orders/:id',
  pathParams: z.object({
    id: z.string().uuid(),
  }),
  responses: {
    200: orderSchema,
    404: z.object({ error: z.string() }),
  },
},

// ❌ WRONG: No pathParams (params.id is `any`)
getById: {
  method: 'GET',
  path: '/orders/:id',
  responses: { 200: orderSchema },
}
```

**Rule**: Always define pathParams for routes with URL parameters.

---

### 6. Import from schema.zod.ts

**Problem**: Inline schemas cause duplication and drift.

```typescript
// ✅ CORRECT: Import all schemas
import {
  userSchema,
  insertUserSchema,
  paginationQuerySchema
} from '../schema.zod.js';

// ❌ WRONG: Inline definition
query: z.object({ page: z.number() })  // Duplicates schema.zod.ts!
```

**Rule**: ALL schemas imported from schema.zod.ts. Never define inline.

---

## Workflow

### New App
1. **Read schema.zod.ts** → List all entities
2. **Create auth contract** → login, signup, logout
3. **Create entity contracts** → CRUD for each entity
4. **Create index.ts** → Combine all contracts
5. **Create routes** → Implement handlers with storage
6. **Verify** paths have no /api prefix

### Existing App
1. **Read existing** contracts and routes
2. **Add/modify** as needed
3. **Update index.ts** if adding new contracts
4. **Verify** changes maintain consistency

---

## Templates

### Auth Contract (shared/contracts/auth.contract.ts)

```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { usersSchema } from '../schema.zod.js';

const c = initContract();

export const authContract = c.router({
  login: {
    method: 'POST',
    path: '/auth/login',
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
    responses: {
      200: z.object({
        user: usersSchema,
        token: z.string(),
      }),
      401: z.object({ error: z.string() }),
    },
  },
  signup: {
    method: 'POST',
    path: '/auth/signup',
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
    }),
    responses: {
      201: z.object({
        user: usersSchema,
        token: z.string(),
      }),
      400: z.object({ error: z.string() }),
    },
  },
  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
    },
  },
});
```

### Entity Contract (shared/contracts/orders.contract.ts)

```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  orderSchema,
  insertOrderSchema,
  ordersQuerySchema,
} from '../schema.zod.js';

const c = initContract();

export const ordersContract = c.router({
  list: {
    method: 'GET',
    path: '/orders',
    query: ordersQuerySchema,
    responses: {
      200: z.object({
        data: z.array(orderSchema),
        total: z.number(),
      }),
    },
  },
  getById: {
    method: 'GET',
    path: '/orders/:id',
    pathParams: z.object({
      id: z.string().uuid(),
    }),
    responses: {
      200: orderSchema,
      404: z.object({ error: z.string() }),
    },
  },
  create: {
    method: 'POST',
    path: '/orders',
    body: insertOrderSchema,
    responses: {
      201: orderSchema,
      400: z.object({ error: z.string() }),
    },
  },
  update: {
    method: 'PUT',
    path: '/orders/:id',
    pathParams: z.object({
      id: z.string().uuid(),
    }),
    body: insertOrderSchema.partial(),
    responses: {
      200: orderSchema,
      404: z.object({ error: z.string() }),
    },
  },
  delete: {
    method: 'DELETE',
    path: '/orders/:id',
    pathParams: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({ message: z.string() }),
      404: z.object({ error: z.string() }),
    },
  },
});
```

### Contract Index (shared/contracts/index.ts)

```typescript
import { initContract } from '@ts-rest/core';
import { authContract } from './auth.contract.js';
import { ordersContract } from './orders.contract.js';

const c = initContract();

export const contract = c.router({
  auth: authContract,
  orders: ordersContract,
});
```

### Route Implementation (server/routes/orders.routes.ts)

```typescript
import { initServer } from '@ts-rest/express';
import { contract } from '../../shared/contracts/index.js';
import type { IStorage } from '../lib/storage/interface.js';

const s = initServer();

export const ordersRouter = s.router(contract.orders, {
  list: {
    handler: async ({ query, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const userId = req.user!.id;

      const result = await storage.getOrders({ userId, ...query });

      return { status: 200 as const, body: result };
    },
  },

  getById: {
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const order = await storage.getOrderById(params.id);

      if (!order || order.userId !== req.user!.id) {
        return { status: 404 as const, body: { error: 'Order not found' } };
      }

      return { status: 200 as const, body: order };
    },
  },

  create: {
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage as IStorage;

      // Auto-inject userId from authenticated user
      const order = await storage.createOrder({
        ...body,
        userId: req.user!.id,
      });

      return { status: 201 as const, body: order };
    },
  },

  update: {
    handler: async ({ params, body, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const existing = await storage.getOrderById(params.id);

      if (!existing || existing.userId !== req.user!.id) {
        return { status: 404 as const, body: { error: 'Order not found' } };
      }

      const updated = await storage.updateOrder(params.id, body);
      return { status: 200 as const, body: updated };
    },
  },

  delete: {
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage as IStorage;
      const existing = await storage.getOrderById(params.id);

      if (!existing || existing.userId !== req.user!.id) {
        return { status: 404 as const, body: { error: 'Order not found' } };
      }

      await storage.deleteOrder(params.id);
      return { status: 200 as const, body: { message: 'Order deleted' } };
    },
  },
});
```

### App Router (server/routes/index.ts)

```typescript
import { initServer } from '@ts-rest/express';
import { contract } from '../../shared/contracts/index.js';
import { authRouter } from './auth.routes.js';
import { ordersRouter } from './orders.routes.js';

const s = initServer();

export const appRouter = s.router(contract, {
  auth: authRouter,
  orders: ordersRouter,
});
```

### Server Setup (server/index.ts)

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '../shared/contracts/index.js';
import { appRouter } from './routes/index.js';
import { createStorage } from './lib/storage/factory.js';
import { auth } from './lib/auth/factory.js';
import { authMiddleware } from './middleware/auth.js';

async function startServer() {
  const storage = await createStorage();

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Store in app.locals for access in routes
  app.locals.storage = storage;
  app.locals.auth = auth;

  // Health check (no auth)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API router with auth
  const apiRouter = express.Router();

  // Skip auth for login/signup
  apiRouter.use((req, res, next) => {
    if (req.path === '/auth/login' || req.path === '/auth/signup') {
      return next();
    }
    authMiddleware()(req, res, next);
  });

  // Mount ts-rest routes
  createExpressEndpoints(contract, appRouter, apiRouter, {
    jsonQuery: true,
    responseValidation: process.env.NODE_ENV === 'development',
  });

  app.use('/api', apiRouter);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
```

### API Client (client/src/lib/api-client.ts)

```typescript
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL must be defined in .env');
}

export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,
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

---

## Checklist

Before proceeding to implementation, verify:

- [ ] Auth contract exists (login, signup, logout)
- [ ] Entity contracts exist for all schema entities
- [ ] No `/api` prefix in any contract path
- [ ] All schemas imported from schema.zod.js
- [ ] POST returns 201, DELETE returns 200 or 204
- [ ] Error responses (400, 401, 404) on all endpoints
- [ ] pathParams defined for routes with URL parameters
- [ ] Contract index combines all contracts
- [ ] Routes auto-inject userId from req.user.id
- [ ] Server mounts at `/api` with jsonQuery: true
- [ ] All imports use `.js` extension

---

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| `/api` in contract path | Double prefix, 404 errors | Remove prefix |
| Static auth header | Token doesn't update | Use getter `get Authorization()` |
| Missing jsonQuery | Query params not parsed | Add `{ jsonQuery: true }` |
| Only 200 status | No error handling | Add 400/401/404 |
| Inline schemas | Duplication, drift | Import from schema.zod.js |
| Missing pathParams | Params are `any` type | Add pathParams validation |
| Not checking userId | Users access others' data | Verify ownership in handlers |
| Missing .js extension | ESM import fails | Add .js to local imports |
