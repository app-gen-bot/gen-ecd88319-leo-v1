"""Centralized path management for the App Factory.

This module provides consistent path resolution for all stages and components.
Future enhancement: These paths will be configurable via environment variables or config files.
"""

from pathlib import Path


def _get_project_root() -> Path:
    """Get the project root directory (internal use).
    
    Returns:
        Path to the app-factory project root
    """
    # Current implementation: derive from this file's location
    # Future: Read from environment variable or config
    return Path(__file__).parent.parent.parent


def _get_apps_root() -> Path:
    """Get the root directory where applications are generated (internal use).
    
    Returns:
        Path to the apps directory
    """
    # Current implementation: apps directory in project root
    # Future: Read from APP_FACTORY_APPS_DIR environment variable
    return _get_project_root() / "apps"


def get_app_base_dir(app_name: str) -> Path:
    """Get the base directory for a specific application.
    
    Args:
        app_name: Name of the application
        
    Returns:
        Path to the application base directory
    """
    return _get_apps_root() / app_name




def get_frontend_dir(app_name: str) -> Path:
    """Get the frontend directory for an application (flat structure).
    
    Args:
        app_name: Name of the application
        
    Returns:
        Path to the frontend directory (same as app base for flat structure)
    """
    return get_app_base_dir(app_name)


def get_backend_dir(app_name: str) -> Path:
    """Get the backend directory for an application.
    
    Args:
        app_name: Name of the application
        
    Returns:
        Path to the backend directory
    """
    return get_app_base_dir(app_name) / "backend"