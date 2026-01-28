# React-to-Static Preview System

A system that converts React components to static HTML previews, designed to match Replit's preview quality while leveraging LLM's extensive React knowledge.

## Overview

Instead of asking agents to learn custom component DSL or generate raw HTML, this system leverages what LLMs already know exceptionally well: React + shadcn/ui patterns.

## How It Works

1. **Agent writes standard React/TSX** using shadcn/ui components
2. **Node.js renders to static HTML** using react-dom/server
3. **Styles and interactivity are preserved** with Tailwind and vanilla JS
4. **Output matches Replit quality** with professional design system

## Quick Start

```bash
# Install dependencies
npm install

# Test the system
python3 react_to_static.py
```

## Generated Output

The system produces:
- ✅ **5KB static HTML file** (similar size to Replit previews)
- ✅ **Replit-quality design** with proper CSS variables and theming
- ✅ **Interactive elements** with vanilla JS event delegation
- ✅ **Proper task toggle functionality** matching original
- ✅ **Professional styling** using shadcn/ui components

## Key Benefits

| Feature | Value |
|---------|-------|
| **Agent Learning** | None - uses existing React knowledge |
| **Flexibility** | Unlimited - any React/shadcn layout possible |
| **Error Prevention** | TypeScript compilation catches issues |
| **Output Quality** | Professional shadcn/ui components |
| **Maintenance** | Standard React code, no custom DSL |

## File Structure

```
src/react_preview_system/
├── components/ui/          # shadcn/ui components
│   ├── card.tsx
│   ├── button.tsx
│   └── input.tsx
├── lib/utils.ts           # Utility functions
├── scripts/
│   └── render_static.js   # Node.js static renderer
├── templates/             # Config files
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── output/               # Generated HTML files
├── react_to_static.py   # Python wrapper
└── README.md           # This file
```

## Example Output

The generated HTML includes:
- Complete TodoList with "Stay organized, get things done" tagline
- Working task input with "Add Task" button
- Interactive task items with toggle functionality
- Professional styling with hover effects
- Event delegation system for interactions

## Integration with Leonardo

This system replaces the previous component DSL approach and can be integrated into the Leonardo preview generation pipeline by:

1. Having the agent output React/TSX instead of HTML
2. Running the React-to-Static renderer
3. Saving the output as preview.html

## Future Enhancements

- Direct TSX component input (currently uses embedded sample)
- More shadcn/ui components as needed
- Custom component templates
- Advanced interactivity patterns