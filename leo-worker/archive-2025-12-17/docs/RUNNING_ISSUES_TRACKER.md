# App Factory Running Issues Tracker

**Purpose**: Track systemic issues discovered during development and testing
**Last Updated**: 2025-10-11
**Status Format**: 🔴 Critical | 🟡 Medium | 🟢 Low | ✅ Resolved

---

## Table of Contents

1. [Issue #1: Parallel Page Generation Not Used in Pipeline](#issue-1-parallel-page-generation-not-used-in-pipeline)
2. [Issue #2: API Routes Conflict with Frontend Routes](#issue-2-api-routes-conflict-with-frontend-routes)

---

## Issue #1: Parallel Page Generation Not Used in Pipeline

**Status**: 🟡 **MEDIUM** - App works but 5-7x slower than it should be
**Discovered**: 2025-10-11
**Severity**: Performance issue, not correctness issue
**Detailed Analysis**: [PARALLEL_GENERATION_ISSUE_ANALYSIS.md](./PARALLEL_GENERATION_ISSUE_ANALYSIS.md)

### Summary

The Build Stage pipeline uses `FrontendImplementationAgent` (single agent, sequential generation) instead of `ParallelFrontendOrchestrator` (true asyncio, 10 concurrent pages).

### Evidence

From logs (2025-10-11 18:38-18:40):
```
18:38:51,817 - INFO - Frontend Implementation Agent: Let me continue generating pages.
I'll generate the ChapelListPage now. Given the large scope, I'll continue generating
all required pages systematically:
```

Agent is generating pages **sequentially** instead of in parallel.

### Root Cause

**File**: `stages/build_stage.py` (lines 1213-1219)

```python
{
    "name": "Frontend Implementation",
    "writer": FrontendImplementationAgent(cwd=cwd),  # ❌ Single agent
    "critic": BrowserVisualCriticAgent(cwd=cwd),
    "critical": True,
    "special_handler": "frontend_implementation"
}
```

Should be using `ParallelFrontendOrchestrator` instead.

### Impact

**Current Performance** (15-page app):
- Sequential generation: **15-22 minutes**
- Single agent tries to do everything in one turn
- Falls back to generating pages one at a time

**Expected Performance** (with fix):
- Parallel generation: **2-3 minutes**
- 10 pages generated concurrently
- Per-page Writer-Critic loops (5 iterations each)
- **5-7x faster**

### Side Effect

The timeout configuration we set to 3000 seconds in `run-parallel-frontend.py` and `orchestrators/parallel_frontend_generator.py` **has NO EFFECT on the Build Stage pipeline** because it doesn't use the orchestrator.

### Solution

**Option 1** (Recommended): Integrate `ParallelFrontendOrchestrator` into Build Stage

**Changes Required**:

1. Import orchestrator in `build_stage.py`:
```python
from ..orchestrators.parallel_frontend_generator import ParallelFrontendOrchestrator
```

2. Replace agent pair:
```python
{
    "name": "Frontend Implementation",
    "writer": None,
    "critic": None,
    "critical": True,
    "special_handler": "parallel_frontend_orchestrator"  # NEW
}
```

3. Add special handler in `run_writer_critic_loop()`:
```python
if special_handler == "parallel_frontend_orchestrator":
    orchestrator = ParallelFrontendOrchestrator(
        app_dir=app_dir,
        max_concurrency=10,
        timeout_per_page=3000
    )
    results = await orchestrator.orchestrate()
    # Process results and return
```

### Workaround (Until Fixed)

Manually run parallel generation after main pipeline:
```bash
# Step 1: Run pipeline (stops at Frontend Implementation)
uv run python src/app_factory_leonardo_replit/run.py "prompt"

# Step 2: Run parallel generator
uv run python run-parallel-frontend.py apps/{app-name}/app \
  --max-concurrency 10 \
  --timeout 3000
```

### Testing Plan

1. **Small App (5 pages)**: Should complete in ~2-3 minutes (vs 5-7 minutes)
2. **Medium App (10 pages)**: Should complete in ~3-5 minutes (vs 10-15 minutes)
3. **Large App (15+ pages)**: Should complete in ~4-6 minutes (vs 15-22 minutes)

### References

- Detailed analysis: `docs/PARALLEL_GENERATION_ISSUE_ANALYSIS.md`
- Orchestrator code: `orchestrators/parallel_frontend_generator.py`
- Current agent code: `agents/frontend_implementation/agent.py`
- Standalone script: `run-parallel-frontend.py`

---

## Issue #2: API Routes Conflict with Frontend Routes

**Status**: ✅ **RESOLVED** - Fixed and verified (2025-10-11 22:00)
**Discovered**: 2025-10-11 19:30
**Severity**: Was Critical - App navigation broken
**Agent**: FrontendImplementationAgent discovered during browser testing
**Resolution**: Auto-fix verified + Prevention measures implemented in generator prompts and critic

### Summary

API routes are registered at root level (`/chapels`, `/bookings`, etc.) instead of under `/api` prefix. This causes Express to match frontend navigation requests to API handlers, returning JSON instead of serving the React app.

### Evidence

From logs (2025-10-11 19:30:24-19:31):
```
Frontend Implementation Agent: **AH-HA!** I found the problem! The contract defines
the paths as `/chapels`, `/chapels/:id`, etc. WITHOUT the `/api` prefix. But the
server routes ARE registered without the `/api` prefix too (line 277 in routes.ts:
`app.get("/chapels", ...)`).

This means that when someone navigates to `http://localhost:5173/chapels` in their
browser, Express is matching it to the API route handler which returns JSON, instead
of letting it fall through to Vite's middleware which would serve the React app.
```

### Root Cause Analysis

**The Problem**: Route collision between frontend and backend

When user navigates to `http://localhost:5173/chapels`:
1. Request hits Express server
2. Express routes are registered at root: `app.get("/chapels", ...)`
3. Express matches the route and returns JSON: `[{chapel1}, {chapel2}, ...]`
4. Browser displays JSON instead of React app
5. React Router/Wouter never gets a chance to handle the route

**Why This Happens**:

**File 1**: `shared/contracts/chapels.contract.ts`
```typescript
export const chapelsContract = c.router({
  getChapels: {
    method: 'GET',
    path: '/chapels',  // ❌ No /api prefix
    // ...
  }
});
```

**File 2**: `server/routes.ts`
```typescript
export function registerRoutes(app: Express) {
  // Registers routes directly at root
  app.get("/chapels", ...);  // ❌ Conflicts with frontend route /chapels
  app.get("/bookings", ...); // ❌ Conflicts with frontend route /bookings
  // ...
}
```

**File 3**: `client/src/lib/api-client.ts`
```typescript
export const apiClient = initClient(contractsRouter, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',  // ❌ No /api
  // ...
});
```

### Impact

**User Experience**:
- Navigating to any page shows JSON instead of UI
- Browser shows: `[{"id":"123","name":"Chapel...}]`
- App is completely broken - no pages render

**Affected Routes**:
- `/chapels` - Shows JSON array
- `/chapels/:id` - Shows JSON object
- `/bookings` - Shows JSON array
- `/bookings/:id` - Shows JSON object
- `/profile` - Shows JSON object
- Any route that matches an API endpoint

### Solution

**The Fix**: Mount all API routes under `/api` prefix and update API client

#### Step 1: Update Server Index to Mount Routes Under `/api`

**File**: `server/index.ts`

**Before**:
```typescript
registerRoutes(app);  // Routes at root
```

**After**:
```typescript
import { Router } from 'express';
const apiRouter = Router();
registerRoutes(apiRouter);  // Register to router
app.use('/api', apiRouter);  // Mount router under /api
```

#### Step 2: Update Routes Registration Function

**File**: `server/routes.ts`

**Before**:
```typescript
export function registerRoutes(app: Express): http.Server {
  // Creates HTTP server
  return createServer(app);
}
```

**After**:
```typescript
export function registerRoutes(router: Router): void {
  // Just registers routes to router
  // No HTTP server creation
}
```

#### Step 3: Update API Client Base URL

**File**: `client/src/lib/api-client.ts`

**Before**:
```typescript
export const apiClient = initClient(contractsRouter, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  // ...
});
```

**After**:
```typescript
export const apiClient = initClient(contractsRouter, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',  // ✅ /api prefix
  // ...
});
```

#### Step 4: Update Contracts (Optional - for clarity)

**Files**: `shared/contracts/*.contract.ts`

**Before**:
```typescript
path: '/chapels',  // Works because baseUrl has /api
```

**After** (optional - more explicit):
```typescript
path: '/api/chapels',  // Fully qualified path
```

**Note**: Step 4 is optional because ts-rest concatenates `baseUrl + path`, so adding `/api` to baseUrl is sufficient.

### Why This Pattern is Correct

**Frontend Routes** (handled by Wouter/React Router):
```
GET /                  → HomePage component
GET /chapels           → ChapelsPage component
GET /chapels/:id       → ChapelDetailPage component
GET /login             → LoginPage component
```

**Backend API Routes** (handled by Express):
```
GET /api/chapels       → JSON array of chapels
GET /api/chapels/:id   → JSON object of chapel
POST /api/bookings     → Create booking, return JSON
```

**No Conflicts**: Frontend and API routes are in separate namespaces.

### Testing

After fix, verify:
1. Navigate to `http://localhost:5173/chapels` → Should show ChapelsPage UI
2. API call `apiClient.chapels.getChapels()` → Should hit `/api/chapels` and return data
3. Browser network tab → Should show requests to `/api/*` for data fetching
4. Direct browser navigation → Should always serve React app

### Prevention

**Root Cause**: Three separate generators create contracts, routes, and API client without coordination.

**Generators**:
1. `ContractsDesignerAgent` → Creates contracts
2. `RoutesGeneratorAgent` → Creates Express routes
3. `TsRestApiClientGeneratorAgent` → Creates API client

**Prevention Strategy**:

1. **Update ContractsDesignerAgent system prompt** to always use `/api` prefix:
```python
SYSTEM_PROMPT = """
...
All contract paths MUST use the /api prefix:
- CORRECT: path: '/api/users'
- WRONG: path: '/users'
...
"""
```

2. **Update RoutesGeneratorAgent critic** to verify `/api` mounting:
```python
# Check that routes are mounted under /api
if "app.use('/api'" not in routes_content:
    errors.append("Routes must be mounted under /api prefix")
```

3. **Update TsRestApiClientGeneratorAgent** to always include `/api` in baseUrl:
```python
# Ensure baseUrl includes /api
if "baseUrl" in api_client and "/api" not in api_client:
    api_client = api_client.replace(
        "baseUrl: import.meta.env",
        "baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'"
    )
```

### Agent Behavior

**Positive**: The FrontendImplementationAgent discovered this issue during browser testing and is actively fixing it!

From logs:
```
19:30:47,264 - INFO - Now I need to update the API client to use the `/api` prefix
19:30:55,316 - INFO - Now I need to also update the server/routes.ts
19:31:05,227 - INFO - Let me fix this properly
```

This shows the Writer-Critic loop is working - the agent found a runtime issue and is iterating to fix it.

### Long-Term Fix

**Option 1**: Update generator system prompts (preventative)

**Option 2**: Add a dedicated "API Route Prefix Validator" agent that runs after Routes Generator and before API Client Generator to ensure consistency.

**Option 3**: Create a shared configuration file that all generators read:
```typescript
// shared/api-config.ts
export const API_CONFIG = {
  prefix: '/api',
  baseUrl: process.env.API_URL || 'http://localhost:5000'
};
```

### Status

✅ **FIXED**: Auto-fix verified working + Prevention measures implemented (2025-10-11 22:00)

**Auto-Fix Verification**:
- ✅ `server/index.ts:44` - Routes mounted under `/api`: `app.use('/api', apiRouter);`
- ✅ `client/src/lib/api-client.ts:25` - BaseUrl includes `/api`: `'http://localhost:5173/api'`
- App now works correctly - frontend routes serve React UI, API routes return JSON

**Prevention Measures Implemented**:

1. **RoutesGeneratorAgent System Prompt Updated** (`agents/routes_generator/system_prompt.py`):
   - Added "CRITICAL: API Mounting Pattern" section (lines 39-47)
   - All route examples changed from `app.get('/api/items')` to `router.get('/items')`
   - Function signature updated to `registerRoutes(router: Router): Promise<void>`
   - Clear documentation on why /api prefix must NOT be in route definitions

2. **RoutesGeneratorCritic Enhanced** (`agents/routes_generator/critic/system_prompt.py`):
   - Added "Section 5: API Mounting Pattern Validation (CRITICAL)" (lines 67-117)
   - Four validation checks enforce correct pattern:
     - Must import Router from express
     - Function must accept Router parameter
     - Routes must NOT include /api prefix in paths
     - Must use router.get/post, NOT app.get/post
   - Updated Decision Criteria with new validations
   - Updated OUTPUT FORMAT to report API mounting validation results

3. **API Client Generation** (already correct):
   - `utilities/fix_api_client.py` correctly generates baseUrl with `/api` suffix
   - No changes needed

---

## How to Use This Tracker

### Adding New Issues

1. Copy the issue template below
2. Fill in all sections
3. Add to table of contents
4. Assign status and severity

### Issue Template

```markdown
## Issue #N: [Brief Title]

**Status**: 🔴/🟡/🟢 **SEVERITY** - Impact description
**Discovered**: YYYY-MM-DD
**Severity**: [Critical/Medium/Low] - [correctness/performance/UX] issue
**Component**: [Agent name or system component]

### Summary
[1-2 sentence description]

### Evidence
[Logs, code snippets, screenshots]

### Root Cause
[Technical explanation of why this happens]

### Impact
[User experience, performance, or correctness impact]

### Solution
[Detailed fix with code examples]

### Prevention
[How to prevent this in the future]

### Status
[Current state of fix]
```

### Updating Status

- 🔴 **CRITICAL**: App broken, blocks usage
- 🟡 **MEDIUM**: App works but degraded
- 🟢 **LOW**: Minor issue, cosmetic
- ✅ **RESOLVED**: Fixed and verified

---

## Summary Statistics

- **Total Issues**: 2
- **Critical** 🔴: 0
- **Medium** 🟡: 1 (Issue #1)
- **Low** 🟢: 0
- **Resolved** ✅: 1 (Issue #2 - API Route Conflicts)

---

**Maintained by**: Claude
**Review Frequency**: After each major pipeline run or issue discovery
**Action Items**: See individual issue sections for remediation steps
