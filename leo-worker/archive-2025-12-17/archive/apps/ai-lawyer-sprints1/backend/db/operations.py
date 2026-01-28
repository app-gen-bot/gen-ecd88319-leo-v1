"""
DynamoDB operations for the application
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from db.connection import get_main_table


class DynamoDBOperations:
    """Base class for DynamoDB operations"""
    
    def __init__(self):
        self.table = get_main_table()
    
    def put_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Put an item in the table"""
        try:
            # Add timestamps
            now = datetime.utcnow().isoformat() + 'Z'
            if 'created_at' not in item:
                item['created_at'] = now
            item['updated_at'] = now
            
            self.table.put_item(Item=item)
            return item
        except ClientError as e:
            raise Exception(f"Error putting item: {e.response['Error']['Message']}")
    
    def get_item(self, pk: str, sk: str) -> Optional[Dict[str, Any]]:
        """Get an item by primary key"""
        try:
            response = self.table.get_item(
                Key={'PK': pk, 'SK': sk}
            )
            return response.get('Item')
        except ClientError as e:
            raise Exception(f"Error getting item: {e.response['Error']['Message']}")
    
    def query_items(
        self, 
        pk: str, 
        sk_prefix: Optional[str] = None,
        index_name: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Query items by partition key and optional sort key prefix"""
        try:
            query_params = {
                'KeyConditionExpression': Key('PK').eq(pk)
            }
            
            if sk_prefix:
                query_params['KeyConditionExpression'] &= Key('SK').begins_with(sk_prefix)
            
            if index_name:
                query_params['IndexName'] = index_name
            
            if limit:
                query_params['Limit'] = limit
            
            response = self.table.query(**query_params)
            return response.get('Items', [])
        except ClientError as e:
            raise Exception(f"Error querying items: {e.response['Error']['Message']}")
    
    def update_item(
        self, 
        pk: str, 
        sk: str, 
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an item"""
        try:
            # Build update expression
            update_expr_parts = []
            expr_attr_values = {}
            expr_attr_names = {}
            
            # Always update the timestamp
            updates['updated_at'] = datetime.utcnow().isoformat() + 'Z'
            
            for key, value in updates.items():
                # Use expression attribute names to handle reserved words
                attr_name = f"#{key}"
                attr_value = f":{key}"
                expr_attr_names[attr_name] = key
                expr_attr_values[attr_value] = value
                update_expr_parts.append(f"{attr_name} = {attr_value}")
            
            update_expression = "SET " + ", ".join(update_expr_parts)
            
            response = self.table.update_item(
                Key={'PK': pk, 'SK': sk},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expr_attr_names,
                ExpressionAttributeValues=expr_attr_values,
                ReturnValues='ALL_NEW'
            )
            
            return response.get('Attributes', {})
        except ClientError as e:
            raise Exception(f"Error updating item: {e.response['Error']['Message']}")
    
    def delete_item(self, pk: str, sk: str) -> bool:
        """Delete an item"""
        try:
            self.table.delete_item(
                Key={'PK': pk, 'SK': sk}
            )
            return True
        except ClientError as e:
            raise Exception(f"Error deleting item: {e.response['Error']['Message']}")
    
    def batch_write_items(self, items: List[Dict[str, Any]]) -> bool:
        """Batch write multiple items"""
        try:
            with self.table.batch_writer() as batch:
                for item in items:
                    # Add timestamps
                    now = datetime.utcnow().isoformat() + 'Z'
                    if 'created_at' not in item:
                        item['created_at'] = now
                    item['updated_at'] = now
                    batch.put_item(Item=item)
            return True
        except ClientError as e:
            raise Exception(f"Error batch writing items: {e.response['Error']['Message']}")
    
    def query_by_gsi(
        self, 
        index_name: str,
        pk_value: str,
        sk_value: Optional[str] = None,
        sk_begins_with: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Query items using a Global Secondary Index"""
        try:
            # Determine the correct attribute names based on index
            if index_name == 'GSI1':
                pk_attr = 'GSI1PK'
                sk_attr = 'GSI1SK'
            elif index_name == 'GSI2':
                pk_attr = 'GSI2PK'
                sk_attr = 'GSI2SK'
            else:
                raise ValueError(f"Unknown index: {index_name}")
            
            query_params = {
                'IndexName': index_name,
                'KeyConditionExpression': Key(pk_attr).eq(pk_value)
            }
            
            if sk_value:
                query_params['KeyConditionExpression'] &= Key(sk_attr).eq(sk_value)
            elif sk_begins_with:
                query_params['KeyConditionExpression'] &= Key(sk_attr).begins_with(sk_begins_with)
            
            if limit:
                query_params['Limit'] = limit
            
            response = self.table.query(**query_params)
            return response.get('Items', [])
        except ClientError as e:
            raise Exception(f"Error querying GSI: {e.response['Error']['Message']}")