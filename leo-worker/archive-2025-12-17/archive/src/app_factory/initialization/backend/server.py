"""
Backend Initialization MCP Server - Host Version

Creates FastAPI projects with Python 3.11, proper structure, and common dependencies.
Runs directly on the host machine without Docker containers.
"""

import asyncio
import json
import os
import subprocess
import sys
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

from fastmcp import FastMCP


class BackendInitMCPServer:
    """MCP Server for backend project initialization with Python 3.11."""
    
    def __init__(self):
        self.mcp = FastMCP("BackendInit")
        self.name = "BackendInit"
        self.workspace_path = None
        
        # Set up logging
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.INFO)
        
        # Register tools
        self.register_tools()
        self.logger.debug("Tools registered successfully")
    
    def find_python_311(self) -> Optional[str]:
        """Find Python 3.11 in various locations."""
        # Check isolated environment first
        if self.workspace_path:
            workspace_parent = Path(self.workspace_path).parent.parent
        else:
            workspace_parent = Path.cwd().parent.parent
            
        isolated_locations = [
            workspace_parent / "isolated_workspace" / ".venv" / "bin" / "python3.11",
            workspace_parent / "isolated_workspace" / ".venv" / "bin" / "python3",
            workspace_parent / "isolated_workspace" / ".venv" / "bin" / "python",
            Path.home() / ".pyenv" / "versions" / "3.11.12" / "bin" / "python3.11",
            Path.home() / ".pyenv" / "shims" / "python3.11",
        ]
        
        for location in isolated_locations:
            if location.exists():
                try:
                    result = subprocess.run(
                        [str(location), "--version"],
                        capture_output=True,
                        text=True
                    )
                    if result.returncode == 0 and "3.11" in result.stdout:
                        self.logger.info(f"Found Python 3.11 at: {location}")
                        return str(location)
                except:
                    pass
        
        # Check system locations
        for python_cmd in ["python3.11", "python3", "python"]:
            try:
                result = subprocess.run(
                    [python_cmd, "--version"],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0 and "3.11" in result.stdout:
                    # Get full path
                    which_result = subprocess.run(
                        ["which", python_cmd],
                        capture_output=True,
                        text=True
                    )
                    if which_result.returncode == 0:
                        return which_result.stdout.strip()
                    return python_cmd
            except:
                continue
        
        return None
    
    def register_tools(self):
        """Register all backend initialization tools."""
        self.logger.debug("Starting tool registration...")
        
        @self.mcp.tool()
        async def fastapi_project(
            project_name: str,
            include_db: bool = False,
            include_auth: bool = False,
            port: int = 8000
        ) -> Dict[str, Any]:
            """Create a FastAPI project with Python 3.11 and proper structure.
            
            Args:
                project_name: Name of the project directory to create
                include_db: Whether to include database support (SQLAlchemy, Alembic)
                include_auth: Whether to include authentication boilerplate
                port: Port number for the development server
                
            Returns:
                Dictionary with success status and project details
            """
            
            # Determine workspace path
            if self.workspace_path:
                workspace = Path(self.workspace_path)
            else:
                workspace = Path.cwd()
                self.logger.warning(f"No workspace path configured, using current directory: {workspace}")
            
            # Find Python 3.11
            python_path = self.find_python_311()
            if not python_path:
                return {
                    "success": False,
                    "message": "Python 3.11 not found. Please install it:\n"
                              "  • Ubuntu/Debian: sudo apt install python3.11 python3.11-venv\n"
                              "  • macOS: brew install python@3.11\n"
                              "  • Or use pyenv: pyenv install 3.11.12\n"
                              "  • Or run: ./setup_isolated_env.sh"
                }
            
            # Create project directory
            project_path = workspace / project_name
            project_path.mkdir(parents=True, exist_ok=True)
            
            self.logger.info(f"Creating FastAPI project: {project_name}")
            self.logger.info(f"Using Python: {python_path}")
            self.logger.info(f"Project path: {project_path}")
            
            # Create virtual environment with Python 3.11 using uv
            venv_path = project_path / ".venv"
            self.logger.info("Creating virtual environment with uv...")
            
            try:
                # Check if uv is available
                uv_check = subprocess.run(
                    ["uv", "--version"],
                    capture_output=True,
                    text=True
                )
                
                if uv_check.returncode == 0:
                    # Use uv to create venv (much faster)
                    result = subprocess.run(
                        ["uv", "venv", str(venv_path), "--python", python_path],
                        capture_output=True,
                        text=True,
                        cwd=str(project_path)
                    )
                    if result.returncode != 0:
                        self.logger.error(f"uv venv failed: {result.stderr}")
                        raise subprocess.CalledProcessError(result.returncode, result.args, result.stderr)
                else:
                    # Fallback to standard venv
                    self.logger.info("uv not found, using standard venv...")
                    subprocess.run(
                        [python_path, "-m", "venv", str(venv_path)],
                        check=True,
                        capture_output=True
                    )
                
                # Get pip path
                pip_path = venv_path / "bin" / "pip"
                if not pip_path.exists():
                    pip_path = venv_path / "Scripts" / "pip.exe"  # Windows
                
            except subprocess.CalledProcessError as e:
                return {
                    "success": False,
                    "message": f"Failed to create virtual environment: {e.stderr if hasattr(e, 'stderr') else str(e)}"
                }
            
            # Create project structure
            self.logger.info("Creating project structure...")
            
            # Create directories
            dirs = [
                "app",
                "app/api",
                "app/api/routes",
                "app/core",
                "app/models",
                "app/services",
                "tests",
                "tests/api",
                "tests/unit"
            ]
            
            for dir_name in dirs:
                (project_path / dir_name).mkdir(parents=True, exist_ok=True)
                # Add __init__.py
                init_file = project_path / dir_name / "__init__.py"
                init_file.write_text("")
            
            # Create main.py
            main_content = '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, items

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(items.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI!", "docs": "/docs"}
'''
            (project_path / "app" / "main.py").write_text(main_content)
            
            # Create config.py
            config_content = '''from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "''' + project_name + '''"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5000"]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"


settings = Settings()
'''
            (project_path / "app" / "core" / "config.py").write_text(config_content)
            
            # Create health router
            health_content = '''from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "healthy"}
'''
            (project_path / "app" / "api" / "routes" / "health.py").write_text(health_content)
            
            # Create items router (example CRUD)
            items_content = '''from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/items", tags=["items"])


class Item(BaseModel):
    id: int
    name: str
    description: str = None
    price: float
    tax: float = None


class ItemCreate(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None


# In-memory storage for demo
items_db: dict[int, Item] = {}
next_id = 1


@router.get("/", response_model=List[Item])
async def list_items():
    return list(items_db.values())


@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    return items_db[item_id]


@router.post("/", response_model=Item)
async def create_item(item: ItemCreate):
    global next_id
    new_item = Item(id=next_id, **item.model_dump())
    items_db[next_id] = new_item
    next_id += 1
    return new_item


@router.delete("/{item_id}")
async def delete_item(item_id: int):
    if item_id not in items_db:
        raise HTTPException(status_code=404, detail="Item not found")
    del items_db[item_id]
    return {"message": "Item deleted"}
'''
            (project_path / "app" / "api" / "routes" / "items.py").write_text(items_content)
            
            # Create requirements.txt
            requirements = [
                "fastapi==0.104.1",
                "uvicorn[standard]==0.24.0",
                "pydantic==2.5.0",
                "pydantic-settings==2.1.0",
                "python-dotenv==1.0.0",
                "python-multipart==0.0.6",
                "httpx==0.25.2",
                "pytest==7.4.3",
                "pytest-asyncio==0.21.1",
            ]
            
            if include_db:
                requirements.extend([
                    "sqlalchemy==2.0.23",
                    "alembic==1.12.1",
                    "psycopg2-binary==2.9.9",
                ])
            
            if include_auth:
                requirements.extend([
                    "python-jose[cryptography]==3.3.0",
                    "passlib[bcrypt]==1.7.4",
                    "python-multipart==0.0.6",
                ])
            
            requirements_content = "\n".join(requirements)
            (project_path / "requirements.txt").write_text(requirements_content)
            
            # Create .env and .env.example
            env_content = '''# Project Settings
PROJECT_NAME="''' + project_name + '''"
VERSION="0.1.0"
API_V1_STR="/api/v1"

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5000"]

# Server
PORT=''' + str(port) + '''

# Database (if using)
# DATABASE_URL=postgresql://user:password@localhost/dbname

# Security (if using auth)
# SECRET_KEY=your-secret-key-here
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
# OPENAI_API_KEY=your-key-here
# AWS_ACCESS_KEY_ID=your-key-here
# AWS_SECRET_ACCESS_KEY=your-secret-here
'''
            (project_path / ".env.example").write_text(env_content)
            (project_path / ".env").write_text(env_content)
            
            # Create .gitignore
            gitignore_content = '''# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
ENV/
env/
*.egg-info/
dist/
build/

# FastAPI
.env
*.log

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/
.hypothesis/

# OS
.DS_Store
Thumbs.db
'''
            (project_path / ".gitignore").write_text(gitignore_content)
            
            # Create pytest.ini
            pytest_content = '''[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
'''
            (project_path / "pytest.ini").write_text(pytest_content)
            
            # Create a simple test
            test_content = '''from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to FastAPI!", "docs": "/docs"}


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}
'''
            (project_path / "tests" / "test_main.py").write_text(test_content)
            
            # Create run script
            run_content = '''#!/bin/bash
# Development server startup script

# Activate virtual environment
source .venv/bin/activate

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port ''' + str(port) + '''
'''
            run_script = project_path / "run_dev.sh"
            run_script.write_text(run_content)
            run_script.chmod(0o755)
            
            # Install dependencies
            self.logger.info("Installing dependencies...")
            try:
                # Check if uv is available
                uv_check = subprocess.run(["uv", "--version"], capture_output=True)
                
                if uv_check.returncode == 0:
                    # Use uv pip (much faster)
                    self.logger.info("Using uv pip for dependency installation...")
                    result = subprocess.run(
                        ["uv", "pip", "install", "-r", "requirements.txt"],
                        cwd=str(project_path),
                        capture_output=True,
                        text=True,
                        env={**os.environ, "VIRTUAL_ENV": str(venv_path)}
                    )
                    if result.returncode != 0:
                        self.logger.warning(f"uv pip install failed: {result.stderr}")
                        raise subprocess.CalledProcessError(result.returncode, result.args)
                else:
                    # Fallback to regular pip
                    subprocess.run(
                        [str(pip_path), "install", "-r", "requirements.txt"],
                        cwd=str(project_path),
                        check=True,
                        capture_output=True
                    )
            except subprocess.CalledProcessError as e:
                self.logger.warning(f"Failed to install some dependencies: {e}")
                # Continue anyway - user can install manually
            
            # Create README
            readme_content = f'''# {project_name}

FastAPI backend project created with Python 3.11.

## Setup

1. Activate virtual environment:
   ```bash
   source .venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run development server:
   ```bash
   ./run_dev.sh
   # or
   uvicorn app.main:app --reload
   ```

## API Documentation

Once running, visit:
- Interactive API docs: http://localhost:''' + str(port) + '''/docs
- Alternative API docs: http://localhost:''' + str(port) + '''/redoc

## Project Structure

```
{project_name}/
├── app/
│   ├── api/          # API routes
│   ├── core/         # Core functionality (config, security, etc.)
│   ├── models/       # Pydantic models
│   ├── services/     # Business logic
│   └── main.py       # FastAPI app entry point
├── tests/            # Test files
├── .venv/            # Virtual environment (Python 3.11)
├── requirements.txt  # Python dependencies
└── .env             # Environment variables
```

## Testing

Run tests with pytest:
```bash
pytest
```
'''
            (project_path / "README.md").write_text(readme_content)
            
            return {
                "success": True,
                "message": f"FastAPI project '{project_name}' created successfully",
                "project_path": str(project_path),
                "python_version": python_path,
                "features": {
                    "database": include_db,
                    "authentication": include_auth,
                    "testing": True,
                    "cors": True
                },
                "next_steps": [
                    f"cd {project_path}",
                    "source .venv/bin/activate",
                    "./run_dev.sh"
                ]
            }


# Create global server instance
server = BackendInitMCPServer()


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="BackendInit MCP Server (Host Version)")
    parser.add_argument("--workspace", type=str, help="Workspace path", default=None)
    
    args = parser.parse_args()
    
    if args.workspace:
        server.workspace_path = args.workspace
        server.logger.info(f"Workspace path set to: {args.workspace}")
    
    # Run the server
    server.mcp.run()


if __name__ == "__main__":
    main()