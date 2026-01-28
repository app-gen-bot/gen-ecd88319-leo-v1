# Vite Dev Server Alternative for React Preview

## Problem
The current SSR (Server-Side Rendering) approach for generating HTML previews has several issues:
- Complex import path resolution for design-system files
- Requires copying files to temporary directories
- ESBuild compilation errors with TypeScript/JSX
- Static HTML output lacks interactivity
- Fragile and error-prone process

## Solution: Vite Dev Server

Instead of compiling React to static HTML, run a lightweight Vite dev server that serves the React component directly.

### Implementation

1. **Add minimal Vite config** in `preview-react/vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    host: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '../design-system': '/design-system'
    }
  }
})
```

2. **Create index.html** in `preview-react/`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

3. **Create main.tsx** entry point:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../design-system/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

4. **Start Vite programmatically** in `preview_stage.py`:
```python
import subprocess

def start_vite_server(preview_react_dir: Path, port: int = 5001) -> tuple[bool, str]:
    """Start Vite dev server for React preview."""
    try:
        # Start Vite in the background
        process = subprocess.Popen(
            ['npx', 'vite', '--port', str(port), '--host'],
            cwd=preview_react_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait briefly for server to start
        import time
        time.sleep(2)
        
        # Return URL for iframe
        preview_url = f"http://localhost:{port}"
        return True, preview_url
        
    except Exception as e:
        return False, f"Failed to start Vite: {str(e)}"
```

5. **Return URL instead of HTML**:
```python
# In preview_stage.py
success, preview_url = start_vite_server(react_output_dir)
if success:
    # Save URL for UI to use
    url_file = output_dir / "preview.url"
    url_file.write_text(preview_url)
    
    result = AgentResult(
        content=preview_url,
        success=True,
        metadata={'preview_url': preview_url}
    )
```

## Advantages

1. **Natural import resolution**: All imports work as expected
   - `import designTokens from '../design-system/design-tokens'` ✓
   - `import { Card } from '@/components/ui/card'` ✓

2. **Full React interactivity**: Not just static HTML
   - useState, useEffect, event handlers all work
   - Real component behavior testing

3. **Hot Module Replacement**: Changes update instantly
   - Edit App.tsx → see changes immediately
   - No rebuild/recompile step

4. **Development experience**: Familiar tooling
   - Browser DevTools work normally
   - React DevTools extension works
   - Error messages are clear

5. **No compilation issues**: Vite handles everything
   - TypeScript compilation
   - JSX transformation
   - CSS modules
   - Path aliases

## Migration Path

1. **Phase 1**: Add Vite option alongside SSR
   - Add `--use-vite` flag to preview stage
   - Keep SSR as fallback

2. **Phase 2**: Make Vite the default
   - Switch default behavior to Vite
   - Deprecate SSR approach

3. **Phase 3**: Remove SSR code
   - Clean up `react_to_static.py`
   - Remove SSR template dependencies

## UI Integration

The UI would iframe the Vite server URL directly:

```html
<iframe 
  src="http://localhost:5001" 
  width="100%" 
  height="600"
  title="App Preview"
/>
```

## Minimal Dependencies

Only need to add to package.json:
```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

## Conclusion

The Vite dev server approach eliminates all the complex SSR compilation issues while providing a better development experience. It's the standard way to serve React apps during development and is already part of the ecosystem we're using.

### Immediate Benefits
- Fixes all import path issues
- No more "Could not resolve '../design-system/design-tokens'" errors
- No temporary directory juggling
- No ESBuild compilation failures
- Real React app with full interactivity

### Implementation Effort
- Small: ~50 lines of code
- Uses existing Vite from the template
- Well-documented, standard approach
- Can be implemented incrementally