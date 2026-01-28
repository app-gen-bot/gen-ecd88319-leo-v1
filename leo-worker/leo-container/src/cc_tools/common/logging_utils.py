"""
Shared logging utilities for MCP servers.

Provides consistent file-based logging setup across all MCP tools while avoiding
interference with the mcp-agent framework's console transport.
"""

import logging
import os
import sys
from pathlib import Path
from typing import Optional


def setup_mcp_server_logging(
    server_name: str,
    log_filename: Optional[str] = None
) -> logging.Logger:
    """
    Set up file-only logging for MCP servers.
    
    This function creates a logger that only logs to files, avoiding
    interference with the mcp-agent framework's console transport system.
    To effectively disable logging, set MCP_LOG_LEVEL to ERROR or CRITICAL.
    
    Args:
        server_name: Name of the MCP server (used for logger name)
        log_filename: Optional custom log filename (defaults to {server_name.lower()}_server.log)
        
    Returns:
        Configured logger instance
        
    Environment Variables:
        MCP_LOG_LEVEL: Set log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
                      Use ERROR or CRITICAL to effectively disable most logging
    """
    
    # Determine log level from environment
    log_level_str = os.environ.get("MCP_LOG_LEVEL", "INFO").upper()
    try:
        log_level = getattr(logging, log_level_str)
    except AttributeError:
        log_level = logging.INFO
        # Minimal fallback error reporting
        print(f"Warning: Invalid MCP_LOG_LEVEL '{log_level_str}', using INFO", file=sys.stderr)
    
    # Create logger
    logger = logging.getLogger(server_name)
    logger.setLevel(log_level)
    
    # Prevent duplicate handlers
    if logger.handlers:
        return logger
    
    # Create formatter (no logger name since logs are file-separated)
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Always add file handler (never console logging)
    try:
        # Create logs directory in mcp-tools
        log_dir = Path(__file__).parent.parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        # Use custom filename or default
        if not log_filename:
            log_filename = f"{server_name.lower()}_server.log"
        
        log_file = log_dir / log_filename
        file_handler = logging.FileHandler(log_file, mode='a')
        file_handler.setLevel(log_level)  # Use the same level as the logger
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Log startup to file only
        logger.debug(f"{server_name} MCP Server logging to: {log_file} (level: {log_level_str})")
        
    except Exception as e:
        # Minimal fallback error reporting to stderr only
        print(f"Warning: Failed to setup file logging for {server_name}: {e}", file=sys.stderr)
    
    return logger


def log_server_startup(logger: logging.Logger, server_name: str, args=None, additional_info: dict = None):
    """
    Log standardized server startup information.
    
    Args:
        logger: Logger instance
        server_name: Name of the MCP server
        args: Command line arguments (optional)
        additional_info: Additional info to log (optional)
    """
    logger.info(f"=== {server_name} MCP Server Starting ===")
    
    if args:
        logger.info(f"Command line args: {args}")
    
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Process PID: {os.getpid()}")
    
    if additional_info:
        for key, value in additional_info.items():
            logger.info(f"{key}: {value}")


def log_server_shutdown(logger: logging.Logger, server_name: str):
    """
    Log standardized server shutdown information.
    
    Args:
        logger: Logger instance
        server_name: Name of the MCP server
    """
    logger.info(f"=== {server_name} MCP Server Shutdown Complete ===")


def setup_signal_handlers(logger: logging.Logger, server_name: str):
    """
    Set up signal handlers for graceful shutdown logging.
    
    Args:
        logger: Logger instance
        server_name: Name of the MCP server
    """
    import signal
    
    def signal_handler(signum, frame):
        logger.info(f"[MAIN] Received signal {signum}, shutting down gracefully")
        sys.exit(0)
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    logger.info("[MAIN] Signal handlers installed")