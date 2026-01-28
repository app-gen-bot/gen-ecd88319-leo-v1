#!/usr/bin/env python3
"""Simple test for the Retrospective agent."""

import asyncio
import logging
from pathlib import Path
from datetime import datetime

from cc_agent import Agent, AgentResult
from app_factory.agents.retrospective import (
    RetrospectiveAgent,
    create_retrospective_prompt
)

# Constants
PROJECT_ROOT = Path(__file__).parent.parent.parent
# Default to the most recent slack-clone app
APPS_DIR = PROJECT_ROOT / "apps"
OUTPUT_DIR = PROJECT_ROOT / "test_outputs" / "retrospective"

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def find_slack_clone_app():
    """Find the most recent slack-clone app directory."""
    slack_dirs = list(APPS_DIR.glob("slack-clone*"))
    if not slack_dirs:
        return None
    # Sort and get the most recent one
    return sorted(slack_dirs)[-1]


async def run_retrospective_analysis(app_name: str):
    """Run retrospective analysis on a completed app."""
    logger.info(f"Starting retrospective analysis for {app_name}...")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Find the app directory
    app_dir = APPS_DIR / app_name
    if not app_dir.exists():
        logger.info(f"Looking for {app_name} in apps directory...")
        # Try to find any slack-clone app
        app_dir = find_slack_clone_app()
        if not app_dir:
            logger.error("No slack-clone apps found")
            return AgentResult(success=False, content="No app to analyze", cost=0.0)
        app_name = app_dir.name
    
    specs_dir = app_dir / "specs"
    frontend_dir = app_dir / "frontend"
    
    logger.info(f"✅ Found app: {app_dir}")
    logger.info(f"   Specs dir: {specs_dir}")
    logger.info(f"   Frontend dir: {frontend_dir}")
    
    # Check for existing reports
    qc_report_path = specs_dir / "qc-report.md"
    integration_report_path = specs_dir / "integration-analysis.md"
    
    has_qc = qc_report_path.exists()
    has_integration = integration_report_path.exists()
    
    logger.info(f"   QC Report: {'✅ Found' if has_qc else '❌ Not found'}")
    logger.info(f"   Integration Report: {'✅ Found' if has_integration else '❌ Not found'}")
    
    # Create the agent with specs directory as working directory
    agent = RetrospectiveAgent(output_dir=specs_dir, logger=logger)
    
    # Prepare execution metrics (simulated for test)
    execution_metrics = {
        'duration': '15 minutes',  # Simulated
        'cost': 12.5432,  # Simulated total cost
        'iterations': 3,  # Simulated iterations
        'qc_success': has_qc,
        'integration_success': has_integration
    }
    
    # Prepare report paths
    report_paths = {
        'qc_report': str(qc_report_path) if has_qc else "",
        'integration_report': str(integration_report_path) if has_integration else "",
        'output_dir': str(frontend_dir)
    }
    
    # Create the user prompt
    user_prompt = create_retrospective_prompt(
        app_name=app_name,
        stage_name="Stage 2: Wireframe Generation v2",
        log_content=f"""Stage 2 execution summary:
- Completed with {execution_metrics['iterations']} iterations
- Total cost: ${execution_metrics['cost']:.4f}
- QC validation: {'Passed' if has_qc else 'Skipped'}
- Integration analysis: {'Completed' if has_integration else 'Skipped'}
""",
        qc_report=report_paths['qc_report'],
        generated_files_list=f"Use integration_analyzer tool on {report_paths['output_dir']} to discover files",
        execution_metrics=execution_metrics
    )
    
    logger.info("\n📊 Running retrospective analysis...")
    logger.info("The agent will:")
    logger.info("- Read existing QC and integration reports")
    logger.info("- Use integration_analyzer to discover generated files")
    logger.info("- Analyze execution patterns and quality")
    logger.info("- Generate improvement recommendations")
    
    # Run the agent
    try:
        result = await agent.run(user_prompt)
        
        # Report results
        logger.info("\n" + "=" * 60)
        logger.info("Retrospective Results")
        logger.info("=" * 60)
        
        if result.success:
            logger.info("✅ Retrospective completed successfully!")
            
            # Save the report
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            report_path = OUTPUT_DIR / f"retrospective_{app_name}_{timestamp}.md"
            report_path.write_text(result.content)
            logger.info(f"📄 Report saved to: {report_path}")
            
            # Also save to the app's specs directory
            app_retro_path = specs_dir / "stage-2-retrospective-test.md"
            app_retro_path.write_text(result.content)
            logger.info(f"📄 Also saved to: {app_retro_path}")
            
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
            logger.error("❌ Retrospective failed!")
            logger.error(f"Error: {result.content}")
        
        logger.info(f"\n💰 Cost: ${result.cost:.4f}")
        logger.info(f"🔄 Turns used: {result.metadata.get('turns', 'unknown')}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error running agent: {e}")
        import traceback
        traceback.print_exc()
        return AgentResult(success=False, content=str(e), cost=0.0)


async def main():
    """Main entry point."""
    logger.info("\n📊 Retrospective Agent Test")
    logger.info("=" * 60)
    logger.info("This test runs retrospective analysis on a completed app to:")
    logger.info("- Analyze execution patterns and quality")
    logger.info("- Identify what went well and what needs improvement")
    logger.info("- Generate specific recommendations")
    logger.info("- Provide insights for future executions")
    logger.info("=" * 60)
    
    # Find an app to analyze
    app_dir = find_slack_clone_app()
    if not app_dir:
        logger.error("❌ No slack-clone apps found to analyze")
        logger.info("Please run the main pipeline first to generate an app")
        return
    
    app_name = app_dir.name
    logger.info(f"\n🎯 Selected app: {app_name}")
    
    # Run the analysis
    result = await run_retrospective_analysis(app_name)
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("Summary")
    logger.info("=" * 60)
    
    if result.success:
        logger.info("✅ Retrospective analysis completed successfully")
        logger.info("The agent was able to:")
        logger.info("- Read existing QC and integration reports")
        logger.info("- Analyze the execution and outputs")
        logger.info("- Identify patterns and issues")
        logger.info("- Generate actionable recommendations")
    else:
        logger.error("❌ Retrospective analysis failed")
        logger.error("Check the logs above for error details")
    
    logger.info("\n💡 Next Steps:")
    logger.info("1. Review the generated retrospective report")
    logger.info("2. Implement the recommended improvements")
    logger.info("3. Run the pipeline again to see if improvements help")
    logger.info("4. Compare retrospectives to track progress over time")


if __name__ == "__main__":
    asyncio.run(main())