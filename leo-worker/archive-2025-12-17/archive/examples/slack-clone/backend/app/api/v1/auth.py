"""
Authentication endpoints
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.db.models import User
from app.services.user_service import UserService

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    workspace_name: str


class RegisterResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict
    workspace: dict


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    """
    Register a new user and create their first workspace
    """
    user_service = UserService()
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create user
    user = await user_service.create_user(
        email=request.email,
        password=request.password,
        name=request.name
    )
    
    # Create workspace
    workspace = await user_service.create_workspace(
        user_id=user.id,
        workspace_name=request.workspace_name
    )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_access_token(
        data={"sub": user.id, "type": "refresh"},
        expires_delta=timedelta(days=30)
    )
    
    return RegisterResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user.dict(exclude={"password_hash"}),
        workspace=workspace.dict()
    )


@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with email and password
    """
    user_service = UserService()
    
    # Authenticate user
    user = await user_service.authenticate_user(
        email=form_data.username,  # OAuth2 form uses 'username' field
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user's workspaces
    workspaces = await user_service.get_user_workspaces(user.id)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_access_token(
        data={"sub": user.id, "type": "refresh"},
        expires_delta=timedelta(days=30)
    )
    
    user_data = user.dict(exclude={"password_hash"})
    user_data["workspaces"] = [w.dict() for w in workspaces]
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_data
    )


@router.post("/logout")
async def logout():
    """
    Logout current user (client should discard tokens)
    """
    # In a more complex implementation, we might invalidate the token in Redis
    return {"message": "Logged out successfully"}


@router.get("/session")
async def get_session(current_user: User = Depends(get_current_user)):
    """
    Check current session validity
    """
    return {
        "valid": True,
        "user": current_user.dict(exclude={"password_hash"}),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRATION_DAYS)).isoformat()
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    """
    # TODO: Implement refresh token validation
    # For now, this is a placeholder
    return {
        "access_token": "new_access_token",
        "refresh_token": "new_refresh_token"
    }


# TODO: Implement Google OAuth endpoints
# @router.get("/google")
# @router.get("/google/callback")