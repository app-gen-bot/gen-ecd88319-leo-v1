"""
Conversation history API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any

from models.chat import (
    ConversationListResponse,
    ConversationDetailResponse,
    SearchConversationsRequest,
    ExportConversationResponse
)
from services.chat_service import ChatService
from services.pdf_service import pdf_service
from services.user_service import UserService
from api.dependencies import get_current_active_user

router = APIRouter(prefix="/conversations", tags=["conversations"])
chat_service = ChatService()


@router.get("", response_model=ConversationListResponse)
async def get_conversations(
    current_user: Dict[str, Any] = Depends(get_current_active_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100)
):
    """Get user's conversations"""
    conversations = chat_service.get_user_conversations(
        current_user.get('id'),
        limit=page_size
    )
    
    return ConversationListResponse(
        conversations=conversations,
        total=len(conversations),
        page=page,
        page_size=page_size
    )


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation_detail(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get conversation with messages"""
    result = chat_service.get_conversation_messages(
        conversation_id,
        current_user.get('id')
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation, messages = result
    
    return ConversationDetailResponse(
        conversation=conversation,
        messages=messages
    )


@router.post("/search", response_model=ConversationListResponse)
async def search_conversations(
    request: SearchConversationsRequest,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Search conversations"""
    # For now, just return all conversations that might contain the query
    # In a real implementation, you'd use full-text search
    all_conversations = chat_service.get_user_conversations(current_user.id)
    
    # Simple search implementation
    filtered = []
    for conv in all_conversations:
        if request.query.lower() in conv.title.lower():
            filtered.append(conv)
        elif conv.last_message and request.query.lower() in conv.last_message.lower():
            filtered.append(conv)
    
    # Apply pagination
    start = (request.page - 1) * request.page_size
    end = start + request.page_size
    
    return ConversationListResponse(
        conversations=filtered[start:end],
        total=len(filtered),
        page=request.page,
        page_size=request.page_size
    )


@router.post("/{conversation_id}/export", response_model=ExportConversationResponse)
async def export_conversation(
    conversation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Export conversation as PDF"""
    result = chat_service.get_conversation_messages(
        conversation_id,
        current_user.get('id')
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation, messages = result
    
    # Get user details
    user_service = UserService()
    user = user_service.get_user(current_user.get('id'))
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate PDF using the PDF service
    pdf_url, filename = pdf_service.generate_conversation_pdf(
        conversation,
        messages,
        user
    )
    
    return ExportConversationResponse(
        pdf_url=pdf_url,
        filename=filename
    )