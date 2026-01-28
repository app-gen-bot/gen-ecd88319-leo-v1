# Pipeline - Current Implementation

## Executive Summary

The Leonardo App Factory pipeline - current implementation as of 2025-09-26. This document reflects the actual codebase state.

## Current Pipeline

Artifacts are dependency nodes in a graph.
Stages are nodes in a graph that generate groups of artifacts.
Graphs are the most clear about the dependency aspect but can become large trying to show enough detail even with
subgraphs.
We can also flatten into a table, with sub-tables at independent/parallel points.

### Pipeline as Table

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Pipeline: Leonardo App Factory - Current Implementation (2025-09-26)                                 │
├──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Stage                       │ Artifacts In                      │ Artifacts Out                   │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 1. plan                     │ • user_prompt                     │ • plan/plan.md                  │
│                             │                                   │ • plan/_phases/plan-phaseN.md   │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 2. ui-component-spec        │ • plan/plan.md                    │ • plan/ui-component-spec.md     │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 3. design-system            │ • plan/plan.md                    │ • design-system/                │
│                             │                                   │   domain-colors.json            │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 4. preview                  │ • plan/plan.md                    │ • preview-html/preview.html     │
│                             │ • plan/ui-component-spec.md       │ • preview-react/App.tsx         │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5. build                    │ • plan/plan.md                    │ • app/ (full application)       │
│                             │ • preview-react/App.tsx           │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5a. build:template-extract  │ • vite-express-template.tar.gz    │ • app/ (base structure)         │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5b. build:backend-spec      │ • app/specs/plan.md               │ • app/shared/schema.zod.ts      │
│                             │                                   │ • app/shared/contracts/*.ts     │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5c. build:tech-arch-spec    │ • app/specs/plan.md               │ • app/specs/                    │
│                             │ • plan/ui-component-spec.md       │   pages-and-routes.md           │
│                             │ • app/specs/App.tsx               │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5d. build:schema-generator  │ • app/specs/plan.md               │ • app/shared/schema.ts          │
│     (Writer-Critic)         │ • app/specs/App.tsx               │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5e. build:storage-generator │ • app/shared/schema.ts            │ • app/server/storage.ts         │
│     (Writer-Critic)         │                                   │ • app/server/IStorage.ts        │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5f. build:routes-generator  │ • app/shared/schema.ts            │ • app/server/routes.ts          │
│     (Writer-Critic)         │ • app/shared/contracts/*.ts       │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5g. build:api-client        │ • app/shared/contracts/*.ts       │ • app/client/lib/api.ts         │
│     (Writer-Critic)         │                                   │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5h. build:layout-generator  │ • app/specs/pages-and-routes.md   │ • app/client/src/components/    │
│                             │                                   │   layout/*                      │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5i. build:context-providers │ • app/specs/plan.md               │ • app/client/src/lib/           │
│     (Writer-Critic)         │                                   │   contexts/*                    │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5j. build:app-shell         │ • app/specs/pages-and-routes.md   │ • app/client/src/App.tsx        │
│     (Writer-Critic)         │                                   │                                 │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5k. build:homepage          │ • app/specs/plan.md               │ • app/client/src/pages/         │
│     (Writer-Critic)         │ • app/specs/pages-and-routes.md   │   HomePage.tsx                  │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 5l. build:page-orchestrator │ • app/specs/pages-and-routes.md   │ • app/client/src/pages/*.tsx    │
│                             │                                   │   (all remaining pages)         │
├─────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ 6. validator                │ • app/ (complete application)     │ • validation status             │
│    (Fixer-Validator loop)   │                                   │   (oxc, build, browser tests)   │
└─────────────────────────────┴───────────────────────────────────┴─────────────────────────────────┘
```

## Stage Details

### Stage 1: Plan

**Purpose**: Convert user prompt into structured application plan with phase breakdown

**Location**: `src/app_factory_leonardo_replit/stages/plan_stage.py`

```
Input:  user_prompt (string)
Agent:  plan_orchestrator
Output: plan/plan.md, plan/_phases/plan-phaseN.md
```

**Implementation Notes**:
- Orchestrator agent generates comprehensive plan
- Automatically extracts phases from plan content
- Phase 1 copied to visible `plan.md`, all phases stored in `_phases/`
- Supports skip_questions mode for automated generation

### Stage 2: UI Component Spec

**Purpose**: Generate UI/UX component specification optimized for preview generation

**Location**: `src/app_factory_leonardo_replit/stages/stage_1_ui_component_spec.py`

```
Input:  plan/plan.md
Agent:  UIComponentSpecAgent
Output: plan/ui-component-spec.md
```

**Implementation Notes**:
- Lighter-weight alternative to full FIS
- Focuses on visual components, states, and patterns
- Phase-aware generation (can focus on Phase 1 only)
- Used by preview and design system stages

### Stage 3: Design System

**Purpose**: Detect domain and apply semantic color palette

**Location**: `src/app_factory_leonardo_replit/stages/design_system_stage.py`

```
Input:  plan/plan.md
Logic:  Domain keyword detection
Output: design-system/domain-colors.json
```

**Implementation Notes**:
- Detects domain from keywords (wedding, ecommerce, healthcare, saas, blog, education)
- Applies 3 semantic colors: app-primary, app-accent, app-emotion
- No agent required - pure logic-based color selection
- Colors injected into template CSS during build stage

### Stage 4: Preview

**Purpose**: Generate HTML preview and React component from plan

**Location**: `src/app_factory_leonardo_replit/stages/preview_stage.py`

```
Input:  plan/plan.md, plan/ui-component-spec.md
Agent:  PreviewGeneratorAgent
System: React-to-Static SSR renderer
Output: preview-html/preview.html, preview-react/App.tsx
```

**Implementation Notes**:
- Two-step process: AI generates React, SSR converts to HTML
- React component serves as foundation for build stage
- Preview HTML allows user validation before full build

### Stage 5: Build

**Purpose**: Complete application generation with Writer-Critic loops

**Location**: `src/app_factory_leonardo_replit/stages/build_stage.py`

This stage orchestrates multiple sub-stages:

#### 5a. Template Extract
```
Input:  vite-express-template-v2.1.1-2025.tar.gz
Output: app/ (base Vite+Express structure)
```

#### 5b. Backend Spec
```
Input:  app/specs/plan.md
Agents: Schema Designer, Contracts Designer (Writer-Critic)
Output: app/shared/schema.zod.ts, app/shared/contracts/*.ts
```

#### 5c. Technical Architecture Spec
```
Input:  app/specs/plan.md, plan/ui-component-spec.md, app/specs/App.tsx
Agent:  TechnicalArchitectureSpecAgent
Output: app/specs/pages-and-routes.md
```

#### 5d-5k. Writer-Critic Loops
Each agent follows Writer-Critic pattern with max 40 iterations:
- **Schema Generator**: Drizzle schema from plan + React component
- **Storage Generator**: IStorage interface + MemStorage implementation
- **Routes Generator**: Express routes with ts-rest contracts
- **API Client Generator**: Type-safe frontend API client
- **Layout Generator**: Layout components (Header, Footer, Sidebar)
- **Context Providers Generator**: React contexts for state management
- **App Shell Generator**: Main App.tsx with routing
- **HomePage Generator**: Landing page component

#### 5l. Page Orchestrator
```
Input:  app/specs/pages-and-routes.md
Agent:  PageGeneratorOrchestrator
Output: app/client/src/pages/*.tsx (all pages except HomePage)
```

**Implementation Notes**:
- Never Broken Principle: Pipeline stops on first critical failure
- Each Writer self-tests with OXC linting and TypeScript compilation
- Each Critic independently validates and decides continue/complete
- Critical agents: Schema, Storage, Routes, API Client, Layout, Context, App Shell
- Non-critical agents: HomePage, Page Orchestrator

### Stage 6: Validator

**Purpose**: Final validation ensuring app compiles and works

**Location**: `src/app_factory_leonardo_replit/stages/validator_stage.py`

```
Input:  app/ (complete application)
Agents: AppFixerAgent (Writer), AppValidatorCritic
Tests:  OXC linting, TypeScript build, Browser validation
Output: Validation status (PASS/FAIL for each test)
```

**Implementation Notes**:
- Fixer-Validator loop (max 3 iterations by default)
- Fixer agent runs tests internally and fixes issues
- Validator critic verifies all tests pass
- Tests: oxc (linting), build (TypeScript), browser (runtime)
- Pipeline only succeeds when all tests PASS

## Generated Application Structure

```
apps/[app-name]/
├── plan/                           # Stage 1-2 outputs
│   ├── plan.md                     # Visible plan (current phase)
│   ├── ui-component-spec.md        # UI component specification
│   ├── tech_stack.md               # Tech stack reference (template)
│   └── _phases/                    # Hidden phase storage
│       ├── plan-full.md            # Complete multi-phase plan
│       ├── plan-phase1.md          # Phase 1 plan
│       ├── plan-phase2.md          # Phase 2 plan
│       └── ...
├── design-system/                  # Stage 3 outputs
│   └── domain-colors.json          # Detected domain and semantic colors
├── preview-html/                   # Stage 4 outputs
│   └── preview.html                # Static HTML preview
├── preview-react/                  # Stage 4 outputs
│   └── App.tsx                     # React preview component
└── app/                            # Stage 5 outputs (full application)
    ├── _planning/                  # Backup of all phase plans
    ├── specs/                      # Internal specs for agents
    │   ├── plan.md                 # Current phase plan
    │   ├── App.tsx                 # Preview React component
    │   └── pages-and-routes.md     # Technical architecture spec
    ├── shared/                     # Shared code (backend + frontend)
    │   ├── schema.zod.ts           # Zod schemas (source of truth)
    │   ├── schema.ts               # Drizzle schema (generated)
    │   └── contracts/              # API contracts (ts-rest)
    │       ├── *.contract.ts
    │       └── ...
    ├── server/                     # Backend code
    │   ├── storage.ts              # Storage implementation
    │   ├── IStorage.ts             # Storage interface
    │   └── routes.ts               # Express routes
    └── client/                     # Frontend code
        ├── src/
        │   ├── App.tsx             # App shell with routing
        │   ├── main.tsx            # Entry point
        │   ├── components/
        │   │   └── layout/         # Layout components
        │   ├── pages/              # Page components
        │   │   ├── HomePage.tsx
        │   │   └── ...
        │   └── lib/
        │       ├── api.ts          # Type-safe API client
        │       └── contexts/       # React contexts
        ├── index.html
        ├── vite.config.ts
        └── tailwind.config.js      # With domain colors
```