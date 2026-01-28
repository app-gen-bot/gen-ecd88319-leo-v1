#!/usr/bin/env python
"""
Check database schema and data in all DynamoDB tables
"""

import asyncio
import sys
from pathlib import Path
from pprint import pprint

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.dynamodb import get_session
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def check_all_tables():
    """Scan all tables and show their data"""
    tables = [
        "users",
        "workspaces", 
        "channels",
        "channel-memberships",
        "messages",
        "conversations",
        "conversation-participants",
        "notifications",
        "files",
        "presence",
        "reactions"
    ]
    
    session = get_session()
    
    for table_name in tables:
        full_table_name = f"slack-clone-{table_name}-{settings.ENVIRONMENT}"
        print(f"\n{'='*60}")
        print(f"Table: {full_table_name}")
        print(f"{'='*60}")
        
        try:
            async with session.resource("dynamodb", endpoint_url=settings.DYNAMODB_ENDPOINT_URL) as dynamodb:
                table = await dynamodb.Table(full_table_name)
                
                # Get table info
                description = await table.meta.client.describe_table(TableName=full_table_name)
                item_count = description['Table']['ItemCount']
                print(f"Item count: {item_count}")
                
                # Scan table to get sample data
                response = await table.scan(Limit=10)
                items = response.get('Items', [])
                
                if items:
                    print(f"\nSample data ({len(items)} items):")
                    for i, item in enumerate(items, 1):
                        print(f"\n--- Item {i} ---")
                        # Show key fields first
                        if 'PK' in item:
                            print(f"PK: {item['PK']}")
                        if 'SK' in item:
                            print(f"SK: {item['SK']}")
                        # Show other important fields
                        for key in ['id', 'email', 'name', 'workspace_id', 'channel_id', 'user_id']:
                            if key in item and key not in ['PK', 'SK']:
                                print(f"{key}: {item[key]}")
                else:
                    print("No data in table")
                    
        except Exception as e:
            print(f"Error accessing table: {e}")


async def check_workspace_members():
    """Check workspace membership specifically"""
    print(f"\n{'='*60}")
    print("WORKSPACE MEMBERSHIP CHECK")
    print(f"{'='*60}")
    
    session = get_session()
    
    try:
        async with session.resource("dynamodb", endpoint_url=settings.DYNAMODB_ENDPOINT_URL) as dynamodb:
            # Check workspaces table for members
            table = await dynamodb.Table(f"slack-clone-workspaces-{settings.ENVIRONMENT}")
            response = await table.scan()
            
            for workspace in response.get('Items', []):
                print(f"\nWorkspace: {workspace.get('name')} (ID: {workspace.get('id')})")
                print(f"Total members: {workspace.get('total_members', 0)}")
                
                # Now check if there are actual membership records
                # This might be in a different table or part of the workspace record
                
    except Exception as e:
        print(f"Error checking workspace members: {e}")


if __name__ == "__main__":
    print("Checking DynamoDB tables and data...")
    asyncio.run(check_all_tables())
    asyncio.run(check_workspace_members())