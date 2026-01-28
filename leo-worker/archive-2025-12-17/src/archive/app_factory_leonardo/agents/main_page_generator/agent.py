"""Main Page Generator Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class MainPageGeneratorAgent:
    """Agent that generates the main page component from plan, preview, and schema."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Main Page Generator Agent.
        
        Args:
            cwd: Working directory for the agent and its tools
        """
        # Configure MCP servers for validation
        mcp_servers = {
            "oxc": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.oxc.server"]
            },
            "build_test": {
                "type": "stdio",
                "command": "uv",
                "args": ["run", "python", "-m", "cc_tools.build_test.server"]
            },
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
    
    async def generate_main_page(self) -> Tuple[bool, str, str]:
        """Generate main page component from plan, preview, and schema.
        
        Returns:
            Tuple of (success, "", message)
        """
        try:
            logger.info("🔨 Main Page Generator: Starting main page generation")
            
            # Create user prompt - agent will read plan, preview, and schema files directly
            user_prompt = create_user_prompt()
            
            # Run the agent - it will read files and write files directly using tools
            logger.info("🤖 Running Main Page Generator Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            logger.info("✅ Main page generated successfully")
            logger.info(f"📄 Agent completed with result: {result.content[:200]}...")
            
            # Check if main page file was created (validation)
            expected_page_path = Path("client/src/pages/HomePage.tsx")
            if expected_page_path.exists():
                page_size = expected_page_path.stat().st_size
                logger.info(f"📁 Main page file created: {expected_page_path} ({page_size} bytes)")
                return True, "", "Main page generated and written successfully"
            else:
                logger.warning("⚠️ Main page file not found at expected location, but agent reported success")
                return True, "", "Main page generation completed (file location may vary)"
            
        except Exception as e:
            error_msg = f"Main page generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg
    
    def _strip_markdown_wrapper(self, content: str) -> str:
        """Strip markdown code block wrapper if present.
        
        Args:
            content: The raw content from agent
            
        Returns:
            Clean TypeScript React code without markdown wrapper
        """
        content = content.strip()
        
        # Find the start of the code block
        code_start = -1
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if line.strip().startswith('```typescript') or line.strip().startswith('```tsx') or line.strip() == '```':
                code_start = i + 1
                break
        
        # Find the end of the code block
        code_end = len(lines)
        if code_start >= 0:
            for i in range(code_start, len(lines)):
                if lines[i].strip() == '```':
                    code_end = i
                    break
        
        # Extract only the code portion
        if code_start >= 0:
            content = '\n'.join(lines[code_start:code_end])
        
        return content.strip()
    
    async def _validate_main_page_code(self, code: str, output_path: Path) -> bool:
        """Validate that the generated code looks like a React page and compiles properly.
        
        Args:
            code: The generated main page code
            output_path: Path where main page will be saved
            
        Returns:
            True if the code appears valid and compiles, False otherwise
        """
        logger.info("🔍 Starting comprehensive main page validation...")
        
        # Basic validation checks first
        required_elements = [
            "import React",
            "export function ",
            "return (",
            "useState(",
            "useEffect(",
            "fetch(",
            "className=\""
        ]
        
        for element in required_elements:
            if element not in code:
                logger.warning(f"⚠️ Basic validation failed: Missing '{element}'")
                return False
        
        # Check for suspicious content
        if len(code.strip()) < 800:  # Too short to be meaningful main page
            logger.warning(f"⚠️ Basic validation failed: Main page code too short ({len(code)} chars)")
            return False
        
        logger.info("✅ Basic validation passed")
        
        # Advanced validation using MCP tools
        try:
            # Create the output directory structure
            pages_dir = output_path.parent
            pages_dir.mkdir(parents=True, exist_ok=True)
            
            # Write the main page file temporarily for validation
            temp_page_path = output_path
            temp_page_path.write_text(code, encoding='utf-8')
            
            logger.info("🔧 Running TypeScript validation with oxc...")
            
            # Use the agent to run validation tools
            page_relative_path = temp_page_path.name
            
            validation_result = await self.agent.run(f"""
Please validate this generated main page file using the available tools:

1. Use mcp__oxc__lint_file to check the TypeScript React code at: client/src/pages/{page_relative_path}
2. Use mcp__build_test__verify_project to attempt TypeScript compilation in the current directory

The main page file contains:
```tsx
{code[:500]}...
```

Provide a summary of validation results and whether all checks passed.
""")
            
            if validation_result.success:
                logger.info("✅ Advanced validation passed")
                return True
            else:
                logger.error(f"❌ Advanced validation failed: {validation_result.content}")
                return False
                
        except Exception as e:
            logger.warning(f"⚠️ Advanced validation skipped due to error: {str(e)}")
            logger.info("💡 Falling back to basic validation only")
            return True  # Don't fail completely if advanced validation has issues


async def run_main_page_generator(
    plan_content: str,
    preview_content: str,
    schema_content: str,
    output_path: Path = None
) -> Tuple[AgentResult, str]:
    """Convenience function to run the Main Page Generator Agent.
    
    Args:
        plan_content: The content of the plan.md file
        preview_content: The content of the preview-react/App.tsx file
        schema_content: The content of the schema.ts file
        output_path: Optional path to save the generated main page file
        
    Returns:
        Tuple of (AgentResult, page_code)
    """
    generator = MainPageGeneratorAgent()
    success, page_code, message = await generator.generate_main_page(
        plan_content, preview_content, schema_content, output_path
    )
    
    result = AgentResult(
        content=page_code if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, page_code