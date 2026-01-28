# AI App Factory Workflow

## Complete Pipeline

```
┌─────────────────┐
│   User Prompt   │ "I want a Slack clone for my team"
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Stage 0  │ PRD Generation (Orchestrator) Single conversation to extract requirements
    └────┬─────┘
         │
┌────────▼────────┐
│  Business PRD   │ What the application should do
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Stage 1  │ Generate Frontend Interaction Spec
    └────┬─────┘
         │
┌────────▼────────┐
│Interaction Spec │ How users interact with features
└────────┬────────┘
         │
         │    ┌─────────────────────┐
         │    │Technical Impl Spec  │ Standard patterns (shared)
         │    └──────────┬──────────┘
         │               │
    ┌────▼───────────────▼─┐
    │      Stage 2         │ Generate Visual Wireframe
    │ (Critic-Writer-Judge)│ Iterative refinement loops
    └──────────┬───────────┘
               │
┌──────────────▼──────────┐
│   Next.js Wireframe     │ Complete UI implementation
└─────────────────────────┘
         │
    ┌────▼─────┐
    │ Stage 3  │ Extract Technical Specifications
    └────┬─────┘
         │
┌────────▼────────┐
│ Technical Specs │ Frontend, API, Data Models
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Stage 4  │ Generate Backend Implementation
    └────┬─────┘
         │
┌────────▼────────┐
│FastAPI Backend  │ Complete API with business logic
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Stage 5  │ Deploy to AWS (Future)
    └────┬─────┘
         │
┌────────▼────────┐
│  Live App URL   │ https://app.example.com
└─────────────────┘
```

## Standard Resources

The following resources are shared across all projects:
- **Technical Implementation Spec**: `/docs/ai-app-factory/technical-implementation-spec.md`
- **Opinionated Patterns**: `/docs/ai-app-factory/opinionated-patterns.md`

## Detailed Stages

### Stage 0: PRD Generation (Orchestrator Conversation)
**Input**: User prompt  
**Output**: Business PRD  

The orchestrator engages in a brief conversation to understand:
- Core features needed
- Target users
- Scale requirements
- Any specific constraints

### Stage 1: PRD to Frontend Interaction Spec
**Input**: Business PRD  
**Output**: Frontend Interaction Specification  

Generator agent creates:
- Complete interaction flows
- All user-facing features
- Navigation paths
- Error states

QC agent ensures:
- Every PRD feature has UI
- Standard patterns included (logout, settings, etc.)
- Interaction completeness

### Stage 2: Interaction Spec + Technical Spec to Wireframe (Critic-Writer-Judge Pattern)
**Input**: Frontend Interaction Spec + Standard Technical Implementation Spec  
**Output**: Next.js application with ShadCN UI  

The Technical Implementation Spec is a standard document that defines:
- Authentication patterns (token storage, session management)
- Error handling patterns (HTTP status codes, UI feedback)  
- State management patterns (contexts, hooks)
- API integration patterns (client structure, interceptors)

**Stage 2 Phases:**

**Phase 1: Initial Creation (Writer)**
- Creates baseline Next.js wireframe from specs
- Implements all specified interactions
- Uses ShadCN components for beautiful dark mode UI
- Includes proper auth flow and error handling
- Runs build/test/verify tools

**Phase 2: Spec Fidelity Loop (Critic-Writer-Judge)**
- **Critic**: Evaluates code against interaction spec
  - Uses integration analyzer to focus on changed files
  - Checks interaction coverage and completeness
  - Identifies missing features and discrepancies
- **Writer**: Fixes spec compliance issues
  - Addresses gaps identified in fidelity report
  - Ensures all interactions work correctly
- **Judge**: Decides if spec compliance is sufficient
  - Reviews both report and updated code
  - Determines if ready for quality phase

**Phase 3: Code Quality Loop (Critic-Writer-Judge)**
- **Critic**: Evaluates code quality and patterns
  - Validates technical pattern compliance
  - Checks responsive design and performance
  - Identifies code duplication and complexity
- **Writer**: Refactors for quality improvements
  - Improves code maintainability
  - Optimizes component structure
- **Judge**: Decides if quality standards are met
  - Reviews both report and refactored code
  - Determines if ready for completion

**Phase 4: Retrospective**
- Analyzes workflow effectiveness
- Suggests prompt improvements
- Recommends config changes
- Stores learnings for future runs

### Stage 3: Wireframe to Technical Specs
**Input**: Implemented wireframe  
**Output**: Frontend Spec, API Contract, Data Models  

Frontend extractor:
- Documents all components
- Captures state management
- Lists required features

API contract generator:
- Derives endpoints from UI
- Defines request/response formats
- Includes WebSocket events

Reconciler:
- Ensures consistency
- Validates completeness
- Flags mismatches

### Stage 4: API Contract to Backend
**Input**: API Contract, Data Models  
**Output**: FastAPI backend with DynamoDB  

Generator agent:
- Implements all endpoints
- Creates service layer
- Sets up data access
- Includes authentication

QC agent:
- Tests against API contract
- Validates business logic
- Ensures error handling

### Stage 5: Deployment (Future)
**Input**: Frontend + Backend  
**Output**: Deployed application  

- AWS CDK infrastructure
- DynamoDB tables
- Lambda functions
- CloudFront distribution
- Route53 domain

## Parallel Processing Opportunities

```
                    ┌─────────────┐
                    │Orchestrator │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │Business PRD │
                    └──────┬──────┘
                           │
                 ┌─────────▼─────────┐
                 │Interaction Spec   │
                 └─────────┬─────────┘
                           │
                   ┌───────▼───────┐
                   │   Wireframe    │
                   └───┬───────┬───┘
                       │       │
            ┌──────────▼─┐   ┌─▼──────────┐
            │Frontend Spec│   │API Contract│
            └────────────┘   └──────┬─────┘
                                    │
                            ┌───────▼───────┐
                            │    Backend    │
                            └───────────────┘
```

## Validation Gates

Each step includes validation to ensure quality:

1. **Interaction Spec Validation**
   - All PRD features covered ✓
   - Standard UI patterns included ✓
   - Navigation paths complete ✓

2. **Wireframe Validation**
   - All interactions implemented ✓
   - Technical patterns followed (from standard spec) ✓
   - Visual consistency ✓
   - Responsive design ✓

3. **Spec Validation**
   - API matches UI needs ✓
   - Data models support features ✓
   - No missing endpoints ✓

4. **Backend Validation**
   - All endpoints implemented ✓
   - Business logic correct ✓
   - Error handling complete ✓


## Success Criteria

An application is considered successfully generated when:
1. All business requirements are implemented
2. UI is visually appealing and functional
3. Backend passes all integration tests
4. Application deploys without errors
5. Users can immediately use core features

## Continuous Improvement

After each application generation:
1. Document any missing patterns
2. Update agent prompts
3. Refine validation criteria
4. Add to template library
5. Measure success metrics