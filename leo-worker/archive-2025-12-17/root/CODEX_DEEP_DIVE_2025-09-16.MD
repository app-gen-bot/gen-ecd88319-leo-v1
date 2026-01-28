# Codex Deep Dive — Leonardo App Factory Pipeline (2025-09-16)

This describes how the pipeline runs from the entry point `uv run python src/app_factory_leonardo_replit/run.py`, what
each agent does, how schema-first contracts keep frontend and backend in sync, and where we can improve.

## Call Chain & Stage Flow

- Entry → `run.py` → `main.run_pipeline(workspace, prompt, ports)` sets up folders: `plan/`, `design-system/`,
  `preview-html/`, `preview-react/`, `app/`.
- Plan Stage (`stages/plan_stage.py`): `plan_orchestrator` writes `plan/plan.md` from the user prompt.
- UI Component Spec (`stages/stage_1_ui_component_spec.py`): Extracts needed components/states into
  `plan/ui-component-spec.md`.
- Design System (`stages/design_system_stage.py`): Seeds Tailwind + tokens into `design-system/` and customizes from the
  plan/spec.
- Preview (`stages/preview_stage.py`): `preview_generator` writes `preview-react/App.tsx`; SSR via
  `react_preview_system/ReactToStaticRenderer` → `preview-html/preview.html` (Node + ESBuild, no Next.js).
- Build (Writer–Critic loops, `stages/build_stage.py`):
    - Extracts `vite-express` template into `app/`.
    - Schema Generator → Critic: writes `app/shared/schema.ts` (Drizzle ORM + Zod schemas + TS types). Validates with
      fast OXC linting.
    - Storage Generator → Critic: writes `app/server/storage.ts` using in-memory `Map<id, Entity>` and imports types
      from `@shared/schema`.
    - Routes Generator → Critic: writes `app/server/routes.ts` (Express). Validates POST/PATCH via Zod schemas from
      `schema.ts`.
    - App Shell Generator → Critic: writes `client/src/App.tsx` (Wouter router, providers).
    - Main Page Generator → Critic: writes `client/src/pages/HomePage.tsx` (UI + fetch calls + Zod form validation).
- Validator (Fixer–Validator loop): `AppFixerAgent` runs OXC/build/browser; `AppValidatorCritic` verifies and returns
  PASS/FAIL.

## Why Vite + Express (vs Next.js)

- Simpler, faster dev loop (ESBuild + Vite) with minimal conventions; easier for agents to generate atomic files that
  compile.
- Express gives straightforward REST endpoints; no framework magic or coupling to file-system routing. Perfect for a
  schema-first, generator-driven flow.
- SSR for previews uses a lightweight Node script; avoids heavy SSR/runtime complexity while still showing realistic UI.

## Schema-First Contract (No Type Mismatch)

- Single source of truth: `shared/schema.ts` exports Drizzle tables, Zod insert/update schemas, and TS types.
- Backend routes import Zod schemas for request validation; storage imports TS types; frontend imports both types and
  Zod for form validation. Everyone shares one contract.

## Happy Llama UX Flow

- User enters a prompt → Plan + Preview generated; user reviews preview.
- On approval, Build runs Writer–Critic loops to generate app code.
- Subsequent prompts update `plan.md` and regenerate affected layers to keep app consistent.

## Clear Improvements

- Path aliases: ensure `@shared/*` paths are added to `client` and `server` tsconfig; add Critic checks for alias
  correctness.
- Contracts to clients: generate OpenAPI or ts-rest/zodios clients from Zod schemas so the frontend fetch layer is fully
  typed.
- Template availability: prefetch cache for `vite-express-template` and SSR template; fail fast with actionable
  instructions if missing.
- Persistence: optional Drizzle adapter (SQLite/Postgres) alongside current in-memory storage.
- Iteration hygiene: make `app/` wipe optional (flag) to preserve user-approved changes across runs.
- Observability: write a small JSON summary per stage (status, files, costs) for UI consumption.

---
Glossary: OXC = fast TS/JS linter; Drizzle = type-safe ORM; Zod = runtime validation + types; Writer–Critic = generate
then independently verify.

## Multi‑Page Apps: Plan → Build → Validate (Generic, No Hardcoding)

Goal: support N pages from a single prompt, keep design cohesive, and stay schema‑first. The best way is to make pages
explicit in the plan, add a technical architecture step, then generate pages with writer–critic checks.

- Plan.md (explicit pages and routes)
    - Add a “Pages & Routes” section listing for each page: `route`, `name`, `purpose`, `primary entity`,
      `key components`, `critical states`, `CTAs`.
    - Example (excerpt):
        - “/bookings” → BookingsListPage: list, filter, create; Entity: Booking; Components: Table, Filters, Modal.
        - “/bookings/:id” → BookingDetailPage: read/update; Entity: Booking; Components: Form, Timeline.
    - This remains generic; no app‑specific logic beyond the plan’s content.
- New/updated stages (wiring remains generic):
    1) Technical Architecture Spec (already implemented): insert after Preview.
        - `stages/technical_architecture_spec_stage.run_stage(plan, ui_spec, preview, output="plan/")` →
          `technical-architecture-spec.md` with exact route map, page component list, and API mapping per entity.
    2) Page Generation Stage (new orchestrator):
        - Input: `technical-architecture-spec.md`, `shared/schema.ts`, `design-system/`, and route list.
        - Output: `client/src/pages/<PageName>.tsx` for each page; common `AppLayout.tsx` used by all pages.
        - Process: writer–critic loop per page (PageWriter → PageCritic) to ensure: file exists, imports from
          `@shared/schema`, uses design tokens/ShadCN, OXC clean, basic navigation present.
    3) App Shell update:
        - AppShellWriter reads the route map and wires Wouter routes for every page (no hardcoded routes). Critic
          verifies pages are imported and paths match the spec.
- Preview strategy (single preview only)
    - Keep the preview as an initial look‑and‑feel artifact to align on color, typography, spacing, and basic
      interaction patterns.
    - After approval, do NOT generate multi‑page previews. Proceed directly to multi‑page code generation using the
      design system and tech spec.
    - If a follow‑up prompt changes only visual themes (tokens), optionally regenerate the single preview or a
      lightweight “style snapshot” (palette + components) for review; skip page‑level previews by default.
- Consistent UI/UX at scale
    - Design System: keep tokens in `design-system/` authoritative (Tailwind config + globals.css + tokens.ts). Page
      Writers must import components from the shared UI kit and avoid hardcoded colors.
    - Layout: generate a shared `client/src/components/layout/AppLayout.tsx` and wrap all pages. Enforce via Critic (
      tree‑sitter checks for `AppLayout` usage).
    - UI Consistency Critic (lightweight): scan `client/src/pages/**/*.tsx` for token usage, typography scale, spacing
      system, and ShadCN primitives; fail on inline styles or raw hex colors.
- Validation changes
    - Extend Validator to smoke‑test multiple routes (if build passes): open root, navigate to two random routes, assert
      no console errors.
    - Keep fast loops: OXC → build → (optional) browser checks.
- Happy Llama UX and incremental prompts
    - After approval, full app generates. Subsequent prompts update `plan.md` → re‑generate
      `technical-architecture-spec.md` → compute diff of pages (added/modified/removed) → run Page Generation only for
      impacted pages and update AppShell routing. Preserve unchanged pages.
- Minimal code touchpoints to enable
    - Call `technical_architecture_spec_stage.run_stage(...)` after Preview (files exist already).
    - Add `pages_stage.run_stage(...)` orchestrating per‑page Writer–Critic using the route list in tech spec. Use
      existing agents as building blocks (`multi_page_generator`, `sequential_page_generator`, or create a small
      orchestrator around per‑page writers).
    - Update App Shell generator prompt to read the route list rather than assume a single HomePage.
      This approach remains generic: all concrete pages and routes originate from the plan and the generated technical
      architecture, not hardcoded logic. The shared schema (Drizzle + Zod) continues to be the contract each page and
      route compiles against, ensuring zero type drift.

## Low‑Hanging Improvements for Fast, Error‑Free, Delightful Apps

Objective: go from prompt → URL quickly and cleanly, while delivering a consistently stunning UI. Keep it generic,
contract‑first, and rely on quick Writer–Critic loops.

1) Preflight Checks (fail fast, clear messages)

- Verify prerequisites before any heavy step: Node present, OXC available, SSR template cached, vite‑express template
  cached. If missing, return a short, actionable error (paths to fetch/cache).
- Check working `tsconfig` and path aliases (`@shared/*`) exist; if missing, write minimal configs (base + client/server
  extends) during Build stage extraction.

2) Contract‑First Enhancements (type safety everywhere)

- Generate a tiny typed client (`client/src/lib/api.ts`) from Zod schemas: `getAll<Entity>`, `getById`, `create`,
  `update`, `remove` using `insert/update` Zod parsing. Page Writers import this instead of ad‑hoc fetch.
- Critic rule: routes must import relevant Zod schemas from `@shared/schema` and validate requests on POST/PATCH.

3) Routing & Aliases (eliminate “cannot find module”)

- Standardize `tsconfig.base.json` with `paths` for `@shared/*`, `@/components/*`, `@/lib/*`; have
  `client/tsconfig.json` and `server/tsconfig.json` extend the base; align `vite.config.ts` alias.
- Critic rule: fail if `@shared/schema` import fails or if a page uses relative deep imports for shared types.

4) UI Delight Pack (consistent, modern, “wow” factor)

- Design tokens: ensure color, radius, shadow/elevation, spacing, typography scales in `design-system/` are complete and
  referenced via classes/utilities.
- Shared layout: generate `client/src/components/layout/AppLayout.tsx` with header, breadcrumb, consistent container,
  motion-friendly sections. Page Writers must wrap in `AppLayout`.
- Micro‑interactions: default toasts, skeleton loaders, empty states, subtle transitions (Tailwind `transition`,
  `duration-200`, `ease-out`), and focus rings.
- Iconography: enforce `lucide-react` usage; Critic flags raw SVGs without reason.

5) UI Consistency Critic (quick static checks)

- Tree‑sitter/grep checks over `client/src/pages/**/*.tsx`:
    - Disallow inline hex colors and `style={{…}}` for presentational styling (use tokens/utilities).
    - Require imports from ShadCN UI primitives and `AppLayout` wrapper.
    - Enforce minimum skeleton/empty state for list pages (detect `loading`/`error` branches).

6) Preview Strategy (speed over breadth)

- Keep a single initial preview to align on theme and spacing. On approval, skip multi‑page previews entirely and
  proceed to code generation.
- If a follow‑up prompt changes only visuals, regenerate a lightweight “style snapshot” (palette + components) rather
  than per‑page previews.

7) Validator Enhancements (still fast)

- Post‑build smoke test: open root, then navigate to 1–2 routes from the spec (no screenshots), assert no console errors
  and 200 responses on API calls.
- Keep OXC → build → (optional) browser order; bail out early with precise failure categories: LINT_FAIL, COMPILE_FAIL,
  RUNTIME_FAIL.

8) Incremental Updates (prompt in same context)

- When plan/spec changes, compute a page/route diff and run Writer–Critic loops only for impacted pages/routes; keep
  others intact. Rewire App Shell routing from the updated spec.

9) Observability (for Happy Llama UI)

- Emit per‑stage JSON summaries (status, files written, cost, timing, quick tip). Surface in the UI to guide approvals
  and debugging.
  Why these are “low‑hanging”
- They rely on prompts/critics and small template/config touches, not architecture rewrites.
- They shorten the feedback loop (preflights), reduce common TS import errors (aliases), and raise the floor on UI
  quality (layout + tokens + consistency checks) without slowing the path to URL.