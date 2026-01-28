"""
Workspace management endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.models import User, Workspace
from app.services import WorkspaceService

router = APIRouter()


class CreateWorkspaceRequest(BaseModel):
    name: str


class UpdateWorkspaceRequest(BaseModel):
    name: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    total_members: int
    total_channels: int
    total_messages: int
    storage_used: str
    created_at: str
    updated_at: str


@router.get("/", response_model=List[WorkspaceResponse])
async def list_workspaces(current_user: User = Depends(get_current_user)):
    """List all workspaces the user is a member of"""
    workspace_service = WorkspaceService()
    
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    
    return [
        WorkspaceResponse(
            id=w.id,
            name=w.name,
            owner_id=w.owner_id,
            total_members=w.total_members,
            total_channels=w.total_channels,
            total_messages=w.total_messages,
            storage_used=w.storage_used,
            created_at=w.created_at.isoformat(),
            updated_at=w.updated_at.isoformat()
        )
        for w in workspaces
    ]


@router.get("/current")
async def get_current_workspace(current_user: User = Depends(get_current_user)):
    """Get user's current active workspace"""
    workspace_service = WorkspaceService()
    
    # For now, return the first workspace
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not workspaces:
        raise HTTPException(status_code=404, detail="No workspace found")
    
    current_workspace = workspaces[0]
    
    return WorkspaceResponse(
        id=current_workspace.id,
        name=current_workspace.name,
        owner_id=current_workspace.owner_id,
        total_members=current_workspace.total_members,
        total_channels=current_workspace.total_channels,
        total_messages=current_workspace.total_messages,
        storage_used=current_workspace.storage_used,
        created_at=current_workspace.created_at.isoformat(),
        updated_at=current_workspace.updated_at.isoformat()
    )


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific workspace"""
    workspace_service = WorkspaceService()
    
    # Verify user has access
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not any(w.id == workspace_id for w in workspaces):
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    workspace = await workspace_service.get_workspace(workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        owner_id=workspace.owner_id,
        total_members=workspace.total_members,
        total_channels=workspace.total_channels,
        total_messages=workspace.total_messages,
        storage_used=workspace.storage_used,
        created_at=workspace.created_at.isoformat(),
        updated_at=workspace.updated_at.isoformat()
    )


@router.post("/", response_model=WorkspaceResponse)
async def create_workspace(
    request: CreateWorkspaceRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new workspace"""
    workspace_service = WorkspaceService()
    
    workspace = await workspace_service.create_workspace(
        user_id=current_user.id,
        workspace_name=request.name,
        user_name=current_user.name
    )
    
    return WorkspaceResponse(
        id=workspace.id,
        name=workspace.name,
        owner_id=workspace.owner_id,
        total_members=workspace.total_members,
        total_channels=workspace.total_channels,
        total_messages=workspace.total_messages,
        storage_used=workspace.storage_used,
        created_at=workspace.created_at.isoformat(),
        updated_at=workspace.updated_at.isoformat()
    )


@router.put("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    request: UpdateWorkspaceRequest,
    current_user: User = Depends(get_current_user)
):
    """Update workspace settings (owner only)"""
    workspace_service = WorkspaceService()
    
    # Get workspace and verify ownership
    workspace = await workspace_service.get_workspace(workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    if workspace.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only workspace owner can update settings")
    
    # Update workspace
    updated_workspace = await workspace_service.update_workspace(
        workspace_id=workspace_id,
        name=request.name
    )
    
    if not updated_workspace:
        raise HTTPException(status_code=500, detail="Failed to update workspace")
    
    return WorkspaceResponse(
        id=updated_workspace.id,
        name=updated_workspace.name,
        owner_id=updated_workspace.owner_id,
        total_members=updated_workspace.total_members,
        total_channels=updated_workspace.total_channels,
        total_messages=updated_workspace.total_messages,
        storage_used=updated_workspace.storage_used,
        created_at=updated_workspace.created_at.isoformat(),
        updated_at=updated_workspace.updated_at.isoformat()
    )


@router.post("/{workspace_id}/switch")
async def switch_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user)
):
    """Switch to a different workspace"""
    workspace_service = WorkspaceService()
    
    success = await workspace_service.switch_workspace(current_user.id, workspace_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot switch to workspace")
    
    return {"status": "success", "workspace_id": workspace_id}