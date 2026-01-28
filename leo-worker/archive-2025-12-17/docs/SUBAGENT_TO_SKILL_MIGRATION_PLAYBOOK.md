# Subagent to Skill Migration Playbook

## Executive Summary

**Purpose**: Convert specialized subagents to skills for simpler architecture and better context awareness.

**When to Migrate**: Subagents that need full conversation context, especially for resume/modification workflows.

**Result**: Skills give main agent learned patterns with shared context (no isolation), better for iterative development.

---

## Why Migrate?

### Subagent Limitations
1. **Isolated Context**: Each invocation starts with "clean slate" - no conversation history
2. **Explicit Context Passing**: Main agent must read files and pass ALL content explicitly
3. **Resume Complexity**: Modification workflows require detecting mode and reading existing files
4. **Delegation Overhead**: Task tool call + subagent context loading

### Skill Benefits
1. **Shared Context**: Main agent has full conversation history and file awareness
2. **Natural Context**: No explicit passing - main agent knows what exists
3. **Resume Support**: Automatically detects existing files and preserves them
4. **Lower Latency**: No delegation overhead - direct pattern learning

### Decision Criteria

**Migrate to Skill when**:
- ✅ Resume/modification workflows are common (schema changes, route additions)
- ✅ Subagent needs to know about existing code state
- ✅ Pattern-based work (apply patterns, don't make complex decisions)
- ✅ Low iteration count (1-2 turns typical)

**Keep as Subagent when**:
- ✅ Complex multi-turn reasoning required (research, debugging)
- ✅ Isolated context is beneficial (focused problem-solving)
- ✅ Initial generation only (no modifications)
- ✅ Independent task execution (no dependency on main agent context)

---

## Migration Playbook

### Phase 1: Analysis (1 hour)

#### Step 1.1: Identify Overlap with Pipeline-Prompt

**Goal**: Find redundant implementation details in pipeline-prompt.md

**Method**:
```bash
# Read subagent pattern files
grep -r "PATTERN:" docs/patterns/{subagent_name}/

# Search for same patterns in pipeline-prompt
grep -r "{pattern_keywords}" docs/pipeline-prompt.md

# Document overlap
```

**Output**: Create `docs/{SUBAGENT_NAME}_VS_PIPELINE_PROMPT_OVERLAP.md`

**Template**:
```markdown
# {Subagent Name} vs Pipeline Prompt - Overlap Analysis

## Overlap Breakdown

| Section | Lines | Type | Necessary? |
|---------|-------|------|------------|
| Pattern 1 in pipeline-prompt | X | HOW (implementation) | ❌ NO |
| Pattern 2 in pipeline-prompt | Y | HOW (implementation) | ❌ NO |

**Total Bloat**: X lines of implementation details

**What SHOULD be in pipeline-prompt**:
- WHAT the subagent does
- WHEN to invoke it
- WHY it's needed
- Reference to skill location

**Recommended Changes**: Remove X lines, keep ~Y lines of orchestration guidance
```

**Example**: `docs/SCHEMA_DESIGNER_VS_PIPELINE_PROMPT_OVERLAP.md` (65% overlap found)

---

#### Step 1.2: Analyze Subagent Pattern Files

**Goal**: Understand all patterns the subagent knows

**Method**:
```bash
# List pattern files
ls -la docs/patterns/{subagent_name}/

# Read each pattern
cat docs/patterns/{subagent_name}/*.md
```

**Extract**:
1. **P0 Patterns** (production failure prevention)
2. **P1 Patterns** (quality/performance)
3. **P2 Patterns** (nice-to-have)

**Output**: Pattern inventory with priority classification

**Example from schema_designer**:
```
P0 Patterns (6):
1. Auto-injected fields security
2. Transform order (omit before refine)
3. Fixed UUIDs for seed data
4. Query schema placement
5. Exact field parity (Zod ↔ Drizzle)
6. Timestamp mode (JSON compatibility)

P1 Patterns (0)
P2 Patterns (0)
```

**Decision**: Include ALL P0 patterns in skill, consider P1 if commonly needed

---

#### Step 1.3: Check Subagent Usage in Pipeline

**Goal**: Find all references to subagent in pipeline-prompt.md

**Method**:
```bash
# Find Task tool invocations
grep -n "Task.*{subagent_name}" docs/pipeline-prompt.md

# Find delegation mandate references
grep -n "{subagent_name}" docs/pipeline-prompt.md | grep -i "delegate"

# Find example references
grep -n "{subagent_name}" docs/pipeline-prompt.md | grep -i "example"
```

**Output**: List of all locations to update (line numbers)

**Example from schema_designer**:
```
Line 44-121: Section 2.1.1 Zod Schema (77 lines of HOW)
Line 167-216: Section 2.2.1 Drizzle Schema (49 lines of HOW)
Line 556-616: Seed Data UUIDs (60 lines of HOW)
Line 1734: Delegation Mandate reference
Line 1788: Example delegation
```

---

### Phase 2: Create Skill (2 hours)

#### Step 2.1: Study Existing Skill Format

**Goal**: Match established skill structure

**Method**:
```bash
# Read existing skills for reference
cat ~/.claude/skills/drizzle-orm-setup/SKILL.md
cat ~/.claude/skills/schema-query-validator/SKILL.md
```

**Note structure**:
1. YAML frontmatter (name, description, category, priority)
2. "When to Use" section (triggers, auto-invoke patterns)
3. Core Patterns section (P0 only)
4. Workflow section (step-by-step)
5. Templates section (code examples)
6. Validation checklist
7. Common mistakes
8. Time saved metrics

---

#### Step 2.2: Create Skill File

**Location**: `~/.claude/skills/{subagent-name}/SKILL.md`

**Template**:
```markdown
---
name: {subagent-name}
description: >
  {One-line description of what skill does}
  Use when {triggering scenarios}.
  Ensures {key benefits}.
category: implementation  # or validation, architecture, etc.
priority: P0
---

# {Subagent Name}

## When to Use

**MANDATORY** when:
- {Scenario 1}
- {Scenario 2}
- User mentions "{keyword1}", "{keyword2}", "{keyword3}"

**AUTO-INVOKE** on patterns: "{pattern1}", "{pattern2}", "{pattern3}"

---

## Core Patterns ({N} Critical)

### 1. {Pattern Name}

**Problem**: {What goes wrong without this pattern}

```typescript
// ✅ CORRECT: {Correct approach}
{correct_code_example}

// ❌ WRONG: {Wrong approach}
{wrong_code_example}
```

**Rule**: {One-sentence rule}

---

### 2. {Pattern Name}

{Repeat for each P0 pattern}

---

## Workflow

### New App (Create)
1. **{Step 1}** → {Action}
2. **{Step 2}** → {Action}
3. **Validate**: Run checklist

### Existing App (Modify)
1. **Read existing**: {What files to check}
2. **Identify change**: {ADD/MODIFY/DELETE}
3. **Apply**: {How to preserve + modify}
4. **Validate**: {What to check}

---

## Templates

### {File 1}
```typescript
{Complete working example}
```

### {File 2}
```typescript
{Complete working example}
```

---

## Validation

**MANDATORY: Run validation after creating {files}**

### Quick Validation (30 seconds)

```bash
# Pattern checks (fast, no dependencies required)
bash scripts/validate-{subagent-name}-quick.sh
```

**What it checks**:
- ✓ {Check 1}
- ✓ {Check 2}
- ✓ {Check 3}

**Expected output**:
```
✓ {Check 1 success message}
✓ {Check 2 success message}
✅ Quick validation passed
```

**If validation fails**:
1. Read the specific error message
2. Fix the exact issue mentioned
3. Re-run validation
4. Continue only when all checks pass

### Manual Checklist

If validation script not available, verify manually:
- [ ] {Check 1}
- [ ] {Check 2}
- [ ] {Check 3}

---

## Common Mistakes

1. {Mistake} → {Consequence}
2. {Mistake} → {Consequence}

---

## Time Saved

Following these patterns prevents {X}+ hours debugging per app:
- {Pattern 1}: {Y} min
- {Pattern 2}: {Z} min
```

**Brevity Guidelines**:
- P0 patterns ONLY (production failure prevention)
- One ✅/❌ example per pattern (not multiple variations)
- One-sentence rules (not paragraphs)
- Complete templates (not fragments)
- Target: 250-300 lines total

---

#### Step 2.3: Reconcile Patterns with Subagent

**Goal**: Ensure ALL P0 patterns from subagent are in skill

**Method**:
```bash
# For each pattern file in docs/patterns/{subagent_name}/
# 1. Read pattern
# 2. Extract key rule
# 3. Create ✅/❌ example pair
# 4. Add to skill under "Core Patterns"
```

**Checklist**:
- [ ] Pattern 1 from {PATTERN_FILE_1}.md → Skill Pattern 1
- [ ] Pattern 2 from {PATTERN_FILE_2}.md → Skill Pattern 2
- [ ] Pattern N from {PATTERN_FILE_N}.md → Skill Pattern N
- [ ] All validation rules from VALIDATION_CHECKLIST.md → Skill checklist
- [ ] Common mistakes from patterns → Skill "Common Mistakes"

**Verification**:
```bash
# Ensure no pattern is missed
diff <(grep "^## " docs/patterns/{subagent_name}/*.md | sort) \
     <(grep "^### " ~/.claude/skills/{subagent-name}/SKILL.md | sort)
```

---

#### Step 2.4: Create Validation Script

**Goal**: Implement quick validation for pattern checking

**Method**: Create `scripts/validate-{subagent-name}-quick.sh`

**Template**:
```bash
#!/bin/bash
set -e

echo "Validating {subagent} files..."

# Check files exist
if [ ! -f "{file_path_1}" ]; then
  echo "❌ {file_1} not found"
  exit 1
fi

echo "✓ Required files exist"

# Pattern checks (grep/regex based)
# Example: Check for specific patterns
pattern_count=$(grep -c "{required_pattern}" {file_path} || echo 0)
if [ "$pattern_count" -eq 0 ]; then
  echo "❌ Required pattern not found"
  exit 1
fi

echo "✓ Found $pattern_count instances of required pattern"

echo "✅ Quick validation passed"
```

**Make executable**:
```bash
chmod +x scripts/validate-{subagent-name}-quick.sh
```

**Guidelines**:
- Keep validation under 30 seconds
- Use grep/regex for pattern checks
- No dependencies required (no npm, no tsc)
- Specific error messages
- Exit code 1 on failure

**Reference**: See `docs/PRACTICAL_VALIDATION_FOR_EARLY_STAGES.md` for patterns

---

#### Step 2.5: Copy to Source Control

**Goal**: Sync skill to version-controlled location

**Commands**:
```bash
# Create directory in source control
mkdir -p ~/apps/app-factory/apps/.claude/skills/{subagent-name}

# Copy skill file
cp ~/.claude/skills/{subagent-name}/SKILL.md \
   ~/apps/app-factory/apps/.claude/skills/{subagent-name}/SKILL.md

# Verify identical
diff ~/.claude/skills/{subagent-name}/SKILL.md \
     ~/apps/app-factory/apps/.claude/skills/{subagent-name}/SKILL.md
```

**Output**: No diff = files synced

---

### Phase 3: Update Pipeline-Prompt (1 hour)

#### Step 3.1: Remove Implementation Bloat

**Goal**: Delete HOW details, keep WHAT/WHEN/WHY guidance

**For each section identified in Phase 1.3**:

```markdown
# BEFORE (77 lines of implementation details)
#### 2.X.Y {Task Name}

{Implementation details with code examples}
{Pattern explanations}
{Principles and rules}

# AFTER (~25 lines of orchestration guidance)
#### 2.X.Y {Task Name}

**🔧 MANDATORY**: Invoke `{subagent-name}` skill BEFORE {action}.

**What you will learn**:
1. {Pattern 1 name}
2. {Pattern 2 name}
3. {Pattern N name}

**After learning**, {what to do}:
- **NEW apps**: {Create behavior}
- **RESUME**: {Modify behavior}
- {Preservation guarantee}
- {Consistency guarantee}

**Working directory**: `{directory}`

**After completion**: {Verification step}

See: `~/.claude/skills/{subagent-name}/SKILL.md`
```

**Pattern**: Match `drizzle-orm-setup` skill reference format (lines 117-132)

---

#### Step 3.2: Update Delegation Mandate

**Location**: Section "DELEGATION STRATEGY" → "Delegation Mandate"

**Template**:
```markdown
N. **{Task Area}**: ALWAYS invoke `{subagent-name}` skill
   - ✅ Skill provides: {pattern1}, {pattern2}, {patternN}
   - ✅ Full context: Main agent learns patterns and applies with conversation awareness
   - ✅ Resume support: Automatically detects existing files and preserves them
   - ❌ NEVER generate {files} without invoking skill first
```

**Before/After**:
```diff
-1. **Schema Design**: ALWAYS delegate to `schema_designer`
-   - ✅ Embedded: Zod transform order, auto-injected fields, ...
-   - ❌ NEVER generate schema.zod.ts or schema.ts yourself
+1. **Schema Design**: ALWAYS invoke `schema-designer` skill
+   - ✅ Skill provides: Zod transform order, auto-injected fields, ...
+   - ✅ Full context: Main agent learns patterns with conversation awareness
+   - ✅ Resume support: Automatically detects existing files and preserves them
+   - ❌ NEVER generate schema.zod.ts or schema.ts without invoking skill first
```

---

#### Step 3.3: Update Example Delegation

**Location**: Section "Example Multi-Task Delegation"

**Template**:
```python
# Stage X: {Task Name} (FOUNDATION - must complete first)
# Invoke {subagent-name} skill to learn patterns
# Main agent learns: {pattern1}, {pattern2}, {patternN}
# Then {creates/modifies} {files}

# CRITICAL: Wait for {files} to be written before proceeding
```

**Before/After**:
```diff
-# Stage 2.1: Schema Design (FOUNDATION)
-Task("Design schemas", "Create schema.zod.ts...", "schema_designer")
+# Stage 2.1: Schema Design (FOUNDATION)
+# Invoke schema-designer skill to learn patterns
+# Main agent learns: auto-injected fields, transform order, fixed UUIDs, etc.
+# Then creates schema.zod.ts and schema.ts
```

---

#### Step 3.4: Calculate Line Reduction

**Method**:
```bash
# Count before (from Phase 1.3 line ranges)
echo "Section 1: {end_line} - {start_line} + 1" | bc
echo "Section 2: {end_line} - {start_line} + 1" | bc
# Sum all sections

# Count after (new line ranges)
echo "Section 1: {end_line} - {start_line} + 1" | bc
echo "Section 2: {end_line} - {start_line} + 1" | bc
# Sum all sections

# Calculate reduction
echo "Removed: {before} - {after}" | bc
```

**Output**: Document in cleanup summary

**Example from schema_designer**:
```
Section 2.1.1: 77 → 25 (52 lines removed)
Section 2.2.1: 49 → 18 (31 lines removed)
Seed Data: 60 → 3 (57 lines removed)
Delegation: 4 → 6 (-2 lines added for clarity)
Example: 5 → 6 (-1 line added for clarity)

Net reduction: 153 lines removed, 3 lines added = 150 net
Pipeline-prompt: 1,947 → 1,797 lines (7.7% reduction)
```

---

### Phase 4: Deregister Subagent (30 minutes)

#### Step 4.1: Archive Subagent Definition

**Goal**: Prevent subagent from being invoked

**Method**:
```bash
# Create archive directory
mkdir -p src/app_factory_leonardo_replit/agents/app_generator/subagents/deprecated

# Move subagent file
mv src/app_factory_leonardo_replit/agents/app_generator/subagents/{subagent_name}.py \
   src/app_factory_leonardo_replit/agents/app_generator/subagents/deprecated/{subagent_name}.py.deprecated

# Add deprecation notice at top of file
```

**Deprecation Notice Template**:
```python
"""
DEPRECATED: This subagent has been converted to a skill.

Migration Date: {YYYY-MM-DD}
Skill Location: ~/.claude/skills/{subagent-name}/SKILL.md
Reason: Skills provide full context awareness for resume/modification workflows.

DO NOT USE THIS SUBAGENT.
Main agent should invoke the skill instead.

See: docs/SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md
See: docs/{SUBAGENT_NAME}_TO_SKILL_MIGRATION_SUMMARY.md
"""

# Original code below...
```

---

#### Step 4.2: Update Subagent Registry

**File**: `src/app_factory_leonardo_replit/agents/app_generator/subagents/__init__.py`

**Method**:
```python
# Comment out or remove subagent import and registration

# BEFORE
from .schema_designer import schema_designer

SUBAGENTS = {
    "schema_designer": schema_designer,
    "api_architect": api_architect,
    # ...
}

# AFTER
# DEPRECATED: schema_designer converted to skill (2025-11-18)
# See: ~/.claude/skills/schema-designer/SKILL.md
# from .schema_designer import schema_designer

SUBAGENTS = {
    # "schema_designer": schema_designer,  # DEPRECATED - use skill
    "api_architect": api_architect,
    # ...
}
```

**Verification**:
```bash
# Ensure subagent can't be called
grep -r "schema_designer" src/app_factory_leonardo_replit/agents/app_generator/agent.py
# Should return zero active references
```

---

#### Step 4.3: Update Agent Documentation

**File**: `src/app_factory_leonardo_replit/agents/app_generator/README.md` or `CLAUDE.md`

**Add to "Deprecated Components" section**:
```markdown
### Deprecated Subagents

| Subagent | Deprecated | Migration | Replacement |
|----------|------------|-----------|-------------|
| schema_designer | 2025-11-18 | [Summary](docs/SCHEMA_DESIGNER_TO_SKILL_MIGRATION_SUMMARY.md) | `schema-designer` skill |

**Why deprecated**: Skills provide full context awareness for resume/modification workflows.
```

---

### Phase 5: Create Migration Summary (30 minutes)

#### Step 5.1: Document Migration

**File**: `docs/{SUBAGENT_NAME}_TO_SKILL_MIGRATION_SUMMARY.md`

**Template**: See `docs/PIPELINE_PROMPT_CLEANUP_SUMMARY.md` as example

**Required Sections**:
1. **Executive Summary**
   - Action taken
   - Impact (line reduction, architecture simplification)

2. **Changes Made**
   - Skill file created (line count, key patterns)
   - Pipeline-prompt sections updated (before/after with line counts)
   - Subagent deregistered

3. **Total Impact**
   - Table: Section | Before | After | Removed
   - File size changes
   - Overlap elimination percentage

4. **Benefits**
   - Simpler architecture
   - Better resume support
   - Reduced duplication
   - Clearer roles
   - Maintainability

5. **Verification**
   - Files changed checklist
   - Pattern reconciliation checklist
   - Delegation updates checklist

---

#### Step 5.2: Update Master Migration Playbook

**File**: `docs/SUBAGENT_TO_SKILL_MIGRATION_PLAYBOOK.md` (this file)

**Add to "Completed Migrations" section**:
```markdown
## Completed Migrations

| Subagent | Skill | Date | Summary | Line Reduction |
|----------|-------|------|---------|----------------|
| schema_designer | schema-designer | 2025-11-18 | [Link](SCHEMA_DESIGNER_TO_SKILL_MIGRATION_SUMMARY.md) | 150 lines (7.7%) |
```

---

### Phase 6: Testing (1 hour)

#### Step 6.1: Test Skill Invocation

**Goal**: Verify main agent can access skill

**Method**:
```bash
# Test in new conversation with main agent
# User message: "Create a todo app with users and tasks tables"

# Expected behavior:
# 1. Main agent invokes schema-designer skill
# 2. Main agent creates schema.zod.ts with patterns applied
# 3. Main agent creates schema.ts with field parity
# 4. No errors about missing subagent
```

**Verification Points**:
- [ ] Skill file loads successfully
- [ ] Main agent applies auto-injected field pattern
- [ ] Main agent applies transform order pattern
- [ ] Main agent creates both schema.zod.ts and schema.ts
- [ ] Field parity maintained between files

---

#### Step 6.2: Test Resume Workflow

**Goal**: Verify skill handles modifications correctly

**Method**:
```bash
# In same app from Step 6.1
# User message: "Add a comments table with content, taskId, userId"

# Expected behavior:
# 1. Main agent detects existing schema.zod.ts
# 2. Main agent reads existing content
# 3. Main agent preserves users and tasks schemas
# 4. Main agent adds comments schema only
# 5. Field parity maintained
```

**Verification Points**:
- [ ] Existing schemas preserved (users, tasks)
- [ ] New schema added (comments)
- [ ] Foreign keys correct (taskId → tasks, userId → users)
- [ ] No duplicate schemas created
- [ ] Field parity maintained

---

#### Step 6.3: Verify Subagent Unavailable

**Goal**: Confirm deprecated subagent can't be called

**Method**:
```bash
# Try to invoke subagent directly (should fail)
# Expected: Error or fallback behavior
```

**Verification**:
- [ ] Subagent not in SUBAGENTS registry
- [ ] Task tool invocation fails gracefully
- [ ] Error message suggests using skill instead

---

## Quick Reference Checklist

Use this for future migrations:

### Pre-Migration
- [ ] Analyze overlap (Phase 1.1)
- [ ] Inventory patterns (Phase 1.2)
- [ ] Find all references (Phase 1.3)
- [ ] Decision: Should this be a skill? (see "Decision Criteria")

### Migration
- [ ] Create skill file (Phase 2.1-2.3)
- [ ] Copy to source control (Phase 2.4)
- [ ] Remove pipeline-prompt bloat (Phase 3.1)
- [ ] Update delegation mandate (Phase 3.2)
- [ ] Update examples (Phase 3.3)
- [ ] Archive subagent (Phase 4.1)
- [ ] Update registry (Phase 4.2)
- [ ] Update docs (Phase 4.3)
- [ ] Create migration summary (Phase 5.1-5.2)

### Post-Migration
- [ ] Test skill invocation (Phase 6.1)
- [ ] Test resume workflow (Phase 6.2)
- [ ] Verify subagent unavailable (Phase 6.3)
- [ ] Commit to git with descriptive message

---

## Completed Migrations

| Subagent | Skill | Date | Summary | Line Reduction |
|----------|-------|------|---------|----------------|
| schema_designer | schema-designer | 2025-11-18 | [Link](PIPELINE_PROMPT_CLEANUP_SUMMARY.md) | 153 lines (7.9%) |
| ui_designer | ui-designer | 2025-11-21 | [Link](UI_DESIGNER_TO_SKILL_MIGRATION_SUMMARY.md) | Minimal bloat (6 lines in pipeline) |

---

## Candidate Subagents for Migration

### High Priority
- **api_architect** (~40 lines bloat)
  - **Reason**: Contract modifications common in resume scenarios
  - **Benefit**: Better awareness of existing contracts, routes

### Medium Priority
- **ui_designer** (~280 lines bloat)
  - **Reason**: Component modifications, design system updates
  - **Benefit**: Full context on existing design tokens, components

### Low Priority
- **code_writer** (~350 lines bloat)
  - **Reason**: Already handles varied tasks well
  - **Concern**: Large scope, may need multiple skills (routes-writer, pages-writer)

### Not Recommended
- **quality_assurer**: Testing agent benefits from isolated context (focused validation)
- **error_fixer**: Debugging benefits from isolated context (focused problem-solving)
- **research_agent**: Research requires multi-turn reasoning with isolation
- **ai_integration**: Specialized complex task, less pattern-based

---

## Success Metrics

After migration, verify:
1. ✅ **Line Reduction**: Pipeline-prompt 5-10% smaller
2. ✅ **Overlap Elimination**: 50%+ redundancy removed
3. ✅ **Pattern Reconciliation**: 100% of P0 patterns in skill
4. ✅ **Resume Support**: Existing code preserved in test
5. ✅ **Subagent Deregistered**: Can't be invoked accidentally

---

## Common Pitfalls

### Pitfall 1: Too Much in Skill
**Problem**: Including P1/P2 patterns makes skill bloated
**Solution**: P0 patterns ONLY (production failure prevention)

### Pitfall 2: Not Enough Context in Skill
**Problem**: Main agent doesn't know when to apply patterns
**Solution**: Include "When to Use" triggers and workflow (create vs modify)

### Pitfall 3: Forgetting Source Control Sync
**Problem**: Skill exists in ~/.claude but not in git
**Solution**: Always copy to ~/apps/app-factory/apps/.claude/skills/

### Pitfall 4: Incomplete Deregistration
**Problem**: Subagent still invokable, causes confusion
**Solution**: Remove from SUBAGENTS registry, archive file with .deprecated extension

### Pitfall 5: Pipeline-Prompt Still Has HOW Details
**Problem**: Duplication remains after migration
**Solution**: Follow Phase 3.1 template strictly - WHAT/WHEN/WHY only, no HOW

---

## Appendix: Example Diffs

### A. Skill File Structure (schema-designer)

```yaml
---
name: schema-designer
description: >
  Design type-safe database schemas with Zod validation and Drizzle ORM.
  Use when creating or modifying shared/schema.zod.ts and shared/schema.ts.
  Ensures field parity, security patterns, and validation best practices.
category: implementation
priority: P0
---

# Schema Designer

## When to Use

**MANDATORY** when:
- Creating `shared/schema.zod.ts` or `shared/schema.ts`
- Adding/modifying database entities
- User mentions "schema", "database", "tables", "data model"

**AUTO-INVOKE** on patterns: "add [entity] table", "modify schema", "create database"

---

## Core Patterns (6 Critical)

### 1. Auto-Injected Fields Security

**Problem**: Backend injects fields from `req.user` AFTER validation.

```typescript
// ✅ CORRECT: Omit auto-injected fields
export const insertOrdersSchema = ordersSchema.omit({
  id: true,           // Auto-generated
  userId: true,       // Injected from req.user.id
  createdAt: true,    // Auto-timestamp
});

// ❌ WRONG: Including userId → client can forge ownership
export const insertOrdersSchema = ordersSchema.omit({ id: true });
```

**Rule**: Omit id, userId, createdBy, createdAt, updatedAt from insert schemas.

---

{... 5 more patterns ...}

---

## Workflow

### New App (Create)
1. **Read plan.md** → Identify entities
2. **Create schema.zod.ts** with all entities + users table
3. **Create schema.ts** with exact field parity
4. **Validate**: Run checklist

### Existing App (Modify)
1. **Read existing**: schema.zod.ts and schema.ts
2. **Identify change**: ADD/MODIFY/DELETE entity
3. **Apply**: Preserve unmodified, add/modify as requested
4. **Validate**: Maintain field parity

---

## Templates

{Complete working examples}

---

## Validation Checklist

Before completing:
- [ ] Users table exists (both files)
- [ ] Every entity has table + insert schema
- [ ] Auto-injected fields omitted
- [ ] Exact field parity (Zod ↔ Drizzle)

---

## Common Mistakes

1. Including userId in insert → Security breach
2. Refine before omit → Compile error
3. Field name mismatch → Runtime error
```

**Total**: 266 lines (concise but complete)

---

### B. Pipeline-Prompt Update (schema section)

```diff
-#### 2.1.1 Zod Schema (`shared/schema.zod.ts`)
-
-**First file to create** - single source of truth for all types.
-
-```typescript
-import { z } from 'zod';
-
-// ALWAYS include users table
-export const users = z.object({
-  id: z.number(),
-  email: z.string().email(),
-  name: z.string(),
-  role: z.enum(['user', 'admin']),
-  createdAt: z.string().datetime(),
-});
-
-export const insertUsersSchema = users.omit({ id: true, createdAt: true });
-```
-
-**CRITICAL: Auto-Injected Fields**
-
-Omit fields that are auto-injected by backend from req.user:
-
-```typescript
-// ✅ CORRECT: Omit userId - injected from req.user.id
-export const insertOrdersSchema = ordersSchema.omit({
-  id: true,
-  userId: true,      // Auto-injected from req.user.id
-  createdAt: true,
-});
-```
-
-**CRITICAL: Zod Schema Transformation Order**
-
-```typescript
-// ✅ CORRECT: Transform → Refine
-const insertSchema = baseSchema
-  .omit({ id: true })      // Transform first
-  .refine((data) => ...);  // Refine last
-```
-
-**Principles**:
-- Every entity needs: table schema + insert schema
-- Use proper Zod types
-- Include relationships with foreign keys
-- Add validation constraints
-- ALL schemas live in schema.zod.ts

+#### 2.1.1 Schema Design (`shared/schema.zod.ts` and `shared/schema.ts`)
+
+**🔧 MANDATORY**: Invoke `schema-designer` skill BEFORE creating any schemas.
+
+**What you will learn**:
+1. Auto-injected fields security (omit id, userId, timestamps)
+2. Transform order (omit/partial BEFORE refine)
+3. Fixed UUIDs for seed data (RFC 4122 format)
+4. Query schema placement (all schemas in schema.zod.ts)
+5. Exact field parity between Zod and Drizzle
+6. Timestamp mode for JSON compatibility
+
+**After learning**, create schemas appropriately:
+- **NEW apps**: Create schema.zod.ts and schema.ts from scratch
+- **RESUME**: Read existing files and modify only what's requested
+- Automatically preserves existing schemas
+- Maintains field parity between Zod and Drizzle
+
+**Working directory**: `{app_path}/shared/`
+
+**After completion**: Verify both schema.zod.ts and schema.ts exist before proceeding to contracts.
+
+See: `~/.claude/skills/schema-designer/SKILL.md`
```

**Reduction**: 77 lines → 25 lines (52 lines removed, 67% reduction)

---

## FAQ

### Q: Should all subagents become skills?
**A**: No. Only pattern-based subagents that need full context for resume/modification workflows.

### Q: What if a subagent does both pattern application AND complex reasoning?
**A**: Consider splitting into skill (patterns) + subagent (reasoning). Example: routes-patterns skill + routes-optimizer subagent.

### Q: How do I know if I removed too much from pipeline-prompt?
**A**: Pipeline-prompt should answer: WHAT does this do? WHEN should I invoke it? WHY is it needed? If you can't answer these, add back orchestration guidance (not implementation).

### Q: Can I revert a migration?
**A**: Yes. Restore subagent from deprecated/, add back to SUBAGENTS, remove skill reference from pipeline-prompt. Use git history.

### Q: What if the skill file is too large (500+ lines)?
**A**: You included P1/P2 patterns. Reduce to P0 only. If still large, consider splitting into multiple focused skills.

---

## Version History

- **v1.0** (2025-11-18): Initial playbook based on schema_designer migration
