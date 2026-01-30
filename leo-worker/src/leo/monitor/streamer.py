"""
Process Monitor Streamer - Integrates collector and analyzer with WSI.

Orchestrates the full flow:
1. Receives conversation log entries via callback
2. Buffers them in LogCollector
3. Periodically analyzes with HaikuAnalyzer (for devs) and FriendlySummarizer (for users)
4. Emits process_monitor messages (devs) and friendly_log messages (users) via WSI
5. Writes analysis to artifacts log file
"""

import asyncio
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, TYPE_CHECKING

from .collector import LogCollector, LogBatch
from .summarizer import HaikuAnalyzer, TrajectoryAnalysis, FriendlySummarizer, FriendlyUpdate

if TYPE_CHECKING:
    pass  # Avoid circular import with wsi client

logger = logging.getLogger(__name__)


class ProcessMonitorStreamer:
    """
    Orchestrates log collection, trajectory analysis, and WSI streaming.

    Emits both:
    - process_monitor messages (for dev users) with trajectory analysis
    - friendly_log messages (for user/user_plus) with simple status updates

    Usage:
        streamer = ProcessMonitorStreamer(wsi_client)
        await streamer.start(generation_id="gen-123")

        # Feed entries (called from conversation callback)
        streamer.add_entry(entry_dict)

        # When done
        await streamer.stop()
    """

    def __init__(
        self,
        wsi_client,
        batch_interval_seconds: int = 60,
        api_key: Optional[str] = None,
        artifacts_dir: Optional[str] = None
    ):
        """
        Initialize process monitor streamer.

        Args:
            wsi_client: WSI client for sending messages
            batch_interval_seconds: How often to emit analysis (default: 60s)
            api_key: Anthropic API key for Haiku (defaults to env var)
            artifacts_dir: Directory for writing log files (optional)
        """
        self.wsi_client = wsi_client
        self.collector = LogCollector(batch_interval_seconds=batch_interval_seconds)
        self.analyzer = HaikuAnalyzer(api_key=api_key)
        self.friendly_summarizer = FriendlySummarizer(api_key=api_key)

        self._running = False
        self._generation_id: Optional[str] = None
        self._artifacts_dir = artifacts_dir
        self._log_file: Optional[Path] = None

        # Set up callback from collector to analyzer
        self.collector.set_batch_callback(self._on_batch)

    async def start(self, generation_id: Optional[str] = None) -> None:
        """
        Start the process monitor.

        Args:
            generation_id: ID of the current generation (for tracking)
        """
        if self._running:
            return

        self._generation_id = generation_id
        self.collector.set_generation_id(generation_id)
        self.analyzer.reset_cumulative_stats()

        # Set up log file in artifacts directory
        if self._artifacts_dir:
            log_dir = Path(self._artifacts_dir) / "logs"
            log_dir.mkdir(parents=True, exist_ok=True)
            self._log_file = log_dir / "process_monitor.jsonl"
            logger.info(f"Process monitor logging to: {self._log_file}")

        await self.collector.start()
        self._running = True
        logger.info(f"ProcessMonitorStreamer started (generation: {generation_id})")

    async def stop(self) -> None:
        """Stop the process monitor and emit final analysis."""
        if not self._running:
            return

        await self.collector.stop()
        self._running = False
        logger.info("ProcessMonitorStreamer stopped")

    def add_entry(self, entry: Dict[str, Any]) -> None:
        """
        Add a conversation log entry.

        Called from the conversation callback (synchronous context).
        """
        if self._running:
            self.collector.add_entry(entry)

    def _on_batch(self, batch: LogBatch) -> None:
        """
        Handle a batch ready for analysis.

        Called by LogCollector when batch interval elapses.
        Runs both trajectory analysis (devs) and friendly summary (users).
        """
        try:
            # Analyze for dev mode (trajectory analysis)
            analysis = self.analyzer.analyze(batch)
            if analysis:
                asyncio.create_task(self._send_analysis(analysis))

            # Generate friendly summary for user mode
            friendly = self.friendly_summarizer.summarize(batch)
            if friendly:
                asyncio.create_task(self._send_friendly_update(friendly))
        except Exception as e:
            logger.error(f"Failed to process batch: {e}")

    async def _send_analysis(self, analysis: TrajectoryAnalysis) -> None:
        """Send trajectory analysis via WSI and write to log file."""
        try:
            # Build the process_monitor message
            message = {
                "type": "process_monitor",
                "generation_id": analysis.generation_id,
                "window": {
                    "start": analysis.window_start,
                    "end": analysis.window_end
                },
                "summary": analysis.summary,
                "trajectory": {
                    "score": analysis.trajectory_score,
                    "signals": analysis.trajectory_signals
                },
                "stats": analysis.stats
            }

            # Write to log file (if configured)
            if self._log_file:
                try:
                    with open(self._log_file, "a") as f:
                        f.write(json.dumps(message) + "\n")
                except Exception as e:
                    logger.warning(f"Failed to write to log file: {e}")

            # Send via WSI
            await self.wsi_client._send_raw_message(message)
            logger.info(f"Sent process_monitor: score={analysis.trajectory_score}, entries={analysis.stats.get('entry_count', 0)}")

        except Exception as e:
            logger.error(f"Failed to send process_monitor via WSI: {e}")

    async def _send_friendly_update(self, friendly: FriendlyUpdate) -> None:
        """Send friendly log update via WSI."""
        try:
            # Build the friendly_log message
            message = {
                "type": "friendly_log",
                "message": friendly.message,
                "category": friendly.category,
                "timestamp": friendly.timestamp,
                "generation_id": friendly.generation_id
            }

            # Send via WSI
            await self.wsi_client._send_raw_message(message)
            logger.info(f"Sent friendly_log: {friendly.message} (category={friendly.category})")

        except Exception as e:
            logger.error(f"Failed to send friendly_log via WSI: {e}")


# Global instance for easy access (set by WSI client)
process_monitor_streamer: Optional[ProcessMonitorStreamer] = None


def get_process_monitor_streamer() -> Optional[ProcessMonitorStreamer]:
    """Get the global process monitor streamer instance."""
    return process_monitor_streamer


def set_process_monitor_streamer(streamer: Optional[ProcessMonitorStreamer]) -> None:
    """Set the global process monitor streamer instance."""
    global process_monitor_streamer
    process_monitor_streamer = streamer
