"""Wireframe agent - Step 2 of the App Factory pipeline."""

from cc_agent import Agent


def create_wireframe_prompt(interaction_spec_content: str, technical_spec_path: str = None) -> str:
    """Create the prompt for the wireframe agent.
    
    Args:
        interaction_spec_content: The interaction specification content
        technical_spec_path: Optional path to technical implementation spec
        
    Returns:
        Formatted prompt for the wireframe generator
    """
    tech_spec_instruction = ""
    if technical_spec_path:
        tech_spec_instruction = f"""
    
    IMPORTANT: Read and follow the technical implementation patterns from:
    {technical_spec_path}
    
    This includes standard patterns for:
    - Authentication and session management
    - Error handling and user feedback
    - State management with React Context
    - API client structure and interceptors
    """
    
    return f"""
    Create a complete Next.js application wireframe based on this interaction specification.
    
    Interaction Specification:
    {interaction_spec_content}
    {tech_spec_instruction}
    
    Requirements:
    1. Use Next.js 14 with App Router
    2. Use ShadCN UI components exclusively
    3. Implement dark mode by default
    4. Create ALL screens described in the interaction spec
    5. Implement proper routing and navigation
    6. Add loading states and error boundaries
    7. Ensure responsive design (mobile-first)
    8. Include proper TypeScript types
    9. Follow React best practices
    10. Implement all interactions exactly as specified
    
    Generate a complete, working, beautiful Next.js application.
    Start by creating the project structure, then implement each screen.
    """


WIREFRAME_AGENT = Agent(
    name="Wireframe Generator",
    system_prompt="""You are a Next.js and ShadCN UI expert developer.
    Transform interaction specifications into beautiful, functional wireframes.
    
    Requirements:
    - Use Next.js 14 with App Router
    - Use ShadCN UI components exclusively
    - Implement dark mode by default
    - Follow the technical implementation spec for patterns
    - Create all screens specified in the interaction spec
    - Implement proper routing and navigation
    - Add loading states and error boundaries
    - Ensure responsive design
    
    Generate a complete, working Next.js application.""",
    allowed_tools=["Read", "Write", "MultiEdit"],
    max_turns=10,
    permission_mode="acceptEdits"
)