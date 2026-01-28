# CONTEXT PROVIDERS FIX - 2025-01-17

## React Context Providers

### Purpose
This stage is responsible for creating React Context providers that manage global application state. These are essential React components that allow data and functions to be shared across the entire component tree without prop drilling.

### What It Should Generate

The Context Provider Generator should create three critical context files:

#### 1. **AuthContext.tsx** (`client/src/contexts/AuthContext.tsx`)
- Manages user authentication state (logged in/out, user data)
- Provides login/logout functions
- Handles session persistence (localStorage/sessionStorage)
- Tracks loading states during auth operations
- Manages authentication errors
- Exports `AuthProvider` component and `useAuth` hook

#### 2. **ThemeContext.tsx** (`client/src/contexts/ThemeContext.tsx`)
- Manages light/dark theme state
- Provides theme switching functionality
- Persists theme preference to localStorage
- Detects system theme preference
- Exports `ThemeProvider` component and `useTheme` hook

#### 3. **NotificationContext.tsx** (`client/src/contexts/NotificationContext.tsx`)
- Manages toast notifications (success, error, warning, info)
- Handles notification queue (multiple notifications)
- Provides auto-dismiss functionality with timeouts
- Integrates with UI toast components
- Exports `NotificationProvider` component and `useNotification` hook

### How The Writer-Critic Pattern Should Work

#### Writer Agent (Context Provider Generator)
**Current Problem**: The agent is analyzing the codebase but NOT actually creating the files.

**What it SHOULD do**:
1. Read the database schema to understand User types
2. Read the API client to see authentication endpoints
3. **CREATE** the contexts directory: `client/src/contexts/`
4. **WRITE** AuthContext.tsx with full implementation
5. **WRITE** ThemeContext.tsx with full implementation
6. **WRITE** NotificationContext.tsx with full implementation
7. Use TypeScript with proper interfaces and types
8. Follow React 18 patterns and best practices

#### Critic Agent (Context Provider Generator Critic)
**Current Problem**: Returns invalid XML format and wrong decision values.

**What it SHOULD do**:
1. Check if all three context files exist
2. Verify TypeScript compilation (no errors)
3. Validate React patterns are correct
4. Check integration with existing code
5. Return XML with decision: "complete" (if all good) or "continue" (if issues found)
6. Include specific errors if any issues are found

### Why This Stage Is Critical

Without these context providers:
- The app cannot manage user authentication
- Theme switching won't work
- Notifications cannot be displayed
- The app will have compilation errors from missing imports
- The entire application is essentially broken

### The Current Failure Pattern

From the log, I can see:
1. **Writer spent 7 minutes analyzing** but never created files
2. **Critic correctly identified** that no files were created
3. **Critic returned "incomplete"** but system expects "complete" or "continue"
4. **XML parser failed** because it expects 2 values but code tries to unpack 4
5. **Pipeline stopped** due to critical failure

This is a violation of the "Never Broken" principle - the app cannot function without these contexts, so the pipeline correctly refuses to continue.

The fix involves:
1. Making the Writer actually CREATE files (not just analyze)
2. Fixing the Critic to return proper XML format
3. Correcting the XML parser expectations in the Critic agent

## IAuthStrategy Pattern (Mirroring IStorage)

### Overview
Just like the IStorage pattern (MemStorage for dev, PostgresStorage/SupabaseStorage for production), we use an IAuthStrategy pattern for authentication. This provides the same benefits: zero external dependencies in development, seamless production switching, and consistent API.

### The Pattern - Exactly Like IStorage:

#### Frontend Implementation:
```typescript
// client/src/lib/auth-strategy.ts
export interface IAuthStrategy {
  login(email: string, password: string): Promise<AuthResponse>
  logout(): Promise<void>
  getSession(): Promise<Session | null>
  onAuthStateChange(callback: (session: Session | null) => void): () => void
}

// Mock strategy - always returns demo user (like MemStorage)
class MockAuthStrategy implements IAuthStrategy {
  private session: Session | null = {
    user: { 
      id: 'demo-user',
      email: 'demo@example.com',
      user_metadata: { name: 'Demo User' }
    },
    access_token: 'mock-token'
  }
  
  async login(email: string, password: string) {
    // Only accepts demo credentials
    if (email === 'demo@example.com' && password === 'DemoRocks2025!') {
      return { user: this.session.user, session: this.session, error: null }
    }
    return { user: null, session: null, error: 'Use demo@example.com / DemoRocks2025!' }
  }
  
  async getSession() {
    return this.session // Always logged in as demo in dev
  }
  
  async logout() {
    // In mock mode, we stay logged in (AI never sees logged out state)
    return
  }
  
  onAuthStateChange(callback) {
    // Immediately call with session
    callback(this.session)
    return () => {} // Unsubscribe function
  }
}

// Supabase strategy - real auth (like PostgresStorage)
class SupabaseAuthStrategy implements IAuthStrategy {
  private supabase: SupabaseClient
  
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    )
  }
  
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    return { user: data.user, session: data.session, error }
  }
  
  async getSession() {
    const { data } = await this.supabase.auth.getSession()
    return data.session
  }
  
  async logout() {
    await this.supabase.auth.signOut()
  }
  
  onAuthStateChange(callback) {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session)
    })
    return () => subscription.unsubscribe()
  }
}

// Factory function - exactly like IStorage pattern
export function getAuthStrategy(): IAuthStrategy {
  if (process.env.VITE_USE_MOCK_AUTH === 'true') {
    return new MockAuthStrategy()
  }
  return new SupabaseAuthStrategy()
}
```

#### Usage in AuthContext:
```typescript
// client/src/contexts/AuthContext.tsx
import { getAuthStrategy } from '@/lib/auth-strategy'

const authStrategy = getAuthStrategy()

export function AuthProvider({ children }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Get initial session
    authStrategy.getSession().then(session => {
      setSession(session)
      setLoading(false)
    })
    
    // Subscribe to changes
    const unsubscribe = authStrategy.onAuthStateChange(setSession)
    return unsubscribe
  }, [])
  
  const login = async (email: string, password: string) => {
    const { user, session, error } = await authStrategy.login(email, password)
    if (!error) setSession(session)
    return { user, error }
  }
  
  const logout = async () => {
    await authStrategy.logout()
    setSession(null)
  }
  
  return (
    <AuthContext.Provider value={{ session, user: session?.user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Backend Express Middleware:
```typescript
// server/middleware/auth.ts
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  
)

export const requireAuth = async (req, res, next) => {
  if (process.env.USE_MOCK_AUTH === 'true') {
    req.user = { id: 'demo', email: 'demo@example.com' }
    return next()
  }
  
  const token = req.headers.authorization?.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  req.user = user
  next()
}
```

### Key Benefits of IAuthStrategy Pattern:

1. **AI Development Experience**:
   - MockAuthStrategy = AI never deals with auth flows
   - Always authenticated as demo user
   - No external dependencies (no Supabase needed)
   - Can focus 100% on features, not auth

2. **Mirrors IStorage Pattern**:
   - Same factory pattern developers already know
   - MemStorage : MockAuthStrategy (development)
   - PostgresStorage : SupabaseAuthStrategy (production)
   - Single environment variable to switch

3. **Zero Code Changes for Production**:
   - Just set `VITE_USE_MOCK_AUTH=false`
   - Same AuthContext code works
   - Same components work
   - Same API calls work

4. **Demo Flexibility**:
   - Development: MockAuthStrategy with hardcoded demo
   - Live demos: Can use mock OR real Supabase with demo account
   - Production: Real Supabase auth

5. **Testing Benefits**:
   - Playwright tests use mock mode
   - No auth setup required
   - Deterministic test results

### Environment Variables:
```env
# Development (with mock) - DEFAULT FOR AI GENERATION
VITE_USE_MOCK_AUTH=true
USE_MOCK_AUTH=true

# Production (or local Supabase testing)
VITE_USE_MOCK_AUTH=false
USE_MOCK_AUTH=false
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=production-service-key
```

### Libraries Required:
- **@supabase/supabase-js** - Core Supabase client (only needed for production)
- **No additional auth libraries in mock mode**

### Industry Validation:
This Supabase-for-both-database-and-auth approach is used by companies like **Vercel**, **Linear**, and **Cal.com** when building SaaS products. It's a proven pattern that eliminates the complexity of separate auth services.

### What Context Provider Generator Must Create:

1. **client/src/lib/auth-strategy.ts** - IAuthStrategy interface and implementations
2. **client/src/contexts/AuthContext.tsx** - Uses getAuthStrategy() factory
3. **client/src/contexts/ThemeContext.tsx** - Light/dark theme switching
4. **client/src/contexts/NotificationContext.tsx** - Toast notifications

All files must be CREATED (not just analyzed) with full implementations.

## Best Practice Agent Patterns and Communication Format

### Overview
The Leonardo pipeline uses a Writer-Critic pattern with structured XML communication to ensure code quality and the "Never Broken" principle.

### Never Broken Principle
The pipeline must stop at the first critical failure rather than continuing with broken code:
- Writers iterate until validation passes (OXC, tests, etc.)
- Critics ensure working code before advancing
- Pipeline halts immediately on critical failures
- No broken code propagates through stages

### Agent Configuration Best Practices

#### Max Turns Setting
```python
# CRITICAL: Set max_turns high enough for complex generation
AGENT_CONFIG = {
    "name": "Context Provider Generator",
    "model": "sonnet",
    "allowed_tools": ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob"],
    "mcp_tools": ["oxc", "tree_sitter"],
    "max_turns": 30  # MUST be 30+ for complex agents that create multiple files
}
```

**Why max_turns matters**:
- Too low (10-20): Agent times out before completing
- Critic makes it loop forever if Writer can't finish
- Successful agents use 30 (API Client Generator works with 30)
- Build stage allows 20 iterations of Writer-Critic loop

### Writer-Critic Pattern

#### Writer Responsibilities
1. **Generate code** based on specifications  
2. **Self-test** using linting/compilation tools
3. **Accept previous_critic_xml** for iterations
4. **Return success/failure status** with generated artifacts

#### Writer User Prompt Must Be EXPLICIT:
```python
def create_user_prompt(previous_critic_xml: str = "") -> str:
    return """
Your task is to CREATE the React Context providers.

## REQUIRED ACTIONS (DO NOT JUST ANALYZE):
1. Use Write tool to CREATE client/src/contexts/ directory
2. Use Write tool to CREATE client/src/lib/auth-strategy.ts with IAuthStrategy pattern
3. Use Write tool to CREATE client/src/contexts/AuthContext.tsx
4. Use Write tool to CREATE client/src/contexts/ThemeContext.tsx  
5. Use Write tool to CREATE client/src/contexts/NotificationContext.tsx

DO NOT just analyze existing code - you MUST CREATE the files.
"""
```

#### Critic Responsibilities
1. **Validate independently** (don't trust Writer's claims)
2. **Check file existence** and correctness
3. **Run validation tools** (OXC, TypeScript, etc.)
4. **Return structured decision** ("complete" or "continue")

### XML Response Format

#### Expected Critic Response
```xml
<decision>complete</decision>
<errors></errors>
```

Or with issues:
```xml
<decision>continue</decision>
<errors>
- Missing auth-strategy.ts file
- AuthContext.tsx not using IAuthStrategy pattern
- TypeScript compilation errors in ThemeContext
</errors>
```

#### XML Parser (from xml_utils/xml_parser.py)
- Returns **exactly 2 values**: (decision, errors)
- Decision: "complete" or "continue" (NEVER "incomplete")
- Errors: String with error details or empty string
- Safe defaults if parsing fails

### Error Handling Patterns

#### Writer Error Handling
```python
try:
    result = await self.agent.run(user_prompt)
    if not result.success:
        return False, {}, f"Writer failed: {result.content}"
    # Process successful result
    return True, {"files_created": [...]}, "Success"
except Exception as e:
    return False, {}, f"Writer exception: {str(e)}"
```

#### Critic Error Handling  
```python
try:
    result = await self.agent.run(user_prompt)
    if not result.success:
        return "fail", {"error": result.content}
    
    # Parse XML - expects exactly 2 values
    decision, errors = parse_critic_xml(result.content)
    
    return decision, {
        "decision": decision,
        "errors": errors,
        "compliance_score": 95 if decision == "complete" else 50
    }
except Exception as e:
    return "fail", {"error": str(e)}"
```

### Communication Best Practices

1. **Agent-to-Agent**: Use Markdown format for readability
2. **Agent-to-Program**: Use structured data (XML/JSON) for parsing
3. **Critics must validate**: Always return valid XML with proper tags
4. **Writers must be explicit**: Use clear CREATE language in prompts
5. **Logging**: Use logger.info() for visibility (DEBUG won't show)

## Combined Implementation Plan

### Problem Summary
1. **Context Provider Generator Writer** analyzes but doesn't CREATE files
2. **Context Provider Generator Critic** expects 4 values from XML parser (should be 2)
3. **max_turns too low** (20, should be 30)
4. **Missing IAuthStrategy implementation** for authentication context

### Solution Implementation

#### Phase 1: Update Configuration
**File**: `src/app_factory_leonardo_replit/agents/context_provider_generator/config.py`
```python
AGENT_CONFIG = {
    "name": "Context Provider Generator",
    "model": "sonnet",
    "allowed_tools": ["Read", "Write", "Edit", "MultiEdit", "Grep", "Glob"],
    "mcp_tools": ["oxc", "tree_sitter"],
    "max_turns": 30  # Increase from 20 to 30
}
```

#### Phase 2: Fix Context Provider Generator Writer
**File**: `src/app_factory_leonardo_replit/agents/context_provider_generator/user_prompt.py`

```python
def create_user_prompt(previous_critic_xml: str = "") -> str:
    base_prompt = """
Your task is to CREATE the React Context providers and auth strategy for the application.

## REQUIRED FILES TO CREATE (NOT ANALYZE)

You MUST use the Write tool to CREATE these files:

### 1. client/src/lib/auth-strategy.ts
Implement the IAuthStrategy pattern (exactly like IStorage):
- IAuthStrategy interface with login, logout, getSession, onAuthStateChange
- MockAuthStrategy class (always returns demo@example.com / DemoRocks2025!)
- SupabaseAuthStrategy class (uses Supabase client)
- getAuthStrategy() factory function using VITE_USE_MOCK_AUTH env var

### 2. client/src/contexts/AuthContext.tsx
- Import and use getAuthStrategy() from auth-strategy.ts
- Provide login, logout, user, loading state
- Export AuthProvider component and useAuth hook

### 3. client/src/contexts/ThemeContext.tsx
- Manage light/dark theme state
- Persist to localStorage
- Export ThemeProvider and useTheme hook

### 4. client/src/contexts/NotificationContext.tsx  
- Manage toast notifications (success, error, info, warning)
- Auto-dismiss with timeouts
- Export NotificationProvider and useNotification hook

## CRITICAL INSTRUCTIONS

1. First check if client/src/contexts/ directory exists, if not CREATE it
2. Use Write tool to CREATE each file with FULL implementation
3. DO NOT just analyze or read - you MUST CREATE the files
4. Use TypeScript with proper interfaces and types
5. Assume @shared/schema and API client exist

## Mock Auth Strategy Requirements
- Always returns logged in session for demo@example.com
- Password must be DemoRocks2025!
- In mock mode, user is ALWAYS authenticated (for AI development)
"""
    
    if previous_critic_xml:
        base_prompt += f"""

## Previous Critic Feedback
{previous_critic_xml}

Address ALL the issues mentioned above before proceeding.
"""
    
    return base_prompt
```

#### Phase 3: Fix Context Provider Generator Critic
**File**: `src/app_factory_leonardo_replit/agents/context_provider_generator/critic/agent.py`

```python
# Line 77 - WRONG:
decision, compliance_score, summary, errors = parse_critic_xml(result.content)

# CHANGE TO - CORRECT:
decision, errors = parse_critic_xml(result.content)
```

Update evaluation_data:
```python
evaluation_data = {
    "decision": decision,
    "errors": errors,
    "compliance_score": 95 if decision == "complete" else 50,
    "raw_response": result.content
}
```

#### Phase 4: Fix Critic System Prompt
**File**: `src/app_factory_leonardo_replit/agents/context_provider_generator/critic/system_prompt.py`

```python
SYSTEM_PROMPT = """You are the Context Provider Generator Critic.

## Your Role
Validate that all required React Context providers and auth strategy have been created correctly.

## Required Files to Check
1. client/src/lib/auth-strategy.ts - IAuthStrategy pattern implementation
2. client/src/contexts/AuthContext.tsx - Uses getAuthStrategy()
3. client/src/contexts/ThemeContext.tsx - Theme management
4. client/src/contexts/NotificationContext.tsx - Toast notifications

## Validation Checklist
- [ ] All four files exist and have content
- [ ] auth-strategy.ts implements IAuthStrategy interface
- [ ] MockAuthStrategy has hardcoded demo@example.com / DemoRocks2025!
- [ ] SupabaseAuthStrategy uses Supabase client
- [ ] getAuthStrategy() factory uses VITE_USE_MOCK_AUTH env var
- [ ] AuthContext imports and uses getAuthStrategy()
- [ ] Each context exports Provider and useHook
- [ ] TypeScript types are properly defined
- [ ] No compilation errors

## Response Format
You MUST respond with this XML format:

<decision>complete</decision>
<errors></errors>

Or if issues found:

<decision>continue</decision>
<errors>
- Specific issue 1
- Specific issue 2
</errors>

IMPORTANT:
- Return "complete" if all files exist and are correct
- Return "continue" if issues need fixing (NEVER return "incomplete")
- List specific actionable errors
"""
```

### Testing Plan

1. **Unit Test Writer**: Verify it creates all 4 files
2. **Unit Test Critic**: Verify it returns 2-value tuple
3. **Integration Test**: Run full pipeline
4. **Validation**: Check TypeScript compilation

### Success Criteria

- [ ] Context Provider Writer creates 4 files (including auth-strategy.ts)
- [ ] Critic correctly parses XML (2 values)
- [ ] Critic returns "complete" or "continue" (never "incomplete")  
- [ ] auth-strategy.ts uses IAuthStrategy pattern like IStorage
- [ ] MockAuthStrategy has hardcoded demo credentials
- [ ] Pipeline continues past Context Provider stage
- [ ] Generated app compiles without errors

## Phase 2: Full Pipeline Supabase Auth Integration (AFTER Context Provider Fix)

### Overview
Once the Context Provider Generator is fixed and creating IAuthStrategy correctly, these additional pipeline updates will complete the Supabase auth integration.

### Pipeline Components Needing Updates

#### 1. Routes Generator (Minor)
**Location**: `src/app_factory_leonardo_replit/agents/routes_generator/`
**Change**: Add auth middleware to protected routes
```typescript
// In generated routes
import { requireAuth } from '../middleware/auth'
router.use('/api/tasks', requireAuth, tasksRouter)
```

#### 2. API Client Generator (Minor)
**Location**: `src/app_factory_leonardo_replit/agents/api_client_generator/`
**Change**: Include auth token in requests
```typescript
const token = localStorage.getItem('auth-token')
headers: {
  'Authorization': token ? `Bearer ${token}` : '',
  'Content-Type': 'application/json'
}
```

#### 3. Template Check
**Location**: `~/.mcp-tools/templates/vite-express-template-v2.1.0.tar.gz`
**Verify**: Does package.json include @supabase/supabase-js?
**If not**: Add to dependencies when USE_MOCK_AUTH=false

#### 4. Environment Defaults
**Location**: `src/app_factory_leonardo_replit/templates/tech_stack.md`
**Add**: Default `VITE_USE_MOCK_AUTH=true` for AI generation

### Why Most Components Don't Need Changes
- Mock mode = no Supabase dependency during AI generation
- Auth abstracted behind IAuthStrategy interface
- Components use `useAuth()` hook without knowing implementation
- Only Context Provider Generator knows about auth pattern

### Implementation Order
1. **First**: Fix Context Provider Generator (this document's main focus)
2. **Test**: Verify IAuthStrategy pattern works in generated apps
3. **Then**: Make minor updates to Routes and API Client generators
4. **Finally**: Update template if needed

### Note
Storage Generator already supports Supabase and will share the same Supabase client instance when both auth and storage use Supabase in production.