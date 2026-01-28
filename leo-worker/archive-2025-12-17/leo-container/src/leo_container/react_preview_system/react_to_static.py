#!/usr/bin/env python3
"""
React-to-Static Preview System

Converts React/TSX components to static HTML previews using SSR template system.
"""

import subprocess
import json
import os
import shutil
import tarfile
import tempfile
import time
from pathlib import Path
from typing import Optional, Tuple


class ReactToStaticRenderer:
    def __init__(self, work_dir: Path = None):
        """Initialize the renderer with a working directory."""
        if work_dir is None:
            work_dir = Path(__file__).parent
        
        self.work_dir = work_dir
        self.scripts_dir = work_dir / "scripts"
        self.output_dir = work_dir / "output"
        
        # SSR template configuration
        self.template_version = "2.0.0"
        self.template_cache_dir = Path.home() / ".mcp-tools" / "templates"
        self.template_filename = f"react-ssr-template-v{self.template_version}.tar.gz"
        
        # Ensure directories exist
        self.output_dir.mkdir(exist_ok=True)
        self.template_cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get_ssr_template(self) -> Tuple[bool, str, Optional[Path]]:
        """Get SSR template from cache.
        
        Returns:
            Tuple of (success, message, template_path)
        """
        template_path = self.template_cache_dir / self.template_filename
        
        if template_path.exists():
            return True, "SSR template found in cache", template_path
        else:
            return False, f"SSR template not found: {template_path}", None
    
    def extract_ssr_template(self, template_path: Path, extract_dir: Path) -> Tuple[bool, str]:
        """Extract SSR template to directory.
        
        Args:
            template_path: Path to SSR template tar.gz
            extract_dir: Directory to extract to
            
        Returns:
            Tuple of (success, message)
        """
        try:
            with tarfile.open(template_path, 'r:gz') as tar:
                tar.extractall(path=extract_dir)
            return True, "SSR template extracted successfully"
        except Exception as e:
            return False, f"SSR template extraction failed: {e}"
    
    def render_component_with_ssr(self, component_tsx: str, output_file: str = "preview.html", app_dir: Path = None) -> Tuple[bool, str, Optional[str]]:
        """Render React component using SSR template.
        
        Args:
            component_tsx: React component source code
            output_file: Output HTML filename
            app_dir: App directory path for design system injection (optional)
            
        Returns:
            Tuple of (success, message, html_output_path)
        """
        # Get SSR template
        template_success, template_message, template_path = self.get_ssr_template()
        if not template_success:
            return False, f"Template not available: {template_message}", None
        
        # Create temporary directory for SSR environment
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            ssr_env_dir = temp_path / "ssr-env"
            
            try:
                # Extract SSR template
                extract_success, extract_message = self.extract_ssr_template(template_path, ssr_env_dir)
                if not extract_success:
                    return False, extract_message, None
                
                # Inject design system files into template (if available)
                inject_success, inject_message = self.inject_design_system_into_template(ssr_env_dir, app_dir)
                if not inject_success:
                    # Non-fatal - continue with default template
                    print(f"Warning: {inject_message}")
                
                # Compile TSX to JS using ESBuild for reliable compilation
                compile_success, compile_message = self.compile_tsx_with_esbuild(
                    component_tsx, ssr_env_dir
                )
                if not compile_success:
                    return False, f"TSX compilation failed: {compile_message}", None
                
                # Run SSR rendering (plain Node.js now)
                result = subprocess.run([
                    'node', 'render-to-static.js'
                ], 
                capture_output=True, 
                text=True, 
                cwd=ssr_env_dir
                )
                
                if result.returncode != 0:
                    return False, f"SSR rendering failed: {result.stderr}", None
                
                # Copy generated HTML to output directory
                generated_html = ssr_env_dir / "output.html"
                if not generated_html.exists():
                    return False, "Generated HTML file not found", None
                
                final_output = self.output_dir / output_file
                shutil.copy2(generated_html, final_output)
                
                return True, "SSR rendering successful", str(final_output)
                
            except Exception as e:
                return False, f"SSR rendering error: {str(e)}", None
    
    def compile_tsx_with_esbuild(self, tsx_content: str, work_dir: Path) -> Tuple[bool, str]:
        """Compile TSX to JavaScript using ESBuild for reliable compilation.
        
        This uses ESBuild, a production-grade TypeScript/JSX compiler that:
        1. Handles ALL TypeScript syntax correctly
        2. Compiles JSX to React.createElement calls
        3. Resolves import paths properly
        4. Is fast and reliable (used by Vite, Remix, etc.)
        
        Args:
            tsx_content: The TSX component source code
            work_dir: Working directory where compilation happens
            
        Returns:
            Tuple of (success, message)
        """
        try:
            # Create preview-react directory to match expected structure
            preview_dir = work_dir / "preview-react"
            preview_dir.mkdir(exist_ok=True)
            
            # Write TSX content to temporary file in subdirectory
            # This makes ../design-system/design-tokens resolve correctly
            tsx_file = preview_dir / "temp.tsx"
            tsx_file.write_text(tsx_content, encoding='utf-8')
            
            # Create tsconfig.json for proper path resolution
            tsconfig = {
                "compilerOptions": {
                    "baseUrl": ".",
                    "paths": {
                        "@/components/*": ["./components/*"],
                        "@/lib/*": ["./lib/*"]
                    }
                }
            }
            tsconfig_file = work_dir / "tsconfig.json"
            with open(tsconfig_file, 'w') as f:
                json.dump(tsconfig, f, indent=2)
            
            # Use ESBuild to compile TSX to JS
            result = subprocess.run([
                'npx', 'esbuild', str(tsx_file),
                '--format=esm',
                '--jsx=automatic',
                '--target=node22',
                '--outfile=' + str(work_dir / "src" / "App.js"),
                '--bundle',
                '--external:react',
                '--external:react-dom'
            ], 
            capture_output=True, 
            text=True, 
            cwd=work_dir
            )
            
            if result.returncode != 0:
                return False, f"ESBuild compilation failed: {result.stderr}"
            
            # Verify output file was created
            output_file = work_dir / "src" / "App.js"
            if not output_file.exists():
                return False, "ESBuild did not create output file"
            
            # Clean up temporary files
            tsx_file.unlink()
            tsconfig_file.unlink()
            
            return True, "TSX compiled successfully with ESBuild"
            
        except Exception as e:
            return False, f"ESBuild compilation error: {str(e)}"
        
    def generate_react_component_from_plan(self, plan_content: str) -> str:
        """Generate a React component based on plan content."""
        # For now, create a basic component structure based on the plan
        # This is a simplified implementation - in production, you'd use an LLM to generate this
        
        component_tsx = f'''import React from 'react';
import {{ Card, CardHeader, CardTitle, CardContent }} from '@/components/ui/card';
import {{ Button }} from '@/components/ui/button';
import {{ Input }} from '@/components/ui/input';

export default function AppPreview() {{
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">TodoList</CardTitle>
          <p className="text-muted-foreground">Stay organized, get things done</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input placeholder="Add a new task..." className="flex-1" />
            <Button data-event="click:addTask">Add Task</Button>
          </div>
          
          <div className="space-y-2">
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3" data-task-id="task-1">
              <button 
                className="w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center"
                data-event="click:toggleTask"
                data-task-id="task-1"
              />
              <span className="flex-1 text-foreground" data-task-title>
                Complete project documentation
              </span>
            </div>
            
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3" data-task-id="task-2">
              <button 
                className="w-5 h-5 rounded-full border bg-accent border-accent flex items-center justify-center"
                data-event="click:toggleTask"
                data-task-id="task-2"
              >
                <span className="text-accent-foreground text-xs">✓</span>
              </button>
              <span className="flex-1 text-muted-foreground line-through" data-task-title>
                Review client feedback
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}}'''
        
        return component_tsx

    def render_component_to_html(self, plan_content: str = None, output_file: str = "preview.html", react_output_dir: str = None, app_tsx_path: str = None) -> tuple[str, str]:
        """
        Generate React component from plan and render to static HTML using SSR template.
        
        Args:
            plan_content: The plan.md content to generate React component from
            output_file: Name of the output HTML file
            react_output_dir: Directory to save React component (optional)
            app_tsx_path: Path to existing App.tsx file to render (optional)
            
        Returns:
            Tuple of (html_output_path, react_component_path)
        """
        try:
            # Determine React component source
            react_component = None
            react_component_path = None
            
            if app_tsx_path:
                # Use existing App.tsx file
                app_path = Path(app_tsx_path)
                if app_path.exists():
                    react_component = app_path.read_text(encoding='utf-8')
                    react_component_path = str(app_path)
                else:
                    raise FileNotFoundError(f"App.tsx not found: {app_tsx_path}")
            elif plan_content:
                # Generate React component from plan
                react_component = self.generate_react_component_from_plan(plan_content)
            else:
                # Fallback to sample component
                react_component = self.create_sample_todolist_component()
            
            # Save React component if output directory provided
            if react_output_dir and not app_tsx_path:
                react_dir = Path(react_output_dir)
                react_dir.mkdir(parents=True, exist_ok=True)
                react_component_path = react_dir / "App.tsx"
                react_component_path.write_text(react_component, encoding='utf-8')
                react_component_path = str(react_component_path)
            
            # Extract app directory from app_tsx_path if available
            app_dir = None
            if app_tsx_path:
                # e.g., /path/to/apps/my-app/preview-react/App.tsx -> /path/to/apps/my-app
                app_path = Path(app_tsx_path)
                app_dir = app_path.parent.parent  # Go up from preview-react to app dir
            
            # Use SSR template rendering
            success, message, html_output_path = self.render_component_with_ssr(
                react_component, output_file, app_dir
            )
            
            if not success:
                raise RuntimeError(f"SSR rendering failed: {message}")
            
            return html_output_path, react_component_path
            
        except Exception as e:
            raise RuntimeError(f"Failed to render component: {str(e)}")
            
    def create_sample_todolist_component(self) -> str:
        """Create a sample TodoList component for testing."""
        return '''
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PreviewApp() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">TodoList</CardTitle>
          <p className="text-muted-foreground">Stay organized, get things done</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input placeholder="Add a new task..." className="flex-1" />
            <Button data-event="click:addTask">Add Task</Button>
          </div>
          
          <div className="space-y-2">
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3" data-task-id="task-1">
              <button 
                className="w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center"
                data-event="click:toggleTask"
                data-task-id="task-1"
              />
              <span className="flex-1 text-foreground" data-task-title>
                Complete project documentation
              </span>
            </div>
            
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3" data-task-id="task-2">
              <button 
                className="w-5 h-5 rounded-full border bg-accent border-accent flex items-center justify-center"
                data-event="click:toggleTask"
                data-task-id="task-2"
              >
                <span className="text-accent-foreground text-xs">✓</span>
              </button>
              <span className="flex-1 text-muted-foreground line-through" data-task-title>
                Review client feedback
              </span>
            </div>
            
            <div className="rounded-lg border bg-card p-3 flex items-center gap-3" data-task-id="task-3">
              <button 
                className="w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center"
                data-event="click:toggleTask"
                data-task-id="task-3"
              />
              <span className="flex-1 text-foreground" data-task-title>
                Prepare presentation for Monday meeting
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'''

    def inject_design_system_into_template(self, ssr_env_dir: Path, app_dir: Path = None) -> Tuple[bool, str]:
        """Inject app-specific design system files into extracted SSR template.
        
        This copies design system CSS files to override template defaults,
        similar to how we handle React template customization in the build stage.
        
        Args:
            ssr_env_dir: Directory where SSR template was extracted
            app_dir: App directory path containing design-system subdirectory (optional)
            
        Returns:
            Tuple of (success, message)
        """
        try:
            # If app_dir is provided, look for design-system in that app directory
            if app_dir:
                design_system_dir = app_dir / "design-system"
                if design_system_dir.exists() and (design_system_dir / "globals.css").exists():
                    # Found app-specific design system
                    pass
                else:
                    return False, f"Design system not found in {design_system_dir} - using template defaults"
            else:
                # Fallback: try to find any design system in current working directory structure
                current_dir = Path.cwd()
                design_system_paths = [
                    current_dir / "design-system",
                    current_dir.parent / "design-system",
                ]
                
                design_system_dir = None
                for path in design_system_paths:
                    if path.exists() and (path / "globals.css").exists():
                        design_system_dir = path
                        break
                
                if not design_system_dir:
                    return False, "No design system found - using template defaults"
            
            # Create design-system directory in SSR env
            target_design_dir = ssr_env_dir / "design-system"
            target_design_dir.mkdir(exist_ok=True)
            
            # Copy globals.css to template
            source_css = design_system_dir / "globals.css"
            target_css = ssr_env_dir / "app" / "globals.css"
            
            if not target_css.parent.exists():
                target_css.parent.mkdir(parents=True, exist_ok=True)
            
            shutil.copy2(source_css, target_css)
            
            # Also copy design-tokens.ts for imports to work
            source_tokens = design_system_dir / "design-tokens.ts"
            if source_tokens.exists():
                target_tokens = target_design_dir / "design-tokens.ts"
                shutil.copy2(source_tokens, target_tokens)
                
            # Copy tailwind.config.js if it exists
            source_tailwind = design_system_dir / "tailwind.config.js"
            if source_tailwind.exists():
                target_tailwind = target_design_dir / "tailwind.config.js"
                shutil.copy2(source_tailwind, target_tailwind)
            
            # Update render-to-static.js with design system CSS variables
            render_script = ssr_env_dir / "render-to-static.js"
            if render_script.exists():
                self._update_render_script_with_design_css(render_script, source_css)
            
            return True, f"Design system injected from {design_system_dir}"
            
        except Exception as e:
            return False, f"Failed to inject design system: {str(e)}"
    
    def _update_render_script_with_design_css(self, render_script_path: Path, globals_css_path: Path) -> None:
        """Update render-to-static.js to include design system CSS variables.
        
        Args:
            render_script_path: Path to render-to-static.js in template
            globals_css_path: Path to design system globals.css to extract variables from
        """
        try:
            # Read design system CSS to extract variables
            design_css = globals_css_path.read_text(encoding='utf-8')
            
            # Extract CSS variables from design system globals.css
            css_variables = []
            in_root_block = False
            
            for line in design_css.split('\n'):
                line = line.strip()
                if line == ':root {':
                    in_root_block = True
                    continue
                elif line == '}' and in_root_block:
                    break
                elif in_root_block and line.startswith('--'):
                    css_variables.append(line)
            
            if not css_variables:
                return  # No variables found, keep defaults
            
            # Read current render script
            render_content = render_script_path.read_text(encoding='utf-8')
            
            # Find and replace the CSS variables section
            # Look for the existing :root block and replace it
            lines = render_content.split('\n')
            new_lines = []
            in_css_variables = False
            in_root_block = False
            
            for line in lines:
                if 'CSS Variables for ShadCN theming' in line:
                    in_css_variables = True
                    new_lines.append(line)
                    continue
                elif in_css_variables and ':root {' in line:
                    in_root_block = True
                    new_lines.append(':root {')
                    # Add design system variables
                    for var in css_variables:
                        new_lines.append(f'  {var}')
                    continue
                elif in_root_block and line.strip() == '}':
                    in_root_block = False
                    in_css_variables = False
                    new_lines.append('}')
                    continue
                elif in_root_block:
                    # Skip original variables, already added design system ones
                    continue
                else:
                    new_lines.append(line)
            
            # Add design system utility classes after the body styles
            design_utilities = self._generate_design_utility_classes(css_variables)
            
            # Find where to insert utility classes (after body styles)
            for i, line in enumerate(new_lines):
                if 'font-family:' in line and 'Inter' in line:
                    # Insert utility classes after the body font styles
                    new_lines.insert(i + 1, '')
                    new_lines.insert(i + 2, '/* Design System Utility Classes */')
                    for utility in design_utilities:
                        new_lines.insert(i + 3, utility)
                        i += 1
                    break
            
            # Write updated render script
            render_script_path.write_text('\n'.join(new_lines), encoding='utf-8')
            
        except Exception as e:
            print(f"Warning: Failed to update render script with design system CSS: {e}")
    
    def _generate_design_utility_classes(self, css_variables: list[str]) -> list[str]:
        """Generate utility classes for design system colors.
        
        Args:
            css_variables: List of CSS variables from design system
            
        Returns:
            List of CSS utility class strings
        """
        utilities = []
        
        # Extract color variable names from CSS variables
        color_vars = []
        for var_line in css_variables:
            if ':' in var_line:
                var_name = var_line.split(':')[0].strip()
                if var_name.startswith('--'):
                    # Remove -- prefix and add to color vars
                    color_name = var_name[2:]
                    color_vars.append(color_name)
        
        # Generate utility classes for each color variable
        for color in color_vars:
            # Background utilities
            utilities.append(f'.bg-{color} {{ background-color: hsl(var(--{color})); }}')
            # Text utilities
            utilities.append(f'.text-{color} {{ color: hsl(var(--{color})); }}')
            # Border utilities
            utilities.append(f'.border-{color} {{ border-color: hsl(var(--{color})); }}')
        
        return utilities

    def check_dependencies(self) -> bool:
        """Check if Node.js and required dependencies are available."""
        try:
            # Check Node.js
            result = subprocess.run(['node', '--version'], capture_output=True)
            if result.returncode != 0:
                print("❌ Node.js not found. Please install Node.js")
                return False
            print(f"✅ Node.js found: {result.stdout.decode().strip()}")
            
            return True
        except Exception as e:
            print(f"❌ Dependency check failed: {e}")
            return False


def main():
    """Test the React-to-Static renderer."""
    print("🚀 Testing React-to-Static Preview System")
    print("=" * 50)
    
    renderer = ReactToStaticRenderer()
    
    # Check dependencies
    if not renderer.check_dependencies():
        print("Please install missing dependencies")
        return
        
    print("📝 Creating sample TodoList component...")
    sample_component = renderer.create_sample_todolist_component()
    print(f"Generated {len(sample_component)} characters of React code")
    
    print("🔄 Rendering React component to static HTML...")
    try:
        output_path = renderer.render_component_to_html()
        print(f"✅ Preview generated successfully!")
        print(f"📄 Output saved to: {output_path}")
        
        # Check file size
        file_size = Path(output_path).stat().st_size
        print(f"📊 Generated HTML size: {file_size:,} bytes")
        
    except Exception as e:
        print(f"❌ Rendering failed: {e}")
        

if __name__ == "__main__":
    main()