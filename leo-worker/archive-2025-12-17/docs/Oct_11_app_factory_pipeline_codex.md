# Leonardo App Factory Pipeline — Timeless Weddings Phase 1 (Oct 11, 2025)

## Context & Trigger
- Generated on October 11, 2025 to document the pipeline kicked off by `./run-timeless-weddings-phase1.sh`.
- Target workspace: `apps/timeless-weddings-phase1`.
- Phase flag: `--phase 1` (core MVP scope with `MAX_ENTITIES=5`).
- Prompt bound into the run: `"Create a wedding chapel booking platform with stunning DARK THEME design following docs/design-best-practices/design-requirements.md"`.
- Runtime toolchain: `uv` (Python 3.12 env) invoking `src/app_factory_leonardo_replit/run.py`.
- Logging streams to console **and** `apps/timeless-weddings-phase1/logs/leonardo_run_<timestamp>.log` via `attach_workspace_log_handler`.

## Regeneration Prompt Snapshot
Store this request so the doc can be regenerated when the flow changes:

> Go ahead and take a look at ./run-timeless-weddings-phase1.sh and follow the call chain in that shell script. Figure out the entire pipeline of how everything runs by actually following the call chain, the inputs and the outputs and create a doc in docs/ called Oct_11_app_factory_pipeline_codex.md. I'd like you to really understand how the pipeline works and document it in that doc. That way, an AI agent reading that doc can go ahead and understand what's going on. Even add this prompt in the file so that when things change I can regenerate or update that doc. ultrathink

## Entry Script (`run-timeless-weddings-phase1.sh`)
- Prints run configuration, including workspace, ports (`5173` frontend / `8000` backend), phase, and entity cap.
- Supports clean modes appended to `uv run` call:
  - `--clean`: remove everything under `apps/<workspace>` except `logs/`.
  - `--clean-contracts | --clean-specs | --clean-pages`: targeted removals inside `app/`.
  - `--yes/-y`: skip interactive confirmation.
- Core execution:
  ```bash
  uv run python src/app_factory_leonardo_replit/run.py \
      "$PROMPT" \
      --workspace-name "$WORKSPACE" \
      --frontend-port $FRONTEND_PORT \
      --backend-port $BACKEND_PORT \
      --phase $PHASE \
      --max-entities-phase1 $MAX_ENTITIES \
      $CLEAN_FLAGS
  ```
- On success it prints instructions to install dependencies and start Vite in `apps/<workspace>/app`.

## Python Runner (`src/app_factory_leonardo_replit/run.py`)
1. Parses CLI args (prompt, workspace, ports, phase, `max_entities_phase1`, clean flags).
2. Calls `setup_logging` and mirrors stdout/stderr into `apps/<workspace>/logs/`.
3. Applies cleaning:
   - Full clean removes everything under the workspace except `logs/`.
   - Contract/spec/page cleans target `app/shared/contracts`, `workspace/specs`, or `client/src/pages/*.tsx`.
4. Starts a `Timer("leonardo_pipeline")` and asynchronously invokes `run_pipeline` from `app_factory_leonardo_replit.main`.
5. Collects a `dict[str, AgentResult]` keyed by stage names (`plan`, `build`, `validator`), logging per-stage cost (`AgentResult.cost`) and success.

## Pipeline Orchestrator (`src/app_factory_leonardo_replit/main.py`)
- Ensures required directories inside `apps/<workspace>` exist: `plan/`, `specs/`, `design-system/`, `app/`, `app/shared/`.
- Determines `app_name` from workspace folder.
- Phased `plan` handling:
  - For phase > 1 it copies `plan/_phases/plan-phase{phase}.md` into `plan/plan.md` if available.
  - Otherwise generates plan content via `plan_stage.run_stage`.
- Skips deprecated stages (UI component spec, design system, preview) but keeps placeholders in log output for clarity.
- Always runs `build_stage.run_stage` (it self-skips already satisfied artifacts).
- After a successful build, runs `validator_stage.run_validator_stage(app_dir)`.
- Aggregates and returns stage results to the runner.

## Stage 1 — Plan Stage (`plan_stage.run_stage`)
**Inputs:** user prompt, output directory, phase metadata, `max_entities_phase1`.

Workflow:
1. Calls `orchestrator_agent.generate_plan` (writer only) with `skip_questions=True` and phase/entity limits.
2. Writes full plan to `plan/_phases/plan-full.md` and individual phase files (`plan-phase1.md`, ...).
3. Copies Phase 1 content to `plan/plan.md`; additional phases stay hidden.
4. Drops a reusable `tech_stack.md` template into `plan/`.
5. Returns `AgentResult(success, content, cost)` plus derived `app_name` and `plan_path`.

Artifacts:
- `plan/plan.md` (Phase 1 view).
- `plan/_phases/plan-phase*.md` (per-phase snapshots).
- `plan/_phases/plan-full.md`.
- `plan/tech_stack.md`.

## Stage 2 — Build Stage (`build_stage.run_stage`)
**Inputs:** `plan/plan.md` (or phase-specific), optional preview component (unused in Phase 1), `phase` number.

High-level flow:
1. **Template Extraction**
   - Uses `extract_template` to untar `~/.mcp-tools/templates/vite-express-template-v2.1.1-2025.tar.gz` into `app/` if not already initialized.
   - Optionally applies design colors from `design-system/domain-colors.json` or copies legacy design tokens.
2. **Backend Spec Stage**
   - Calls `backend_spec_stage.run_stage(plan_path, app/shared)` if `schema.zod.ts` or `contracts/` are missing.
   - `backend_spec_stage` executes two Writer↔Critic loops:
     1. `SchemaDesignerAgent` ↔ `SchemaDesignerCritic` (Zod schemas).
     2. `ContractsDesignerAgent` ↔ `ContractsDesignerCritic` (ts-rest contracts).
   - Copies `plan.md` into `app/shared/` for agent context.
3. **TypeScript Configuration**
   - `setup_typescript_configuration` writes `app/tsconfig.base.json`, aligns client/server `tsconfig.json`, and ensures Vite aliases.
4. **Specs Setup**
   - Copies active plan into `app/specs/plan.md` (phase-aware) and optional `App.tsx` preview.
   - Ensures `app/specs/` & `app/_planning/` hold all phase docs for agent reference.
5. **Technical Architecture Specification**
   - `technical_architecture_spec_stage.run_stage` produces `app/specs/pages-and-routes.md` via `TechnicalArchitectureSpecAgent`.
   - UI spec input is optional; Phase 1 relies on plan + generated context.
6. **Writer-Critic Pipeline (Never Broken principle)**
   - Development settings bump iteration ceilings via `dev_config.get_max_iterations()` (500 by default).
   - Agents run sequentially; any critical failure aborts the build.
   - Sequence:
     1. `SchemaGeneratorAgent` ↔ `SchemaGeneratorCritic` (generates `app/shared/schema.ts` from `schema.zod.ts`).
     2. `StorageGeneratorAgent` ↔ `StorageGeneratorCritic` (`app/server/storage.ts`).
     3. `RoutesGeneratorAgent` ↔ `RoutesGeneratorCritic` (`app/server/routes.ts`).
     4. `TsRestApiClientGeneratorAgent` ↔ `TsRestApiClientGeneratorCritic` (`app/client/src/lib/api-client.ts`).
     5. `FrontendInteractionSpecMasterAgent` (single-run writer) generates `app/specs/frontend-interaction-spec-master.md`, then for each page discovered in `pages-and-routes.md` it instantiates `FrontendInteractionSpecPageAgent` to emit `app/specs/pages/<page>.md`.
     6. `LayoutGeneratorAgent` ↔ `LayoutGeneratorCritic` (`app/client/src/components/layout/AppLayout.tsx`).
     7. `FrontendImplementationAgent` ↔ `BrowserVisualCriticAgent` (renders UI, drives Playwright/browser snapshots, ensures FIS alignment).
7. **Page Build Out**
   - `PageGeneratorOrchestrator.generate_all_pages` consumes `pages-and-routes.md` to write actual React page files under `app/client/src/pages/`.
8. **Final Build Summary**
   - Collects per-agent compliance scores, iteration counts, and estimated costs into `build_summary`.

Key outputs inside `app/`:
- `client/` (Vite UI code with generated pages, layout, hooks, context providers).
- `server/routes.ts`, `server/storage.ts`.
- `shared/schema.zod.ts`, `shared/schema.ts`, `shared/contracts/`.
- `specs/pages-and-routes.md`, `specs/frontend-interaction-spec-master.md`, `specs/pages/*.md`, `specs/plan.md`.

## Stage 3 — Validator Stage (`validator_stage.run_validator_stage`)
**Inputs:** `app_dir` once build succeeds.

Loop mechanics (Fixer-Validator pattern):
1. Instantiate `AppFixerAgent(cwd=app_dir)` → runs lint/build/test flows (`oxc`, `npm run build`, browser smoke), applies fixes when failures occur.
2. `AppValidatorCritic.verify_all()` re-runs checks and returns a JSON dict like `{ "oxc": "PASS", "build": "PASS", "browser": "FAIL" }`.
3. `compute_overall_status` must read as `PASS` for the stage to finish; otherwise the loop iterates (up to `get_max_iterations(3)` → 500 with dev config).
4. Aggregates iteration history into a human-readable summary.

Artifacts:
- Validation transcripts land in the shared log file plus returned `validation_summary` string for the runner.

## Data Flow Summary
```
run-timeless-weddings-phase1.sh
  └─ uv run python src/app_factory_leonardo_replit/run.py
       ├─ setup_logging + attach_workspace_log_handler
       ├─ run_pipeline(workspace, prompt, ports, phase, max_entities)
       │    ├─ plan_stage.run_stage → plan/plan.md, plan/_phases/*, tech_stack.md
       │    ├─ build_stage.run_stage → app/ (template + backend + frontend artifacts)
       │    │    ├─ backend_spec_stage.run_stage → shared/schema.zod.ts + contracts/
       │    │    ├─ technical_architecture_spec_stage.run_stage → specs/pages-and-routes.md
       │    │    ├─ writer/critic agents → schema.ts, storage.ts, routes.ts, api client, FIS, layout, pages
       │    │    └─ PageGeneratorOrchestrator → client/src/pages/*.tsx
       │    └─ validator_stage.run_validator_stage → validation summary
       └─ Results dict logged with costs & statuses
```

## Workspace Layout After a Successful Run
- `apps/timeless-weddings-phase1/`
  - `plan/` (plans, tech stack, `_phases/`).
  - `design-system/` (domain color JSON or legacy tokens).
  - `specs/` (backend specs mirror, may be regenerated).
  - `app/`
    - `client/` (Vite project, pages, components, layout, styles, API client).
    - `server/` (Express routes, storage adapter).
    - `shared/` (schemas, contracts, shared types).
    - `specs/` (plan + FIS artifacts for agent consumption).
    - `_planning/` (phase backups of plan docs).
  - `logs/leonardo_run_<timestamp>.log` (mirrors console output).

## Clean & Re-run Tips
- Use `./run-timeless-weddings-phase1.sh --clean --yes` for a pristine regeneration (plan/spec/app directories rebuilt).
- To regenerate contracts only: `--clean-contracts --yes` (keeps front-end assets).
- To force new page specs without wiping UI: delete files in `app/specs/pages/` or use `--clean-pages` (removes `.tsx` pages, leaving specs).
- All commands rely on `uv` being installed (`pipx install uv` or refer to project setup).
- Validation can be re-run independently via `uv run python src/app_factory_leonardo_replit/run.py "<prompt>" --workspace-name <existing> --phase 1` (build stage skips already satisfied artifacts).

## Operational Notes
- `AgentResult.cost` accumulates per agent and is surfaced in both build and validator summaries; zero cost indicates either cached work or non-monetized calls.
- Writer-Critic loops store the critic’s raw XML in `evaluation_history` so subsequent iterations can ingest precise feedback.
- `dev_config.USE_DEV_LIMITS=True`—expect long-running loops; abort manually if needed.
- Template tarball lives outside the repo (`~/.mcp-tools/templates/`); ensure it’s provisioned before first run.
- The pipeline is phase-aware: later phases reuse `_phases/plan-phaseN.md` and only rebuild missing assets.

