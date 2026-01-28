# Schema Designer: Subagent to Skill Conversion Plan

## Executive Summary

**Goal**: Convert schema_designer from a subagent (isolated context) to a skill (learned by main agent).

**Why**: Main agent will have full conversation context when applying schema design patterns, enabling proper resume/modification workflows without explicit context passing.

**Result**: Main agent learns schema design patterns on-demand and applies them with full awareness of existing code, user requests, and conversation history.

---

## Current Problem

### Subagent Architecture (Isolated Context)
```
User: "Add posts table"
  ↓
Main Agent (has full context)
  ↓ Task tool delegation
schema_designer subagent (isolated - only sees task prompt)
  ❌ No conversation history
  ❌ Doesn't know what exists
  ❌ Must be told everything explicitly
```

### Skill Architecture (Shared Context)
```
User: "Add posts table"
  ↓
Main Agent (has full context)
  ↓ Invokes skill (learns patterns)
Main Agent applies patterns (with full context)
  ✅ Knows conversation history
  ✅ Can read existing files
  ✅ Understands resume vs create
```

---

## Skill Structure

### Based on Existing Skills Pattern

From drizzle-orm-setup and schema-query-validator:

```
~/.claude/skills/schema-designer/
├── SKILL.md          # Main skill file (YAML + instructions)
└── REFERENCE.md      # Optional: Additional patterns reference
```

**SKILL.md Structure**:
1. **YAML frontmatter** (name, description, category, priority)
2. **When to Use** (mandatory triggers, auto-invoke patterns)
3. **Critical Patterns** (concise, no duplication)
4. **Quick Reference** (code templates)
5. **Validation Checklist**

---

## Skill Content: schema-designer

### SKILL.md (Concise, ~300 lines)

```markdown
---
name: schema-designer
description: >
  Design type-safe database schemas with Zod validation and Drizzle ORM.
  Use when creating or modifying shared/schema.zod.ts and shared/schema.ts.
  Ensures field parity, security patterns, and validation best practices.
category: implementation
priority: P0
issue_addressed: Schema-frontend mismatches, auto-injected field security, transform order bugs
---

# Schema Designer

## When to Use This Skill

**MANDATORY** when:
- Creating `shared/schema.zod.ts` (Zod validation schemas)
- Creating `shared/schema.ts` (Drizzle ORM schemas)
- Modifying existing schemas (adding/removing entities or fields)
- User mentions "schema", "database tables", "data model"

**AUTO-INVOKE** on:
- "Add a [entity] table"
- "Modify [entity] schema"
- "Create database schema"
- File paths: `shared/schema.zod.ts`, `shared/schema.ts`

---

## Critical Patterns (P0 - Production Failures Prevented)

### Pattern 1: Auto-Injected Fields Security

**Problem**: Including `userId`, `createdBy`, `timestamps` in insert schemas causes validation errors.

**Why**: These fields are injected by backend from `req.user` AFTER validation.

```typescript
// ✅ CORRECT: Omit auto-injected fields
export const insertOrdersSchema = ordersSchema.omit({
  id: true,           // Auto-generated
  userId: true,       // Injected from req.user.id
  createdBy: true,    // Injected from req.user.id
  createdAt: true,    // Auto-timestamped
  updatedAt: true     // Auto-timestamped
});

// ❌ WRONG: Including userId causes validation failure
export const insertOrdersSchema = ordersSchema.omit({ id: true });
// Request body: { title: "Order" } ← no userId
// Schema expects: { title, userId } ← validation fails!
```

**Rule**: Omit any field that backend injects from auth context or timestamps.

---

### Pattern 2: Transform Order (Zod)

**Problem**: `.refine()` returns `ZodEffects`, breaking method chaining.

```typescript
// ✅ CORRECT: Transform → Refine
export const insertUserSchema = userSchema
  .omit({ id: true })      // Transform FIRST
  .partial({ role: true }) // Transform SECOND
  .refine(data => ...)     // Refine LAST

// ❌ WRONG: Refine → Transform (compile error)
export const insertUserSchema = userSchema
  .refine(data => ...)     // Returns ZodEffects
  .omit({ id: true });     // Error: .omit() doesn't exist on ZodEffects
```

**Rule**: All transforms (`.omit()`, `.pick()`, `.partial()`, `.extend()`) BEFORE refinements.

---

### Pattern 3: Fixed UUIDs for Seed Data

**Problem**: Random UUIDs break data scoping after server restart.

```typescript
// ✅ CORRECT: Fixed UUIDs matching auth
const FIXED_USER_IDS = {
  john: '00000000-0000-0000-0000-000000000001',   // Matches mock auth
  admin: '00000000-0000-0000-0000-000000000002',  // Matches mock auth
};

private seedData() {
  this.users.set(FIXED_USER_IDS.john, {
    id: FIXED_USER_IDS.john,
    email: 'john@app.com',
    name: 'John Doe',
  });
}

// ❌ WRONG: Random UUIDs change on restart
private seedData() {
  const userId = crypto.randomUUID();  // Different each restart!
  // User logs in with fixed mock auth UUID → can't see their data
}
```

**Rule**: Use RFC 4122 format fixed UUIDs. Coordinate with mock auth user IDs.

---

### Pattern 4: Query Schemas in schema.zod.ts

**Problem**: Defining query schemas inline in contracts causes duplication.

```typescript
// ✅ CORRECT: Define in schema.zod.ts (single source of truth)
// shared/schema.zod.ts
export const paginationQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().max(50).default(20),
});

// shared/contracts/users.contract.ts
import { paginationQuerySchema } from '../schema.zod';
query: paginationQuerySchema  // Import, don't redefine

// ❌ WRONG: Inline in contract (duplication)
query: z.object({ page: z.number(), limit: z.number() })  // Duplicated!
```

**Rule**: ALL schemas (entities, queries, filters, bodies) in schema.zod.ts.

---

### Pattern 5: Exact Field Parity (Zod ↔ Drizzle)

**Problem**: Field name mismatch causes runtime errors.

```typescript
// ✅ CORRECT: Exact field names
// schema.zod.ts
export const userSchema = z.object({
  id: z.number(),
  avatarUrl: z.string(),  // camelCase
});

// schema.ts (Drizzle)
export const users = pgTable('users', {
  id: serial('id'),
  avatarUrl: text('avatar_url'),  // field name: camelCase, column: snake_case
});

// ❌ WRONG: Different field names
// schema.zod.ts → avatarUrl
// schema.ts → avatar_url (field name, not column name!)
```

**Rule**: Field names MUST match exactly. Drizzle handles snake_case conversion.

---

### Pattern 6: Timestamp Mode (JSON Compatibility)

**Problem**: Default `Date` objects don't serialize to JSON.

```typescript
// ✅ CORRECT: mode: 'string'
createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()

// ❌ WRONG: Returns Date objects (JSON.stringify fails)
createdAt: timestamp('created_at').defaultNow()
```

**Rule**: Always use `{ mode: 'string' }` for timestamps.

---

## Workflow

### For New App (Create Mode)

1. **Read plan.md** → Identify entities
2. **Create schema.zod.ts**:
   - ALWAYS include users table (id, email, name, role, createdAt)
   - Define table schemas for each entity
   - Create insert schemas (omit auto-injected fields)
   - Define query/filter schemas
3. **Create schema.ts**:
   - Convert each Zod schema to Drizzle table
   - Exact field name parity
   - Add foreign keys
   - Add indexes for performance
4. **Validate**: Run checklist (see below)

### For Existing App (Modify Mode)

1. **Read existing files**:
   - `shared/schema.zod.ts` → Current Zod schemas
   - `shared/schema.ts` → Current Drizzle tables
2. **Understand modification**:
   - ADD new entity? → Append to existing
   - MODIFY entity? → Update specific schema
   - DELETE entity? → Remove schema + update references
3. **Apply changes**:
   - PRESERVE all unmodified schemas
   - ADD/MODIFY/DELETE as requested
   - MAINTAIN field parity for modified schemas
4. **Validate**: Ensure existing schemas unchanged (unless modifying them)

---

## Quick Reference

### schema.zod.ts Template

```typescript
import { z } from 'zod';

// Users table (ALWAYS include)
export const usersSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().datetime(),
});

export const insertUsersSchema = usersSchema.omit({
  id: true,
  createdAt: true,
});

// App-specific entity
export const ordersSchema = z.object({
  id: z.number(),
  userId: z.number(),  // Foreign key
  title: z.string().max(200),
  status: z.enum(['pending', 'completed']),
  createdAt: z.string().datetime(),
});

export const insertOrdersSchema = ordersSchema.omit({
  id: true,
  userId: true,      // Auto-injected from req.user
  createdAt: true,
});

// Query schemas
export const paginationQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().max(50).default(20),
});
```

### schema.ts Template

```typescript
import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
});
```

---

## Validation Checklist

Before completing schema work:

- [ ] Users table exists in both schema.zod.ts and schema.ts
- [ ] Every entity has table schema + insert schema
- [ ] Auto-injected fields omitted from insert schemas (id, userId, timestamps)
- [ ] Transform order correct (omit/partial BEFORE refine)
- [ ] Query/filter schemas defined in schema.zod.ts (not inline)
- [ ] Exact field name parity between Zod and Drizzle
- [ ] Timestamps use `{ mode: 'string' }`
- [ ] Foreign keys defined in Drizzle
- [ ] Seed data uses fixed UUIDs matching mock auth
- [ ] All entities from plan.md have schemas

---

## Common Mistakes

1. **Including userId in insert schema** → Validation fails
2. **Refine before omit** → Compile error
3. **Random UUIDs in seed data** → Data scoping broken
4. **Inline query schemas** → Duplication
5. **Field name mismatch** → Runtime error
6. **Default timestamp mode** → JSON serialization fails

---

## Time Savings

Following these patterns prevents:
- **Auto-injected field bugs**: 30+ min debugging per occurrence
- **Transform order errors**: 15+ min to diagnose
- **Seed data issues**: 2+ hours debugging data scoping
- **Query schema duplication**: 20+ min maintaining consistency
- **Field parity mismatches**: 45+ min debugging runtime errors
- **Timestamp serialization**: 30+ min debugging JSON errors

**Total**: ~5 hours saved per app by applying these patterns correctly first time.
```

---

## Pipeline-Prompt Changes

### Remove (186 lines of bloat)

**Delete these sections entirely**:
1. Lines 44-121: Zod schema implementation details
2. Lines 167-216: Drizzle schema implementation details
3. Lines 556-616: Seed data UUID implementation

### Replace with (30 lines)

```markdown
### 2.1 Backend Specification

**CRITICAL DEPENDENCY**: Schema MUST complete BEFORE contracts.

#### 2.1.1 Schema Design

**🔧 MANDATORY**: Invoke `schema-designer` skill before creating schemas.

```python
# Main agent learns skill and applies patterns
Skill("schema-designer")

# Then creates schemas with full context awareness
# - Knows if files exist (resume vs create)
# - Has conversation history
# - Understands user's modification request
# - Can read existing files to preserve them
```

**The skill teaches**:
- Auto-injected fields security (omit userId, timestamps)
- Zod transform order (omit before refine)
- Fixed UUIDs for seed data
- Query schema placement (all in schema.zod.ts)
- Exact field parity (Zod ↔ Drizzle)
- Timestamp mode (JSON compatibility)

**After learning skill**:
- Create `shared/schema.zod.ts` (Zod validation schemas)
- Create `shared/schema.ts` (Drizzle ORM schemas)
- In resume mode: Read existing schemas first, preserve unmodified parts

**Validation**: Run schema-designer checklist before proceeding to contracts.
```

---

## Delegation Mandate Changes

### Remove Subagent Reference

**Delete** (lines 1826-1876):
```markdown
1. **Schema Design**: ALWAYS delegate to `schema_designer`
   - ❌ NEVER generate schema.zod.ts or schema.ts yourself
```

### Replace with Skill Mandate

```markdown
### Required Skills by Stage

**Stage 2.1: Schema Design** (MANDATORY)
- `schema-designer` - Learn before creating/modifying schemas
- Provides: Auto-injected fields, transform order, field parity patterns
- Time saved: ~5 hours per app

**Stage 2.2: Storage Implementation** (MANDATORY)
- `type-safe-queries` - Choose Drizzle vs PostgREST
- `drizzle-orm-setup` - Learn Drizzle query patterns
- `factory-lazy-init` - Learn lazy Proxy pattern for factories

**Stage 2.4: Frontend Implementation** (MANDATORY)
- `schema-query-validator` - Learn schema constraints before pages

**Stage 3: Validation** (RECOMMENDED)
- `production-smoke-test` - Catch deployment failures

---

### How to Use Skills

```python
# Invoke skill to learn patterns
Skill("schema-designer")

# Now you know the patterns - apply them
# You have full context:
# - Conversation history
# - Existing files (can read them)
# - User's request
# - Resume vs create mode awareness

# No explicit context passing needed!
```

**Benefits**:
- ✅ Full conversation context
- ✅ Can read existing files automatically
- ✅ Understands resume vs create
- ✅ Applies patterns with awareness
- ✅ No isolated context limitations
```

---

## Implementation Steps

### Phase 1: Create Skill (2 hours)

- [x] Research skill structure (DONE)
- [ ] Write SKILL.md based on schema_designer patterns
- [ ] Extract 6 critical patterns (P0 only)
- [ ] Create concise templates
- [ ] Add validation checklist
- [ ] Keep to ~300 lines (no bloat)

### Phase 2: Update Pipeline-Prompt (1 hour)

- [ ] Remove 186 lines of schema implementation bloat
- [ ] Add 30 lines of skill invocation guidance
- [ ] Update delegation mandate (remove subagent, add skill)
- [ ] Add "How to Use Skills" section
- [ ] Document resume mode handling (skill gives context awareness)

### Phase 3: Verify Skill Works (1 hour)

- [ ] Test main agent learns skill
- [ ] Test creates schema.zod.ts correctly
- [ ] Test creates schema.ts correctly
- [ ] Test resume mode (reads existing, preserves)
- [ ] Test modification mode (adds without overwriting)

### Phase 4: Deprecate Subagent (30 min)

- [ ] Archive schema_designer.py to legacy_archive/
- [ ] Update subagent list in agent.py
- [ ] Update documentation
- [ ] Create migration note

---

## Skill vs Subagent Comparison

| Aspect | Subagent (Old) | Skill (New) |
|--------|----------------|-------------|
| **Context** | Isolated (clean slate) | Shared (full history) |
| **File awareness** | Must be told explicitly | Can read automatically |
| **Resume handling** | Must pass existing content | Knows to check & preserve |
| **Modification mode** | Must be told what exists | Detects existing files |
| **Complexity** | High (explicit context passing) | Low (natural awareness) |
| **Token usage** | 2x (main + subagent contexts) | 1x (single context) |
| **Latency** | Higher (delegation overhead) | Lower (direct application) |
| **Maintainability** | Pattern duplication | Single source (skill) |

---

## Next Subagents to Convert

After schema-designer succeeds, apply same pattern to:

1. **api_architect** → skill (~40 lines bloat to remove)
2. **code_writer** → skill (~350 lines bloat to remove)
3. **ui_designer** → skill (~280 lines bloat to remove)

**Total cleanup potential**: ~1,011 lines (52% of pipeline-prompt.md)

---

## Success Criteria

### Skill is successful if:
1. ✅ SKILL.md is concise (~300 lines, no duplication)
2. ✅ Main agent learns and applies patterns correctly
3. ✅ Resume mode works without explicit context passing
4. ✅ Pipeline-prompt reduced from 1,947 → ~791 lines
5. ✅ No loss of functionality vs subagent approach

### We achieved:
- Simpler architecture (no delegation overhead)
- Better context awareness (shared not isolated)
- Easier resume handling (automatic file awareness)
- Reduced bloat (skill is reference, not repeated instruction)
- Faster execution (no subagent latency)

---

## Appendix: Skill Location

```
~/.claude/skills/schema-designer/
└── SKILL.md          # ~300 lines, 6 patterns, templates, checklist
```

**NOT needed**:
- ❌ REFERENCE.md (patterns are concise enough for main file)
- ❌ Scripts (no executable code needed)
- ❌ Examples directory (templates inline)

**Keep it minimal**: One SKILL.md file with everything needed.
