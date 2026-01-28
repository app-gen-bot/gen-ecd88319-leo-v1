"""
Session Management for Context Manager

Tracks conversation context, tool interactions, and decision flow.
"""

import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass, field, asdict
from pathlib import Path
from enum import Enum

from ..common.logging_utils import setup_mcp_server_logging

# Setup logging
logger = setup_mcp_server_logging("context_manager.session")


class ToolCategory(Enum):
    """Categories of tools for routing decisions"""
    MEMORY = "memory"
    CODE_ANALYSIS = "code_analysis"
    FILE_COMPARISON = "file_comparison"
    GRAPH = "graph"
    BUILD = "build"
    PACKAGE = "package"
    GENERAL = "general"
    DOCUMENT_GENERATION = "document_generation"
    FILE_OPERATIONS = "file_operations"


@dataclass
class ToolInteraction:
    """Record of a tool interaction"""
    tool_name: str
    category: ToolCategory
    timestamp: str
    input_summary: str
    output_summary: str
    success: bool
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['category'] = self.category.value
        return data


@dataclass
class QueryContext:
    """Context for a single query"""
    query: str
    intent: str
    entities: List[str] = field(default_factory=list)
    required_tools: List[str] = field(default_factory=list)
    suggested_tools: List[str] = field(default_factory=list)
    constraints: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Session:
    """Represents a conversation session"""
    session_id: str
    start_time: str
    workspace: str
    queries: List[QueryContext] = field(default_factory=list)
    tool_interactions: List[ToolInteraction] = field(default_factory=list)
    memory_references: List[str] = field(default_factory=list)
    graph_nodes_created: List[str] = field(default_factory=list)
    files_analyzed: Set[str] = field(default_factory=set)
    decisions_made: List[Dict[str, str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_query(self, query: str, intent: str) -> QueryContext:
        """Add a new query to the session"""
        context = QueryContext(query=query, intent=intent)
        self.queries.append(context)
        return context
    
    def add_tool_interaction(
        self,
        tool_name: str,
        category: ToolCategory,
        input_summary: str,
        output_summary: str,
        success: bool,
        duration_ms: Optional[int] = None,
        error: Optional[str] = None
    ):
        """Record a tool interaction"""
        interaction = ToolInteraction(
            tool_name=tool_name,
            category=category,
            timestamp=datetime.now().isoformat(),
            input_summary=input_summary,
            output_summary=output_summary,
            success=success,
            duration_ms=duration_ms,
            error=error
        )
        self.tool_interactions.append(interaction)
        
    def get_tool_usage_stats(self) -> Dict[str, Any]:
        """Get statistics about tool usage in this session"""
        stats = {
            "total_interactions": len(self.tool_interactions),
            "successful_interactions": len([t for t in self.tool_interactions if t.success]),
            "failed_interactions": len([t for t in self.tool_interactions if not t.success]),
            "by_category": {},
            "by_tool": {}
        }
        
        for interaction in self.tool_interactions:
            # By category
            cat = interaction.category.value
            if cat not in stats["by_category"]:
                stats["by_category"][cat] = 0
            stats["by_category"][cat] += 1
            
            # By tool
            if interaction.tool_name not in stats["by_tool"]:
                stats["by_tool"][interaction.tool_name] = 0
            stats["by_tool"][interaction.tool_name] += 1
            
        return stats
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary"""
        return {
            "session_id": self.session_id,
            "start_time": self.start_time,
            "workspace": self.workspace,
            "queries": [asdict(q) for q in self.queries],
            "tool_interactions": [t.to_dict() for t in self.tool_interactions],
            "memory_references": self.memory_references,
            "graph_nodes_created": self.graph_nodes_created,
            "files_analyzed": list(self.files_analyzed),
            "decisions_made": self.decisions_made,
            "metadata": self.metadata,
            "stats": self.get_tool_usage_stats()
        }


class SessionManager:
    """Manages conversation sessions"""
    
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or Path.home() / ".cc_context_manager" / "sessions"
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.current_session: Optional[Session] = None
        self.sessions: Dict[str, Session] = {}
        logger.info(f"SessionManager initialized with storage at {self.storage_dir}")
        
    def create_session(self, workspace: str, metadata: Optional[Dict[str, Any]] = None) -> Session:
        """Create a new session"""
        session_id = str(uuid.uuid4())
        session = Session(
            session_id=session_id,
            start_time=datetime.now().isoformat(),
            workspace=workspace,
            metadata=metadata or {}
        )
        
        self.sessions[session_id] = session
        self.current_session = session
        
        logger.info(f"Created new session {session_id} for workspace {workspace}")
        return session
    
    def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID"""
        return self.sessions.get(session_id)
    
    def get_current_session(self) -> Optional[Session]:
        """Get the current active session"""
        return self.current_session
    
    def set_current_session(self, session_id: str) -> bool:
        """Set the current session"""
        if session_id in self.sessions:
            self.current_session = self.sessions[session_id]
            return True
        return False
    
    def save_session(self, session: Session):
        """Save session to disk"""
        session_file = self.storage_dir / f"{session.session_id}.json"
        with open(session_file, 'w') as f:
            json.dump(session.to_dict(), f, indent=2)
        logger.info(f"Saved session {session.session_id} to {session_file}")
    
    def load_session(self, session_id: str) -> Optional[Session]:
        """Load session from disk"""
        session_file = self.storage_dir / f"{session_id}.json"
        if not session_file.exists():
            return None
            
        try:
            with open(session_file, 'r') as f:
                data = json.load(f)
            
            # Reconstruct session
            session = Session(
                session_id=data["session_id"],
                start_time=data["start_time"],
                workspace=data["workspace"],
                metadata=data.get("metadata", {})
            )
            
            # Restore queries
            for q_data in data.get("queries", []):
                context = QueryContext(**q_data)
                session.queries.append(context)
            
            # Restore tool interactions
            for t_data in data.get("tool_interactions", []):
                t_data["category"] = ToolCategory(t_data["category"])
                interaction = ToolInteraction(**t_data)
                session.tool_interactions.append(interaction)
            
            # Restore other fields
            session.memory_references = data.get("memory_references", [])
            session.graph_nodes_created = data.get("graph_nodes_created", [])
            session.files_analyzed = set(data.get("files_analyzed", []))
            session.decisions_made = data.get("decisions_made", [])
            
            self.sessions[session_id] = session
            logger.info(f"Loaded session {session_id} from disk")
            return session
            
        except Exception as e:
            logger.error(f"Error loading session {session_id}: {e}")
            return None
    
    def get_recent_sessions(self, workspace: str, limit: int = 5) -> List[Session]:
        """Get recent sessions for a workspace"""
        # Load all session files
        sessions = []
        for session_file in self.storage_dir.glob("*.json"):
            try:
                with open(session_file, 'r') as f:
                    data = json.load(f)
                if data.get("workspace") == workspace:
                    sessions.append({
                        "session_id": data["session_id"],
                        "start_time": data["start_time"],
                        "queries": len(data.get("queries", [])),
                        "tools_used": len(data.get("tool_interactions", []))
                    })
            except:
                continue
        
        # Sort by start time and return most recent
        sessions.sort(key=lambda x: x["start_time"], reverse=True)
        return sessions[:limit]
    
    def analyze_tool_patterns(self, session: Session) -> Dict[str, Any]:
        """Analyze tool usage patterns in a session"""
        patterns = {
            "common_sequences": [],
            "error_patterns": [],
            "successful_workflows": []
        }
        
        # Find common tool sequences
        if len(session.tool_interactions) >= 2:
            sequences = {}
            for i in range(len(session.tool_interactions) - 1):
                seq = (
                    session.tool_interactions[i].tool_name,
                    session.tool_interactions[i+1].tool_name
                )
                sequences[seq] = sequences.get(seq, 0) + 1
            
            # Sort by frequency
            common_seqs = sorted(sequences.items(), key=lambda x: x[1], reverse=True)
            patterns["common_sequences"] = [
                {"tools": list(seq), "count": count}
                for seq, count in common_seqs[:5]
            ]
        
        # Find error patterns
        for interaction in session.tool_interactions:
            if not interaction.success and interaction.error:
                patterns["error_patterns"].append({
                    "tool": interaction.tool_name,
                    "error": interaction.error,
                    "input": interaction.input_summary
                })
        
        # Find successful workflows (queries that led to successful tool chains)
        for i, query in enumerate(session.queries):
            # Find tools used after this query
            query_tools = []
            for interaction in session.tool_interactions:
                if interaction.timestamp > query.query:  # Simple time comparison
                    query_tools.append(interaction)
                    if len(query_tools) >= 3:  # Limit to 3 tools per workflow
                        break
            
            if query_tools and all(t.success for t in query_tools):
                patterns["successful_workflows"].append({
                    "query_intent": query.intent,
                    "tools": [t.tool_name for t in query_tools]
                })
        
        return patterns