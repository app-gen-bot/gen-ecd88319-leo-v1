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
    │   (3 Sub-Agents)     │ 1. Wireframe 2. QC 3. Self-Improve
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

### Stage 2: Interaction Spec + Technical Spec to Wireframe (Three-Agent System)
**Input**: Frontend Interaction Spec + Standard Technical Implementation Spec  
**Output**: Next.js application with ShadCN UI  

The Technical Implementation Spec is a standard document that defines:
- Authentication patterns (token storage, session management)
- Error handling patterns (HTTP status codes, UI feedback)  
- State management patterns (contexts, hooks)
- API integration patterns (client structure, interceptors)

**Stage 2 Sub-Agents:**

1. **Wireframe Agent**:
   - Implements all specified interactions from the Frontend Interaction Spec
   - Follows technical implementation patterns from the standard spec
   - Creates beautiful dark mode UI
   - Uses ShadCN components
   - Includes proper auth flow, error handling, etc.- 
   - Runs build/test/verify tools
   - Uses browser tool to check for runtime errors

2. **QC Agent**:
   - Uses integration analyzer to focus on changed files only
   - Checks interaction coverage
   - Validates technical pattern compliance
   - Ensures responsive design
   - Identifies missing features ("less") and extra features ("more")
   - Determines root causes of discrepancies
   - Generates detailed compliance report

3. **Self-Improvement Agent**:
   - Analyzes QC reports for patterns
   - Suggests prompt improvements
   - Recommends config changes
   - Stores learnings for future runs
   - Acts like neural network backpropagation

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