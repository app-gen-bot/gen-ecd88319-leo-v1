---
name: supabase-auth
description: >
  Enable Supabase Auth in generated apps. This skill guides the transition from
  mock auth (AUTH_MODE=mock) to production Supabase auth (AUTH_MODE=supabase).
  Prerequisites: supabase-project-setup skill must be run first.
---

# Supabase Auth Integration

## When to Use This Skill

**Use this skill when**:
- User wants to enable real authentication (not mock)
- Deploying app to production
- Testing Supabase Auth locally
- Switching from `AUTH_MODE=mock` to `AUTH_MODE=supabase`

**Prerequisites**:
- ✅ `supabase-project-setup` skill has been run
- ✅ App has working mock auth (LOGIN_PAGE exists, auth routes work)
- ✅ `.env.production` exists with Supabase credentials

## The Transition: Mock → Supabase

### Environment Mode Matrix

| Environment | AUTH_MODE | STORAGE_MODE | Description |
|-------------|-----------|--------------|-------------|
| Development | `mock` | `memory` | Fast iteration, no persistence |
| Testing | `supabase` | `supabase` | Test real auth locally |
| Production | `supabase` | `supabase` | Full production mode |

### Step 1: Verify Prerequisites

```bash
# Check that Supabase project exists
grep "SUPABASE_URL" .env.production || echo "❌ Missing SUPABASE_URL"
grep "SUPABASE_ANON_KEY" .env.production || echo "❌ Missing SUPABASE_ANON_KEY"

# Check auth adapter exists
ls server/lib/auth/supabase-adapter.ts || echo "❌ Missing Supabase auth adapter"

# Check factory supports both modes
grep "AUTH_MODE" server/lib/auth/factory.ts || echo "❌ Factory doesn't check AUTH_MODE"
```

### Step 2: Configure Supabase Auth Settings

Email confirmation is already disabled by `supabase-project-setup` skill via `config.toml`.

**Additional auth settings (optional)**:

```bash
# In config.toml, these can be customized:

[auth]
# Enable auth (already true by default)
enabled = true
# JWT expiry in seconds (3600 = 1 hour)
jwt_expiry = 3600

[auth.email]
# Confirmation disabled for faster testing
enable_confirmations = false
enable_signup = true
```

### Step 3: Create `.env.local` for Local Supabase Testing

```bash
# .env.local (for testing Supabase auth locally)
AUTH_MODE=supabase
STORAGE_MODE=database  # Drizzle ORM with pooler (NOT 'supabase')

# From Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# From Supabase Dashboard → Settings → Database
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### Step 4: Test Auth Flow Locally

```bash
# Start with Supabase auth
cp .env.local .env
npm run dev

# Test signup (creates user in Supabase Auth AND users table)
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","name":"Test User"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

## Architecture Details

### How Supabase Auth Works in Our Apps

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│  Our Server  │────▶│  Supabase Auth  │
│  (React)    │     │  (Express)   │     │  (Auth Service) │
└─────────────┘     └──────────────┘     └─────────────────┘
        │                   │                      │
        │                   │                      │
        ▼                   ▼                      ▼
   JWT Token         User Record            Auth Session
   (localStorage)    (users table)         (Supabase JWT)
```

**Key Points**:
1. **Frontend** calls our auth routes (`/api/auth/login`, `/api/auth/signup`)
2. **Our server** calls Supabase Auth API (`supabase.auth.signInWithPassword`)
3. **Supabase Auth** validates credentials, returns JWT
4. **Our server** creates/fetches user record from `users` table
5. **Frontend** stores JWT, sends in subsequent requests

### Supabase Auth Adapter Implementation

**File**: `server/lib/auth/supabase-adapter.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { db, schema } from '../db.js';
import { eq } from 'drizzle-orm';

export class SupabaseAuthAdapter implements IAuthAdapter {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
  }

  async login(email: string, password: string) {
    // 1. Authenticate with Supabase Auth
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // 2. Get user record from OUR users table (not auth.users)
    const userRecord = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)
      .then(rows => rows[0]);

    // 3. Return our user record + Supabase JWT
    return { user: userRecord, token: data.session.access_token };
  }

  async signup(email: string, password: string, name: string) {
    // 1. Create Supabase Auth user
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) throw new Error(error.message);

    // 2. Create record in OUR users table
    const [userRecord] = await db
      .insert(schema.users)
      .values({ email, name, role: 'user' })
      .returning();

    // 3. Return our user record + Supabase JWT
    return { user: userRecord, token: data.session.access_token };
  }

  async verifyToken(token: string) {
    // Verify JWT with Supabase, then fetch our user record
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new Error('Invalid token');

    const userRecord = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.user.email))
      .limit(1)
      .then(rows => rows[0]);

    return userRecord;
  }
}
```

### Two User Tables: Why?

**Question**: Why do we have users in both Supabase Auth (`auth.users`) and our `users` table?

**Answer**: Separation of concerns:

| Supabase Auth (`auth.users`) | Our `users` Table |
|------------------------------|-------------------|
| Email/password validation | App-specific fields |
| JWT generation | User profile data |
| Session management | Role/permissions |
| Password reset | Relationships to other entities |

This allows:
- App-specific user fields without modifying Supabase Auth
- Foreign key relationships (`userId` in other tables)
- Easy migration away from Supabase if needed

## Common Issues

### Issue 1: "User not found in database"

**Symptom**: Login works in Supabase but fails with "User not found"

**Cause**: User exists in `auth.users` but not in your `users` table

**Fix**: The Supabase adapter should create the user record on first login:

```typescript
if (!userRecord) {
  // Create user record if doesn't exist
  const [newUser] = await db
    .insert(schema.users)
    .values({
      email: data.user.email!,
      name: data.user.user_metadata?.name || email.split('@')[0],
      role: 'user',
    })
    .returning();
  userRecord = newUser;
}
```

### Issue 2: Email Confirmation Required

**Symptom**: Signup succeeds but login fails with "Email not confirmed"

**Cause**: Email confirmation enabled in Supabase

**Fix**: Run `supabase config push` after ensuring `config.toml` has:

```toml
[auth.email]
enable_confirmations = false
```

### Issue 3: "Missing Supabase configuration"

**Symptom**: Server crashes on startup

**Cause**: `SUPABASE_URL` or `SUPABASE_ANON_KEY` not set

**Fix**: Ensure `.env` has all required variables:

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### Issue 4: JWT Expired

**Symptom**: Requests fail with 401 after some time

**Cause**: JWT expired (default 1 hour)

**Fix**: Implement token refresh in frontend:

```typescript
// In AuthContext.tsx
const refreshToken = async () => {
  const response = await api.auth.refresh();
  if (response.status === 200) {
    setToken(response.body.token);
  }
};

// Call on 401 errors
useEffect(() => {
  const interval = setInterval(refreshToken, 50 * 60 * 1000); // 50 min
  return () => clearInterval(interval);
}, []);
```

## Validation Checklist

Before deploying with Supabase Auth:

- [ ] `SUPABASE_URL` and `SUPABASE_ANON_KEY` set in production env
- [ ] `DATABASE_URL` points to Supabase PostgreSQL
- [ ] Email confirmation disabled (`config.toml` pushed)
- [ ] Users table exists in database
- [ ] Supabase adapter has auto-create logic for missing users
- [ ] Frontend handles token storage and 401 errors
- [ ] Login page works with real credentials (not mock)

## Quick Reference

### Switch to Supabase Auth Locally

```bash
# Create .env.local from .env.production
cp .env.production .env.local

# Override modes for local testing
echo "AUTH_MODE=supabase" >> .env.local
echo "STORAGE_MODE=database" >> .env.local  # Drizzle ORM with pooler

# Use it
cp .env.local .env
npm run dev
```

### Switch Back to Mock Auth

```bash
# Restore development defaults
cp .env.development .env
npm run dev
```

### Create Test User in Supabase

```bash
# Using Supabase CLI
supabase auth create-user --email test@example.com --password Test1234!

# Or via API
curl -X POST "https://your-project.supabase.co/auth/v1/signup" \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

## Integration with supabase-project-setup

This skill assumes `supabase-project-setup` has already:
1. Created the Supabase project
2. Pushed schema migrations (including `users` table)
3. Generated `.env.production` with `DATABASE_URL`
4. Disabled email confirmation via `config.toml`

After `supabase-project-setup`, use this skill to:
1. Test Supabase auth locally
2. Debug auth transition issues
3. Understand the dual-user-table architecture
