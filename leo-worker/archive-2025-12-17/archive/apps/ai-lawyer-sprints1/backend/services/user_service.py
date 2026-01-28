"""
User service for authentication and profile management
"""

from typing import Optional, Dict, Any
from datetime import datetime
from models.user import User, UserInDB, UserCreate, UserProfile
from utils.auth import get_password_hash, verify_password
from db.operations import DynamoDBOperations
from config import settings
import asyncio


class UserService:
    """Service for handling user operations"""
    
    def __init__(self):
        self.db = DynamoDBOperations()
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user exists
        existing = self.get_user_by_email(user_data.email)
        if existing:
            raise ValueError("Email already registered")
        
        # Create user
        user_id = f"user_{int(datetime.utcnow().timestamp() * 1000)}"
        user_item = {
            'PK': f'USER#{user_id}',
            'SK': 'PROFILE',
            'id': user_id,
            'email': user_data.email,
            'name': user_data.name,
            'user_type': user_data.user_type,
            'hashed_password': get_password_hash(user_data.password),
            'email_verified': False,
            'entity_type': 'user',
            # GSI for email lookup
            'GSI1PK': f'EMAIL#{user_data.email}',
            'GSI1SK': f'USER#{user_id}'
        }
        
        self.db.put_item(user_item)
        
        # Create user profile
        profile_item = {
            'PK': f'USER#{user_id}',
            'SK': 'PROFILE_DETAILS',
            'user_id': user_id,
            'preferences': {
                'notification_email': True,
                'notification_sms': False
            },
            'entity_type': 'user_profile'
        }
        self.db.put_item(profile_item)
        
        return User(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            user_type=user_data.user_type,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            email_verified=False
        )
    
    def get_user(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID"""
        item = self.db.get_item(f'USER#{user_id}', 'PROFILE')
        if not item:
            return None
        
        return UserInDB(
            id=item['id'],
            email=item['email'],
            name=item['name'],
            user_type=item['user_type'],
            phone=item.get('phone'),
            address=item.get('address'),
            created_at=datetime.fromisoformat(item['created_at'].replace('Z', '+00:00')),
            updated_at=datetime.fromisoformat(item['updated_at'].replace('Z', '+00:00')),
            email_verified=item.get('email_verified', False),
            hashed_password=item['hashed_password']
        )
    
    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email"""
        items = self.db.query_by_gsi('GSI1', f'EMAIL#{email}')
        if not items:
            return None
        
        # Get the user ID from GSI result
        user_id = items[0]['id']
        return self.get_user(user_id)
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user"""
        user = self.get_user_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        return User(
            id=user.id,
            email=user.email,
            name=user.name,
            user_type=user.user_type,
            phone=user.phone,
            address=user.address,
            created_at=user.created_at,
            updated_at=user.updated_at,
            email_verified=user.email_verified
        )
    
    def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile details"""
        item = self.db.get_item(f'USER#{user_id}', 'PROFILE_DETAILS')
        if not item:
            return None
        
        return UserProfile(
            user_id=item['user_id'],
            phone=item.get('phone'),
            current_rental_address=item.get('current_rental_address'),
            move_in_date=item.get('move_in_date'),
            landlord_name=item.get('landlord_name'),
            landlord_contact=item.get('landlord_contact'),
            preferences=item.get('preferences', {})
        )
    
    def update_user_profile(self, user_id: str, profile_data: dict) -> UserProfile:
        """Update user profile"""
        # Update user basic info if provided
        if 'phone' in profile_data:
            self.db.update_item(
                f'USER#{user_id}',
                'PROFILE',
                {'phone': profile_data['phone']}
            )
        
        # Update profile details
        updates = {k: v for k, v in profile_data.items() if v is not None}
        self.db.update_item(
            f'USER#{user_id}',
            'PROFILE_DETAILS',
            updates
        )
        
        # Return updated profile
        return self.get_user_profile(user_id)
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user (async version for API endpoints)"""
        # Check if user exists
        existing = self.get_user_by_email(user_data['email'])
        if existing:
            raise ValueError("Email already registered")
        
        # Create user
        user_id = f"user_{int(datetime.utcnow().timestamp() * 1000)}"
        user_item = {
            'PK': f'USER#{user_id}',
            'SK': 'PROFILE',
            'id': user_id,
            'email': user_data['email'],
            'name': user_data['name'],
            'user_type': user_data['user_type'],
            'hashed_password': user_data['hashed_password'],
            'email_verified': user_data.get('email_verified', False),
            'entity_type': 'user',
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'updated_at': datetime.utcnow().isoformat() + 'Z',
            # GSI for email lookup
            'GSI1PK': f'EMAIL#{user_data["email"]}',
            'GSI1SK': f'USER#{user_id}'
        }
        
        self.db.put_item(user_item)
        
        # Create user profile
        profile_item = {
            'PK': f'USER#{user_id}',
            'SK': 'PROFILE_DETAILS',
            'user_id': user_id,
            'preferences': {
                'notification_email': True,
                'notification_sms': False
            },
            'entity_type': 'user_profile'
        }
        self.db.put_item(profile_item)
        
        return {
            'id': user_id,
            'email': user_data['email'],
            'name': user_data['name'],
            'user_type': user_data['user_type'],
            'email_verified': user_data.get('email_verified', False),
            'created_at': user_item['created_at'],
            'updated_at': user_item['updated_at']
        }

    async def get_user_by_email_async(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email (async version)"""
        # This is just wrapping the sync version for now
        user = self.get_user_by_email(email)
        if user:
            return {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user.user_type,
                'hashed_password': user.hashed_password,
                'email_verified': user.email_verified
            }
        return None

    async def create_demo_user(self):
        """Create demo user if it doesn't exist"""
        existing = self.get_user_by_email(settings.demo_user_email)
        if existing:
            print(f"Demo user already exists: {settings.demo_user_email}")
            return
        
        # Create demo user with specific ID
        user_item = {
            'PK': f'USER#{settings.demo_user_id}',
            'SK': 'PROFILE',
            'id': settings.demo_user_id,
            'email': settings.demo_user_email,
            'name': 'Demo User',
            'user_type': 'tenant',
            'phone': '(555) 123-4567',
            'address': '123 Demo Street, San Francisco, CA 94105',
            'hashed_password': get_password_hash(settings.demo_user_password),
            'email_verified': True,
            'entity_type': 'user',
            'GSI1PK': f'EMAIL#{settings.demo_user_email}',
            'GSI1SK': f'USER#{settings.demo_user_id}'
        }
        
        self.db.put_item(user_item)
        
        # Create demo profile
        profile_item = {
            'PK': f'USER#{settings.demo_user_id}',
            'SK': 'PROFILE_DETAILS',
            'user_id': settings.demo_user_id,
            'phone': '(555) 123-4567',
            'current_rental_address': '123 Demo Street, San Francisco, CA 94105',
            'move_in_date': '2023-01-01',
            'landlord_name': 'John Landlord',
            'landlord_contact': 'landlord@example.com',
            'preferences': {
                'notification_email': True,
                'notification_sms': False
            },
            'entity_type': 'user_profile'
        }
        self.db.put_item(profile_item)
        
        print(f"Demo user created: {settings.demo_user_email}")