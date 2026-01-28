"""Log Streaming Module for Happy Llama Integration.

Captures Python log messages and streams them to the Happy Llama UI
for real-time progress feedback during long-running operations.
"""

import asyncio
import logging
import re
from datetime import datetime
from typing import Optional, Callable, Dict, Any
from dataclasses import dataclass
from threading import Lock


@dataclass
class LogMessage:
    """Structured log message for streaming."""
    message: str
    level: str
    timestamp: datetime
    category: str
    agent: Optional[str] = None
    elapsed_time: Optional[int] = None


class LogCaptureHandler(logging.Handler):
    """Custom logging handler that captures and streams log messages."""
    
    def __init__(self, run_id: str, send_callback: Callable[[str, str, str], None]):
        """Initialize the log capture handler.
        
        Args:
            run_id: The run ID for message routing
            send_callback: Async callback function to send messages
        """
        super().__init__()
        self.run_id = run_id
        self.send_callback = send_callback
        self.start_time = datetime.now()
        self._lock = Lock()
        
        # Message patterns for filtering and categorization
        self.patterns = {
            'agent_start': re.compile(r'🤖\s+(\w+):\s*Starting'),
            'agent_complete': re.compile(r'✅\s+(\w+)\s+complete'),
            'heartbeat': re.compile(r'\[HEARTBEAT\]\s+(\w+)\s+active for (\d+)s'),
            'progress': re.compile(r'(\w+):\s*(I\'ll|Let me|Now|Starting|Running|Analyzing|Generating|Checking)'),
            'status': re.compile(r'✅|❌|🔍|📝|🔄|📊|💾|📁'),
            'cost': re.compile(r'Cost:\s*\$(\d+\.\d+)'),
            'critic': re.compile(r'(Running Critic|Critic approved|Critic iteration|Writer iteration)'),
            'tool_use': re.compile(r'(MCP tool|Using tool|Tool result)'),
        }
    
    def emit(self, record: logging.LogRecord):
        """Process and potentially stream a log record."""
        try:
            with self._lock:
                log_message = self._process_record(record)
                if log_message:
                    # Try to schedule async send, but handle cases where no event loop exists
                    try:
                        loop = asyncio.get_event_loop()
                        if loop.is_running():
                            asyncio.create_task(self._send_message(log_message))
                        else:
                            # No running loop, run in new thread
                            import threading
                            thread = threading.Thread(target=self._sync_send_message, args=(log_message,))
                            thread.daemon = True
                            thread.start()
                    except RuntimeError:
                        # No event loop, run synchronously
                        import threading
                        thread = threading.Thread(target=self._sync_send_message, args=(log_message,))
                        thread.daemon = True
                        thread.start()
        except Exception:
            # Don't let logging errors break the application
            pass
    
    def _sync_send_message(self, log_message: LogMessage):
        """Synchronous wrapper for sending messages when no event loop is available."""
        try:
            asyncio.run(self._send_message(log_message))
        except Exception:
            pass
    
    def _process_record(self, record: logging.LogRecord) -> Optional[LogMessage]:
        """Process a log record and determine if it should be streamed."""
        message = record.getMessage()
        level = record.levelname.upper()
        timestamp = datetime.now()
        
        # Skip debug messages and some internal messages
        if level == 'DEBUG' or '[AGENT-PYTHON]' in message:
            return None
        
        # Categorize the message
        category = self._categorize_message(message)
        if category == 'ignore':
            return None
        
        # Extract agent name if present
        agent = self._extract_agent_name(message)
        
        # Calculate elapsed time for heartbeat messages
        elapsed_time = None
        if category == 'heartbeat':
            match = self.patterns['heartbeat'].search(message)
            if match:
                elapsed_time = int(match.group(2))
        
        # Clean up the message for UI display
        clean_message = self._clean_message(message, category)
        
        return LogMessage(
            message=clean_message,
            level=level,
            timestamp=timestamp,
            category=category,
            agent=agent,
            elapsed_time=elapsed_time
        )
    
    def _categorize_message(self, message: str) -> str:
        """Categorize a log message for appropriate handling."""
        # Check patterns in order of specificity
        if self.patterns['heartbeat'].search(message):
            return 'heartbeat'
        elif self.patterns['agent_start'].search(message):
            return 'agent_start' 
        elif self.patterns['agent_complete'].search(message):
            return 'agent_complete'
        elif self.patterns['critic'].search(message):
            return 'critic'
        elif self.patterns['cost'].search(message):
            return 'cost'
        elif self.patterns['tool_use'].search(message):
            return 'tool_use'
        elif self.patterns['progress'].search(message):
            return 'progress'
        elif self.patterns['status'].search(message):
            return 'status'
        elif any(keyword in message.lower() for keyword in [
            'error', 'failed', 'exception', 'traceback'
        ]):
            return 'error'
        elif any(keyword in message for keyword in [
            'Stage', 'step', 'iteration', 'validation', 'starting', 'completed', 'workspace'
        ]):
            return 'stage_update'
        # Include more agent-related messages
        elif any(agent_name in message for agent_name in [
            'PRDGenerator', 'InteractionSpecGenerator', 'WireframeGenerator',
            'Pipeline', 'Agent', 'Build'
        ]):
            return 'progress'
        # Include messages with key emojis
        elif any(emoji in message for emoji in ['🚀', '📁', '🤖', '🔍', '📝', '🔄', '📊', '💾']):
            return 'status'
        else:
            # Be more inclusive - stream INFO level and above by default
            return 'info'
    
    def _extract_agent_name(self, message: str) -> Optional[str]:
        """Extract agent name from log message if present."""
        # Try different patterns for agent names
        patterns = [
            r'🤖\s+(\w+):',
            r'(\w+):\s+I\'ll',
            r'(\w+):\s+Let me',
            r'\[HEARTBEAT\]\s+(\w+)',
            r'✅\s+(\w+)\s+complete',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, message)
            if match:
                return match.group(1)
        
        return None
    
    def _clean_message(self, message: str, category: str) -> str:
        """Clean up message for UI display."""
        # Remove timestamps and logger prefixes
        message = re.sub(r'^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3}\s+-\s+\w+\s+-\s+', '', message)
        
        # Simplify heartbeat messages
        if category == 'heartbeat':
            match = self.patterns['heartbeat'].search(message)
            if match:
                agent = match.group(1)
                seconds = match.group(2)
                minutes = int(seconds) // 60
                if minutes > 0:
                    return f"🕐 {agent} working for {minutes}m {int(seconds) % 60}s..."
                else:
                    return f"🕐 {agent} working for {seconds}s..."
        
        # Clean up progress messages
        if category == 'progress':
            # Remove redundant agent prefixes if we already have agent info
            message = re.sub(r'^\w+:\s*', '', message)
        
        return message.strip()
    
    async def _send_message(self, log_message: LogMessage):
        """Send the log message via the callback."""
        try:
            # Determine the message type for the UI
            ui_message_type = self._get_ui_message_type(log_message.category)
            
            # Format the message for the UI
            formatted_message = self._format_for_ui(log_message)
            
            # Send the message
            await self.send_callback(self.run_id, ui_message_type, formatted_message)
        except Exception:
            # Don't let streaming errors break the build
            pass
    
    def _get_ui_message_type(self, category: str) -> str:
        """Map internal categories to UI message types."""
        mapping = {
            'agent_start': 'status',
            'agent_complete': 'status', 
            'heartbeat': 'progress',
            'progress': 'progress',
            'status': 'status',
            'critic': 'status',
            'cost': 'info',
            'tool_use': 'info',
            'error': 'error',
            'stage_update': 'status',
            'info': 'info'  # Added missing mapping
        }
        return mapping.get(category, 'info')
    
    def _format_for_ui(self, log_message: LogMessage) -> str:
        """Format log message for UI display."""
        # Add agent prefix if available
        prefix = ""
        if log_message.agent:
            prefix = f"[{log_message.agent}] "
        
        # Add timing info for long operations
        elapsed = (log_message.timestamp - self.start_time).total_seconds()
        if elapsed > 300 and log_message.category in ['progress', 'heartbeat']:  # 5+ minutes
            time_prefix = f"({int(elapsed//60)}m) "
            prefix = time_prefix + prefix
        
        return prefix + log_message.message


class LogStreamer:
    """Manager for log streaming during builds."""
    
    def __init__(self):
        self.active_handlers: Dict[str, LogCaptureHandler] = {}
        
    def start_streaming(self, run_id: str, send_callback: Callable[[str, str, str], None]) -> LogCaptureHandler:
        """Start log streaming for a build run."""
        # Remove any existing handler for this run_id
        self.stop_streaming(run_id)
        
        # Create and attach new handler
        handler = LogCaptureHandler(run_id, send_callback)
        handler.setLevel(logging.INFO)
        
        # Attach to root logger to catch all messages
        root_logger = logging.getLogger()
        
        # Temporarily lower root logger level to capture INFO messages
        original_level = root_logger.level
        if root_logger.level > logging.INFO:
            root_logger.setLevel(logging.INFO)
        
        root_logger.addHandler(handler)
        
        self.active_handlers[run_id] = handler
        return handler
    
    def stop_streaming(self, run_id: str):
        """Stop log streaming for a build run."""
        if run_id in self.active_handlers:
            handler = self.active_handlers[run_id]
            
            # Remove from root logger
            root_logger = logging.getLogger()
            root_logger.removeHandler(handler)
            
            # Clean up
            del self.active_handlers[run_id]
    
    def cleanup_all(self):
        """Clean up all active handlers."""
        for run_id in list(self.active_handlers.keys()):
            self.stop_streaming(run_id)


# Global instance
log_streamer = LogStreamer()