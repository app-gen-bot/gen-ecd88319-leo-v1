"""Build Stage - Extract template and generate database schema from application plan and React component."""

import logging
import tarfile
from pathlib import Path
from typing import Tuple

from cc_agent import AgentResult

# Import all generator agents
from ..agents.schema_generator import SchemaGeneratorAgent
from ..agents.storage_generator import StorageGeneratorAgent
from ..agents.routes_generator import RoutesGeneratorAgent
from ..agents.app_shell_generator import AppShellGeneratorAgent
from ..agents.main_page_generator import MainPageGeneratorAgent
from ..agents.component_generator import ComponentGeneratorAgent

logger = logging.getLogger(__name__)

SCHEMA_FILENAME = "schema.ts"
TEMPLATE_NAME = "vite-express-template-v1.0.0.tar.gz"
TEMPLATE_PATH = Path("/home/ec2-user/.mcp-tools/templates") / TEMPLATE_NAME


async def validate_after_agent(app_dir: Path, agent_name: str) -> bool:
    """Run quick validation after each agent to catch errors early.
    
    Args:
        app_dir: Path to the app directory
        agent_name: Name of the agent that just ran
        
    Returns:
        True if validation passed, False otherwise
    """
    import subprocess
    
    logger.info(f"🔍 Running quick validation after {agent_name}...")
    
    try:
        # Quick TypeScript check without full build
        tsc_result = subprocess.run(
            ["npx", "tsc", "--noEmit"], 
            cwd=str(app_dir), 
            capture_output=True, 
            text=True, 
            timeout=30
        )
        
        if tsc_result.returncode != 0:
            logger.warning(f"⚠️ TypeScript validation failed after {agent_name}:")
            logger.warning(f"     {tsc_result.stderr}")
            return False
        else:
            logger.info(f"✅ TypeScript validation passed after {agent_name}")
            return True
            
    except subprocess.TimeoutExpired:
        logger.warning(f"⚠️ Validation timeout after {agent_name}")
        return False
    except Exception as e:
        logger.warning(f"⚠️ Validation error after {agent_name}: {str(e)}")
        return False


def cleanup_template_files(app_dir: Path) -> None:
    """Remove template placeholder files that agents will regenerate.
    
    For Replit-style generation, we remove ALL app-specific files and let
    agents create them from scratch based on app requirements.
    
    Args:
        app_dir: Path to the extracted app directory
    """
    files_to_remove = [
        app_dir / "server" / "routes.ts",     # Routes template with TODOs
        app_dir / "server" / "storage.ts",    # Storage template with TODOs  
        app_dir / "shared" / "schema.ts",     # Schema template placeholder
        app_dir / "client" / "src" / "pages" / "home.tsx",  # Generic home page
        app_dir / "client" / "src" / "App.tsx",  # Remove App.tsx - agents will create it
    ]
    
    removed_count = 0
    for file_path in files_to_remove:
        if file_path.exists():
            file_path.unlink()
            logger.info(f"🧹 Removed template file: {file_path.relative_to(app_dir)}")
            removed_count += 1
    
    logger.info(f"🧹 Template cleanup complete: {removed_count} files removed")


def extract_template(workspace_dir: Path) -> Path:
    """Extract the vite-express template to the workspace directory.
    
    Args:
        workspace_dir: Directory where the app will be created
        
    Returns:
        Path to the extracted app directory
        
    Raises:
        FileNotFoundError: If template tar file doesn't exist
    """
    if not TEMPLATE_PATH.exists():
        raise FileNotFoundError(f"Template not found: {TEMPLATE_PATH}")
    
    app_dir = workspace_dir / "app"
    
    # Remove existing app directory if present
    if app_dir.exists():
        import shutil
        shutil.rmtree(app_dir)
        logger.info(f"🗑️ Removed existing app directory: {app_dir}")
    
    logger.info(f"📦 Extracting template from: {TEMPLATE_PATH}")
    
    # Extract template
    with tarfile.open(TEMPLATE_PATH, 'r:gz') as tar:
        # Extract to temporary location first
        temp_extract_dir = workspace_dir / "temp_extract"
        tar.extractall(temp_extract_dir)
        
        # Move the extracted directory to app/
        extracted_template_dir = temp_extract_dir / "vite-express-build"
        extracted_template_dir.rename(app_dir)
        
        # Clean up temp directory
        temp_extract_dir.rmdir()
    
    logger.info(f"✅ Template extracted to: {app_dir}")
    
    # Clean up template files that agents will regenerate
    cleanup_template_files(app_dir)
    logger.info(f"🧹 Template files cleaned for agent generation")
    
    return app_dir


async def run_stage(
    plan_path: Path,
    react_component_path: Path,
    output_dir: Path = None,
    **kwargs
) -> Tuple[AgentResult, str]:
    """Complete build pipeline: Extract template and generate full application from plan.md and App.tsx.
    
    This stage implements the multi-agent build pipeline:
    1. Extracts the vite-express template to create app structure
    2. Reads the application plan from plan.md
    3. Reads the React component wireframe from App.tsx
    4. Uses Schema Generator Agent to create database schema (shared/schema.ts)
    5. Uses Storage Generator Agent to create storage layer (server/storage.ts)
    6. Uses Routes Generator Agent to create API routes (server/routes.ts)
    7. Uses App Shell Generator Agent to create main app shell (client/src/App.tsx)
    8. Uses Main Page Generator Agent to create homepage (client/src/pages/HomePage.tsx)
    9. Uses Component Analyzer Agent to identify reusable components
    10. Uses Component Generator Agent to create individual components
    
    Args:
        plan_path: Path to the plan.md file
        react_component_path: Path to the App.tsx React component file
        output_dir: Directory to save files (defaults to extracted template structure)
        **kwargs: Additional arguments
        
    Returns:
        Tuple of (AgentResult, build_summary)
        
    Raises:
        FileNotFoundError: If plan.md, App.tsx, or template doesn't exist
        ValueError: If plan.md or App.tsx is empty
    """
    logger.info(f"🔨 Build Stage: Starting complete multi-agent build pipeline")
    logger.info(f"📄 Plan file: {plan_path}")
    logger.info(f"⚛️ React component file: {react_component_path}")
    
    # Validate input files exist
    if not plan_path.exists():
        raise FileNotFoundError(f"Plan file not found: {plan_path}")
    
    if not react_component_path.exists():
        raise FileNotFoundError(f"React component file not found: {react_component_path}")
    
    # Read plan content
    plan_content = plan_path.read_text(encoding='utf-8').strip()
    if not plan_content:
        raise ValueError(f"Plan file is empty: {plan_path}")
    
    # Read React component content
    react_content = react_component_path.read_text(encoding='utf-8').strip()
    if not react_content:
        raise ValueError(f"React component file is empty: {react_component_path}")
    
    logger.info(f"📖 Loaded plan: {len(plan_content)} characters")
    logger.info(f"⚛️ Loaded React component: {len(react_content)} characters")
    
    # Step 1: Extract template to workspace
    workspace_dir = plan_path.parent.parent  # plan.md is in plan/, so we need to go up to get to the app root
    app_dir = extract_template(workspace_dir)
    
    # Determine output directory - use extracted template's shared directory
    if output_dir is None:
        output_dir = app_dir / "shared"
    
    schema_path = output_dir / SCHEMA_FILENAME
    
    try:
        # Keep track of all generated files and their status
        generated_files = {}
        generation_errors = []
        
        # Step 2: Generate database schema using AI agent
        logger.info("🤖 Step 2: Generating database schema with Schema Generator Agent...")
        
        # Set working directory to the app directory for proper tool context
        cwd = str(app_dir.absolute())
        logger.info(f"📂 Working directory for agents: {cwd}")
        
        schema_agent = SchemaGeneratorAgent(cwd=cwd)
        success, _, message = await schema_agent.generate_schema(
            plan_content=plan_content,
            react_component=react_content
        )
        
        if not success:
            error_msg = f"Schema generation failed: {message}"
            logger.error(f"❌ {error_msg}")
            generation_errors.append(f"Schema: {error_msg}")
        else:
            logger.info(f"✅ Schema generation completed")
            generated_files['schema'] = {'agent': 'SchemaGeneratorAgent', 'status': 'completed'}
            
            # Validate after schema generation
            await validate_after_agent(app_dir, "Schema Generator")
        
        # Step 3: Generate storage layer
        logger.info("🤖 Step 3: Generating storage layer with Storage Generator Agent...")
        
        storage_path = app_dir / "server" / "storage.ts"
        storage_agent = StorageGeneratorAgent(cwd=cwd)
        success, _, message = await storage_agent.generate_storage()
        
        if not success:
            logger.error(f"❌ Storage generation failed: {message}")
            generation_errors.append(f"Storage: {message}")
        else:
            logger.info(f"✅ Storage generation completed")
            generated_files['storage'] = {'agent': 'StorageGeneratorAgent', 'status': 'completed'}
            
            # Validate after storage generation
            await validate_after_agent(app_dir, "Storage Generator")
        
        # Step 4: Generate API routes
        logger.info("🤖 Step 4: Generating API routes with Routes Generator Agent...")
        
        routes_path = app_dir / "server" / "routes.ts"
        routes_agent = RoutesGeneratorAgent(cwd=cwd)
        success, _, message = await routes_agent.generate_routes()
        
        if not success:
            logger.error(f"❌ Routes generation failed: {message}")
            generation_errors.append(f"Routes: {message}")
        else:
            logger.info(f"✅ Routes generation completed")
            generated_files['routes'] = {'agent': 'RoutesGeneratorAgent', 'status': 'completed'}
            
            # Validate after routes generation
            await validate_after_agent(app_dir, "Routes Generator")
        
        # Step 5: Generate App shell
        logger.info("🤖 Step 5: Generating App shell with App Shell Generator Agent...")
        
        app_shell_path = app_dir / "client" / "src" / "App.tsx"
        app_shell_agent = AppShellGeneratorAgent(cwd=cwd)
        success, _, message = await app_shell_agent.generate_app_shell()
        
        if not success:
            logger.error(f"❌ App shell generation failed: {message}")
            generation_errors.append(f"App Shell: {message}")
        else:
            logger.info(f"✅ App shell generation completed")
            generated_files['app_shell'] = {'agent': 'AppShellGeneratorAgent', 'status': 'completed'}
            
            # Validate after app shell generation
            await validate_after_agent(app_dir, "App Shell Generator")
        
        # Step 6: Generate main page
        logger.info("🤖 Step 6: Generating main page with Main Page Generator Agent...")
        
        main_page_path = app_dir / "client" / "src" / "pages" / "home.tsx"
        main_page_agent = MainPageGeneratorAgent(cwd=cwd)
        success, _, message = await main_page_agent.generate_main_page()
        
        if not success:
            logger.error(f"❌ Main page generation failed: {message}")
            generation_errors.append(f"Main Page: {message}")
        else:
            logger.info(f"✅ Main page generation completed")
            generated_files['main_page'] = {'agent': 'MainPageGeneratorAgent', 'status': 'completed'}
            
            # Validate after main page generation
            await validate_after_agent(app_dir, "Main Page Generator")
        
        # Step 7: Generate components directly from plan, preview, and schema
        logger.info("🤖 Step 7: Generating components with Component Generator Agent...")
        
        components_dir = app_dir / "client" / "src" / "components"
        component_generator = ComponentGeneratorAgent(cwd=cwd)
        
        # Component Generator works directly from requirements instead of analysis
        success, components_dict, message = await component_generator.generate_components_from_requirements(
            plan_content=plan_content,
            preview_content=react_content,
            output_dir=components_dir
        )
        
        if not success:
            logger.error(f"❌ Component generation failed: {message}")
            generation_errors.append(f"Components: {message}")
        else:
            generated_files['components'] = {
                'agent': 'ComponentGeneratorAgent',
                'status': 'completed',
                'count': len(components_dict),
                'components': list(components_dict.keys())
            }
            logger.info(f"✅ Components generation completed: {len(components_dict)} components")
        
        # Build and lint validation
        logger.info("🔧 Running build and lint validation...")
        build_validation_passed = True
        validation_errors = []
        
        try:
            # Run npm install first
            import subprocess
            install_result = subprocess.run(
                ["npm", "install"], 
                cwd=str(app_dir), 
                capture_output=True, 
                text=True, 
                timeout=120
            )
            if install_result.returncode != 0:
                validation_errors.append(f"npm install failed: {install_result.stderr}")
                build_validation_passed = False
            else:
                logger.info("✅ npm install completed successfully")
            
            # Run lint check
            lint_result = subprocess.run(
                ["npm", "run", "lint"], 
                cwd=str(app_dir), 
                capture_output=True, 
                text=True, 
                timeout=60
            )
            if lint_result.returncode != 0:
                validation_errors.append(f"Lint check failed: {lint_result.stderr}")
                build_validation_passed = False
            else:
                logger.info("✅ Lint check passed")
            
            # Run build check
            build_result = subprocess.run(
                ["npm", "run", "build"], 
                cwd=str(app_dir), 
                capture_output=True, 
                text=True, 
                timeout=120
            )
            if build_result.returncode != 0:
                validation_errors.append(f"Build check failed: {build_result.stderr}")
                build_validation_passed = False
            else:
                logger.info("✅ Build check passed")
                
        except subprocess.TimeoutExpired:
            validation_errors.append("Validation timeout - build/lint took too long")
            build_validation_passed = False
        except Exception as e:
            validation_errors.append(f"Validation error: {str(e)}")
            build_validation_passed = False
        
        # Build summary
        total_files = len(generated_files)
        total_errors = len(generation_errors)
        total_validation_errors = len(validation_errors)
        
        logger.info(f"📊 Build pipeline completed:")
        logger.info(f"   🤖 Agent completions: {total_files}")
        logger.info(f"   ❌ Generation errors: {total_errors}")
        logger.info(f"   🔧 Build/lint validation: {'✅ PASSED' if build_validation_passed else '❌ FAILED'}")
        logger.info(f"   📦 Template extracted: {app_dir}")
        
        if total_errors > 0:
            logger.warning(f"⚠️ Generation completed with {total_errors} errors:")
            for error in generation_errors:
                logger.warning(f"     - {error}")
        
        if total_validation_errors > 0:
            logger.warning(f"⚠️ Validation completed with {total_validation_errors} errors:")
            for error in validation_errors:
                logger.warning(f"     - {error}")
        
        # Create final result - success requires both agent success AND build validation
        build_summary = f"Multi-agent build pipeline: {total_files} agents completed, {total_errors} generation errors, validation {'passed' if build_validation_passed else 'failed'}"
        
        if total_files >= 4 and build_validation_passed:  # At least 4 agents completed + validation passed
            success_status = True
            result_content = f"Build pipeline completed successfully. {total_files} agents completed, validation passed."
        else:
            success_status = False
            if not build_validation_passed:
                result_content = f"Build pipeline failed validation. {total_files} agents completed but app does not build/lint properly."
            else:
                result_content = f"Build pipeline failed. Only {total_files} agents completed successfully."
        
        result = AgentResult(content=result_content, cost=0.0, success=success_status)
        result.metadata = {
            'app_dir': str(app_dir),
            'template_extracted': True,
            'generated_files': generated_files,
            'generation_errors': generation_errors,
            'validation_errors': validation_errors,
            'total_files_generated': total_files,
            'total_errors': total_errors,
            'build_validation_passed': build_validation_passed,
            'total_validation_errors': total_validation_errors,
            'plan_content_length': len(plan_content),
            'react_content_length': len(react_content),
            'generation_method': 'Multi-Agent Build Pipeline (Leonardo)',
            'validation_method': 'npm install + npm run lint + npm run build',
            'agents_used': [
                'SchemaGeneratorAgent', 'StorageGeneratorAgent', 'RoutesGeneratorAgent',
                'AppShellGeneratorAgent', 'MainPageGeneratorAgent',
                'ComponentAnalyzerAgent', 'ComponentGeneratorAgent'
            ]
        }
        
        return result, build_summary
        
    except Exception as e:
        error_msg = f"Build pipeline failed: {str(e)}"
        logger.error(f"❌ {error_msg}")
        result = AgentResult(content=error_msg, cost=0.0, success=False)
        return result, f"Build failed: {str(e)}"