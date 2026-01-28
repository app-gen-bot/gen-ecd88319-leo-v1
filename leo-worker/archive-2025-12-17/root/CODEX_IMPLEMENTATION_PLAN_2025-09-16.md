# Implementation Plan — Prompt→URL, Error‑Free, Delightful UI (2025‑09‑16)

Goal: upgrade the pipeline to deliver multi‑page, schema‑first apps with a single early preview, fast writer–critic
loops, and a consistently delightful UI — generically, with no app‑specific logic.

## Milestones, To‑Dos, and Test Gates

1) Preflight & Scaffolding (fail fast)

- To‑Do:
    - Add a preflight step (called by `run_pipeline` before Build) to verify: Node present, OXC available, SSR template
      cached, vite‑express template cached.
    - If missing, return actionable messages (paths and how to fetch/cache), do not proceed.
    - On template extract, inject minimal `tsconfig.base.json` with aliases and have `client/tsconfig.json` and
      `server/tsconfig.json` extend it. Align `vite.config.ts` alias if present.
- Tests (pass to proceed):
    - Preflight runs and outputs PASS for all checks on a healthy dev machine.
    - If a cache item is missing, it fails with a short, specific remediation message.

2) Technical Architecture Spec stage (route map)

- To‑Do:
    - Ensure `stages/technical_architecture_spec_stage.run_stage()` executes after Preview, writing
      `plan/technical-architecture-spec.md` with routes and page list.
- Tests:
    - File exists and includes at least one route entry; simple parse of route table succeeds.

3) Page Generation Orchestrator (multi‑page writer–critic)

- To‑Do:
    - Add `stages/pages_stage.py` that reads the tech spec and generates `client/src/pages/<Page>.tsx` using a
      Writer–Critic loop per page.
    - Require each page to import from `@shared/schema` or the typed API client (see next milestone), use ShadCN
      primitives, design tokens, and export a default component.
- Tests:
    - OXC passes for all generated pages.
    - `client/src/pages/` contains all pages from the tech spec.

4) App Shell auto‑routing (no hardcoding)

- To‑Do:
    - Update App Shell generator to read the tech spec route list and wire Wouter routes for all pages.
    - Critic verifies that every route in the spec is imported and registered; checks the app uses a shared `AppLayout`
      wrapper.
- Tests:
    - OXC passes; no missing import/route warnings.
    - Running the dev server shows no runtime errors on navigation between two random routes.

5) Typed API client from Zod (contract‑first UX)

- To‑Do:
    - Generate `client/src/lib/api.ts` from `shared/schema.ts` Zod schemas (basic CRUD per entity:
      list/get/create/update/delete), returning typed data.
    - Encourage pages to use this client (grep for direct `fetch('/api/...')` in pages; allow exceptions in orchestrator
      or specialized cases).
- Tests:
    - OXC passes; sample call compiles in one page.
    - Critic confirms at least one page uses the typed client and Zod parsing on submit.

6) UI Delight Pack (shared layout + micro‑interactions)

- To‑Do:
    - Generate `client/src/components/layout/AppLayout.tsx` with header, container, and slots.
    - Ensure pages include skeleton loaders, empty states, toasts, transitions, and accessible focus rings by default.
    - Enforce `lucide-react` icons; avoid raw SVG unless justified.
- Tests:
    - UI Consistency Critic (see next) passes on pages.
    - Visual smoke (no screenshots required): DOM contains skeleton node when loading flags are true (simple runtime
      assert).

7) UI Consistency Critic (static checks)

- To‑Do:
    - Implement a critic agent that scans `client/src/pages/**/*.tsx`:
        - Flags inline hex colors and presentational `style={{…}}` (require tokens/utilities).
        - Requires AppLayout wrapper import.
        - Verifies a loading and error branch exists for list‑style pages.
- Tests:
    - Critic returns COMPLETE on a fresh pipeline run; returns CONTINUE with clear errors if you inject a violation.

8) Validator enhancements (fast browser smoke tests)

- To‑Do:
    - In `validator_stage`, after build PASS, open root + 1–2 routes from the tech spec; assert: no console errors, key
      elements render, API returns 200.
    - Categorize failures: LINT_FAIL / COMPILE_FAIL / RUNTIME_FAIL in the summary.
- Tests:
    - On a healthy run, Validator summary shows PASS across oxc/build/browser.
    - On forced missing route or broken import, it reports COMPILE_FAIL or RUNTIME_FAIL with the offending file.

9) Observability for Happy Llama UI

- To‑Do:
    - Emit a compact JSON per stage to `workspace/plan/.pipeline/<stage>.json` (or `workspace/.pipeline/`): {status,
      files, duration, cost, quick_tip}.
    - Summarize at the end into `workspace/.pipeline/summary.json` for UI consumption.
- Tests:
    - JSON files present with the above keys; end‑to‑end summary aggregates stage durations and costs.

10) Incremental updates (prompt in same context)

- To‑Do:
    - Detect plan/spec diffs: added/modified/removed pages and routes.
    - Re‑run Page Generation only for impacted pages; rewire App Shell routes; warn on deletions.
- Tests:
    - Add a new route to plan → only the new page is generated; unchanged pages untouched (timestamps unchanged).

11) Single preview policy (speed over breadth)

- To‑Do:
    - Keep a single initial preview for look/feel; skip multi‑page previews post‑approval.
    - Optionally add a “style snapshot” generator for visual‑only follow‑ups (palette + components), not required to
      pass pipeline.
- Tests:
    - When only tokens change, style snapshot generated; page previews are not generated.

## Test Commands (examples)

- End‑to‑end: `uv run python src/app_factory_leonardo_replit/run.py --workspace-name demo --frontend-port 5173`.
- OXC fast checks: ensure linting for `shared/schema.ts`, `server/storage.ts`, `server/routes.ts`, `client/src/**/*.tsx`
  returns no errors.
- Build test: via Validator (build PASS required before browser tests).
- Browser smoke: Validator opens `/` and two routes from the tech spec, no console errors, 200 API responses.

## Acceptance Criteria

- Preflight PASS with clear remediation if missing deps.
- Technical architecture spec present; pages and routes generated from it.
- All critical Writer–Critic loops return COMPLETE.
- Type‑safe client generated; at least one page uses it.
- UI Consistency Critic COMPLETE (no inline colors/unsafe styles; AppLayout enforced; basic loading/error states
  present).
- Validator PASS (oxc/build/browser) and summary JSONs emitted; summary shows 0 failures.
- Incremental changes re‑generate only impacted pages; routing updated accordingly.
  Notes
- Keep everything generic and plan‑driven; no app‑specific branching.
- Prefer adding light critics and preflights over heavy runtime checks to keep cycles fast.
