"""
Entity Resolution for Graphiti Integration

Maps between memory system entities and graph nodes for unified understanding.
"""

import re
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum

# Conditional import for testing
try:
    from ..common.logging_utils import setup_mcp_server_logging
    logger = setup_mcp_server_logging("graphiti.entity_resolver")
except ImportError:
    # Fallback for testing
    import logging
    logger = logging.getLogger("graphiti.entity_resolver")


class EntityType(Enum):
    """Types of entities we track"""
    CODE_FILE = "code_file"
    FUNCTION = "function"
    CLASS = "class"
    METHOD = "method"
    MODULE = "module"
    CONCEPT = "concept"
    DECISION = "decision"
    PATTERN = "pattern"
    DEPENDENCY = "dependency"
    API_ENDPOINT = "api_endpoint"


@dataclass
class UnifiedEntity:
    """Represents an entity that exists in both memory and graph"""
    entity_type: EntityType
    name: str
    memory_id: Optional[str] = None
    graph_node_id: Optional[str] = None
    attributes: Dict[str, Any] = None
    relationships: List[Tuple[str, str, str]] = None  # (relation_type, target_id, target_type)
    confidence: float = 1.0
    
    def __post_init__(self):
        if self.attributes is None:
            self.attributes = {}
        if self.relationships is None:
            self.relationships = []
    
    @property
    def unique_id(self) -> str:
        """Generate unique identifier for entity"""
        return f"{self.entity_type.value}:{self.name}"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            "entity_type": self.entity_type.value,
            "name": self.name,
            "memory_id": self.memory_id,
            "graph_node_id": self.graph_node_id,
            "attributes": self.attributes,
            "relationships": [
                {"type": rel[0], "target": rel[1], "target_type": rel[2]}
                for rel in self.relationships
            ],
            "confidence": self.confidence
        }


class EntityResolver:
    """Resolves entities between memory system and graph database"""
    
    def __init__(self):
        self.logger = logger
        self.entity_cache: Dict[str, UnifiedEntity] = {}
        
        # Patterns for entity extraction
        self.patterns = {
            EntityType.FUNCTION: [
                r"function\s+(\w+)",
                r"def\s+(\w+)",
                r"(\w+)\s+function",
                r"(\w+)\(\)"
            ],
            EntityType.CLASS: [
                r"class\s+(\w+)",
                r"(\w+)\s+class",
                r"type\s+(\w+)"
            ],
            EntityType.METHOD: [
                r"method\s+(\w+)",
                r"(\w+)\.(\w+)\(\)",
                r"(\w+)\s+method"
            ],
            EntityType.MODULE: [
                r"module\s+(\w+)",
                r"(\w+)\.py",
                r"from\s+(\w+)\s+import"
            ],
            EntityType.API_ENDPOINT: [
                r"endpoint\s+(/\w+)",
                r"route\s+(\S+)",
                r"api/(\w+)"
            ]
        }
    
    def extract_entities_from_text(self, text: str, context: Optional[str] = None) -> List[UnifiedEntity]:
        """Extract entities from text using patterns"""
        entities = []
        text_lower = text.lower()
        
        for entity_type, patterns in self.patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                for match in matches:
                    name = match if isinstance(match, str) else match[0]
                    entity = UnifiedEntity(
                        entity_type=entity_type,
                        name=name,
                        attributes={"source": "text_extraction", "context": context}
                    )
                    entities.append(entity)
        
        # Extract concepts and patterns from context
        if context:
            if context.startswith("architecture:"):
                entities.append(UnifiedEntity(
                    entity_type=EntityType.CONCEPT,
                    name=context.replace("architecture:", ""),
                    attributes={"category": "architecture"}
                ))
            elif context.startswith("pattern:"):
                entities.append(UnifiedEntity(
                    entity_type=EntityType.PATTERN,
                    name=context.replace("pattern:", ""),
                    attributes={"category": "design_pattern"}
                ))
            elif context.startswith("decision:"):
                entities.append(UnifiedEntity(
                    entity_type=EntityType.DECISION,
                    name=context.replace("decision:", ""),
                    attributes={"category": "technical_decision"}
                ))
        
        return entities
    
    def resolve_memory_to_graph(
        self,
        memory_content: str,
        memory_id: str,
        memory_metadata: Dict[str, Any]
    ) -> List[UnifiedEntity]:
        """Resolve memory content to graph entities"""
        context = memory_metadata.get("context", "")
        entities = self.extract_entities_from_text(memory_content, context)
        
        # Set memory ID for all entities
        for entity in entities:
            entity.memory_id = memory_id
            entity.attributes.update({
                "memory_context": context,
                "memory_created": memory_metadata.get("created_at"),
                "memory_user": memory_metadata.get("user_id")
            })
        
        # Cache entities
        for entity in entities:
            self.entity_cache[entity.unique_id] = entity
        
        return entities
    
    def resolve_graph_to_memory(
        self,
        node_type: str,
        node_properties: Dict[str, Any]
    ) -> Optional[UnifiedEntity]:
        """Resolve graph node to unified entity"""
        # Map node type to entity type
        type_mapping = {
            "Function": EntityType.FUNCTION,
            "Class": EntityType.CLASS,
            "Method": EntityType.METHOD,
            "File": EntityType.CODE_FILE,
            "Module": EntityType.MODULE,
            "Pattern": EntityType.PATTERN
        }
        
        entity_type = type_mapping.get(node_type)
        if not entity_type:
            return None
        
        name = node_properties.get("name", node_properties.get("path", "unknown"))
        
        entity = UnifiedEntity(
            entity_type=entity_type,
            name=name,
            graph_node_id=node_properties.get("id"),
            attributes=node_properties
        )
        
        # Check cache for memory connection
        cached = self.entity_cache.get(entity.unique_id)
        if cached and cached.memory_id:
            entity.memory_id = cached.memory_id
            entity.attributes.update(cached.attributes)
        
        return entity
    
    def infer_relationships(self, entities: List[UnifiedEntity]) -> List[Tuple[str, str, str, str]]:
        """
        Infer relationships between entities.
        
        Returns list of (source_id, relation_type, target_id, confidence)
        """
        relationships = []
        
        # Group entities by type
        by_type = {}
        for entity in entities:
            entity_type = entity.entity_type
            if entity_type not in by_type:
                by_type[entity_type] = []
            by_type[entity_type].append(entity)
        
        # Infer function-class relationships
        if EntityType.FUNCTION in by_type and EntityType.CLASS in by_type:
            for func in by_type[EntityType.FUNCTION]:
                for cls in by_type[EntityType.CLASS]:
                    # Check if function name suggests it's related to class
                    if cls.name.lower() in func.name.lower():
                        relationships.append((
                            func.unique_id,
                            "RELATED_TO",
                            cls.unique_id,
                            0.7
                        ))
        
        # Infer method-class relationships
        if EntityType.METHOD in by_type and EntityType.CLASS in by_type:
            for method in by_type[EntityType.METHOD]:
                # Methods often have class context in attributes
                class_name = method.attributes.get("parent_class")
                if class_name:
                    for cls in by_type[EntityType.CLASS]:
                        if cls.name.lower() == class_name.lower():
                            relationships.append((
                                method.unique_id,
                                "METHOD_OF",
                                cls.unique_id,
                                0.95
                            ))
        
        # Infer pattern implementations
        if EntityType.PATTERN in by_type and EntityType.CLASS in by_type:
            for pattern in by_type[EntityType.PATTERN]:
                pattern_name = pattern.name.lower()
                for cls in by_type[EntityType.CLASS]:
                    if pattern_name in cls.name.lower() or pattern_name in cls.attributes.get("docstring", "").lower():
                        relationships.append((
                            cls.unique_id,
                            "IMPLEMENTS",
                            pattern.unique_id,
                            0.8
                        ))
        
        # Infer decision impacts
        if EntityType.DECISION in by_type:
            for decision in by_type[EntityType.DECISION]:
                # Decisions impact related entities mentioned in same context
                for entity in entities:
                    if entity.entity_type != EntityType.DECISION:
                        if entity.attributes.get("memory_context") == decision.attributes.get("memory_context"):
                            relationships.append((
                                decision.unique_id,
                                "IMPACTS",
                                entity.unique_id,
                                0.6
                            ))
        
        return relationships
    
    def merge_memory_and_graph(
        self,
        memory_entities: List[UnifiedEntity],
        graph_nodes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Merge entities from memory and graph into unified view"""
        merged = {
            "entities": {},
            "relationships": [],
            "statistics": {
                "total_entities": 0,
                "memory_only": 0,
                "graph_only": 0,
                "unified": 0
            }
        }
        
        # Process memory entities
        for entity in memory_entities:
            merged["entities"][entity.unique_id] = entity
        
        # Process graph nodes
        for node in graph_nodes:
            graph_entity = self.resolve_graph_to_memory(
                node.get("type", "Unknown"),
                node.get("properties", {})
            )
            
            if graph_entity:
                existing = merged["entities"].get(graph_entity.unique_id)
                if existing:
                    # Merge: entity exists in both
                    existing.graph_node_id = graph_entity.graph_node_id
                    existing.attributes.update(graph_entity.attributes)
                    merged["statistics"]["unified"] += 1
                else:
                    # Graph only
                    merged["entities"][graph_entity.unique_id] = graph_entity
                    merged["statistics"]["graph_only"] += 1
        
        # Count memory-only entities
        for entity in merged["entities"].values():
            if entity.memory_id and not entity.graph_node_id:
                merged["statistics"]["memory_only"] += 1
        
        merged["statistics"]["total_entities"] = len(merged["entities"])
        
        # Infer relationships
        all_entities = list(merged["entities"].values())
        inferred_rels = self.infer_relationships(all_entities)
        
        for source, rel_type, target, confidence in inferred_rels:
            merged["relationships"].append({
                "source": source,
                "type": rel_type,
                "target": target,
                "confidence": confidence
            })
        
        return merged
    
    def find_similar_entities(
        self,
        entity: UnifiedEntity,
        candidates: List[UnifiedEntity],
        threshold: float = 0.7
    ) -> List[Tuple[UnifiedEntity, float]]:
        """Find similar entities based on name and attributes"""
        similar = []
        
        for candidate in candidates:
            if candidate.unique_id == entity.unique_id:
                continue
            
            # Calculate similarity
            score = 0.0
            
            # Name similarity
            name_sim = self._string_similarity(entity.name, candidate.name)
            score += name_sim * 0.5
            
            # Type match
            if entity.entity_type == candidate.entity_type:
                score += 0.3
            
            # Attribute overlap
            common_attrs = set(entity.attributes.keys()) & set(candidate.attributes.keys())
            if common_attrs:
                attr_score = len(common_attrs) / max(len(entity.attributes), len(candidate.attributes))
                score += attr_score * 0.2
            
            if score >= threshold:
                similar.append((candidate, score))
        
        # Sort by score
        similar.sort(key=lambda x: x[1], reverse=True)
        return similar
    
    def _string_similarity(self, s1: str, s2: str) -> float:
        """Calculate simple string similarity"""
        s1_lower = s1.lower()
        s2_lower = s2.lower()
        
        if s1_lower == s2_lower:
            return 1.0
        
        # Check containment
        if s1_lower in s2_lower or s2_lower in s1_lower:
            return 0.8
        
        # Simple character overlap
        common = len(set(s1_lower) & set(s2_lower))
        total = len(set(s1_lower) | set(s2_lower))
        
        return common / total if total > 0 else 0.0