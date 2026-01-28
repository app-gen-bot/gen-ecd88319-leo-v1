"""
Custom exception classes for leo-websocket.

Provides a hierarchy of exceptions for different error scenarios,
making it easier to handle and retry specific error types.
"""


class LeoWebSocketError(Exception):
    """
    Base exception for leo-websocket errors.

    All custom exceptions in this module inherit from this base class,
    making it easy to catch all leo-websocket specific errors.
    """
    pass


class ConnectionError(LeoWebSocketError):
    """
    WebSocket connection errors.

    Raised when there are issues establishing or maintaining
    a WebSocket connection to the orchestrator.

    Examples:
        - Initial connection timeout
        - Connection dropped unexpectedly
        - Network unreachable
    """
    pass


class RetryableError(LeoWebSocketError):
    """
    Errors that can be retried.

    Indicates transient failures that may succeed on retry,
    such as temporary network issues or service unavailability.

    Examples:
        - Network timeout
        - Service temporarily unavailable (503)
        - Rate limit exceeded (429)
    """
    pass


class NonRetryableError(LeoWebSocketError):
    """
    Errors that should not be retried.

    Indicates permanent failures that won't succeed on retry,
    such as authentication errors or invalid input.

    Examples:
        - Authentication failure (401)
        - Invalid request format (400)
        - Resource not found (404)
        - Permission denied (403)
    """
    pass


class TimeoutError(LeoWebSocketError):
    """
    Operation timeout errors.

    Raised when an operation exceeds its allowed time limit.

    Examples:
        - Connection timeout
        - Message send timeout
        - API call timeout
    """
    pass


class GeneratorError(LeoWebSocketError):
    """
    Generator-related errors.

    Raised when there are issues with the AI generator,
    including both real and mock mode generators.

    Examples:
        - Generator initialization failure
        - Generation execution error
        - Invalid generator state
    """
    pass
