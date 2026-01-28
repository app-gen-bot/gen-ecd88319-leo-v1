---
name: supabase-storage
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
