"""
Screenshot Watcher - Monitors for new screenshots and streams them via WSI

Watches a directory for new screenshot files and automatically sends them
to the orchestrator for live preview in the browser.

Architecture:
- Uses watchdog for filesystem monitoring (or polling fallback)
- Debounces events to avoid flooding
- Queues screenshots for async sending
- Integrates with WSI client for streaming
"""

import asyncio
import logging
import os
import time
from pathlib import Path
from typing import Optional, Set, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .client import WSIClient

logger = logging.getLogger(__name__)

# Supported image extensions
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp'}


class ScreenshotWatcher:
    """
    Watches a directory for new screenshots and streams them via WSI.

    Features:
    - Filesystem monitoring for new files
    - Debouncing to prevent duplicate sends
    - Async queue for non-blocking streaming
    - Automatic stage detection from path
    """

    def __init__(
        self,
        wsi_client: "WSIClient",
        watch_dir: str,
        poll_interval: float = 1.0,
        debounce_seconds: float = 0.5,
    ):
        """
        Initialize screenshot watcher.

        Args:
            wsi_client: WSI client for sending screenshots
            watch_dir: Directory to watch for screenshots
            poll_interval: How often to poll for new files (seconds)
            debounce_seconds: Minimum time between processing same file
        """
        self.wsi_client = wsi_client
        self.watch_dir = Path(watch_dir)
        self.poll_interval = poll_interval
        self.debounce_seconds = debounce_seconds

        # Tracking state
        self._seen_files: Set[str] = set()
        self._file_timestamps: dict[str, float] = {}
        self._running = False
        self._task: Optional[asyncio.Task] = None

        # Current generation stage (can be updated during generation)
        self.current_stage: Optional[str] = None

        logger.info(f"ScreenshotWatcher initialized: {watch_dir}")

    def set_stage(self, stage: str) -> None:
        """Update the current generation stage for new screenshots."""
        self.current_stage = stage
        logger.debug(f"Screenshot stage set to: {stage}")

    def _is_screenshot(self, path: Path) -> bool:
        """Check if a path is a supported screenshot file."""
        return path.suffix.lower() in IMAGE_EXTENSIONS

    def _detect_stage_from_path(self, file_path: Path) -> Optional[str]:
        """
        Detect generation stage from file path or name.

        Examples:
        - /workspace/leo-artifacts/screenshots/qa/homepage.png -> "quality_assurance"
        - /workspace/leo-artifacts/screenshots/iteration_2/test.png -> "iteration_2"
        - homepage-test.png -> None (use current_stage)
        """
        path_str = str(file_path).lower()

        # Check path components for stage indicators
        if '/qa/' in path_str or '/quality' in path_str:
            return "quality_assurance"

        # Check for iteration patterns
        import re
        iteration_match = re.search(r'iteration[_-]?(\d+)', path_str)
        if iteration_match:
            return f"iteration_{iteration_match.group(1)}"

        # Check filename for stage hints
        name = file_path.stem.lower()
        if 'qa' in name or 'test' in name:
            return "quality_assurance"

        return self.current_stage

    def _get_description_from_filename(self, filename: str) -> str:
        """
        Generate a human-readable description from filename.

        Examples:
        - homepage-test.png -> "Homepage test"
        - user_dashboard_mobile.png -> "User dashboard mobile"
        """
        # Remove extension and split on common separators
        name = Path(filename).stem
        # Replace separators with spaces
        name = name.replace('-', ' ').replace('_', ' ')
        # Title case and return
        return name.title()

    async def _process_screenshot(self, file_path: Path) -> None:
        """Process and send a single screenshot."""
        try:
            # Get file info
            stat = file_path.stat()
            file_key = str(file_path)

            # Check debounce
            last_seen = self._file_timestamps.get(file_key, 0)
            if time.time() - last_seen < self.debounce_seconds:
                return

            # Update timestamp
            self._file_timestamps[file_key] = time.time()
            self._seen_files.add(file_key)

            # Detect stage and description
            stage = self._detect_stage_from_path(file_path)
            description = self._get_description_from_filename(file_path.name)

            logger.info(f"Processing screenshot: {file_path.name} (stage={stage})")

            # Send via WSI client
            success = await self.wsi_client.send_screenshot(
                file_path=str(file_path),
                description=description,
                stage=stage
            )

            if success:
                logger.debug(f"Screenshot sent successfully: {file_path.name}")
            else:
                logger.warning(f"Failed to send screenshot: {file_path.name}")

        except Exception as e:
            logger.error(f"Error processing screenshot {file_path}: {e}")

    async def _scan_directory(self) -> None:
        """Scan watch directory for new screenshots."""
        if not self.watch_dir.exists():
            return

        try:
            # Recursively find all image files
            for path in self.watch_dir.rglob("*"):
                if path.is_file() and self._is_screenshot(path):
                    file_key = str(path)

                    # Check if this is a new file we haven't processed
                    if file_key not in self._seen_files:
                        # Also check modification time - only process recent files
                        try:
                            mtime = path.stat().st_mtime
                            # Only process files modified in the last 60 seconds
                            # This prevents processing old screenshots on startup
                            if time.time() - mtime < 60:
                                await self._process_screenshot(path)
                            else:
                                # Mark as seen to avoid future checks
                                self._seen_files.add(file_key)
                        except OSError:
                            pass

        except Exception as e:
            logger.error(f"Error scanning directory {self.watch_dir}: {e}")

    async def _watch_loop(self) -> None:
        """Main watch loop - polls for new files."""
        logger.info(f"Starting screenshot watch loop: {self.watch_dir}")

        while self._running:
            try:
                await self._scan_directory()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in watch loop: {e}")

            await asyncio.sleep(self.poll_interval)

        logger.info("Screenshot watch loop stopped")

    def start(self) -> None:
        """Start watching for screenshots."""
        if self._running:
            logger.warning("Screenshot watcher already running")
            return

        self._running = True

        # Create watch directory if it doesn't exist
        self.watch_dir.mkdir(parents=True, exist_ok=True)

        # Start the watch loop as a background task
        self._task = asyncio.create_task(self._watch_loop())
        logger.info(f"Screenshot watcher started: {self.watch_dir}")

    def stop(self) -> None:
        """Stop watching for screenshots."""
        if not self._running:
            return

        self._running = False

        if self._task:
            self._task.cancel()
            self._task = None

        logger.info("Screenshot watcher stopped")

    def clear_seen(self) -> None:
        """Clear the set of seen files (for testing or reset)."""
        self._seen_files.clear()
        self._file_timestamps.clear()
        logger.debug("Cleared seen files cache")


# Global instance for easy access
_watcher_instance: Optional[ScreenshotWatcher] = None


def get_screenshot_watcher() -> Optional[ScreenshotWatcher]:
    """Get the global screenshot watcher instance."""
    return _watcher_instance


def create_screenshot_watcher(
    wsi_client: "WSIClient",
    watch_dir: str,
    **kwargs
) -> ScreenshotWatcher:
    """
    Create and register the global screenshot watcher.

    Args:
        wsi_client: WSI client for sending screenshots
        watch_dir: Directory to watch for screenshots
        **kwargs: Additional arguments passed to ScreenshotWatcher

    Returns:
        The created ScreenshotWatcher instance
    """
    global _watcher_instance

    if _watcher_instance:
        _watcher_instance.stop()

    _watcher_instance = ScreenshotWatcher(wsi_client, watch_dir, **kwargs)
    return _watcher_instance
