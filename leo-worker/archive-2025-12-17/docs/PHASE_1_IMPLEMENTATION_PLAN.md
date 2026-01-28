# Phase 1 Implementation Plan - Remove Hardcoding (Non-Breaking)

**Date**: October 10, 2025
**Goal**: Add autonomous file discovery without breaking existing functionality
**Strategy**: Feature flags + backward compatibility

---

## Implementation Steps

### Step 1: Add Generic File Discovery Method (NEW CODE ONLY)

**File**: `src/app_factory_leonardo_replit/agents/page_generator/agent.py`

**Action**: Add new method, keep existing `_extract_component_name()` intact

```python
def _discover_generated_file(
    self,
    page_name: str,
    before_files: Set[Path]
) -> Optional[Path]:
    """Discover generated file without hardcoded assumptions.

    Args:
        page_name: Name from spec file
        before_files: Files that existed before generation

    Returns:
        Path to generated file, or None if not found
    """
    pages_dir = Path(self.cwd) / "client" / "src" / "pages"

    # Get current files
    after_files = set(pages_dir.glob("*.tsx")) if pages_dir.exists() else set()

    # Find new files
    new_files = after_files - before_files

    if not new_files:
        logger.warning(f"No new files found for {page_name}")
        return None

    if len(new_files) == 1:
        # Only one new file - that's it!
        return list(new_files)[0]

    # Multiple new files - use heuristics
    logger.info(f"Multiple new files for {page_name}: {[f.name for f in new_files]}")

    # Prefer files with reasonable names
    for file_path in new_files:
        # Check if filename contains page indicators
        name_lower = file_path.stem.lower()
        if "page" in name_lower or name_lower.endswith("page"):
            return file_path

    # Fallback: return first one
    return list(new_files)[0]
```

### Step 2: Add Feature Flag to Config

**File**: `src/app_factory_leonardo_replit/agents/page_generator/config.py`

```python
AGENT_CONFIG = {
    "name": "Page Generator Agent (Parallel)",
    "model": "sonnet",
    "allowed_tools": ["Read", "Write", "Edit", "Glob", "Grep"],
    "mcp_tools": ["oxc", "tree_sitter", "build_test"],
    "max_turns": 500,

    # NEW: Feature flags
    "use_autonomous_discovery": False,  # Start with False (safe)
    "enable_writer_critic_loop": False,  # For Phase 2
}
```

### Step 3: Modify `generate_page()` to Support Both Paths

**File**: `src/app_factory_leonardo_replit/agents/page_generator/agent.py`

**Current code** (lines 81-113):
```python
# Run the agent
result = await self.agent.run(user_prompt)

if not result.success:
    error_msg = f"Generation failed: {result.content}"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

# OLD WAY: Hardcoded extraction
component_name = self._extract_component_name(page_name)

# Try multiple possible file locations
possible_files = [
    Path(self.cwd) / "client" / "src" / "pages" / f"{component_name}.tsx",
    Path(self.cwd) / "client" / "src" / "pages" / f"{page_name}.tsx",
]

page_file = None
for possible_file in possible_files:
    if possible_file.exists():
        page_file = possible_file
        break

if not page_file:
    error_msg = f"Page file not created. Checked: {[str(f) for f in possible_files]}"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg
```

**NEW code** (feature flag driven):
```python
# Snapshot files before generation (for autonomous discovery)
pages_dir = Path(self.cwd) / "client" / "src" / "pages"
before_files = set(pages_dir.glob("*.tsx")) if pages_dir.exists() else set()

# Run the agent
logger.info(f"🤖 Running Page Generator for {page_name} in parallel...")
result = await self.agent.run(user_prompt)

if not result.success:
    error_msg = f"Generation failed: {result.content}"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

# Choose discovery method based on feature flag
use_autonomous = self.config.get("use_autonomous_discovery", False)

if use_autonomous:
    logger.info(f"🔍 Using autonomous file discovery for {page_name}")
    page_file = self._discover_generated_file(page_name, before_files)
else:
    logger.info(f"📋 Using legacy file discovery for {page_name}")
    # OLD WAY: Hardcoded extraction
    component_name = self._extract_component_name(page_name)

    # Try multiple possible file locations
    possible_files = [
        Path(self.cwd) / "client" / "src" / "pages" / f"{component_name}.tsx",
        Path(self.cwd) / "client" / "src" / "pages" / f"{page_name}.tsx",
    ]

    page_file = None
    for possible_file in possible_files:
        if possible_file.exists():
            page_file = possible_file
            break

if not page_file:
    error_msg = f"Page file not created. Checked locations based on spec name"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

logger.info(f"✅ {page_name} generated successfully at {page_file}")
return True, str(page_file), f"{page_name} generated successfully"
```

### Step 4: Update Constructor to Store Config

**File**: `src/app_factory_leonardo_replit/agents/page_generator/agent.py`

**Current**:
```python
def __init__(self, cwd: str = None):
    self.agent = Agent(
        system_prompt=SYSTEM_PROMPT,
        mcp_tools=["oxc", "tree_sitter", "build_test"],
        cwd=cwd,
        **AGENT_CONFIG
    )
    self.cwd = cwd
```

**NEW**:
```python
def __init__(self, cwd: str = None, config_overrides: Dict = None):
    self.config = {**AGENT_CONFIG, **(config_overrides or {})}

    self.agent = Agent(
        system_prompt=SYSTEM_PROMPT,
        mcp_tools=["oxc", "tree_sitter", "build_test"],
        cwd=cwd,
        **self.config
    )
    self.cwd = cwd
```

---

## Testing Strategy

### Test 1: Verify Existing Behavior (Flag OFF)

```bash
# Config: use_autonomous_discovery = False
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

# Expected: Same behavior as before
# Should find files using old hardcoded method
```

### Test 2: Test New Behavior (Flag ON)

```bash
# Update config.py: use_autonomous_discovery = True

# Delete 1-2 pages to force regeneration
rm apps/timeless-weddings-phase1/app/client/src/pages/{HomePage,SignUpPage}.tsx

# Run generation
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

# Expected: Finds files using new discovery method
# Should work without hardcoded component names
```

### Test 3: Test on Different App Type (Future)

```bash
# When we have a non-wedding app
# Flag: use_autonomous_discovery = True
# Should work without any code changes
```

---

## Rollback Strategy

If something breaks:

```python
# config.py
AGENT_CONFIG = {
    ...
    "use_autonomous_discovery": False,  # ← Set back to False
}
```

Instant rollback to working behavior!

---

## Migration Timeline

### Day 1 (Today)
- ✅ Commit analysis docs
- ⏳ Implement Step 1-4 above
- ⏳ Test with flag OFF (verify no regression)

### Day 2
- Test with flag ON (new behavior)
- Compare results
- Tune file discovery heuristics

### Day 3
- Enable for all new generations
- Monitor for issues
- Keep flag for rollback

### Week 2
- Remove flag and old code path
- Autonomous discovery becomes default

---

## Success Criteria

### Must Pass
- ✅ All existing tests still pass with flag OFF
- ✅ New discovery finds files with flag ON
- ✅ Zero breaking changes to existing workflows
- ✅ Can rollback instantly with config change

### Should Pass
- ✅ New method finds files even with unusual names
- ✅ Logs clearly show which method is used
- ✅ Performance is same or better

---

## Changes Summary

### Files Modified
1. `agents/page_generator/agent.py` - Add new discovery method
2. `agents/page_generator/config.py` - Add feature flag

### Files NOT Modified
- No changes to orchestrator
- No changes to critic
- No changes to prompts
- No changes to other agents

### Lines of Code
- **Added**: ~60 lines
- **Deleted**: 0 lines (everything kept!)
- **Modified**: ~20 lines (feature flag logic)

---

## Next Phase Preview

**Phase 2**: Writer-Critic Loop
- Will also use feature flag
- Can be developed independently
- Will integrate with autonomous discovery

**Phase 3**: Retry with Backoff
- Builds on Phase 1 & 2
- Also feature-flagged
- Progressive enhancement

---

## Risk Assessment

### Low Risk
- ✅ No deletions
- ✅ Feature flagged
- ✅ Instant rollback
- ✅ Backward compatible

### Medium Risk
- ⚠️ File discovery heuristics may need tuning
- ⚠️ Multiple new files edge case

### Mitigation
- Extensive logging
- Clear error messages
- Fallback to first file found
- Easy to debug

---

## Implementation Checklist

Before starting:
- [ ] Create feature branch from current branch
- [ ] Run existing tests to establish baseline
- [ ] Document current behavior

During implementation:
- [ ] Add `_discover_generated_file()` method
- [ ] Add feature flag to config
- [ ] Update `generate_page()` with conditional logic
- [ ] Update `__init__()` to accept config overrides
- [ ] Add logging for both code paths

After implementation:
- [ ] Test with flag OFF (verify no regression)
- [ ] Test with flag ON (verify new behavior)
- [ ] Test edge cases (multiple files, no files)
- [ ] Update documentation
- [ ] Commit with detailed message

---

## Questions to Answer Before Starting

1. **Should we test on current branch or create new branch?**
   - Recommend: New branch `feature/autonomous-file-discovery`

2. **Should we run full pipeline or just page generation?**
   - Recommend: Just page generation first, then full pipeline

3. **What's the rollback procedure if users report issues?**
   - Recommend: Set flag to False in config.py, restart pipeline

4. **How do we validate the autonomous discovery works?**
   - Recommend: Delete generated pages, regenerate, verify files found

---

## Ready to Implement?

This plan ensures:
- ✅ Zero breaking changes
- ✅ Easy rollback
- ✅ Testable at each step
- ✅ Progressive enhancement
- ✅ Clear success criteria

**Estimated time**: 2-3 hours for implementation + 1 hour testing

**Next step**: Get approval and create feature branch