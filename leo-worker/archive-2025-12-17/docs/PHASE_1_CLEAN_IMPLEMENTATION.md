# Phase 1: Clean Implementation - Autonomous File Discovery

**Date**: October 10, 2025
**Approach**: Replace hardcoded logic with autonomous discovery - ONE WAY ONLY
**Philosophy**: Do it right, test thoroughly

---

## Changes Overview

### What We're Removing (DELETE)
1. `_extract_component_name()` method - ALL hardcoded mappings
2. Programmatic spec extraction in `parallel_frontend_generator.py`
3. Hardcoded file path assumptions

### What We're Adding (NEW)
1. Generic file discovery by content and timestamp
2. Full spec context to agents (no extraction)
3. Proper Writer-Critic loop

---

## Implementation

### Change 1: Delete Hardcoded Component Name Mapping

**File**: `src/app_factory_leonardo_replit/agents/page_generator/agent.py`

**DELETE** lines 120-156:
```python
def _extract_component_name(self, spec_name: str) -> str:
    """Extract component name from spec filename."""
    # Remove prefix if present
    name = spec_name.replace("frontend-interaction-spec-", "")

    # Convert to PascalCase based on known patterns
    if "booking" in name.lower():
        if "create" in name.lower():
            return "BookingCreatePage"
        elif "detail" in name.lower():
            return "BookingDetailPage"
    # ... ALL THIS HARDCODED LOGIC
```

**REPLACE WITH**:
```python
def _discover_generated_file(self, before_files: Set[Path]) -> Optional[Path]:
    """Discover generated file by comparing filesystem snapshots.

    Args:
        before_files: Set of files that existed before generation

    Returns:
        Path to newly created file, or None
    """
    pages_dir = Path(self.cwd) / "client" / "src" / "pages"

    if not pages_dir.exists():
        return None

    # Get current state
    after_files = set(pages_dir.glob("*.tsx"))

    # Find new files
    new_files = after_files - before_files

    if not new_files:
        return None

    # If only one new file, that's it
    if len(new_files) == 1:
        return list(new_files)[0]

    # Multiple new files - find most recently modified
    newest = max(new_files, key=lambda p: p.stat().st_mtime)
    return newest
```

### Change 2: Update generate_page() to Use Discovery

**File**: `src/app_factory_leonardo_replit/agents/page_generator/agent.py`

**CURRENT** (lines 81-113):
```python
# Run the agent
result = await self.agent.run(user_prompt)

if not result.success:
    error_msg = f"Generation failed: {result.content}"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

# OLD: Hardcoded extraction
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

**REPLACE WITH**:
```python
# Snapshot before generation
pages_dir = Path(self.cwd) / "client" / "src" / "pages"
before_files = set(pages_dir.glob("*.tsx")) if pages_dir.exists() else set()

# Run the agent
logger.info(f"🤖 Running Page Generator for {page_name}...")
result = await self.agent.run(user_prompt)

if not result.success:
    error_msg = f"Generation failed: {result.content}"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

# Discover generated file
page_file = self._discover_generated_file(before_files)

if not page_file:
    error_msg = f"No file created after agent execution"
    logger.error(f"❌ {page_name}: {error_msg}")
    return False, "", error_msg

logger.info(f"✅ {page_name} generated file: {page_file.name}")
return True, str(page_file), f"{page_name} generated successfully"
```

### Change 3: Stop Extracting Spec Fragments

**File**: `src/app_factory_leonardo_replit/orchestrators/parallel_frontend_generator.py`

**DELETE** lines 157-210 (`_extract_minimal_context` method)

**REPLACE WITH**:
```python
def _prepare_context(self, master_spec: str) -> Dict:
    """Prepare context for page generation.

    No extraction - just paths and references.

    Args:
        master_spec: Full master spec content

    Returns:
        Context dictionary with full spec access
    """
    return {
        "master_spec": master_spec,  # FULL spec, not fragments
        "app_layout_path": "@/components/layout/AppLayout"
    }
```

### Change 4: Update Page Generator to Use Full Context

**File**: `src/app_factory_leonardo_replit/agents/page_generator/user_prompt.py`

**CURRENT**:
```python
def create_user_prompt(
    page_name: str,
    page_spec: str,
    api_registry: str,  # EXTRACTED fragment
    design_tokens: str,  # EXTRACTED fragment
    app_layout_path: str,
    previous_critic_xml: str = ""
) -> str:
```

**REPLACE WITH**:
```python
def create_user_prompt(
    page_spec: str,
    master_spec: str,  # FULL spec
    app_layout_path: str,
    previous_critic_xml: str = ""
) -> str:
    """Create user prompt with FULL context.

    Args:
        page_spec: Individual page specification
        master_spec: Complete master specification
        app_layout_path: Path to AppLayout component
        previous_critic_xml: Critic feedback from previous iteration

    Returns:
        Complete user prompt
    """
    prompt = f"""
You are generating a page component based on specifications.

## Master Specification
{master_spec}

## Page Specification
{page_spec}

## Layout Component
Import AppLayout from: {app_layout_path}

## Previous Feedback
{previous_critic_xml if previous_critic_xml else "First attempt"}

## Instructions
1. Read and understand BOTH specifications completely
2. Extract API methods, design tokens, and patterns from master spec
3. Determine appropriate component name from page spec
4. Generate the component file
5. Validate with oxc and build_test tools

Generate a production-ready component that:
- Follows patterns in the specifications
- Uses proper TypeScript types
- Imports AppLayout correctly
- Handles all specified interactions
- Passes linting and type checking

You have FULL autonomy to determine naming, structure, and implementation.
"""
    return prompt
```

---

## Testing Plan

### Test 1: Delete and Regenerate 2 Pages
```bash
# Clean slate
rm apps/timeless-weddings-phase1/app/client/src/pages/{HomePage,SignUpPage}.tsx

# Run generation
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

# Verify:
# - Files are created
# - Files are found by discovery (not hardcoded names)
# - Components work correctly
```

### Test 2: Run Full Pipeline
```bash
# Delete ALL pages
rm apps/timeless-weddings-phase1/app/client/src/pages/*.tsx

# Regenerate
uv run python run-parallel-frontend.py apps/timeless-weddings-phase1/app

# Verify:
# - All 9 pages generated
# - All found by discovery
# - App builds successfully
```

### Test 3: Check Logs for Clarity
```bash
# Should see:
# "🤖 Running Page Generator for frontend-interaction-spec-homepage..."
# "✅ frontend-interaction-spec-homepage generated file: HomePage.tsx"

# Should NOT see:
# "Using legacy file discovery"
# "Hardcoded component name: ..."
```

---

## Files Changed

1. **agents/page_generator/agent.py**
   - Delete `_extract_component_name()`
   - Add `_discover_generated_file()`
   - Update `generate_page()` logic

2. **agents/page_generator/user_prompt.py**
   - Change signature to accept full master_spec
   - Remove fragmented parameters
   - Update prompt to reference full context

3. **orchestrators/parallel_frontend_generator.py**
   - Delete `_extract_minimal_context()`
   - Add `_prepare_context()`
   - Update calls to pass full specs

---

## Estimated Changes

- **Lines deleted**: ~100
- **Lines added**: ~60
- **Net change**: -40 lines (simpler!)

---

## Success Criteria

- ✅ All pages generate successfully
- ✅ No hardcoded component name logic
- ✅ No spec extraction/fragmentation
- ✅ Files discovered by filesystem diff
- ✅ Full context passed to agents
- ✅ Logs are clear and helpful

---

## Next Steps After This

1. Test thoroughly
2. Commit changes
3. Move to Phase 2 (Writer-Critic loop)

---

## Ready to Implement

This is clean, simple, and thorough:
- No backward compatibility complexity
- One way to do it (the right way)
- Easier to understand
- Easier to maintain

**Start now?**