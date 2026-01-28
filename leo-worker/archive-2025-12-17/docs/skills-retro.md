# Skills Retrospective Analysis

**Date**: October 24, 2025
**Purpose**: Reconcile existing skills with retro-implementation plan
**Goal**: Ensure no conflicts, identify gaps, optimize skill ecosystem

---

## Executive Summary

**Current Skills**: 5 existing (4 with SKILL.md + 1 incomplete)
**Proposed Skills**: 5 new skills from retro-implementation.md
**Conflicts**: 1 potential overlap
**Gaps**: 2 critical validations missing
**Status**: ✅ Generally compatible, needs clarification on scope

---

## Existing Skills Inventory

### 1. drizzle-orm-setup ✅

**Location**: `apps/.claude/skills/drizzle-orm-setup/`

**Purpose**: Configure Drizzle ORM for PostgreSQL/Supabase with automatic snake_case ↔ camelCase conversion

**When to Use**:
- Creating `server/lib/storage/*-storage.ts` files
- Setting up database connections for Supabase, PostgreSQL, or Neon
- App has a Drizzle schema in `shared/schema.ts`

**Key Principle**: "DRIZZLE SCHEMA ≠ DRIZZLE QUERIES"
- Having a schema doesn't mean you're using Drizzle for queries
- Must create a Drizzle client and use it for all operations

**What It Provides**:
1. Template for `server/lib/db.ts` (Drizzle client creation)
2. Example queries using Drizzle client
3. Automatic snake_case ↔ camelCase conversion patterns
4. Validation checklist (ensure Drizzle is actually used)

**Anti-Patterns Prevented**:
- ❌ Using Supabase PostgREST client when Drizzle schema exists
- ❌ Manual conversion helpers when Drizzle is available
- ❌ Schema exists but not used for queries

**Validation Script**: `scripts/validate-drizzle.sh`

**Scope**: Implementation guidance, not validation

---

### 2. storage-factory-validation ✅

**Location**: `apps/.claude/skills/storage-factory-validation/`

**Purpose**: Validate that all IStorage implementations return identical object shapes (Liskov Substitution Principle)

**When to Use**:
- After generating storage implementations
- Before completing storage layer
- When switching between MemoryStorage and DatabaseStorage

**Key Principle**: "All IStorage implementations must be substitutable"
- Routes use `storage.getUser(1)`
- Must work identically whether storage is Memory or Database
- If shapes differ → routes break when switching storage mode

**Validation Rules**:
1. Property names must match (case-sensitive)
2. Nested objects must match
3. Array elements must match
4. No snake_case leaks in returned objects
5. Consistent null vs undefined handling

**What It Provides**:
1. TypeScript validation script (`scripts/validate-contract.ts`)
2. Comparison logic (Memory vs Database returns)
3. Anti-pattern detection (snake_case leaks, missing conversion)

**Validation Script**: `scripts/validate-contract.ts`
```typescript
// Creates test data in both implementations
// Compares property names
// Checks for snake_case leaks
// Reports violations
```

**Scope**: Runtime validation of storage implementations

---

### 3. supabase-storage ✅

**Location**: `apps/.claude/skills/supabase-storage/`

**Purpose**: Implement database storage using Supabase PostgREST client (NOT Drizzle ORM) with mandatory manual snake_case ↔ camelCase conversion

**When to Use**:
- You need Row Level Security (RLS) enforcement
- Sharing storage logic with frontend
- Building public API endpoints that respect RLS

**When NOT to Use**:
- Server-only application → Use `drizzle-orm-setup` instead
- No RLS requirements → Use `drizzle-orm-setup` instead

**Critical Requirement**: 🚨 **MANUAL CONVERSION IS MANDATORY**

**What It Provides**:
1. `toSnakeCase()` and `toCamelCase()` helper functions
2. Mandatory patterns for SELECT/INSERT/UPDATE/DELETE
3. Anti-pattern warnings
4. Validation checklist

**Key Patterns**:
```typescript
// SELECT: Must convert result to camelCase
return toCamelCase(data) as User;

// INSERT: Must convert input to snake_case
const dbData = toSnakeCase(insertData);
await supabase.from('users').insert(dbData);

// UPDATE: Both directions conversion
const dbUpdates = toSnakeCase(updates);
return toCamelCase(result) as User;
```

**Validation Script**: `scripts/validate-supabase-storage.sh`

**Scope**: Implementation guidance for PostgREST approach

---

### 4. type-safe-queries ✅

**Location**: `apps/.claude/skills/type-safe-queries/`

**Purpose**: Decision tree for choosing between Drizzle ORM and Supabase PostgREST

**When to Use**:
- Before deciding on database query approach
- When requirements are unclear (RLS needed?)
- Planning storage layer architecture

**Decision Tree**:
```
Do you need Row Level Security (RLS)?
│
├─ YES → Do users access database directly (browser)?
│   │
│   ├─ YES → Use Supabase PostgREST
│   │         Invoke: supabase-storage skill
│   │
│   └─ NO → Server-only with RLS?
│       │
│       ├─ YES → Use PostgREST with service role
│       │         Invoke: supabase-storage skill
│       │
│       └─ NO → Use Drizzle ORM
│                 Invoke: drizzle-orm-setup skill
│
└─ NO → Use Drizzle ORM
          Invoke: drizzle-orm-setup skill
```

**Comparison Matrix**:
| Feature | Drizzle ORM | Supabase PostgREST |
|---------|-------------|-------------------|
| snake_case conversion | ✅ Automatic | ❌ Manual required |
| Type safety | ✅ Compile-time | ⚠️ Runtime only |
| undefined → null | ✅ Automatic | ❌ Manual required |
| Performance | ✅ Direct PostgreSQL | ⚠️ HTTP overhead |
| Row Level Security | ❌ Bypassed | ✅ Enforced |
| Browser compatible | ❌ Server only | ✅ Browser + Server |

**Default Recommendation**: Drizzle ORM (for server-side apps)

**Scope**: Decision helper, meta-skill that delegates to other skills

---

### 5. supabase-full-stack ⚠️

**Location**: `apps/.claude/skills/supabase-full-stack/`

**Status**: **INCOMPLETE** - No SKILL.md found, only templates directory

**Expected Purpose**: Complete Supabase integration guidance
- Auth integration (Supabase Auth)
- Storage implementation (PostgREST or Drizzle)
- Real-time subscriptions
- File storage integration

**Current State**: Only has `templates/` directory, no instructions

**Recommendation**: Either complete this skill or deprecate it

---

## Proposed New Skills (from retro-implementation.md)

### P0 Skill 1: `schema-query-validator` 🆕

**Purpose**: Prevent schema-frontend mismatches (addresses Fizzcard Issue #1)

**Problem Being Solved**:
```typescript
// Frontend (LeaderboardPage.tsx)
useQuery({ queryFn: () => api.getLeaderboard({ limit: 100 }) })  // ❌ Hardcoded

// Backend (schema.zod.ts)
leaderboardQuerySchema = z.object({ limit: z.number().max(50) })  // ❌ Mismatch!

// Result: 500 error on first page load
```

**When to Invoke**: After generating frontend query hooks

**What It Does**:
1. Reads `shared/schema.zod.ts` to extract query parameter constraints
2. Scans frontend files for query parameter usage
3. Validates: hardcoded values ≤ schema max limits
4. Reports violations with file:line references

**Python Validator**:
```python
def extract_schema_limits(schema_path) -> Dict[str, int]:
    # Find patterns: z.number().max(50)

def find_hardcoded_limits(pages_dir) -> List[Dict]:
    # Find patterns: limit: 100

def validate(app_path) -> List[str]:
    # Cross-validate frontend vs schema
```

**Scope**: Validation (cross-layer contract checking)

---

### P0 Skill 2: `factory-lazy-init` 🆕

**Purpose**: Fix eager factory initialization (addresses Fizzcard Issue #3)

**Problem Being Solved**:
```typescript
// ❌ BAD: Eager initialization
import { createStorage } from './create';
export const storage = createStorage();  // Runs BEFORE dotenv!

// server/index.ts
import './lib/storage/factory';  // Module hoisting executes factory first
import 'dotenv/config';          // Too late! process.env.STORAGE_MODE undefined
```

**When to Invoke**: Before generating auth/storage factories

**What It Does**:
1. Detects `export const storage = createStorage()` pattern
2. Replaces with lazy Proxy pattern
3. Ensures factories initialize AFTER dotenv loads

**Lazy Proxy Pattern**:
```typescript
// ✅ GOOD: Lazy initialization
let instance: IStorage | null = null;

export const storage = new Proxy({} as IStorage, {
  get(target, prop) {
    if (!instance) {
      instance = createStorage();  // Only runs when first accessed
    }
    return instance[prop as keyof IStorage];
  }
});
```

**Scope**: Code generation pattern (template/fix)

---

### P0 Skill 3: `production-smoke-test` 🆕

**Purpose**: Catch production build failures (addresses Fizzcard Issue #5)

**Problem Being Solved**:
```typescript
// Development: Works fine
const clientDistPath = path.join(__dirname, '../client/dist');

// Production (TypeScript compiled):
// __dirname = /app/server/dist/server
// Resolves to: /app/server/dist/server/../client/dist ❌ WRONG
// Actual location: /app/client/dist

// Result: 400+ errors in Fly.io deployment
```

**When to Invoke**: After Stage 3 validation (before marking complete)

**What It Does**:
1. Builds app in production mode (`npm run build`)
2. Starts in Docker container (simulates Fly.io)
3. Tests: static files serve, API responds, auth flow works
4. Reports: path issues, environment variable problems

**Test Suite**:
1. Build Test: `npm run build` succeeds
2. Container Test: Starts in Docker without errors
3. Static Files: GET / returns index.html
4. Health Endpoint: GET /health returns 200
5. Auth Flow: POST /api/auth/login → POST /api/resource (with token)

**Scope**: Validation (production environment testing)

---

### P1 Skill 4: `module-loading-validator` 🆕

**Purpose**: Verify dotenv loads before factory imports

**What It Does**:
1. Checks `server/index.ts` for `import 'dotenv/config'` at top
2. Verifies no factory imports happen before dotenv
3. Validates lazy patterns are used

**Scope**: Validation (import order checking)

---

### P2 Skill 5: `query-optimizer` 🆕

**Purpose**: Add LIMIT clauses and pagination to complex queries

**What It Does**:
1. Detects queries without LIMIT clauses
2. Adds default pagination (limit: 50, offset: 0)
3. Suggests indexes for foreign key joins

**Scope**: Optimization (performance)

---

## Conflict Analysis

### Conflict 1: storage-factory-validation vs factory-lazy-init

**Potential Overlap**: Both deal with factory pattern correctness

**Analysis**:
- **storage-factory-validation**: Validates **output** (object shapes match)
- **factory-lazy-init**: Validates **initialization pattern** (lazy vs eager)

**Verdict**: ✅ **NO CONFLICT** - Different concerns
- storage-factory-validation: "Do implementations return same shape?"
- factory-lazy-init: "Does factory initialize at the right time?"

**Recommendation**: Keep both, they complement each other

---

### Conflict 2: drizzle-orm-setup vs schema-query-validator

**Potential Overlap**: Both deal with schema validation

**Analysis**:
- **drizzle-orm-setup**: Implementation guidance (how to use Drizzle)
- **schema-query-validator**: Cross-layer validation (frontend respects backend schema)

**Verdict**: ✅ **NO CONFLICT** - Different scopes
- drizzle-orm-setup: Backend implementation (server/lib/storage)
- schema-query-validator: Frontend-backend contract (client/src/pages vs shared/schema.zod.ts)

**Recommendation**: Keep both, they validate different layers

---

### Conflict 3: supabase-full-stack vs Other Skills

**Potential Overlap**: Might duplicate drizzle-orm-setup, supabase-storage, type-safe-queries

**Analysis**:
- **supabase-full-stack**: INCOMPLETE - no SKILL.md found
- Purpose unclear (could be orchestration or duplication)

**Verdict**: ⚠️ **UNCLEAR** - Need to define or deprecate

**Recommendation**:
- **Option A**: Complete it as an **orchestrator skill** that delegates to others:
  ```markdown
  # Supabase Full-Stack Integration

  This skill orchestrates:
  1. Invoke type-safe-queries skill → Decide Drizzle vs PostgREST
  2. If Drizzle → Invoke drizzle-orm-setup skill
  3. If PostgREST → Invoke supabase-storage skill
  4. Invoke storage-factory-validation skill
  5. Setup Supabase Auth integration
  ```

- **Option B**: Deprecate it (existing skills cover the pieces)

---

## Gap Analysis

### Gap 1: Frontend-Backend Contract Validation ❌

**Current Coverage**: None

**Needed**: `schema-query-validator` (proposed P0 skill)

**Why Critical**: Fizzcard had 500 error on first page load due to limit: 100 vs max: 50

**Status**: ✅ Addressed by retro-implementation.md

---

### Gap 2: Factory Initialization Pattern ❌

**Current Coverage**: None

**Needed**: `factory-lazy-init` (proposed P0 skill)

**Why Critical**: Fizzcard always used memory storage despite `STORAGE_MODE=database`

**Status**: ✅ Addressed by retro-implementation.md

---

### Gap 3: Production Environment Testing ❌

**Current Coverage**: None (only dev environment validation)

**Needed**: `production-smoke-test` (proposed P0 skill)

**Why Critical**: Fizzcard had 400+ errors in Fly.io due to wrong paths

**Status**: ✅ Addressed by retro-implementation.md

---

### Gap 4: Import Order Validation ⚠️

**Current Coverage**: None

**Needed**: `module-loading-validator` (proposed P1 skill)

**Why Important**: Module hoisting can cause environment variables to be undefined

**Status**: ✅ Addressed by retro-implementation.md (P1 priority)

---

## Skill Categorization

### Category 1: Decision Helpers (Meta-Skills)

**Purpose**: Help choose the right approach

**Skills**:
1. `type-safe-queries` ✅ - Choose Drizzle vs PostgREST
2. `supabase-full-stack` ⚠️ - (If completed) Orchestrate Supabase integration

**Characteristics**:
- Don't generate code directly
- Provide decision trees
- Delegate to implementation skills

---

### Category 2: Implementation Guidance

**Purpose**: Provide patterns and templates for code generation

**Skills**:
1. `drizzle-orm-setup` ✅ - Drizzle client setup and usage
2. `supabase-storage` ✅ - PostgREST implementation patterns
3. `factory-lazy-init` 🆕 - Lazy Proxy pattern for factories

**Characteristics**:
- Provide code templates
- Show anti-patterns
- Include setup instructions

---

### Category 3: Validation (Post-Generation)

**Purpose**: Verify generated code meets contracts and standards

**Skills**:
1. `storage-factory-validation` ✅ - Validate IStorage contract compliance
2. `schema-query-validator` 🆕 - Validate frontend respects backend schema
3. `module-loading-validator` 🆕 - Validate import order
4. `production-smoke-test` 🆕 - Validate production deployment

**Characteristics**:
- Run after code generation
- Include Python/TypeScript validation scripts
- Report violations with file:line references

---

### Category 4: Optimization

**Purpose**: Improve performance and quality

**Skills**:
1. `query-optimizer` 🆕 - Add LIMIT clauses, pagination, indexes

**Characteristics**:
- Run after validation
- Suggest improvements
- Non-blocking (warnings, not errors)

---

## Skill Dependency Graph

```
User Request
    │
    ├─→ type-safe-queries (Decision Helper)
    │       │
    │       ├─→ drizzle-orm-setup (if Drizzle chosen)
    │       │       │
    │       │       └─→ storage-factory-validation ✓
    │       │
    │       └─→ supabase-storage (if PostgREST chosen)
    │               │
    │               └─→ storage-factory-validation ✓
    │
    ├─→ factory-lazy-init (Before factory generation)
    │
    ├─→ schema-query-validator (After frontend generation)
    │
    ├─→ module-loading-validator (After server/index.ts generation)
    │
    ├─→ production-smoke-test (After all validation)
    │
    └─→ query-optimizer (Optional, after smoke test)
```

**Validation Sequence**:
1. Decision → Implementation → Contract Validation
2. Schema → Frontend → Cross-Layer Validation
3. Code Generation → Module Order Validation
4. Everything → Production Smoke Test
5. Working App → Optimization

---

## Recommendations

### Recommendation 1: Complete supabase-full-stack ✅

**Action**: Define scope and create SKILL.md

**Proposed Scope**: Orchestrator skill that:
1. Invokes `type-safe-queries` for decision
2. Delegates to appropriate implementation skill
3. Adds Supabase Auth integration
4. Adds Real-time subscriptions (if needed)
5. Invokes `storage-factory-validation`

**Alternative**: Deprecate it (existing skills cover the pieces)

---

### Recommendation 2: Implement All P0 Skills from Retro 🔴

**Priority**: HIGH

**Skills to Create**:
1. `schema-query-validator` - Prevents 500 errors (Fizzcard Issue #1)
2. `factory-lazy-init` - Prevents environment variable bugs (Fizzcard Issue #3)
3. `production-smoke-test` - Prevents deployment failures (Fizzcard Issue #5)

**Timeline**: Immediate (next sprint)

**Why**: These directly address critical bugs found in Fizzcard retrospective

---

### Recommendation 3: Clarify Skill Scopes in SKILL.md 📝

**Action**: Add explicit scope markers to each SKILL.md

**Proposed Sections**:
```markdown
---
name: Skill Name
description: Brief description
category: decision-helper | implementation | validation | optimization
scope: What this skill does vs what it doesn't do
---

## When to Use This Skill

MANDATORY when:
- ...

AUTO-INVOKE on these patterns:
- ...

DO NOT use when:
- ...

## Scope

✅ This skill DOES:
- ...

❌ This skill does NOT:
- ...
```

**Benefit**: Prevents confusion about when to invoke which skill

---

### Recommendation 4: Create Skill Invocation Matrix 📊

**Action**: Add to pipeline-prompt.md or separate doc

**Format**:
| Stage | Required Skills | Optional Skills |
|-------|----------------|----------------|
| Plan | - | - |
| Backend Schema | - | - |
| Backend Contracts | - | - |
| Backend Implementation | type-safe-queries, drizzle-orm-setup OR supabase-storage | - |
| Backend Factory | factory-lazy-init | - |
| Backend Validation | storage-factory-validation, module-loading-validator | - |
| Frontend Generation | - | - |
| Frontend Validation | schema-query-validator | - |
| Final Validation | production-smoke-test | query-optimizer |

**Benefit**: Clear guidance on when to invoke each skill

---

### Recommendation 5: Add Validation Scripts to Existing Skills 🔧

**Action**: Enhance drizzle-orm-setup and supabase-storage with runnable validators

**Current State**:
- `drizzle-orm-setup` has `scripts/validate-drizzle.sh` mentioned but may not exist
- `supabase-storage` has `scripts/validate-supabase-storage.sh` mentioned but may not exist

**TODO**:
1. Create actual validation scripts
2. Test them on generated apps
3. Document expected output

---

## Conflict Resolution Matrix

| Skill A | Skill B | Conflict? | Resolution |
|---------|---------|-----------|------------|
| storage-factory-validation | factory-lazy-init | ❌ No | Different concerns (output vs initialization) |
| drizzle-orm-setup | supabase-storage | ❌ No | Mutually exclusive (choose one) |
| drizzle-orm-setup | schema-query-validator | ❌ No | Different layers (backend vs frontend-backend) |
| type-safe-queries | drizzle-orm-setup | ❌ No | Decision helper → Implementation |
| type-safe-queries | supabase-storage | ❌ No | Decision helper → Implementation |
| supabase-full-stack | (all Supabase skills) | ⚠️ Unclear | Need to define or deprecate |

---

## Implementation Priority

### Phase 1: Critical (Week 1-2) 🔴

1. ✅ Create `schema-query-validator` skill
2. ✅ Create `factory-lazy-init` skill
3. ✅ Create `production-smoke-test` skill
4. ✅ Add invocation points to pipeline-prompt.md (75 lines)

**Impact**: Prevents 3 critical bugs found in Fizzcard

---

### Phase 2: Important (Week 3-4) 🟡

1. ✅ Create `module-loading-validator` skill
2. ✅ Define or deprecate `supabase-full-stack` skill
3. ✅ Add scope sections to existing SKILL.md files
4. ✅ Create skill invocation matrix

**Impact**: Better clarity, prevents module order bugs

---

### Phase 3: Optimization (Week 5-6) 🟢

1. ✅ Create `query-optimizer` skill
2. ✅ Add validation scripts to existing skills
3. ✅ Test all skills on fresh app generations

**Impact**: Performance improvements, better DX

---

## Success Metrics

**Current State** (5 existing skills):
- ✅ Implementation guidance: Good
- ⚠️ Validation: Limited (only storage-factory-validation)
- ❌ Cross-layer validation: None
- ❌ Production testing: None

**Target State** (10 skills total):
- ✅ Implementation guidance: Excellent (existing + factory-lazy-init)
- ✅ Validation: Comprehensive (5 validation skills)
- ✅ Cross-layer validation: schema-query-validator
- ✅ Production testing: production-smoke-test

**KPI**:
- Apps functional on first generation: 60% → 95%
- Manual fixes required: 10+ hrs → <1 hr
- Integration bugs: ~12 per app → <2 per app
- Production deployment success: 0% → 90%

---

## Conclusion

**Finding**: Existing skills are well-designed but focus on **implementation guidance**, not **validation**

**Gap**: The 3 critical Fizzcard issues (schema mismatch, factory initialization, production paths) are NOT addressed by existing skills

**Solution**: retro-implementation.md's proposed skills fill these gaps perfectly

**Recommendation**:
1. ✅ Keep all 5 existing skills (no conflicts)
2. ✅ Implement 3 P0 skills from retro-implementation.md
3. ⚠️ Define or deprecate supabase-full-stack
4. ✅ Add skill invocation points to pipeline-prompt.md

**Timeline**: 6 weeks to complete implementation (phased approach)

**Confidence**: HIGH - Skills are complementary, not conflicting

---

---

# PART 2: PROACTIVE TEACHING ARCHITECTURE

**Date Added**: October 24, 2025
**Context**: Shift from reactive validation to proactive teaching
**Goal**: Invoke skills BEFORE agent writes code to prevent errors, not just detect them

---

## The Paradigm Shift

### Current Approach: Reactive Validation ❌

```
Agent generates code → Validation detects error → Agent fixes code → Repeat
```

**Problems**:
- Agent makes mistake first, fixes later
- Multiple iterations waste tokens and time
- Some errors only caught in production
- No guarantee agent learns the correct pattern

**Example (Fizzcard Issue #1)**:
```typescript
// Step 1: Agent generates frontend page
const { data } = useQuery(() => api.getLeaderboard({ limit: 100 }));  // ❌ Wrong

// Step 2: Validation detects mismatch
ERROR: schema.zod.ts defines max: 50, frontend uses 100

// Step 3: Agent fixes
const { data } = useQuery(() => api.getLeaderboard({ limit: 50 }));  // ✅ Fixed
```

**Cost**: 3 iterations, 2 wrong code generations

---

### New Approach: Proactive Teaching ✅

```
Invoke skill BEFORE generation → Agent learns pattern → Agent generates CORRECT code → Validation confirms → Already correct
```

**Benefits**:
- Agent learns correct pattern upfront
- Generates correct code on first attempt
- Validation becomes confirmation, not error detection
- Fewer iterations = faster, cheaper, more reliable

**Example (Proactive)**:
```typescript
// Step 1: BEFORE generating frontend page, invoke schema-query-validator skill
SKILL OUTPUT: "Leaderboard limit constraint: max 50 (from schema.zod.ts line 42)"

// Step 2: Agent generates page WITH constraint knowledge
const { data } = useQuery(() => api.getLeaderboard({ limit: 50 }));  // ✅ Correct first time

// Step 3: Validation confirms
✅ PASS: All query params respect schema constraints
```

**Cost**: 1 iteration, 0 wrong code generations

---

## Complete Pipeline Dependency Map

### File Generation Order (From pipeline-prompt.md)

```
Stage 1: Plan
├─→ plan/plan.md

Stage 2: Build
│
├─→ 2.1 Backend Specification
│   ├─→ shared/schema.zod.ts          [FIRST FILE - source of truth]
│   │   Dependencies: NONE
│   │   Used By: contracts, schema.ts, api-client, frontend pages
│   │
│   └─→ shared/contracts/*.contract.ts
│       Dependencies: schema.zod.ts
│       Used By: routes, api-client
│
├─→ 2.2 Backend Implementation
│   ├─→ shared/schema.ts (Drizzle)
│   │   Dependencies: schema.zod.ts
│   │   Used By: storage, routes
│   │   🔧 Existing skill invocation: drizzle-orm-setup (line 116)
│   │
│   ├─→ server/lib/auth/factory.ts
│   │   Dependencies: NONE (interface-based)
│   │   Used By: middleware/auth.ts, routes
│   │   ⚠️ Issue: Eager initialization bug
│   │
│   ├─→ server/lib/storage/factory.ts
│   │   Dependencies: schema.ts (Drizzle tables)
│   │   Used By: routes
│   │   🔧 Existing skill invocations (lines 216-228):
│   │       1. type-safe-queries (decision)
│   │       2. drizzle-orm-setup OR supabase-storage
│   │       3. storage-factory-validation
│   │   ⚠️ Issue: Eager initialization bug
│   │
│   ├─→ server/routes/*.ts
│   │   Dependencies: contracts, storage, authMiddleware
│   │   Used By: server/index.ts
│   │   ⚠️ Issue: Module loading order (dotenv vs factory imports)
│   │
│   └─→ server/index.ts
│       Dependencies: routes, dotenv
│       ⚠️ Issue: Import order affects factory initialization
│
├─→ 2.3 Frontend Specification
│   ├─→ client/src/lib/api-client.ts
│   │   Dependencies: contracts
│   │   Used By: pages, AuthContext
│   │
│   ├─→ client/src/contexts/AuthContext.tsx
│   │   Dependencies: api-client, auth-helpers
│   │   Used By: App.tsx, pages
│   │
│   └─→ client/src/components/auth/ProtectedRoute.tsx
│       Dependencies: AuthContext
│       Used By: App.tsx
│
├─→ 2.4 Frontend Implementation
│   ├─→ Design System (design-tokens.ts, globals.css)
│   │   Dependencies: NONE
│   │   Used By: All pages
│   │
│   ├─→ client/src/App.tsx
│   │   Dependencies: AuthContext, ProtectedRoute, all pages
│   │   Used By: main.tsx
│   │
│   ├─→ client/src/components/layout/AppLayout.tsx
│   │   Dependencies: AuthContext
│   │   Used By: All pages
│   │
│   └─→ client/src/pages/*.tsx
│       Dependencies: api-client, AppLayout, schema.zod.ts (constraints)
│       Used By: App.tsx
│       ⚠️ Issue: Schema-frontend mismatches (Fizzcard Issue #1)
│
└─→ 2.5 Environment Configuration
    ├─→ .env
    └─→ vite.config.ts

Stage 3: Validate
└─→ Type check, lint, build test
    ⚠️ Issue: Only validates dev, not production (Fizzcard Issue #5)

Stage 4: Integration Check
└─→ Verify all pages use apiClient
```

---

## Critical Dependency Chains

### Chain 1: Schema → Storage → Routes → Pages

```
schema.zod.ts
    ↓
schema.ts (Drizzle)
    ↓
storage/factory.ts
    ↓
routes/*.ts
    ↓
api-client.ts
    ↓
pages/*.tsx
```

**Critical Teaching Points**:
1. **BEFORE schema.ts**: Teach Drizzle automatic conversion (drizzle-orm-setup)
2. **BEFORE storage/factory.ts**: Teach lazy initialization (factory-lazy-init)
3. **BEFORE routes/*.ts**: Teach dotenv import order (module-loading-validator)
4. **BEFORE pages/*.tsx**: Teach schema constraints (schema-query-validator)

---

### Chain 2: Auth Flow → Protected Routes → Pages

```
auth/factory.ts
    ↓
middleware/auth.ts
    ↓
routes/*.ts (protected)
    ↓
api-client.ts (auth headers)
    ↓
AuthContext.tsx
    ↓
ProtectedRoute.tsx
    ↓
App.tsx
    ↓
pages/*.tsx (protected)
```

**Critical Teaching Points**:
1. **BEFORE auth/factory.ts**: Teach lazy initialization (factory-lazy-init)
2. **BEFORE api-client.ts**: Teach getter property pattern (ts-rest v3 requirement)
3. **BEFORE AuthContext**: Teach auth helpers usage

---

### Chain 3: Contracts → Routes → API Client → Pages

```
schema.zod.ts
    ↓
contracts/*.contract.ts
    ↓
routes/*.ts (implements contracts)
    ↓
api-client.ts (uses contracts)
    ↓
pages/*.tsx (calls api-client)
```

**Critical Teaching Points**:
1. **BEFORE contracts**: Teach ts-rest patterns
2. **BEFORE pages**: Teach contract compliance (schema-query-validator)

---

## Proactive Teaching: BEFORE Invocation Points

### Stage 2.1: Backend Specification

#### BEFORE schema.zod.ts
**Skill**: NONE (first file, pure Zod schemas)

**Agent Task**: Create Zod schemas from plan.md
- Include users table (ALWAYS)
- Add query parameter schemas with constraints (max, min, regex)
- Export both table schemas and insert schemas

**Success Criteria**: schema.zod.ts is single source of truth

---

#### BEFORE contracts/*.contract.ts
**Skill**: NONE (straightforward ts-rest patterns)

**Agent Task**: Create ts-rest contracts from schema.zod.ts
- Import schemas from schema.zod.ts
- Define CRUD operations (GET, POST, PUT, DELETE)
- Add query parameter types

**Success Criteria**: Contracts match schema.zod.ts exactly

---

### Stage 2.2: Backend Implementation

#### BEFORE shared/schema.ts (Drizzle)

**🔧 Skill Invocation**: `drizzle-orm-setup`

**Purpose**: Teach automatic snake_case ↔ camelCase conversion

**What Agent Learns**:
1. Create Drizzle client in `server/lib/db.ts`
2. Use Drizzle client for ALL queries (not PostgREST)
3. Automatic conversion: `createdAt` (code) ↔ `created_at` (database)
4. No manual conversion helpers needed

**Agent Task**: Convert schema.zod.ts to Drizzle schema
- Map Zod types to Drizzle types
- Add foreign keys
- Create `server/lib/db.ts` with Drizzle client

**Success Criteria**:
- schema.ts matches schema.zod.ts field names
- Drizzle client exists and is used

**Pipeline Location**: Line 116 (EXISTING invocation)

---

#### BEFORE server/lib/auth/factory.ts

**🆕 Skill Invocation**: `factory-lazy-init`

**Purpose**: Teach lazy Proxy pattern to prevent eager initialization

**What Agent Learns**:
1. ❌ BAD: `export const auth = createAuth()` (runs immediately)
2. ✅ GOOD: `export const auth = new Proxy(...)` (runs on first access)
3. Why: Module hoisting causes factory to run BEFORE dotenv loads
4. Result: `process.env.AUTH_MODE` is undefined → always uses mock

**Agent Task**: Generate auth factory with lazy initialization
- Use Proxy pattern for delayed initialization
- Factory only runs when first accessed
- Ensures dotenv loads first

**Success Criteria**:
- No eager `createAuth()` call at module level
- Proxy pattern implemented correctly

**Pipeline Location**: NEW (add to line ~150, BEFORE auth factory generation)

---

#### BEFORE server/lib/storage/factory.ts

**🔧 Skill Invocation Sequence** (EXISTING, lines 216-228):
1. `type-safe-queries` (decision helper)
2. `drizzle-orm-setup` OR `supabase-storage` (based on decision)
3. **🆕 `factory-lazy-init`** (ADD THIS)
4. `storage-factory-validation` (existing)

**Purpose**:
- Decide Drizzle vs PostgREST
- Teach correct implementation pattern
- **NEW**: Teach lazy initialization
- Validate contract compliance

**What Agent Learns**:
1. Decision: RLS needed? → PostgREST. Otherwise → Drizzle
2. Implementation: Correct query patterns
3. **NEW**: Lazy Proxy pattern (same as auth factory)
4. Validation: Memory and Database return same shapes

**Agent Task**: Generate storage factory
- Use lazy Proxy pattern
- Implement IStorage interface
- Create MemoryStorage and DatabaseStorage

**Success Criteria**:
- Lazy initialization implemented
- All IStorage methods return same object shapes
- No snake_case leaks

**Pipeline Location**: Lines 216-228 (UPDATE to add factory-lazy-init)

---

#### BEFORE server/routes/*.ts

**🆕 Skill Invocation**: `module-loading-validator`

**Purpose**: Teach correct import order in server/index.ts

**What Agent Learns**:
1. ✅ CORRECT:
   ```typescript
   import 'dotenv/config';  // FIRST
   import authRoutes from './routes/auth';
   import apiRoutes from './routes';
   ```

2. ❌ WRONG:
   ```typescript
   import authRoutes from './routes/auth';  // Imports factory
   import 'dotenv/config';  // Too late!
   ```

3. Why: Routes import storage/auth factories
   - If dotenv not loaded first → factories see undefined env vars
   - Even with lazy Proxy, first access might happen before dotenv loads if import order wrong

**Agent Task**: Generate routes with proper imports
- Ensure server/index.ts loads dotenv first
- Routes can safely import factories
- Auth middleware applied to protected routes

**Success Criteria**:
- dotenv imported BEFORE any route imports
- All protected routes use authMiddleware()

**Pipeline Location**: NEW (add BEFORE routes generation, around line 310)

---

### Stage 2.3: Frontend Specification

#### BEFORE client/src/lib/api-client.ts

**Skill**: NONE (pattern is well-documented in pipeline-prompt.md lines 386-405)

**Agent Task**: Generate type-safe API client
- Use ts-rest initClient
- **CRITICAL**: Use getter property for Authorization header (ts-rest v3)
- Import contracts for type safety

**Success Criteria**:
- Uses getter property (NOT function) for dynamic headers
- Auth token automatically injected from localStorage

---

#### BEFORE client/src/contexts/AuthContext.tsx

**Skill**: NONE (pattern is well-documented in pipeline-prompt.md lines 439-500)

**Agent Task**: Generate auth context
- Use auth-helpers for token management
- Direct fetch for auth endpoints (not apiClient - no token yet)
- Set token in localStorage after login

**Success Criteria**:
- Login/signup/logout implemented
- Token persists across page refresh

---

### Stage 2.4: Frontend Implementation

#### BEFORE client/src/pages/*.tsx

**🆕 Skill Invocation**: `schema-query-validator`

**Purpose**: Teach schema constraints BEFORE generating pages

**What Agent Learns**:
1. Read schema.zod.ts to extract constraints:
   ```typescript
   leaderboardQuerySchema = z.object({
     limit: z.number().max(50),  // ← IMPORTANT
     sort: z.enum(['points', 'timestamp'])
   });
   ```

2. Respect these constraints in frontend:
   ```typescript
   // ✅ CORRECT
   useQuery(() => api.getLeaderboard({ limit: 50 }));

   // ❌ WRONG
   useQuery(() => api.getLeaderboard({ limit: 100 }));  // Exceeds max!
   ```

3. Check contract definitions for required vs optional params
4. Use AppLayout wrapper for all pages
5. Use apiClient (not fetch, not mock data)

**Agent Task**: Generate frontend pages
- Fetch data using apiClient
- Query params respect schema constraints
- Use AppLayout wrapper
- Proper loading/error states

**Success Criteria**:
- All hardcoded limits ≤ schema max values
- All enum values exist in schema
- No placeholder/mock data

**Pipeline Location**: NEW (add BEFORE pages generation, around line 660)

---

### Stage 3: Validate

#### BEFORE npm run build (production build)

**🆕 Skill Invocation**: `production-smoke-test`

**Purpose**: Validate production build and deployment

**What Agent Learns**:
1. Production paths differ from dev paths
   ```typescript
   // ❌ WRONG in production
   const clientDist = path.join(__dirname, '../client/dist');

   // ✅ CORRECT
   const clientDist = path.join(__dirname, '../../client/dist');
   ```

2. Test in Docker container (simulates Fly.io)
3. Verify static files serve correctly
4. Verify API endpoints respond
5. Verify auth flow works

**Agent Task**: No generation, just validation
- Build app in production mode
- Start in Docker container
- Run smoke tests
- Report failures

**Success Criteria**:
- Production build succeeds
- Server starts in Docker
- Static files serve
- API responds
- Auth flow works

**Pipeline Location**: NEW (add AFTER Stage 3 validation, BEFORE marking complete)

---

## Proactive Teaching: AFTER Validation Points

### After schema.ts generation

**Validation**: `drizzle-orm-setup` skill (EXISTING)

**What to Check**:
- ✅ `server/lib/db.ts` exists with Drizzle client
- ✅ Storage methods use Drizzle client (not PostgREST)
- ✅ No manual conversion helpers (automatic snake_case)

---

### After storage/factory.ts generation

**Validation**: `storage-factory-validation` skill (EXISTING)

**What to Check**:
- ✅ MemoryStorage and DatabaseStorage return same object shapes
- ✅ Property names match (case-sensitive)
- ✅ No snake_case leaks (created_at vs createdAt)

---

### After routes/*.ts generation

**Validation**: `module-loading-validator` skill (NEW)

**What to Check**:
- ✅ `server/index.ts` imports `dotenv/config` FIRST
- ✅ No factory imports before dotenv
- ✅ Protected routes use authMiddleware()

---

### After pages/*.tsx generation

**Validation**: `schema-query-validator` skill (NEW)

**What to Check**:
- ✅ All query params respect schema max/min constraints
- ✅ All enum values exist in schema
- ✅ No placeholder/mock data
- ✅ All pages use apiClient (not fetch)

---

### After all generation (before complete)

**Validation**: `production-smoke-test` skill (NEW)

**What to Check**:
- ✅ Production build succeeds
- ✅ Server starts in Docker without errors
- ✅ Static files serve correctly
- ✅ API endpoints respond
- ✅ Auth flow works end-to-end

---

## Just-in-Time Skill Invocation Mechanism

### Design Question: How Does Agent Know When to Invoke Skills?

**Option 1: Hardcoded in Pipeline Prompt** ⭐ RECOMMENDED

**Approach**: Update pipeline-prompt.md with explicit skill invocation instructions

**Example**:
```markdown
### 2.2.1 Drizzle Schema (`shared/schema.ts`)

**🔧 BEFORE GENERATING THIS FILE**: Invoke the `drizzle-orm-setup` skill

The skill will teach you:
- How to create Drizzle client in server/lib/db.ts
- Automatic snake_case ↔ camelCase conversion
- Anti-patterns to avoid

**After learning from skill**, generate:
1. shared/schema.ts (Drizzle schema)
2. server/lib/db.ts (Drizzle client)

**AFTER GENERATING**: Validate with drizzle-orm-setup validation script
```

**Pros**:
- ✅ Simple: Agent reads prompt, sees skill invocation instruction
- ✅ Reliable: Explicit, not inferred
- ✅ Maintainable: Skills live in .claude/skills/, invocations in prompt

**Cons**:
- ❌ Requires updating pipeline-prompt.md (50+ lines)
- ❌ Skills and prompt must stay in sync

---

**Option 2: Auto-Detection via Skill Metadata**

**Approach**: Skills declare trigger patterns in frontmatter

**Example**:
```markdown
---
name: schema-query-validator
triggers:
  - before: "client/src/pages/*.tsx"
  - pattern: "useQuery|useMutation"
---
```

**Agent Logic**:
```
IF about to generate client/src/pages/*.tsx:
  1. Check .claude/skills/ for triggers matching this file pattern
  2. Invoke matching skills
  3. Generate file with learned knowledge
```

**Pros**:
- ✅ Skills are self-contained
- ✅ No pipeline prompt changes needed
- ✅ Auto-discovers new skills

**Cons**:
- ❌ Complex: Agent needs trigger detection logic
- ❌ Less explicit: Harder to debug
- ❌ Not supported by Claude Skills spec (custom extension)

---

**Option 3: Hybrid: Skills Registry**

**Approach**: Create `.claude/skills/REGISTRY.md` mapping pipeline stages to skills

**Example**:
```markdown
# Skills Registry

## Pipeline Stage: Backend Implementation → Drizzle Schema

**BEFORE generating**: `shared/schema.ts`

**Invoke skills**:
1. `drizzle-orm-setup` (MANDATORY)

**What agent will learn**:
- Drizzle client creation
- Automatic conversion patterns

**Validation AFTER**:
- Run drizzle-orm-setup validation script

---

## Pipeline Stage: Frontend Implementation → Pages

**BEFORE generating**: `client/src/pages/*.tsx`

**Invoke skills**:
1. `schema-query-validator` (MANDATORY)

**What agent will learn**:
- Schema constraints (max, min, enum)
- Contract requirements

**Validation AFTER**:
- Run schema-query-validator validation script
```

**Pros**:
- ✅ Centralized: All mappings in one place
- ✅ Explicit: Clear pipeline stage → skill mapping
- ✅ Maintainable: Update registry, not scattered prompt

**Cons**:
- ❌ Extra file to maintain
- ❌ Agent must read registry before each stage

---

### RECOMMENDATION: Option 1 (Hardcoded in Pipeline Prompt)

**Reasoning**:
1. **Simplest**: Agent already reads pipeline-prompt.md
2. **Most Explicit**: No ambiguity about when to invoke
3. **Most Reliable**: Works with current Claude Skills implementation
4. **Best DX**: Developer reads prompt, sees skills, understands flow

**Implementation**:
1. Update pipeline-prompt.md with skill invocation instructions (50 lines)
2. Add `🔧 BEFORE GENERATING` and `✅ AFTER VALIDATION` markers
3. Test with fresh app generation

**Timeline**: 2-4 hours to update pipeline-prompt.md

---

## Modified Recommendations (Proactive Approach)

### Update to Recommendation 1: Skill Scopes

**OLD**: Add scope markers to SKILL.md

**NEW**: Add BEFORE/AFTER markers to SKILL.md

**Proposed Format**:
```markdown
---
name: schema-query-validator
category: validation
priority: P0
---

## When to Invoke (Proactive)

**🔧 BEFORE**: Generating `client/src/pages/*.tsx`

**Purpose**: Teach agent schema constraints BEFORE writing query code

**What Agent Will Learn**:
1. Max/min constraints from schema.zod.ts
2. Enum valid values
3. Required vs optional params

## What Agent Should Do

After learning from this skill:
1. Read shared/schema.zod.ts for constraints
2. Generate pages respecting those constraints
3. Use apiClient for all data fetching

## Validation (Reactive)

**✅ AFTER**: Generating all pages

**Purpose**: Confirm all pages respect schema constraints

**Validation Script**: `scripts/validate-schema-queries.py`

**Pass Criteria**:
- All hardcoded limits ≤ schema max values
- All enum values exist in schema
- No placeholder/mock data
```

---

### Update to Recommendation 2: Implementation Priority

**OLD**: Phase 1 (Week 1-2) - Create 3 P0 skills

**NEW**: Phase 1 (Week 1-2) - Create 3 P0 skills + Update Pipeline Prompt

**Tasks**:
1. ✅ Create `schema-query-validator` skill with BEFORE/AFTER sections
2. ✅ Create `factory-lazy-init` skill with BEFORE/AFTER sections
3. ✅ Create `production-smoke-test` skill with BEFORE/AFTER sections
4. ✅ **UPDATE pipeline-prompt.md** with skill invocation points (NEW)
   - Add 🔧 BEFORE markers at lines ~150, ~310, ~660
   - Add ✅ AFTER markers at validation checkpoints
   - Update existing drizzle-orm-setup invocation (line 116)

**Estimated Effort**:
- Skills creation: 8-12 hours (each skill: validation script + SKILL.md)
- Pipeline prompt update: 2-4 hours (50 lines of invocation instructions)
- Testing: 4-6 hours (fresh app generation to verify)
- **Total**: 14-22 hours (~2-3 days)

---

### Update to Recommendation 4: Skill Invocation Matrix

**NEW FORMAT**: BEFORE → GENERATE → AFTER

| Pipeline Stage | File(s) Generated | BEFORE Skills | AFTER Validation | Issue Prevented |
|----------------|-------------------|---------------|------------------|-----------------|
| 2.1.1 | schema.zod.ts | NONE | NONE | - |
| 2.1.2 | contracts/*.contract.ts | NONE | NONE | - |
| 2.2.1 | schema.ts, server/lib/db.ts | drizzle-orm-setup ✅ | drizzle-orm-setup validation ✅ | Schema exists but not used |
| 2.2.2 | server/lib/auth/factory.ts | factory-lazy-init 🆕 | module-loading-validator 🆕 | Eager initialization |
| 2.2.3 | server/lib/storage/factory.ts | type-safe-queries ✅<br>drizzle-orm-setup OR supabase-storage ✅<br>factory-lazy-init 🆕 | storage-factory-validation ✅ | Eager initialization<br>Contract violations |
| 2.2.4 | server/routes/*.ts | module-loading-validator 🆕 | module-loading-validator validation 🆕 | Import order bugs |
| 2.3.1 | client/src/lib/api-client.ts | NONE | NONE | - |
| 2.3.2 | client/src/contexts/AuthContext.tsx | NONE | NONE | - |
| 2.4.4 | client/src/pages/*.tsx | schema-query-validator 🆕 | schema-query-validator validation 🆕 | Schema-frontend mismatch (Fizzcard #1) |
| 3.0 | Production build | NONE | production-smoke-test 🆕 | Production deployment failures (Fizzcard #5) |

**Legend**:
- ✅ Existing skill
- 🆕 New skill from retro-implementation.md

---

## Example: Proactive Teaching in Action

### Scenario: Generating LeaderboardPage.tsx (Fizzcard Issue #1)

#### Step 1: Agent Reads Pipeline Prompt (Before Generation)

```markdown
### 2.4.4 Page Structure Pattern

**🔧 BEFORE GENERATING client/src/pages/*.tsx**:

Invoke the `schema-query-validator` skill to learn schema constraints.

The skill will teach you:
1. Max/min limits for query parameters
2. Valid enum values
3. Required vs optional params

**After learning from skill**, generate pages that:
- Respect schema constraints
- Use apiClient for data fetching
- No placeholder/mock data
```

#### Step 2: Agent Invokes Skill

```python
# Agent executes skill: schema-query-validator
skill.run(app_path="/Users/labheshpatel/apps/app-factory/apps/fizzcard/app")

# Skill output:
"""
📋 Schema Constraints Extracted from shared/schema.zod.ts:

leaderboardQuerySchema (line 42):
  - limit: max 50 (z.number().max(50))
  - sort: enum ['points', 'timestamp']

createGameSchema (line 58):
  - name: max length 100 (z.string().max(100))
  - mode: enum ['rapid', 'custom', 'campaign']

INSTRUCTIONS:
✅ When calling api.getLeaderboard(), use limit ≤ 50
✅ When calling api.createGame(), ensure name.length ≤ 100
✅ Use enum values from schema, don't hardcode
"""
```

#### Step 3: Agent Generates Page (With Knowledge)

```typescript
// client/src/pages/LeaderboardPage.tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function LeaderboardPage() {
  // Agent KNOWS limit must be ≤ 50 (learned from skill)
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiClient.leaderboard.getLeaderboard({
      query: { limit: 50 }  // ✅ CORRECT on first try!
    })
  });

  // ... rest of page
}
```

#### Step 4: Validation Confirms (After Generation)

```python
# After all pages generated, validate
skill.validate(app_path="/Users/labheshpatel/apps/app-factory/apps/fizzcard/app")

# Validation output:
"""
✅ PASS: LeaderboardPage.tsx - limit: 50 (within max: 50)
✅ PASS: CreateGamePage.tsx - name field max length 100
✅ PASS: CreateGamePage.tsx - mode enum values match schema

ALL CHECKS PASSED: 0 schema violations found
"""
```

**Result**:
- ✅ Correct code on first generation
- ✅ Zero iterations needed
- ✅ No 500 error on first page load
- ✅ Validation is confirmation, not error detection

---

### Comparison: Reactive vs Proactive

| Aspect | Reactive (OLD) | Proactive (NEW) |
|--------|---------------|----------------|
| **When skill runs** | AFTER generation | BEFORE generation |
| **Purpose** | Detect errors | Teach patterns |
| **Agent state** | Made mistake, fixing | Learning, generating correctly |
| **Iterations** | 2-5 (generate → fix → fix → ...) | 1 (generate correctly) |
| **Token cost** | HIGH (multiple generations) | LOW (one generation) |
| **Validation role** | Error detection | Confirmation |
| **Confidence** | Low (may still have bugs) | High (learned correct pattern) |
| **Time to complete** | 10-20 minutes (iterations) | 3-5 minutes (one pass) |

**Cost Savings** (Fizzcard example):
- **Reactive**: 3 iterations × 5000 tokens = 15,000 tokens
- **Proactive**: 1 iteration × 5000 tokens = 5,000 tokens
- **Savings**: 67% fewer tokens

---

## Pipeline Prompt Update Locations

### Lines to Update in pipeline-prompt.md

#### Update 1: Line 116 (EXISTING - Enhance)

**CURRENT**:
```markdown
**🔧 SKILLS INTEGRATION**: After creating the Drizzle schema, you MUST also set up Drizzle for runtime queries. Invoke the **`drizzle-orm-setup` skill** to ensure proper configuration.
```

**UPDATE TO**:
```markdown
**🔧 BEFORE GENERATING** `shared/schema.ts` and `server/lib/db.ts`:

**Invoke**: `drizzle-orm-setup` skill (MANDATORY)

**What you will learn**:
1. Drizzle client creation pattern
2. Automatic snake_case ↔ camelCase conversion
3. Anti-patterns to avoid

**After learning**, generate:
1. shared/schema.ts (Drizzle tables matching schema.zod.ts)
2. server/lib/db.ts (Drizzle client instance)

**✅ AFTER GENERATING**: Run drizzle-orm-setup validation to confirm Drizzle is used for queries.
```

---

#### Update 2: Line ~150 (NEW - Add)

**INSERT AFTER** "File: `server/lib/auth/factory.ts`" (line 124):

```markdown
**🔧 BEFORE GENERATING** `server/lib/auth/factory.ts`:

**Invoke**: `factory-lazy-init` skill (MANDATORY)

**What you will learn**:
1. Why eager initialization fails (runs before dotenv)
2. Lazy Proxy pattern for delayed initialization
3. Correct: `export const auth = new Proxy(...)`
4. Incorrect: `export const auth = createAuth()`

**After learning**, generate:
- server/lib/auth/factory.ts with lazy Proxy pattern
- server/lib/auth/mock-adapter.ts
- server/lib/auth/supabase-adapter.ts
```

---

#### Update 3: Line 216-228 (EXISTING - Enhance)

**CURRENT**:
```markdown
**🔧 SKILLS INTEGRATION - CRITICAL DECISION POINT**:

Before implementing storage, you MUST decide which query method to use:

1. **Invoke `type-safe-queries` skill** to decide between Drizzle ORM and PostgREST
2. **Then invoke EITHER**:
   - `drizzle-orm-setup` skill (RECOMMENDED for server-only apps)
   - `supabase-storage` skill (ONLY if you need RLS)
3. **Finally invoke `storage-factory-validation` skill** to verify IStorage contract compliance
```

**UPDATE TO**:
```markdown
**🔧 BEFORE GENERATING** `server/lib/storage/factory.ts` and storage implementations:

**Invoke skills in this order** (ALL MANDATORY):
1. `type-safe-queries` skill - Decide Drizzle ORM vs PostgREST
2. `drizzle-orm-setup` OR `supabase-storage` skill - Learn implementation patterns
3. **`factory-lazy-init` skill** - Learn lazy Proxy pattern (CRITICAL)
4. `storage-factory-validation` skill - Understand contract requirements

**What you will learn**:
- Which query method to use (Drizzle recommended for server-only)
- Correct implementation patterns (automatic conversion, query syntax)
- Lazy initialization to prevent environment variable bugs
- IStorage contract compliance rules

**After learning**, generate:
- server/lib/storage/factory.ts (with lazy Proxy)
- server/lib/storage/mem-storage.ts
- server/lib/storage/supabase-storage.ts OR database-storage.ts

**✅ AFTER GENERATING**: Run storage-factory-validation to confirm contract compliance.
```

---

#### Update 4: Line ~310 (NEW - Add)

**INSERT BEFORE** "File: `server/routes/auth.ts`" (line 278):

```markdown
**🔧 BEFORE GENERATING** `server/routes/*.ts` and `server/index.ts`:

**Invoke**: `module-loading-validator` skill (MANDATORY)

**What you will learn**:
1. Correct import order in server/index.ts
2. Why: dotenv MUST load BEFORE route imports
3. Routes import factories → factories read process.env
4. If dotenv not first → process.env.AUTH_MODE undefined → always mock mode

**Correct pattern**:
```typescript
// server/index.ts
import 'dotenv/config';  // ✅ FIRST
import authRoutes from './routes/auth';
import apiRoutes from './routes';
```

**Incorrect pattern**:
```typescript
// server/index.ts
import authRoutes from './routes/auth';  // ❌ Imports factory too early
import 'dotenv/config';  // Too late!
```

**After learning**, generate:
- server/index.ts (dotenv first, then routes)
- server/routes/auth.ts
- server/routes.ts (resource routes)
- server/middleware/auth.ts
```

---

#### Update 5: Line ~660 (NEW - Add)

**INSERT BEFORE** "Every page should follow this structure" (line 661):

```markdown
**🔧 BEFORE GENERATING** `client/src/pages/*.tsx` files:

**Invoke**: `schema-query-validator` skill (MANDATORY)

**What you will learn**:
1. Max/min constraints from schema.zod.ts (e.g., limit: max 50)
2. Valid enum values (e.g., sort: ['points', 'timestamp'])
3. Required vs optional query parameters
4. Contract requirements from shared/contracts/

**Critical**: Extract constraints from schema.zod.ts BEFORE writing query code.

**Example**:
```typescript
// schema.zod.ts defines:
// leaderboardQuerySchema = z.object({ limit: z.number().max(50) })

// Therefore, in LeaderboardPage.tsx:
useQuery(() => apiClient.leaderboard.get({ query: { limit: 50 } }))  // ✅
NOT: useQuery(() => apiClient.leaderboard.get({ query: { limit: 100 } }))  // ❌
```

**After learning**, generate pages that:
- Respect schema max/min constraints
- Use valid enum values from schema
- Use apiClient for all data fetching (NOT fetch, NO mock data)
- Use AppLayout wrapper
- Include loading/error states
```

---

#### Update 6: Line ~800 (NEW - Add)

**INSERT AFTER** "## Stage 3: Validate" (line 800):

```markdown
**🔧 BEFORE COMPLETING** the application:

**Invoke**: `production-smoke-test` skill (MANDATORY)

**What you will learn**:
1. Production build issues (path resolution, TypeScript compilation)
2. Docker container failures (environment variables, port binding)
3. Static file serving problems
4. API endpoint accessibility
5. Auth flow end-to-end testing

**Tests to run**:
1. `npm run build` (production TypeScript compilation)
2. Start in Docker container (simulates Fly.io deployment)
3. GET / (static files serve)
4. GET /health (API responds)
5. POST /api/auth/login → POST /api/resource (auth flow)

**Common production issues**:
```typescript
// ❌ WRONG: Fails in production (TypeScript compiles to dist/)
const clientDist = path.join(__dirname, '../client/dist');

// ✅ CORRECT: Works in production
const clientDist = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');
```

**If smoke test fails**: Fix issues BEFORE marking app as complete.

**✅ Success Criteria**: All smoke tests pass, app works in production mode.
```

---

## System Architecture: Ratcheting Down Quality

### The Ratchet Mechanism

**Goal**: Each stage "locks in" quality, preventing regression

```
Plan → Schema Design → Backend Impl → Frontend Impl → Production Validation
  ↓         ↓               ↓               ↓                ↓
  ✅        ✅              ✅              ✅               ✅
  │         │               │               │                │
  └─────────┴───────────────┴───────────────┴────────────────┘
                    Cannot proceed if ANY ✅ fails
```

**Ratchet Points** (Quality Gates):

1. **After Plan**: Valid data model, user stories defined
2. **After schema.zod.ts**: Single source of truth exists
3. **After schema.ts**: Drizzle client exists and is used (drizzle-orm-setup validation)
4. **After storage factory**: Implementations match contract (storage-factory-validation)
5. **After routes**: Dotenv loads first (module-loading-validator)
6. **After pages**: Schema constraints respected (schema-query-validator)
7. **After build**: Production deployment works (production-smoke-test)

**If ANY ratchet fails**: STOP, fix, re-validate, THEN proceed

---

### Failure Modes and Recovery

#### Failure Mode 1: Skill Teaches, Agent Ignores

**Symptom**: Agent invokes skill but generates incorrect code anyway

**Detection**: AFTER validation catches the error

**Recovery**:
1. Re-invoke skill (show learning again)
2. Show specific violation: "You learned X, but generated Y"
3. Agent fixes code
4. Re-validate

**Prevention**: Make skill output more explicit (code examples, anti-patterns)

---

#### Failure Mode 2: Skill Doesn't Exist Yet

**Symptom**: Pipeline prompt says "invoke X skill" but .claude/skills/X/ doesn't exist

**Detection**: Skill invocation fails (file not found)

**Recovery**:
1. Skip skill invocation (graceful degradation)
2. Proceed with generation
3. AFTER validation will catch errors (falls back to reactive mode)

**Prevention**: Implement P0 skills first (schema-query-validator, factory-lazy-init, production-smoke-test)

---

#### Failure Mode 3: Validation Script Fails

**Symptom**: Skill invoked, code generated, validation script errors out

**Detection**: Python/TypeScript error in validation script

**Recovery**:
1. Log error
2. Skip validation (proceed with warning)
3. Manual review required

**Prevention**: Test validation scripts on multiple apps before deployment

---

## Robustness Guarantees

### Level 1: Development Mode (Mock + Memory)

**Guarantee**: App runs immediately with `npm install && npm run dev`

**Enforced By**:
- Plan stage: Always include users table
- Auth factory: Mock adapter always works
- Storage factory: Memory storage always works
- Lazy initialization: Factories work even if env vars missing

**Failure Rate**: <5% (only TypeScript/build errors)

---

### Level 2: Frontend-Backend Integration

**Guarantee**: Frontend respects backend contracts

**Enforced By**:
- `schema-query-validator` BEFORE pages generation
- Validation AFTER pages confirms compliance
- Zero placeholder/mock data (all pages use apiClient)

**Failure Rate**: <10% (was 55% in Fizzcard - limits mismatch, mock data)

---

### Level 3: Production Deployment

**Guarantee**: App works in Fly.io/Docker without modification

**Enforced By**:
- `factory-lazy-init` prevents environment variable bugs
- `module-loading-validator` prevents import order bugs
- `production-smoke-test` catches path/build issues BEFORE deployment

**Failure Rate**: <15% (was 100% in Fizzcard - 400+ errors on first deploy)

---

### Level 4: Long-Term Maintainability

**Guarantee**: Code follows best practices, easy to modify

**Enforced By**:
- Factory pattern (easy environment switching)
- Single source of truth (schema.zod.ts)
- Type safety (Zod → Drizzle → ts-rest → React)
- Validation scripts (catch regressions)

**Failure Rate**: <5% (skill-guided generation produces maintainable code)

---

## Success Metrics (Updated)

### Current State (Reactive Validation Only)

**App Functionality**:
- First generation success: 60%
- Manual fixes required: 10+ hours per app
- Integration bugs: ~12 per app
- Production deployment success: 0% (Fizzcard: 400+ errors)

**Development Velocity**:
- Time to first working app: 2-3 days
- Iterations per component: 3-5
- Token cost per app: 500K-800K tokens

---

### Target State (Proactive Teaching + Reactive Validation)

**App Functionality**:
- First generation success: 95% ⬆️ +35%
- Manual fixes required: <1 hour per app ⬇️ 90% reduction
- Integration bugs: <2 per app ⬇️ 83% reduction
- Production deployment success: 90% ⬆️ from 0% to 90%

**Development Velocity**:
- Time to first working app: 4-6 hours ⬇️ 75% reduction
- Iterations per component: 1-2 ⬇️ 60% reduction
- Token cost per app: 200K-300K tokens ⬇️ 60% reduction

**Quality Improvements**:
- Schema-frontend mismatches: 0 (was 1-2 per app)
- Factory initialization bugs: 0 (was 1 per app)
- Production build failures: <1 (was 1 per app)
- Import order bugs: 0 (was 0-1 per app)

---

## Implementation Roadmap (Revised)

### Phase 1: P0 Skills + Pipeline Updates (Week 1-2)

**Deliverables**:
1. ✅ `schema-query-validator` skill
   - SKILL.md with BEFORE/AFTER sections
   - Python validation script
   - Test on 2-3 existing apps

2. ✅ `factory-lazy-init` skill
   - SKILL.md with BEFORE/AFTER sections
   - Lazy Proxy pattern templates
   - Detection + fix logic

3. ✅ `production-smoke-test` skill
   - SKILL.md with BEFORE/AFTER sections
   - Docker smoke test suite
   - Path resolution fixes

4. ✅ **UPDATE pipeline-prompt.md**
   - 6 new sections with 🔧 BEFORE and ✅ AFTER markers
   - ~50 lines of skill invocation instructions
   - Examples and anti-patterns

5. ✅ **TEST on fresh app generation**
   - Generate 2 apps with new proactive approach
   - Measure: iterations, bugs, time to complete
   - Compare vs reactive baseline

**Effort**: 14-22 hours (~2-3 days)

**Success Criteria**:
- All 3 P0 skills exist and have validation scripts
- Pipeline prompt has skill invocations at 6 points
- Test app generated with <2 iterations per component

---

### Phase 2: P1 Skill + Refinements (Week 3-4)

**Deliverables**:
1. ✅ `module-loading-validator` skill
2. ✅ Update existing skills with BEFORE/AFTER format
3. ✅ Create Skills Registry (optional)
4. ✅ Measure success metrics on 3-5 apps

**Effort**: 10-15 hours

---

### Phase 3: Optimization (Week 5-6)

**Deliverables**:
1. ✅ `query-optimizer` skill (P2)
2. ✅ Complete or deprecate `supabase-full-stack` skill
3. ✅ Add validation scripts to all skills
4. ✅ Documentation and examples

**Effort**: 8-12 hours

---

## Conclusion (Updated with Proactive Approach)

### Original Finding

Existing skills focus on **implementation guidance**, not **validation**.
Proposed skills from retro-implementation.md fill the **validation gap**.

### New Finding (Proactive Architecture)

**Paradigm shift required**: Move from **reactive** (generate → validate → fix) to **proactive** (teach → generate correctly → confirm).

**Key Insight**: Skills should run BEFORE generation to teach patterns, not AFTER to catch errors.

**Impact**:
- 67% fewer tokens (1 iteration vs 3-5)
- 75% faster time to completion (hours vs days)
- 83% fewer bugs (2 vs 12 per app)
- 90% production deployment success (vs 0%)

### Implementation Strategy

**Short-term** (Weeks 1-2):
1. Create 3 P0 skills (schema-query-validator, factory-lazy-init, production-smoke-test)
2. Update pipeline-prompt.md with BEFORE/AFTER invocation points
3. Test on 2-3 fresh app generations

**Medium-term** (Weeks 3-6):
1. Create P1 skill (module-loading-validator)
2. Refine based on metrics
3. Add P2 optimization skill

**Success Metrics**:
- First generation success: 60% → 95%
- Manual fixes: 10+ hrs → <1 hr
- Token cost: 500K-800K → 200K-300K
- Production success: 0% → 90%

**Confidence**: VERY HIGH
- Proactive teaching is fundamentally better than reactive validation
- Skills are complementary and well-scoped
- Pipeline updates are straightforward (~50 lines)
- Phased approach reduces risk
