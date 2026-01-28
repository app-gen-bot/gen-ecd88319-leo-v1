# Stage 2: Interaction Spec to Wireframe

## Overview

Stage 2 transforms the frontend interaction specification (from Stage 1) into a complete, working wireframe application using NextJS/React. This is not just static mockups - it creates a fully interactive application with all navigation, forms, and interactions working.

**Key Discovery**: Adding the interaction specification step before wireframe generation improved feature completeness from 50% to 100% by separating "what users can do" (interaction design) from "how it looks" (visual design).

## Purpose

Transform high-level interaction specifications into a complete, functional frontend application that serves as a working prototype and becomes the source of truth for all downstream specifications.

## Inputs

1. **Frontend Interaction Specification** 
   - Location: `apps/{app_name}/specs/frontend-interaction-spec.md`
   - Contains detailed descriptions of all screens, user flows, and interactions
   - Ensures 100% feature coverage by explicitly defining all behaviors
   
2. **Technical Implementation Specification**
   - Location: `apps/{app_name}/specs/technical-implementation-spec.md`
   - Provides standard patterns for:
     - Authentication (token storage, session management)
     - Error handling (HTTP status codes, UI feedback)
     - State management (contexts, hooks)
     - API integration (client structure, interceptors)

## Output

A fully functional NextJS application in `apps/{app_name}/frontend/` with:
- All screens and pages implemented
- Complete routing structure
- Interactive components (forms, modals, navigation)
- Consistent styling using Tailwind CSS and Shadcn UI
- Proper state management
- Form validation using React Hook Form and Zod

## Current Implementation Status

The wireframe agent already exists with modular components:
- `system_prompt.py` - Detailed instructions for the AI agent
- `user_prompt.py` - Template for constructing the generation request
- `config.py` - Agent configuration and parameters
- `agent.py` - Main agent logic and orchestration

## Key Implementation Details

### 1. The Agent Architecture

The wireframe agent uses Claude to generate the entire frontend codebase:
- Provides detailed system prompts with coding standards
- Includes the technical implementation spec for consistency
- Generates production-ready code, not just mockups
- Follows modern React patterns and best practices

### 2. What Makes This Special

- **Fully Interactive**: All navigation, forms, and interactions work
- **Production-Ready**: Uses modern React patterns, TypeScript, and best practices
- **Consistent Design**: Leverages Shadcn UI components for professional appearance
- **Complete Implementation**: Generates all necessary files including components, pages, utilities

### 3. Integration Points

- Reads the interaction spec from the conventional location
- Writes files directly to the frontend directory
- Builds on top of the scaffolded NextJS template
- Respects existing dependencies and configuration

## Implementation Approach

### Stage 2 Module Structure

```python
# src/app_factory/stages/stage_2_wireframe.py
async def run_stage(app_name: str) -> AgentResult:
    """Run Stage 2: Generate wireframe from interaction spec.
    
    Args:
        app_name: Name of the application
        
    Returns:
        AgentResult with success status, generated files, and cost
    """
    # Derive paths by convention
    project_root = Path(__file__).parent.parent.parent
    app_dir = project_root / "apps" / app_name
    
    # Input paths
    interaction_spec_path = app_dir / "specs" / "frontend-interaction-spec.md"
    tech_spec_path = app_dir / "specs" / "technical-implementation-spec.md"
    
    # Output path
    output_dir = app_dir / "frontend"
    
    # Validate inputs exist
    if not interaction_spec_path.exists():
        return AgentResult(
            success=False,
            content="",
            cost=0.0,
            error=f"Interaction spec not found: {interaction_spec_path}"
        )
    
    # Read specifications
    interaction_spec = interaction_spec_path.read_text()
    tech_spec = tech_spec_path.read_text() if tech_spec_path.exists() else ""
    
    # Initialize and run the wireframe agent
    from app_factory_leonardo.agents.stage_2_wireframe.wireframe import WireframeAgent
    agent = WireframeAgent()
    
    result = await agent.run(
        interaction_spec=interaction_spec,
        tech_spec=tech_spec,
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    return result
```

### Workflow

1. **Read Specifications**: Load the interaction spec and technical spec from the app's specs directory
2. **Initialize Agent**: Create a WireframeAgent instance with proper configuration
3. **Generate Code**: Run the agent to generate all frontend files
4. **Write Files**: The agent writes files directly to the frontend directory
5. **Return Results**: Provide success status, cost, and any error information

### Key Considerations

1. **Build on Existing Template**: The agent should generate code that integrates with the existing NextJS template
2. **Respect File Structure**: Follow the established directory structure and naming conventions
3. **Error Handling**: Handle cases where specs are missing or malformed
4. **Progress Reporting**: Since this stage generates many files, provide progress updates
5. **Cost Tracking**: Track API usage costs for the generation process

## Example Flow

```
Input: Frontend Interaction Spec
├── Screen descriptions
├── User flows
├── Component details
└── Interaction patterns

Process: Wireframe Agent
├── Parse specifications
├── Plan component structure
├── Generate TypeScript/React code
└── Create all necessary files

Output: Complete Frontend Application
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── [feature]/
│       └── page.tsx
├── components/
│   ├── ui/ (Shadcn components)
│   └── [custom components]
├── lib/
│   └── utils.ts
└── public/
    └── [assets]
```

## Testing the Implementation

1. Run with a simple interaction spec first
2. Verify all specified screens are generated
3. Check that navigation works correctly
4. Ensure forms validate and submit properly
5. Test responsive design on different screen sizes

## Future Enhancements

- Support for generating tests alongside components
- Integration with design systems beyond Shadcn UI
- Progressive enhancement with loading states and error boundaries
- Accessibility audit and improvements
- Performance optimization suggestions