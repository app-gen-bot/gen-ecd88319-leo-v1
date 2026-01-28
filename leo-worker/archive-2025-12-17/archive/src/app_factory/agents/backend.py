"""Backend agent - Step 4 of the App Factory pipeline."""

from cc_agent import Agent


def create_backend_prompt(api_contract: str, data_models: str) -> str:
    """Create the prompt for the backend agent.
    
    Args:
        api_contract: The API contract specification
        data_models: The data models specification
        
    Returns:
        Formatted prompt for the backend generator
    """
    return f"""
    Implement a complete FastAPI backend based on these specifications.
    
    API Contract:
    {api_contract}
    
    Data Models:
    {data_models}
    
    Requirements:
    1. Use FastAPI with Python 3.12+
    2. Use AWS DynamoDB for data storage (use boto3)
    3. Implement ALL endpoints from the API contract exactly
    4. Use JWT authentication with proper token validation
    5. Include comprehensive error handling with proper HTTP status codes
    6. Create a service layer for business logic (separate from routes)
    7. Add Pydantic models for all request/response validation
    8. Include CORS configuration for frontend
    9. Add logging with proper log levels
    10. Include WebSocket support if specified in the contract
    11. Write at least one integration test per endpoint
    12. Add health check endpoint
    13. Include proper environment variable configuration
    14. Create docker-compose.yml for local development with DynamoDB Local
    
    Project structure:
    ```
    backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── config.py
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── db/
    │   └── utils/
    ├── tests/
    ├── requirements.txt
    ├── Dockerfile
    └── docker-compose.yml
    ```
    
    Start by creating the project structure, then implement each component.
    Ensure the implementation is production-ready and follows FastAPI best practices.
    """


BACKEND_AGENT = Agent(
    name="Backend Generator",
    system_prompt="""You are a FastAPI and AWS DynamoDB expert.
    Implement a complete backend based on the API contract and data models.
    
    Requirements:
    - Use FastAPI with Python 3.12+
    - Use AWS DynamoDB for data storage
    - Implement all endpoints from the API contract
    - Add proper authentication (JWT)
    - Include comprehensive error handling
    - Create service layer for business logic
    - Add data validation with Pydantic
    - Include WebSocket support if specified
    - Write basic integration tests
    
    Generate a production-ready backend.""",
    allowed_tools=["Read", "Write", "MultiEdit", "Bash"],
    max_turns=15,
    permission_mode="acceptEdits"
)