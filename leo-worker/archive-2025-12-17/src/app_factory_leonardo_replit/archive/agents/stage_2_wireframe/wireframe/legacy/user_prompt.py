"""User prompt creation for the Wireframe Generator agent."""


def create_wireframe_prompt(
    interaction_spec: str, 
    tech_spec: str = "", 
    output_dir: str = "",
    app_name: str = ""
) -> str:
    """Create the prompt for the wireframe agent.
    
    Args:
        interaction_spec: The interaction specification content
        tech_spec: The technical implementation spec content
        output_dir: Directory where files should be generated
        app_name: Name of the application being generated
        
    Returns:
        Formatted prompt for the wireframe generator
    """
    tech_spec_section = ""
    if tech_spec:
        tech_spec_section = f"""
Technical Implementation Specification:
{tech_spec}

IMPORTANT: Follow all technical patterns from the specification above, including:
- Authentication and session management patterns
- Error handling and user feedback patterns
- State management patterns with React Context
- API client structure and interceptors
- Component structure and organization
"""
    
    return f"""Create a complete Next.js application wireframe for "{app_name}" based on the specifications below.

Working Directory: {output_dir}
IMPORTANT: Your current working directory is set to the output directory above.
All file operations should use paths relative to this directory.
For example, use 'package.json' not '{output_dir}/package.json'.

Interaction Specification:
{interaction_spec}
{tech_spec_section}
Requirements:
1. Use Next.js 14 with App Router
2. Use ShadCN UI components exclusively
3. Implement dark mode by default (#1a1d21 background)
4. Create ALL screens described in the interaction spec
5. Implement proper routing and navigation
6. Add loading states and error boundaries
7. Ensure responsive design (mobile-first)
8. Include proper TypeScript types
9. Follow React best practices
10. Implement all interactions EXACTLY as specified in the interaction spec

Instructions:
1. Generate all files using relative paths (you're already in the working directory)
2. Build upon the existing Next.js template that's already there
3. Create all necessary components, pages, and utilities
4. Ensure every feature from the interaction spec is implemented
5. Use mock data to demonstrate all states (empty, loading, populated, error)

After generating all files:
6. Run build_test with command "verify" to ensure the code compiles correctly
7. If there are any errors, fix them before proceeding
8. Once the build passes, use the browser tool to:
   - Open a browser session
   - Navigate to http://localhost:3000
   - Check for any console errors
   - Take screenshots if needed
   - Close the browser session

Remember: The interaction specification is your contract. Every interaction, flow, and state defined must be implemented exactly as specified. Your creativity applies to HOW it looks (visual design), not WHAT it does (functionality).

Generate a complete, working, beautiful Next.js application that demonstrates every single feature from the interaction specification."""