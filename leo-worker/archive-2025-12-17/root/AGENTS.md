# Repository Guidelines

## Project Structure & Module Organization
- Active development lives in `src/app_factory_leonardo_replit/`; follow the Plan → UI Component Spec → Design System → Preview → Build → Validator stages orchestrated by `src/app_factory_leonardo_replit/main.py`.
- Shared agent plumbing stays under `src/cc_agent`, `src/cc_tools`, and `src/agent_server`; reuse these modules instead of copying code.
- Treat `apps/` as generated verification artifacts; inspect `CLAUDE.md` for context before modifying outputs.
- `src/app_factory/` and `src/app_factory_leonardo_replit/archive/` are legacy references—do not import them into new work.

## Build, Test, and Development Commands
- `uv pip install -e .` – install Python 3.12 dependencies.
- `uv run python src/app_factory_leonardo_replit/run.py "<prompt>"` – execute the full writer–critic pipeline with defaults.
- `uv run python -m app_factory_leonardo_replit.main --frontend-port 5173 "<prompt>"` – launch the pipeline with a custom port/workspace.
- `uv run python start_agent_server.py` – start shared MCP/agent services.
- `uv run python -m app_factory.monitor` – resume or monitor active runs.

## Coding Style & Naming Conventions
- Python: 4 spaces, full type hints, composable helpers, configuration isolated in `config.py` (`AGENT_CONFIG`).
- TypeScript (Vite/Express template): adhere to Prettier defaults; components `PascalCase`, hooks `camelCase`, env constants `SCREAMING_SNAKE_CASE`.
- Preserve writer–critic protocol: writers load prior critic XML, critics respond with `<decision>complete</decision>` when satisfied; log via `logger.info`.

## Testing Guidelines
- Run `uv run pytest -v` before committing; add stage smoke tests such as `uv run pytest -v src/cc_tools/route_testing/test_server.py`.
- Co-locate tests beside implementation (e.g., `stages/<stage>/tests/`), name cases `test_<behavior>`, and capture repro prompts/checkpoints in docstrings.
- Quarantine experimental coverage in `archive/tests` with TODO notes; never merge while validator loops fail.

## Commit & Pull Request Guidelines
- Use conventional prefixes (`feat:`, `fix:`, `docs:`, `refactor:`) and keep commits atomic.
- PRs should summarize changes, list touched agents/stages, document validation commands, and flag new MCP dependencies or env keys.
- Include screenshots or prompt IDs when UX or pipeline output changes; ensure oxc, build, and browser checks pass before requesting review.

## Agent Workflow Expectations
- Centralize agent settings in `AGENT_CONFIG` with explicit `model`, `max_turns`, and `mcp_tools`; default permissions unless documented.
- Launch new MCP integrations with `uv run mcp-...`, document required environment variables, and prefer generous writer retries (`max_iterations ≈ 20`).
- Use `--start-at-critic` flows (see `CLAUDE.md`) when resuming evaluations to maintain continuity.
