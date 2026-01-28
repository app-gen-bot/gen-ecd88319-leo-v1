# AppGenerator Pipeline: Routing Analysis & Resolution Plan

**Date:** 2025-01-17
**Analysis Type:** Ultra-Deep Pipeline + Routing Inconsistency Resolution
**Status:** ⚠️ CRITICAL - Conflicting Guidance Causing Generation Loops

---

## Executive Summary

**Problem:** The AppGenerator pipeline has conflicting guidance about `/api` routing that causes infinite Writer-Critic loops. Some patterns say "use `/api` prefix," others say "NO `/api` prefix." Quality assurer agents receive mixed signals and reverse changes, causing never-ending iterations.

**Root Cause:** Pattern file `QUERY_SCHEMA_PLACEMENT.md` shows `/api` in BOTH "wrong" and "correct" examples, directly contradicting `CONTRACT_PATH_CONSISTENCY.md` which explicitly forbids `/api` prefixes.

**Impact:**
- ⚠️ App generation fails or loops indefinitely
- ⚠️ Quality assurer reverses correct code
- ⚠️ Developers waste hours debugging 404 errors
- ⚠️ ts-rest contracts mount incorrectly

**Resolution:** Update pattern files, pipeline-prompt.md, and validation checklists with ONE consistent routing standard.

---

## Part 1: AppGenerator Pipeline Architecture

### 1.1 Entry Points

The pipeline has two primary entry points:

1. **`run-app-generator.py`** (Main entry point)
   - Path: `/Users/labheshpatel/apps/app-factory/run-app-generator.py`
   - CLI interface for generating apps from prompts
   - Supports new app generation and resume/modification modes
   - Handles interactive mode with reprompter for continuous improvement

2. **`src/app_factory_leonardo_replit/run.py`** (Leonardo pipeline)
   - Path: `/Users/labheshpatel/apps/app-factory/src/app_factory_leonardo_replit/run.py`
   - Alternative pipeline optimized for speed with Preview stages
   - Used for rapid prototyping and UI-first development

### 1.2 System Prompt: `pipeline-prompt.md`

**Location:** `/Users/labheshpatel/apps/app-factory/docs/pipeline-prompt.md`

**Purpose:** This is the CORE system prompt that drives the entire AppGenerator. The AppGenerator agent loads this file as its system prompt and follows it end-to-end.

**Key Configuration:**
```python
# From agent.py:59-60
self.pipeline_prompt = self._load_pipeline_prompt()
self.agent = Agent(
    system_prompt=self.pipeline_prompt,  # pipeline-prompt.md content
    ...
)
```

**Architecture:** The pipeline-prompt.md defines:
1. **Stage 1: Plan** - Product thinking, feature specification
2. **Stage 2: Build** - Backend (schema → auth → storage → routes) then Frontend (API client → pages)
3. **Stage 3: Validate** - Quality checks, type checking, browser automation
4. **Stage 4: Integration Check** - Verify all pages fetch from backend

### 1.3 Subagents Pattern

The AppGenerator delegates specialized work to 8 subagents:

| Subagent | Expertise | When Used | Critical Patterns |
|----------|-----------|-----------|-------------------|
| **schema_designer** | Database schemas (Zod + Drizzle) | Schema generation (Stage 2.1.1) | Zod transform order, auto-injected fields, fixed UUIDs |
| **api_architect** | API contracts, auth patterns | Contract design (Stage 2.1.2) | **CONTRACT_PATH_CONSISTENCY** ← Key to routing |
| **code_writer** | TypeScript/React production code | Route/page implementation (Stage 2.2.4, 2.4) | Storage completeness, ESM imports, Wouter routing |
| **ui_designer** | Dark mode UI, component architecture | Design system creation (Stage 2.4.1) | OKLCH colors, responsive design, accessibility |
| **quality_assurer** | Testing, validation, browser automation | Pre-completion validation (Stage 3) | **VALIDATION_CHECKLIST** ← Enforces routing rules |
| **error_fixer** | Debug and fix issues | When generation fails | Module resolution, database connection, auth flow |
| **ai_integration** | AI features, chat, ML | AI-enabled features | Multi-turn conversations, streaming, fallbacks |
| **research_agent** | Complex domains, external APIs | Unfamiliar tech research | Implementation strategy, best practices |

**Delegation Pattern:**
```python
# AppGenerator delegates via Task tool
Task("Design API contracts",
     "Create contracts importing from schema.zod.ts...",
     "api_architect")  # ← Subagent receives isolated 200K context
```

### 1.4 Patterns System

**Location:** `/Users/labheshpatel/apps/app-factory/docs/patterns/`

**Purpose:** Embedded knowledge for each subagent to prevent common issues (87-96% prevention rate in Phase 1 testing).

**Structure:**
```
docs/patterns/
├── api_architect/
│   ├── CONTRACT_PATH_CONSISTENCY.md  ← ⚠️ KEY FILE (routing rules)
│   ├── DYNAMIC_AUTH_HEADERS.md
│   ├── HTTP_STATUS_CODES.md
│   └── VALIDATION_CHECKLIST.md       ← ⚠️ Validation checks
├── schema_designer/
│   ├── ZOD_TRANSFORM_ORDER.md
│   ├── AUTO_INJECTED_FIELDS.md       ← ⚠️ Conflicts with routing
│   └── QUERY_SCHEMA_PLACEMENT.md     ← ⚠️ CONFLICT SOURCE!
├── code_writer/
│   ├── STORAGE_COMPLETENESS.md
│   ├── WOUTER_ROUTING.md
│   └── ...
└── quality_assurer/
    ├── VALIDATION_CHECKLIST.md       ← ⚠️ Enforces routing checks
    └── CHROME_DEVTOOLS_TESTING.md
```

**Integration:** Each subagent's prompt embeds relevant patterns from its directory. For example, `api_architect` subagent has CONTRACT_PATH_CONSISTENCY.md embedded in its system prompt.

### 1.5 Skills System

**Location:** `~/.claude/skills/`

**Purpose:** Validation and learning tools invoked by pipeline-prompt.md before code generation.

**Key Skills:**
- `drizzle-orm-setup` - Teaches Drizzle patterns before schema generation
- `factory-lazy-init` - Teaches lazy Proxy pattern for auth factories
- `schema-query-validator` - Validates schema constraints before page generation
- `production-smoke-test` - Tests production build before completion
- `storage-factory-validation` - Validates IStorage contract compliance

**Invocation Pattern (from pipeline-prompt.md):**
```markdown
**🔧 BEFORE GENERATING** `server/lib/auth/factory.ts`:
**Invoke**: `factory-lazy-init` skill (MANDATORY)
```

---

## Part 2: The `/api` Routing Confusion

### 2.1 The Standard (What SHOULD Happen)

**Source:** `CONTRACT_PATH_CONSISTENCY.md` (lines 31-56)

**Rule:** Paths in ts-rest contracts are **ALWAYS relative to the mount point**. The server mounts all routes at `/api` in `server/index.ts`, so contract paths should NEVER include `/api`.

```typescript
// ✅ CORRECT: Contract paths relative to mount point
// shared/contracts/users.contract.ts
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // ✅ NO /api prefix
    responses: { 200: z.array(usersSchema) }
  }
});

// server/index.ts
app.use('/api', usersRoutes);  // Mounts at /api
// Result: GET /api/users ✅
```

**Auth Routes Follow Same Pattern:**
```typescript
// server/routes/auth.ts
router.post('/auth/login', async (req, res) => { ... })  // Relative

// server/index.ts
app.use('/api', authRoutes);  // Mount at /api
// Result: POST /api/auth/login ✅
```

**Why:** ts-rest's `createExpressEndpoints()` and Express's `app.use()` both prepend the mount point to all paths. Including `/api` in the path causes **double prefix** (`/api/api/users`) → 404 errors.

### 2.2 The Conflict (What's ACTUALLY Happening)

**Conflicting File:** `QUERY_SCHEMA_PLACEMENT.md`

**Lines 18, 30, 82, 93** all show `/api` in paths:

```typescript
// Line 18 - Labeled "❌ WRONG" but shows /api
path: '/api/campaigns',

// Line 30 - Labeled "❌ WRONG" but shows /api
router.get('/api/campaigns', async (req, res) => {

// Line 82 - Labeled "✅ CORRECT" but STILL shows /api
path: '/api/campaigns',

// Line 93 - Labeled "✅ CORRECT" but STILL shows /api
router.get('/api/campaigns', async (req, res) => {
```

**Impact:** This pattern file teaches schema_designer subagent to include `/api` in examples. When code_writer generates routes using these examples, it includes `/api`. Then quality_assurer sees CONTRACT_PATH_CONSISTENCY.md (which says NO /api) and rejects the code. Writer regenerates. Loop continues.

### 2.3 Evidence of Conflict

**From `pipeline-prompt.md` (lines 117-158):**
```typescript
// Line 130-132: Correct guidance
path: '/users',  // ✅ CORRECT: No /api prefix (relative to mount point)

// Lines 766-767: Conflicting guidance in examples
router.get('/api/resource', async (req, res) => {  // Shows /api!
```

**From other pattern files showing `/api`:**
- `AUTO_INJECTED_FIELDS.md` line 87: `router.post('/api/campaigns', authMiddleware(), ...)`
- `AUTO_INJECTED_FIELDS.md` line 244: `router.post('/api/items', authMiddleware(), ...)`
- `CORE_IDENTITY.md` line 58: `router.get('/api/users', authMiddleware(), ...)`
- `RESPONSE_SERIALIZATION.md` lines 58, 88, 118: All show `/api/games/:id`, `/api/items/:id`
- `HTTP_STATUS_CODES.md` line 59: `router.post('/api/users', authMiddleware(), ...)`

**User's Report:**
> "Sometimes we require /api, sometimes we don't. Quality assurer takes it out, then the system loops."

This is the **Writer-Critic death loop**:
1. Writer includes `/api` (following QUERY_SCHEMA_PLACEMENT.md examples)
2. Critic rejects (following CONTRACT_PATH_CONSISTENCY.md rules)
3. Writer regenerates with `/api` again (same examples)
4. Loop continues until max iterations

### 2.4 Why This Happens

**Pattern Embedding Process:**
Each subagent's prompt is assembled from:
1. `CORE_IDENTITY.md` (role definition)
2. Individual pattern files (specific rules)
3. `VALIDATION_CHECKLIST.md` (validation criteria)

**Problem:** When pattern files WITHIN THE SAME SUBAGENT show conflicting examples:
- schema_designer sees QUERY_SCHEMA_PLACEMENT.md with `/api` everywhere
- api_architect sees CONTRACT_PATH_CONSISTENCY.md with NO /api rule
- code_writer sees BOTH (imports from both subagents' patterns)
- quality_assurer enforces CONTRACT_PATH_CONSISTENCY.md strictly

**Result:** Agents receive mixed signals. No single source of truth.

---

## Part 3: Resolution Plan

### 3.1 The One True Standard

**Decision:** Adopt CONTRACT_PATH_CONSISTENCY.md as the ONLY source of truth.

**Rationale:**
1. ✅ Technically correct (ts-rest v3 behavior)
2. ✅ Already enforced by quality_assurer
3. ✅ Matches Express.js routing best practices
4. ✅ Prevents double prefix issues
5. ✅ Most comprehensive documentation

**Standard:**
```typescript
// ✅ Contracts: Relative paths ONLY (no /api)
path: '/users'          // NOT '/api/users'
path: '/auth/login'     // NOT '/api/auth/login'

// ✅ Routes: Relative paths ONLY (no /api)
router.get('/users', ...)        // NOT '/api/users'
router.post('/auth/login', ...)  // NOT '/api/auth/login'

// ✅ Server: Mount ALL routes at /api
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
```

### 3.2 Files Requiring Updates

#### Priority 1: Pattern Files (CRITICAL)

**1. `docs/patterns/schema_designer/QUERY_SCHEMA_PLACEMENT.md`**
   - Lines 18, 30, 82, 93: Remove `/api` from ALL examples
   - Replace `path: '/api/campaigns'` with `path: '/campaigns'`
   - Replace `router.get('/api/campaigns'` with `router.get('/campaigns'`
   - Add comment: `// Mounted at /api in server/index.ts → final URL: /api/campaigns`

**2. `docs/patterns/schema_designer/AUTO_INJECTED_FIELDS.md`**
   - Lines 87, 244: Remove `/api` prefix
   - Replace `router.post('/api/campaigns'` with `router.post('/campaigns'`
   - Replace `router.post('/api/items'` with `router.post('/items'`

**3. `docs/patterns/api_architect/CORE_IDENTITY.md`**
   - Line 58: Remove `/api` prefix
   - Replace `router.get('/api/users'` with `router.get('/users'`

**4. `docs/patterns/api_architect/RESPONSE_SERIALIZATION.md`**
   - Lines 58, 88, 118, 148: Remove `/api` prefix from all route examples
   - Replace `router.get('/api/games/:id'` with `router.get('/games/:id'`
   - Replace `router.get('/api/items/:id'` with `router.get('/items/:id'`

**5. `docs/patterns/api_architect/HTTP_STATUS_CODES.md`**
   - Line 59: Remove `/api` prefix
   - Replace `router.post('/api/users'` with `router.post('/users'`

**6. `docs/pipeline-prompt.md`**
   - Lines 766-783: Update route examples to use relative paths
   - Replace all `router.get('/api/resource'` with `router.get('/resource'`
   - Add section reference to CONTRACT_PATH_CONSISTENCY pattern
   - Emphasize at lines 117-158: "NO /api prefix in contracts (paths are relative to mount point)"

#### Priority 2: Validation Updates

**7. `docs/patterns/quality_assurer/VALIDATION_CHECKLIST.md`**
   - Already correct! Lines 51-63 validate NO /api in contracts/routes
   - Keep as-is, this is the enforcer

**8. `docs/patterns/api_architect/VALIDATION_CHECKLIST.md`**
   - Already correct! Lines 7-12 show proper validation commands
   - Keep as-is

#### Priority 3: Documentation Cross-References

**9. Add Routing Reference Section to `pipeline-prompt.md`**
   - After line 158 (Contract section), add:
   ```markdown
   **⚠️ CRITICAL PATH CONSISTENCY RULE:**

   ALL paths in contracts and routes are RELATIVE to mount point.
   Server mounts at /api, so:
   - Contract path: '/users' → URL: /api/users ✅
   - Route path: '/auth/login' → URL: /api/auth/login ✅

   NEVER include /api in contract or route paths. The mount point handles this.

   See: docs/patterns/api_architect/CONTRACT_PATH_CONSISTENCY.md
   ```

**10. Update `PATTERN_FILES_SUMMARY.md`**
   - Add note about routing consistency
   - Mark CONTRACT_PATH_CONSISTENCY.md as authoritative source

### 3.3 Implementation Steps

**Step 1: Update Pattern Files (30 min)**
1. Edit all 6 pattern files listed in 3.2 Priority 1
2. Run validation: `grep -r "'/api/" docs/patterns/*/`
3. Expected: ZERO matches in examples except in CONTRACT_PATH_CONSISTENCY.md "wrong" examples

**Step 2: Update pipeline-prompt.md (15 min)**
1. Edit lines 766-783 to remove `/api` from route examples
2. Add routing reference section after line 158
3. Run validation: `grep "router\.\(get\|post\)('/api" docs/pipeline-prompt.md`
4. Expected: ZERO matches (only in explanatory text, not code examples)

**Step 3: Validation Testing (20 min)**
1. Generate a test app: `uv run python run-app-generator.py "Create a simple blog" --app-name test-routing`
2. Check contracts: `grep -r "path: '/api" apps/test-routing/app/shared/contracts/`
3. Expected: ZERO matches
4. Check routes: `grep -r "router\.\(get\|post\)('/api" apps/test-routing/app/server/routes/`
5. Expected: ZERO matches
6. Check mounting: `grep "app.use('/api'" apps/test-routing/app/server/index.ts`
7. Expected: Multiple matches (all routes mounted correctly)
8. Test app: `cd apps/test-routing/app && npm install && npm run dev`
9. Expected: All API calls succeed (no 404 errors)

**Step 4: Quality Assurer Verification (10 min)**
1. Run quality_assurer on test app
2. Expected: Routing Check 4 passes (no /api prefix violations)
3. If fails: Recheck pattern file updates

**Step 5: Documentation Update (10 min)**
1. Update PATTERN_FILES_SUMMARY.md
2. Add entry to RECONCILIATION_FINAL_SUMMARY.md
3. Commit changes with message: "Fix: Reconcile /api routing patterns (Issue #[number])"

### 3.4 Testing Checklist

After implementation, verify:

- [ ] `grep -r "'/api/" docs/patterns/` returns only CONTRACT_PATH_CONSISTENCY.md "wrong" examples
- [ ] `grep "router\.(get|post)('/api" docs/pipeline-prompt.md` returns ZERO matches in code blocks
- [ ] Generate test app with 3+ entities
- [ ] All contracts use relative paths (`path: '/users'` not `/api/users`)
- [ ] All routes use relative paths (`router.get('/users'` not `/api/users`)
- [ ] `server/index.ts` mounts all routers at `/api`
- [ ] App runs without 404 errors
- [ ] quality_assurer Check 4 passes
- [ ] No Writer-Critic loops during generation

### 3.5 Success Criteria

**Quantitative:**
- ✅ ZERO `/api` prefixes in contract paths across all generated apps
- ✅ ZERO `/api` prefixes in route definitions across all generated apps
- ✅ 100% of routes mounted at `/api` in server/index.ts
- ✅ ZERO Writer-Critic loops due to routing conflicts
- ✅ quality_assurer Check 4 passes on first validation

**Qualitative:**
- ✅ Developers understand routing pattern immediately
- ✅ Generated apps work on first `npm run dev`
- ✅ No 404 errors in browser console
- ✅ Subagents generate consistent routing code
- ✅ Pattern files show ONE clear standard

---

## Part 4: Why This Matters

### 4.1 Impact of Current Bug

**Generation Failures:**
- Apps fail to load (404 on all API calls)
- Writer-Critic loops waste token budget
- Generation takes 2-3x longer than necessary

**Developer Experience:**
- Hours debugging routing issues
- Confusion about "correct" pattern
- Manual fixes required post-generation

**Code Quality:**
- Inconsistent routing across apps
- Quality assurer reverses valid changes
- Technical debt accumulates

### 4.2 Benefits of Resolution

**Immediate:**
- ✅ Apps work on first generation attempt
- ✅ No routing-related Writer-Critic loops
- ✅ 50%+ reduction in generation time
- ✅ Zero 404 errors in generated apps

**Long-term:**
- ✅ Consistent codebase patterns
- ✅ Easier maintenance and debugging
- ✅ Subagents learn correct patterns
- ✅ Quality assurer enforces ONE standard
- ✅ Pattern library serves as reliable reference

---

## Part 5: Appendix

### 5.1 Pipeline Flow Diagram

```
User Prompt
    ↓
┌─────────────────────────────────────────┐
│ AppGenerator Agent                      │
│ (System Prompt: pipeline-prompt.md)    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 1: Plan                           │
│ - Analyze prompt                        │
│ - Create plan/plan.md                   │
│ - Define entities, features, workflows  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 2.1: Backend Specification        │
│ ┌────────────────────────────────────┐  │
│ │ 2.1.1: Zod Schema (schema.zod.ts)  │  │
│ │ Delegate → schema_designer         │  │
│ │ Patterns: ZOD_TRANSFORM_ORDER,     │  │
│ │           AUTO_INJECTED_FIELDS,    │  │
│ │           QUERY_SCHEMA_PLACEMENT ⚠️│  │
│ └────────────────────────────────────┘  │
│            ↓ (MUST complete first)      │
│ ┌────────────────────────────────────┐  │
│ │ 2.1.2: ts-rest Contracts           │  │
│ │ Delegate → api_architect           │  │
│ │ Patterns: CONTRACT_PATH_CONSISTENCY│  │
│ │           (imports schema.zod.ts)  │  │
│ └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 2.2: Backend Implementation       │
│ - Drizzle schema (schema.ts)            │
│ - Auth scaffolding (factory pattern)    │
│ - Storage (factory pattern)             │
│ - API Routes ← ⚠️ CONFLICT HERE         │
│   Delegate → code_writer                │
│   Sees BOTH schemas (mixed signals)     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 2.3: Frontend Specification       │
│ - API Client (uses contracts)           │
│ - Auth Context                          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 2.4: Frontend Implementation      │
│ - Design system                         │
│ - App shell & layout                    │
│ - Pages (delegate → code_writer)        │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Stage 3: Validate                       │
│ Delegate → quality_assurer (MANDATORY)  │
│ - Type check, lint, build               │
│ - API testing                           │
│ - Browser automation (Chrome DevTools)  │
│ - Check 4: Route Path Consistency ⚠️    │
│   Enforces CONTRACT_PATH_CONSISTENCY    │
│   Fails if /api in contracts/routes     │
└─────────────────────────────────────────┘
    ↓
  ⚠️ LOOP POINT: If Check 4 fails,
     Writer-Critic loop begins
    ↓
┌─────────────────────────────────────────┐
│ Stage 4: Integration Check              │
│ - Verify all pages use apiClient        │
│ - No placeholder data                   │
└─────────────────────────────────────────┘
    ↓
  ✅ Complete Application
```

### 5.2 Conflicting Files Matrix

| File | Lines | Shows `/api`? | Role | Priority |
|------|-------|--------------|------|----------|
| `CONTRACT_PATH_CONSISTENCY.md` | 1-173 | NO (except "wrong" examples) | ✅ Authoritative | Reference |
| `QUERY_SCHEMA_PLACEMENT.md` | 18, 30, 82, 93 | YES ⚠️ | ❌ Conflicting | **FIX #1** |
| `AUTO_INJECTED_FIELDS.md` | 87, 244 | YES ⚠️ | ❌ Conflicting | **FIX #2** |
| `CORE_IDENTITY.md` | 58 | YES ⚠️ | ❌ Conflicting | **FIX #3** |
| `RESPONSE_SERIALIZATION.md` | 58, 88, 118, 148 | YES ⚠️ | ❌ Conflicting | **FIX #4** |
| `HTTP_STATUS_CODES.md` | 59 | YES ⚠️ | ❌ Conflicting | **FIX #5** |
| `pipeline-prompt.md` | 766-783 | YES ⚠️ | ❌ Conflicting | **FIX #6** |
| `VALIDATION_CHECKLIST.md` (QA) | 51-63 | NO (validation) | ✅ Enforcer | Keep |

### 5.3 Correct Patterns Reference

**For Copy-Paste into Pattern Files:**

```typescript
// ✅ CORRECT: Contract paths (NO /api prefix)
export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // Mounted at /api in server/index.ts → /api/users
    responses: { 200: z.array(usersSchema) }
  },
  getUser: {
    method: 'GET',
    path: '/users/:id',  // → /api/users/:id
    responses: { 200: usersSchema }
  },
  createUser: {
    method: 'POST',
    path: '/users',  // → /api/users
    body: insertUsersSchema,
    responses: { 201: usersSchema }
  }
});

// ✅ CORRECT: Route paths (NO /api prefix)
router.get('/users', authMiddleware(), async (req, res) => {
  const users = await storage.getUsers();
  res.json(users);
});

router.post('/users', authMiddleware(), async (req, res) => {
  const user = await storage.createUser(req.body);
  res.status(201).json(user);
});

// ✅ CORRECT: Auth routes (NO /api prefix)
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await auth.login(email, password);
  res.json(result);
});

// ✅ CORRECT: Server mounting (ALL routes at /api)
app.use('/api', authRoutes);      // /api/auth/*
app.use('/api', usersRoutes);     // /api/users/*
app.use('/api', postsRoutes);     // /api/posts/*
```

**Validation Commands:**
```bash
# Verify NO /api in contract paths
grep -r "path: '/api/" shared/contracts/
# Expected: ZERO matches

# Verify NO /api in route definitions
grep -E "router\.(get|post|put|delete)\('/api" server/routes/
# Expected: ZERO matches

# Verify ALL routes mounted at /api
grep "app.use('/api'" server/index.ts
# Expected: Multiple matches (one per router)
```

---

## Conclusion

The AppGenerator pipeline is a sophisticated system with pipeline-prompt.md as the orchestrator, 8 specialized subagents, and pattern files for knowledge transfer. The `/api` routing confusion stems from **pattern file inconsistency** where QUERY_SCHEMA_PLACEMENT.md contradicts CONTRACT_PATH_CONSISTENCY.md.

**Resolution is straightforward:**
1. Update 6 pattern files to remove `/api` from examples
2. Update pipeline-prompt.md to reference CONTRACT_PATH_CONSISTENCY.md
3. Test with a generated app
4. Verify quality_assurer enforces consistently

**Expected Outcome:** Zero routing-related loops, apps work on first generation, developers have ONE clear standard to follow.

**Timeline:** 90 minutes total implementation + testing.

---

**Next Steps:**
1. Review this analysis with team
2. Approve resolution plan
3. Execute Priority 1 updates (pattern files)
4. Run validation testing
5. Monitor next 10 app generations for routing issues
6. Update if any edge cases discovered

**Questions for Team:**
- Should we add automated tests to prevent pattern file drift?
- Should CONTRACT_PATH_CONSISTENCY.md be the ONLY place `/api` mounting is explained?
- Do we need a "routing linter" to validate generated code before quality_assurer?

