"""
Chat API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from models.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatSuggestionsResponse
)
from services.chat_service import ChatService
from api.dependencies import get_current_active_user

router = APIRouter(prefix="/chat", tags=["chat"])
chat_service = ChatService()


@router.post("/message", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Send a chat message and get AI response"""
    try:
        response = await chat_service.send_message(
            user_id=current_user.get('id'),
            message=request.message,
            conversation_id=request.conversation_id
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions", response_model=ChatSuggestionsResponse)
async def get_chat_suggestions(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get chat suggestions"""
    suggestions = chat_service.get_suggestions()
    return ChatSuggestionsResponse(suggestions=suggestions)