---
name: code-writer
description: >
  Generate production-ready TypeScript/React code for backend routes and frontend pages.
  Ensures storage completeness, real API data (no mocks), proper state management, and ESM imports.
category: implementation
priority: P0
---

# Code Writer

## When to Use

**MANDATORY** when:
- Implementing backend routes (`server/routes/*.ts`)
- Implementing frontend pages (`client/src/pages/*.tsx`)
- Adding CRUD operations to storage layer
- User mentions "implement", "create page", "add route", "generate code"

**AUTO-INVOKE** on patterns: "implement [feature]", "create [page/route]", "add [endpoint]"

---

## Core Patterns (11 Critical)

### 1. Storage Completeness - No Stubs

**Problem**: Stub methods that throw "Not implemented" break the application.

```typescript
// ✅ CORRECT: Full implementation
async getUsers(): Promise<User[]> {
  const users = await db.select().from(usersTable);
  return users;
}

async createUser(data: InsertUser): Promise<User> {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
}

// ❌ WRONG: Stub that throws
async getUsers(): Promise<User[]> {
  throw new Error('Not implemented');
}
```

**Rule**: EVERY storage method must be fully implemented. NO stubs, NO TODOs.

---

### 2. Interactive State - No Mock Data

**Problem**: Frontend uses placeholder/mock data instead of real API calls.

```tsx
// ✅ CORRECT: Real API data with useQuery
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function UsersPage() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await apiClient.users.list();
      if (result.status === 200) return result.body;
      throw new Error('Failed to fetch users');
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!users?.length) return <div>No users found</div>;

  return <div>{users.map(user => ...)}</div>;
}

// ❌ WRONG: Mock data
const users = [
  { id: 1, name: 'John' },  // Placeholder!
  { id: 2, name: 'Jane' }   // Not real data!
];
```

**Rule**: Pages MUST use apiClient + useQuery. NO placeholder arrays, NO mock data.

---

### 3. ESM Imports - .js Extensions

**Problem**: Missing .js extensions break imports in Node.js ESM.

```typescript
// ✅ CORRECT: .js extension for local imports
import { storage } from '../lib/storage/factory.js';
import { authMiddleware } from '../middleware/auth.js';
import { usersContract } from '@shared/contracts/users.contract.js';

// ❌ WRONG: No extension (breaks at runtime)
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
```

**Rule**: ALL relative imports MUST include .js extension (even for .ts files).

---

### 4. Auth Helpers - Token Management

**Problem**: Pages don't check auth state, or tokens aren't managed properly.

```tsx
// ✅ CORRECT: Auth-aware component
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'wouter';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <div>Welcome {user.name}</div>;
}

// Backend route with auth
import { authMiddleware } from '../middleware/auth.js';

export const usersRouter = s.router(contract.users, {
  list: {
    middleware: [authMiddleware()],  // Protected route
    handler: async ({ req }) => {
      // req.user is available here
      const users = await storage.getUsers();
      return { status: 200 as const, body: users };
    }
  }
});

// ❌ WRONG: No auth check
export default function DashboardPage() {
  // Assumes user is logged in, doesn't check!
  return <div>Dashboard</div>;
}
```

**Rule**: Protected pages check auth state. Protected routes use authMiddleware().

---

### 5. Wouter Routing - Client-Side Navigation

**Problem**: Using `<a>` tags causes full page reloads instead of client-side navigation.

```tsx
// ✅ CORRECT: Link component for navigation
import { Link } from 'wouter';

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/users">Users</Link>
    </nav>
  );
}

// ❌ WRONG: <a> tags cause full reload
<a href="/users">Users</a>  // Full page reload!
```

**Rule**: Use `<Link>` from wouter for internal navigation. Reserve `<a>` for external links only.

---

### 6. ID Flexibility - Handle Nested Resources

**Problem**: Routes only handle direct IDs, fail for nested resources.

```typescript
// ✅ CORRECT: Fallback for nested resources
getItem: {
  handler: async ({ params, req }) => {
    const storage = req.app.locals.storage;
    let item;

    // Try direct ID first
    if (params.id) {
      item = await storage.getItem(Number(params.id));
    }

    // Fallback: Try userId + itemId for nested route
    if (!item && params.userId && params.itemId) {
      const items = await storage.getItemsByUser(Number(params.userId));
      item = items.find(i => i.id === Number(params.itemId));
    }

    if (!item) {
      return { status: 404 as const, body: { error: 'Item not found' } };
    }

    return { status: 200 as const, body: item };
  }
}

// ❌ WRONG: Only handles direct ID
// GET /items/:id works
// GET /users/:userId/items/:itemId fails!
```

**Rule**: Implement fallback logic to handle both direct and nested resource IDs.

---

### 7. ts-rest v3 API Client - Correct Usage

**Problem**: Using fetch() directly instead of typed API client, or wrong response handling.

```tsx
// ✅ CORRECT: ts-rest API client
import { apiClient } from '@/lib/api-client';

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: async () => {
    const result = await apiClient.users.list();

    // Check status and extract body
    if (result.status === 200) {
      return result.body;  // Typed response
    }

    throw new Error(result.body.error || 'Failed to fetch');
  }
});

// ❌ WRONG: Using fetch() directly
const response = await fetch('/api/users');
const data = await response.json();  // No type safety!

// ❌ WRONG: Not checking status
const result = await apiClient.users.list();
return result.body;  // Might be error response!
```

**Rule**: Use apiClient, ALWAYS check result.status before accessing body.

---

### 8. React Query Provider - Required Setup

**Problem**: Pages use useQuery without QueryClientProvider, causing crashes.

```tsx
// ✅ CORRECT: App.tsx with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/users" component={UsersPage} />
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// ❌ WRONG: Missing QueryClientProvider
// Pages use useQuery → CRASH: "No QueryClient set"
```

**Rule**: App.tsx MUST wrap routes with QueryClientProvider. Create queryClient outside component.

---

### 9. Form State Management - Individual useState

**Problem**: Object-based form state fails in production builds (Vite minification).

```tsx
// ✅ CORRECT: Individual state variables
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');

<Input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Email"
/>
<Input
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Password"
/>

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email || !password) {
    toast.error('Please fill all fields');
    return;
  }
  await apiClient.auth.signup({ body: { email, password, name } });
};

// ❌ WRONG: Object-based state (fails in production)
const [formData, setFormData] = useState({ email: '', password: '' });
const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
// This causes silent data loss in production builds!
```

**Rule**: ALWAYS use individual useState per field. NEVER use object-based form state.

---

### 10. Auth Signup Endpoint - No Duplicate User Creation

**Problem**: Signup endpoint creates user in public.users after auth adapter already did.

```typescript
// ✅ CORRECT: Auth adapter handles both tables
// server/lib/auth/supabase-adapter.ts
import { db, schema } from '../db.js';

async signup(email: string, password: string, name: string, role: string) {
  // 1. Create in auth.users (Supabase Auth SDK)
  const { data, error } = await this.supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No user returned');

  // 2. Create in public.users (Drizzle ORM - database-agnostic)
  try {
    const [newUser] = await db
      .insert(schema.users)
      .values({ id: data.user.id, email, name, role })
      .returning();

    return { user: newUser, token: data.session?.access_token };
  } catch (dbError: any) {
    await this.supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(dbError.message);
  }
}

// server/routes/auth.routes.ts
signup: {
  handler: async ({ body }) => {
    try {
      // Auth adapter already creates user in both tables
      const result = await auth.signup(body.email, body.password, body.name, body.role);
      return { status: 201 as const, body: result };
    } catch (error: any) {
      return { status: 400 as const, body: { error: error.message } };
    }
  }
}

// ❌ WRONG: Duplicate user creation
signup: {
  handler: async ({ body }) => {
    const result = await auth.signup(...);  // Creates user in public.users

    await storage.createUser({ id: result.user.id, ... });  // DUPLICATE!
    // Error: duplicate key value violates unique constraint "users_pkey"

    return { status: 201, body: result };
  }
}
```

**Rule**: Auth adapter creates user in auth.users (Supabase Auth SDK) and public.users (Drizzle ORM). Signup endpoint NEVER calls storage.createUser().

---

### 11. Server Mounting - Express Router Pattern

**Problem**: Wrong `createExpressEndpoints` signature crashes server on startup.

```typescript
// ✅ CORRECT: Express Router with /api prefix
// server/index.ts
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const apiRouter = express.Router();

createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: NODE_ENV === 'development',
});

app.use('/api', apiRouter);  // ← Mounts all routes at /api

// ❌ WRONG: Missing contract parameter
createExpressEndpoints(appRouter, app, { jsonQuery: true });
// Error: [ts-rest] Expected AppRoute but received AppRouter
// Server crashes immediately!
```

**Rule**: Always use Express Router pattern. createExpressEndpoints needs 3 args: (contract, appRouter, expressRouter).

---

## Workflow

### Backend Route (Create)
1. **Read contract** from shared/contracts/*.contract.ts
2. **Check storage interface** - what methods are available
3. **Implement handler**:
   - Add authMiddleware() if protected
   - Use try/catch for error handling
   - Call storage methods
   - Return proper status codes (200/201/204/400/404/500)
4. **Use ESM imports** (.js extensions)
5. **Register route** in server/routes/index.ts
6. Done (no validation needed, quality_assurer will check)

### Frontend Page (Create)
1. **Read schema and contract** - understand data types
2. **Import types** from schema.zod.ts
3. **Implement component**:
   - useAuth() if protected page
   - useQuery() for data fetching with apiClient
   - Loading state (skeleton or spinner)
   - Error state (user-friendly message)
   - Empty state (call-to-action)
   - Main content with real data
4. **Use Wouter** for navigation (Link components)
5. **Register route** in App.tsx
6. Done (quality_assurer will validate)

### Existing Code (Modify)
1. **Read existing file** completely
2. **Identify change** - what needs to be added/modified
3. **Preserve everything else** - only touch what's needed
4. **Apply patterns** - ensure new code follows all 8 patterns
5. Done

---

## Templates

### Server Mounting (server/index.ts)
```typescript
// CRITICAL: Use Express Router pattern for /api mounting
import express from 'express';
import { createExpressEndpoints } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { appRouter } from './routes/index.js';

const app = express();
// ... middleware setup ...

// ✅ CORRECT: Express Router pattern
const apiRouter = express.Router();

createExpressEndpoints(contract, appRouter, apiRouter, {
  jsonQuery: true,
  responseValidation: NODE_ENV === 'development',
  logInitialization: NODE_ENV === 'development',
});

app.use('/api', apiRouter);  // ← Routes: /api/users, /api/auth, etc.
```

### Backend Route
```typescript
// server/routes/users.routes.ts
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { authMiddleware } from '../middleware/auth.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  list: {
    middleware: [authMiddleware()],
    handler: async ({ req }) => {
      const storage = req.app.locals.storage;
      try {
        const users = await storage.getUsers();
        return { status: 200 as const, body: users };
      } catch (error) {
        console.error('Get users error:', error);
        return { status: 500 as const, body: { error: 'Failed to fetch users' } };
      }
    }
  },

  getById: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage;
      try {
        const user = await storage.getUser(Number(params.id));
        if (!user) {
          return { status: 404 as const, body: { error: 'User not found' } };
        }
        return { status: 200 as const, body: user };
      } catch (error) {
        console.error('Get user error:', error);
        return { status: 500 as const, body: { error: 'Failed to fetch user' } };
      }
    }
  },

  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;
      try {
        // Auto-inject userId from auth if needed
        const user = await storage.createUser({
          ...body,
          createdBy: req.user.id
        });
        return { status: 201 as const, body: user };
      } catch (error) {
        console.error('Create user error:', error);
        return { status: 500 as const, body: { error: 'Failed to create user' } };
      }
    }
  }
});
```

### Frontend Page
```tsx
// client/src/pages/UsersPage.tsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await apiClient.users.list();
      if (result.status === 200) {
        return result.body;
      }
      throw new Error('Failed to fetch users');
    }
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800">Error: {error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No Users Yet</h2>
        <p className="text-gray-600 mb-4">Get started by creating your first user.</p>
        <Link href="/users/new" className="text-blue-600 underline">
          Create User
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <Link href="/users/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add User
        </Link>
      </div>

      <div className="space-y-2">
        {users.map(user => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="block p-4 border rounded hover:bg-gray-50"
          >
            <div className="font-semibold">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## Validation

**After implementation, quality_assurer will check**:
- Storage methods fully implemented (no stubs)
- Pages use real API data (no mocks)
- ESM imports have .js extensions
- Auth checks present where needed
- Error/loading/empty states implemented

**Manual checklist** (if quality_assurer unavailable):
- [ ] All storage methods implemented (no "throw new Error")
- [ ] Pages use useQuery + apiClient (no mock data)
- [ ] All relative imports have .js extensions
- [ ] Protected routes use authMiddleware()
- [ ] Protected pages check auth state
- [ ] Navigation uses Link component (not <a>)
- [ ] API calls check result.status before accessing body
- [ ] App.tsx has QueryClientProvider
- [ ] Forms use individual useState (no object-based state)
- [ ] Signup endpoint doesn't call storage.createUser()
- [ ] server/index.ts uses Express Router pattern with /api mounting

---

## Common Mistakes

1. Leaving stub methods → Application breaks
2. Using mock/placeholder data → Pages don't work
3. Missing .js extensions → Import errors
4. Using <a> instead of Link → Full page reloads
5. Using fetch() instead of apiClient → No type safety
6. Not checking result.status → Wrong body type
7. Missing QueryClientProvider → useQuery crashes
8. No auth checks on protected pages → Security issue
9. Missing loading/error states → Poor UX
10. Not handling empty states → Blank screens
11. Object-based form state → Silent data loss in production
12. Duplicate user creation in signup → Constraint violations
13. Wrong createExpressEndpoints signature → Server crashes on startup

---

## Related Skills

- **factory-lazy-init**: For Proxy patterns in factories (auth/storage)
- **api-architect**: For understanding contracts and API design
- **schema-designer**: For understanding data types and schemas

---

## Time Saved

Following these patterns prevents 6+ hours debugging per app:
- Stub method errors: 60 min
- Mock data not working: 45 min
- ESM import errors: 30 min
- useQuery crashes: 30 min
- Type safety issues: 45 min
- Auth state bugs: 60 min
- Missing states: 45 min
- Navigation issues: 30 min
