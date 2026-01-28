"""
Impact Analysis for Code Changes

Uses graph relationships to understand the impact of changes.
"""

from typing import Dict, Any, List, Set, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
from collections import defaultdict

# Conditional import for testing
try:
    from ..common.logging_utils import setup_mcp_server_logging
    logger = setup_mcp_server_logging("graphiti.impact_analyzer")
except ImportError:
    # Fallback for testing
    import logging
    logger = logging.getLogger("graphiti.impact_analyzer")


class ImpactLevel(Enum):
    """Levels of impact severity"""
    CRITICAL = "critical"  # Breaking changes, API modifications
    HIGH = "high"        # Significant functionality changes
    MEDIUM = "medium"    # Moderate changes, refactoring
    LOW = "low"          # Minor changes, documentation
    NONE = "none"        # No impact detected


class ChangeType(Enum):
    """Types of changes that can occur"""
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    MOVED = "moved"
    RENAMED = "renamed"
    SIGNATURE_CHANGED = "signature_changed"
    DEPENDENCY_CHANGED = "dependency_changed"


@dataclass(frozen=True)
class ImpactNode:
    """Node affected by a change"""
    node_id: str
    node_type: str
    name: str
    impact_level: ImpactLevel
    reason: str
    distance: int  # Distance from change source
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "node_type": self.node_type,
            "name": self.name,
            "impact_level": self.impact_level.value,
            "reason": self.reason,
            "distance": self.distance
        }
    
    def __hash__(self):
        return hash((self.node_id, self.node_type, self.name))


@dataclass
class ImpactPath:
    """Path showing how impact propagates"""
    source: str
    target: str
    path: List[str]
    relationships: List[str]
    impact_level: ImpactLevel
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "source": self.source,
            "target": self.target,
            "path": self.path,
            "relationships": self.relationships,
            "impact_level": self.impact_level.value
        }


class ImpactAnalyzer:
    """Analyzes impact of changes using graph relationships"""
    
    def __init__(self):
        self.logger = logger
        
        # Impact propagation rules
        self.propagation_rules = {
            # (relationship_type, change_type) -> (impact_level, propagate)
            ("CALLS", ChangeType.SIGNATURE_CHANGED): (ImpactLevel.CRITICAL, True),
            ("CALLS", ChangeType.REMOVED): (ImpactLevel.CRITICAL, True),
            ("CALLS", ChangeType.MODIFIED): (ImpactLevel.HIGH, True),
            ("IMPORTS", ChangeType.REMOVED): (ImpactLevel.CRITICAL, True),
            ("IMPORTS", ChangeType.MODIFIED): (ImpactLevel.HIGH, True),
            ("DEPENDS_ON", ChangeType.REMOVED): (ImpactLevel.CRITICAL, True),
            ("DEPENDS_ON", ChangeType.MODIFIED): (ImpactLevel.HIGH, True),
            ("EXTENDS", ChangeType.SIGNATURE_CHANGED): (ImpactLevel.CRITICAL, True),
            ("EXTENDS", ChangeType.REMOVED): (ImpactLevel.CRITICAL, True),
            ("IMPLEMENTS", ChangeType.SIGNATURE_CHANGED): (ImpactLevel.CRITICAL, True),
            ("CONTAINS", ChangeType.REMOVED): (ImpactLevel.HIGH, False),
            ("USES", ChangeType.MODIFIED): (ImpactLevel.MEDIUM, True),
            ("RELATED_TO", ChangeType.MODIFIED): (ImpactLevel.LOW, False)
        }
        
        # Node type impact weights
        self.node_weights = {
            "api_endpoint": 1.5,    # API changes have higher impact
            "public_function": 1.3,  # Public functions affect external users
            "class": 1.2,           # Classes often have multiple dependents
            "function": 1.0,        # Standard weight
            "method": 1.0,
            "file": 0.8,
            "module": 0.9
        }
    
    def analyze_change_impact(
        self,
        changed_entity: Dict[str, Any],
        change_type: ChangeType,
        graph_context: Dict[str, Any],
        max_depth: int = 3
    ) -> Dict[str, Any]:
        """
        Analyze the impact of a change on the codebase.
        
        Args:
            changed_entity: Entity that changed
            change_type: Type of change
            graph_context: Graph data including relationships
            max_depth: Maximum depth to analyze
            
        Returns:
            Impact analysis results
        """
        impact_analysis = {
            "changed_entity": changed_entity,
            "change_type": change_type.value,
            "directly_affected": [],
            "indirectly_affected": [],
            "impact_paths": [],
            "summary": {
                "total_affected": 0,
                "by_impact_level": defaultdict(int),
                "by_node_type": defaultdict(int)
            },
            "recommendations": []
        }
        
        # Analyze direct impacts
        direct_impacts = self._analyze_direct_impacts(
            changed_entity,
            change_type,
            graph_context.get("relationships", []),
            graph_context.get("connected_entities", [])
        )
        
        impact_analysis["directly_affected"] = [n.to_dict() for n in direct_impacts]
        
        # Analyze indirect impacts (ripple effects)
        all_impacts = set(direct_impacts)
        current_level = direct_impacts
        
        for depth in range(1, max_depth):
            next_level = []
            
            for impact_node in current_level:
                # Find entities connected to this impacted node
                indirect = self._find_indirect_impacts(
                    impact_node,
                    change_type,
                    graph_context,
                    depth + 1,
                    all_impacts
                )
                next_level.extend(indirect)
                all_impacts.update(indirect)
            
            if not next_level:
                break
                
            current_level = next_level
        
        # Separate indirect impacts
        indirect_impacts = [n for n in all_impacts if n not in direct_impacts]
        impact_analysis["indirectly_affected"] = [n.to_dict() for n in indirect_impacts]
        
        # Generate impact paths
        impact_paths = self._generate_impact_paths(
            changed_entity,
            all_impacts,
            graph_context
        )
        impact_analysis["impact_paths"] = [p.to_dict() for p in impact_paths]
        
        # Calculate summary statistics
        for impact in all_impacts:
            impact_analysis["summary"]["by_impact_level"][impact.impact_level.value] += 1
            impact_analysis["summary"]["by_node_type"][impact.node_type] += 1
        
        impact_analysis["summary"]["total_affected"] = len(all_impacts)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            changed_entity,
            change_type,
            all_impacts,
            impact_analysis["summary"]
        )
        impact_analysis["recommendations"] = recommendations
        
        return impact_analysis
    
    def _analyze_direct_impacts(
        self,
        changed_entity: Dict[str, Any],
        change_type: ChangeType,
        relationships: List[Dict[str, Any]],
        connected_entities: List[Dict[str, Any]]
    ) -> List[ImpactNode]:
        """Analyze entities directly connected to the changed entity"""
        direct_impacts = []
        
        entity_name = changed_entity.get("name")
        entity_type = changed_entity.get("type", "unknown")
        
        # Process each relationship
        for rel in relationships:
            rel_type = rel.get("type", "UNKNOWN")
            
            # Determine impact based on relationship and change type
            rule_key = (rel_type, change_type)
            if rule_key in self.propagation_rules:
                impact_level, _ = self.propagation_rules[rule_key]
            else:
                # Default impact based on change type
                impact_level = self._default_impact_level(change_type)
            
            # Find the connected entity
            for connected in connected_entities:
                connected_name = connected.get("name")
                connected_type = connected.get("type", "unknown")
                
                # Create impact node
                reason = self._generate_impact_reason(
                    entity_name,
                    entity_type,
                    connected_name,
                    connected_type,
                    rel_type,
                    change_type
                )
                
                impact_node = ImpactNode(
                    node_id=connected.get("id", connected_name),
                    node_type=connected_type,
                    name=connected_name,
                    impact_level=impact_level,
                    reason=reason,
                    distance=1
                )
                
                direct_impacts.append(impact_node)
        
        return direct_impacts
    
    def _find_indirect_impacts(
        self,
        impact_node: ImpactNode,
        original_change: ChangeType,
        graph_context: Dict[str, Any],
        distance: int,
        already_analyzed: Set[ImpactNode]
    ) -> List[ImpactNode]:
        """Find entities indirectly affected through the impact node"""
        indirect_impacts = []
        
        # Would need actual graph traversal here
        # For now, using a simplified approach
        
        # Reduce impact level as we go further from source
        reduced_level = self._reduce_impact_level(impact_node.impact_level, distance)
        
        if reduced_level == ImpactLevel.NONE:
            return indirect_impacts
        
        # In a real implementation, we'd query the graph for connections
        # For now, return empty list
        return indirect_impacts
    
    def _generate_impact_paths(
        self,
        source_entity: Dict[str, Any],
        impacted_nodes: Set[ImpactNode],
        graph_context: Dict[str, Any]
    ) -> List[ImpactPath]:
        """Generate paths showing how impact propagates"""
        paths = []
        
        # Group impacted nodes by distance
        by_distance = defaultdict(list)
        for node in impacted_nodes:
            by_distance[node.distance].append(node)
        
        # Create paths for high-impact nodes
        for node in impacted_nodes:
            if node.impact_level in [ImpactLevel.CRITICAL, ImpactLevel.HIGH]:
                path = ImpactPath(
                    source=source_entity.get("name"),
                    target=node.name,
                    path=[source_entity.get("name"), node.name],
                    relationships=["AFFECTS"],  # Simplified
                    impact_level=node.impact_level
                )
                paths.append(path)
        
        return paths
    
    def _generate_recommendations(
        self,
        changed_entity: Dict[str, Any],
        change_type: ChangeType,
        impacts: Set[ImpactNode],
        summary: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on impact analysis"""
        recommendations = []
        
        # Check for critical impacts
        critical_count = summary["by_impact_level"].get(ImpactLevel.CRITICAL.value, 0)
        high_count = summary["by_impact_level"].get(ImpactLevel.HIGH.value, 0)
        
        if critical_count > 0:
            recommendations.append(
                f"⚠️ CRITICAL: {critical_count} entities have breaking changes. "
                "Review all dependent code before proceeding."
            )
        
        if high_count > 0:
            recommendations.append(
                f"⚡ HIGH IMPACT: {high_count} entities significantly affected. "
                "Consider creating migration guide."
            )
        
        # API endpoint impacts
        api_impacts = [n for n in impacts if n.node_type == "api_endpoint"]
        if api_impacts:
            recommendations.append(
                f"🌐 API IMPACT: {len(api_impacts)} API endpoints affected. "
                "Update API documentation and notify consumers."
            )
        
        # Test recommendations
        if change_type in [ChangeType.SIGNATURE_CHANGED, ChangeType.REMOVED]:
            recommendations.append(
                "🧪 Update all tests for affected functions and their dependents."
            )
        
        # Refactoring recommendations
        if summary["total_affected"] > 10:
            recommendations.append(
                "🔄 Consider breaking this change into smaller, incremental updates."
            )
        
        # Documentation recommendations
        if change_type == ChangeType.SIGNATURE_CHANGED:
            recommendations.append(
                "📚 Update function documentation and examples."
            )
        
        return recommendations
    
    def _generate_impact_reason(
        self,
        source_name: str,
        source_type: str,
        target_name: str,
        target_type: str,
        relationship: str,
        change_type: ChangeType
    ) -> str:
        """Generate human-readable reason for impact"""
        templates = {
            ("CALLS", ChangeType.SIGNATURE_CHANGED): f"{target_type} '{target_name}' calls '{source_name}' which has signature changes",
            ("CALLS", ChangeType.REMOVED): f"{target_type} '{target_name}' calls '{source_name}' which was removed",
            ("IMPORTS", ChangeType.REMOVED): f"{target_type} '{target_name}' imports '{source_name}' which was removed",
            ("EXTENDS", ChangeType.SIGNATURE_CHANGED): f"{target_type} '{target_name}' extends '{source_name}' which has signature changes",
            ("DEPENDS_ON", ChangeType.MODIFIED): f"{target_type} '{target_name}' depends on '{source_name}' which was modified"
        }
        
        key = (relationship, change_type)
        if key in templates:
            return templates[key]
        
        return f"{target_type} '{target_name}' is connected to '{source_name}' via {relationship}"
    
    def _default_impact_level(self, change_type: ChangeType) -> ImpactLevel:
        """Get default impact level for a change type"""
        defaults = {
            ChangeType.REMOVED: ImpactLevel.HIGH,
            ChangeType.SIGNATURE_CHANGED: ImpactLevel.HIGH,
            ChangeType.MODIFIED: ImpactLevel.MEDIUM,
            ChangeType.MOVED: ImpactLevel.LOW,
            ChangeType.RENAMED: ImpactLevel.LOW,
            ChangeType.ADDED: ImpactLevel.NONE
        }
        return defaults.get(change_type, ImpactLevel.LOW)
    
    def _reduce_impact_level(self, level: ImpactLevel, distance: int) -> ImpactLevel:
        """Reduce impact level based on distance from source"""
        reductions = {
            ImpactLevel.CRITICAL: [ImpactLevel.HIGH, ImpactLevel.MEDIUM, ImpactLevel.LOW],
            ImpactLevel.HIGH: [ImpactLevel.MEDIUM, ImpactLevel.LOW, ImpactLevel.NONE],
            ImpactLevel.MEDIUM: [ImpactLevel.LOW, ImpactLevel.NONE, ImpactLevel.NONE],
            ImpactLevel.LOW: [ImpactLevel.NONE, ImpactLevel.NONE, ImpactLevel.NONE]
        }
        
        reduction_list = reductions.get(level, [ImpactLevel.NONE])
        index = min(distance - 1, len(reduction_list) - 1)
        
        return reduction_list[index]