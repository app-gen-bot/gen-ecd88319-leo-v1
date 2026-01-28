# CWD Change Impact Analysis

**Proposed Change**: Change `AppGeneratorAgent` cwd from `/Users/labheshpatel/apps/app-factory/apps` to `/Users/labheshpatel/apps/app-factory` (project root)

**Primary Motivation**: Enable Skills discovery from `.claude/skills/` at project root

---

## Current State

### CWD Scenarios
1. **Initial Generation**: `cwd = /Users/labheshpatel/apps/app-factory/apps`
2. **During Resume** (temporary): `cwd = /Users/labheshpatel/apps/app-factory/apps/{app-name}/app`
3. **After Resume**: Restored to `/Users/labheshpatel/apps/app-factory/apps`

### File Locations
- **Apps output**: `/Users/labheshpatel/apps/app-factory/apps/{app-name}/app/`
- **Project skills**: `/Users/labheshpatel/apps/app-factory/.claude/skills/` ❌ NOT discovered
- **Apps-level subagents**: `/Users/labheshpatel/apps/app-factory/apps/.claude/agents/` ✅
- **Session files**: `{app_path}/.agent_session.json` ✅

---

## Proposed State

### CWD Scenarios
1. **Initial Generation**: `cwd = /Users/labheshpatel/apps/app-factory` (project root)
2. **During Resume** (temporary): `cwd = /Users/labheshpatel/apps/app-factory/apps/{app-name}/app`
3. **After Resume**: Restored to `/Users/labheshpatel/apps/app-factory`

### File Locations
- **Apps output**: `/Users/labheshpatel/apps/app-factory/apps/{app-name}/app/` (unchanged)
- **Project skills**: `/Users/labheshpatel/apps/app-factory/.claude/skills/` ✅ WILL BE discovered
- **Subagents location**: TBD (see Impact #1)
- **Session files**: `{app_path}/.agent_session.json` (unchanged)

---

## Impact Analysis

### Impact #1: Subagent Files Location

**Current Code** (`agent.py:147`):
```python
agents_dir = Path(self.output_dir) / ".claude" / "agents"
```

**Current Location**: `/Users/labheshpatel/apps/app-factory/apps/.claude/agents/`

**Problem**: This uses `output_dir` (not `cwd`), so location **won't change** automatically.

**Result After CWD Change**:
- cwd = `/Users/labheshpatel/apps/app-factory/`
- Subagents still written to: `/Users/labheshpatel/apps/app-factory/apps/.claude/agents/`
- Subagents discovered from: `{cwd}/.claude/agents/` = `/Users/labheshpatel/apps/app-factory/.claude/agents/` ❌

**Impact**: **BREAKING** - Subagents will be written to `apps/.claude/agents/` but discovered from `.claude/agents/` (different locations!)

**Fix Options**:
- **A**: Change to `agents_dir = Path(self.agent.cwd) / ".claude" / "agents"`
- **B**: Change to `agents_dir = Path("/Users/labheshpatel/apps/app-factory") / ".claude" / "agents"`
- **C**: Move existing `apps/.claude/agents/` to `.claude/agents/`

---

### Impact #2: Skills Discovery

**Current**:
- cwd = `/Users/labheshpatel/apps/app-factory/apps`
- Skills discovered from: `{cwd}/.claude/skills/` = `apps/.claude/skills/` ❌ Not where skills are
- Actual skills location: `/Users/labheshpatel/apps/app-factory/.claude/skills/`

**After Change**:
- cwd = `/Users/labheshpatel/apps/app-factory/`
- Skills discovered from: `{cwd}/.claude/skills/` = `.claude/skills/` ✅ CORRECT!

**Impact**: ✅ **POSITIVE** - This is the PRIMARY reason for the change!

**Verification Needed**:
- Confirm Claude Agent SDK discovers from `{cwd}/.claude/skills/` (not hardcoded paths)
- Test that all 5 existing skills are loaded (drizzle-orm-setup, storage-factory-validation, etc.)

---

### Impact #3: File Generation Paths

**Current Prompt** (`agent.py:472`):
```python
f"You MUST create the app in this directory: `{self.output_dir}/{app_name}/app`"
```

**Current**:
- Prompt says: `/Users/labheshpatel/apps/app-factory/apps/{app-name}/app`
- This is an **ABSOLUTE path**

**After Change**:
- Prompt still says: `/Users/labheshpatel/apps/app-factory/apps/{app-name}/app`
- Still an **ABSOLUTE path**

**Impact**: ✅ **NO CHANGE** - File generation uses absolute paths in prompt

**Pipeline Prompt Paths** (relative):
- `plan/plan.md`
- `shared/schema.zod.ts`
- `client/src/lib/api-client.ts`
- `server/routes/auth.ts`

**Behavior**:
1. Agent receives absolute path: `/Users/.../apps/{app-name}/app`
2. Agent navigates to that directory (or uses it as base)
3. Creates files using relative paths from system prompt
4. Final location: `/Users/.../apps/{app-name}/app/shared/schema.zod.ts` ✅

**Impact**: ✅ **NO CHANGE** - Files will be created in same location

---

### Impact #4: MCP Tools (npm, browser, build_test)

**MCP Tools That Use CWD**:
- `mcp__build_test__verify_project` - Runs `npm run build` in cwd
- `mcp__package_manager__package_management` - Runs `npm install` in cwd
- `mcp__dev_server__start_dev_server` - Starts dev server in cwd
- `mcp__browser__navigate_browser` - May use relative URLs from cwd

**Current Behavior**:
- cwd = `apps/`
- Agent told: "Create app in `apps/{app-name}/app`"
- Agent likely changes to that directory before running npm commands
- OR: Agent passes directory parameter to MCP tools

**After CWD Change**:
- cwd = `/Users/labheshpatel/apps/app-factory/`
- Agent told: "Create app in `apps/{app-name}/app`" (now relative from new cwd!)
- Agent behavior: **DEPENDS** on whether it interprets as relative or absolute

**Risk**: 🟡 **MEDIUM** - MCP tools might execute in wrong directory

**Investigation Needed**:
1. Check if pipeline-prompt.md tells agent to `cd` to app directory before npm commands
2. Check if MCP tools accept `directory` parameter
3. Test that `verify_project` runs in correct location

**Fix Options**:
- **A**: Update prompt to explicitly `cd {app_path}` before running MCP tools
- **B**: Pass `directory` parameter to MCP tools if supported
- **C**: Temporarily change cwd before MCP tool calls (like in resume_generation)

---

### Impact #5: Resume Generation CWD Change

**Current Code** (`agent.py:692-693, 814`):
```python
original_cwd = self.agent.cwd
self.agent.cwd = app_path  # e.g., apps/todo-app/app
# ... do work ...
self.agent.cwd = original_cwd
```

**Current**:
- Save: `/Users/.../apps/`
- Temp: `/Users/.../apps/todo-app/app/`
- Restore: `/Users/.../apps/`

**After Change**:
- Save: `/Users/labheshpatel/apps/app-factory/`
- Temp: `/Users/.../apps/todo-app/app/`
- Restore: `/Users/labheshpatel/apps/app-factory/`

**Impact**: ✅ **NO CHANGE** - Resume logic works the same way

**Skills Discovery During Resume**:
- During resume: cwd = `apps/todo-app/app/` → Skills from `apps/todo-app/app/.claude/skills/` ❌ Not there
- After resume: cwd = project root → Skills from `.claude/skills/` ✅

**Note**: Skills won't be available DURING resume (cwd is app-specific), but that's already the case.

---

### Impact #6: Session File Locations

**Current Code** (`agent.py:563, 602, 848`):
```python
session_file = Path(app_path) / ".agent_session.json"
legacy_session = Path(self.output_dir) / ".agent_session.json"
```

**Session Files**:
- App-specific: `{app_path}/.agent_session.json` (e.g., `apps/Fizzcard/app/.agent_session.json`)
- Legacy (global): `{output_dir}/.agent_session.json` (e.g., `apps/.agent_session.json`)

**Impact**: ✅ **NO CHANGE** - Uses `app_path` and `output_dir` (not `cwd`)

**Legacy Session**:
- Current: `/Users/.../apps/.agent_session.json`
- After: Still `/Users/.../apps/.agent_session.json` (uses `output_dir`, not `cwd`)

---

### Impact #7: Git Operations

**GitHelper uses** (`git_helper.py`):
```python
subprocess.run([...], cwd=app_path, ...)
```

**Impact**: ✅ **NO CHANGE** - Git commands explicitly pass `cwd=app_path`

All git operations already use absolute paths to app directories, independent of agent's cwd.

---

### Impact #8: Logging and Output

**Logger** (`agent.py:107`):
```python
logger.info(f"📁 Output directory: {self.output_dir}")
```

**Impact**: ✅ **NO CHANGE** - Logs `output_dir`, not `cwd`

No user-visible logging changes needed.

---

### Impact #9: Path Resolution in Tools (Read, Write, Edit, Glob, Grep)

**How Tools Work**:
- All file tools (Read, Write, Edit, Glob, Grep) resolve relative paths from `cwd`
- If path is absolute, cwd is ignored
- If path is relative, cwd is used as base

**Pipeline Prompt Paths** (relative):
- `shared/schema.zod.ts`
- `client/src/lib/api-client.ts`
- `server/routes/auth.ts`

**Current Behavior**:
1. cwd = `apps/`
2. Agent receives: "Create app in `/Users/.../apps/todo-app/app`" (absolute)
3. Agent either:
   - Uses absolute paths: Write `/Users/.../apps/todo-app/app/shared/schema.zod.ts` ✅
   - OR changes mental context to app dir, then uses relative: Write `shared/schema.zod.ts` (resolved from app dir)

**After CWD Change**:
- Same behavior, just different base cwd
- As long as prompts use absolute paths, tools will work correctly

**Risk**: 🟡 **MEDIUM** - If agent uses relative paths instead of absolute, files might be created in wrong location

**Investigation Needed**:
1. Test file generation to ensure files go to `apps/{app-name}/app/` not `./{app-name}/app/`
2. Check actual tool calls in logs to see if paths are absolute or relative

**Fix**:
- Ensure prompt explicitly states app directory as absolute path (already does this)
- OR: Temporarily change cwd to app directory during generation (like in resume)

---

### Impact #10: Relative Path References in Prompts

**User Prompt** (`agent.py:472, 499`):
```python
f"You MUST create the app in this directory: `{self.output_dir}/{app_name}/app`"
f"Create all files in: `{self.output_dir}/[app-name]/`"
```

**Current**:
- These are **ABSOLUTE paths** (output_dir is absolute)
- Example: `/Users/labheshpatel/apps/app-factory/apps/todo-app/app`

**After Change**:
- Still **ABSOLUTE paths** (output_dir doesn't change)
- Still: `/Users/labheshpatel/apps/app-factory/apps/todo-app/app`

**Impact**: ✅ **NO CHANGE** - Prompts already use absolute paths

---

### Impact #11: Browser Tool Navigation

**Browser MCP Tool**:
- `mcp__browser__navigate_browser` - Navigates to URL
- `mcp__browser__open_browser` - Opens browser

**Typical Usage**:
```
navigate_browser("http://localhost:5000")
```

**Impact**: ✅ **NO CHANGE** - Browser uses URLs, not file paths

No cwd dependency for browser automation.

---

### Impact #12: CLAUDE.md Generation

**Current Code** (`agent.py:1068`):
```python
claude_md = Path(app_path) / "CLAUDE.md"
```

**Impact**: ✅ **NO CHANGE** - Uses `app_path` (not `cwd`)

CLAUDE.md will still be created at `{app_path}/CLAUDE.md`.

---

### Impact #13: Changelog Files

**Current Code** (`agent.py:868`):
```python
app_root = Path(app_path).parent  # apps/Fizzcard/app -> apps/Fizzcard
changelog_dir = app_root / "changelog"
```

**Impact**: ✅ **NO CHANGE** - Uses `app_path` (not `cwd`)

Changelog files still created at `apps/{app-name}/changelog/`.

---

## Summary Matrix

| Component | Current Location | After CWD Change | Impact | Risk |
|-----------|-----------------|------------------|--------|------|
| **Skills Discovery** | ❌ Not found | ✅ Found at `.claude/skills/` | ✅ POSITIVE | 🟢 Low |
| **Subagent Files** | `apps/.claude/agents/` | Still written to `apps/.claude/agents/` but discovered from `.claude/agents/` | ❌ BREAKING | 🔴 High |
| **Generated Apps** | `apps/{app-name}/app/` | `apps/{app-name}/app/` (unchanged) | ✅ NO CHANGE | 🟢 Low |
| **Session Files** | `{app_path}/.agent_session.json` | `{app_path}/.agent_session.json` | ✅ NO CHANGE | 🟢 Low |
| **MCP Tools (npm, etc)** | Execute in app dir | May execute in wrong dir | 🟡 RISK | 🟡 Medium |
| **File Generation** | Absolute paths work | Absolute paths work | ✅ NO CHANGE | 🟢 Low |
| **Resume CWD Change** | Temp change to app dir | Temp change to app dir | ✅ NO CHANGE | 🟢 Low |
| **Git Operations** | Uses `app_path` | Uses `app_path` | ✅ NO CHANGE | 🟢 Low |
| **CLAUDE.md** | `{app_path}/CLAUDE.md` | `{app_path}/CLAUDE.md` | ✅ NO CHANGE | 🟢 Low |
| **Changelog** | `{app_path}/../changelog/` | `{app_path}/../changelog/` | ✅ NO CHANGE | 🟢 Low |

---

## Required Fixes

### Fix #1: Subagent Files Location (CRITICAL)

**Problem**: Subagents written to `apps/.claude/agents/` but discovered from `.claude/agents/`

**Options**:

**Option A: Change Write Location to Match CWD**
```python
# agent.py:147
# OLD: agents_dir = Path(self.output_dir) / ".claude" / "agents"
# NEW:
agents_dir = Path(self.agent.cwd) / ".claude" / "agents"
```
- ✅ Subagents written to same place they're discovered
- ❌ Breaking change for existing deployments
- 📁 New location: `/Users/labheshpatel/apps/app-factory/.claude/agents/`

**Option B: Move Existing Subagents**
```bash
mv /Users/labheshpatel/apps/app-factory/apps/.claude/agents \
   /Users/labheshpatel/apps/app-factory/.claude/agents
```
Then apply Option A code change.
- ✅ Preserves existing subagents
- ✅ Clean migration path

**Option C: Use Absolute Path (Project Root)**
```python
# agent.py:147
agents_dir = Path("/Users/labheshpatel/apps/app-factory") / ".claude" / "agents"
```
- ✅ Explicitly sets location independent of cwd
- ❌ Hardcoded path (not portable)

**Recommendation**: **Option B** (Move + Use CWD)

---

### Fix #2: MCP Tools Directory Parameter (MEDIUM PRIORITY)

**Problem**: MCP tools (npm, build_test, dev_server) might run in wrong directory

**Options**:

**Option A: Explicit CWD Change Before MCP Tools**
```python
# In generate_app and resume_generation, add:
# Change to app directory before validation
self.agent.cwd = app_path
result = await self.agent.run(...)
self.agent.cwd = original_cwd
```
- ✅ Guarantees MCP tools run in app directory
- ✅ Similar pattern already used in resume_generation
- ❌ Requires tracking multiple cwd changes

**Option B: Update Pipeline Prompt**
Add explicit `cd` instructions before MCP tool usage:
```markdown
## Stage 3: Validate

Before running validation:
1. Change to app directory: `cd {app_path}`
2. Run type check: `npx tsc --noEmit`
3. Run build: `npm run build`
```
- ✅ Clear instructions for agent
- ❌ Relies on agent following instructions

**Option C: Test and Verify Current Behavior**
- MCP tools might already accept directory parameters
- Agent might already handle this correctly
- Test before assuming it's broken

**Recommendation**: **Option C first** (Test current behavior), then **Option A** if needed

---

### Fix #3: Verification Testing (CRITICAL)

**Test Plan**:

**Test 1: Skills Discovery**
```bash
# After CWD change
uv run python run-app-generator.py "Create a simple app" --app-name test-skills

# Check logs for:
# - "📋 Skills discovered: drizzle-orm-setup, storage-factory-validation, ..."
# - Skill invocations during generation
```

**Test 2: Subagent Discovery**
```bash
# Check that subagents are available
# Look for Task tool usage in logs
# Verify subagent delegation works
```

**Test 3: File Generation Location**
```bash
# After generation
ls -la /Users/labheshpatel/apps/app-factory/apps/test-skills/app/
# Verify: plan/, shared/, client/, server/ directories exist
```

**Test 4: MCP Tools Execution**
```bash
# Check logs for npm commands
# Verify they run in correct directory
# Look for "npm run build" execution location
```

**Test 5: Resume Functionality**
```bash
uv run python run-app-generator.py --resume apps/test-skills/app "Add dark mode"
# Verify files modified in correct location
```

---

## Migration Steps

### Step 1: Backup Current State
```bash
# Backup existing .claude directories
cp -r /Users/labheshpatel/apps/app-factory/apps/.claude \
      /Users/labheshpatel/apps/app-factory/apps/.claude.backup
```

### Step 2: Move Subagents
```bash
# Move subagents to project root .claude/agents/
mkdir -p /Users/labheshpatel/apps/app-factory/.claude/agents
mv /Users/labheshpatel/apps/app-factory/apps/.claude/agents/* \
   /Users/labheshpatel/apps/app-factory/.claude/agents/
```

### Step 3: Update Code
```python
# agent.py:99
# OLD: cwd=self.output_dir
# NEW: cwd="/Users/labheshpatel/apps/app-factory"

# agent.py:147
# OLD: agents_dir = Path(self.output_dir) / ".claude" / "agents"
# NEW: agents_dir = Path(self.agent.cwd) / ".claude" / "agents"
```

### Step 4: Test on Fresh App
```bash
uv run python run-app-generator.py "Create a todo app" --app-name test-cwd-change
```

### Step 5: Verify Skills Loaded
```bash
# Check logs for skills discovery
grep "Skills discovered" logs/app_generator_*.log
```

### Step 6: Test Resume
```bash
uv run python run-app-generator.py --resume apps/test-cwd-change/app "Add user profiles"
```

### Step 7: Rollback Plan
If anything breaks:
```bash
# Restore backup
rm -rf /Users/labheshpatel/apps/app-factory/.claude/agents
mv /Users/labheshpatel/apps/app-factory/apps/.claude.backup \
   /Users/labheshpatel/apps/app-factory/apps/.claude

# Revert code changes
git checkout src/app_factory_leonardo_replit/agents/app_generator/agent.py
```

---

## Risk Assessment

### High Risk (🔴)
1. **Subagent Discovery Broken** - If subagents aren't found, Task tool delegation will fail
   - Mitigation: Move subagents + update write location
   - Severity: Pipeline breaks (no subagents = no complex tasks)

### Medium Risk (🟡)
2. **MCP Tools Run in Wrong Directory** - npm install/build might fail
   - Mitigation: Test and add explicit cwd changes if needed
   - Severity: Validation stage fails, apps still generate

3. **File Generation in Wrong Location** - Files created at project root instead of apps/
   - Mitigation: Prompts use absolute paths (should prevent this)
   - Severity: Apps broken, easy to detect

### Low Risk (🟢)
4. **Skills Not Discovered** - Main goal, but if SDK has bugs
   - Mitigation: Test on known skills, check SDK version, fallback to global ~/.claude/skills
   - Severity: Skills unavailable, but apps still generate

---

## Decision Matrix

| Change CWD? | Skills Work? | Subagents Work? | Apps Generate? | Overall |
|-------------|--------------|-----------------|----------------|---------|
| ❌ No (current) | ❌ No | ✅ Yes | ✅ Yes | Status Quo |
| ✅ Yes + Fix #1 | ✅ Yes | ✅ Yes | ✅ Yes | ✅ RECOMMENDED |
| ✅ Yes + No Fix | ✅ Yes | ❌ No | ⚠️ Maybe | ❌ BROKEN |

---

## Recommendation

**✅ PROCEED with CWD change** with the following fixes:

1. **MANDATORY**: Apply Fix #1 (Move subagents + update write location)
2. **TEST FIRST**: Apply Fix #2 only if MCP tools fail
3. **VERIFY**: Run all tests in Test Plan before marking as complete

**Confidence Level**: 🟢 High (with fixes applied)

**Expected Outcome**:
- ✅ Skills discovered from `.claude/skills/`
- ✅ Subagents discovered from `.claude/agents/`
- ✅ Apps generated in same location (`apps/{app-name}/app/`)
- ✅ Resume functionality preserved
- ✅ All MCP tools work correctly

**If ANY test fails**: Rollback immediately and investigate root cause.
