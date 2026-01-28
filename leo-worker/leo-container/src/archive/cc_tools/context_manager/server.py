"""
Context Manager MCP Server

Orchestrates multiple tools and maintains conversation context.
"""

import json
import time
from typing import Dict, Any, List, Optional
from pathlib import Path

from fastmcp import FastMCP
from ..common.logging_utils import setup_mcp_server_logging
from .session import SessionManager, ToolCategory
from .orchestrator import ToolOrchestrator, QueryIntent

# Setup logging
logger = setup_mcp_server_logging("context_manager")
logger.info("[SERVER_INIT] Context Manager MCP server module loaded")

# Create MCP server instance
mcp = FastMCP("Context Manager")

# Initialize components
session_manager = SessionManager()
orchestrator = ToolOrchestrator()


@mcp.tool()
async def analyze_query(query: str, workspace: str = ".") -> str:
    """
    Analyze a query and recommend appropriate tools.
    
    This tool helps determine which other MCP tools to use based on the query intent
    and provides an execution plan.
    
    Args:
        query: The user's query or task description
        workspace: Current workspace directory
        
    Returns:
        JSON with query analysis and tool recommendations
    """
    logger.info(f"[ANALYZE_QUERY] Analyzing: {query}")
    
    try:
        # Get or create session
        session = session_manager.get_current_session()
        if not session:
            session = session_manager.create_session(workspace)
        
        # Analyze query
        intent, entities = orchestrator.analyze_query(query)
        
        # Get context for recommendations
        context = {
            "recent_tools": [t.tool_name for t in session.tool_interactions[-5:]],
            "failed_tools": [t.tool_name for t in session.tool_interactions if not t.success]
        }
        
        # Get tool recommendations
        recommendations = orchestrator.recommend_tools(query, context)
        
        # Create execution plan
        plan = orchestrator.create_execution_plan(recommendations)
        
        # Add query to session
        query_context = session.add_query(query, intent.value)
        query_context.entities = entities
        query_context.suggested_tools = [r.tool_name for r in recommendations]
        
        result = {
            "query": query,
            "intent": intent.value,
            "entities": entities,
            "recommendations": [
                {
                    "tool": r.tool_name,
                    "category": r.category.value,
                    "priority": r.priority,
                    "reason": r.reason,
                    "parameters": r.parameters
                }
                for r in recommendations
            ],
            "execution_plan": plan,
            "session_id": session.session_id
        }
        
        logger.info(f"[ANALYZE_QUERY] Intent: {intent.value}, Recommended {len(recommendations)} tools")
        return json.dumps(result, indent=2)
        
    except Exception as e:
        logger.error(f"[ANALYZE_QUERY] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def start_session(
    workspace: str,
    description: str = "",
    continue_previous: bool = False
) -> str:
    """
    Start or continue a context management session.
    
    Sessions track tool usage, decisions, and maintain context across interactions.
    
    Args:
        workspace: Project workspace path
        description: Description of the session goal
        continue_previous: Whether to continue the most recent session
        
    Returns:
        JSON with session information
    """
    logger.info(f"[START_SESSION] Starting session for workspace: {workspace}")
    
    try:
        if continue_previous:
            # Get recent sessions
            recent = session_manager.get_recent_sessions(workspace, limit=1)
            if recent:
                session_id = recent[0]["session_id"]
                session = session_manager.load_session(session_id)
                if session:
                    session_manager.set_current_session(session_id)
                    logger.info(f"[START_SESSION] Continuing session {session_id}")
                    return json.dumps({
                        "session_id": session_id,
                        "status": "continued",
                        "workspace": workspace,
                        "queries": len(session.queries),
                        "tools_used": len(session.tool_interactions)
                    })
        
        # Create new session
        metadata = {"description": description} if description else {}
        session = session_manager.create_session(workspace, metadata)
        
        result = {
            "session_id": session.session_id,
            "status": "created",
            "workspace": workspace,
            "description": description
        }
        
        return json.dumps(result, indent=2)
        
    except Exception as e:
        logger.error(f"[START_SESSION] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def record_tool_use(
    tool_name: str,
    category: str,
    input_summary: str,
    output_summary: str,
    success: bool = True,
    duration_ms: Optional[int] = None,
    error: Optional[str] = None
) -> str:
    """
    Record the use of a tool in the current session.
    
    This helps track tool interactions and learn patterns for better orchestration.
    
    Args:
        tool_name: Name of the tool used
        category: Tool category (memory, code_analysis, etc.)
        input_summary: Summary of input to the tool
        output_summary: Summary of tool output
        success: Whether the tool execution was successful
        duration_ms: Execution duration in milliseconds
        error: Error message if not successful
        
    Returns:
        JSON confirmation
    """
    logger.info(f"[RECORD_TOOL] Recording use of {tool_name}")
    
    try:
        session = session_manager.get_current_session()
        if not session:
            return json.dumps({"error": "No active session"})
        
        # Record the interaction
        session.add_tool_interaction(
            tool_name=tool_name,
            category=ToolCategory(category),
            input_summary=input_summary,
            output_summary=output_summary,
            success=success,
            duration_ms=duration_ms,
            error=error
        )
        
        # Save session
        session_manager.save_session(session)
        
        return json.dumps({
            "status": "recorded",
            "tool": tool_name,
            "success": success,
            "session_interactions": len(session.tool_interactions)
        })
        
    except Exception as e:
        logger.error(f"[RECORD_TOOL] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def get_session_context(
    session_id: Optional[str] = None,
    include_patterns: bool = True
) -> str:
    """
    Get the context of a session including tool usage and patterns.
    
    Args:
        session_id: Session ID (uses current if not specified)
        include_patterns: Whether to include usage pattern analysis
        
    Returns:
        JSON with session context and analytics
    """
    logger.info("[GET_CONTEXT] Getting session context")
    
    try:
        # Get session
        if session_id:
            session = session_manager.get_session(session_id)
        else:
            session = session_manager.get_current_session()
            
        if not session:
            return json.dumps({"error": "No session found"})
        
        # Build context
        context = {
            "session_id": session.session_id,
            "workspace": session.workspace,
            "start_time": session.start_time,
            "queries": [
                {
                    "query": q.query,
                    "intent": q.intent,
                    "entities": q.entities,
                    "suggested_tools": q.suggested_tools
                }
                for q in session.queries
            ],
            "tool_stats": session.get_tool_usage_stats(),
            "files_analyzed": list(session.files_analyzed),
            "memory_references": session.memory_references,
            "decisions_made": session.decisions_made
        }
        
        # Add patterns if requested
        if include_patterns:
            patterns = session_manager.analyze_tool_patterns(session)
            context["patterns"] = patterns
        
        # Add suggestions
        current_context = {
            "partial_analysis": any(not t.success for t in session.tool_interactions[-3:]),
            "errors_found": any("error" in t.output_summary.lower() for t in session.tool_interactions),
            "changes_made": any("modified" in t.output_summary.lower() for t in session.tool_interactions),
            "stored_in_memory": any(t.tool_name == "mem0" and t.success for t in session.tool_interactions)
        }
        
        suggestion = orchestrator.suggest_next_action(
            current_context,
            [{"intent": q.intent} for q in session.queries]
        )
        
        if suggestion:
            context["next_action_suggestion"] = suggestion
        
        return json.dumps(context, indent=2)
        
    except Exception as e:
        logger.error(f"[GET_CONTEXT] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def coordinate_tools(
    task: str,
    tools: List[str],
    parallel: bool = False
) -> str:
    """
    Coordinate multiple tools to complete a complex task.
    
    This tool helps manage dependencies and data flow between tools.
    
    Args:
        task: Description of the task
        tools: List of tools to coordinate
        parallel: Whether tools can run in parallel
        
    Returns:
        JSON with coordination plan and status
    """
    logger.info(f"[COORDINATE] Coordinating {len(tools)} tools for task: {task}")
    
    try:
        session = session_manager.get_current_session()
        if not session:
            session = session_manager.create_session(".")
        
        # Analyze dependencies
        tool_deps = {
            "mem0": ["tree_sitter", "integration_analyzer"],  # Memory depends on analysis
            "neo4j": ["tree_sitter"],  # Graph depends on code analysis
            "build_test": []  # Build test is independent
        }
        
        # Create execution order
        execution_order = []
        remaining = set(tools)
        
        while remaining:
            # Find tools with no pending dependencies
            ready = []
            for tool in remaining:
                deps = tool_deps.get(tool, [])
                if all(d not in remaining or d in execution_order for d in deps):
                    ready.append(tool)
            
            if not ready:
                # Circular dependency or unknown tools
                ready = list(remaining)
            
            if parallel:
                execution_order.append(ready)
                remaining -= set(ready)
            else:
                execution_order.append([ready[0]])
                remaining.remove(ready[0])
        
        # Create coordination plan
        plan = {
            "task": task,
            "tools": tools,
            "execution_mode": "parallel" if parallel else "sequential",
            "execution_order": execution_order,
            "steps": []
        }
        
        # Build detailed steps
        step_num = 1
        for batch in execution_order:
            for tool in batch:
                step = {
                    "step": step_num,
                    "tool": tool,
                    "parallel_with": batch if len(batch) > 1 else [],
                    "depends_on": [t for t in tool_deps.get(tool, []) if t in tools],
                    "data_flow": []
                }
                
                # Define data flows
                if tool == "mem0" and "tree_sitter" in tools:
                    step["data_flow"].append({
                        "from": "tree_sitter",
                        "data": "code_entities",
                        "transform": "entity_to_description"
                    })
                
                plan["steps"].append(step)
                step_num += 1
        
        # Record in session
        session.decisions_made.append({
            "decision": "tool_coordination",
            "task": task,
            "plan": plan
        })
        
        return json.dumps(plan, indent=2)
        
    except Exception as e:
        logger.error(f"[COORDINATE] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


@mcp.tool()
async def summarize_session(
    session_id: Optional[str] = None,
    save_summary: bool = True
) -> str:
    """
    Generate a summary of the session for handoff or review.
    
    Args:
        session_id: Session ID (uses current if not specified)
        save_summary: Whether to save the summary
        
    Returns:
        JSON with session summary
    """
    logger.info("[SUMMARIZE] Generating session summary")
    
    try:
        # Get session
        if session_id:
            session = session_manager.get_session(session_id)
        else:
            session = session_manager.get_current_session()
            
        if not session:
            return json.dumps({"error": "No session found"})
        
        # Generate summary
        summary = {
            "session_id": session.session_id,
            "workspace": session.workspace,
            "duration": "N/A",  # Would calculate from timestamps
            "overview": {
                "total_queries": len(session.queries),
                "total_tool_uses": len(session.tool_interactions),
                "success_rate": (
                    len([t for t in session.tool_interactions if t.success]) / 
                    len(session.tool_interactions) * 100
                    if session.tool_interactions else 0
                ),
                "unique_tools_used": len(set(t.tool_name for t in session.tool_interactions))
            },
            "queries_processed": [
                {
                    "query": q.query,
                    "intent": q.intent,
                    "tools_used": q.suggested_tools
                }
                for q in session.queries
            ],
            "key_findings": [],
            "files_touched": list(session.files_analyzed),
            "decisions_made": session.decisions_made,
            "tool_usage_by_category": session.get_tool_usage_stats()["by_category"],
            "recommendations": []
        }
        
        # Extract key findings
        for interaction in session.tool_interactions:
            if interaction.success and any(
                keyword in interaction.output_summary.lower()
                for keyword in ["found", "detected", "identified", "discovered"]
            ):
                summary["key_findings"].append({
                    "tool": interaction.tool_name,
                    "finding": interaction.output_summary
                })
        
        # Add recommendations based on patterns
        patterns = session_manager.analyze_tool_patterns(session)
        if patterns["error_patterns"]:
            summary["recommendations"].append(
                f"Address {len(patterns['error_patterns'])} tool errors encountered"
            )
        
        if patterns["successful_workflows"]:
            summary["recommendations"].append(
                f"Consider automating successful workflow: " +
                " → ".join(patterns["successful_workflows"][0]["tools"])
            )
        
        # Save if requested
        if save_summary:
            summary_file = session_manager.storage_dir / f"{session.session_id}_summary.json"
            with open(summary_file, 'w') as f:
                json.dump(summary, f, indent=2)
            logger.info(f"[SUMMARIZE] Saved summary to {summary_file}")
        
        return json.dumps(summary, indent=2)
        
    except Exception as e:
        logger.error(f"[SUMMARIZE] Error: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


def main() -> None:
    """Main entry point for the server."""
    logger.info("[MAIN] Starting Context Manager MCP server")
    mcp.run(transport="stdio", show_banner=False)


if __name__ == "__main__":
    main()