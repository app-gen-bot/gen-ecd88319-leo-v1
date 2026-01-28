"""Component Generator Agent implementation."""

import json
import logging
from pathlib import Path
from typing import Dict, List, Any, Tuple

from cc_agent import Agent, AgentResult

from .config import AGENT_CONFIG
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt, create_batch_user_prompt

logger = logging.getLogger(__name__)


class ComponentGeneratorAgent:
    """Agent that generates individual React components based on component analysis."""
    
    def __init__(self, cwd: str = None):
        """Initialize the Component Generator Agent.
        
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
    
    async def generate_component(
        self, 
        component_name: str,
        analysis_data: Dict[str, Any],
        preview_content: str,
        schema_content: str,
        output_path: Path = None
    ) -> Tuple[bool, str, str]:
        """Generate a single React component based on analysis.
        
        Args:
            component_name: Name of the component to generate
            analysis_data: Component analysis data from analyzer agent
            preview_content: The content of the preview-react/App.tsx file
            schema_content: The content of the schema.ts file
            output_path: Optional path to save the generated component
            
        Returns:
            Tuple of (success, component_code, message)
        """
        try:
            logger.info(f"🔨 Component Generator: Starting {component_name} generation")
            logger.info(f"📦 Analysis data: {len(analysis_data.get('components', []))} components")
            logger.info(f"🎨 Preview content: {len(preview_content)} characters")
            logger.info(f"📋 Schema content: {len(schema_content)} characters")
            
            # Create user prompt for specific component
            user_prompt = create_user_prompt(
                component_name, analysis_data, preview_content, schema_content
            )
            
            # Run the agent
            logger.info(f"🤖 Running Component Generator Agent for {component_name}...")
            result = await self.agent.run(user_prompt)
            
            if not result.success:
                error_msg = f"Agent failed: {result.content}"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            # Extract the component code from the result
            component_code = result.content.strip()
            logger.info(f"📄 Raw agent result: {len(component_code)} characters")
            if self.verbose:
                logger.info(f"📄 Raw content preview: {component_code[:500]}...")
            
            # Strip markdown code blocks if present
            component_code = self._strip_markdown_wrapper(component_code)
            logger.info(f"📄 Processed component code: {len(component_code)} characters")
            if self.verbose:
                logger.info(f"📄 Processed content preview: {component_code[:500]}...")
            
            # Comprehensive validation - ensure it looks like valid React component AND compiles
            if not await self._validate_component_code(component_code, component_name, output_path or Path(f"./temp_{component_name}.tsx")):
                error_msg = f"Generated code does not appear to be valid React component or failed compilation"
                logger.error(f"❌ {error_msg}")
                return False, "", error_msg
            
            # Save to file if output path provided
            if output_path:
                output_path.parent.mkdir(parents=True, exist_ok=True)
                output_path.write_text(component_code, encoding='utf-8')
                logger.info(f"💾 {component_name} saved to: {output_path}")
            
            logger.info(f"✅ {component_name} generated successfully")
            logger.info(f"📏 Generated code: {len(component_code)} characters")
            
            return True, component_code, f"{component_name} generated successfully"
            
        except Exception as e:
            error_msg = f"{component_name} generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, "", error_msg
    
    async def generate_all_components(
        self,
        analysis_data: Dict[str, Any],
        preview_content: str,
        schema_content: str,
        output_dir: Path = None
    ) -> Tuple[bool, Dict[str, str], str]:
        """Generate all components identified in the analysis.
        
        Args:
            analysis_data: Component analysis data from analyzer agent
            preview_content: The content of the preview-react/App.tsx file
            schema_content: The content of the schema.ts file
            output_dir: Optional directory to save generated components
            
        Returns:
            Tuple of (success, components_dict, message)
        """
        try:
            components = analysis_data.get('components', [])
            component_count = len(components)
            
            logger.info(f"🔨 Component Generator: Starting batch generation of {component_count} components")
            
            generated_components = {}
            failed_components = []
            
            # Generate each component individually
            for component_spec in components:
                component_name = component_spec.get('name')
                if not component_name:
                    logger.warning(f"⚠️ Skipping component without name: {component_spec}")
                    continue
                
                # Determine output path if directory provided
                output_path = None
                if output_dir:
                    output_path = output_dir / f"{component_name}.tsx"
                
                # Generate the component
                success, component_code, message = await self.generate_component(
                    component_name, analysis_data, preview_content, schema_content, output_path
                )
                
                if success:
                    generated_components[component_name] = component_code
                    logger.info(f"✅ {component_name} completed")
                else:
                    failed_components.append(component_name)
                    logger.error(f"❌ {component_name} failed: {message}")
            
            # Generate summary
            success_count = len(generated_components)
            failure_count = len(failed_components)
            
            if failure_count == 0:
                message = f"All {success_count} components generated successfully"
                logger.info(f"✅ Batch generation completed: {message}")
                return True, generated_components, message
            elif success_count > 0:
                message = f"{success_count} components succeeded, {failure_count} failed: {failed_components}"
                logger.warning(f"⚠️ Partial success: {message}")
                return True, generated_components, message
            else:
                message = f"All {component_count} components failed to generate"
                logger.error(f"❌ Batch generation failed: {message}")
                return False, {}, message
            
        except Exception as e:
            error_msg = f"Batch component generation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, {}, error_msg
    
    async def generate_components_from_requirements(
        self,
        plan_content: str,
        preview_content: str,
        output_dir: Path = None
    ) -> Tuple[bool, Dict[str, str], str]:
        """Generate components directly from plan and preview without analyzer.
        
        This is a placeholder implementation that skips component generation.
        Components are handled inline by the Main Page Generator instead.
        
        Args:
            plan_content: The content of the plan.md file
            preview_content: The content of the preview-react/App.tsx file
            output_dir: Optional directory to save generated components
            
        Returns:
            Tuple of (success, components_dict, message)
        """
        try:
            logger.info("🔨 Component Generator: Starting direct generation from requirements")
            logger.info(f"📄 Plan content: {len(plan_content)} characters")
            logger.info(f"🎨 Preview content: {len(preview_content)} characters")
            
            # Return success with empty components (placeholder implementation)
            logger.info("📝 Component generation skipped - components handled by Main Page Generator")
            
            return True, {}, "Component generation skipped - components handled by Main Page Generator"
            
        except Exception as e:
            error_msg = f"Component generation from requirements failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return False, {}, error_msg
    
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
    
    async def _validate_component_code(self, code: str, component_name: str, output_path: Path) -> bool:
        """Validate that the generated code looks like a React component and compiles properly.
        
        Args:
            code: The generated component code
            component_name: Name of the component for validation
            output_path: Path where component will be saved
            
        Returns:
            True if the code appears valid and compiles, False otherwise
        """
        logger.info(f"🔍 Starting comprehensive {component_name} validation...")
        
        # Basic validation checks first
        required_elements = [
            "import React",
            f"export function {component_name}(",
            "return (",
            "interface ",
            "Props",
            "className"
        ]
        
        for element in required_elements:
            if element not in code:
                logger.warning(f"⚠️ Basic validation failed for {component_name}: Missing '{element}'")
                return False
        
        # Check for suspicious content
        if len(code.strip()) < 200:  # Too short to be meaningful component
            logger.warning(f"⚠️ Basic validation failed: {component_name} code too short ({len(code)} chars)")
            return False
        
        logger.info(f"✅ Basic validation passed for {component_name}")
        
        # Advanced validation using MCP tools
        try:
            # Create the output directory structure
            components_dir = output_path.parent
            components_dir.mkdir(parents=True, exist_ok=True)
            
            # Write the component file temporarily for validation
            temp_component_path = output_path
            temp_component_path.write_text(code, encoding='utf-8')
            
            logger.info(f"🔧 Running TypeScript validation with oxc for {component_name}...")
            
            # Use the agent to run validation tools
            component_relative_path = temp_component_path.name
            
            validation_result = await self.agent.run(f"""
Please validate this generated {component_name} component using the available tools:

1. Use mcp__oxc__lint_file to check the TypeScript React code at: client/src/components/{component_relative_path}
2. Use mcp__build_test__verify_project to attempt TypeScript compilation in the current directory

The {component_name} component contains:
```tsx
{code[:500]}...
```

Provide a summary of validation results and whether all checks passed.
""")
            
            if validation_result.success:
                logger.info(f"✅ Advanced validation passed for {component_name}")
                return True
            else:
                logger.error(f"❌ Advanced validation failed for {component_name}: {validation_result.content}")
                return False
                
        except Exception as e:
            logger.warning(f"⚠️ Advanced validation skipped for {component_name} due to error: {str(e)}")
            logger.info("💡 Falling back to basic validation only")
            return True  # Don't fail completely if advanced validation has issues


async def run_component_generator(
    component_name: str,
    analysis_data: Dict[str, Any],
    preview_content: str,
    schema_content: str,
    output_path: Path = None
) -> Tuple[AgentResult, str]:
    """Convenience function to run the Component Generator Agent for a single component.
    
    Args:
        component_name: Name of the component to generate
        analysis_data: Component analysis data from analyzer agent
        preview_content: The content of the preview-react/App.tsx file
        schema_content: The content of the schema.ts file
        output_path: Optional path to save the generated component
        
    Returns:
        Tuple of (AgentResult, component_code)
    """
    generator = ComponentGeneratorAgent()
    success, component_code, message = await generator.generate_component(
        component_name, analysis_data, preview_content, schema_content, output_path
    )
    
    result = AgentResult(
        content=component_code if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, component_code


async def run_batch_component_generator(
    analysis_data: Dict[str, Any],
    preview_content: str,
    schema_content: str,
    output_dir: Path = None
) -> Tuple[AgentResult, Dict[str, str]]:
    """Convenience function to run the Component Generator Agent for all components.
    
    Args:
        analysis_data: Component analysis data from analyzer agent
        preview_content: The content of the preview-react/App.tsx file
        schema_content: The content of the schema.ts file
        output_dir: Optional directory to save generated components
        
    Returns:
        Tuple of (AgentResult, components_dict)
    """
    generator = ComponentGeneratorAgent()
    success, components_dict, message = await generator.generate_all_components(
        analysis_data, preview_content, schema_content, output_dir
    )
    
    result = AgentResult(
        content=json.dumps(components_dict) if success else message,
        cost=0.0,  # TODO: Track actual cost from agent
        success=success
    )
    
    return result, components_dict