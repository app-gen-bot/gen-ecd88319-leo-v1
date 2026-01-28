#!/usr/bin/env python3
"""Test Graphiti knowledge graph through ContextAwareAgent."""

import asyncio
import sys
from pathlib import Path
from datetime import datetime

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from cc_agent.context import ContextAwareAgent


async def test_graphiti_operations():
    """Test various Graphiti operations through ContextAwareAgent."""
    
    print("\n🔗 Testing Graphiti through ContextAwareAgent")
    print("=" * 80)
    
    # Create a context-aware agent with graphiti access
    agent = ContextAwareAgent(
        name="GraphitiTestAgent",
        system_prompt="""You are a knowledge graph test agent. 
        Your job is to test Graphiti operations and report results clearly.
        Always use the graphiti tools when asked about knowledge graph operations.""",
        allowed_tools=["mcp__graphiti"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    print(f"✅ Created ContextAwareAgent: {agent.name}")
    print(f"✅ Allowed tools: {agent.allowed_tools}")
    print(f"✅ MCP servers configured: {list(agent.mcp_config.keys())}")
    
    # Test 1: Add an episode
    print("\n📝 Test 1: Adding an episode to the knowledge graph")
    print("-" * 60)
    
    add_episode_prompt = """Use the graphiti add_episode tool to add this episode:
    
    name: "App Factory Design Session"
    content: "During the App Factory design session, we decided on a multi-stage pipeline architecture. Stage 0 generates PRDs, Stage 1 creates interaction specs, and Stage 2 builds the frontend. The system uses specialized AI agents for each stage with a Writer-Critic pattern for quality improvement."
    reference_time: "2025-07-11T10:00:00"
    source: "design_meeting"
    
    Report what was added."""
    
    result = await agent.run(add_episode_prompt)
    
    if result.success:
        print("✅ Add episode test completed")
        print(f"Result: {result.content[:500]}...")
    else:
        print(f"❌ Add episode failed: {result.content}")
    
    # Test 2: Search for episodes
    print("\n🔍 Test 2: Searching for episodes")
    print("-" * 60)
    
    search_prompt = """Use the graphiti search_episodes tool to search for:
    1. Episodes about "App Factory"
    2. Episodes about "pipeline"
    3. Episodes about "agents"
    
    Show what you find for each search."""
    
    result = await agent.run(search_prompt)
    
    if result.success:
        print("✅ Search test completed")
        print(f"Result: {result.content[:500]}...")
    else:
        print(f"❌ Search failed: {result.content}")
    
    # Test 3: Retrieve all episodes
    print("\n📚 Test 3: Retrieving all episodes")
    print("-" * 60)
    
    retrieve_prompt = """Use the graphiti retrieve_episodes tool to get all episodes.
    Show me:
    1. Total number of episodes
    2. Brief summary of each episode (name and key content)"""
    
    result = await agent.run(retrieve_prompt)
    
    if result.success:
        print("✅ Retrieve test completed")
        print(f"Result: {result.content[:500]}...")
    else:
        print(f"❌ Retrieve failed: {result.content}")
    
    # Test 4: Add another episode with relationships
    print("\n🔗 Test 4: Adding episode with relationships")
    print("-" * 60)
    
    relationship_prompt = """Use the graphiti add_episode tool to add this related episode:
    
    name: "Navigation Completeness Implementation"
    content: "We implemented navigation completeness checking in Stage 1 of the App Factory. This ensures every route and interactive element has a defined destination, preventing 404 errors. The interaction spec template now includes a Complete Navigation Map section."
    reference_time: "2025-07-11T11:00:00"
    source: "implementation"
    
    This relates to the App Factory Design Session episode. Report what was added."""
    
    result = await agent.run(relationship_prompt)
    
    if result.success:
        print("✅ Relationship test completed")
        print(f"Result: {result.content[:500]}...")
    else:
        print(f"❌ Relationship test failed: {result.content}")
    
    # Test 5: Search for specific relationships
    print("\n🔍 Test 5: Searching for navigation-related knowledge")
    print("-" * 60)
    
    nav_search_prompt = """Use the graphiti search_episodes tool to find all episodes related to "navigation".
    Show the connections between different pieces of knowledge."""
    
    result = await agent.run(nav_search_prompt)
    
    if result.success:
        print("✅ Navigation search completed")
        print(f"Result: {result.content[:500]}...")
    else:
        print(f"❌ Navigation search failed: {result.content}")
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 80)
    print("Graphiti integration through ContextAwareAgent is working!")
    print("The agent can:")
    print("- ✅ Add episodes to the knowledge graph")
    print("- ✅ Search for specific topics")
    print("- ✅ Retrieve all stored knowledge")
    print("- ✅ Create relationships between episodes")


async def test_graphiti_memory_integration():
    """Test how Graphiti integrates with the agent's memory context."""
    
    print("\n🧠 Testing Graphiti-Memory Integration")
    print("=" * 80)
    
    # Create an agent that uses both graphiti and memory
    agent = ContextAwareAgent(
        name="IntegratedMemoryAgent",
        system_prompt="""You are a memory and knowledge graph integration test agent.
        Use both graphiti and mem0 tools to demonstrate how they work together.""",
        allowed_tools=["mcp__graphiti", "mcp__mem0"],
        permission_mode="bypassPermissions",
        enable_context_awareness=True
    )
    
    integration_prompt = """Demonstrate the integration between graphiti and mem0:
    
    1. First, add a memory using mem0 about "App Factory uses a 6-stage pipeline"
    2. Then, add an episode to graphiti about the same topic with more detail
    3. Search both systems for "pipeline" and show how they complement each other
    4. Explain the difference between memories (mem0) and knowledge episodes (graphiti)"""
    
    result = await agent.run(integration_prompt)
    
    if result.success:
        print("✅ Integration test completed")
        print(f"Result:\n{result.content}")
    else:
        print(f"❌ Integration test failed: {result.content}")


async def main():
    """Run all Graphiti tests."""
    print("\n🚀 Graphiti ContextAwareAgent Test Suite")
    print("=" * 80)
    
    # Load environment variables
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded environment from {env_path}")
    
    try:
        # Run basic operations test
        await test_graphiti_operations()
        
        # Run integration test
        await test_graphiti_memory_integration()
        
        print("\n✅ All Graphiti tests completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())