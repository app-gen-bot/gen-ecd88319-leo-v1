# Claude Code settings

**Source:** https://docs.anthropic.com/en/docs/claude-code/settings
**Retrieved:** 2025-07-04

---

Claude Code offers a variety of settings to configure its behavior to meet your needs. You can configure Claude Code by running the`/config`command when using the interactive REPL.

## ​Settings files

The`settings.json`file is our official mechanism for configuring Claude
Code through hierarchical settings:

- **User settings**are defined in`~/.claude/settings.json`and apply to all
projects.
- **Project settings**are saved in your project directory:
- `.claude/settings.json`for settings that are checked into source control and shared with your team
- `.claude/settings.local.json`for settings that are not checked in, useful for personal preferences and experimentation. Claude Code will configure git to ignore`.claude/settings.local.json`when it is created.
- For enterprise deployments of Claude Code, we also support**enterprise
managed policy settings**. These take precedence over user and project
settings. System administrators can deploy policies to`/Library/Application Support/ClaudeCode/managed-settings.json`on macOS and`/etc/claude-code/managed-settings.json`on Linux and Windows via WSL.
Example settings.json
```JSON
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)"
    ]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  }
}

```

### ​Available settings

`settings.json`supports a number of options:

| Key | Description | Example |
| --- | --- | --- |
| apiKeyHelper | Custom script, to be executed in/bin/sh, to generate an auth value. This value will generally be sent asX-Api-Key,Authorization: Bearer, andProxy-Authorization: Bearerheaders for model requests | /bin/generate_temp_api_key.sh |
| cleanupPeriodDays | How long to locally retain chat transcripts (default: 30 days) | 20 |
| env | Environment variables that will be applied to every session | {"FOO": "bar"} |
| includeCoAuthoredBy | Whether to include theco-authored-by Claudebyline in git commits and pull requests (default:true) | false |
| permissions | See table below for structure of permissions. |  |

### ​Permission settings

| Keys | Description | Example |
| --- | --- | --- |
| allow | Array ofpermission rulesto allow tool use | [ "Bash(git diff:*)" ] |
| deny | Array ofpermission rulesto deny tool use | [ "WebFetch", "Bash(curl:*)" ] |
| additionalDirectories | Additionalworking directoriesthat Claude has access to | [ "../docs/" ] |
| defaultMode | Defaultpermission modewhen opening Claude Code | "allowEdits" |
| disableBypassPermissionsMode | Set to"disable"to preventbypassPermissionsmode from being activated. Seemanaged policy settings | "disable" |

### ​Settings precedence

Settings are applied in order of precedence:

1. Enterprise policies (see[IAM documentation](https://docs.anthropic.com/en/docs/claude-code/iam#enterprise-managed-policy-settings))
2. Command line arguments
3. Local project settings
4. Shared project settings
5. User settings

## ​Environment variables

Claude Code supports the following environment variables to control its behavior:

All environment variables can also be configured in[settings.json](https://docs.anthropic.com/_sites/docs.anthropic.com/en/docs/claude-code/settings#available-settings). This is useful as a way to automatically set environment variables for each session, or to roll out a set of environment variables for your whole team or organization.

| Variable | Purpose |
| --- | --- |
| ANTHROPIC_API_KEY | API key sent asX-Api-Keyheader, typically for the Claude SDK (for interactive usage, run/login) |
| ANTHROPIC_AUTH_TOKEN | Custom value for theAuthorizationandProxy-Authorizationheaders (the value you set here will be prefixed withBearer) |
| ANTHROPIC_CUSTOM_HEADERS | Custom headers you want to add to the request (inName: Valueformat) |
| ANTHROPIC_MODEL | Name of custom model to use (seeModel Configuration) |
| ANTHROPIC_SMALL_FAST_MODEL | Name ofHaiku-class model for background tasks |
| BASH_DEFAULT_TIMEOUT_MS | Default timeout for long-running bash commands |
| BASH_MAX_TIMEOUT_MS | Maximum timeout the model can set for long-running bash commands |
| BASH_MAX_OUTPUT_LENGTH | Maximum number of characters in bash outputs before they are middle-truncated |
| CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR | Return to the original working directory after each Bash command |
| CLAUDE_CODE_API_KEY_HELPER_TTL_MS | Interval in milliseconds at which credentials should be refreshed (when usingapiKeyHelper) |
| CLAUDE_CODE_MAX_OUTPUT_TOKENS | Set the maximum number of output tokens for most requests |
| CLAUDE_CODE_USE_BEDROCK | Use Bedrock (seeBedrock & Vertex) |
| CLAUDE_CODE_USE_VERTEX | Use Vertex (seeBedrock & Vertex) |
| CLAUDE_CODE_SKIP_BEDROCK_AUTH | Skip AWS authentication for Bedrock (e.g. when using an LLM gateway) |
| CLAUDE_CODE_SKIP_VERTEX_AUTH | Skip Google authentication for Vertex (e.g. when using an LLM gateway) |
| CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC | Equivalent of settingDISABLE_AUTOUPDATER,DISABLE_BUG_COMMAND,DISABLE_ERROR_REPORTING, andDISABLE_TELEMETRY |
| DISABLE_AUTOUPDATER | Set to1to disable the automatic updater |
| DISABLE_BUG_COMMAND | Set to1to disable the/bugcommand |
| DISABLE_COST_WARNINGS | Set to1to disable cost warning messages |
| DISABLE_ERROR_REPORTING | Set to1to opt out of Sentry error reporting |
| DISABLE_NON_ESSENTIAL_MODEL_CALLS | Set to1to disable model calls for non-critical paths like flavor text |
| DISABLE_TELEMETRY | Set to1to opt out of Statsig telemetry (note that Statsig events do not include user data like code, file paths, or bash commands) |
| HTTP_PROXY | Specify HTTP proxy server for network connections |
| HTTPS_PROXY | Specify HTTPS proxy server for network connections |
| MAX_THINKING_TOKENS | Force a thinking for the model budget |
| MCP_TIMEOUT | Timeout in milliseconds for MCP server startup |
| MCP_TOOL_TIMEOUT | Timeout in milliseconds for MCP tool execution |
| MAX_MCP_OUTPUT_TOKENS | Maximum number of tokens allowed in MCP tool responses (default: 25000) |

## ​Configuration options

We are in the process of migrating global configuration to`settings.json`.

`claude config`will be deprecated in place of[settings.json](https://docs.anthropic.com/_sites/docs.anthropic.com/en/docs/claude-code/settings#settings-files)

To manage your configurations, use the following commands:

- List settings:`claude config list`
- See a setting:`claude config get <key>`
- Change a setting:`claude config set <key> <value>`
- Push to a setting (for lists):`claude config add <key> <value>`
- Remove from a setting (for lists):`claude config remove <key> <value>`

By default`config`changes your project configuration. To manage your global configuration, use the`--global`(or`-g`) flag.

### ​Global configuration

To set a global configuration, use`claude config set -g <key> <value>`:

| Key | Description | Example |
| --- | --- | --- |
| autoUpdates | Whether to enable automatic updates (default:true) | false |
| preferredNotifChannel | Where you want to receive notifications (default:iterm2) | iterm2,iterm2_with_bell,terminal_bell, ornotifications_disabled |
| theme | Color theme | dark,light,light-daltonized, ordark-daltonized |
| verbose | Whether to show full bash and command outputs (default:false) | true |

## ​Tools available to Claude

Claude Code has access to a set of powerful tools that help it understand and modify your codebase:

| Tool | Description | Permission Required |
| --- | --- | --- |
| Agent | Runs a sub-agent to handle complex, multi-step tasks | No |
| Bash | Executes shell commands in your environment | Yes |
| Edit | Makes targeted edits to specific files | Yes |
| Glob | Finds files based on pattern matching | No |
| Grep | Searches for patterns in file contents | No |
| LS | Lists files and directories | No |
| MultiEdit | Performs multiple edits on a single file atomically | Yes |
| NotebookEdit | Modifies Jupyter notebook cells | Yes |
| NotebookRead | Reads and displays Jupyter notebook contents | No |
| Read | Reads the contents of files | No |
| TodoRead | Reads the current session’s task list | No |
| TodoWrite | Creates and manages structured task lists | No |
| WebFetch | Fetches content from a specified URL | Yes |
| WebSearch | Performs web searches with domain filtering | Yes |
| Write | Creates or overwrites files | Yes |

Permission rules can be configured using`/allowed-tools`or in[permission settings](https://docs.anthropic.com/en/docs/claude-code/settings#available-settings).

### ​Extending tools with hooks

You can run custom commands before or after any tool executes using[Claude Code hooks](https://docs.anthropic.com/en/docs/claude-code/hooks).

For example, you could automatically run a Python formatter after Claude
modifies Python files, or prevent modifications to production configuration
files by blocking Write operations to certain paths.

## ​See also

- [Identity and Access Management](https://docs.anthropic.com/en/docs/claude-code/iam#configuring-permissions)- Learn about Claude Code’s permission system
- [IAM and access control](https://docs.anthropic.com/en/docs/claude-code/iam#enterprise-managed-policy-settings)- Enterprise policy management
- [Troubleshooting](https://docs.anthropic.com/en/docs/claude-code/troubleshooting#auto-updater-issues)- Solutions for common configuration issues
[Slash commands](https://docs.anthropic.com/en/docs/claude-code/slash-commands)[Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)On this page
- [Settings files](https://docs.anthropic.com/en/docs/claude-code/settings#settings-files)
- [Available settings](https://docs.anthropic.com/en/docs/claude-code/settings#available-settings)
- [Permission settings](https://docs.anthropic.com/en/docs/claude-code/settings#permission-settings)
- [Settings precedence](https://docs.anthropic.com/en/docs/claude-code/settings#settings-precedence)
- [Environment variables](https://docs.anthropic.com/en/docs/claude-code/settings#environment-variables)
- [Configuration options](https://docs.anthropic.com/en/docs/claude-code/settings#configuration-options)
- [Global configuration](https://docs.anthropic.com/en/docs/claude-code/settings#global-configuration)
- [Tools available to Claude](https://docs.anthropic.com/en/docs/claude-code/settings#tools-available-to-claude)
- [Extending tools with hooks](https://docs.anthropic.com/en/docs/claude-code/settings#extending-tools-with-hooks)
- [See also](https://docs.anthropic.com/en/docs/claude-code/settings#see-also)