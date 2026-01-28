"""
Configuration settings for the AI Lawyer backend
"""

from typing import List, Union, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, Field
from functools import lru_cache
import json
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "AI Tenant Rights Advisor API"
    api_prefix: str = "/api/v1"
    debug: bool = False
    
    # AWS Configuration
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "us-east-1"
    
    # DynamoDB Tables
    dynamodb_table_name: str = "ai-lawyer-main-table"
    dynamodb_auth_table_name: str = "ai-lawyer-auth-table"
    
    # S3 Configuration
    s3_bucket_name: str = "ai-lawyer-documents"
    max_file_size_mb: int = 50
    
    # OpenAI Configuration
    openai_api_key: str
    openai_model: str = "gpt-4.1"
    openai_max_tokens: int = 2000
    openai_temperature: float = 0.7
    
    # Better Auth Configuration
    better_auth_secret: str
    better_auth_url: str = "http://localhost:3095"
    better_auth_database_url: Optional[str] = None
    
    # Demo User
    demo_user_email: str = "demo@example.com"
    demo_user_password: str = "DemoRocks2025!"
    demo_user_id: str = "demo_user_123"
    
    # CORS
    allowed_origins: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3095"
    ]
    
    # Session Configuration
    session_timeout_minutes: int = 30
    
    # Backend Server
    backend_port: int = 8000
    backend_url: Optional[str] = "http://localhost:8000"
    
    # Development
    environment: str = "development"
    log_level: str = "INFO"
    auth_bypass: bool = False
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 3600  # seconds
    
    # File Upload
    supported_file_types: Optional[str] = Field(default=".pdf,.png,.jpg,.jpeg,.docx,.txt")
    max_upload_size_bytes: int = 52428800  # 50MB
    
    @field_validator('allowed_origins', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @property
    def supported_file_types_list(self) -> List[str]:
        """Get supported file types as a list"""
        if self.supported_file_types:
            return [ft.strip() for ft in self.supported_file_types.split(',')]
        return [".pdf", ".png", ".jpg", ".jpeg", ".docx", ".txt"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        env_parse_none_str="None",
        # Don't parse complex fields as JSON by default
        env_nested_delimiter=None,
        # Disable JSON parsing for these fields
        json_schema_extra={
            "json_encoders": {
                list: lambda v: v
            }
        }
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create settings instance
settings = get_settings()