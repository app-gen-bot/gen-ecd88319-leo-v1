"""
Graph Visualizer - Export Neo4j memory graph to various visualization formats.

This module provides utilities to visualize the memory graph stored in Neo4j,
making it easy to understand relationships between memories, files, functions, etc.
"""

from typing import Dict, List, Any, Optional
import json
from pathlib import Path


class GraphVisualizer:
    """Convert Neo4j graph data to visualization formats."""
    
    @staticmethod
    def to_mermaid(nodes: List[Dict], relationships: List[Dict]) -> str:
        """
        Convert graph to Mermaid diagram format.
        
        Args:
            nodes: List of node dictionaries
            relationships: List of relationship dictionaries
            
        Returns:
            Mermaid diagram string
        """
        lines = ["graph LR"]
        
        # Create node definitions
        node_map = {}
        for i, node in enumerate(nodes):
            node_id = f"N{i}"
            node_map[str(node.get('id', i))] = node_id
            
            # Format node based on type
            node_type = node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown'
            props = node.get('properties', {})
            
            if node_type == 'Memory':
                label = f"Memory: {props.get('context', 'N/A')[:30]}..."
                lines.append(f'    {node_id}["{label}"]')
            elif node_type == 'File':
                label = f"File: {props.get('name', props.get('path', 'N/A'))}"
                lines.append(f'    {node_id}[{label}]')
            elif node_type == 'Function':
                label = f"Function: {props.get('name', 'N/A')}"
                lines.append(f'    {node_id}({label})')
            elif node_type == 'Class':
                label = f"Class: {props.get('name', 'N/A')}"
                lines.append(f'    {node_id}[{label}]:::class')
            elif node_type == 'Architecture':
                label = f"Architecture: {props.get('type', 'N/A')}"
                lines.append(f'    {node_id}{{"{label}"}}')
            elif node_type == 'Decision':
                label = f"Decision: {props.get('type', 'N/A')}"
                lines.append(f'    {node_id}{{"{label}"}}:::decision')
            elif node_type == 'Pattern':
                label = f"Pattern: {props.get('name', 'N/A')}"
                lines.append(f'    {node_id}[/{label}/]')
            else:
                label = f"{node_type}: {str(props)[:30]}..."
                lines.append(f'    {node_id}["{label}"]')
        
        # Create relationships
        for rel in relationships:
            start_id = node_map.get(str(rel.get('startNode')), 'N0')
            end_id = node_map.get(str(rel.get('endNode')), 'N0')
            rel_type = rel.get('type', 'RELATES')
            
            lines.append(f'    {start_id} -->|{rel_type}| {end_id}')
        
        # Add styling
        lines.extend([
            '',
            '    classDef class fill:#f9f,stroke:#333,stroke-width:2px;',
            '    classDef decision fill:#bbf,stroke:#333,stroke-width:2px;'
        ])
        
        return '\n'.join(lines)
    
    @staticmethod
    def to_graphviz(nodes: List[Dict], relationships: List[Dict]) -> str:
        """
        Convert graph to Graphviz DOT format.
        
        Args:
            nodes: List of node dictionaries
            relationships: List of relationship dictionaries
            
        Returns:
            DOT format string
        """
        lines = ['digraph MemoryGraph {']
        lines.append('    rankdir=LR;')
        lines.append('    node [shape=box, style=rounded];')
        
        # Create node definitions
        node_map = {}
        for i, node in enumerate(nodes):
            node_id = f"N{i}"
            node_map[str(node.get('id', i))] = node_id
            
            # Format node based on type
            node_type = node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown'
            props = node.get('properties', {})
            
            if node_type == 'Memory':
                label = f"Memory\\n{props.get('context', 'N/A')[:30]}..."
                color = "lightblue"
            elif node_type == 'File':
                label = f"File\\n{props.get('name', props.get('path', 'N/A'))}"
                color = "lightgreen"
            elif node_type == 'Function':
                label = f"Function\\n{props.get('name', 'N/A')}"
                color = "lightyellow"
            elif node_type == 'Class':
                label = f"Class\\n{props.get('name', 'N/A')}"
                color = "lightpink"
            elif node_type == 'Architecture':
                label = f"Architecture\\n{props.get('type', 'N/A')}"
                color = "lightcoral"
            elif node_type == 'Decision':
                label = f"Decision\\n{props.get('type', 'N/A')}"
                color = "lavender"
            elif node_type == 'Pattern':
                label = f"Pattern\\n{props.get('name', 'N/A')}"
                color = "lightsalmon"
            else:
                label = f"{node_type}\\n{str(props)[:30]}..."
                color = "lightgray"
            
            lines.append(f'    {node_id} [label="{label}", fillcolor="{color}", style=filled];')
        
        # Create relationships
        for rel in relationships:
            start_id = node_map.get(str(rel.get('startNode')), 'N0')
            end_id = node_map.get(str(rel.get('endNode')), 'N0')
            rel_type = rel.get('type', 'RELATES')
            
            lines.append(f'    {start_id} -> {end_id} [label="{rel_type}"];')
        
        lines.append('}')
        return '\n'.join(lines)
    
    @staticmethod
    def to_json(nodes: List[Dict], relationships: List[Dict]) -> Dict[str, Any]:
        """
        Convert graph to JSON format suitable for D3.js or other JS libraries.
        
        Args:
            nodes: List of node dictionaries
            relationships: List of relationship dictionaries
            
        Returns:
            JSON-compatible dictionary
        """
        # Create node list with consistent IDs
        json_nodes = []
        node_map = {}
        
        for i, node in enumerate(nodes):
            node_id = str(node.get('id', i))
            node_map[node_id] = i
            
            json_node = {
                'id': i,
                'label': node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown',
                'properties': node.get('properties', {}),
                'group': node.get('labels', ['Unknown'])[0] if node.get('labels') else 'Unknown'
            }
            json_nodes.append(json_node)
        
        # Create links
        json_links = []
        for rel in relationships:
            start_idx = node_map.get(str(rel.get('startNode')), 0)
            end_idx = node_map.get(str(rel.get('endNode')), 0)
            
            json_link = {
                'source': start_idx,
                'target': end_idx,
                'type': rel.get('type', 'RELATES'),
                'properties': rel.get('properties', {})
            }
            json_links.append(json_link)
        
        return {
            'nodes': json_nodes,
            'links': json_links
        }
    
    @staticmethod
    def save_visualization(
        nodes: List[Dict],
        relationships: List[Dict],
        output_path: str,
        format: str = 'mermaid'
    ):
        """
        Save visualization to file.
        
        Args:
            nodes: List of node dictionaries
            relationships: List of relationship dictionaries
            output_path: Path to save the file
            format: Output format ('mermaid', 'graphviz', 'json')
        """
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        if format == 'mermaid':
            content = GraphVisualizer.to_mermaid(nodes, relationships)
            suffix = '.mmd'
        elif format == 'graphviz':
            content = GraphVisualizer.to_graphviz(nodes, relationships)
            suffix = '.dot'
        elif format == 'json':
            data = GraphVisualizer.to_json(nodes, relationships)
            content = json.dumps(data, indent=2)
            suffix = '.json'
        else:
            raise ValueError(f"Unknown format: {format}")
        
        # Ensure correct extension
        if not path.suffix:
            path = path.with_suffix(suffix)
        
        path.write_text(content)
        return str(path)