# Session Persistence Fix - Complete Solution

## The Core Problem

When sessions failed (expired, terminated process, etc.), the code would fall back to `agent.run()` which:
1. Creates a **non-resumable** one-off execution
2. Generates a fake tracking UUID
3. Saves that fake UUID to `.agent_session.json`
4. Next resume tries to use the fake UUID → fails again → infinite loop of failures

## Root Cause

**Wrong approach**:
```python
# Creates non-resumable execution
result = await self.agent.run(prompt)
self.current_session_id = str(uuid.uuid4())  # Fake tracking ID, NOT a real session
```

**Correct approach**:
```python
# Creates NEW resumable session
result = await self.agent.run_with_session(prompt)  # No session_id = NEW session
# Real session ID captured from agent.session_id
```

## Understanding the Session API

### `agent.run(prompt)`
- One-off execution, **NOT resumable**
- No session continuity
- Used for simple fire-and-forget tasks

### `agent.run_with_session(prompt)` (no session_id)
- Creates a **NEW resumable session**
- Claude Code server knows about this session
- Can be resumed later with the captured session ID

### `agent.run_with_session(prompt, session_id="xxx")`
- **Resumes** existing session "xxx"
- Fails if session doesn't exist

## The Complete Fix

### 1. Generate App (Lines 344-350)
```python
# BEFORE:
logger.info("🔄 Falling back to non-session mode...")
result = await self.agent.run(generation_prompt)
self.current_session_id = str(uuid.uuid4())  # Fake UUID

# AFTER:
logger.info("🔄 Creating fresh session as fallback...")
result = await self.agent.run_with_session(generation_prompt)  # Real session
# Session ID captured at line 388-390 from agent.session_id
```

### 2. Resume With Session - "No conversation found" (Lines 732-736)
```python
# BEFORE:
logger.info("🔄 Session expired/not found, using non-session mode...")
result = await self.agent.run(resume_prompt)
self.current_session_id = str(uuid.uuid4())  # Fake UUID

# AFTER:
logger.info("🔄 Session expired/not found, creating fresh session...")
result = await self.agent.run_with_session(resume_prompt)  # Real session
# Session ID captured at line 755-761 from agent.session_id
```

### 3. Resume With Session - Final Fallback (Lines 744-750)
```python
# BEFORE:
logger.info("🔄 Falling back to non-session mode...")
result = await self.agent.run(resume_prompt)
self.current_session_id = str(uuid.uuid4())  # Fake UUID

# AFTER:
logger.info("🔄 Creating fresh session as final fallback...")
result = await self.agent.run_with_session(resume_prompt)  # Real session
# Session ID captured at line 755-761 from agent.session_id
```

## Session Capture Flow

### For ALL paths:
```python
# After agent completes work
result = await self.agent.run_with_session(...)

# Session ID is automatically captured
if hasattr(self.agent, 'session_id'):
    self.current_session_id = self.agent.session_id
    logger.info(f"📂 Session ID captured: {self.current_session_id[:8]}")

# Session is saved to file
self.save_session(app_path)

# Changelog is updated
await self.append_to_changelog(...)
```

## Complete Recovery Flow

### Scenario 1: Expired Session
```
Load session abc123 from file
  ↓
Try: run_with_session(prompt, session_id="abc123")
  ↓
Error: "No conversation found" ❌
  ↓
Detect "no conversation found"
  ↓
Create NEW session: run_with_session(prompt) [no session_id]
  ↓
Capture real session ID: def456 ✅
  ↓
Save session def456 to file ✅
  ↓
Next resume uses def456 and works! ✅
```

### Scenario 2: Terminated Process (Interactive Mode)
```
Load session abc123 from file
  ↓
Try: run_with_session(prompt, session_id="abc123")
  ↓
Error: "Cannot write to terminated process" ❌
  ↓
Detect "terminated"
  ↓
Try: run_with_session(prompt, session_id="xyz789") [new UUID]
  ↓
Error: "No conversation found" ❌ (new UUID doesn't exist)
  ↓
Create NEW session: run_with_session(prompt) [no session_id]
  ↓
Capture real session ID: jkl012 ✅
  ↓
Save session jkl012 to file ✅
  ↓
Next command in interactive mode uses jkl012 ✅
```

### Scenario 3: Fresh Generation
```
Start new app generation
  ↓
Try: run_with_session(prompt) [no session_id]
  ↓
If error, fallback: run_with_session(prompt) [no session_id]
  ↓
Capture real session ID: mno345 ✅
  ↓
Save session mno345 to file ✅
  ↓
Future resumes use mno345 ✅
```

## Session Continuity Guarantees

### What Gets Saved
✅ **Real session ID** from Claude Code server
✅ **App path** for this session
✅ **Generation context** (features, entities, last action)
✅ **Timestamp** of last modification

### What Persists Across Runs
✅ **Conversation history** (via Claude Code's session ID)
✅ **Context** (via generation_context in .agent_session.json)
✅ **Changelog** (via {app_name}.md)
✅ **Git history** (via git commits)

### Interactive Mode Flow
```
First command: "fix the login page"
  ↓
Work completed, session saved: session-abc123
  ↓
Interactive prompt appears
  ↓
Second command: "add dark mode"
  ↓
Loads session-abc123 from file
  ↓
Resumes conversation with context ✅
  ↓
Work completed, session updated
  ↓
Continue...
```

## Files Modified

**File**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

1. **Lines 344-350** (`generate_app` method)
   - Changed `agent.run()` to `agent.run_with_session()`
   - Removed fake UUID generation
   - Session ID now captured from agent

2. **Lines 732-736** (`resume_with_session` method - "no conversation found")
   - Changed `agent.run()` to `agent.run_with_session()`
   - Removed fake UUID generation
   - Session ID now captured from agent

3. **Lines 744-750** (`resume_with_session` method - final fallback)
   - Changed `agent.run()` to `agent.run_with_session()`
   - Removed fake UUID generation
   - Session ID now captured from agent

## Testing Checklist

### Test 1: Fresh Generation
```bash
uv run python run-app-generator.py "Create a todo app" --app-name TodoApp
# ✅ Session created and saved
# ✅ Check .agent_session.json has valid session ID
```

### Test 2: Resume with Valid Session
```bash
uv run python run-app-generator.py --resume apps/TodoApp/app "Add dark mode"
# ✅ Resumes existing session
# ✅ Conversation continues
```

### Test 3: Resume with Expired Session
```bash
# Delete the session on Claude Code server (or wait for expiry)
uv run python run-app-generator.py --resume apps/TodoApp/app "Fix bug"
# ✅ Detects "no conversation found"
# ✅ Creates NEW session
# ✅ Saves new session ID
# ✅ Future resumes work
```

### Test 4: Interactive Mode
```bash
uv run python run-app-generator.py --resume apps/TodoApp/app "test"
# First command completes
# Interactive prompt appears
# Type: "do more work"
# ✅ Session is valid and resumable
# ✅ Context is maintained
```

### Test 5: Verify Session File
```bash
cat apps/TodoApp/app/.agent_session.json
# Should show:
# - Valid UUID format session_id
# - Current timestamp
# - App path
# - Generation context
```

## Impact

### Before Fix
❌ Sessions broke after first failure
❌ Fake UUIDs saved to file
❌ Infinite loop of "no conversation found"
❌ Interactive mode broken after first command
❌ No conversation continuity

### After Fix
✅ Real resumable sessions always created
✅ Valid session IDs saved to file
✅ Graceful recovery from all errors
✅ Interactive mode works indefinitely
✅ Full conversation continuity maintained

## Related Documentation

- **INTERACTIVE_MODE_FIX.md** - Handling "terminated process" errors
- **SESSION_NOT_FOUND_FIX.md** - Detecting and handling expired sessions
- **CHANGELOG_FEATURE_SUMMARY.md** - Automatic changelog creation

This fix completes the session management trilogy and ensures robust, reliable session persistence across all scenarios.
