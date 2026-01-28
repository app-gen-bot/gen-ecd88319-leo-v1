# Schema Designer Subagent vs Related Skills - Overlap Analysis

## Executive Summary

**Finding**: Minimal overlap - clean separation of concerns!

- **schema_designer subagent**: CREATES schemas (design phase)
- **Skills**: USE and VALIDATE schemas (implementation & validation phases)

---

## schema_designer Subagent

**Location**: `src/app_factory_leonardo_replit/agents/app_generator/subagents/schema_designer.py`

**Responsibility**: Design type-safe database schemas

### What It Does

1. **Creates Zod validation schemas** (`shared/schema.zod.ts`)
   - Table schemas (e.g., `userSchema`)
   - Insert schemas (e.g., `insertUserSchema`)
   - Query/body schemas (pagination, filters, search)
   - Validation rules (max, min, email, enum, etc.)

2. **Creates Drizzle ORM schemas** (`shared/schema.ts`)
   - PostgreSQL table definitions
   - Foreign key relationships
   - Indexes for performance
   - Exact field parity with Zod schemas

3. **Ensures Schema Quality**
   - Field names match EXACTLY between Zod and Drizzle
   - Auto-injected fields omitted from insert schemas
   - Transform order: omit/partial BEFORE refine
   - All entities from requirements have schemas

### Pattern Files Referenced (7 total)

1. `CORE_IDENTITY.md` - What schema_designer does and why
2. `ZOD_TRANSFORM_ORDER.md` - .omit() before .refine() to prevent ZodEffects errors
3. `AUTO_INJECTED_FIELDS.md` - Security: omit id/userId/timestamps from insert schemas
4. `FIXED_UUIDS.md` - Use RFC 4122 UUIDs in seed data
5. `QUERY_SCHEMA_PLACEMENT.md` - Define ALL query/body schemas in schema.zod.ts
6. `TYPE_SAFETY.md` - Type inference patterns
7. `VALIDATION_CHECKLIST.md` - Pre-completion checks

### When It Runs

**Pipeline Phase**: Build Stage → Schema Generation (first step)

**Before**:
- Plan exists
- Entities identified

**After**:
- schema.zod.ts created
- schema.ts created
- Ready for API contract generation

---

## Related Skills (4 total)

### Skill 1: drizzle-orm-setup

**Location**: `~/.claude/skills/drizzle-orm-setup/`

**When to Use**: Creating storage implementations (`server/lib/storage/*-storage.ts`)

**Responsibility**: HOW to use Drizzle for runtime queries

#### What It Teaches

1. **Creating Drizzle client** (`server/lib/db.ts`)
   ```typescript
   import { drizzle } from 'drizzle-orm/postgres-js';
   import * as schema from '@shared/schema';
   export const db = drizzle(client, { schema });
   ```

2. **Query patterns with Drizzle**
   - SELECT with filters: `db.select().from(schema.users).where(eq(schema.users.id, id))`
   - INSERT: `db.insert(schema.users).values(data).returning()`
   - UPDATE: `db.update(schema.users).set(data).where(...)`
   - DELETE: `db.delete(schema.users).where(...)`
   - Automatic snake_case ↔ camelCase conversion
   - Automatic undefined → null conversion

3. **NOT covered by schema_designer**
   - Database connection setup
   - Query builder usage
   - Runtime query patterns
   - Case conversion behavior

#### Overlap Analysis

| Aspect | schema_designer | drizzle-orm-setup |
|--------|-----------------|-------------------|
| Creates schema.ts | ✅ YES | ❌ NO |
| Defines table structure | ✅ YES | ❌ NO |
| Creates db client | ❌ NO | ✅ YES |
| Query patterns | ❌ NO | ✅ YES |
| Runtime usage | ❌ NO | ✅ YES |

**Overlap**: **0% - Completely complementary**
- schema_designer CREATES the schema
- drizzle-orm-setup USES the schema

---

### Skill 2: schema-query-validator

**Location**: `~/.claude/skills/schema-query-validator/`

**When to Use**: BEFORE generating frontend pages

**Responsibility**: Teach schema constraints to prevent frontend-backend mismatches

#### What It Teaches

1. **Extract constraints from schema.zod.ts**
   - `.max(N)` - Maximum values
   - `.min(N)` - Minimum values
   - `.enum([...])` - Valid enum values
   - `.optional()` - Optional fields
   - `.default(...)` - Default values

2. **Frontend query validation**
   ```typescript
   // Schema says: limit.max(50)
   // Frontend must NOT hardcode: limit: 100 ❌
   // Frontend must respect: limit: 50 ✅
   ```

3. **NOT covered by schema_designer**
   - How to read existing schemas
   - How to validate frontend code against schema
   - Common mismatch patterns

#### Overlap Analysis

| Aspect | schema_designer | schema-query-validator |
|--------|-----------------|------------------------|
| Creates schemas | ✅ YES | ❌ NO |
| Defines constraints | ✅ YES | ❌ NO |
| Reads schemas | ❌ NO | ✅ YES |
| Validates frontend | ❌ NO | ✅ YES |
| Teaches constraints | ⚠️ Defines them | ✅ Explains them |

**Overlap**: **10% - Minimal overlap**
- schema_designer DEFINES constraints (`.max(50)`)
- schema-query-validator TEACHES how to respect constraints in frontend
- Overlap is only in "what constraints exist" but purposes differ

---

### Skill 3: type-safe-queries

**Location**: `~/.claude/skills/type-safe-queries/`

**When to Use**: Choosing between Drizzle ORM vs Supabase PostgREST

**Responsibility**: Decision tree for query approach

#### What It Teaches

1. **Decision criteria**
   - Need RLS? → PostgREST
   - Server-only? → Drizzle ORM
   - Hybrid? → Both

2. **Trade-off comparison**
   - Drizzle: Better type safety, automatic conversion, server-only
   - PostgREST: RLS support, browser-compatible, manual conversion

3. **NOT covered by schema_designer**
   - Query approach selection
   - RLS considerations
   - Performance trade-offs

#### Overlap Analysis

| Aspect | schema_designer | type-safe-queries |
|--------|-----------------|-------------------|
| Creates schemas | ✅ YES | ❌ NO |
| Chooses query tool | ❌ NO | ✅ YES |
| Performance advice | ❌ NO | ✅ YES |
| RLS guidance | ❌ NO | ✅ YES |

**Overlap**: **0% - Completely different concerns**
- schema_designer creates the data model
- type-safe-queries chooses how to query it

---

### Skill 4: storage-factory-validation

**Location**: `~/.claude/skills/storage-factory-validation/`

**When to Use**: AFTER storage implementations created

**Responsibility**: Validate IStorage implementations return identical object shapes

#### What It Teaches

1. **Liskov Substitution Principle**
   - All implementations must return same shapes
   - `MemoryStorage` and `SupabaseStorage` must be interchangeable

2. **Common violations**
   ```typescript
   // ❌ BAD: Different field names
   MemoryStorage.getUser() → { avatarUrl: '...' }  // camelCase
   SupabaseStorage.getUser() → { avatar_url: '...' }  // snake_case

   // ✅ GOOD: Same field names
   Both return → { avatarUrl: '...' }  // Drizzle handles conversion
   ```

3. **NOT covered by schema_designer**
   - Storage layer implementation
   - Factory pattern validation
   - LSP compliance

#### Overlap Analysis

| Aspect | schema_designer | storage-factory-validation |
|--------|-----------------|----------------------------|
| Creates schemas | ✅ YES | ❌ NO |
| Validates storage | ❌ NO | ✅ YES |
| LSP compliance | ❌ NO | ✅ YES |
| Field naming | ✅ Defines | ⚠️ Validates consistency |

**Overlap**: **5% - Only in field naming**
- schema_designer DEFINES field names in schema
- storage-factory-validation VALIDATES implementations use same names
- Both care about naming, but different phases

---

## Overall Overlap Matrix

| Concern | schema_designer | drizzle-orm-setup | schema-query-validator | type-safe-queries | storage-factory-validation |
|---------|-----------------|-------------------|------------------------|-------------------|----------------------------|
| **Schema creation** | ✅ PRIMARY | ❌ | ❌ | ❌ | ❌ |
| **Field definitions** | ✅ PRIMARY | ❌ | ❌ | ❌ | ❌ |
| **Validation rules** | ✅ PRIMARY | ❌ | ⚠️ Reads | ❌ | ❌ |
| **Drizzle client** | ❌ | ✅ PRIMARY | ❌ | ❌ | ❌ |
| **Query patterns** | ❌ | ✅ PRIMARY | ❌ | ⚠️ Compares | ❌ |
| **Frontend validation** | ❌ | ❌ | ✅ PRIMARY | ❌ | ❌ |
| **Query tool choice** | ❌ | ❌ | ❌ | ✅ PRIMARY | ❌ |
| **Storage validation** | ❌ | ❌ | ❌ | ❌ | ✅ PRIMARY |

---

## Temporal Sequence (When Each Is Used)

```
1. schema_designer subagent
   ↓ Creates schema.zod.ts & schema.ts

2. api_architect subagent
   ↓ Creates contracts using schemas

3. code_writer subagent → storage implementation
   ├─ type-safe-queries skill (invoked here)
   │  └─ Chooses Drizzle vs PostgREST
   │
   └─ drizzle-orm-setup skill (invoked here)
      └─ Teaches how to use Drizzle for queries

4. storage-factory-validation skill
   └─ Validates implementations match

5. code_writer subagent → pages implementation
   ├─ schema-query-validator skill (invoked here)
   │  └─ Teaches schema constraints before generating queries
   │
   └─ Generates pages that query APIs
```

---

## Overlap Percentages

1. **schema_designer ↔ drizzle-orm-setup**: 0%
   - No overlap - completely complementary

2. **schema_designer ↔ schema-query-validator**: 10%
   - Minimal overlap - both deal with constraints but different purposes
   - schema_designer DEFINES constraints
   - schema-query-validator TEACHES how to respect them

3. **schema_designer ↔ type-safe-queries**: 0%
   - No overlap - different concerns entirely

4. **schema_designer ↔ storage-factory-validation**: 5%
   - Tiny overlap - both care about field naming
   - schema_designer DEFINES names
   - storage-factory-validation VALIDATES consistency

**Total Average Overlap**: ~4% (essentially none!)

---

## Conclusion

### Clean Separation of Concerns ✅

The architecture has **excellent separation**:

1. **schema_designer subagent** (Design Phase)
   - Creates the data model
   - Defines structure, fields, relationships
   - One-time design activity

2. **drizzle-orm-setup skill** (Implementation Phase)
   - Uses the data model
   - Teaches runtime query patterns
   - How to interact with schemas

3. **schema-query-validator skill** (Validation Phase)
   - Reads the data model
   - Validates frontend respects constraints
   - Prevents mismatches

4. **type-safe-queries skill** (Architecture Phase)
   - Chooses query approach
   - Based on app requirements (RLS, etc.)
   - Independent of schema content

5. **storage-factory-validation skill** (Quality Phase)
   - Validates implementations
   - Ensures LSP compliance
   - After storage is built

### Why This Works

**Single Responsibility Principle**: Each component has ONE job:
- Subagent: Design schemas
- Skill 1: Use schemas for queries
- Skill 2: Validate frontend respects schemas
- Skill 3: Choose query approach
- Skill 4: Validate storage implementations

**No duplication** - each piece of knowledge lives in exactly one place.

**Clear sequence** - each component knows when it's needed in the pipeline.

**Composability** - skills can be invoked independently as needed.

---

## Recommendations

### Keep As-Is ✅

The current structure is excellent:
- **schema_designer** does its job (design)
- **Skills** do their jobs (use, validate, choose)
- No significant overlap to consolidate
- Clear boundaries between concerns

### Potential Improvement (Optional)

Consider adding a **pattern file reference** in schema_designer to mention these skills:

**In `docs/patterns/schema_designer/CORE_IDENTITY.md`**:
```markdown
## Related Skills (Used Later)

After you create schemas, these skills help other agents USE them:
- `drizzle-orm-setup`: How to query schemas at runtime
- `schema-query-validator`: Validate frontend respects constraints
- `type-safe-queries`: Choose Drizzle vs PostgREST
- `storage-factory-validation`: Validate storage implementations

You don't invoke these - they're for code_writer and quality_assurer.
```

This would help schema_designer understand the downstream usage without creating overlap.
