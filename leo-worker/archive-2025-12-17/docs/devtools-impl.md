# Chrome DevTools MCP Implementation Plan

**Date**: 2025-10-26
**Status**: Implemented ✅
**Scope**: app-generator agent and subagents (app_generator, quality_assurer, research)

---

## Executive Summary

Replace the existing `browser` MCP tool with `chrome_devtools` across app-generator agent and its subagents. This upgrade provides 27 advanced DevTools capabilities instead of 4 basic browser tools, enabling:

- **Console error analysis** - Catch JavaScript errors
- **Network request inspection** - Debug API calls, CORS issues
- **Performance profiling** - Measure Core Web Vitals
- **DOM snapshots** - Text-based page structure analysis
- **Advanced interactions** - Form filling, drag-drop, file upload

---

## Background

### Current State (Browser Tool)
- **Package**: `cc_tools.browser.server` (Playwright wrapper)
- **Tools**: 4 basic tools
  - `mcp__browser__open_browser`
  - `mcp__browser__navigate_browser`
  - `mcp__browser__interact_browser`
  - `mcp__browser__close_browser`
- **Capabilities**: Navigation, clicking, screenshots
- **Limitations**: No console access, no network inspection, no performance metrics

### New State (Chrome DevTools)
- **Package**: `npx chrome-devtools-mcp@latest`
- **Tools**: 27 tools across 6 categories
  - Input Automation (8): click, drag, fill, fill_form, handle_dialog, hover, press_key, upload_file
  - Navigation (6): navigate_page, new_page, close_page, list_pages, select_page, wait_for
  - Performance (3): start_trace, stop_trace, analyze_insight
  - Network (2): list_requests, get_request
  - Debugging (5): evaluate_script, take_screenshot, take_snapshot, list_console_messages, get_console_message
  - Emulation (3): emulate_cpu, emulate_network, resize_page
- **Capabilities**: Everything from browser tool + console analysis + network debugging + performance profiling
- **Source**: Official Google Chrome team

---

## Strategy: Clean Replacement

We will perform a **full replacement** (not aliasing) for clarity:

- ✅ Replace "browser" with "chrome_devtools" in mcp_tools list
- ✅ Replace all `mcp__browser__*` tool references with `mcp__chrome_devtools__*`
- ✅ Update all prompts mentioning "browser tool" to reference Chrome DevTools
- ✅ Add chrome_devtools entry to MCP registry
- ✅ Optionally deprecate old browser entry

**Rationale**: Clean break is clearer than aliasing, matches actual tool naming, prevents confusion.

---

## Tool Mapping Reference

| Old Browser Tool | New Chrome DevTools Tool | Notes |
|------------------|--------------------------|-------|
| `mcp__browser__open_browser` | `mcp__chrome_devtools__new_page` | Creates new browser page with URL |
| `mcp__browser__navigate_browser` | `mcp__chrome_devtools__navigate_page` | Navigate existing page to URL |
| `mcp__browser__interact_browser` | `mcp__chrome_devtools__click`<br>`mcp__chrome_devtools__fill`<br>`mcp__chrome_devtools__fill_form` | Split into specific actions for clarity |
| `mcp__browser__close_browser` | `mcp__chrome_devtools__close_page` | Close specific page by index |
| ❌ Not available | `mcp__chrome_devtools__take_snapshot` | ✨ NEW: Text-based DOM snapshot (uid-based) |
| ❌ Not available | `mcp__chrome_devtools__list_console_messages` | ✨ NEW: Get console errors/warnings/logs |
| ❌ Not available | `mcp__chrome_devtools__get_console_message` | ✨ NEW: Get full error details with stack trace |
| ❌ Not available | `mcp__chrome_devtools__list_network_requests` | ✨ NEW: Network waterfall with status codes |
| ❌ Not available | `mcp__chrome_devtools__get_network_request` | ✨ NEW: Request/response headers, body, timing |
| ❌ Not available | `mcp__chrome_devtools__evaluate_script` | ✨ NEW: Execute JavaScript in page context |
| ❌ Not available | `mcp__chrome_devtools__wait_for` | ✨ NEW: Wait for text to appear on page |
| ❌ Not available | `mcp__chrome_devtools__list_pages` | ✨ NEW: Multi-tab management |
| ❌ Not available | `mcp__chrome_devtools__select_page` | ✨ NEW: Switch between tabs |

**Additional Capabilities (can add later if needed):**
- Performance: `start_trace`, `stop_trace`, `analyze_insight` (LCP, FID, CLS)
- Emulation: `emulate_cpu`, `emulate_network`, `resize_page`

---

## Implementation Steps

### Phase 1: MCP Registry Setup

**File**: `vendor/cc-tools/cc_tools/mcp_registry.py`

**Action**: Add chrome_devtools entry after line 137 (after browser entry)

**Code**:
```python
"chrome_devtools": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "chrome-devtools-mcp@latest"],
    "env_vars": ["CHROME_CHANNEL"],
    "env_defaults": {
        "CHROME_CHANNEL": "stable"  # Options: stable, beta, dev, canary
    },
    "description": "Chrome DevTools Protocol for advanced debugging, performance analysis, and browser automation",
    "tags": ["browser", "devtools", "debugging", "performance", "network", "automation", "testing"]
}
```

**Optional**: Add deprecation comment to "browser" entry:
```python
"browser": {
    # DEPRECATED: Use "chrome_devtools" instead for advanced capabilities
    "type": "stdio",
    # ... rest unchanged
}
```

---

### Phase 2: Agent Configuration Updates

#### File: `agent.py`

**Location**: Line 88 in mcp_tools list

**Change**:
```python
# BEFORE
mcp_tools=[
    "browser",
    "build_test",
    "package_manager",
    # ...
]

# AFTER
mcp_tools=[
    "chrome_devtools",  # Replaces "browser"
    "build_test",
    "package_manager",
    # ...
]
```

---

#### File: `config.py`

**Location**: Lines 30-34 in allowed_tools list

**Change**:
```python
# BEFORE
# MCP Tools - Browser automation
"mcp__browser__open_browser",
"mcp__browser__navigate_browser",
"mcp__browser__interact_browser",
"mcp__browser__close_browser",

# AFTER
# MCP Tools - Chrome DevTools (replaces browser tool)
# Navigation & Page Management
"mcp__chrome_devtools__new_page",
"mcp__chrome_devtools__navigate_page",
"mcp__chrome_devtools__list_pages",
"mcp__chrome_devtools__select_page",
"mcp__chrome_devtools__close_page",

# Interaction
"mcp__chrome_devtools__take_snapshot",
"mcp__chrome_devtools__click",
"mcp__chrome_devtools__fill",
"mcp__chrome_devtools__fill_form",
"mcp__chrome_devtools__wait_for",
"mcp__chrome_devtools__hover",
"mcp__chrome_devtools__drag",
"mcp__chrome_devtools__upload_file",
"mcp__chrome_devtools__handle_dialog",

# Debugging & Analysis
"mcp__chrome_devtools__list_console_messages",
"mcp__chrome_devtools__get_console_message",
"mcp__chrome_devtools__list_network_requests",
"mcp__chrome_devtools__get_network_request",
"mcp__chrome_devtools__take_screenshot",
"mcp__chrome_devtools__evaluate_script",
```

**Rationale**: Include comprehensive tool list for app-generator's full capabilities. Subagents will have subset based on their needs.

---

### Phase 3: Subagent Updates

#### File: `subagents/quality_assurer.py`

**Location 1**: Lines 166-177 (tools list)

**Change**:
```python
# BEFORE
tools=[
    "TodoWrite",
    "Bash",
    "mcp__build_test__verify_project",
    "mcp__browser__open_browser",
    "mcp__browser__navigate_browser",
    "mcp__browser__interact_browser",
    "mcp__browser__close_browser",
    "Grep",
    "Read"
]

# AFTER
tools=[
    "TodoWrite",
    "Bash",
    "mcp__build_test__verify_project",

    # Chrome DevTools - Navigation & Page Management
    "mcp__chrome_devtools__new_page",
    "mcp__chrome_devtools__navigate_page",
    "mcp__chrome_devtools__list_pages",
    "mcp__chrome_devtools__select_page",
    "mcp__chrome_devtools__close_page",

    # Chrome DevTools - Interaction
    "mcp__chrome_devtools__take_snapshot",
    "mcp__chrome_devtools__click",
    "mcp__chrome_devtools__fill",
    "mcp__chrome_devtools__fill_form",
    "mcp__chrome_devtools__wait_for",

    # Chrome DevTools - Debugging (QA focus)
    "mcp__chrome_devtools__list_console_messages",
    "mcp__chrome_devtools__get_console_message",
    "mcp__chrome_devtools__list_network_requests",
    "mcp__chrome_devtools__get_network_request",
    "mcp__chrome_devtools__take_screenshot",
    "mcp__chrome_devtools__evaluate_script",

    "Grep",
    "Read"
]
```

**Location 2**: Lines 77-101 (prompt - Browser Automation Testing section)

**Change**: Replace section "5. **Browser Automation Testing**" with:

```python
5. **Browser Testing with Chrome DevTools**
   ```python
   # Create new page and navigate
   mcp__chrome_devtools__new_page("http://localhost:5000")

   # Take text-based snapshot of page structure (use filePath to avoid buffer overflow)
   snapshot = mcp__chrome_devtools__take_snapshot(filePath="./snapshots/page.txt")
   # Snapshot shows all elements with unique IDs (uid)

   # Check console for errors FIRST
   messages = mcp__chrome_devtools__list_console_messages()
   errors = [m for m in messages if m.level == "error"]
   if errors:
       # Get full error details
       for error in errors:
           details = mcp__chrome_devtools__get_console_message(error.msgid)
           # Check stack trace, source location

   # Check network requests
   requests = mcp__chrome_devtools__list_network_requests()
   failed_requests = [r for r in requests if r.status >= 400]
   if failed_requests:
       # Get detailed request info
       for req in failed_requests:
           details = mcp__chrome_devtools__get_network_request(req.reqid)
           # Check headers, response body, timing

   # Test auth flow
   mcp__chrome_devtools__fill("input[name='email']", "test@example.com")
   mcp__chrome_devtools__fill("input[name='password']", "test123")
   mcp__chrome_devtools__click("button[type='submit']")
   mcp__chrome_devtools__wait_for("Dashboard")

   # Verify navigation works
   mcp__chrome_devtools__navigate_page("http://localhost:5000/dashboard")

   # Test CRUD operations
   mcp__chrome_devtools__click("button.add-new")
   mcp__chrome_devtools__fill_form([
       {"uid": "1_5", "value": "Test Item"},
       {"uid": "1_6", "value": "Description"}
   ])
   mcp__chrome_devtools__click("button[type='submit']")

   # Take screenshots for documentation
   # ⚠️ CRITICAL: ALWAYS use filePath to avoid buffer overflow (base64 images exceed 1MB limit)
   mcp__chrome_devtools__take_screenshot(filePath="./screenshots/test.png", fullPage=True)
   ```

6. **Network Analysis (NEW)**
   ```python
   # After navigating to a page, analyze network requests
   requests = mcp__chrome_devtools__list_network_requests()

   # Verify API calls:
   # ✅ All API requests return 200/201/204
   # ✅ No CORS errors (check for 'cors' in error messages)
   # ✅ Auth headers present on protected routes (Authorization: Bearer ...)
   # ✅ Response times reasonable (< 1s for most requests)
   # ✅ No 4xx/5xx errors

   # Get detailed request info for failures
   for req in requests:
       if req.status >= 400:
           details = mcp__chrome_devtools__get_network_request(req.reqid)
           # Analyze:
           # - Request headers (check Authorization)
           # - Response body (JSON error messages)
           # - Timing (slow requests)
           # - Resource type (xhr, fetch, document)
   ```

7. **Console Error Analysis (NEW)**
   ```python
   # After page loads, get all console messages
   messages = mcp__chrome_devtools__list_console_messages()

   # Filter by type and severity
   errors = [m for m in messages if m.type == "error"]
   warnings = [m for m in messages if m.type == "warn"]

   # CRITICAL: Zero errors is the target
   if errors:
       for error in errors:
           # Get full error details with stack trace
           details = mcp__chrome_devtools__get_console_message(error.msgid)

           # Report:
           # - Error message
           # - Stack trace with file:line
           # - Source location
           # - Suggested fix
   ```
```

**Location 3**: Line 164 (Critical requirements section)

**Add before "Take screenshots of UI issues using browser tool"**:
```python
# BEFORE
- Take screenshots of UI issues using browser tool

# AFTER
- Use Chrome DevTools for comprehensive testing:
  - Check console messages (list_console_messages) - zero errors required
  - Verify network requests (list_network_requests) - all should succeed
  - Test UI interactions (click, fill, wait_for)
  - Take screenshots of issues (take_screenshot)
  - Inspect failed requests (get_network_request) for debugging
```

---

### Phase 4: Prompt Reference Updates

#### File: `prompt_expander.py`

**Location 1**: Line 84

**Change**:
```python
# BEFORE
- Has the browser tool (mcp__browser__*) for frontend testing

# AFTER
- Has Chrome DevTools (mcp__chrome_devtools__*) for comprehensive frontend testing:
  - UI interactions (click, fill, navigate)
  - Console error detection (list_console_messages)
  - Network request analysis (list_network_requests)
  - Performance profiling (available but not required)
```

**Location 2**: Line 109

**Change**:
```python
# BEFORE
2. Browser testing with mcp__browser tools AFTER implementation

# AFTER
2. Frontend testing with Chrome DevTools AFTER implementation:
   - Navigate to app (new_page or navigate_page)
   - Check console for errors (list_console_messages) - MUST be zero
   - Verify network requests (list_network_requests) - all should return 200/201
   - Test UI interactions (click, fill, wait_for)
   - Take screenshots if issues found (take_screenshot)
   - Get request details for failures (get_network_request)
```

**Location 3**: Line 152

**Change**:
```python
# BEFORE
- Frontend MUST be tested with browser tool

# AFTER
- Frontend MUST be tested with Chrome DevTools:
  - Zero console errors (list_console_messages)
  - All network requests succeed (list_network_requests)
  - UI interactions work (click, fill, navigate)
```

---

#### File: `agent.py`

**Location**: Line 505 in `_build_generation_prompt()`

**Change**:
```python
# BEFORE
"- ✅ Test the app with browser tool",

# AFTER
"- ✅ Test the app with Chrome DevTools:",
"  - Check console for errors (zero errors required)",
"  - Verify network requests succeed",
"  - Test UI interactions",
```

---

### Phase 5: Documentation Updates

#### File: `README.md`

**Location 1**: Line 9

**Change**:
```markdown
# BEFORE
- **MCP Tools**: Browser automation, build testing, package management, dev server, shadcn/ui

# AFTER
- **MCP Tools**: Chrome DevTools automation, build testing, package management, dev server, shadcn/ui
```

**Location 2**: Line 20

**Change**:
```markdown
# BEFORE
✅ **Auto-Testing**: Uses browser tool to verify the app works

# AFTER
✅ **Auto-Testing**: Uses Chrome DevTools to verify app works (console, network, UI)
```

**Location 3**: Line 112

**Change**:
```markdown
# BEFORE
- Browser testing to verify it works

# AFTER
- Chrome DevTools testing:
  - Console error analysis (zero errors required)
  - Network request validation (all requests succeed)
  - UI interaction testing
```

**Location 4**: Lines 133-136

**Change**:
```markdown
# BEFORE
# MCP tools (browser, build, packages, etc.)
"mcp__browser__*",
"mcp__build_test__*",

# AFTER
# MCP tools (Chrome DevTools, build, packages, etc.)
"mcp__chrome_devtools__*",
"mcp__build_test__*",
```

**Location 5**: Line 226

**Change**:
```markdown
# BEFORE
- Browser testing before completion

# AFTER
- Chrome DevTools testing before completion:
  - Console errors checked
  - Network requests validated
  - UI interactions tested
```

---

#### File: `docs/pipeline-prompt.md` (Optional)

**Location 1**: Line 1152

**Change**:
```markdown
# BEFORE
6. `quality_assurer` (sonnet) - Testing, validation, browser automation → test results

# AFTER
6. `quality_assurer` (sonnet) - Testing, validation, Chrome DevTools automation → test results
```

**Location 2**: Line 1202

**Change**:
```markdown
# BEFORE
- Browser automation testing

# AFTER
- Chrome DevTools automation (console analysis, network debugging, UI interactions)
```

---

### Phase 6: Research Subagent Enhancement (2025-10-26)

**Added after initial implementation to handle JavaScript-rendered documentation.**

#### File: `subagents/research_agent.py`

**Problem**: Modern documentation sites (Next.js, Supabase, Vercel, etc.) are JavaScript-rendered. WebFetch returns blank pages or "Enable JavaScript" messages.

**Solution**: Add minimal Chrome DevTools subset as fallback when WebFetch fails.

**Location 1**: Lines 115-123 (tools list)

**Change**:
```python
# BEFORE
tools=[
    "TodoWrite",
    "WebSearch",
    "WebFetch",
    "Read",
    "Write",
    "mcp__mem0__add_memory",
    "mcp__context_manager__analyze_query"
],

# AFTER
tools=[
    "TodoWrite",
    "WebSearch",
    "WebFetch",  # Primary - fast, works for static pages
    "Read",
    "Write",
    "mcp__mem0__add_memory",
    "mcp__context_manager__analyze_query",

    # Chrome DevTools (fallback for JS-rendered docs)
    "mcp__chrome_devtools__new_page",      # Create page
    "mcp__chrome_devtools__navigate_page", # Navigate
    "mcp__chrome_devtools__take_snapshot", # Get rendered text
    "mcp__chrome_devtools__close_page",    # Clean up
],
```

**Location 2**: Lines 36-40 (prompt - Online Research section)

**Add after "Investigate similar existing solutions"**:
```markdown
   **Reading Documentation:**
   - **Use WebFetch first** (primary tool - fast, works for static pages)
   - **Use Chrome DevTools** if WebFetch returns empty/broken content:
     ```python
     # For JavaScript-rendered documentation sites
     mcp__chrome_devtools__new_page('https://docs.example.com')
     mcp__chrome_devtools__take_snapshot(filePath="./snapshots/docs.txt")  # Get rendered text content
     mcp__chrome_devtools__close_page()     # Always clean up
     ```
   - Chrome DevTools handles modern JS-heavy doc sites (Next.js, Supabase, Vercel, etc.)
   - **Always close pages** when done to free resources
```

**Rationale**:
- **Minimal Subset**: Only 4 navigation/snapshot tools (not full 19)
- **Fallback Strategy**: WebFetch first, Chrome DevTools when needed
- **Scope Focus**: Reading docs only, not testing or interaction
- **Complementary**: Fills gap when WebFetch fails on JS-rendered sites

**Tools Added**: 4 (new_page, navigate_page, take_snapshot, close_page)
**Tools NOT Added**: Interaction (click, fill), Debugging (console, network), Screenshots

**Use Cases**:
- ✅ Next.js documentation (app router, server components)
- ✅ Supabase docs (authentication, database)
- ✅ Modern API docs with interactive explorers
- ✅ Framework showcases with live demos
- ❌ Static documentation (use WebFetch - faster)

---

## Files Changed Summary

| File | Lines Changed | Type | Priority |
|------|---------------|------|----------|
| `vendor/cc-tools/cc_tools/mcp_registry.py` | +12 | Add entry | Required |
| `src/.../app_generator/agent.py` | 1 | String replace | Required |
| `src/.../app_generator/config.py` | ~20 | Tool list update | Required |
| `src/.../subagents/quality_assurer.py` | ~100 | Tools + prompt | Required |
| `src/.../subagents/research_agent.py` | ~20 | Tools + prompt | Recommended |
| `src/.../app_generator/prompt_expander.py` | ~15 | String updates | Required |
| `src/.../app_generator/README.md` | ~20 | Doc updates | Recommended |
| `src/.../reprompter/prompts.py` | 1 | String update | Recommended |
| `docs/pipeline-prompt.md` | 2 | String updates | Optional |

**Total**: 5 required files, 4 recommended files, 1 optional file

**Phase 1-5 (Initial Implementation)**: 7 files
**Phase 6 (Research Enhancement)**: 1 file (research_agent.py)

---

## Testing Plan

### 1. Verify MCP Registry
```bash
# Test chrome_devtools is registered
uv run python -c "from cc_tools.mcp_registry import get_mcp_config; import json; print(json.dumps(get_mcp_config(['chrome_devtools']), indent=2))"

# Should show:
# {
#   "chrome_devtools": {
#     "type": "stdio",
#     "command": "npx",
#     "args": ["-y", "chrome-devtools-mcp@latest"],
#     ...
#   }
# }
```

### 2. Test Agent Initialization
```bash
# Run app-generator and verify chrome_devtools loads
uv run python run-app-generator.py "Create a simple todo app"

# Expected in logs:
# ✅ "Starting MCP server: chrome_devtools"
# ✅ "chrome_devtools tools available: 27 tools"
# ❌ NO references to "browser" MCP server
```

### 3. Verify Tool Availability
Check that quality_assurer subagent has access to Chrome DevTools tools:
```python
# In agent logs, look for:
✅ mcp__chrome_devtools__navigate_page
✅ mcp__chrome_devtools__list_console_messages
✅ mcp__chrome_devtools__list_network_requests

# Should NOT see:
❌ mcp__browser__open_browser
❌ mcp__browser__navigate_browser
```

### 4. End-to-End Test
Generate a simple app and verify Chrome DevTools is used:

```bash
# Generate app
uv run python run-app-generator.py "Create a simple blog app with posts and comments"

# Expected behavior:
# 1. App generation completes
# 2. quality_assurer uses Chrome DevTools for testing
# 3. Agent checks console for errors using list_console_messages
# 4. Agent checks network requests using list_network_requests
# 5. Agent reports zero console errors
# 6. Agent reports all network requests succeeded
```

### 5. Production Testing (Manual)
Test Chrome DevTools manually on a deployed app:

```bash
# Use Chrome DevTools MCP to test KidIQ or similar
npx -y chrome-devtools-mcp@latest

# Verify:
✅ Can create new pages
✅ Can navigate to URLs
✅ Can take snapshots
✅ Can list console messages
✅ Can list network requests
✅ Can click and fill forms
```

---

## Rollback Plan

If issues occur, revert in reverse order:

### Immediate Rollback (Minutes)
1. **Revert agent.py**: Change "chrome_devtools" back to "browser"
2. **Revert config.py**: Restore old mcp__browser__* tool list
3. **Restart agent**: Changes take effect immediately

### Full Rollback (If needed)
1. Revert all 6 files using git:
   ```bash
   git checkout HEAD -- vendor/cc-tools/cc_tools/mcp_registry.py
   git checkout HEAD -- src/app_factory_leonardo_replit/agents/app_generator/agent.py
   git checkout HEAD -- src/app_factory_leonardo_replit/agents/app_generator/config.py
   git checkout HEAD -- src/app_factory_leonardo_replit/agents/app_generator/subagents/quality_assurer.py
   git checkout HEAD -- src/app_factory_leonardo_replit/agents/app_generator/prompt_expander.py
   git checkout HEAD -- src/app_factory_leonardo_replit/agents/app_generator/README.md
   ```

2. Verify old browser tool works:
   ```bash
   uv run python run-app-generator.py "Test app"
   # Should see: "Starting MCP server: browser"
   ```

---

## Benefits Summary

### Before: Browser Tool (cc_tools.browser)
- ✅ Simple navigation
- ✅ Basic clicking
- ✅ Screenshots
- ❌ **No console access** - Can't detect JavaScript errors
- ❌ **No network analysis** - Can't debug API calls or CORS
- ❌ **No performance profiling** - Can't measure LCP, FID, CLS
- ❌ **No request inspection** - Can't see headers, response bodies

### After: Chrome DevTools MCP
- ✅ Advanced navigation (multi-page, tab management)
- ✅ Rich interactions (click, fill, drag, hover, upload, dialogs)
- ✅ Screenshots + DOM snapshots (text-based, uid-based selection)
- ✅ **Console message analysis** - Detect and diagnose JavaScript errors
- ✅ **Network request inspection** - Debug API calls, CORS, auth headers
- ✅ **Performance profiling** - Measure Core Web Vitals (LCP, FID, CLS)
- ✅ **Request/response inspection** - See headers, bodies, timing
- ✅ **Script evaluation** - Run JavaScript in page context
- ✅ **Emulation** - CPU throttling, network conditions, viewport sizes

### Impact on App Generation Quality

**Before**:
- Agent could only test if pages loaded
- No visibility into console errors
- No visibility into network failures
- Had to rely on build errors only

**After**:
- Agent can detect and fix console errors proactively
- Agent can debug network issues (CORS, auth, API failures)
- Agent can verify all API calls succeed
- Agent can ensure zero JavaScript errors before completion
- Agent can measure and optimize performance

**Result**: Higher quality generated apps with fewer runtime errors.

---

## Known Limitations & Considerations

### Environment Requirements
- **Node.js 22+** required for chrome-devtools-mcp
- **Chrome browser** must be installed (stable channel by default)
- **Network access** to download chrome-devtools-mcp via npx

### Performance Considerations
- Chrome DevTools MCP is slightly slower than simple browser tool (Playwright)
- Worth the tradeoff for debugging capabilities
- Can still use browser tool for simple navigation if speed is critical

### Learning Curve
- Agents need to adapt to new tool naming (mcp__chrome_devtools__* vs mcp__browser__*)
- Prompt updates guide agents on when to use new capabilities
- Quality assurer prompt now includes console/network checking workflows

---

## Troubleshooting

### Issue: "MCP server is not running" or Connection Errors

**Symptoms:**
- Agent reports "The MCP server needs to reconnect"
- Agent says "chrome-devtools-mcp process is not running"
- Tools are not available when agent tries to use them

**Diagnosis Steps:**

1. **Verify Chrome is installed:**
   ```bash
   ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   # Should show: Google Chrome
   ```

2. **Test chrome-devtools-mcp manually:**
   ```bash
   npx -y chrome-devtools-mcp@latest --version
   # Should show version number (e.g., 0.9.0)
   ```

3. **Check MCP registry:**
   ```bash
   uv run python -c "from cc_tools.mcp_registry import MCP_REGISTRY; print('chrome_devtools' in MCP_REGISTRY)"
   # Should show: True
   ```

4. **Clear Python cache:**
   ```bash
   find vendor/cc-tools/cc_tools -name "*mcp_registry*" -path "*__pycache__*" -delete
   find src/app_factory_leonardo_replit/agents/app_generator -name "__pycache__" -type d -exec rm -rf {} +
   ```

5. **Test minimal agent:**
   ```bash
   uv run python -c "
   from cc_agent import Agent
   import asyncio

   async def test():
       agent = Agent(
           name='Test',
           system_prompt='Test agent',
           model='haiku',
           max_turns=1,
           mcp_tools=['chrome_devtools']
       )
       result = await agent.run('Create new page at https://example.com')
       print(result.content[:200])

   asyncio.run(test())
   "
   ```

**Common Solutions:**

1. **Cache Issue** - Clear Python cache files (step 4 above)

2. **Chrome Not Found** - Chrome DevTools MCP automatically finds Chrome on macOS at standard location. No configuration needed.

3. **Node.js Version** - Ensure Node.js 22+ is installed:
   ```bash
   node --version  # Should be v22.x or higher
   ```

4. **Network Issue** - First run downloads chrome-devtools-mcp via npx. Ensure network access.

5. **Transient Connection** - If MCP server disconnects during long sessions, agent will report error. This is usually temporary - try running the command again.

**Prevention:**

- The chrome-devtools MCP server is managed automatically by cc-agent
- It starts when the agent initializes with `mcp_tools=['chrome_devtools']`
- It stops when the agent session ends
- No manual server management needed

### Issue: Tools Not Showing Individual Commands

**Symptom:**
- `agent.list_available_tools()` shows only `mcp__chrome_devtools` instead of individual tools like `mcp__chrome_devtools__new_page`

**Solution:**
This is **expected behavior**. The MCP server appears as a single tool entry, but individual tools are available when the agent tries to use them. Example:

```python
tools = agent.list_available_tools()
# Shows: ['mcp__chrome_devtools', ...]  ← This is correct!

# Agent can still use:
await agent.run('Use mcp__chrome_devtools__new_page to create a page')
# Works perfectly!
```

### Issue: Quality Assurer Running Playwright Tests on Production

**Symptom:**
- quality_assurer opens Playwright test UI (localhost:9323) when testing production URLs
- Agent runs `playwright test` instead of using Chrome DevTools
- Session hangs waiting for Playwright tests to complete

**Root Cause:**
- Agent didn't distinguish between local (localhost) and production (https://) testing modes
- Saw playwright.config.ts and decided to run test suite
- Original prompt mentioned running tests but didn't specify when

**Solution (Implemented):**
Added concise mode detection to quality_assurer.py (lines 14-17):

```markdown
TESTING MODES - Simple Rules:
1. **ALWAYS use Chrome DevTools** to test the URL you're given
2. **Local (localhost:*)**: Also run `npm run build`, tests if they exist
3. **Production (https://*)**: Chrome DevTools ONLY, skip builds/tests
```

Updated browser testing section with clear local vs production examples:
- Section 5: Chrome DevTools testing (works for both modes)
- Section 6: Local mode example (builds + tests + Chrome DevTools)
- Section 7: Production mode example (Chrome DevTools ONLY)

Updated CRITICAL REQUIREMENTS section (lines 183-192):
- ALWAYS use Chrome DevTools for both modes
- Local mode: Run builds + tests + Chrome DevTools
- Production mode: Chrome DevTools ONLY

**Kill Hanging Playwright Process:**
```bash
pkill -f "playwright test"
```

**Files Changed:**
- `src/app_factory_leonardo_replit/agents/app_generator/subagents/quality_assurer.py`

**Commit:** 215b5995

### Verification Test

Run this to confirm everything is working:

```bash
uv run python -c "
from src.app_factory_leonardo_replit.agents.app_generator import create_app_generator
import asyncio

async def test():
    agent = create_app_generator()
    result = await agent.agent.run('Use chrome devtools to create a page at https://example.com')
    print('✅ Chrome DevTools working!' if 'example.com' in result.content.lower() else '❌ Failed')

asyncio.run(test())
"
```

Expected output: `✅ Chrome DevTools working!`

---

## Success Criteria

Implementation is successful when:

✅ **Registry**: chrome_devtools entry exists in mcp_registry.py
✅ **Agent**: app-generator uses chrome_devtools in mcp_tools list
✅ **Config**: All tool references updated from mcp__browser__* to mcp__chrome_devtools__*
✅ **Subagent**: quality_assurer has Chrome DevTools tools and updated prompt
✅ **Prompts**: All references to "browser tool" updated to "Chrome DevTools"
✅ **Testing**: Agent can successfully test generated apps using Chrome DevTools
✅ **Console**: Agent detects and reports console errors
✅ **Network**: Agent detects and reports network failures
✅ **Zero Errors**: quality_assurer reports zero console errors for passing apps

---

## Timeline

- **Code Changes**: 30-45 minutes
- **Testing**: 30-45 minutes (includes end-to-end app generation)
- **Documentation**: Complete (this document)
- **Total**: ~1-1.5 hours

---

## References

- **Chrome DevTools MCP**: https://github.com/ChromeDevTools/chrome-devtools-mcp
- **Chrome DevTools Protocol**: https://chromedevtools.github.io/devtools-protocol/
- **Production Testing Results**: docs/chrome-devtools.md (lines 521-854)
- **Implementation Plan**: This document

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Author**: AI App Factory Team
**Status**: Ready for Implementation
