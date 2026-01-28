"""
Authentication API endpoints - NextAuth integration

Note: NextAuth handles authentication flows (login, signup, etc.) on the frontend.
These endpoints provide additional authentication functionality.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

from utils.nextauth import get_current_active_user_nextauth as get_current_active_user
from services.email_service import email_service
from services.user_service import UserService
from db.operations import DynamoDBOperations
from config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

# Request models
class PasswordResetRequest(BaseModel):
    email: str = Field(..., description="User email for password reset")

class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., description="New password", min_length=8)

class EmailVerificationRequest(BaseModel):
    token: str = Field(..., description="Email verification token")


@router.post("/send-password-reset")
async def send_password_reset(request: PasswordResetRequest):
    """Send password reset email"""
    user_service = UserService()
    
    # Check if user exists
    user = await user_service.get_user_by_email(request.email)
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = user_service.generate_password_reset_token(user["id"])
    
    # Send email
    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
    await email_service.send_password_reset_email(
        email=request.email,
        reset_url=reset_url,
        user_name=user.get("name", "User")
    )
    
    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password with token"""
    user_service = UserService()
    
    # Verify token and reset password
    success = await user_service.reset_password_with_token(
        token=request.token,
        new_password=request.password
    )
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successful"}


@router.post("/send-verification-email")
async def send_verification_email(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Send email verification link"""
    if current_user.get("emailVerified"):
        return {"message": "Email already verified"}
    
    user_service = UserService()
    
    # Generate verification token
    verify_token = user_service.generate_email_verification_token(current_user["id"])
    
    # Send email
    verify_url = f"{settings.frontend_url}/verify-email?token={verify_token}"
    await email_service.send_verification_email(
        email=current_user["email"],
        verify_url=verify_url,
        user_name=current_user.get("name", "User")
    )
    
    return {"message": "Verification email sent"}


@router.post("/verify-email")
async def verify_email(request: EmailVerificationRequest):
    """Verify email with token"""
    user_service = UserService()
    
    # Verify token
    success = await user_service.verify_email_with_token(request.token)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )
    
    return {"message": "Email verified successfully"}


@router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """Get current user information"""
    return {
        "user": {
            "id": current_user.get("id"),
            "email": current_user.get("email"),
            "name": current_user.get("name", ""),
            "userType": current_user.get("userType", "tenant"),
            "emailVerified": current_user.get("emailVerified", False),
            "phone": current_user.get("phone"),
            "address": current_user.get("address"),
            "createdAt": current_user.get("createdAt"),
            "updatedAt": current_user.get("updatedAt"),
        }
    }