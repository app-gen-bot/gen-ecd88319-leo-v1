# Pattern 5: Wouter Routing Component Prop

**Source:** EdVisor Issue #22
**Impact:** Prevents blank pages with empty RootWebArea

---

## The Problem

Render function pattern causes blank pages:

```tsx
// client/src/App.tsx
// ❌ WRONG: Render function (causes blank RootWebArea)
import { Route } from 'wouter';
import CampaignsPage from './pages/CampaignsPage';

function App() {
  return (
    <div>
      <Route path="/campaigns">
        {(params) => <CampaignsPage />}  {/* Blank page! */}
      </Route>
    </div>
  );
}

// Result: Blank pages with empty RootWebArea in accessibility tree
```

---

## The Solution

**Use `component` prop directly, NOT render functions:**

```tsx
// client/src/App.tsx
// ✅ CORRECT: Direct component rendering
import { Route } from 'wouter';
import CampaignsPage from './pages/CampaignsPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div>
      {/* Static routes - use component prop */}
      <Route path="/campaigns" component={CampaignsPage} />
      <Route path="/dashboard" component={DashboardPage} />
    </div>
  );
}
```

---

## For Routes With Parameters

```tsx
// Option 1: Inline component (acceptable for simple cases)
<Route path="/items/:id">
  {(params) => <ItemDetailPage id={params.id} />}
</Route>

// Option 2: Wrapper component (preferred for complex routes)
function ItemDetailRoute({ params }: { params: { id: string } }) {
  return <ItemDetailPage id={params.id} />;
}

<Route path="/items/:id" component={ItemDetailRoute} />
```

---

## Complete App.tsx Example

```tsx
import { Route, Switch } from 'wouter';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CampaignDetailPage from './pages/CampaignDetailPage';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* ✅ Static routes with component prop */}
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/campaigns" component={CampaignsPage} />

        {/* ✅ Dynamic routes with inline component */}
        <Route path="/campaigns/:id">
          {(params) => <CampaignDetailPage id={params.id} />}
        </Route>

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
  );
}
```

---

## Validation Check

```bash
# Check for unnecessary render functions
grep "(params) =>" client/src/App.tsx | grep -v "params.id"

# Expected: Only routes with params usage (acceptable)
# If matches found WITHOUT params usage → using render functions unnecessarily → SHOULD FIX
```

---

## Why Render Functions Fail

- Wouter expects component prop for proper rendering lifecycle
- Render functions skip component lifecycle hooks
- Results in blank page with empty accessibility tree

---

**EdVisor Evidence**: Issue #22 - Render function pattern caused blank pages, switching to component prop fixed it
