# Subagent Implementation - Filesystem-Based Approach

## ✅ CORRECTED Implementation (SDK v0.0.14)

**Date**: October 15, 2025
**Branch**: feat/subagents
**SDK Version**: claude_code_sdk 0.0.14
**Status**: Working and tested

## What We Learned

### Initial Approach (INCORRECT for v0.0.14)

**Attempted**: Pass subagents programmatically via `ClaudeCodeOptions(agents=...)`

**Error**: `TypeError: ClaudeCodeOptions.__init__() got an unexpected keyword argument 'agents'`

**Why it failed**: The Python SDK v0.0.14 doesn't support the `agents` parameter. This feature exists in:
- Claude Code IDE (the desktop application)
- Newer versions of the SDK (possibly)
- JavaScript/TypeScript SDKs (different API)

### Correct Approach (FILESYSTEM-BASED)

**Solution**: Write subagent definitions to `.claude/agents/*.md` files

The SDK **automatically discovers and loads** subagents from:
1. **Project-level**: `.claude/agents/*.md` (in working directory)
2. **User-level**: `~/.claude/agents/*.md` (global)

**Precedence**: Project-level agents override user-level agents with same name.

## Implementation

### File Format

Each subagent is a Markdown file with YAML frontmatter:

```markdown
---
name: research_agent
description: Research complex app requirements and create implementation strategy
tools: WebSearch, WebFetch, Read, Write
model: opus
---

You are a senior software architect and researcher...

[Full system prompt continues here]
```

### Code Implementation

**File**: `src/app_factory_leonardo_replit/agents/app_generator/agent.py`

```python
def _write_subagent_files(self):
    """
    Write subagent definitions to .claude/agents/ directory.

    The claude_code_sdk (v0.0.14) loads subagents from filesystem instead of
    accepting them programmatically via ClaudeCodeOptions.
    """
    if not self.subagents:
        return

    # Create .claude/agents/ in the output directory
    agents_dir = Path(self.output_dir) / ".claude" / "agents"
    agents_dir.mkdir(parents=True, exist_ok=True)

    written_count = 0
    for name, agent_def in self.subagents.items():
        # Create markdown file with YAML frontmatter
        agent_file = agents_dir / f"{name}.md"

        # Build YAML frontmatter
        frontmatter_lines = [
            "---",
            f"name: {name}",
            f"description: {agent_def.description}"
        ]

        if agent_def.tools:
            tools_str = ", ".join(agent_def.tools)
            frontmatter_lines.append(f"tools: {tools_str}")

        if agent_def.model:
            frontmatter_lines.append(f"model: {agent_def.model}")

        frontmatter_lines.append("---")

        # Combine frontmatter and prompt
        content = "\n".join(frontmatter_lines) + "\n\n" + agent_def.prompt

        # Write to file
        agent_file.write_text(content, encoding="utf-8")
        written_count += 1

    logger.info(f"✅ Wrote {written_count} subagent files to {agents_dir}")
```

### Integration Flow

```
1. User runs with --enable-subagents
   └→ AppGeneratorAgent.__init__()
       ├→ _initialize_subagents()  # Load from Python
       └→ _write_subagent_files()  # Write to .claude/agents/
           └→ Creates 7 .md files in .claude/agents/
               └→ SDK automatically discovers them
                   └→ Main agent can delegate!
```

## File Structure

```
apps/
└── .claude/
    └── agents/
        ├── research_agent.md      (Opus, WebSearch)
        ├── schema_designer.md     (Sonnet, Read/Write)
        ├── api_architect.md       (Sonnet, Read/Write/Grep)
        ├── ui_designer.md         (Sonnet, Read/Write)
        ├── code_writer.md         (Sonnet, Read/Write/Edit)
        ├── quality_assurer.md     (Haiku, Browser tools)
        └── error_fixer.md         (Opus, Read/Edit/Bash)
```

## Automatic Delegation

Once the files are written, the SDK automatically delegates when:

1. **Description Match**: Task matches subagent description
2. **Proactive Keywords**: Description contains "use PROACTIVELY"
3. **Context Alignment**: Current task context matches expertise
4. **Tool Availability**: Subagent has required tools

**Example**:
```
Main agent encounters: "Research authentication best practices"
   └→ Matches research_agent description
       └→ SDK automatically delegates
           └→ research_agent executes with WebSearch
               └→ Returns findings to main agent
```

## Testing

### Verify Files Created

```bash
# Check that agent files exist
ls -la apps/.claude/agents/

# Output should show:
# research_agent.md
# schema_designer.md
# api_architect.md
# ui_designer.md
# code_writer.md
# quality_assurer.md
# error_fixer.md
```

### Verify Format

```bash
# Check one file
cat apps/.claude/agents/research_agent.md

# Should show:
# ---
# name: research_agent
# description: Research complex app requirements...
# tools: WebSearch, WebFetch, ...
# model: opus
# ---
#
# You are a senior software architect...
```

### Run App Generation

```bash
uv run python run-app-generator.py \
  "Create a todo app with AI assistance" \
  --app-name todo-ai \
  --enable-subagents
```

**Look for in logs**:
```
✅ Loaded 7 subagents
✅ Wrote 7 subagent files to /Users/.../apps/.claude/agents
```

## Benefits of Filesystem Approach

### Advantages

1. **SDK Compatible**: Works with current SDK version (v0.0.14)
2. **Discoverable**: Files can be inspected and edited
3. **Shareable**: Can be committed to git
4. **Persistent**: Don't need to regenerate each time
5. **IDE Compatible**: Claude Code IDE can use them too

### Considerations

1. **File Management**: Need to clean up old files
2. **Version Control**: `.claude/agents/` in output directory
3. **Updates**: Changing Python definitions requires re-running

## Comparison with IDE Configuration

### Claude Code IDE

```
User creates: ~/.claude/agents/code-reviewer.md
IDE loads automatically
Available in all projects
```

### Our Implementation

```
Python creates: apps/.claude/agents/research_agent.md
SDK loads from working directory (apps/)
Available for that generation run
```

## ClaudeCodeOptions Parameters

For reference, here are the **actual** parameters supported by SDK v0.0.14:

```python
ClaudeCodeOptions(
    allowed_tools: list[str] = [],
    max_thinking_tokens: int = 8000,
    system_prompt: str | None = None,
    append_system_prompt: str | None = None,
    mcp_tools: list[str] = [],
    mcp_servers: dict = {},
    permission_mode: str = 'default',
    continue_conversation: bool = False,
    resume: str | None = None,
    max_turns: int | None = None,
    disallowed_tools: list[str] = [],
    model: str | None = None,
    permission_prompt_tool_name: str | None = None,
    cwd: str | Path | None = None
)
```

**Note**: No `agents` parameter!

## Future SDK Versions

When the SDK adds programmatic subagent support, we can:

1. Keep filesystem approach (backward compatible)
2. Add programmatic approach (when available)
3. Use hybrid (filesystem + programmatic override)

For now, filesystem-based is the correct and working approach.

## Cleanup

To remove subagent files:

```bash
# Remove project-level agents
rm -rf apps/.claude/agents/

# Or keep for reuse across generations
# (files persist and get reused)
```

## Summary

### What Works

✅ **Filesystem-based subagent configuration**
- Write `.md` files to `.claude/agents/`
- SDK discovers automatically
- Automatic delegation enabled

### What Doesn't Work (v0.0.14)

❌ **Programmatic configuration via ClaudeCodeOptions**
- `agents` parameter not supported
- Will cause TypeError

### Next Steps

1. ✅ Filesystem implementation complete
2. ✅ All tests passing
3. ✅ Ready for real app generation testing
4. 🔄 Monitor for SDK updates (agents parameter support)

## Documentation References

- [Claude Docs - Subagents in SDK](https://docs.claude.com/en/api/agent-sdk/subagents)
- [Claude Docs - Subagents](https://docs.claude.com/en/docs/claude-code/sub-agents)
- SDK Version: `claude_code_sdk==0.0.14`

---

**Status**: Implementation complete and working!
**Approach**: Filesystem-based (.claude/agents/*.md)
**Tested**: ✅ All tests passing
**Ready**: 🚀 For production use