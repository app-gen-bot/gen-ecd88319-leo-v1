# Pipeline

## Executive Summary

The Leonardo App Factory pipeline that implements the "Holy Grail" architecture - a schema-first, contract-first
approach that enables fully autonomous app generation with compile-time type safety from database to UI.

## Current Pipeline (BEFORE)

Artifacts are dependency nodes in a graph.
Stages are nodes in a graph that generate groups of artifacts.
Graphs are the most clear about the dependency aspect but can become large trying to show enough detail even with
subgraphs.
We can also flatten into a table, with sub-tables at independent/parallel points.

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Pipeline: Leonardo App Factory v1                                                         │
├───────────────────────────────────────────────────────────────────────────────────────────┤
│ Stage                    │ Artifacts In                      │ Artifacts Out              │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 1. Plan                  │ • user_prompt                     │ • plan.md                  │
│                          │                                   │                            │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 2. UI Component Spec     │ • plan.md                         │ • ui-component-spec.md     │
│                          │                                   │                            │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 3. Design System         │ • plan.md                         │ • tailwind.config          │
│                          │ • ui-component-spec.md            │ • globals.css              │
│                          │                                   │ • design-tokens            │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 4. Preview               │ • plan.md                         │ • preview.html             │
│                          │ • design-system/*                 │ • App.tsx                  │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 5. Build                 │ • plan.md                         │ • schema.ts                │
│                          │ • App.tsx                         │ • storage/*                │
│                          │                                   │ • routes/*                 │
│                          │                                   │ • apiClient.ts             │
│                          │                                   │ • contexts/*               │
│                          │                                   │ • layout.tsx               │
│                          │                                   │ • _app.tsx                 │
│                          │                                   │ • page.tsx                 │
│                          │                                   │ • pages/*                  │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────┤
│ 6. Validator             │ • app/*                           │ • validation report        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

## Stage Details

### Stage: Plan

**Purpose**: Convert user prompt into structured application plan

```
Input:  user_prompt
Agent:  plan_orchestrator
Output: plan/plan.md
```

### Stage: UI Component Spec

**Purpose**: Define UI components and interactions from plan

```
Input:  plan/plan.md
Agent:  stage_1_ui_component_spec
Output: plan/ui-component-spec.md
```

### Stage: Design System

**Purpose**: Generate design tokens and styling configuration

```
Input:  plan/plan.md, plan/ui-component-spec.md
Agent:  design_system
Output: design-system/tailwind.config.ts, design-system/globals.css, design-system/design-tokens.json
```

**Implementation Notes**:

- Tailwind-based design system
- Consistent color palette and typography
- Design tokens for reusability

### Stage: Preview

**Purpose**: Generate interactive preview of UI

```
Input:  plan/plan.md, design-system/*
Agent:  preview_generator
Output: preview-html/preview.html, preview-react/App.tsx
```

**Implementation Notes**:

- Static preview with design system applied
- React preview shows component structure
- Validates UI feasibility before build

### Stage: Build

**Purpose**: Generate complete full-stack application

```
Input:  plan/plan.md, preview-react/App.tsx
Agents: schema_generator, storage_generator, routes_generator, api_client_generator,
        context_provider_generator, app_shell_generator, layout_generator, 
        main_page_generator, page_generator
Output: app/shared/schema/schema.ts, app/server/storage/*, app/server/routes/*,
        app/client/api/apiClient.ts, app/client/contexts/*, app/client/layout.tsx,
        app/client/_app.tsx, app/client/page.tsx, app/client/pages/*
```

**Implementation Notes**:

- Schema-first approach with TypeScript types
- Storage abstraction (MemStorage for dev, PostgresStorage for prod)
- RESTful Express routes
- TanStack Query for data fetching
- Writer-Critic pattern ensures validation passes

### Stage: Validator

**Purpose**: Comprehensive validation of generated application

```
Input:  app/*
Agent:  app_validator
Output: validation-report.md
```

**Implementation Notes**:

- OXC linting for type safety
- Build verification
- Test execution
- Ensures "Never Broken" principle

## Generated Application Structure

```
apps/[app-name]/
├── plan/
│   ├── plan.md
│   └── ui-component-spec.md
├── design-system/
│   ├── tailwind.config.ts
│   ├── globals.css
│   └── design-tokens.json
├── preview-html/
│   └── preview.html
├── preview-react/
│   └── App.tsx
└── app/
    ├── shared/
    │   └── schema/
    │       └── schema.ts
    ├── client/
    │   ├── api/
    │   │   └── apiClient.ts
    │   ├── contexts/
    │   ├── pages/
    │   ├── components/
    │   ├── layout.tsx
    │   ├── _app.tsx
    │   └── page.tsx
    └── server/
        ├── storage/
        │   ├── IStorage.ts
        │   ├── MemStorage.ts
        │   └── PostgresStorage.ts
        └── routes/
```