#!/usr/bin/env python3
"""Test the orchestrator with context awareness enabled."""

import asyncio
import os
import logging
from pathlib import Path
from cc_agent.logging import setup_logging
from app_factory.agents.stage_0_orchestrator import orchestrator_agent

# Set up logging
log_dir = Path(__file__).parent / "logs"
setup_logging("test_context_aware", log_dir=log_dir)
logger = logging.getLogger(__name__)


async def test_with_context():
    """Test orchestrator with context awareness."""
    
    # The .mcp.json file will be automatically picked up by Claude Code
    # when running from this directory
    
    user_prompt = "I want to build a task management app with AI-powered task prioritization and natural language input"
    
    logger.info(f"\n{'='*60}")
    logger.info("Testing Context-Aware Orchestrator")
    logger.info(f"Prompt: {user_prompt}")
    logger.info("="*60)
    
    # Check if MCP servers are configured
    logger.info("\nChecking MCP configuration:")
    mcp_config_file = Path(".mcp.json")
    if mcp_config_file.exists():
        logger.info(f"✅ Found .mcp.json configuration")
        with open(mcp_config_file) as f:
            import json
            config = json.load(f)
            servers = list(config.get("mcpServers", {}).keys())
            logger.info(f"   Configured servers: {', '.join(servers)}")
    else:
        logger.warning("❌ No .mcp.json found")
    
    try:
        # Generate PRD with context awareness
        logger.info("\nGenerating PRD with context awareness...")
        result = await orchestrator_agent.generate_prd(
            user_prompt, 
            skip_questions=True
        )
        
        if result["success"]:
            logger.info(f"\n✅ PRD Generated Successfully!")
            logger.info(f"   App name: {result['app_name']}")
            logger.info(f"   Cost: ${result['cost']:.4f}")
            logger.info(f"   Turns: {result['conversation_turns']}")
            
            # Save PRD
            output_dir = Path("context_aware_test")
            output_dir.mkdir(exist_ok=True)
            prd_path = output_dir / f"{result['app_name']}_prd.md"
            prd_path.write_text(result["prd_content"])
            logger.info(f"   Saved to: {prd_path}")
            
            # Show preview
            logger.info(f"\nPRD Preview:")
            logger.info("-" * 60)
            preview = result["prd_content"][:800] + "..."
            print(preview)
            
            # Check for context tool usage
            logger.info("\n" + "="*60)
            logger.info("Context Tool Usage Analysis:")
            logger.info("="*60)
            logger.info("Check the following to verify context awareness:")
            logger.info("1. Session file in .agent_context/")
            logger.info("2. Memory storage in ~/.mem0/")
            logger.info("3. Graph nodes in Neo4j (if running)")
            logger.info("4. Tool usage in logs/")
            
        else:
            logger.error(f"❌ Failed: {result.get('error', 'Unknown error')}")
            
    except Exception as e:
        logger.error(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n🚀 Context-Aware Orchestrator Test")
    print("==================================")
    print("\nThis test will use MCP servers configured in .mcp.json")
    print("Make sure you're running this with Claude Code CLI\n")
    
    asyncio.run(test_with_context())