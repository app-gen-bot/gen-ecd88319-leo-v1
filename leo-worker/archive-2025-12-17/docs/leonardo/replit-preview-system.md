# Replit Preview System Analysis

**Purpose**: Understanding Replit's streaming preview infrastructure for future Leonardo implementation.

## System Overview

Replit's preview system uses Server-Sent Events (SSE) to stream HTML content progressively to an iframe, creating a real-time "app being built" experience.

### Architecture Components

1. **SSE EventSource**: Connects to `/sse/index.html?after=556`
2. **Content Accumulator**: Buffers incoming HTML chunks
3. **Progressive DOM Updates**: Parses and renders content incrementally
4. **Script Execution Manager**: Handles JavaScript execution order and caching
5. **Loading Screen**: Shows "Designing visual preview" during streaming

## Technical Implementation Details

### Core Streaming Logic
```javascript
// Key components observed in preview-source.html:
const eventSource = new EventSource('/sse/index.html?after=556');
let accumulatedContent = '';
let processingContent = false;
const scriptCache = new Set(); // Prevents duplicate script execution
```

### Progressive Rendering Process
1. **Initial State**: Empty body with loading iframe
2. **Content Accumulation**: SSE messages build up HTML string
3. **DOM Parsing**: `DOMParser().parseFromString(content, 'text/html')`
4. **Incremental Updates**: Head and body updated separately
5. **Script Processing**: Scripts extracted, cached, and executed in order

### Script Execution Challenges
- **Duplicate Prevention**: Scripts cached by src or textContent hash
- **Execution Order**: Scripts processed sequentially to avoid conflicts
- **Deferred Scripts**: Scripts with defer attribute handled after DOM ready
- **Error Handling**: Try-catch around incomplete script blocks

### Key Functions Observed
- `flushToDOM()`: Core function for updating DOM incrementally
- `processScripts()`: Handles script extraction and execution
- `executeScript()`: Manages individual script execution with promises
- `injectLoadingIframe()`: Creates loading screen during rendering

## Implementation Complexity: Moderate

### Core Logic (Simple)
- EventSource connection
- Content accumulation 
- DOM parsing and updates

### Challenging Aspects
- **Script execution order** and caching
- **Handling incomplete HTML chunks** during streaming
- **Progressive rendering** without breaking layout
- **Deferred script management**

## Capturing Streamed Content

### Method 1: Browser Console (Recommended)
```javascript
// After preview completes:
document.documentElement.outerHTML
copy(document.documentElement.outerHTML) // Copies to clipboard
```

### Method 2: DevTools Elements Tab
1. F12 → Elements tab
2. Right-click `<html>` element
3. Copy → Copy outerHTML

### Method 3: Network Tab
1. DevTools → Network tab
2. Find `/sse/index.html` connection
3. View "EventStream" tab for raw data

### Method 4: Code Modification
Add before `eventSource.close()`:
```javascript
console.log('=== FINAL CONTENT ===');
console.log(accumulatedContent);
localStorage.setItem('preview_html', accumulatedContent);
```

**Important**: `View Page Source` will NOT show streamed content - only original HTML.

## Preview Tech Stack (Verified from TodoSync App)

Based on analysis of the extracted TodoSync app HTML:

### External Dependencies
- **Tailwind CSS**: `https://cdn.tailwindcss.com` (CDN)
- **Google Fonts**: Google Sans font family
- **Material Icons**: Google Material Icons

### Core Architecture
- **Single HTML file** with inline CSS/JS
- **CSS Custom Properties** for theming (light/dark mode)
- **Vanilla JavaScript** (no frameworks)
- **Event delegation** pattern for interactions
- **CSS animations** for smooth transitions

### Key Features Observed
- Custom Tailwind config with CSS variables
- Material Design color palette
- Responsive design patterns
- Modal dialogs with backdrop
- Task state management
- Filter system (All, Active, Completed)

## Leonardo Implementation Strategy

### Phase 1: Simple HTML Generation (Current Goal)
- Generate complete HTML file from plan.md using TodoSync as reference
- Use same tech stack: Tailwind CDN + inline CSS/JS
- Single self-contained file
- No streaming - just output final HTML

### Phase 2: Streaming Implementation (Future)
- Recreate SSE infrastructure
- Stream HTML generation progressively
- Add "designing preview" loading experience

### Phase 3: Enhancement (Future)
- Real-time updates during generation
- Error handling and recovery
- Pause/resume streaming capabilities

---
*Last Updated: September 6, 2025*
*Source: replit-examples/todo-list/preview-iframe/preview-source.html*