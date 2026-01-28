# Common Error Patterns & Fixes

**Purpose:** Quick reference for frequent errors

---

## Schema Mismatch

```typescript
// Schema has:
compensation: z.number()

// ❌ Code uses:
compensationAmount: 500

// ✅ Fix:
compensation: 500  // Match schema exactly
```

---

## Import/Export

```typescript
// ❌ WRONG patterns:
import Navigate from 'wouter'  // Not default export
import { apiClient } from './api-client'  // Wrong path

// ✅ CORRECT:
import { Redirect } from 'wouter'
import { apiClient } from '@/lib/api-client'
```

---

## API Routes

```typescript
// ❌ Missing await
const users = storage.getUsers()

// ✅ With await
const users = await storage.getUsers()

// ❌ No error handling
const users = await storage.getUsers()

// ✅ With try-catch
try {
  const users = await storage.getUsers()
} catch (error) {
  logger.error('Failed:', error)
  res.status(500).json({ error: 'Internal error' })
}
```

---

## Frontend Components

```typescript
// ❌ Missing states
return <div>{data.map(...)}</div>

// ✅ All states
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
if (!data?.length) return <EmptyState />
return <div>{data.map(...)}</div>
```

---

## When NOT to Fix

- Fundamental architecture problem
- Requires major refactoring
- Error in external dependency
- Multiple conflicting fixes possible
