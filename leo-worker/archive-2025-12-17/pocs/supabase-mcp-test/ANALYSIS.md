# Supabase MCP Server POC - Analysis and Findings

**Date**: 2025-11-24
**Goal**: Evaluate if the official Supabase MCP server can replace the supabase-project-setup skill

## POC Results

### Test Execution
- **Status**: ✅ POC ran successfully
- **Cost**: $0.1338
- **Finding**: ❌ **MCP tools were NOT available to the agent**

### Root Cause: Authentication Required

The official Supabase MCP server (https://mcp.supabase.com/mcp) uses **OAuth 2.1 Dynamic Client Registration**, which requires:

1. **Interactive OAuth Flow** (default): Browser-based login to grant organization access
2. **Personal Access Token (PAT)** (for CI/automated use): Token passed via Authorization header

Our test agent could NOT access Supabase MCP tools because:
- No OAuth flow was completed (agent can't interact with browser)
- No PAT was configured in the MCP server settings

## Authentication Options for Autonomous Agents

### Option 1: Personal Access Token (PAT)

**Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF}",
      "headers": {
        "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Requirements**:
- Create PAT in Supabase account's access tokens section
- Set SUPABASE_ACCESS_TOKEN environment variable
- Set SUPABASE_PROJECT_REF environment variable (optional, for project-scoped access)

**Limitations**:
- ⚠️ **Not all MCP clients support custom headers** - need to verify cc-agent support
- Requires project_ref to be known in advance (less flexible for creating NEW projects)
- PAT management and rotation required

### Option 2: Interactive OAuth (Not Viable)

**Why Not**: Autonomous agents can't complete browser-based OAuth flows

## Comparison with Skill Approach

### Current Skill Approach (supabase-project-setup)

**Method**: Bash commands using Supabase CLI

| Aspect | Skill (Bash CLI) | MCP Server (with PAT) |
|--------|------------------|------------------------|
| **Authentication** | `supabase login` (cached credentials) | PAT via Authorization header |
| **Project Creation** | `supabase projects create` | `mcp__supabase__create_project` |
| **Organization Discovery** | `supabase orgs list` | `mcp__supabase__list_organizations` |
| **Migration Application** | `supabase db push` | `mcp__supabase__apply_migration` |
| **API Keys Retrieval** | `supabase projects api-keys` | `mcp__supabase__get_publishable_keys` |
| **Pooler Variant Detection** | Custom Node.js script | ❓ Unknown (needs investigation) |
| **Setup Complexity** | CLI installed, `supabase login` once | PAT creation + header config |
| **Works Without project_ref?** | ✅ Yes (creates new) | ❓ URL suggests project_ref needed |
| **Autonomous Friendly** | ✅ Yes (if CLI logged in) | ⚠️ Requires PAT + custom headers |

### Key Findings

#### Advantages of MCP Server Approach
1. ✅ **Programmatic API**: No bash script parsing
2. ✅ **Structured Responses**: Better error handling
3. ✅ **Tool Integration**: Native MCP protocol
4. ✅ **No Local CLI**: Works purely via HTTP

#### Disadvantages of MCP Server Approach
1. ❌ **Authentication Complexity**: Requires PAT setup + header config
2. ❌ **Header Support Unknown**: cc-agent may not support custom headers
3. ❌ **Project-Scoped by Default**: URL format suggests project_ref needed
4. ❌ **Security Warning**: "Never connect to production data" (Supabase docs)
5. ❌ **Pooler Detection**: Unclear if supported
6. ❌ **PAT Management**: Requires token rotation and security

#### Advantages of Current Skill Approach
1. ✅ **Works Today**: Already proven with multiple apps
2. ✅ **Simple Auth**: One-time `supabase login`, credentials cached
3. ✅ **Full Feature Parity**: All capabilities tested and working
4. ✅ **Flexible**: No project_ref needed for new projects
5. ✅ **Custom Logic**: Pooler detection script already implemented
6. ✅ **Recipe Reusability**: 10-step recipe can be embedded in prompts

## Critical Blockers for MCP Approach

### Blocker 1: Custom Headers Support
**Issue**: PAT authentication requires `Authorization` header in mcp_servers config

**Investigation Needed**:
```python
# Does cc-agent support this?
mcp_servers={
    "supabase": {
        "type": "http",
        "url": "https://mcp.supabase.com/mcp",
        "headers": {  # ← Does cc-agent pass this through?
            "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
        }
    }
}
```

**If NO**: MCP approach is not viable for autonomous agents

### Blocker 2: Project Creation Without project_ref
**Issue**: URL format `https://mcp.supabase.com/mcp?project_ref=...` suggests project-scoped access

**Question**: Can we:
- Create NEW projects without knowing project_ref in advance?
- Switch between projects dynamically?

**If NO**: MCP approach is not suitable for project creation workflow

### Blocker 3: Pooler Variant Detection
**Issue**: The skill's critical Node.js script detects working pooler variant (IPv4 vs IPv6)

**Question**: Does MCP server provide:
- Connection string testing?
- Pooler configuration details?
- Database connection verification?

**If NO**: We'd need to keep custom detection script anyway

## Recommendation

### ❌ Do NOT Replace Skill with MCP Server (Yet)

**Reasons**:
1. **Authentication Blocker**: Unclear if cc-agent supports custom headers for PAT
2. **Works vs Might Work**: Skill is proven; MCP approach has unknowns
3. **Feature Gap**: Pooler detection likely not supported
4. **Setup Complexity**: PAT management adds overhead vs one-time CLI login
5. **Security Concerns**: Supabase warns against production use

### ✅ Keep Current Skill Approach

The `supabase-project-setup` skill:
- **Works autonomously** (if CLI logged in once)
- **Proven in production** (NaijaDomot, ReclaMatch, KidIQ generated apps)
- **Complete feature parity** (project creation, migrations, pooler detection)
- **Simple setup** (`supabase login` once, credentials cached)

### 🔄 Future Consideration: Hybrid Approach

If/when cc-agent adds custom header support:
1. Use MCP server for **read operations** (list orgs, list projects, get keys)
2. Keep skill's recipe for **write operations** (create project, apply migrations)
3. Keep pooler detection script (custom logic)

## Next Steps

1. ✅ **Document findings** (this file)
2. ⏭️ **Close POC** - Do not pursue MCP approach further right now
3. ⏭️ **Enhance skill** - Consider improving documentation/error handling
4. ⏭️ **Monitor cc-agent updates** - Watch for custom header support

## Sources

- [Model Context Protocol (MCP) | Supabase Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [OAuth 2.1 Server Capabilities for Supabase Auth](https://github.com/orgs/supabase/discussions/38022)
- [Building Supabase-like OAuth Authentication For MCP Servers](https://hyprmcp.com/blog/mcp-server-authentication/)
- [Supabase MCP Server Blog Post](https://supabase.com/blog/mcp-server)
- [GitHub - supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp)

---

**Conclusion**: The official Supabase MCP server is **not yet suitable** for replacing our autonomous skill-based approach. The authentication requirements and unknown feature support make the current skill approach superior for our use case.
