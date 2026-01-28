---
name: drizzle-orm-setup
description: >
  Use this skill when setting up Drizzle ORM for a Node.js/TypeScript backend
  with PostgreSQL or Supabase. This skill ensures Drizzle is used for runtime
  queries (not just schema definition) and handles snake_case ↔ camelCase
  conversion automatically.
---

# Drizzle ORM Setup

## When to Use This Skill

**MANDATORY** when:
- Creating `server/lib/storage/*-storage.ts` files
- Setting up database connections for Supabase, PostgreSQL, or Neon
- The app has a Drizzle schema in `shared/schema.ts`

**AUTO-INVOKE** on these patterns:
- User mentions "database storage"
- Creating storage layer with Supabase
- Implementing IStorage interface

## Critical Principle

🚨 **DRIZZLE SCHEMA ≠ DRIZZLE QUERIES**

Having a Drizzle schema (`shared/schema.ts`) does NOT mean you're using Drizzle
for queries. You must:
1. Create a Drizzle client
2. Use that client for all database operations

**Without step #2, Drizzle provides NO runtime benefits.**

## Required Setup

### Step 1: Create Drizzle Client

**File**: `server/lib/db.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set');
}

// Create PostgreSQL client with pooler-safe config
const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false,  // REQUIRED for Supabase transaction pooler - DO NOT REMOVE
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
```

**Environment Variable**:
```bash
# .env - Single pooled URL for both migrations and runtime
DATABASE_URL=postgresql://postgres.{ref}:{pass}@aws-1-{region}.pooler.supabase.com:6543/postgres
```

---

## Database Configuration

Use a **single `DATABASE_URL`** (pooled, port 6543) for both migrations and runtime:

```bash
DATABASE_URL=postgresql://postgres.{ref}:{pass}@aws-1-{region}.pooler.supabase.com:6543/postgres
```

### drizzle.config.ts

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### package.json Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### Why Single URL Works

- **drizzle-kit**: Doesn't use prepared statements for migrations
- **Runtime**: Requires `prepare: false` in postgres.js client (see Step 1 above)

---

### Step 2: Use Drizzle Client in Storage

**File**: `server/lib/storage/supabase-storage.ts`

```typescript
import { db, schema } from '../db';
import { eq, and, desc, count, avg } from 'drizzle-orm';
import type { IStorage } from './factory';

export class SupabaseStorage implements IStorage {
  // SELECT - Single Record
  async getUser(id: number) {
    const result = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);

    // ✅ Drizzle returns camelCase automatically
    return result[0] || null;
  }

  // SELECT - Multiple Records
  async getUsers() {
    const result = await db
      .select()
      .from(schema.users)
      .orderBy(desc(schema.users.createdAt));

    // ✅ Drizzle returns camelCase automatically
    return result;
  }

  // INSERT
  async createUser(data) {
    const result = await db
      .insert(schema.users)
      .values(data)  // ✅ Drizzle accepts camelCase, converts automatically
      .returning();

    // ✅ Returns camelCase automatically
    return result[0];
  }

  // INSERT with explicit ID (for Supabase Auth UUID sync)
  async createUserWithId(data: InsertUserWithId) {
    const now = new Date().toISOString();
    const result = await db
      .insert(schema.users)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning();
    return result[0];
  }

  // UPDATE
  async updateUser(id: number, updates) {
    const result = await db
      .update(schema.users)
      .set(updates)  // ✅ Drizzle accepts camelCase
      .where(eq(schema.users.id, id))
      .returning();

    return result[0];
  }
}
```

## What Drizzle Automatically Handles

✅ **snake_case ↔ camelCase conversion**
- Schema: `playerCards: jsonb('player_cards')`
- Query: `db.select().from(schema.hands)` → returns `{ playerCards: [...] }`
- Insert: `db.insert(schema.hands).values({ playerCards: [...] })` → PostgreSQL gets `player_cards`

✅ **undefined → null conversion**
- JavaScript `undefined` automatically becomes SQL `NULL`

✅ **Type safety**
- TypeScript checks queries at compile time
- Invalid column names → compile error

✅ **Better performance**
- Direct PostgreSQL protocol (not HTTP REST)
- Connection pooling built-in

## Validation Checklist

Before marking storage layer as complete:

- [ ] `server/lib/db.ts` exists with `drizzle()` client
- [ ] `server/lib/db.ts` uses `DATABASE_URL` with `prepare: false`
- [ ] `drizzle.config.ts` uses `DATABASE_URL`
- [ ] Storage class imports `db` and `schema` from `../db`
- [ ] All queries use `db.select()`, `db.insert()`, etc.
- [ ] **ZERO** uses of `getSupabaseClient()` or `.from('table_name')`
- [ ] **ZERO** manual `toSnakeCase()` or `toCamelCase()` conversions
- [ ] Environment has `DATABASE_URL` configured (pooled, port 6543)

## Anti-Patterns (DO NOT DO THIS)

❌ **Using Supabase PostgREST client for queries**:
```typescript
import { createClient } from '@supabase/supabase-js';  // ← WRONG for server queries
const { data } = await supabase.from('users').select('*');  // ← Returns snake_case!
```

❌ **Having Drizzle schema but not using it for queries**:
```typescript
// schema.ts exists but storage uses PostgREST ← WRONG
```

❌ **Manual conversion with Drizzle**:
```typescript
// If using Drizzle, you DON'T need toSnakeCase/toCamelCase!
const dbData = toSnakeCase(data);  // ← UNNECESSARY with Drizzle
```

## PostgREST Client (NOT for Server-Side)

**Do NOT use Supabase PostgREST client for server queries**:
- ❌ Requires manual snake_case ↔ camelCase conversion
- ❌ No transaction support
- ❌ 60% more boilerplate code

**PostgREST is only for**:
- Client-side (browser) database access with RLS (rare pattern)
- Serverless apps with no backend server

**For app-factory apps**: Always use Drizzle ORM for all server-side storage implementations.

## Common Issues & Solutions

### Issue: "Drizzle schema exists but errors persist"

**Diagnosis**: You have the schema but aren't using Drizzle client for queries.

**Solution**: Create `server/lib/db.ts` and replace all PostgREST calls.

### Issue: "undefined values causing PostgreSQL errors"

**Diagnosis**: Using PostgREST client, not Drizzle.

**Solution**: Switch to Drizzle queries OR add manual conversion.

### Issue: "Properties like hand.playerCards are undefined"

**Diagnosis**: PostgREST returns `{ player_cards }`, code expects `{ playerCards }`.

**Solution**: Use Drizzle queries (automatic conversion).

## Package Dependencies

```json
{
  "dependencies": {
    "drizzle-orm": "^0.29.3",
    "postgres": "^3.4.3"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0"
  }
}
```

## Migration Guide

If converting existing PostgREST code to Drizzle:

1. Create `server/lib/db.ts` (see Step 1)
2. Replace one method at a time
3. Test each method
4. Remove `toSnakeCase`/`toCamelCase` helpers when all converted
5. Remove `@supabase/supabase-js` from server imports

## References

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle + Supabase Guide](https://orm.drizzle.team/docs/get-started-postgresql#supabase)
- See: `docs/drizzle-vs-postgrest-analysis.md` for complete analysis
