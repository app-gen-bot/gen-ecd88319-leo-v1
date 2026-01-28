# AI-Agentic Specification Approach

This document defines how we structure specifications for AI agents to implement applications with minimal human intervention.

## Core Principles

1. **No Fluff** - Pure implementation focus, no backstory or justifications
2. **Clear Contracts** - API serves as the boundary between systems
3. **Context Isolation** - Each agent sees only what it needs
4. **Implementation Freedom** - Specify what, not how

## Specification Structure

### 1. Business Specification (`01_business_spec.md`)
**Purpose**: High-level features and rules for AI to understand the domain
- Feature list with acceptance criteria
- Business rules and constraints  
- User flows derived from wireframe
- No personas, just capabilities

### 2. API Contract (`02_api_contract.md`)
**Purpose**: Source of truth for frontend-backend communication
- Endpoint definitions with schemas
- WebSocket events
- Authentication flow
- Error codes
- **Shared with both frontend and backend agents**

### 3. Data Models (`03_data_models.md`)
**Purpose**: Shared understanding of entities
- Entity definitions
- Relationships
- Constraints
- **No database-specific details**

### 4. Frontend Specification (`04_frontend_spec.md`)
**Purpose**: What the frontend agent implements
- Reference to wireframe (visual spec)
- State management requirements
- Route structure
- Component hierarchy
- API integration points

### 5. Backend Specification (`05_backend_spec.md`)
**Purpose**: What the backend agent implements
- API endpoints to implement
- Business logic rules
- Data validation
- External integrations

## Key Insights

1. **Wireframe IS Frontend Spec** - Shows exactly what to build visually
2. **API Contract IS the Glue** - Both agents work toward this contract
3. **Natural Boundaries** - Follow the tech stack structure

## What We Exclude

- Technology choices (predetermined)
- Infrastructure details (predetermined)
- Implementation patterns (AI decides)
- Verbose explanations

## Format Guidelines

All specifications use Markdown with:
- Clear headings
- Bullet points for requirements
- Code blocks for examples
- Tables for structured data
- No long paragraphs

## Generation Flow

### Phase 1: Visual (Pre-approval)
1. Orchestrator conversation → Business Spec
2. Business Spec → Wireframe (interactive Next.js app)
3. User feedback and iterations on wireframe

### Phase 2: Specification (Post-approval)
4. Approved Wireframe → API Contract (based on actual UI needs)
5. Wireframe + API Contract → Frontend Spec (implementation details)
6. Business Spec + API Contract → Backend Spec
7. All specs → Data Models (finalized)

### Phase 3: Implementation
8. Build backend to API Contract
9. Enhance frontend from wireframe to full app
10. Deploy complete application

**Key Insight**: The wireframe drives API design, not the other way around. This ensures the API serves the actual UI needs rather than imagined ones.

This approach provides AI agents exactly what they need without overwhelming context.