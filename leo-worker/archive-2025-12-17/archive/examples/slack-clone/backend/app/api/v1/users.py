"""
User management endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.models import User, UserStatus
from app.services import UserService, WorkspaceService

router = APIRouter()


class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    avatar_url: Optional[str] = None


class UpdatePresenceRequest(BaseModel):
    status: UserStatus
    status_message: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str]
    avatar_initials: Optional[str]
    status: str
    role: str
    title: Optional[str]
    last_active_at: Optional[str]
    last_active_human: Optional[str]


@router.get("", response_model=List[UserResponse])
async def list_workspace_users(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user: User = Depends(get_current_user)
):
    """List all users in a workspace"""
    workspace_service = WorkspaceService()
    
    # Verify user has access to workspace
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not any(w.id == workspace_id for w in workspaces):
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    # Get workspace members
    users = await workspace_service.get_workspace_members(workspace_id)
    
    # Convert to response format
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            avatar_initials=user.avatar_initials,
            status=user.status,
            role=user.role,
            title=user.title,
            last_active_at=user.last_active_at.isoformat() if user.last_active_at else None,
            last_active_human=user.last_active_human
        )
        for user in users
    ]


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatar_url=current_user.avatar_url,
        avatar_initials=current_user.avatar_initials,
        status=current_user.status,
        role=current_user.role,
        title=current_user.title,
        last_active_at=current_user.last_active_at.isoformat() if current_user.last_active_at else None,
        last_active_human=current_user.last_active_human
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific user's profile"""
    user_service = UserService()
    
    user = await user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # TODO: Verify they share a workspace
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url,
        avatar_initials=user.avatar_initials,
        status=user.status,
        role=user.role,
        title=user.title,
        last_active_at=user.last_active_at.isoformat() if user.last_active_at else None,
        last_active_human=user.last_active_human
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    request: UpdateUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    # TODO: Implement user update in UserService
    # For now, return current user
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=request.name or current_user.name,
        avatar_url=request.avatar_url or current_user.avatar_url,
        avatar_initials=current_user.avatar_initials,
        status=current_user.status,
        role=current_user.role,
        title=request.title or current_user.title,
        last_active_at=current_user.last_active_at.isoformat() if current_user.last_active_at else None,
        last_active_human=current_user.last_active_human
    )


@router.post("/presence")
async def update_presence(
    request: UpdatePresenceRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user's presence status"""
    user_service = UserService()
    
    success = await user_service.update_user_presence(
        current_user.id,
        request.status,
        request.status_message
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update presence")
    
    return {"status": "success"}


@router.get("/online", response_model=List[UserResponse])
async def get_online_users(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user: User = Depends(get_current_user)
):
    """Get all online users in a workspace"""
    workspace_service = WorkspaceService()
    
    # Verify user has access to workspace
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not any(w.id == workspace_id for w in workspaces):
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    # Get all workspace members and filter online ones
    users = await workspace_service.get_workspace_members(workspace_id)
    online_users = [u for u in users if u.status == UserStatus.ONLINE]
    
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatar_url=user.avatar_url,
            avatar_initials=user.avatar_initials,
            status=user.status,
            role=user.role,
            title=user.title,
            last_active_at=user.last_active_at.isoformat() if user.last_active_at else None,
            last_active_human=user.last_active_human
        )
        for user in online_users
    ]