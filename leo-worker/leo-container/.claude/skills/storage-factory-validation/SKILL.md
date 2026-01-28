---
name: storage-factory-validation
description: >
  Use this skill to validate that all IStorage implementations (MemoryStorage,
  SupabaseStorage) return identical object shapes. Critical for factory
  pattern to work correctly.
---

# Storage Factory Contract Validation

## The IStorage Contract

```typescript
export interface IStorage {
  getUser(id: string): Promise<User | null>;
  createUser(data: InsertUser): Promise<User>;
  // ... all methods
}
```

**Contract Promise**: All implementations return SAME object shapes.

**Why This Matters**:
- Routes use `storage.getUser(id)`
- Should work identically whether storage is Memory or Supabase
- If shapes differ → routes break when switching storage mode

## Storage Modes

- `STORAGE_MODE=memory` → MemoryStorage (development, no persistence)
- `STORAGE_MODE=database` → DrizzleStorage (production, Drizzle ORM with pooler)

**CRITICAL**: DrizzleStorage MUST use Drizzle ORM, NOT PostgREST client.

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
import { createSupabaseStorage } from '../server/lib/storage/supabase-storage';

async function validateContract() {
  const memStorage = new MemoryStorage();
  const supabaseStorage = await createSupabaseStorage();

  // Create test data
  const testUser = { email: 'test@example.com', name: 'Test' };

  // Create in both
  const memUser = await memStorage.createUser(testUser);
  const supabaseUser = await supabaseStorage.createUser(testUser);

  // Compare property names
  const memKeys = Object.keys(memUser).sort();
  const supabaseKeys = Object.keys(supabaseUser).sort();

  if (JSON.stringify(memKeys) !== JSON.stringify(supabaseKeys)) {
    console.error('❌ Property names differ!');
    console.error('Memory:', memKeys);
    console.error('Supabase:', supabaseKeys);
    process.exit(1);
  }

  // Check for snake_case leaks (would indicate PostgREST usage instead of Drizzle)
  const hasSnakeCase = supabaseKeys.some(key => key.includes('_'));
  if (hasSnakeCase) {
    console.error('❌ Supabase storage returns snake_case!');
    console.error('   This indicates PostgREST client usage instead of Drizzle ORM.');
    console.error('   Use Drizzle for automatic camelCase conversion.');
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
