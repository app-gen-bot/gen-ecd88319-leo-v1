"""Component Analyzer Agent implementation."""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class ComponentAnalyzerAgent:
    """Agent that analyzes preview wireframe to identify reusable React components."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Component Analyzer Agent.
        
        Args:
            cwd: Working directory for the agent and its tools
        """
        # Configure MCP servers for analysis
        mcp_servers = {
            "tree_sitter": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "mcp-tree-sitter"]
            }
        }
        
        self.agent = Agent(
            system_prompt=SYSTEM_PROMPT,
            mcp_servers=mcp_servers,
            cwd=cwd,
            **AGENT_CONFIG
        )
        self.verbose = True  # Enable verbose logging for debugging
    
    async def analyze_components(
        self, 
        preview_content: str,
        output_path: Path = None
    ) -> Tuple[bool, Dict[str, Any], str]:
        """Analyze preview wireframe to identify reusable components.
        
        Args:
            preview_content: The content of the preview-react/App.tsx file
            output_path: Optional path to save the analysis JSON
            
        Returns:
            Tuple of (success, analysis_data, message)
        """
        try:
            logger.info("🔨 Component Analyzer: Starting component analysis")
            logger.info(f"🎨 Preview content: {len(preview_content)} characters")
            
            # Create user prompt from preview content
            user_prompt = create_user_prompt(preview_content)
            
            # Run the agent
            logger.info("🤖 Running Component Analyzer Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, {}, error_msg
            
            # Extract the analysis JSON from the result
            analysis_json = result.content.strip()
            logger.info(f"📄 Raw agent result: {len(analysis_json)} characters")
            if self.verbose:
                logger.info(f"📄 Raw content preview: {analysis_json[:500]}...")
            
            # Strip markdown code blocks if present
            analysis_json = self._strip_markdown_wrapper(analysis_json)
            logger.info(f"📄 Processed analysis JSON: {len(analysis_json)} characters")
            if self.verbose:
                logger.info(f"📄 Processed content preview: {analysis_json[:500]}...")
            
            # Parse and validate the JSON
            try:
                analysis_data = json.loads(analysis_json)
                logger.info("✅ JSON parsing successful")
            except json.JSONDecodeError as e:
                error_msg = f"Invalid JSON format: {str(e)}"
                logger.error(f"❌ {error_msg}")
                return False, {}, error_msg
            
            # Validate the analysis structure
            if not self._validate_analysis_structure(analysis_data):
                error_msg = "Analysis JSON does not have the expected structure"
                logger.error(f"❌ {error_msg}")
                return False, {}, error_msg
            
            # Save to file if output path provided
            if output_path:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(json.dumps(analysis_data, indent=2), encoding='utf-8')
                logger.info(f"💾 Analysis saved to: {output_path}")
            
            component_count = len(analysis_data.get('components', []))
            logger.info("✅ Component analysis completed successfully")
            logger.info(f"📦 Identified {component_count} components")
            
            return True, analysis_data, f"Component analysis completed: {component_count} components identified"
            
        except Exception as e:
            error_msg = f"Component analysis failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, {}, error_msg
    
    def _strip_markdown_wrapper(self, content: str) -> str:
        """Strip markdown code block wrapper if present.
        
        Args:
            content: The raw content from agent
            
        Returns:
            Clean JSON without markdown wrapper
        """
        content = content.strip()
        
        # Find the start of the code block
        code_start = -1
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if line.strip().startswith('```json') or line.strip() == '```':
                code_start = i + 1
                break
        
        # Find the end of the code block
        code_end = len(lines)
        if code_start >= 0:
            for i in range(code_start, len(lines)):
                if lines[i].strip() == '```':
                    code_end = i
                    break
        
        # Extract only the JSON portion
        if code_start >= 0:
            content = '\n'.join(lines[code_start:code_end])
        
        return content.strip()
    
    def _validate_analysis_structure(self, data: Dict[str, Any]) -> bool:
        """Validate that the analysis JSON has the expected structure.
        
        Args:
            data: The parsed analysis data
            
        Returns:
            True if structure is valid, False otherwise
        """
        logger.info("🔍 Validating analysis structure...")
        
        # Check top-level structure
        if not isinstance(data, dict):
            logger.warning("⚠️ Analysis data is not a dictionary")
            return False
        
        if 'components' not in data:
            logger.warning("⚠️ Missing 'components' key in analysis")
            return False
        
        if 'summary' not in data:
            logger.warning("⚠️ Missing 'summary' key in analysis")
            return False
        
        # Check components structure
        components = data['components']
        if not isinstance(components, list):
            logger.warning("⚠️ 'components' is not a list")
            return False
        
        for i, component in enumerate(components):
            if not isinstance(component, dict):
                logger.warning(f"⚠️ Component {i} is not a dictionary")
                return False
            
            required_fields = ['name', 'description', 'category', 'props']
            for field in required_fields:
                if field not in component:
                    logger.warning(f"⚠️ Component {i} missing required field: {field}")
                    return False
        
        # Check summary structure
        summary = data['summary']
        if not isinstance(summary, dict):
            logger.warning("⚠️ 'summary' is not a dictionary")
            return False
        
        summary_fields = ['totalComponents', 'categories', 'reasoning']
        for field in summary_fields:
            if field not in summary:
                logger.warning(f"⚠️ Summary missing field: {field}")
                return False
        
        logger.info("✅ Analysis structure validation passed")
        return True


async def run_component_analyzer(
    preview_content: str,
    output_path: Path = None
) -> Tuple[AgentResult, Dict[str, Any]]:
    """Convenience function to run the Component Analyzer Agent.
    
    Args:
        preview_content: The content of the preview-react/App.tsx file
        output_path: Optional path to save the analysis JSON
        
    Returns:
        Tuple of (AgentResult, analysis_data)
    """
    analyzer = ComponentAnalyzerAgent()
    success, analysis_data, message = await analyzer.analyze_components(
        preview_content, output_path
    )
    
    result = AgentResult(
        content=json.dumps(analysis_data) if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, analysis_data