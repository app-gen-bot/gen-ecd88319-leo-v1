# Agent Editing Best Practices

## Problem: Wasteful File Regeneration

When agents fix issues based on Critic feedback, they often **regenerate entire files** instead of making targeted edits. This wastes:
- **Time**: Rewriting 500 lines to fix 3 import statements
- **Tokens**: Unnecessary LLM context and generation costs
- **Risk**: Can introduce new bugs while fixing old ones

## Solution: Prefer Edit Tools

Agents have access to powerful editing tools that should be used for iterations:

### Available Tools

1. **Edit** - Make precise string replacements in a single file
2. **MultiEdit** - Make the same edit across multiple files
3. **Write** - Create new files or completely overwrite (use sparingly for iterations)

### When to Use Each

#### Edit (Most Common)
```python
# Fix a single import statement
Edit(
    file_path="users.contract.ts",
    old_string="import { UserSchema } from '../schema.zod';",
    new_string="import { UserSchema, BookingWithRelationsSchema } from '../schema.zod';"
)
```

**Use when:**
- Fixing specific imports
- Correcting type annotations
- Updating function parameters
- Changing individual values

#### MultiEdit (For Patterns)
```python
# Fix z.number() → z.coerce.number() across multiple files
MultiEdit(
    files=["users.contract.ts", "chapels.contract.ts", "bookings.contract.ts"],
    old_string="page: z.number()",
    new_string="page: z.coerce.number()"
)
```

**Use when:**
- Same fix needed in multiple files
- Pattern-based corrections
- Bulk refactoring

#### Write (Rare for Iterations)
```python
# Only when file needs complete restructuring
Write(
    file_path="users.contract.ts",
    content="..."  # Complete file content
)
```

**Use when:**
- Creating new files
- File structure fundamentally changed
- Easier to rewrite than edit (rare!)

## Implementation in Prompts

### User Prompt (Iteration Mode)

**Before:**
```python
"Please regenerate the contracts based on this feedback..."
```

**After:**
```python
"""Please address issues by EDITING the existing contract files.

IMPORTANT: Use Edit/MultiEdit tools for targeted fixes.
DO NOT regenerate entire files unless absolutely necessary.

Steps:
1. Read each affected file
2. Use Edit tool to fix specific issues
3. Use MultiEdit for repeated patterns
4. Validate with oxc after fixes
"""
```

### System Prompt

Add section on iteration best practices:

```markdown
## Iteration Best Practices
When fixing issues based on Critic feedback:
1. **Prefer Edit over Write**: Use Edit tool for targeted fixes
2. **Use MultiEdit for repetitive fixes**: Efficient for patterns
3. **Only regenerate when necessary**: Last resort
4. **Read before editing**: Always read current content first
5. **Fix one issue at a time**: Make precise edits
```

## Example: Contracts Designer

### Before (Wasteful)
```
Critic: "Missing BookingWithRelationsSchema import in users.contract.ts"

Agent:
- Writes entire 500-line users.contract.ts file
- Writes entire 400-line chapels.contract.ts file
- Writes entire 600-line bookings.contract.ts file

Cost: ~1500 lines generated, 3 file writes, high token usage
```

### After (Efficient)
```
Critic: "Missing BookingWithRelationsSchema import in users.contract.ts"

Agent:
- Reads users.contract.ts (line 1-10)
- Edits import statement (1 edit)
- Validates with oxc

Cost: ~10 lines read, 1 edit, minimal token usage
```

**Savings: 99% reduction in tokens and time!**

## How to Apply to Your Agents

### 1. Update User Prompt

In `agents/{agent_name}/user_prompt.py`:

```python
if previous_critic_response:
    return f"""The Critic provided feedback:

{previous_critic_response}

IMPORTANT: Use Edit/MultiEdit tools to fix issues.
DO NOT regenerate entire files.

Steps:
1. Read affected files
2. Use Edit for specific fixes
3. Use MultiEdit for patterns
4. Validate after fixes
"""
```

### 2. Update System Prompt

In `agents/{agent_name}/system_prompt.py`:

```python
SYSTEM_PROMPT = """...

## Iteration Best Practices
When fixing issues:
1. Prefer Edit over Write for targeted fixes
2. Use MultiEdit for repeated patterns
3. Only regenerate when absolutely necessary
4. Read before editing
5. Fix one issue at a time
"""
```

### 3. Ensure Tools Available

In `agents/{agent_name}/config.py`:

```python
AGENT_CONFIG = {
    "allowed_tools": [
        "Read",
        "Edit",      # ← Required
        "MultiEdit", # ← Required for efficiency
        "Write",     # Keep for initial generation
        # ...
    ]
}
```

## Agents Already Updated

✅ **Contracts Designer** - Now uses Edit/MultiEdit for iterations
✅ **Frontend Interaction Spec** - Now uses Edit/MultiEdit for iterations

## Agents to Update

⏳ **Storage Generator** - Still regenerates storage.ts
⏳ **Routes Generator** - Still regenerates routes.ts
⏳ **Schema Designer** - May regenerate schema files
⏳ **App Shell Generator** - May regenerate App.tsx
⏳ **Page Generators** - May regenerate page files

## Measuring Success

### Before
```
Iteration 2: Writer regenerated 5 files (2000 lines)
Iteration 3: Writer regenerated 5 files (2000 lines)
Total: 4000 lines generated, $0.12 cost
```

### After
```
Iteration 2: Writer edited 3 imports (6 edits)
Iteration 3: Writer edited 2 functions (4 edits)
Total: 10 edits, $0.02 cost
```

**Expected savings: 80-95% reduction in tokens and cost per iteration**

## Summary

**Key Principle:** Agents should **edit existing code** during iterations, not regenerate everything.

**Implementation:**
1. Update user prompts to emphasize Edit/MultiEdit
2. Update system prompts with iteration best practices
3. Ensure Edit/MultiEdit tools are available in config

**Benefits:**
- Faster iterations (seconds vs minutes)
- Lower token costs (95% reduction)
- Fewer new bugs introduced
- More precise fixes

**Next Steps:**
- Apply pattern to remaining agents
- Monitor agent tool usage in logs
- Measure cost savings per iteration
