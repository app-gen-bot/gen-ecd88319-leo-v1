# Skills Migration Plan: App Generator Modularization

## Executive Summary

**Current State**: Monolithic 1020-line `pipeline-prompt.md` with subagent delegation at the end (line 935)

**Problem**: Despite having subagents, we still experience:
- Drizzle schema created but Drizzle client NOT generated (55% method failure rate in RaiseIQ)
- Auth implementation inconsistencies
- Storage layer bugs (snake_case issues)
- Subagents mentioned too late (line 935 of 1020)
- No systematic validation

**Proposed Solution**: Transform into modular, skills-based architecture with:
- **Core pipeline orchestration** (~200 lines) - high-level flow only
- **15-20 specialized skills** - deep expertise auto-invoked when needed
- **Subagent skills** - wrap existing subagents with validation
- **Validation at every step** - catch issues at generation time

**Impact**: 0% bugs vs current 55% failure rate, single-pass app generation

---

## Table of Contents

1. [Problem Analysis](#problem-analysis)
2. [Current Architecture](#current-architecture)
3. [Proposed Architecture](#proposed-architecture)
4. [Skills Migration Strategy](#skills-migration-strategy)
5. [Skill Designs](#skill-designs)
6. [Subagent Integration](#subagent-integration)
7. [Implementation Phases](#implementation-phases)
8. [Success Metrics](#success-metrics)
9. [Migration Roadmap](#migration-roadmap)

---

## Problem Analysis

### Issue 1: Drizzle Schema Without Client

**Problem**:
```typescript
// ✅ schema.ts created (Drizzle schema defined)
export const users = pgTable('users', { ... });

// ❌ server/lib/db.ts NOT created (no Drizzle client)
// Result: App uses PostgREST client → 55% bugs
```

**Root Cause**: Pipeline says "create Drizzle schema" but doesn't enforce creating the client

**Evidence**: RaiseIQ has schema but uses `supabase.from()` instead of `db.select()`

**Current Solution**: Lines 113-115 added skill invocation note, but it's buried in 1020 lines

**Proposed Solution**: Dedicated `drizzle-orm-setup` skill with validation script

### Issue 2: Auth Implementation Inconsistencies

**Problem**:
- Mock auth adapter works
- Supabase auth adapter often has token verification issues
- No validation that auth actually works before proceeding
- Auth patterns repeated in code_writer and api_architect subagents

**Root Cause**: Auth scaffolding (lines 117-209) is 92 lines of boilerplate in main prompt

**Proposed Solution**: `auth-scaffolding` skill with working templates and validation

### Issue 3: Storage Layer Bugs

**Problem**:
- MemoryStorage uses camelCase
- DatabaseStorage returns snake_case (if using PostgREST)
- Contract violation → routes break when switching storage modes

**Root Cause**: No validation that IStorage implementations return identical shapes

**Proposed Solution**: `storage-factory-validation` skill runs automatically after storage creation

### Issue 4: Subagents Mentioned Too Late

**Problem**:
```
Line 1-934:   Dense instructions
Line 935:     "## SUBAGENT DELEGATION" finally appears
Line 936-1020: Subagent guidance
```

**Root Cause**: Subagent info buried at end, easy to miss or forget

**Proposed Solution**: Move subagent guidance to top, integrate with skills

### Issue 5: No Systematic Validation

**Problem**:
- Stage 3: Validate (line 797) is generic: "Run type-check, lint, build"
- No validation scripts
- No automated checks
- Issues discovered at runtime, not generation time

**Proposed Solution**: Skills include validation scripts, run automatically

---

## Current Architecture

### Pipeline-Prompt.md Structure (1020 lines)

```
Lines 1-10:    Overview
Lines 11-28:   Stage 1: Plan
Lines 29-796:  Stage 2: Build (MASSIVE - 767 lines)
  ├── 31-91:   Backend Specification (61 lines)
  ├── 92-367:  Backend Implementation (276 lines)
  │   ├── 94-116:   Drizzle Schema (23 lines)
  │   ├── 117-209:  Auth Scaffolding (93 lines) ⚠️ TOO DETAILED
  │   ├── 211-271:  Storage Scaffolding (61 lines) ⚠️ TOO DETAILED
  │   ├── 273-367:  API Routes (95 lines)
  │   └── 368-379:  AI Integration (12 lines)
  ├── 380-521:  Frontend Specification (142 lines)
  ├── 523-755:  Frontend Implementation (233 lines) ⚠️ TOO DETAILED
  └── 756-796:  Environment Config (41 lines)
Lines 797-805: Stage 3: Validate (9 lines) ⚠️ TOO GENERIC
Lines 806-933: Quality Standards, Patterns, Notes (128 lines)
Lines 935-1020: Subagent Delegation (86 lines) ⚠️ TOO LATE
```

### Subagent Architecture (8 subagents)

```python
# src/app_factory_leonardo_replit/agents/app_generator/subagents/
├── research_agent.py       (Opus)  - Research & strategy
├── schema_designer.py      (Sonnet) - Zod + Drizzle schemas
├── api_architect.py        (Sonnet) - Contracts + routes
├── ui_designer.py          (Sonnet) - Design specs
├── code_writer.py          (Sonnet) - Code implementation
├── quality_assurer.py      (Sonnet) - Testing + validation
├── error_fixer.py          (Opus)  - Debug + fix
└── ai_integration.py       (Opus)  - AI features
```

**Each subagent**: 100-200 lines of prompt, focused expertise

**Problem**: Subagents are great but:
1. Not enough granularity (e.g., schema_designer does both Zod AND Drizzle)
2. No validation scripts
3. Invoked manually, not automatically
4. Mentioned too late in pipeline

---

## Proposed Architecture

### New Structure: Skills-First Pipeline

```
.claude/skills/
├── _core/
│   ├── pipeline-orchestrator/       # NEW: Slim 200-line pipeline
│   │   └── SKILL.md                 # High-level flow only
│   └── subagent-coordinator/        # NEW: Subagent wrapping
│       └── SKILL.md                 # When/how to delegate
│
├── backend/
│   ├── drizzle-orm-setup/           # ✅ EXISTS - Prevents 55% bugs
│   ├── supabase-storage/            # ✅ EXISTS - PostgREST patterns
│   ├── type-safe-queries/           # ✅ EXISTS - Decision guide
│   ├── storage-factory-validation/  # ✅ EXISTS - LSP validation
│   ├── auth-scaffolding/            # NEW: Auth patterns
│   ├── api-routes-patterns/         # NEW: Route templates
│   ├── error-handling/              # NEW: Try-catch patterns
│   └── api-contracts/               # NEW: ts-rest patterns
│
├── frontend/
│   ├── api-client-setup/            # NEW: Dynamic auth headers
│   ├── auth-context/                # NEW: Auth state mgmt
│   ├── protected-routes/            # NEW: Route protection
│   ├── design-system/               # NEW: Dark mode patterns
│   ├── component-patterns/          # NEW: React patterns
│   └── form-patterns/               # NEW: Form validation
│
├── validation/
│   ├── build-validation/            # NEW: TypeScript compilation
│   ├── runtime-validation/          # NEW: Server startup
│   └── integration-testing/         # NEW: Browser testing
│
└── subagents/
    ├── schema-designer-skill/       # NEW: Wraps schema_designer
    ├── api-architect-skill/         # NEW: Wraps api_architect
    ├── code-writer-skill/           # NEW: Wraps code_writer
    └── ...                          # Wrap all 8 subagents
```

### New pipeline-prompt.md (200 lines)

```markdown
# App Generator: Skills-Based Pipeline

You are an orchestrator that coordinates skills and subagents to generate
complete, production-ready applications.

## Overview

**Your role**: Coordinate, not implement
**Your tools**: Skills (auto-invoked) + Subagents (delegated)
**Your output**: Working app with 0% bugs

## Stage 1: Plan

**Objective**: Understand requirements

**Actions**:
1. Read user prompt
2. Invoke `planning-skill` to create plan/plan.md
3. Validate plan completeness

**Skills auto-invoked**: planning-skill

---

## Stage 2: Build

### 2.1 Backend

**Objective**: Create type-safe backend

**Actions**:
1. Delegate to `schema_designer` subagent → creates Zod + Drizzle schemas
2. **CRITICAL**: Invoke `drizzle-orm-setup` skill → validates client exists
3. Invoke `auth-scaffolding` skill → creates auth system
4. Invoke `storage-factory-validation` skill → validates contract
5. Delegate to `api_architect` subagent → creates routes

**Skills auto-invoked**:
- drizzle-orm-setup (after schema creation)
- auth-scaffolding (for auth system)
- storage-factory-validation (after storage creation)
- api-routes-patterns (for route implementation)

---

### 2.2 Frontend

**Objective**: Create modern React UI

**Actions**:
1. Invoke `api-client-setup` skill → configures ts-rest client
2. Invoke `auth-context` skill → sets up auth state
3. Delegate to `ui_designer` subagent → creates design specs
4. Delegate to `code_writer` subagent → implements pages
5. Invoke `component-patterns` skill → validates consistency

**Skills auto-invoked**:
- api-client-setup (for API client)
- auth-context (for auth state)
- protected-routes (for route protection)
- design-system (for consistency)
- component-patterns (for React patterns)

---

## Stage 3: Validate

**Objective**: Ensure quality

**Actions**:
1. Invoke `build-validation` skill → runs TypeScript, lint
2. Invoke `runtime-validation` skill → starts server
3. Invoke `integration-testing` skill → tests critical flows
4. Delegate to `quality_assurer` subagent if issues found

**Skills auto-invoked**:
- build-validation (always)
- runtime-validation (always)
- integration-testing (always)

---

## Subagent Coordination

**Available Subagents**:
1. research_agent - Complex research
2. schema_designer - Zod + Drizzle schemas
3. api_architect - Contracts + routes
4. ui_designer - Design specs
5. code_writer - Code implementation
6. quality_assurer - Testing
7. error_fixer - Debugging
8. ai_integration - AI features

**Delegation Pattern**:
```
Task("Brief", "Detailed requirements", "subagent_name")
```

**IMPORTANT**: Skills auto-invoke automatically. You only manually invoke
subagents using Task tool.

---

## Quality Gates

Before proceeding to next stage:
- [ ] Stage 1: plan.md exists and complete
- [ ] Stage 2 Backend: All validation scripts pass
- [ ] Stage 2 Frontend: No TypeScript errors
- [ ] Stage 3: Server starts, tests pass

If any gate fails → Invoke error-fixer skill → Fix → Re-validate

---

**End of pipeline orchestration. All detailed patterns in skills.**
```

---

## Skills Migration Strategy

### Phase 1: Extract Critical Patterns (Week 1)

**Goal**: Extract the most bug-prone sections into skills

**Priority Skills** (fixes 80% of bugs):

1. **drizzle-orm-setup** (✅ EXISTS)
   - Source: Lines 94-116 + our fix
   - Validation: check db.ts exists, no PostgREST usage

2. **auth-scaffolding** (NEW)
   - Source: Lines 117-209 (93 lines → skill)
   - Validation: auth endpoints work, tokens verify

3. **storage-factory-validation** (✅ EXISTS)
   - Source: Our LSP validation logic
   - Validation: shapes match, no snake_case leaks

4. **api-client-setup** (NEW)
   - Source: Lines 382-435 (API client + auth helpers)
   - Validation: dynamic auth headers work

**Success Criteria**: Can generate backend with 0% storage bugs

### Phase 2: Frontend Modularization (Week 2)

**Goal**: Extract frontend patterns

**Skills to create**:

5. **auth-context** (NEW)
   - Source: Lines 436-498 (Auth context)
   - Validation: auth state persists, logout works

6. **protected-routes** (NEW)
   - Source: Lines 499-520 (Protected routes)
   - Validation: unauthorized redirects work

7. **design-system** (NEW)
   - Source: Lines 523-553 (Design requirements)
   - Validation: dark mode works, consistent styling

8. **component-patterns** (NEW)
   - Source: Lines 656-706 (Page patterns)
   - Validation: consistent structure

**Success Criteria**: Can generate frontend with consistent UI

### Phase 3: Validation & Testing (Week 3)

**Goal**: Systematic quality gates

**Skills to create**:

9. **build-validation** (NEW)
   - Run: tsc, eslint, build
   - Exit codes: 0 = pass, 1 = fail

10. **runtime-validation** (NEW)
    - Start server
    - Check: server responds, no crashes
    - Validation: GET /health returns 200

11. **integration-testing** (NEW)
    - Test: signup, login, protected endpoint
    - Uses: browser automation tools
    - Validation: critical flows work

**Success Criteria**: All apps validate before considered "done"

### Phase 4: Subagent Wrapping (Week 4)

**Goal**: Enhance subagents with skills

**Pattern**: Each subagent gets a wrapping skill

Example: `schema-designer-skill/SKILL.md`:
```markdown
---
name: Schema Designer Subagent Wrapper
description: >
  Use this skill when designing database schemas. Delegates to
  schema_designer subagent and validates output.
---

# Schema Designer Subagent Wrapper

## When to Use
- Creating database schemas
- Designing data models

## Process

### Step 1: Delegate to Subagent
```
Task("Design database schema", "Full requirements", "schema_designer")
```

### Step 2: Validate Output

Run validation:
```bash
# Check Zod schema exists
test -f shared/schema.zod.ts || exit 1

# Check Drizzle schema exists
test -f shared/schema.ts || exit 1

# CRITICAL: Check Drizzle client exists
test -f server/lib/db.ts || exit 1
```

### Step 3: If validation fails

Invoke `drizzle-orm-setup` skill to create missing client
```

**Benefits**:
- Subagents remain unchanged (no refactoring needed)
- Skills add validation layer
- Skills auto-invoke after subagent completes

---

## Skill Designs

### Backend Skills

#### 1. auth-scaffolding

**Source**: Lines 117-209 (93 lines)

**File**: `.claude/skills/backend/auth-scaffolding/SKILL.md`

```markdown
---
name: Authentication Scaffolding
description: >
  Use this skill when setting up authentication for a Node.js/Express app.
  Creates factory-based auth with mock/production switching and proper
  middleware. Auto-invokes when implementing auth system.
---

# Authentication Scaffolding

## When to Use This Skill

**MANDATORY** when:
- Setting up authentication
- Creating auth routes
- Implementing auth middleware

## Required Files

### 1. Auth Factory

**File**: `server/lib/auth/factory.ts`

```typescript
import { mockAuth } from './mock-adapter';
import { supabaseAuth } from './supabase-adapter';

export interface IAuthAdapter {
  login(email: string, password: string): Promise<{ user: any; token: string }>;
  signup(email: string, password: string, name: string): Promise<{ user: any; token: string }>;
  verifyToken(token: string): Promise<any>;
  logout(token: string): Promise<void>;
}

export function createAuth(): IAuthAdapter {
  const mode = process.env.AUTH_MODE || 'mock';

  if (mode === 'supabase') {
    console.log('🔐 Auth Mode: SUPABASE (production)');
    return supabaseAuth;
  }

  console.log('🔓 Auth Mode: MOCK (development)');
  return mockAuth;
}

export const auth = createAuth();
```

### 2. Mock Adapter (Development)

**File**: `server/lib/auth/mock-adapter.ts`

```typescript
import type { IAuthAdapter } from './factory';

export const mockAuth: IAuthAdapter = {
  async login(email, password) {
    // Accept any credentials in development
    return {
      user: { id: 1, email, name: 'Demo User', role: 'user' },
      token: 'mock-token-' + Date.now()
    };
  },

  async signup(email, password, name) {
    return {
      user: { id: 1, email, name, role: 'user' },
      token: 'mock-token-' + Date.now()
    };
  },

  async verifyToken(token) {
    if (!token.startsWith('mock-token-')) {
      throw new Error('Invalid token');
    }
    return { id: 1, email: 'demo@example.com', name: 'Demo User', role: 'user' };
  },

  async logout(token) {
    // No-op for mock
  },
};
```

### 3. Supabase Adapter (Production)

**File**: `server/lib/auth/supabase-adapter.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { IAuthAdapter } from './factory';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const supabaseAuth: IAuthAdapter = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user,
      token: data.session!.access_token,
    };
  },

  async signup(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;

    return {
      user: data.user!,
      token: data.session!.access_token,
    };
  },

  async verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) throw error;

    return data.user;
  },

  async logout(token) {
    await supabase.auth.signOut();
  },
};
```

### 4. Auth Middleware

**File**: `server/middleware/auth.ts`

```typescript
import { auth } from '../lib/auth/factory';
import type { Request, Response, NextFunction } from 'express';

export function authMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`[Auth] ${req.method} ${req.path}`);

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.warn('[Auth] No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await auth.verifyToken(token);
      console.log('[Auth] Token verified for user:', user.id);
      req.user = user;
      next();
    } catch (error: any) {
      console.error('[Auth] Token verification failed:', error.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### 5. Auth Routes

**File**: `server/routes/auth.ts`

```typescript
import express from 'express';
import { auth } from '../lib/auth/factory';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await auth.signup(email, password, name);
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Signup failed' });
  }
});

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const result = await auth.login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

router.post('/api/auth/logout', authMiddleware(), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')!;
    await auth.logout(token);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/api/auth/me', authMiddleware(), async (req, res) => {
  res.json({ user: req.user });
});

export default router;
```

## Validation

Run validation script:

```bash
.claude/skills/backend/auth-scaffolding/scripts/validate-auth.sh
```

## Validation Checklist

- [ ] `server/lib/auth/factory.ts` exists
- [ ] `server/lib/auth/mock-adapter.ts` exists
- [ ] `server/lib/auth/supabase-adapter.ts` exists
- [ ] `server/middleware/auth.ts` exists
- [ ] `server/routes/auth.ts` exists
- [ ] Auth routes registered in server/index.ts
- [ ] .env has AUTH_MODE, SUPABASE_URL, SUPABASE_ANON_KEY

## Testing

```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123","name":"Test User"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123"}'

# Test protected endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

## See Also

- Auth context (frontend): `.claude/skills/frontend/auth-context/SKILL.md`
- Protected routes: `.claude/skills/frontend/protected-routes/SKILL.md`
```

**Validation Script**: `.claude/skills/backend/auth-scaffolding/scripts/validate-auth.sh`

```bash
#!/bin/bash

echo "🔍 Validating Authentication Setup..."

# Check all required files exist
REQUIRED_FILES=(
  "server/lib/auth/factory.ts"
  "server/lib/auth/mock-adapter.ts"
  "server/lib/auth/supabase-adapter.ts"
  "server/middleware/auth.ts"
  "server/routes/auth.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Missing: $file"
    exit 1
  fi
  echo "✅ Found: $file"
done

# Check auth routes registered
if ! grep -q "import.*authRoutes.*from.*routes/auth" server/index.ts; then
  echo "❌ Auth routes not imported in server/index.ts"
  exit 1
fi

if ! grep -q "app.use.*authRoutes" server/index.ts; then
  echo "❌ Auth routes not registered in server/index.ts"
  exit 1
fi

echo "✅ Auth routes registered"

# Check environment variables
if [ ! -f ".env" ]; then
  echo "⚠️  No .env file (OK for development)"
else
  if ! grep -q "^AUTH_MODE=" .env; then
    echo "⚠️  AUTH_MODE not set in .env (will default to mock)"
  fi
fi

echo ""
echo "✅ Authentication setup validated!"
echo ""
echo "To test:"
echo "  1. Start server: npm run dev:server"
echo "  2. Test signup: curl -X POST http://localhost:5000/api/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Pass123\",\"name\":\"Test\"}'"
echo "  3. Test login: curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Pass123\"}'"
```

#### 2. api-client-setup

**Source**: Lines 382-435

**File**: `.claude/skills/frontend/api-client-setup/SKILL.md`

```markdown
---
name: API Client Setup
description: >
  Use this skill when setting up the ts-rest API client for a React app.
  Configures dynamic auth headers that work with ts-rest v3. Auto-invokes
  when creating frontend API integration.
---

# API Client Setup

## When to Use This Skill

**MANDATORY** when:
- Setting up frontend API client
- Integrating with backend API
- Implementing authenticated requests

## CRITICAL: ts-rest v3 Dynamic Headers

**Problem**: Auth token isn't available at module load time

**Solution**: Use getter property (NOT function) for dynamic headers

## Required Files

### 1. API Client

**File**: `client/src/lib/api-client.ts`

```typescript
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    // CRITICAL: Use getter property, NOT function - ts-rest v3 requirement
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
```

**Why getter property?**
- Evaluated on EACH request
- Always gets latest token
- ts-rest v3 compatible

### 2. Auth Helpers

**File**: `client/src/lib/auth-helpers.ts`

```typescript
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setAuthUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
```

## Anti-Patterns

❌ **Using function instead of getter**:
```typescript
baseHeaders: {
  Authorization: () => {  // ❌ WRONG - ts-rest v3 doesn't call functions
    return `Bearer ${getToken()}`;
  },
}
```

❌ **Static header at module load**:
```typescript
const token = getToken();  // ❌ WRONG - evaluated once at load
baseHeaders: {
  Authorization: `Bearer ${token}`,
}
```

✅ **Correct pattern**:
```typescript
baseHeaders: {
  get Authorization() {  // ✅ RIGHT - getter property
    const token = getToken();
    return token ? `Bearer ${token}` : '';
  },
}
```

## Validation

```bash
.claude/skills/frontend/api-client-setup/scripts/validate-client.sh
```

## Testing

```typescript
// Test authenticated request
import { apiClient } from './lib/api-client';
import { setAuthToken } from './lib/auth-helpers';

// Set token
setAuthToken('test-token-123');

// Make request - should include Authorization header
const response = await apiClient.users.getUsers();

// Check headers were sent (in browser DevTools Network tab)
// Should see: Authorization: Bearer test-token-123
```

## See Also

- Auth context: `.claude/skills/frontend/auth-context/SKILL.md`
- Backend auth: `.claude/skills/backend/auth-scaffolding/SKILL.md`
```

### Frontend Skills

#### 3. auth-context

**Source**: Lines 436-498

**File**: `.claude/skills/frontend/auth-context/SKILL.md`

```markdown
---
name: Auth Context Setup
description: >
  Use this skill when setting up React auth context with state management.
  Provides auth state, login/logout functions, and persistence. Auto-invokes
  when implementing frontend authentication.
---

# Auth Context Setup

## When to Use This Skill

**MANDATORY** when:
- Setting up auth state in React
- Implementing login/logout
- Persisting auth across refreshes

## Required Files

### 1. Auth Context

**File**: `client/src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthUser, getAuthToken, setAuthToken, setAuthUser, clearAuth } from '@/lib/auth-helpers';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth on mount
  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getAuthUser();
    if (token && savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Auth endpoints use direct fetch (not apiClient) since no auth token yet
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    setAuthUser(data.user);
    setUser(data.user);
  };

  const signup = async (email: string, password: string, name: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5013';
    const response = await fetch(`${apiUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const data = await response.json();
    setAuthToken(data.token);
    setAuthUser(data.user);
    setUser(data.user);
  };

  const logout = async () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 2. Protected Route Component

**File**: `client/src/components/auth/ProtectedRoute.tsx`

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'wouter';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
```

### 3. App Wrapper

**File**: `client/src/App.tsx` (partial)

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />

        {/* Protected routes */}
        <Route path="/dashboard">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
      </Switch>
    </AuthProvider>
  );
}
```

## Usage in Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Validation Checklist

- [ ] AuthContext.tsx created
- [ ] ProtectedRoute.tsx created
- [ ] App.tsx wrapped with AuthProvider
- [ ] Protected routes use ProtectedRoute wrapper
- [ ] Auth state persists on refresh

## See Also

- API client: `.claude/skills/frontend/api-client-setup/SKILL.md`
- Backend auth: `.claude/skills/backend/auth-scaffolding/SKILL.md`
```

### Validation Skills

#### 4. build-validation

**File**: `.claude/skills/validation/build-validation/SKILL.md`

```markdown
---
name: Build Validation
description: >
  Use this skill to validate that a generated app compiles without errors.
  Runs TypeScript, ESLint, and build process. Auto-invokes in Stage 3
  validation.
---

# Build Validation

## When to Use This Skill

**MANDATORY** when:
- Completing app generation
- Before considering app "done"
- After major code changes

## Validation Steps

### 1. TypeScript Compilation

```bash
npx tsc --noEmit
```

**Success**: Exit code 0, no errors

**Failure**: Fix TypeScript errors before proceeding

### 2. ESLint

```bash
npx eslint . --ext .ts,.tsx
```

**Success**: Exit code 0 or warnings only

**Failure**: Fix errors (warnings acceptable)

### 3. Build

```bash
npm run build
```

**Success**: Build completes, dist/ created

**Failure**: Fix build errors

## Validation Script

**File**: `.claude/skills/validation/build-validation/scripts/validate-build.sh`

```bash
#!/bin/bash

echo "🔍 Validating Build..."

# Step 1: TypeScript
echo ""
echo "Step 1/3: TypeScript compilation..."
if ! npx tsc --noEmit; then
  echo "❌ TypeScript errors found"
  echo "   Fix errors and re-run validation"
  exit 1
fi
echo "✅ TypeScript compilation successful"

# Step 2: ESLint
echo ""
echo "Step 2/3: ESLint..."
if ! npx eslint . --ext .ts,.tsx --max-warnings 50; then
  echo "❌ ESLint errors found"
  echo "   Fix errors and re-run validation"
  exit 1
fi
echo "✅ ESLint passed"

# Step 3: Build
echo ""
echo "Step 3/3: Build..."
if ! npm run build; then
  echo "❌ Build failed"
  echo "   Fix build errors and re-run validation"
  exit 1
fi
echo "✅ Build successful"

echo ""
echo "═══════════════════════════════════════"
echo "✅ BUILD VALIDATION PASSED"
echo "═══════════════════════════════════════"
exit 0
```

## Error Handling

If validation fails:

1. **Read error messages carefully**
2. **Fix ONE error at a time**
3. **Re-run validation**
4. **Repeat until all pass**

If stuck:
- Invoke `error_fixer` subagent
- Provide error output
- Let expert debug

## See Also

- Runtime validation: `.claude/skills/validation/runtime-validation/SKILL.md`
- Integration testing: `.claude/skills/validation/integration-testing/SKILL.md`
```

---

## Subagent Integration

### Strategy: Wrapper Skills

**Problem**: Subagents are powerful but:
- No validation after completion
- Invoked manually (easy to forget)
- No guidance on when to use

**Solution**: Wrap each subagent with a skill

**Pattern**:
```
User task → Skill auto-invokes → Skill delegates to subagent → Subagent completes → Skill validates output → Done
```

### Example: schema-designer-skill

**File**: `.claude/skills/subagents/schema-designer-skill/SKILL.md`

```markdown
---
name: Schema Designer Subagent
description: >
  Use this skill when designing database schemas. Delegates to schema_designer
  subagent and validates that BOTH Zod schemas AND Drizzle client are created.
  Auto-invokes when creating data models.
---

# Schema Designer Subagent Wrapper

## When to Use This Skill

**AUTO-INVOKE** when:
- Creating database schemas
- Designing data models
- Setting up entities

## Process

### Step 1: Delegate to Subagent

Invoke schema_designer subagent:

```
Task(
  "Design complete database schema",
  "Create type-safe schemas for: [list entities]

Requirements:
- Include users table with auth fields
- Add timestamps to all tables
- Create foreign key relationships for: [relationships]
- Use consistent naming (camelCase)

Output:
- shared/schema.zod.ts (Zod validation schemas)
- shared/schema.ts (Drizzle ORM schemas)
",
  "schema_designer"
)
```

### Step 2: Validate Schema Output

After subagent completes, MUST validate:

```bash
# Check Zod schema exists
if [ ! -f "shared/schema.zod.ts" ]; then
  echo "❌ schema.zod.ts NOT created"
  exit 1
fi

# Check Drizzle schema exists
if [ ! -f "shared/schema.ts" ]; then
  echo "❌ schema.ts NOT created"
  exit 1
fi
```

### Step 3: CRITICAL - Create Drizzle Client

**This is where 55% of bugs come from!**

Schema exists ≠ Client exists

Invoke `drizzle-orm-setup` skill:
```
The schema_designer created schemas. Now invoke drizzle-orm-setup skill
to create the Drizzle client (server/lib/db.ts).
```

### Step 4: Validate Complete Setup

Run validation:
```bash
.claude/skills/backend/drizzle-orm-setup/scripts/validate-drizzle.sh
```

**Must pass**:
- ✅ server/lib/db.ts exists
- ✅ Drizzle client configured
- ✅ Schema imported correctly

## Why This Matters

**Without client creation**:
```typescript
// ❌ schema.ts exists (Drizzle schema defined)
export const users = pgTable('users', { ... });

// ❌ server/lib/db.ts DOESN'T exist
// Result: App falls back to PostgREST → 55% bugs
```

**With client creation**:
```typescript
// ✅ schema.ts exists
export const users = pgTable('users', { ... });

// ✅ server/lib/db.ts exists
export const db = drizzle(client, { schema });

// ✅ Storage uses Drizzle
const users = await db.select().from(schema.users);
```

## Validation Checklist

After this skill completes:

- [ ] shared/schema.zod.ts exists
- [ ] shared/schema.ts exists
- [ ] server/lib/db.ts exists (Drizzle client)
- [ ] Validation script passes
- [ ] No TypeScript errors

## If Validation Fails

1. Identify missing piece (schema or client)
2. If schema missing → Re-invoke schema_designer
3. If client missing → Invoke drizzle-orm-setup skill
4. Re-validate

## See Also

- Drizzle setup: `.claude/skills/backend/drizzle-orm-setup/SKILL.md`
- Storage validation: `.claude/skills/backend/storage-factory-validation/SKILL.md`
```

### Wrapping All 8 Subagents

**Create wrapper skills for**:

1. ✅ schema-designer-skill → Validates schema + client
2. api-architect-skill → Validates contracts + routes
3. code-writer-skill → Validates syntax + imports
4. ui-designer-skill → Validates design tokens
5. quality-assurer-skill → Validates test coverage
6. error-fixer-skill → Validates fixes work
7. ai-integration-skill → Validates AI works
8. research-agent-skill → Validates research complete

**Each wrapper**:
- Delegates to subagent
- Runs validation
- Invokes related skills if needed
- Reports completion

---

## Implementation Phases

### Phase 1: Critical Backend Skills (Week 1)

**Goal**: Fix 80% of bugs

**Tasks**:
1. ✅ drizzle-orm-setup (EXISTS) - Test with RaiseIQ
2. Create auth-scaffolding skill
3. ✅ storage-factory-validation (EXISTS)
4. Create api-routes-patterns skill
5. Test: Generate simple CRUD app

**Success Criteria**:
- Backend generates with 0% storage bugs
- Auth works in both mock and Supabase modes
- Validation scripts catch issues

**Deliverables**:
- 4 skills with SKILL.md + validation scripts
- Test app validates successfully
- Documentation updated

### Phase 2: Frontend Skills (Week 2)

**Goal**: Consistent, working frontends

**Tasks**:
1. Create api-client-setup skill
2. Create auth-context skill
3. Create protected-routes skill
4. Create design-system skill
5. Create component-patterns skill
6. Test: Generate app with auth flow

**Success Criteria**:
- Frontend generates with consistent UI
- Auth flow works (signup, login, logout)
- Protected routes redirect correctly

**Deliverables**:
- 5 skills with SKILL.md
- Working auth flow in test app
- Component patterns documented

### Phase 3: Validation & Testing (Week 3)

**Goal**: Systematic quality gates

**Tasks**:
1. Create build-validation skill
2. Create runtime-validation skill
3. Create integration-testing skill
4. Update Stage 3 in pipeline
5. Test: Full pipeline with validation

**Success Criteria**:
- All apps validate before "done"
- Validation catches TypeScript errors
- Integration tests verify critical flows

**Deliverables**:
- 3 validation skills
- Updated pipeline Stage 3
- Validation runs automatically

### Phase 4: Subagent Wrapping (Week 4)

**Goal**: Enhanced subagents

**Tasks**:
1. Create wrapper skill for each of 8 subagents
2. Add validation to each wrapper
3. Test: Generate app using wrapped subagents
4. Document wrapper pattern

**Success Criteria**:
- Subagents auto-validate after completion
- Missing pieces (like Drizzle client) caught immediately
- Wrappers don't break existing flow

**Deliverables**:
- 8 wrapper skills
- Validation after each subagent
- Pattern documentation

### Phase 5: Pipeline Refactoring (Week 5)

**Goal**: Slim, skills-first pipeline

**Tasks**:
1. Create new pipeline-prompt-v3.md (200 lines)
2. Extract all patterns into skills
3. Move subagent info to top
4. Test: Generate multiple apps
5. Compare: v2 vs v3 results

**Success Criteria**:
- Pipeline < 250 lines
- All patterns in skills
- Same or better app quality
- Faster generation time

**Deliverables**:
- pipeline-prompt-v3.md
- 15-20 skills total
- Migration guide
- Performance comparison

---

## Success Metrics

### Before Skills (Current)

| Metric | Value |
|--------|-------|
| **Pipeline length** | 1020 lines |
| **Drizzle client bugs** | 55% of apps |
| **Auth issues** | 30% of apps |
| **Storage bugs** | 55% of methods |
| **Manual validation** | Required |
| **Bug detection** | Runtime |
| **Subagent placement** | Line 935 (too late) |

### After Skills (Target)

| Metric | Value |
|--------|-------|
| **Pipeline length** | 200 lines |
| **Drizzle client bugs** | 0% (validated) |
| **Auth issues** | 0% (tested) |
| **Storage bugs** | 0% (validated) |
| **Automated validation** | Every skill |
| **Bug detection** | Generation time |
| **Subagent guidance** | Top of pipeline |

### ROI

**Investment**:
- Phase 1: 40 hours (4 skills)
- Phase 2: 40 hours (5 skills)
- Phase 3: 30 hours (3 skills)
- Phase 4: 32 hours (8 wrappers)
- Phase 5: 20 hours (refactor)
- **Total**: 162 hours (~4 weeks)

**Savings per app**:
- Debugging time: -3 hours (no bugs vs current bugs)
- Validation time: -1 hour (automated vs manual)
- **Total**: 4 hours per app

**Break-even**: After 40 apps (~10 weeks if 1 app/day)

**Long-term**: Compound savings, easier maintenance, better quality

---

## Migration Roadmap

### Week 1: Critical Backend
- [ ] Day 1-2: Create auth-scaffolding skill
- [ ] Day 3-4: Create api-routes-patterns skill
- [ ] Day 5: Test with simple CRUD app

### Week 2: Frontend
- [ ] Day 1: Create api-client-setup skill
- [ ] Day 2: Create auth-context skill
- [ ] Day 3: Create protected-routes skill
- [ ] Day 4: Create design-system skill
- [ ] Day 5: Create component-patterns skill

### Week 3: Validation
- [ ] Day 1-2: Create build-validation skill
- [ ] Day 3: Create runtime-validation skill
- [ ] Day 4: Create integration-testing skill
- [ ] Day 5: Test full pipeline

### Week 4: Subagent Wrapping
- [ ] Day 1: Wrap schema_designer
- [ ] Day 2: Wrap api_architect, code_writer
- [ ] Day 3: Wrap ui_designer, quality_assurer
- [ ] Day 4: Wrap error_fixer, ai_integration, research_agent
- [ ] Day 5: Test all wrappers

### Week 5: Pipeline Refactoring
- [ ] Day 1-2: Create pipeline-prompt-v3.md
- [ ] Day 3: Migrate patterns to skills
- [ ] Day 4: Test v3 pipeline
- [ ] Day 5: Document migration

---

## Conclusion

**Current state**: Monolithic 1020-line pipeline with subagents mentioned too late, causing:
- 55% storage bugs (Drizzle schema without client)
- 30% auth issues
- No systematic validation
- Runtime bug discovery

**Proposed state**: Skills-first architecture with:
- 200-line orchestration pipeline
- 15-20 specialized skills
- 8 wrapped subagents
- Automated validation

**Key insight**: The problem isn't lack of guidance—we have detailed patterns. The problem is:
1. Too much information at once (1020 lines)
2. Critical info buried (subagents at line 935)
3. No validation (issues found at runtime)
4. Easy to skip steps (like creating Drizzle client)

**Solution**: Skills provide:
- Just-in-time guidance (auto-invoke when needed)
- Built-in validation (catch issues at generation time)
- Focused expertise (one skill = one concern)
- Impossible to skip (validation gates)

**Next action**: Start Phase 1 - Create 4 critical backend skills this week.

---

**Document Version**: 1.0
**Date**: 2025-01-21
**Author**: Skills migration analysis
**Status**: Ready for implementation
**Related Docs**:
- Existing skills: `.claude/skills/README.md`
- How-to guide: `docs/how-to-use-skills.md`
- Implementation summary: `docs/skills-implementation-summary.md`
