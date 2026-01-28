---
name: supabase-auth-setup
description: >
  Use this skill when setting up Supabase Auth for authentication.
  Single implementation - SupabaseAuth only, no mock adapter.
  Includes dual-user architecture and seed data setup.
---

# Supabase Auth Setup

## When to Use This Skill

**MANDATORY** when:
- Creating `server/lib/auth/` files (Phase 5)
- Setting up user authentication and session management
- Creating seed users migration
- The app has Supabase provisioned with `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`

## Dual-User Architecture

Supabase requires users in **two places** with matching UUIDs:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase Project                             │
├────────────────────────────────┬────────────────────────────────┤
│  auth.users (Supabase Auth)    │  public.users (Our Schema)     │
│  ────────────────────────────  │  ────────────────────────────  │
│  id (uuid)  ◄──────────────────┼── id (uuid) MUST MATCH         │
│  email                         │  email                         │
│  encrypted_password            │  name                          │
│  email_confirmed_at            │  role                          │
│  created_at                    │  avatar_url                    │
│  ...                           │  organization_id               │
│                                │  created_at                    │
└────────────────────────────────┴────────────────────────────────┘
```

**Key insight**: When a user signs up, we create entries in BOTH tables with the SAME UUID.

---

## Phase 5 Artifacts

```
server/lib/auth/
├── index.ts               # Export auth instance
├── supabase-auth.ts       # SupabaseAuth class (ONLY implementation)
└── middleware.ts          # Auth middleware for protected routes

supabase/
├── seed.ts                # Seed script using Admin API (recommended)
└── seed.sql               # Alternative: seed public.users only
```

**CRITICAL**:
- **NO** `mock-adapter.ts` - SupabaseAuth only
- **NO** factory with mode switching - direct instantiation
- **NO** `AUTH_MODE` environment variable

---

## Step 0: Automated User Seeding

### Why Use Admin API (Not Raw SQL)

Direct SQL insertion into `auth.users` is problematic because:
- Supabase uses bcrypt via GoTrue with undocumented salt handling
- Raw SQL often results in "Invalid credentials" errors
- `auth.identities` table structure varies between Supabase versions

**Solution**: Use Supabase Admin API which handles password hashing correctly.

### Seed Script (Recommended)

**File**: `supabase/seed.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for seeding');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Standard seed users - use in ALL apps
const SEED_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'john@app.com',
    password: 'Demo2025_',
    name: 'John Doe',
    role: 'user',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin@app.com',
    password: 'Demo2025_',
    name: 'Admin User',
    role: 'admin',
  },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');

  for (const user of SEED_USERS) {
    // Step 1: Create user in auth.users via Admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true, // Skip email verification
      user_metadata: { name: user.name },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`  ⏭️  ${user.email} already exists in auth.users`);
      } else {
        throw new Error(`Failed to create auth user ${user.email}: ${authError.message}`);
      }
    } else {
      console.log(`  ✅ Created ${user.email} in auth.users`);
    }

    // Step 2: Create matching user in public.users
    const { error: dbError } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

    if (dbError) {
      throw new Error(`Failed to create public user ${user.email}: ${dbError.message}`);
    } else {
      console.log(`  ✅ Created ${user.email} in public.users`);
    }
  }

  console.log('✅ Seeding complete!');
}

seedUsers().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
```

### Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:seed": "npx tsx supabase/seed.ts",
    "db:reset": "npx supabase db reset && npm run db:seed"
  }
}
```

### When Seeding Runs

1. **After `npm install`**: Run `npm run db:seed` once to create seed users
2. **After `supabase db reset`**: Run `npm run db:seed` to recreate users
3. **CI/CD**: Add `npm run db:seed` to deployment pipeline

### Alternative: SQL for public.users Only

If you only need to seed `public.users` (auth users created manually or via API):

**File**: `supabase/seed.sql`

```sql
-- Seed public.users only
-- Auth users must be created via Dashboard or Admin API

INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'john@app.com', 'John Doe', 'user', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'admin@app.com', 'Admin User', 'admin', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

---

## Standard Seed Credentials

Use these in **ALL generated apps**:

| Email | Password | Role | UUID |
|-------|----------|------|------|
| `john@app.com` | `Demo2025_` | user | `00000000-0000-0000-0000-000000000001` |
| `admin@app.com` | `Demo2025_` | admin | `00000000-0000-0000-0000-000000000002` |

**Sources**: [Supabase Discussion #1323](https://github.com/orgs/supabase/discussions/1323), [Discussion #35391](https://github.com/orgs/supabase/discussions/35391)

---

## Step 1: Create Auth Index (Simple Export)

**File**: `server/lib/auth/index.ts`

```typescript
import { SupabaseAuth } from './supabase-auth.js';

// Single auth instance - no factory, no mode switching
export const auth = new SupabaseAuth();

export { authMiddleware, optionalAuthMiddleware } from './middleware.js';
```

---

## Step 2: Create Supabase Auth

**File**: `server/lib/auth/supabase-auth.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { User } from '../../../shared/schema.zod.js';
import { storage } from '../storage/index.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthResult {
  user: User;
  token: string;
}

export class SupabaseAuth {
  /**
   * Sign up a new user.
   * Creates user in BOTH auth.users AND public.users with same UUID.
   */
  async signup(email: string, password: string, name: string): Promise<AuthResult> {
    // Create Supabase auth user (goes into auth.users)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // Stored in raw_user_meta_data
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Signup failed - no user or session returned');
    }

    // Create matching user record in public.users with SAME UUID
    // NOTE: Must use createUserWithId() - standard InsertUser type omits 'id'
    const user = await storage.createUserWithId({
      id: authData.user.id, // CRITICAL: Use the same UUID from auth.users
      email,
      name,
    });

    return {
      user,
      token: authData.session.access_token,
    };
  }

  /**
   * Log in an existing user.
   * Authenticates via auth.users, returns data from public.users.
   */
  async login(email: string, password: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Login failed - no user or session returned');
    }

    // Get user from public.users (has app-specific fields like role, name)
    const user = await storage.getUserById(data.user.id);

    if (!user) {
      throw new Error('User not found in database');
    }

    return {
      user,
      token: data.session.access_token,
    };
  }

  /**
   * Verify a JWT token.
   * Validates via Supabase Auth, returns user from public.users.
   */
  async verifyToken(token: string): Promise<User> {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new Error('Invalid or expired token');
    }

    // Get user from public.users
    const user = await storage.getUserById(data.user.id);

    if (!user) {
      throw new Error('User not found in database');
    }

    return user;
  }

  async logout(token: string): Promise<void> {
    // Supabase handles session invalidation
    // Client should clear token from localStorage
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error('Failed to refresh session');
    }

    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }
}
```

---

## Step 3: Create Auth Middleware

**File**: `server/lib/auth/middleware.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { auth } from './index.js';
import type { User } from '../../../shared/schema.zod.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware that requires authentication.
 * Returns 401 if no valid token is provided.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header required' });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const user = await auth.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware that optionally authenticates.
 * Sets req.user if valid token provided, otherwise continues without user.
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const user = await auth.verifyToken(token);
    req.user = user;
  } catch {
    // Token invalid but continue without user
  }

  next();
}
```

---

## Step 4: Create Auth Routes

**File**: `server/routes/auth.ts`

```typescript
import { initServer } from '@ts-rest/express';
import { authContract } from '../../shared/contracts/auth.contract.js';
import { auth, authMiddleware } from '../lib/auth/index.js';

const s = initServer();

export const authRouter = s.router(authContract, {
  signup: async ({ body }) => {
    try {
      const result = await auth.signup(body.email, body.password, body.name);
      return {
        status: 201,
        body: result,
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: (error as Error).message },
      };
    }
  },

  login: async ({ body }) => {
    try {
      const result = await auth.login(body.email, body.password);
      return {
        status: 200,
        body: result,
      };
    } catch (error) {
      return {
        status: 401,
        body: { error: 'Invalid credentials' },
      };
    }
  },

  logout: async () => {
    return {
      status: 200,
      body: { success: true },
    };
  },

  me: {
    middleware: [authMiddleware],
    handler: async ({ req }) => {
      return {
        status: 200,
        body: { user: req.user! },
      };
    },
  },
});
```

---

## Client-Side Token Management

**File**: `client/src/lib/auth-helpers.ts`

```typescript
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
```

---

## API Client Integration

The `api-client.ts` should automatically include the auth token:

```typescript
import { getAuthToken } from './auth-helpers.js';

// Dynamic headers - checked on each request
const baseHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
});
```

---

## Key Flow: User Registration

```
1. User submits signup form (email, password, name)
                    ↓
2. SupabaseAuth.signup() called
                    ↓
3. supabase.auth.signUp() → Creates user in auth.users
                    ↓
4. Returns authData.user.id (UUID from Supabase)
                    ↓
5. storage.createUserWithId({ id: authData.user.id, ... })
   → Creates matching user in public.users with SAME UUID
                    ↓
6. Return { user, token } to client
```

---

## Key Flow: User Login

```
1. User submits login form (email, password)
                    ↓
2. SupabaseAuth.login() called
                    ↓
3. supabase.auth.signInWithPassword() → Validates credentials
                    ↓
4. Returns data.user.id (UUID)
                    ↓
5. storage.getUserById(data.user.id)
   → Fetches user from public.users (has role, name, etc.)
                    ↓
6. Return { user, token } to client
```

---

## Anti-Patterns (DO NOT DO)

❌ **Creating mock-adapter.ts**:
```typescript
// WRONG - No mock auth, SupabaseAuth only
export const mockAuth: IAuthAdapter = { ... }
```

❌ **Mismatched UUIDs**:
```typescript
// WRONG - UUID must come from auth.users
const user = await storage.createUser({
  id: crypto.randomUUID(), // WRONG! Use authData.user.id
  ...
});
```

❌ **Factory with mode switching**:
```typescript
// WRONG - No factory needed
if (mode === 'supabase') { ... } else { ... }
```

❌ **Skipping auth.identities in seed**:
```sql
-- WRONG - Login will fail without identities
INSERT INTO auth.users (...) VALUES (...);
-- Missing INSERT INTO auth.identities!
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## Environment Variables Required

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Required for seeding
```

---

## Validation Checklist

Before marking Phase 5 (Auth) as complete:

**Seeding:**
- [ ] `supabase/seed.ts` exists with Admin API approach
- [ ] `package.json` has `db:seed` script
- [ ] Seed script creates users in **BOTH** `auth.users` AND `public.users`
- [ ] Seed uses `supabase.auth.admin.createUser()` (NOT raw SQL)
- [ ] UUIDs match between `auth.users` and `public.users`

**Auth Implementation:**
- [ ] `server/lib/auth/index.ts` exports single auth instance
- [ ] `server/lib/auth/supabase-auth.ts` uses correct UUID flow
- [ ] `signup()` uses `createUserWithId()` with `authData.user.id` (NOT `createUser()`)
- [ ] `login()` fetches user from public.users by `data.user.id`
- [ ] Auth throws error if `SUPABASE_URL` or `SUPABASE_ANON_KEY` not set

**Storage (for UUID sync):**
- [ ] `InsertUserWithId` type exists in `schema.zod.ts` (includes `id`)
- [ ] `createUserWithId()` method exists in storage interface
- [ ] Drizzle storage implements `createUserWithId()`

**Anti-patterns Avoided:**
- [ ] **NO** `mock-adapter.ts` file exists
- [ ] **NO** factory with mode switching
- [ ] **NO** `AUTH_MODE` environment variable
- [ ] **NO** raw SQL insertion into `auth.users` with `crypt()`

**Client:**
- [ ] `api-client.ts` includes Authorization header automatically
