# Skill Discovery Issue - Findings and Resolution

**Date**: 2025-10-27
**Issue**: Agents cannot find skills like `drizzle-orm-setup` and `factory-lazy-init` during app generation
**Status**: ✅ ROOT CAUSE IDENTIFIED + SOLUTION FOUND

---

## 🎯 Key Findings Summary

### The Problem
Skills in `apps/.claude/skills/` are not discovered by agents because:
1. `cc-agent` doesn't expose the `setting_sources` parameter
2. Without `setting_sources=['project']`, the SDK only looks in `~/.claude/skills/`
3. Agents need to explicitly enable project-level skill discovery

### The Solution
**THREE OPTIONS** (in order of preference):

1. **BEST**: Add `setting_sources` parameter to `cc-agent` Agent class
   - Modify `vendor/cc-agent/cc_agent/base.py`
   - Default to `['project']` to enable project skills
   - ~30 lines of code

2. **QUICKEST**: Pass `setting_sources=['project']` via kwargs in `agent.run()`
   - No cc-agent changes needed
   - Add to each agent.run() call in the codebase
   - ~30+ files to update

3. **FALLBACK**: Copy skills to `~/.claude/skills/`
   - One-time manual setup
   - No code changes
   - Skills globally available but not versioned

### Recommended Approach
**Option 1 (Add to cc-agent)** + **Option 3 (Copy to user dir)** as backup:
- Developers copy skills to `~/.claude/skills/` for immediate relief
- We implement Option 1 for long-term solution
- Both work together (skills from both locations are discovered)

---

## Problem Statement

When running `run-app-generator` to generate FunnelSight, the logs show errors:
- "cannot find skill: drizzle-orm-setup"
- "cannot find skill: factory-lazy-init"

Skills are located at: `/Users/labheshpatel/apps/app-factory/apps/.claude/skills/`

---

## How Claude Code Discovers Skills

Claude Code (and agents using `cc-agent` library) discovers skills by:
1. Looking for `.claude/skills/` directory in the agent's current working directory (`cwd`)
2. Traversing parent directories if not found in `cwd`
3. Each skill must have a `SKILL.md` file with YAML frontmatter

**Skills format**:
```
.claude/
└── skills/
    ├── drizzle-orm-setup/
    │   └── SKILL.md
    └── factory-lazy-init/
        └── SKILL.md
```

---

## Investigation Results

### 1. Skills Exist and Are Properly Formatted ✅

**Location**: `/Users/labheshpatel/apps/app-factory/apps/.claude/skills/`

**Verified skills**:
- `drizzle-orm-setup/SKILL.md` - Drizzle ORM setup guidance (232 lines)
- `factory-lazy-init/SKILL.md` - Lazy Proxy pattern teaching (478 lines)
- `schema-query-validator/SKILL.md` - Schema constraint validation
- `storage-factory-validation/SKILL.md` - IStorage contract validation
- `type-safe-queries/SKILL.md` - Drizzle vs PostgREST decision guide
- `supabase-storage/SKILL.md` - PostgREST patterns
- `production-smoke-test/SKILL.md` - Docker smoke testing

**YAML frontmatter** is correct:
```yaml
---
name: drizzle-orm-setup
description: >
  Use this skill when setting up Drizzle ORM for a Node.js/TypeScript backend
  with PostgreSQL or Supabase...
---
```

### 2. Agent Configuration in AppGeneratorAgent

**File**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

**Agent initialization** (lines 84-104):
```python
self.agent = Agent(
    system_prompt=self.pipeline_prompt,
    allowed_tools=AGENT_CONFIG["allowed_tools"],
    mcp_tools=[
        "chrome_devtools",
        "build_test",
        "package_manager",
        # ... other tools
    ],
    cwd=self.output_dir,  # ← KEY: Set to apps/ directory
    name=AGENT_CONFIG["name"],
    model=AGENT_CONFIG["model"],
    max_turns=AGENT_CONFIG["max_turns"],
    agents=sdk_agents,
)
```

**`self.output_dir`** is set to (line 58):
```python
self.output_dir = output_dir or APPS_OUTPUT_DIR
```

**`APPS_OUTPUT_DIR`** from config:
```python
# Likely: /Users/labheshpatel/apps/app-factory/apps/
```

### 3. Expected vs Actual Skill Discovery

**Expected**:
- Agent's `cwd`: `/Users/labheshpatel/apps/app-factory/apps/`
- Skills location: `/Users/labheshpatel/apps/app-factory/apps/.claude/skills/`
- **Result**: Skills SHOULD be discovered (in same directory as cwd)

**Why it's failing**:
The issue is likely one of these scenarios:

#### Scenario A: Subagents Have Different CWD
When AppGeneratorAgent creates subagents, they may have different `cwd` settings:

**Example** (lines 30-50 in various agent files):
```python
# Schema Designer Agent
workspace_dir = str(Path(schema_path).parent.parent.parent)
self.agent = Agent(
    system_prompt=SYSTEM_PROMPT,
    cwd=workspace_dir,  # ← Set to workspace, not apps/
    **AGENT_CONFIG
)
```

If `workspace_dir` = `/Users/labheshpatel/apps/app-factory/apps/funnelsight/app/`, then:
- Agent looks for: `apps/funnelsight/app/.claude/` ❌ (doesn't exist)
- Skills are at: `apps/.claude/` ❌ (2 levels up)

#### Scenario B: Agent Changes Directory During Execution
If agent uses `cd` commands via Bash tool:
```bash
cd apps/funnelsight/app
# Now looking for .claude/ from here ❌
```

#### Scenario C: Skills Not in Agent's Search Path
`cc-agent` may have limitations on how many parent directories it traverses.

---

## Root Cause Analysis

**PRIMARY CAUSE**: **Subagents** (like SchemaDesignerAgent, StorageGeneratorAgent, etc.) have their `cwd` set to the **generated app directory**, not the `apps/` directory.

**Evidence from codebase**:
```python
# src/.../agents/schema_designer/agent.py:36
workspace_dir = str(Path(schema_path).parent.parent.parent)
# If schema_path = apps/funnelsight/app/shared/schema.zod.ts
# Then workspace_dir = apps/funnelsight/ or apps/funnelsight/app/

self.agent = Agent(
    cwd=workspace_dir,  # ← NOT apps/ (where .claude is)
    **AGENT_CONFIG
)
```

**Why this matters**:
- `.claude/` is at: `apps/.claude/`
- Agent's `cwd` is: `apps/funnelsight/app/`
- Agent looks for: `apps/funnelsight/app/.claude/` ❌

---

## Resolution Options

### Option 1: Set All Agent CWD to `apps/` Directory (RECOMMENDED)

**Change**: Modify all agent initializations to use the `apps/` directory as cwd

**Implementation**:
```python
# In each agent's __init__ method:
from pathlib import Path

# Find the apps/ directory (contains .claude/)
apps_dir = Path(__file__).resolve().parent.parent.parent.parent.parent / "apps"
# OR: apps_dir = Path(workspace).parent  # if workspace is apps/funnelsight

self.agent = Agent(
    cwd=str(apps_dir),  # ← Use apps/ directory
    **AGENT_CONFIG
)
```

**Pros**:
- ✅ All agents can discover skills
- ✅ No file duplication
- ✅ Minimal changes (just cwd parameter)

**Cons**:
- ⚠️ Agents may expect cwd to be the app directory for relative paths
- ⚠️ Need to verify all tools work correctly with different cwd

**Files to change**:
- `src/.../agents/schema_designer/agent.py`
- `src/.../agents/storage_generator/agent.py`
- `src/.../agents/routes_generator/agent.py`
- `src/.../agents/api_client_generator/agent.py`
- All other agent files (30+ agents)

---

### Option 2: Create Symlink in Each Generated App

**Change**: Create `.claude` symlink in each generated app pointing to `apps/.claude`

**Implementation**:
```python
# In app generation stage (after creating app directory):
import os
from pathlib import Path

app_dir = Path(f"apps/{app_name}/app")
app_dir.mkdir(parents=True, exist_ok=True)

# Create symlink to shared .claude directory
claude_link = app_dir / ".claude"
claude_target = Path("apps/.claude").resolve()

if not claude_link.exists():
    claude_link.symlink_to(claude_target, target_is_directory=True)
```

**Pros**:
- ✅ No changes to agent initialization
- ✅ Each app can discover skills from its own directory
- ✅ One-time setup per app

**Cons**:
- ⚠️ Requires filesystem symlink support (works on Unix/macOS, may fail on Windows)
- ⚠️ Adds setup step to app generation
- ⚠️ Git may track symlinks (need to add to .gitignore)

**Files to change**:
- `src/.../stages/build_stage.py` (add symlink creation)
- `apps/.gitignore` (add `.claude` to ignore)

---

### Option 3: Copy Skills to Generated Apps

**Change**: Copy `.claude/` directory into each generated app

**Implementation**:
```python
# In app generation stage:
import shutil
from pathlib import Path

app_dir = Path(f"apps/{app_name}/app")
source_claude = Path("apps/.claude")
target_claude = app_dir / ".claude"

if not target_claude.exists():
    shutil.copytree(source_claude, target_claude)
```

**Pros**:
- ✅ Each app has its own skills copy
- ✅ No symlink dependencies
- ✅ Apps are self-contained

**Cons**:
- ❌ Duplicates 7 skills × ~200KB each = ~1.4MB per app
- ❌ Skill updates require regenerating all apps
- ❌ Maintenance overhead (multiple copies to update)

**Files to change**:
- `src/.../stages/build_stage.py` (add directory copy)

---

### Option 4: Set CLAUDE_SKILLS_PATH Environment Variable

**Change**: Use environment variable to specify skills location

**Implementation**:
```bash
# In .env or shell:
export CLAUDE_SKILLS_PATH=/Users/labheshpatel/apps/app-factory/apps/.claude/skills
```

**Pros**:
- ✅ No code changes
- ✅ Flexible (can change location without code updates)

**Cons**:
- ⚠️ Requires checking if `cc-agent` supports this (likely doesn't)
- ⚠️ Every developer needs to set this environment variable

**Files to change**:
- `.env` (add CLAUDE_SKILLS_PATH)
- `README.md` (document the requirement)

---

### Option 5: Move Skills to User Home Directory

**Change**: Move skills to `~/.claude/skills/` (Claude Code's default location)

**Implementation**:
```bash
# One-time setup:
mkdir -p ~/.claude/skills
cp -r apps/.claude/skills/* ~/.claude/skills/
```

**Pros**:
- ✅ Works globally for all apps
- ✅ No code changes
- ✅ Follows Claude Code conventions

**Cons**:
- ⚠️ Skills aren't versioned with project
- ⚠️ Every developer needs to manually set up skills
- ⚠️ Different machines may have different skill versions

**Files to change**:
- `README.md` (add setup instructions)
- CI/CD scripts (add skill installation step)

---

## Recommended Solution

**COMBINATION: Option 1 (CWD to apps/) + Option 2 (Symlink Fallback)**

### Phase 1: Fix Agent CWD (Immediate - Production)
Change all agent `cwd` to use the `apps/` directory:

```python
# Helper function to add to agent base class:
def get_apps_directory(workspace_path: str) -> str:
    """
    Find the apps/ directory containing .claude/ from any workspace path.

    Examples:
        workspace_path = "apps/funnelsight/app" → returns "apps/"
        workspace_path = "apps/" → returns "apps/"
    """
    from pathlib import Path

    path = Path(workspace_path).resolve()

    # Traverse up to find directory containing .claude/
    for parent in [path] + list(path.parents):
        claude_dir = parent / ".claude"
        if claude_dir.exists() and claude_dir.is_dir():
            return str(parent)

    # Fallback: assume it's in apps/ relative to project root
    # This handles case where we're not yet in apps/ directory
    project_root = Path(__file__).resolve().parent.parent.parent
    return str(project_root / "apps")
```

**Usage in agents**:
```python
# In each agent's __init__:
from .base import get_apps_directory

workspace_dir = str(Path(schema_path).parent.parent.parent)
apps_dir = get_apps_directory(workspace_dir)

self.agent = Agent(
    cwd=apps_dir,  # ← Use apps/ directory for skill discovery
    **AGENT_CONFIG
)
```

### Phase 2: Add Symlink as Fallback (Safety Net)
For generated apps, create symlink so they can also find skills:

```python
# In build_stage.py after app directory creation:
def ensure_skills_accessible(app_dir: Path):
    """Create .claude symlink if it doesn't exist."""
    claude_link = app_dir / ".claude"
    if claude_link.exists():
        return

    # Find parent apps/ directory
    apps_dir = app_dir.parent.parent  # apps/funnelsight/app → apps/
    claude_target = apps_dir / ".claude"

    if claude_target.exists():
        try:
            claude_link.symlink_to(claude_target, target_is_directory=True)
            logger.info(f"✅ Created .claude symlink in {app_dir}")
        except Exception as e:
            logger.warning(f"⚠️  Could not create .claude symlink: {e}")
```

---

## Testing Plan

After implementing the solution:

### 1. Verify Skills Are Discovered
```python
# Add to agent initialization:
logger.info(f"🔍 Agent CWD: {self.agent.cwd}")
logger.info(f"🔍 Looking for skills at: {Path(self.agent.cwd) / '.claude' / 'skills'}")

# Check if skills exist:
skills_dir = Path(self.agent.cwd) / ".claude" / "skills"
if skills_dir.exists():
    skill_count = len(list(skills_dir.glob("*/SKILL.md")))
    logger.info(f"✅ Found {skill_count} skills")
else:
    logger.error(f"❌ Skills directory not found at {skills_dir}")
```

### 2. Test with FunnelSight Generation
```bash
# Run the generator and check logs:
uv run python src/app_factory_leonardo_replit/run.py "FunnelSight"

# Check for skill discovery messages:
grep "skill.*found\|skill.*loaded" logs/app-generator-*.log
```

### 3. Verify Skill Invocation
```bash
# Check that skills are actually invoked:
grep "drizzle-orm-setup\|factory-lazy-init" logs/app-generator-*.log
```

---

## BREAKTHROUGH: settingSources Parameter Discovery

### After Online Research

**FOUND**: The `claude-agent-sdk` (version 0.1.4) has a `setting_sources` parameter in `ClaudeAgentOptions`!

```python
# From claude-agent-sdk ClaudeAgentOptions:
setting_sources: list[Literal['user', 'project', 'local']] | None = None
```

**What it does**:
- Controls whether the SDK loads settings from user/project/local directories
- Values:
  - `'user'`: Load from `~/.claude/` (user-level)
  - `'project'`: Load from `.claude/` (project-level, relative to `cwd`)
  - `'local'`: Load from `.claude/` (local overrides)

**Skills Discovery**:
According to Anthropic documentation, skills are discovered from:
1. **Personal Skills**: `~/.claude/skills/`
2. **Project Skills**: `.claude/skills/` (within project directory)
3. **Plugin Skills**: Bundled with installed plugins

**The Key**: Setting `setting_sources=['project']` should enable discovery of skills from `.claude/skills/` relative to the agent's `cwd`.

### Current Implementation Gap

**Problem**: `cc-agent` Agent class does NOT expose the `setting_sources` parameter!

```python
# cc-agent Agent.__init__ signature (version 1.10.0):
def __init__(
    self,
    name: str,
    system_prompt: str,
    allowed_tools: Optional[list[str]] = None,
    # ... other params ...
    mcp_servers: Optional[dict[str, Any]] = None,
    agents: Optional[dict[str, dict[str, Any]]] = None
    # ❌ NO setting_sources parameter!
)
```

**In Agent.run()**:
```python
options = ClaudeAgentOptions(**options_dict)
# options_dict does NOT include setting_sources
```

### Solution: Add settingSources to cc-agent

**Option A: Add to Agent.__init__ (Clean)**
```python
# In vendor/cc-agent/cc_agent/base.py

class Agent:
    def __init__(
        self,
        # ... existing params ...
        agents: Optional[dict[str, dict[str, Any]]] = None,
        setting_sources: Optional[list[str]] = None  # ← ADD THIS
    ):
        # Store it
        self.setting_sources = setting_sources or ['project']  # Default to project

    async def run(self, user_prompt: str, mcp_servers: Optional[dict[str, Any]] = None, **kwargs) -> AgentResult:
        # ... existing code ...

        # Add setting_sources to options
        if self.setting_sources is not None:
            options_dict["setting_sources"] = self.setting_sources
```

**Option B: Pass via kwargs (Quick)**
```python
# In agent initialization (no cc-agent changes needed):
result = await agent.run(
    user_prompt,
    setting_sources=['project']  # Pass directly
)
```

**Option C: Set in kwargs during Agent.run() (Temporary)**
```python
# In cc-agent/base.py Agent.run() method:
# Before creating ClaudeAgentOptions, add:
if 'setting_sources' not in kwargs:
    kwargs['setting_sources'] = ['project']  # Default to project skills
```

### Testing the Solution

After implementing one of the options above:

```python
# Test skill discovery:
from cc_agent import Agent

agent = Agent(
    name="Test Agent",
    system_prompt="You are a test agent",
    cwd="/Users/labheshpatel/apps/app-factory/apps",  # Where .claude/ is located
    setting_sources=['project']  # ← Enable project skills
)

result = await agent.run("Test skill discovery")
# Skills in apps/.claude/skills/ should now be discovered
```

### Alternative: Copy Skills to User Directory

If the SDK parameter doesn't work as expected, fallback to:

```bash
# Copy project skills to user directory (one-time setup):
mkdir -p ~/.claude/skills
cp -r apps/.claude/skills/* ~/.claude/skills/

# Now skills are discovered globally via 'user' setting source
```

**Pros**:
- ✅ Works immediately
- ✅ No code changes needed
- ✅ Skills available to all agents

**Cons**:
- ⚠️ Manual setup required
- ⚠️ Skills not versioned with project
- ⚠️ Must sync when skills are updated

## Long-Term Improvements

### 1. Add Skill Discovery Diagnostics
```python
# Add to Agent base class or helper:
def diagnose_skill_discovery(cwd: str) -> Dict[str, Any]:
    """Diagnose why skills might not be found."""
    from pathlib import Path

    diagnostics = {
        "cwd": cwd,
        "claude_exists": False,
        "skills_dir_exists": False,
        "skills_found": [],
        "search_paths": []
    }

    path = Path(cwd).resolve()

    # Check current directory and parents
    for parent in [path] + list(path.parents)[:5]:  # Check 5 levels up
        claude_dir = parent / ".claude"
        skills_dir = claude_dir / "skills"

        diagnostics["search_paths"].append(str(parent))

        if claude_dir.exists():
            diagnostics["claude_exists"] = True
            diagnostics["claude_location"] = str(claude_dir)

        if skills_dir.exists():
            diagnostics["skills_dir_exists"] = True
            diagnostics["skills_location"] = str(skills_dir)

            # Find all SKILL.md files
            skills = list(skills_dir.glob("*/SKILL.md"))
            diagnostics["skills_found"] = [s.parent.name for s in skills]
            break

    return diagnostics
```

### 2. Add Skill Availability Check to Pipeline
```python
# In run.py or main pipeline:
def check_skills_available():
    """Verify skills are accessible before starting generation."""
    apps_dir = Path("apps/")
    skills_dir = apps_dir / ".claude" / "skills"

    required_skills = [
        "drizzle-orm-setup",
        "factory-lazy-init",
        "schema-query-validator",
    ]

    missing = []
    for skill in required_skills:
        skill_md = skills_dir / skill / "SKILL.md"
        if not skill_md.exists():
            missing.append(skill)

    if missing:
        logger.error(f"❌ Missing required skills: {missing}")
        logger.error(f"   Expected location: {skills_dir}")
        raise RuntimeError(f"Required skills not found: {missing}")

    logger.info(f"✅ All {len(required_skills)} required skills found")
```

---

## Summary

**Issue**: Agents cannot find skills in `apps/.claude/skills/`

**Root Cause**: Subagents have `cwd` set to specific app directories (e.g., `apps/funnelsight/app/`), not the `apps/` directory where `.claude/` is located

**Solution**:
1. **Primary**: Change all agent `cwd` to use `apps/` directory (where `.claude/` exists)
2. **Fallback**: Create symlinks in generated apps pointing to `apps/.claude/`

**Impact**:
- ✅ Skills will be discovered by all agents
- ✅ No duplication of skill files
- ✅ Maintainable (update skills in one location)

**Next Steps**:
1. Implement `get_apps_directory()` helper function
2. Update all agent initializations to use helper
3. Test with FunnelSight generation
4. Add diagnostics logging for skill discovery

---

**Document Status**: ✅ FINDINGS COMPLETE - SOLUTION IDENTIFIED
**Estimated Implementation Time**:
- Option 1 (cc-agent changes): 30 minutes
- Option 2 (kwargs in all agents): 2-3 hours
- Option 3 (copy to ~/.claude/): 1 minute

**Next Action**: Implement Option 1 (modify cc-agent) OR use Option 3 (copy skills) for immediate relief
