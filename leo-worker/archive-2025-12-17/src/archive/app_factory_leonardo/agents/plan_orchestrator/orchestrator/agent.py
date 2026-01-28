"""Plan Orchestrator Agent - Generates simple application plans.

This agent understands user application requests and generates simple, 
focused plan documents following Replit's three-step approach.
"""

import logging
from typing import Optional, Any
from cc_agent import Agent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt
from .config import (
    ORCHESTRATOR_NAME,
    ORCHESTRATOR_DESCRIPTION,
    ORCHESTRATOR_MAX_TURNS,
    ORCHESTRATOR_PERMISSION_MODE,
    ORCHESTRATOR_ALLOWED_TOOLS,
    ENABLE_RESEARCH
)

logger = logging.getLogger(__name__)


class OrchestratorAgent(Agent):
    """Plan orchestrator agent for simple plan generation."""
    
    def __init__(self):
        """Initialize the plan orchestrator agent."""
        super().__init__(
            name=ORCHESTRATOR_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=ORCHESTRATOR_ALLOWED_TOOLS,
            permission_mode=ORCHESTRATOR_PERMISSION_MODE,
            max_turns=ORCHESTRATOR_MAX_TURNS
        )
        
        # Store additional metadata
        self.description = ORCHESTRATOR_DESCRIPTION
        self.max_turns = ORCHESTRATOR_MAX_TURNS
        
    async def generate_plan(self, user_prompt: str, skip_questions: bool = False, enable_research: bool = False, **kwargs) -> dict[str, Any]:
        """Generate a simple application plan.
        
        Args:
            user_prompt: Initial user request
            skip_questions: If True, generate plan without asking questions
            enable_research: If True, research similar apps before generating plan (future enhancement)
            **kwargs: Additional options
            
        Returns:
            Dictionary containing:
                - success: Whether plan was generated successfully
                - plan_content: The generated plan content
                - app_name: Extracted application name
                - conversation_turns: Number of conversation turns
                - cost: Total cost of generation
        """
        logger.info(f"Starting plan generation for: {user_prompt[:100]}...")
        if skip_questions:
            logger.info("Skip questions mode: Will generate plan directly without conversation")
        
        # TODO: Add research phase for complex apps
        if enable_research or ENABLE_RESEARCH:
            logger.info("Research mode enabled - this will be implemented for complex apps")
            # Future enhancement: Research similar apps, analyze patterns, gather best practices
            pass
        
        # Create the initial prompt
        initial_prompt = create_user_prompt(user_prompt, skip_questions=skip_questions)
        
        # Run the agent
        result = await self.run(initial_prompt, **kwargs)
        
        if result.success:
            plan_content = result.content
            
            # If content is empty, check if the agent used Write tool
            if not plan_content and result.tool_uses:
                for tool_use in result.tool_uses:
                    if tool_use.get("name") == "Write" and tool_use.get("input", {}).get("content"):
                        # Extract content from Write tool
                        plan_content = tool_use["input"]["content"]
                        logger.info("Extracted plan content from Write tool usage")
                        break
            
            # Extract app name from the plan (simple heuristic - can be improved)
            app_name = self._extract_app_name(plan_content, user_prompt)
            
            # Get conversation turns from metadata if available
            conversation_turns = result.metadata.get("turns", 1)
            
            return {
                "success": True,
                "plan_content": plan_content,
                "app_name": app_name,
                "conversation_turns": conversation_turns,
                "cost": result.cost
            }
        else:
            error_msg = result.metadata.get("error", "Unknown error")
            logger.error(f"Failed to generate plan: {error_msg}")
            
            return {
                "success": False,
                "plan_content": None,
                "app_name": None,
                "conversation_turns": result.metadata.get("turns", 0),
                "cost": result.cost,
                "error": error_msg
            }
    
    def _extract_app_name(self, plan_content: str, user_prompt: str) -> str:
        """Extract application name from plan content.
        
        Args:
            plan_content: Generated plan content
            user_prompt: Original user prompt
            
        Returns:
            Extracted application name
        """
        # First try to extract from plan title
        lines = plan_content.split('\n')
        for line in lines:
            if line.startswith('# Plan: '):
                # Extract name from title
                title = line.strip('# Plan: ').strip()
                # Convert to slug format
                app_name = title.lower().replace(' ', '-').replace('_', '-')
                # Remove non-alphanumeric characters except hyphens
                app_name = ''.join(c for c in app_name if c.isalnum() or c == '-')
                # Remove multiple consecutive hyphens
                app_name = '-'.join(part for part in app_name.split('-') if part)
                if app_name:
                    return app_name[:50]  # Limit length
        
        # Try to extract from user prompt - look for specific company/product names
        prompt_lower = user_prompt.lower()
        # Check for specific company/product names
        for name in ['planetscale', 'pawsflow', 'shopify', 'stripe', 'notion', 'figma', 'vercel']:
            if name in prompt_lower:
                # Check if it's a website/platform
                if any(word in prompt_lower for word in ['website', 'platform', 'site', 'app', 'application']):
                    return f"{name}-website"
                return name
        
        # Check for clone patterns
        if 'clone' in prompt_lower:
            for word in ['slack', 'twitter', 'facebook', 'instagram', 'airbnb', 'uber', 'spotify', 'netflix']:
                if word in prompt_lower:
                    return f"{word}-clone"
        
        # Check for specific app types
        app_types = {
            'e-commerce': ['ecommerce', 'e-commerce', 'shop', 'store', 'marketplace'],
            'social-media': ['social media', 'social network', 'social platform'],
            'crm': ['crm', 'customer relationship'],
            'cms': ['cms', 'content management'],
            'blog': ['blog', 'blogging'],
            'dashboard': ['dashboard', 'analytics', 'metrics'],
            'chat': ['chat', 'messaging', 'messenger'],
            'todo': ['todo', 'task', 'to-do'],
            'notes': ['notes', 'note-taking', 'notebook']
        }
        
        for app_type, keywords in app_types.items():
            if any(keyword in prompt_lower for keyword in keywords):
                return app_type
        
        # Default fallback
        return "custom-app"


# Create singleton instance
orchestrator_agent = OrchestratorAgent()