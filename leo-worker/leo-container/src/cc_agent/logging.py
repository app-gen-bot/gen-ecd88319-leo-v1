"""Logging utilities for cc-agent applications.

Provides dual logging to both console and file with appropriate formatting.
Console output is clean and user-friendly, file output includes timestamps.
"""

import logging
import os
from pathlib import Path
from datetime import datetime
from typing import Optional


def setup_logging(
    name: str,
    log_dir: Optional[Path] = None,
    console_level: str = "INFO",
    file_level: str = "DEBUG"
) -> logging.Logger:
    """Set up dual logging (console + file) for cc-agent applications.
    
    Args:
        name: Logger name (also used for log filename)
        log_dir: Directory for log files (defaults to ./logs)
        console_level: Console log level (default: INFO)
        file_level: File log level (default: DEBUG)
        
    Returns:
        Configured logger instance
        
    Example:
        >>> from cc_agent.logging import setup_logging
        >>> logger = setup_logging("my_app")
        >>> logger.info("Starting application...")
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # Capture everything, handlers will filter
    
    # Remove any existing handlers
    logger.handlers = []
    
    # Set up log directory
    if log_dir is None:
        log_dir = Path("logs")
    log_dir = Path(log_dir)
    log_dir.mkdir(exist_ok=True)
    
    # Console handler - clean format without timestamps
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, console_level.upper()))
    console_format = logging.Formatter('%(message)s')
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File handler - detailed format with timestamps
    log_filename = f"{name}_{datetime.now().strftime('%Y-%m-%d')}.log"
    file_path = log_dir / log_filename
    file_handler = logging.FileHandler(file_path, mode='a', encoding='utf-8')
    file_handler.setLevel(getattr(logging, file_level.upper()))
    file_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(file_format)
    logger.addHandler(file_handler)
    
    # Log initialization
    logger.debug(f"Logger '{name}' initialized - Console: {console_level}, File: {file_level}")
    logger.debug(f"Log file: {file_path.absolute()}")
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get an existing logger by name.
    
    Args:
        name: Logger name
        
    Returns:
        Logger instance (creates a basic logger if not already configured)
    """
    return logging.getLogger(name)


def log_truncated(
    logger: logging.Logger,
    level: int,
    message: str,
    console_truncate: int = 0,
    file_truncate: int = 0
):
    """Log message with different truncation for console and file handlers.
    
    This function sends the same message with different truncation levels
    to console and file handlers, avoiding duplicate log entries.
    
    Args:
        logger: Logger instance to use
        level: Log level (e.g., logging.INFO, logging.DEBUG)
        message: Full message to log
        console_truncate: Max length for console output (0 = no truncation)
        file_truncate: Max length for file output (0 = no truncation)
    """
    # Don't process if logger won't output at this level
    if not logger.isEnabledFor(level):
        return
    
    # Get the caller's frame info for accurate file/line reporting
    frame = logging.currentframe()
    if frame is not None:
        frame = frame.f_back
    
    # Process each handler separately with appropriate truncation
    for handler in logger.handlers:
        # Skip if handler won't process this level
        if level < handler.level:
            continue
            
        # Determine truncation based on handler type
        if isinstance(handler, logging.FileHandler):
            # File handler - use file truncation
            if file_truncate > 0 and len(message) > file_truncate:
                truncated_msg = message[:file_truncate] + "..."
            else:
                truncated_msg = message
        elif isinstance(handler, logging.StreamHandler):
            # Console handler - use console truncation
            if console_truncate > 0 and len(message) > console_truncate:
                truncated_msg = message[:console_truncate] + "..."
            else:
                truncated_msg = message
        else:
            # Unknown handler type - use original message
            truncated_msg = message
        
        # Create a log record with the truncated message
        if frame is not None:
            record = logger.makeRecord(
                logger.name,
                level,
                frame.f_code.co_filename,
                frame.f_lineno,
                truncated_msg,
                (),
                None,
                func=frame.f_code.co_name
            )
        else:
            record = logger.makeRecord(
                logger.name,
                level,
                "(unknown file)",
                0,
                truncated_msg,
                (),
                None
            )
        
        # Let the handler process this record
        handler.handle(record)