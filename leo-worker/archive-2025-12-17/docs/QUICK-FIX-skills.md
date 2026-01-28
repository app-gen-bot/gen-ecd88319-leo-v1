# Quick Fix: Enable Skill Discovery

**Problem**: Agents can't find skills in `apps/.claude/skills/`

**Solution**: Copy skills to your user directory OR modify cc-agent

---

## Option 1: Copy Skills (1 minute - IMMEDIATE FIX)

```bash
# From app-factory root directory:
mkdir -p ~/.claude/skills
cp -r apps/.claude/skills/* ~/.claude/skills/

# Verify:
ls ~/.claude/skills/
```

**Expected output**:
```
drizzle-orm-setup/
factory-lazy-init/
production-smoke-test/
schema-query-validator/
storage-factory-validation/
supabase-storage/
type-safe-queries/
```

**Done!** Skills are now globally available. Test by running the generator again.

---

## Option 2: Modify cc-agent (30 minutes - PERMANENT FIX)

### Step 1: Add parameter to Agent class

**File**: `vendor/cc-agent/cc_agent/base.py`

**Change 1** - Add to `__init__` signature (around line 51):
```python
class Agent:
    def __init__(
        self,
        name: str,
        system_prompt: str,
        allowed_tools: Optional[list[str]] = None,
        max_turns: int = 5,
        permission_mode: str = "bypassPermissions",
        max_thinking_tokens: Optional[int] = None,
        cwd: Optional[Union[str, Path]] = None,
        verbose: bool = True,
        preview_length: int = 0,
        file_preview_length: int = 0,
        logger: Optional[logging.Logger] = None,
        restrict_to_allowed_tools: bool = False,
        model: Optional[str] = None,
        mcp_tools: Optional[list[str]] = None,
        mcp_servers: Optional[dict[str, Any]] = None,
        agents: Optional[dict[str, dict[str, Any]]] = None,
        setting_sources: Optional[list[str]] = None  # ← ADD THIS LINE
    ):
```

**Change 2** - Store the parameter (around line 86):
```python
        self.model = model
        self.agents = agents
        self.setting_sources = setting_sources or ['project']  # ← ADD THIS LINE
```

**Change 3** - Update docstring (around line 72):
```python
            agents: Subagent configurations for automatic task delegation
                   Format: {'agent-name': {'description': str, 'prompt': str, 'tools': list, 'model': str}}
            setting_sources: Settings sources to load from (['user', 'project', 'local'])
                           Defaults to ['project'] to enable project-level skills discovery
```

**Change 4** - Pass to ClaudeAgentOptions (around line 180-195):
```python
        # Note: Subagents can be configured programmatically via 'agents' parameter (SDK v0.1.4+)
        # or via filesystem (.claude/agents/) for backward compatibility
        if self.agents is not None:
            options_dict["agents"] = self.agents
            if self.verbose:
                self.logger.info(f"🤖 Subagents configured programmatically: {list(self.agents.keys())}")

        # Add setting_sources for skill discovery
        if self.setting_sources is not None:
            options_dict["setting_sources"] = self.setting_sources
            if self.verbose:
                self.logger.debug(f"📚 Setting sources: {self.setting_sources}")

        # Use passed mcp_servers or fall back to stored ones
        mcp_servers = mcp_servers or self.mcp_servers
```

### Step 2: Test the change

```python
# Test script:
import asyncio
from cc_agent import Agent

async def test_skills():
    agent = Agent(
        name="Test Agent",
        system_prompt="You are a test agent. Use skills when appropriate.",
        cwd="/Users/labheshpatel/apps/app-factory/apps",
        setting_sources=['project']  # Enable project skills
    )

    result = await agent.run("What skills are available?")
    print(f"Success: {result.success}")
    print(f"Content: {result.content}")

asyncio.run(test_skills())
```

### Step 3: Verify skills are discovered

Check logs for:
- `📚 Setting sources: ['project']`
- Skills should be invoked when relevant

---

## Option 3: Pass via kwargs (Quick workaround)

In each agent that needs skills, modify the `run()` call:

```python
# Before:
result = await self.agent.run(user_prompt)

# After:
result = await self.agent.run(user_prompt, setting_sources=['project'])
```

**Files to update**: ~30+ agent files across the codebase.

---

## Verification

After applying any fix, verify skills work:

```bash
# Generate a new app:
uv run python src/app_factory_leonardo_replit/run.py "Test App"

# Check logs for skill invocations:
grep -i "skill\|drizzle-orm-setup\|factory-lazy-init" logs/app-generator-*.log
```

**Expected**: No more "cannot find skill" errors.

---

## Recommendation

**For immediate relief**: Use Option 1 (copy to ~/.claude/)
**For permanent fix**: Use Option 2 (modify cc-agent)

Both can be used together - skills from both locations will be discovered.
