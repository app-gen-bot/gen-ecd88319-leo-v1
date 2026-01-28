#!/usr/bin/env python
"""
ONE-TIME TABLE CREATION SCRIPT - FOR DEVELOPMENT ONLY

WARNING: This script creates DynamoDB tables directly.
In production, tables should be created via AWS CDK infrastructure code.

This is a temporary solution to unblock development and testing.
After running this once, the init_db() function will be removed from the backend.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.db.dynamodb import init_db
from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_tables_once():
    """Create DynamoDB tables - run this only once"""
    print("=" * 60)
    print("ONE-TIME TABLE CREATION - DEVELOPMENT ONLY")
    print("=" * 60)
    print("\n⚠️  WARNING: In production, tables should be created via CDK!")
    print("This script is only for unblocking development.\n")
    
    response = input("Do you want to create the tables? (yes/no): ")
    if response.lower() != "yes":
        print("Aborted.")
        return
    
    print("\n🏗️  Creating DynamoDB tables...")
    
    try:
        await init_db()
        print("\n✅ Tables created successfully!")
        print("\nNext steps:")
        print("1. Run seed_simple.py to create test data")
        print("2. Remove init_db() from the backend code")
        print("3. Start the backend server")
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(create_tables_once())