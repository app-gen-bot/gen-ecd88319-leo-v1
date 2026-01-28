# Code Patterns: Essential Examples

This file contains the fundamental code patterns you should follow for every implementation.

---

## API Route Pattern

**Every API route should follow this structure:**

```typescript
// server/routes/items.routes.ts (ts-rest handler)
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const itemsRouter = s.router(contract.items, {
  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;

      try {
        // 1. Body is already validated by ts-rest using insertItemSchema

        // 2. Create resource with user ID injection
        const item = await storage.createItem({
          ...body,
          userId: req.user.id  // Injected from auth middleware
        });

        // 3. Return with appropriate status code
        return { status: 201 as const, body: item };  // 201 for created

      } catch (error) {
        // 4. Log and return server errors
        logger.error('Create item error:', error);
        return { status: 500 as const, body: { error: 'Failed to create item' } };
      }
    }
  }
});
```

**Key points:**
- ✅ Use ts-rest handlers with initServer()
- ✅ Use authMiddleware() for protected routes
- ✅ Validation is automatic via contract (no manual .parse() needed)
- ✅ Inject userId from req.user (never from request body)
- ✅ Return proper status codes (201 POST, 200 GET, 204 DELETE, 500 error)
- ✅ Return { status, body } objects
- ✅ Log errors for debugging

---

## React Component Pattern

**Every React component that displays backend data should follow this structure:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { LoadingSkeleton } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';

export default function ItemsPage() {
  // 1. Fetch data with useQuery
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await apiClient.items.getItems();
      if (response.status === 200) return response.body;
      throw new Error('Failed to fetch items');
    },
  });

  // 2. Handle loading state
  if (isLoading) return <LoadingSkeleton />;

  // 3. Handle error state
  if (error) return <ErrorMessage error={error} />;

  // 4. Handle empty state
  if (!items?.length) return (
    <EmptyState
      title="No items yet"
      description="Create your first item to get started"
      action={<CreateItemButton />}
    />
  );

  // 5. Render data
  return (
    <div className="grid gap-4">
      {items.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```

**Key points:**
- ✅ Use useQuery for ALL data fetching
- ✅ Use apiClient (never fetch directly)
- ✅ Handle ALL three states: loading, error, empty
- ✅ NO mock data - always real API integration
- ✅ Unique keys for mapped items

---

## Form with Mutation Pattern

**Forms that submit data to the backend:**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api-client';
import { insertItemSchema } from '@shared/schema.zod';

export default function CreateItemForm() {
  const queryClient = useQueryClient();

  // 1. Set up form with Zod validation
  const form = useForm({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // 2. Set up mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.items.createItem({ body: data });
      if (response.status === 201) return response.body;
      throw new Error('Failed to create item');
    },
    onSuccess: () => {
      // 3. Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['items'] });
      form.reset();
    },
  });

  // 4. Handle form submission
  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <p className="text-red-500">{form.formState.errors.name.message}</p>
      )}

      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Item'}
      </button>

      {createMutation.isError && (
        <p className="text-red-500">Error: {createMutation.error.message}</p>
      )}
    </form>
  );
}
```

**Key points:**
- ✅ Use react-hook-form with Zod validation
- ✅ Use useMutation for data mutations
- ✅ Invalidate queries after success
- ✅ Show loading state on button
- ✅ Display form errors
- ✅ Display mutation errors

---

## HTTP Status Codes

Use these status codes correctly:

**Success:**
- `200` - GET, PUT (success, returns data)
- `201` - POST (created, returns created resource)
- `204` - DELETE (success, no content returned)

**Client Errors:**
- `400` - Bad request (validation failed)
- `401` - Unauthorized (no valid auth token)
- `403` - Forbidden (valid token, but insufficient permissions)
- `404` - Not found (resource doesn't exist)

**Server Errors:**
- `500` - Internal server error (unhandled exception)

**Example:**
```typescript
// ts-rest handlers in server/routes/items.routes.ts
export const itemsRouter = s.router(contract.items, {
  // GET - return 200 with data
  get: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage;
      const item = await storage.getItemById(params.id);
      if (!item) {
        return { status: 404 as const, body: { error: 'Item not found' } };
      }
      return { status: 200 as const, body: item };
    }
  },

  // POST - return 201 with created resource
  create: {
    middleware: [authMiddleware()],
    handler: async ({ body, req }) => {
      const storage = req.app.locals.storage;
      const item = await storage.createItem({ ...body, userId: req.user.id });
      return { status: 201 as const, body: item };
    }
  },

  // DELETE - return 204 with no content
  delete: {
    middleware: [authMiddleware()],
    handler: async ({ params, req }) => {
      const storage = req.app.locals.storage;
      await storage.deleteItem(params.id);
      return { status: 204 as const, body: undefined };
    }
  }
});
```

---

## File Organization

**Backend structure:**
```
server/
├── index.ts                 # Express app setup
├── routes/
│   ├── auth.ts             # Auth routes
│   ├── items.ts            # Item routes
│   └── index.ts            # Route aggregation
├── lib/
│   ├── storage/
│   │   ├── factory.ts      # Storage factory
│   │   ├── mem-storage.ts  # Memory implementation
│   │   └── db-storage.ts   # Database implementation
│   └── logger.ts           # Logging utility
└── middleware/
    ├── auth.ts             # Auth middleware
    └── validate.ts         # Validation middleware
```

**Frontend structure:**
```
client/src/
├── pages/
│   ├── HomePage.tsx
│   ├── ItemsPage.tsx
│   └── ItemDetailPage.tsx
├── components/
│   ├── ui/                 # shadcn components
│   ├── ItemCard.tsx
│   └── CreateItemForm.tsx
├── lib/
│   ├── api-client.ts       # API client
│   └── auth-helpers.ts     # Auth utilities
└── types/
    └── index.ts            # Re-export types from shared
```

---

## Performance Best Practices

### 1. Lazy Loading
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  );
}
```

### 2. Pagination
```typescript
// Use pagination for large lists
const { data, isLoading } = useQuery({
  queryKey: ['items', page],
  queryFn: async () => {
    const response = await apiClient.items.list({
      query: { page, limit: 20 }
    });
    return response.body;
  },
});
```

### 3. React Query Caching
```typescript
// Configure stale time for appropriate caching
const { data } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  gcTime: 10 * 60 * 1000,    // 10 minutes
});
```

### 4. Memo/Callback
```typescript
// Memoize expensive calculations
const expensiveResult = useMemo(
  () => computeExpensiveValue(data),
  [data]
);

// Memoize callbacks to prevent re-renders
const handleClick = useCallback(
  () => doSomething(id),
  [id]
);
```

---

## Supabase Debugging (when available)

If MCP Supabase tools are available:

```bash
# Debug API queries
mcp__supabase__get_logs --filter "error" --limit 50

# Test database queries
mcp__supabase__execute_sql --query "SELECT * FROM items LIMIT 5" --read-only

# Search documentation
mcp__supabase__search_docs --query "row level security"
```

---

**Remember**: These are the core patterns. For specific edge cases and advanced patterns, see the other pattern files.
