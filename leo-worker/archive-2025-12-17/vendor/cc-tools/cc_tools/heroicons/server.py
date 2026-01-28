#!/usr/bin/env python3
"""
Heroicons MCP Server

Provides Heroicons integration for AI agents to search, retrieve, and generate
React icon components. Uses the Heroicons v2 icon set designed by the Tailwind CSS team.
"""

import json
import re
from typing import List, Dict, Any, Optional, Literal
from difflib import get_close_matches

from fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("Heroicons Server", version="1.0.0")

# Heroicons v2 icon data (subset for demonstration, would be loaded from full dataset)
# In production, this would load from the official Heroicons npm package
HEROICONS_DATA = {
    "outline": {
        # Navigation
        "home": {"category": "navigation", "keywords": ["house", "main", "dashboard"]},
        "arrow-left": {"category": "navigation", "keywords": ["back", "previous", "return"]},
        "arrow-right": {"category": "navigation", "keywords": ["forward", "next", "continue"]},
        "arrow-up": {"category": "navigation", "keywords": ["up", "top", "ascend"]},
        "arrow-down": {"category": "navigation", "keywords": ["down", "bottom", "descend"]},
        "chevron-left": {"category": "navigation", "keywords": ["back", "previous", "nav"]},
        "chevron-right": {"category": "navigation", "keywords": ["forward", "next", "nav"]},
        "chevron-up": {"category": "navigation", "keywords": ["expand", "up", "more"]},
        "chevron-down": {"category": "navigation", "keywords": ["collapse", "down", "dropdown"]},
        "bars-3": {"category": "navigation", "keywords": ["menu", "hamburger", "navigation"]},
        "x-mark": {"category": "navigation", "keywords": ["close", "cancel", "exit", "x"]},
        
        # Actions
        "plus": {"category": "actions", "keywords": ["add", "create", "new", "positive"]},
        "minus": {"category": "actions", "keywords": ["remove", "subtract", "delete", "negative"]},
        "pencil": {"category": "actions", "keywords": ["edit", "write", "modify", "change"]},
        "pencil-square": {"category": "actions", "keywords": ["edit", "write", "modify", "form"]},
        "trash": {"category": "actions", "keywords": ["delete", "remove", "bin", "garbage"]},
        "check": {"category": "actions", "keywords": ["done", "complete", "tick", "yes"]},
        "clipboard": {"category": "actions", "keywords": ["copy", "paste", "clip"]},
        "duplicate": {"category": "actions", "keywords": ["copy", "clone", "replicate"]},
        "share": {"category": "actions", "keywords": ["send", "distribute", "social"]},
        "download": {"category": "actions", "keywords": ["save", "export", "get"]},
        "upload": {"category": "actions", "keywords": ["import", "add", "send"]},
        
        # Status
        "check-circle": {"category": "status", "keywords": ["success", "complete", "done", "ok"]},
        "x-circle": {"category": "status", "keywords": ["error", "fail", "wrong", "no"]},
        "exclamation-circle": {"category": "status", "keywords": ["warning", "alert", "caution"]},
        "exclamation-triangle": {"category": "status", "keywords": ["warning", "danger", "alert"]},
        "information-circle": {"category": "status", "keywords": ["info", "help", "about", "details"]},
        "question-mark-circle": {"category": "status", "keywords": ["help", "question", "support", "faq"]},
        
        # User
        "user": {"category": "user", "keywords": ["person", "account", "profile", "avatar"]},
        "user-circle": {"category": "user", "keywords": ["person", "account", "profile", "avatar"]},
        "user-group": {"category": "user", "keywords": ["people", "team", "users", "group"]},
        "users": {"category": "user", "keywords": ["people", "team", "multiple", "group"]},
        "user-plus": {"category": "user", "keywords": ["add", "invite", "new", "person"]},
        "user-minus": {"category": "user", "keywords": ["remove", "delete", "person"]},
        
        # Communication
        "envelope": {"category": "communication", "keywords": ["email", "mail", "message", "send"]},
        "phone": {"category": "communication", "keywords": ["call", "contact", "telephone"]},
        "chat-bubble-left": {"category": "communication", "keywords": ["message", "comment", "talk", "speak"]},
        "chat-bubble-left-right": {"category": "communication", "keywords": ["conversation", "chat", "message"]},
        "video-camera": {"category": "communication", "keywords": ["video", "camera", "record", "meeting"]},
        "microphone": {"category": "communication", "keywords": ["audio", "record", "speak", "voice"]},
        
        # Files & Documents
        "document": {"category": "files", "keywords": ["file", "page", "paper", "doc"]},
        "document-text": {"category": "files", "keywords": ["file", "text", "content", "doc"]},
        "folder": {"category": "files", "keywords": ["directory", "files", "organize"]},
        "folder-open": {"category": "files", "keywords": ["directory", "files", "explore"]},
        "paper-clip": {"category": "files", "keywords": ["attachment", "attach", "file"]},
        "photo": {"category": "files", "keywords": ["image", "picture", "gallery"]},
        "film": {"category": "files", "keywords": ["video", "movie", "media"]},
        "musical-note": {"category": "files", "keywords": ["music", "audio", "sound"]},
        
        # Settings & Tools
        "cog-6-tooth": {"category": "settings", "keywords": ["settings", "config", "preferences", "gear"]},
        "cog-8-tooth": {"category": "settings", "keywords": ["settings", "config", "advanced", "gear"]},
        "adjustments-horizontal": {"category": "settings", "keywords": ["settings", "filter", "options"]},
        "adjustments-vertical": {"category": "settings", "keywords": ["settings", "filter", "options"]},
        "wrench": {"category": "settings", "keywords": ["tools", "fix", "repair", "build"]},
        "wrench-screwdriver": {"category": "settings", "keywords": ["tools", "fix", "repair", "build"]},
        
        # UI Elements
        "magnifying-glass": {"category": "ui", "keywords": ["search", "find", "look", "zoom"]},
        "bell": {"category": "ui", "keywords": ["notification", "alert", "alarm", "notify"]},
        "bell-alert": {"category": "ui", "keywords": ["notification", "alert", "urgent", "alarm"]},
        "eye": {"category": "ui", "keywords": ["view", "see", "visible", "show"]},
        "eye-slash": {"category": "ui", "keywords": ["hide", "hidden", "invisible", "private"]},
        "lock-closed": {"category": "ui", "keywords": ["secure", "locked", "private", "password"]},
        "lock-open": {"category": "ui", "keywords": ["unlocked", "open", "public", "accessible"]},
        "key": {"category": "ui", "keywords": ["password", "access", "security", "auth"]},
        "shield-check": {"category": "ui", "keywords": ["security", "protect", "safe", "verified"]},
        
        # Business & Finance
        "currency-dollar": {"category": "business", "keywords": ["money", "payment", "price", "cost"]},
        "credit-card": {"category": "business", "keywords": ["payment", "card", "purchase", "buy"]},
        "chart-bar": {"category": "business", "keywords": ["analytics", "stats", "graph", "data"]},
        "chart-pie": {"category": "business", "keywords": ["analytics", "stats", "graph", "data"]},
        "trending-up": {"category": "business", "keywords": ["growth", "increase", "success", "profit"]},
        "trending-down": {"category": "business", "keywords": ["decrease", "loss", "decline", "down"]},
        "briefcase": {"category": "business", "keywords": ["work", "business", "job", "office"]},
        "building-office": {"category": "business", "keywords": ["company", "business", "corporate", "work"]},
        
        # Time & Calendar
        "calendar": {"category": "time", "keywords": ["date", "schedule", "event", "appointment"]},
        "calendar-days": {"category": "time", "keywords": ["date", "schedule", "month", "days"]},
        "clock": {"category": "time", "keywords": ["time", "hour", "minute", "schedule"]},
        "stop-watch": {"category": "time", "keywords": ["timer", "stopwatch", "time", "duration"]},
        
        # Miscellaneous
        "flag": {"category": "misc", "keywords": ["mark", "important", "bookmark", "report"]},
        "star": {"category": "misc", "keywords": ["favorite", "bookmark", "rate", "important"]},
        "heart": {"category": "misc", "keywords": ["love", "like", "favorite", "health"]},
        "globe-alt": {"category": "misc", "keywords": ["world", "internet", "web", "global"]},
        "map": {"category": "misc", "keywords": ["location", "navigation", "directions"]},
        "map-pin": {"category": "misc", "keywords": ["location", "place", "marker", "pin"]},
    },
    "solid": {
        # Solid variants have the same icons but filled versions
        # For brevity, using same structure as outline
    }
}

# Copy outline to solid for demo (in reality, these would be different SVG paths)
HEROICONS_DATA["solid"] = HEROICONS_DATA["outline"].copy()


def search_icons_by_name(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search icons by name using fuzzy matching."""
    all_icons = list(HEROICONS_DATA["outline"].keys())
    
    # Exact matches first
    exact_matches = [name for name in all_icons if query.lower() in name.lower()]
    
    # Fuzzy matches
    fuzzy_matches = get_close_matches(query.lower(), all_icons, n=limit, cutoff=0.6)
    
    # Combine and deduplicate
    matches = []
    seen = set()
    
    for name in exact_matches + fuzzy_matches:
        if name not in seen and len(matches) < limit:
            seen.add(name)
            icon_data = HEROICONS_DATA["outline"][name]
            matches.append({
                "name": name,
                "category": icon_data["category"],
                "keywords": icon_data["keywords"]
            })
    
    return matches


def search_icons_by_keyword(keyword: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search icons by keyword."""
    matches = []
    keyword_lower = keyword.lower()
    
    for name, data in HEROICONS_DATA["outline"].items():
        if keyword_lower in data.get("keywords", []) or keyword_lower in name:
            matches.append({
                "name": name,
                "category": data["category"],
                "keywords": data["keywords"]
            })
            if len(matches) >= limit:
                break
    
    return matches


def get_import_statement(icon_name: str, variant: str = "outline") -> str:
    """Generate the import statement for an icon."""
    # Convert kebab-case to PascalCase
    pascal_name = ''.join(word.capitalize() for word in icon_name.split('-'))
    size = "24" if variant == "outline" else "20" if variant == "mini" else "24"
    return f"import {{ {pascal_name}Icon }} from '@heroicons/react/{size}/{variant}'"


def generate_icon_component(
    icon_name: str,
    variant: str = "outline",
    className: str = "h-6 w-6",
    props: Optional[Dict[str, Any]] = None
) -> str:
    """Generate a React icon component."""
    pascal_name = ''.join(word.capitalize() for word in icon_name.split('-'))
    
    # Build props string
    props_str = f'className="{className}"'
    if props:
        for key, value in props.items():
            if isinstance(value, str):
                props_str += f' {key}="{value}"'
            else:
                props_str += f' {key}={{{value}}}'
    
    return f"<{pascal_name}Icon {props_str} />"


@mcp.tool()
async def search_icons(
    query: str,
    search_type: Literal["name", "keyword", "all"] = "all",
    limit: int = 10
) -> str:
    """
    Search for Heroicons by name or keywords.
    
    Args:
        query: Search query string
        search_type: Type of search - "name", "keyword", or "all"
        limit: Maximum number of results to return
    
    Returns:
        JSON string with search results
    """
    results = []
    
    if search_type in ["name", "all"]:
        results.extend(search_icons_by_name(query, limit))
    
    if search_type in ["keyword", "all"]:
        keyword_results = search_icons_by_keyword(query, limit)
        # Avoid duplicates
        existing_names = {r["name"] for r in results}
        results.extend([r for r in keyword_results if r["name"] not in existing_names])
    
    # Limit final results
    results = results[:limit]
    
    return json.dumps({
        "query": query,
        "count": len(results),
        "results": results
    }, indent=2)


@mcp.tool()
async def get_icon(
    icon_name: str,
    variant: Literal["outline", "solid"] = "outline",
    size: Literal[20, 24] = 24,
    format: Literal["component", "import", "both"] = "both"
) -> str:
    """
    Get a specific Heroicon with import statement and component code.
    
    Args:
        icon_name: Name of the icon (kebab-case)
        variant: Icon variant - "outline" or "solid"
        size: Icon size - 20 (mini) or 24 (default)
        format: Return format - "component", "import", or "both"
    
    Returns:
        JSON string with icon details and code
    """
    if icon_name not in HEROICONS_DATA.get(variant, {}):
        # Try to find similar icons
        similar = get_close_matches(icon_name, list(HEROICONS_DATA["outline"].keys()), n=3, cutoff=0.6)
        return json.dumps({
            "error": f"Icon '{icon_name}' not found",
            "suggestions": similar
        }, indent=2)
    
    icon_data = HEROICONS_DATA[variant][icon_name]
    
    result = {
        "name": icon_name,
        "variant": variant,
        "size": size,
        "category": icon_data["category"],
        "keywords": icon_data["keywords"]
    }
    
    if format in ["import", "both"]:
        result["import"] = get_import_statement(icon_name, variant)
    
    if format in ["component", "both"]:
        result["component"] = generate_icon_component(icon_name, variant, f"h-{size//4} w-{size//4}")
    
    return json.dumps(result, indent=2)


@mcp.tool()
async def list_categories() -> str:
    """
    List all available icon categories.
    
    Returns:
        JSON string with categories and icon counts
    """
    categories = {}
    
    for icon_name, icon_data in HEROICONS_DATA["outline"].items():
        category = icon_data["category"]
        if category not in categories:
            categories[category] = {
                "name": category,
                "icons": []
            }
        categories[category]["icons"].append(icon_name)
    
    # Convert to list with counts
    category_list = []
    for cat_name, cat_data in categories.items():
        category_list.append({
            "name": cat_name,
            "count": len(cat_data["icons"]),
            "sample_icons": cat_data["icons"][:5]  # First 5 as samples
        })
    
    return json.dumps({
        "total_categories": len(category_list),
        "categories": sorted(category_list, key=lambda x: x["count"], reverse=True)
    }, indent=2)


@mcp.tool()
async def generate_react_component(
    icon_name: str,
    variant: Literal["outline", "solid"] = "outline",
    className: str = "h-6 w-6",
    with_import: bool = True,
    typescript: bool = True,
    aria_label: Optional[str] = None
) -> str:
    """
    Generate a complete React component with the icon.
    
    Args:
        icon_name: Name of the icon (kebab-case)
        variant: Icon variant - "outline" or "solid"
        className: Tailwind classes for the icon
        with_import: Include import statement
        typescript: Use TypeScript syntax
        aria_label: Accessibility label for the icon
    
    Returns:
        JSON string with complete component code
    """
    if icon_name not in HEROICONS_DATA.get(variant, {}):
        return json.dumps({
            "error": f"Icon '{icon_name}' not found",
            "suggestions": get_close_matches(icon_name, list(HEROICONS_DATA["outline"].keys()), n=3)
        }, indent=2)
    
    # Generate component parts
    import_stmt = get_import_statement(icon_name, variant) if with_import else ""
    
    # Add aria-label if provided
    props = {"aria-label": aria_label} if aria_label else None
    component = generate_icon_component(icon_name, variant, className, props)
    
    # Full component example
    pascal_name = ''.join(word.capitalize() for word in icon_name.split('-'))
    
    if typescript:
        example_component = f"""
{import_stmt}

interface IconButtonProps {{
  onClick?: () => void;
  label?: string;
}}

export function IconButton{{ onClick, label = "{icon_name.replace('-', ' ').title()}" }}: IconButtonProps) {{
  return (
    <button
      onClick={{onClick}}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={{label}}
    >
      {component}
    </button>
  );
}}"""
    else:
        example_component = f"""
{import_stmt}

export function IconButton({{ onClick, label = "{icon_name.replace('-', ' ').title()}" }}) {{
  return (
    <button
      onClick={{onClick}}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={{label}}
    >
      {component}
    </button>
  );
}}"""
    
    return json.dumps({
        "icon_name": icon_name,
        "variant": variant,
        "import_statement": import_stmt,
        "component_jsx": component,
        "example_usage": example_component.strip(),
        "tailwind_classes": className
    }, indent=2)


@mcp.tool()
async def suggest_icon(
    context: str,
    ui_element: Literal["button", "nav", "status", "action", "info"] = "button",
    count: int = 3
) -> str:
    """
    Suggest appropriate icons based on context and UI element type.
    
    Args:
        context: Description of what the icon is for
        ui_element: Type of UI element the icon will be used in
        count: Number of suggestions to return
    
    Returns:
        JSON string with icon suggestions
    """
    # Map UI elements to relevant categories and keywords
    ui_mappings = {
        "button": ["actions", "navigation"],
        "nav": ["navigation"],
        "status": ["status"],
        "action": ["actions"],
        "info": ["status", "ui"]
    }
    
    # Extract keywords from context
    context_words = re.findall(r'\w+', context.lower())
    
    suggestions = []
    scores = {}
    
    # Score icons based on context match
    for icon_name, icon_data in HEROICONS_DATA["outline"].items():
        score = 0
        
        # Category match
        if icon_data["category"] in ui_mappings.get(ui_element, []):
            score += 2
        
        # Keyword match
        for word in context_words:
            if word in icon_name:
                score += 3
            if word in icon_data["keywords"]:
                score += 2
        
        if score > 0:
            scores[icon_name] = score
    
    # Get top suggestions
    sorted_icons = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    
    for icon_name, score in sorted_icons[:count]:
        icon_data = HEROICONS_DATA["outline"][icon_name]
        suggestions.append({
            "name": icon_name,
            "score": score,
            "category": icon_data["category"],
            "keywords": icon_data["keywords"],
            "import": get_import_statement(icon_name),
            "component": generate_icon_component(icon_name)
        })
    
    return json.dumps({
        "context": context,
        "ui_element": ui_element,
        "suggestions": suggestions
    }, indent=2)


if __name__ == "__main__":
    # Run the FastMCP server
    mcp.run()