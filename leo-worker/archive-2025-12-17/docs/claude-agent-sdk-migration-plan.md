# Migration Plan: claude-code-sdk → claude-agent-sdk v0.1.4

## Executive Summary

**Objective**: Migrate from deprecated `claude-code-sdk` v0.0.14 to `claude-agent-sdk` v0.1.4 to enable programmatic subagent configuration.

**Priority**: HIGH - Current SDK is deprecated and lacks `agents` parameter support

**Impact**: Breaking changes require updates to `cc_agent` package and `AppGeneratorAgent`

**Timeline**: 1-2 hours with thorough testing

**Risk Level**: MEDIUM - Breaking changes, but well-documented migration path

---

## Current State

### Installed Packages
```
claude-code-sdk==0.0.14 (DEPRECATED)
```

### Issues with Current SDK
1. ❌ No `agents` parameter in `ClaudeCodeOptions`
2. ❌ Subagents only work via filesystem (`.claude/agents/*.md`)
3. ❌ Cannot pass programmatic subagent configuration
4. ❌ SDK is deprecated and unmaintained

### Current Implementation
- **Location**: `vendor/cc-agent/cc_agent/base.py`
- **Uses**: `from claude_code_sdk import query, ClaudeCodeOptions`
- **Workaround**: Writing subagents to `.claude/agents/` files

---

## Target State

### New Package
```
claude-agent-sdk==0.1.4 (LATEST, released Oct 15, 2025)
```

### Features in New SDK
1. ✅ **Programmatic `agents` parameter** in `ClaudeAgentOptions`
2. ✅ Active development and support
3. ✅ Better session management
4. ✅ Improved configuration options

### Desired Implementation
- **Use**: `from claude_agent_sdk import query, ClaudeAgentOptions`
- **Pass**: `agents` parameter directly to `ClaudeAgentOptions`
- **Eliminate**: Filesystem workaround (or keep as fallback)

---

## Breaking Changes

### 1. Package Name Change
```python
# BEFORE
from claude_code_sdk import query, ClaudeCodeOptions, AssistantMessage, ResultMessage

# AFTER
from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, ResultMessage
```

### 2. Type Rename
```python
# BEFORE
options = ClaudeCodeOptions(...)

# AFTER
options = ClaudeAgentOptions(...)
```

### 3. System Prompt Behavior
**BEFORE**: SDK used Claude Code's default system prompt
**AFTER**: Empty system prompt by default

**Action Required**: Explicitly set `system_prompt` in all agents

### 4. Settings Auto-Loading Removed
**BEFORE**: SDK automatically loaded CLAUDE.md, settings.json, etc.
**AFTER**: Must explicitly configure

**Action Required**: We already pass `system_prompt` explicitly ✅

### 5. New `agents` Parameter (THIS IS WHAT WE NEED!)
```python
# NEW in v0.1.0+
options = ClaudeAgentOptions(
    system_prompt="...",
    agents={
        'research_agent': {
            'description': 'Research complex requirements...',
            'prompt': 'You are a senior architect...',
            'tools': ['WebSearch', 'WebFetch'],
            'model': 'opus'
        }
    }
)
```

---

## Migration Steps

### Phase 1: Research & Planning ✅
- [x] Identify breaking changes
- [x] Create migration plan
- [x] Document testing strategy

### Phase 2: Update Dependencies
**Files to Update**:
1. `pyproject.toml` - Replace dependency
2. `vendor/cc-agent/cc_agent/base.py` - Update imports

**Steps**:
```bash
# 1. Update pyproject.toml
# Replace: claude-code-sdk = "^0.0.14"
# With:    claude-agent-sdk = "^0.1.4"

# 2. Uninstall old package
uv pip uninstall claude-code-sdk

# 3. Install new package
uv pip install claude-agent-sdk==0.1.4

# 4. Verify installation
uv pip list | grep claude
```

**Expected Output**:
```
claude-agent-sdk    0.1.4
```

### Phase 3: Update cc_agent Package
**File**: `vendor/cc-agent/cc_agent/base.py`

**Changes**:
1. Update import statement
2. Rename `ClaudeCodeOptions` → `ClaudeAgentOptions`
3. Test that `agents` parameter is accepted

**Before**:
```python
from claude_code_sdk import (
    query, ClaudeCodeOptions, AssistantMessage, ResultMessage,
    SystemMessage, UserMessage
)
```

**After**:
```python
from claude_agent_sdk import (
    query, ClaudeAgentOptions, AssistantMessage, ResultMessage,
    SystemMessage, UserMessage
)
```

**Find & Replace**:
```
ClaudeCodeOptions → ClaudeAgentOptions
```

### Phase 4: Update AppGeneratorAgent
**File**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

**Changes**:
1. Remove filesystem workaround (`_write_subagent_files()`)
2. Use programmatic `agents` parameter
3. Update logging messages

**New Approach**:
```python
# In __init__
sdk_agents = None
if self.enable_subagents:
    self._initialize_subagents()
    sdk_agents = self._convert_subagents_to_sdk_format()
    # No longer need to write files!

# Pass to Agent
self.agent = Agent(
    system_prompt=self.pipeline_prompt,
    agents=sdk_agents,  # Now supported!
    ...
)
```

### Phase 5: Testing Strategy

#### Test 1: Import Test
```python
# test-sdk-import.py
from claude_agent_sdk import query, ClaudeAgentOptions
print("✅ Imports successful")
print(f"ClaudeAgentOptions: {ClaudeAgentOptions}")
```

**Expected**: No ImportError

#### Test 2: Basic Query Test
```python
# test-basic-query.py
from claude_agent_sdk import query, ClaudeAgentOptions

result = query(
    prompt="Say hello",
    options=ClaudeAgentOptions(
        system_prompt="You are helpful",
        max_turns=1
    )
)
```

**Expected**: Successful query execution

#### Test 3: Agents Parameter Test
```python
# test-agents-parameter.py
from claude_agent_sdk import query, ClaudeAgentOptions

options = ClaudeAgentOptions(
    system_prompt="You are a coordinator",
    agents={
        'test_agent': {
            'description': 'A test subagent',
            'prompt': 'You are a test agent',
            'model': 'sonnet'
        }
    }
)

# Should NOT raise TypeError about 'agents' parameter
```

**Expected**: No TypeError, agents parameter accepted

#### Test 4: cc_agent Integration Test
```bash
uv run python test-subagent-integration.py
```

**Expected**: All tests pass with new SDK

#### Test 5: Full App Generation Test
```bash
uv run python run-app-generator.py \
  "Create a simple todo app" \
  --app-name todo-migration-test \
  --enable-subagents
```

**Expected**:
- No errors
- Subagents configured
- Check logs for delegation activity

---

## Rollback Plan

If migration fails or causes issues:

### Quick Rollback
```bash
# 1. Revert code changes (git)
git checkout vendor/cc-agent/cc_agent/base.py
git checkout src/app_factory_leonardo_replit/agents/app_generator/agent.py

# 2. Reinstall old SDK
uv pip uninstall claude-agent-sdk
uv pip install claude-code-sdk==0.0.14

# 3. Verify
uv run python test-subagent-integration.py
```

### Rollback Triggers
- ImportError or ModuleNotFoundError
- TypeError with ClaudeAgentOptions
- Breaking changes in message types
- Existing functionality broken

---

## Risk Assessment

### Low Risk ✅
- Import changes (straightforward find & replace)
- Type rename (simple rename operation)
- Well-documented migration path

### Medium Risk ⚠️
- Message type changes (AssistantMessage, ResultMessage)
- Behavioral changes in SDK
- Unknown differences in query() function

### Mitigation Strategies
1. **Incremental Testing**: Test each phase before proceeding
2. **Keep Filesystem Fallback**: Don't delete `_write_subagent_files()` immediately
3. **Git Commits**: Commit after each successful phase
4. **Parallel Testing**: Keep both approaches working initially

---

## Expected Benefits

### Immediate
1. ✅ **Programmatic `agents` parameter works**
2. ✅ No need for filesystem workaround
3. ✅ Cleaner code (remove file I/O)
4. ✅ SDK actively maintained

### Long-term
1. ✅ Access to new SDK features
2. ✅ Better debugging and error messages
3. ✅ Community support and updates
4. ✅ Future-proof implementation

---

## File Checklist

### Files to Modify
- [ ] `pyproject.toml` - Update dependency
- [ ] `vendor/cc-agent/cc_agent/base.py` - Update imports and types
- [ ] `src/app_factory_leonardo_replit/agents/app_generator/agent.py` - Use programmatic agents

### Files to Test
- [ ] `test-subagent-integration.py` - Basic integration
- [ ] `test-sdk-integration.py` - SDK format
- [ ] `run-app-generator.py` - Full generation

### Documentation to Update
- [ ] `docs/subagent-phase1-complete.md` - Update with new SDK info
- [ ] `docs/subagent-filesystem-implementation.md` - Mark as deprecated approach
- [ ] `vendor/cc-agent/CLAUDE.md` - Update SDK version reference

---

## Step-by-Step Execution Plan

### Step 1: Update pyproject.toml
```toml
# Find and replace
claude-code-sdk = "^0.0.14"
# with
claude-agent-sdk = "^0.1.4"
```

### Step 2: Update Dependencies
```bash
uv pip uninstall claude-code-sdk
uv pip install claude-agent-sdk==0.1.4
uv pip list | grep claude  # Verify
```

### Step 3: Update cc_agent/base.py
```bash
# Find & Replace in vendor/cc-agent/cc_agent/base.py:
claude_code_sdk → claude_agent_sdk
ClaudeCodeOptions → ClaudeAgentOptions
```

### Step 4: Test Basic Import
```bash
uv run python -c "from claude_agent_sdk import query, ClaudeAgentOptions; print('✅ Import successful')"
```

### Step 5: Test Agents Parameter
```bash
# Create test-agents-param.py
uv run python test-agents-param.py
```

### Step 6: Run Integration Tests
```bash
uv run python test-subagent-integration.py
uv run python test-sdk-integration.py
```

### Step 7: Update AppGeneratorAgent (Optional)
- Can keep filesystem approach initially
- Add programmatic approach as alternative
- Test both methods work

### Step 8: Full Generation Test
```bash
uv run python run-app-generator.py \
  "Create a todo app" \
  --app-name migration-test \
  --enable-subagents
```

### Step 9: Verify Delegation
```bash
# Check logs for subagent activity
./check-subagents-active.sh
```

### Step 10: Document Results
- Update documentation
- Create migration report
- Note any issues or improvements

---

## Success Criteria

### Must Have ✅
- [x] SDK upgraded to v0.1.4
- [ ] All imports updated
- [ ] All tests passing
- [ ] No TypeErrors with `agents` parameter
- [ ] Existing functionality preserved

### Should Have 🎯
- [ ] Programmatic `agents` parameter working
- [ ] Subagent delegation happening
- [ ] Cleaner code (filesystem workaround removed)
- [ ] Performance same or better

### Nice to Have 💡
- [ ] Better error messages
- [ ] Improved logging
- [ ] Documentation updated
- [ ] Migration guide for others

---

## Timeline

### Estimated Duration: 1-2 hours

**Phase 1**: Research & Planning (30 min) ✅ COMPLETE
**Phase 2**: Update Dependencies (10 min)
**Phase 3**: Update cc_agent (15 min)
**Phase 4**: Testing (20 min)
**Phase 5**: Update AppGeneratorAgent (15 min)
**Phase 6**: Full Integration Test (20 min)
**Phase 7**: Documentation (10 min)

**Buffer**: 30 min for unexpected issues

---

## Next Actions

1. **IMMEDIATE**: Execute Step 1 (Update pyproject.toml)
2. **THEN**: Execute Step 2 (Update dependencies)
3. **TEST**: Execute Step 3-4 (Update and test cc_agent)
4. **VALIDATE**: Execute Step 5-6 (Test agents parameter)
5. **INTEGRATE**: Execute Step 7-8 (Update AppGeneratorAgent)
6. **VERIFY**: Execute Step 9 (Full generation test)
7. **DOCUMENT**: Execute Step 10 (Update docs)

---

## Questions to Answer During Migration

1. ✅ Does `agents` parameter work in ClaudeAgentOptions?
2. ❓ Are AssistantMessage/ResultMessage types compatible?
3. ❓ Does query() function signature change?
4. ❓ Any performance differences?
5. ❓ Do filesystem agents still work as fallback?
6. ❓ Does automatic delegation actually happen?

---

## Post-Migration Tasks

1. Clean up filesystem workaround (if programmatic works)
2. Update all documentation
3. Create migration report
4. Share learnings with team
5. Monitor for SDK updates

---

**Status**: Ready to execute
**Approver**: User
**Start Date**: October 15, 2025
**Target Completion**: October 15, 2025

---

*This plan will be updated as we progress through the migration.*