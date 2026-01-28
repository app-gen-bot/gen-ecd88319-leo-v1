# User Feedback System for AI App Factory

## Overview

The user feedback system allows you to provide custom feedback that the Writer agent will prioritize above all other requirements during the Writer-Critic iterative loop.

## How It Works

1. **Create Feedback File**: Create a file named `user_feedback.md` in the specs directory:
   ```
   apps/{app_name}/specs/user_feedback.md
   ```

2. **Writer Reads & Archives**: The Writer agent will:
   - Check for this file at the start of each iteration
   - Read the entire contents
   - Prioritize your feedback above everything else
   - Archive the file to `user_feedback_archive/` with a timestamp

3. **No Iteration Tracking Needed**: You don't need to know which iteration you're on - just create the file and it will be processed in the next Writer run.

## Usage Example

1. **While the pipeline is running**, check which iteration you're on:
   ```bash
   # See existing critic analysis files
   ls apps/your-app-name/specs/critic_analysis_iteration_*.md
   ```

2. **Create your feedback file**:
   ```bash
   # Copy the template
   cp resources/templates/user_feedback_template.md apps/your-app-name/specs/user_feedback.md
   
   # Edit with your feedback
   nano apps/your-app-name/specs/user_feedback.md
   ```

3. **Example feedback content**:
   ```markdown
   # User Feedback for Writer

   ## CRITICAL FIXES (Do These First!)
   1. The login button is broken - it should submit the form, not just log to console
   2. Navigation menu doesn't work on mobile - hamburger menu does nothing
   3. Dashboard charts are showing placeholder data - use Chart.js with real data

   ## Additional Requirements
   - Change primary color from green to blue (#3B82F6)
   - Add loading animations to all buttons when clicked
   - Make the sidebar collapsible with a toggle button

   ## Do NOT Change
   - Keep the current authentication flow using NextAuth
   - Don't modify the database schema
   - Leave the footer as is
   ```

4. **The Writer will**:
   - Read your feedback
   - Create TodoWrite tasks for each item
   - Implement your requirements with highest priority
   - Archive the file to `specs/user_feedback_archive/feedback_YYYYMMDD_HHMMSS.md`

## Priority Hierarchy

When the Writer agent runs, it follows this priority order:

1. **🔴 USER FEEDBACK (Highest Priority)**
   - Everything in `user_feedback.md`
   - Overrides all other requirements

2. **🟡 Critic Feedback**
   - Issues found by the Critic agent
   - From `critic_analysis_iteration_*.md`

3. **🟢 Original Specifications**
   - Base requirements from interaction spec
   - Technical implementation patterns

## Best Practices

1. **Be Specific**: Provide exact details about what you want changed
2. **Use the Template**: Start with the provided template for consistency
3. **Include Examples**: If you want specific code patterns, include them
4. **List Don'ts**: Explicitly state what should NOT be changed
5. **One File at a Time**: Only create one `user_feedback.md` file per iteration

## Advanced Usage

### Providing Code Snippets
```markdown
## Technical Requirements
- Replace the current button component with this exact implementation:
  ```tsx
  export function Button({ children, onClick, loading = false }) {
    return (
      <button 
        onClick={onClick}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600"
      >
        {loading ? <Spinner /> : children}
      </button>
    );
  }
  ```
```

### Referencing Specific Files
```markdown
## CRITICAL FIXES
1. In `app/dashboard/page.tsx` line 45, the API call is broken
2. The component in `components/ui/navbar.tsx` needs the mobile menu fixed
```

## Checking Archived Feedback

To see what feedback has been processed:
```bash
ls -la apps/your-app-name/specs/user_feedback_archive/
```

Each archived file contains the exact feedback that was processed, with a timestamp showing when it was read by the Writer.

## Important Notes

- The Writer checks for `user_feedback.md` at the START of each iteration
- If you create the file mid-iteration, it won't be read until the next iteration
- The file is automatically archived after being read
- You can create a new `user_feedback.md` for the next iteration
- User feedback ALWAYS takes priority over other requirements