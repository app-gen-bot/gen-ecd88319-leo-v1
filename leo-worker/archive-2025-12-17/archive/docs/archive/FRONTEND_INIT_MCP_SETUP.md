# Frontend Init MCP Tool Setup

This document explains how to set up the frontend_init MCP tool for scaffolding Next.js projects.

## Local Setup Command

For the Slack clone project in this repository:

```bash
claude mcp add frontend_init -e MCP_LOG_LEVEL=INFO -- uv --directory /home/jake/SPRINT8/mcp-tools run mcp-frontend-init --workspace /home/jake/SPRINT8/apps/slack-clone/frontend/output
```

## Generic Command Pattern

```bash
claude mcp add frontend_init -e MCP_LOG_LEVEL=INFO -- uv --directory ${MCP_TOOLS_PATH} run mcp-frontend-init --workspace NEXTJS_PATH
```

Where:
- `${MCP_TOOLS_PATH}` = Path to your mcp-tools directory
- `NEXTJS_PATH` = Path where you want to create/manage your Next.js project

## Testing the Tool Before Adding

You can verify the tool works correctly before adding it to Claude Code:

```bash
uv --directory /home/jake/SPRINT8/mcp-tools run mcp-frontend-init --help
```

This should display the help message without errors.

## Verification

After adding the server, verify it's properly connected:

```bash
claude mcp list
```

The frontend_init server should show as connected. You can also check in the Claude Code MCP management interface.

## Usage

After running the setup command and restarting Claude Code, you'll be able to use the frontend_init tool to:
- Create a new Next.js project with Tailwind CSS and shadcn/ui
- Initialize the project structure with best practices
- Set up the necessary configuration files

## Troubleshooting

### Server Connection Failed

If you see "Connection closed" errors:

1. Check the logs:
   ```bash
   ls -lt ~/.cache/claude-cli-nodejs/-home-jake-SPRINT8-apps/mcp-logs-frontend_init/
   cat ~/.cache/claude-cli-nodejs/-home-jake-SPRINT8-apps/mcp-logs-frontend_init/[latest-file].txt
   ```

2. Remove and re-add the server:
   ```bash
   claude mcp remove frontend_init
   claude mcp add frontend_init -e MCP_LOG_LEVEL=INFO -- uv --directory /home/jake/SPRINT8/mcp-tools run mcp-frontend-init --workspace /home/jake/SPRINT8/apps/slack-clone/frontend/output
   ```

3. Restart Claude Code to ensure the new configuration takes effect

### Debugging Tips

- Always test the command manually first using the verification steps above
- Check that the workspace directory exists and is writable
- Ensure you're using the correct path to the mcp-tools directory

## Additional MCP Tools for Frontend Development

### Shadcn Tool

The shadcn tool allows you to add shadcn/ui components to your Next.js project:

```bash
claude mcp add shadcn -e MCP_LOG_LEVEL=INFO -- uv --directory /home/jake/SPRINT8/mcp-tools run mcp-shadcn --workspace /home/jake/SPRINT8/apps/slack-clone/frontend/output
```

This tool enables adding UI components like:
- scroll-area
- tooltip
- And other shadcn/ui components

### Browser Tool

The browser tool provides browser automation capabilities for testing and screenshots:

```bash
claude mcp add browser -e MCP_LOG_LEVEL=INFO -- uv --directory /home/jake/SPRINT8/mcp-tools run mcp-browser --workspace /home/jake/SPRINT8/apps/slack-clone/frontend/output
```

This tool is useful for:
- Taking screenshots of the running application
- Testing interactive features
- Verifying visual appearance

### Build Test Tool

The build_test tool provides comprehensive build verification for your Next.js project:

```bash
claude mcp add build_test -e MCP_LOG_LEVEL=INFO -- uv --directory /home/jake/SPRINT8/mcp-tools run mcp-build-test --workspace /home/jake/SPRINT8/apps/slack-clone/frontend/output
```

This tool provides the following commands:
- `verify`: Runs all checks (lint, type-check, test, build) in sequence
- `build`: Runs the production build
- `dev`: Starts the development server
- `lint`: Runs ESLint
- `type-check`: Runs TypeScript type checking
- `test`: Runs tests

The `verify` command is particularly useful as it:
1. Installs dependencies if needed
2. Runs linting checks
3. Performs TypeScript type checking
4. Runs tests (if configured)
5. Checks for Next.js specific issues
6. Runs a production build

Example usage after adding the tool:
- Use the `verify` command to run all checks at once
- This ensures your code is properly formatted, typed, and builds successfully