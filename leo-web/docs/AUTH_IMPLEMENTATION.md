# Authentication Implementation (AI Guide)

**Pattern:** Client-side Supabase Auth + Backend JWT Verification

---

## Scaffolded Files (READ-ONLY - Do Not Modify)

These files are provided in the template. Use them, don't change them:

- `server/middleware/auth.ts` - Exports `authMiddleware()` for route protection
- `client/src/lib/supabase-client.ts` - Exports configured `supabase` client
- `client/src/lib/api-client.ts` - Auto-injects JWT from Supabase session

**Read these files when you need implementation details.**

---

## What You Generate

### 1. AuthContext (`client/src/contexts/AuthContext.tsx`)

Provides: `user`, `session`, `signIn()`, `signUp()`, `signOut()`

Uses scaffolded `supabase` client:
```typescript
import { supabase } from '@/lib/supabase-client';

const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};
```

### 2. Login/Signup Pages

Forms that call `signIn()` / `signUp()` from AuthContext. Passwords go to Supabase, never to backend.

### 3. Protected Routes

Wrap routes with auth check or use scaffolded `ProtectedRoute` component if available.

### 4. Protected API Routes (`server/routes/*.ts`)

Use scaffolded `authMiddleware()`:
```typescript
import { authMiddleware } from '../middleware/auth';

router.get('/api/protected', authMiddleware(), (req, res) => {
  const userId = req.user.id;
  // ... business logic
});
```

---

## Critical Rules

**REJECT these patterns:**
- ❌ Backend routes accepting passwords (`POST /api/login` with password in body)
- ❌ Custom JWT signing (`jwt.sign()`)
- ❌ Manual token storage (`localStorage.setItem('auth_token', ...)`)
- ❌ Password hashing in backend (`bcrypt`, `argon2`)

**Why:** Supabase handles auth. Backend only verifies tokens.

---

## Verification

**Must have:**
- ✅ Passwords only sent to Supabase (via `supabase.auth.signInWithPassword()`)
- ✅ Backend uses `authMiddleware()` from scaffold
- ✅ API client automatically includes JWT (reads from Supabase session)

**Must not have:**
- ❌ Backend route with `req.body.password`
- ❌ Custom auth logic (use Supabase SDK)
