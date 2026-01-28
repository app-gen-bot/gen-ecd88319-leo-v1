# Backend Initialization Tool

This directory contains the backend initialization functionality that was copied from the MCP tools. It provides a parameterized tool for creating FastAPI backend projects with Python 3.11.

## Current Status

This tool is **preserved for future use** but is **not currently used** in the scaffolding process. The scaffolding intentionally only creates minimal directory structure to avoid making assumptions about the backend technology stack.

## Tool Parameters

The backend initialization tool accepts the following parameters:

- **`project_name`** (required): Name of the project directory to create
- **`include_db`** (optional, default: false): Whether to include database support
  - Adds SQLAlchemy, Alembic, and PostgreSQL driver
- **`include_auth`** (optional, default: false): Whether to include authentication boilerplate
  - Adds JWT libraries and password hashing

## What It Creates

When run, the tool creates a complete FastAPI project structure:

```
project_name/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core functionality (config, security)
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── main.py       # FastAPI app entry point
├── tests/            # Test files
├── .venv/            # Virtual environment (Python 3.11)
├── requirements.txt  # Python dependencies
├── .env             # Environment variables
├── .env.example     # Example environment file
├── .gitignore       # Git ignore patterns
├── pytest.ini       # Pytest configuration
├── run_dev.sh       # Development server script
└── README.md        # Project documentation
```

## Future Integration with Stage 4

This tool is intended to be integrated with **Stage 4 (Backend Implementation)** of the pipeline. Here's how it might work:

1. **Stage 3** generates technical specifications including:
   - API endpoints and contracts
   - Data models and schemas
   - Authentication requirements
   - Database requirements

2. **Stage 4** would:
   - Parse the technical specs to determine parameters
   - Set `include_db=True` if database models are specified
   - Set `include_auth=True` if authentication is required
   - Call this backend initialization tool with appropriate parameters
   - Further customize the generated code based on the specs

## Example Usage (Future)

```python
# In Stage 4 implementation
from app_factory.initialization.backend import initialize_backend

# Parse technical specs to determine requirements
needs_db = "database" in tech_specs or "SQLAlchemy" in tech_specs
needs_auth = "authentication" in tech_specs or "JWT" in tech_specs

# Initialize backend with determined parameters
result = await initialize_backend(
    project_name=app_name,
    include_db=needs_db,
    include_auth=needs_auth
)
```

## Why Not Used During Scaffolding

The backend initialization is not used during the initial scaffolding phase because:

1. **Technology agnostic**: The pipeline should not assume FastAPI will be used
2. **Spec-driven**: Backend technology choices should come from the technical specifications
3. **Flexibility**: Different apps may need different backend frameworks (Django, Flask, etc.)
4. **Stage separation**: Each stage should have clear responsibilities

## Files in This Directory

- `server.py`: The MCP server implementation (not used directly)
- `__init__.py`: Python package initialization
- This `README.md`: Documentation

## Notes

- The tool uses `uv` for fast dependency installation when available
- Falls back to standard pip if uv is not installed
- Creates a Python 3.11 virtual environment
- Includes comprehensive project structure with testing setup