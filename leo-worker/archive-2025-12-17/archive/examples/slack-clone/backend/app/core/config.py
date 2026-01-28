"""
Application configuration using Pydantic Settings
"""
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Application
    APP_NAME: str = "Slack Clone"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    
    # AWS Configuration
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_DEFAULT_REGION: str = "us-east-1"
    DYNAMODB_ENDPOINT_URL: Optional[str] = None  # For local development
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Authentication
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 7
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/google/callback"
    
    # S3 Configuration
    S3_BUCKET_NAME: str = "slack-clone-files"
    S3_BUCKET_REGION: str = "us-east-1"
    
    # Email (AWS SES)
    SES_FROM_EMAIL: str = "noreply@example.com"
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_FILE_TYPES: str = "image/*,application/pdf,text/*"
    
    # WebSocket
    WS_MESSAGE_RATE_LIMIT: int = 10  # messages per second
    WS_PING_INTERVAL: int = 30  # seconds
    
    # Rate Limiting
    RATE_LIMIT_GENERAL: int = 60  # requests per minute
    RATE_LIMIT_SEARCH: int = 20
    RATE_LIMIT_FILE_UPLOAD: int = 10
    RATE_LIMIT_MESSAGE_SEND: int = 30


# Create settings instance
settings = Settings()