# Auth-Only API Reference

Complete reference for the auth-only Supabase solution. This focuses purely on authentication - use your existing database solution for data operations.

## Client-Side API

### `createClient(url?, key?, options?)`

Smart auth client factory with automatic mock fallback.

```typescript
import { createClient } from './supabase-auth-client'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,      // undefined → mock mode
  process.env.VITE_SUPABASE_ANON_KEY  // undefined → mock mode
)
```

**Parameters:**
- `url`: Supabase project URL (optional)
- `key`: Supabase anon key (optional)
- `options`: Additional Supabase options (optional)

**Returns:** `SupabaseAuthClient` (real or mock)

**Behavior:**
- Missing/invalid credentials → Mock mode
- Valid credentials → Real Supabase auth client
- Real client load failure → Fallback to mock

### Auth Client Methods

#### Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { name: 'User Name' } // Optional metadata
  }
})

// Sign in with password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google' // 'github', 'google', 'discord', etc.
})

// Sign out
const { error } = await supabase.auth.signOut()
```

#### Session Management

```typescript
// Get current session
const { data: { session }, error } = await supabase.auth.getSession()

// Get current user
const { data: { user }, error } = await supabase.auth.getUser()

// Refresh session
const { data, error } = await supabase.auth.refreshSession()

// Set session (for SSR)
const { data, error } = await supabase.auth.setSession({
  access_token: 'token',
  refresh_token: 'refresh'
})
```

#### User Management

```typescript
// Update user metadata
const { data, error } = await supabase.auth.updateUser({
  data: { name: 'New Name' }
})

// Reset password
const { error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com'
)
```

#### Event Handling

```typescript
// Listen for auth state changes
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event, session)
  }
)

// Unsubscribe
subscription.unsubscribe()
```

**Auth Events:**
- `SIGNED_IN` - User signed in
- `SIGNED_OUT` - User signed out  
- `SIGNED_UP` - User signed up
- `USER_UPDATED` - User metadata updated
- `PASSWORD_RECOVERY` - Password reset initiated

## React Hooks & Components

### `useAuth()`

Main authentication hook.

```typescript
const {
  user,           // User object or null
  session,        // Session object or null
  loading,        // Boolean loading state
  signIn,         // Sign in function
  signUp,         // Sign up function
  signOut,        // Sign out function
  signInWithOAuth,// OAuth sign in function
  updateProfile,  // Update user profile
  resetPassword   // Reset password function
} = useAuth()
```

### `useIsAuthenticated()`

Simple authentication check.

```typescript
const { isAuthenticated, loading } = useIsAuthenticated()

if (loading) return <Loading />
if (!isAuthenticated) return <SignIn />
return <Dashboard />
```

### `useUser()`

Get current user only.

```typescript
const { user, loading } = useUser()

return (
  <div>
    {loading ? 'Loading...' : `Hello ${user?.email || 'Guest'}`}
  </div>
)
```

### `useAuthActions()`

Get auth methods without state.

```typescript
const { signIn, signUp, signOut } = useAuthActions()

const handleQuickSignIn = () => signIn('demo@example.com', 'password')
```

### `<AuthProvider>`

Root authentication provider.

```tsx
import { AuthProvider } from './lib/auth-context'

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  )
}
```

**Props:** None - automatically detects environment

### `<AuthGuard>`

Conditional rendering based on auth state.

```tsx
// Require authentication
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// Show only when NOT authenticated
<AuthGuard requireAuth={false}>
  <LoginForm />
</AuthGuard>

// Custom fallback
<AuthGuard fallback={<CustomSignInPage />}>
  <ProtectedContent />
</AuthGuard>
```

**Props:**
- `children`: Content to render when condition met
- `requireAuth`: Boolean (default: true)
- `fallback`: Custom component when condition not met

### `withAuth(Component)`

Higher-order component for route protection.

```tsx
const ProtectedPage = withAuth(MyPage)

function MyPage() {
  // User guaranteed to be authenticated
  return <div>Protected content</div>
}
```

### `<AuthDebugInfo>`

Development helper (dev mode only).

```tsx
function App() {
  return (
    <div>
      <YourApp />
      <AuthDebugInfo /> {/* Shows auth state in bottom-right */}
    </div>
  )
}
```

## Server-Side API

### `authMiddleware`

Express middleware requiring authentication.

```typescript
import { authMiddleware } from './auth-middleware'

app.get('/api/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user // Guaranteed to exist
  res.json({ email: user.email })
})
```

**Sets:** `req.user` with authenticated user object

**Returns:** 401 if no valid token

### `optionalAuthMiddleware`

Express middleware with optional authentication.

```typescript
import { optionalAuthMiddleware } from './auth-middleware'

app.get('/api/data', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user // May be null
  res.json({ 
    data: getData(),
    personalized: !!user 
  })
})
```

**Sets:** `req.user` if valid token present, otherwise `undefined`

**Never returns:** error (continues without user)

### `requireRole(role)`

Role-based authorization middleware.

```typescript
import { authMiddleware, requireRole } from './auth-middleware'

app.get('/api/admin', 
  authMiddleware, 
  requireRole('admin'), 
  (req, res) => {
    // User guaranteed to have admin role
    res.json({ adminData: true })
  }
)
```

**Requires:** `authMiddleware` to run first

**Returns:** 403 if user lacks required role

### Utility Functions

```typescript
// Get user from request
const user = getUser(req) // User object or null

// Require user (throws if not authenticated)
const user = requireUser(req) // User object or throws

// Check if mock auth
const isMock = isMockAuth(req) // Boolean

// Get raw token
const token = getAuthToken(req) // Token string or null

// Log auth state (development)
logAuthState(req) // Logs to console
```

### Configuration Helpers

```typescript
// Validate environment
const validation = validateAuthEnvironment()
console.log(validation.message) // Status message

// Auth-friendly CORS
app.use(supabaseCors())
```

## Type Definitions

### User Object

```typescript
interface User {
  id: string                    // Unique user ID
  email: string                 // User email
  user_metadata?: {             // Custom user data
    name?: string
    avatar_url?: string
    [key: string]: any
  }
  app_metadata?: {              // System metadata
    provider?: string           // 'mock' | 'supabase'
    [key: string]: any
  }
}
```

### Session Object

```typescript
interface Session {
  access_token: string          // JWT token
  refresh_token?: string        // Refresh token
  expires_at?: number          // Expiration timestamp
  user: User                   // User object
}
```

### Request Interface

```typescript
interface AuthenticatedRequest extends Request {
  user?: User                  // Set by auth middleware
}
```

## Mock Mode Behavior

### Demo User

```typescript
const DEMO_USER = {
  id: "demo-user-123",
  email: "demo@example.com",
  user_metadata: {
    name: "Demo User",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
  },
  app_metadata: {
    provider: "mock"
  }
}
```

### Authentication Behavior

- **All sign-in attempts succeed** (any email/password)
- **OAuth returns immediate success** (no redirects)
- **Session never expires** (perfect for testing)
- **User always authenticated** (great for AI)

### Token Format

```typescript
const MOCK_SESSION = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  user: DEMO_USER
}
```

**Valid tokens in mock mode:**
- `"mock-access-token"`
- Any string starting with `"mock"`

## Environment Variables

### Client-Side

```bash
# Mock mode (default - no variables needed)

# Real Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Server-Side

```bash
# Mock mode (default - no variables needed)

# Real Supabase JWT verification
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings

# Optional
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### Mode Detection

**Mock mode activated when:**
- No `VITE_SUPABASE_URL` set
- No `VITE_SUPABASE_ANON_KEY` set
- URL contains "mock"
- Key contains "mock"
- Values are "undefined" string

**Real mode activated when:**
- Both URL and key are valid
- URL contains "supabase"
- Key looks like JWT (>100 chars)

## Error Handling

### Client-Side Errors

All auth methods return `{ data, error }` format:

```typescript
const { data, error } = await supabase.auth.signIn(credentials)

if (error) {
  console.error('Auth failed:', error.message)
  // Handle error (show message, redirect, etc.)
} else {
  console.log('Success:', data.user.email)
  // Handle success
}
```

### Server-Side Errors

Middleware returns appropriate HTTP status codes:

```typescript
// 401 Unauthorized
{
  "error": "Missing authorization header",
  "code": "MISSING_AUTH_HEADER"
}

// 403 Forbidden  
{
  "error": "Required role: admin",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### Common Error Codes

- `MISSING_AUTH_HEADER` - No Authorization header
- `INVALID_TOKEN` - JWT verification failed
- `AUTH_REQUIRED` - Authentication needed
- `INSUFFICIENT_PERMISSIONS` - Role requirement not met

## Integration Examples

### With Your Database

```typescript
// React component
function UserDashboard() {
  const { user } = useAuth() // From Supabase
  const [data, setData] = useState([])

  useEffect(() => {
    if (user) {
      // Use your database with Supabase user ID
      yourDatabase.query('SELECT * FROM user_data WHERE user_id = ?', [user.id])
        .then(setData)
    }
  }, [user])

  return <div>{/* Render data */}</div>
}

// Express route
app.get('/api/user-data', authMiddleware, async (req, res) => {
  const user = req.user // From Supabase auth
  
  // Use your database
  const data = await yourDatabase.query(
    'SELECT * FROM user_data WHERE user_id = ?',
    [user.id]
  )
  
  res.json(data)
})
```

### Multi-Step Auth Flow

```typescript
// 1. Sign up with Supabase
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 2. Create profile in your database
if (!authError && authData.user) {
  await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authData.session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: authData.user.id,
      name: 'User Name',
      preferences: {}
    })
  })
}
```

## Performance Notes

### Client-Side
- Auth state cached in React context
- Automatic token refresh
- Minimal bundle size (auth-only)

### Server-Side
- Fast JWT verification (no database calls)
- Stateless authentication
- Your database performance unchanged

### Network
- Standard HTTP auth headers
- No extra auth-related requests
- Optimal caching strategies apply

This auth-only approach provides complete authentication functionality while keeping your database solution completely separate and unchanged.