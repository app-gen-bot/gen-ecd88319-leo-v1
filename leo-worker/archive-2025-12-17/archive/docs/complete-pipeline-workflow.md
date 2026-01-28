# Complete AI App Factory Pipeline Workflow

## Overview

The AI App Factory v2 pipeline includes a complete workflow that takes a user prompt and generates a fully functional application with quality checks, build verification, and continuous improvement.

## Pipeline Stages

### Stage 0: Product Requirements Document (PRD)
- **Input**: User prompt describing the desired application
- **Process**: Analyze prompt and generate comprehensive PRD
- **Output**: `specs/prd.md`

### Stage 1: Interaction Specification
- **Input**: PRD from Stage 0
- **Process**: Generate detailed UI/UX interaction patterns
- **Output**: `specs/interaction_spec.md`

### Stage 2: Enhanced Wireframe Generation
This stage now includes multiple sub-processes:

#### 2.1 Wireframe Generation
- **Agent**: Context-aware WireframeAgent
- **Input**: Interaction spec + optional technical spec
- **Process**: Generate complete Next.js application
- **Output**: Full frontend application in `frontend/`

#### 2.2 Quality Control (QC)
- **Agent**: Context-aware QCAgent
- **Input**: Generated wireframe + interaction spec
- **Process**: 
  - Use integration_analyzer to identify changed files
  - Validate implementation against specification
  - Check for missing/extra features
  - Generate detailed QC report
- **Output**: `specs/qc-report.md`

#### 2.3 Build & Test Verification
- **Tool**: build_test MCP tool
- **Process**:
  - Install dependencies
  - Run TypeScript compilation
  - Run ESLint checks
  - Build the project
  - Run tests (if configured)
- **Output**: Build verification results

#### 2.4 Self-Improvement Analysis
- **Agent**: Context-aware SelfImprovementAgent
- **Input**: QC report
- **Process**:
  - Analyze QC findings
  - Extract patterns and insights
  - Store learnings for future improvements
- **Output**: `specs/improvement-insights.md`

### Stage 3: Technical Specification (TODO)
- Generate backend API contracts
- Define data models
- Create integration specifications

### Stage 4: Backend Generation (TODO)
- Generate FastAPI backend
- Create DynamoDB schemas
- Implement API endpoints

### Stage 5: Deployment (TODO)
- Generate AWS CDK infrastructure
- Create deployment scripts
- Set up CI/CD pipeline

## Running the Complete Pipeline

### Using main_v2.py

```bash
# Run with a prompt
python -m app_factory.main_v2 "Create a project management app like Asana"

# Run with a specific app name
python -m app_factory.main_v2 "Create a todo app" --name my-todo-app

# Interactive mode
python -m app_factory.main_v2
```

### Using the Test Script

```bash
python test_complete_pipeline.py
```

## Key Features

### 1. Context-Aware Agents
All agents in Stage 2 use the ContextAwareAgent base class, providing:
- Memory of previous implementations
- Learning from past mistakes
- Consistency across generations
- Access to Graphiti knowledge graphs

### 2. Automated Quality Checks
- QC agent validates against specifications
- Build tool ensures code compiles
- Self-improvement captures learnings

### 3. Modular Architecture
- Each stage is independent
- Easy to add new stages
- Clear interfaces between stages

### 4. Cost Tracking
- Each agent reports its cost
- Total pipeline cost calculated
- Helps optimize resource usage

## File Structure

```
apps/
└── [app-name]/
    ├── specs/
    │   ├── prd.md                    # Product requirements
    │   ├── interaction_spec.md       # UI/UX specification
    │   ├── qc-report.md             # Quality control report
    │   └── improvement-insights.md   # Self-improvement analysis
    └── frontend/
        ├── app/                      # Next.js app directory
        ├── components/               # React components
        ├── stores/                   # State management
        ├── lib/                      # Utilities
        └── [config files]            # package.json, etc.
```

## Benefits of the Complete Workflow

1. **Quality Assurance**: QC agent ensures spec compliance
2. **Build Confidence**: Automated build verification
3. **Continuous Learning**: Self-improvement captures insights
4. **End-to-End**: From prompt to running application
5. **Observability**: Detailed logging and cost tracking

## Next Steps

1. **Implement Stages 3-5**: Complete the backend and deployment stages
2. **Add More Tools**: Integration testing, security scanning
3. **Enhance Learning**: Use Graphiti to build knowledge graphs
4. **Optimize Costs**: Reduce redundant API calls
5. **Add Parallelization**: Run independent stages concurrently

## Example Output

```
🏭 AI App Factory v2.0.0
============================================================

📋 Stage 0: Generating Product Requirements Document
✅ PRD saved to: apps/todo-app-v2/specs/prd.md

🖱️ Stage 1: Generating Interaction Specification  
✅ Interaction spec saved to: apps/todo-app-v2/specs/interaction_spec.md

🎨 Stage 2: Enhanced Wireframe Generation
📐 Step 1: Generating Wireframe...
✅ Wireframe generated ($0.1234)

🔍 Step 2: Running QC Validation...
✅ QC validation completed ($0.0567)

🔨 Step 3: Build & Test Verification...
✅ Build verification completed ($0.0123)

📈 Step 4: Self-Improvement Analysis...
✅ Self-improvement analysis completed ($0.0456)

============================================================
📊 Pipeline Results Summary
============================================================
✅ wireframe: $0.1234
✅ build_test: $0.0123
✅ self_improvement: $0.0456

💰 Total cost: $0.2380
⏱️ Total pipeline time: 3m 45s

✨ App generated successfully!
📁 Location: apps/todo-app-v2
```

This complete workflow ensures high-quality application generation with built-in learning and improvement mechanisms.