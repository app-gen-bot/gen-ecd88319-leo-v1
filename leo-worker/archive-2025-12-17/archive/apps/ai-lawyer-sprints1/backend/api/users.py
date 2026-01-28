"""
User API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from pydantic import BaseModel, Field, EmailStr
import bcrypt

from models.user import UserProfile
from services.user_service import UserService
from api.dependencies import get_current_active_user

router = APIRouter(prefix="/users", tags=["users"])
user_service = UserService()


class UserRegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="User password")
    name: str = Field(..., description="User full name")
    userType: str = Field(..., pattern="^(tenant|landlord)$", description="User type")


@router.post("/register")
async def register_user(request: UserRegisterRequest):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await user_service.get_user_by_email_async(request.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = bcrypt.hashpw(request.password.encode('utf-8'), bcrypt.gensalt())
        
        # Create the user
        user_data = {
            "email": request.email,
            "name": request.name,
            "user_type": request.userType,
            "hashed_password": hashed_password.decode('utf-8'),
            "email_verified": False
        }
        
        user = await user_service.create_user(user_data)
        
        return {
            "message": "User created successfully",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "userType": user["user_type"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user: {str(e)}"
        )


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get user profile"""
    profile = user_service.get_user_profile(current_user.get('id'))
    if not profile:
        # Create default profile if it doesn't exist
        profile = UserProfile(
            user_id=current_user.get('id'),
            phone=current_user.get('phone'),
            preferences={
                "notification_email": True,
                "notification_sms": False
            }
        )
    return profile


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    profile_data: dict,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Update user profile"""
    try:
        updated_profile = user_service.update_user_profile(
            current_user.get('id'),
            profile_data
        )
        return updated_profile
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))