# Auth Signup Pattern - Dual-Table User Creation

**Date**: 2025-11-24
**Status**: ✅ ACTIVE
**Priority**: 🔴 CRITICAL

---

## Problem

Signup endpoints duplicate user creation, causing constraint violations when auth adapter already created the user.

### Real-World Example (Issue #35 - naijadomot)

```typescript
// Error after signup form submission:
duplicate key value violates unique constraint "users_pkey"

// Root cause: User created TWICE with same UUID
```

**Impact**: Instant signup failures, production blocker, database constraint errors.

---

## Understanding Dual-Table Auth

Supabase (and similar auth systems) use **two tables**:

```
┌─────────────────┐         ┌──────────────────┐
│  auth.users     │         │  public.users    │
│  (Auth Service) │         │  (App Database)  │
├─────────────────┤         ├──────────────────┤
│ id (UUID)       │◄────────┤ id (FK)          │
│ email           │         │ email            │
│ encrypted_pwd   │         │ name             │
│ email_confirmed │         │ phone            │
│ ...             │         │ role             │
└─────────────────┘         │ created_at       │
                            └──────────────────┘
```

**Who Creates What**:
1. **Auth Adapter** creates in BOTH tables (atomic operation)
2. **Endpoint Handler** only calls auth adapter (no direct DB access)

---

## ✅ CORRECT Pattern

### Auth Adapter (server/lib/auth/supabase-adapter.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import { db, schema } from '../db.js';
import { eq } from 'drizzle-orm';

export class SupabaseAuthAdapter {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async signup(email: string, password: string, name: string, phone: string, role: string) {
    // 1. Create in auth.users (Supabase Auth API)
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw new Error(`Signup failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // 2. Create in public.users (Drizzle ORM - database-agnostic)
    try {
      const [newUser] = await db
        .insert(schema.users)
        .values({
          id: data.user.id,  // ← Critical: Use auth.users UUID
          email,
          name,
          phone: phone || null,
          role,
          emailVerified: false
        })
        .returning();

      return {
        user: newUser,
        token: data.session?.access_token || null
      };
    } catch (dbError: any) {
      // Cleanup: Delete from auth.users if public.users fails
      await this.supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(`User record creation failed: ${dbError.message}`);
    }
  }

  async login(email: string, password: string) {
    // 1. Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('No user returned from login');

    // 2. Get user from public.users using Drizzle ORM
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, data.user.id))
      .limit(1);

    if (!user) throw new Error('User not found in database');

    return {
      user,
      token: data.session.access_token
    };
  }
}
```

**Key Points**:
- ✅ Supabase Auth SDK for auth.users (signUp, signIn)
- ✅ Drizzle ORM for public.users (database-agnostic)
- ✅ Uses same UUID (from `data.user.id`)
- ✅ Cleanup on failure (rollback)
- ✅ Returns both user and token

### Signup Endpoint (server/routes/auth.routes.ts)

```typescript
import { initServer } from '@ts-rest/express';
import { contract } from '@shared/contracts/index.js';

const s = initServer();

export const authRouter = s.router(contract.auth, {
  signup: {
    handler: async ({ body, req }) => {
      const auth = req.app.locals.auth;

      try {
        // Auth adapter handles BOTH tables - don't call storage!
        const result = await auth.signup(
          body.email,
          body.password,
          body.name,
          body.phone || '',
          body.role || 'buyer'
        );

        return { status: 201 as const, body: result };
      } catch (error: any) {
        console.error('[Auth] Signup error:', error.message);
        return {
          status: 400 as const,
          body: { error: error.message }
        };
      }
    }
  }
});
```

**Key Points**:
- ✅ Endpoint delegates to auth adapter
- ✅ NO call to `storage.createUser()`
- ✅ Error handling with logging
- ✅ Returns 201 on success

---

## ❌ WRONG Patterns

### Anti-Pattern 1: Duplicate User Creation

```typescript
// DON'T GENERATE THIS!
signup: {
  handler: async ({ body, req }) => {
    const auth = req.app.locals.auth;
    const storage = req.app.locals.storage;

    try {
      // 1. Auth adapter creates user in both tables
      const result = await auth.signup(
        body.email,
        body.password,
        body.name,
        body.phone,
        body.role
      );

      // 2. DUPLICATE! Tries to create in public.users again
      await storage.createUser({
        id: result.user.id,     // Same UUID!
        email: result.user.email,
        name: body.name,
        phone: body.phone,
        role: body.role
      });
      // Error: duplicate key value violates unique constraint "users_pkey"

      return { status: 201 as const, body: result };
    } catch (error: any) {
      return { status: 400 as const, body: { error: error.message } };
    }
  }
}
```

**Why This Fails**:
- Auth adapter already created user in `public.users` via Drizzle
- Endpoint tries to create the same user again
- PostgreSQL rejects duplicate primary key
- Signup fails immediately

### Anti-Pattern 2: Using Supabase Client SDK for Database

```typescript
// DON'T GENERATE THIS!
export class SupabaseAuthAdapter {
  private adminClient;  // ❌ Wrong!

  async signup(...) {
    // Auth operation (correct)
    const { data } = await this.supabase.auth.signUp({ email, password });

    // Database operation (WRONG - not database-agnostic)
    const { data: newUser } = await this.adminClient
      .from('users')  // ❌ Supabase Client SDK
      .insert({ id: data.user.id, email, name })
      .select()
      .single();
  }
}
```

**Why This Is Wrong**:
- Couples code to Supabase (can't migrate to Neon, Railway, AWS RDS)
- Unnecessary dependency on Supabase Client SDK
- Drizzle ORM is already available and database-agnostic

---

## Decision Tree: When to Call storage.createUser()

```
Is dual-table auth pattern used (Supabase)?
├─ YES (auth.users + public.users sync)
│  └─ DON'T call storage.createUser() in signup endpoint
│     Auth adapter handles both tables
│
└─ NO (Single table, JWT-only auth, or custom auth)
   └─ CALL storage.createUser() in signup endpoint
      Endpoint creates user record
```

### Example: Single-Table Auth (No Supabase)
```typescript
// Only if NOT using dual-table pattern
signup: {
  handler: async ({ body, req }) => {
    const storage = req.app.locals.storage;

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user (single table)
    const user = await storage.createUser({
      email: body.email,
      password: hashedPassword,
      name: body.name
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, SECRET);

    return { status: 201, body: { user, token } };
  }
}
```

---

## Validation Checks

### Code Review Grep
```bash
# Check signup endpoint for duplicate user creation
grep -A10 "auth\.signup" server/routes/auth.routes.ts | grep "storage\.createUser"

# If match found:
echo "❌ ERROR: Duplicate user creation detected"
echo "Auth adapter already creates user in public.users"
echo "Remove storage.createUser() call from signup endpoint"
```

### Expected Pattern in Supabase Apps
```typescript
// server/routes/auth.routes.ts
signup: {
  handler: async ({ body, req }) => {
    const result = await req.app.locals.auth.signup(...);
    // NO storage.createUser() call!
    return { status: 201, body: result };
  }
}
```

---

## Testing

### Manual Test
```bash
# Start app
npm run dev

# Signup via form or API
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User","role":"buyer"}'

# Should return 201 with user and token
# Should NOT error with "duplicate key"
```

### Database Verification
```sql
-- Check both tables have matching user
SELECT id, email FROM auth.users WHERE email = 'test@example.com';
SELECT id, email, name, role FROM public.users WHERE email = 'test@example.com';

-- IDs should match (same UUID)
```

---

## Cleanup on Failure

**Important**: If `public.users` creation fails, delete from `auth.users`:

```typescript
async signup(email, password, name, phone, role) {
  // 1. Create in auth.users (Supabase Auth SDK)
  const { data, error } = await this.supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('No user returned');

  // 2. Create in public.users (Drizzle ORM)
  try {
    const [newUser] = await db
      .insert(schema.users)
      .values({ id: data.user.id, email, name, phone, role })
      .returning();

    return { user: newUser, token: data.session?.access_token };
  } catch (dbError: any) {
    // CLEANUP: Remove orphaned auth.users record
    await this.supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(dbError.message);
  }
}
```

**Why This Matters**:
- Prevents orphaned users in `auth.users` without matching `public.users`
- Maintains referential integrity
- Allows retry without "email already exists" errors

---

## Related Patterns

- **AUTH_STORAGE_CONSISTENCY.md**: Match auth queries to storage mode
- **STORAGE_COMPLETENESS.md**: Implement all storage methods
- **FORM_STATE_MANAGEMENT.md**: Form handling for signup pages

---

## Time Saved

Following this pattern prevents:
- **2 hours** debugging duplicate key errors
- **1 hour** understanding dual-table pattern
- **1 hour** fixing orphaned auth records
- **30 min** testing signup flow

**Total**: 4.5 hours per app with Supabase auth

---

## Generator Integration

### Code Generation Rule
```markdown
When generating signup endpoints for Supabase apps:
1. Check if auth adapter is SupabaseAuthAdapter
2. If YES:
   - Endpoint calls auth.signup()
   - NO call to storage.createUser()
   - Auth adapter creates in both tables
3. If NO (custom auth):
   - Endpoint calls storage.createUser()
   - Generate password hashing
   - Generate token creation
```

### Template Detection
```typescript
// In endpoint generator:
if (authMode === 'supabase' && isDualTablePattern) {
  // Generate: await auth.signup(...)
  // DON'T generate: await storage.createUser(...)
} else {
  // Generate: await storage.createUser(...)
  // Generate: hash password, create token
}
```

---

**Document Status**: ✅ ACTIVE - Enforce in all Supabase apps
**Author**: Claude Code Analysis (from Issue #35)
**Date**: 2025-11-24
