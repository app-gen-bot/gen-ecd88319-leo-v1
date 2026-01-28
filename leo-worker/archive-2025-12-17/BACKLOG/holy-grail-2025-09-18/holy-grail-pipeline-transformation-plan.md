# Holy Grail Pipeline Transformation Plan

## Executive Summary

Transform the Leonardo App Factory pipeline to implement the "Holy Grail" architecture - a schema-first, contract-first
approach that enables fully autonomous app generation with compile-time type safety from database to UI.

## Current Pipeline (BEFORE)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Pipeline: Leonardo App Factory v1                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Stage                    │ Artifacts In                      │ Agents                         │ Artifacts Out     │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 1. Plan                  │ • user_prompt                     │ • plan_orchestrator            │ • plan.md         │
│                          │                                   │                                │                   │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 2. UI Component Spec     │ • plan.md                         │ • stage_1_ui_component_spec    │ • ui-component-   │
│                          │                                   │                                │   spec.md         │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 3. Design System         │ • plan.md                         │ • design_system                │ • tailwind.config │
│                          │ • ui-component-spec.md            │                                │ • globals.css     │
│                          │                                   │                                │ • design-tokens   │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 4. Preview               │ • plan.md                         │ • preview_generator            │ • preview.html    │
│                          │ • design-system/*                 │                                │ • App.tsx         │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 5. Build                 │ • plan.md                         │ • schema_generator             │ • schema.ts       │
│                          │ • App.tsx                         │ • storage_generator            │ • storage/*       │
│                          │                                   │ • routes_generator             │ • routes/*        │
│                          │                                   │ • api_client_generator         │ • apiClient.ts    │
│                          │                                   │ • context_provider_generator  │ • contexts/*      │
│                          │                                   │ • app_shell_generator          │ • layout.tsx      │
│                          │                                   │ • layout_generator             │ • _app.tsx        │
│                          │                                   │ • main_page_generator          │ • page.tsx        │
│                          │                                   │ • page_generator               │ • pages/*         │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 6. Validator             │ • app/*                           │ • app_validator/critic         │ • validation      │
│                          │                                   │                                │   report          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Proposed Pipeline (AFTER)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Pipeline: Leonardo App Factory v2 - Holy Grail Architecture                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Stage                    │ Artifacts In                      │ Agents                         │ Artifacts Out     │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 1. Plan                  │ • user_prompt                     │ • plan_orchestrator            │ • plan.md         │
│                          │                                   │   (unchanged)                  │                   │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 2. Backend Spec          │ • plan.md                         │ • schema_designer (NEW)        │ • schema.zod.ts   │
│                          │                                   │ • contracts_designer (NEW)     │ • contracts/*.ts  │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 3. Backend               │ • schema.zod.ts                   │ • drizzle_schema_generator     │ • schema/*        │
│    Implementation        │ • contracts/*.ts                  │   (MODIFIED)                   │ • storage/*       │
│                          │                                   │ • storage_generator            │ • routes/*        │
│                          │                                   │   (unchanged)                  │ • openapi.json    │
│                          │                                   │ • ts_rest_contracts_generator  │                   │
│                          │                                   │   (NEW)                        │                   │
│                          │                                   │ • express_routes_generator     │                   │
│                          │                                   │   (MODIFIED)                   │                   │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 4. Frontend Spec (FIS)   │ • plan.md                         │ • frontend_interaction_spec    │ • pages/*.fis.    │
│                          │ • contracts/*.ts                  │   _generator (NEW)             │   yaml            │
│                          │ • ui-component-spec.md            │                                │                   │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 5. Frontend              │ • pages/*.fis.yaml                │ • api_hooks_generator (NEW)    │ • api/*           │
│    Implementation        │ • contracts/*.ts                  │ • page_scaffolder (MODIFIED)   │ • pages/*         │
│                          │ • schema.zod.ts                   │ • component_generator          │ • components/*    │
│                          │                                   │   (unchanged)                  │ • msw-handlers.ts │
├──────────────────────────┼───────────────────────────────────┼────────────────────────────────┼───────────────────┤
│ 6. Validator             │ • app/*                           │ • app_validator (ENHANCED)     │ • validation      │
│                          │ • contracts/*.ts                  │                                │   report          │
│                          │ • pages/*.fis.yaml                │                                │                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Stage Details

### Stage: Plan (Unchanged)

**Purpose**: Convert user prompt into structured application plan
**Changes**: None - existing stage works well

```
Input:  user_prompt
Agent:  plan_orchestrator
Output: plan/plan.md
```

### Stage: Backend Spec (NEW)

**Purpose**: Define data models and API contracts as source of truth

```
Input:  plan/plan.md
Agents: 
  → schema_designer
    Output: specs/schema.zod.ts (Zod schemas for all entities)
  → contracts_designer  
    Output: specs/contracts/*.contract.ts (ts-rest contracts)
```

**Implementation Notes**:

- Zod schemas become single source of truth
- Contracts reference Zod schemas for type safety
- Both human and machine readable

### Stage: Backend Implementation

**Purpose**: Generate working backend from specifications

```
Input:  specs/schema.zod.ts, specs/contracts/*.ts
Agents:
  → drizzle_schema_generator (MODIFIED)
    Input:  specs/schema.zod.ts
    Output: app/shared/schema/tables.ts (Drizzle tables from Zod)
  
  → storage_generator (unchanged)
    Input:  app/shared/schema/tables.ts
    Output: app/server/storage/IStorage.ts, MemStorage.ts, PostgresStorage.ts
  
  → ts_rest_contracts_generator (NEW)
    Input:  specs/contracts/*.ts, app/server/storage/*
    Output: app/server/contracts/* (server contract implementations)
  
  → express_routes_generator (MODIFIED)
    Input:  app/server/contracts/*
    Output: app/server/routes/*, generated/openapi.json
```

**Implementation Notes**:

- Drizzle schemas derived from Zod using drizzle-zod
- Storage layer remains abstracted (Mem/Postgres)
- Express routes use ts-rest for type safety
- OpenAPI generated automatically

### Stage: Frontend Spec (FIS)

**Purpose**: Extend UI specs with data bindings

```
Input:  plan/plan.md, specs/contracts/*.ts, plan/ui-component-spec.md
Agent:  frontend_interaction_spec_generator (NEW)
Output: specs/pages/*.fis.yaml
```

**FIS Format Example**:

```yaml
route: "/workouts/:id"
page: "WorkoutDetail"
data:
  queries:
    - id: workout
      bind:
        contract: "workouts.getWorkout"
        hook: "api.workouts.getWorkout.useQuery"
        params: { path: { id: ":id" } }
  mutations:
    - id: startSession
      bind:
        contract: "sessions.createSession"
        hook: "api.sessions.createSession.useMutation"
ui:
  components: [ ...existing UI spec format... ]
```

### Stage: Frontend Implementation

**Purpose**: Generate type-safe frontend with data bindings

```
Input:  specs/pages/*.fis.yaml, specs/contracts/*.ts, specs/schema.zod.ts
Agents:
  → api_hooks_generator (NEW)
    Input:  specs/contracts/*.ts
    Output: app/client/api/* (TanStack Query hooks), generated/msw-handlers.ts
  
  → page_scaffolder (MODIFIED)
    Input:  specs/pages/*.fis.yaml, app/client/api/*
    Output: app/client/pages/* (pages with data bindings)
  
  → component_generator (unchanged)
    Input:  specs/pages/*.fis.yaml
    Output: app/client/components/*
```

**Implementation Notes**:

- Auto-generated hooks from contracts
- Pages use hooks specified in FIS
- MSW handlers for development/testing
- No manual fetch() calls

### Stage: Validator

**Purpose**: Comprehensive validation of generated application

```
Input:  app/*, specs/contracts/*.ts, specs/pages/*.fis.yaml
Agent:  app_validator (ENHANCED)
Output: validation-report.md
```

**Enhanced Validations**:

- Contract conformance testing
- FIS binding validation
- Type safety verification
- MSW mock testing
- End-to-end type checking

## Implementation Phases

### Phase 1: Contract Foundation

**Goal**: Add contract generation without breaking existing pipeline

- Implement schema_designer agent
- Implement contracts_designer agent
- Generate contracts alongside existing artifacts
- Test contract validity

### Phase 2: Hook Generation

**Goal**: Replace manual API client with auto-generated hooks

- Implement api_hooks_generator agent
- Replace api_client_generator
- Generate TanStack Query hooks from contracts
- Update pages to use generated hooks

### Phase 3: Frontend Interaction Spec

**Goal**: Implement data binding layer

- Implement frontend_interaction_spec_generator
- Extend UI component spec with data bindings
- Update page_scaffolder to use FIS
- Validate bindings match contracts

### Phase 4: Full Schema-First Flow

**Goal**: Complete transformation to Holy Grail architecture

- Make Zod schemas the source of truth
- Derive all types from Zod
- Remove redundant type definitions
- Full end-to-end type safety

## Benefits

### Type Safety

- Compile-time guarantees from database to UI
- No runtime type errors
- Automatic type inference

### Development Speed

- Codegen eliminates boilerplate
- Parallel frontend/backend development with mocks
- Fast iteration with hot reload

### Quality Assurance

- "Never Broken" principle maintained
- Contract validation prevents drift
- Automated testing with MSW

### Autonomy

- Agents have clear specifications
- Less ambiguity in generation
- Higher success rate

## Success Metrics

- **Type Coverage**: 100% type safety from DB to UI
- **Generation Time**: < 5 minutes for full app
- **First-Run Success**: > 90% apps work without fixes
- **Code Quality**: All generated code passes linting
- **Test Coverage**: Auto-generated tests for all endpoints

## Migration Strategy

### Backward Compatibility

- Existing pipeline continues to work
- New stages added incrementally
- Gradual replacement of old agents

### Risk Mitigation

- Each phase independently testable
- Rollback points at each phase
- A/B testing old vs new pipeline

### Timeline Estimate

- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 1 week
- Total: ~5 weeks

## Appendix: File Structure Comparison

### Current Structure

```
apps/[app-name]/
├── plan/
│   ├── plan.md
│   └── ui-component-spec.md
├── design-system/
├── preview-html/
├── preview-react/
└── app/
    ├── client/
    └── server/
```

### New Structure

```
apps/[app-name]/
├── plan/
│   └── plan.md
├── specs/
│   ├── schema.zod.ts
│   ├── contracts/
│   │   ├── users.contract.ts
│   │   ├── workouts.contract.ts
│   │   └── ...
│   └── pages/
│       ├── home.fis.yaml
│       ├── workout-detail.fis.yaml
│       └── ...
├── app/
│   ├── shared/
│   │   ├── schema/
│   │   └── contracts/
│   ├── client/
│   │   ├── api/          (generated hooks)
│   │   ├── pages/        (data-bound)
│   │   └── components/
│   └── server/
│       ├── storage/
│       ├── contracts/
│       └── routes/
└── generated/
    ├── openapi.json
    └── msw-handlers.ts
```

## Next Steps

1. Review and approve this plan
2. Create Phase 1 implementation tasks
3. Set up test harness for validation
4. Begin schema_designer agent implementation