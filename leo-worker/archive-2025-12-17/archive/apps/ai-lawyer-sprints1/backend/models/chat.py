"""
Chat models for the API
"""

from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """Legal citation model"""
    law_code: str
    section: str
    title: str
    url: Optional[str] = None


class ChatMessage(BaseModel):
    """Chat message model"""
    id: str
    conversation_id: str
    user_id: str
    role: Literal["user", "assistant"]
    content: str
    citations: Optional[List[Citation]] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True


class ChatConversation(BaseModel):
    """Chat conversation model"""
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    message_count: int = 0
    
    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""
    conversation_id: str
    message: ChatMessage
    citations: List[Citation]


class ConversationListResponse(BaseModel):
    """Conversation list response"""
    conversations: List[ChatConversation]
    total: int
    page: int = 1
    page_size: int = 20


class ConversationDetailResponse(BaseModel):
    """Conversation detail response"""
    conversation: ChatConversation
    messages: List[ChatMessage]


class SearchConversationsRequest(BaseModel):
    """Search conversations request"""
    query: str = Field(..., min_length=1, max_length=200)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class ExportConversationResponse(BaseModel):
    """Export conversation response"""
    pdf_url: str
    filename: str


class ChatSuggestionsResponse(BaseModel):
    """Chat suggestions response"""
    suggestions: List[str]