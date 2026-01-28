# Interactive Mode "Terminated Process" Fix

## Problem
When using the app generator in interactive mode, after completing the first task, subsequent commands would fail with:
```
CLIConnectionError: Cannot write to terminated process (exit code: 1)
```

## Root Cause
After completing a task, the Claude CLI subprocess exits normally. When the interactive loop tries to send the next command, it attempts to write to the terminated process.

The error handler was checking for keywords like "session", "command failed", "uuid" but **not** "terminated", so the error wasn't caught and the program crashed.

## The Fix
Added `"terminated"` to the error detection keywords in two locations:

### 1. `resume_with_session()` method (Line 724)
```python
# Before:
if "session" in error_msg or "command failed" in error_msg or "not found" in error_msg or "uuid" in error_msg:

# After:
if "session" in error_msg or "command failed" in error_msg or "not found" in error_msg or "uuid" in error_msg or "terminated" in error_msg:
```

### 2. `generate_app()` method (Line 344)
```python
# Before:
if "session" in error_msg or "command failed" in error_msg or "not found" in error_msg or "uuid" in error_msg:

# After:
if "session" in error_msg or "command failed" in error_msg or "not found" in error_msg or "uuid" in error_msg or "terminated" in error_msg:
```

## How It Works Now

When the process terminates:
1. User sends next command in interactive mode
2. Agent tries to use existing client, which has terminated
3. `CLIConnectionError` is raised with message containing "terminated"
4. Error handler detects "terminated" keyword
5. Agent attempts recovery:
   - First: Try with a fresh session ID
   - Second: If that fails, fall back to non-session mode
6. Work continues without crashing

## Recovery Flow

```
User Command → Try session → Process terminated
                    ↓
              Catch error (now catches "terminated")
                    ↓
              Try with new session ID
                    ↓
              Success ✅ OR Fall back to non-session mode ✅
```

## What Gets Preserved

✅ **Session Continuity**: Session ID is loaded from file for each command
✅ **Context**: `generation_context` persisted via `.agent_session.json`
✅ **Changelog**: Each operation still appends to `{app_name}.md`
✅ **Git History**: All commits are preserved

## Testing

### Before Fix
```bash
uv run python run-app-generator.py --resume apps/RaiseIQ/app "test"
# Complete task
# Interactive prompt appears
# Type: "do more work"
# ❌ CLIConnectionError: Cannot write to terminated process
```

### After Fix
```bash
uv run python run-app-generator.py --resume apps/RaiseIQ/app "test"
# Complete task
# Interactive prompt appears
# Type: "do more work"
# ⚠️  Session xxx failed: Cannot write to terminated process...
# 📝 Attempting with fresh session: yyy...
# ✅ Continues working!
```

## Files Modified

**File**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`
- Line 724: Added "terminated" to `resume_with_session()` error detection
- Line 344: Added "terminated" to `generate_app()` error detection

## Why This Approach

**Alternative considered**: Add process health checks before each run
- ❌ More complex
- ❌ Requires understanding Claude SDK internals
- ❌ Harder to maintain

**Chosen approach**: Extend existing error handling
- ✅ Minimal change (one keyword)
- ✅ Leverages existing recovery logic
- ✅ Low risk
- ✅ Easy to understand and maintain

## Impact

- **Interactive mode** now works reliably for multiple consecutive commands
- **No breaking changes** to existing functionality
- **Graceful degradation** if sessions keep failing
- **Clear user feedback** via warning messages

## Related Issues Fixed

This fix also addresses the same error that could theoretically occur during:
- Initial app generation (if process terminates unexpectedly)
- Resume operations (if session process dies mid-operation)

The error handling is now more robust across all agent operations.
