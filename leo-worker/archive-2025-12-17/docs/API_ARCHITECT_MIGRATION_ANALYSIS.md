# API Architect Subagent → Skill Migration Analysis

## Pre-Migration Analysis (Required Before Migration)

Following the playbook in [SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md](SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md)

---

## 1. Step Back and Understand Purpose

### Core Responsibility
**api_architect** designs RESTful APIs with proper contracts and authentication.

### What It Does
1. **Creates ts-rest contracts** (`shared/contracts/*.contract.ts`)
   - Type-safe API specifications
   - Import types from schema.zod.ts (never redefine)
   - Define all CRUD operations (GET, POST, PUT, DELETE)
   - Query parameters for filtering and pagination

2. **Creates route implementations** (`server/routes/*.ts`)
   - RESTful endpoint structure
   - Authentication middleware integration
   - Storage layer integration
   - Error handling with proper status codes

### Problems Solved (P0 - Production Failures)
1. **Contract Path Consistency** (EdVisor Issue #3)
   - Problem: /api prefix in contracts breaks mount point flexibility
   - Pattern: Paths are relative to mount point (no /api prefix)

2. **Dynamic Auth Headers** (EdVisor Issue #11)
   - Problem: Static auth headers don't work with ts-rest v3
   - Pattern: Use getter properties for dynamic header injection

3. **Response Serialization** (EdVisor Issue #12)
   - Problem: BigInt/Date objects don't serialize to JSON
   - Pattern: Convert to strings before returning

4. **HTTP Status Codes** (EdVisor Issue #16)
   - Problem: Missing status codes cause type errors
   - Pattern: Include ALL status codes (200, 201, 204, 400, 401, 404, 500)

### Pattern Files (7 total)
1. CORE_IDENTITY.md - What api_architect does
2. CONTRACT_PATH_CONSISTENCY.md - No /api prefix
3. DYNAMIC_AUTH_HEADERS.md - Getter properties
4. RESPONSE_SERIALIZATION.md - BigInt/Date handling
5. HTTP_STATUS_CODES.md - Complete status coverage
6. CONTRACT_REGISTRATION.md - Contract composition
7. VALIDATION_CHECKLIST.md - Pre-completion checks

### Context Needs Assessment
**Does it need full context for resume scenarios?**

**Scenarios**:
1. **Add new entity routes** (e.g., "add comments API")
   - Needs: Read existing contracts/, existing routes/
   - Preserve: All existing contracts and routes
   - Add: New contract and route files only

2. **Modify existing route** (e.g., "add pagination to users API")
   - Needs: Read specific contract and route files
   - Preserve: Other routes untouched
   - Modify: Only specified files

3. **Add authentication** (e.g., "protect orders route")
   - Needs: Read existing route, know auth patterns
   - Preserve: Route logic
   - Modify: Add authMiddleware() only

**Conclusion**: **YES, needs full context** for resume/modification workflows.

---

## 2. Analyze Overlap with Pipeline-Prompt

### Search for API Contract Content

```bash
# Find API contract sections
grep -n "contract" docs/pipeline-prompt.md | head -20
grep -n "ts-rest" docs/pipeline-prompt.md | head -20
grep -n "routes" docs/pipeline-prompt.md | grep -v "frontend"
```

### Findings

**Section 2.1.2: ts-rest Contracts** (Lines 70-111)
```markdown
#### 2.1.2 ts-rest Contracts (`shared/contracts/*.contract.ts`)

Create API contracts for each resource:

```typescript
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { users } from '../schema.zod';

const c = initContract();

export const usersContract = c.router({
  getUsers: {
    method: 'GET',
    path: '/users',  // ✅ CORRECT: No /api prefix (relative to mount point)
    responses: { 200: z.array(users) },
    summary: 'Get all users',
  },
  // Add CRUD operations for each entity
});
```

**CRITICAL: Contract Path Consistency**
- NO /api prefix in paths
- Paths are relative to router mount point
- /api is added at mount time in server/index.ts

**Principles**:
- Import schemas from schema.zod.ts
- Never redefine types inline
- Include all CRUD operations
- Add query parameters for filtering/pagination
- Use proper HTTP methods (GET, POST, PUT, DELETE)
```

**Lines**: 42 lines
**Type**: HOW (implementation details with code examples)
**Redundancy**: Pattern details duplicated in api_architect patterns

---

**Section 2.2.4: API Routes** (Lines 480-620)
```markdown
#### 2.2.4 API Routes

**🔧 BEFORE GENERATING** `server/routes/*.ts` and `server/index.ts`:

**Invoke**: `module-loading-validator` skill (RECOMMENDED - P1 Priority)

{... skill invocation details ...}

**ts-rest Route Implementation**:

```typescript
import { initServer } from '@ts-rest/express';
import { usersContract } from '../shared/contracts/users.contract';
import { authMiddleware } from './middleware/auth';

const s = initServer();

export const usersRouter = s.router(usersContract, {
  getUsers: {
    middleware: [authMiddleware()],
    handler: async ({ req }) => {
      const users = await storage.getUsers();
      return { status: 200 as const, body: users };
    }
  },
  // ... other handlers
});
```

**CRITICAL: ts-rest Handler Pattern**
- Return { status: X as const, body: Y }
- Use middleware: [authMiddleware()] for protected routes
- Access storage via req.app.locals.storage
- Type safety enforced by contract
```

**Lines**: ~140 lines (including auth patterns, storage integration, examples)
**Type**: HOW (implementation details)
**Redundancy**: Route implementation patterns duplicated

---

### Total Overlap

| Section | Lines | Type | Necessary? |
|---------|-------|------|------------|
| 2.1.2 ts-rest Contracts | 42 | HOW (implementation) | ❌ NO |
| 2.2.4 API Routes | 140 | HOW (implementation) | ❌ NO |
| **TOTAL** | **182 lines** | **Implementation bloat** | **Should be ~40 lines** |

### Redundancy Calculation

**Total API content in pipeline-prompt**: 182 lines
**Implementation details (HOW)**: ~150 lines
**Orchestration (WHAT/WHEN/WHY)**: ~32 lines

**Redundancy**: **82% overlapping HOW details** (150/182)

---

### Removal Plan

**Keep (40 lines)**:
```markdown
#### 2.1.2 API Contracts

**🔧 MANDATORY**: Invoke `api-architect` skill BEFORE creating contracts.

**What you will learn**:
1. Contract path consistency (no /api prefix)
2. Dynamic auth headers (getter properties)
3. Response serialization (BigInt/Date handling)
4. HTTP status codes (complete coverage)
5. Contract composition and registration

**After learning**, create contracts:
- **NEW apps**: Create contracts/ and routes/ from scratch
- **RESUME**: Read existing files and modify only what's requested

See: `~/.claude/skills/api-architect/SKILL.md`
```

**Remove**: 142 lines of HOW details

---

## 3. Check Existing Related Skills

### Related Skills Found

Based on [API_ARCHITECT_SUBAGENT_VS_SKILLS_ANALYSIS.md](API_ARCHITECT_SUBAGENT_VS_SKILLS_ANALYSIS.md):

1. **factory-lazy-init** (~5% overlap)
   - **Purpose**: Lazy Proxy pattern for factories
   - **Overlap**: Both deal with factories, but different concerns
   - **Decision**: **KEEP** - complementary (api_architect USES factories, skill teaches HOW to implement)

2. **production-smoke-test** (~3% overlap)
   - **Purpose**: Validate API endpoints in production
   - **Overlap**: Both care about APIs, but different phases
   - **Decision**: **KEEP** - complementary (api_architect CREATES, skill VALIDATES)

3. **type-safe-queries** (~0% overlap)
   - **Purpose**: Choose Drizzle vs PostgREST for queries
   - **Overlap**: None - completely different concern
   - **Decision**: **KEEP** - complementary (api_architect uses storage, skill chooses storage type)

### Conclusion

**No existing skills need modification or removal.** All are complementary.

---

## 4. Reconcile Everything

### Sources to Reconcile

- ✅ Subagent patterns (docs/patterns/api_architect/*.md) - 7 pattern files
- ✅ Pipeline-prompt guidance (docs/pipeline-prompt.md) - 182 lines
- ✅ Existing related skills - 3 skills (all complementary)
- ✅ Subagent code and registry

### Reconciliation Strategy

1. **Subagent Patterns → Skill**
   - Extract 4 P0 patterns (production failure prevention)
   - Include CONTRACT_REGISTRATION.md (composition)
   - Include VALIDATION_CHECKLIST.md
   - Exclude: P1 patterns (if any)

2. **Pipeline-Prompt → Minimal**
   - Remove 142 lines of HOW details
   - Keep 40 lines of WHAT/WHEN/WHY
   - Reference skill location

3. **Related Skills → Untouched**
   - All complementary, no conflicts
   - No modifications needed

4. **Subagent Code → Deprecated**
   - Archive to deprecated/api_architect.py.deprecated
   - Deregister from __init__.py
   - Add deprecation notice

### Result

- Single source of truth: api-architect skill
- Clear orchestration: pipeline-prompt (~40 lines)
- No conflicts: related skills unchanged
- Clean deprecation: subagent archived

---

## 5. Ensure Skill is Comprehensive BUT Concise

### Comprehensive (must include)

- ✅ When to Use (triggers: "add API", "create endpoints", "modify routes")
- ✅ 5 P0 Patterns:
  1. Contract Path Consistency (no /api prefix)
  2. Dynamic Auth Headers (getter properties)
  3. Response Serialization (BigInt/Date → string)
  4. HTTP Status Codes (complete coverage)
  5. Contract Composition (registration pattern)
- ✅ Workflow (create vs modify scenarios)
- ✅ Templates:
  - Contract file template
  - Route file template
  - Contract registration template
- ✅ Validation checklist
- ✅ Common mistakes

### Concise (must exclude)

- ❌ P1 patterns (performance optimizations, caching)
- ❌ Multiple variations of same example
- ❌ Long explanations (one-sentence rules)
- ❌ Framework comparisons (Express vs Fastify)
- ❌ Advanced patterns (rate limiting, webhooks)

### Target

**250-300 lines** for api-architect skill
- 5 P0 patterns with ✅/❌ examples
- 2 workflow scenarios (create, modify)
- 3 complete templates
- Checklist and common mistakes

---

## 6. Decision: Migrate or Keep?

### Decision Criteria Applied

**Migrate to Skill when**:
- ✅ Resume/modification workflows common (YES - adding routes, modifying endpoints common)
- ✅ Needs existing code state (YES - must preserve existing contracts/routes)
- ✅ Pattern-based work (YES - 5 P0 patterns to apply)
- ✅ Low iteration count (YES - typically 1-2 turns)

**All criteria met**: ✅ **RECOMMEND MIGRATION**

---

## Migration Recommendation

### ✅ MIGRATE api_architect → api-architect skill

**Reasons**:
1. **High Redundancy**: 82% overlap (150/182 lines)
2. **Common Resume Scenarios**: Adding routes, modifying endpoints
3. **Context Awareness Critical**: Must detect and preserve existing contracts/routes
4. **Pattern-Based**: 5 clear P0 patterns to apply
5. **Similar to schema_designer**: Same context isolation issues

### Benefits

1. **Simpler Resume**: Main agent automatically detects existing contracts/routes
2. **Reduced Bloat**: Remove 142 lines from pipeline-prompt
3. **Single Source**: One place for API design patterns
4. **Consistency**: Same approach as schema_designer migration

### Estimated Impact

- **Pipeline-prompt reduction**: 142 lines (7.3%)
- **Skill size**: ~280 lines (5 patterns + templates)
- **Overlap elimination**: 82% → 0%
- **Time saved**: 1-2 hours per API modification (no explicit context passing)

---

## Next Steps

### If Approved for Migration

1. **Create api-architect skill** (Phase 2 of playbook)
   - Follow SKILL.md format from schema-designer
   - Include 5 P0 patterns
   - Templates for contracts, routes, registration
   - 250-300 lines target

2. **Update pipeline-prompt.md** (Phase 3 of playbook)
   - Remove 142 lines of HOW details
   - Keep 40 lines of WHAT/WHEN/WHY
   - Reference skill

3. **Deregister subagent** (Phase 4 of playbook)
   - Archive to deprecated/
   - Update __init__.py
   - Add deprecation notice

4. **Test** (Phase 6 of playbook)
   - Initial generation
   - Resume with route addition
   - Resume with route modification

### If NOT Migrating

**Reasons to defer**:
- Focus on higher priority work
- Wait to see schema_designer skill performance in production
- Batch multiple subagent migrations together

**Alternative**: Keep as subagent, but still clean up pipeline-prompt redundancy (remove 100+ lines of HOW details, reference subagent patterns).

---

## Comparison with schema_designer Migration

| Aspect | schema_designer | api_architect |
|--------|----------------|---------------|
| **Overlap** | 65% (186 lines) | 82% (150 lines) |
| **P0 Patterns** | 6 | 5 |
| **Context Needs** | YES (schemas) | YES (contracts/routes) |
| **Resume Scenarios** | Common | Common |
| **Skill Size** | 266 lines | ~280 lines (est.) |
| **Pipeline Reduction** | 153 lines (7.9%) | 142 lines (7.3%) est. |
| **Migration Priority** | ✅ DONE | ⚠️ RECOMMENDED |

**Similarity**: Very similar situation - both have high overlap, need context, common resume scenarios.

**Recommendation**: Follow same playbook used for schema_designer migration.

---

## Timeline Estimate

- **Analysis**: ✅ Complete (this document)
- **Skill Creation**: 2-3 hours (Phase 2)
- **Pipeline Update**: 1 hour (Phase 3)
- **Deregistration**: 30 minutes (Phase 4)
- **Documentation**: 1 hour (Phase 5)
- **Testing**: 1 hour (Phase 6)

**Total**: 5.5-6.5 hours

---

## Approval Required

**Decision Point**: Migrate api_architect to skill?

- **Option A**: ✅ MIGRATE NOW (recommended - high overlap, common resume scenarios)
- **Option B**: ⏸️ DEFER (wait for schema_designer skill performance data)
- **Option C**: ❌ KEEP AS SUBAGENT (but clean up pipeline-prompt redundancy)

**Waiting for**: User decision
