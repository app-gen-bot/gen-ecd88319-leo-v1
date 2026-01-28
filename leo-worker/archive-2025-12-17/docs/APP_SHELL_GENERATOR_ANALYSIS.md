# App Shell Generator - First Principles Analysis

**Date**: 2025-10-11
**Analyst**: Claude
**Purpose**: Deep dive into AppShellGenerator to understand its design and identify issues

---

## 1. Agent Design Overview

### Architecture

The `AppShellGeneratorAgent` follows the standard Writer-Critic pattern:

```
AppShellGeneratorAgent (agent.py)
├── Initialization: Sets up cc_agent.Agent with MCP tools
├── generate_app_shell(): Main entry point
│   ├── Creates user prompt (with previous_critic_xml)
│   ├── Runs agent with prompt
│   └── Returns (success, "", message) tuple
└── Helper methods (unused):
    ├── _strip_markdown_wrapper()
    └── _validate_app_shell_code()
```

**Key Observation**: The agent wrapper is **very thin** - it creates a prompt and trusts the agent to do the work. The helper methods for validation exist but are **never called**.

---

## 2. What the Agent is Supposed to Do

### From System Prompt (system_prompt.py)

**Input Files** (agent reads these):
1. `specs/pages-and-routes.md` - Technical architecture with ALL pages and routes
2. `specs/plan.md` - App purpose and features
3. `shared/schema.ts` - Database schema

**Output File** (agent creates):
1. `client/src/App.tsx` - Complete app shell with routing for ALL pages

**Key Requirements**:
- Use **Wouter** for routing (NOT React Router)
- Import ALL pages from `specs/pages-and-routes.md`
- Create routes for EVERY page defined in tech spec
- Add providers: QueryClient, Toaster, TooltipProvider
- Include error boundaries
- Use Write tool to create the file
- Validate with oxc and build_test

**Critical Instruction** (line 213):
> "Generate complete multi-page App shell to `client/src/App.tsx` using the Write tool"

---

## 3. Bugs Identified

### Bug #1: Wrong File Name in User Prompt ⚠️ CRITICAL

**Location**: `user_prompt.py` line 16

**Current (WRONG)**:
```python
prompt = """Please read the technical architecture spec, plan, and schema to generate the main App.tsx shell component.

## Your Task

1. **Read the technical architecture spec** from `specs/technical-architecture-spec.md` to understand the exact page structure, routes, and component hierarchy
```

**Expected (CORRECT)**:
```python
1. **Read the technical architecture spec** from `specs/pages-and-routes.md` to understand the exact page structure, routes, and component hierarchy
```

**Evidence**:
- `build_stage.py` line 1037: `tech_spec_path = specs_dir / "pages-and-routes.md"`
- System prompt references `specs/pages-and-routes.md` throughout

**Impact**: Agent tries to read a file that doesn't exist, cannot understand page structure, generates incomplete/incorrect App.tsx

---

### Bug #2: Agent Not in Pipeline Execution ⚠️ CRITICAL

**Location**: `stages/build_stage.py` lines 1110-1213

**Current State**:
- ✅ Agent imported (line 39)
- ✅ Critic imported (line 57)
- ✅ Docstring mentions it (line 881)
- ✅ Validation checks for it (line 1604)
- ❌ **NOT in agent_pairs list** (missing from execution)

**Current Pipeline** (7 agents):
1. Schema Generator
2. Storage Generator
3. Routes Generator
4. API Client Generator
5. Frontend Interaction Spec (Master)
6. Layout Generator
7. Frontend Implementation

**App Shell Generator is MISSING!**

**Impact**: Agent never runs, App.tsx never created, app cannot run

---

### Bug #3: Known File Creation Bug (Documented)

**Location**: `critic/system_prompt.py` lines 5-24

The critic explicitly warns:

> "🚨🚨🚨 CRITICAL ROLE: CATCH THE APP SHELL FILE CREATION BUG! 🚨🚨🚨
>
> This is THE MOST IMPORTANT CRITIC in the entire pipeline because:
> **THE APP SHELL GENERATOR WRITER HAS A KNOWN BUG - IT DOESN'T CREATE FILES!**"

**Writer Behaviors** (from critic prompt):
- Claims "SUCCESS - App.tsx created" but creates NO FILE
- Describes what code "would look like" instead of writing it
- Says "I would write" but never uses Write tool
- Exits successfully while leaving file missing

**Root Cause Analysis**:

Looking at `agent.py` line 66:
```python
# Trust the agent's success status - if Critic can't verify files, we have bigger issues
return True, "", "App shell generated and written successfully"
```

The wrapper **blindly trusts** the cc_agent.Agent's success status without verifying the file was created. If the LLM says "I've written the file" but doesn't actually use the Write tool, the wrapper returns success anyway.

**This is a design flaw**: The wrapper should verify the file exists before returning success.

---

## 4. Why These Bugs Happened

### Root Cause #1: File Name Mismatch
- Technical spec file was renamed from `technical-architecture-spec.md` to `pages-and-routes.md`
- System prompt was updated
- User prompt was **not updated** (stale reference)

### Root Cause #2: Pipeline Refactoring
- During pipeline refactoring, App Shell Generator was removed from agent_pairs
- Imports and documentation remained, but execution was lost
- No integration test caught this

### Root Cause #3: Trusting LLM Output
- Agent wrapper trusts cc_agent.Agent success status
- LLMs can claim success without actually using tools
- No file existence verification in wrapper

---

## 5. Additional Analysis

### Is the Agent Generic?

**✅ YES** - The agent is fully generic:
- No hardcoded app names (timeless-weddings, etc.)
- Reads from generic files (specs/pages-and-routes.md, specs/plan.md)
- Works with any app structure
- No app-specific logic

### Does it Follow Best Practices?

**⚠️ MOSTLY** - With caveats:
- ✅ Clear separation of concerns (wrapper vs agent)
- ✅ MCP tools for validation (oxc, build_test, tree_sitter)
- ✅ Comprehensive system prompt
- ✅ Critic designed to catch bugs
- ❌ Wrapper doesn't verify file creation
- ❌ Helper validation methods exist but unused
- ❌ No integration between wrapper and validation methods

### What Should the Wrapper Do?

**Current Implementation**:
```python
async def generate_app_shell(self, previous_critic_xml: str = "") -> Tuple[bool, str, str]:
    user_prompt = create_user_prompt(previous_critic_xml=previous_critic_xml)
    result = await self.agent.run(user_prompt)

    if not result.success:
        return False, "", result.content

    # Blindly trust success!
    return True, "", "App shell generated and written successfully"
```

**Better Implementation** (verify file):
```python
async def generate_app_shell(self, previous_critic_xml: str = "") -> Tuple[bool, str, str]:
    user_prompt = create_user_prompt(previous_critic_xml=previous_critic_xml)
    result = await self.agent.run(user_prompt)

    if not result.success:
        return False, "", result.content

    # VERIFY file was actually created
    app_tsx_path = Path(self.agent.cwd) / "client" / "src" / "App.tsx"
    if not app_tsx_path.exists():
        error_msg = "Agent claimed success but client/src/App.tsx was not created"
        logger.error(f"❌ {error_msg}")
        return False, "", error_msg

    logger.info(f"✅ Verified App.tsx exists ({app_tsx_path.stat().st_size} bytes)")
    return True, "", "App shell generated and written successfully"
```

---

## 6. Required Fixes

### Fix #1: Correct File Name in User Prompt

**File**: `agents/app_shell_generator/user_prompt.py`
**Line**: 16, 29
**Change**: `technical-architecture-spec.md` → `pages-and-routes.md`

```python
# OLD:
1. **Read the technical architecture spec** from `specs/technical-architecture-spec.md`
...
1. Use the Read tool to read `specs/technical-architecture-spec.md`

# NEW:
1. **Read the technical architecture spec** from `specs/pages-and-routes.md`
...
1. Use the Read tool to read `specs/pages-and-routes.md`
```

### Fix #2: Add Agent to Pipeline

**File**: `stages/build_stage.py`
**Location**: After line 1181 (after API Client Generator)

```python
{
    "name": "App Shell Generator",
    "output_file": app_dir / "client" / "src" / "App.tsx",  # For skip check
    "writer": AppShellGeneratorAgent(cwd=cwd),
    "critic": AppShellGeneratorCritic(cwd=cwd, logger=logger),
    "critical": True  # CRITICAL - app won't run without App.tsx
},
```

**Important**: Place it BEFORE "Frontend Interaction Spec (Master)" because:
- FIS depends on understanding app structure
- App shell provides that structure
- Correct order: Backend → API → **App Shell** → FIS → Pages

### Fix #3: Add File Verification to Wrapper

**File**: `agents/app_shell_generator/agent.py`
**Location**: Lines 58-67

```python
# After agent runs successfully, verify file exists
if not result.success:
    error_msg = f"Agent failed: {result.content}"
    logger.error(f"❌ {error_msg}")
    return False, "", error_msg

# NEW: Verify file was actually created
app_tsx_path = Path(self.agent.cwd) / "client" / "src" / "App.tsx"
if not app_tsx_path.exists():
    error_msg = "Agent claimed success but client/src/App.tsx was not created (known bug)"
    logger.error(f"❌ {error_msg}")
    return False, "", error_msg

file_size = app_tsx_path.stat().st_size
logger.info(f"✅ Verified App.tsx exists ({file_size:,} bytes)")

# OLD CODE:
logger.info("✅ App.tsx shell generated successfully")
logger.info(f"📄 Agent completed with result: {result.content[:200]}...")
return True, "", "App shell generated and written successfully"
```

---

## 7. Testing Plan

After all fixes:

1. ✅ **Verify file name**: Check agent reads `pages-and-routes.md`
2. ✅ **Verify agent runs**: Check logs show "App Shell Generator" execution
3. ✅ **Verify file created**: Check `client/src/App.tsx` exists
4. ✅ **Verify routing**: Check App.tsx imports ALL pages from tech spec
5. ✅ **Verify compilation**: Run `npm run build` to verify TypeScript compiles
6. ✅ **Verify app runs**: Run `npm run dev` and check app loads

---

## 8. Summary

### The Agent Itself is Well-Designed ✅
- Clear purpose: Generate App.tsx with routing
- Generic: Works with any app structure
- Comprehensive prompts: Clear instructions
- Critic aware of bugs: Explicitly catches file creation issues

### But Three Critical Bugs Exist ❌

1. **Wrong file name** (user_prompt.py) - Agent reads wrong file
2. **Not in pipeline** (build_stage.py) - Agent never executes
3. **No file verification** (agent.py) - Wrapper doesn't verify creation

### All Three Must Be Fixed

Without these fixes:
- App Shell Generator never runs
- Even if it runs, reads wrong file
- Even if it reads right file, might not create output
- Even if it creates output, wrapper doesn't verify

**Result**: No App.tsx, no routing, app cannot run.

---

## 9. Generic vs Specific

**Is everything generic?** ✅ **YES**

- No hardcoded app names
- No timeless-weddings references
- Reads from generic spec files
- Works with any page structure
- No app-specific imports or logic

All fixes maintain this genericity.
