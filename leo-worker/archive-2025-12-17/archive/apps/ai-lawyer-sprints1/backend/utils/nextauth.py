"""
NextAuth JWT token validation for backend
"""

import jwt
import httpx
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Request, Depends
from config import settings
import os
from datetime import datetime

class NextAuthValidator:
    """Validator for NextAuth JWT tokens"""
    
    def __init__(self):
        self.secret = settings.better_auth_secret  # Using same secret
        self.algorithms = ["HS256"]
    
    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode and validate a NextAuth JWT token"""
        try:
            # NextAuth uses a specific JWT structure
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=self.algorithms,
                options={"verify_exp": True}
            )
            return payload
        except jwt.ExpiredSignatureError:
            print("[NextAuth] Token expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"[NextAuth] Invalid token: {e}")
            return None
        except Exception as e:
            print(f"[NextAuth] Error decoding token: {e}")
            return None


# Global validator instance
nextauth_validator = NextAuthValidator()


async def get_current_user_nextauth(
    request: Request
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user from NextAuth JWT token
    """
    # TEMPORARY: Auth bypass for debugging
    if settings.auth_bypass:
        print("[NextAuth Bypass] Using mock user for debugging")
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
    
    # Extract authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        # Check for NextAuth session token in cookies
        session_token = request.cookies.get("next-auth.session-token") or request.cookies.get("__Secure-next-auth.session-token")
        if not session_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = session_token
    else:
        token = authorization.replace("Bearer ", "")
    
    # Decode token
    payload = nextauth_validator.decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user info from NextAuth JWT
    user = {
        "id": payload.get("id", payload.get("sub")),
        "email": payload.get("email"),
        "name": payload.get("name", ""),
        "userType": payload.get("userType", "tenant"),
        "emailVerified": payload.get("emailVerified", False),
        "session_id": f"nextauth_{payload.get('jti', 'unknown')}",
        "session_expires_at": datetime.fromtimestamp(payload.get("exp", 0)).isoformat() + "Z"
    }
    
    if not user["id"] or not user["email"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token structure",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_active_user_nextauth(
    current_user: Dict[str, Any] = Depends(get_current_user_nextauth)
) -> Dict[str, Any]:
    """
    Dependency to ensure the user is active
    """
    # In NextAuth, users are always active unless explicitly disabled
    if current_user.get("disabled"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    return current_user