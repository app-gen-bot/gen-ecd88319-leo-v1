# Pattern 9: React Query Provider Setup

**Source**: asana-clone production failures
**Problem**: Pages use useQuery hooks without QueryClientProvider causing application crashes

---

## The Problem

React Query hooks (useQuery, useMutation) require QueryClientProvider in the parent tree:

```tsx
// client/src/App.tsx
// ❌ WRONG: Missing QueryClientProvider
import { Route, Switch } from 'wouter';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/dashboard" component={DashboardPage} />
        {/* DashboardPage uses useQuery → CRASH! */}
      </Switch>
    </AuthProvider>
  );
}

// Error: "No QueryClient set, use QueryClientProvider to set one"
```

**Impact**: Entire application crashes, ALL pages using useQuery fail

---

## The Solution

Wrap entire app with QueryClientProvider:

```tsx
// client/src/App.tsx
// ✅ CORRECT: QueryClientProvider wraps all routes
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

// Create QueryClient instance OUTSIDE component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
      retry: 1,                   // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          {/* All routes can now use useQuery/useMutation */}
        </Switch>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## Provider Hierarchy

**CRITICAL**: Provider order matters!

```tsx
// ✅ CORRECT ORDER
<QueryClientProvider>    {/* 1. OUTERMOST: React Query */}
  <AuthProvider>         {/* 2. MIDDLE: Auth context */}
    <Switch>             {/* 3. INNERMOST: Routes */}
      <Route ... />
    </Switch>
  </AuthProvider>
</QueryClientProvider>

// ❌ WRONG ORDER
<AuthProvider>           {/* Auth can't use useQuery! */}
  <QueryClientProvider>  {/* Too deep in tree */}
    <Switch>
      <Route ... />
    </Switch>
  </QueryClientProvider>
</AuthProvider>
```

**Why**: If AuthProvider needs to use `useQuery` for user data, it must be wrapped by QueryClientProvider.

---

## QueryClient Configuration

### Recommended Defaults

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (no refetch)
      staleTime: 5 * 60 * 1000,  // 5 minutes

      // How long unused data stays in cache
      gcTime: 10 * 60 * 1000,    // 10 minutes

      // Number of retry attempts for failed requests
      retry: 1,

      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,

      // Don't refetch when component remounts
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});
```

### Configuration Options Explained

#### staleTime
Time (ms) before cached data is considered stale and will refetch on next use:
- `0` - Always stale (default, refetches frequently)
- `5 * 60 * 1000` - Fresh for 5 minutes (recommended)
- `Infinity` - Never stale (use for static data)

#### gcTime (formerly cacheTime)
Time (ms) unused data stays in cache before garbage collection:
- `5 * 60 * 1000` - 5 minutes (default)
- `10 * 60 * 1000` - 10 minutes (recommended)
- `Infinity` - Never remove (use sparingly)

#### retry
Number of times to retry failed requests:
- `3` - Default, good for unreliable networks
- `1` - Retry once (recommended for stable APIs)
- `0` - Never retry (use for auth failures)
- `false` - Disable retries

#### refetchOnWindowFocus
Whether to refetch when browser tab regains focus:
- `true` - Default, keeps data fresh
- `false` - Recommended for stable apps (prevents unnecessary requests)

---

## Complete App.tsx Example

```tsx
// client/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes fresh
      gcTime: 10 * 60 * 1000,        // 10 minutes in cache
      retry: 1,                       // Retry once
      refetchOnWindowFocus: false,   // No auto-refetch on focus
      refetchOnMount: false,         // No auto-refetch on mount
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Dev tools (only visible in development) */}
      <ReactQueryDevtools initialIsOpen={false} />

      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Switch>
            {/* Public routes */}
            <Route path="/" component={HomePage} />
            <Route path="/login" component={LoginPage} />

            {/* Protected routes */}
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/profile" component={ProfilePage} />

            {/* 404 catch-all */}
            <Route>
              {() => (
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl">404 - Page Not Found</h1>
                </div>
              )}
            </Route>
          </Switch>
        </div>

        {/* Toast notifications */}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

## Usage in Pages

Once QueryClientProvider is set up, pages can use hooks:

```typescript
// pages/DashboardPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.dashboard.get();
      if (response.status === 200) return response.body;
      throw new Error('Failed to fetch dashboard');
    },
  });

  // Mutate data
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await apiClient.dashboard.update({ body: updates });
      if (response.status === 200) return response.body;
      throw new Error('Failed to update');
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // Component logic...
}
```

---

## React Query DevTools

### Installation

```bash
npm install @tanstack/react-query-devtools
```

### Setup (Development Only)

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Only included in development builds */}
      <ReactQueryDevtools initialIsOpen={false} />

      {/* Rest of app */}
    </QueryClientProvider>
  );
}
```

### Benefits
- Inspect all queries and their state
- See cached data
- Debug stale/fresh status
- Manually refetch queries
- Track network requests

---

## Validation Checks

### 1. Check QueryClientProvider Exists

```bash
# Check App.tsx has QueryClientProvider
grep "QueryClientProvider" client/src/App.tsx && \
  echo "✅ Provider exists" || \
  echo "❌ ERROR: Missing QueryClientProvider"
```

**Expected**: Provider wraps entire app

### 2. Check QueryClient Configuration

```bash
# Check QueryClient is configured
grep "QueryClient({" client/src/App.tsx && \
  echo "✅ QueryClient configured" || \
  echo "⚠️  WARNING: Using default config"
```

**Expected**: Custom configuration present

### 3. Check Provider Hierarchy

```bash
# Check QueryClientProvider is outermost
head -50 client/src/App.tsx | grep -A 10 "return" | \
  head -3 | grep "QueryClientProvider" && \
  echo "✅ Provider is outermost" || \
  echo "⚠️  WARNING: Check provider order"
```

**Expected**: QueryClientProvider wraps everything

### 4. Verify QueryClient Created Outside Component

```bash
# Check queryClient defined outside component
grep -B 5 "export default function App" client/src/App.tsx | \
  grep "const queryClient" && \
  echo "✅ QueryClient created outside" || \
  echo "❌ ERROR: QueryClient created inside component"
```

**Expected**: QueryClient instance created at module level

---

## Common Mistakes

### ❌ Mistake 1: Creating QueryClient Inside Component

```tsx
// WRONG - Creates new client on every render
export default function App() {
  const queryClient = new QueryClient();  // ❌ Don't do this!

  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  );
}

// CORRECT - Create once at module level
const queryClient = new QueryClient();  // ✅ Outside component

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* ... */}
    </QueryClientProvider>
  );
}
```

### ❌ Mistake 2: Wrong Provider Order

```tsx
// WRONG - AuthProvider can't use useQuery
<AuthProvider>
  <QueryClientProvider client={queryClient}>
    <Routes />
  </QueryClientProvider>
</AuthProvider>

// CORRECT - QueryClientProvider wraps everything
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <Routes />
  </AuthProvider>
</QueryClientProvider>
```

### ❌ Mistake 3: Missing Provider Entirely

```tsx
// WRONG - No provider, hooks will crash
export default function App() {
  return (
    <Switch>
      <Route path="/dashboard" component={DashboardPage} />
      {/* DashboardPage uses useQuery → CRASH! */}
    </Switch>
  );
}
```

### ❌ Mistake 4: Multiple QueryClient Instances

```tsx
// WRONG - Different parts of app have different cache
const client1 = new QueryClient();
const client2 = new QueryClient();

<QueryClientProvider client={client1}>
  <PageA />  {/* Uses client1 cache */}
</QueryClientProvider>
<QueryClientProvider client={client2}>
  <PageB />  {/* Uses client2 cache - NO SHARING! */}
</QueryClientProvider>

// CORRECT - Single client instance shared across app
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <PageA />  {/* Both use same cache */}
  <PageB />  {/* Can share data! */}
</QueryClientProvider>
```

---

## Why This Matters

**asana-clone Evidence**: Missing QueryClientProvider blocked 5 protected routes until added

**Symptoms**:
- ❌ App crashes immediately on load
- ❌ Console error: "No QueryClient set"
- ❌ All pages using useQuery fail
- ❌ No data fetching works

**Time Lost**: 1+ hour tracking down provider setup

---

## Related Patterns

- **Pattern 8**: ts-rest v3 API client (used with useQuery)
- **CODE_PATTERNS.md**: React component pattern with useQuery
- **CODE_PATTERNS.md**: Form mutation pattern

---

## Final Checklist

Before completing App.tsx generation:

- [ ] QueryClient created outside component (module level)
- [ ] QueryClient has custom defaultOptions configuration
- [ ] QueryClientProvider wraps entire app (outermost provider)
- [ ] AuthProvider inside QueryClientProvider (if using auth)
- [ ] Routes inside all providers (innermost)
- [ ] ReactQueryDevtools added (development only)
- [ ] Tested: Page with useQuery loads without errors

---

**Remember**: ALL pages using useQuery or useMutation require QueryClientProvider. Missing it crashes the entire app immediately.
