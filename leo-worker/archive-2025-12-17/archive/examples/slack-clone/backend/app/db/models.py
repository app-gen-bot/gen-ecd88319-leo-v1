"""
Pydantic models for data validation
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserStatus(str, Enum):
    ONLINE = "online"
    AWAY = "away"
    OFFLINE = "offline"


class UserRole(str, Enum):
    ADMIN = "Admin"
    MEMBER = "Member"


class ChannelType(str, Enum):
    PUBLIC = "Public"
    PRIVATE = "Private"


class NotificationType(str, Enum):
    MENTION = "mention"
    CHANNEL = "channel"
    DM = "dm"
    FILE = "file"


class ConversationType(str, Enum):
    DIRECT = "direct"
    GROUP = "group"


# Base Models
class TimestampMixin(BaseModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# User Models
class User(TimestampMixin):
    id: str
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None
    avatar_initials: Optional[str] = None
    status: UserStatus = UserStatus.OFFLINE
    role: UserRole = UserRole.MEMBER
    title: Optional[str] = None
    last_active_at: Optional[datetime] = None
    last_active_human: Optional[str] = None
    password_hash: Optional[str] = None  # Excluded in responses

    class Config:
        use_enum_values = True


# Workspace Models
class Workspace(TimestampMixin):
    id: str
    name: str
    owner_id: str
    total_members: int = 0
    total_channels: int = 0
    total_messages: int = 0
    storage_used: str = "0 GB"


class WorkspaceMember(BaseModel):
    workspace_id: str
    user_id: str
    role: UserRole = UserRole.MEMBER
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


# Channel Models
class Channel(TimestampMixin):
    id: str
    workspace_id: str
    name: str
    type: ChannelType = ChannelType.PUBLIC
    is_private: bool = False
    member_count: int = 0
    message_count: int = 0
    created_by: str
    created_human: Optional[str] = None


class ChannelMember(BaseModel):
    channel_id: str
    user_id: str
    unread_count: int = 0
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    joined_human: Optional[str] = None
    last_read_at: Optional[datetime] = None
    notification_preference: str = "all"  # all, mentions, none


# Message Models
class Message(TimestampMixin):
    id: str
    channel_id: Optional[str] = None
    conversation_id: Optional[str] = None
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    is_edited: bool = False
    edited_at: Optional[datetime] = None
    thread_count: int = 0
    parent_message_id: Optional[str] = None
    timestamp_human: Optional[str] = None


class MessageReaction(BaseModel):
    message_id: str
    emoji: str
    count: int = 0
    users: List[str] = []
    user_names: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Conversation Models
class Conversation(TimestampMixin):
    id: str
    workspace_id: str
    type: ConversationType = ConversationType.DIRECT
    name: Optional[str] = None
    last_message_id: Optional[str] = None
    last_message_preview: Optional[str] = None
    last_message_at: Optional[datetime] = None


class ConversationParticipant(BaseModel):
    conversation_id: str
    user_id: str
    unread_count: int = 0
    last_read_at: Optional[datetime] = None
    joined_at: datetime = Field(default_factory=datetime.utcnow)


# Notification Models
class Notification(TimestampMixin):
    id: str
    user_id: str
    workspace_id: str
    type: NotificationType
    title: str
    subtitle: str
    avatar_url: Optional[str] = None
    is_read: bool = False
    link_type: str  # channel, dm
    link_id: str
    timestamp_human: Optional[str] = None
    expires_at: Optional[datetime] = None


# File Models
class File(TimestampMixin):
    id: str
    workspace_id: str
    uploaded_by: str
    filename: str
    mimetype: str
    size: int  # bytes
    s3_key: str
    thumbnail_key: Optional[str] = None


# Presence Models
class Presence(BaseModel):
    user_id: str
    workspace_id: str
    status: UserStatus = UserStatus.OFFLINE
    status_message: Optional[str] = None
    last_active_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None