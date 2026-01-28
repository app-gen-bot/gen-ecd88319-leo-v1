# Logging Configuration

## Overview

The app-factory uses a dual logging system:
- **Console**: User-friendly output without timestamps
- **File**: Detailed logs with timestamps for debugging

## Log Files

When running app generation, logs are written to:

```
logs/
├── app_generator_YYYY-MM-DD.log   # App initialization and high-level flow
└── cc_agent_YYYY-MM-DD.log        # Agent execution (Turn X/Y, tools, delegation)
```

## What Goes Where

### app_generator_*.log
- App Generator initialization
- User prompts and expansion
- High-level status messages
- Success/error summaries

### cc_agent_*.log  ⭐ **Most Important for Debugging**
- Agent execution: Turn 1/20, Turn 2/20, etc.
- Tool usage: 🔧 Using tool: Task, Read, Write, etc.
- **Subagent delegation**: 🤖 Delegating to research_agent...
- MCP server configuration
- Detailed execution flow
- DEBUG-level messages (file only)

## Configuration

### In run-app-generator.py (lines 184-193)

```python
# File logging via setup_logging (adds file handler)
setup_logging("app_generator", log_dir=log_dir)

# Also setup file logging for cc_agent namespace (for Agent execution logs)
# This ensures Turn X/Y, tool usage, and subagent delegation logs go to file
setup_logging("cc_agent", log_dir=log_dir, console_level="INFO", file_level="DEBUG")

# Prevent double console output - don't propagate to root logger
logging.getLogger("app_generator").propagate = False
logging.getLogger("cc_agent").propagate = False
```

### Log Levels

**Console (INFO)**:
- Important status messages
- Tool usage
- Turn progress
- Errors and warnings

**File (DEBUG)**:
- Everything from console, plus:
- Detailed execution flow
- Debug messages
- Full context and metadata

## Monitoring Subagent Delegation

To see if subagent delegation is happening, check **cc_agent_*.log** for:

```
🔧 [AppGeneratorAgent] Turn X/Y - Using tool: Task
🤖 Delegating to research_agent...
```

The Task tool is the mechanism for subagent delegation in claude-agent-sdk.

## Testing Logging

Run the test script:
```bash
uv run python test-logging-fix.py
```

Expected output:
- Console shows INFO logs
- Files show INFO + DEBUG logs
- Both namespaces (app_generator, cc_agent) write to files

## Common Issues

### Problem: Duplicate console logs (messages appearing twice)
**Solution**: Ensure `propagate = False` is set on configured loggers (lines 192-193). Without this, logs propagate to root logger's handler causing duplicates.

### Problem: Can't find agent execution logs
**Solution**: Check `logs/cc_agent_*.log` not `app_generator_*.log`

### Problem: Turn X/Y messages not in file
**Solution**: Ensure both `setup_logging()` calls are present in run-app-generator.py

### Problem: Want more/less console output
**Solution**: Change `console_level="INFO"` to "DEBUG" (more) or "WARNING" (less)

## Best Practices

1. **Always check cc_agent_*.log for execution details**
2. **Use DEBUG level in files for troubleshooting**
3. **Keep console at INFO for clean UX**
4. **Check logs after each run to verify delegation**

## Example Log Output

### Console
```
🚀 App Generator starting up...
📁 Log directory: /Users/.../logs
✅ AppGeneratorAgent initialized
🔄 [AppGeneratorAgent] Turn 1/1000 - Starting agent execution
🔧 [AppGeneratorAgent] Turn 1/1000 - Using tool: Task
```

### cc_agent_2025-10-16.log
```
2025-10-16 00:05:20 - cc_agent.AppGeneratorAgent - INFO - 🤖 AppGeneratorAgent: Starting...
2025-10-16 00:05:21 - cc_agent.AppGeneratorAgent - INFO - 🔄 [AppGeneratorAgent] Turn 1/1000 - Starting agent execution
2025-10-16 00:05:22 - cc_agent.AppGeneratorAgent - INFO - 🔧 [AppGeneratorAgent] Turn 1/1000 - Using tool: Task
2025-10-16 00:05:22 - cc_agent.AppGeneratorAgent - DEBUG - Tool input: {"subagent_type": "research_agent", ...}
2025-10-16 00:05:23 - cc_agent.AppGeneratorAgent - INFO - 🤖 Delegating to research_agent...
```

---

**Updated**: October 16, 2025
**Version**: 1.0
**Related**: claude-agent-sdk migration, subagent implementation
