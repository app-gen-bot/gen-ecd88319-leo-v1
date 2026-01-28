#!/usr/bin/env python3
"""Simple browser test using cc_agent and MCP browser tools."""

import asyncio
import logging

from cc_agent import Agent, AgentResult

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SimpleBrowserAgent(Agent):
    """Simple agent for browser testing."""

    def __init__(self):
        # Define system prompt inline
        system_prompt = """You are a browser testing agent. Your task is to:
1. Use the browser MCP tools to navigate to websites
2. Take screenshots of what you see
3. Report your findings clearly

Available browser tools:
- browser (MCP browser tool for opening, navigating, interacting with browser)

Be descriptive about what you observe on the page."""

        # Define config inline
        config = {
            "name": "Simple Browser Test Agent",
            "allowed_tools": ["browser"],  # MCP browser tool
            "max_turns": 10,
            "permission_mode": "bypassPermissions"
        }

        # Initialize the base agent with tool restrictions
        super().__init__(
            name=config["name"],
            system_prompt=system_prompt,
            allowed_tools=config["allowed_tools"],
            max_turns=config["max_turns"],
            permission_mode=config["permission_mode"],
            logger=logger,
            restrict_to_allowed_tools=True  # This ensures ONLY browser tools are allowed
        )


async def run_browser_test():
    """Run a simple browser test."""
    logger.info("Starting simple browser test...")

    # Create the agent
    agent = SimpleBrowserAgent()

    # Define the user prompt
    user_prompt = """First, please provide a detailed report on tool access:
1. List ALL tools you can SEE/DISCOVER in the system (even if you can't use them)
2. List which tools you actually have PERMISSION to use
3. Explain the difference between what you can see vs what you can use

To test your actual permissions, try using a non-browser tool:
1. Try using the Bash tool to run "echo 'Testing permissions'"
2. Report whether it worked or failed

Then, please do the following browser tasks:
1. Open a browser (not headless so we can see it)
2. Navigate to https://example.com
3. Take a screenshot
4. Tell me what you see on the page (describe the content)
5. Close the browser when done

Report back with your findings."""

    logger.info(f"User prompt: {user_prompt}")

    # Run the agent
    try:
        result = await agent.run(user_prompt)

        # Report results
        logger.info("\n" + "=" * 60)
        logger.info("Test Results")
        logger.info("=" * 60)

        if result.success:
            logger.info("✅ Test completed successfully!")
            logger.info(f"Agent response:\n{result.content}")
        else:
            logger.error("❌ Test failed!")
            logger.error(f"Error: {result.content}")

        logger.info(f"\n💰 Cost: ${result.cost:.4f}")
        logger.info(f"🔄 Turns used: {result.metadata.get('turns', 'unknown')}")

        return result

    except Exception as e:
        logger.error(f"Error running agent: {e}")
        return AgentResult(success=False, content=str(e), cost=0.0)


async def main():
    """Main entry point."""
    logger.info("\n🧪 Simple Browser Test with MCP Tools")
    logger.info("=" * 60)

    # Run the test
    result = await run_browser_test()

    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Summary")
    logger.info("=" * 60)

    if result.success:
        logger.info("✅ Browser test completed successfully")
        logger.info("The agent was able to open browser, navigate to example.com, and report findings")
    else:
        logger.error("❌ Browser test failed")
        logger.error("Check the logs above for error details")


if __name__ == "__main__":
    asyncio.run(main())
