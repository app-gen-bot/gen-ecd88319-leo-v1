"""Preview Generator Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class PreviewGeneratorAgent:
    """Agent that generates React components from application plans."""
    
    def __init__(self):
        """Initialize the Preview Generator Agent."""
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            **AGENT_CONFIG
        )
    
    async def generate_react_component(
        self, 
        plan_content: str, 
        output_path: Path = None
    ) -> Tuple[bool, str, str]:
        """Generate a React component from plan content.
        
        Args:
            plan_content: The content of the plan.md file
            output_path: Optional path to save the generated component
            
        Returns:
            Tuple of (success, component_code, message)
        """
        try:
            logger.info("🎨 Preview Generator: Starting React component generation")
            logger.info(f"📝 Plan content: {len(plan_content)} characters")
            
            # Create user prompt from plan content
            user_prompt = create_user_prompt(plan_content)
            
            # Run the agent
            logger.info("🤖 Running Preview Generator Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            # Extract the React component code from the result
            component_code = result.content.strip()
            
            # Strip markdown code blocks if present
            component_code = self._strip_markdown_wrapper(component_code)
            
            # Basic validation - ensure it looks like a React component
            if not self._validate_component_code(component_code):
                error_msg = "Generated code does not appear to be a valid React component"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            # Save to file if output path provided
            if output_path:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(component_code, encoding='utf-8')
                logger.info(f"💾 Component saved to: {output_path}")
            
            logger.info("✅ React component generated successfully")
            logger.info(f"📏 Generated code: {len(component_code)} characters")
            
            return True, component_code, "React component generated successfully"
            
        except Exception as e:
            error_msg = f"Preview generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg
    
    def _strip_markdown_wrapper(self, content: str) -> str:
        """Strip markdown code block wrapper if present.
        
        Args:
            content: The raw content from agent
            
        Returns:
            Clean TSX code without markdown wrapper
        """
        content = content.strip()
        
        # Check if wrapped in markdown code blocks
        if content.startswith('```tsx') or content.startswith('```ts') or content.startswith('```javascript') or content.startswith('```js'):
            lines = content.split('\n')
            # Remove first line (```tsx)
            lines = lines[1:]
            # Remove last line if it's closing ```
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            content = '\n'.join(lines)
        elif content.startswith('```'):
            lines = content.split('\n')
            # Remove first line (```)
            lines = lines[1:]
            # Remove last line if it's closing ```
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            content = '\n'.join(lines)
        
        return content.strip()
    
    def _validate_component_code(self, code: str) -> bool:
        """Validate that the generated code looks like a React component.
        
        Args:
            code: The generated component code
            
        Returns:
            True if the code appears valid, False otherwise
        """
        # Basic validation checks
        required_elements = [
            "import React",
            "export default function",
            "AppPreview",
            "return (",
            "@/components/ui/"
        ]
        
        for element in required_elements:
            if element not in code:
                logger.warning(f"⚠️ Validation failed: Missing '{element}'")
                return False
        
        # Check for suspicious content
        if len(code.strip()) < 500:  # Too short to be a meaningful component
            logger.warning(f"⚠️ Validation failed: Component too short ({len(code)} chars)")
            return False
        
        return True


async def run_preview_generator(
    plan_content: str, 
    output_path: Path = None
) -> Tuple[AgentResult, str]:
    """Convenience function to run the Preview Generator Agent.
    
    Args:
        plan_content: The content of the plan.md file
        output_path: Optional path to save the generated component
        
    Returns:
        Tuple of (AgentResult, component_code)
    """
    generator = PreviewGeneratorAgent()
    success, component_code, message = await generator.generate_react_component(
        plan_content, output_path
    )
    
    result = AgentResult(
        content=component_code if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, component_code