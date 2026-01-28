# MCP (Model Context Protocol) Configuration Guide

## Overview

The AI App Factory uses MCP servers to provide specialized tools to agents. This document explains how MCP configuration works in the project and how to manage it effectively.

## Two Separate MCP Configurations

### 1. Project-Level Configuration (`.mcp.json`)
This is the configuration used by the app-factory agents when they run:

```json
{
  "mcpServers": {
    "integration_analyzer": {
      "command": "mcp-integration-analyzer"
    }
  }
}
```

- Located at: `/home/jake/SPRINT8/app-factory/.mcp.json`
- Used by: AI agents via the cc_agent framework
- Purpose: Defines MCP tools available to agents during pipeline execution

### 2. Claude Code Terminal Configuration
This is your local Claude Code environment configuration:

- Managed via: `claude mcp` CLI commands
- Scope levels: local (project-specific), user (global), project (shared)
- Purpose: Provides tools to you while developing in Claude Code

## How Agents Use MCP Tools

1. **Agent Configuration**: Each agent specifies allowed tools in their config file:
   ```python
   AGENT_CONFIG = {
       "allowed_tools": [
           "Read", "Write", "MultiEdit",  # Built-in tools
           "integration_analyzer"          # MCP server tool
       ]
   }
   ```

2. **Tool Discovery**: The cc_agent framework:
   - Reads `.mcp.json` from the project root
   - Initializes specified MCP servers
   - Makes them available to agents based on `allowed_tools`

3. **Runtime Execution**: When agents run:
   - They operate in their designated working directory
   - MCP servers are launched as needed
   - Tools are invoked through the cc_agent interface

## Common Issues and Solutions

### Issue: "MCP server not found" in Claude Code terminal
**Symptom**: Error messages about broken MCP servers in your development environment

**Solution**: Remove the server from Claude Code configuration:
```bash
claude mcp remove <server-name>
```

### Issue: MCP_TOOLS environment variable warnings
**Symptom**: Warnings about MCP_TOOLS not being set

**Solution**: This is legacy configuration. The app-factory now uses `.mcp.json` instead of environment variables. These warnings can be ignored or the code can be updated to remove the dependency.

### Issue: Agent can't access MCP tool
**Symptom**: Agent fails when trying to use an MCP tool

**Solutions**:
1. Verify the tool is listed in the agent's `allowed_tools` config
2. Check that the MCP server is defined in `.mcp.json`
3. Ensure the MCP server command is installed and accessible

## Best Practices

1. **Keep Configurations Separate**: Don't mix Claude Code terminal MCP config with project `.mcp.json`

2. **Agent Tool Access**: Only add tools to an agent's `allowed_tools` that it actually needs

3. **Testing MCP Servers**: Test MCP servers independently before adding them to agent configurations

4. **Documentation**: Document any custom MCP servers in the project README

## Architecture Notes

- The cc_agent package (external dependency) handles all MCP server management
- Agents extend `cc_agent.Agent` base class which provides MCP integration
- MCP servers communicate via stdio protocol with JSON-RPC
- Each agent run creates isolated MCP server instances

## Future Improvements

- Remove legacy MCP_TOOLS environment variable dependency
- Add MCP server health checks before agent runs
- Implement MCP server configuration validation