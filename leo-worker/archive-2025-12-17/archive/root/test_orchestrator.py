#!/usr/bin/env python3
"""Test script for the new context-aware orchestrator agent."""

import asyncio
import logging
from pathlib import Path
from cc_agent.logging import setup_logging
from app_factory.agents.stage_0_orchestrator import orchestrator_agent

# Set up logging
log_dir = Path(__file__).parent / "logs"
setup_logging("test_orchestrator", log_dir=log_dir)
logger = logging.getLogger(__name__)


async def test_orchestrator():
    """Test the orchestrator with various prompts."""
    
    test_prompts = [
        "I want to build a project management tool like Trello",
        "Create a simple e-commerce platform for selling handmade crafts",
        "I need a CRM system for my small business",
    ]
    
    for i, prompt in enumerate(test_prompts, 1):
        logger.info(f"\n{'='*60}")
        logger.info(f"Test {i}: {prompt}")
        logger.info("="*60)
        
        try:
            # Generate PRD
            result = await orchestrator_agent.generate_prd(prompt)
            
            if result["success"]:
                logger.info(f"✅ PRD generated successfully!")
                logger.info(f"   - App name: {result['app_name']}")
                logger.info(f"   - Conversation turns: {result['conversation_turns']}")
                logger.info(f"   - Cost: ${result['cost']:.4f}")
                logger.info(f"\nPRD Preview (first 500 chars):")
                logger.info("-" * 40)
                preview = result["prd_content"][:500] + "..." if len(result["prd_content"]) > 500 else result["prd_content"]
                logger.info(preview)
            else:
                logger.error(f"❌ Failed to generate PRD: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            logger.error(f"❌ Exception during test: {e}")
            import traceback
            traceback.print_exc()
        
        # Small delay between tests
        await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(test_orchestrator())