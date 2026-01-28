"""
Channel management endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.models import User, Channel, ChannelType
from app.services import ChannelService, WorkspaceService

router = APIRouter()


class CreateChannelRequest(BaseModel):
    workspace_id: str
    name: str
    type: ChannelType = ChannelType.PUBLIC
    description: Optional[str] = None


class ChannelResponse(BaseModel):
    id: str
    workspace_id: str
    name: str
    type: str
    is_private: bool
    member_count: int
    message_count: int
    created_by: str
    created_human: Optional[str]
    created_at: str
    description: Optional[str] = None


class ChannelMemberResponse(BaseModel):
    user_id: str
    name: str
    email: str
    avatar_url: Optional[str]
    avatar_initials: Optional[str]
    status: str
    title: Optional[str]
    joined_at: str
    joined_human: Optional[str]


@router.get("", response_model=List[ChannelResponse])
async def list_channels(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user: User = Depends(get_current_user)
):
    """List all channels in a workspace that user has access to"""
    workspace_service = WorkspaceService()
    channel_service = ChannelService()
    
    # Verify user has access to workspace
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not any(w.id == workspace_id for w in workspaces):
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    channels = await channel_service.list_workspace_channels(workspace_id, current_user.id)
    
    return [
        ChannelResponse(
            id=c.id,
            workspace_id=c.workspace_id,
            name=c.name,
            type=c.type,
            is_private=c.is_private,
            member_count=c.member_count,
            message_count=c.message_count,
            created_by=c.created_by,
            created_human=c.created_human,
            created_at=c.created_at.isoformat()
        )
        for c in channels
    ]


@router.get("/{channel_id}", response_model=ChannelResponse)
async def get_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get channel details"""
    channel_service = ChannelService()
    
    channel = await channel_service.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # TODO: Verify user has access to channel
    
    return ChannelResponse(
        id=channel.id,
        workspace_id=channel.workspace_id,
        name=channel.name,
        type=channel.type,
        is_private=channel.is_private,
        member_count=channel.member_count,
        message_count=channel.message_count,
        created_by=channel.created_by,
        created_human=channel.created_human,
        created_at=channel.created_at.isoformat()
    )


@router.post("", response_model=ChannelResponse)
async def create_channel(
    request: CreateChannelRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new channel"""
    workspace_service = WorkspaceService()
    channel_service = ChannelService()
    
    # Verify user has access to workspace
    workspaces = await workspace_service.get_user_workspaces(current_user.id)
    if not any(w.id == request.workspace_id for w in workspaces):
        raise HTTPException(status_code=403, detail="Access denied to workspace")
    
    channel = await channel_service.create_channel(
        workspace_id=request.workspace_id,
        name=request.name,
        created_by=current_user.id,
        created_by_name=current_user.name,
        channel_type=request.type,
        description=request.description
    )
    
    return ChannelResponse(
        id=channel.id,
        workspace_id=channel.workspace_id,
        name=channel.name,
        type=channel.type,
        is_private=channel.is_private,
        member_count=channel.member_count,
        message_count=channel.message_count,
        created_by=channel.created_by,
        created_human=channel.created_human,
        created_at=channel.created_at.isoformat(),
        description=request.description
    )


@router.post("/{channel_id}/join")
async def join_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Join a channel"""
    channel_service = ChannelService()
    
    # Get channel to verify it exists and is public
    channel = await channel_service.get_channel(channel_id)
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    if channel.is_private:
        raise HTTPException(status_code=403, detail="Cannot join private channel without invitation")
    
    success = await channel_service.join_channel(
        channel_id=channel_id,
        user_id=current_user.id,
        user_name=current_user.name
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to join channel")
    
    return {"status": "success"}


@router.post("/{channel_id}/leave")
async def leave_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Leave a channel"""
    channel_service = ChannelService()
    
    success = await channel_service.leave_channel(
        channel_id=channel_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to leave channel")
    
    return {"status": "success"}


@router.get("/{channel_id}/members", response_model=List[ChannelMemberResponse])
async def get_channel_members(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all members of a channel"""
    channel_service = ChannelService()
    
    # TODO: Verify user has access to channel
    
    members = await channel_service.get_channel_members(channel_id)
    
    return [
        ChannelMemberResponse(
            user_id=m["user_id"],
            name=m["name"],
            email=m["email"],
            avatar_url=m.get("avatar_url"),
            avatar_initials=m.get("avatar_initials"),
            status=m.get("status", "offline"),
            title=m.get("title"),
            joined_at=m["joined_at"],
            joined_human=m.get("joined_human")
        )
        for m in members
    ]


@router.post("/{channel_id}/read")
async def mark_channel_read(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark all messages in channel as read"""
    channel_service = ChannelService()
    
    success = await channel_service.mark_channel_read(
        channel_id=channel_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to mark channel as read")
    
    return {"status": "success"}