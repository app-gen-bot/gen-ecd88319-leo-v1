"""Interaction Specification Agent - Generates detailed interaction specs from PRDs.

This agent uses context awareness to maintain consistency across specifications
and learn from previous successful patterns.
"""

import logging
from typing import Optional, Any
from pathlib import Path
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt
from .config import (
    INTERACTION_SPEC_NAME,
    INTERACTION_SPEC_DESCRIPTION,
    INTERACTION_SPEC_MAX_TURNS,
    INTERACTION_SPEC_PERMISSION_MODE,
    INTERACTION_SPEC_ALLOWED_TOOLS,
    MEMORY_NAMESPACE,
    MEMORY_TAGS,
    REQUIRED_SECTIONS,
    SPEC_MIN_SECTIONS
)

logger = logging.getLogger(__name__)


class InteractionSpecAgent(ContextAwareAgent):
    """Context-aware agent for generating frontend interaction specifications."""
    
    def __init__(self):
        """Initialize the interaction specification agent."""
        super().__init__(
            name=INTERACTION_SPEC_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=INTERACTION_SPEC_ALLOWED_TOOLS,
            permission_mode=INTERACTION_SPEC_PERMISSION_MODE,
            enable_context_awareness=True
        )
        
        # Store additional metadata
        self.description = INTERACTION_SPEC_DESCRIPTION
        self.max_turns = INTERACTION_SPEC_MAX_TURNS
        self.memory_namespace = MEMORY_NAMESPACE
        self.memory_tags = MEMORY_TAGS
        
    async def generate_interaction_spec(self, prd_content: str, output_file_path: Optional[str] = None, **kwargs) -> dict[str, Any]:
        """Generate a Frontend Interaction Specification from a PRD.
        
        Args:
            prd_content: The Business PRD content to transform
            output_file_path: Optional file path to write the spec to
            **kwargs: Additional options for the agent
            
        Returns:
            Dictionary containing:
                - success: Whether spec was generated successfully
                - spec_content: The generated interaction specification
                - sections_count: Number of major sections in the spec
                - coverage_score: Estimated coverage of PRD features (0-100)
                - cost: Total cost of generation
                - validation_passed: Whether spec passed validation checks
        """
        logger.info(f"Starting interaction spec generation from PRD ({len(prd_content)} chars)")
        
        # Extract key features from PRD for validation
        prd_features = self._extract_prd_features(prd_content)
        logger.info(f"Identified {len(prd_features)} key features in PRD")
        
        # Create the prompt
        prompt = create_user_prompt(prd_content)
        
        # Add critic feedback if this is an iterative improvement
        if 'critic_feedback' in kwargs and kwargs['critic_feedback']:
            critic_eval = kwargs['critic_feedback'].get('evaluation', {})
            priority_fixes = kwargs['critic_feedback'].get('priority_fixes', [])
            
            critic_section = "\n\n## Previous Evaluation Feedback\n"
            critic_section += "The critic has evaluated your previous specification and identified issues that need addressing:\n\n"
            
            if critic_eval.get('missing_features'):
                critic_section += "**Missing Features:**\n"
                for feature in critic_eval['missing_features']:
                    critic_section += f"- {feature}\n"
                critic_section += "\n"
                
            if critic_eval.get('unclear_interactions'):
                critic_section += "**Unclear Interactions:**\n"
                for interaction in critic_eval['unclear_interactions']:
                    critic_section += f"- {interaction}\n"
                critic_section += "\n"
                
            if priority_fixes:
                critic_section += "**Priority Fixes Required:**\n"
                for fix in priority_fixes:
                    critic_section += f"- {fix}\n"
                critic_section += "\n"
                
            critic_section += "Please address ALL the issues above while maintaining the existing good parts of the specification.\n"
            prompt = prompt + critic_section
        
        # Add context information to the prompt
        context_info = f"\n\n## Context Information\n- PRD Features Identified: {len(prd_features)}\n- Memory Namespace: {self.memory_namespace}\n- Tags: {', '.join(self.memory_tags)}\n"
        prompt = prompt + context_info
        
        # Extract critic_feedback from kwargs as it's not part of base agent parameters
        cleaned_kwargs = {k: v for k, v in kwargs.items() if k != 'critic_feedback'}
        
        # Run the agent with context awareness
        result = await self.run(prompt, **cleaned_kwargs)
        
        if result.success:
            # Validate the generated spec
            validation_results = self._validate_spec(result.content, prd_features)
            
            # Calculate coverage score
            coverage_score = validation_results.get("coverage_score", 0)
            
            # Count sections
            sections_count = validation_results.get("sections_count", 0)
            
            # Write to file if path provided
            if output_file_path:
                try:
                    file_path = Path(output_file_path)
                    file_path.parent.mkdir(parents=True, exist_ok=True)
                    file_path.write_text(result.content)
                    logger.info(f"✅ Wrote interaction spec to: {file_path}")
                except Exception as e:
                    logger.error(f"Failed to write spec to file: {e}")
                    # Continue anyway - file writing is not critical
            
            return {
                "success": True,
                "spec_content": result.content,
                "sections_count": sections_count,
                "coverage_score": coverage_score,
                "cost": result.cost,
                "validation_passed": validation_results["passed"],
                "validation_details": validation_results,
                "output_file": output_file_path if output_file_path else None
            }
        else:
            error_msg = result.metadata.get("error", "Unknown error")
            logger.error(f"Failed to generate interaction spec: {error_msg}")
            
            return {
                "success": False,
                "spec_content": None,
                "sections_count": 0,
                "coverage_score": 0,
                "cost": result.cost,
                "validation_passed": False,
                "error": error_msg
            }
    
    def _extract_prd_features(self, prd_content: str) -> list[str]:
        """Extract key features from PRD for validation.
        
        Args:
            prd_content: The PRD content
            
        Returns:
            List of identified features
        """
        features = []
        
        # Look for feature lists in common PRD sections
        lines = prd_content.split('\n')
        in_features_section = False
        
        for line in lines:
            line = line.strip()
            
            # Detect feature sections
            if any(keyword in line.lower() for keyword in ['features', 'functionality', 'requirements', 'must have']):
                in_features_section = True
                continue
            
            # End of features section
            if in_features_section and line.startswith('#') and not any(
                keyword in line.lower() for keyword in ['features', 'functionality', 'requirements']
            ):
                in_features_section = False
            
            # Extract feature items
            if in_features_section and (line.startswith('-') or line.startswith('*') or line.startswith('•')):
                feature = line.lstrip('-*• ').strip()
                if feature and len(feature) > 5:  # Skip very short items
                    features.append(feature)
        
        # Also look for user stories
        for line in lines:
            if 'as a' in line.lower() and 'i want' in line.lower():
                features.append(line.strip())
        
        return features
    
    def _validate_spec(self, spec_content: str, prd_features: list[str]) -> dict[str, Any]:
        """Validate the generated interaction specification.
        
        Args:
            spec_content: The generated spec content
            prd_features: List of features from the PRD
            
        Returns:
            Dictionary with validation results
        """
        validation_results = {
            "passed": True,
            "missing_sections": [],
            "covered_features": [],
            "missing_features": [],
            "sections_count": 0,
            "coverage_score": 0
        }
        
        # Check required sections
        for section in REQUIRED_SECTIONS:
            if section.lower() not in spec_content.lower():
                validation_results["missing_sections"].append(section)
                validation_results["passed"] = False
        
        # Count major sections (lines starting with ##)
        sections = [line for line in spec_content.split('\n') if line.strip().startswith('## ')]
        validation_results["sections_count"] = len(sections)
        
        if len(sections) < SPEC_MIN_SECTIONS:
            validation_results["passed"] = False
        
        # Check feature coverage
        spec_lower = spec_content.lower()
        for feature in prd_features:
            # Simple keyword matching - could be improved with NLP
            feature_keywords = feature.lower().split()
            if any(keyword in spec_lower for keyword in feature_keywords if len(keyword) > 4):
                validation_results["covered_features"].append(feature)
            else:
                validation_results["missing_features"].append(feature)
        
        # Calculate coverage score
        if prd_features:
            validation_results["coverage_score"] = (
                len(validation_results["covered_features"]) / len(prd_features) * 100
            )
        
        # Log validation results
        logger.info(f"Spec validation: {len(validation_results['covered_features'])} of {len(prd_features)} features covered")
        if validation_results["missing_sections"]:
            logger.warning(f"Missing sections: {validation_results['missing_sections']}")
        
        return validation_results


# Create singleton instance
interaction_spec_agent = InteractionSpecAgent()