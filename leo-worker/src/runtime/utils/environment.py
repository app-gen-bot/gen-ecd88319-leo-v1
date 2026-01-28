"""
Environment configuration for Leo Container.
"""

import os
from typing import Dict
from dataclasses import dataclass

@dataclass
class Config:
    """Container configuration"""
    ws_url: str
    generation_id: str
    workspace_path: str
    generator_mode: str  # 'mock' or 'real'
    mode: str  # 'interactive', 'confirm_first', 'autonomous'
    max_iterations: int
    enable_expansion: bool
    log_level: str
    claude_token: str | None  # Required for real mode

    # WebSocket resilience configuration
    websocket_connect_timeout: int  # Connection timeout in seconds
    websocket_send_timeout: int  # Message send timeout in seconds
    websocket_max_retries: int  # Max reconnection attempts
    websocket_retry_backoff_base: float  # Base delay for exponential backoff

    # Real mode resilience configuration
    real_mode_max_retries: int  # Max retries for API calls
    real_mode_generate_timeout: int  # Timeout for generate_app() in seconds
    real_mode_suggestion_timeout: int  # Timeout for get_next_prompt() in seconds
    real_mode_fallback_to_mock: bool  # Fallback to mock mode on failure

    def validate(self) -> None:
        """Validate configuration"""
        # Required for all modes
        if not self.ws_url:
            raise ValueError("WS_URL is required")
        if not self.generation_id:
            raise ValueError("GENERATION_ID is required")

        # Generator mode validation
        if self.generator_mode not in ['mock', 'real']:
            raise ValueError(f"GENERATOR_MODE must be 'mock' or 'real', got: {self.generator_mode}")

        # Real mode requires Claude token
        if self.generator_mode == 'real' and not self.claude_token:
            raise ValueError(
                "CLAUDE_CODE_OAUTH_TOKEN is required for real mode. "
                "Set environment variable: export CLAUDE_CODE_OAUTH_TOKEN=your-token"
            )

        # Mode validation
        if self.mode not in ['interactive', 'confirm_first', 'autonomous']:
            raise ValueError(f"MODE must be interactive/confirm_first/autonomous, got: {self.mode}")

def load_config() -> Config:
    """
    Load and validate configuration from environment.

    Returns:
        Validated Config instance

    Raises:
        ValueError: If required variables missing or invalid
    """
    config = Config(
        ws_url=os.environ.get('WS_URL', ''),
        generation_id=os.environ.get('GENERATION_ID', ''),
        workspace_path='/workspace',
        generator_mode=os.environ.get('GENERATOR_MODE', 'mock'),
        mode=os.environ.get('MODE', 'autonomous'),
        max_iterations=int(os.environ.get('MAX_ITERATIONS', '10')),
        enable_expansion=os.environ.get('ENABLE_EXPANSION', 'false').lower() == 'true',
        log_level=os.environ.get('LOG_LEVEL', 'INFO'),
        claude_token=os.environ.get('CLAUDE_CODE_OAUTH_TOKEN'),

        # WebSocket resilience configuration
        websocket_connect_timeout=int(os.environ.get('WEBSOCKET_CONNECT_TIMEOUT', '30')),
        websocket_send_timeout=int(os.environ.get('WEBSOCKET_SEND_TIMEOUT', '10')),
        websocket_max_retries=int(os.environ.get('WEBSOCKET_MAX_RETRIES', '5')),
        websocket_retry_backoff_base=float(os.environ.get('WEBSOCKET_RETRY_BACKOFF_BASE', '1.0')),

        # Real mode resilience configuration
        real_mode_max_retries=int(os.environ.get('REAL_MODE_MAX_RETRIES', '3')),
        real_mode_generate_timeout=int(os.environ.get('REAL_MODE_GENERATE_TIMEOUT', '1800')),
        real_mode_suggestion_timeout=int(os.environ.get('REAL_MODE_SUGGESTION_TIMEOUT', '60')),
        real_mode_fallback_to_mock=os.environ.get('REAL_MODE_FALLBACK_TO_MOCK', 'false').lower() == 'true',
    )

    config.validate()
    return config
