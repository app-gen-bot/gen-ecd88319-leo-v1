# AI App Factory Workflow

(very concise! human input, ai-aided)

## Pipeline Overview
User Prompt ’ Stage 0 ’ Stage 1 ’ Stage 2 ’ Stage 3 ’ Stage 4 ’ Stage 5 ’ Live App

## Stages

Stage 0: PRD Generation
- Input: User Prompt
- Output: Business PRD
- Pattern: Orchestrator Conversation

Stage 1: Frontend Interaction Spec
- Input: Business PRD
- Output: Interaction Specification
- Pattern: Generator ’ QC

Stage 2: Wireframe Generation
- Input: Interaction Spec, Technical Impl Spec
- Output: Next.js Wireframe
- Pattern: Wireframe ’ QC ’ Self-Improvement

Stage 3: Technical Specifications
- Input: Next.js Wireframe
- Output: Frontend Spec, API Contract, Data Models
- Pattern: Extractors ’ Reconciler

Stage 4: Backend Implementation
- Input: API Contract, Data Models
- Output: FastAPI Backend
- Pattern: Generator ’ QC

Stage 5: Deployment
- Input: Frontend, Backend
- Output: Live App URL
- Status: Future/TODO

## Shared Resources
- Technical Implementation Spec: Standard patterns for auth, errors, state
- Opinionated Patterns: Tech stack decisions

## Validation Gates
- Interaction spec covers all PRD features
- Wireframe implements all interactions
- API matches UI needs
- Backend passes integration tests

## Success Criteria
- All business requirements implemented
- UI visually appealing and functional
- Backend passes tests
- Application deploys without errors
- Core features immediately usable