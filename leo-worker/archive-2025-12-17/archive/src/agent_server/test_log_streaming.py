#!/usr/bin/env python3
"""Test script for log streaming functionality."""

import asyncio
import logging
import time
from log_streamer import LogStreamer

# Test message buffer
test_messages = []

async def mock_send_callback(run_id: str, message_type: str, content: str):
    """Mock callback that captures messages instead of sending them."""
    message = {
        'run_id': run_id,
        'type': message_type,
        'content': content,
        'timestamp': time.time()
    }
    test_messages.append(message)
    print(f"[CAPTURED] {message_type}: {content}")

async def test_log_streaming():
    """Test the log streaming functionality."""
    print("🧪 Testing log streaming functionality...\n")
    
    # Clear previous messages
    test_messages.clear()
    
    # Create streamer and start streaming
    streamer = LogStreamer()
    handler = streamer.start_streaming("test-run-123", mock_send_callback)
    
    # Set up logger with explicit level
    logger = logging.getLogger("test_agent")
    logger.setLevel(logging.INFO)
    
    # Add a console handler to see what's being logged
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter('[CONSOLE] %(message)s'))
    logger.addHandler(console_handler)
    
    try:
        print("📝 Sending test log messages...\n")
        
        # Test different message types with delays
        messages_to_test = [
            "🤖 InteractionSpecGenerator: Starting...",
            "InteractionSpecGenerator: I'll first analyze the PRD requirements...",
            "InteractionSpecGenerator: Let me search for existing patterns...",
            "[HEARTBEAT] InteractionSpecGenerator active for 180s - still working...",
            "🔍 Running Critic agent...",
            "✅ InteractionSpecGenerator complete. Cost: $0.5807",
            "✅ Critic approved after 1 iterations",
            "🤖 WireframeGenerator: Starting...",
            "WireframeGenerator: Now generating component specifications...",
            "[HEARTBEAT] WireframeGenerator active for 300s - still working...",
        ]
        
        for message in messages_to_test:
            if message.startswith("[HEARTBEAT]"):
                logger.info(message)
            elif "❌" in message:
                logger.error(message)
            else:
                logger.info(message)
            await asyncio.sleep(0.2)  # Longer delay for processing
        
        # Test error message
        logger.error("❌ Failed to validate component structure")
        
        # Test debug message (should be filtered out)
        logger.debug("DEBUG: Internal state information")
        
        # Give time for all async processing to complete
        await asyncio.sleep(1.0)
        
        print(f"\n📊 Results: Captured {len(test_messages)} messages")
        print("=" * 60)
        
        # Analyze captured messages
        message_types = {}
        for msg in test_messages:
            msg_type = msg['type']
            message_types[msg_type] = message_types.get(msg_type, 0) + 1
            
        print(f"Message type breakdown:")
        for msg_type, count in message_types.items():
            print(f"  - {msg_type}: {count} messages")
        
        print("\n📋 Sample captured messages:")
        for i, msg in enumerate(test_messages[:5]):  # Show first 5
            print(f"  {i+1}. [{msg['type']}] {msg['content']}")
        
        if len(test_messages) > 5:
            print(f"  ... and {len(test_messages) - 5} more")
        
        # Test filtering effectiveness
        debug_messages = [msg for msg in test_messages if 'DEBUG' in msg['content']]
        print(f"\n🔍 Debug messages filtered out: {len(debug_messages) == 0}")
        
        heartbeat_messages = [msg for msg in test_messages if 'working for' in msg['content']]
        print(f"🕐 Heartbeat messages formatted: {len(heartbeat_messages) > 0}")
        
        agent_messages = [msg for msg in test_messages if any(agent in msg['content'] for agent in ['InteractionSpecGenerator', 'WireframeGenerator'])]
        print(f"🤖 Agent messages captured: {len(agent_messages) > 0}")
        
    finally:
        # Clean up
        streamer.stop_streaming("test-run-123")
        print("\n🧹 Cleaned up streaming handler")
        
    print("\n✅ Log streaming test completed!")
    return len(test_messages) > 0

if __name__ == "__main__":
    success = asyncio.run(test_log_streaming())
    exit(0 if success else 1)