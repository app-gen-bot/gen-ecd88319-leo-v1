---
name: schema-query-validator
description: Prevent schema-frontend mismatches by teaching schema constraints before page generation
category: validation
priority: P0
issue_addressed: Fizzcard Issue #1 - Schema-frontend mismatch (limit: 100 vs max: 50 → 500 error)
---

# Schema Query Validator

## Purpose

**Proactive Teaching**: Extract and teach schema constraints BEFORE generating frontend pages.

**Reactive Validation**: Confirm all frontend query parameters respect backend schema constraints AFTER generation.

**Problem Being Solved**:
```typescript
// Frontend (LeaderboardPage.tsx)
useQuery({ queryFn: () => api.getLeaderboard({ limit: 100 }) })  // ❌ Hardcoded

// Backend (shared/schema.zod.ts)
leaderboardQuerySchema = z.object({ limit: z.number().max(50) })  // ❌ Mismatch!

// Result: 500 error on first page load
```

---

## When to Invoke (Proactive Teaching)

### 🔧 BEFORE Generating `client/src/pages/*.tsx`

**Pipeline Stage**: 2.4.4 Frontend Implementation → Pages

**Purpose**: Teach agent schema constraints BEFORE writing query code

**Timing**: Right before generating ANY frontend page that fetches data

---

## What Agent Will Learn

When you invoke this skill BEFORE generating pages, you will learn:

### 1. Query Parameter Constraints

**From `shared/schema.zod.ts`**:
```typescript
// Extract constraints from Zod schemas
leaderboardQuerySchema = z.object({
  limit: z.number().max(50),           // ← Max constraint
  sort: z.enum(['points', 'timestamp']) // ← Valid enum values
});

gameQuerySchema = z.object({
  status: z.enum(['active', 'completed', 'pending']),
  page: z.number().min(1),             // ← Min constraint
  pageSize: z.number().max(100)        // ← Max constraint
});
```

**What to extract**:
- `.max(N)` → Maximum value for number fields
- `.min(N)` → Minimum value for number fields
- `.enum([...])` → Valid string/number enum values
- `.optional()` → Field is optional, not required
- `.default(...)` → Default value if not provided

### 2. Contract Requirements

**From `shared/contracts/*.contract.ts`**:
```typescript
// Check query parameter definitions
query: leaderboardQuerySchema,  // ← References schema.zod.ts

// Required vs optional parameters
query: z.object({
  userId: z.number(),           // Required
  includeArchived: z.boolean().optional()  // Optional
})
```

### 3. Insert/Update Schema Constraints

**From `shared/schema.zod.ts`**:
```typescript
// Field length limits
insertUserSchema = z.object({
  name: z.string().max(100),           // ← Max length
  email: z.string().email().max(255),  // ← Email + max length
  bio: z.string().max(500).optional()  // ← Optional with max
});
```

---

## What Agent Should Do

### Step 1: Read Schema Constraints (Before Generation)

```typescript
// BEFORE generating LeaderboardPage.tsx, check:
// File: shared/schema.zod.ts

export const leaderboardQuerySchema = z.object({
  limit: z.number().max(50),
  sort: z.enum(['points', 'timestamp'])
});

// Extract:
// - limit: max value is 50
// - sort: valid values are 'points' or 'timestamp'
```

### Step 2: Generate Pages Respecting Constraints

```typescript
// ✅ CORRECT: Respects max constraint
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.leaderboard.getLeaderboard({
      query: {
        limit: 50,           // ✅ Within max: 50
        sort: 'points'       // ✅ Valid enum value
      }
    })
  });

  // ... rest of page
}
```

### Step 3: Use Valid Default Values

```typescript
// ✅ CORRECT: Uses valid enum default
const [sortBy, setSortBy] = useState<'points' | 'timestamp'>('points');

// ❌ WRONG: Uses invalid default
const [sortBy, setSortBy] = useState('score');  // 'score' not in enum!
```

### Step 4: Respect Insert/Update Constraints

```typescript
// ✅ CORRECT: Validates length before submit
const handleSubmit = async (formData: { name: string; bio: string }) => {
  if (formData.name.length > 100) {
    setError('Name must be 100 characters or less');
    return;
  }

  await apiClient.users.create({ body: formData });
};

// ❌ WRONG: No validation, will fail on backend
const handleSubmit = async (formData: { name: string }) => {
  await apiClient.users.create({ body: formData });  // Might exceed max!
};
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Hardcoded Limits Exceeding Schema

```typescript
// shared/schema.zod.ts
export const leaderboardQuerySchema = z.object({
  limit: z.number().max(50)
});

// client/src/pages/LeaderboardPage.tsx
useQuery(() => api.getLeaderboard({ limit: 100 }))  // ❌ Exceeds max: 50
```

**Why Wrong**: Backend will reject with 400/500 error

**Fix**: Use `limit: 50` or make it configurable with max validation

---

### ❌ Anti-Pattern 2: Invalid Enum Values

```typescript
// shared/schema.zod.ts
export const gameQuerySchema = z.object({
  status: z.enum(['active', 'completed', 'pending'])
});

// client/src/pages/GamesPage.tsx
const [filter, setFilter] = useState('all');  // ❌ 'all' not in enum
useQuery(() => api.games.list({ status: filter }))
```

**Why Wrong**: Backend will reject, or API client won't allow it (type error)

**Fix**: Use valid enum value: `useState<'active' | 'completed' | 'pending'>('active')`

---

### ❌ Anti-Pattern 3: Missing Required Parameters

```typescript
// shared/contracts/users.contract.ts
export const getUsersContract = {
  query: z.object({
    page: z.number(),      // Required
    limit: z.number()      // Required
  })
};

// client/src/pages/UsersPage.tsx
useQuery(() => api.users.list({}))  // ❌ Missing required params
```

**Why Wrong**: Type error + backend validation failure

**Fix**: Provide required params: `api.users.list({ query: { page: 1, limit: 50 } })`

---

### ❌ Anti-Pattern 4: Ignoring Optional Parameters

```typescript
// shared/schema.zod.ts
export const searchQuerySchema = z.object({
  q: z.string(),
  includeArchived: z.boolean().optional()  // Optional with default
});

// client/src/pages/SearchPage.tsx
// ✅ OK: Optional param omitted
useQuery(() => api.search({ query: { q: searchTerm } }))

// ❌ WRONG: Passing undefined explicitly
useQuery(() => api.search({ query: { q: searchTerm, includeArchived: undefined } }))
```

**Why Wrong**: Unnecessary explicit `undefined`, cleaner to omit

**Fix**: Omit optional params or provide explicit value: `includeArchived: true`

---

## Validation (Reactive Confirmation)

### ✅ AFTER Generating All Pages

**Purpose**: Confirm all pages respect schema constraints

**Validation Script**: `scripts/validate-schema-queries.py`

**What It Checks**:
1. All hardcoded number limits ≤ schema max values
2. All enum values exist in schema definitions
3. Required parameters are always provided
4. No placeholder/mock data in query calls
5. All pages use `apiClient` (not direct `fetch`)

**Pass Criteria**:
- ✅ All hardcoded limits ≤ schema max values
- ✅ All enum values match schema definitions
- ✅ Required params always provided
- ✅ No placeholder data (e.g., `limit: 999`, `userId: 1`)
- ✅ All data fetching uses `apiClient` from `@/lib/api-client`

**Failure Examples**:
```
❌ FAIL: LeaderboardPage.tsx:15 - limit: 100 exceeds max: 50
❌ FAIL: GamesPage.tsx:22 - sort: 'score' not in enum ['points', 'timestamp']
❌ FAIL: UsersPage.tsx:18 - missing required param: page
❌ FAIL: DashboardPage.tsx:12 - using placeholder userId: 1
```

---

## How to Run Validation

### Manual Validation

```bash
cd /workspace/app
python ~/.claude/skills/schema-query-validator/scripts/validate-schema-queries.py .
```

### Automated (Pipeline)

The pipeline will automatically invoke this validation after generating all frontend pages.

**Expected Output**:
```
📋 Schema Query Validation Report
=================================

Checking: shared/schema.zod.ts
Extracting constraints from 8 schemas...

Checking: client/src/pages/LeaderboardPage.tsx
  ✅ limit: 50 (within max: 50)
  ✅ sort: 'points' (valid enum value)

Checking: client/src/pages/GamesPage.tsx
  ✅ status: 'active' (valid enum value)
  ✅ page: 1 (within min: 1)

Checking: client/src/pages/UsersPage.tsx
  ✅ All required params provided
  ✅ Using apiClient for data fetching

=================================
✅ VALIDATION PASSED
0 violations found
```

---

## Teaching Examples

### Example 1: Leaderboard with Pagination

**Schema**:
```typescript
// shared/schema.zod.ts
export const leaderboardQuerySchema = z.object({
  limit: z.number().max(50),
  offset: z.number().min(0).default(0),
  sort: z.enum(['points', 'timestamp'])
});
```

**Correct Frontend**:
```typescript
// client/src/pages/LeaderboardPage.tsx
export default function LeaderboardPage() {
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<'points' | 'timestamp'>('points');

  const { data } = useQuery({
    queryKey: ['leaderboard', page, sortBy],
    queryFn: () => apiClient.leaderboard.getLeaderboard({
      query: {
        limit: 50,                    // ✅ Max allowed
        offset: page * 50,            // ✅ Min: 0
        sort: sortBy                  // ✅ Valid enum
      }
    })
  });

  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'points' | 'timestamp')}>
        <option value="points">Points</option>
        <option value="timestamp">Recent</option>
      </select>
      {/* ... */}
    </div>
  );
}
```

---

### Example 2: Create Form with Length Validation

**Schema**:
```typescript
// shared/schema.zod.ts
export const insertGameSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(500).optional(),
  mode: z.enum(['rapid', 'custom', 'campaign'])
});
```

**Correct Frontend**:
```typescript
// client/src/pages/CreateGamePage.tsx
export default function CreateGamePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'rapid' | 'custom' | 'campaign'>('rapid');

  const handleSubmit = async () => {
    // Validate against schema constraints
    if (name.length > 100) {
      setError('Name must be 100 characters or less');
      return;
    }
    if (description.length > 500) {
      setError('Description must be 500 characters or less');
      return;
    }

    await apiClient.games.create({
      body: { name, description, mode }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}  // ✅ Client-side enforcement
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={500}  // ✅ Client-side enforcement
      />
      <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
        <option value="rapid">Rapid</option>
        <option value="custom">Custom</option>
        <option value="campaign">Campaign</option>
      </select>
    </form>
  );
}
```

---

## Summary

**Before generating pages**:
1. Invoke this skill to learn schema constraints
2. Read `shared/schema.zod.ts` to extract max/min/enum values
3. Read `shared/contracts/*.contract.ts` to understand requirements

**During generation**:
1. Use constraints in query parameters (limit ≤ max, valid enums)
2. Add client-side validation for forms (maxLength, pattern)
3. Use type-safe enum values from schema

**After generation**:
1. Run validation script to confirm compliance
2. Fix any violations found
3. Zero schema-frontend mismatches = zero 500 errors on first load

**Impact**: Prevents Fizzcard Issue #1 (500 error due to limit: 100 vs max: 50)
