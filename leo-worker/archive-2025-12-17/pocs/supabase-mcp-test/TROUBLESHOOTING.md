# Supabase Setup MCP Server - Troubleshooting Guide

**Date**: 2025-11-24
**Issue**: MCP tool hung during first production use with MatchMind generation

## Problem Description

During the first production test with MatchMind app generation, the `mcp__supabase_setup__create_supabase_project` tool hung indefinitely at Step 7 (migration creation).

### Symptoms
- Tool called at 16:07:22 (12:07 PM)
- Supabase project created successfully (status: ACTIVE_HEALTHY)
- Migration file created but EMPTY (0 bytes)
- Process `supabase migration new initial_schema` (PID 53969) still running after 8+ minutes
- No .env file generated (tool never completed)
- MCP server process still running, waiting for command to return

### Investigation Findings

#### Root Cause
The `_run_command` method in the MCP server did not explicitly handle stdin, causing subprocesses to inherit stdin from the parent MCP server process.

**Original Code**:
```python
process = await asyncio.create_subprocess_exec(
    *cmd,
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE,
    cwd=cwd
    # ❌ stdin not specified - inherits from parent
)
```

When stdin is not specified, the subprocess inherits stdin from the parent. The `supabase migration new` command supports stdin piping (per docs: "Outputs from other commands like `db diff` may be piped to `migration new <name>` via stdin"), so it was waiting for stdin input that would never arrive.

#### Evidence
From `lsof -p 53969`:
```
supabase 53969 labheshpatel    7w     REG ... 0 .../20251124160808_initial_schema.sql
```

The process had the migration file open for writing (FD 7w) but never wrote anything or closed it, indicating it was blocked waiting for input.

## Fix Implementation

Three key improvements were made to `vendor/cc-tools/cc_tools/supabase_setup/server.py`:

### 1. Explicit stdin Handling

**Change**: Always explicitly set stdin to prevent inheritance from parent process.

```python
async def _run_command(self, cmd: list, cwd: str = None, stdin_data: str = None, timeout: int = 300):
    # Always explicitly handle stdin to prevent hanging
    stdin_mode = asyncio.subprocess.PIPE if stdin_data else asyncio.subprocess.DEVNULL

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdin=stdin_mode,  # ✅ Explicitly set stdin
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=cwd
    )
```

**Why**: Setting `stdin=asyncio.subprocess.DEVNULL` closes stdin immediately for commands that don't need it, preventing them from waiting for input.

### 2. Use stdin Piping for Migration Creation

**Change**: Pipe schema SQL directly to `supabase migration new` via stdin.

**Before**:
```python
# Create empty file
migration_result = await self._run_command(
    ["supabase", "migration", "new", "initial_schema"],
    cwd=app_directory
)
# Then write to file manually
migration_file.write_text(schema_sql)
```

**After**:
```python
# Pipe schema directly via stdin (documented approach)
migration_result = await self._run_command(
    ["supabase", "migration", "new", "initial_schema"],
    cwd=app_directory,
    stdin_data=schema_sql  # ✅ Pipe content via stdin
)
```

**Why**: This is the documented approach per Supabase CLI reference. The command reads from stdin and writes directly to the migration file, avoiding the two-step process.

### 3. Timeout Protection

**Change**: Add timeout handling to prevent indefinite hangs.

```python
try:
    stdout, stderr = await asyncio.wait_for(
        process.communicate(input=stdin_data.encode('utf-8')),
        timeout=timeout  # Default: 300 seconds (5 minutes)
    )
except asyncio.TimeoutError:
    self.logger.error(f"Command timed out after {timeout}s")
    process.kill()
    await process.wait()
    return {"success": False, "stderr": f"Command timed out after {timeout} seconds"}
```

**Why**: Provides a safety net if commands hang for any reason. 5-minute timeout is generous but prevents indefinite blocking.

## Testing the Fix

### Quick Verification
```bash
# Test MCP server loads
uv run python -m cc_tools.supabase_setup.server --help

# Should see:
# INFO     Starting MCP server 'SupabaseSetup' with transport 'stdio'
```

### Integration Test
```bash
# Run integration test (doesn't create actual project)
uv run python test-supabase-setup-integration.py

# Expected output:
# ✅ Agent configured with supabase_setup MCP tool
# ✅ TEST PASSED: Tool is accessible to agents
```

### Production Test
Generate an app to test end-to-end:
```bash
uv run python src/app_factory_leonardo_replit/run.py "Create a simple todo app"
```

Watch for:
- Step 7 completes quickly (< 30 seconds)
- Migration file has content (check file size > 0)
- .env file generated with credentials
- Tool returns success response

## Robustness Improvements

The fix makes the MCP tool more robust in several ways:

### Before Fix
- ❌ Commands could hang indefinitely waiting for stdin
- ❌ No timeout protection
- ❌ Two-step migration creation (create empty + write)
- ❌ No fallback if piping fails

### After Fix
- ✅ All commands explicitly handle stdin (DEVNULL or PIPE)
- ✅ 5-minute timeout on all commands
- ✅ One-step migration creation via stdin piping
- ✅ Fallback to direct file writing if needed
- ✅ File size verification after creation
- ✅ Detailed error logging

## Debugging Commands

If the tool hangs again, use these commands to diagnose:

```bash
# Find running supabase processes
ps aux | grep supabase | grep -v grep

# Check file descriptors for a process
lsof -p <PID>

# Check MCP server logs
cat /tmp/cc_agent_mcp_supabase_setup.log | tail -100

# Find conversation logs
ls -lt ~/.claude/projects/*/conversations/*.jsonl | head -5

# Check for tool_result in conversation
grep -A 20 "mcp__supabase_setup__create_supabase_project" <conversation.jsonl>

# Kill hanging process if needed
kill <PID>
```

## Key Learnings

1. **Always explicitly set stdin**: Never let subprocesses inherit stdin from parent in non-interactive contexts.

2. **Use documented approaches**: Supabase CLI supports stdin piping - use it instead of workarounds.

3. **Add timeouts**: Even "simple" commands can hang in unexpected ways. Always use timeouts.

4. **Verify results**: Check file sizes, process completion, and return codes - don't assume success.

5. **Log everything**: The detailed logging helped quickly identify where the hang occurred.

## References

- **Supabase CLI Reference**: https://supabase.com/docs/reference/cli/supabase-migration-new
- **Python asyncio subprocess**: https://docs.python.org/3/library/asyncio-subprocess.html
- **Original Implementation**: `pocs/supabase-mcp-test/IMPLEMENTATION-COMPLETE.md`

## Status

**Fixed**: ✅
**Tested**: ⏳ Pending production validation
**Deployed**: ✅ Code in `vendor/cc-tools/cc_tools/supabase_setup/server.py`
