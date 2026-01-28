#!/usr/bin/env python
"""
Create all DynamoDB tables for local development
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

import aioboto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Table names based on environment
TABLE_PREFIX = f"slack-clone"
ENV_SUFFIX = f"-{settings.ENVIRONMENT}"


async def create_table(dynamodb, table_name, key_schema, attribute_definitions, gsi=None):
    """Helper to create a table"""
    try:
        params = {
            "TableName": table_name,
            "KeySchema": key_schema,
            "AttributeDefinitions": attribute_definitions,
            "BillingMode": "PAY_PER_REQUEST"
        }
        
        if gsi:
            params["GlobalSecondaryIndexes"] = gsi
            
        table = await dynamodb.create_table(**params)
        await table.wait_until_exists()
        logger.info(f"✅ Created table: {table_name}")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            logger.info(f"⚠️  Table already exists: {table_name}")
        else:
            logger.error(f"❌ Error creating table {table_name}: {e}")
            raise


async def create_all_tables():
    """Create all required tables"""
    session = aioboto3.Session()
    
    async with session.resource(
        "dynamodb",
        endpoint_url=settings.DYNAMODB_ENDPOINT_URL,
        region_name=settings.AWS_DEFAULT_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    ) as dynamodb:
        
        # Users table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-users{ENV_SUFFIX}",
            [{"AttributeName": "PK", "KeyType": "HASH"}],
            [
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "email", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "EmailIndex",
                    "KeySchema": [{"AttributeName": "email", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # Workspaces table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-workspaces{ENV_SUFFIX}",
            [{"AttributeName": "PK", "KeyType": "HASH"}],
            [{"AttributeName": "PK", "AttributeType": "S"}]
        )
        
        # WorkspaceMemberships table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-workspace-memberships{ENV_SUFFIX}",
            [
                {"AttributeName": "workspace_id", "KeyType": "HASH"},
                {"AttributeName": "user_id", "KeyType": "RANGE"}
            ],
            [
                {"AttributeName": "workspace_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "UserWorkspacesIndex",
                    "KeySchema": [{"AttributeName": "user_id", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # Channels table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-channels{ENV_SUFFIX}",
            [{"AttributeName": "PK", "KeyType": "HASH"}],
            [
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "workspace_id", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "WorkspaceChannelsIndex",
                    "KeySchema": [{"AttributeName": "workspace_id", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # ChannelMemberships table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-channel-memberships{ENV_SUFFIX}",
            [
                {"AttributeName": "channel_id", "KeyType": "HASH"},
                {"AttributeName": "user_id", "KeyType": "RANGE"}
            ],
            [
                {"AttributeName": "channel_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "UserChannelsIndex",
                    "KeySchema": [{"AttributeName": "user_id", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # Messages table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-messages{ENV_SUFFIX}",
            [
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            [
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "author_id", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "AuthorMessagesIndex",
                    "KeySchema": [{"AttributeName": "author_id", "KeyType": "HASH"}],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # DirectMessages table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-direct-messages{ENV_SUFFIX}",
            [
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            [
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "UserConversationsIndex",
                    "KeySchema": [
                        {"AttributeName": "user_id", "KeyType": "HASH"},
                        {"AttributeName": "PK", "KeyType": "RANGE"}
                    ],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        # Notifications table
        await create_table(
            dynamodb,
            f"{TABLE_PREFIX}-notifications{ENV_SUFFIX}",
            [
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"}
            ],
            [
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "is_read", "AttributeType": "S"}
            ],
            [
                {
                    "IndexName": "UnreadIndex",
                    "KeySchema": [
                        {"AttributeName": "PK", "KeyType": "HASH"},
                        {"AttributeName": "is_read", "KeyType": "RANGE"}
                    ],
                    "Projection": {"ProjectionType": "ALL"}
                }
            ]
        )
        
        print("\n✅ All tables created successfully!")
        print("\nNext step: Run seed_simple.py to create test data")


if __name__ == "__main__":
    print("🏗️  Creating all DynamoDB tables for local development...")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"DynamoDB endpoint: {settings.DYNAMODB_ENDPOINT_URL}\n")
    
    asyncio.run(create_all_tables())