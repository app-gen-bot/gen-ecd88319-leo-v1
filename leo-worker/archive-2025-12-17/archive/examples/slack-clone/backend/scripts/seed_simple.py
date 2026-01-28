#!/usr/bin/env python
"""
Simple database seed script for Slack Clone
Creates test user account for login
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.user_service import UserService
from app.services.workspace_service import WorkspaceService
from app.core.logging import get_logger

logger = get_logger(__name__)


async def seed_database():
    """Seed the database with test data"""
    print("🌱 Starting database seeding...")
    
    # Initialize services
    user_service = UserService()
    workspace_service = WorkspaceService()
    
    try:
        # Create test user
        print("\n📤 Creating test user...")
        
        # Check if user already exists
        existing_user = await user_service.get_user_by_email("test@example.com")
        
        if existing_user:
            print(f"ℹ️  User already exists: test@example.com")
            test_user = existing_user
        else:
            test_user = await user_service.create_user(
                email="test@example.com",
                password="password123",
                name="Test User"
            )
            print(f"✅ Created test user: test@example.com")
        
        # Create workspace
        print("\n🏢 Creating workspace...")
        
        # Check if user has workspaces
        workspaces = await workspace_service.get_user_workspaces(test_user.id)
        
        if workspaces:
            print(f"ℹ️  User already has {len(workspaces)} workspace(s)")
            workspace = workspaces[0]
            print(f"   Using workspace: {workspace.name}")
        else:
            workspace = await workspace_service.create_workspace(
                user_id=test_user.id,
                workspace_name="Test Workspace",
                user_name=test_user.name
            )
            print(f"✅ Created workspace: {workspace.name}")
            print(f"   General channel created automatically")
        
        print("\n✨ Database seeding complete!")
        print(f"\n📝 Login credentials:")
        print(f"   Email: test@example.com")
        print(f"   Password: password123")
            
    except Exception as e:
        logger.error("Error during seeding", error=str(e))
        print(f"\n❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    # Run the async function
    asyncio.run(seed_database())