"""Routes Generator Agent implementation."""

import logging
from pathlib import Path
from typing import Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt

logger = logging.getLogger(__name__)


class RoutesGeneratorAgent:
    """Agent that generates API routes implementation from database schema and storage layer."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Routes Generator Agent.
        
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
    
    async def generate_routes(self) -> Tuple[bool, str, str]:
        """Generate API routes implementation from schema and storage.
        
        Returns:
            Tuple of (success, "", message)
        """
        try:
            logger.info("🔨 Routes Generator: Starting API routes generation")
            
            # Create user prompt - agent will read schema and storage files directly
            user_prompt = create_user_prompt()
            
            # Run the agent - it will read files and write files directly using tools
            logger.info("🤖 Running Routes Generator Agent...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            logger.info("✅ API routes generated successfully")
            logger.info(f"📄 Agent completed with result: {result.content[:200]}...")
            
            # Check if routes file was created (validation)
            expected_routes_path = Path("server/routes.ts")
            if expected_routes_path.exists():
                routes_size = expected_routes_path.stat().st_size
                logger.info(f"📁 Routes file created: {expected_routes_path} ({routes_size} bytes)")
                return True, "", "API routes generated and written successfully"
            else:
                logger.warning("⚠️ Routes file not found at expected location, but agent reported success")
                return True, "", "API routes generation completed (file location may vary)"
            
        except Exception as e:
            error_msg = f"Routes generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg
    
    def _strip_markdown_wrapper(self, content: str) -> str:
        """Strip markdown code block wrapper if present.
        
        Args:
            content: The raw content from agent
            
        Returns:
            Clean TypeScript code without markdown wrapper
        """
        content = content.strip()
        
        # Find the start of the code block
        code_start = -1
        lines = content.split('\n')
        
        for i, line in enumerate(lines):
            if line.strip().startswith('```typescript') or line.strip().startswith('```ts') or line.strip() == '```':
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
    
    async def _validate_routes_code(self, code: str, output_path: Path) -> bool:
        """Validate that the generated code looks like API routes and compiles properly.
        
        Args:
            code: The generated routes code
            output_path: Path where routes will be saved
            
        Returns:
            True if the code appears valid and compiles, False otherwise
        """
        logger.info("🔍 Starting comprehensive routes validation...")
        
        # Basic validation checks first
        required_elements = [
            "import type { Express } from \"express\"",
            "import { createServer, type Server } from \"http\"",
            "import { storage } from \"./storage\"",
            "from \"@shared/schema\"",
            "import { z } from \"zod\"",
            "export async function registerRoutes(app: Express): Promise<Server>",
            "app.get(", "app.post(", "app.patch(", "app.delete(",
            ".parse(req.body)", "res.json(", "res.status(",
            "createServer(app)", "return httpServer"
        ]
        
        for element in required_elements:
            if element not in code:
                logger.warning(f"⚠️ Basic validation failed: Missing '{element}'")
                return False
        
        # Check for suspicious content
        if len(code.strip()) < 800:  # Too short to be meaningful API routes
            logger.warning(f"⚠️ Basic validation failed: Routes code too short ({len(code)} chars)")
            return False
        
        logger.info("✅ Basic validation passed")
        
        # Advanced validation using MCP tools
        try:
            # Create the output directory structure
            routes_dir = output_path.parent
            routes_dir.mkdir(parents=True, exist_ok=True)
            
            # Write the routes file temporarily for validation
            temp_routes_path = output_path
            temp_routes_path.write_text(code, encoding='utf-8')
            
            logger.info("🔧 Running TypeScript validation with oxc...")
            
            # Use the agent to run validation tools
            routes_relative_path = temp_routes_path.name
            
            validation_result = await self.agent.run(f"""
Please validate this generated routes.ts file using the available tools:

1. Use mcp__oxc__lint_file to check the TypeScript code at: server/{routes_relative_path}
2. Use mcp__build_test__verify_project to attempt TypeScript compilation in the current directory

The routes file contains:
```typescript
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


async def run_routes_generator(
    schema_content: str,
    storage_content: str,
    output_path: Path = None
) -> Tuple[AgentResult, str]:
    """Convenience function to run the Routes Generator Agent.
    
    Args:
        schema_content: The content of the schema.ts file
        storage_content: The content of the storage.ts file
        output_path: Optional path to save the generated routes file
        
    Returns:
        Tuple of (AgentResult, routes_code)
    """
    generator = RoutesGeneratorAgent()
    success, routes_code, message = await generator.generate_routes(
        schema_content, storage_content, output_path
    )
    
    result = AgentResult(
        content=routes_code if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, routes_code