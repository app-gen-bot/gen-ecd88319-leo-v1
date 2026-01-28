---
name: schema-designer
description: >
  Design type-safe database schemas with Zod validation and Drizzle ORM.
  Use when creating or modifying shared/schema.zod.ts and shared/schema.ts.
  Ensures field parity, security patterns, and validation best practices.
category: implementation
priority: P0
---

# Schema Designer

## When to Use

**MANDATORY** when:
- Creating `shared/schema.zod.ts` or `shared/schema.ts`
- Adding/modifying database entities
- User mentions "schema", "database", "tables", "data model"

---

## Core Patterns (8 Critical)

### 1. Auto-Injected Fields Security

**Problem**: Backend injects fields from `req.user` AFTER validation.

```typescript
// ✅ CORRECT: Omit auto-injected fields
export const insertOrderSchema = orderSchema.omit({
  id: true,           // Auto-generated UUID
  userId: true,       // Injected from req.user.id
  createdAt: true,    // Auto-timestamp
  updatedAt: true     // Auto-timestamp
}).strict();

// ❌ WRONG: Including userId → client can forge ownership
export const insertOrderSchema = orderSchema.omit({ id: true });
```

**Rule**: Omit id, userId, createdAt, updatedAt from insert schemas.

---

### 2. Transform Order (Zod)

**Problem**: `.refine()` returns `ZodEffects`, breaking `.omit()`, `.partial()`, `.pick()`.

```typescript
// ✅ CORRECT: Transform → Refine
export const insertSchema = baseSchema
  .omit({ id: true })      // Transform first
  .partial({ role: true }) // Transform second
  .strict()                // Before refine
  .refine(data => ...)     // Refine last

// ❌ WRONG: Refine → Transform (compile error)
export const insertSchema = baseSchema
  .refine(data => ...)     // Returns ZodEffects
  .omit({ id: true });     // Error: .omit() not on ZodEffects
```

**Rule**: All transforms (omit/pick/partial/extend/strict) BEFORE refinements.

---

### 3. UUIDs (Not Auto-Increment)

**Problem**: Auto-increment IDs expose record counts and are predictable.

```typescript
// ✅ CORRECT: UUIDs
// schema.zod.ts
export const userSchema = z.object({
  id: z.string().uuid(),
  // ...
});

// schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ...
});

// ❌ WRONG: Auto-increment integers
id: z.number()
id: serial('id').primaryKey()
```

**Rule**: Always use UUIDs for primary keys.

---

### 4. Strict Insert Schemas

**Problem**: Without `.strict()`, extra fields pass validation silently.

```typescript
// ✅ CORRECT: Use .strict() on insert schemas
export const insertUserSchema = userSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .strict();

// ❌ WRONG: Missing .strict() allows extra fields
export const insertUserSchema = userSchema.omit({ id: true });
// { name: "John", hackField: "malicious" } would pass!
```

**Rule**: Always add `.strict()` to insert schemas.

---

### 5. Query Schemas in schema.zod.ts

**Problem**: Inline query schemas in contracts cause duplication.

```typescript
// ✅ CORRECT: Define once in schema.zod.ts
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Extend for entity-specific queries
export const ordersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['pending', 'completed']).optional(),
  search: z.string().optional(),
});

// In contracts - import, don't redefine
import { ordersQuerySchema } from '../schema.zod';

// ❌ WRONG: Inline duplication in contract
query: z.object({ page: z.number(), limit: z.number() })
```

**Rule**: ALL schemas (entities, queries, filters) live in schema.zod.ts.

---

### 6. Exact Field Parity (Zod ↔ Drizzle)

**Problem**: Field name mismatch causes runtime errors.

```typescript
// ✅ CORRECT: Exact field names (camelCase in both)
// schema.zod.ts
export const userSchema = z.object({
  id: z.string().uuid(),
  avatarUrl: z.string().nullable(),  // camelCase
  createdAt: z.string().datetime(),
});

// schema.ts
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  avatarUrl: text('avatar_url'),           // camelCase field, snake_case column
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

// ❌ WRONG: Field name mismatch
// Zod: avatarUrl
// Drizzle: avatar_url (as field name!)
```

**Rule**: Field names MUST match exactly. Column names can be snake_case.

**Cross-Layer Rule**: Use exact field names in components.

```typescript
// schema.zod.ts defines: title
// Component MUST use: {item.title}
// NOT: {item.name} ❌
```

---

### 7. Timestamp Mode (JSON Compatibility)

**Problem**: Default `Date` objects don't serialize to JSON properly.

```typescript
// ✅ CORRECT: mode: 'string'
createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()

// ❌ WRONG: Date objects break JSON serialization
createdAt: timestamp('created_at').defaultNow()
```

**Rule**: Always `{ mode: 'string' }` for timestamps.

---

### 8. Type Inference Exports

**Problem**: Without type exports, you lose end-to-end type safety.

```typescript
// ✅ CORRECT: Export inferred types for every schema
export const userSchema = z.object({ ... });
export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({ ... }).strict();
export type InsertUser = z.infer<typeof insertUserSchema>;

export const updateUserSchema = insertUserSchema.partial();
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Now storage, routes, and frontend all share the same types
```

**Rule**: Export both schema AND inferred type for every entity.

---

## Workflow

### New App
1. **Read plan.md** → Identify entities and relationships
2. **Create schema.zod.ts** first:
   - Define enums as separate exports
   - Users table (ALWAYS include)
   - Entity schemas with all fields
   - Insert schemas (omit auto-injected + .strict())
   - Update schemas (.partial())
   - Query/filter schemas
   - Type exports for all schemas
3. **Create schema.ts**:
   - Mirror Zod with exact field parity
   - Add foreign keys with `.references()`
   - Use `{ mode: 'string' }` for timestamps
   - Optionally add Drizzle relations
4. **Verify** field parity manually

### Existing App
1. **Read existing** schema.zod.ts and schema.ts
2. **Identify change** - ADD/MODIFY/DELETE
3. **Apply changes** to BOTH files maintaining parity
4. **Verify** changes don't break existing contracts

---

## Templates

### schema.zod.ts

```typescript
import { z } from 'zod';

// ============================================
// ENUMS (define separately for reuse)
// ============================================
export const userRoleEnum = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof userRoleEnum>;

export const orderStatusEnum = z.enum(['pending', 'processing', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof orderStatusEnum>;

// ============================================
// USERS (ALWAYS include)
// ============================================
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: userRoleEnum,
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).strict();

export type InsertUser = z.infer<typeof insertUserSchema>;

// For Supabase Auth UUID sync (includes id field)
export const insertUserWithIdSchema = userSchema.omit({
  createdAt: true,
  updatedAt: true,
}).strict();
export type InsertUserWithId = z.infer<typeof insertUserWithIdSchema>;

export const updateUserSchema = insertUserSchema.partial();
export type UpdateUser = z.infer<typeof updateUserSchema>;

// ============================================
// ORDERS (Example entity with userId)
// ============================================
export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: orderStatusEnum,
  totalAmount: z.number().min(0),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Order = z.infer<typeof orderSchema>;

export const insertOrderSchema = orderSchema.omit({
  id: true,
  userId: true,     // Auto-injected from req.user.id
  createdAt: true,
  updatedAt: true,
}).strict();

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const updateOrderSchema = orderSchema.pick({
  title: true,
  status: true,
  totalAmount: true,
  notes: true,
}).partial();

export type UpdateOrder = z.infer<typeof updateOrderSchema>;

// ============================================
// QUERY SCHEMAS (reusable across contracts)
// ============================================
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const ordersQuerySchema = paginationQuerySchema.extend({
  status: orderStatusEnum.optional(),
  search: z.string().optional(),
});

export type OrdersQuery = z.infer<typeof ordersQuerySchema>;

// ============================================
// API RESPONSE SCHEMAS
// ============================================
export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
```

### schema.ts

```typescript
import { pgTable, uuid, text, timestamp, boolean, real, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================
// ORDERS
// ============================================
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  status: text('status').notNull().default('pending'),
  totalAmount: real('total_amount').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

// ============================================
// RELATIONS (optional but recommended)
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
```

---

## Checklist

Before proceeding to contracts, verify:

- [ ] Users table exists in both files
- [ ] Enums defined and exported separately
- [ ] All entities have: schema + insertSchema + updateSchema + types
- [ ] Insert schemas use `.omit()` + `.strict()`
- [ ] Auto-injected fields omitted (id, userId, createdAt, updatedAt)
- [ ] UUIDs used for all IDs (not serial/auto-increment)
- [ ] Field names match exactly (Zod ↔ Drizzle)
- [ ] Timestamps use `{ mode: 'string' }`
- [ ] Query schemas defined for pagination/filtering
- [ ] Types exported for all schemas
- [ ] Foreign keys defined with `.references()`

---

## Common Mistakes

| Mistake | Consequence | Fix |
|---------|-------------|-----|
| Including userId in insert | Security breach (forge ownership) | Add to `.omit()` |
| Missing `.strict()` | Extra fields pass silently | Add `.strict()` to insert schemas |
| Refine before omit | TypeScript compile error | Transforms first, refine last |
| Auto-increment IDs | Predictable, exposes count | Use UUIDs |
| Inline query schemas | Duplication, drift | Define in schema.zod.ts |
| Field name mismatch | Runtime errors | Exact camelCase parity |
| Missing timestamp mode | JSON serialization fails | `{ mode: 'string' }` |
| No type exports | Lose type safety | Export `type X = z.infer<...>` |
| No update schema | Can't do partial updates | Add `.partial()` variant |
