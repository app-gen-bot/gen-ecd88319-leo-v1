# Tree-Sitter Integration Issue & Fix

## Problem Identified
The Writer agent is NOT using tree-sitter validation even though:
1. Tools are available (`mcp__tree_sitter` in allowed_tools)
2. Instructions exist in the prompt
3. Server is running properly

## Root Cause
The prompt structure places tree-sitter validation in "Phase 2" which comes AFTER "Phase 1: Implementation". This means the agent creates all files first, then validates later (or never reaches Phase 2).

## Current Structure (WRONG)
```
Phase 1: Implementation (Primary Focus)
- Create all pages and components
- Implement routes
- Wire up interactions
...

Phase 2: Strategic Validation with Tree-Sitter  <-- Too late!
- Use validate_syntax after creating each component
- Use fix_imports to detect missing imports
...
```

## Proposed Fix
Integrate tree-sitter validation INTO the implementation phase:

```python
### Phase 1: Implementation with Real-Time Validation

Focus on building with instant feedback:

1. Start with BatchTool to explore structure
2. For EACH file you create:
   a. Write the file
   b. IMMEDIATELY validate with tree-sitter:
      ```
      result = mcp__tree_sitter__validate_syntax("path/to/file.tsx")
      if result['error_count'] > 0:
          # Fix errors using the precise line/column info
      ```
   c. Fix any syntax errors before moving on
   d. Check and add missing imports:
      ```
      imports = mcp__tree_sitter__fix_imports("path/to/file.tsx")
      if imports['imports_to_add']:
          # Add the missing imports
      ```

3. Only proceed to next file after current file passes validation
4. Extract repeated patterns when noticed
5. Use build_test only after multiple files are complete
```

## Immediate Workaround
Since we can't update the prompt mid-run, the Critic agent should catch these issues and force validation.