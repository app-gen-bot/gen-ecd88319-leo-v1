"""
Message service for business logic
"""
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uuid

from app.core.config import settings
from app.core.logging import get_logger
from app.db.models import Message, MessageReaction
from app.db.dynamodb import get_dynamodb_resource
from app.services.channel_service import ChannelService

logger = get_logger(__name__)


class MessageService:
    """Service for message-related operations"""
    
    def __init__(self):
        self.channel_service = ChannelService()
    
    async def send_message(
        self,
        channel_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        user_id: str = None,
        user_name: str = None,
        user_avatar: Optional[str] = None,
        content: str = None,
        parent_message_id: Optional[str] = None
    ) -> Message:
        """Send a message to a channel or conversation"""
        if not channel_id and not conversation_id:
            raise ValueError("Either channel_id or conversation_id must be provided")
        
        message = Message(
            id=str(uuid.uuid4()),
            channel_id=channel_id,
            conversation_id=conversation_id,
            user_id=user_id,
            user_name=user_name,
            user_avatar=user_avatar,
            content=content,
            parent_message_id=parent_message_id,
            thread_count=0,
            is_edited=False,
            timestamp_human=self._get_human_timestamp(datetime.utcnow())
        )
        
        try:
            async for dynamodb in get_dynamodb_resource():
                messages_table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Prepare item with DynamoDB keys
                item = message.dict(exclude_none=True)  # Exclude None values for DynamoDB
                # Use channel or conversation as partition key
                target_id = channel_id or conversation_id
                target_type = "CHANNEL" if channel_id else "CONVERSATION"
                
                item["PK"] = f"{target_type}#{target_id}"
                item["SK"] = f"MESSAGE#{message.created_at.isoformat()}#{message.id}"
                item["created_at"] = message.created_at.isoformat()
                item["updated_at"] = message.updated_at.isoformat()
                if message.edited_at:
                    item["edited_at"] = message.edited_at.isoformat()
                
                # Clean empty strings (DynamoDB doesn't allow them)
                for key, value in list(item.items()):
                    if value == "":
                        del item[key]
                
                await messages_table.put_item(Item=item)
                
                # Update unread counts for other users in channel
                if channel_id:
                    await self._update_channel_unread_counts(channel_id, user_id)
                
                # If this is a thread reply, update parent message thread count
                if parent_message_id:
                    await self._increment_thread_count(parent_message_id, target_id, target_type)
                
                logger.info("Sent message", message_id=message.id, channel_id=channel_id)
                return message
                
        except Exception as e:
            logger.error("Error sending message", error=str(e))
            raise
    
    async def get_messages(
        self,
        channel_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        limit: int = 50,
        before: Optional[str] = None,  # ISO timestamp
        after: Optional[str] = None     # ISO timestamp
    ) -> List[Message]:
        """Get messages from a channel or conversation with pagination"""
        if not channel_id and not conversation_id:
            raise ValueError("Either channel_id or conversation_id must be provided")
        
        try:
            messages = []
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Build query parameters
                target_id = channel_id or conversation_id
                target_type = "CHANNEL" if channel_id else "CONVERSATION"
                
                key_condition = "PK = :pk"
                expression_values = {
                    ":pk": f"{target_type}#{target_id}"
                }
                
                # Add time range conditions
                if before and after:
                    key_condition += " AND SK BETWEEN :after AND :before"
                    expression_values[":after"] = f"MESSAGE#{after}"
                    expression_values[":before"] = f"MESSAGE#{before}"
                elif before:
                    key_condition += " AND SK < :before"
                    expression_values[":before"] = f"MESSAGE#{before}"
                elif after:
                    key_condition += " AND SK > :after"
                    expression_values[":after"] = f"MESSAGE#{after}"
                else:
                    key_condition += " AND begins_with(SK, :sk_prefix)"
                    expression_values[":sk_prefix"] = "MESSAGE#"
                
                # Query messages
                response = await table.query(
                    KeyConditionExpression=key_condition,
                    ExpressionAttributeValues=expression_values,
                    ScanIndexForward=False,  # Newest first
                    Limit=limit
                )
                
                for item in response.get("Items", []):
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    if "edited_at" in item:
                        item["edited_at"] = datetime.fromisoformat(item["edited_at"])
                    
                    # Get reactions for message
                    item["reactions"] = await self._get_message_reactions(item["id"])
                    
                    messages.append(Message(**item))
                
            # Return in chronological order (oldest first)
            return list(reversed(messages))
            
        except Exception as e:
            logger.error("Error getting messages", error=str(e))
            return []
    
    async def edit_message(self, message_id: str, user_id: str, new_content: str) -> Optional[Message]:
        """Edit a message (within 5 minute window)"""
        try:
            # First get the message to check ownership and time
            message = await self.get_message(message_id)
            if not message:
                logger.warning("Message not found", message_id=message_id)
                return None
            
            # Check if user owns the message
            if message.user_id != user_id:
                logger.warning("User cannot edit this message", message_id=message_id, user_id=user_id)
                return None
            
            # Check 5 minute edit window
            time_since_creation = datetime.utcnow() - message.created_at
            if time_since_creation > timedelta(minutes=5):
                logger.warning("Edit window expired", message_id=message_id)
                return None
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Determine target type
                target_id = message.channel_id or message.conversation_id
                target_type = "CHANNEL" if message.channel_id else "CONVERSATION"
                
                # Update message
                response = await table.update_item(
                    Key={
                        "PK": f"{target_type}#{target_id}",
                        "SK": f"MESSAGE#{message.created_at.isoformat()}#{message_id}"
                    },
                    UpdateExpression="SET content = :content, is_edited = :edited, edited_at = :edited_at, updated_at = :updated",
                    ExpressionAttributeValues={
                        ":content": new_content,
                        ":edited": True,
                        ":edited_at": datetime.utcnow().isoformat(),
                        ":updated": datetime.utcnow().isoformat()
                    },
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
                    if "edited_at" in item:
                        item["edited_at"] = datetime.fromisoformat(item["edited_at"])
                    
                    return Message(**item)
                
            return None
            
        except Exception as e:
            logger.error("Error editing message", message_id=message_id, error=str(e))
            return None
    
    async def delete_message(self, message_id: str, user_id: str) -> bool:
        """Soft delete a message (mark as deleted)"""
        try:
            # Get message to check ownership
            message = await self.get_message(message_id)
            if not message:
                return False
            
            # Check if user owns the message
            if message.user_id != user_id:
                logger.warning("User cannot delete this message", message_id=message_id, user_id=user_id)
                return False
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Determine target type
                target_id = message.channel_id or message.conversation_id
                target_type = "CHANNEL" if message.channel_id else "CONVERSATION"
                
                # Soft delete by updating content
                await table.update_item(
                    Key={
                        "PK": f"{target_type}#{target_id}",
                        "SK": f"MESSAGE#{message.created_at.isoformat()}#{message_id}"
                    },
                    UpdateExpression="SET content = :content, is_deleted = :deleted, updated_at = :updated",
                    ExpressionAttributeValues={
                        ":content": "[This message was deleted]",
                        ":deleted": True,
                        ":updated": datetime.utcnow().isoformat()
                    }
                )
                
                logger.info("Deleted message", message_id=message_id)
                return True
                
        except Exception as e:
            logger.error("Error deleting message", message_id=message_id, error=str(e))
            return False
    
    async def add_reaction(self, message_id: str, user_id: str, user_name: str, emoji: str) -> bool:
        """Add a reaction to a message"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-reactions-{settings.ENVIRONMENT}")
                
                # Create unique reaction entry
                await table.put_item(
                    Item={
                        "PK": f"MESSAGE#{message_id}",
                        "SK": f"REACTION#{emoji}#USER#{user_id}",
                        "message_id": message_id,
                        "emoji": emoji,
                        "user_id": user_id,
                        "user_name": user_name,
                        "created_at": datetime.utcnow().isoformat()
                    }
                )
                
                logger.info("Added reaction", message_id=message_id, emoji=emoji, user_id=user_id)
                return True
                
        except Exception as e:
            logger.error("Error adding reaction", message_id=message_id, error=str(e))
            return False
    
    async def remove_reaction(self, message_id: str, user_id: str, emoji: str) -> bool:
        """Remove a reaction from a message"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-reactions-{settings.ENVIRONMENT}")
                
                # Delete reaction entry
                await table.delete_item(
                    Key={
                        "PK": f"MESSAGE#{message_id}",
                        "SK": f"REACTION#{emoji}#USER#{user_id}"
                    }
                )
                
                logger.info("Removed reaction", message_id=message_id, emoji=emoji, user_id=user_id)
                return True
                
        except Exception as e:
            logger.error("Error removing reaction", message_id=message_id, error=str(e))
            return False
    
    async def get_thread_messages(self, parent_message_id: str, limit: int = 50) -> List[Message]:
        """Get all replies to a message (thread)"""
        try:
            messages = []
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Query using ThreadIndex
                response = await table.query(
                    IndexName="ThreadIndex",
                    KeyConditionExpression="parent_message_id = :parent_id",
                    ExpressionAttributeValues={
                        ":parent_id": parent_message_id
                    },
                    Limit=limit
                )
                
                for item in response.get("Items", []):
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    if "edited_at" in item:
                        item["edited_at"] = datetime.fromisoformat(item["edited_at"])
                    
                    messages.append(Message(**item))
                
            return messages
            
        except Exception as e:
            logger.error("Error getting thread messages", parent_id=parent_message_id, error=str(e))
            return []
    
    async def get_message(self, message_id: str) -> Optional[Message]:
        """Get a single message by ID (requires scanning)"""
        try:
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                # Use UserMessagesIndex to find message
                # This is not ideal but works for MVP
                response = await table.scan(
                    FilterExpression="id = :message_id",
                    ExpressionAttributeValues={
                        ":message_id": message_id
                    }
                )
                
                items = response.get("Items", [])
                if items:
                    item = items[0]
                    # Remove DynamoDB-specific fields
                    item.pop("PK", None)
                    item.pop("SK", None)
                    # Convert ISO strings to datetime
                    if "created_at" in item:
                        item["created_at"] = datetime.fromisoformat(item["created_at"])
                    if "updated_at" in item:
                        item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    if "edited_at" in item:
                        item["edited_at"] = datetime.fromisoformat(item["edited_at"])
                    
                    return Message(**item)
                    
            return None
            
        except Exception as e:
            logger.error("Error getting message", message_id=message_id, error=str(e))
            return None
    
    async def _get_message_reactions(self, message_id: str) -> List[Dict]:
        """Get all reactions for a message"""
        try:
            reactions_by_emoji = {}
            
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-reactions-{settings.ENVIRONMENT}")
                
                response = await table.query(
                    KeyConditionExpression="PK = :pk",
                    ExpressionAttributeValues={
                        ":pk": f"MESSAGE#{message_id}"
                    }
                )
                
                for item in response.get("Items", []):
                    emoji = item["emoji"]
                    if emoji not in reactions_by_emoji:
                        reactions_by_emoji[emoji] = {
                            "emoji": emoji,
                            "count": 0,
                            "users": [],
                            "user_names": []
                        }
                    
                    reactions_by_emoji[emoji]["count"] += 1
                    reactions_by_emoji[emoji]["users"].append(item["user_id"])
                    reactions_by_emoji[emoji]["user_names"].append(item["user_name"])
                
            return list(reactions_by_emoji.values())
            
        except Exception as e:
            logger.error("Error getting reactions", message_id=message_id, error=str(e))
            return []
    
    async def _update_channel_unread_counts(self, channel_id: str, sender_id: str):
        """Update unread counts for all channel members except sender"""
        try:
            # Get all channel members
            members = await self.channel_service.get_channel_members(channel_id)
            
            # Update unread count for each member except sender
            for member in members:
                if member["user_id"] != sender_id:
                    await self.channel_service.update_unread_count(
                        channel_id, member["user_id"], increment=1
                    )
                    
        except Exception as e:
            logger.error("Error updating unread counts", channel_id=channel_id, error=str(e))
    
    async def _increment_thread_count(self, parent_message_id: str, target_id: str, target_type: str):
        """Increment thread count on parent message"""
        try:
            # Get parent message to find its location
            parent = await self.get_message(parent_message_id)
            if not parent:
                return
                
            async for dynamodb in get_dynamodb_resource():
                table = await dynamodb.Table(f"slack-clone-messages-{settings.ENVIRONMENT}")
                
                await table.update_item(
                    Key={
                        "PK": f"{target_type}#{target_id}",
                        "SK": f"MESSAGE#{parent.created_at.isoformat()}#{parent_message_id}"
                    },
                    UpdateExpression="ADD thread_count :inc",
                    ExpressionAttributeValues={
                        ":inc": 1
                    }
                )
                
        except Exception as e:
            logger.error("Error incrementing thread count", parent_id=parent_message_id, error=str(e))
    
    def _get_human_timestamp(self, dt: datetime) -> str:
        """Convert datetime to human-readable timestamp"""
        now = datetime.utcnow()
        diff = now - dt
        
        if diff.days > 0:
            return dt.strftime("%b %d at %I:%M %p")
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "just now"