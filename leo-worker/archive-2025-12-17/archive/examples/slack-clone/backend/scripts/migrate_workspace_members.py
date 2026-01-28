#!/usr/bin/env python
"""
Migrate existing workspace members

This script creates workspace membership records for existing users.
It reads the workspaces and users, then creates the proper membership records.
"""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.dynamodb import get_session
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def migrate_workspace_members():
    """Create workspace membership records for existing data"""
    print("🔄 Starting workspace members migration...")
    
    session = get_session()
    
    try:
        async with session.resource(
            "dynamodb",
            endpoint_url=settings.DYNAMODB_ENDPOINT_URL,
        ) as dynamodb:
            # Get tables
            users_table = await dynamodb.Table(f"slack-clone-users-{settings.ENVIRONMENT}")
            workspaces_table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
            memberships_table = await dynamodb.Table(f"slack-clone-workspace-memberships-{settings.ENVIRONMENT}")
            
            # Scan all users
            print("\n📋 Scanning users...")
            users_response = await users_table.scan()
            users = users_response.get('Items', [])
            print(f"Found {len(users)} users")
            
            # Scan all workspaces
            print("\n🏢 Scanning workspaces...")
            workspaces_response = await workspaces_table.scan()
            workspaces = workspaces_response.get('Items', [])
            print(f"Found {len(workspaces)} workspaces")
            
            # For each workspace, check if it has an owner
            for workspace in workspaces:
                workspace_id = workspace.get('id')
                workspace_name = workspace.get('name')
                owner_id = workspace.get('owner_id')
                
                print(f"\n🔍 Processing workspace: {workspace_name} (ID: {workspace_id})")
                
                if owner_id:
                    # Create membership for the owner
                    print(f"  Creating membership for owner (ID: {owner_id})")
                    
                    membership_item = {
                        "PK": f"WORKSPACE#{workspace_id}",
                        "SK": f"USER#{owner_id}",
                        "workspace_id": workspace_id,
                        "user_id": owner_id,
                        "role": "admin",  # Owner is always admin
                        "joined_at": workspace.get('created_at', datetime.utcnow().isoformat()),
                        "is_active": True
                    }
                    
                    try:
                        await memberships_table.put_item(Item=membership_item)
                        print(f"  ✅ Created admin membership for user {owner_id}")
                    except Exception as e:
                        print(f"  ❌ Error creating membership: {e}")
                
                # Also check channel memberships to find other users
                # who might be in this workspace
                channels_table = await dynamodb.Table(f"slack-clone-channels-{settings.ENVIRONMENT}")
                channel_memberships_table = await dynamodb.Table(f"slack-clone-channel-memberships-{settings.ENVIRONMENT}")
                
                # Get channels in this workspace
                channels_response = await channels_table.query(
                    KeyConditionExpression="PK = :pk",
                    ExpressionAttributeValues={
                        ":pk": f"WORKSPACE#{workspace_id}"
                    }
                )
                channels = channels_response.get('Items', [])
                
                user_ids_in_workspace = set()
                if owner_id:
                    user_ids_in_workspace.add(owner_id)
                
                # For each channel, get members
                for channel in channels:
                    channel_id = channel.get('id')
                    channel_name = channel.get('name')
                    
                    # Query channel members
                    members_response = await channel_memberships_table.query(
                        KeyConditionExpression="PK = :pk",
                        ExpressionAttributeValues={
                            ":pk": f"CHANNEL#{channel_id}"
                        }
                    )
                    members = members_response.get('Items', [])
                    
                    for member in members:
                        user_id = member.get('user_id')
                        if user_id and user_id not in user_ids_in_workspace:
                            user_ids_in_workspace.add(user_id)
                            
                            # Create membership for this user
                            membership_item = {
                                "PK": f"WORKSPACE#{workspace_id}",
                                "SK": f"USER#{user_id}",
                                "workspace_id": workspace_id,
                                "user_id": user_id,
                                "role": "member",  # Regular member
                                "joined_at": member.get('joined_at', datetime.utcnow().isoformat()),
                                "is_active": True
                            }
                            
                            try:
                                await memberships_table.put_item(Item=membership_item)
                                print(f"  ✅ Created member membership for user {user_id}")
                            except Exception as e:
                                print(f"  ❌ Error creating membership: {e}")
                
                print(f"  Total members in workspace: {len(user_ids_in_workspace)}")
        
        print("\n✅ Migration complete!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(migrate_workspace_members())