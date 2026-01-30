"""
Leo Process Monitor - Real-time trajectory analysis of agent activity.

Buffers conversation log entries and periodically generates
Haiku-powered analysis that is streamed via WSI.

Also provides user-friendly summaries for non-developer users.
"""

from .collector import LogCollector
from .summarizer import HaikuAnalyzer, TrajectoryAnalysis, FriendlySummarizer, FriendlyUpdate
from .streamer import ProcessMonitorStreamer, get_process_monitor_streamer, set_process_monitor_streamer

__all__ = [
    "LogCollector",
    "HaikuAnalyzer",
    "TrajectoryAnalysis",
    "FriendlySummarizer",
    "FriendlyUpdate",
    "ProcessMonitorStreamer",
    "get_process_monitor_streamer",
    "set_process_monitor_streamer",
]
