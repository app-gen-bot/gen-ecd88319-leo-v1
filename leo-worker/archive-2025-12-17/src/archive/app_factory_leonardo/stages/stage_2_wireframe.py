"""Stage 2: Wireframe Generation v2 (Critic-Writer Iterative Pattern).

This stage creates a complete Next.js application wireframe based on
the interaction specification using an iterative improvement process
with a Writer-Critic loop.
"""

import asyncio
import logging
from pathlib import Path
from typing import Optional, Tuple
from app_factory_leonardo.agents.stage_2_wireframe.wireframe import WireframeAgent, create_wireframe_prompt
from app_factory_leonardo.agents.stage_2_wireframe.qc import QCAgent, create_qc_prompt
from app_factory_leonardo.agents.stage_2_wireframe.integration_analyzer import IntegrationAnalyzerAgent, create_integration_analyzer_prompt
from app_factory_leonardo.agents.retrospective import RetrospectiveAgent, create_retrospective_prompt
from app_factory_leonardo.utils import Timer
from app_factory_leonardo.paths import get_frontend_dir
from cc_agent import AgentResult

logger = logging.getLogger(__name__)


def _load_required_spec(app_name: str, spec_type: str, output_dir: Path, optional: bool = False) -> Tuple[Optional[str], Optional[AgentResult]]:
    spec_mapping = {
        "interaction": {
            "filename": "frontend-interaction-spec.md",
            "display_name": "Interaction spec"
        },
        "technical": {
            "filename": "technical-implementation-spec.md", 
            "display_name": "Technical spec"
        }
    }
    
    spec_info = spec_mapping[spec_type]
    spec_name = spec_info["display_name"]
    specs_dir = output_dir / "specs"
    spec_path = specs_dir / spec_info["filename"]
    
    if not spec_path.exists():
        if optional:
            logger.info(f"{spec_name} not found (optional): {spec_path}")
            return "", None  # Return empty string for optional specs
        else:
            logger.error(f"{spec_name} not found: {spec_path}")
            return None, AgentResult(
                success=False,
                content=f"{spec_name} not found: {spec_path}",
                cost=0.0
            )
    
    try:
        content = spec_path.read_text()
        logger.info(f"Loaded {spec_name} ({len(content)} chars)")
        return content, None
    except Exception as e:
        if optional:
            logger.warning(f"Failed to read optional {spec_name}: {e}")
            return "", None
        else:
            logger.error(f"Failed to read {spec_name}: {e}")
            return None, AgentResult(
                success=False,
                content=f"Failed to read {spec_name}: {e}",
                cost=0.0
            )


async def run_stage_from_critic(app_name: str, start_iteration: int, previous_feedback: str = None, output_dir: Path = None) -> AgentResult:
    """Run Stage 2 starting from Critic evaluation at a specific iteration.
    
    This allows resuming the Writer-Critic loop from a Critic evaluation,
    useful when the Writer has already generated code and we want to
    evaluate it and potentially continue iterating.
    
    Args:
        app_name: Name of the application
        start_iteration: Which iteration the Critic should evaluate (1-4)
        previous_feedback: Previous critic feedback for context (optional)
        
    Returns:
        AgentResult containing the final wireframe result
    """
    timer = Timer("stage_2_wireframe_v2_critic_restart")
    
    # Load required specifications
    interaction_spec, error = _load_required_spec(app_name, "interaction", output_dir)
    if error:
        return error
    
    # Technical spec is optional
    tech_spec, _ = _load_required_spec(app_name, "technical", output_dir, optional=True)
    if not tech_spec:
        logger.info("⚠️ No technical spec found, proceeding without it")
    
    output_dir = Path(output_dir)
    logger.info(f"Output directory: {output_dir}")
    
    # Verify output directory exists with generated code
    if not output_dir.exists():
        return AgentResult(
            success=False,
            content=f"Frontend directory not found: {output_dir}",
            cost=0.0
        )
    
    # Initialize agents
    writer_agent = WireframeAgent(output_dir, logger=logger)
    
    # Import and initialize Critic agent
    from app_factory_leonardo.agents.stage_2_wireframe.critic import CriticAgent, create_critic_prompt
    from app_factory_leonardo.agents.stage_2_wireframe.critic.config import AGENT_CONFIG
    critic_agent = CriticAgent(output_dir, logger=logger)
    compliance_threshold = AGENT_CONFIG.get("compliance_threshold", 85)
    
    # Prepare for the Writer-Critic loop
    max_iterations = 4
    total_cost = 0.0
    
    # Create a mock critic result with previous feedback if provided
    critic_result = None
    if previous_feedback and start_iteration > 1:
        # Create a mock AgentResult with the previous feedback
        # AgentResult is already imported at the top of the file
        critic_result = AgentResult(
            success=True,
            content="",  # Not used
            cost=0.0
        )
        critic_result.metadata['evaluation'] = previous_feedback
        logger.info(f"📋 Using provided previous feedback for iteration {start_iteration}")
    
    logger.info(f"🔄 Starting Writer-Critic loop at Critic iteration {start_iteration}...")
    
    # Start the loop at the specified iteration
    # Note: iteration is 0-based in the loop, but 1-based for user
    iteration = start_iteration - 1
    
    # Run the Critic evaluation first
    logger.info(f"\\n--- Resuming at Iteration {iteration + 1}/{max_iterations} ---")
    logger.info("🔍 Running Critic agent...")
    
    critic_prompt = create_critic_prompt(
        interaction_spec=interaction_spec,
        tech_spec=tech_spec,
        output_dir=str(output_dir),
        app_name=app_name,
        iteration=iteration + 1,
        compliance_threshold=compliance_threshold
    )
    
    critic_result = await critic_agent.run(critic_prompt)
    total_cost += critic_result.cost
    
    logger.info(f"Critic Cost (iteration {iteration + 1}): ${critic_result.cost:.4f}")
    
    # Parse critic decision
    critic_decision = "complete"
    critic_feedback = ""
    
    try:
        import json
        content = critic_result.content
        start = content.find('{')
        end = content.rfind('}') + 1
        if start != -1 and end > start:
            critic_json = json.loads(content[start:end])
            critic_decision = critic_json.get("decision", "complete")
            
            # Log evaluation summary
            evaluation = critic_json.get('evaluation', {})
            logger.info(f"🔍 Critic evaluation: {evaluation.get('compliance_score', 'N/A')}% compliance")
            logger.info(f"🔍 Files analyzed: {evaluation.get('file_count_analyzed', 'N/A')}")
            logger.info(f"🔍 Critical issues: {evaluation.get('critical_issues_count', 'N/A')}")
            logger.info(f"🔍 Critic reasoning: {critic_json.get('reasoning', 'No reasoning provided')}")
            
            # Check for detailed report
            detailed_report_path = evaluation.get('detailed_report_path')
            if detailed_report_path:
                logger.info(f"📄 Critic wrote detailed analysis to: {detailed_report_path}")
                critic_feedback = f"""
### Critic Evaluation Summary
{evaluation.get('summary', 'See detailed report')}

### Priority Fixes
{chr(10).join(f"- {fix}" for fix in critic_json.get('priority_fixes', []))}

### Detailed Analysis
**IMPORTANT**: Read the complete analysis from: {detailed_report_path}
This file contains all {evaluation.get('missing_features_count', 0)} missing features, 
{evaluation.get('critical_issues_count', 0)} critical issues, and detailed code snippets.
"""
            else:
                critic_feedback = json.dumps(critic_json, indent=2)
                
    except (json.JSONDecodeError, Exception) as e:
        logger.warning(f"Could not parse critic decision, defaulting to complete: {e}")
        critic_feedback = critic_result.content
    
    # Check if we should continue or complete
    if critic_decision == "complete":
        logger.info(f"✅ Critic decided to complete after iteration {iteration + 1}")
    else:
        logger.info(f"🔄 Critic decided to continue (issues found)")
        critic_result.metadata['evaluation'] = critic_feedback
        
        # Continue with the Writer-Critic loop
        iteration += 1  # Move to next iteration
        
        # Continue the normal Writer-Critic loop
        for iteration in range(iteration, max_iterations):
            logger.info(f"\\n--- Iteration {iteration + 1}/{max_iterations} ---")
            
            # Check for user feedback before each iteration
            user_feedback = ""
            user_feedback_path = output_dir / "specs" / "user_feedback.md"
            if user_feedback_path.exists():
                logger.info("🔴 Found user feedback file! Reading...")
                try:
                    user_feedback = user_feedback_path.read_text()
                    logger.info(f"📋 User feedback loaded ({len(user_feedback)} chars)")
                    logger.info("🔴 USER FEEDBACK TAKES HIGHEST PRIORITY!")
                except Exception as e:
                    logger.error(f"Failed to read user feedback: {e}")
                    user_feedback = ""
            
            # Writer: Create/improve implementation
            logger.info("🖊️ Running Writer agent...")
            user_prompt = create_wireframe_prompt(
                interaction_spec=interaction_spec,
                tech_spec=tech_spec,
                output_dir=str(output_dir),
                app_name=app_name,
                critic_report=critic_result.metadata.get('evaluation', '') if critic_result else "",
                user_feedback=user_feedback
            )
            
            writer_result = await writer_agent.run(user_prompt)
            total_cost += writer_result.cost
            
            if not writer_result.success:
                logger.error(f"❌ Writer failed on iteration {iteration + 1}: {writer_result.content}")
                writer_result.cost = total_cost
                return writer_result
            
            logger.info(f"✅ Writer completed iteration {iteration + 1}")
            logger.info(f"Writer Cost (iteration {iteration + 1}): ${writer_result.cost:.4f}")
            
            # Critic: Evaluate again
            logger.info("🔍 Running Critic agent...")
            critic_prompt = create_critic_prompt(
                interaction_spec=interaction_spec,
                tech_spec=tech_spec,
                output_dir=str(output_dir),
                app_name=app_name,
                iteration=iteration + 1,
                compliance_threshold=compliance_threshold
            )
            
            critic_result = await critic_agent.run(critic_prompt)
            total_cost += critic_result.cost
            
            logger.info(f"Critic Cost (iteration {iteration + 1}): ${critic_result.cost:.4f}")
            
            # Parse critic decision
            try:
                import json
                content = critic_result.content
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end > start:
                    critic_json = json.loads(content[start:end])
                    critic_decision = critic_json.get("decision", "complete")
                    
                    evaluation = critic_json.get('evaluation', {})
                    logger.info(f"🔍 Critic evaluation: {evaluation.get('compliance_score', 'N/A')}% compliance")
                    logger.info(f"🔍 Critic reasoning: {critic_json.get('reasoning', 'No reasoning provided')}")
                    
                    if critic_decision == "continue":
                        # Prepare feedback for next iteration
                        detailed_report_path = evaluation.get('detailed_report_path')
                        if detailed_report_path:
                            critic_feedback = f"""
### Critic Evaluation Summary
{evaluation.get('summary', 'See detailed report')}

### Priority Fixes
{chr(10).join(f"- {fix}" for fix in critic_json.get('priority_fixes', []))}

### Detailed Analysis
**IMPORTANT**: Read the complete analysis from: {detailed_report_path}
"""
                        else:
                            critic_feedback = json.dumps(critic_json, indent=2)
                        critic_result.metadata['evaluation'] = critic_feedback
                        
            except Exception as e:
                logger.warning(f"Could not parse critic decision: {e}")
                critic_decision = "complete"
            
            if critic_decision == "complete":
                logger.info(f"✅ Critic decided to complete after {iteration + 1} iterations")
                break
    
    logger.info(f"🔄 Writer-Critic loop completed")
    logger.info(f"Total Writer-Critic Cost: ${total_cost:.4f}")
    
    # Run final QC and other agents (same as normal flow)
    logger.info("Running Quality Control validation...")
    qc_prompt = create_qc_prompt(
        interaction_spec=interaction_spec,
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    qc_result = await QCAgent(output_dir, logger=logger).run(qc_prompt)
    total_cost += qc_result.cost
    
    if qc_result.success:
        logger.info("QC validation completed")
        logger.info(f"QC Cost: ${qc_result.cost:.4f}")
        
        qc_report_path = output_dir / "specs" / "qc-report.md"
        logger.info(f"QC report saved to: {qc_report_path}")
    else:
        logger.warning(f"QC validation encountered issues: {qc_result.content[:200]}...")
    
    # Run Integration Analyzer
    logger.info("\\n🔍 Running Integration Analyzer...")
    integration_agent = IntegrationAnalyzerAgent(output_dir, logger=logger)
    integration_prompt = create_integration_analyzer_prompt(
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    integration_result = await integration_agent.run(integration_prompt)
    total_cost += integration_result.cost
    
    if integration_result.success:
        logger.info("✅ Integration analysis completed")
        logger.info(f"Integration Analyzer Cost: ${integration_result.cost:.4f}")
        
        integration_report_path = output_dir / "specs" / "integration-analysis.md"
        integration_report_path.write_text(integration_result.content)
        logger.info(f"Integration analysis saved to: {integration_report_path}")
    
    # Run Retrospective Agent
    logger.info("\\n📊 Running Retrospective Analysis...")
    retrospective_agent = RetrospectiveAgent(output_dir / "specs", logger=logger)
    
    execution_metrics = {
        'duration': timer.elapsed_str(),
        'cost': total_cost,
        'iterations': iteration + 1,
        'qc_success': qc_result.success,
        'integration_success': integration_result.success,
        'restarted_at_critic': True,
        'restart_iteration': start_iteration
    }
    
    specs_dir = output_dir / "specs"
    report_paths = {
        'qc_report': str(specs_dir / "qc-report.md") if qc_result.success else "",
        'integration_report': str(specs_dir / "integration-analysis.md") if integration_result.success else "",
        'output_dir': str(output_dir)
    }
    
    retrospective_prompt = create_retrospective_prompt(
        app_name=app_name,
        stage_name="Stage 2: Wireframe Generation v2 (Critic Restart)",
        log_content=f"Stage 2 critic restart summary: Started at iteration {start_iteration}, ${total_cost:.4f} total cost",
        qc_report=report_paths['qc_report'],
        generated_files_list=f"Use integration_analyzer tool on {report_paths['output_dir']} to discover files",
        execution_metrics=execution_metrics
    )
    
    retrospective_result = await retrospective_agent.run(retrospective_prompt)
    total_cost += retrospective_result.cost
    
    if retrospective_result.success:
        logger.info("✅ Retrospective analysis completed")
        logger.info(f"Retrospective Cost: ${retrospective_result.cost:.4f}")
        
        retrospective_path = output_dir / "specs" / "stage-2-retrospective-critic-restart.md"
        retrospective_path.write_text(retrospective_result.content)
        logger.info(f"Retrospective saved to: {retrospective_path}")
    
    # Return final result
    logger.info(f"\\n💰 Total Stage 2 v2 Cost (from restart): ${total_cost:.4f}")
    logger.info(f"⏱️ Stage 2 v2 completed in {timer.elapsed_str()}")
    
    # Create final result
    final_result = AgentResult(
        success=True,
        content="Wireframe generation completed successfully from critic restart",
        cost=total_cost
    )
    final_result.metadata = {
        "qc_success": qc_result.success,
        "qc_cost": qc_result.cost,
        "integration_success": integration_result.success,
        "integration_cost": integration_result.cost,
        "retrospective_success": retrospective_result.success,
        "retrospective_cost": retrospective_result.cost,
        "iterations": iteration + 1,
        "pattern": "critic-writer-v2-restart",
        "restart_iteration": start_iteration
    }
    
    return final_result


async def run_stage(app_name: str, custom_specs_path: Optional[Path] = None, output_dir: Optional[Path] = None) -> AgentResult:
    """Generate wireframe using iterative Writer-Critic pattern.
    
    Args:
        app_name: Name of the application
        custom_specs_path: Optional custom path to specs directory (for --use-existing-specs)
        
    Returns:
        AgentResult containing the generated wireframe
    """
    timer = Timer("stage_2_wireframe_v2")

    # Load required specifications
    if custom_specs_path:
        # Use custom specs path instead of default
        logger.info(f"📂 Using custom specs from: {custom_specs_path}")
        interaction_spec_path = custom_specs_path / "frontend-interaction-spec.md"
        tech_spec_path = custom_specs_path / "technical-implementation-spec.md"
        
        # Load interaction spec (required)
        if not interaction_spec_path.exists():
            return AgentResult(
                success=False,
                content=f"Interaction spec not found: {interaction_spec_path}",
                cost=0.0
            )
        interaction_spec = interaction_spec_path.read_text()
        
        # Load technical spec (optional - try multiple locations)
        if tech_spec_path.exists():
            tech_spec = tech_spec_path.read_text()
            logger.info(f"📋 Loaded technical spec from: {tech_spec_path}")
        else:
            # Try default technical spec from resources
            tech_spec_resource = Path(__file__).parent.parent.parent.parent / "resources" / "specifications" / "technical-implementation-spec.md"
            if tech_spec_resource.exists():
                tech_spec = tech_spec_resource.read_text()
                logger.info("📋 Using default technical spec from resources")
            else:
                tech_spec = ""
                logger.info("⚠️ No technical spec found, proceeding without it (optional)")
    else:
        # Use default behavior
        interaction_spec, error = _load_required_spec(app_name, "interaction", output_dir)
        if error:
            return error
        
        # Technical spec is optional
        tech_spec, _ = _load_required_spec(app_name, "technical", output_dir, optional=True)
        if not tech_spec:
            logger.info("⚠️ No technical spec found, proceeding without it")
    
    output_dir = Path(output_dir)
    logger.info(f"Output directory: {output_dir}")
    
    # Ensure the frontend directory exists before the agent tries to use it as cwd
    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created frontend directory: {output_dir}")
    
    # Initialize agents
    writer_agent = WireframeAgent(output_dir, logger=logger)
    
    # Import and initialize Critic agent
    from app_factory_leonardo.agents.stage_2_wireframe.critic import CriticAgent, create_critic_prompt
    from app_factory_leonardo.agents.stage_2_wireframe.critic.config import AGENT_CONFIG
    critic_agent = CriticAgent(output_dir, logger=logger)
    compliance_threshold = AGENT_CONFIG.get("compliance_threshold", 85)
    
    # Writer-Critic iterative loop
    safety_limit = 10  # Maximum iterations to prevent infinite loops
    min_iterations = 2  # Minimum iterations to ensure quality
    total_cost = 0.0
    critic_result = None  # No critic feedback on first iteration
    iteration = 0
    
    logger.info("🔄 Starting Writer-Critic iterative loop (dynamic iterations)...")
    logger.info("   - Continues until Critic approves or safety limit reached")
    logger.info("   - Minimum iterations: 2, Safety limit: 10")
    
    while iteration < safety_limit:
        iteration += 1
        logger.info(f"\n--- Iteration {iteration} ---")
        
        # Check for user feedback before each iteration
        user_feedback = ""
        user_feedback_path = output_dir / "specs" / "user_feedback.md"
        if user_feedback_path.exists():
            logger.info("🔴 Found user feedback file! Reading...")
            try:
                user_feedback = user_feedback_path.read_text()
                logger.info(f"📋 User feedback loaded ({len(user_feedback)} chars)")
                logger.info("🔴 USER FEEDBACK TAKES HIGHEST PRIORITY!")
            except Exception as e:
                logger.error(f"Failed to read user feedback: {e}")
                user_feedback = ""
        
        # Writer: Create/improve implementation
        logger.info("🖊️ Running Writer agent...")
        user_prompt = create_wireframe_prompt(
            interaction_spec=interaction_spec,
            tech_spec=tech_spec,
            output_dir=str(output_dir),
            app_name=app_name,
            critic_report=critic_result.metadata.get('evaluation', '') if critic_result else "",
            user_feedback=user_feedback
        )
        
        try:
            writer_result = await writer_agent.run(user_prompt)
            total_cost += writer_result.cost
            
            if not writer_result.success:
                logger.error(f"❌ Writer failed on iteration {iteration}: {writer_result.content}")
                writer_result.cost = total_cost
                return writer_result
        except asyncio.CancelledError:
            logger.warning("⚠️ Writer operation was cancelled")
            raise
        except Exception as e:
            logger.error(f"❌ Error in Writer async operation: {e}")
            # Return failure result
            failure_result = AgentResult(
                success=False,
                content=f"Writer failed with error: {e}",
                cost=total_cost
            )
            return failure_result
        
        logger.info(f"✅ Writer completed iteration {iteration}")
        logger.info(f"Writer Cost (iteration {iteration}): ${writer_result.cost:.4f}")
        
        # Check if build test was executed
        if hasattr(writer_result, 'metadata') and writer_result.metadata:
            build_test_executed = writer_result.metadata.get('build_test_executed', False)
            if not build_test_executed:
                logger.warning("⚠️ Writer did not execute build test!")
        
        # Critic: Evaluate implementation and decide
        logger.info("🔍 Running Critic agent...")
        critic_prompt = create_critic_prompt(
            interaction_spec=interaction_spec,
            tech_spec=tech_spec,
            output_dir=str(output_dir),
            app_name=app_name,
            iteration=iteration,
            compliance_threshold=compliance_threshold
        )
        
        try:
            critic_result = await critic_agent.run(critic_prompt)
            total_cost += critic_result.cost
            
            logger.info(f"Critic Cost (iteration {iteration}): ${critic_result.cost:.4f}")
        except asyncio.CancelledError:
            logger.warning("⚠️ Critic operation was cancelled")
            raise
        except Exception as e:
            logger.error(f"❌ Error in Critic async operation: {e}")
            # Return failure result
            failure_result = AgentResult(
                success=False,
                content=f"Critic failed with error: {e}",
                cost=total_cost
            )
            return failure_result
        
        # Parse critic decision from result
        # The critic should return JSON with decision field
        critic_decision = "complete"  # Default to complete if parsing fails
        critic_feedback = ""  # Feedback to pass to writer
        
        try:
            import json
            # Try to extract JSON from critic result
            content = critic_result.content
            # Look for JSON block in the content
            start = content.find('{')
            end = content.rfind('}') + 1
            if start != -1 and end > start:
                critic_json = json.loads(content[start:end])
                critic_decision = critic_json.get("decision", "complete")
                
                # Log evaluation summary
                evaluation = critic_json.get('evaluation', {})
                logger.info(f"🔍 Critic evaluation: {evaluation.get('compliance_score', 'N/A')}% compliance")
                logger.info(f"🔍 Files analyzed: {evaluation.get('file_count_analyzed', 'N/A')}")
                logger.info(f"🔍 Critical issues: {evaluation.get('critical_issues_count', 'N/A')}")
                logger.info(f"🔍 Critic reasoning: {critic_json.get('reasoning', 'No reasoning provided')}")
                
                # Check if there's a detailed report file
                detailed_report_path = evaluation.get('detailed_report_path')
                if detailed_report_path:
                    logger.info(f"📄 Critic wrote detailed analysis to: {detailed_report_path}")
                    # Construct feedback that tells Writer to read the file
                    critic_feedback = f"""
### Critic Evaluation Summary
{evaluation.get('summary', 'See detailed report')}

### Priority Fixes
{chr(10).join(f"- {fix}" for fix in critic_json.get('priority_fixes', []))}

### Detailed Analysis
**IMPORTANT**: Read the complete analysis from: {detailed_report_path}
This file contains all {evaluation.get('missing_features_count', 0)} missing features, 
{evaluation.get('critical_issues_count', 0)} critical issues, and detailed code snippets.
"""
                else:
                    # Small codebase - full details in JSON
                    critic_feedback = json.dumps(critic_json, indent=2)
                    
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"Could not parse critic decision, defaulting to complete: {e}")
            critic_feedback = critic_result.content
        
        if critic_decision == "complete":
            logger.info(f"✅ Critic decided to complete after {iteration} iterations")
            break
        else:
            logger.info(f"🔄 Critic decided to continue (issues found)")
            # Store the formatted feedback for next iteration
            critic_result.metadata['evaluation'] = critic_feedback
            
            # Check if we've reached minimum iterations
            if iteration < min_iterations:
                logger.info(f"   Continuing (minimum {min_iterations} iterations required)")
            # Check if we're approaching safety limit
            elif iteration >= safety_limit - 1:
                logger.warning(f"⚠️ Approaching safety limit ({safety_limit} iterations)")
                logger.warning("   Final iteration - Writer should prioritize critical fixes")
    
    # Check if we hit the safety limit
    if iteration >= safety_limit and critic_decision != "complete":
        logger.warning(f"⚠️ Reached safety limit of {safety_limit} iterations")
        logger.warning("   Proceeding with current implementation despite remaining issues")
    
    logger.info(f"🔄 Writer-Critic loop completed after {iteration} iterations")
    logger.info(f"Total Writer-Critic Cost: ${total_cost:.4f}")
    
    # Run final QC validation (same as original)
    logger.info("Running Quality Control validation...")
    qc_prompt = create_qc_prompt(
        interaction_spec=interaction_spec,
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    qc_result = await QCAgent(output_dir, logger=logger).run(qc_prompt)
    total_cost += qc_result.cost
    
    if qc_result.success:
        logger.info("QC validation completed")
        logger.info(f"QC Cost: ${qc_result.cost:.4f}")
        
        # Save QC report
        qc_report_path = output_dir / "specs" / "qc-report.md"
        logger.info(f"QC report saved to: {qc_report_path}")
    else:
        logger.warning(f"QC validation encountered issues: {qc_result.content[:200]}...")
    
    # Run Integration Analyzer
    logger.info("\n🔍 Running Integration Analyzer...")
    integration_agent = IntegrationAnalyzerAgent(output_dir, logger=logger)
    integration_prompt = create_integration_analyzer_prompt(
        output_dir=str(output_dir),
        app_name=app_name
    )
    
    integration_result = await integration_agent.run(integration_prompt)
    total_cost += integration_result.cost
    
    if integration_result.success:
        logger.info("✅ Integration analysis completed")
        logger.info(f"Integration Analyzer Cost: ${integration_result.cost:.4f}")
        
        # Save integration analysis report
        integration_report_path = output_dir / "specs" / "integration-analysis.md"
        integration_report_path.write_text(integration_result.content)
        logger.info(f"Integration analysis saved to: {integration_report_path}")
    else:
        logger.warning(f"Integration analysis encountered issues: {integration_result.content[:200]}...")
    
    # Run Retrospective Agent
    logger.info("\n📊 Running Retrospective Analysis...")
    retrospective_agent = RetrospectiveAgent(output_dir / "specs", logger=logger)
    
    # Prepare execution metrics
    execution_metrics = {
        'duration': timer.elapsed_str(),
        'cost': total_cost,
        'iterations': iteration + 1 if 'iteration' in locals() else 1,
        'qc_success': qc_result.success,
        'integration_success': integration_result.success
    }
    
    # Prepare file paths for the retrospective agent to read
    specs_dir = output_dir / "specs"
    report_paths = {
        'qc_report': str(specs_dir / "qc-report.md") if qc_result.success else "",
        'integration_report': str(specs_dir / "integration-analysis.md") if integration_result.success else "",
        'output_dir': str(output_dir)
    }
    
    # Create a concise retrospective prompt with file references
    retrospective_prompt = create_retrospective_prompt(
        app_name=app_name,
        stage_name="Stage 2: Wireframe Generation v2",
        log_content=f"Stage 2 execution summary: {execution_metrics['iterations']} iterations, ${total_cost:.4f} total cost",
        qc_report=report_paths['qc_report'],  # Path to QC report
        generated_files_list=f"Use integration_analyzer tool on {report_paths['output_dir']} to discover files",
        execution_metrics=execution_metrics
    )
    
    retrospective_result = await retrospective_agent.run(retrospective_prompt)
    total_cost += retrospective_result.cost
    
    if retrospective_result.success:
        logger.info("✅ Retrospective analysis completed")
        logger.info(f"Retrospective Cost: ${retrospective_result.cost:.4f}")
        
        # Save retrospective report
        retrospective_path = output_dir / "specs" / "stage-2-retrospective.md"
        retrospective_path.write_text(retrospective_result.content)
        logger.info(f"Retrospective saved to: {retrospective_path}")
    else:
        logger.warning(f"Retrospective analysis encountered issues: {retrospective_result.content[:200]}...")
    
    # Return final result
    logger.info(f"\n💰 Total Stage 2 v2 Cost: ${total_cost:.4f}")
    logger.info(f"⏱️ Stage 2 v2 completed in {timer.elapsed_str()}")
    
    # Return the writer result with updated costs and metadata
    writer_result.cost = total_cost
    writer_result.metadata["qc_success"] = qc_result.success
    writer_result.metadata["qc_cost"] = qc_result.cost
    writer_result.metadata["integration_success"] = integration_result.success
    writer_result.metadata["integration_cost"] = integration_result.cost
    writer_result.metadata["retrospective_success"] = retrospective_result.success
    writer_result.metadata["retrospective_cost"] = retrospective_result.cost
    writer_result.metadata["iterations"] = iteration if 'iteration' in locals() else 1
    writer_result.metadata["pattern"] = "critic-writer-v2"
    
    return writer_result