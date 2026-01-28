# Full Conversation Logging for All Agents

## Overview

This system provides **complete visibility** into all agent conversations, including main agents and subagents (Task tool delegations). Every message, tool use, thinking block, and result is captured for debugging and forensics.

## Problem Solved

**Before:** Subagents run in separate processes via the Task tool. Their console output isn't visible in the parent process, making troubleshooting nearly impossible.

**After:** All agents (main + subagents) automatically log full conversation flow to both human-readable text files and machine-parseable JSONL files.

## How It Works

### Architecture

1. **Environment Variable Activation**: `ENABLE_CONVERSATION_LOGGING=true` enables logging for ALL agents
2. **Shared Log Directory**: `AGENT_LOG_DIR` points to a central location accessible by all processes
3. **ConversationLogger**: Integrated into `cc_agent.Agent` base class
4. **Dual Format**:
   - **Text files**: Human-readable with formatting for quick review
   - **JSONL files**: Machine-parseable for analysis and tooling

### What's Captured

Each conversation log includes:

- ✅ **User prompts** - Full input text
- ✅ **Assistant responses** - All text blocks
- ✅ **Thinking blocks** - Extended thinking (if enabled)
- ✅ **Tool uses** - Tool name, input parameters, IDs
- ✅ **Tool results** - (via turn-by-turn capture)
- ✅ **Metadata** - Timestamps, turn numbers, agent names
- ✅ **Results** - Final cost, tokens, duration, success/failure
- ✅ **Errors** - Exception details, partial output, context

### File Structure

```
logs/
├── conversations/
│   ├── conversation_App_Generator_Agent_20250109_143022.txt      # Human-readable
│   ├── conversation_App_Generator_Agent_20250109_143022.jsonl    # Machine-parseable
│   ├── conversation_Schema_Generator_20250109_143045.txt
│   ├── conversation_Schema_Generator_20250109_143045.jsonl
│   ├── conversation_Page_Writer_20250109_143102.txt              # Subagent logs!
│   └── conversation_Page_Writer_20250109_143102.jsonl
```

## Usage

### Enable Logging

Logging is **automatically enabled** when you run `run-app-generator.py`. The environment variables are set at startup:

```python
# In run-app-generator.py (lines 774-776)
os.environ["ENABLE_CONVERSATION_LOGGING"] = "true"
os.environ["AGENT_LOG_DIR"] = str(log_dir.absolute())
```

### Monitor in Real-Time

Use the provided monitoring script to watch conversations as they happen:

```bash
# Monitor all conversations (automatically picks up new files)
./monitor-conversations.sh

# Monitor text logs only
./monitor-conversations.sh text

# Monitor JSONL logs only
./monitor-conversations.sh jsonl

# Monitor specific agent
./monitor-conversations.sh "Page_Writer"
```

**Note:** The monitor shows **live updates** as they happen. It automatically detects and starts following new log files created after you start the monitor.

### View Full Conversations

To see the **complete conversation from the beginning**, use the view script:

```bash
# List all available conversations
./view-conversation.sh

# View latest conversation (opens in pager)
./view-conversation.sh latest

# View latest and follow live updates
./view-conversation.sh latest --follow

# View specific file
./view-conversation.sh conversation_AppGeneratorAgent_20251111_082420.txt

# View latest for specific agent
./view-conversation.sh AppGeneratorAgent

# View and follow specific agent
./view-conversation.sh Reprompter --follow
```

**Example output:**

```
================================================================================
Agent: Schema Generator
Session: 20250109_143045
Started: 2025-01-09T14:30:45.123456
================================================================================

================================================================================
USER PROMPT [2025-01-09T14:30:45.123456]
================================================================================
Generate database schema for a todo app with users and tasks

================================================================================
ASSISTANT RESPONSE - Turn 1/10 [2025-01-09T14:30:47.234567]
================================================================================

--- Thinking ---
I need to create a schema with users and tasks tables. Users should have basic auth fields...

--- Response ---
I'll create a database schema for your todo app with users and tasks.

--- Tool Uses ---
🔧 Write (id: toolu_abc123)
   Input: {
     "file_path": "/path/to/schema.ts",
     "content": "..."
   }

================================================================================
RESULT [2025-01-09T14:30:52.345678]
================================================================================
Success: True
Termination: completed
Cost: $0.0234
Duration: 7123ms
Tokens: 1234 in, 567 out
```

### Analyze Conversations

Use the analysis script to extract insights from JSONL logs:

```bash
# List available conversations
python analyze-conversation.py

# Analyze specific conversation
python analyze-conversation.py logs/conversations/conversation_App_Generator_Agent_20250109_143022.jsonl
```

**Example analysis output:**

```
================================================================================
CONVERSATION ANALYSIS
================================================================================
Agent: App Generator Agent
Success: ✅ YES
Termination: completed

================================================================================
STATISTICS
================================================================================
Total Messages: 47
User Prompts: 1
Assistant Responses: 23

Tool Usage:
  - Write: 12
  - Read: 8
  - Edit: 5
  - Task: 3  # <- Subagent delegations!
  - Bash: 2

Total Cost: $1.2345
Tokens In: 45,678
Tokens Out: 23,456

================================================================================
TIMELINE
================================================================================

[2025-01-09T14:30:45] User Prompt
  Create a todo app with user authentication

[2025-01-09T14:30:47] Turn 1/10
  Tools: Task
  Delegating to Schema Generator subagent...

[2025-01-09T14:31:02] Turn 2/10
  Tools: Read, Write
  Creating API routes based on schema...

[2025-01-09T14:31:15] Completed
  Reason: completed
  Cost: $1.2345
```

## Technical Details

### ConversationLogger Class

Located in `vendor/cc-agent/cc_agent/conversation_logger.py`.

**Key methods:**

- `log_user_prompt(prompt, metadata)` - Log user input
- `log_assistant_message(message, turn, max_turns)` - Log full assistant response with all blocks
- `log_result(result, success, termination_reason)` - Log final outcome
- `log_error(error, turn, partial_content)` - Log exceptions
- `finalize()` - Close conversation log

### Integration Points

The logger is integrated into `cc_agent.Agent.run()` at:

1. **Line 230-232**: Log user prompt before execution
2. **Line 247-251**: Log each assistant message (full content)
3. **Line 309-312**: Log final result
4. **Line 329-332**: Log errors with context
5. **Line 338-340**: Finalize in finally block

### JSONL Format

Each line is a JSON object with:

```json
{
  "timestamp": "2025-01-09T14:30:45.123456",
  "type": "user_prompt|assistant_message|result|error|system",
  "agent": "Agent Name",
  ...type-specific fields...
}
```

**Message types:**

- `user_prompt`: User input with full content
- `assistant_message`: Response with text_blocks, thinking_blocks, tool_uses
- `result`: Final outcome with cost, tokens, success
- `error`: Exception details with partial output
- `system`: Metadata and informational messages

## Debugging Workflow

### 1. Run with Logging Enabled

```bash
# Logging is already enabled by default in run-app-generator.py
uv run python run-app-generator.py "Create a todo app"
```

### 2. Monitor in Another Terminal

```bash
# In a separate terminal
./monitor-conversations.sh
```

### 3. Review After Execution

```bash
# List all conversations
ls -lh logs/conversations/

# Read specific conversation
less logs/conversations/conversation_App_Generator_Agent_20250109_143022.txt

# Analyze JSONL for insights
python analyze-conversation.py logs/conversations/conversation_App_Generator_Agent_20250109_143022.jsonl
```

### 4. Search Across Conversations

```bash
# Find all errors
grep -r "ERROR" logs/conversations/*.txt

# Find specific tool usage
grep -r "🔧 Task" logs/conversations/*.txt

# Find high-cost conversations
grep -r "Cost:" logs/conversations/*.txt | sort -t'$' -k2 -n
```

## Benefits

### Complete Visibility

- **See everything**: Every subagent conversation is logged
- **No more blind spots**: Task tool delegations are fully visible
- **Debugging clarity**: Understand exactly what each agent did

### Forensic Analysis

- **JSONL format**: Parse and analyze programmatically
- **Timeline reconstruction**: See exact sequence of events
- **Cost tracking**: Understand token usage and costs
- **Error diagnosis**: Full context for failures

### Cross-Process Logging

- **Works everywhere**: Main agents, subagents, nested delegations
- **Shared directory**: All logs in one place
- **Process-independent**: Each agent writes its own log
- **No IPC required**: Uses filesystem, not inter-process communication

## Buffer Overflow Protection

**Problem:** Binary data (screenshots, images) can overflow JSON buffers and crash the logger.

**Solution:** Automatic payload sanitization with three layers of protection:

### 1. **Tool Input Sanitization** (1MB limit per tool)
```python
# Before logging, check tool input size
if size > 1MB:
    # Replace with metadata
    {
        "_truncated": True,
        "_original_size_bytes": 2_500_000,
        "_reason": "Exceeded maximum log size (likely binary/image data)",
        "_tool": "mcp__chrome_devtools__take_screenshot"
    }
```

**Example:**
```json
{
  "name": "mcp__chrome_devtools__take_screenshot",
  "id": "toolu_abc123",
  "input": {
    "_truncated": true,
    "_original_size_bytes": 2500000,
    "_reason": "Exceeded maximum log size (likely binary/image data)",
    "_tool": "mcp__chrome_devtools__take_screenshot"
  }
}
```

### 2. **Entry Size Limit** (2MB per JSONL entry)
If an entire log entry exceeds 2MB, it's replaced with essential metadata:
```json
{
  "timestamp": "2025-11-09T20:32:15.458829",
  "type": "assistant_message",
  "agent": "AppGeneratorAgent",
  "turn": "161/1000",
  "tool_count": 1,
  "_truncated": true,
  "_original_size_bytes": 3000000,
  "_reason": "Entry exceeded 2MB limit"
}
```

### 3. **Text Log Truncation** (5KB per tool input)
Human-readable logs truncate large inputs for readability:
```
--- Tool Uses ---
🔧 mcp__chrome_devtools__take_screenshot (id: toolu_abc123)
   Input: [Truncated - 2,500,000 chars]
   {
     "_truncated": true,
     "_original_size_bytes": 2500000,
     ...
   }
```

**Pipeline Resilience:**
- ✅ **Logging never crashes** the agent
- ✅ **Metadata always captured** even when payload is truncated
- ✅ **Execution continues** regardless of log failures
- ✅ **Fallback entries** logged on serialization errors

## Performance Impact

**Minimal overhead:**

- Async file I/O (non-blocking)
- Write-only operations (no reads during execution)
- Small payload per message (~1-5KB typical, capped at 2MB)
- Automatic truncation prevents memory issues
- Optional (disable with `ENABLE_CONVERSATION_LOGGING=false`)

**Disk usage:**

- ~50KB per agent conversation (text + JSONL) for normal conversations
- Up to 2MB for conversations with many screenshot/binary operations
- Typical full pipeline: ~20 agents × 50KB = ~1MB per app generation

## Troubleshooting

### Logs Not Appearing

**Check environment variables:**

```bash
echo $ENABLE_CONVERSATION_LOGGING  # Should be "true"
echo $AGENT_LOG_DIR                # Should be absolute path to logs/
```

**Check directory exists:**

```bash
ls -la logs/conversations/
```

### Incomplete Logs

**Check for errors:**

```bash
grep "Failed to write" logs/cc_agent*.log
```

**Ensure finalize() is called:**
- The `finally` block ensures logs are closed even on errors

### JSONL Parse Errors

**Validate JSONL:**

```bash
# Each line should be valid JSON
while read line; do echo "$line" | jq . > /dev/null || echo "Invalid: $line"; done < conversation.jsonl
```

## Advanced Usage

### Custom Log Processing

```python
import json

# Load JSONL conversation
with open("conversation.jsonl") as f:
    messages = [json.loads(line) for line in f]

# Extract all tool uses
tools = []
for msg in messages:
    if msg["type"] == "assistant_message":
        tools.extend(msg.get("tool_uses", []))

print(f"Total tool uses: {len(tools)}")
```

### Integration with Monitoring Tools

```bash
# Stream to logging service
tail -f logs/conversations/*.jsonl | your-log-aggregator

# Alert on errors
tail -f logs/conversations/*.txt | grep "ERROR" | notify-send
```

## Future Enhancements

Potential improvements:

- [ ] Structured log querying (SQLite database)
- [ ] Web UI for log viewing
- [ ] Real-time streaming to dashboard
- [ ] Conversation replay/debugging
- [ ] Diff tool for comparing conversations
- [ ] Export to other formats (CSV, Markdown)

## Summary

**Full conversation logging solves the subagent visibility problem:**

✅ **All agents** log to shared directory
✅ **Dual format** (human + machine readable)
✅ **Complete capture** (prompts, responses, tools, results, errors)
✅ **Easy monitoring** (`monitor-conversations.sh`)
✅ **Analysis tools** (`analyze-conversation.py`)
✅ **Forensic debugging** (JSONL parsing)

**You can now troubleshoot effectively** - no more running blind! 🎉
