"""Proper Writer-Critic Loop implementation following Core Principles.

This implements the three-agent architecture with Loop Exit Agent validation loop.
Based on AI_DOCS/WCL_CORE_PRINCIPLES.md and AI_DOCS/WCL_IMPLEMENTATION_PLAN.md
"""

import json
import logging
from pathlib import Path
from typing import Callable, Optional, List, Dict, Any, Union
from dataclasses import dataclass, field
from cc_agent import Agent, AgentResult

# Import dev config if available
try:
    from src.app_factory_leonardo_replit.dev_config import (
        get_max_iterations, get_max_turns, get_max_attempts
    )
except ImportError:
    try:
        # Try alternate import path
        from app_factory_leonardo_replit.dev_config import (
            get_max_iterations, get_max_turns, get_max_attempts
        )
    except ImportError:
        # Fallback if dev_config not available
        def get_max_iterations(default: int = 3) -> int:
            return default
        def get_max_turns(default: int = 30) -> int:
            return default
        def get_max_attempts(default: int = 3) -> int:
            return default

logger = logging.getLogger(__name__)

# Type aliases
PromptBuilder = Union[str, Callable[[int, Optional[str]], str]]
CriticPromptBuilder = Union[str, Callable[[int], str]]


@dataclass
class WCLResult:
    """Result of a Writer-Critic loop execution."""
    success: bool
    iterations: int
    compliance_score: int
    total_cost: float
    writer_files: List[Path]
    critic_files: List[Path]
    decision_files: List[Path]
    history: List[Dict[str, Any]]
    exit_reason: str
    error: Optional[str] = None


class WCL:
    """Writer-Critic Loop orchestrator with Loop Exit Agent.
    
    Implements three-agent architecture:
    1. Writer creates/improves content
    2. Critic evaluates and provides feedback
    3. Loop Exit Agent makes structured continue/done decision
    
    LLM users only need to provide prompts - all mechanics are handled.
    """
    
    def __init__(
        self,
        # Required: Writer configuration
        writer_system_prompt: str,
        writer_user_prompt: PromptBuilder,
        
        # Required: Critic configuration  
        critic_system_prompt: str,
        critic_user_prompt: CriticPromptBuilder,
        
        # Optional: WCL configuration
        name: str = "WCL",  # Base name for agents (will add suffixes)
        phase: int = 1,
        step: int = 1,
        output_dir: Path = None,
        max_iterations: int = None,  # Will use dev config default
        compliance_threshold: int = 85,
        cwd: Optional[str] = None,
        
        # Optional: Agent configuration
        writer_model: str = "sonnet",
        critic_model: str = "sonnet",
        lea_model: str = "claude-3-5-sonnet-20241022",
        writer_tools: List[str] = None,
        critic_tools: List[str] = None,
    ):
        """Initialize WCL with prompts and configuration.
        
        Args:
            writer_system_prompt: System prompt for writer agent
            writer_user_prompt: User prompt (string or builder function)
            critic_system_prompt: System prompt for critic agent
            critic_user_prompt: User prompt (string or builder function)
            name: Base name for agents (suffixes will be added)
            phase: Phase number for file naming (default: 1)
            step: Step number for file naming (default: 1)
            output_dir: Output directory (default: wcl_output/)
            max_iterations: Maximum iterations (default: 3)
            compliance_threshold: Score needed to complete (default: 85)
            cwd: Working directory for agents
            writer_model: Model for writer agent
            critic_model: Model for critic agent
            lea_model: Model for Loop Exit Agent
            writer_tools: MCP tools for writer (e.g., ["oxc"])
            critic_tools: MCP tools for critic (e.g., ["oxc"])
        """
        self.writer_system_prompt = writer_system_prompt
        self.writer_user_prompt = writer_user_prompt
        self.critic_system_prompt = critic_system_prompt
        self.critic_user_prompt = critic_user_prompt
        
        self.name = name  # Base name for agents
        self.phase = phase
        self.step = step
        self.output_dir = Path(output_dir or "wcl_output")
        self.max_iterations = get_max_iterations(3) if max_iterations is None else max_iterations
        self.compliance_threshold = compliance_threshold
        self.cwd = cwd or str(self.output_dir)
        
        # Agent configuration
        self.writer_model = writer_model
        self.critic_model = critic_model
        self.lea_model = lea_model
        self.writer_tools = writer_tools or []
        self.critic_tools = critic_tools or []
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Track files
        self.writer_files: List[Path] = []
        self.critic_files: List[Path] = []
        self.decision_files: List[Path] = []
    
    def _create_writer_subprompt(self, iteration: int) -> str:
        """Create WCL subprompt that tells Writer where to write."""
        writer_file = f"phase{self.phase}_step{self.step}_iter{iteration}_writer.md"
        
        subprompt = f"""

## Writer-Critic Loop Context
You are the WRITER in iteration {iteration} of a Writer-Critic Loop.
- Phase: {self.phase}, Step: {self.step}
- Output file: {writer_file}

## REQUIRED ACTIONS
1. Generate your complete output/implementation
2. Save ALL your work to: {self.output_dir}/{writer_file}
3. Use the Write tool to create this file
4. Put your ENTIRE solution in this single file"""
        
        if iteration > 1:
            prev_writer = f"phase{self.phase}_step{self.step}_iter{iteration-1}_writer.md"
            prev_critic = f"phase{self.phase}_step{self.step}_iter{iteration-1}_critic.md"
            subprompt += f"""

## Previous Iteration Context
Read these files to understand what to improve:
1. Your previous work: {self.output_dir}/{prev_writer}
2. Critic's feedback: {self.output_dir}/{prev_critic}

The critic's feedback contains specific issues to address."""
        
        return subprompt
    
    def _create_critic_subprompt(self, iteration: int) -> str:
        """Create WCL subprompt that tells Critic where to read and write."""
        writer_file = f"phase{self.phase}_step{self.step}_iter{iteration}_writer.md"
        critic_file = f"phase{self.phase}_step{self.step}_iter{iteration}_critic.md"
        
        return f"""

## Writer-Critic Loop Context  
You are the CRITIC in iteration {iteration} of a Writer-Critic Loop.
- Phase: {self.phase}, Step: {self.step}
- Writer's output: {self.output_dir}/{writer_file}
- Your evaluation file: {critic_file}

## REQUIRED ACTIONS
1. READ the writer's file: {self.output_dir}/{writer_file}
2. Evaluate it thoroughly against ALL requirements
3. Write your COMPLETE evaluation to: {self.output_dir}/{critic_file}

## Evaluation Format
Write your evaluation as markdown. Be specific about:
- What works well
- What needs improvement
- Specific issues found
- Concrete suggestions for fixes

You do NOT need to provide JSON or structured output - just write a thorough markdown evaluation.
The Loop Exit Agent will handle the continue/done decision based on your evaluation."""
    
    def _create_lea_prompt(self, critic_file: Path, iteration: int, attempt: int = 1) -> str:
        """Create prompt for Loop Exit Agent."""
        decision_file = f"phase{self.phase}_step{self.step}_iter{iteration}_decision.json"
        if attempt > 1:
            decision_file = f"phase{self.phase}_step{self.step}_iter{iteration}_decision_attempt{attempt}.json"
        
        prompt = f"""You are a Loop Exit Agent evaluating a Writer-Critic loop.

## Your Task
Read the critic's evaluation and decide whether to CONTINUE iterating or mark as DONE.

## Files to Read
Critic's evaluation: {critic_file}

## Decision Output
Write a JSON file to: {self.output_dir}/{decision_file}

The JSON must have EXACTLY this structure:
```json
{{
  "decision": "CONTINUE",  // or "DONE" if requirements are met
  "compliance_score": 75,  // 0-100 based on critic's evaluation
  "reason": "Brief explanation of your decision"
}}
```

## Decision Guidelines
- Use "DONE" if compliance_score >= {self.compliance_threshold} AND critic indicates all requirements are met
- Use "CONTINUE" if there are significant issues to fix or compliance < {self.compliance_threshold}
- Base your score on the critic's evaluation severity

IMPORTANT: You MUST write valid JSON to the specified file using the Write tool."""
        
        if attempt > 1:
            prompt += f"""

## PREVIOUS ATTEMPT FAILED
Your previous JSON was invalid. Common issues:
- Missing required fields (decision, compliance_score, reason)
- Invalid decision value (must be "CONTINUE" or "DONE")
- JSON syntax errors

Please write VALID JSON this time."""
        
        return prompt
    
    async def _run_loop_exit_agent(self, iteration: int, critic_file: Path) -> Dict[str, Any]:
        """Run Loop Exit Agent with validation loop to guarantee valid JSON.
        
        This is the critical innovation - LEA tries up to 3 times to produce
        valid JSON, with error feedback on each retry.
        """
        max_attempts = get_max_attempts(3)
        
        for attempt in range(1, max_attempts + 1):
            logger.info(f"🎯 Running Loop Exit Agent (attempt {attempt}/{max_attempts})")
            
            # Create LEA prompt
            lea_prompt = self._create_lea_prompt(critic_file, iteration, attempt)
            
            # Create fresh LEA instance
            lea_agent = Agent(
                name=f"{self.name} Loop Exit Agent",  # e.g., "WCL Loop Exit Agent"
                system_prompt="You are a Loop Exit Agent that evaluates Writer-Critic loops and writes JSON decisions.",
                model=self.lea_model,
                cwd=self.cwd,
                max_turns=get_max_turns(5)  # Limited turns for focused task
            )
            
            try:
                # Run LEA
                result = await lea_agent.run(lea_prompt)
                
                # Determine expected decision file
                if attempt == 1:
                    decision_file = self.output_dir / f"phase{self.phase}_step{self.step}_iter{iteration}_decision.json"
                else:
                    decision_file = self.output_dir / f"phase{self.phase}_step{self.step}_iter{iteration}_decision_attempt{attempt}.json"
                
                # Validate the JSON file
                validation = self._validate_json_file(decision_file)
                
                if validation["valid"]:
                    logger.info(f"✅ LEA produced valid JSON on attempt {attempt}")
                    self.decision_files.append(decision_file)
                    return validation["data"]
                else:
                    logger.warning(f"⚠️ LEA validation failed on attempt {attempt}: {validation['errors']}")
                    # Continue to next attempt with error feedback
                    
            except Exception as e:
                logger.error(f"❌ LEA exception on attempt {attempt}: {e}")
                # Continue to next attempt
        
        # All attempts failed - fallback
        logger.error(f"❌ LEA failed after {max_attempts} attempts, using fallback")
        return {
            "decision": "CONTINUE",
            "compliance_score": 50,
            "reason": "Loop Exit Agent failed to produce valid JSON after multiple attempts"
        }
    
    def _validate_json_file(self, filepath: Path) -> Dict[str, Any]:
        """Validate that LEA's JSON file has required structure."""
        try:
            if not filepath.exists():
                return {"valid": False, "errors": ["File not created"]}
            
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Validate required fields
            errors = []
            
            if "decision" not in data:
                errors.append("Missing 'decision' field")
            elif data["decision"] not in ["CONTINUE", "DONE"]:
                errors.append(f"Invalid decision value: '{data['decision']}' (must be CONTINUE or DONE)")
            
            if "compliance_score" not in data:
                errors.append("Missing 'compliance_score' field")
            elif not isinstance(data["compliance_score"], (int, float)):
                errors.append("compliance_score must be a number")
            elif not 0 <= data["compliance_score"] <= 100:
                errors.append("compliance_score must be between 0 and 100")
            
            if "reason" not in data:
                errors.append("Missing 'reason' field")
            
            if errors:
                return {"valid": False, "errors": errors}
            
            return {"valid": True, "data": data}
            
        except json.JSONDecodeError as e:
            return {"valid": False, "errors": [f"Invalid JSON syntax: {e}"]}
        except Exception as e:
            return {"valid": False, "errors": [f"Error reading file: {e}"]}
    
    async def run(self) -> WCLResult:
        """Execute the Writer-Critic Loop with Loop Exit Agent."""
        history = []
        total_cost = 0.0
        
        for iteration in range(1, self.max_iterations + 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"🔄 WCL Iteration {iteration}/{self.max_iterations} (Phase {self.phase}, Step {self.step})")
            logger.info(f"{'='*60}")
            
            # Get previous feedback for Writer
            previous_feedback = ""
            if iteration > 1 and self.critic_files:
                try:
                    previous_feedback = self.critic_files[-1].read_text()
                except Exception as e:
                    logger.warning(f"Could not read previous critic file: {e}")
            
            # ================================================================
            # PHASE 1: WRITER AGENT
            # ================================================================
            
            logger.info("🖊️ Running Writer agent...")
            
            # Build writer prompt
            if callable(self.writer_user_prompt):
                base_prompt = self.writer_user_prompt(iteration, previous_feedback)
            else:
                base_prompt = self.writer_user_prompt
                if iteration > 1 and previous_feedback:
                    base_prompt += f"\n\n## Previous Critic Feedback\n{previous_feedback}"
            
            # Add WCL subprompt
            writer_prompt = base_prompt + self._create_writer_subprompt(iteration)
            
            # Create fresh Writer agent
            writer_agent = Agent(
                name=f"{self.name} Writer",  # e.g., "WCL Writer" or "Schema Designer Writer"
                system_prompt=self.writer_system_prompt,
                model=self.writer_model,
                mcp_tools=self.writer_tools,
                cwd=self.cwd,
                max_turns=get_max_turns(30)
            )
            
            try:
                writer_result = await writer_agent.run(writer_prompt)
                writer_cost = getattr(writer_result, 'cost', 0.0)
                total_cost += writer_cost
                
                # Track expected file
                writer_file = self.output_dir / f"phase{self.phase}_step{self.step}_iter{iteration}_writer.md"
                self.writer_files.append(writer_file)
                
                if not writer_file.exists():
                    error_msg = f"Writer did not create expected file: {writer_file}"
                    logger.error(f"❌ {error_msg}")
                    return WCLResult(
                        success=False,
                        iterations=iteration,
                        compliance_score=0,
                        total_cost=total_cost,
                        writer_files=self.writer_files,
                        critic_files=self.critic_files,
                        decision_files=self.decision_files,
                        history=history,
                        exit_reason="Writer failed to create output file",
                        error=error_msg
                    )
                
                logger.info(f"✅ Writer created: {writer_file.name}")
                
            except Exception as e:
                error_msg = f"Writer exception: {e}"
                logger.error(f"❌ {error_msg}")
                return WCLResult(
                    success=False,
                    iterations=iteration,
                    compliance_score=0,
                    total_cost=total_cost,
                    writer_files=self.writer_files,
                    critic_files=self.critic_files,
                    decision_files=self.decision_files,
                    history=history,
                    exit_reason=error_msg,
                    error=str(e)
                )
            
            # ================================================================
            # PHASE 2: CRITIC AGENT
            # ================================================================
            
            logger.info("🔍 Running Critic agent...")
            
            # Build critic prompt
            if callable(self.critic_user_prompt):
                base_prompt = self.critic_user_prompt(iteration)
            else:
                base_prompt = self.critic_user_prompt
            
            # Add WCL subprompt
            critic_prompt = base_prompt + self._create_critic_subprompt(iteration)
            
            # Create fresh Critic agent
            critic_agent = Agent(
                name=f"{self.name} Critic",  # e.g., "WCL Critic" or "Schema Designer Critic"
                system_prompt=self.critic_system_prompt,
                model=self.critic_model,
                mcp_tools=self.critic_tools,
                cwd=self.cwd,
                max_turns=get_max_turns(30)
            )
            
            try:
                critic_result = await critic_agent.run(critic_prompt)
                critic_cost = getattr(critic_result, 'cost', 0.0)
                total_cost += critic_cost
                
                # Track expected file
                critic_file = self.output_dir / f"phase{self.phase}_step{self.step}_iter{iteration}_critic.md"
                self.critic_files.append(critic_file)
                
                if not critic_file.exists():
                    logger.warning(f"⚠️ Critic did not create expected file: {critic_file}")
                    # Create a placeholder for LEA to read
                    critic_file.write_text("Critic evaluation was not properly saved. Issues may exist.")
                
                logger.info(f"✅ Critic created: {critic_file.name}")
                
            except Exception as e:
                logger.error(f"❌ Critic exception: {e}")
                critic_cost = 0.0
                # Create error file for LEA
                critic_file = self.output_dir / f"phase{self.phase}_step{self.step}_iter{iteration}_critic.md"
                critic_file.write_text(f"Critic failed with error: {e}")
                self.critic_files.append(critic_file)
            
            # ================================================================
            # PHASE 3: LOOP EXIT AGENT (with validation loop)
            # ================================================================
            
            logger.info("🎯 Running Loop Exit Agent...")
            
            decision_data = await self._run_loop_exit_agent(iteration, critic_file)
            lea_cost = 0.1  # Approximate cost for LEA attempts
            total_cost += lea_cost
            
            # Extract decision details
            decision = decision_data.get("decision", "CONTINUE")
            score = decision_data.get("compliance_score", 0)
            reason = decision_data.get("reason", "")
            
            # Record iteration in history
            history.append({
                "iteration": iteration,
                "writer_file": str(writer_file) if writer_file.exists() else None,
                "critic_file": str(critic_file) if critic_file.exists() else None,
                "decision_file": str(self.decision_files[-1]) if self.decision_files else None,
                "decision": decision,
                "compliance_score": score,
                "reason": reason,
                "writer_cost": writer_cost,
                "critic_cost": critic_cost,
                "lea_cost": lea_cost
            })
            
            logger.info(f"📊 LEA Decision: {decision}, Score: {score}%")
            logger.info(f"   Reason: {reason}")
            
            # Check exit condition
            if decision == "DONE" and score >= self.compliance_threshold:
                logger.info(f"✅ WCL COMPLETED successfully after {iteration} iterations!")
                return WCLResult(
                    success=True,
                    iterations=iteration,
                    compliance_score=score,
                    total_cost=total_cost,
                    writer_files=self.writer_files,
                    critic_files=self.critic_files,
                    decision_files=self.decision_files,
                    history=history,
                    exit_reason=f"Completed with score {score}: {reason}"
                )
            
            logger.info(f"🔁 Continuing to iteration {iteration + 1}...")
        
        # Max iterations reached
        final_score = history[-1]["compliance_score"] if history else 0
        logger.warning(f"⚠️ Max iterations ({self.max_iterations}) reached without completion")
        
        return WCLResult(
            success=False,
            iterations=self.max_iterations,
            compliance_score=final_score,
            total_cost=total_cost,
            writer_files=self.writer_files,
            critic_files=self.critic_files,
            decision_files=self.decision_files,
            history=history,
            exit_reason=f"Max iterations reached (final score: {final_score})",
            error="Failed to meet compliance threshold"
        )