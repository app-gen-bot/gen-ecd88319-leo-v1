# Backend Development Guide

## Quick Commands

### Starting Development
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild after requirements change
docker-compose build backend
```

### Accessing the Application
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **DynamoDB Admin**: http://localhost:8002

### Running Commands Inside Container
```bash
# Access backend shell
docker-compose exec backend bash

# Run tests
docker-compose exec backend pytest

# Format code
docker-compose exec backend black app/

# Type checking
docker-compose exec backend mypy app/
```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints (routers)
│   ├── core/            # Core utilities (config, auth, logging)
│   ├── db/              # Database models and connections
│   ├── services/        # Business logic layer
│   ├── background/      # Background tasks (future)
│   └── main.py          # FastAPI app entry point
├── tests/               # Test files
├── docs/                # Documentation
└── docker-compose.yml   # Local development environment
```

## Adding New Features

### 1. Create a New API Endpoint

Example: Adding a "workspaces" endpoint

**Step 1**: Create the router file
```python
# app/api/v1/workspaces.py
from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.services.workspace_service import WorkspaceService

router = APIRouter()

@router.get("/")
async def list_workspaces(current_user = Depends(get_current_user)):
    service = WorkspaceService()
    return await service.get_user_workspaces(current_user.id)
```

**Step 2**: Create the service
```python
# app/services/workspace_service.py
class WorkspaceService:
    async def get_user_workspaces(self, user_id: str):
        # Business logic here
        pass
```

**Step 3**: Register the router
```python
# app/api/v1/__init__.py
from app.api.v1 import auth, workspaces  # Add import

router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
```

### 2. Working with DynamoDB

Example: Querying users by email
```python
from app.db.dynamodb import get_dynamodb_resource

async def get_user_by_email(email: str):
    async for dynamodb in get_dynamodb_resource():
        table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
        
        response = await table.query(
            IndexName="EmailIndex",
            KeyConditionExpression="email = :email",
            ExpressionAttributeValues={
                ":email": email
            }
        )
        
        items = response.get("Items", [])
        if items:
            return User(**items[0])
        return None
```

### 3. Adding WebSocket Support

Example: Basic WebSocket endpoint
```python
# app/api/v1/websocket.py
from fastapi import APIRouter, WebSocket, Depends
from app.core.security import verify_token

router = APIRouter()

@router.websocket("/")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Verify JWT token
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
    except:
        await websocket.close(code=1008)
        return
    
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            # Handle different message types
            await websocket.send_json({"echo": data})
    except:
        pass
```

## Environment Variables

Key variables in `.env`:
```bash
# Authentication
JWT_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS (use 'test' for local DynamoDB)
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
DYNAMODB_ENDPOINT_URL=http://dynamodb-local:8000

# Redis
REDIS_URL=redis://redis:6379
```

## Testing

### Unit Tests
```python
# tests/test_auth.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_register():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "password123",
                "name": "Test User",
                "workspace_name": "Test Workspace"
            }
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
```

### Running Tests
```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=app

# Run specific test
docker-compose exec backend pytest tests/test_auth.py::test_register
```

## Common Patterns

### Authentication Required
```python
@router.get("/protected")
async def protected_route(current_user = Depends(get_current_user)):
    return {"user": current_user.email}
```

### Error Handling
```python
from fastapi import HTTPException

@router.get("/items/{item_id}")
async def get_item(item_id: str):
    item = await get_item_from_db(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

### Pagination
```python
@router.get("/messages")
async def get_messages(
    channel_id: str,
    limit: int = Query(50, le=100),
    before: Optional[str] = None
):
    # Implementation
    pass
```

## Debugging Tips

1. **Check container logs**: `docker-compose logs -f backend`
2. **Interactive debugging**: Add `import pdb; pdb.set_trace()` in code
3. **API testing**: Use Swagger UI at http://localhost:8000/docs
4. **Database inspection**: Use DynamoDB Admin at http://localhost:8002
5. **Redis monitoring**: `docker-compose exec redis redis-cli MONITOR`

## Performance Considerations

1. **Use batch operations** for DynamoDB when possible
2. **Implement caching** with Redis for frequently accessed data
3. **Use pagination** for list endpoints
4. **Add indexes** for common query patterns
5. **Use async/await** properly - don't block the event loop

## Security Best Practices

1. **Always validate input** using Pydantic models
2. **Use parameterized queries** (DynamoDB does this automatically)
3. **Implement rate limiting** on sensitive endpoints
4. **Sanitize user content** before storing
5. **Use HTTPS in production** (handled by infrastructure)
6. **Keep secrets in environment variables**, never in code
7. **Implement CORS properly** for your frontend domain

## Next Steps

See [BACKEND_STATUS.md](./BACKEND_STATUS.md) for detailed next steps and implementation priorities.