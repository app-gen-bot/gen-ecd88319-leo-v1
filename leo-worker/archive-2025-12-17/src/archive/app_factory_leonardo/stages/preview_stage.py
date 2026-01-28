"""Preview Stage - Generate HTML preview from application plan using AI agent and SSR system."""

import logging
import sys
from pathlib import Path
from typing import Tuple

from cc_agent import AgentResult

# Import Preview Generator Agent
from ..agents.preview_generator import PreviewGeneratorAgent

# Import React-to-Static system
sys.path.append(str(Path(__file__).parent.parent.parent / "react_preview_system"))
from react_to_static import ReactToStaticRenderer

logger = logging.getLogger(__name__)

PREVIEW_FILENAME = "preview.html"


async def run_stage(
    plan_path: Path,
    output_dir: Path = None,
    react_output_dir: Path = None,
    **kwargs
) -> Tuple[AgentResult, str]:
    """Generate HTML preview from plan.md using AI agent and SSR system.
    
    This stage:
    1. Uses Preview Generator Agent to create App.tsx from plan.md
    2. Uses React SSR system to convert App.tsx to HTML
    
    Args:
        plan_path: Path to the plan.md file
        output_dir: Directory to save the preview HTML (defaults to plan_path.parent)
        react_output_dir: Directory to save the React component (optional)
        **kwargs: Additional arguments
        
    Returns:
        Tuple of (AgentResult, preview_filename)
        
    Raises:
        FileNotFoundError: If plan.md doesn't exist
        ValueError: If plan.md is empty
    """
    logger.info(f"🎨 Preview Stage: Starting preview generation with AI agent + SSR")
    logger.info(f"📄 Plan file: {plan_path}")
    
    # Validate plan file exists
    if not plan_path.exists():
        raise FileNotFoundError(f"Plan file not found: {plan_path}")
    
    # Read plan content
    plan_content = plan_path.read_text(encoding='utf-8').strip()
    if not plan_content:
        raise ValueError(f"Plan file is empty: {plan_path}")
    
    logger.info(f"📖 Loaded plan: {len(plan_content)} characters")
    
    # Determine output directories
    if output_dir is None:
        output_dir = plan_path.parent
    
    # Auto-detect react output directory based on structure
    if react_output_dir is None:
        if output_dir.name == "preview-html":
            react_output_dir = output_dir.parent / "preview-react"
        else:
            # Look for existing preview-react directory in parent
            parent_dir = output_dir.parent
            potential_react_dir = parent_dir / "preview-react"
            if potential_react_dir.exists():
                react_output_dir = potential_react_dir
            else:
                # Create sibling directory
                react_output_dir = parent_dir / "preview-react"
    
    preview_path = output_dir / PREVIEW_FILENAME
    app_tsx_path = react_output_dir / "App.tsx"
    
    try:
        # Step 1: Generate React component using AI agent
        logger.info("🤖 Step 1: Generating React component with AI agent...")
        agent = PreviewGeneratorAgent()
        
        success, component_code, message = await agent.generate_react_component(
            plan_content=plan_content,
            output_path=app_tsx_path
        )
        
        if not success:
            error_msg = f"React component generation failed: {message}"
            logger.error(f"❌ {error_msg}")
            result = AgentResult(content=error_msg, cost=0.0, success=False)
            return result, PREVIEW_FILENAME
        
        logger.info(f"✅ React component generated: {len(component_code)} characters")
        
        # Step 2: Convert React component to HTML using SSR
        logger.info("🔄 Step 2: Converting React component to HTML with SSR...")
        renderer = ReactToStaticRenderer()
        
        # Check dependencies
        if not renderer.check_dependencies():
            error_msg = "SSR dependencies not available (Node.js required)"
            logger.error(f"❌ {error_msg}")
            result = AgentResult(content=error_msg, cost=0.0, success=False)
            return result, PREVIEW_FILENAME
        
        # Render using existing App.tsx file
        output_html_path, react_component_path = renderer.render_component_to_html(
            app_tsx_path=str(app_tsx_path),
            output_file=PREVIEW_FILENAME
        )
        
        # Copy generated HTML to target location
        import shutil
        # Ensure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(output_html_path, preview_path)
        
        # Read the generated HTML for metadata
        html_content = preview_path.read_text(encoding='utf-8')
        html_size = len(html_content)
        
        logger.info(f"✅ Preview Stage completed successfully")
        logger.info(f"📄 Generated HTML: {html_size:,} characters") 
        logger.info(f"💾 Preview saved: {preview_path}")
        logger.info(f"⚛️ React component saved: {app_tsx_path}")
        
        # Create successful result
        result = AgentResult(content=html_content, cost=0.0, success=True)
        result.metadata = {
            'preview_path': str(preview_path),
            'react_component_path': str(app_tsx_path),
            'preview_filename': PREVIEW_FILENAME,
            'html_size': html_size,
            'component_size': len(component_code),
            'rendering_method': 'AI-Agent + SSR',
            'plan_content_length': len(plan_content)
        }
        
        return result, PREVIEW_FILENAME
        
    except Exception as e:
        error_msg = f"React-to-Static rendering failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        result = AgentResult(content=error_msg, cost=0.0, success=False)
        return result, PREVIEW_FILENAME