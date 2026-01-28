# Claude CLI Error Analysis: FileNotFoundError Mystery

## Summary

The error "Claude Code not found at: /Users/labheshpatel/.nvm/versions/node/v20.19.2/bin/claude" was misleading. The actual issue was that the `frontend` directory didn't exist when the subprocess tried to use it as the current working directory (cwd).

## Root Cause Analysis

### 1. The Error Chain

```
FileNotFoundError: [Errno 2] No such file or directory: '/Users/labheshpatel/apps/app-factory/apps/app_20250713_181421/frontend'
```

This error occurred in the following sequence:

1. The wireframe agent tried to run claude with `cwd` set to the frontend directory
2. The frontend directory didn't exist yet
3. `subprocess.Popen` (via `anyio.open_process`) raised `FileNotFoundError` because the cwd was invalid
4. The claude_code_sdk caught this error and misinterpreted it

### 2. The Misleading Error Message

In `subprocess_cli.py` lines 140-141:

```python
except FileNotFoundError as e:
    raise CLINotFoundError(f"Claude Code not found at: {self._cli_path}") from e
```

The SDK assumes that `FileNotFoundError` means the claude binary wasn't found, but `subprocess.Popen` raises the same error for:
- Missing executable (the command itself)
- Missing working directory (cwd parameter)

### 3. Why Creating the Directory Fixed It

When you created the frontend directory:
```bash
mkdir -p /Users/labheshpatel/apps/app-factory/apps/app_20250713_181421/frontend
```

This resolved the issue because:
- The `cwd` parameter now pointed to an existing directory
- `subprocess.Popen` could successfully start the process
- The claude binary was actually present and working all along

## Technical Details

### subprocess.Popen Behavior

`subprocess.Popen` raises `FileNotFoundError` in two distinct scenarios:

1. **Missing executable**: When the command/program doesn't exist
   ```python
   subprocess.Popen(['nonexistent_command'])  # FileNotFoundError
   ```

2. **Missing cwd**: When the working directory doesn't exist
   ```python
   subprocess.Popen(['echo', 'hello'], cwd='/nonexistent/dir')  # FileNotFoundError
   ```

Both produce the same exception type with errno 2 (ENOENT - No such file or directory).

### The SDK's Error Handling Flaw

The claude_code_sdk's error handling in `subprocess_cli.py` doesn't distinguish between these two cases:

```python
try:
    self._process = await anyio.open_process(
        cmd,
        stdin=None,
        stdout=PIPE,
        stderr=PIPE,
        cwd=self._cwd,  # This can cause FileNotFoundError
        env={**os.environ, "CLAUDE_CODE_ENTRYPOINT": "sdk-py"},
    )
except FileNotFoundError as e:
    # This assumes the error is always about the CLI binary
    raise CLINotFoundError(f"Claude Code not found at: {self._cli_path}") from e
```

## Implications

### 1. For the App Factory

The wireframe agent should ensure the output directory exists before trying to run claude with that directory as cwd:

```python
# Before running claude
output_dir = Path(app_dir) / "frontend"
output_dir.mkdir(parents=True, exist_ok=True)
```

### 2. For the SDK

The SDK could improve its error handling to distinguish between different causes of FileNotFoundError:

```python
try:
    self._process = await anyio.open_process(...)
except FileNotFoundError as e:
    # Check if it's the cwd that's missing
    if self._cwd and not Path(self._cwd).exists():
        raise CLIConnectionError(f"Working directory not found: {self._cwd}") from e
    else:
        raise CLINotFoundError(f"Claude Code not found at: {self._cli_path}") from e
```

## Lessons Learned

1. **Error messages can be misleading** - Always check the full traceback and consider all possible causes
2. **FileNotFoundError is overloaded** - It can mean different things in different contexts
3. **Defensive programming** - Always ensure directories exist before using them as cwd
4. **SDK assumptions** - The claude_code_sdk made an incorrect assumption about the cause of FileNotFoundError

## The Fix Implemented

We fixed this issue by modifying the Base Agent class to create the working directory if it doesn't exist:

```python
# In src/cc_agent/base.py, around line 110
if self.cwd is not None:
    # Ensure the working directory exists to avoid misleading "Claude Code not found" errors
    cwd_path = Path(self.cwd)
    if not cwd_path.exists():
        self.logger.info(f"Creating working directory: {cwd_path}")
        cwd_path.mkdir(parents=True, exist_ok=True)
    options_dict["cwd"] = str(self.cwd)
```

This ensures that:
- All agents inheriting from Base Agent get this protection automatically
- No agent needs to worry about creating its working directory
- The misleading error message is prevented
- The fix is centralized and maintainable

## Verification

The test script `test_subprocess_cwd.py` demonstrates this behavior:

```python
# This raises FileNotFoundError even though 'echo' exists
subprocess.run(['echo', 'hello'], cwd='/non/existent/directory')
# FileNotFoundError: [Errno 2] No such file or directory: '/non/existent/directory'
```

This confirms that subprocess raises the same error for both missing commands and missing working directories.

The test script `test_agent_cwd_fix.py` verifies that our fix works correctly by testing agents with non-existent, existing, and no cwd specified.