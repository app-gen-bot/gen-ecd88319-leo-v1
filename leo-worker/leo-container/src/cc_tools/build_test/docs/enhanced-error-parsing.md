# Enhanced Error Parsing for Build Test Tool

## Overview

The build_test tool now provides enhanced error parsing that returns structured error data alongside the traditional text output. This allows the Writer agent to see and fix multiple errors in a single iteration, significantly improving performance.

## Features

### 1. Structured Error Format

When TypeScript or ESLint errors are detected, the tool now returns a `structured_errors` field containing parsed error information:

```json
{
  "success": false,
  "message": "Some checks failed",
  "output": "... human-readable output ...",
  "structured_errors": [
    {
      "file": "app/page.tsx",
      "line": 25,
      "column": 10,
      "code": "TS2339",
      "message": "Property 'foo' does not exist on type 'Bar'",
      "type": "typescript"
    },
    {
      "file": "components/Button.tsx",
      "line": 15,
      "column": 5,
      "severity": "error",
      "message": "React Hook useEffect has a missing dependency",
      "rule": "react-hooks/exhaustive-deps",
      "type": "eslint"
    }
  ]
}
```

### 2. Error Grouping

In the human-readable output, errors are now grouped by file for easier comprehension:

```
❌ type-check: Failed - 15 errors found

📄 app/page.tsx:
   Line 25,10: Property 'foo' does not exist on type 'Bar' (TS2339)
   Line 30,5: Cannot find name 'useState' (TS2304)
   
📄 components/Button.tsx:
   Line 15,5: Property 'onClick' is missing in type (TS2741)
   
... and 10 more errors
```

### 3. Increased Error Visibility

- Shows up to 20 errors total (instead of just 5)
- Shows up to 5 errors per file
- Indicates how many additional errors exist beyond the shown limit

### 4. Backward Compatibility

- The traditional text output in the `output` field remains unchanged
- The `error` field still contains the raw stderr for compatibility
- Existing code that doesn't use `structured_errors` continues to work

## Benefits

1. **Faster Development**: Writers can see and fix multiple errors at once
2. **Better Context**: Errors are grouped by file, making it easier to understand related issues
3. **Precise Locations**: Line and column numbers help pinpoint exact error locations
4. **Type-Specific Info**: Error codes (TS####) and ESLint rules provide additional context

## Implementation Details

### TypeScript Error Parsing

TypeScript errors follow the format:
```
file.ts(line,col): error TS####: message
```

### ESLint Error Parsing

ESLint errors follow the format:
```
/path/to/file.js
  line:col  severity  message  rule-name
```

Both formats are parsed into a consistent structure for easy consumption by AI agents.