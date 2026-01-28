"""
HTTP server for metrics and health endpoints.

Provides:
- /metrics - Prometheus metrics endpoint
- /health - Health check endpoint
- /ready - Readiness check endpoint
"""

import asyncio
from aiohttp import web
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from typing import Optional
import structlog

from .health import HealthChecker

logger = structlog.get_logger()


class HTTPServer:
    """
    HTTP server for exposing metrics and health endpoints.

    Runs alongside the main WebSocket client to provide observability.
    """

    def __init__(self, health_checker: HealthChecker, port: int = 8080) -> None:
        """
        Initialize HTTP server.

        Args:
            health_checker: HealthChecker instance for health/readiness checks
            port: Port to listen on (default: 8080)
        """
        self.health_checker = health_checker
        self.port = port
        self.app: Optional[web.Application] = None
        self.runner: Optional[web.AppRunner] = None
        self.site: Optional[web.TCPSite] = None
        logger.info("HTTP server initialized", port=port)

    async def start(self) -> None:
        """
        Start HTTP server.

        Creates application, registers routes, and starts listening.
        """
        try:
            self.app = web.Application()

            # Add routes
            self.app.router.add_get('/metrics', self.metrics_handler)
            self.app.router.add_get('/health', self.health_handler)
            self.app.router.add_get('/ready', self.ready_handler)

            # Start server
            self.runner = web.AppRunner(self.app)
            await self.runner.setup()
            self.site = web.TCPSite(self.runner, '0.0.0.0', self.port)
            await self.site.start()

            logger.info(
                "HTTP server started",
                port=self.port,
                endpoints=['/metrics', '/health', '/ready']
            )

        except Exception as e:
            logger.error("Failed to start HTTP server", error=str(e), exc_info=True)
            raise

    async def stop(self) -> None:
        """
        Stop HTTP server.

        Gracefully shuts down the server and cleans up resources.
        """
        try:
            if self.site:
                await self.site.stop()
                logger.debug("HTTP site stopped")

            if self.runner:
                await self.runner.cleanup()
                logger.debug("HTTP runner cleaned up")

            logger.info("HTTP server stopped")

        except Exception as e:
            logger.error("Error stopping HTTP server", error=str(e), exc_info=True)

    async def metrics_handler(self, request: web.Request) -> web.Response:
        """
        Prometheus metrics endpoint.

        Returns all registered Prometheus metrics in text format.

        Args:
            request: HTTP request

        Returns:
            Response with Prometheus metrics
        """
        try:
            metrics = generate_latest()
            logger.debug("Metrics endpoint called")
            return web.Response(body=metrics, content_type=CONTENT_TYPE_LATEST)

        except Exception as e:
            logger.error("Error generating metrics", error=str(e), exc_info=True)
            return web.Response(
                text=f"Error generating metrics: {str(e)}",
                status=500
            )

    async def health_handler(self, request: web.Request) -> web.Response:
        """
        Health check endpoint.

        Returns system health status. Returns 200 if healthy, 503 otherwise.

        Args:
            request: HTTP request

        Returns:
            JSON response with health status
        """
        try:
            health = self.health_checker.check_health()
            status_code = 200 if health['status'] == 'healthy' else 503

            logger.debug("Health endpoint called", status=health['status'])
            return web.json_response(health, status=status_code)

        except Exception as e:
            logger.error("Error checking health", error=str(e), exc_info=True)
            return web.json_response(
                {
                    'status': 'unhealthy',
                    'error': str(e)
                },
                status=503
            )

    async def ready_handler(self, request: web.Request) -> web.Response:
        """
        Readiness check endpoint.

        Returns readiness status. Returns 200 if ready, 503 otherwise.

        Args:
            request: HTTP request

        Returns:
            JSON response with readiness status
        """
        try:
            readiness = self.health_checker.check_readiness()
            status_code = 200 if readiness['ready'] else 503

            logger.debug("Readiness endpoint called", ready=readiness['ready'])
            return web.json_response(readiness, status=status_code)

        except Exception as e:
            logger.error("Error checking readiness", error=str(e), exc_info=True)
            return web.json_response(
                {
                    'ready': False,
                    'error': str(e)
                },
                status=503
            )
