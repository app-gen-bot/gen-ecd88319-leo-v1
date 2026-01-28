"""
DynamoDB connection and table management
"""

import boto3
from botocore.exceptions import ClientError
from typing import Any
from functools import lru_cache
from config import settings


@lru_cache()
def get_dynamodb_resource():
    """Get DynamoDB resource with credentials"""
    return boto3.resource(
        'dynamodb',
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key
    )


@lru_cache()
def get_dynamodb_client():
    """Get DynamoDB client with credentials"""
    return boto3.client(
        'dynamodb',
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key
    )


def create_main_table() -> Any:
    """Create the main application table if it doesn't exist"""
    dynamodb = get_dynamodb_resource()
    table_name = settings.dynamodb_table_name
    
    try:
        # Try to create the table
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'PK', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'SK', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'PK', 'AttributeType': 'S'},
                {'AttributeName': 'SK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI1PK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI1SK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI2PK', 'AttributeType': 'S'},
                {'AttributeName': 'GSI2SK', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'GSI1PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'GSI1SK', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'GSI2',
                    'KeySchema': [
                        {'AttributeName': 'GSI2PK', 'KeyType': 'HASH'},
                        {'AttributeName': 'GSI2SK', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        # Wait for table to be created
        table.wait_until_exists()
        print(f"Created table {table_name}")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            table = dynamodb.Table(table_name)
            print(f"Table {table_name} already exists")
        else:
            raise
    
    return table


def create_auth_table() -> Any:
    """Create the Better Auth table if it doesn't exist"""
    dynamodb = get_dynamodb_resource()
    table_name = settings.dynamodb_auth_table_name
    
    try:
        # Try to create the table
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'pk', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'sk', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'pk', 'AttributeType': 'S'},
                {'AttributeName': 'sk', 'AttributeType': 'S'},
                {'AttributeName': 'gsi1pk', 'AttributeType': 'S'},
                {'AttributeName': 'gsi1sk', 'AttributeType': 'S'}
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'GSI1',
                    'KeySchema': [
                        {'AttributeName': 'gsi1pk', 'KeyType': 'HASH'},
                        {'AttributeName': 'gsi1sk', 'KeyType': 'RANGE'}
                    ],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        # Wait for table to be created
        table.wait_until_exists()
        print(f"Created table {table_name}")
        
        # Enable TTL after table creation
        try:
            dynamodb_client = boto3.client(
                'dynamodb',
                region_name=settings.aws_region,
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key
            )
            dynamodb_client.update_time_to_live(
                TableName=table_name,
                TimeToLiveSpecification={
                    'AttributeName': 'expiresAt',
                    'Enabled': True
                }
            )
            print(f"Enabled TTL on {table_name}")
        except Exception as e:
            print(f"Warning: Could not enable TTL: {e}")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            table = dynamodb.Table(table_name)
            print(f"Table {table_name} already exists")
        else:
            raise
    
    return table


def get_main_table():
    """Get the main application table"""
    dynamodb = get_dynamodb_resource()
    return dynamodb.Table(settings.dynamodb_table_name)


def get_auth_table():
    """Get the Better Auth table"""
    dynamodb = get_dynamodb_resource()
    return dynamodb.Table(settings.dynamodb_auth_table_name)


def ensure_tables_exist():
    """Ensure all required tables exist"""
    create_main_table()
    create_auth_table()
    print("All tables verified/created successfully")