"""
Cost Tracker - Singleton for aggregating generation costs.

Tracks total cost across all agent calls in a single generation.
Reset at generation start, read total at generation end.

Design rationale: See DECISIONS.md (2025-12-24: CostTracker Design Pattern)
- Singleton chosen because: 1 container = 1 generation (architectural constraint)
- Upgrade path to contextvars if concurrent generations ever needed
"""

import asyncio
from dataclasses import dataclass, field
from typing import Optional
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class CostTracker:
    """
    Singleton tracker for aggregating costs across all agent calls.

    Usage:
        # At generation start (WSI client)
        CostTracker.reset()

        # After each agent run (base.py)
        CostTracker.get_instance().add_cost(result.cost)

        # At generation end (WSI client)
        total = CostTracker.get_instance().get_total()
    """

    _instance: Optional['CostTracker'] = None

    total_cost: float = 0.0
    call_count: int = 0
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    @classmethod
    def get_instance(cls) -> 'CostTracker':
        """Get the singleton instance, creating if needed."""
        if cls._instance is None:
            cls._instance = cls()
            logger.debug("cost_tracker.created")
        return cls._instance

    @classmethod
    def reset(cls) -> 'CostTracker':
        """Reset tracker for a new generation. Returns the new instance."""
        cls._instance = cls()
        logger.info("cost_tracker.reset")
        return cls._instance

    async def add_cost(self, cost: float, agent_name: Optional[str] = None) -> None:
        """
        Add cost from an agent run (async-safe).

        Args:
            cost: Cost in USD from AgentResult.cost
            agent_name: Optional agent name for logging
        """
        async with self._lock:
            self.total_cost += cost
            self.call_count += 1
            logger.debug(
                "cost_tracker.add",
                agent=agent_name,
                cost=f"${cost:.4f}",
                total=f"${self.total_cost:.4f}",
                calls=self.call_count
            )

    def add_cost_sync(self, cost: float, agent_name: Optional[str] = None) -> None:
        """
        Add cost synchronously (for non-async contexts).
        Note: Not lock-protected. Use add_cost() in async code.
        """
        self.total_cost += cost
        self.call_count += 1
        logger.debug(
            "cost_tracker.add_sync",
            agent=agent_name,
            cost=f"${cost:.4f}",
            total=f"${self.total_cost:.4f}",
            calls=self.call_count
        )

    def get_total(self) -> float:
        """Get the total accumulated cost in USD."""
        return self.total_cost

    def get_summary(self) -> dict:
        """Get a summary dict for logging/WSI."""
        return {
            "total_cost_usd": self.total_cost,
            "agent_calls": self.call_count,
        }

    def __repr__(self) -> str:
        return f"CostTracker(total=${self.total_cost:.4f}, calls={self.call_count})"
