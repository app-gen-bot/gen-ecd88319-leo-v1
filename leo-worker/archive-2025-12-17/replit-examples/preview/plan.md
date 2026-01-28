# Plan: Build Leonardo React-to-Static Preview System

## Phase 1: Setup React-to-Static Pipeline

1. **Create Preview React Template** (`react_preview/`)
   - Basic React app structure with TypeScript
   - Import shadcn/ui components
   - Tailwind configuration
   - Component type definitions

2. **Build Render-to-Static Tool** (`static_renderer.py`)
   - Use Node.js with react-dom/server renderToStaticMarkup
   - Extract and inline Tailwind styles
   - Convert React event handlers to vanilla JS
   - Output single HTML file with same quality as Replit

3. **Test with Example**
   - Create sample TodoList component in React/TSX
   - Render to static HTML
   - Verify output matches Replit preview quality

## Phase 2: Agent Integration

1. **Update Agent System Prompt**
   - Instruct agent to write React component using shadcn/ui
   - Provide shadcn component import list and examples
   - Show standard component structure patterns

2. **Create Build Pipeline**
   - Agent outputs `preview-app.tsx` file
   - Build script compiles React to static HTML
   - Save final output as `preview.html`

3. **Handle Interactivity**
   - Convert React onClick to data-event attributes
   - Add vanilla JS event delegation system
   - Maintain all preview functionality

## Phase 3: Validate and Compare

1. **Test with Multiple App Types**
   - TodoList app
   - Dashboard layout
   - Form-based app
   - Different UI patterns

2. **Quality Comparison**
   - Should match or exceed Replit preview quality
   - Agent has full creative freedom with layouts
   - Leverages extensive React/shadcn training data

## Key Benefits of This Approach

- ✅ Agent uses familiar React patterns (millions of training examples)
- ✅ Full component flexibility with shadcn/ui library
- ✅ Type checking during build catches errors
- ✅ No new DSL to learn - uses existing LLM knowledge
- ✅ Can generate ANY layout or component combination
- ✅ Beautiful, consistent design system built-in