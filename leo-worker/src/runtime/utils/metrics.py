"""
Metrics collection for Leo Container using Prometheus.

Provides:
- Connection metrics (active connections, total connections, disconnections)
- Generation metrics (total generations, duration, success/failure)
- Error metrics (errors by type, retry counts)
- Message metrics (messages sent/received by type)
- Performance metrics (latency histograms)
"""

from prometheus_client import Counter, Gauge, Histogram, Summary, Info
import structlog
from typing import Optional

logger = structlog.get_logger()

# Connection Metrics
websocket_connections_total = Counter(
    'leo_websocket_connections_total',
    'Total WebSocket connections established',
    ['generation_id']
)

websocket_connections_active = Gauge(
    'leo_websocket_connections_active',
    'Currently active WebSocket connections'
)

websocket_disconnections_total = Counter(
    'leo_websocket_disconnections_total',
    'Total WebSocket disconnections',
    ['reason']  # normal, error, timeout
)

websocket_reconnection_attempts = Counter(
    'leo_websocket_reconnection_attempts_total',
    'Total reconnection attempts',
    ['success']  # true, false
)

# Generation Metrics
generation_total = Counter(
    'leo_generation_total',
    'Total app generations',
    ['mode', 'generator_mode', 'status']  # mode: interactive/confirm_first/autonomous, generator_mode: mock/real, status: success/failure
)

generation_duration_seconds = Histogram(
    'leo_generation_duration_seconds',
    'Generation duration in seconds',
    ['mode', 'generator_mode'],
    buckets=[10, 30, 60, 300, 600, 1200, 1800, 3600]  # 10s, 30s, 1m, 5m, 10m, 20m, 30m, 1h
)

generation_files_created = Histogram(
    'leo_generation_files_created',
    'Number of files created per generation',
    ['generator_mode'],
    buckets=[10, 25, 50, 75, 100, 150, 200]
)

# Error Metrics
error_total = Counter(
    'leo_error_total',
    'Total errors',
    ['error_type', 'retryable']  # ConnectionError, TimeoutError, etc.
)

retry_attempts_total = Counter(
    'leo_retry_attempts_total',
    'Total retry attempts',
    ['operation', 'success']  # operation: generate, suggestion, etc.
)

# Message Metrics
message_sent_total = Counter(
    'leo_message_sent_total',
    'Total messages sent',
    ['message_type']  # progress, log, completed, etc.
)

message_received_total = Counter(
    'leo_message_received_total',
    'Total messages received',
    ['message_type']  # command, prompt, approve, etc.
)

message_processing_seconds = Summary(
    'leo_message_processing_seconds',
    'Message processing time',
    ['message_type']
)

# System Info
system_info = Info(
    'leo_websocket_info',
    'System information'
)


# Helper functions for recording metrics

def record_connection(generation_id: str) -> None:
    """
    Record new WebSocket connection.

    Args:
        generation_id: Unique generation identifier
    """
    try:
        websocket_connections_total.labels(generation_id=generation_id).inc()
        websocket_connections_active.inc()
        logger.debug("Metrics: Connection established", generation_id=generation_id)
    except Exception as e:
        logger.warning("Failed to record connection metric", error=str(e))


def record_disconnection(reason: str = "normal") -> None:
    """
    Record WebSocket disconnection.

    Args:
        reason: Disconnection reason (normal, error, timeout)
    """
    try:
        websocket_disconnections_total.labels(reason=reason).inc()
        websocket_connections_active.dec()
        logger.debug("Metrics: Connection closed", reason=reason)
    except Exception as e:
        logger.warning("Failed to record disconnection metric", error=str(e))


def record_reconnection_attempt(success: bool) -> None:
    """
    Record WebSocket reconnection attempt.

    Args:
        success: Whether reconnection succeeded
    """
    try:
        websocket_reconnection_attempts.labels(success=str(success).lower()).inc()
        logger.debug("Metrics: Reconnection attempt", success=success)
    except Exception as e:
        logger.warning("Failed to record reconnection metric", error=str(e))


def record_generation(
    mode: str,
    generator_mode: str,
    duration_seconds: float,
    status: str,
    files_created: int = 0
) -> None:
    """
    Record app generation completion.

    Args:
        mode: Generation mode (interactive, confirm_first, autonomous)
        generator_mode: Generator mode (mock, real)
        duration_seconds: Generation duration in seconds
        status: Generation status (success, failure)
        files_created: Number of files created (optional)
    """
    try:
        generation_total.labels(mode=mode, generator_mode=generator_mode, status=status).inc()
        generation_duration_seconds.labels(mode=mode, generator_mode=generator_mode).observe(duration_seconds)

        if files_created > 0:
            generation_files_created.labels(generator_mode=generator_mode).observe(files_created)

        logger.debug(
            "Metrics: Generation recorded",
            mode=mode,
            generator_mode=generator_mode,
            status=status,
            duration_seconds=duration_seconds,
            files_created=files_created
        )
    except Exception as e:
        logger.warning("Failed to record generation metric", error=str(e))


def record_error(error_type: str, retryable: bool) -> None:
    """
    Record error occurrence.

    Args:
        error_type: Type of error (e.g., ConnectionError, TimeoutError)
        retryable: Whether the error is retryable
    """
    try:
        error_total.labels(error_type=error_type, retryable=str(retryable).lower()).inc()
        logger.debug("Metrics: Error recorded", error_type=error_type, retryable=retryable)
    except Exception as e:
        logger.warning("Failed to record error metric", error=str(e))


def record_retry(operation: str, success: bool) -> None:
    """
    Record retry attempt.

    Args:
        operation: Operation being retried (generate, suggestion, connect, etc.)
        success: Whether the retry succeeded
    """
    try:
        retry_attempts_total.labels(operation=operation, success=str(success).lower()).inc()
        logger.debug("Metrics: Retry recorded", operation=operation, success=success)
    except Exception as e:
        logger.warning("Failed to record retry metric", error=str(e))


def record_message_sent(message_type: str) -> None:
    """
    Record message sent to orchestrator.

    Args:
        message_type: Type of message (progress, log, completed, error, etc.)
    """
    try:
        message_sent_total.labels(message_type=message_type).inc()
        logger.debug("Metrics: Message sent", message_type=message_type)
    except Exception as e:
        logger.warning("Failed to record message sent metric", error=str(e))


def record_message_received(message_type: str) -> None:
    """
    Record message received from orchestrator.

    Args:
        message_type: Type of message (command, prompt, approve, etc.)
    """
    try:
        message_received_total.labels(message_type=message_type).inc()
        logger.debug("Metrics: Message received", message_type=message_type)
    except Exception as e:
        logger.warning("Failed to record message received metric", error=str(e))


def record_message_processing_time(message_type: str, duration_seconds: float) -> None:
    """
    Record message processing time.

    Args:
        message_type: Type of message
        duration_seconds: Processing duration in seconds
    """
    try:
        message_processing_seconds.labels(message_type=message_type).observe(duration_seconds)
        logger.debug(
            "Metrics: Message processing time",
            message_type=message_type,
            duration_seconds=duration_seconds
        )
    except Exception as e:
        logger.warning("Failed to record message processing metric", error=str(e))


def set_system_info(version: str, python_version: str, generator_mode: str) -> None:
    """
    Set system information.

    Args:
        version: Application version
        python_version: Python version
        generator_mode: Generator mode (mock/real)
    """
    try:
        system_info.info({
            'version': version,
            'python_version': python_version,
            'generator_mode': generator_mode
        })
        logger.info(
            "Metrics: System info set",
            version=version,
            python_version=python_version,
            generator_mode=generator_mode
        )
    except Exception as e:
        logger.warning("Failed to set system info metric", error=str(e))
