#!/usr/bin/env python
"""
Database seed script for Slack Clone
Creates initial test data including users, workspace, channels, and messages
"""

import asyncio
import sys
import os
from datetime import datetime, timezone
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.user_service import UserService
from app.services.workspace_service import WorkspaceService
from app.services.channel_service import ChannelService
from app.services.message_service import MessageService


async def seed_database():
    """Seed the database with test data"""
    print("🌱 Starting database seeding...")
    
    # Initialize services
    user_service = UserService()
    workspace_service = WorkspaceService()
    channel_service = ChannelService()
    message_service = MessageService()
    
    try:
        # 1. Create test users
        print("\n📤 Creating users...")
        
        # Main test user
        test_user = await user_service.create_user(
            email="test@example.com",
            password="password123",
            name="Test User"
        )
        print(f"✅ Created test user: {test_user.email}")
        
        # Additional team members
        users = []
        user_data = [
            ("alice@example.com", "password123", "Alice Johnson"),
            ("bob@example.com", "password123", "Bob Smith"),
            ("charlie@example.com", "password123", "Charlie Brown"),
            ("diana@example.com", "password123", "Diana Prince"),
        ]
        
        for email, password, name in user_data:
            try:
                user = await user_service.create_user(
                    email=email,
                    password=password,
                    name=name
                )
                users.append(user)
                print(f"✅ Created user: {name}")
            except Exception as e:
                if "already exists" in str(e):
                    # User already exists, fetch them
                    user = await user_service.get_user_by_email(email)
                    if user:
                        users.append(user)
                        print(f"ℹ️  User already exists: {name}")
                else:
                    print(f"❌ Error creating user {name}: {e}")
        
        # 2. Create workspace
        print("\n🏢 Creating workspace...")
        workspace = None
        workspace_name = "Acme Corp"
        
        # Check if workspace exists
        existing_workspaces = await workspace_service.list_user_workspaces(test_user.id)
        for ws in existing_workspaces:
            if ws.name == workspace_name:
                workspace = ws
                print(f"ℹ️  Workspace already exists: {workspace_name}")
                break
        
        if not workspace:
            workspace = await workspace_service.create_workspace(
                name=workspace_name,
                owner_id=test_user.id
            )
            print(f"✅ Created workspace: {workspace.name}")
            
            # Add other users to workspace
            for user in users:
                try:
                    await workspace_service.add_member(
                        workspace_id=workspace.id,
                        user_id=user.id,
                        role='member',
                        invited_by=test_user.id
                    )
                    print(f"✅ Added {user.name} to workspace")
                except Exception as e:
                    print(f"❌ Error adding {user.name}: {e}")
        
        # 3. Create additional channels
        print("\n📢 Creating channels...")
        channel_data = [
            ("announcements", "Company announcements", False),
            ("engineering", "Engineering team discussions", False),
            ("design", "Design team collaboration", False),
            ("marketing", "Marketing strategies and campaigns", False),
            ("social", "Non-work discussions", False),
            ("private-leadership", "Leadership team only", True),
        ]
        
        channels = []
        for channel_name, description, is_private in channel_data:
            try:
                # Check if channel exists
                existing_channels = await channel_service.list_workspace_channels(
                    workspace_id=workspace['id'],
                    user_id=test_user['id']
                )
                
                channel_exists = any(ch['name'] == channel_name for ch in existing_channels)
                
                if not channel_exists:
                    channel = await channel_service.create_channel(
                        workspace_id=workspace['id'],
                        name=channel_name,
                        description=description,
                        is_private=is_private,
                        created_by=test_user['id']
                    )
                    channels.append(channel)
                    print(f"✅ Created channel: #{channel_name}")
                    
                    # Add some members to each channel
                    if not is_private:
                        for user in users[:2]:  # Add first 2 users to public channels
                            await channel_service.add_member(
                                channel_id=channel['id'],
                                user_id=user['id'],
                                added_by=test_user['id']
                            )
                else:
                    print(f"ℹ️  Channel already exists: #{channel_name}")
            except Exception as e:
                print(f"❌ Error creating channel {channel_name}: {e}")
        
        # 4. Create sample messages
        print("\n💬 Creating sample messages...")
        
        # Get general channel
        general_channel = None
        all_channels = await channel_service.list_workspace_channels(
            workspace_id=workspace['id'],
            user_id=test_user['id']
        )
        for ch in all_channels:
            if ch['name'] == 'general':
                general_channel = ch
                break
        
        if general_channel:
            # Sample messages for general channel
            message_data = [
                (test_user['id'], "Welcome to our Slack clone! 🎉"),
                (users[0]['id'] if users else test_user['id'], "Excited to be here! This looks great."),
                (users[1]['id'] if len(users) > 1 else test_user['id'], "The UI is really clean. Nice work!"),
                (test_user['id'], "Feel free to explore all the features. Try clicking on user avatars, using search, and checking notifications."),
                (users[2]['id'] if len(users) > 2 else test_user['id'], "Just tested the dark mode - looks amazing! 🌙"),
            ]
            
            messages = []
            for user_id, content in message_data:
                try:
                    message = await message_service.create_message(
                        channel_id=general_channel['id'],
                        user_id=user_id,
                        content=content
                    )
                    messages.append(message)
                    print(f"✅ Created message in #general")
                except Exception as e:
                    print(f"❌ Error creating message: {e}")
            
            # Add some reactions to messages
            if messages:
                try:
                    # Add thumbs up to first message
                    await message_service.toggle_reaction(
                        message_id=messages[0]['id'],
                        user_id=users[0]['id'] if users else test_user['id'],
                        emoji='👍'
                    )
                    
                    # Add heart to welcome message
                    await message_service.toggle_reaction(
                        message_id=messages[0]['id'],
                        user_id=users[1]['id'] if len(users) > 1 else test_user['id'],
                        emoji='❤️'
                    )
                    
                    print("✅ Added reactions to messages")
                except Exception as e:
                    print(f"❌ Error adding reactions: {e}")
                
                # Create a thread
                try:
                    if len(messages) > 2:
                        thread_reply = await message_service.create_message(
                            channel_id=general_channel['id'],
                            user_id=users[0]['id'] if users else test_user['id'],
                            content="I agree! The animations are smooth too.",
                            thread_ts=messages[2]['id']  # Reply to "UI is clean" message
                        )
                        print("✅ Created thread reply")
                except Exception as e:
                    print(f"❌ Error creating thread: {e}")
        
        print("\n✨ Database seeding complete!")
        print(f"\n📝 Login credentials:")
        print(f"   Email: test@example.com")
        print(f"   Password: password123")
        print(f"\n👥 Additional users:")
        for email, _, name in user_data:
            print(f"   {name}: {email} / password123")
            
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    # Run the async function
    asyncio.run(seed_database())