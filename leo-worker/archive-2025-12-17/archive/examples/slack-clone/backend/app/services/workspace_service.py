"""
Workspace service for business logic
"""
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import (
    Workspace, WorkspaceMember, Channel, ChannelType, 
    ChannelMember, User, UserRole
)
from app.db.dynamodb import get_dynamodb_resource

logger = get_logger(__name__)


class WorkspaceService:
    """Service for workspace-related operations"""
    
    async def create_workspace(self, user_id: str, workspace_name: str, user_name: str) -> Workspace:
        """Create a new workspace with default channels and add creator as admin"""
        workspace = Workspace(
            id=str(uuid.uuid4()),
            name=workspace_name,
            owner_id=user_id,
            total_members=1,
            total_channels=2  # #general and #random
        )
        
        try:
            async for dynamodb in get_dynamodb_resource():
                # Save workspace
                workspaces_table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                workspace_item = workspace.dict()
                workspace_item["PK"] = f"WORKSPACE#{workspace.id}"
                workspace_item["SK"] = f"WORKSPACE#{workspace.id}"
                workspace_item["created_at"] = workspace.created_at.isoformat()
                workspace_item["updated_at"] = workspace.updated_at.isoformat()
                
                await workspaces_table.put_item(Item=workspace_item)
                
                # Add user as workspace admin member
                await self.add_member(workspace.id, user_id, UserRole.ADMIN)
                
                # Create default channels
                await self._create_default_channels(workspace.id, user_id, user_name)
                
                logger.info("Created workspace", workspace_id=workspace.id, name=workspace.name)
                return workspace
                
        except Exception as e:
            logger.error("Error creating workspace", name=workspace_name, error=str(e))
            raise
    
    async def _create_default_channels(self, workspace_id: str, user_id: str, user_name: str):
        """Create default channels for a new workspace"""
        default_channels = [
            {
                "name": "general",
                "description": "General discussion for the whole team"
            },
            {
                "name": "random", 
                "description": "Non-work banter and random discussions"
            }
        ]
        
        try:
            async for dynamodb in get_dynamodb_resource():
                channels_table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                memberships_table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                for channel_data in default_channels:
                    # Create channel
                    channel = Channel(
                        id=str(uuid.uuid4()),
                        workspace_id=workspace_id,
                        name=channel_data["name"],
                        type=ChannelType.PUBLIC,
                        is_private=False,
                        member_count=1,
                        created_by=user_id,
                        created_human=user_name
                    )
                    
                    channel_item = channel.dict()
                    channel_item["PK"] = f"WORKSPACE#{workspace_id}"
                    channel_item["SK"] = f"CHANNEL#{channel.id}"
                    channel_item["channel_id"] = channel.id  # For GSI
                    channel_item["created_at"] = channel.created_at.isoformat()
                    channel_item["updated_at"] = channel.updated_at.isoformat()
                    
                    await channels_table.put_item(Item=channel_item)
                    
                    # Add creator as member
                    membership = ChannelMember(
                        channel_id=channel.id,
                        user_id=user_id,
                        unread_count=0,
                        joined_human=f"{user_name} created this channel"
                    )
                    
                    membership_item = membership.dict()
                    membership_item["PK"] = f"CHANNEL#{channel.id}"
                    membership_item["SK"] = f"USER#{user_id}"
                    membership_item["joined_at"] = membership.joined_at.isoformat()
                    if membership.last_read_at:
                        membership_item["last_read_at"] = membership.last_read_at.isoformat()
                    
                    await memberships_table.put_item(Item=membership_item)
                    
                    logger.info("Created default channel", channel_id=channel.id, name=channel.name)
                    
        except Exception as e:
            logger.error("Error creating default channels", workspace_id=workspace_id, error=str(e))
            raise
    
    async def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        """Get workspace by ID"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                response = await table.get_item(
                    Key={
                        "PK": f"WORKSPACE#{workspace_id}",
                        "SK": f"WORKSPACE#{workspace_id}"
                    }
                )
                
                item = response.get("Item")
                if item:
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    
                    return Workspace(**item)
                    
            return None
        except Exception as e:
            logger.error("Error getting workspace", workspace_id=workspace_id, error=str(e))
            return None
    
    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        """Get all workspaces a user is a member of"""
        try:
            workspaces = []
            workspace_ids = set()
            
            async for dynamodb in get_dynamodb_resource():
                # First, get all workspace memberships for the user
                # For MVP, we'll query workspaces by owner
                # In full implementation, would have a workspace memberships table
                workspaces_table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                # Get workspaces owned by user
                response = await workspaces_table.query(
                    IndexName="OwnerIndex",
                    KeyConditionExpression="owner_id = :owner_id",
                    ExpressionAttributeValues={
                        ":owner_id": user_id
                    }
                )
                
                for item in response.get("Items", []):
                    workspace_id = item["id"]
                    if workspace_id not in workspace_ids:
                        workspace_ids.add(workspace_id)
                        # Remove DynamoDB-specific fields
                        item.pop("PK", None)
                        item.pop("SK", None)
                        # Convert ISO strings to datetime
                        if "created_at" in item:
                            item["created_at"] = datetime.fromisoformat(item["created_at"])
                        if "updated_at" in item:
                            item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                        
                        workspaces.append(Workspace(**item))
                
                # TODO: Also query workspace memberships table when implemented
                
            return workspaces
            
        except Exception as e:
            logger.error("Error getting user workspaces", user_id=user_id, error=str(e))
            return []
    
    async def add_member(self, workspace_id: str, user_id: str, role: UserRole = UserRole.MEMBER) -> bool:
        """Add a user to a workspace"""
        try:
            async for dynamodb in get_dynamodb_resource():
                # Update workspace member count
                workspaces_table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                await workspaces_table.update_item(
                    Key={
                        "PK": f"WORKSPACE#{workspace_id}",
                        "SK": f"WORKSPACE#{workspace_id}"
                    },
                    UpdateExpression="SET total_members = total_members + :inc, updated_at = :updated",
                    ExpressionAttributeValues={
                        ":inc": 1,
                        ":updated": datetime.utcnow().isoformat()
                    }
                )
                
                # Create workspace membership record
                memberships_table = await dynamodb.Table(f"slack-clone-workspace-memberships-{settings.ENVIRONMENT}")
                
                membership_item = {
                    "PK": f"WORKSPACE#{workspace_id}",
                    "SK": f"USER#{user_id}",
                    "workspace_id": workspace_id,
                    "user_id": user_id,
                    "role": "admin" if role == UserRole.ADMIN else "member",
                    "joined_at": datetime.utcnow().isoformat(),
                    "is_active": True
                }
                
                await memberships_table.put_item(Item=membership_item)
                
                logger.info("Added member to workspace", workspace_id=workspace_id, user_id=user_id, role=role)
                return True
                
        except Exception as e:
            logger.error("Error adding member", workspace_id=workspace_id, user_id=user_id, error=str(e))
            return False
    
    async def update_workspace(self, workspace_id: str, name: Optional[str] = None) -> Optional[Workspace]:
        """Update workspace settings"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                update_expression = "SET updated_at = :updated"
                expression_values = {
                    ":updated": datetime.utcnow().isoformat()
                }
                
                if name:
                    update_expression += ", #name = :name"
                    expression_values[":name"] = name
                
                response = await table.update_item(
                    Key={
                        "PK": f"WORKSPACE#{workspace_id}",
                        "SK": f"WORKSPACE#{workspace_id}"
                    },
                    UpdateExpression=update_expression,
                    ExpressionAttributeNames={"#name": "name"} if name else None,
                    ExpressionAttributeValues=expression_values,
                    ReturnValues="ALL_NEW"
                )
                
                item = response.get("Attributes")
                if item:
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    
                    return Workspace(**item)
                    
            return None
        except Exception as e:
            logger.error("Error updating workspace", workspace_id=workspace_id, error=str(e))
            return None
    
    async def get_workspace_members(self, workspace_id: str) -> List[User]:
        """Get all members of a workspace"""
        try:
            members = []
            
            async for dynamodb in get_dynamodb_resource():
                # Query workspace memberships table
                memberships_table = await dynamodb.Table(f"slack-clone-workspace-memberships-{settings.ENVIRONMENT}")
                
                # Get all memberships for this workspace
                response = await memberships_table.query(
                    KeyConditionExpression="PK = :pk",
                    ExpressionAttributeValues={
                        ":pk": f"WORKSPACE#{workspace_id}"
                    }
                )
                
                membership_items = response.get("Items", [])
                
                if not membership_items:
                    return []
                
                # Extract user IDs
                user_ids = [item["user_id"] for item in membership_items if "user_id" in item]
                
                if not user_ids:
                    return []
                
                # Batch get users from users table
                users_table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                # DynamoDB batch_get_item requires specific format
                keys = [{"PK": f"USER#{user_id}", "SK": f"USER#{user_id}"} for user_id in user_ids]
                
                # Batch get users (max 100 at a time)
                for i in range(0, len(keys), 100):
                    batch_keys = keys[i:i+100]
                    response = await dynamodb.batch_get_item(
                        RequestItems={
                            f"slack-clone-users-{settings.ENVIRONMENT}": {
                                "Keys": batch_keys
                            }
                        }
                    )
                    
                    user_items = response.get("Responses", {}).get(f"slack-clone-users-{settings.ENVIRONMENT}", [])
                    
                    for item in user_items:
                        # Remove DynamoDB-specific fields
                        item.pop("PK", None)
                        item.pop("SK", None)
                        # Convert ISO strings to datetime
                        if "created_at" in item:
                            item["created_at"] = datetime.fromisoformat(item["created_at"])
                        if "updated_at" in item:
                            item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                        if "last_active_at" in item:
                            item["last_active_at"] = datetime.fromisoformat(item["last_active_at"])
                        
                        # Find the corresponding membership to get role
                        membership = next((m for m in membership_items if m.get("user_id") == item.get("id")), None)
                        if membership and "role" in membership:
                            # Map workspace role to user role enum
                            workspace_role = membership["role"]
                            if workspace_role == "admin":
                                item["role"] = UserRole.ADMIN
                            else:
                                item["role"] = UserRole.MEMBER
                        
                        members.append(User(**item))
            
            return members
            
        except Exception as e:
            logger.error("Error getting workspace members", workspace_id=workspace_id, error=str(e))
            return []
    
    async def switch_workspace(self, user_id: str, workspace_id: str) -> bool:
        """Switch user's active workspace"""
        # In full implementation, would update user's active workspace
        # For now, just verify workspace exists and user has access
        workspace = await self.get_workspace(workspace_id)
        return workspace is not None