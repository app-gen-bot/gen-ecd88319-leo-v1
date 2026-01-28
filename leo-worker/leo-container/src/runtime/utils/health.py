"""
Health check endpoints for Leo Container.

Provides health and readiness checks for monitoring system status.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import structlog

logger = structlog.get_logger()


class HealthChecker:
    """
    Manages system health and readiness status.

    Tracks:
    - WebSocket connection status
    - Generator initialization status
    - System uptime
    - Last heartbeat timestamp
    """

    def __init__(self) -> None:
        """Initialize health checker."""
        self.start_time = datetime.now()
        self.websocket_connected = False
        self.generator_initialized = False
        self.last_heartbeat: Optional[datetime] = None
        logger.info("Health checker initialized")

    def check_health(self) -> Dict[str, Any]:
        """
        Check overall system health.

        Returns:
            Health status dict with:
            - status: overall status (healthy/degraded/unhealthy)
            - timestamp: current timestamp
            - checks: individual component health checks
        """
        checks = {
            'websocket': self._check_websocket(),
            'generator': self._check_generator(),
            'uptime': self._get_uptime()
        }

        # Determine overall status based on component health
        websocket_status = checks['websocket'].get('status')
        generator_status = checks['generator'].get('status')

        if websocket_status == 'healthy' and generator_status == 'healthy':
            overall_status = 'healthy'
        elif websocket_status == 'unhealthy' or generator_status == 'unhealthy':
            overall_status = 'unhealthy'
        else:
            overall_status = 'degraded'

        result = {
            'status': overall_status,
            'timestamp': datetime.now().isoformat(),
            'checks': checks
        }

        logger.debug("Health check performed", status=overall_status)
        return result

    def check_readiness(self) -> Dict[str, Any]:
        """
        Check if system is ready to receive requests.

        System is ready when:
        - WebSocket is connected
        - Generator is initialized

        Returns:
            Readiness status dict with:
            - ready: boolean indicating readiness
            - timestamp: current timestamp
            - websocket_connected: WebSocket connection status
            - generator_initialized: Generator initialization status
        """
        ready = self.websocket_connected and self.generator_initialized

        result = {
            'ready': ready,
            'timestamp': datetime.now().isoformat(),
            'websocket_connected': self.websocket_connected,
            'generator_initialized': self.generator_initialized
        }

        logger.debug("Readiness check performed", ready=ready)
        return result

    def _check_websocket(self) -> Dict[str, Any]:
        """
        Check WebSocket connection status.

        Returns:
            WebSocket health status dict
        """
        if self.websocket_connected:
            result = {
                'status': 'healthy',
                'connected': True
            }

            # Include heartbeat info if available
            if self.last_heartbeat:
                seconds_since_heartbeat = (datetime.now() - self.last_heartbeat).total_seconds()
                result['last_heartbeat_seconds_ago'] = seconds_since_heartbeat

                # Warn if heartbeat is stale (> 60 seconds)
                if seconds_since_heartbeat > 60:
                    result['status'] = 'degraded'
                    result['message'] = f'No heartbeat for {seconds_since_heartbeat:.0f} seconds'

            return result
        else:
            return {
                'status': 'unhealthy',
                'connected': False,
                'message': 'WebSocket not connected'
            }

    def _check_generator(self) -> Dict[str, Any]:
        """
        Check generator initialization status.

        Returns:
            Generator health status dict
        """
        if self.generator_initialized:
            return {
                'status': 'healthy',
                'initialized': True
            }
        else:
            return {
                'status': 'degraded',
                'initialized': False,
                'message': 'Generator not initialized'
            }

    def _get_uptime(self) -> Dict[str, Any]:
        """
        Get system uptime information.

        Returns:
            Uptime status dict
        """
        uptime_seconds = (datetime.now() - self.start_time).total_seconds()
        return {
            'status': 'healthy',
            'uptime_seconds': uptime_seconds,
            'start_time': self.start_time.isoformat()
        }

    def update_websocket_status(self, connected: bool) -> None:
        """
        Update WebSocket connection status.

        Args:
            connected: Whether WebSocket is connected
        """
        previous_status = self.websocket_connected
        self.websocket_connected = connected

        if connected:
            self.last_heartbeat = datetime.now()

        if previous_status != connected:
            logger.info(
                "WebSocket status changed",
                connected=connected,
                previous=previous_status
            )

    def update_generator_status(self, initialized: bool) -> None:
        """
        Update generator initialization status.

        Args:
            initialized: Whether generator is initialized
        """
        previous_status = self.generator_initialized
        self.generator_initialized = initialized

        if previous_status != initialized:
            logger.info(
                "Generator status changed",
                initialized=initialized,
                previous=previous_status
            )

    def record_heartbeat(self) -> None:
        """Record a heartbeat timestamp."""
        self.last_heartbeat = datetime.now()
        logger.debug("Heartbeat recorded")
