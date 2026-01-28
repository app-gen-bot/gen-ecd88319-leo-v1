# Directory Parameter - Multi-Frontend Support

## Purpose

The `directory` parameter supports generating multiple web application frontends within a single workspace.

## Usage

```python
# Default: runs in workspace root
build_test(command="verify")

# Specific frontend: runs in workspace/frontend1
build_test(command="verify", directory="frontend1")

# Another frontend: runs in workspace/frontend2  
build_test(command="verify", directory="frontend2")
```

## Implementation

- Resolves to: `workspace_path/directory` (or just `directory` if no workspace_path)
- All commands (verify, start-server, stop-server) use the same resolved work_dir
- Requires `package.json` in target directory

## Anti-YAGNI Note

This feature was added to support multiple frontend generation scenarios in AppFactory, not just single frontend use
cases.