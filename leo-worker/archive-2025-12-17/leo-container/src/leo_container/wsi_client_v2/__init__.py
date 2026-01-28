"""
WSI Client v2 - Full Feature Parity Implementation

This module provides a WebSocket client with 100% feature parity to wsi_server.

Key Features:
- All 3 modes: autonomous, interactive, confirm_first
- Decision prompts and responses
- Context commands: /context, /save, /clear
- Multi-iteration workflow
- Session management
- Log streaming integration

Based on: wsi_server/server.py
Adapted for: Client connection model with retry logic
"""

from .client import WSIClient

__all__ = ["WSIClient"]
