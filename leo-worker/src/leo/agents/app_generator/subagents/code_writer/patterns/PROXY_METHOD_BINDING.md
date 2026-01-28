# Pattern 10: Proxy Method Binding for Lazy Initialization

**Source**: asana-clone production failures
**Problem**: Proxy without method binding causes "Cannot read property of undefined" errors

---

## The Problem

Using Proxy for lazy initialization WITHOUT method binding loses `this` context:

```typescript
// server/lib/auth/factory.ts
// ❌ WRONG: No method binding (methods lose 'this' context)
export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
}

let instance: IAuthAdapter | null = null;

export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();
    }
    return instance[prop];  // ❌ 'this' will be undefined in method calls!
  }
});

// Error when calling: await auth.login(email, password)
// "Cannot read 'supabase' of undefined" (this.supabase is undefined)
```

**Impact**: All adapter methods fail, Supabase auth completely broken

---

## The Solution

Bind methods to preserve `this` context:

```typescript
// server/lib/auth/factory.ts
// ✅ CORRECT: Method binding in Proxy
export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}

let instance: IAuthAdapter | null = null;

function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';
  if (mode === 'supabase') {
    console.log('🔐 Auth Mode: SUPABASE (production)');
    return supabaseAuth;
  }
  console.log('🔓 Auth Mode: MOCK (development)');
  return mockAuth;
}

// Lazy Proxy with method binding
export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();
    }
    const value = instance[prop as keyof IAuthAdapter];
    // CRITICAL: Bind methods to preserve 'this' context
    return typeof value === 'function' ? value.bind(instance) : value;
  }
}) as IAuthAdapter;
```

---

## Why Method Binding is Required

### The Problem Explained

When you access a method through a Proxy, JavaScript loses the binding:

```typescript
// Without binding
const value = instance[prop];
return value;  // When called, 'this' is undefined

// User code
await auth.login(email, password);
// Internally calls: value(email, password)
// But 'this' inside the method is undefined!
```

### With Binding

```typescript
// With binding
const value = instance[prop];
return typeof value === 'function' ? value.bind(instance) : value;

// User code
await auth.login(email, password);
// Internally calls: value.bind(instance)(email, password)
// Now 'this' inside the method correctly refers to instance!
```

---

## Complete Factory Pattern

### Auth Factory Example

```typescript
// server/lib/auth/factory.ts
import { mockAuth } from './mock-adapter.js';
import { supabaseAuth } from './supabase-adapter.js';

export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}

let instance: IAuthAdapter | null = null;

function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';

  if (mode === 'supabase') {
    console.log('🔐 Auth Mode: SUPABASE (production)');
    return supabaseAuth;
  }

  console.log('🔓 Auth Mode: MOCK (development)');
  return mockAuth;
}

// Lazy initialization with method binding
export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    // Initialize on first access
    if (!instance) {
      instance = createAuth();
    }

    // Get property from instance
    const value = instance[prop as keyof IAuthAdapter];

    // CRITICAL: Bind methods to preserve 'this'
    if (typeof value === 'function') {
      return value.bind(instance);
    }

    // Return non-function properties as-is
    return value;
  }
}) as IAuthAdapter;
```

### Storage Factory Example

```typescript
// server/lib/storage/factory.ts
import { memStorage } from './mem-storage.js';
import { dbStorage } from './db-storage.js';

export interface IStorage {
  getItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | null>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;
}

let instance: IStorage | null = null;

function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  if (mode === 'database') {
    console.log('💾 Storage Mode: DATABASE (production)');
    return dbStorage;
  }

  console.log('🗂️  Storage Mode: MEMORY (development)');
  return memStorage;
}

// Lazy initialization with method binding
export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();
    }

    const value = instance[prop as keyof IStorage];

    // CRITICAL: Bind methods to preserve 'this'
    return typeof value === 'function' ? value.bind(instance) : value;
  }
}) as IStorage;
```

---

## Adapter Implementation Examples

### Supabase Auth Adapter

```typescript
// server/lib/auth/supabase-adapter.ts
import { createClient } from '@supabase/supabase-js';
import type { IAuthAdapter } from './factory.js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;

class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async login(email: string, password: string) {
    // 'this.supabase' works because method is bound!
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user || !data.session) {
      throw new Error('Login failed');
    }

    return {
      user: data.user,
      token: data.session.access_token,
    };
  }

  async signup(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;
    if (!data.user || !data.session) {
      throw new Error('Signup failed');
    }

    return {
      user: data.user,
      token: data.session.access_token,
    };
  }

  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  }

  async logout(token: string) {
    await this.supabase.auth.signOut();
  }
}

export const supabaseAuth = new SupabaseAuthAdapter();
```

### Mock Auth Adapter

```typescript
// server/lib/auth/mock-adapter.ts
import type { IAuthAdapter } from './factory.js';

class MockAuthAdapter implements IAuthAdapter {
  private users = new Map<string, any>();

  async login(email: string, password: string) {
    // 'this.users' works because method is bound!
    const user = this.users.get(email);

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token: `mock_token_${user.id}`,
    };
  }

  async signup(email: string, password: string, name: string) {
    const id = `user_${this.users.size + 1}`;
    const user = { id, email, password, name };

    this.users.set(email, user);

    return {
      user: { id, email, name },
      token: `mock_token_${id}`,
    };
  }

  async verifyToken(token: string) {
    // Mock verification - accept all tokens
    const userId = token.replace('mock_token_', '');
    return { id: userId, email: 'mock@example.com' };
  }

  async logout(token: string) {
    // Mock logout - no-op
  }
}

export const mockAuth = new MockAuthAdapter();
```

---

## Usage in Routes

```typescript
// server/routes/auth.routes.ts (ts-rest handlers)
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';
import { auth } from '../lib/auth/factory.js';

const s = initServer();

export const authRouter = s.router(contract.auth, {
  login: {
    handler: async ({ body }) => {
      try {
        const { email, password } = body;

        // Calling auth.login works because method is bound!
        const result = await auth.login(email, password);

        return { status: 200 as const, body: result };
      } catch (error) {
        return { status: 401 as const, body: { error: 'Invalid credentials' } };
      }
    }
  },

  signup: {
    handler: async ({ body }) => {
      try {
        const { email, password, name } = body;

        // Calling auth.signup works because method is bound!
        const result = await auth.signup(email, password, name);

        return { status: 201 as const, body: result };
      } catch (error) {
        return { status: 400 as const, body: { error: 'Signup failed' } };
      }
    }
  }
});
```

---

## Validation Checks

### 1. Check for Method Binding in Proxy

```bash
# Check factory has method binding
grep "value.bind(instance)" server/lib/auth/factory.ts && \
  echo "✅ Method binding exists" || \
  echo "❌ ERROR: Missing method binding"

grep "value.bind(instance)" server/lib/storage/factory.ts && \
  echo "✅ Method binding exists" || \
  echo "❌ ERROR: Missing method binding"
```

**Expected**: Both factories have `value.bind(instance)`

### 2. Check Proxy Pattern Usage

```bash
# Check for Proxy usage in factories
grep "new Proxy" server/lib/*/factory.ts
```

**Expected**: All factories using Proxy pattern

### 3. Verify Instance Creation Outside Proxy

```bash
# Check createAuth/createStorage functions exist
grep "function create" server/lib/*/factory.ts
```

**Expected**: Factory functions for creating instances

---

## Common Mistakes

### ❌ Mistake 1: No Method Binding

```typescript
// WRONG - Methods lose 'this' context
export const auth = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!instance) instance = createAuth();
    return instance[prop];  // ❌ No binding!
  }
});

// Error: "Cannot read 'supabase' of undefined"
```

### ❌ Mistake 2: Binding Non-Functions

```typescript
// WRONG - Unnecessarily binds properties
get(target, prop) {
  if (!instance) instance = createAuth();
  const value = instance[prop];
  return value.bind(instance);  // ❌ Crashes if value is not a function!
}

// Correct: Check type first
return typeof value === 'function' ? value.bind(instance) : value;
```

### ❌ Mistake 3: Creating Instance on Every Access

```typescript
// WRONG - Creates new instance each time
export const auth = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    const instance = createAuth();  // ❌ New instance every call!
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

// Correct: Use singleton pattern
let instance: IAuthAdapter | null = null;

export const auth = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    if (!instance) {
      instance = createAuth();  // ✅ Create once
    }
    // ...
  }
});
```

### ❌ Mistake 4: Missing Interface Type

```typescript
// WRONG - No type safety
export const auth = new Proxy({}, {
  get(target, prop) {
    // ...
  }
});

// Correct: Use interface and type assertion
export const auth: IAuthAdapter = new Proxy({} as IAuthAdapter, {
  get(target, prop) {
    // ...
  }
}) as IAuthAdapter;
```

---

## Why This Matters

**asana-clone Evidence**: All Supabase auth failed until method binding was added

**Symptoms**:
- ❌ "Cannot read property 'supabase' of undefined"
- ❌ "TypeError: Cannot read properties of undefined"
- ❌ All auth operations fail (login, signup, verify)
- ❌ Mock auth works, Supabase auth crashes

**Why Mock Works**: Mock adapter may not use `this` internally, so binding isn't required. Supabase adapter DOES use `this.supabase`, so it fails without binding.

**Time Lost**: 2+ hours debugging adapter failures

---

## Benefits of Lazy Initialization

1. **Environment-based selection**: Choose adapter based on env vars at runtime
2. **Deferred dependency loading**: Don't load Supabase client until needed
3. **Test-friendly**: Easy to swap implementations in tests
4. **Single export**: Routes import one `auth` object, config handled internally

---

## Related Patterns

- **AUTH_HELPERS.md**: Client-side auth helpers (different from server adapters)
- **STORAGE_COMPLETENESS.md**: Storage factory follows same Proxy pattern

---

## Final Checklist

Before completing auth/storage factory:

- [ ] Interface defined for adapter (IAuthAdapter, IStorage)
- [ ] createAuth/createStorage function selects implementation
- [ ] let instance variable for singleton pattern
- [ ] Proxy handler checks `if (!instance)` to initialize
- [ ] Proxy handler binds methods: `value.bind(instance)`
- [ ] Proxy handler checks `typeof value === 'function'` before binding
- [ ] Export uses type assertion: `as IAuthAdapter`
- [ ] Both mock and production adapters implement interface
- [ ] Tested: Production adapter methods don't crash with undefined

---

**Remember**: Without method binding, Proxy-based lazy initialization breaks `this` context. All methods using `this.property` will fail with "Cannot read property of undefined".
