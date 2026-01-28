#!/usr/bin/env python3
"""Integration test for FastAPI server with log streaming."""

import asyncio
import logging
import sys
from log_streamer import log_streamer

# Mock messages collected during test
collected_messages = []

async def mock_send_message(run_id: str, message_type: str, content: str):
    """Mock the send_message function from the FastAPI server."""
    collected_messages.append({
        'run_id': run_id,
        'type': message_type, 
        'content': content
    })
    print(f"[UI] {message_type.upper()}: {content}")

async def simulate_agent_build_process(run_id: str):
    """Simulate the kind of logging that happens during a real build."""
    # Clear previous messages
    collected_messages.clear()
    
    # Start log streaming
    handler = log_streamer.start_streaming(run_id, mock_send_message)
    
    try:
        # Simulate the FastAPI server logging
        logger = logging.getLogger("agent_server")
        logger.info(f"🚀 Starting build process for run {run_id}")
        logger.info(f"📁 Workspace path: /home/ec2-user/workspaces/test-workspace")
        logger.info("🤖 Starting AI App Factory pipeline...")
        
        await asyncio.sleep(0.1)
        
        # Simulate Stage 0 - PRD
        prd_logger = logging.getLogger("app_factory.stages.stage_0_prd")
        prd_logger.info("🤖 PRDGenerator: Starting...")
        prd_logger.info("PRDGenerator: I'll analyze the user prompt and create requirements...")
        await asyncio.sleep(0.1)
        prd_logger.info("✅ PRDGenerator complete. Cost: $0.23")
        
        await asyncio.sleep(0.1)
        
        # Simulate Stage 1 - Interaction Spec  
        stage1_logger = logging.getLogger("app_factory.stages.stage_1_interaction_spec")
        stage1_logger.info("🤖 InteractionSpecGenerator: Starting...")
        stage1_logger.info("InteractionSpecGenerator: I'll first check for existing knowledge...")
        await asyncio.sleep(0.1)
        
        # Simulate long running with heartbeats
        agent_logger = logging.getLogger("cc_agent.context.context_aware") 
        agent_logger.info("[HEARTBEAT] InteractionSpecGenerator active for 120s - still working...")
        await asyncio.sleep(0.1)
        
        stage1_logger.info("InteractionSpecGenerator: Now generating detailed specifications...")
        await asyncio.sleep(0.1)
        
        agent_logger.info("[HEARTBEAT] InteractionSpecGenerator active for 300s - still working...")
        await asyncio.sleep(0.1)
        
        stage1_logger.info("🔍 Running Critic agent...")
        stage1_logger.info("✅ Critic approved after 1 iterations")
        stage1_logger.info("✅ InteractionSpecGenerator complete. Cost: $0.5807")
        
        await asyncio.sleep(0.1)
        
        # Simulate Stage 2 - Wireframe (the long one)
        stage2_logger = logging.getLogger("app_factory.stages.stage_2_wireframe")
        stage2_logger.info("🤖 WireframeGenerator: Starting...")
        stage2_logger.info("WireframeGenerator: Creating component specifications...")
        await asyncio.sleep(0.1)
        
        # Multiple heartbeats for long stage
        agent_logger.info("[HEARTBEAT] WireframeGenerator active for 180s - still working...")
        await asyncio.sleep(0.1)
        agent_logger.info("[HEARTBEAT] WireframeGenerator active for 420s - still working...")
        await asyncio.sleep(0.1)
        agent_logger.info("[HEARTBEAT] WireframeGenerator active for 600s - still working...")
        await asyncio.sleep(0.1)
        
        stage2_logger.info("WireframeGenerator: Running final validation...")
        stage2_logger.info("✅ WireframeGenerator complete. Cost: $1.2450")
        
        # Final completion
        logger.info("✅ Build completed successfully for run test-integration")
        
        # Give time for all async processing
        await asyncio.sleep(0.5)
        
    finally:
        # Clean up
        log_streamer.stop_streaming(run_id)
    
    return collected_messages

async def test_integration():
    """Test the full integration with simulated agent build process."""
    print("🔧 Testing FastAPI + Log Streaming Integration\n")
    
    messages = await simulate_agent_build_process("test-integration")
    
    print(f"\n📈 Integration Results:")
    print(f"   Total messages streamed: {len(messages)}")
    
    # Analyze message types
    message_types = {}
    agent_messages = 0
    heartbeat_messages = 0
    
    for msg in messages:
        msg_type = msg['type']
        message_types[msg_type] = message_types.get(msg_type, 0) + 1
        
        if any(agent in msg['content'] for agent in ['PRDGenerator', 'InteractionSpecGenerator', 'WireframeGenerator']):
            agent_messages += 1
            
        if 'working for' in msg['content']:
            heartbeat_messages += 1
    
    print(f"   Message types: {dict(message_types)}")
    print(f"   Agent-specific messages: {agent_messages}")
    print(f"   Heartbeat messages: {heartbeat_messages}")
    
    # Verify we got the expected progression
    expected_agents = ['PRDGenerator', 'InteractionSpecGenerator', 'WireframeGenerator']
    agents_seen = set()
    
    for msg in messages:
        for agent in expected_agents:
            if agent in msg['content']:
                agents_seen.add(agent)
    
    print(f"   Agents captured: {sorted(list(agents_seen))}")
    
    # Check for proper progression
    progression_correct = all(agent in agents_seen for agent in expected_agents)
    heartbeat_working = heartbeat_messages >= 3  # Should have multiple heartbeats
    
    print(f"\n✅ Integration Test Results:")
    print(f"   ✅ All stages captured: {progression_correct}")
    print(f"   ✅ Heartbeat messages working: {heartbeat_working}")
    print(f"   ✅ Message streaming functional: {len(messages) > 10}")
    
    success = progression_correct and heartbeat_working and len(messages) > 10
    
    if success:
        print(f"\n🎉 Integration test PASSED! Ready for production use.")
    else:
        print(f"\n❌ Integration test FAILED. Check log streaming configuration.")
    
    return success

if __name__ == "__main__":
    try:
        success = asyncio.run(test_integration())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)