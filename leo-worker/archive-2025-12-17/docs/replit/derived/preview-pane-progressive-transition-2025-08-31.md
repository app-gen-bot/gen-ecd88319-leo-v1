# Replit Preview Pane Progressive Transition
*Date: 2025-08-31*

Based on observation and analysis of the replit-design.txt document, the preview pane uses a progressive transition system that moves from screenshots during development to live interactive app when ready.

## Progressive Preview Pane Transition

### Phase 1: Screenshot-Only Preview Pane
**During Active Development:**
- Preview pane shows static screenshots as they're captured
- Each new screenshot replaces the previous one in the same pane
- User sees visual progress updates in real-time
- No interactivity yet - just visual feedback

### Phase 2: Live App Transition
**When App Becomes Stable:**
- Same preview pane transitions to show live iframe
- User can now interact with the actual application
- HMR updates happen in real-time within the live preview
- Screenshots may still be taken for conversation history

## Evidence from the Document

### Screenshot Capture Process
```
"Screenshot Capture Process
1. Workflow State Detection:
   - System checks that "Start application" workflow is running successfully
   - Verifies the server is responding on port 5000
   - Confirms no console errors that would prevent proper rendering"
```

### Live Preview Activation
```
"Right Panel Live App Display
What You're Seeing: An embedded webview (essentially an iframe) that displays 
your running application at https://[your-repl-id].replit.app"

"Real-Time Updates Technology
Hot Module Replacement (HMR):
- Trigger: File save in any .tsx, .ts, .css file
- Process: Vite detects change → compiles → pushes update to browser
- Result: Instant visual updates without page refresh or losing form state"
```

## Technical Implementation

### Preview Pane State Management
```javascript
// Pseudo-code for preview pane transition
class PreviewPane {
  state: 'loading' | 'screenshots' | 'live-app' = 'loading';
  
  async updatePreview() {
    if (this.state === 'screenshots') {
      // Show latest screenshot
      this.displayScreenshot(latestScreenshot);
    }
    
    if (this.appIsStableAndRunning()) {
      // Transition to live app
      this.state = 'live-app';
      this.showLiveIframe();
    }
  }
  
  showLiveIframe() {
    this.innerHTML = `
      <iframe src="https://app-url.replit.app" 
              width="100%" height="100%">
      </iframe>
    `;
  }
}
```

### Transition Triggers
The preview pane switches from screenshots to live app when:

1. **Server is stable**: Express server running without errors on port 5000
2. **Build complete**: No TypeScript compilation errors
3. **Health check passes**: App responds to HTTP requests properly
4. **Core functionality working**: Basic routes and components render

## Why This Progressive Approach?

### User Experience Benefits:
- **Immediate feedback**: Screenshots show progress instantly
- **Smooth transition**: No jarring switch between modes
- **Context preservation**: User sees the development journey
- **Interactive validation**: Can test the actual app when ready

### Technical Benefits:
- **Error handling**: Screenshots work even if app has issues
- **Development workflow**: Supports iterative development process
- **Resource efficiency**: Live iframe only when app is stable
- **Debugging**: Visual history of development stages

## Timeline Example

```
Time 0:00 - Preview pane: Loading...
Time 0:30 - Preview pane: First screenshot (basic layout)
Time 1:15 - Preview pane: Updated screenshot (with forms)
Time 2:00 - Preview pane: Screenshot (with styling)
Time 2:30 - Preview pane: TRANSITIONS to live iframe
Time 2:31+ - Preview pane: Interactive app with HMR updates
```

## Screenshot System (Phase 1)
```javascript
// Pseudo-code for screenshot capture
async function captureProgressScreenshot() {
  // Wait for development milestone
  await waitForStableState();
  
  // Launch headless browser
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate and wait for full load
  await page.goto('https://app-url.replit.app');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[data-app-ready]');
  
  // Capture screenshot
  const screenshot = await page.screenshot({ 
    fullPage: true, 
    type: 'png' 
  });
  
  // Embed in conversation
  embedInChat(screenshot);
}
```

## Live Preview System (Phase 2)
```html
<!-- Live preview iframe -->
<iframe 
  src="https://[repl-id].replit.app" 
  width="100%" 
  height="100%"
  sandbox="allow-scripts allow-same-origin allow-forms"
  title="Live Application Preview">
</iframe>
```

## User Experience Flow

1. **User makes request**: "Build me a todo app"
2. **Development begins**: Code is written, screenshots taken periodically
3. **Progressive screenshots shown**: User sees visual progress in chat
4. **App reaches working state**: Live preview tab/panel becomes active
5. **User can interact**: Full testing and feedback in live preview
6. **Iterations continue**: Both screenshots and live preview updated

This progressive transition gives users immediate visual feedback during development while seamlessly moving to full interactivity once the application is stable and ready for testing.