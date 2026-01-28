# Pattern 1: Contract Path Consistency (Issue #3)

**Source:** EdVisor Issue #3 (Phase 1)
**Impact:** Prevents double /api prefix causing 404 errors

---

## The Problem

ts-rest contracts define paths relative to router mount point, NOT absolute URLs.

```typescript
// ❌ WRONG: Including /api in contract path
// shared/contracts/users.contract.ts
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/api/users',  // ❌ Includes /api prefix
    responses: { 200: z.array(usersSchema) }
  }
});

// server/index.ts
app.use('/api', createExpressEndpoints(usersContract, router));

// Result: Routes at /api/api/users (double prefix!) → 404 errors
```

---

## The Solution

**Paths in contracts are ALWAYS relative to where router is mounted:**

```typescript
// ✅ CORRECT: Paths relative to mount point
// shared/contracts/users.contract.ts
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // ✅ NO /api prefix
    responses: { 200: z.array(usersSchema) }
  },
  getUser: {
    method: 'GET',
    path: '/users/:id',  // ✅ Path params work correctly
    responses: { 200: usersSchema }
  }
});

// server/index.ts
app.use('/api', createExpressEndpoints(usersContract, router));

// Result: Routes at /api/users (correct!)
```

---

## Server Mount Points

```typescript
// server/index.ts
const app = express();

// ✅ CORRECT: Mount contracts at /api
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', itemsRoutes);

// Contract paths are relative:
// usersContract path: '/users' → actual URL: /api/users
// itemsContract path: '/items/:id' → actual URL: /api/items/:id
```

---

## Validation

```bash
# Check for /api prefix in contract paths
grep -r "path: '/api/" shared/contracts/
# Expected: ZERO matches (no /api in contract paths)

# Check contract paths are relative
grep -r "path: '/" shared/contracts/ | grep -v "path: '/api"
# Expected: All paths start with / but NOT /api

# Check auth routes don't hardcode /api
grep -r "router\.\(post\|get\|put\|delete\)('/api" server/routes/auth.ts
# Expected: ZERO matches (auth routes should be relative)

# Verify all routes are mounted at /api
grep "app.use('/api'," server/index.ts
# Expected: Multiple matches for authRoutes, apiRoutes, etc.
```

---

## Why This Matters

Including `/api` in contract paths causes double prefix (`/api/api/users`) breaking all API calls. Frontend gets 404 errors for all requests.
