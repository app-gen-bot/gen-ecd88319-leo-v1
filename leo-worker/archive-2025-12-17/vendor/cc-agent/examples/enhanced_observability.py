#!/usr/bin/env python3
"""Example demonstrating the enhanced observability features of cc_agent.

This example shows:
1. Turn-by-turn logging (first turn at INFO, subsequent at DEBUG)
2. Max turns detection and termination reason
3. Enhanced error context
4. Backward compatibility
"""

import asyncio
import logging
from pathlib import Path
from cc_agent import Agent
from cc_agent.logging import setup_logging

async def example_with_turn_logging():
    """Demonstrate turn-by-turn logging with different levels."""
    print("\n" + "=" * 60)
    print("Example 1: Turn-by-Turn Logging")
    print("=" * 60)
    
    # Set up logging to show the difference between console and file
    logger = setup_logging(
        "turn_example",
        console_level="INFO",  # Console only sees INFO and above
        file_level="DEBUG"      # File sees everything including DEBUG
    )
    
    agent = Agent(
        name="TurnLogger",
        system_prompt="You are a helpful assistant. Use multiple turns to think through problems.",
        max_turns=5,
        verbose=True,
        logger=logger
    )
    
    # Run a task that will use multiple turns
    result = await agent.run("""
        Think step by step:
        1. What is 2 + 2?
        2. What is that result multiplied by 3?
        3. What is that result divided by 4?
    """)
    
    print(f"\n📊 Result Summary:")
    print(f"  - Success: {result.success}")
    print(f"  - Termination: {result.termination_reason}")
    print(f"  - Turns used: {result.turns_used}/{result.max_turns}")
    print(f"  - Cost: ${result.cost:.4f}")
    
    # Show that the log file has more detail
    log_file = Path("logs") / f"turn_example_{Path('logs').glob('turn_example_*.log').__next__().name.split('_')[-1]}"
    if log_file.exists():
        print(f"\n📁 Check {log_file} for detailed DEBUG logs of all turns")
    
    return result

async def example_max_turns_detection():
    """Demonstrate max turns detection and termination reason."""
    print("\n" + "=" * 60)
    print("Example 2: Max Turns Detection")
    print("=" * 60)
    
    agent = Agent(
        name="MaxTurnsTest",
        system_prompt="You are an assistant that thinks very carefully.",
        max_turns=2,  # Intentionally low to trigger max_turns
        verbose=True
    )
    
    # Run a complex task that might hit the turn limit
    result = await agent.run("""
        Write a detailed analysis of climate change, including:
        1. Current scientific consensus
        2. Major contributing factors
        3. Potential solutions
        4. Economic implications
        5. Political challenges
    """)
    
    # Check termination reason
    if result.termination_reason == "max_turns_reached":
        print(f"\n⚠️  Agent hit max turns limit!")
        print(f"  - Turns used: {result.turns_used}/{result.max_turns}")
        print(f"  - Success: {result.success} (marked as False when max turns reached)")
        print(f"  - Partial content length: {len(result.content)} chars")
    elif result.termination_reason == "completed":
        print(f"\n✅ Agent completed successfully")
        print(f"  - Turns used: {result.turns_used}/{result.max_turns}")
    
    return result

async def example_error_handling():
    """Demonstrate enhanced error context."""
    print("\n" + "=" * 60)
    print("Example 3: Enhanced Error Handling")
    print("=" * 60)
    
    agent = Agent(
        name="ErrorTest",
        system_prompt="You are a test agent.",
        max_turns=3,
        verbose=True,
        # Intentionally use a non-existent working directory to trigger an error
        # (This would normally be created automatically, so we'll simulate a different error)
        allowed_tools=["InvalidToolName"]  # This might cause issues
    )
    
    try:
        # Try to run with a prompt that might cause an error
        result = await agent.run("Try to use the InvalidToolName tool")
        
        # Even if no error, we can check error_details
        if result.error_details:
            print(f"\n❌ Error occurred:")
            print(f"  - Error type: {result.error_details.get('error_type')}")
            print(f"  - Message: {result.error_details.get('error_message')}")
            print(f"  - Failed at turn: {result.error_details.get('turn_when_failed')}")
            print(f"  - Tools attempted: {result.error_details.get('tools_attempted')}")
    except Exception as e:
        print(f"\n❌ Exception caught: {e}")
        print("  (In production, check result.error_details for structured info)")

async def example_backward_compatibility():
    """Demonstrate that old code patterns still work."""
    print("\n" + "=" * 60)
    print("Example 4: Backward Compatibility")
    print("=" * 60)
    
    # Old-style agent creation still works
    agent = Agent(
        name="OldStyleAgent",
        system_prompt="You are a helpful assistant.",
        max_turns=3
    )
    
    # Old-style usage - only checking old fields
    result = await agent.run("What is the capital of France?")
    
    # Old code that only uses original fields still works
    if result.success:
        print(f"✅ Old-style success check works")
        print(f"  - Content: {result.content[:100]}...")
        print(f"  - Cost: ${result.cost:.4f}")
        print(f"  - Metadata: {result.metadata}")
    
    # But new fields are available if needed
    print(f"\n📊 New fields available (but optional):")
    print(f"  - termination_reason: {result.termination_reason}")
    print(f"  - turns_used: {result.turns_used}")
    print(f"  - max_turns: {result.max_turns}")
    print(f"  - error_details: {result.error_details}")
    
    return result

async def main():
    """Run all examples."""
    print("🚀 Enhanced Observability Examples")
    print("=" * 60)
    
    # Example 1: Turn logging
    await example_with_turn_logging()
    
    # Example 2: Max turns detection
    await example_max_turns_detection()
    
    # Example 3: Error handling (might not actually error in this demo)
    await example_error_handling()
    
    # Example 4: Backward compatibility
    await example_backward_compatibility()
    
    print("\n" + "=" * 60)
    print("✅ All examples completed!")
    print("=" * 60)

if __name__ == "__main__":
    # Note: This requires claude-code-sdk to be installed
    # pip install claude-code-sdk
    try:
        asyncio.run(main())
    except ModuleNotFoundError as e:
        print(f"⚠️  Please install dependencies: {e}")
        print("   Run: pip install claude-code-sdk")