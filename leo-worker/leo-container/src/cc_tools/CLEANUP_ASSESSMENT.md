# cc_tools Cleanup Assessment

**Date**: 2025-12-18
**Status**: Partial cleanup completed

## Tools Archived (2025-12-18)

| Tool | Reason |
|------|--------|
| dalle | Zero references in codebase |
| browser | Replaced by external `chrome-devtools-mcp` npm package |
| heroicons | Only mentioned in docs, no actual MCP usage |

## Tools Kept - Actively Used

| Tool | Usage Evidence |
|------|----------------|
| **build_test** | code_writer, quality_assurer agents (mcp__build_test__verify_project) |
| **tree_sitter** | api_architect, schema_designer agents |
| **oxc** | code_writer agent (TypeScript/JS linting) |
| **supabase_setup** | schema_designer, code_writer (mcp__supabase__*) |
| **mem0** | research_agent, config.py (mcp__mem0__*) |
| **context_manager** | research_agent, config.py (mcp__context_manager__*) |
| **common** | Required dependency - logging utils used by 14 other tools |

## Tools Kept - Needs Verification

These are registered in `config.py` but actual runtime usage is unclear:

| Tool | Evidence | Action Needed |
|------|----------|---------------|
| **graphiti** | config.py, agent.py | Verify if knowledge graph is actually used |
| **package_manager** | config.py, agent.py | Verify if package management MCP is invoked |
| **dev_server** | config.py, agent.py, reprompter | Likely used for dev server management |
| **cwd_reporter** | config.py, agent.py | Verify if CWD reporting is needed |
| **integration_analyzer** | config.py, agent.py | Verify if template comparison is used |
| **shadcn** | Referenced in patterns | May be UI concept only, not MCP tool |

## Tools Kept - Low Priority Review

| Tool | Notes |
|------|-------|
| **unsplash** | Only URL pattern reference, not MCP tool - consider archive |
| **route_testing** | Zero references - consider archive |
| **ruff** | Python linting, but Leo generates TypeScript - consider archive |

## Utility Files (Keep)

| File | Purpose |
|------|---------|
| **mcp_registry.py** | MCP server registry utility |
| **mcp_http_bridge.py** | HTTP bridge utility |
| **__init__.py** | Package init |

## External Dependencies Note

`chrome_devtools` (mcp__chrome_devtools__*) is heavily used but is an **external npm package** (`chrome-devtools-mcp`), not part of cc_tools. It's installed globally in the container via:
```dockerfile
npm install -g chrome-devtools-mcp
```

## Future Cleanup Tasks

1. Test generation workflow without graphiti, package_manager, cwd_reporter, integration_analyzer
2. If no errors, archive those tools
3. Consider archiving unsplash, route_testing, ruff
4. Update config.py to remove references to archived tools
