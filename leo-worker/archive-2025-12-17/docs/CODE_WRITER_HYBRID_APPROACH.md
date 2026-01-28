# code_writer Hybrid Approach

**Date**: 2025-11-23
**Status**: ✅ ACTIVE
**Type**: Hybrid (Subagent + Skill)

---

## Executive Summary

code_writer exists as BOTH a subagent and a skill, serving complementary purposes:
- **Subagent**: For AppGeneratorAgent to delegate code implementation tasks
- **Skill**: For pattern teaching before generation

### The Problem Solved

**Issue**: AppGeneratorAgent has enormous tasks and prefers delegation. Without a code_writer subagent available, it may:
- Delegate to inappropriate agents (research_agent for code implementation)
- Fail to find suitable delegation target
- Attempt complex code generation without proper guidance

**Solution**: Restore code_writer as subagent while keeping skill for pattern teaching.

---

## Architecture

### Subagent (For Delegation)

**Location**: `src/.../subagents/code_writer.py`
**Type**: AgentDefinition (file-read delegation pattern)
**Purpose**: Handle delegated code implementation from AppGeneratorAgent

**When AppGeneratorAgent Uses**:
```python
Task("Implement backend routes for users", `
Create routes/*.ts files with:
- User CRUD operations
- Auth middleware
- Proper error handling
- ESM imports (.js extensions)
`, "code_writer")
```

**Characteristics**:
- Isolated 200K context
- Reads pattern files from `docs/patterns/code_writer/*.md`
- Has 8 specialized tools: Read, Write, Edit, TodoWrite, Bash, mcp__build_test__verify_project, mcp__oxc, mcp__supabase
- Model: sonnet (for complex reasoning)
- Self-contained expert that can iterate independently

**Use Cases**:
- Implementing backend routes (`server/routes/*.ts`)
- Creating frontend pages (`client/src/pages/*.tsx`)
- Writing storage methods
- Complex multi-file implementations
- When dedicated focus on code implementation is needed

### Skill (For Pattern Teaching)

**Location**: `~/.claude/skills/code-writer/SKILL.md` (536 lines)
**Purpose**: Teach 8 critical patterns before generation

**When AppGeneratorAgent Invokes**:
```
Invoke code-writer skill
```

**Patterns Taught**:
1. Storage Completeness - No stub methods
2. Interactive State - No mock data, use real APIs
3. ESM Imports - .js extensions required
4. Auth Helpers - Token management utilities
5. Wouter Routing - Client-side navigation
6. ID Flexibility - Handle nested resources
7. ts-rest v3 API Client - Typed API calls
8. React Query Provider - Required setup

**Characteristics**:
- Skill file with templates and workflows
- Agent reads, learns, and applies patterns
- Full conversation context available
- Focus on practical templates + common mistakes
- Time-saving best practices

**Use Cases**:
- Before starting any code implementation
- When main agent needs to understand code quality standards
- To review templates and workflows
- Learning patterns that will be applied in implementation

---

## Recommended Workflow

### Hybrid Pattern (Best Practice)

**Step 1: Learn Patterns** (Skill)
```
Invoke code-writer skill
```
- Agent learns 8 critical patterns
- Reviews templates and workflows
- Understands common mistakes to avoid
- Has full conversation context

**Step 2: Delegate Implementation** (Subagent)
```python
Task("Implement backend routes for users", `
Create server/routes/users.routes.ts with:
- List all users (GET /users)
- Get user by ID (GET /users/:id)
- Create user (POST /users)
- Update user (PUT /users/:id)
- Delete user (DELETE /users/:id)

Apply code-writer patterns:
- Storage completeness (no stubs)
- Auth middleware on all routes
- ESM imports with .js extensions
- Proper error handling
`, "code_writer")
```
- Subagent implements with isolated context
- Applies learned patterns
- Can iterate independently if needed

**Step 3: Validate** (Subagent)
```python
Task("Validate implementation", "Run all validation checks", "quality_assurer")
```
- Ensures code quality
- Catches pattern violations
- Verifies type safety

### Alternative: Direct Implementation

For simpler cases, main agent can implement directly after learning from skill:

```
# Step 1: Learn patterns
Invoke code-writer skill

# Step 2: Implement directly (main agent)
# Agent now has pattern knowledge and full context
# Implements simple routes/pages without delegation
```

**When to use direct implementation**:
- Simple CRUD routes (< 50 LOC)
- Single-file changes
- Quick modifications
- Straightforward implementations

**When to use subagent delegation**:
- Complex multi-file implementations
- Large pages (200+ LOC)
- Backend + frontend coordination
- When iteration may be needed

---

## Pattern Files (Shared Resource)

Both subagent and skill reference the same pattern files:

```
docs/patterns/code_writer/
├── STORAGE_COMPLETENESS.md (4.7K) - No stub methods
├── INTERACTIVE_STATE.md (3.7K) - No mock data
├── ESM_IMPORTS.md (2.7K) - .js extensions
├── AUTH_HELPERS.md (3.1K) - Token management
├── WOUTER_ROUTING.md (3.3K) - Client-side routing
├── WOUTER_LINK.md (2.1K) - Link component usage
├── ID_FLEXIBILITY.md (3.5K) - Nested resource handling
├── TS_REST_V3_API.md (8.6K) - Typed API client
├── REACT_QUERY_PROVIDER.md (12K) - Setup requirements
├── DATE_CALCULATIONS.md (3.0K) - Edge case handling
├── CODE_PATTERNS.md (9.3K) - General patterns
├── CORE_IDENTITY.md (4.4K) - Identity and purpose
├── PROXY_METHOD_BINDING.md (13K) - Factory patterns
├── SHADCN_EXPORTS.md (10K) - Component usage
├── VALIDATION_CHECKLIST.md (12K) - Quality checks
└── RECONCILIATION_REPORT.md (11K) - Pattern reconciliation

Total: 16 files, ~107KB
```

**Key Insight**: Pattern files are maintained in ONE place, used by BOTH subagent and skill. Updates to patterns automatically benefit both.

---

## Comparison: Subagent vs Skill

| Aspect | Subagent | Skill |
|--------|----------|-------|
| **Purpose** | Execute implementation | Teach patterns |
| **Context** | Isolated (200K) | Full conversation |
| **Tools** | 8 specialized tools | None (teaching only) |
| **Size** | 214 lines (file-read pattern) | 536 lines (embedded patterns) |
| **Pattern Access** | Reads from docs/patterns/ | Embedded in SKILL.md |
| **When Used** | Task delegation | Skill invocation |
| **Iteration** | Can iterate independently | No iteration (one-time read) |
| **Best For** | Complex implementation | Pattern learning |
| **Model** | sonnet | N/A (agent reads) |

---

## No Conflicts

**Question**: Don't subagent and skill duplicate each other?

**Answer**: No - they serve different purposes:

### Subagent (Execute)
- **Role**: Worker - implements code
- **Input**: Delegation from AppGeneratorAgent
- **Output**: Working code files
- **Process**: Read patterns → Implement → Validate → Iterate if needed
- **Context**: Isolated (focused on specific task)

### Skill (Teach)
- **Role**: Teacher - imparts knowledge
- **Input**: Skill invocation from AppGeneratorAgent
- **Output**: Pattern knowledge in agent's context
- **Process**: Agent reads skill → Learns patterns → Applies in main context
- **Context**: Full conversation (aware of entire app)

### Analogy

**Skill** = Textbook (teaches concepts)
**Subagent** = Lab TA (does the work with you)

You read the textbook first, then work with the TA to apply what you learned.

---

## Benefits of Hybrid Approach

### 1. Clean Delegation
```python
# AppGeneratorAgent has clear delegation target
Task("Implement routes", ..., "code_writer")  # ✅ Works
# vs
Task("Implement routes", ..., "research_agent")  # ❌ Wrong expert
```

### 2. Pattern Learning + Application
```python
# Agent learns patterns in full context
Invoke code-writer skill  # Learn with conversation awareness

# Then applies patterns via subagent
Task("Implement", ..., "code_writer")  # Apply with isolated focus
```

### 3. Flexibility
- **Simple tasks**: Skill only (agent implements directly)
- **Complex tasks**: Skill + Subagent (learn then delegate)
- **Very complex**: Subagent can iterate independently

### 4. Consistency with Other Agents
- research_agent: Subagent only (no skill needed)
- quality_assurer: Subagent only (validation, not teaching)
- error_fixer: Subagent only (fixing, not teaching)
- **code_writer**: HYBRID (both needed)
- schema-designer: Skill only (teaching, main agent creates files)
- api-architect: Skill only (teaching, main agent creates files)
- ui-designer: Skill only (teaching, main agent creates files)

**Pattern**: Skills teach, subagents execute. code_writer uniquely needs both.

### 5. Pattern File Maintenance
- Single source of truth: `docs/patterns/code_writer/*.md`
- Update once, benefits both subagent and skill
- No duplication, no drift

---

## Historical Context

### Original State (Before Nov 18)
- code_writer: ✅ Subagent (1,041 line embedded prompt)
- code_writer: ❌ No skill

### After Migration (Nov 18 - Nov 23)
- code_writer: ❌ Deprecated subagent
- code_writer: ✅ Skill (536 lines)
- **Problem**: No delegation target for code implementation

### Current State (Nov 23+)
- code_writer: ✅ Subagent (214 lines, file-read pattern)
- code_writer: ✅ Skill (536 lines, embedded patterns)
- **Solution**: Hybrid approach serves both needs

### Why Revert?

**User Insight**: "Because of the enormity of most tasks, [AppGeneratorAgent] wants to delegate to sub agents and if it doesn't find any relevant subagents, it ends up delegating to whatever it finds to help out."

**Key Realization**: Without code_writer subagent, AppGeneratorAgent might:
- Delegate code tasks to research_agent (wrong expertise)
- Delegate code tasks to quality_assurer (validation expert, not implementation)
- Try to implement complex code itself (suboptimal for large tasks)

**Solution**: Provide dedicated code_writer subagent as proper delegation target.

---

## Technical Details

### Subagent Implementation

```python
# code_writer.py structure
from .research_agent import AgentDefinition

code_writer = AgentDefinition(
    description="Write production-ready TypeScript/React code",
    prompt="""
    [Reads pattern files from docs/patterns/code_writer/*.md]

    Your task: Implement production code following 13 critical patterns:
    1. Storage completeness (no stubs)
    2. Interactive state (no mock data)
    3. ESM imports (.js extensions)
    4. Auth helpers (token management)
    5. Wouter routing (client-side navigation)
    ... [references pattern files]

    BEFORE writing code:
    - READ ALL 13 PATTERN FILES
    - Understand data types from schemas
    - Plan implementation following patterns

    AFTER writing code:
    - Run validation checklist
    - Verify type checking passes
    - Ensure linting passes
    """,
    tools=["Read", "Write", "Edit", "TodoWrite", "Bash",
           "mcp__build_test__verify_project", "mcp__oxc", "mcp__supabase"],
    model="sonnet"
)
```

### Skill Structure

```markdown
---
name: code-writer
description: Production-ready TypeScript/React code patterns
category: implementation
priority: P0
---

## When to Use
- Implementing backend routes
- Creating frontend pages
- Adding CRUD operations

## Core Patterns (8 Critical)
1. Storage Completeness - No Stubs
2. Interactive State - No Mock Data
3. ESM Imports - .js Extensions
... [detailed patterns with examples]

## Templates
### Backend Route
[Complete working template]

### Frontend Page
[Complete working template]

## Workflow
1. Read schemas and contracts
2. Plan implementation
3. Write code applying all patterns
4. Validate with quality_assurer
```

---

## Usage Guidelines for AppGeneratorAgent

### When to Invoke Skill

✅ **ALWAYS invoke before code implementation**:
```
Invoke code-writer skill
```

Reasons:
- Learn 8 critical patterns
- Understand templates and workflows
- Review common mistakes
- Prepare for implementation

### When to Delegate to Subagent

✅ **Delegate for complex implementations**:
```python
Task("Implement backend routes", `[detailed requirements]`, "code_writer")
Task("Create frontend pages", `[detailed requirements]`, "code_writer")
```

Reasons:
- Multi-file implementations
- Large pages (200+ LOC)
- Complex business logic
- Need for independent iteration

### When to Implement Directly

✅ **Implement yourself after learning from skill**:
- Simple CRUD routes (< 50 LOC)
- Single-file changes
- Quick modifications
- You have full context and just learned patterns

### Anti-Patterns

❌ **DON'T delegate code to wrong subagents**:
```python
Task("Implement routes", ..., "research_agent")  # Wrong!
Task("Create pages", ..., "quality_assurer")     # Wrong!
```

❌ **DON'T skip skill invocation**:
```python
Task("Implement routes", ..., "code_writer")  # Missing skill!
# Should be:
# 1. Invoke code-writer skill
# 2. Task(..., "code_writer")
```

❌ **DON'T implement complex code without delegation**:
```python
# For 500+ LOC implementation, delegate instead
Invoke code-writer skill
# Then implement 500 LOC yourself ← Too complex!
# Better: Task(..., "code_writer")
```

---

## Success Metrics

### How to Verify Hybrid Approach Works

**Check 1: Subagent Available**
```bash
uv run python -c "
from src.app_factory_leonardo_replit.agents.app_generator.subagents import get_all_subagents
print('code_writer' in get_all_subagents())
"
# Expected: True
```

**Check 2: Skill Accessible**
```bash
test -f ~/.claude/skills/code-writer/SKILL.md && echo "✅ Skill exists"
# Expected: ✅ Skill exists
```

**Check 3: Pattern Files Available**
```bash
ls docs/patterns/code_writer/*.md | wc -l
# Expected: 16
```

**Check 4: Delegation Works**
- AppGeneratorAgent can delegate code tasks to code_writer subagent
- Subagent receives task and implements with pattern knowledge
- No "subagent not found" errors

**Check 5: Skill Invocation Works**
- AppGeneratorAgent can invoke code-writer skill
- Agent learns patterns before implementation
- Pattern knowledge applied in subsequent code

---

## Rollback Plan (If Needed)

If hybrid approach causes issues:

```bash
# 1. Remove subagent
mv src/.../subagents/code_writer.py \
   src/.../subagents/code_writer.py.disabled

# 2. Comment out in __init__.py
# from .code_writer import code_writer

# 3. Remove from get_all_subagents()

# 4. Revert pipeline-prompt.md changes

# 5. Commit
git commit -m "revert: Disable code_writer subagent (skill-only)"

# Skill remains, back to skill-only approach
```

---

## Related Documents

- **CODE_WRITER_RESTORATION_PLAN.md**: Complete restoration plan
- **CODE_WRITER_INVESTIGATION_FINDINGS.md**: Why skill-only wasn't enough
- **CODE_WRITER_REVERSION_PLAN.md**: Original investigation into migration
- **CODE_WRITER_DEEP_ANALYSIS.md**: Migration analysis from Nov 18
- **CODE_WRITER_TO_SKILL_MIGRATION_SUMMARY.md**: Migration details

---

## Conclusion

The hybrid approach provides:
1. ✅ Clean delegation target for AppGeneratorAgent
2. ✅ Pattern teaching before implementation
3. ✅ Flexibility for simple vs complex tasks
4. ✅ Consistency with other agents
5. ✅ Single source of truth for patterns

**Status**: Active and recommended approach for code_writer.

---

**Document Status**: ✅ ACTIVE
**Author**: Claude Code Analysis
**Date**: 2025-11-23
**Version**: 1.0
