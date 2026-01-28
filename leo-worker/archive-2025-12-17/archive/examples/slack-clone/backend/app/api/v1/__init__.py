"""
API v1 router aggregation
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, workspaces, channels, messages

router = APIRouter()

# Include routers
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
router.include_router(channels.router, prefix="/channels", tags=["Channels"])
router.include_router(messages.router, prefix="/messages", tags=["Messages"])

# Future routers
# router.include_router(files.router, prefix="/files", tags=["Files"])
# router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])