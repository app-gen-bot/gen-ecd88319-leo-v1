"""Frontend initialization using pre-built templates for fast, reliable project creation.

This module uses pre-built Next.js + ShadCN templates stored as tar.gz files.
Templates include all dependencies pre-installed, avoiding npm installation issues.
"""

import json
import logging
import os
import shutil
import subprocess
import tarfile
import time
from pathlib import Path
from typing import Tuple, Optional

logger = logging.getLogger(__name__)


class FrontendInitializer:
    """Handles frontend project initialization using templates."""
    
    def __init__(self):
        # Template configuration
        self.template_version = "1.7.2-no-docker"
        self.template_cache_dir = Path.home() / ".mcp-tools" / "templates"
        self.template_filename = f"nextjs-shadcn-template-v{self.template_version}.tar.gz"
        
        # Ensure cache directory exists
        self.template_cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get_cached_template(self) -> Tuple[bool, str, Optional[Path]]:
        """Get template from cache.
        
        Returns:
            Tuple of (success, message, cached_template_path)
        """
        cached_template = self.template_cache_dir / self.template_filename
        
        if cached_template.exists():
            logger.info(f"Template found in cache: {cached_template}")
            return True, "Template found in cache", cached_template
        else:
            return False, f"Template not found in cache: {cached_template}", None
    
    def extract_template(self, template_path: Path, project_path: Path) -> Tuple[bool, str]:
        """Extract template to project directory.
        
        Args:
            template_path: Path to the template tar.gz file
            project_path: Destination directory for extraction
            
        Returns:
            Tuple of (success, message)
        """
        try:
            # Extract template
            logger.info(f"Extracting template from {template_path} to {project_path}")
            with tarfile.open(template_path, 'r:gz') as tar:
                tar.extractall(path=project_path)
            
            # Template now has correct permissions, no need to fix
            logger.info(f"✅ Template extracted with correct ec2-user permissions")
            
            # Verify extraction worked
            package_json = project_path / "package.json"
            if not package_json.exists():
                return False, "Template extraction failed - package.json not found"
            
            logger.info("Template extracted successfully")
            return True, "Template extracted successfully"
            
        except Exception as e:
            return False, f"Template extraction failed: {e}"
    
    def customize_project(self, project_path: Path, project_name: str, port: int = 5000) -> Tuple[bool, str]:
        """Customize extracted project with new name and settings.
        
        Args:
            project_path: Path to extracted project
            project_name: New project name
            port: Port number for development server
            
        Returns:
            Tuple of (success, message)
        """
        try:
            package_json_path = project_path / "package.json"
            
            # Read package.json
            with open(package_json_path, 'r') as f:
                package_data = json.load(f)
            
            # Update project name
            package_data["name"] = project_name
            
            # Update dev and start scripts to use assigned port
            package_data["scripts"]["dev"] = f"node node_modules/next/dist/bin/next dev -p {port}"
            package_data["scripts"]["start"] = f"node node_modules/next/dist/bin/next start -p {port}"
            
            # Write back package.json
            with open(package_json_path, 'w') as f:
                json.dump(package_data, f, indent=2)
            
            logger.info(f"Project customized with name: {project_name} and port: {port}")
            return True, f"Project customized with name: {project_name} and port: {port}"
            
        except Exception as e:
            return False, f"Project customization failed: {e}"
    
    def verify_project(self, project_path: Path) -> Tuple[bool, str]:
        """Verify the project is ready to use.
        
        Args:
            project_path: Path to the project
            
        Returns:
            Tuple of (success, message)
        """
        package_json = project_path / "package.json"
        node_modules = project_path / "node_modules"
        typescript_module = node_modules / "typescript"
        
        if not package_json.exists():
            return False, "Project verification failed - package.json missing"
        
        if not node_modules.exists():
            return False, "Project verification failed - node_modules missing"
        
        if not typescript_module.exists():
            return False, "Project verification failed - TypeScript module missing"
        
        return True, "Project verification successful"
    
    def initialize(self, project_path: Path, project_name: str, port: int = 5000) -> Tuple[bool, str]:
        """Initialize a frontend project using the template.
        
        Args:
            project_path: Path where the project should be created
            project_name: Name of the project
            port: Port number for development server
            
        Returns:
            Tuple of (success, message)
        """
        start_time = time.time()
        
        # Step 1: Get template from cache
        template_success, template_message, template_path = self.get_cached_template()
        if not template_success:
            return False, f"Template acquisition failed: {template_message}"
        
        # Step 2: Extract template to project directory
        extract_success, extract_message = self.extract_template(template_path, project_path)
        if not extract_success:
            return False, f"Template extraction failed: {extract_message}"
        
        # Step 3: Customize project (update name and port in package.json)
        customize_success, customize_message = self.customize_project(project_path, project_name, port)
        if not customize_success:
            return False, f"Project customization failed: {customize_message}"
        
        # Step 4: Verify the project is ready
        verify_success, verify_message = self.verify_project(project_path)
        if not verify_success:
            return False, verify_message
        
        duration = time.time() - start_time
        logger.info(f"Frontend initialization completed in {duration:.2f}s")
        
        return True, f"Successfully initialized Next.js project '{project_name}' from template v{self.template_version}"


def initialize_frontend(project_path: Path, project_name: str, port: int = 5000) -> Tuple[bool, str]:
    """Initialize a frontend project.
    
    Args:
        project_path: Path where the project should be created
        project_name: Name of the project
        port: Port number for development server
        
    Returns:
        Tuple of (success, message)
    """
    initializer = FrontendInitializer()
    return initializer.initialize(project_path, project_name, port)