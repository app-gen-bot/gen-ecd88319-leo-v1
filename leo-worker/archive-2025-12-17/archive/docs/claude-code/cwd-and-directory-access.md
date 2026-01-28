# CWD and Directory Access in Claude Code

## Directory Access Restrictions

Claude Code has a **fundamental security boundary**: it can only access the folder where it was started and its subfolders—it cannot go upstream to parent directories.

> "**Folder access restriction**: Claude Code can only access the folder where it was started and its subfolders—it cannot go upstream to parent directories. This creates a clear security boundary, ensuring Claude Code only operates within the intended project scope"

Source: `anthropic-docs/docs/claude-code/security.md` (line 26)

## Key Points

### 1. CWD Creates a Security Sandbox
- When you set `cwd` for an agent, it restricts ALL file operations to that directory and below
- Even with `bypassPermissions`, the agent CANNOT access parent directories
- This is enforced at the Claude Code level, not just by permissions

### 2. Default Working Directory
> "By default, Claude has access to files in the directory where it was launched."

Source: `anthropic-docs/docs/claude-code/iam.md` (line 81)

### 3. Extending Access (When Needed)
You can explicitly add additional directories:
- **CLI**: `--add-dir <path>`
- **During session**: `/add-dir` command
- **Config**: `additionalDirectories` in settings.json

Source: `anthropic-docs/docs/claude-code/iam.md` (lines 83-85)

## Settings Precedence

When using cloud CLI, settings are applied in this order:
1. Enterprise policies
2. Command line arguments
3. Local project settings (`.claude/settings.local.json`)
4. Shared project settings (`.claude/settings.json`)
5. User settings (`~/.claude/settings.json`)

Source: `anthropic-docs/docs/claude-code/settings.md` (lines 68-74)

## Implications for Automated Agents

### Safe to Use `bypassPermissions`
When agents have a specific `cwd` set:
- They're sandboxed to that directory tree
- Cannot access sensitive files outside the project
- Cannot modify system files or other projects

### Per-Agent Configuration Strategy
Instead of global settings that affect cloud CLI:
1. Each agent sets its own `cwd` (sandbox)
2. Use `bypassPermissions` for fully automated operation
3. No need for complex permission rules in settings.json

### Example Agent Config
```python
class WireframeAgent(Agent):
    def __init__(self, output_dir: Path):
        super().__init__(
            cwd=str(output_dir),  # Sandbox to this directory
            permission_mode="bypassPermissions",  # Fully automated
            # Agent can now only access output_dir and subdirs
        )
```

## Configuration Files

Claude Code uses a hierarchical settings system with specific file locations:

### Settings File Locations
- **User settings**: `~/.claude/settings.json` (applies to all projects)
- **Project settings**: `.claude/settings.json` (checked into source control)
- **Local project settings**: `.claude/settings.local.json` (not checked in, git-ignored)
- **Enterprise policies**: `/etc/claude-code/managed-settings.json` (Linux/WSL) or `/Library/Application Support/ClaudeCode/managed-settings.json` (macOS)

Source: `anthropic-docs/docs/claude-code/settings.md` (lines 15-22)

### Configuration Scope
- Claude Code looks for settings files in these specific locations only
- Project settings are relative to where Claude Code was launched
- Settings files must be named exactly as specified above
- Custom configuration files in other locations are not automatically loaded by Claude Code

### Implications for Custom Configurations
- If you need agent-specific configurations, you must implement your own loading mechanism
- Claude Code SDK doesn't provide a way to specify alternate settings file paths
- Per-directory settings follow the same CWD restrictions as file access

## Security Summary

The combination of:
- CWD-based sandboxing (enforced by Claude Code)
- `bypassPermissions` for automation
- Agent-specific directories

Provides both security and automation without affecting your cloud CLI usage or requiring complex permission configurations.