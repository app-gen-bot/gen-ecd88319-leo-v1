#!/usr/bin/env python3
"""
Preview Compiler - Converts component descriptions to HTML

This compiler takes a component description (JSON/YAML) and assembles
it into a complete HTML preview using pre-built components.
"""

import json
import yaml
import re
from pathlib import Path
from typing import Dict, List, Any, Optional


class PreviewCompiler:
    def __init__(self, templates_dir: str = None, components_dir: str = None):
        """Initialize the compiler with template and component directories."""
        base_dir = Path(__file__).parent
        self.templates_dir = Path(templates_dir) if templates_dir else base_dir / "templates"
        self.components_dir = Path(components_dir) if components_dir else base_dir / "components"
        
        # Load base template
        self.base_template = self._load_template("base-template.html")
        
    def _load_template(self, filename: str) -> str:
        """Load a template file."""
        template_path = self.templates_dir / filename
        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")
        return template_path.read_text()
        
    def _load_component(self, component_name: str) -> str:
        """Load a component template."""
        component_path = self.components_dir / f"{component_name}.html"
        if not component_path.exists():
            raise FileNotFoundError(f"Component not found: {component_path}")
        return component_path.read_text()
        
    def _replace_placeholders(self, template: str, values: Dict[str, Any]) -> str:
        """Replace {{PLACEHOLDER}} values in template."""
        result = template
        
        # Simple placeholder replacement
        for key, value in values.items():
            placeholder = f"{{{{{key}}}}}"
            if isinstance(value, (list, dict)):
                continue  # Skip complex types for simple replacement
            result = result.replace(placeholder, str(value))
            
        return result
        
    def _render_component(self, component_def: Dict[str, Any]) -> str:
        """Render a single component based on its definition."""
        component_type = component_def.get("type")
        if not component_type:
            raise ValueError("Component must have a 'type' field")
            
        # Load component template
        component_html = self._load_component(component_type)
        
        # Replace placeholders
        return self._replace_placeholders(component_html, component_def)
        
    def compile_from_description(self, description: Dict[str, Any]) -> str:
        """Compile a complete HTML preview from a component description."""
        # Extract app-level settings
        app_title = description.get("title", "App Preview")
        components = description.get("components", [])
        
        # Render all components
        rendered_components = []
        for component_def in components:
            try:
                rendered_component = self._render_component(component_def)
                rendered_components.append(rendered_component)
            except Exception as e:
                print(f"Warning: Failed to render component {component_def.get('type', 'unknown')}: {e}")
                continue
                
        # Combine components
        content = f'<div class="min-h-screen">\n{"".join(rendered_components)}\n</div>'
        
        # Insert into base template
        html = self.base_template.replace("{{APP_TITLE}}", app_title)
        html = html.replace("{{CONTENT}}", content)
        
        return html
        
    def compile_from_file(self, description_file: str) -> str:
        """Compile HTML from a description file (JSON or YAML)."""
        file_path = Path(description_file)
        content = file_path.read_text()
        
        # Parse based on file extension
        if file_path.suffix.lower() == '.json':
            description = json.loads(content)
        elif file_path.suffix.lower() in ['.yml', '.yaml']:
            description = yaml.safe_load(content)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
            
        return self.compile_from_description(description)


def create_sample_description() -> Dict[str, Any]:
    """Create a sample TodoList description matching our replit example."""
    return {
        "title": "TodoList - Stay organized, get things done",
        "components": [
            {
                "type": "header",
                "ICON": "checklist",
                "TITLE": "TodoList", 
                "SUBTITLE": "Stay organized, get things done",
                "STATUS_INDICATORS": '<div class="flex items-center gap-2 text-sm text-muted-foreground"><div class="flex items-center gap-1"><div class="w-2 h-2 bg-accent rounded-full"></div><span>3 total tasks</span></div><div class="flex items-center gap-1"><div class="w-2 h-2 bg-accent rounded-full"></div><span>1 completed</span></div></div>'
            },
            {
                "type": "task-input",
                "PLACEHOLDER": "Add a new task...",
                "BUTTON_TEXT": "Add Task"
            },
            {
                "type": "filter-tabs",
                "FILTERS": [
                    {"VALUE": "all", "LABEL": "All Tasks", "ICON": "inbox", "ACTIVE": True},
                    {"VALUE": "active", "LABEL": "Active", "ICON": "radio_button_unchecked", "ACTIVE": False},
                    {"VALUE": "completed", "LABEL": "Completed", "ICON": "check_circle", "ACTIVE": False}
                ],
                "SHOW_CLEAR": True
            },
            {
                "type": "task-item",
                "ID": "task_1",
                "TITLE": "Complete project documentation",
                "COMPLETED": False,
                "CREATED_TIME": "Created today at 2:30 PM"
            },
            {
                "type": "task-item", 
                "ID": "task_2",
                "TITLE": "Review client feedback",
                "COMPLETED": True,
                "CREATED_TIME": "Completed yesterday at 4:15 PM"
            },
            {
                "type": "task-item",
                "ID": "task_3", 
                "TITLE": "Prepare presentation for Monday meeting",
                "COMPLETED": False,
                "CREATED_TIME": "Created today at 10:45 AM"
            }
        ]
    }


if __name__ == "__main__":
    # Test the compiler
    compiler = PreviewCompiler()
    
    # Create sample description
    description = create_sample_description()
    
    # Compile to HTML
    html = compiler.compile_from_description(description)
    
    # Save output
    output_path = Path(__file__).parent / "test_output.html"
    output_path.write_text(html)
    print(f"Generated preview saved to: {output_path}")