#!/usr/bin/env python3
"""Simple test for the Integration Analyzer agent."""

import asyncio
import logging
from pathlib import Path
from datetime import datetime

from cc_agent import Agent, AgentResult
from app_factory.agents.stage_2_wireframe.integration_analyzer import (
    IntegrationAnalyzerAgent,
    create_integration_analyzer_prompt
)

# Constants
PROJECT_ROOT = Path(__file__).parent.parent.parent
APP_TO_ANALYZE = PROJECT_ROOT / "apps" / "slack-clone_2025-07-07_5" / "frontend"
OUTPUT_DIR = PROJECT_ROOT / "test_outputs" / "integration_analyzer"

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


async def run_integration_analysis():
    """Run integration analysis on the Slack clone app."""
    logger.info("Starting integration analysis...")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if app directory exists
    if not APP_TO_ANALYZE.exists():
        logger.error(f"❌ App directory not found: {APP_TO_ANALYZE}")
        logger.info("Looking for alternative slack-clone directories...")
        
        # Find any slack-clone directories
        apps_dir = PROJECT_ROOT / "apps"
        slack_dirs = list(apps_dir.glob("slack-clone*"))
        if slack_dirs:
            # Use the most recent one
            app_dir = sorted(slack_dirs)[-1] / "frontend"
            if app_dir.exists():
                logger.info(f"✅ Found alternative: {app_dir}")
                app_to_analyze = app_dir
            else:
                logger.error("No frontend directory found in slack-clone apps")
                return AgentResult(success=False, content="No app to analyze", cost=0.0)
        else:
            logger.error("No slack-clone apps found")
            return AgentResult(success=False, content="No app to analyze", cost=0.0)
    else:
        app_to_analyze = APP_TO_ANALYZE
    
    # Create the agent with the app directory as working directory
    agent = IntegrationAnalyzerAgent(output_dir=app_to_analyze, logger=logger)
    
    # Create the user prompt
    user_prompt = create_integration_analyzer_prompt(
        output_dir=str(app_to_analyze),
        app_name="Slack Clone",
        pages_to_analyze=[
            "/workspace/channel/[channelId]/page.tsx",
            "components/workspace/sidebar.tsx",
            "components/messages/message-input.tsx",
            "components/messages/thread-panel.tsx"
        ]
    )
    
    logger.info(f"Analyzing app at: {app_to_analyze}")
    logger.info("Focus pages: workspace channel, sidebar, message input, thread panel")
    
    # Run the agent
    try:
        result = await agent.run(user_prompt)
        
        # Report results
        logger.info("\n" + "=" * 60)
        logger.info("Analysis Results")
        logger.info("=" * 60)
        
        if result.success:
            logger.info("✅ Analysis completed successfully!")
            
            # Save the report
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = OUTPUT_DIR / f"integration_analysis_{timestamp}.md"
            report_path.write_text(result.content)
            logger.info(f"📄 Report saved to: {report_path}")
            
            # Show a preview of the report
            lines = result.content.split('\n')
            preview_lines = min(50, len(lines))
            logger.info(f"\n📋 Report Preview (first {preview_lines} lines):")
            logger.info("-" * 40)
            for line in lines[:preview_lines]:
                logger.info(line)
            if len(lines) > preview_lines:
                logger.info(f"... ({len(lines) - preview_lines} more lines)")
            logger.info("-" * 40)
            
        else:
            logger.error("❌ Analysis failed!")
            logger.error(f"Error: {result.content}")
        
        logger.info(f"\n💰 Cost: ${result.cost:.4f}")
        logger.info(f"🔄 Turns used: {result.metadata.get('turns', 'unknown')}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error running agent: {e}")
        return AgentResult(success=False, content=str(e), cost=0.0)


async def main():
    """Main entry point."""
    logger.info("\n🔍 Integration Analyzer Test")
    logger.info("=" * 60)
    logger.info("This test analyzes a Slack clone app to identify:")
    logger.info("- Integration points (API calls, WebSocket events)")
    logger.info("- Interactive UI elements (buttons, menus, forms)")
    logger.info("- Non-functional features (missing onClick handlers)")
    logger.info("- Code quality issues")
    logger.info("=" * 60)
    
    # Run the analysis
    result = await run_integration_analysis()
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Summary")
    logger.info("=" * 60)
    
    if result.success:
        logger.info("✅ Integration analysis completed successfully")
        logger.info("The agent was able to:")
        logger.info("- Use the integration_analyzer MCP tool")
        logger.info("- Analyze the codebase for integration points")
        logger.info("- Identify non-functional UI elements")
        logger.info("- Generate a comprehensive markdown report")
    else:
        logger.error("❌ Integration analysis failed")
        logger.error("Check the logs above for error details")
    
    logger.info("\n💡 Next Steps:")
    logger.info("1. Review the generated report in test_outputs/integration_analyzer/")
    logger.info("2. Use the findings to fix non-functional UI elements")
    logger.info("3. Run again after fixes to verify improvements")


if __name__ == "__main__":
    asyncio.run(main())