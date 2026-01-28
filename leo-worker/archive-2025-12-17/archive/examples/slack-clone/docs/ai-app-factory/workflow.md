# AI App Factory Workflow

## Complete Pipeline

```
┌─────────────────┐
│   User Prompt   │ "I want a Slack clone for my team"
└────────┬────────┘
         │
    ┌────▼─────┐
    │Orchestrator│ Single conversation to extract requirements
    └────┬─────┘
         │
┌────────▼────────┐
│  Business PRD   │ What the application should do
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Agent 1  │ Generate Frontend Interaction Spec
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
    │      Agent 2         │ Generate Visual Wireframe
    └──────────┬───────────┘
               │
┌──────────────▼──────────┐
│   Next.js Wireframe     │ Complete UI implementation
└─────────────────────────┘
         │
    ┌────▼─────┐
    │ Agent 3  │ Extract Technical Specifications
    └────┬─────┘
         │
┌────────▼────────┐
│ Technical Specs │ Frontend, API, Data Models
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Agent 4  │ Generate Backend Implementation
    └────┬─────┘
         │
┌────────▼────────┐
│FastAPI Backend  │ Complete API with business logic
└────────┬────────┘
         │
    ┌────▼─────┐
    │ Agent 5  │ Deploy to AWS (Future)
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

## Detailed Steps

### Step 0: Orchestrator Conversation
**Input**: User prompt  
**Output**: Business PRD  
**Duration**: ~1 minute  

The orchestrator engages in a brief conversation to understand:
- Core features needed
- Target users
- Scale requirements
- Any specific constraints

### Step 1: PRD to Frontend Interaction Spec
**Input**: Business PRD  
**Output**: Frontend Interaction Specification  
**Duration**: ~2 minutes  

Generator agent creates:
- Complete interaction flows
- All user-facing features
- Navigation paths
- Error states

Validator agent ensures:
- Every PRD feature has UI
- Standard patterns included (logout, settings, etc.)
- Interaction completeness

### Step 2: Interaction Spec + Technical Spec to Wireframe
**Input**: Frontend Interaction Spec + Standard Technical Implementation Spec  
**Output**: Next.js application with ShadCN UI  
**Duration**: ~5 minutes  

The Technical Implementation Spec is a standard document that defines:
- Authentication patterns (token storage, session management)
- Error handling patterns (HTTP status codes, UI feedback)  
- State management patterns (contexts, hooks)
- API integration patterns (client structure, interceptors)

Generator agent:
- Implements all specified interactions from the Frontend Interaction Spec
- Follows technical implementation patterns from the standard spec
- Creates beautiful dark mode UI
- Uses ShadCN components
- Includes proper auth flow, error handling, etc.

Validator agent:
- Checks interaction coverage
- Validates technical pattern compliance
- Ensures responsive design

### Step 3: Wireframe to Technical Specs
**Input**: Implemented wireframe  
**Output**: Frontend Spec, API Contract, Data Models  
**Duration**: ~3 minutes  

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

### Step 4: API Contract to Backend
**Input**: API Contract, Data Models  
**Output**: FastAPI backend with DynamoDB  
**Duration**: ~10 minutes  

Generator agent:
- Implements all endpoints
- Creates service layer
- Sets up data access
- Includes authentication

Validator agent:
- Tests against API contract
- Validates business logic
- Ensures error handling

### Step 5: Deployment (Future)
**Input**: Frontend + Backend  
**Output**: Deployed application  
**Duration**: ~5 minutes  

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

## Time Estimates

Total time from prompt to deployed app:
- Orchestrator: 1 minute
- Interaction Spec: 2 minutes
- Wireframe (with standard Technical Spec): 5 minutes
- Spec Extraction: 3 minutes
- Backend: 10 minutes
- Deployment: 5 minutes
- **Total: ~26 minutes**

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