"""
User models for the API
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    name: str
    user_type: Literal["tenant", "landlord"]


class UserCreate(UserBase):
    """User creation model"""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """User update model"""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class User(UserBase):
    """User response model"""
    id: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    email_verified: bool = False
    
    class Config:
        from_attributes = True


class UserInDB(User):
    """User database model"""
    hashed_password: str


class UserProfile(BaseModel):
    """User profile model"""
    user_id: str
    phone: Optional[str] = None
    current_rental_address: Optional[str] = None
    move_in_date: Optional[str] = None
    landlord_name: Optional[str] = None
    landlord_contact: Optional[str] = None
    preferences: Optional[dict] = Field(default_factory=lambda: {
        "notification_email": True,
        "notification_sms": False
    })


class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str
    refresh_token: str
    user: User
    expires_in: int = 3600


class SignupRequest(UserCreate):
    """Signup request model"""
    pass


class SignupResponse(BaseModel):
    """Signup response model"""
    user: User
    message: str