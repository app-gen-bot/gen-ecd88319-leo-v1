---
name: type-safe-queries
description: >
  Use this skill when deciding between Drizzle ORM queries and Supabase
  PostgREST client for database access. Provides decision tree and trade-off
  analysis.
---

# Type-Safe Database Queries: Drizzle vs PostgREST

## Decision Tree

```
Do you need Row Level Security (RLS)?
│
├─ YES → Do users access database directly (browser)?
│   │
│   ├─ YES → Use Supabase PostgREST
│   │         Invoke: supabase-storage skill
│   │
│   └─ NO → Server-only with RLS?
│       │
│       ├─ YES → Use PostgREST with service role
│       │         Invoke: supabase-storage skill
│       │
│       └─ NO → Use Drizzle ORM
│                 Invoke: drizzle-orm-setup skill
│
└─ NO → Use Drizzle ORM
          Invoke: drizzle-orm-setup skill
```

## Comparison Matrix

| Feature | Drizzle ORM | Supabase PostgREST |
|---------|-------------|-------------------|
| **snake_case conversion** | ✅ Automatic | ❌ Manual required |
| **Type safety** | ✅ Compile-time | ⚠️ Runtime only |
| **undefined → null** | ✅ Automatic | ❌ Manual required |
| **Performance** | ✅ Direct PostgreSQL | ⚠️ HTTP overhead |
| **Row Level Security** | ❌ Bypassed | ✅ Enforced |
| **Browser compatible** | ❌ Server only | ✅ Browser + Server |
| **Setup complexity** | ⚠️ Moderate | ✅ Simple |
| **Query syntax** | TypeScript methods | JSON-like builder |

## Recommendations

### Recommendation 1: Server-Only App → Drizzle ORM

**Use Drizzle if**:
- Backend-only application
- No public API endpoints
- RLS not required (or handled in middleware)
- Want type safety and automatic conversion

**Benefits**:
- No manual conversion needed
- Better performance
- Compile-time safety
- Less boilerplate

### Recommendation 2: Public API with RLS → PostgREST

**Use PostgREST if**:
- Exposing database to frontend
- RLS policies protect data
- Browser-compatible client needed

**Trade-offs**:
- Manual conversion required
- More boilerplate
- HTTP overhead

### Recommendation 3: Hybrid Approach

**Use both**:
- Drizzle for complex server queries
- PostgREST for RLS-protected endpoints

**Example**:
```typescript
// Complex analytics: Use Drizzle
const stats = await db
  .select({ count: count(), avg: avg(schema.hands.potSize) })
  .from(schema.hands)
  .innerJoin(schema.sessions, ...);

// User profile (RLS): Use PostgREST
const profile = await supabase
  .from('student_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

## Default Choice for App Factory

**PREFER**: Drizzle ORM

**Reasoning**:
- App factory generates server-side apps
- IStorage pattern is server-only
- Benefits outweigh setup cost
- Prevents snake_case issues automatically

**Override if**: User explicitly needs RLS or browser access
