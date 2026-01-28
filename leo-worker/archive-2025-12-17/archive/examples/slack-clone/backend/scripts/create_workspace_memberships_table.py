#!/usr/bin/env python
"""
Create the WorkspaceMemberships table

This script creates the missing workspace memberships table.
Run this after the initial table creation to add the missing table.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.dynamodb import get_session, create_workspace_memberships_table
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_table():
    """Create the workspace memberships table"""
    print("Creating WorkspaceMemberships table...")
    
    try:
        session = get_session()
        async with session.resource(
            "dynamodb",
            endpoint_url=settings.DYNAMODB_ENDPOINT_URL,
        ) as dynamodb:
            await create_workspace_memberships_table(dynamodb)
            print("✅ WorkspaceMemberships table created successfully!")
    except Exception as e:
        print(f"❌ Error creating table: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(create_table())