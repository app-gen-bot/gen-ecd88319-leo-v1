"""
Channel service for business logic
"""
from typing import List, Optional, Dict
from datetime import datetime
import uuid

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import Channel, ChannelType, ChannelMember, User
from app.db.dynamodb import get_dynamodb_resource

logger = get_logger(__name__)


class ChannelService:
    """Service for channel-related operations"""
    
    async def create_channel(
        self, 
        workspace_id: str, 
        name: str, 
        created_by: str,
        created_by_name: str,
        channel_type: ChannelType = ChannelType.PUBLIC,
        description: Optional[str] = None
    ) -> Channel:
        """Create a new channel and add creator as first member"""
        channel = Channel(
            id=str(uuid.uuid4()),
            workspace_id=workspace_id,
            name=name.lower().replace(" ", "-"),  # Normalize channel names
            type=channel_type,
            is_private=(channel_type == ChannelType.PRIVATE),
            member_count=1,
            message_count=0,
            created_by=created_by,
            created_human=created_by_name
        )
        
        try:
            async for dynamodb in get_dynamodb_resource():
                # Save channel
                channels_table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                
                channel_item = channel.dict()
                channel_item["PK"] = f"WORKSPACE#{workspace_id}"
                channel_item["SK"] = f"CHANNEL#{channel.id}"
                channel_item["channel_id"] = channel.id  # For GSI
                channel_item["created_at"] = channel.created_at.isoformat()
                channel_item["updated_at"] = channel.updated_at.isoformat()
                if description:
                    channel_item["description"] = description
                
                await channels_table.put_item(Item=channel_item)
                
                # Add creator as member
                await self.join_channel(channel.id, created_by, created_by_name, is_creator=True)
                
                # Update workspace channel count
                await self._update_workspace_channel_count(workspace_id, 1)
                
                logger.info("Created channel", channel_id=channel.id, name=channel.name)
                return channel
                
        except Exception as e:
            logger.error("Error creating channel", name=name, error=str(e))
            raise
    
    async def get_channel(self, channel_id: str) -> Optional[Channel]:
        """Get channel by ID"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                
                # Use GSI to get channel by ID
                response = await table.query(
                    IndexName="ChannelIdIndex",
                    KeyConditionExpression="channel_id = :channel_id",
                    ExpressionAttributeValues={
                        ":channel_id": channel_id
                    }
                )
                
                items = response.get("Items", [])
                if items:
                    item = items[0]
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    item.pop("channel_id", None)  # Remove duplicate
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    
                    return Channel(**item)
                    
            return None
        except Exception as e:
            logger.error("Error getting channel", channel_id=channel_id, error=str(e))
            return None
    
    async def list_workspace_channels(self, workspace_id: str, user_id: str) -> List[Channel]:
        """List all channels in a workspace that user has access to"""
        try:
            channels = []
            
            async for dynamodb in get_dynamodb_resource():
                channels_table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                
                # Query all channels in workspace
                response = await channels_table.query(
                    KeyConditionExpression="PK = :pk AND begins_with(SK, :sk_prefix)",
                    ExpressionAttributeValues={
                        ":pk": f"WORKSPACE#{workspace_id}",
                        ":sk_prefix": "CHANNEL#"
                    }
                )
                
                # Get user's channel memberships
                user_channels = await self._get_user_channels(user_id)
                
                for item in response.get("Items", []):
                    # Include public channels and private channels user is member of
                    if not item.get("is_private", False) or item["id"] in user_channels:
                        # Remove DynamoDB-specific fields
                        item.pop("PK", None)
                        item.pop("SK", None)
                        item.pop("channel_id", None)
                        # Convert ISO strings to datetime
                        if "created_at" in item:
                            item["created_at"] = datetime.fromisoformat(item["created_at"])
                        if "updated_at" in item:
                            item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                        
                        channels.append(Channel(**item))
                
            return sorted(channels, key=lambda c: c.name)
            
        except Exception as e:
            logger.error("Error listing channels", workspace_id=workspace_id, error=str(e))
            return []
    
    async def join_channel(self, channel_id: str, user_id: str, user_name: str, is_creator: bool = False) -> bool:
        """Add user to channel"""
        try:
            async for dynamodb in get_dynamodb_resource():
                memberships_table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                # Create membership
                membership = ChannelMember(
                    channel_id=channel_id,
                    user_id=user_id,
                    unread_count=0,
                    joined_human=f"{user_name} {'created' if is_creator else 'joined'} this channel"
                )
                
                membership_item = membership.dict()
                membership_item["PK"] = f"CHANNEL#{channel_id}"
                membership_item["SK"] = f"USER#{user_id}"
                membership_item["joined_at"] = membership.joined_at.isoformat()
                if membership.last_read_at:
                    membership_item["last_read_at"] = membership.last_read_at.isoformat()
                
                await memberships_table.put_item(Item=membership_item)
                
                # Update channel member count
                if not is_creator:  # Creator is already counted
                    await self._update_channel_member_count(channel_id, 1)
                
                logger.info("User joined channel", channel_id=channel_id, user_id=user_id)
                return True
                
        except Exception as e:
            logger.error("Error joining channel", channel_id=channel_id, user_id=user_id, error=str(e))
            return False
    
    async def leave_channel(self, channel_id: str, user_id: str) -> bool:
        """Remove user from channel"""
        try:
            async for dynamodb in get_dynamodb_resource():
                memberships_table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                # Delete membership
                await memberships_table.delete_item(
                    Key={
                        "PK": f"CHANNEL#{channel_id}",
                        "SK": f"USER#{user_id}"
                    }
                )
                
                # Update channel member count
                await self._update_channel_member_count(channel_id, -1)
                
                logger.info("User left channel", channel_id=channel_id, user_id=user_id)
                return True
                
        except Exception as e:
            logger.error("Error leaving channel", channel_id=channel_id, user_id=user_id, error=str(e))
            return False
    
    async def get_channel_members(self, channel_id: str) -> List[Dict]:
        """Get all members of a channel with user details"""
        try:
            members = []
            
            async for dynamodb in get_dynamodb_resource():
                memberships_table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                users_table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
                
                # Get all memberships for channel
                response = await memberships_table.query(
                    KeyConditionExpression="PK = :pk",
                    ExpressionAttributeValues={
                        ":pk": f"CHANNEL#{channel_id}"
                    }
                )
                
                # Get user details for each member
                for membership in response.get("Items", []):
                    user_id = membership["user_id"]
                    
                    # Get user details
                    user_response = await users_table.get_item(
                        Key={
                            "PK": f"USER#{user_id}",
                            "SK": f"USER#{user_id}"
                        }
                    )
                    
                    user_item = user_response.get("Item")
                    if user_item:
                        member_info = {
                            "user_id": user_id,
                            "name": user_item.get("name"),
                            "email": user_item.get("email"),
                            "avatar_url": user_item.get("avatar_url"),
                            "avatar_initials": user_item.get("avatar_initials"),
                            "status": user_item.get("status", "offline"),
                            "title": user_item.get("title"),
                            "joined_at": membership.get("joined_at"),
                            "joined_human": membership.get("joined_human")
                        }
                        members.append(member_info)
                
            return sorted(members, key=lambda m: m["name"])
            
        except Exception as e:
            logger.error("Error getting channel members", channel_id=channel_id, error=str(e))
            return []
    
    async def update_unread_count(self, channel_id: str, user_id: str, increment: int = 1) -> bool:
        """Update unread message count for a user in a channel"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                await table.update_item(
                    Key={
                        "PK": f"CHANNEL#{channel_id}",
                        "SK": f"USER#{user_id}"
                    },
                    UpdateExpression="ADD unread_count :inc",
                    ExpressionAttributeValues={
                        ":inc": increment
                    }
                )
                
                return True
                
        except Exception as e:
            logger.error("Error updating unread count", channel_id=channel_id, user_id=user_id, error=str(e))
            return False
    
    async def mark_channel_read(self, channel_id: str, user_id: str) -> bool:
        """Mark all messages in channel as read for user"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                await table.update_item(
                    Key={
                        "PK": f"CHANNEL#{channel_id}",
                        "SK": f"USER#{user_id}"
                    },
                    UpdateExpression="SET unread_count = :zero, last_read_at = :now",
                    ExpressionAttributeValues={
                        ":zero": 0,
                        ":now": datetime.utcnow().isoformat()
                    }
                )
                
                return True
                
        except Exception as e:
            logger.error("Error marking channel read", channel_id=channel_id, user_id=user_id, error=str(e))
            return False
    
    async def _get_user_channels(self, user_id: str) -> set:
        """Get set of channel IDs user is member of"""
        try:
            channel_ids = set()
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                response = await table.query(
                    IndexName="UserChannelsIndex",
                    KeyConditionExpression="user_id = :user_id",
                    ExpressionAttributeValues={
                        ":user_id": user_id
                    }
                )
                
                for item in response.get("Items", []):
                    channel_ids.add(item["channel_id"])
                
            return channel_ids
            
        except Exception as e:
            logger.error("Error getting user channels", user_id=user_id, error=str(e))
            return set()
    
    async def _update_channel_member_count(self, channel_id: str, increment: int):
        """Update channel member count"""
        try:
            # Get channel to find workspace ID
            channel = await self.get_channel(channel_id)
            if not channel:
                return
                
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                
                await table.update_item(
                    Key={
                        "PK": f"WORKSPACE#{channel.workspace_id}",
                        "SK": f"CHANNEL#{channel_id}"
                    },
                    UpdateExpression="ADD member_count :inc SET updated_at = :updated",
                    ExpressionAttributeValues={
                        ":inc": increment,
                        ":updated": datetime.utcnow().isoformat()
                    }
                )
                
        except Exception as e:
            logger.error("Error updating channel member count", channel_id=channel_id, error=str(e))
    
    async def _update_workspace_channel_count(self, workspace_id: str, increment: int):
        """Update workspace channel count"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
                
                await table.update_item(
                    Key={
                        "PK": f"WORKSPACE#{workspace_id}",
                        "SK": f"WORKSPACE#{workspace_id}"
                    },
                    UpdateExpression="ADD total_channels :inc SET updated_at = :updated",
                    ExpressionAttributeValues={
                        ":inc": increment,
                        ":updated": datetime.utcnow().isoformat()
                    }
                )
                
        except Exception as e:
            logger.error("Error updating workspace channel count", workspace_id=workspace_id, error=str(e))