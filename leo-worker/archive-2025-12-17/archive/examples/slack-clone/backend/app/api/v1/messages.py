"""
Message management endpoints
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.models import User, Message
from app.services import MessageService, ChannelService

router = APIRouter()


class SendMessageRequest(BaseModel):
    channel_id: Optional[str] = None
    conversation_id: Optional[str] = None
    content: str
    parent_message_id: Optional[str] = None


class EditMessageRequest(BaseModel):
    content: str


class ReactionRequest(BaseModel):
    emoji: str


class MessageResponse(BaseModel):
    id: str
    channel_id: Optional[str]
    conversation_id: Optional[str]
    user_id: str
    user_name: str
    user_avatar: Optional[str]
    content: str
    is_edited: bool
    edited_at: Optional[str]
    thread_count: int
    parent_message_id: Optional[str]
    timestamp_human: Optional[str]
    created_at: str
    reactions: List[dict] = []


@router.get("", response_model=List[MessageResponse])
async def get_messages(
    channel_id: Optional[str] = Query(None),
    conversation_id: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    before: Optional[str] = Query(None, description="ISO timestamp"),
    after: Optional[str] = Query(None, description="ISO timestamp"),
    current_user: User = Depends(get_current_user)
):
    """Get messages from a channel or conversation"""
    if not channel_id and not conversation_id:
        raise HTTPException(status_code=400, detail="Either channel_id or conversation_id required")
    
    message_service = MessageService()
    
    # TODO: Verify user has access to channel/conversation
    
    messages = await message_service.get_messages(
        channel_id=channel_id,
        conversation_id=conversation_id,
        limit=limit,
        before=before,
        after=after
    )
    
    return [
        MessageResponse(
            id=m.id,
            channel_id=m.channel_id,
            conversation_id=m.conversation_id,
            user_id=m.user_id,
            user_name=m.user_name,
            user_avatar=m.user_avatar,
            content=m.content,
            is_edited=m.is_edited,
            edited_at=m.edited_at.isoformat() if m.edited_at else None,
            thread_count=m.thread_count,
            parent_message_id=m.parent_message_id,
            timestamp_human=m.timestamp_human,
            created_at=m.created_at.isoformat(),
            reactions=getattr(m, 'reactions', [])
        )
        for m in messages
    ]


@router.post("", response_model=MessageResponse)
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Send a message"""
    message_service = MessageService()
    
    # TODO: Verify user has access to channel/conversation
    
    message = await message_service.send_message(
        channel_id=request.channel_id,
        conversation_id=request.conversation_id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_avatar=current_user.avatar_url,
        content=request.content,
        parent_message_id=request.parent_message_id
    )
    
    return MessageResponse(
        id=message.id,
        channel_id=message.channel_id,
        conversation_id=message.conversation_id,
        user_id=message.user_id,
        user_name=message.user_name,
        user_avatar=message.user_avatar,
        content=message.content,
        is_edited=message.is_edited,
        edited_at=message.edited_at.isoformat() if message.edited_at else None,
        thread_count=message.thread_count,
        parent_message_id=message.parent_message_id,
        timestamp_human=message.timestamp_human,
        created_at=message.created_at.isoformat(),
        reactions=[]
    )


@router.put("/{message_id}", response_model=MessageResponse)
async def edit_message(
    message_id: str,
    request: EditMessageRequest,
    current_user: User = Depends(get_current_user)
):
    """Edit a message (within 5 minute window)"""
    message_service = MessageService()
    
    message = await message_service.edit_message(
        message_id=message_id,
        user_id=current_user.id,
        new_content=request.content
    )
    
    if not message:
        raise HTTPException(status_code=400, detail="Cannot edit message")
    
    return MessageResponse(
        id=message.id,
        channel_id=message.channel_id,
        conversation_id=message.conversation_id,
        user_id=message.user_id,
        user_name=message.user_name,
        user_avatar=message.user_avatar,
        content=message.content,
        is_edited=message.is_edited,
        edited_at=message.edited_at.isoformat() if message.edited_at else None,
        thread_count=message.thread_count,
        parent_message_id=message.parent_message_id,
        timestamp_human=message.timestamp_human,
        created_at=message.created_at.isoformat(),
        reactions=getattr(message, 'reactions', [])
    )


@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a message"""
    message_service = MessageService()
    
    success = await message_service.delete_message(
        message_id=message_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete message")
    
    return {"status": "success"}


@router.post("/{message_id}/reactions")
async def add_reaction(
    message_id: str,
    request: ReactionRequest,
    current_user: User = Depends(get_current_user)
):
    """Add a reaction to a message"""
    message_service = MessageService()
    
    success = await message_service.add_reaction(
        message_id=message_id,
        user_id=current_user.id,
        user_name=current_user.name,
        emoji=request.emoji
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add reaction")
    
    return {"status": "success"}


@router.delete("/{message_id}/reactions/{emoji}")
async def remove_reaction(
    message_id: str,
    emoji: str,
    current_user: User = Depends(get_current_user)
):
    """Remove a reaction from a message"""
    message_service = MessageService()
    
    success = await message_service.remove_reaction(
        message_id=message_id,
        user_id=current_user.id,
        emoji=emoji
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to remove reaction")
    
    return {"status": "success"}


@router.get("/{message_id}/thread", response_model=List[MessageResponse])
async def get_thread_messages(
    message_id: str,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user)
):
    """Get all replies to a message (thread)"""
    message_service = MessageService()
    
    messages = await message_service.get_thread_messages(
        parent_message_id=message_id,
        limit=limit
    )
    
    return [
        MessageResponse(
            id=m.id,
            channel_id=m.channel_id,
            conversation_id=m.conversation_id,
            user_id=m.user_id,
            user_name=m.user_name,
            user_avatar=m.user_avatar,
            content=m.content,
            is_edited=m.is_edited,
            edited_at=m.edited_at.isoformat() if m.edited_at else None,
            thread_count=m.thread_count,
            parent_message_id=m.parent_message_id,
            timestamp_human=m.timestamp_human,
            created_at=m.created_at.isoformat(),
            reactions=getattr(m, 'reactions', [])
        )
        for m in messages
    ]