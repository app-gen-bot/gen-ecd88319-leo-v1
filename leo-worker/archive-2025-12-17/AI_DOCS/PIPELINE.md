# PIPELINE

## Entrypoints
- `src/app_factory_leonardo_replit/run.py`: CLI runner that provisions a workspace under `apps/`, mirrors logs, and invokes the pipeline with a single prompt.
- `src/app_factory_leonardo_replit/main.py`: Core orchestrator exposing `run_pipeline` (also callable via `python -m app_factory_leonardo_replit.main`).

## Current Leonardo Pipeline Flow

```
User Prompt -> Plan -> UI Component Spec -> Design System -> Preview -> Build -> Validator
```

## Pipeline Overview (Current)

| Stage | Artifacts In | Agents / Modules | Artifacts Out |
| --- | --- | --- | --- |
| 1. Plan | `user_prompt` | `plan_stage.run_stage` | `plan/plan.md`, optional `plan/_phases/plan-phaseN.md`, plan templates (`business_prd.md`, `frontend-interaction-spec.md`) when present |
| 2. UI Component Spec | `plan/plan.md` | `stage_1_ui_component_spec.run_stage` | `plan/ui-component-spec.md` |
| 3. Design System | `plan/plan.md`, `plan/ui-component-spec.md` | `design_system_stage.run_stage` | `design-system/domain-colors.json` or semantic colors injected into `app/client/src/index.css` |
| 4. Preview | `plan/plan.md`, design system palette (optional) | `preview_stage.run_stage`, `PreviewGeneratorAgent`, `ReactToStaticRenderer` | `preview-html/preview.html`, `preview-react/App.tsx` |
| 5. Build | `plan/plan.md`, `preview-react/App.tsx`, `design-system/domain-colors.json`, `plan/ui-component-spec.md` | `build_stage.run_stage`, `backend_spec_stage.run_stage`, `technical_architecture_spec_stage.run_stage`, Writer/Critic agents (`SchemaGenerator`, `StorageGenerator`, `RoutesGenerator`, `ApiClientGenerator`, `LayoutGenerator`, `ContextProviderGenerator`, `AppShellGenerator`, `MainPageGenerator`), `PageGeneratorOrchestrator` | Vite/Express workspace under `app/`, `app/shared/schema.zod.ts`, `app/shared/contracts/*.ts`, `app/shared/schema.ts`, `app/specs/pages-and-routes.md`, generated components/pages, build summary plus validation log |
| 6. Validator | `app/` | `validator_stage.run_validator_stage`, `AppFixerAgent`, `AppValidatorCritic` | Validation summary (oxc/build/browser), iterative repair history |

## Stage Workflows

### Stage 1: Plan
- **Workflow**: Generate `plan/plan.md` (with optional phase slices) from the user prompt via `plan_stage.run_stage`. Existing phase files in `plan/_phases/` are surfaced to `plan/plan.md` when resuming. Template specs are copied into `plan/` when the optional `template-specs/` directory is available.

### Stage 2: UI Component Spec
- **Workflow**: Convert the plan into `plan/ui-component-spec.md` using `stage_1_ui_component_spec.run_stage` (phase-constrained to Phase 1 for faster iteration) so downstream stages understand component hierarchy and UX notes.

### Stage 3: Design System
- **Workflow**: Detect the domain from plan keywords, emit `design-system/domain-colors.json`, and, when an `app/` directory already exists, inject three semantic CSS variables (`--app-primary`, `--app-accent`, `--app-emotion`) directly into `app/client/src/index.css` via `design_system_stage.run_stage`.

### Stage 4: Preview
- **Workflow**: Render the planned experience with `preview_stage.run_stage`. `PreviewGeneratorAgent` writes `preview-react/App.tsx`, then `ReactToStaticRenderer` converts it to `preview-html/preview.html`, anchoring layout decisions before full code generation.

### Stage 5: Build
- **Workflow**: Assemble the production app in `app/` via the build stage, combining backend specs, architectural scaffolding, and Writer-Critic loops while enforcing the "Never Broken" policy.
#### Step 1: Template & Design System Integration
- Extract `vite-express-template-v2.1.1-2025.tar.gz`, apply semantic colors, and prepare the Vite/Express scaffolding.
#### Step 2: Backend Specification
- Run `backend_spec_stage.run_stage` to emit `app/shared/schema.zod.ts` and `app/shared/contracts/*.ts` as the canonical API contracts.
#### Step 3: Workspace Preparation
- Configure TypeScript base configs, copy `plan.md` and `App.tsx` into `app/specs/`, and back up any `plan-phase*.md` files under `app/_planning/` for agent reference.
#### Step 4: Technical Architecture Spec
- Generate `app/specs/pages-and-routes.md` with `technical_architecture_spec_stage.run_stage` using the plan, UI spec, and preview React component to define screens, routes, and data needs.
#### Step 5: Writer-Critic Execution
- Execute Writer/Critic pairs (`Schema`, `Storage`, `Routes`, `ApiClient`, `Layout`, `ContextProvider`, `AppShell`, `MainPage`) until each critical component passes; Layout runs single-shot while others respect critic XML feedback.
#### Step 6: Page Fan-out
- Use `PageGeneratorOrchestrator` to generate additional pages from the technical architecture spec, excluding the already-produced home page.
#### Step 7: Build Validation
- Perform multi-check validation (TypeScript compilation, route/file presence, import resolution, and build pipeline checks) before emitting the build summary.

### Stage 6: Validator
- **Workflow**: Run `validator_stage.run_validator_stage`, where `AppFixerAgent` iteratively applies fixes and `AppValidatorCritic` verifies `oxc`, `build`, and browser smoke checks until a full pass (or iteration limit) is reached. A structured summary captures every loop.

## Operational Notes
- `run_pipeline` skips stages when their key artifacts already exist, enabling resumes without regeneration.
- Use `uv run python src/app_factory_leonardo_replit/run.py "<prompt>"` for the CLI runner, or call `python -m app_factory_leonardo_replit.main --frontend-port 5173 "<prompt>"` when integrating with other tooling.

## Frontend–Backend Bridge
- **Bridge Overview**: `app/shared/schema.zod.ts` and `app/shared/contracts/*.ts` define the shared data model and REST contract. The writer/critic loop regenerates `app/shared/schema.ts` so both tiers import identical Drizzle tables and Zod schemas. `app/server/routes.ts` uses those definitions to validate requests and shape responses, while `app/client/src/lib/api.ts` imports the same modules to parse payloads—together they form the runtime bridge between the Express server and the React client.
- **Parallel Development**: As soon as backend-spec produces `schema.zod.ts` and the contract bundle, backend developers can finish storage/routes while frontend developers scaffold API clients and pages; everyone type-checks against the same shared artifacts.
- **Shared Dependency Chain**:
```
plan/plan.md
  -> app/shared/schema.zod.ts
  -> app/shared/contracts/*
        |
        v
  app/shared/schema.ts
    |        |
    |        +-> app/client/src/lib/api.ts
    |              -> pages/components
    v
  app/server/storage.ts -> app/server/routes.ts
```
