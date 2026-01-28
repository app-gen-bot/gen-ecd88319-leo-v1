# Heroicons MCP Server

An MCP (Model Context Protocol) server that provides Heroicons integration for AI agents, enabling them to search, retrieve, and generate React icon components.

## Features

- **Icon Search**: Fuzzy search through all Heroicons by name and keywords
- **Icon Retrieval**: Get SVG content or React component code
- **Category Listing**: Browse icons by category
- **React Component Generation**: Generate ready-to-use React components with TypeScript support
- **Variant Support**: Access both 'outline' and 'solid' icon variants
- **Tailwind Integration**: Icons work seamlessly with Tailwind CSS classes

## Installation

The server is automatically available when using the app-factory with context-aware agents.

## Usage

### Search Icons
```python
result = mcp__heroicons__search_icons("user", limit=5)
# Returns top 5 icons matching "user"
```

### Get Specific Icon
```python
icon = mcp__heroicons__get_icon("user-circle", variant="outline", size=24)
# Returns icon component code
```

### List Categories
```python
categories = mcp__heroicons__list_categories()
# Returns all available icon categories
```

### Generate React Component
```python
component = mcp__heroicons__generate_react_component(
    icon_name="plus",
    variant="outline",
    className="h-5 w-5 text-blue-500"
)
# Returns complete React component with imports
```

## Icon Naming Convention

Heroicons uses kebab-case naming:
- `arrow-down`
- `check-circle`
- `exclamation-triangle`
- `user-group`

## Available Sizes

- 20px (mini)
- 24px (default)

## Integration with Writer Agent

The Writer agent automatically uses this server to:
1. Search for appropriate icons based on UI context
2. Generate consistent icon imports
3. Apply proper Tailwind classes
4. Maintain icon consistency across the application

## Common Icon Categories

- **Navigation**: home, menu, arrow-*, chevron-*
- **Actions**: plus, minus, pencil, trash, check, x-mark
- **Status**: check-circle, exclamation-*, information-circle
- **User**: user, user-circle, user-group, users
- **Communication**: envelope, phone, chat-bubble-*
- **Files**: document, folder, paper-clip, photo
- **Settings**: cog-*, adjustments-*