# Leonardo Replit Pipeline Workflow & Artifacts

## Pipeline Overview

The enhanced Leonardo Replit pipeline transforms user prompts into fully functional applications through a series of stages, each producing specific artifacts that feed into subsequent stages.

## Stage-by-Stage Workflow

### Stage 1: Plan Generation

**Purpose**: Transform user prompt into structured application plan with micro-documents

**Inputs**:
- User prompt (string)
- App name (optional)

**Outputs**:
```
apps/[app-name]/plan/
├── plan.md                    # Main plan document (60-80 lines)
├── features.json              # Structured feature inventory
├── user_journeys.md           # User flow descriptions (20-30 lines)
├── page_inventory.md          # Route mapping (10-15 lines)
└── experience_rails.md        # UX guidelines (15-20 lines)
```

**Agent**: `PlanOrchestratorAgent`

**Key Transformations**:
- Natural language → Structured plan
- Implicit requirements → Explicit features
- Vague ideas → Concrete user journeys
- Abstract concepts → Specific pages/routes

---

### Stage 2: Preview Generation

**Purpose**: Create visual preview and extract component patterns

**Inputs**:
- `plan/plan.md`
- `plan/features.json`
- `plan/page_inventory.md`

**Outputs**:
```
apps/[app-name]/preview-html/
├── preview.html               # Static HTML preview

apps/[app-name]/preview-react/
├── App.tsx                    # React component preview
├── component_map.json         # Component inventory
├── layout_zones.md            # Layout patterns (15-20 lines)
└── interaction_hints.json     # Detected interactions
```

**Agent**: `PreviewGeneratorAgent`

**Key Transformations**:
- Plan text → Visual HTML/React
- Features → UI components
- User journeys → Interactive elements
- Abstract layouts → Concrete zones

---

### Stage 3: Documentation Generation (NEW)

**Purpose**: Generate focused micro-documents for each page and backend component

**Inputs**:
- `plan/*` (all plan artifacts)
- `preview-react/component_map.json`
- `preview-react/layout_zones.md`
- `preview-react/interaction_hints.json`

**Outputs**:
```
apps/[app-name]/docs/
├── pages/
│   ├── HomePage.md            # Home page brief (30-40 lines)
│   ├── BookingFlowPage.md     # Booking page brief
│   ├── DashboardPage.md       # Dashboard brief
│   └── [PageName].md          # Other page briefs
└── backend/
    ├── routes_spec.md         # API specifications (40-50 lines)
    ├── storage_spec.md        # CRUD operations (30-40 lines)
    └── schema_hints.md        # Data relationships (20-30 lines)
```

**Agent**: `DocsGeneratorAgent` (to be created)

**Key Transformations**:
- Component map → Page structures
- Features → API endpoints
- User journeys → Data operations
- Interaction hints → Event handlers

---

### Stage 4: Build Stage (Multi-sub-stage)

**Purpose**: Generate complete application code using focused documents

#### Sub-stage 4.1: Template Extraction

**Inputs**:
- Template archive (`vite-express-template-v2.1.0.tar.gz`)

**Outputs**:
```
apps/[app-name]/app/
├── client/                    # Next.js frontend structure
├── server/                    # Express backend structure
└── shared/                    # Shared types directory
```

**Process**: Direct file extraction

---

#### Sub-stage 4.2: Schema Generation

**Inputs**:
- `docs/backend/schema_hints.md`
- `plan/features.json`

**Outputs**:
- `app/shared/schema.ts` (100-200 lines)

**Agent**: `SchemaGeneratorAgent` with `SchemaGeneratorCritic`

**Key Transformations**:
- Data hints → TypeScript interfaces
- Features → Entity definitions
- Relationships → Type references

---

#### Sub-stage 4.3: Storage Generation

**Inputs**:
- `app/shared/schema.ts`
- `docs/backend/storage_spec.md`

**Outputs**:
- `app/server/storage.ts` (200-300 lines)

**Agent**: `StorageGeneratorAgent` with `StorageGeneratorCritic`

**Key Transformations**:
- Schema types → CRUD functions
- Storage specs → Data persistence logic
- Operations → Database queries

---

#### Sub-stage 4.4: Routes Generation

**Inputs**:
- `app/shared/schema.ts`
- `app/server/storage.ts`
- `docs/backend/routes_spec.md`

**Outputs**:
- `app/server/routes.ts` (150-250 lines)

**Agent**: `RoutesGeneratorAgent` with `RoutesGeneratorCritic`

**Key Transformations**:
- Route specs → Express endpoints
- Storage functions → API handlers
- Schema → Request/response validation

---

#### Sub-stage 4.5: App Shell Generation

**Inputs**:
- `preview-react/layout_zones.md`
- `plan/experience_rails.md`

**Outputs**:
- `app/client/src/App.tsx` (100-150 lines)

**Agent**: `AppShellGeneratorAgent` with `AppShellGeneratorCritic`

**Key Transformations**:
- Layout zones → React components
- Experience rails → Loading/error states
- Navigation → Router setup

---

#### Sub-stage 4.6: Page Generation

**Inputs**:
- `docs/pages/HomePage.md` (or specific page brief)
- `app/shared/schema.ts`
- `preview-react/App.tsx`

**Outputs**:
- `app/client/src/pages/HomePage.tsx` (200-300 lines)
- `app/client/src/pages/[PageName].tsx`

**Agent**: `MainPageGeneratorAgent` with `MainPageGeneratorCritic`

**Key Transformations**:
- Page brief → React component
- Actions → Event handlers
- API specs → Data fetching
- States → Conditional rendering

---

### Stage 5: Validation

**Purpose**: Ensure generated application is functional and meets requirements

**Inputs**:
- Complete `app/` directory

**Outputs**:
- Validation report
- Fixed/updated files (if needed)
- Success/failure status

**Agent**: `AppValidatorCritic` with `AppFixerAgent`

**Validation Steps**:
1. Syntax validation (oxc)
2. Build test (npm run build)
3. Type checking (TypeScript)
4. Browser test (if enabled)
5. API endpoint verification

---

## Artifact Flow Diagram

```
User Prompt
    ↓
[Stage 1: Plan]
    ├── plan.md
    ├── features.json
    ├── user_journeys.md
    ├── page_inventory.md
    └── experience_rails.md
         ↓
[Stage 2: Preview]
    ├── preview.html
    ├── App.tsx
    ├── component_map.json
    ├── layout_zones.md
    └── interaction_hints.json
         ↓
[Stage 3: Docs]
    ├── pages/*.md (30-40 lines each)
    └── backend/*.md (20-50 lines each)
         ↓
[Stage 4: Build] ← Reads specific docs per agent
    ├── schema.ts ← (schema_hints.md, features.json)
    ├── storage.ts ← (schema.ts, storage_spec.md)
    ├── routes.ts ← (schema.ts, routes_spec.md)
    ├── App.tsx ← (layout_zones.md, experience_rails.md)
    └── HomePage.tsx ← (HomePage.md, schema.ts)
         ↓
[Stage 5: Validate]
    └── Complete Application
```

## Document Size Comparison

### Current Approach (Monolithic)
- **plan.md**: 33 lines
- **Total context per agent**: ~500-1000 tokens
- **Repeated reading**: Same plan 6+ times

### Enhanced Approach (Micro-docs)
- **Total documents**: 15-20 files
- **Average document size**: 20-40 lines
- **Context per agent**: 200-300 tokens
- **Targeted reading**: Each agent reads 2-3 relevant docs

## Parallel Generation Opportunities

With micro-documents, these can run in parallel:

**Parallel Group 1** (after Stage 3):
- Schema Generation
- App Shell Generation

**Parallel Group 2** (after Schema):
- Storage Generation
- All Page Components

**Parallel Group 3** (after Storage):
- Routes Generation
- Additional Components

## Benefits Summary

1. **Reduced Context**: 60-70% reduction in tokens per agent
2. **Cost Savings**: ~60% reduction in API costs
3. **Speed**: 2-3x faster with parallelization
4. **Quality**: More focused = better outputs
5. **Debugging**: Clear artifact trail
6. **Maintainability**: Modular document structure

## Implementation Priority

1. **Phase 1**: Enhanced Plan Generation (High Impact)
2. **Phase 2**: Documentation Stage (Critical)
3. **Phase 3**: Update Build Agents (Incremental)
4. **Phase 4**: Preview Enhancement (Nice to have)
5. **Phase 5**: Parallel Generation (Future optimization)