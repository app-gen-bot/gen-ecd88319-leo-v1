"""
User service for business logic
"""
from typing import Optional, List
from datetime import datetime
import uuid

from botocore.exceptions import ClientError

from app.core.security import get_password_hash, verify_password
from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import User, Workspace, WorkspaceMember, UserStatus
from app.db.dynamodb import get_dynamodb_resource

logger = get_logger(__name__)


class UserService:
    """Service for user-related operations"""
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email using EmailIndex"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                response = await table.query(
                    IndexName="EmailIndex",
                    KeyConditionExpression="email = :email",
                    ExpressionAttributeValues={
                        ":email": email
                    }
                )
                
                items = response.get("Items", [])
                if items:
                    # Remove DynamoDB-specific fields
                    user_data = items[0]
                    user_data.pop("PK", None)
                    user_data.pop("SK", None)
                    return User(**user_data)
                    
            return None
        except Exception as e:
            logger.error("Error getting user by email", email=email, error=str(e))
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                response = await table.get_item(
                    Key={
                        "PK": f"USER#{user_id}",
                        "SK": f"USER#{user_id}"
                    }
                )
                
                item = response.get("Item")
                if item:
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    return User(**item)
                    
            return None
        except Exception as e:
            logger.error("Error getting user by id", user_id=user_id, error=str(e))
            return None
    
    async def create_user(self, email: str, password: str, name: str) -> User:
        """Create a new user and save to DynamoDB"""
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            password_hash=get_password_hash(password),
            avatar_initials=self._get_initials(name),
            status=UserStatus.ONLINE,  # Set as online when creating
            last_active_at=datetime.utcnow()
        )
        
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                # Prepare item with DynamoDB keys
                item = user.dict()
                item["PK"] = f"USER#{user.id}"
                item["SK"] = f"USER#{user.id}"
                
                # Convert datetime to ISO string
                item["created_at"] = user.created_at.isoformat()
                item["updated_at"] = user.updated_at.isoformat()
                if user.last_active_at:
                    item["last_active_at"] = user.last_active_at.isoformat()
                
                await table.put_item(Item=item)
                
                logger.info("Created user", user_id=user.id, email=user.email)
                return user
                
        except Exception as e:
            logger.error("Error creating user", email=email, error=str(e))
            raise
    
    async def update_user_presence(self, user_id: str, status: UserStatus, status_message: Optional[str] = None) -> bool:
        """Update user presence status"""
        try:
            async for dynamodb in get_dynamodb_resource():
                # Update user status
                users_table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                await users_table.update_item(
                    Key={
                        "PK": f"USER#{user_id}",
                        "SK": f"USER#{user_id}"
                    },
                    UpdateExpression="SET #status = :status, last_active_at = :last_active",
                    ExpressionAttributeNames={
                        "#status": "status"
                    },
                    ExpressionAttributeValues={
                        ":status": status.value,
                        ":last_active": datetime.utcnow().isoformat()
                    }
                )
                
                # Also update presence table for workspace-specific status
                # This will be implemented when we have workspace context
                
                return True
                
        except Exception as e:
            logger.error("Error updating user presence", user_id=user_id, error=str(e))
            return False
    
    async def create_workspace(self, user_id: str, workspace_name: str) -> Workspace:
        """Create a new workspace with default channels"""
        # Delegate to WorkspaceService
        from app.services.workspace_service import WorkspaceService
        
        # Get user name for channel creation messages
        user = await self.get_user_by_id(user_id)
        user_name = user.name if user else "Unknown User"
        
        workspace_service = WorkspaceService()
        return await workspace_service.create_workspace(user_id, workspace_name, user_name)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
            
        # Update last active timestamp
        await self.update_user_presence(user.id, UserStatus.ONLINE)
        
        return user
    
    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        """Get all workspaces for a user"""
        try:
            workspaces = []
            
            async for dynamodb in get_dynamodb_resource():
                # For now, query workspaces by owner
                # In full implementation, would query workspace memberships
                workspaces_table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                response = await workspaces_table.query(
                    IndexName="OwnerIndex",
                    KeyConditionExpression="owner_id = :owner_id",
                    ExpressionAttributeValues={
                        ":owner_id": user_id
                    }
                )
                
                for item in response.get("Items", []):
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings back to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    
                    workspaces.append(Workspace(**item))
                
            return workspaces
            
        except Exception as e:
            logger.error("Error getting user workspaces", user_id=user_id, error=str(e))
            return []
    
    async def get_users_by_workspace(self, workspace_id: str) -> List[User]:
        """Get all users in a workspace"""
        # This will be properly implemented when WorkspaceService is created
        # For now, return empty list
        return []
    
    def _get_initials(self, name: str) -> str:
        """Get initials from name"""
        parts = name.split()
        if len(parts) >= 2:
            return parts[0][0].upper() + parts[-1][0].upper()
        elif parts:
            return parts[0][0:2].upper()
        return "??"