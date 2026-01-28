"""
Tool Orchestrator for Context Manager

Analyzes queries and determines optimal tool selection and execution order.
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

from .session import ToolCategory
from ..common.logging_utils import setup_mcp_server_logging

# Setup logging
logger = setup_mcp_server_logging("context_manager.orchestrator")


class QueryIntent(Enum):
    """Types of user query intents"""
    CODE_SEARCH = "code_search"
    CODE_ANALYSIS = "code_analysis"
    FILE_COMPARISON = "file_comparison"
    MEMORY_QUERY = "memory_query"
    MEMORY_STORE = "memory_store"
    PROJECT_OVERVIEW = "project_overview"
    BUILD_VERIFY = "build_verify"
    PACKAGE_MANAGE = "package_manage"
    API_ANALYSIS = "api_analysis"
    CHANGE_TRACKING = "change_tracking"
    PATTERN_DETECTION = "pattern_detection"
    GENERAL = "general"


@dataclass
class ToolRecommendation:
    """Recommendation for tool usage"""
    tool_name: str
    category: ToolCategory
    priority: int  # 1 = highest priority
    reason: str
    parameters: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.parameters is None:
            self.parameters = {}


class ToolOrchestrator:
    """Orchestrates tool selection based on query analysis"""
    
    def __init__(self):
        # Define tool mappings
        self.tools_by_category = {
            ToolCategory.MEMORY: ["mem0"],
            ToolCategory.CODE_ANALYSIS: ["tree_sitter"],
            ToolCategory.FILE_COMPARISON: ["integration_analyzer"],
            ToolCategory.GRAPH: ["neo4j"],  # When available
            ToolCategory.BUILD: ["build_test"],
            ToolCategory.PACKAGE: ["package_manager"],
        }
        
        # Define intent patterns
        self.intent_patterns = {
            QueryIntent.CODE_SEARCH: [
                r"find.*(?:function|class|method)",
                r"where.*(?:defined|implemented)",
                r"search.*code",
                r"look for.*(?:pattern|implementation)"
            ],
            QueryIntent.CODE_ANALYSIS: [
                r"analyze.*(?:code|structure)",
                r"what.*(?:functions|classes|methods)",
                r"extract.*entities",
                r"parse.*files?"
            ],
            QueryIntent.FILE_COMPARISON: [
                r"compare.*(?:files?|versions?|changes?)",
                r"what.*changed",
                r"diff.*between",
                r"modifications?.*(?:since|from)"
            ],
            QueryIntent.MEMORY_QUERY: [
                r"(?:remember|recall|retrieve).*(?:previous|past|earlier)",
                r"what.*(?:know|remember|stored)",
                r"search.*memor(?:y|ies)",
                r"find.*(?:previous|past).*(?:work|implementation)"
            ],
            QueryIntent.MEMORY_STORE: [
                r"(?:store|save|remember).*(?:this|implementation|decision)",
                r"add.*memory",
                r"record.*(?:decision|choice|rationale)"
            ],
            QueryIntent.PROJECT_OVERVIEW: [
                r"(?:overview|summary).*project",
                r"analyze.*(?:entire|whole).*(?:project|codebase)",
                r"what.*(?:project|codebase).*(?:contains?|about)"
            ],
            QueryIntent.BUILD_VERIFY: [
                r"(?:build|compile|verify).*project",
                r"check.*(?:build|compilation)",
                r"run.*tests?",
                r"verify.*(?:working|compiles)"
            ],
            QueryIntent.PACKAGE_MANAGE: [
                r"(?:add|install|remove).*(?:package|dependency)",
                r"manage.*dependencies",
                r"what.*packages?.*(?:installed|available)"
            ],
            QueryIntent.API_ANALYSIS: [
                r"(?:api|public).*(?:surface|interface|methods?)",
                r"track.*api.*changes?",
                r"breaking.*changes?",
                r"what.*(?:exposed|public)"
            ],
            QueryIntent.CHANGE_TRACKING: [
                r"track.*changes?",
                r"what.*(?:moved|renamed|refactored)",
                r"semantic.*(?:diff|changes?)",
                r"function.*(?:moved|relocated)"
            ],
            QueryIntent.PATTERN_DETECTION: [
                r"detect.*patterns?",
                r"find.*(?:singleton|factory|observer)",
                r"design.*patterns?",
                r"architectural.*patterns?"
            ]
        }
        
        logger.info("ToolOrchestrator initialized")
    
    def analyze_query(self, query: str) -> Tuple[QueryIntent, List[str]]:
        """
        Analyze query to determine intent and extract entities.
        
        Returns:
            Tuple of (intent, entities)
        """
        query_lower = query.lower()
        
        # Check each intent pattern
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    logger.info(f"Query matched intent: {intent}")
                    entities = self._extract_entities(query)
                    return intent, entities
        
        # Default to general intent
        entities = self._extract_entities(query)
        return QueryIntent.GENERAL, entities
    
    def _extract_entities(self, query: str) -> List[str]:
        """Extract potential entities from query"""
        entities = []
        
        # Extract file paths
        file_pattern = r'["\']?([a-zA-Z0-9_\-/]+\.[a-zA-Z]+)["\']?'
        entities.extend(re.findall(file_pattern, query))
        
        # Extract function/class names (CamelCase or snake_case)
        code_pattern = r'\b([A-Z][a-zA-Z0-9]+|[a-z]+_[a-z_]+)\b'
        potential_names = re.findall(code_pattern, query)
        entities.extend([n for n in potential_names if len(n) > 3])
        
        # Extract quoted strings
        quote_pattern = r'["\']([^"\']+)["\']'
        entities.extend(re.findall(quote_pattern, query))
        
        return list(set(entities))  # Remove duplicates
    
    def recommend_tools(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None
    ) -> List[ToolRecommendation]:
        """
        Recommend tools based on query and context.
        
        Args:
            query: User query
            context: Additional context (previous tools used, workspace info, etc.)
            
        Returns:
            List of tool recommendations in priority order
        """
        intent, entities = self.analyze_query(query)
        recommendations = []
        
        # Get recommendations based on intent
        if intent == QueryIntent.CODE_SEARCH:
            recommendations.extend([
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=1,
                    reason="Search code structure for specific entities",
                    parameters={"pattern": entities[0] if entities else None}
                ),
                ToolRecommendation(
                    tool_name="mem0",
                    category=ToolCategory.MEMORY,
                    priority=2,
                    reason="Check if similar code was analyzed before"
                )
            ])
            
        elif intent == QueryIntent.CODE_ANALYSIS:
            recommendations.append(
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=1,
                    reason="Analyze code structure and extract entities",
                    parameters={"file_path": entities[0] if entities else "."}
                )
            )
            
        elif intent == QueryIntent.FILE_COMPARISON:
            recommendations.extend([
                ToolRecommendation(
                    tool_name="integration_analyzer",
                    category=ToolCategory.FILE_COMPARISON,
                    priority=1,
                    reason="Compare files and detect changes",
                    parameters={"deep_analysis": True}
                ),
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=2,
                    reason="Analyze structure of changed files"
                )
            ])
            
        elif intent == QueryIntent.MEMORY_QUERY:
            recommendations.append(
                ToolRecommendation(
                    tool_name="mem0",
                    category=ToolCategory.MEMORY,
                    priority=1,
                    reason="Search stored memories for relevant information",
                    parameters={"action": "search", "query": " ".join(entities)}
                )
            )
            
        elif intent == QueryIntent.MEMORY_STORE:
            recommendations.append(
                ToolRecommendation(
                    tool_name="mem0",
                    category=ToolCategory.MEMORY,
                    priority=1,
                    reason="Store information in memory system",
                    parameters={"action": "add"}
                )
            )
            
        elif intent == QueryIntent.PROJECT_OVERVIEW:
            recommendations.extend([
                ToolRecommendation(
                    tool_name="integration_analyzer",
                    category=ToolCategory.FILE_COMPARISON,
                    priority=1,
                    reason="Analyze project structure and changes",
                    parameters={"deep_analysis": True, "store_findings": True}
                ),
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=2,
                    reason="Extract project-wide code patterns"
                ),
                ToolRecommendation(
                    tool_name="mem0",
                    category=ToolCategory.MEMORY,
                    priority=3,
                    reason="Store project analysis for future reference"
                )
            ])
            
        elif intent == QueryIntent.BUILD_VERIFY:
            recommendations.append(
                ToolRecommendation(
                    tool_name="build_test",
                    category=ToolCategory.BUILD,
                    priority=1,
                    reason="Verify project builds and tests pass"
                )
            )
            
        elif intent == QueryIntent.PACKAGE_MANAGE:
            recommendations.append(
                ToolRecommendation(
                    tool_name="package_manager",
                    category=ToolCategory.PACKAGE,
                    priority=1,
                    reason="Manage project dependencies"
                )
            )
            
        elif intent == QueryIntent.API_ANALYSIS:
            recommendations.extend([
                ToolRecommendation(
                    tool_name="integration_analyzer",
                    category=ToolCategory.FILE_COMPARISON,
                    priority=1,
                    reason="Track API surface changes",
                    parameters={"tool": "track_api_changes"}
                ),
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=2,
                    reason="Analyze public interfaces"
                )
            ])
            
        elif intent == QueryIntent.CHANGE_TRACKING:
            recommendations.append(
                ToolRecommendation(
                    tool_name="integration_analyzer",
                    category=ToolCategory.FILE_COMPARISON,
                    priority=1,
                    reason="Perform semantic diff analysis",
                    parameters={"tool": "analyze_code_changes"}
                )
            )
            
        elif intent == QueryIntent.PATTERN_DETECTION:
            recommendations.extend([
                ToolRecommendation(
                    tool_name="tree_sitter",
                    category=ToolCategory.CODE_ANALYSIS,
                    priority=1,
                    reason="Detect code patterns",
                    parameters={"detect_patterns": True}
                ),
                ToolRecommendation(
                    tool_name="mem0",
                    category=ToolCategory.MEMORY,
                    priority=2,
                    reason="Store detected patterns for future reference"
                )
            ])
        
        # Add context-based adjustments
        if context:
            recommendations = self._adjust_for_context(recommendations, context)
        
        # Sort by priority
        recommendations.sort(key=lambda x: x.priority)
        
        logger.info(f"Recommended {len(recommendations)} tools for intent {intent}")
        return recommendations
    
    def _adjust_for_context(
        self,
        recommendations: List[ToolRecommendation],
        context: Dict[str, Any]
    ) -> List[ToolRecommendation]:
        """Adjust recommendations based on context"""
        
        # If we recently used a tool successfully, deprioritize it
        recent_tools = context.get("recent_tools", [])
        for rec in recommendations:
            if rec.tool_name in recent_tools:
                rec.priority += 1  # Lower priority
                rec.reason += " (recently used)"
        
        # If we have failures, avoid those tools
        failed_tools = context.get("failed_tools", [])
        recommendations = [r for r in recommendations if r.tool_name not in failed_tools]
        
        return recommendations
    
    def create_execution_plan(
        self,
        recommendations: List[ToolRecommendation]
    ) -> List[Dict[str, Any]]:
        """
        Create an execution plan from recommendations.
        
        Returns:
            List of execution steps with dependencies
        """
        plan = []
        
        for i, rec in enumerate(recommendations):
            step = {
                "step": i + 1,
                "tool": rec.tool_name,
                "category": rec.category.value,
                "reason": rec.reason,
                "parameters": rec.parameters,
                "depends_on": []
            }
            
            # Add dependencies based on tool category
            if rec.category == ToolCategory.MEMORY and rec.parameters.get("action") == "add":
                # Memory storage depends on analysis tools
                for j in range(i):
                    if recommendations[j].category in [ToolCategory.CODE_ANALYSIS, ToolCategory.FILE_COMPARISON]:
                        step["depends_on"].append(j + 1)
            
            plan.append(step)
        
        return plan
    
    def suggest_next_action(
        self,
        current_context: Dict[str, Any],
        session_history: List[Dict[str, Any]]
    ) -> Optional[str]:
        """
        Suggest next action based on current context and history.
        
        Returns:
            Suggested action or None
        """
        # Check if we have incomplete analyses
        if current_context.get("partial_analysis"):
            return "Complete the analysis by running deep semantic diff"
        
        # Check if we found issues
        if current_context.get("errors_found"):
            return "Run build_test to verify fixes"
        
        # Check if we made changes without storing context
        if current_context.get("changes_made") and not current_context.get("stored_in_memory"):
            return "Store the implementation decisions in memory for future reference"
        
        # Check patterns in session history
        if len(session_history) > 2:
            # Look for repeated queries
            recent_intents = [h.get("intent") for h in session_history[-3:]]
            if len(set(recent_intents)) == 1:
                return "Consider a different approach or tool for this task"
        
        return None