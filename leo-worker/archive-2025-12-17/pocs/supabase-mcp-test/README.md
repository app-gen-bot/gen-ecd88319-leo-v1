# Supabase MCP Server POC

**Status**: ✅ **COMPLETED - CUSTOM MCP SERVER RECOMMENDED**

Tested both the official Supabase MCP server and created a custom MCP server wrapping the skill's recipe.

## TL;DR - Final Recommendation

**✅ IMPLEMENT Custom MCP Server**

**Why**:
1. Solves "agent refusal" problem - agent can't refuse a single tool call
2. Reduces cognitive load from 10 steps to 1 tool call
3. Proven working in POC
4. Preserves all features (pooler detection, auth config, etc.)
5. No authentication issues (uses existing CLI auth)

**Two POCs Conducted**:
1. ❌ Official Supabase MCP Server - NOT VIABLE (requires OAuth/PAT)
2. ✅ Custom Supabase Setup MCP Server - WORKING PERFECTLY

**See [CUSTOM-MCP-ANALYSIS.md](./CUSTOM-MCP-ANALYSIS.md) for implementation plan.**
**See [ANALYSIS.md](./ANALYSIS.md) for official MCP findings.**

## POC Results

### Test Execution
- ✅ Test script created and ran successfully
- ✅ Agent initialized with MCP server configuration
- ❌ **MCP tools were NOT available to the agent**
- 💰 Cost: $0.1338

### Root Cause
The official Supabase MCP server uses **OAuth 2.1 Dynamic Client Registration**, which requires:
1. Interactive browser-based OAuth flow (not viable for autonomous agents)
2. **OR** Personal Access Token (PAT) with custom Authorization headers

Our test agent could not access Supabase MCP tools because:
- No OAuth flow completed (agent can't interact with browser)
- No PAT configured (unclear if cc-agent supports custom headers)

### Key Finding
**Authentication is a critical blocker** for using the MCP server in autonomous agent workflows.

## Goal

Prove that we can use the official Supabase MCP server (https://mcp.supabase.com/mcp) to:

1. List organizations
2. Create projects
3. Apply migrations
4. Get API keys
5. Configure database settings

## Official MCP Server Capabilities

Based on [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp):

### Account Management
- `list_organizations` - Lists all Supabase organizations
- `get_organization` - Get organization details
- `list_projects` - Lists all projects
- `create_project` - Creates a new Supabase project ✅
- `pause_project` - Pause a project
- `restore_project` - Restore a paused project
- `get_cost` - Get cost estimate for new project

### Database Operations
- `list_tables` - Lists all tables
- `apply_migration` - Applies SQL migration (DDL tracked) ✅
- `execute_sql` - Execute regular SQL queries
- `list_migrations` - List all migrations
- `list_extensions` - List database extensions

### API & Configuration
- `get_api_url` - Get project API URL ✅
- `get_publishable_keys` - Get anon/service keys ✅
- `generate_typescript_types` - Generate types from schema

### Debugging
- `get_logs` - Retrieve logs by service
- `get_advisory_notices` - Check for notices

## Comparison with supabase-project-setup Skill

| Task | Skill (Bash CLI) | MCP Server | Winner |
|------|------------------|------------|---------|
| List orgs | `supabase orgs list` | `list_organizations` | ✅ MCP (programmatic) |
| Create project | `supabase projects create` | `create_project` | ✅ MCP (integrated) |
| Wait for startup | `sleep 30` | Not needed? | 🤔 Need to test |
| Init local dir | `supabase init` | Not needed | ✅ MCP (no local setup) |
| Link project | `supabase link` | Not needed | ✅ MCP (direct access) |
| Push config | `supabase config push` | `execute_sql`? | 🤔 Need to test |
| Apply migrations | `supabase db push` | `apply_migration` | ✅ MCP (cleaner) |
| Get API keys | `supabase projects api-keys` | `get_publishable_keys` | ✅ MCP (simpler) |
| Detect pooler | Custom Node script | API query? | 🤔 Need to test |

## Test Plan

1. **Configure MCP server** in Claude Code
2. **Test organization listing** - Verify we can get org slugs
3. **Test project creation** - Create a test project
4. **Test migration** - Apply a simple schema migration
5. **Test API keys** - Retrieve anon and service_role keys
6. **Test pooler detection** - See if we can determine working pooler variant

## Setup

The Supabase MCP server is hosted at `https://mcp.supabase.com/mcp` and uses dynamic OAuth registration (no PAT needed).

### Configuration for Claude Code

Add to `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

Or for project-specific (scoped to a project):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_id=<project-ref>"
    }
  }
}
```

## Expected Benefits of MCP Approach

1. **No local Supabase CLI setup** - Works purely via API
2. **Integrated with AI workflow** - Tools available directly to agents
3. **Programmatic access** - No bash script parsing needed
4. **Error handling** - MCP provides structured errors
5. **State management** - No need to track project refs manually

## Sources

- [Supabase MCP Server Official Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [Supabase MCP Blog Post](https://supabase.com/blog/mcp-server)
- [MCP Features Page](https://supabase.com/features/mcp-server)
