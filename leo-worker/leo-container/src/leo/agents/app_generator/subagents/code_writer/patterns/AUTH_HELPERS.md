# Pattern 3: Centralized Auth Helpers

**Source:** EdVisor Issue #7
**Impact:** Prevents inline auth logic duplication and bugs

---

## The Problem

Inline auth logic creates bugs and duplication:

```tsx
// ❌ WRONG: Inline localStorage access (repeated everywhere)
function LoginPage() {
  const handleLogin = async (token: string, user: User) => {
    localStorage.setItem('auth_token', token);  // Duplicated
    localStorage.setItem('auth_user', JSON.stringify(user));  // Duplicated
  };
}

function Navbar() {
  const token = localStorage.getItem('auth_token');  // Duplicated
  const isLoggedIn = !!token;  // Duplicated
}

// Problem: If key name changes, must update 10+ files!
```

---

## The Solution

**Create centralized auth helpers file:**

```typescript
// client/src/lib/auth-helpers.ts
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthUser(): User | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setAuthUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
```

---

## Usage in Components

```tsx
// ✅ CORRECT: Import and use helpers
import { getAuthToken, setAuthToken, setAuthUser, clearAuth, isAuthenticated } from '@/lib/auth-helpers';

function LoginPage() {
  const handleLogin = async (credentials: Credentials) => {
    const { token, user } = await apiClient.auth.login({ body: credentials });
    setAuthToken(token);
    setAuthUser(user);
    navigate('/dashboard');
  };
}

function Navbar() {
  const isLoggedIn = isAuthenticated();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav>
      {isLoggedIn ? (
        <Button onClick={handleLogout}>Logout</Button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
```

---

## Required Functions

**ALL 6 must be present:**

1. `getAuthToken()` - Retrieve stored token
2. `setAuthToken(token)` - Store token
3. `getAuthUser()` - Retrieve stored user
4. `setAuthUser(user)` - Store user
5. `clearAuth()` - Remove all auth data
6. `isAuthenticated()` - Check if logged in

---

## Validation Check

```bash
# Check auth helpers file exists
test -f client/src/lib/auth-helpers.ts || echo "❌ MISSING: auth-helpers.ts"

# Check it contains required functions
grep -E "(getAuthToken|setAuthToken|clearAuth|isAuthenticated|getAuthUser|setAuthUser)" client/src/lib/auth-helpers.ts

# Expected: ALL 6 functions present
```

---

## Benefits

- ✅ Single source of truth for auth logic
- ✅ Easy to change storage mechanism (localStorage → sessionStorage → cookies)
- ✅ Consistent behavior across all components
- ✅ Type-safe with proper TypeScript types

---

**EdVisor Evidence**: Issue #7 - Centralized helpers prevented inline logic bugs
