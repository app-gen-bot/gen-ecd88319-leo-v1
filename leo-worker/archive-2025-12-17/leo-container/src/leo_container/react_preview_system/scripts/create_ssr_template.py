#!/usr/bin/env python3
"""
Create a React SSR template optimized for static HTML generation.

This script:
1. Extracts the existing Next.js template
2. Adds SSR-specific dependencies and scripts
3. Creates a render-to-static.js script
4. Packages as react-ssr-template.tar.gz

Usage:
    python create_ssr_template.py [--version 1.0.0] [--output react-ssr-template-v1.0.0.tar.gz]
"""

import argparse
import json
import os
import shutil
import tarfile
import tempfile
from datetime import datetime
from pathlib import Path


def extract_nextjs_template(template_path: Path, extract_dir: Path) -> None:
    """Extract the Next.js template to directory."""
    print(f"Extracting Next.js template from {template_path}")
    with tarfile.open(template_path, 'r:gz') as tar:
        tar.extractall(path=extract_dir)
    print("✅ Template extracted")


def add_ssr_dependencies(template_dir: Path) -> None:
    """Add SSR-specific dependencies to package.json."""
    package_json_path = template_dir / "package.json"
    
    with open(package_json_path, 'r') as f:
        package_data = json.load(f)
    
    # Add SSR dependencies (these should already be included from Next.js template)
    ssr_deps = {
        "react-dom": package_data.get("dependencies", {}).get("react-dom", "^18.0.0"),
        "@types/react-dom": package_data.get("devDependencies", {}).get("@types/react-dom", "^18.0.0")
    }
    
    # Ensure SSR deps are in dependencies (not just devDependencies)
    if "dependencies" not in package_data:
        package_data["dependencies"] = {}
    
    for dep, version in ssr_deps.items():
        if dep not in package_data["dependencies"]:
            package_data["dependencies"][dep] = version
    
    # Add SSR script
    if "scripts" not in package_data:
        package_data["scripts"] = {}
    
    package_data["scripts"]["render-static"] = "node render-to-static.js"
    
    # Update package name and description
    package_data["name"] = "react-ssr-template"
    package_data["description"] = "React SSR template for static HTML generation"
    
    # Enable ES modules
    package_data["type"] = "module"
    
    # Add ESBuild for reliable TypeScript/JSX compilation
    if "dependencies" not in package_data:
        package_data["dependencies"] = {}
    package_data["dependencies"]["esbuild"] = "^0.19.0"
    
    with open(package_json_path, 'w') as f:
        json.dump(package_data, f, indent=2)
    
    print("✅ Added SSR dependencies to package.json")


def create_render_script(template_dir: Path) -> None:
    """Create the render-to-static.js script."""
    render_script = '''#!/usr/bin/env node

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CSS Variables for ShadCN theming
const cssVariables = `
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(222 47% 11%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222 47% 11%);
  --primary: hsl(217 91% 60%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(210 40% 96%);
  --secondary-foreground: hsl(215 25% 27%);
  --muted: hsl(210 40% 96%);
  --muted-foreground: hsl(215 16% 47%);
  --accent: hsl(142 71% 45%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 85% 60%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(214 32% 91%);
  --input: hsl(214 32% 91%);
  --ring: hsl(217 91% 60%);
  --radius: 8px;
}

.dark {
  --background: hsl(222 84% 5%);
  --foreground: hsl(213 31% 91%);
  --card: hsl(222 84% 5%);
  --card-foreground: hsl(213 31% 91%);
  --primary: hsl(217 91% 60%);
  --primary-foreground: hsl(222 47% 1%);
  --secondary: hsl(217 32% 17%);
  --secondary-foreground: hsl(215 20% 65%);
  --muted: hsl(217 32% 17%);
  --muted-foreground: hsl(215 20% 65%);
  --accent: hsl(142 71% 45%);
  --accent-foreground: hsl(210 40% 98%);
  --destructive: hsl(0 63% 31%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(217 32% 17%);
  --input: hsl(217 32% 17%);
  --ring: hsl(217 91% 60%);
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;

// Basic interactivity script for previews
const interactivityScript = `
document.addEventListener('click', function(e) {
  const target = e.target.closest('[data-event]');
  if (!target) return;

  const [event, handler] = target.dataset.event.split(':');
  
  if (event === 'click') {
    switch (handler) {
      case 'toggleTask':
        toggleTask(target.dataset.taskId);
        break;
      case 'addTask':
        console.log('Add task clicked');
        break;
      default:
        console.log('Handler not implemented:', handler);
    }
  }
});

function toggleTask(taskId) {
  const taskElement = document.querySelector(\`[data-task-id="\${taskId}"]\`);
  if (taskElement) {
    const checkbox = taskElement.querySelector('button[data-event="click:toggleTask"]');
    const title = taskElement.querySelector('[data-task-title]');
    
    if (checkbox && title) {
      if (checkbox.classList.contains('bg-accent')) {
        // Mark as incomplete
        checkbox.classList.remove('bg-accent', 'border-accent');
        checkbox.classList.add('border-muted-foreground');
        checkbox.innerHTML = '';
        title.classList.remove('line-through', 'text-muted-foreground');
        title.classList.add('text-foreground');
      } else {
        // Mark as complete
        checkbox.classList.add('bg-accent', 'border-accent');
        checkbox.classList.remove('border-muted-foreground');
        checkbox.innerHTML = '<span class="text-accent-foreground text-xs">✓</span>';
        title.classList.add('line-through', 'text-muted-foreground');
        title.classList.remove('text-foreground');
      }
    }
  }
}
`;

async function renderComponent() {
  try {
    // Import the App component (converted from .tsx to .js during rendering)
    const { default: App } = await import('./src/App.js');
    
    // Render to static HTML
    const staticHTML = renderToStaticMarkup(React.createElement(App));
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${cssVariables}
    </style>
</head>
<body>
    ${staticHTML}
    <script>
        ${interactivityScript}
    </script>
</body>
</html>`;

    return fullHTML;
  } catch (error) {
    console.error('Error rendering component:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting React SSR rendering...');
    const html = await renderComponent();
    
    // Write to output.html
    writeFileSync('output.html', html, 'utf8');
    console.log('✅ Static HTML generated successfully: output.html');
    
  } catch (error) {
    console.error('❌ Rendering failed:', error);
    process.exit(1);
  }
}

main();
'''
    
    script_path = template_dir / "render-to-static.js"
    with open(script_path, 'w') as f:
        f.write(render_script)
    
    # Make script executable
    os.chmod(script_path, 0o755)
    
    print("✅ Created render-to-static.js script")


def create_src_directory(template_dir: Path) -> None:
    """Create src directory with placeholder App.tsx."""
    src_dir = template_dir / "src"
    src_dir.mkdir(exist_ok=True)
    
    placeholder_app = '''import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function App() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Placeholder App</CardTitle>
          <p className="text-muted-foreground">This will be replaced with your App.tsx</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input placeholder="Placeholder input..." className="flex-1" />
            <Button>Placeholder Button</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This is a placeholder component that will be replaced when rendering.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
'''
    
    app_path = src_dir / "App.tsx"
    with open(app_path, 'w') as f:
        f.write(placeholder_app)
    
    print("✅ Created src/App.tsx placeholder")


def create_ssr_template(input_template: Path, output_template: Path, version: str = "1.0.0") -> None:
    """Create React SSR template from Next.js template."""
    
    # Create temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        extract_dir = temp_path / "template"
        
        # Extract Next.js template
        extract_nextjs_template(input_template, extract_dir)
        
        # Modify for SSR
        add_ssr_dependencies(extract_dir)
        create_render_script(extract_dir)
        create_src_directory(extract_dir)
        
        # Create new template archive
        print(f"📦 Creating SSR template: {output_template}")
        with tarfile.open(output_template, 'w:gz') as tar:
            tar.add(extract_dir, arcname=".")
        
        # Calculate size
        new_size = output_template.stat().st_size / 1024 / 1024
        print(f"✅ SSR template created: {output_template} ({new_size:.1f} MB)")
        
        # Verify contents
        print("\n🔍 Verifying template contents...")
        with tarfile.open(output_template, 'r:gz') as tar:
            files = tar.getnames()
            required_files = [
                "./package.json",
                "./render-to-static.js", 
                "./src/App.tsx",
                "./components/ui/card.tsx",
                "./components/ui/button.tsx",
                "./components/ui/input.tsx"
            ]
            
            for required_file in required_files:
                if required_file in files:
                    print(f"  ✅ {required_file}")
                else:
                    print(f"  ❌ {required_file} - MISSING")


def main():
    parser = argparse.ArgumentParser(
        description="Create React SSR template for static HTML generation"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path.home() / ".mcp-tools/templates/nextjs-shadcn-template-v1.7.2-no-docker.tar.gz",
        help="Input Next.js template file"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path.home() / ".mcp-tools/templates/react-ssr-template-v1.0.0.tar.gz",
        help="Output SSR template file"
    )
    parser.add_argument(
        "--version",
        type=str,
        default="1.0.0",
        help="Template version"
    )
    
    args = parser.parse_args()
    
    # Validate input exists
    if not args.input.exists():
        print(f"❌ Input template not found: {args.input}")
        return 1
    
    # Ensure output directory exists
    args.output.parent.mkdir(parents=True, exist_ok=True)
    
    # Create SSR template
    print("🚀 Creating React SSR Template")
    print("=" * 50)
    create_ssr_template(args.input, args.output, args.version)
    
    # Print summary
    print("\n" + "="*60)
    print("✅ React SSR Template Creation Complete!")
    print(f"📁 Input:  {args.input}")
    print(f"📦 Output: {args.output}")
    print(f"🏷️  Version: {args.version}")
    print("\n📋 Template includes:")
    print("  • All ShadCN UI components from Next.js template")
    print("  • Pre-installed node_modules with React SSR dependencies") 
    print("  • render-to-static.js script for HTML generation")
    print("  • src/App.tsx placeholder (gets replaced during rendering)")
    print("  • Tailwind CSS + custom CSS variables")
    print("  • Basic interactivity script for previews")
    print("\n🎯 Next steps:")
    print("  1. Update ReactToStaticRenderer to use this template")
    print("  2. Test with leonardo-todo App.tsx")
    print("  3. Verify HTML output quality")
    print("=" * 60)


if __name__ == "__main__":
    main()