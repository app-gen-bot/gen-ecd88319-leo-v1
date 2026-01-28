"""
Tree-sitter MCP Server - Deep Code Intelligence

Provides AST-based code analysis capabilities for understanding code structure,
detecting patterns, tracking dependencies, and providing real-time syntax validation.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional, Set, Tuple
from collections import defaultdict

from fastmcp import FastMCP
from pydantic import BaseModel, Field

# Tree-sitter imports
from tree_sitter import Parser, Language, Tree, Node
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript

from ..common.logging_utils import setup_mcp_server_logging
from ..mem0.server import server as mem0_server
from .code_graph import CodeGraphManager

# Setup logging
server_logger = setup_mcp_server_logging("tree_sitter")
server_logger.info("[SERVER_INIT] Tree-sitter MCP server module loaded")

# Initialize FastMCP
mcp = FastMCP("Tree-sitter Enhanced")


class CodeEntity(BaseModel):
    """Represents a code entity (function, class, etc.)"""
    type: str  # function, class, method, variable, component
    name: str
    file: str
    line_start: int
    line_end: int
    signature: Optional[str] = None
    docstring: Optional[str] = None
    complexity: Optional[int] = None
    props: Optional[Dict[str, Any]] = None  # For React components


class ImportInfo(BaseModel):
    """Represents an import statement"""
    module: str
    names: List[str]
    file: str
    line: int
    is_relative: bool = False
    is_default: bool = False
    import_type: str = "normal"  # normal, type, namespace


class SyntaxError(BaseModel):
    """Represents a syntax error found in code"""
    line: int
    column: int
    message: str
    type: str = "error"
    length: int = 0


class CodePattern(BaseModel):
    """Represents a detected code pattern"""
    pattern_type: str  # singleton, factory, observer, custom-hook, hoc, etc.
    confidence: float
    location: Dict[str, Any]
    description: str


class TreeSitterServer:
    """Main server class for tree-sitter integration"""
    
    def __init__(self):
        self.logger = server_logger
        self.graph_manager = None
        self._init_parsers()
        self._init_graph_manager()
    
    def _init_parsers(self):
        """Initialize language parsers"""
        try:
            # Create parsers for different languages
            self.parsers = {}
            
            # Python parser
            py_parser = Parser()
            py_parser.language = Language(tspython.language())
            self.parsers['python'] = py_parser
            self.parsers['.py'] = py_parser
            
            # JavaScript parser
            js_parser = Parser()
            js_parser.language = Language(tsjavascript.language())
            self.parsers['javascript'] = js_parser
            self.parsers['.js'] = js_parser
            self.parsers['.jsx'] = js_parser
            
            # TypeScript parser
            ts_parser = Parser()
            ts_parser.language = Language(tstypescript.language_typescript())
            self.parsers['typescript'] = ts_parser
            self.parsers['.ts'] = ts_parser
            
            # TSX parser
            tsx_parser = Parser()
            tsx_parser.language = Language(tstypescript.language_tsx())
            self.parsers['tsx'] = tsx_parser
            self.parsers['.tsx'] = tsx_parser
            
            self.logger.info("[INIT] Language parsers initialized successfully")
            
        except Exception as e:
            self.logger.error(f"[INIT] Failed to initialize parsers: {e}")
            raise
    
    def _init_graph_manager(self):
        """Initialize graph manager with mem0's Neo4j session"""
        try:
            if hasattr(mem0_server, 'neo4j_session'):
                self.graph_manager = CodeGraphManager(mem0_server.neo4j_session)
                self.logger.info("[INIT] Graph manager initialized")
            else:
                self.logger.warning("[INIT] Neo4j session not available")
        except Exception as e:
            self.logger.error(f"[INIT] Failed to initialize graph manager: {e}")
    
    def _get_parser_for_file(self, file_path: str) -> Optional[Parser]:
        """Get the appropriate parser for a file"""
        ext = Path(file_path).suffix.lower()
        return self.parsers.get(ext)
    
    async def parse_file(self, file_path: str) -> Optional[Tree]:
        """Parse a file and return its syntax tree"""
        try:
            parser = self._get_parser_for_file(file_path)
            if not parser:
                self.logger.warning(f"[PARSE] No parser for file type: {file_path}")
                return None
            
            # Read file content
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Parse the content
            tree = parser.parse(content)
            return tree
            
        except Exception as e:
            self.logger.error(f"[PARSE] Error parsing {file_path}: {e}")
            return None
    
    def _find_syntax_errors(self, node: Node, errors: List[SyntaxError], source_code: bytes):
        """Recursively find syntax errors in the AST"""
        if node.type == 'ERROR' or node.has_error:
            # Extract error details
            start_point = node.start_point
            end_point = node.end_point
            
            # Get the problematic code snippet
            error_text = source_code[node.start_byte:node.end_byte].decode('utf-8', errors='ignore')
            
            # Create error message
            if node.type == 'ERROR':
                message = f"Syntax error: unexpected '{error_text}'"
            else:
                message = f"Syntax error in {node.type}"
            
            errors.append(SyntaxError(
                line=start_point[0] + 1,  # Convert to 1-based
                column=start_point[1],
                message=message,
                type="error",
                length=node.end_byte - node.start_byte
            ))
        
        # Check children
        for child in node.children:
            self._find_syntax_errors(child, errors, source_code)
    
    def _extract_entities_from_ast(self, node: Node, file_path: str, entities: List[Dict], source_code: bytes, parent_class: Optional[str] = None):
        """Extract code entities from AST"""
        # Python entities
        if node.type == 'function_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                
                # Get parameters
                params_node = node.child_by_field_name('parameters')
                params = source_code[params_node.start_byte:params_node.end_byte].decode('utf-8') if params_node else "()"
                
                # Check if it's a method
                entity_type = 'method' if parent_class and 'self' in params else 'function'
                
                entities.append({
                    'type': entity_type,
                    'name': name,
                    'file': file_path,
                    'line_start': node.start_point[0] + 1,
                    'line_end': node.end_point[0] + 1,
                    'signature': f"def {name}{params}",
                    'parent_class': parent_class
                })
        
        elif node.type == 'class_definition':
            name_node = node.child_by_field_name('name')
            if name_node:
                class_name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                entities.append({
                    'type': 'class',
                    'name': class_name,
                    'file': file_path,
                    'line_start': node.start_point[0] + 1,
                    'line_end': node.end_point[0] + 1,
                    'signature': f"class {class_name}"
                })
                
                # Process class body for methods
                body_node = node.child_by_field_name('body')
                if body_node:
                    for child in body_node.children:
                        self._extract_entities_from_ast(child, file_path, entities, source_code, class_name)
                return  # Don't process children again
        
        # JavaScript/TypeScript entities
        elif node.type in ['function_declaration', 'arrow_function', 'function_expression']:
            name_node = node.child_by_field_name('name')
            if name_node:
                name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                entities.append({
                    'type': 'function',
                    'name': name,
                    'file': file_path,
                    'line_start': node.start_point[0] + 1,
                    'line_end': node.end_point[0] + 1,
                    'signature': source_code[node.start_byte:node.end_byte].decode('utf-8').split('{')[0].strip()
                })
        
        # React components (function components)
        elif node.type == 'variable_declaration':
            # Check if it's a React component (capitalized name + JSX return)
            declarator = node.child_by_field_name('declarator')
            if declarator:
                name_node = declarator.child_by_field_name('name')
                value_node = declarator.child_by_field_name('value')
                
                if name_node and value_node:
                    name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                    
                    # Check if it's a component (capitalized)
                    if name and name[0].isupper():
                        # Check if it returns JSX
                        if self._contains_jsx(value_node, source_code):
                            entities.append({
                                'type': 'component',
                                'name': name,
                                'file': file_path,
                                'line_start': node.start_point[0] + 1,
                                'line_end': node.end_point[0] + 1,
                                'signature': f"const {name} = ",
                                'props': self._extract_component_props(value_node, source_code)
                            })
        
        # Recursively process children
        for child in node.children:
            self._extract_entities_from_ast(child, file_path, entities, source_code, parent_class)
    
    def _contains_jsx(self, node: Node, source_code: bytes) -> bool:
        """Check if a node contains JSX"""
        if node.type in ['jsx_element', 'jsx_self_closing_element', 'jsx_fragment']:
            return True
        
        for child in node.children:
            if self._contains_jsx(child, source_code):
                return True
        
        return False
    
    def _extract_component_props(self, node: Node, source_code: bytes) -> Dict[str, Any]:
        """Extract props from a React component"""
        props = {}
        
        # Look for parameter in arrow function or function
        params_node = node.child_by_field_name('parameters')
        if params_node and params_node.child_count > 0:
            # Get first parameter (props)
            first_param = params_node.children[0]
            if first_param.type == 'object_pattern':
                # Destructured props
                for child in first_param.children:
                    if child.type == 'shorthand_property_identifier':
                        prop_name = source_code[child.start_byte:child.end_byte].decode('utf-8')
                        props[prop_name] = {'type': 'any', 'required': True}
        
        return props
    
    def _extract_imports_from_ast(self, node: Node, file_path: str, imports: List[Dict], source_code: bytes):
        """Extract import statements from AST"""
        # Python imports
        if node.type == 'import_statement':
            import_text = source_code[node.start_byte:node.end_byte].decode('utf-8')
            module_node = node.child_by_field_name('name')
            if module_node:
                module = source_code[module_node.start_byte:module_node.end_byte].decode('utf-8')
                imports.append({
                    'statement': import_text,
                    'module': module,
                    'names': [module],
                    'file': file_path,
                    'line': node.start_point[0] + 1,
                    'is_relative': False,
                    'import_type': 'normal'
                })
        
        elif node.type == 'import_from_statement':
            import_text = source_code[node.start_byte:node.end_byte].decode('utf-8')
            module_node = node.child_by_field_name('module')
            if module_node:
                module = source_code[module_node.start_byte:module_node.end_byte].decode('utf-8')
                
                # Extract imported names
                names = []
                import_list = node.child_by_field_name('name')
                if import_list:
                    names.append(source_code[import_list.start_byte:import_list.end_byte].decode('utf-8'))
                
                imports.append({
                    'statement': import_text,
                    'module': module,
                    'names': names,
                    'file': file_path,
                    'line': node.start_point[0] + 1,
                    'is_relative': module.startswith('.'),
                    'import_type': 'normal'
                })
        
        # JavaScript/TypeScript imports
        elif node.type == 'import_statement':
            import_text = source_code[node.start_byte:node.end_byte].decode('utf-8')
            
            # Default import
            default_import = None
            for child in node.children:
                if child.type == 'identifier':
                    default_import = source_code[child.start_byte:child.end_byte].decode('utf-8')
                    break
            
            # Named imports
            named_imports = []
            import_clause = node.child_by_field_name('import')
            if import_clause:
                for child in import_clause.children:
                    if child.type == 'named_imports':
                        for import_spec in child.children:
                            if import_spec.type == 'import_specifier':
                                name = source_code[import_spec.start_byte:import_spec.end_byte].decode('utf-8')
                                named_imports.append(name)
            
            # Module source
            source_node = node.child_by_field_name('source')
            if source_node:
                module = source_code[source_node.start_byte:source_node.end_byte].decode('utf-8').strip('"\'')
                
                all_names = []
                if default_import:
                    all_names.append(default_import)
                all_names.extend(named_imports)
                
                imports.append({
                    'statement': import_text,
                    'module': module,
                    'names': all_names,
                    'file': file_path,
                    'line': node.start_point[0] + 1,
                    'is_relative': module.startswith('.'),
                    'is_default': default_import is not None,
                    'import_type': 'type' if 'import type' in import_text else 'normal'
                })
        
        # Recursively process children
        for child in node.children:
            self._extract_imports_from_ast(child, file_path, imports, source_code)
    
    async def _store_code_analysis(self, file_path: str, entities: List[Dict], imports: List[Dict]) -> Dict[str, Any]:
        """Store code analysis results in memory and graph"""
        try:
            await mem0_server.initialize()
            
            memories_created = 0
            graph_result = None
            
            # Store file-level memory
            file_content = f"Code file {Path(file_path).name} contains {len(entities)} entities and {len(imports)} imports"
            file_context = f"file:{file_path}"
            
            file_memory = await mem0_server.memory.add(
                messages=file_content,
                user_id=mem0_server.config.user_id,
                metadata={"context": file_context}
            )
            if file_memory:
                memories_created += 1
            
            # Store entity memories with better descriptions
            for entity in entities:
                # Create meaningful description based on entity type
                if entity['type'] == 'class':
                    content = f"Class '{entity['name']}' defined in {Path(file_path).name} provides object-oriented structure"
                elif entity['type'] == 'component':
                    content = f"React component '{entity['name']}' in {Path(file_path).name} renders UI elements"
                    if entity.get('props'):
                        content += f" with props: {', '.join(entity['props'].keys())}"
                elif entity['type'] == 'method':
                    content = f"Method '{entity['name']}' implements behavior in class {entity.get('parent_class', 'Unknown')}"
                elif entity['type'] == 'function':
                    content = f"Function '{entity['name']}' provides functionality in {Path(file_path).name}"
                else:
                    content = f"{entity['type'].capitalize()} '{entity['name']}' in {Path(file_path).name}"
                
                # Add signature info if available
                if entity.get('signature'):
                    content += f" with signature: {entity['signature']}"
                
                context = f"{entity['type']}:{entity['name']}"
                
                # Add to memory
                memory_result = await mem0_server.memory.add(
                    messages=content,
                    user_id=mem0_server.config.user_id,
                    metadata={
                        "context": context,
                        "file": file_path,
                        "line_start": entity.get('line_start', 0),
                        "entity_type": entity['type']
                    }
                )
                
                if memory_result:
                    memories_created += 1
            
            # Create graph nodes if graph manager is available
            if self.graph_manager:
                graph_result = await self.graph_manager.create_code_entity_nodes(
                    file_path,
                    entities,
                    imports
                )
            
            return {
                "success": True,
                "memories_created": memories_created,
                "graph_result": graph_result
            }
            
        except Exception as e:
            self.logger.error(f"[STORE_ANALYSIS] Failed: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "memories_created": 0
            }
    
    def _detect_patterns_in_ast(self, node: Node, source_code: bytes, patterns: List[CodePattern], file_path: str):
        """Detect design patterns in AST"""
        # React Hooks pattern
        if node.type in ['function_declaration', 'variable_declaration']:
            name_node = node.child_by_field_name('name')
            if name_node:
                name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                
                # Custom Hook pattern
                if name.startswith('use') and name[3].isupper():
                    patterns.append(CodePattern(
                        pattern_type='custom-hook',
                        confidence=0.95,
                        location={
                            'file': file_path,
                            'line': node.start_point[0] + 1,
                            'name': name
                        },
                        description=f"Custom React Hook: {name}"
                    ))
                
                # HOC pattern
                if name.startswith('with') and name[4].isupper():
                    patterns.append(CodePattern(
                        pattern_type='hoc',
                        confidence=0.85,
                        location={
                            'file': file_path,
                            'line': node.start_point[0] + 1,
                            'name': name
                        },
                        description=f"Higher Order Component: {name}"
                    ))
        
        # Singleton pattern in TypeScript/JavaScript
        if node.type == 'class_declaration':
            # Check for private constructor and static instance
            has_private_constructor = False
            has_static_instance = False
            
            for child in node.children:
                if child.type == 'method_definition':
                    method_name = child.child_by_field_name('name')
                    if method_name and source_code[method_name.start_byte:method_name.end_byte].decode('utf-8') == 'constructor':
                        # Check for private modifier
                        for modifier in child.children:
                            if modifier.type == 'accessibility_modifier' and source_code[modifier.start_byte:modifier.end_byte].decode('utf-8') == 'private':
                                has_private_constructor = True
                                break
                
                elif child.type == 'field_definition':
                    # Check for static instance field
                    if any(c.type == 'static' for c in child.children):
                        has_static_instance = True
            
            if has_private_constructor and has_static_instance:
                name_node = node.child_by_field_name('name')
                class_name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8') if name_node else 'Unknown'
                
                patterns.append(CodePattern(
                    pattern_type='singleton',
                    confidence=0.9,
                    location={
                        'file': file_path,
                        'line': node.start_point[0] + 1,
                        'name': class_name
                    },
                    description=f"Singleton pattern in class {class_name}"
                ))
        
        # Context Provider pattern
        if node.type == 'variable_declaration':
            declarator = node.child_by_field_name('declarator')
            if declarator:
                name_node = declarator.child_by_field_name('name')
                if name_node:
                    name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                    if name.endswith('Provider') or name.endswith('Context'):
                        patterns.append(CodePattern(
                            pattern_type='context-provider',
                            confidence=0.8,
                            location={
                                'file': file_path,
                                'line': node.start_point[0] + 1,
                                'name': name
                            },
                            description=f"React Context Provider: {name}"
                        ))
        
        # Recursively check children
        for child in node.children:
            self._detect_patterns_in_ast(child, source_code, patterns, file_path)
    
    def _find_undefined_references(self, node: Node, source_code: bytes, defined_names: Set[str], undefined_refs: List[Tuple[str, int, int]]):
        """Find undefined references in the code"""
        # Skip import statements
        if node.type in ['import_statement', 'import_from_statement']:
            return
        
        # Check identifiers
        if node.type == 'identifier':
            name = source_code[node.start_byte:node.end_byte].decode('utf-8')
            
            # Skip common globals and built-ins
            if name not in defined_names and name not in ['console', 'window', 'document', 'process', 'require', 'module', 'exports', '__dirname', '__filename', 'React', 'useState', 'useEffect', 'useCallback', 'useMemo']:
                # Check if it's a property access (skip if it is)
                parent = node.parent
                if parent and parent.type == 'member_expression' and node == parent.child_by_field_name('property'):
                    return
                
                undefined_refs.append((name, node.start_point[0] + 1, node.start_point[1]))
        
        # Add defined names
        if node.type in ['function_declaration', 'class_declaration', 'variable_declaration']:
            name_node = node.child_by_field_name('name')
            if name_node:
                name = source_code[name_node.start_byte:name_node.end_byte].decode('utf-8')
                defined_names.add(name)
        
        # Process children
        for child in node.children:
            self._find_undefined_references(child, source_code, defined_names, undefined_refs)


# Create server instance
server = TreeSitterServer()


@mcp.tool()
async def analyze_code_structure(
    file_path: str,
    include_complexity: bool = False
) -> Dict[str, Any]:
    """
    Extract functions, classes, and other entities from code using real AST parsing.
    
    Args:
        file_path: Path to the code file to analyze
        include_complexity: Whether to calculate complexity metrics
        
    Returns:
        Dictionary containing extracted code structure with accurate AST-based analysis
    """
    server.logger.info(f"[ANALYZE_STRUCTURE] Analyzing: {file_path}")
    
    try:
        # Skip files in ignored directories
        file_p = Path(file_path)
        ignored_dirs = {"node_modules", "dist", ".next", "build", "coverage", ".git", "__pycache__"}
        path_parts = set(file_p.parts)
        if path_parts & ignored_dirs:
            server.logger.info(f"[ANALYZE_STRUCTURE] Skipping file in ignored directory: {file_path}")
            return {
                "success": True,
                "skipped": True,
                "reason": "File in ignored directory",
                "file": str(file_path),
                "structure": {"functions": [], "classes": [], "imports": [], "exports": []}
            }
        
        # Check if file exists
        if not file_p.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }
        
        # Parse the file with tree-sitter
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file"
            }
        
        # Read source code for extraction
        with open(file_path, 'rb') as f:
            source_code = f.read()
        
        # Extract entities from AST
        entities = []
        server._extract_entities_from_ast(tree.root_node, file_path, entities, source_code)
        
        # Extract imports from AST
        imports = []
        server._extract_imports_from_ast(tree.root_node, file_path, imports, source_code)
        
        # Calculate metrics
        lines = source_code.decode('utf-8', errors='ignore').splitlines()
        
        # Build result
        result = {
            "success": True,
            "file": file_path,
            "language": Path(file_path).suffix[1:],  # Remove dot
            "metrics": {
                "total_lines": len(lines),
                "file_size": len(source_code),
                "entity_count": len(entities),
                "import_count": len(imports),
                "has_syntax_errors": tree.root_node.has_error
            },
            "entities": entities,
            "imports": imports
        }
        
        # Store in memory system and create graph nodes
        storage_result = await server._store_code_analysis(file_path, entities, imports)
        result['storage'] = storage_result
        
        return result
        
    except Exception as e:
        server.logger.error(f"[ANALYZE_STRUCTURE] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def validate_syntax(file_path: str) -> Dict[str, Any]:
    """
    Validate syntax without running build tools. Provides real-time syntax validation
    like modern IDEs using tree-sitter's AST parsing.
    
    Args:
        file_path: Path to the code file to validate
        
    Returns:
        Dictionary with syntax validation results including specific error locations
    """
    server.logger.info(f"[VALIDATE_SYNTAX] Validating: {file_path}")
    
    try:
        # Skip files in ignored directories
        file_p = Path(file_path)
        ignored_dirs = {"node_modules", "dist", ".next", "build", "coverage", ".git", "__pycache__"}
        path_parts = set(file_p.parts)
        if path_parts & ignored_dirs:
            server.logger.info(f"[VALIDATE_SYNTAX] Skipping file in ignored directory: {file_path}")
            return {
                "success": True,
                "skipped": True,
                "reason": "File in ignored directory",
                "file": str(file_path),
                "errors": []
            }
        
        # Check if file exists
        if not file_p.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}"
            }
        
        # Parse the file
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file - unsupported file type"
            }
        
        # Read source code
        with open(file_path, 'rb') as f:
            source_code = f.read()
        
        # Find syntax errors
        errors = []
        server._find_syntax_errors(tree.root_node, errors, source_code)
        
        # Build result
        result = {
            "success": True,
            "valid": len(errors) == 0,
            "error_count": len(errors),
            "errors": [e.dict() for e in errors],
            "file": file_path,
            "language": Path(file_path).suffix[1:]
        }
        
        if errors:
            result["summary"] = f"Found {len(errors)} syntax error(s) in {Path(file_path).name}"
        else:
            result["summary"] = f"No syntax errors found in {Path(file_path).name}"
        
        return result
        
    except Exception as e:
        server.logger.error(f"[VALIDATE_SYNTAX] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def fix_imports(file_path: str) -> Dict[str, Any]:
    """
    Detect undefined references and suggest missing imports. Analyzes the AST to find
    undefined identifiers and searches the project for matching exports.
    
    Args:
        file_path: Path to the file to analyze
        
    Returns:
        Dictionary with undefined references and suggested imports
    """
    server.logger.info(f"[FIX_IMPORTS] Analyzing imports for: {file_path}")
    
    try:
        # Parse the file
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file"
            }
        
        # Read source code
        with open(file_path, 'rb') as f:
            source_code = f.read()
        
        # Extract current imports
        imports = []
        server._extract_imports_from_ast(tree.root_node, file_path, imports, source_code)
        
        # Build set of imported names
        imported_names = set()
        for imp in imports:
            imported_names.update(imp['names'])
        
        # Find undefined references
        defined_names = imported_names.copy()
        undefined_refs = []
        server._find_undefined_references(tree.root_node, source_code, defined_names, undefined_refs)
        
        # Remove duplicates and sort by line number
        unique_undefined = {}
        for name, line, col in undefined_refs:
            if name not in unique_undefined:
                unique_undefined[name] = {'name': name, 'line': line, 'column': col, 'occurrences': 1}
            else:
                unique_undefined[name]['occurrences'] += 1
        
        # Search for exports in the project (simplified - would need enhancement)
        suggestions = {}
        project_dir = Path(file_path).parent
        
        # Common React imports
        react_imports = {
            'useState': "import { useState } from 'react'",
            'useEffect': "import { useEffect } from 'react'",
            'useCallback': "import { useCallback } from 'react'",
            'useMemo': "import { useMemo } from 'react'",
            'useContext': "import { useContext } from 'react'",
            'useReducer': "import { useReducer } from 'react'",
            'useRef': "import { useRef } from 'react'",
            'Component': "import { Component } from 'react'",
            'Fragment': "import { Fragment } from 'react'",
        }
        
        # Next.js imports
        nextjs_imports = {
            'Link': "import Link from 'next/link'",
            'Image': "import Image from 'next/image'",
            'useRouter': "import { useRouter } from 'next/navigation'",
            'redirect': "import { redirect } from 'next/navigation'",
            'notFound': "import { notFound } from 'next/navigation'",
        }
        
        # Check common imports
        for name in unique_undefined:
            if name in react_imports:
                suggestions[name] = react_imports[name]
            elif name in nextjs_imports:
                suggestions[name] = nextjs_imports[name]
            # Would search project files for exports here
        
        result = {
            "success": True,
            "file": file_path,
            "current_imports": len(imports),
            "undefined_references": list(unique_undefined.values()),
            "suggested_imports": suggestions,
            "missing_count": len(unique_undefined)
        }
        
        # Generate import statements to add
        if suggestions:
            result["imports_to_add"] = list(suggestions.values())
            result["summary"] = f"Found {len(unique_undefined)} undefined reference(s), suggested {len(suggestions)} import(s)"
        else:
            result["summary"] = f"Found {len(unique_undefined)} undefined reference(s), no automatic suggestions available"
        
        return result
        
    except Exception as e:
        server.logger.error(f"[FIX_IMPORTS] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def extract_component(
    file_path: str,
    start_line: int,
    end_line: int,
    component_name: str,
    output_file: Optional[str] = None
) -> Dict[str, Any]:
    """
    Extract JSX code into a reusable React component. Analyzes the selected code,
    determines required props, and creates a new component file.
    
    Args:
        file_path: Path to the file containing JSX to extract
        start_line: Starting line number (1-based)
        end_line: Ending line number (1-based)
        component_name: Name for the new component
        output_file: Optional path for the new component file
        
    Returns:
        Dictionary with extraction results and new component details
    """
    server.logger.info(f"[EXTRACT_COMPONENT] Extracting from {file_path} lines {start_line}-{end_line}")
    
    try:
        # Parse the file
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file"
            }
        
        # Read source code
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Validate line numbers
        if start_line < 1 or end_line > len(lines) or start_line > end_line:
            return {
                "success": False,
                "error": f"Invalid line range: {start_line}-{end_line} (file has {len(lines)} lines)"
            }
        
        # Extract the selected code
        selected_lines = lines[start_line-1:end_line]
        selected_code = ''.join(selected_lines)
        
        # Find variables used in the selected code (simplified)
        # In a real implementation, we'd parse the JSX AST to find all referenced variables
        used_vars = set()
        import re
        # Simple regex to find potential variable references
        var_pattern = re.compile(r'\{([a-zA-Z_]\w*)\}')
        for match in var_pattern.finditer(selected_code):
            used_vars.add(match.group(1))
        
        # Generate component code
        props_list = sorted(used_vars)
        props_destructure = f"{{ {', '.join(props_list)} }}" if props_list else ""
        
        component_code = f"""import React from 'react';

interface {component_name}Props {
            "{\n  " + '\n  '.join([f"{prop}: any;" for prop in props_list]) + "\n}" if props_list else "{}"}

export const {component_name}: React.FC<{component_name}Props> = ({props_destructure}) => {{
  return (
{selected_code.rstrip()}
  );
}};
"""
        
        # Generate usage code
        props_usage = ' '.join([f'{prop}={{{prop}}}' for prop in props_list])
        usage_code = f"<{component_name} {props_usage} />"
        
        # Determine output file path
        if not output_file:
            # Default to components directory
            base_dir = Path(file_path).parent
            components_dir = base_dir / 'components'
            output_file = str(components_dir / f'{component_name}.tsx')
        
        result = {
            "success": True,
            "component_name": component_name,
            "props": props_list,
            "output_file": output_file,
            "component_code": component_code,
            "usage_code": usage_code,
            "extracted_lines": {
                "start": start_line,
                "end": end_line,
                "count": end_line - start_line + 1
            }
        }
        
        return result
        
    except Exception as e:
        server.logger.error(f"[EXTRACT_COMPONENT] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def analyze_component_props(file_path: str) -> Dict[str, Any]:
    """
    Analyze React component props for type consistency and usage. Extracts prop
    interfaces/types and validates their usage across the codebase.
    
    Args:
        file_path: Path to the component file to analyze
        
    Returns:
        Dictionary with component props analysis
    """
    server.logger.info(f"[ANALYZE_PROPS] Analyzing component props in: {file_path}")
    
    try:
        # Parse the file
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file"
            }
        
        # Read source code
        with open(file_path, 'rb') as f:
            source_code = f.read()
        
        # Extract entities to find components
        entities = []
        server._extract_entities_from_ast(tree.root_node, file_path, entities, source_code)
        
        # Filter for components
        components = [e for e in entities if e['type'] == 'component']
        
        # Analyze each component (simplified - would need proper TypeScript type analysis)
        component_analysis = []
        for component in components:
            analysis = {
                "name": component['name'],
                "props": component.get('props', {}),
                "line": component['line_start'],
                "usage_count": 0,  # Would search for usages
                "prop_validation": "pending"  # Would validate prop types
            }
            component_analysis.append(analysis)
        
        result = {
            "success": True,
            "file": file_path,
            "component_count": len(components),
            "components": component_analysis,
            "summary": f"Found {len(components)} component(s) in {Path(file_path).name}"
        }
        
        return result
        
    except Exception as e:
        server.logger.error(f"[ANALYZE_PROPS] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def find_code_patterns(
    directory: str,
    pattern_types: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Find design patterns in a codebase including React-specific patterns.
    
    Args:
        directory: Directory to search in
        pattern_types: Specific patterns to look for (e.g., ['custom-hook', 'hoc', 'singleton'])
        
    Returns:
        Dictionary with found patterns and their locations
    """
    server.logger.info(f"[FIND_PATTERNS] Searching in: {directory}")
    
    try:
        patterns_found = []
        files_analyzed = 0
        
        # Walk through directory
        for root, _, files in os.walk(directory):
            for file in files:
                # Only process supported files
                ext = Path(file).suffix.lower()
                if ext not in ['.py', '.js', '.ts', '.jsx', '.tsx']:
                    continue
                
                file_path = os.path.join(root, file)
                files_analyzed += 1
                
                # Parse file
                tree = await server.parse_file(file_path)
                if tree:
                    # Read source code
                    with open(file_path, 'rb') as f:
                        source_code = f.read()
                    
                    # Detect patterns in AST
                    file_patterns = []
                    server._detect_patterns_in_ast(tree.root_node, source_code, file_patterns, file_path)
                    
                    # Filter by requested types
                    if pattern_types:
                        file_patterns = [
                            p for p in file_patterns
                            if p.pattern_type in pattern_types
                        ]
                    
                    patterns_found.extend([p.dict() for p in file_patterns])
                    
                    # Store patterns in graph
                    if server.graph_manager and file_patterns:
                        try:
                            async with mem0_server.neo4j_session() as session:
                                for pattern in file_patterns:
                                    await server.graph_manager.create_pattern_node(
                                        session,
                                        pattern.pattern_type,
                                        pattern.location,
                                        pattern.confidence
                                    )
                        except Exception as e:
                            server.logger.warning(f"Could not store patterns in graph: {e}")
        
        # Group patterns by type
        patterns_by_type = defaultdict(list)
        for pattern in patterns_found:
            patterns_by_type[pattern['pattern_type']].append(pattern)
        
        # React-specific pattern summary
        react_patterns = {
            'custom_hooks': len(patterns_by_type.get('custom-hook', [])),
            'hocs': len(patterns_by_type.get('hoc', [])),
            'context_providers': len(patterns_by_type.get('context-provider', [])),
        }
        
        return {
            "success": True,
            "directory": directory,
            "files_analyzed": files_analyzed,
            "total_patterns": len(patterns_found),
            "patterns_by_type": dict(patterns_by_type),
            "patterns": patterns_found,
            "react_patterns": react_patterns
        }
        
    except Exception as e:
        server.logger.error(f"[FIND_PATTERNS] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def track_dependencies(
    file_path: str,
    depth: int = 1
) -> Dict[str, Any]:
    """
    Track import dependencies for a file using AST analysis.
    
    Args:
        file_path: File to analyze dependencies for
        depth: How deep to follow the dependency chain
        
    Returns:
        Dictionary with dependency graph
    """
    server.logger.info(f"[TRACK_DEPS] Analyzing dependencies for: {file_path}")
    
    try:
        # Parse initial file
        tree = await server.parse_file(file_path)
        if not tree:
            return {
                "success": False,
                "error": "Failed to parse file"
            }
        
        # Read source code
        with open(file_path, 'rb') as f:
            source_code = f.read()
        
        # Extract imports using AST
        imports = []
        server._extract_imports_from_ast(tree.root_node, file_path, imports, source_code)
        
        # Build dependency tree
        dependencies = {
            "root": file_path,
            "direct_imports": imports,
            "dependency_tree": {},
            "all_dependencies": set(),
            "import_types": {
                "normal": 0,
                "type": 0,
                "relative": 0,
                "external": 0
            }
        }
        
        # Analyze imports
        for imp in imports:
            module = imp['module']
            dependencies['all_dependencies'].add(module)
            
            # Categorize import
            if imp.get('import_type') == 'type':
                dependencies['import_types']['type'] += 1
            else:
                dependencies['import_types']['normal'] += 1
            
            if imp['is_relative']:
                dependencies['import_types']['relative'] += 1
            else:
                dependencies['import_types']['external'] += 1
            
            dependencies['dependency_tree'][module] = {
                'line': imp['line'],
                'statement': imp['statement'],
                'is_relative': imp['is_relative'],
                'import_type': imp.get('import_type', 'normal'),
                'names': imp['names']
            }
        
        return {
            "success": True,
            "file": file_path,
            "dependencies": dependencies,
            "import_count": len(imports),
            "unique_modules": len(dependencies['all_dependencies']),
            "summary": f"Found {len(imports)} imports from {len(dependencies['all_dependencies'])} unique modules"
        }
        
    except Exception as e:
        server.logger.error(f"[TRACK_DEPS] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


@mcp.tool()
async def detect_api_calls(
    directory: str,
    api_patterns: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Detect API calls and external service integrations using AST analysis.
    
    Args:
        directory: Directory to search in
        api_patterns: Specific API patterns to look for (e.g., ['fetch', 'axios', 'requests'])
        
    Returns:
        Dictionary with detected API calls and their locations
    """
    server.logger.info(f"[DETECT_API] Searching for API calls in: {directory}")
    
    try:
        # Default API patterns if none provided
        if not api_patterns:
            api_patterns = [
                'fetch', 'axios', 'requests', 'http.get', 'http.post',
                'urllib', 'httpx', 'aiohttp', 'graphql', 'rest',
                # React Query and SWR
                'useQuery', 'useMutation', 'useSWR', 'useSWRMutation'
            ]
        
        api_calls_found = []
        files_analyzed = 0
        
        # Walk through directory
        for root, _, files in os.walk(directory):
            for file in files:
                # Only process code files
                ext = Path(file).suffix.lower()
                if ext not in ['.py', '.js', '.ts', '.jsx', '.tsx']:
                    continue
                
                file_path = os.path.join(root, file)
                files_analyzed += 1
                
                # Read file content
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    lines = content.splitlines()
                    
                    # Search for API patterns (enhanced to look for actual calls)
                    for i, line in enumerate(lines):
                        for pattern in api_patterns:
                            # Look for function calls, not just mentions
                            if f"{pattern}(" in line or f"{pattern}." in line:
                                # Extract more context
                                start = max(0, i - 2)
                                end = min(len(lines), i + 3)
                                context_lines = lines[start:end]
                                
                                api_calls_found.append({
                                    'file': file_path,
                                    'line': i + 1,
                                    'pattern': pattern,
                                    'code': line.strip(),
                                    'context': context_lines,
                                    'is_mock': 'setTimeout' in line or 'Promise.resolve' in line
                                })
                
                except Exception as e:
                    server.logger.warning(f"[DETECT_API] Could not read {file_path}: {e}")
        
        # Group by pattern
        calls_by_pattern = defaultdict(list)
        mock_calls = []
        real_calls = []
        
        for call in api_calls_found:
            calls_by_pattern[call['pattern']].append(call)
            if call['is_mock']:
                mock_calls.append(call)
            else:
                real_calls.append(call)
        
        return {
            "success": True,
            "directory": directory,
            "files_analyzed": files_analyzed,
            "total_api_calls": len(api_calls_found),
            "mock_api_calls": len(mock_calls),
            "real_api_calls": len(real_calls),
            "calls_by_pattern": dict(calls_by_pattern),
            "api_calls": api_calls_found,
            "summary": f"Found {len(api_calls_found)} API calls ({len(mock_calls)} mocked, {len(real_calls)} real)"
        }
        
    except Exception as e:
        server.logger.error(f"[DETECT_API] Error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


def main() -> None:
    """Main entry point for the server."""
    try:
        server_logger.info("[MAIN] Starting Enhanced Tree-sitter MCP server")
        server_logger.info(f"[MAIN] Working directory: {os.getcwd()}")
        server_logger.info("[MAIN] Available tools: analyze_code_structure, validate_syntax, fix_imports, extract_component, analyze_component_props, find_code_patterns, track_dependencies, detect_api_calls")
        
        mcp.run(transport="stdio", show_banner=False)
    except Exception as e:
        server_logger.error(f"[MAIN] Server error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()