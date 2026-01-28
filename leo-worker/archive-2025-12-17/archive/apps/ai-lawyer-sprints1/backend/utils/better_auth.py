"""
Better Auth integration for backend authentication
"""

import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException, Security, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Union
from config import settings

# Security scheme for OpenAPI
security = HTTPBearer()


class BetterAuthClient:
    """Client for interacting with Better Auth service"""
    
    def __init__(self):
        self.base_url = settings.better_auth_url
        self.secret = settings.better_auth_secret
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT token with Better Auth"""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/auth/verify-token",
                json={"token": token},
                headers={"Authorization": f"Bearer {self.secret}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("session")
            
            return None
        except Exception as e:
            print(f"Error verifying token: {e}")
            return None
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user details from Better Auth"""
        try:
            response = await self.client.get(
                f"{self.base_url}/api/auth/users/{user_id}",
                headers={"Authorization": f"Bearer {self.secret}"}
            )
            
            if response.status_code == 200:
                return response.json()
            
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Global Better Auth client instance
better_auth_client = BetterAuthClient()


async def get_current_user(
    request: Request
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user from Better Auth token
    """
    # TEMPORARY: Auth bypass for debugging
    if settings.auth_bypass:
        print("[Auth Bypass] Using mock user for debugging")
        return {
            "id": "demo_user_123",
            "email": "demo@example.com",
            "name": "Demo User",
            "userType": "tenant",
            "emailVerified": True,
            "mfaEnabled": False,
            "session_id": "mock_session_123",
            "session_expires_at": "2025-12-31T23:59:59Z",
            "createdAt": "2025-01-01T00:00:00Z",
            "updatedAt": "2025-01-01T00:00:00Z"
        }
    
    # Extract credentials from request
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Verify token with Better Auth
    session = await better_auth_client.verify_token(token)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if session is expired
    if session.get("expiresAt"):
        import datetime
        expires_at = datetime.datetime.fromisoformat(session["expiresAt"].replace('Z', '+00:00'))
        if expires_at < datetime.datetime.now(datetime.timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Get user details
    user = session.get("user")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found in session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Add session info to user
    user["session_id"] = session.get("id")
    user["session_expires_at"] = session.get("expiresAt")
    
    return user


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Dependency to ensure the user is active
    """
    # In Better Auth, users are always active unless explicitly disabled
    # You can add additional checks here if needed
    
    if current_user.get("disabled"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return current_user


async def require_user_type(required_type: str):
    """
    Dependency factory to require a specific user type
    """
    async def _require_user_type(
        current_user: Dict[str, Any] = Security(get_current_active_user)
    ) -> Dict[str, Any]:
        user_type = current_user.get("userType", "tenant")
        
        if user_type != required_type:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to {required_type}s only"
            )
        
        return current_user
    
    return _require_user_type


# Convenience dependencies
require_tenant = require_user_type("tenant")
require_landlord = require_user_type("landlord")