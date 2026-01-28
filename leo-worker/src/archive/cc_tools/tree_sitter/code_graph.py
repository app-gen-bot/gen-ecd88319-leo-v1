"""
Code Graph Management for Tree-sitter Integration

Handles the creation and management of code-related graph nodes and relationships
in Neo4j, working in conjunction with the mem0 memory system.
"""

import json
from typing import Dict, Any, List, Optional, Set
from pathlib import Path

from ..common.logging_utils import setup_mcp_server_logging

# Setup logging
logger = setup_mcp_server_logging("tree_sitter.code_graph")


class CodeGraphManager:
    """Manages code-related graph nodes and relationships"""
    
    def __init__(self, neo4j_session_factory):
        """
        Initialize with Neo4j session factory
        
        Args:
            neo4j_session_factory: Async context manager for Neo4j sessions
        """
        self.neo4j_session = neo4j_session_factory
        self.logger = logger
    
    async def create_code_entity_nodes(
        self,
        file_path: str,
        entities: List[Dict[str, Any]],
        imports: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create graph nodes for code entities and their relationships
        
        Args:
            file_path: Path to the source file
            entities: List of code entities (functions, classes, etc.)
            imports: List of import statements
            
        Returns:
            Dictionary with created nodes and relationships
        """
        nodes_created = []
        relationships_created = []
        
        try:
            async with self.neo4j_session() as session:
                # Create or update File node
                file_node = await self._create_file_node(session, file_path)
                nodes_created.append(file_node)
                
                # Create nodes for each entity
                for entity in entities:
                    entity_node = await self._create_entity_node(
                        session, entity, file_path
                    )
                    nodes_created.append(entity_node)
                    
                    # Create relationship from File to Entity
                    rel = await self._create_relationship(
                        session,
                        file_path,
                        "File",
                        entity['name'],
                        entity['type'].capitalize(),
                        "CONTAINS"
                    )
                    relationships_created.append(rel)
                
                # Create Import nodes and relationships
                for imp in imports:
                    import_node = await self._create_import_node(session, imp, file_path)
                    nodes_created.append(import_node)
                    
                    # Create IMPORTS relationship
                    rel = await self._create_relationship(
                        session,
                        file_path,
                        "File",
                        imp['statement'],
                        "Import",
                        "IMPORTS"
                    )
                    relationships_created.append(rel)
                
                # Detect and create relationships between entities
                await self._create_entity_relationships(session, entities, file_path)
                
            return {
                "success": True,
                "nodes_created": len(nodes_created),
                "relationships_created": len(relationships_created),
                "details": {
                    "nodes": nodes_created,
                    "relationships": relationships_created
                }
            }
            
        except Exception as e:
            self.logger.error(f"[CREATE_NODES] Failed: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "nodes_created": 0,
                "relationships_created": 0
            }
    
    async def _create_file_node(self, session, file_path: str) -> Dict[str, Any]:
        """Create or update a File node"""
        path = Path(file_path)
        query = """
        MERGE (f:File {path: $path})
        SET f.name = $name,
            f.extension = $extension,
            f.directory = $directory,
            f.last_analyzed = datetime()
        RETURN f
        """
        
        result = await session.run(query, {
            "path": str(path),
            "name": path.name,
            "extension": path.suffix,
            "directory": str(path.parent)
        })
        
        record = await result.single()
        return {
            "type": "File",
            "path": file_path,
            "name": path.name
        }
    
    async def _create_entity_node(
        self,
        session,
        entity: Dict[str, Any],
        file_path: str
    ) -> Dict[str, Any]:
        """Create a node for a code entity (Function, Class, etc.)"""
        entity_type = entity['type'].capitalize()
        
        # Different queries for different entity types
        if entity_type == "Function":
            query = """
            MERGE (e:Function {name: $name, file: $file})
            SET e.signature = $signature,
                e.line_start = $line_start,
                e.line_end = $line_end,
                e.last_analyzed = datetime()
            RETURN e
            """
        elif entity_type == "Class":
            query = """
            MERGE (e:Class {name: $name, file: $file})
            SET e.signature = $signature,
                e.line_start = $line_start,
                e.line_end = $line_end,
                e.last_analyzed = datetime()
            RETURN e
            """
        else:  # Generic entity
            query = f"""
            MERGE (e:{entity_type} {{name: $name, file: $file}})
            SET e.signature = $signature,
                e.line_start = $line_start,
                e.line_end = $line_end,
                e.last_analyzed = datetime()
            RETURN e
            """
        
        result = await session.run(query, {
            "name": entity['name'],
            "file": file_path,
            "signature": entity.get('signature', ''),
            "line_start": entity.get('line_start', 0),
            "line_end": entity.get('line_end', 0)
        })
        
        await result.single()
        return {
            "type": entity_type,
            "name": entity['name'],
            "file": file_path
        }
    
    async def _create_import_node(
        self,
        session,
        import_info: Dict[str, Any],
        file_path: str
    ) -> Dict[str, Any]:
        """Create an Import node"""
        statement = import_info['statement']
        
        # Parse module name from import statement
        if statement.startswith('from '):
            parts = statement.split(' ')
            module = parts[1] if len(parts) > 1 else 'unknown'
        else:
            parts = statement.replace('import ', '').split(' as ')
            module = parts[0].strip()
        
        query = """
        MERGE (i:Import {statement: $statement, file: $file})
        SET i.module = $module,
            i.line = $line,
            i.last_analyzed = datetime()
        RETURN i
        """
        
        result = await session.run(query, {
            "statement": statement,
            "file": file_path,
            "module": module,
            "line": import_info.get('line', 0)
        })
        
        await result.single()
        return {
            "type": "Import",
            "statement": statement,
            "module": module
        }
    
    async def _create_relationship(
        self,
        session,
        from_id: str,
        from_type: str,
        to_id: str,
        to_type: str,
        rel_type: str
    ) -> Dict[str, Any]:
        """Create a relationship between two nodes"""
        query = f"""
        MATCH (a:{from_type} {{{'path' if from_type == 'File' else 'name'}: $from_id}})
        MATCH (b:{to_type} {{{'statement' if to_type == 'Import' else 'name'}: $to_id}})
        MERGE (a)-[r:{rel_type}]->(b)
        SET r.created = datetime()
        RETURN r
        """
        
        await session.run(query, {
            "from_id": from_id,
            "to_id": to_id
        })
        
        return {
            "type": rel_type,
            "from": f"{from_type}:{from_id}",
            "to": f"{to_type}:{to_id}"
        }
    
    async def _create_entity_relationships(
        self,
        session,
        entities: List[Dict[str, Any]],
        file_path: str
    ):
        """Detect and create relationships between entities"""
        # Group entities by type
        classes = [e for e in entities if e['type'] == 'class']
        functions = [e for e in entities if e['type'] == 'function']
        
        # Create METHOD_OF relationships for class methods
        for func in functions:
            # Simple heuristic: if function is defined after a class and before next class
            # it might be a method (this is simplified, real implementation would use AST)
            for cls in classes:
                if (func.get('line_start', 0) > cls.get('line_start', 0) and 
                    func['name'] != '__init__'):
                    # Check if it might be a method (very simplified check)
                    if 'self' in func.get('signature', ''):
                        await self._create_relationship(
                            session,
                            func['name'],
                            "Function",
                            cls['name'],
                            "Class",
                            "METHOD_OF"
                        )
    
    async def track_function_calls(
        self,
        session,
        caller_function: str,
        called_functions: List[str],
        file_path: str
    ):
        """Track function call relationships"""
        for called in called_functions:
            try:
                query = """
                MATCH (caller:Function {name: $caller, file: $file})
                MATCH (called:Function {name: $called})
                MERGE (caller)-[r:CALLS]->(called)
                SET r.last_seen = datetime()
                """
                await session.run(query, {
                    "caller": caller_function,
                    "called": called,
                    "file": file_path
                })
            except Exception as e:
                self.logger.warning(f"Could not create CALLS relationship: {e}")
    
    async def create_pattern_node(
        self,
        session,
        pattern_type: str,
        location: Dict[str, Any],
        confidence: float
    ) -> Dict[str, Any]:
        """Create a node for a detected pattern"""
        query = """
        MERGE (p:Pattern {type: $type, file: $file, line: $line})
        SET p.confidence = $confidence,
            p.last_detected = datetime()
        RETURN p
        """
        
        result = await session.run(query, {
            "type": pattern_type,
            "file": location.get('file', ''),
            "line": location.get('line', 0),
            "confidence": confidence
        })
        
        await result.single()
        
        # Link pattern to relevant entities
        if 'entity_name' in location:
            await self._create_relationship(
                session,
                location['entity_name'],
                "Class",  # Patterns usually apply to classes
                f"{pattern_type}:{location['file']}:{location['line']}",
                "Pattern",
                "IMPLEMENTS_PATTERN"
            )
        
        return {
            "type": "Pattern",
            "pattern_type": pattern_type,
            "location": location
        }