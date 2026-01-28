#!/usr/bin/env python3
"""AI App Factory v2 - Complete pipeline with both approaches.

This merged version supports:
1. Our approach: QC, build test, and self-improvement 
2. Their approach: Critic-Writer iterative pattern with retrospective
"""

import argparse
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from cc_agent import AgentResult, Agent
from cc_agent.logging import setup_logging
from app_factory import stages
from app_factory.utils import scaffold_project, Timer, print_stage_header

# Set up module logger
logger = logging.getLogger(__name__)


async def run_build_test(frontend_dir: Path) -> AgentResult:
    """Run build and test verification on the generated frontend.
    
    Args:
        frontend_dir: Path to frontend directory
        
    Returns:
        AgentResult with build/test results
    """
    timer = Timer("build_test")
    print_stage_header("2b", "Build & Test Verification", "🔨")
    
    # Create a simple agent to run build_test tool
    build_agent = Agent(
        name="Build Tester",
        system_prompt="You are a build and test verification agent. Run the verify_project tool and report results.",
        allowed_tools=["build_test"],
        permission_mode="auto",
        cwd=str(frontend_dir)
    )
    
    user_prompt = """
    Run the verify_project tool to check:
    1. Dependencies are installed
    2. TypeScript compiles without errors
    3. ESLint passes
    4. The project builds successfully
    
    Report the results clearly.
    """
    
    # Configure MCP servers for build_test
    mcp_servers = {
        "build_test": {
            "command": "mcp-build-test"
        }
    }
    
    logger.info(f"Running build verification in: {frontend_dir}")
    result = await build_agent.run(user_prompt, mcp_servers=mcp_servers)
    
    if result.success:
        logger.info("✅ Build and test verification completed")
    else:
        logger.warning("⚠️ Build verification encountered issues")
    
    logger.info(f"⏱️ Build & Test completed in {timer.elapsed_str()}")
    return result


async def run_self_improvement(app_name: str, qc_report_path: Path) -> AgentResult:
    """Run self-improvement agent to learn from QC feedback.
    
    Args:
        app_name: Name of the application
        qc_report_path: Path to QC report
        
    Returns:
        AgentResult with improvement insights
    """
    timer = Timer("self_improvement")
    print_stage_header("2c", "Self-Improvement Analysis", "📈")
    
    # Import the self-improvement agent
    from app_factory.agents.stage_2_wireframe.self_improvement import SelfImprovementAgent
    
    frontend_dir = Path("apps") / app_name / "frontend"
    
    # Read QC report
    if qc_report_path.exists():
        qc_report = qc_report_path.read_text()
    else:
        logger.warning("QC report not found, skipping self-improvement")
        return AgentResult(success=True, content="No QC report to analyze", cost=0.0)
    
    # Initialize self-improvement agent
    improvement_agent = SelfImprovementAgent(
        output_dir=frontend_dir,
        logger=logger,
        enable_context_awareness=True
    )
    
    user_prompt = f"""
    Analyze the following QC report and extract insights for future improvements:
    
    {qc_report}
    
    Focus on:
    1. Common patterns in the issues found
    2. Suggestions for improving the wireframe generation process
    3. Best practices that should be reinforced
    4. Areas where the generated code excelled
    """
    
    result = await improvement_agent.run(user_prompt)
    
    if result.success:
        logger.info("✅ Self-improvement analysis completed")
        # Save insights
        insights_path = Path("apps") / app_name / "specs" / "improvement-insights.md"
        insights_path.parent.mkdir(exist_ok=True)
    else:
        logger.warning("⚠️ Self-improvement analysis failed")
    
    logger.info(f"⏱️ Self-Improvement completed in {timer.elapsed_str()}")
    return result


async def run_pipeline_v2(user_prompt: str, app_name: str = None, use_critic_writer: bool = False) -> Dict[str, Any]:
    """Run the complete App Factory pipeline v2 with choice of patterns.
    
    Args:
        user_prompt: Initial user request
        app_name: Optional app name (auto-generated if not provided)
        use_critic_writer: Whether to use critic-writer pattern (default: False)
        
    Returns:
        Dictionary of results from each pipeline stage
    """
    results = {}
    pipeline_timer = Timer("pipeline_v2")
    
    # Stage 0: Generate PRD using the real orchestrator
    print_stage_header(0, "Generating Product Requirements Document", "📋")
    
    # Use the real orchestrator if app_name not provided
    if not app_name:
        # Create temp directory for PRD
        import tempfile
        temp_dir = Path(tempfile.mkdtemp(prefix="app_factory_stage0_"))
        
        # Run the orchestrator to generate PRD
        prd_result, app_name, prd_path = await stages.stage_0_prd.run_stage(user_prompt, temp_dir)
        results["prd"] = prd_result
        
        if not prd_result.success:
            logger.error("❌ Stage 0 failed")
            return results
        
        # Scaffold project
        from app_factory.utils import scaffold_project
        app_dir = scaffold_project(app_name, prd_path)
        specs_dir = app_dir / "specs"
        frontend_dir = app_dir / "frontend"
    else:
        # If app_name provided, create simplified PRD
        prd_content = f"""# Product Requirements Document

## User Request
{user_prompt}

## Core Requirements
Based on the user request, create a fully functional application that meets all specified requirements.

## Technical Stack
- Frontend: Next.js 14, React 18, TypeScript
- UI: ShadCN UI, Tailwind CSS
- State: Zustand
- Backend: FastAPI (future)
- Database: DynamoDB (future)
"""
        
        # Scaffold project
        app_dir = Path("apps") / app_name
        app_dir.mkdir(parents=True, exist_ok=True)
        specs_dir = app_dir / "specs"
        specs_dir.mkdir(exist_ok=True)
        frontend_dir = app_dir / "frontend"
        frontend_dir.mkdir(exist_ok=True)
        
        # Save PRD
        prd_path = specs_dir / "business_prd.md"
        prd_path.write_text(prd_content)
        logger.info(f"✅ PRD saved to: {prd_path}")
        
        # Create a simple result
        results["prd"] = AgentResult(
            success=True,
            content=prd_content,
            cost=0.0,
            metadata={"simplified": True}
        )
    
    # Stage 1: Generate Interaction Spec
    print_stage_header(1, "Generating Interaction Specification", "🖱️")
    
    # For now, create a basic interaction spec
    interaction_spec = f"""# Frontend Interaction Specification

## Overview
Create a user-friendly interface based on the requirements.

## Key Interactions
1. Intuitive navigation
2. Responsive design
3. Clear visual hierarchy
4. Accessible components
5. Smooth transitions

## User Flows
Design the application to be intuitive and easy to use.
"""
    
    interaction_spec_path = specs_dir / "frontend-interaction-spec.md"
    interaction_spec_path.write_text(interaction_spec)
    logger.info(f"✅ Interaction spec saved to: {interaction_spec_path}")
    
    # Create technical spec (basic version for now)
    technical_spec = """# Technical Implementation Specification

## Technology Stack
- Frontend: Next.js 14 (App Router)
- UI Components: ShadCN UI
- Styling: Tailwind CSS
- State Management: Zustand
- TypeScript: Strict mode enabled

## Component Architecture
- Modular component structure
- Separation of concerns
- Reusable UI components
- Custom hooks for logic

## Best Practices
- Type safety throughout
- Accessibility (WCAG 2.1 AA)
- Performance optimization
- Mobile-first responsive design
"""
    
    technical_spec_path = specs_dir / "technical-implementation-spec.md"
    technical_spec_path.write_text(technical_spec)
    logger.info(f"✅ Technical spec saved to: {technical_spec_path}")
    
    # Stage 2: Choose between our approach and critic-writer approach
    if use_critic_writer:
        # Use the critic-writer pattern from the other branch
        logger.info("🔄 Using Stage 2 v2 (Critic-Writer iterative pattern)")
        from app_factory.stages import stage_2_wireframe_v2
        wireframe_result = await stage_2_wireframe_v2.run_stage(app_name)
    else:
        # Use our QC/build/self-improvement approach
        logger.info("🎨 Using Stage 2 with QC, Build Test, and Self-Improvement")
        wireframe_result = await stages.stage_2_wireframe.run_stage(app_name)
        
        if wireframe_result.success:
            # Stage 2b: Build & Test Verification
            build_result = await run_build_test(frontend_dir)
            results["build_test"] = build_result
            
            # Stage 2c: Self-Improvement (if QC report exists)
            qc_report_path = specs_dir / "qc-report.md"
            if qc_report_path.exists():
                improvement_result = await run_self_improvement(app_name, qc_report_path)
                results["self_improvement"] = improvement_result
    
    results["wireframe"] = wireframe_result
    
    if not wireframe_result.success:
        logger.error("❌ Stage 2 (Wireframe) failed")
        return results
    
    # Stage 3: Technical Specification (TODO)
    print_stage_header(3, "Technical Specification", "🔧")
    logger.info("Stage 3: Technical specification generation - TODO")
    
    # Stage 4: Backend Generation (TODO)
    print_stage_header(4, "Backend Generation", "🗄️")
    logger.info("Stage 4: Backend generation - TODO")
    
    # Stage 5: Deployment (TODO)
    print_stage_header(5, "Deployment", "🚀")
    logger.info("Stage 5: Deployment - TODO")
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("📊 Pipeline Results Summary")
    logger.info("="*60)
    
    total_cost = 0.0
    for stage, result in results.items():
        if isinstance(result, AgentResult):
            status = "✅" if result.success else "❌"
            logger.info(f"{status} {stage}: ${result.cost:.4f}")
            total_cost += result.cost
    
    logger.info(f"\n💰 Total cost: ${total_cost:.4f}")
    logger.info(f"⏱️ Total pipeline time: {pipeline_timer.elapsed_str()}")
    
    results["total_cost"] = total_cost
    results["app_name"] = app_name
    results["app_dir"] = str(app_dir)
    
    return results


async def main():
    """Main entry point for App Factory v2."""
    parser = argparse.ArgumentParser(description="AI App Factory v2 - Generate complete applications")
    parser.add_argument("prompt", nargs="?", help="User prompt for app generation")
    parser.add_argument("--name", help="App name (auto-generated if not provided)")
    parser.add_argument("--log-level", default="INFO", help="Logging level")
    parser.add_argument("--critic-writer", action="store_true", help="Use critic-writer pattern instead of QC/build/self-improvement")
    
    args = parser.parse_args()
    
    # Set up centralized logging
    log_dir = Path(__file__).parent.parent.parent / "logs"
    setup_logging("app_factory_v2", log_dir=log_dir)
    
    pattern_name = "Critic-Writer Pattern" if args.critic_writer else "QC/Build/Self-Improvement"
    logger.info(f"\n🏭 AI App Factory v2.0.0 ({pattern_name})")
    logger.info("=" * 60)
    
    # Get user prompt
    if args.prompt:
        user_prompt = args.prompt
    else:
        # Interactive mode
        print("\n📝 Enter your app description (or 'quit' to exit):")
        user_prompt = input("> ").strip()
        if user_prompt.lower() == 'quit':
            return
    
    logger.info(f"\n📝 User request: {user_prompt}")
    
    # Run the pipeline
    results = await run_pipeline_v2(user_prompt, args.name, use_critic_writer=args.critic_writer)
    
    if "app_dir" in results:
        print(f"\n✨ App generated successfully!")
        print(f"📁 Location: {results['app_dir']}")
        print(f"💰 Total cost: ${results['total_cost']:.4f}")
        print(f"\n🚀 To run your app:")
        print(f"   cd {results['app_dir']}/frontend")
        print(f"   npm install")
        print(f"   npm run dev")


if __name__ == "__main__":
    asyncio.run(main())