"""Interaction Specification Critic agent class."""

import logging
from pathlib import Path
from typing import Optional, Dict, Any
from cc_agent import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .config import AGENT_CONFIG, EVALUATION_WEIGHTS


class CriticAgent(ContextAwareAgent):
    """Context-aware agent for evaluating interaction specifications."""
    
    def __init__(
        self, 
        spec_dir: Path | str, 
        logger: Optional[logging.Logger] = None,
        enable_context_awareness: bool = True
    ):
        """Initialize the context-aware critic agent.
        
        Args:
            spec_dir: Directory containing the specifications
            logger: Optional logger instance to use
            enable_context_awareness: Whether to enable context awareness features (default: True)
        """
        self.spec_dir = Path(spec_dir)
        
        # Initialize with ContextAwareAgent
        super().__init__(
            name=AGENT_CONFIG["name"],
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=AGENT_CONFIG["allowed_tools"],
            permission_mode=AGENT_CONFIG["permission_mode"],
            cwd=str(self.spec_dir),
            enable_context_awareness=enable_context_awareness
        )
        
        # Store logger if provided
        if logger:
            self.logger = logger
        else:
            self.logger = logging.getLogger(__name__)
            
        # Set max_turns after initialization
        self.max_turns = AGENT_CONFIG["max_turns"]
        
        # Store evaluation configuration
        self.compliance_threshold = AGENT_CONFIG["compliance_threshold"]
        self.evaluation_weights = EVALUATION_WEIGHTS
        
    async def evaluate_spec(
        self, 
        prd_content: str,
        interaction_spec: str,
        app_name: str,
        iteration: int = 1,
        **kwargs
    ) -> Dict[str, Any]:
        """Evaluate an interaction specification against PRD.
        
        Args:
            prd_content: The Business PRD content
            interaction_spec: The interaction specification to evaluate
            app_name: Name of the application
            iteration: Current iteration number
            **kwargs: Additional arguments
            
        Returns:
            Dictionary containing evaluation results and decision
        """
        self.logger.info(f"Starting interaction spec evaluation for {app_name} (iteration {iteration})")
        
        # Import user prompt creation function
        from .user_prompt import create_critic_prompt
        
        # Create evaluation prompt
        prompt = create_critic_prompt(
            prd_content=prd_content,
            interaction_spec=interaction_spec,
            app_name=app_name,
            iteration=iteration,
            compliance_threshold=self.compliance_threshold,
            writer_result=kwargs.get('writer_result')
        )
        
        # Run evaluation with context awareness
        # Remove writer_result from kwargs as it's already included in the prompt
        run_kwargs = {k: v for k, v in kwargs.items() if k != 'writer_result'}
        result = await self.run(prompt, **run_kwargs)
        
        # Parse and return structured result
        if result.success:
            try:
                import json
                # Extract JSON from the result
                content = result.content
                start = content.find('{')
                end = content.rfind('}') + 1
                
                if start != -1 and end > start:
                    evaluation_data = json.loads(content[start:end])
                    
                    # Calculate weighted overall score if not provided
                    if 'overall_quality_score' not in evaluation_data['evaluation']:
                        evaluation_data['evaluation']['overall_quality_score'] = self._calculate_overall_score(
                            evaluation_data['evaluation']
                        )
                    
                    return {
                        "success": True,
                        "evaluation": evaluation_data['evaluation'],
                        "decision": evaluation_data['decision'],
                        "reasoning": evaluation_data['reasoning'],
                        "priority_fixes": evaluation_data.get('priority_fixes', []),
                        "cost": result.cost,
                        "raw_content": result.content
                    }
            except (json.JSONDecodeError, KeyError) as e:
                self.logger.error(f"Failed to parse evaluation result: {e}")
                return {
                    "success": False,
                    "error": f"Failed to parse evaluation: {str(e)}",
                    "cost": result.cost,
                    "raw_content": result.content
                }
        else:
            return {
                "success": False,
                "error": result.content,
                "cost": result.cost
            }
    
    def _calculate_overall_score(self, evaluation: Dict[str, Any]) -> float:
        """Calculate weighted overall score from individual metrics.
        
        Args:
            evaluation: Dictionary containing individual scores
            
        Returns:
            Weighted overall score (0-100)
        """
        scores = {
            "prd_coverage": evaluation.get('prd_coverage_score', 0),
            "template_compliance": evaluation.get('template_compliance_score', 0),
            "detail_completeness": evaluation.get('detail_completeness_score', 0),
            "user_flow_coverage": evaluation.get('user_flow_coverage', {}).get('coverage_percentage', 0),
            "edge_case_handling": self._calculate_edge_case_score(evaluation.get('edge_case_coverage', {})),
            "mobile_responsiveness": self._calculate_mobile_score(evaluation.get('mobile_specification', {}))
        }
        
        # Calculate weighted average
        total_score = 0
        for metric, weight in self.evaluation_weights.items():
            total_score += scores.get(metric, 0) * weight
            
        return round(total_score, 2)
    
    def _calculate_edge_case_score(self, edge_cases: Dict[str, Any]) -> float:
        """Calculate edge case coverage score."""
        covered = sum(1 for v in edge_cases.values() if isinstance(v, bool) and v)
        total = sum(1 for v in edge_cases.values() if isinstance(v, bool))
        return (covered / total * 100) if total > 0 else 0
    
    def _calculate_mobile_score(self, mobile_spec: Dict[str, Any]) -> float:
        """Calculate mobile specification score."""
        if mobile_spec.get('responsive_behaviors') and mobile_spec.get('touch_interactions'):
            return 100
        elif mobile_spec.get('responsive_behaviors') or mobile_spec.get('touch_interactions'):
            return 50
        else:
            return 0