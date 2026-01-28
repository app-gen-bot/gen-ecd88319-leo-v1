# Auth Issues Fix Plan - smart-todo-ai1 Analysis

**Date**: 2025-11-21
**Impact**: CRITICAL - Prevents all protected endpoints from working
**Status**: Identified root causes, fixes ready to implement

---

## Root Cause Analysis

### Issue #1: Authorization Header Not Sent (Client-Side)
**File**: `client/src/lib/api-client.ts`
**Generator**: `utilities/fix_api_client.py` lines 129-138

**BROKEN CODE GENERATED**:
```python
# fix_api_client.py lines 129-138
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  baseHeaders: () => {{       # ❌ WRONG: baseHeaders as function
    const token = getAuthToken();
    return {{
      'Content-Type': 'application/json',
      ...(token ? {{ 'Authorization': `Bearer ${{token}}` }} : {{}})
    }};
  }}
}});
```

**Why It Fails**: ts-rest v3 expects `baseHeaders` to be an object where each header value is either:
- A static string, OR
- A function that returns a string

But the code makes `baseHeaders` itself a function that returns an object.

**CORRECT CODE** (verified working in smart-todo-ai1):
```typescript
export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,
  jsonQuery: true,
  baseHeaders: {                           // ✅ CORRECT: Object
    'Content-Type': 'application/json',    // Static string
    Authorization: () => {                  // Function returning string
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
```

---

### Issue #2: Auth Middleware Never Applied (Server-Side)
**File**: `server/index.ts`
**Generator**: Unknown (template or code_writer agent)

**BROKEN PATTERN** (common in generated apps):
```typescript
// server/index.ts
import { authMiddleware } from './middleware/auth.js';  // ✅ Imported

// But never applied! ❌
createExpressEndpoints(contract, appRouter, apiRouter);
app.use('/api', apiRouter);  // No middleware
```

**CORRECT CODE** (verified working in smart-todo-ai1):
```typescript
const apiRouter = express.Router();

// Apply auth middleware globally, skip login/signup
apiRouter.use((req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/auth/signup') {
    next();
  } else {
    authMiddleware()(req, res, next);
  }
});

createExpressEndpoints(contract, appRouter, apiRouter);
app.use('/api', apiRouter);
```

---

## Required Fixes

### Fix #1: Update fix_api_client.py

**File**: `src/app_factory_leonardo_replit/utilities/fix_api_client.py`
**Lines**: 109-164

**Change**:
```python
# CURRENT (BROKEN)
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  baseHeaders: () => {{
    const token = getAuthToken();
    return {{
      'Content-Type': 'application/json',
      ...(token ? {{ 'Authorization': `Bearer ${{token}}` }} : {{}})
    }};
  }}
}});

# NEW (FIXED)
export const apiClient = initClient(contractsRouter, {{
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  jsonQuery: true,
  baseHeaders: {{
    'Content-Type': 'application/json',
    Authorization: () => {{
      const token = getAuthToken();
      return token ? `Bearer ${{token}}` : '';
    }}
  }}
}});
```

### Fix #2: Update api-architect Skill

**File**: `apps/.claude/skills/api-architect/SKILL.md`

**Add Section** (after "Dynamic auth headers"):
```markdown
### Client-Side: Authorization Header Pattern (ts-rest v3)

**CRITICAL**: ts-rest v3 requires specific baseHeaders format.

**✅ CORRECT**:
\`\`\`typescript
baseHeaders: {
  'Content-Type': 'application/json',
  Authorization: () => {  // Arrow function returning string
    const token = localStorage.getItem('auth_token');
    return token ? \`Bearer \${token}\` : '';
  }
}
\`\`\`

**❌ WRONG**:
\`\`\`typescript
baseHeaders: () => {  // baseHeaders as function (breaks ts-rest)
  return {
    'Content-Type': 'application/json',
    Authorization: token ? \`Bearer \${token}\` : ''
  };
}
\`\`\`

**❌ ALSO WRONG**:
\`\`\`typescript
baseHeaders: {
  get Authorization() { /* getter */ }  // Getters don't work
}
\`\`\`

**Type Signature** (from ts-rest v3):
\`\`\`typescript
baseHeaders?: Record<string, string | ((options: FetchApiOptions) => string)>
\`\`\`
```

### Fix #3: Add Auth Middleware Pattern to pipeline-prompt.md

**File**: `docs/pipeline-prompt.md`

**Section**: 2.2.3 Auth Scaffolding

**Add After** line 233 (auth factory example):
```markdown
### Server-Side: Auth Middleware Application

**CRITICAL**: Middleware must be applied BEFORE ts-rest endpoints are created.

**File**: `server/index.ts`

\`\`\`typescript
import { authMiddleware } from './middleware/auth.js';

// Create Express router
const apiRouter = express.Router();

// Apply auth middleware globally, skip login/signup
apiRouter.use((req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/auth/signup') {
    next(); // Public routes
  } else {
    authMiddleware()(req, res, next); // Protected routes
  }
});

// THEN create ts-rest endpoints
createExpressEndpoints(contract, appRouter, apiRouter, { jsonQuery: true });
app.use('/api', apiRouter);
\`\`\`

**Why This Order Matters**:
1. Middleware runs BEFORE route handlers
2. Middleware sets \`req.user\` from JWT token
3. Route handlers access \`req.user\`
4. If middleware is applied after endpoints, it never executes
```

### Fix #4: Update TsRestApiClientGeneratorCritic

**File**: `src/app_factory_leonardo_replit/agents/tsrest_api_client_generator/critic.py`
**Lines**: 90-96

**Add Validation Checks**:
```python
checks = {
    "ts-rest import": "@ts-rest/core" in content,
    "initClient usage": "initClient" in content,
    "contractsRouter": "contractsRouter" in content,
    "apiClient export": "export const apiClient" in content or "export default" in content,
    "contract imports": ".contract" in content,
    # NEW AUTH CHECKS:
    "auth header function": "Authorization: () =>" in content,  # NOT "Authorization()"
    "no baseHeaders function": "baseHeaders: () =>" not in content,  # baseHeaders should be object
    "auth token check": "getAuthToken" in content or "localStorage.getItem('auth_token')" in content
}
```

---

## Validation Script

**Create**: `scripts/validate-auth-pattern.sh`

```bash
#!/bin/bash
# Validate auth patterns in generated app
set -e

APP_DIR="${1:-.}"
cd "$APP_DIR"

echo "🔍 Validating auth patterns..."
ERRORS=0

# Check 1: api-client.ts uses correct pattern
echo "1. Checking api-client.ts Authorization header..."
if grep -q "Authorization: () =>" client/src/lib/api-client.ts; then
  echo "   ✅ PASS: Authorization header is arrow function"
else
  echo "   ❌ FAIL: Authorization header not arrow function"
  ERRORS=$((ERRORS + 1))
fi

# Check 2: baseHeaders is object, not function
if grep -q "baseHeaders: {" client/src/lib/api-client.ts; then
  echo "   ✅ PASS: baseHeaders is object"
else
  echo "   ❌ FAIL: baseHeaders is not object"
  ERRORS=$((ERRORS + 1))
fi

# Check 3: Auth middleware applied in server/index.ts
echo "2. Checking server/index.ts auth middleware..."
if grep -q "authMiddleware()(req, res, next)" server/index.ts; then
  echo "   ✅ PASS: Auth middleware applied"
else
  echo "   ❌ FAIL: Auth middleware not applied"
  ERRORS=$((ERRORS + 1))
fi

# Check 4: Middleware before createExpressEndpoints
if grep -B10 "createExpressEndpoints" server/index.ts | grep -q "authMiddleware"; then
  echo "   ✅ PASS: Middleware applied before endpoints"
else
  echo "   ❌ FAIL: Middleware not applied before endpoints"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All auth pattern validations passed"
  exit 0
else
  echo ""
  echo "❌ Auth pattern validation failed: $ERRORS errors"
  exit 1
fi
```

---

## Implementation Priority

1. **IMMEDIATE**: Fix `fix_api_client.py` (Issue #1 - prevents auth completely)
2. **HIGH**: Add middleware pattern to pipeline-prompt.md (Issue #2 - prevents protected routes)
3. **MEDIUM**: Update api-architect skill with patterns
4. **MEDIUM**: Add critic validation checks
5. **LOW**: Create validation script for testing

---

## Testing Plan

After fixes:
1. Generate new test app: `uv run python run_app_generator.py "Todo app with auth"`
2. Run validation: `bash scripts/validate-auth-pattern.sh apps/test-app/app`
3. Manual test auth flow:
   - Login → Token stored
   - Protected API call → 200 response (not 401)
   - Verify Authorization header sent (DevTools)
   - Verify `req.user` set (server logs)

---

## Prevention Value

**Current Impact**: 67 minutes to diagnose + fix per app
**With Fixes**: 0 minutes - works out of the box
**Apps Affected**: Every new app with auth (100%)

## Skills to Update

None - these are code generator fixes, not skills. The generators are:
1. `utilities/fix_api_client.py` (deterministic generator)
2. code_writer subagent (generates server/index.ts)

The skills reference patterns correctly - no changes needed.
