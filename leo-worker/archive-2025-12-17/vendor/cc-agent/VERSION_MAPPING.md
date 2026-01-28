# cc-agent Version Mapping

## Version History

| Version | App-Factory Branch | Key Changes | Commit Date |
|---------|-------------------|-------------|-------------|
| 1.0.0 | main | Initial extraction baseline | 2025-01-24 |
| 1.1.0 | feature/context-aware-agent-integration | Added retry_handler.py, context improvements | 2025-07-16 |
| 1.2.0 | jake/micro-sprints, jake/frontend | Added DALL-E MCP server and graphiti configuration | 2025-07-21 |
| 1.3.0 | feature/stage-2-writer-unified | Stage 1 Writer-Critic iteration with Unsplash and browser MCP | 2025-08-24 |
| 1.4.0 | michaelangelo/happyllama, michaelangelo/happyllama-replit | FastAPI agent server for Happy Llama integration | 2025-09-01 |
| 1.5.0 | multiple branches | Add MCP tools parameter and registry to Agent class | 2025-09-08 |
| 1.6.0 | multiple branches | Comprehensive Claude Code documentation | 2025-09-08 |
| 1.7.0 | michaelangelo/leonardo-replit-todo-app | Leonardo pipeline validation fixes | 2025-09-08 |
| 1.8.0 | experiment/timeless-weddings-zod-v1 | Design system agent improvements | 2025-09-15 |
| 1.9.0 | leonardo/timeless-weddings-enhanced-docs | Remove default truncation for full LLM output | 2025-09-16 |
| 1.10.0 | main | Enhanced observability: turn-by-turn logging, max_turns detection, retry countdown | 2025-09-25 |

## Branch to Version Mapping

| App-Factory Branch | cc-agent Version | Notes |
|-------------------|------------------|-------|
| main | 1.0.0 | Baseline |
| experiment/timeless-weddings-zod-v1 | 1.8.0 | Design system improvements |
| feature/context-aware-agent-integration | 1.1.0 | Retry handler, context |
| feature/stage-2-writer-unified | 1.3.0 | Writer-Critic improvements |
| feature/validated-agent-clean | 1.1.0 | Uses context-aware base |
| jake/backend | 1.1.0 | Uses context-aware base |
| jake/clean-stages | 1.1.0 | Uses context-aware base |
| jake/contract-first | 1.1.0 | Uses context-aware base |
| jake/executive-manager-poc | 1.1.0 | Uses context-aware base |
| jake/frontend | 1.2.0 | DALL-E integration |
| jake/lpatel-contract-first | 1.1.0 | Uses context-aware base |
| jake/micro-sprints | 1.2.0 | DALL-E integration |
| jake/micro-sprints-archive | 1.2.0 | DALL-E integration |
| jake/micro-sprints-backup-* | 1.1.0 | Uses context-aware base |
| jake/stage4-exp | 1.1.0 | Uses context-aware base |
| leonardo/timeless-weddings-enhanced-docs | 1.9.0 | Docs and truncation fix |
| main | **1.10.0** | Latest with enhanced observability |
| lpatel/contract-first | 1.1.0 | Uses context-aware base |
| lpatel/micro-sprints | 1.2.0 | DALL-E integration |
| lpatel/micro-sprints-enhanced | 1.1.0 | Uses context-aware base |
| michaelangelo-happyllama-new-stack-validated | 1.4.0 | FastAPI agent server |
| michaelangelo/happyllama | 1.4.0 | FastAPI agent server |
| michaelangelo/happyllama-replit | 1.4.0 | FastAPI agent server |
| michaelangelo/leonardo-replit-todo-app | 1.7.0 | Leonardo pipeline fixes |
| michaelangelo/leonardo-replit-todo-app-lpatel | 1.7.0 | Leonardo pipeline fixes |
| michaelangelo/replit-pure-implementation | 1.4.0 | FastAPI agent server |

## Usage Instructions

To use the correct version in your app-factory branch:

1. Check your branch name in the mapping above
2. Update your `pyproject.toml`:
   ```toml
   [project]
   dependencies = [
       "cc-agent==X.Y.Z",  # Replace with your branch's version
       # ... other dependencies
   ]
   ```

3. For local development:
   ```toml
   [tool.uv.sources]
   cc-agent = { path = "../cc-agent-lib" }
   ```

4. For production (AWS CodeArtifact - future):
   ```toml
   [tool.uv.sources]
   cc-agent = { index = "internal" }
   ```

## Important Notes

- All branches not listed explicitly inherit from their parent branch version
- The main branch (v1.10.0) has the most recent changes with enhanced observability
- Version tags are immutable - checkout by tag for specific versions
- This mapping will be updated as new versions are created

---

*Last updated: 2025-09-25*