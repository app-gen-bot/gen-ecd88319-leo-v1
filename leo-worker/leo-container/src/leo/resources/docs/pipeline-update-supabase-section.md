# Pipeline Update: Supabase Storage Section

## Instructions

This content should be INSERTED into `docs/pipeline-prompt.md` at **line 251** (after the MemoryStorage example, before API Routes section).

This addition makes the snake_case ↔ camelCase conversion **MANDATORY** and provides concrete code examples.

---

## Content to Add

```markdown

#### 2.2.3.1 Database Storage Implementation (Supabase/PostgreSQL)

**CRITICAL: PostgreSQL snake_case ↔ JavaScript camelCase Impedance Mismatch**

PostgreSQL columns use `snake_case` naming (e.g., `player_cards`, `student_id`).
JavaScript/TypeScript uses `camelCase` naming (e.g., `playerCards`, `studentId`).

**The IStorage contract requires both implementations return IDENTICAL object shapes.**

**Helper Functions** (MANDATORY - add to top of `supabase-storage.ts`):

```typescript
// Helper: Convert camelCase to snake_case for PostgreSQL
// CRITICAL: Also converts undefined → null (PostgreSQL cannot accept undefined)
function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // Convert undefined to null for PostgreSQL compatibility
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

**File: `server/lib/storage/supabase-storage.ts`**

**MANDATORY PATTERNS** (every method MUST follow these):

**Pattern 1: SELECT - Single Object**

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

**WHY**: Supabase PostgREST returns `{ id: 1, player_cards: [...] }` but consuming code expects `{ id: 1, playerCards: [...] }`. Without conversion, `user.playerCards` will be `undefined`.

**Pattern 2: SELECT - Array**

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

**WHY**: Every element in the array has snake_case properties. MUST convert each one.

**Pattern 3: INSERT**

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

**WHY**:
1. Input has camelCase (e.g., `{ playerCards: [...] }`)
2. PostgreSQL expects snake_case columns (e.g., `player_cards`)
3. Without conversion, INSERT will fail or create NULL values
4. Also handles undefined → null conversion (PostgreSQL requirement)

**Pattern 4: UPDATE**

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

**Pattern 5: Handling Undefined in Routes**

In route handlers, ALWAYS convert undefined → null before passing to storage:

```typescript
// In routes/game.ts
const decision = await storage.createDecision({
  handId: hand.id,
  studentId: profile.id,
  action,
  amount: amount ?? null,           // ✅ Convert undefined → null
  optimalAmount: aiDecision.amount ?? null,  // ✅ Convert undefined → null
});
```

**WHY**: JavaScript undefined serializes to "undefined" (string) which PostgreSQL rejects for integer/boolean columns. Error: `invalid input syntax for type integer: "undefined"`.

**Complete SupabaseStorage Class Structure**:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser /* ...import all types */ } from '@shared/schema.zod';

// Helper functions (shown above)
function toSnakeCase(obj: any): any { /* ... */ }
function toCamelCase(obj: any): any { /* ... */ }

// Singleton client
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

export class SupabaseStorage implements IStorage {
  // ============================================================================
  // USERS
  // ============================================================================

  async getUsers(): Promise<User[]> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*');

    if (error) throw error;
    return (data || []).map(item => toCamelCase(item)) as User[];
  }

  async getUserById(id: number): Promise<User | null> {
    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return toCamelCase(data) as User;
  }

  async createUser(insertData: InsertUser): Promise<User> {
    const dbData = toSnakeCase(insertData);

    const { data, error } = await getSupabaseClient()
      .from('users')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return toCamelCase(data) as User;
  }

  // Repeat this pattern for ALL entities
  // ...
}
```

**Storage Class Validation Checklist**:

Before generating code, VERIFY:
- [ ] `toSnakeCase()` and `toCamelCase()` helpers exist at top of file
- [ ] `toSnakeCase()` includes `undefined → null` conversion
- [ ] EVERY SELECT method uses `toCamelCase()` on return value
- [ ] EVERY SELECT array method uses `.map(item => toCamelCase(item))`
- [ ] EVERY INSERT method uses `toSnakeCase()` before `.insert()`
- [ ] EVERY INSERT method uses `toCamelCase()` on returned data
- [ ] EVERY UPDATE method uses `toSnakeCase()` before `.update()`
- [ ] EVERY UPDATE method uses `toCamelCase()` on returned data
- [ ] NO method returns `data as Type` without conversion
- [ ] NO method passes `insertData` directly to `.insert()` (must use `toSnakeCase()` first)

**Code Generation Rules**:

When `code_writer` generates `supabase-storage.ts`:

1. **ADD helpers first** (lines 1-30 of file)
2. **For each entity in schema**:
   - Generate `getEntityById()` with toCamelCase (Pattern 1)
   - Generate `getEntities()` with .map(toCamelCase) (Pattern 2)
   - Generate `createEntity()` with toSnakeCase + toCamelCase (Pattern 3)
   - Generate `updateEntity()` with toSnakeCase + toCamelCase (Pattern 4)
   - Add any custom query methods following same patterns

3. **Add comments** explaining why conversions are needed

**Static Validation** (run after code generation):

```bash
# These commands should return 0 results:
grep -n "return data as" server/lib/storage/supabase-storage.ts
grep -n "\.insert(insertData)" server/lib/storage/supabase-storage.ts
grep -n "\.update(updates)" server/lib/storage/supabase-storage.ts

# These should return results matching method count:
grep -n "return toCamelCase" server/lib/storage/supabase-storage.ts
grep -n "toSnakeCase(insert" server/lib/storage/supabase-storage.ts
```

**Why This Matters**:

The IStorage factory pattern promise: "Switch between memory and database storage by changing one environment variable."

**This ONLY works if both implementations return identical object shapes.**

Without proper conversions:
- `hand.playerCards` → `undefined` (actual: `hand.player_cards`)
- Routes break when switching storage modes
- PostgreSQL errors: `invalid input syntax for type integer: "undefined"`
- Violates Liskov Substitution Principle

TypeScript cannot enforce runtime object shapes - `as Type` casts are compile-time only. Only runtime conversion guarantees correctness.

**Reference**: See `docs/supabase-problems.md` for complete analysis, examples, and debugging guide.

```

---

## Insertion Point in pipeline-prompt.md

**AFTER** line 251 (end of MemoryStorage section):
```markdown
  // Implement all CRUD operations
}
```

**BEFORE** line 253 (API Routes section):
```markdown
#### 2.2.4 API Routes
```

## Validation

After inserting this section:

1. Verify numbering updates (2.2.3.1 becomes new subsection, 2.2.4 → 2.2.5, etc.)
2. Test generate a new app and verify supabase-storage.ts includes helpers
3. Run validation script on generated code
4. Ensure all SELECT/INSERT/UPDATE methods use proper conversions

---

**Document Version**: 1.0
**Related**: docs/supabase-problems.md, scripts/validate-supabase-storage.sh
**Date**: 2025-01-21
