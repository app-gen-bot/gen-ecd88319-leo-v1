# Schema-First Architecture

**Date**: 2025-01-23
**Author**: AI Agent System
**Purpose**: Document the centralized schema architecture that enforces type safety and prevents schema drift

---

## Problem Statement

### The Bug That Led To This Refactor

**Issue**: Frontend requested `limit=1000` on connections endpoint, but backend validation only allowed `max(100)`, causing 500 Internal Server Error.

**Root Cause**: Schema duplication across three layers:
1. **Contract** defined query schema inline
2. **Backend route** re-defined the same query schema inline
3. **Frontend** had no compile-time awareness of the limits

This created a situation where:
- ❌ Schemas could drift between contract and route
- ❌ Frontend TypeScript types didn't enforce runtime limits
- ❌ No single source of truth
- ❌ Manual synchronization required (and failed)

---

## Solution: Centralized Schema Pattern

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    shared/schema.zod.ts                      │
│                  SINGLE SOURCE OF TRUTH                      │
│  - Entity schemas (users, connections, events, etc.)        │
│  - Query parameter schemas (pagination, filters, etc.)      │
│  - All Zod validation rules defined once                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ imports
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│ shared/contracts/*.ts│         │ server/routes/*.ts   │
│  (ts-rest contracts) │         │  (Express handlers)  │
│                      │         │                      │
│ Uses shared schemas  │         │ Uses shared schemas  │
│ for query/body/etc.  │         │ for validation       │
└──────────────────────┘         └──────────────────────┘
          │                                 │
          │ generates types                 │ validates runtime
          ▼                                 ▼
┌──────────────────────┐         ┌──────────────────────┐
│ client/src/**/*.tsx  │         │ HTTP Request         │
│  (React components)  │────────▶│ (API call)           │
│                      │         │                      │
│ TypeScript enforces  │         │ Zod validates        │
│ contract types       │         │ against same schema  │
└──────────────────────┘         └──────────────────────┘
```

### Key Principle

**Every query parameter, filter, and validation rule MUST be defined in `shared/schema.zod.ts` and imported everywhere it's used.**

---

## Implementation Details

### 1. Centralized Query Schemas

Located in: `shared/schema.zod.ts` (lines 284-432)

Example:
```typescript
/**
 * Connections query parameters
 * Used in: connections.contract.ts, connections.ts route
 */
export const connectionsQuerySchema = z.object({
  location: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  tags: z.string().optional(), // Comma-separated tags
  sortBy: z.enum(['recent', 'strength', 'name']).optional().default('recent'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20), // ← Single source of truth
});
```

### 2. Contract Usage

Located in: `shared/contracts/*.contract.ts`

**Before (WRONG - Inline Schema)**:
```typescript
export const connectionsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/connections',
    query: z.object({
      location: z.string().optional(),
      // ... duplicated schema definition
      limit: z.coerce.number().min(1).max(10000).optional(), // ← Out of sync!
    }),
  }
});
```

**After (CORRECT - Shared Schema)**:
```typescript
import { connectionsQuerySchema } from '../schema.zod';

export const connectionsContract = c.router({
  getAll: {
    method: 'GET',
    path: '/api/connections',
    query: connectionsQuerySchema, // ← Single source of truth
  }
});
```

### 3. Backend Route Usage

Located in: `server/routes/*.ts`

**Before (WRONG - Inline Schema)**:
```typescript
router.get('/', authMiddleware(), async (req, res) => {
  const querySchema = z.object({
    location: z.string().optional(),
    // ... duplicated schema definition
    limit: z.coerce.number().min(1).max(100).optional(), // ← Might drift from contract
  });

  const query = querySchema.parse(req.query);
  // ...
});
```

**After (CORRECT - Shared Schema)**:
```typescript
import { connectionsQuerySchema } from '../../shared/schema.zod';

router.get('/', authMiddleware(), async (req, res) => {
  // Use centralized query schema from schema.zod.ts
  const query = connectionsQuerySchema.parse(req.query);
  // ...
});
```

### 4. Frontend Usage

Located in: `client/src/**/*.tsx`

**Before (WRONG - Violating Schema)**:
```typescript
const result = await apiClient.connections.getAll({
  query: { limit: 1000 } // ← Violates max(100), causes 500 error
});
```

**After (CORRECT - Respecting Schema)**:
```typescript
const result = await apiClient.connections.getAll({
  query: { limit: 100 } // ← Respects schema max(100)
});
```

---

## Schema Inventory

All centralized query schemas in `shared/schema.zod.ts`:

| Schema Name                      | Max Limit | Used In Contracts        | Used In Routes          |
|----------------------------------|-----------|--------------------------|-------------------------|
| `paginationQuerySchema`          | 100       | (base schema)            | (base schema)           |
| `connectionsQuerySchema`         | 100       | connections.contract.ts  | connections.ts          |
| `contactExchangesQuerySchema`    | 100       | contactExchanges.contract.ts | contactExchanges.ts |
| `fizzCoinTransactionsQuerySchema`| 100       | fizzCoin.contract.ts     | wallet.ts               |
| `introductionsQuerySchema`       | 100       | introductions.contract.ts| introductions.ts        |
| `eventsQuerySchema`              | 100       | events.contract.ts       | events.ts               |
| `eventAttendeesQuerySchema`      | 100       | events.contract.ts       | events.ts               |
| `fizzCardsQuerySchema`           | 100       | fizzCards.contract.ts    | fizzCards.ts            |
| `leaderboardQuerySchema`         | 50        | leaderboard.contract.ts  | leaderboard.ts          |
| `networkGraphQuerySchema`        | N/A       | network.contract.ts      | network.ts              |
| `superConnectorsQuerySchema`     | 50        | network.contract.ts      | network.ts              |
| `searchConnectionsQuerySchema`   | 100       | search.contract.ts       | search.ts               |
| `searchUsersQuerySchema`         | 100       | search.contract.ts       | search.ts               |

---

## Benefits

### ✅ Type Safety
- Frontend gets accurate TypeScript types from contracts
- Contract types match runtime validation exactly
- Impossible for contract and route to drift

### ✅ Single Source of Truth
- All validation rules defined once in `schema.zod.ts`
- Change limit in one place → updates everywhere
- No manual synchronization needed

### ✅ Compile-Time Errors
- TypeScript catches mismatches during development
- `npx tsc --noEmit` verifies schema consistency
- Prevents runtime errors in production

### ✅ Documentation
- JSDoc comments in schema file explain usage
- Easy to see all query parameters in one place
- Clear mapping between schemas and endpoints

### ✅ Maintainability
- New developers see schemas in centralized location
- Refactoring is safe (TypeScript catches breaking changes)
- Testing is easier (mock same schemas used in production)

---

## Rules & Guidelines

### DO ✅

1. **Define all schemas in `shared/schema.zod.ts`**
   ```typescript
   export const myQuerySchema = z.object({
     limit: z.coerce.number().min(1).max(100).optional().default(20),
   });
   ```

2. **Import and use shared schemas**
   ```typescript
   import { myQuerySchema } from '../schema.zod';
   query: myQuerySchema,
   ```

3. **Add JSDoc comments to schemas**
   ```typescript
   /**
    * My Query Parameters
    * Used in: my.contract.ts, my.ts route
    */
   export const myQuerySchema = ...
   ```

4. **Respect schema limits in frontend**
   ```typescript
   query: { limit: 100 } // Never exceed schema max
   ```

### DON'T ❌

1. **Never define inline schemas in contracts**
   ```typescript
   // WRONG:
   query: z.object({ limit: z.coerce.number()... })
   ```

2. **Never re-define schemas in routes**
   ```typescript
   // WRONG:
   const querySchema = z.object({ limit: z.coerce.number()... });
   ```

3. **Never make API calls that violate schemas**
   ```typescript
   // WRONG:
   query: { limit: 1000 } // If schema max is 100
   ```

4. **Never skip schema updates when changing endpoints**
   - Update `schema.zod.ts` first
   - Then update contract
   - Then update route
   - Verify with TypeScript compilation

---

## Migration Checklist

When adding a new query parameter or endpoint:

- [ ] Define schema in `shared/schema.zod.ts`
- [ ] Add JSDoc comment documenting usage
- [ ] Import schema in contract file
- [ ] Use schema in contract definition
- [ ] Import schema in route file
- [ ] Use schema in route handler
- [ ] Run `npx tsc --noEmit` to verify
- [ ] Test endpoint with valid/invalid values
- [ ] Update this documentation if needed

---

## Testing Schema Enforcement

### Test 1: Valid Request (Should Succeed)
```bash
curl "http://localhost:5013/api/connections?limit=50" -H "Authorization: Bearer TOKEN"
# Expected: 200 OK with data
```

### Test 2: Exceeding Max Limit (Should Fail)
```bash
curl "http://localhost:5013/api/connections?limit=101" -H "Authorization: Bearer TOKEN"
# Expected: 500 Internal Server Error (Zod validation error)
```

### Test 3: TypeScript Compilation
```bash
npx tsc --noEmit
# Expected: No errors in shared/contracts/* or server/routes/*
```

---

## Troubleshooting

### Problem: Frontend request fails with 500 error

**Diagnosis**:
1. Check browser DevTools → Network tab for request URL
2. Look for query parameters that might exceed limits
3. Check server logs for Zod validation errors

**Solution**:
1. Find the frontend code making the API call
2. Check the `query:` parameter values
3. Verify they respect the schema limits in `schema.zod.ts`
4. Update frontend to use valid values

### Problem: Contract and route seem out of sync

**Diagnosis**:
1. Check if contract defines schema inline instead of importing
2. Check if route defines schema inline instead of importing
3. Run `npx tsc --noEmit` to find type mismatches

**Solution**:
1. Move inline schema to `shared/schema.zod.ts`
2. Import and use centralized schema in both contract and route
3. Verify TypeScript compilation succeeds

---

## Future Improvements

### Consideration: Automatic Type Inference

Instead of manually defining query schemas, we could explore using the contract definition as the source of truth and generating schemas from it. However, this reverses the flow and may lose validation-first benefits.

### Consideration: Runtime Limit Override

Some endpoints might legitimately need higher limits for specific use cases (e.g., admin exports). Consider:
- Separate schemas for admin vs regular users
- Role-based limit adjustments
- Database pagination with cursor-based fetching for large datasets

### Consideration: Schema Versioning

For API versioning, consider:
- Version suffix on schemas (`connectionsQuerySchemaV2`)
- Separate schema files per API version
- Migration guides for breaking changes

---

## References

- **Zod Documentation**: https://zod.dev
- **ts-rest Documentation**: https://ts-rest.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/

---

## Summary

This schema-first architecture ensures that:

1. **All validation rules live in one place** (`shared/schema.zod.ts`)
2. **Contracts and routes import (not duplicate) schemas**
3. **Frontend gets accurate TypeScript types from contracts**
4. **Runtime validation matches compile-time types exactly**
5. **Schema drift is impossible** (TypeScript catches mismatches)

By following this pattern, we prevent the entire class of bugs caused by schema inconsistency and ensure type safety from database to UI.
