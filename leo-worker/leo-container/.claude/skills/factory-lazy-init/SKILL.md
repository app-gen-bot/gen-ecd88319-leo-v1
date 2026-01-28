---
name: factory-lazy-init
description: Prevent eager factory initialization bugs by teaching lazy Proxy pattern
category: implementation
priority: P0
issue_addressed: Fizzcard Issue #3 - Factory initialized before dotenv (always used memory storage)
---

# Factory Lazy Initialization

## Purpose

**Proactive Teaching**: Teach lazy Proxy pattern BEFORE generating auth/storage factories.

**Reactive Validation**: Detect eager initialization after factory generation.

**Problem Being Solved**:
```typescript
// ❌ BAD: Eager initialization
import { createStorage } from './create';
export const storage = createStorage();  // Runs BEFORE dotenv!

// server/index.ts
import './lib/storage/factory';  // Module hoisting executes factory first
import 'dotenv/config';          // Too late! process.env.STORAGE_MODE undefined

// Result: Factory always uses memory storage, ignores STORAGE_MODE=database
```

---

## When to Invoke (Proactive Teaching)

### 🔧 BEFORE Generating Factory Files

**Files to generate**:
- `server/lib/auth/factory.ts`
- `server/lib/storage/factory.ts`

**Pipeline Stage**: 2.2 Backend Implementation → Factories

**Purpose**: Teach lazy Proxy pattern to prevent environment variable bugs

**Timing**: Right before generating ANY factory file that reads `process.env`

---

## What Agent Will Learn

### The Problem: Module Hoisting and Import Order

**JavaScript/TypeScript module execution order**:
1. All `import` statements are hoisted to top of file
2. Imported modules execute BEFORE the importing file
3. Factories that read `process.env` may run before `dotenv/config` loads

**Example**:
```typescript
// server/index.ts
import 'dotenv/config';           // Line 1
import { storage } from './lib/storage/factory';  // Line 2

// What you think happens:
// 1. dotenv loads .env file
// 2. storage factory reads process.env.STORAGE_MODE
//
// What ACTUALLY happens (due to module hoisting):
// 1. storage factory imports and executes (reads process.env.STORAGE_MODE = undefined)
// 2. dotenv loads .env file (too late!)
```

---

## The Solution: Lazy Proxy Pattern

### ❌ WRONG: Eager Initialization

```typescript
// server/lib/storage/factory.ts
import { createMemoryStorage } from './mem-storage';
import { createDatabaseStorage } from './database-storage';
import type { IStorage } from './types';

function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';  // ❌ Reads NOW

  if (mode === 'database') {
    return createDatabaseStorage();
  }
  return createMemoryStorage();
}

// ❌ EAGER: Executes immediately when module loads
export const storage = createStorage();
```

**Why Wrong**:
- `createStorage()` runs when module is imported
- Module is imported before `dotenv/config` in server/index.ts
- `process.env.STORAGE_MODE` is undefined → always uses memory

---

### ✅ CORRECT: Lazy Proxy Pattern

```typescript
// server/lib/storage/factory.ts
import { createMemoryStorage } from './mem-storage';
import { createDatabaseStorage } from './database-storage';
import type { IStorage } from './types';

// Lazy instance - created on first access
let instance: IStorage | null = null;

function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  if (mode === 'database') {
    return createDatabaseStorage();
  }
  return createMemoryStorage();
}

// ✅ LAZY: Proxy delays execution until first property access
export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();  // Only runs when first accessed
    }
    return instance[prop as keyof IStorage];
  }
});
```

**Why Correct**:
- Proxy is created immediately (lightweight object)
- `createStorage()` only runs when someone calls `storage.getUser()` etc.
- By then, `dotenv/config` has already loaded
- `process.env.STORAGE_MODE` has correct value → uses database if configured

---

## What Agent Should Do

### Step 1: Create Factory Function (Private)

```typescript
// ✅ Private function that reads environment variables
function createAuth(): IAuth {
  const mode = process.env.AUTH_MODE || 'mock';

  switch (mode) {
    case 'supabase':
      return new SupabaseAuthAdapter();
    case 'mock':
    default:
      return new MockAuthAdapter();
  }
}
```

**Key Points**:
- Function reads `process.env.*`
- NOT executed immediately
- Only called when factory initializes

---

### Step 2: Create Lazy Instance Variable

```typescript
// ✅ Nullable instance holder
let instance: IAuth | null = null;
```

**Purpose**: Cache the factory result after first creation

---

### Step 3: Export Lazy Proxy

```typescript
// ✅ Export as Proxy that delays initialization
export const auth = new Proxy({} as IAuth, {
  get(target, prop) {
    // Initialize on first access
    if (!instance) {
      instance = createAuth();
    }
    // Return property from real instance
    return instance[prop as keyof IAuth];
  }
});
```

**How It Works**:
1. `auth` is a Proxy object (created immediately, no env vars read)
2. When code calls `auth.login(...)`:
   - Proxy `get` trap intercepts the property access
   - If `instance` is null, call `createAuth()` NOW (env vars loaded)
   - Return `instance.login` (the real method)
3. All subsequent calls use cached `instance`

---

### Step 4: Add Type Safety

```typescript
// ✅ Full example with type safety
import type { IAuth } from './types';
import { MockAuthAdapter } from './mock-adapter';
import { SupabaseAuthAdapter } from './supabase-adapter';

let instance: IAuth | null = null;

function createAuth(): IAuth {
  const mode = process.env.AUTH_MODE || 'mock';

  switch (mode) {
    case 'supabase':
      return new SupabaseAuthAdapter();
    case 'mock':
    default:
      return new MockAuthAdapter();
  }
}

export const auth: IAuth = new Proxy({} as IAuth, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();
    }
    return instance[prop as keyof IAuth];
  }
}) as IAuth;
```

**Type Safety**:
- `export const auth: IAuth` ensures consumers see correct interface
- `as IAuth` cast tells TypeScript the Proxy implements IAuth
- All autocomplete and type checking works normally

---

## Complete Examples

### Example 1: Auth Factory

```typescript
// server/lib/auth/factory.ts
import type { IAuth } from './types';
import { MockAuthAdapter } from './mock-adapter';
import { SupabaseAuthAdapter } from './supabase-adapter';

let instance: IAuth | null = null;

function createAuth(): IAuth {
  const mode = process.env.AUTH_MODE || 'mock';

  console.log(`[Auth Factory] Initializing in ${mode} mode`);

  switch (mode) {
    case 'supabase':
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        console.warn('[Auth Factory] Missing Supabase env vars, falling back to mock');
        return new MockAuthAdapter();
      }
      return new SupabaseAuthAdapter();

    case 'mock':
    default:
      return new MockAuthAdapter();
  }
}

export const auth: IAuth = new Proxy({} as IAuth, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();
    }
    return instance[prop as keyof IAuth];
  }
}) as IAuth;
```

---

### Example 2: Storage Factory

```typescript
// server/lib/storage/factory.ts
import type { IStorage } from './types';
import { createMemoryStorage } from './mem-storage';
import { createDatabaseStorage } from './database-storage';

let instance: IStorage | null = null;

function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  console.log(`[Storage Factory] Initializing in ${mode} mode`);

  switch (mode) {
    case 'database':
      return createDatabaseStorage();
    case 'supabase':
      return createSupabaseStorage();
    case 'memory':
    default:
      return createMemoryStorage();
  }
}

export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();
    }
    return instance[prop as keyof IStorage];
  }
}) as IStorage;
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Direct Export of Factory Result

```typescript
// ❌ WRONG
export const storage = createStorage();  // Eager execution
```

**Problem**: Executes immediately on module load

**Fix**: Use lazy Proxy pattern

---

### ❌ Anti-Pattern 2: Class with Static Initialization

```typescript
// ❌ WRONG
class StorageFactory {
  private static instance = new StorageFactory();  // Eager

  private storage: IStorage;

  private constructor() {
    this.storage = createStorage();  // Runs NOW
  }

  static getInstance() {
    return this.instance.storage;
  }
}

export const storage = StorageFactory.getInstance();
```

**Problem**: Static field initializes when class is defined

**Fix**: Use lazy Proxy or initialize static field as `null`

---

### ❌ Anti-Pattern 3: Top-Level Conditional

```typescript
// ❌ WRONG
export const storage =
  process.env.STORAGE_MODE === 'database'
    ? createDatabaseStorage()   // Reads env NOW
    : createMemoryStorage();
```

**Problem**: Ternary evaluates immediately

**Fix**: Wrap in function, export lazy Proxy

---

### ❌ Anti-Pattern 4: IIFE (Immediately Invoked Function Expression)

```typescript
// ❌ WRONG
export const storage = (() => {
  const mode = process.env.STORAGE_MODE;  // Reads NOW
  return mode === 'database'
    ? createDatabaseStorage()
    : createMemoryStorage();
})();  // Executes immediately!
```

**Problem**: IIFE runs when module loads

**Fix**: Remove IIFE, use lazy Proxy

---

## Validation (Reactive Confirmation)

### ✅ AFTER Generating Factory Files

**Purpose**: Detect eager initialization patterns

**Validation Script**: `scripts/validate-lazy-init.py`

**What It Checks**:
1. No `export const x = createFactory()` (eager pattern)
2. Proxy pattern is used for factories
3. Instance variable is nullable (`let instance: T | null = null`)
4. Factory function reads `process.env.*` inside function (not at top level)

**Pass Criteria**:
- ✅ All factories use lazy Proxy pattern
- ✅ No eager initialization detected
- ✅ Instance variables are nullable
- ✅ Environment variables read inside factory functions

**Failure Examples**:
```
❌ FAIL: server/lib/auth/factory.ts:15
   Eager initialization detected: export const auth = createAuth()

❌ FAIL: server/lib/storage/factory.ts:12
   process.env read at module level (should be inside function)
```

---

## How Factory is Used

### In Routes

```typescript
// server/routes/users.routes.ts (ts-rest handler)
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { storage } from '../lib/storage/factory.js';

const s = initServer();

export const usersRouter = s.router(contract.users, {
  get: {
    middleware: [authMiddleware()],
    handler: async ({ params }) => {
      // First access to storage → Proxy triggers createStorage() → reads .env
      const user = await storage.getUser(Number(params.id));
      return { status: 200 as const, body: user };
    }
  }
});
```

**Execution Flow**:
1. `server/index.ts` imports route files
2. Route files import `storage` from factory (Proxy created)
3. `dotenv/config` loads environment variables
4. First HTTP request hits `/api/users/1`
5. ts-rest handler executes, calls `storage.getUser(1)`
6. Proxy get trap intercepts → `createStorage()` executes NOW → reads `process.env.STORAGE_MODE`
7. Correct storage implementation returned

---

## Summary

**Before generating factories**:
1. Invoke this skill to learn lazy Proxy pattern
2. Understand why module hoisting causes eager initialization bugs
3. Understand how Proxy delays execution until first access

**During generation**:
1. Create private `createFactory()` function that reads `process.env`
2. Create nullable instance variable: `let instance: T | null = null`
3. Export lazy Proxy that calls `createFactory()` on first access
4. Add console.log to show when factory initializes (debugging)

**After generation**:
1. Run validation script to confirm lazy pattern used
2. Test: Change .env, verify factory uses correct mode
3. Zero eager initialization = zero environment variable bugs

**Impact**: Prevents Fizzcard Issue #3 (factory always used memory despite STORAGE_MODE=database)
