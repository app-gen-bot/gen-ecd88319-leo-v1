# Error Analysis Process

**Purpose:** Systematic error diagnosis before fixing

---

## Analysis Steps

1. **Read complete error** - Full message and stack trace
2. **Identify location** - Exact file and line number
3. **Understand type** - Syntax, type, or runtime error
4. **Find related errors** - Check if same root cause
5. **Trace to root** - Don't fix symptoms, fix cause

---

## Error Classification

### TypeScript Errors
- "Cannot find module" → Check import paths, install packages
- "Type 'X' is not assignable" → Fix type mismatches
- "Property does not exist" → Add properties or fix typos
- "'any' type" → Add proper type annotations

### Runtime Errors
- "Cannot read property of undefined" → Add null checks
- "Failed to fetch" → Check API endpoints, CORS, auth
- "Unauthorized" → Verify auth token, middleware
- "500 Internal Server" → Check server logs, database

### Build Errors
- "Module not found" → npm install missing deps
- "Syntax error" → Fix typos, missing brackets
- "Export not found" → Match export/import statements

---

## Root Cause Tracing

Don't fix the symptom:

```typescript
// ❌ WRONG: Fix symptom
if (data) { data.map(...) }  // Adds null check

// ✅ CORRECT: Fix root cause
const data = await apiClient.items.list()  // Add missing await
```
