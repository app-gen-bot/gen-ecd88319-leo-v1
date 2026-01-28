"""
Log Collector - Buffers conversation entries for summarization.

Collects conversation log entries from cc-agent's ConversationLogger
and buffers them for periodic summarization by HaikuSummarizer.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class LogBatch:
    """A batch of log entries ready for summarization."""
    entries: List[Dict[str, Any]]
    window_start: datetime
    window_end: datetime
    generation_id: Optional[str] = None

    @property
    def agent_names(self) -> List[str]:
        """Get unique agent names in this batch."""
        return list(set(e.get("agent", "unknown") for e in self.entries))

    @property
    def entry_types(self) -> Dict[str, int]:
        """Count entries by type."""
        counts: Dict[str, int] = {}
        for e in self.entries:
            t = e.get("type", "unknown")
            counts[t] = counts.get(t, 0) + 1
        return counts

    @property
    def total_cost(self) -> float:
        """Sum costs from result entries."""
        return sum(
            e.get("cost_usd", 0) or 0
            for e in self.entries
            if e.get("type") == "result"
        )

    @property
    def total_tokens(self) -> Dict[str, int]:
        """Sum tokens from result entries."""
        input_tokens = sum(
            e.get("input_tokens", 0) or 0
            for e in self.entries
            if e.get("type") == "result"
        )
        output_tokens = sum(
            e.get("output_tokens", 0) or 0
            for e in self.entries
            if e.get("type") == "result"
        )
        return {"input": input_tokens, "output": output_tokens}

    @property
    def tool_usage(self) -> Dict[str, int]:
        """Count tool uses by tool name."""
        counts: Dict[str, int] = {}
        for e in self.entries:
            if e.get("type") == "assistant_message":
                for tool in e.get("tool_uses", []):
                    name = tool.get("name", "unknown")
                    counts[name] = counts.get(name, 0) + 1
        return counts


class LogCollector:
    """
    Collects conversation log entries and emits batches for summarization.

    Usage:
        collector = LogCollector(batch_interval_seconds=60)
        collector.set_batch_callback(on_batch)
        collector.start()

        # Feed entries as they come in
        collector.add_entry(entry_dict)

        # When done
        collector.stop()
    """

    def __init__(
        self,
        batch_interval_seconds: int = 60,
        generation_id: Optional[str] = None
    ):
        """
        Initialize log collector.

        Args:
            batch_interval_seconds: How often to emit batches (default: 60s)
            generation_id: Optional ID for the current generation
        """
        self.batch_interval = batch_interval_seconds
        self.generation_id = generation_id

        self._entries: List[Dict[str, Any]] = []
        self._window_start: Optional[datetime] = None
        self._batch_callback: Optional[Callable[[LogBatch], None]] = None
        self._timer_task: Optional[asyncio.Task] = None
        self._running = False
        self._lock = asyncio.Lock()

    def set_batch_callback(self, callback: Callable[[LogBatch], None]) -> None:
        """Set callback to be invoked when a batch is ready."""
        self._batch_callback = callback

    def set_generation_id(self, generation_id: str) -> None:
        """Set the generation ID for batch metadata."""
        self.generation_id = generation_id

    async def start(self) -> None:
        """Start the collector and batch timer."""
        if self._running:
            return

        self._running = True
        self._window_start = datetime.utcnow()
        self._timer_task = asyncio.create_task(self._batch_timer())
        logger.info(f"LogCollector started (interval: {self.batch_interval}s)")

    async def stop(self) -> None:
        """Stop the collector and emit final batch."""
        if not self._running:
            return

        self._running = False

        # Cancel timer
        if self._timer_task:
            self._timer_task.cancel()
            try:
                await self._timer_task
            except asyncio.CancelledError:
                pass
            self._timer_task = None

        # Emit final batch
        await self._emit_batch()
        logger.info("LogCollector stopped")

    def add_entry(self, entry: Dict[str, Any]) -> None:
        """
        Add a conversation log entry to the buffer.

        This is called synchronously from the conversation callback,
        so we just append and let the timer handle batching.
        """
        self._entries.append(entry)

        # Set window start on first entry
        if self._window_start is None:
            self._window_start = datetime.utcnow()

    async def _batch_timer(self) -> None:
        """Background task that emits batches periodically."""
        while self._running:
            try:
                await asyncio.sleep(self.batch_interval)
                await self._emit_batch()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in batch timer: {e}")

    async def _emit_batch(self) -> None:
        """Emit current entries as a batch and reset buffer."""
        async with self._lock:
            if not self._entries:
                return

            # Create batch
            batch = LogBatch(
                entries=self._entries.copy(),
                window_start=self._window_start or datetime.utcnow(),
                window_end=datetime.utcnow(),
                generation_id=self.generation_id
            )

            # Reset buffer
            self._entries = []
            self._window_start = datetime.utcnow()

        # Invoke callback
        if self._batch_callback:
            try:
                logger.debug(f"Emitting batch: {len(batch.entries)} entries, agents: {batch.agent_names}")
                self._batch_callback(batch)
            except Exception as e:
                logger.error(f"Error in batch callback: {e}")
