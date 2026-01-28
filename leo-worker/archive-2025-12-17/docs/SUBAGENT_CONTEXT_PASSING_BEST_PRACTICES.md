# Subagent Context Passing: Best Practices for AppGeneratorAgent

## Executive Summary

**Key Finding from Anthropic Documentation**: Subagents operate with **isolated context windows** and **start with a clean slate** each time invoked. They **DO NOT** automatically inherit the main agent's conversation history or prior context.

**Implication**: The main agent MUST provide ALL necessary context explicitly in the Task prompt - including existing code state, schema files, and modification requirements for resume/iterative scenarios.

---

## Official Anthropic Guidance

### Isolated Context Architecture

From [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents):

> "Each subagent operates in its own context, preventing pollution of the main conversation"
>
> "Subagents start off with a clean slate each time they are invoked and must gather their own context"

### What Gets Passed

**Explicit only**: Subagents receive:
- ✅ The task prompt you provide to Task tool
- ✅ Their own system prompt (from subagent definition)
- ✅ Their configured tools
- ❌ **NOT** the main agent's conversation history
- ❌ **NOT** the main agent's context automatically

### Resume Feature

> "Resumed agents maintain full context from its previous conversation"

**BUT**: This refers to resuming **the same subagent execution**, NOT automatically passing context from the main agent.

---

## The Problem for AppGeneratorAgent

### Current Context Passing (Insufficient for Resume)

**In pipeline-prompt.md (lines 1926-1929)**:
```python
Task("Design database schemas", f"""
Create schema.zod.ts and schema.ts for the following entities:

From plan.md:
{entities_list}
""", "schema_designer")
```

**Problem**: This only works for **initial generation**:
- Assumes schema.zod.ts doesn't exist
- Only provides entities from plan.md
- Doesn't account for **existing schemas** that need modification
- Doesn't provide **existing file contents** for reference

### Resume Scenario (Not Currently Handled)

**User Request**: "Add a `posts` table with title, content, and userId foreign key"

**What schema_designer needs to know**:
1. **Existing schema.zod.ts contents** - to add to, not replace
2. **Existing schema.ts contents** - to maintain field parity
3. **Existing entities** - users, orders, etc. (for relationship context)
4. **Modification type** - ADD new table vs MODIFY existing vs DELETE
5. **Relationship requirements** - userId foreign key to users table

**What schema_designer currently gets**:
- Only: "entities from plan.md"
- Missing: All 5 critical pieces above

**Result**: schema_designer creates schema from scratch, **overwrites existing schema**, loses all prior entities.

---

## Research Findings: LLM Context Awareness

### Question: "Can LLMs automatically know what context to pass?"

**Answer**: **NO** - research shows explicit context passing is required.

### From Context Engineering Research

> "A common misconception in early multi-agent system designs was the belief that simply copying the initial task context to all subagents would suffice. This approach fundamentally misunderstands the dynamic nature of LLM agent operation."
>
> "A static context transfer means that subagents only have a snapshot of the initial state, entirely missing the rich, evolving narrative of the main agent's interaction history."
>
> **Source**: "Context Engineering for Multi-Agent LLM Code Assistants" (2025)

### Key Insight

**Constraining context is NOT the problem** - the LLM won't automatically pass everything. You MUST explicitly tell it what to include.

**Example**:
```python
# ❌ WRONG: LLM won't automatically add existing schema
Task("Design schemas", "Create schema.zod.ts for: posts, comments", "schema_designer")

# ✅ CORRECT: Explicitly provide existing context
Task("Design schemas", f"""
EXISTING SCHEMA (shared/schema.zod.ts):
{read_file('shared/schema.zod.ts')}

TASK: ADD the following new entities while preserving existing ones:
- posts (title, content, userId foreign key)
- comments (content, postId foreign key, userId foreign key)

Requirements:
- KEEP all existing schemas (users, orders, etc.)
- ADD new schemas maintaining field parity with existing style
- ENSURE foreign keys reference existing tables
""", "schema_designer")
```

---

## Anthropic's Recommended Pattern

### Best Practice: "Write Detailed Prompts"

From official documentation:

> "Write detailed prompts with specific instructions and examples"
>
> "Be descriptive when invoking subagents explicitly"

### Applied to AppGeneratorAgent

**For Initial Generation**:
```python
Task("Design database schemas", f"""
Create schema.zod.ts and schema.ts for a NEW application.

Entities required (from plan.md):
{'\n'.join(f'- {entity["name"]}: {entity["fields"]}' for entity in entities)}

Users table MUST be included with:
- id, email, name, role, createdAt

Working directory: {app_path}/shared/
""", "schema_designer")
```

**For Resume/Modification**:
```python
# First, read existing schemas
existing_zod_schema = read_file(f'{app_path}/shared/schema.zod.ts')
existing_drizzle_schema = read_file(f'{app_path}/shared/schema.ts')

Task("Modify database schemas", f"""
EXISTING SCHEMAS:

=== shared/schema.zod.ts ===
{existing_zod_schema}

=== shared/schema.ts ===
{existing_drizzle_schema}

MODIFICATION REQUEST:
{user_modification_request}

REQUIREMENTS:
1. PRESERVE all existing schemas
2. ADD/MODIFY only what's requested
3. MAINTAIN exact field parity between Zod and Drizzle
4. UPDATE foreign key relationships if needed
5. KEEP existing validation rules unless changing them

Working directory: {app_path}/shared/
""", "schema_designer")
```

---

## Solution Architecture

### 1. Main Agent Context Awareness

**Main agent needs to know**:
- Is this initial generation or resume?
- What files exist in the app directory?
- What modifications are being requested?

**Implementation in agent.py**:
```python
async def resume_generation(self, app_path: str, additional_instructions: str):
    # Check what exists
    schema_zod_path = Path(app_path) / "shared/schema.zod.ts"
    schema_ts_path = Path(app_path) / "shared/schema.ts"

    context = {
        "mode": "resume",
        "existing_files": {
            "schema.zod.ts": schema_zod_path.exists(),
            "schema.ts": schema_ts_path.exists(),
            # ... check other files
        },
        "modification_request": additional_instructions
    }

    # Main agent uses this context to decide what to pass to subagents
```

### 2. Conditional Context Passing

**Pipeline-prompt.md guidance** should teach main agent:

```markdown
### When to Delegate to schema_designer

**For Initial Generation**:
- Provide: entities from plan.md
- Mode: Create new schemas

**For Resume/Modification**:
- Read existing schema.zod.ts and schema.ts first
- Provide: existing schema contents + modification request
- Mode: Modify existing schemas

**Task prompt template**:

```python
# Detect mode
if Path(f"{app_path}/shared/schema.zod.ts").exists():
    mode = "MODIFY"
    existing_content = read_file(f"{app_path}/shared/schema.zod.ts")
else:
    mode = "CREATE"
    existing_content = None

# Construct prompt
if mode == "CREATE":
    task_prompt = f"""
    Create NEW schemas for these entities:
    {entities_list}
    """
else:  # MODIFY
    task_prompt = f"""
    EXISTING SCHEMA:
    {existing_content}

    MODIFICATION:
    {user_request}

    PRESERVE existing schemas, modify only what's requested.
    """

Task("Design schemas", task_prompt, "schema_designer")
```
```

### 3. Pattern for All Subagents

**This applies to ALL subagents**:

| Subagent | Initial Generation Context | Resume Context |
|----------|---------------------------|----------------|
| **schema_designer** | Entities from plan.md | Existing schema.zod.ts + schema.ts + modification request |
| **api_architect** | Schema file paths | Existing contracts/ + existing routes/ + modification request |
| **code_writer** | Specs and dependencies | Existing file contents + modification type + requirements |
| **ui_designer** | Design requirements | Existing components/ + existing pages/ + modification request |
| **quality_assurer** | App path | App path (same - reads files itself) |
| **error_fixer** | Error messages + file paths | Error messages + existing file contents + error context |

---

## Updated Pipeline-Prompt Guidance

### Replace Section 2.1.1 with Context-Aware Delegation

```markdown
#### 2.1.1 Schema Design

**DELEGATE TO**: `schema_designer` subagent

**Context to provide depends on mode:**

```python
# Check if schemas exist
schema_exists = Path(f"{app_path}/shared/schema.zod.ts").exists()

if schema_exists:
    # RESUME MODE: Read existing schemas
    existing_zod = read_file(f"{app_path}/shared/schema.zod.ts")
    existing_drizzle = read_file(f"{app_path}/shared/schema.ts")

    task_context = f"""
    EXISTING SCHEMAS:

    === schema.zod.ts ===
    {existing_zod}

    === schema.ts ===
    {existing_drizzle}

    MODIFICATION REQUEST:
    {additional_instructions}

    REQUIREMENTS:
    - PRESERVE all existing schemas unless explicitly modifying them
    - ADD new schemas requested
    - MODIFY only schemas mentioned in request
    - MAINTAIN exact field parity between Zod and Drizzle
    - UPDATE foreign keys if relationships change

    Working directory: {app_path}/shared/
    """
else:
    # INITIAL MODE: Create from scratch
    task_context = f"""
    Create NEW database schemas for the following entities:

    {entities_from_plan}

    ALWAYS include a users table with:
    - id, email, name, role, createdAt

    Working directory: {app_path}/shared/
    """

# Delegate with appropriate context
Task("Design database schemas", task_context, "schema_designer")
```

**Key principle**: Main agent detects mode (create vs modify) and provides appropriate context.
```

---

## Verification: Does LLM Need Explicit Instructions?

### Experiment

**Question**: If we just say "delegate to schema_designer for entities from plan.md", will Claude automatically include existing schemas in resume mode?

**Answer from Research**: **NO**

### Evidence

1. **Anthropic Documentation**: "Subagents start with a clean slate"
2. **Context Engineering Research**: "Static context transfer misses evolving narrative"
3. **Multi-Agent System Studies**: "Subagents based on conflicting assumptions not prescribed upfront"

### Conclusion

**You MUST be explicit**. The LLM will NOT automatically:
- Detect it's a resume scenario
- Read existing files
- Include prior context
- Infer what's needed

**You MUST tell it to**:
- Check if files exist
- Read existing files if they do
- Provide existing contents to subagent
- Specify preserve vs modify mode

---

## Implementation Checklist

### Phase 1: Update Pipeline-Prompt.md

- [x] Add "mode detection" guidance (create vs resume)
- [ ] Add conditional context passing examples
- [ ] Update ALL subagent delegation sections with two modes
- [ ] Remove static "entities from plan.md" instruction
- [ ] Add "read existing files first" pattern

### Phase 2: Update App Generator Agent

- [ ] Add file existence checks in resume_generation()
- [ ] Add file reading utilities for existing code
- [ ] Pass "mode" flag to main agent via context
- [ ] Update session data to include file states

### Phase 3: Pattern for Each Subagent

**For each subagent, document**:
1. Initial generation context (what to provide)
2. Resume context (what to provide)
3. How to detect mode
4. Example Task prompts for both modes

### Phase 4: Testing

- [ ] Test initial generation (no existing code)
- [ ] Test resume with schema modification
- [ ] Test resume with route addition
- [ ] Test resume with page modification
- [ ] Verify existing code is preserved

---

## Example: Complete Resume Flow

### User Request

"Add a `posts` table with title, content, userId foreign key, and a `comments` table"

### Main Agent Workflow

```python
# 1. Detect mode
app_path = "apps/blog/app"
schema_path = Path(app_path) / "shared/schema.zod.ts"

if schema_path.exists():
    mode = "RESUME"
    print("📝 Resuming existing app - reading current schemas...")

    # 2. Read existing context
    existing_zod = read_file(schema_path)
    existing_drizzle = read_file(Path(app_path) / "shared/schema.ts")

    # 3. Construct context-rich prompt
    task_prompt = f"""
    EXISTING SCHEMA (shared/schema.zod.ts):
    ```typescript
    {existing_zod}
    ```

    EXISTING DRIZZLE SCHEMA (shared/schema.ts):
    ```typescript
    {existing_drizzle}
    ```

    USER REQUEST: Add a `posts` table with title, content, userId foreign key,
    and a `comments` table with content, postId foreign key, userId foreign key.

    REQUIREMENTS:
    1. PRESERVE all existing schemas (users, orders, etc.)
    2. ADD posts schema to schema.zod.ts:
       - id: number
       - title: string
       - content: string
       - userId: number (foreign key to users)
       - createdAt: datetime
    3. ADD comments schema to schema.zod.ts:
       - id: number
       - content: string
       - postId: number (foreign key to posts)
       - userId: number (foreign key to users)
       - createdAt: datetime
    4. ADD corresponding Drizzle tables to schema.ts
    5. MAINTAIN exact field parity between Zod and Drizzle
    6. Use established patterns from existing schemas

    Working directory: {app_path}/shared/
    """

    # 4. Delegate with full context
    result = Task("Modify database schemas", task_prompt, "schema_designer")
else:
    # Initial generation flow...
```

### schema_designer Receives

- ✅ Full existing schema.zod.ts content
- ✅ Full existing schema.ts content
- ✅ Clear modification request
- ✅ Explicit "PRESERVE existing" instruction
- ✅ Specific new entities to ADD
- ✅ Field requirements
- ✅ Foreign key relationships
- ✅ Working directory

### schema_designer Can Now

- Read existing schemas (already provided)
- Understand current data model
- Add new tables without losing existing ones
- Maintain consistency with existing patterns
- Update foreign keys correctly

---

## Conclusion

### The Answer

**"Does the LLM automatically handle passing context?"**

**NO.** You must:
1. ✅ Explicitly detect resume vs initial mode
2. ✅ Explicitly read existing files
3. ✅ Explicitly provide existing contents to subagent
4. ✅ Explicitly instruct "PRESERVE existing + ADD new"

**"Are we constraining it by only mentioning plan.md?"**

**YES.** Current guidance is insufficient for resume scenarios:
- Only works for initial generation
- Doesn't account for existing code
- Loses context when modifying
- Subagent overwrites instead of extending

### Action Required

**Update pipeline-prompt.md** to teach main agent:
1. Detect mode (file existence checks)
2. Read existing files in resume mode
3. Provide appropriate context to subagents
4. Use conditional Task prompts

**Result**: Subagents can successfully:
- Preserve existing code
- Add new features
- Modify specific components
- Maintain consistency across changes

**Without this**: Resume functionality will fail - subagents recreate from scratch, losing all prior work.
