#!/usr/bin/env python3
"""
Analyze conversation JSONL logs for debugging and forensics.

This script parses JSONL conversation logs and provides insights:
- Agent execution timeline
- Tool usage statistics
- Error analysis
- Token/cost breakdown
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any


def load_jsonl(filepath: Path) -> List[Dict[str, Any]]:
    """Load JSONL file into list of dicts."""
    entries = []
    with open(filepath) as f:
        for line in f:
            if line.strip():
                entries.append(json.loads(line))
    return entries


def analyze_conversation(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze conversation entries and extract insights."""

    # Initialize counters
    stats = {
        "agent_name": None,
        "total_turns": 0,
        "total_messages": len(entries),
        "user_prompts": 0,
        "assistant_responses": 0,
        "tool_uses": defaultdict(int),
        "errors": [],
        "timeline": [],
        "total_cost": 0.0,
        "total_tokens_in": 0,
        "total_tokens_out": 0,
        "success": False,
        "termination_reason": None
    }

    for entry in entries:
        entry_type = entry.get("type")
        timestamp = entry.get("timestamp")

        # Capture agent name
        if not stats["agent_name"] and "agent" in entry:
            stats["agent_name"] = entry["agent"]

        # User prompts
        if entry_type == "user_prompt":
            stats["user_prompts"] += 1
            stats["timeline"].append({
                "time": timestamp,
                "event": "User Prompt",
                "content": entry.get("content", "")[:100] + "..."
            })

        # Assistant responses
        elif entry_type == "assistant_message":
            stats["assistant_responses"] += 1
            turn_info = entry.get("turn", "?/?")

            # Count tool uses
            for tool in entry.get("tool_uses", []):
                tool_name = tool.get("name")
                stats["tool_uses"][tool_name] += 1

            # Timeline event
            text_summary = ""
            if entry.get("text_blocks"):
                text_summary = entry["text_blocks"][0][:80] + "..."

            stats["timeline"].append({
                "time": timestamp,
                "event": f"Turn {turn_info}",
                "tools": [t["name"] for t in entry.get("tool_uses", [])],
                "content": text_summary
            })

        # Results
        elif entry_type == "result":
            stats["success"] = entry.get("success", False)
            stats["termination_reason"] = entry.get("termination_reason")
            stats["total_cost"] = entry.get("cost_usd") or 0.0
            stats["total_tokens_in"] = entry.get("input_tokens") or 0
            stats["total_tokens_out"] = entry.get("output_tokens") or 0

            stats["timeline"].append({
                "time": timestamp,
                "event": "Completed" if stats["success"] else "Failed",
                "reason": stats["termination_reason"],
                "cost": f"${stats['total_cost']:.4f}"
            })

        # Errors
        elif entry_type == "error":
            stats["errors"].append({
                "time": timestamp,
                "turn": entry.get("turn"),
                "error_type": entry.get("error_type"),
                "message": entry.get("error_message")
            })

            stats["timeline"].append({
                "time": timestamp,
                "event": "ERROR",
                "error": entry.get("error_type")
            })

    return stats


def print_analysis(stats: Dict[str, Any]):
    """Print formatted analysis."""

    print("=" * 80)
    print("CONVERSATION ANALYSIS")
    print("=" * 80)
    print(f"Agent: {stats['agent_name']}")
    print(f"Success: {'✅ YES' if stats['success'] else '❌ NO'}")
    print(f"Termination: {stats['termination_reason']}")
    print()

    print("=" * 80)
    print("STATISTICS")
    print("=" * 80)
    print(f"Total Messages: {stats['total_messages']}")
    print(f"User Prompts: {stats['user_prompts']}")
    print(f"Assistant Responses: {stats['assistant_responses']}")
    print()

    print("Tool Usage:")
    if stats['tool_uses']:
        for tool, count in sorted(stats['tool_uses'].items(), key=lambda x: x[1], reverse=True):
            print(f"  - {tool}: {count}")
    else:
        print("  No tools used")
    print()

    print(f"Total Cost: ${stats['total_cost']:.4f}")
    print(f"Tokens In: {stats['total_tokens_in']:,}")
    print(f"Tokens Out: {stats['total_tokens_out']:,}")
    print()

    if stats['errors']:
        print("=" * 80)
        print("ERRORS")
        print("=" * 80)
        for error in stats['errors']:
            print(f"Turn {error['turn']}: {error['error_type']}")
            print(f"  {error['message']}")
            print()

    print("=" * 80)
    print("TIMELINE")
    print("=" * 80)
    for event in stats['timeline']:
        time = event['time']
        evt = event['event']
        print(f"\n[{time}] {evt}")

        if 'tools' in event and event['tools']:
            print(f"  Tools: {', '.join(event['tools'])}")

        if 'content' in event and event['content']:
            print(f"  {event['content']}")

        if 'reason' in event:
            print(f"  Reason: {event['reason']}")

        if 'cost' in event:
            print(f"  Cost: {event['cost']}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python analyze-conversation.py <conversation.jsonl>")
        print("\nAvailable conversations:")
        log_dir = Path("logs/conversations")
        if log_dir.exists():
            for jsonl_file in sorted(log_dir.glob("conversation_*.jsonl")):
                print(f"  {jsonl_file}")
        else:
            print("  No conversations found in logs/conversations/")
        sys.exit(1)

    filepath = Path(sys.argv[1])

    if not filepath.exists():
        print(f"Error: File not found: {filepath}")
        sys.exit(1)

    print(f"Loading: {filepath}")
    print()

    entries = load_jsonl(filepath)
    stats = analyze_conversation(entries)
    print_analysis(stats)


if __name__ == "__main__":
    main()
