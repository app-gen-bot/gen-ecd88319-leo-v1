"""Utility functions for the AI App Factory."""

import time


class Timer:
    """Simple timer for tracking operation durations."""
    
    def __init__(self, name: str = ""):
        """Initialize timer with optional name.
        
        Args:
            name: Optional name for the operation being timed
        """
        self.name = name
        self.start_time = time.time()
    
    def elapsed(self) -> float:
        """Get elapsed time in seconds.
        
        Returns:
            Elapsed time in seconds
        """
        return time.time() - self.start_time
    
    def elapsed_str(self) -> str:
        """Get elapsed time as a formatted string.
        
        Returns:
            Formatted string like "5.2 seconds" or "1:45"
        """
        elapsed = self.elapsed()
        if elapsed < 60:
            return f"{elapsed:.1f} seconds"
        minutes = int(elapsed // 60)
        seconds = int(elapsed % 60)
        return f"{minutes}:{seconds:02d}"