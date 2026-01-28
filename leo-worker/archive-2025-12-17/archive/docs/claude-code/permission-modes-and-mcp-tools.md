# Permission Modes and MCP Tools

## Permission Modes

There are 4 valid values for `permission_mode` when configuring agents:

| Mode                | Description                                      | Use Case                 |
|---------------------|--------------------------------------------------|--------------------------|
| `default`           | Prompts for permission on first use of each tool | Interactive development  |
| `acceptEdits`       | Auto-accepts file edits, prompts for other tools | Agents that modify code  |
| `plan`              | Analyze only - no modifications or executions    | Planning/analysis agents |
| `bypassPermissions` | Skips ALL permission prompts                     | Automated testing/CI     |

Source: `anthropic-docs/docs/claude-code/iam.md` (lines 68-78)

## MCP Tool Permissions

### In Agent Config

Agents specify MCP tools using server names only:

```python
"allowed_tools": ["browser", "shadcn", "build_test"]  # ✅ Correct
"allowed_tools": ["mcp__browser__open_browser"]  # ❌ Wrong
```

### Per-Tool Permission Rules

Configure in `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "browser",
      // Allow all browser tools
      "mcp__browser",
      // Same as above
      "mcp__browser__navigate",
      // Specific tool only
      "Bash(npm test:*)"
      // Pattern matching
    ]
  }
}
```

Source: `anthropic-docs/docs/claude-code/iam.md` (lines 114-118)

## Best Practices

1. **Production Agents**: Use `acceptEdits` + settings.json allow rules
    - More secure, explicit permissions
    - Example: Wireframe agent creating UI components

2. **Testing/Development**: Use `bypassPermissions`
    - Faster iteration, no prompts
    - Example: Simple browser test script

3. **Analysis Agents**: Use `plan` or `default`
    - Read-only operations
    - Example: Retrospective analysis

## Current App Factory Usage

- **Wireframe/QC/Critic agents**: Use `acceptEdits` (may need settings.json for MCP tools)
- **Simple browser test**: Uses `bypassPermissions` (fully automated)
- **Retrospective agent**: Uses `auto` (should be `default`?)

## References

- Settings documentation: `anthropic-docs/docs/claude-code/settings.md`
- IAM documentation: `anthropic-docs/docs/claude-code/iam.md`
- Claude Code Docs: https://docs.anthropic.com/en/docs/claude-code/