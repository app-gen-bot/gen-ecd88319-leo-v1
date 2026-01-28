# cc-tools Version Mapping

## Version History

| Version | App-Factory Branch | Key Changes | Commit Date |
|---------|-------------------|-------------|-------------|
| 1.0.0 | main | Initial extraction baseline | 2025-01-24 |
| 1.1.0 | feature/context-aware-agent-integration | Add OXC and Ruff MCP servers for ultra-fast linting | 2025-07-15 |
| 1.2.0 | feature/context-aware-agent-integration | Add Heroicons MCP integration | 2025-07-15 |
| 1.3.0 | jake/micro-sprints, jake/frontend | Add DALL-E MCP server for image generation | 2025-07-21 |
| 1.4.0 | feature/stage-2-writer-unified | Add route_testing MCP server | 2025-07-24 |
| 1.5.0 | multiple branches | Add Unsplash MCP server | 2025-08-24 |
| 1.6.0 | multiple branches | Change dev server ports from 3000 to 5000 | 2025-09-02 |
| 1.7.0 | leonardo/timeless-weddings-enhanced-docs | Add MCP tools parameter and registry | 2025-09-08 |

## Branch to Version Mapping

| App-Factory Branch | cc-tools Version | Notes |
|-------------------|------------------|-------|
| main | 1.0.0 | Baseline |
| experiment/timeless-weddings-zod-v1 | 1.7.0 | Full MCP registry |
| feature/context-aware-agent-integration | 1.2.0 | OXC, Ruff, Heroicons |
| feature/stage-2-writer-unified | 1.4.0 | route_testing server |
| feature/validated-agent-clean | 1.0.0 | No cc-tools changes |
| jake/backend | 1.0.0 | No cc-tools changes |
| jake/clean-stages | 1.2.0 | Heroicons integration |
| jake/contract-first | 1.2.0 | Basic MCP tools |
| jake/executive-manager-poc | 1.2.0 | Heroicons integration |
| jake/frontend | 1.3.0 | DALL-E server |
| jake/lpatel-contract-first | 1.2.0 | Heroicons integration |
| jake/micro-sprints | 1.3.0 | DALL-E server |
| jake/micro-sprints-archive | 1.3.0 | DALL-E server |
| jake/micro-sprints-backup-* | 1.0.0 | No cc-tools changes |
| jake/stage4-exp | 1.0.0 | No cc-tools changes |
| leonardo/timeless-weddings-enhanced-docs | **1.7.0** | Full MCP registry and all servers |
| lpatel/contract-first | 1.2.0 | Basic MCP tools |
| lpatel/micro-sprints | 1.3.0 | DALL-E server |
| lpatel/micro-sprints-enhanced | 1.2.0 | Basic MCP tools |
| michaelangelo-happyllama-new-stack-validated | 1.2.0 | Basic MCP tools |
| michaelangelo/happyllama | 1.2.0 | Basic MCP tools |
| michaelangelo/happyllama-replit | 1.5.0 | Unsplash server |
| michaelangelo/leonardo-replit-todo-app | 1.7.0 | Full MCP registry |
| michaelangelo/leonardo-replit-todo-app-lpatel | 1.7.0 | Full MCP registry |
| michaelangelo/replit-pure-implementation | 1.5.0 | Unsplash server |

## MCP Server Availability by Version

| Version | Available MCP Servers |
|---------|----------------------|
| 1.0.0 | build_test, dev_server, integration_analyzer, package_manager, shadcn, browser, cwd_reporter |
| 1.1.0 | + oxc, ruff |
| 1.2.0 | + heroicons |
| 1.3.0 | + dalle |
| 1.4.0 | + route_testing |
| 1.5.0 | + unsplash |
| 1.6.0 | dev_server port changed to 5000 |
| 1.7.0 | + mcp_registry (full tool discovery) |

## Usage Instructions

To use the correct version in your app-factory branch:

1. Check your branch name in the mapping above
2. Update your `pyproject.toml`:
   ```toml
   [project]
   dependencies = [
       "cc-tools==X.Y.Z",  # Replace with your branch's version
       # ... other dependencies
   ]
   ```

3. For local development:
   ```toml
   [tool.uv.sources]
   cc-tools = { path = "../cc-tools-lib" }
   ```

4. For production (AWS CodeArtifact - future):
   ```toml
   [tool.uv.sources]
   cc-tools = { index = "internal" }
   ```

## Important Notes

- All branches not listed explicitly use version 1.0.0 (baseline)
- The leonardo/timeless-weddings-enhanced-docs branch (v1.7.0) has all MCP servers
- Version tags are immutable - checkout by tag for specific versions
- This mapping will be updated as new versions are created

---

*Last updated: 2025-01-24*