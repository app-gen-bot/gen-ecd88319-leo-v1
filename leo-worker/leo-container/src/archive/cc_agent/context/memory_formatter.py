"""
Memory Formatter - Transforms various content types into mem0-compatible descriptions.

This module helps ensure that content is stored in a meaningful, semantic format
that mem0 will accept and index properly.
"""

import re
from typing import Dict, Any, Optional, Tuple
from pathlib import Path


class MemoryFormatter:
    """Formats different types of content into meaningful memory descriptions."""
    
    @staticmethod
    def format_code_snippet(
        code: str,
        language: str = "python",
        purpose: Optional[str] = None,
        context: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Transform code snippet into architectural description.
        
        Args:
            code: Raw code snippet
            language: Programming language
            purpose: What the code does (if known)
            context: Additional context
            
        Returns:
            Tuple of (formatted_content, suggested_context)
        """
        # Analyze code structure
        if language.lower() == "python":
            return MemoryFormatter._format_python_code(code, purpose, context)
        elif language.lower() in ["javascript", "typescript", "js", "ts"]:
            return MemoryFormatter._format_javascript_code(code, purpose, context)
        else:
            return MemoryFormatter._format_generic_code(code, purpose, context)
    
    @staticmethod
    def _format_python_code(code: str, purpose: str = None, context: str = None) -> Tuple[str, str]:
        """Format Python code into description."""
        description_parts = []
        
        # Detect function definitions
        func_match = re.search(r'def\s+(\w+)\s*\((.*?)\)', code)
        if func_match:
            func_name = func_match.group(1)
            params = func_match.group(2)
            
            # Analyze function purpose from name and content
            if 'auth' in func_name.lower():
                description_parts.append(f"Authentication function '{func_name}'")
            elif 'hash' in func_name.lower():
                description_parts.append(f"Hashing function '{func_name}'")
            elif 'validate' in func_name.lower():
                description_parts.append(f"Validation function '{func_name}'")
            else:
                description_parts.append(f"Function '{func_name}'")
            
            # Add parameter info if meaningful
            if params.strip():
                param_list = [p.strip() for p in params.split(',')]
                description_parts.append(f"accepts {len(param_list)} parameters")
        
        # Detect class definitions
        class_match = re.search(r'class\s+(\w+)(?:\s*\((.*?)\))?', code)
        if class_match:
            class_name = class_match.group(1)
            base_classes = class_match.group(2) or ""
            
            if 'Repository' in class_name or 'Repository' in base_classes:
                description_parts.append(f"Repository pattern implementation for {class_name}")
            elif 'Service' in class_name:
                description_parts.append(f"Service layer class {class_name}")
            elif 'Model' in class_name:
                description_parts.append(f"Data model {class_name}")
            else:
                description_parts.append(f"Class {class_name}")
            
            if base_classes:
                description_parts.append(f"extending {base_classes}")
        
        # Detect common patterns
        if 'jwt' in code.lower():
            description_parts.append("implements JWT token handling")
        if 'sha256' in code.lower() or 'sha512' in code.lower():
            description_parts.append("uses SHA cryptographic hashing")
        if 'redis' in code.lower():
            description_parts.append("integrates with Redis cache")
        if 'async def' in code:
            description_parts.append("with asynchronous execution")
        
        # Add purpose if provided
        if purpose:
            description_parts.append(f"for {purpose}")
        
        # Build final description
        if description_parts:
            content = " ".join(description_parts)
        else:
            content = "Code implementation"
        
        # Suggest context
        if func_match:
            suggested_context = f"function:{func_match.group(1)}"
        elif class_match:
            suggested_context = f"class:{class_match.group(1)}"
        else:
            suggested_context = context or "implementation:general"
        
        return content, suggested_context
    
    @staticmethod
    def _format_javascript_code(code: str, purpose: str = None, context: str = None) -> Tuple[str, str]:
        """Format JavaScript/TypeScript code into description."""
        description_parts = []
        
        # Detect function patterns
        func_patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*(?:async\s*)?\(',
            r'(\w+)\s*:\s*(?:async\s*)?\(',
        ]
        
        for pattern in func_patterns:
            match = re.search(pattern, code)
            if match:
                func_name = match.group(1)
                description_parts.append(f"Function '{func_name}'")
                break
        
        # Detect React components
        if 'React' in code or 'useState' in code or 'useEffect' in code:
            description_parts.append("React component")
        
        # Detect common patterns
        if 'fetch(' in code or 'axios' in code:
            description_parts.append("implements API communication")
        if 'express' in code.lower():
            description_parts.append("Express.js route handler")
        
        if purpose:
            description_parts.append(f"for {purpose}")
        
        content = " ".join(description_parts) if description_parts else "JavaScript implementation"
        suggested_context = context or "implementation:javascript"
        
        return content, suggested_context
    
    @staticmethod
    def _format_generic_code(code: str, purpose: str = None, context: str = None) -> Tuple[str, str]:
        """Format generic code into description."""
        if purpose:
            content = f"Code implementation for {purpose}"
        else:
            content = "Code implementation with custom logic"
        
        suggested_context = context or "implementation:general"
        return content, suggested_context
    
    @staticmethod
    def format_configuration(
        config_data: Dict[str, Any],
        service_name: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Transform configuration into design decision description.
        
        Args:
            config_data: Configuration dictionary
            service_name: Name of the service being configured
            
        Returns:
            Tuple of (formatted_content, suggested_context)
        """
        description_parts = []
        
        if service_name:
            description_parts.append(f"{service_name} configuration")
        
        # Analyze common configuration patterns
        if 'max_retries' in config_data or 'retry' in str(config_data).lower():
            retries = config_data.get('max_retries', 'multiple')
            description_parts.append(f"implements retry mechanism with {retries} attempts")
        
        if 'timeout' in config_data:
            timeout = config_data.get('timeout')
            description_parts.append(f"configured with {timeout}ms timeout")
        
        if 'pool_size' in config_data or 'max_connections' in config_data:
            size = config_data.get('pool_size') or config_data.get('max_connections')
            description_parts.append(f"connection pool size of {size}")
        
        if 'cache' in str(config_data).lower():
            description_parts.append("with caching enabled")
        
        content = " ".join(description_parts) if description_parts else "Service configuration"
        suggested_context = f"decision:configuration:{service_name}" if service_name else "decision:configuration"
        
        return content, suggested_context
    
    @staticmethod
    def format_architecture_decision(
        decision: str,
        rationale: str,
        alternatives: Optional[list] = None,
        trade_offs: Optional[Dict[str, str]] = None
    ) -> Tuple[str, str]:
        """
        Format an architecture decision record.
        
        Args:
            decision: The decision made
            rationale: Why this decision was made
            alternatives: Other options considered
            trade_offs: Pros and cons
            
        Returns:
            Tuple of (formatted_content, suggested_context)
        """
        parts = [f"Architecture decision: {decision}"]
        parts.append(f"chosen because {rationale}")
        
        if alternatives:
            parts.append(f"over alternatives: {', '.join(alternatives)}")
        
        if trade_offs:
            if 'pros' in trade_offs:
                parts.append(f"Benefits: {trade_offs['pros']}")
            if 'cons' in trade_offs:
                parts.append(f"Trade-offs: {trade_offs['cons']}")
        
        content = ". ".join(parts)
        suggested_context = "architecture:decision"
        
        return content, suggested_context
    
    @staticmethod
    def format_file_description(
        file_path: str,
        purpose: str,
        key_features: Optional[list] = None
    ) -> Tuple[str, str]:
        """
        Format file/module description.
        
        Args:
            file_path: Path to the file
            purpose: What the file does
            key_features: Important features or exports
            
        Returns:
            Tuple of (formatted_content, suggested_context)
        """
        file_name = Path(file_path).name
        parts = [f"Module {file_name} {purpose}"]
        
        if key_features:
            parts.append(f"providing {', '.join(key_features)}")
        
        content = " ".join(parts)
        suggested_context = f"file:{file_path}"
        
        return content, suggested_context
    
    @staticmethod
    def suggest_context_pattern(content: str) -> str:
        """
        Suggest appropriate context pattern based on content.
        
        Args:
            content: The memory content
            
        Returns:
            Suggested context pattern
        """
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['architecture', 'microservice', 'monolith']):
            return "architecture:design"
        elif any(word in content_lower for word in ['pattern', 'repository', 'factory', 'singleton']):
            return "pattern:design"
        elif any(word in content_lower for word in ['decided', 'chose', 'selected']):
            return "decision:technical"
        elif any(word in content_lower for word in ['implements', 'uses', 'validates']):
            return "implementation:feature"
        elif any(word in content_lower for word in ['integrates', 'connects', 'communicates']):
            return "integration:service"
        elif any(word in content_lower for word in ['optimized', 'performance', 'caching']):
            return "optimization:performance"
        else:
            return "general:knowledge"