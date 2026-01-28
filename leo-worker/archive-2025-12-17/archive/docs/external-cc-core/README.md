# External CC-Core Setup

This directory contains the configuration and documentation for reverting app-factory to use cc-core as an external
dependency.

## Overview

When using external cc-core, the app-factory project imports `cc_agent` from the separate cc-core repository located at
`../cc-core/`. This setup allows cc-core to be developed and maintained separately.

## Files in This Directory

### mcp.json

A complex MCP configuration with explicit paths and arguments. This version contains hardcoded paths from SPRINT6 that
would need updating for your environment. This file shows how MCP servers can be configured with explicit arguments and
environment variables.

## MCP Configuration

**Important**: The `.mcp.json` file should be placed at the project root (not in this docs directory) for MCP tools to
be available to agents. The project already has `.mcp.json` configured with all cc_tools MCP servers.

### How MCP Tools Work

1. **MCP Servers**: The cc_tools package provides various MCP servers (browser, shadcn, package-manager, etc.) that are
   installed as Python scripts via pyproject.toml
2. **Configuration**: These servers must be configured in `.mcp.json` at the project root to be available to Claude Code
   agents
3. **Agent Usage**: Agents specify which tools they need in their `allowed_tools` list (e.g., `["browser"]`)
4. **Tool Naming**: MCP tools appear to agents with the prefix `mcp__<server>__<action>` (e.g.,
   `mcp__browser__open_browser`)

## Reverting to External CC-Core

### Prerequisites

- cc-core repository must exist at `../cc-core/` (relative to app-factory)
- cc-core must have the `cc-agent` subdirectory
- cc-tools must be available in cc-core

### Steps

1. **Remove local cc_agent and cc_tools directories**:
   ```bash
   rm -rf src/cc_agent/ src/cc_tools/
   ```

2. **Uncomment cc-agent dependency in pyproject.toml**:
   ```toml
   [tool.uv]
   dev-dependencies = [
       "cc-agent"
   ]
   
   [tool.uv.sources]
   cc-agent = { path = "../cc-core/cc-agent" }
   ```

3. **Update pyproject.toml dependencies**:
    - Remove the cc_tools dependencies that were added (fastmcp, psutil, playwright)
    - Remove the MCP tool scripts from `[project.scripts]`
    - Update packages list to only include `src/app_factory`

4. **Update mcp.json paths** (if using the explicit version):
    - Replace `/home/jake/SPRINT6/` paths with your actual paths
    - Update workspace paths as needed

5. **Sync dependencies**:
   ```bash
   uv sync
   ```

## How It Works

- **Imports remain unchanged**: Code still uses `from cc_agent import Agent`
- **Python finds cc_agent** from the external path specified in pyproject.toml
- **MCP tools** are configured via `.mcp.json` to make them available to agents
- **Tool scripts** are provided by the external cc-tools package

## Current Setup (Local CC-Core)

Currently, cc-core is integrated locally within app-factory for easier development:

- `src/cc_agent/` contains the agent framework
- `src/cc_tools/` contains the MCP server implementations
- Dependencies and scripts are defined directly in app-factory's pyproject.toml
- The external dependency configuration in pyproject.toml is commented out