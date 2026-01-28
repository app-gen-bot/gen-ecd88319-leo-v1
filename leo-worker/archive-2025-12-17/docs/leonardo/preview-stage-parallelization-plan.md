# Preview Stage Parallelization & Dependency Removal Plan

## Background
The current Leonardo pipeline generates the React preview (`preview-react/App.tsx`) before the build stage. Downstream agents rely on that file for navigation cues, layout ordering, and example content. The preview prompt enforces a single scrollable page, which conflicts with the goal of producing multi-page apps. We want to run preview generation in parallel (or defer it entirely) without starving the build stage of required inputs. Because this pipeline disallows optional artifacts, every replacement specification must be produced deterministically and the pipeline must halt if any required file is missing.

## Goals
- Decouple the build stage from the preview artifact while maintaining strict input contracts.
- Provide explicit, machine-readable specifications for pages, navigation, and component responsibilities so builder agents can infer multi-page structure without reading `preview-react/App.tsx`.
- Leave hooks for an asynchronous preview worker that consumes the same specs once the pipeline refactor lands.
- Preserve the rule that all referenced artifacts are mandatory; absence of any required file aborts the run.

## Non-Goals
- Expanding the design-system stage beyond semantic color detection.
- Allowing “best-effort” builds that skip required files.
- Shipping the asynchronous execution harness (only document integration points).

## Mandatory Artifacts After Refactor
| Stage | File | Description |
| --- | --- | --- |
| Plan Stage | `plan/plan.md` | Existing business context; no change. |
| UI Component Spec Stage | `plan/ui-component-spec.md` | Existing narrative spec, updated to include structured subsections. |
| UI Component Spec Stage | `plan/navigation.json` | New JSON describing every page (route, guard, summary, primary components). |
| UI Component Spec Stage | `plan/component-inventory.json` | New JSON list of component responsibilities, state, and data requirements. |
| Technical Architecture Stage | `plan/pages-and-routes.md` | Regenerated using the new JSON inputs (still written into `app/specs/`). |

Failure to produce any artifact above must terminate the pipeline with a clear error.

## Workstream A – UI Component Spec Stage Enhancements
1. **Structured Outputs**
   - Extend the Stage 1 writer so that, after drafting the narrative spec, it emits:
     - `plan/navigation.json` containing an ordered `pages` array. Each entry must include `name`, `path`, `auth` (public/protected/admin), `description`, and `keySections`.
     - `plan/component-inventory.json` containing a `components` array with `name`, `type` (page, layout, widget, form, etc.), `usedOn` (list of page names), `dataSources`, `actions`, and `criticalStates`.
   - Update the stage contract to fail if either JSON file is missing or fails schema validation.
2. **Schema & Validation**
   - Add lightweight JSON Schema definitions under `src/app_factory_leonardo_replit/stages/docs/` to validate both files after generation.
   - Integrate validation into the stage run; log precise errors for missing fields.

## Workstream B – Technical Architecture Spec Stage Refactor
1. **Input Contract**
   - Update `technical_architecture_spec_stage.run_stage` to require `navigation.json` and `component-inventory.json` alongside the plan. Replace any preview-specific logic.
   - Adjust the agent prompt so it references the structured JSON (embed contents or provide file paths for the agent to read) instead of `App.tsx`.
2. **Spec Content**
   - Ensure `pages-and-routes.md` echoes every page from `navigation.json`, failing if mismatched. Include sections for shared components derived from the component inventory.
3. **Failure Handling**
   - Abort stage if required JSON files are missing or inconsistent (e.g., page referenced in component inventory but absent from navigation list).

## Workstream C – Build Stage & Pipeline Plumbing
1. **`build_stage.run_stage` Inputs**
   - Remove the hard requirement for `preview-react/App.tsx`; instead require `plan/navigation.json`, `plan/component-inventory.json`, and `app/specs/pages-and-routes.md`.
   - Update the setup logic to copy the JSON artifacts into `app/specs/` for writer agents.
2. **Main Orchestrator (`main.py`)**
   - Comment out the synchronous preview stage invocation, replacing it with a TODO noting that preview generation will run asynchronously using the same JSON specs.
   - Enforce existence checks for the new JSON artifacts immediately after the UI Component Spec stage and before calling the build stage.
3. **Design System Handling**
   - Leave semantic color handling untouched; ensure the removal of preview does not alter the existing domain-color injection.

## Workstream D – Writer & Critic Prompt Updates
All downstream agents must stop reading `specs/App.tsx` and switch to the new specs:
- **Schema Generator**: Read `specs/plan.md`, `specs/navigation.json`, and `specs/component-inventory.json` to infer entities and usage patterns.
- **Storage & Routes Generators**: Reference navigation/component inventories to identify CRUD surfaces and special endpoints.
- **App Shell Generator**: Build navigation from `specs/navigation.json` and technical spec; fail if any route is missing.
- **Layout & Main Page Generators**: Use the component inventory to understand sections/state requirements per page.
- **Component Analyzer/Generator**: Replace preview `codeSection` references with structured definitions from the inventory; if richer layout examples are needed, extend the inventory schema to include `layoutHints` derived from the UI Component Spec stage.
- Update corresponding critic prompts to validate against the new inputs (e.g., ensure generated pages cover every `keySection`).

## Workstream E – Preview Stage Parallelization Hooks
1. **Stage Isolation**
   - Keep the preview stage implementation, but gate its invocation behind a feature flag or explicit CLI flag.
   - Update the preview agent prompt to rely on `navigation.json`/`component-inventory.json` if run, ensuring consistency with the build inputs.
2. **Async Runner Placeholder**
   - Document the planned asynchronous entry point (e.g., `run_preview_async()`), including required parameters (workspace root + JSON artifacts).
   - Add logging in `main.py` stating that preview generation is skipped intentionally and referencing the future async flow doc.

## Workstream F – Validation & Tooling
1. **Unit/Stage Tests**
   - Add tests for the UI Spec stage to assert shape of both JSON files.
   - Add tests for the technical architecture stage verifying that missing JSON inputs cause deterministic failures.
2. **End-to-End Smoke**
   - Introduce a pipeline test fixture using a reduced prompt to ensure the build stage succeeds without the preview file.
   - Update validator expectations if any new files need lint/build coverage.
3. **Documentation**
   - Update `leonardo-pipeline-workflow.md` to reflect the new artifact flow and note that preview is optional operationally but not part of the critical path.

## Migration Checklist
1. Implement Workstream A (UI Spec enhancements + validation).
2. Refactor Technical Architecture stage per Workstream B.
3. Update `main.py` and `build_stage.py` to enforce new inputs and drop preview dependency.
4. Revise agent prompts (Workstream D) and regenerate critic fixtures if needed.
5. Adjust preview stage to consume the new specs and gate its execution (Workstream E).
6. Add automated tests and docs (Workstream F).
7. Perform a full pipeline run to confirm multi-page support without preview; capture artifacts for regression testing.

## Open Questions for Implementers
- Does the existing UI Component Spec stage provide enough detail to auto-populate `layoutHints`, or should a separate analyzer derive them?
- Should we version the JSON schemas to support future expansion (e.g., `v1` namespace)?
- Are additional stage outputs (e.g., `plan/data-model.json`) required to make schema generation robust without the preview artifact?

Address these questions during implementation and update this plan as decisions are made.
