# Claude Skills for Supabase Integration: A Comprehensive Plan

## Executive Summary

**The Problem We're Solving**: The Supabase integration issues stemmed from a gap between design intent (use Drizzle ORM) and actual implementation (use PostgREST client), causing 55% of storage methods to fail due to missing snake_case ↔ camelCase conversion.

**The Solution**: Use **Claude Agent Skills** to encode best practices, validation rules, and code patterns in discoverable, auto-invoked, specialized knowledge modules that prevent these issues at code generation time.

**The Vision**: Transform the monolithic pipeline-prompt.md into a modular, skill-based architecture where specialized skills are automatically invoked when relevant, providing targeted guidance without overwhelming the main prompt.

---

## What Are Claude Agent Skills?

### Overview (Based on Anthropic's 2025 Release)

Claude Agent Skills are:
- **Self-contained directories** with a `SKILL.md` file containing specialized instructions
- **Auto-invoked** by Claude based on the skill's description matching the task context
- **Progressive disclosure** - Claude loads only what's needed for the current task
- **Composable** - Multiple skills can be active simultaneously
- **Maintainable** - Separate from main prompts, easier to update

### Structure

```
skill-name/
├── SKILL.md           # Required: Instructions with YAML frontmatter
├── reference.md       # Optional: Detailed reference documentation
├── examples.md        # Optional: Concrete code examples
├── scripts/           # Optional: Validation/helper scripts
│   ├── validate.py
│   └── fix.sh
└── templates/         # Optional: Code templates
    └── template.ts
```

### SKILL.md Format

```markdown
---
name: Skill Name
description: What this skill does and when Claude should use it (critical for auto-invocation)
---

# Skill Name

## Core Instructions
Step-by-step guidance for Claude

## Validation Rules
What to check

## Examples
Concrete patterns to follow
```

---

## The Skills-Based Architecture for App Factory

### Current Problem: Monolithic Pipeline

**Today**:
```
pipeline-prompt.md (1000+ lines)
├── Stage 1: Plan
├── Stage 2: Build
│   ├── Schema (100 lines)
│   ├── Auth (150 lines)
│   ├── Storage (100 lines) ← Missing critical Drizzle guidance
│   ├── Routes (150 lines)
│   └── Frontend (500 lines)
└── Stage 3: Validate
```

**Issues**:
- Hard to maintain
- Easy to miss critical details
- Suboptimal for specific tasks
- No automatic validation
- One-size-fits-all approach

### Proposed Solution: Modular Skills Architecture

**Tomorrow**:
```
.claude/
├── skills/
│   ├── app-factory-pipeline/     # Core pipeline orchestration
│   │   └── SKILL.md
│   │
│   ├── drizzle-orm-setup/         # ✅ NEW: Prevents Drizzle issues
│   │   ├── SKILL.md
│   │   ├── reference.md           # Complete Drizzle setup guide
│   │   ├── examples.md            # Query patterns
│   │   ├── scripts/
│   │   │   └── validate-drizzle.sh
│   │   └── templates/
│   │       └── db.ts.template
│   │
│   ├── supabase-storage/          # ✅ NEW: Enforces conversion patterns
│   │   ├── SKILL.md
│   │   ├── reference.md           # Snake_case conversion guide
│   │   ├── examples.md            # SELECT/INSERT patterns
│   │   └── scripts/
│   │       └── validate-storage.sh
│   │
│   ├── type-safe-queries/         # ✅ NEW: Drizzle vs PostgREST choice
│   │   ├── SKILL.md
│   │   └── decision-tree.md
│   │
│   ├── storage-factory-validation/ # ✅ NEW: IStorage contract compliance
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── validate-contract.ts
│   │
│   ├── schema-first-development/  # Existing: Schema design
│   │   └── SKILL.md
│   │
│   └── auth-scaffolding/          # Existing: Auth patterns
│       └── SKILL.md
│
└── commands/
    └── generate-app.md            # Main command (slimmer, delegates to skills)
```

**Benefits**:
- **Separation of Concerns**: Each skill handles one aspect
- **Auto-Invocation**: Claude loads skills as needed
- **Easier Maintenance**: Update one skill without touching others
- **Validation Built-In**: Scripts validate generated code
- **Reusable**: Skills work across different app types
- **Discoverable**: Clear descriptions guide Claude

---

## Detailed Skill Designs

### Skill 1: drizzle-orm-setup

**Purpose**: Ensures Drizzle ORM is properly configured for runtime queries, not just schema definition.

**File**: `.claude/skills/drizzle-orm-setup/SKILL.md`

```markdown
---
name: Drizzle ORM Setup
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

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL!;

// Create PostgreSQL client
const client = postgres(connectionString);

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export { schema };
```

**Environment Variable**:
```bash
# .env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
# Get from: Supabase → Settings → Database → Connection String (Connection pooling)
```

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
- [ ] Storage class imports `db` and `schema` from `../db`
- [ ] All queries use `db.select()`, `db.insert()`, etc.
- [ ] **ZERO** uses of `getSupabaseClient()` or `.from('table_name')`
- [ ] **ZERO** manual `toSnakeCase()` or `toCamelCase()` conversions
- [ ] Environment has `DATABASE_URL` configured

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

## When to Use PostgREST Instead

**ONLY use Supabase PostgREST client if**:
- You need Row Level Security (RLS) enforcement
- Sharing client with frontend code
- Building a public API that respects RLS policies

**If using PostgREST**:
- Do NOT use this skill
- Use the `supabase-storage` skill instead
- MUST implement manual snake_case ↔ camelCase conversion

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
    "drizzle-orm": "^0.38.0",
    "postgres": "^3.4.3"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.0"
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
```

**Supporting Files**:

**File**: `.claude/skills/drizzle-orm-setup/scripts/validate-drizzle.sh`

```bash
#!/bin/bash
# Validates Drizzle setup

echo "🔍 Validating Drizzle ORM Setup..."

# Check 1: db.ts exists
if [ ! -f "server/lib/db.ts" ]; then
  echo "❌ server/lib/db.ts NOT FOUND"
  echo "   Create this file with drizzle() client"
  exit 1
fi

# Check 2: Storage uses Drizzle
if grep -q "getSupabaseClient" server/lib/storage/*-storage.ts; then
  echo "❌ Storage still using Supabase PostgREST client"
  echo "   Should use: import { db } from '../db'"
  exit 1
fi

# Check 3: No manual conversion if using Drizzle
if grep -q "toSnakeCase\|toCamelCase" server/lib/storage/*-storage.ts; then
  echo "⚠️  Manual conversion found - unnecessary with Drizzle"
fi

echo "✅ Drizzle setup validated!"
```

---

### Skill 2: supabase-storage

**Purpose**: Provides patterns for Supabase PostgREST client when Drizzle isn't suitable (e.g., RLS requirements).

**File**: `.claude/skills/supabase-storage/SKILL.md`

```markdown
---
name: Supabase Storage with PostgREST
description: >
  Use this skill when implementing database storage using Supabase PostgREST
  client (not Drizzle ORM). This requires manual snake_case ↔ camelCase
  conversion. ONLY use this if you need Row Level Security or browser
  compatibility. Otherwise, prefer the drizzle-orm-setup skill.
---

# Supabase Storage with PostgREST Client

## When to Use This Skill

**Use PostgREST client ONLY if**:
- You need Row Level Security (RLS) enforcement
- Sharing storage logic with frontend
- Building public API endpoints that respect RLS

**Otherwise**: Use `drizzle-orm-setup` skill instead (automatic conversion, type-safe)

## Critical Requirement

🚨 **MANUAL CONVERSION IS MANDATORY**

PostgreSQL uses `snake_case` columns. JavaScript uses `camelCase` properties.
Supabase PostgREST returns raw PostgreSQL column names.

**Without conversion**:
- Database returns: `{ player_cards: [...] }`
- Code expects: `{ playerCards: [...] }`
- Result: `hand.playerCards` → `undefined` ❌

## Required Helper Functions

**File**: `server/lib/storage/supabase-storage.ts` (top of file)

```typescript
// Helper: Convert camelCase to snake_case for PostgreSQL
function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // CRITICAL: Convert undefined → null (PostgreSQL requirement)
    result[snakeKey] = obj[key] === undefined ? null : obj[key];
  }
  return result;
}

// Helper: Convert snake_case to camelCase for JavaScript
function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}
```

## MANDATORY Patterns

### Pattern 1: SELECT - Single Object

```typescript
async getUser(id: number): Promise<User | null> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;  // Not found
    throw error;
  }

  // ✅ MANDATORY: Convert snake_case → camelCase
  return toCamelCase(data) as User;
}
```

### Pattern 2: SELECT - Array

```typescript
async getUsers(): Promise<User[]> {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // ✅ MANDATORY: Convert each element
  return (data || []).map(item => toCamelCase(item)) as User[];
}
```

### Pattern 3: INSERT

```typescript
async createUser(insertData: InsertUser): Promise<User> {
  // ✅ MANDATORY: Convert camelCase → snake_case BEFORE insert
  const dbData = toSnakeCase(insertData);

  const { data, error } = await getSupabaseClient()
    .from('users')
    .insert(dbData)  // ← Uses converted data
    .select()
    .single();

  if (error) throw error;

  // ✅ MANDATORY: Convert result back to camelCase
  return toCamelCase(data) as User;
}
```

### Pattern 4: UPDATE

```typescript
async updateUser(id: number, updates: Partial<User>): Promise<User> {
  // ✅ MANDATORY: Convert updates to snake_case
  const dbUpdates = toSnakeCase(updates);

  const { data, error } = await getSupabaseClient()
    .from('users')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // ✅ MANDATORY: Convert result back to camelCase
  return toCamelCase(data) as User;
}
```

## Validation Checklist

- [ ] `toSnakeCase()` and `toCamelCase()` helpers exist
- [ ] `toSnakeCase()` converts `undefined` → `null`
- [ ] Every SELECT method uses `toCamelCase()` on return
- [ ] Every SELECT array uses `.map(item => toCamelCase(item))`
- [ ] Every INSERT uses `toSnakeCase()` before `.insert()`
- [ ] Every INSERT uses `toCamelCase()` on returned data
- [ ] Every UPDATE uses `toSnakeCase()` before `.update()`
- [ ] Every UPDATE uses `toCamelCase()` on returned data

## Anti-Patterns

❌ **Returning data without conversion**:
```typescript
return data as User;  // ← WRONG: snake_case from PostgreSQL
```

❌ **Forgetting array element conversion**:
```typescript
return (data || []) as User[];  // ← WRONG: Each element needs conversion
```

❌ **Inserting without conversion**:
```typescript
.insert(insertData)  // ← WRONG: camelCase won't match PostgreSQL columns
```

## See Also

- Use validation script: `/factory/leo/resources/scripts/validate-supabase-storage.sh`
- Full analysis: `/factory/leo/resources/docs/supabase-problems.md`
```

---

### Skill 3: type-safe-queries

**Purpose**: Helps choose between Drizzle ORM and PostgREST based on requirements.

**File**: `.claude/skills/type-safe-queries/SKILL.md`

```markdown
---
name: Type-Safe Database Queries
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
```

---

### Skill 4: storage-factory-validation

**Purpose**: Validates that MemoryStorage and DatabaseStorage return identical object shapes (Liskov Substitution Principle).

**File**: `.claude/skills/storage-factory-validation/SKILL.md`

```markdown
---
name: Storage Factory Validation
description: >
  Use this skill to validate that all IStorage implementations (MemoryStorage,
  SupabaseStorage, etc.) return identical object shapes. Critical for factory
  pattern to work correctly.
---

# Storage Factory Contract Validation

## The IStorage Contract

```typescript
export interface IStorage {
  getUser(id: number): Promise<User | null>;
  createUser(data: InsertUser): Promise<User>;
  // ... all methods
}
```

**Contract Promise**: All implementations return SAME object shapes.

**Why This Matters**:
- Routes use `storage.getUser(1)`
- Should work identically whether storage is Memory or Database
- If shapes differ → routes break when switching storage mode

## Liskov Substitution Principle

**LSP states**: Subtypes must be substitutable for base types.

**Applied to storage**:
```typescript
const storage = createStorage();  // Returns Memory OR Database

const user = await storage.getUser(1);
console.log(user.avatarUrl);  // ← Must work with either implementation
```

**Violation example**:
```typescript
// MemoryStorage returns:
{ id: 1, avatarUrl: 'pic.jpg' }  // ← camelCase

// SupabaseStorage returns:
{ id: 1, avatar_url: 'pic.jpg' }  // ← snake_case

// Routes break: user.avatarUrl is undefined!
```

## Validation Rules

### Rule 1: Property Names Must Match

```typescript
// MemoryStorage
return { id: 1, playerCards: [...] };

// SupabaseStorage
return { id: 1, playerCards: [...] };  // ← SAME property name
```

### Rule 2: Nested Objects Must Match

```typescript
// Both must return:
{
  id: 1,
  profile: {
    skillLevel: 'beginner',  // ← Same nesting, same names
    currentXp: 100
  }
}
```

### Rule 3: Array Elements Must Match

```typescript
// Both must return:
[
  { id: 1, handNumber: 1 },  // ← Each element has same shape
  { id: 2, handNumber: 2 }
]
```

## Validation Script

**File**: `.claude/skills/storage-factory-validation/scripts/validate-contract.ts`

```typescript
import { MemoryStorage } from '../server/lib/storage/mem-storage';
import { SupabaseStorage } from '../server/lib/storage/supabase-storage';

async function validateContract() {
  const memStorage = new MemoryStorage();
  const dbStorage = new SupabaseStorage();

  // Create test data
  const testUser = { email: 'test@example.com', name: 'Test' };

  // Create in both
  const memUser = await memStorage.createUser(testUser);
  const dbUser = await dbStorage.createUser(testUser);

  // Compare property names
  const memKeys = Object.keys(memUser).sort();
  const dbKeys = Object.keys(dbUser).sort();

  if (JSON.stringify(memKeys) !== JSON.stringify(dbKeys)) {
    console.error('❌ Property names differ!');
    console.error('Memory:', memKeys);
    console.error('Database:', dbKeys);
    process.exit(1);
  }

  // Check for snake_case leaks
  const hasSnakeCase = dbKeys.some(key => key.includes('_'));
  if (hasSnakeCase) {
    console.error('❌ Database storage returns snake_case!');
    process.exit(1);
  }

  console.log('✅ Storage contract validated');
}

validateContract();
```

## Common Violations

### Violation 1: Missing Conversion

**Symptom**: Properties undefined when using database storage

**Cause**: Database returns snake_case, code expects camelCase

**Fix**: Use Drizzle (automatic) or add toCamelCase() conversion

### Violation 2: Inconsistent Null Handling

**Symptom**: Properties are `undefined` in one, `null` in other

**Cause**: Different handling of missing values

**Fix**: Standardize on `null` for missing values (TypeScript convention)

### Violation 3: Different Nesting

**Symptom**: Some properties are nested in one but flat in other

**Cause**: Inconsistent object construction

**Fix**: Match nesting structure exactly

## Checklist

- [ ] Run validation script
- [ ] All property names match (case-sensitive)
- [ ] No snake_case in returned objects
- [ ] Null vs undefined consistent
- [ ] Nested object structures match
- [ ] Array element structures match
```

---

## Implementation Strategy

### Phase 1: Create Core Skills (Week 1)

1. **drizzle-orm-setup** - Highest priority, prevents 55% of current issues
2. **supabase-storage** - For cases where PostgREST is needed
3. **type-safe-queries** - Decision guide
4. **storage-factory-validation** - Contract enforcement

### Phase 2: Integrate with Pipeline (Week 2)

**Update**: `docs/pipeline-prompt.md`

**From**:
```markdown
#### 2.2.1 Drizzle Schema
Convert Zod schemas to Drizzle ORM...
```

**To**:
```markdown
#### 2.2.1 Drizzle Schema
Convert Zod schemas to Drizzle ORM...

**IMPORTANT**: When you create the schema, you MUST also set up Drizzle
for runtime queries. Invoke the `drizzle-orm-setup` skill to ensure
proper configuration.
```

**From**:
```markdown
#### 2.2.3 Storage Scaffolding
```typescript
export class DatabaseStorage implements IStorage { ... }
```
```

**To**:
```markdown
#### 2.2.3 Storage Scaffolding

**DECISION**: Choose query method:
- Invoke `type-safe-queries` skill to decide between Drizzle and PostgREST
- Then invoke either `drizzle-orm-setup` or `supabase-storage` skill
- Finally, invoke `storage-factory-validation` skill to verify contract
```

### Phase 3: Add Validation to Subagents (Week 3)

**Update**: Subagent prompts (code_writer, schema_designer, etc.)

```markdown
After generating storage code:
1. Invoke `storage-factory-validation` skill
2. Run validation script
3. Fix any contract violations before proceeding
```

### Phase 4: Create Additional Skills (Ongoing)

- **auth-scaffolding** - Auth patterns
- **api-contracts** - ts-rest contract patterns
- **frontend-integration** - API client setup
- **deployment-ready** - Production config validation
- **ai-integration** - AI feature patterns

---

## Benefits Analysis

### Before Skills (Current State)

**Pipeline**: 1000+ line monolithic prompt
- Hard to maintain
- Easy to miss details
- No validation
- One-size-fits-all

**Result**:
- 55% of methods had bugs
- 2+ hours debugging per app
- Manual conversion needed
- TypeScript couldn't help

### After Skills (Proposed State)

**Pipeline**: Slim orchestrator + specialized skills
- Skills auto-invoked when relevant
- Validation built-in
- Concrete examples provided
- Progressive disclosure

**Result**:
- 0% method bugs (validated at generation)
- 15 minutes validation per app
- Automatic conversion (Drizzle)
- Type-safe by design

### Maintenance Benefits

**Today**: Update pipeline-prompt.md
- Risk breaking other sections
- Hard to test changes
- All-or-nothing updates

**Tomorrow**: Update specific skill
- Isolated changes
- Easy to test one skill
- Gradual rollout
- Versioning per skill

### Developer Experience

**Today**: Read 1000-line prompt to understand patterns
- Information overload
- Easy to miss critical details
- Copy-paste errors common

**Tomorrow**: Claude loads relevant skills automatically
- Just-in-time information
- Concrete patterns provided
- Validation catches errors
- Learning by example

---

## Migration Path

### Step 1: Create Skills Directory

```bash
mkdir -p .claude/skills
```

### Step 2: Create Priority Skills

```bash
# Highest priority - prevents Supabase issues
.claude/skills/drizzle-orm-setup/SKILL.md
.claude/skills/supabase-storage/SKILL.md
.claude/skills/type-safe-queries/SKILL.md
.claude/skills/storage-factory-validation/SKILL.md
```

### Step 3: Test Skills

```bash
# Test with Claude Code
# Task: "Generate a Supabase storage layer"
# Verify: Skills are auto-invoked, validation runs
```

### Step 4: Update Pipeline

```bash
# Add skill invocation points to pipeline-prompt.md
# Remove redundant detail (now in skills)
```

### Step 5: Validate

```bash
# Generate test app
# Verify: No snake_case issues
# Verify: Drizzle properly configured
# Verify: Storage contract validated
```

---

## Success Metrics

### Code Quality
- **Target**: 0 methods with snake_case issues (vs 55% today)
- **Measure**: Run validation script on generated code

### Developer Time
- **Target**: 15 min validation (vs 2+ hours debugging today)
- **Measure**: Time from generation to working app

### Maintainability
- **Target**: Update one skill without affecting others
- **Measure**: Number of files changed per update

### Discoverability
- **Target**: Claude auto-invokes correct skill 95%+ of time
- **Measure**: Manual invocation rate

---

## Advanced: Skill Composition

### Example: Full Stack Generation

**User**: "Generate a full-stack app with Supabase"

**Claude's Skill Invocation Chain**:

1. **app-factory-pipeline** - Orchestrates overall flow
2. **schema-first-development** - Designs Zod + Drizzle schemas
3. **type-safe-queries** - Decides Drizzle vs PostgREST
4. **drizzle-orm-setup** - Configures Drizzle client (if chosen)
5. **storage-factory-validation** - Validates IStorage contract
6. **api-contracts** - Generates ts-rest contracts
7. **frontend-integration** - Sets up API client
8. **auth-scaffolding** - Implements auth patterns

**Result**: Fully integrated, validated, working app

### Example: Fix Existing App

**User**: "Fix the snake_case issues in RaiseIQ"

**Claude's Skill Invocation Chain**:

1. **supabase-storage** - Detects PostgREST usage
2. Adds conversion helpers
3. **storage-factory-validation** - Validates all methods
4. Runs validation script
5. Reports results

---

## Conclusion

Claude Agent Skills provide the **perfect architecture** for preventing the Supabase integration issues we identified:

### The Core Insight

**Problem**: Monolithic prompt can't provide enough detail without overwhelming Claude

**Solution**: Modular skills provide deep expertise when needed, automatically

### The Transformation

**From**: "Here's 100 lines about Drizzle in a 1000-line prompt"
- Easy to skip
- Hard to maintain
- No validation

**To**: "Invoke drizzle-orm-setup skill when you see Drizzle schema"
- Automatic activation
- Isolated maintenance
- Built-in validation
- Concrete examples

### The Impact

**Prevents**:
- Snake_case issues (automatic via Drizzle)
- Missing conversions (validation catches)
- Contract violations (LSP validation)
- Schema-only Drizzle (setup guide)

**Enables**:
- Modular pipeline (easier to maintain)
- Auto-invocation (smarter agent)
- Validation scripts (catch issues early)
- Progressive disclosure (just-in-time info)

### Next Steps

1. Create the 4 priority skills
2. Test with new app generation
3. Integrate into pipeline
4. Expand skill library
5. Measure success metrics

**The future of app-factory is skill-based architecture.** This is how we prevent entire classes of bugs before they happen.

---

**Document Version**: 1.0
**Date**: 2025-01-21
**Author**: ULTRATHINK analysis of Claude Skills + Supabase issues
**Status**: Comprehensive plan ready for implementation
**Related**: docs/supabase-problems.md, docs/drizzle-vs-postgrest-analysis.md
