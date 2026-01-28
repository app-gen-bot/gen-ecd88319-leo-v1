"""
Structured logging setup for Leo Container.
Uses structlog for JSON logging compatible with CloudWatch.
"""

import sys
import logging
import structlog


def setup_logging(log_level: str = "INFO") -> structlog.BoundLogger:
    """
    Configure structured logging for the container.

    Args:
        log_level: Log level (DEBUG, INFO, WARNING, ERROR)

    Returns:
        Configured logger instance
    """
    # Map string log level to logging module level
    level_map = {
        "DEBUG": logging.DEBUG,
        "INFO": logging.INFO,
        "WARNING": logging.WARNING,
        "ERROR": logging.ERROR,
    }

    level = level_map.get(log_level.upper(), logging.INFO)

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Get logger
    logger = structlog.get_logger("leo-container")

    # Set log level using logging module
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )

    return logger
