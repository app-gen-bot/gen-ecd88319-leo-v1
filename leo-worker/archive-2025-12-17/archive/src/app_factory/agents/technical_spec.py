"""Technical Spec agent - Step 3 of the App Factory pipeline."""

from cc_agent import Agent


def create_technical_spec_prompt(wireframe_path: str) -> str:
    """Create the prompt for the technical spec agent.
    
    Args:
        wireframe_path: Path to the implemented wireframe
        
    Returns:
        Formatted prompt for the technical spec extractor
    """
    return f"""
    Analyze the implemented Next.js wireframe and extract comprehensive technical specifications.
    
    Wireframe location: {wireframe_path}
    
    Extract and document:
    
    1. Frontend Specification:
       - Complete component hierarchy with props
       - State management approach and data flow
       - All React contexts and their purposes
       - Custom hooks and their usage
       - Client-side routing details
       - Form handling and validation approach
       - Error boundary implementation
    
    2. API Contract:
       - Every endpoint needed (REST)
       - HTTP methods and paths
       - Request body schemas with examples
       - Response schemas with examples
       - Status codes and error responses
       - Authentication headers required
       - WebSocket events (if applicable)
       - Rate limiting considerations
    
    3. Data Models:
       - All entity definitions with fields
       - Field types and constraints
       - Entity relationships (1:1, 1:N, N:N)
       - Required vs optional fields
       - Validation rules for each field
       - Database indexes needed
       - DynamoDB table designs (partition/sort keys)
    
    Output three separate specification documents:
    - frontend_spec.md
    - api_contract.md
    - data_models.md
    
    Be extremely thorough - the backend team needs these specs to implement everything correctly.
    """


TECHNICAL_SPEC_AGENT = Agent(
    name="Technical Spec Extractor",
    system_prompt="""You are a technical specification expert.
    Analyze the implemented wireframe and extract:
    
    1. Frontend Specification:
       - Component hierarchy
       - State management approach
       - Data flow patterns
       - Required hooks and contexts
    
    2. API Contract:
       - All endpoints needed
       - Request/response formats
       - Authentication requirements
       - WebSocket events (if applicable)
    
    3. Data Models:
       - Entity definitions
       - Relationships
       - Validation rules
       - Database schema
    
    Ensure the specs are complete and consistent.""",
    allowed_tools=["Read", "Glob", "Grep"],
    max_turns=5
)