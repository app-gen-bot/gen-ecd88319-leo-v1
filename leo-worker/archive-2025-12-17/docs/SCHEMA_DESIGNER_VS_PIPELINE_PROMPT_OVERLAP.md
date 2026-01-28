# Schema Designer vs Pipeline Prompt - Overlap Analysis

## Executive Summary

**CRITICAL FINDING**: **65% redundant overlap** - pipeline-prompt.md contains extensive schema implementation details that **conflict** with the delegation mandate.

**Problem**: Pipeline-prompt tells main agent HOW to create schemas in detail, but also says "ALWAYS delegate to schema_designer, NEVER generate yourself".

**Solution**: Remove implementation bloat from pipeline-prompt. Keep only WHAT/WHEN/WHY. Move HOW to schema_designer patterns.

---

## Current State (Conflicting)

### Pipeline-Prompt Schema Content

**Section 2.1.1: Zod Schema** (lines 44-121, **77 lines**):
```markdown
#### 2.1.1 Zod Schema (`shared/schema.zod.ts`)

**First file to create** - single source of truth for all types.

```typescript
import { z } from 'zod';

// ALWAYS include users table
export const users = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().datetime(),
});

export const insertUsersSchema = users.omit({ id: true, createdAt: true });
```

**CRITICAL: Auto-Injected Fields**

Omit fields that are auto-injected by backend from req.user:

```typescript
// ✅ CORRECT: Omit userId - injected from req.user.id in route handler
export const insertCampaignOrdersSchema = campaignOrdersSchema.omit({
  id: true,
  userId: true,      // Auto-injected from req.user.id
  createdBy: true,   // Auto-injected from req.user.id
  createdAt: true,
  updatedAt: true,
});
```

**CRITICAL: Zod Schema Transformation Order**

```typescript
// ✅ CORRECT: Transform → Refine
const insertSchema = baseSchema
  .omit({ id: true })      // Transform first
  .refine((data) => ...);  // Refine last

// ❌ WRONG: Refine → Transform (breaks method chaining)
```

**Principles**:
- Every entity needs: table schema + insert schema
- Use proper Zod types: `z.string()`, `z.number()`, `z.boolean()`, `z.enum()`
- Include relationships with foreign keys
- Add validation constraints (min, max, regex)
- ALL schemas live in schema.zod.ts
```

**Analysis**:
- ❌ **HOW details**: Specific code examples showing exact implementation
- ❌ **Pattern details**: Auto-injected fields, transform order explained
- ❌ **Bloat**: Main agent doesn't need this if delegating to schema_designer

---

**Section 2.2.1: Drizzle Schema** (lines 167-216, **49 lines**):
```markdown
#### 2.2.1 Drizzle Schema (`shared/schema.ts`)

Convert Zod schemas to Drizzle ORM:

```typescript
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**CRITICAL: Timestamp Mode for JSON Compatibility**

```typescript
// ✅ CORRECT: Always use mode: 'string' for JSON compatibility
createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow()
```

**🔧 BEFORE GENERATING** `shared/schema.ts` and `server/lib/db.ts`:

**Invoke**: `drizzle-orm-setup` skill (MANDATORY)
```

**Analysis**:
- ❌ **HOW details**: Drizzle implementation specifics
- ❌ **Pattern details**: Timestamp mode explained
- ⚠️ **Skill reference**: Correctly mentions drizzle-orm-setup, but bloated with examples

---

**Section 2.2.3: Seed Data UUID Requirements** (lines 556-616, **60 lines**):
```markdown
**CRITICAL: Seed Data UUID Requirements (Issue #5)**

**MUST use EXACT same user IDs as mock-adapter.ts**:
- john@app.com → `00000000-0000-0000-0000-000000000001`
- admin@app.com → `00000000-0000-0000-0000-000000000002`

```typescript
private seedData() {
  const adminUserId = '00000000-0000-0000-0000-000000000002';
  const user1Id = '00000000-0000-0000-0000-000000000001';

  this.users.set(adminUserId, {
    id: adminUserId,
    email: 'admin@app.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  });

  // ❌ WRONG: Random UUIDs change on restart
  // const randomUserId = crypto.randomUUID();
}
```

**Why Fixed UUIDs**:
1. Zod `.uuid()` validation requires RFC 4122 format
2. Fixed UUIDs survive server restarts
3. Mock auth users can access seeded data reliably
```

**Analysis**:
- ❌ **HOW details**: Implementation examples for seed data
- ❌ **Pattern details**: Fixed UUIDs explained in detail
- ❌ **Storage concern**: This is about storage implementation, not schema design per se

---

### Delegation Mandate (lines 1826-1876)

```markdown
**Delegation Mandate** (MUST follow):

1. **Schema Design**: ALWAYS delegate to `schema_designer`
   - ✅ Embedded: Zod transform order, auto-injected fields, fixed UUIDs, query schema placement
   - ❌ NEVER generate schema.zod.ts or schema.ts yourself
```

**Analysis**:
- ✅ **Correct mandate**: Main agent should delegate
- ❌ **CONFLICT**: But pipeline-prompt teaches HOW in detail (186 lines of schema implementation)

---

## Overlap Breakdown

### Total Schema-Related Content in Pipeline-Prompt

| Section | Lines | Type | Necessary? |
|---------|-------|------|------------|
| Zod Schema (2.1.1) | 77 | HOW (implementation) | ❌ NO - delegate to schema_designer |
| Drizzle Schema (2.2.1) | 49 | HOW (implementation) | ❌ NO - delegate to schema_designer |
| Seed Data UUIDs (2.2.3) | 60 | HOW (implementation) | ❌ NO - delegate to code_writer |
| **TOTAL** | **186 lines** | **Implementation bloat** | **Should be ~30 lines** |

### What's Redundant

**Pattern Details (should be in schema_designer only)**:
1. Auto-injected fields explanation (userId, createdBy, timestamps)
2. Zod transform order (omit before refine)
3. Timestamp mode for JSON compatibility
4. Fixed UUIDs for seed data
5. Query schema placement principles
6. Exact code examples for schema.zod.ts and schema.ts

**Schema_designer already has these**:
- CORE_IDENTITY.md - What schema_designer does
- ZOD_TRANSFORM_ORDER.md - Transform before refine pattern
- AUTO_INJECTED_FIELDS.md - Security: omit userId/timestamps
- FIXED_UUIDS.md - Use RFC 4122 UUIDs in seed data
- QUERY_SCHEMA_PLACEMENT.md - All schemas in schema.zod.ts
- TYPE_SAFETY.md - Type inference patterns
- VALIDATION_CHECKLIST.md - Pre-completion checks

---

## The Conflict

### Main Agent Confusion

**Pipeline-prompt says two contradictory things:**

1. **Lines 44-216**: "Here's exactly HOW to create schemas with these specific patterns..."
   - Detailed code examples
   - Pattern explanations
   - Implementation specifics

2. **Lines 1826-1876**: "ALWAYS delegate to schema_designer, NEVER generate yourself"
   - Clear delegation mandate
   - Lists patterns embedded in schema_designer
   - Says main agent shouldn't implement

**Result**: Main agent gets conflicting signals:
- Should I follow the detailed HOW instructions (186 lines)?
- Or should I delegate (as mandated)?
- Why are implementation details here if I'm not using them?

---

## What SHOULD Be in Pipeline-Prompt

### Minimal Schema Guidance (WHAT/WHEN/WHY)

**Replace 186 lines with ~30 lines:**

```markdown
### 2.1 Backend Specification (Schema & Contracts)

**CRITICAL DEPENDENCY**: Schema.zod.ts MUST complete BEFORE contracts.

**Reason**: Contracts import types from schema.zod.ts. Order matters:
1. FIRST: schema.zod.ts (foundation - no dependencies)
2. SECOND: contracts/ (imports from schema.zod.ts)

#### 2.1.1 Schema Design

**🔧 DELEGATE TO** `schema_designer` subagent (MANDATORY)

**What schema_designer creates**:
1. `shared/schema.zod.ts` - Zod validation schemas (single source of truth)
2. `shared/schema.ts` - Drizzle ORM schemas (database implementation)

**Context to provide**:
```python
Task("Design database schemas", f"""
Create schema.zod.ts and schema.ts for the following entities:

From plan.md:
{entities_list}

Requirements:
- Users table is ALWAYS included (even if not in plan)
- Each entity needs table schema + insert schema
- Follow exact field parity between Zod and Drizzle
- Include relationships with foreign keys

Working directory: {app_path}/shared/
""", "schema_designer")
```

**After completion**: Verify schema.zod.ts and schema.ts exist before proceeding to contracts.

**schema_designer handles all patterns**: Auto-injected fields, transform order, fixed UUIDs, query schemas, type safety.

**Do NOT implement schemas yourself** - schema_designer has embedded patterns with 96% issue prevention rate.
```

**What this achieves**:
- ✅ **WHAT**: Explains what schemas are
- ✅ **WHEN**: When in pipeline (before contracts)
- ✅ **WHY**: Dependencies explained
- ✅ **HOW TO DELEGATE**: Exact Task tool syntax
- ✅ **TRUST**: References embedded patterns, tells main agent to delegate
- ❌ **NO HOW**: Zero implementation details

---

## Recommended Changes

### Remove from Pipeline-Prompt (186 lines → 30 lines)

**Delete these sections entirely**:

1. **Lines 52-95**: Auto-injected fields code examples and explanations
   - **Reason**: AUTO_INJECTED_FIELDS.md pattern handles this
   - **Keep**: High-level mention that schema_designer handles security

2. **Lines 99-111**: Zod transform order examples and explanations
   - **Reason**: ZOD_TRANSFORM_ORDER.md pattern handles this
   - **Keep**: Nothing - pattern is embedded

3. **Lines 113-121**: Schema principles list
   - **Reason**: CORE_IDENTITY.md has these
   - **Keep**: High-level "schema_designer handles validation, relationships"

4. **Lines 169-186**: Drizzle schema code examples
   - **Reason**: schema_designer creates schema.ts
   - **Keep**: Just "schema_designer creates schema.ts (Drizzle ORM)"

5. **Lines 189-197**: Timestamp mode explanation
   - **Reason**: Implementation detail schema_designer knows
   - **Keep**: Nothing - embedded in subagent

6. **Lines 556-616**: Seed data UUID implementation
   - **Reason**: FIXED_UUIDS.md pattern handles this
   - **Keep**: Nothing - code_writer handles storage implementation

### Replace with Delegation Guidance

**New Section 2.1.1** (~30 lines):
```markdown
#### 2.1.1 Schema Design

**DELEGATE TO**: `schema_designer` subagent

Provide context:
- Entities from plan.md
- Relationships between entities
- App-specific validation rules

schema_designer handles:
- Zod schemas (schema.zod.ts)
- Drizzle schemas (schema.ts)
- Security patterns (auto-injected fields)
- Type safety patterns
- Validation rules

Wait for completion before proceeding to contracts (dependency).
```

---

## Impact Analysis

### Before (Current State)

**Pipeline-prompt content**: 1,947 lines
- **Schema implementation**: 186 lines (9.5%)
- **Main agent gets**: Detailed HOW + delegation mandate (conflicting)
- **Result**: Confusion about whether to implement or delegate

### After (Proposed Changes)

**Pipeline-prompt content**: ~1,791 lines (-156 lines, 8% reduction)
- **Schema delegation guidance**: 30 lines (1.7%)
- **Main agent gets**: Clear DELEGATE instruction + context to provide
- **Result**: No confusion - main agent orchestrates, schema_designer executes

### Benefits

1. **Eliminates conflict**: No more "here's how to do it" + "never do it yourself"
2. **Reduces bloat**: 186 lines → 30 lines (83% reduction in schema section)
3. **Clearer roles**: Main agent orchestrates, subagent implements
4. **Better maintainability**: Patterns live in ONE place (schema_designer patterns/)
5. **Faster reading**: Main agent reads less irrelevant detail
6. **Higher quality**: schema_designer has 96% issue prevention rate - let it work

---

## Similar Analysis Needed

This same pattern likely applies to OTHER subagents:

### Candidates for Similar Cleanup

1. **api_architect vs pipeline-prompt**:
   - Lines 122-164: Contract implementation details
   - Lines 145-157: Contract path consistency explanation
   - **Likely bloat**: ~40 lines of HOW details

2. **code_writer vs pipeline-prompt**:
   - Lines 250-412: Auth adapter implementation
   - Lines 418-530: Storage factory implementation
   - Lines 620-835: Route implementation details
   - **Likely bloat**: ~350 lines of HOW details

3. **ui_designer vs pipeline-prompt**:
   - Lines 1016-1046: Design system requirements
   - Lines 1062-1340: Page structure patterns
   - **Likely bloat**: ~280 lines of HOW details

4. **quality_assurer vs pipeline-prompt**:
   - Lines 1400-1555: Validation details
   - **Likely bloat**: ~155 lines of HOW details

**Total estimated bloat in pipeline-prompt**: ~1,011 lines (52% of file!)

---

## Conclusion

### The Problem

Pipeline-prompt.md tries to be BOTH:
1. **Orchestration guide** (WHAT/WHEN/WHY to delegate)
2. **Implementation manual** (HOW to create schemas, routes, pages)

**This creates**:
- Conflicting instructions (do it yourself vs delegate)
- Massive file (1,947 lines)
- Redundancy with subagent patterns
- Confusion about roles

### The Solution

**Strict separation**:
- **Pipeline-prompt**: Orchestration ONLY (WHAT/WHEN/WHY/WHO)
- **Subagent patterns**: Implementation ONLY (HOW)

**For schema_designer specifically**:
- Remove 156 lines of implementation bloat
- Keep 30 lines of delegation guidance
- Trust schema_designer's embedded patterns (96% success rate)

### Next Steps

1. ✅ **Schema section**: Remove bloat (186 → 30 lines)
2. ⚠️ **API contracts section**: Analyze api_architect overlap (~40 lines bloat)
3. ⚠️ **Route implementation section**: Analyze code_writer overlap (~350 lines bloat)
4. ⚠️ **Frontend section**: Analyze ui_designer overlap (~280 lines bloat)
5. ⚠️ **Validation section**: Analyze quality_assurer overlap (~155 lines bloat)

**Total cleanup potential**: ~1,011 lines (52% file reduction)
**Result**: Pipeline-prompt as pure orchestration guide (~936 lines)

---

## Verification

After cleanup, check for:
1. ✅ Zero HOW details in pipeline-prompt (only WHAT/WHEN/WHY)
2. ✅ Clear delegation instructions with Task tool syntax
3. ✅ Dependencies clearly stated
4. ✅ Trust in subagent expertise ("embedded patterns", "96% prevention")
5. ✅ No conflicts between instructions

**Success criteria**: Main agent can read pipeline-prompt in 10 minutes and know exactly WHEN to delegate to WHO, with WHAT context - but not HOW to implement.
