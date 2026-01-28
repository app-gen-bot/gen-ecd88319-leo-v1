# Port Configuration Reconciliation Plan

## Problem Statement

Generated applications have **port configuration chaos** across multiple layers, causing auth failures and connection issues. Ports are scattered across:

1. **Server code** (`server/index.ts`) - reads `process.env.PORT`
2. **Server .env** - defines `PORT=5013` (recently changed from 5000)
3. **Client code** (`AuthContext.tsx`) - hardcoded URLs like `http://localhost:5001`
4. **Client .env** - defines `VITE_API_URL`
5. **API client** (`lib/api-client.ts`) - uses `VITE_API_URL || 'http://localhost:5013'`
6. **Runtime** - dev server started with custom port flag (`--port 5173`)
7. **Pipeline prompt** - templates with `PORT || 5000` (now 5013)

## Current State Analysis

### Observed Issues

```
Server .env:           PORT=5013
Client .env:           VITE_API_URL=http://localhost:5173
Server running on:     5173 (from manual start with --frontend-port 5173)
AuthContext fetching:  http://localhost:5001 (hardcoded)
api-client.ts:         http://localhost:5013 (fallback)
Pipeline template:     5013 (just updated)
```

**Result**: AuthContext bypasses api-client and uses hardcoded port 5001, causing login failures.

### Root Causes

1. **Dual API mechanisms**:
   - `api-client.ts` (type-safe, uses env var)
   - Raw `fetch()` in `AuthContext.tsx` (hardcoded URL)

2. **Template inconsistency**: Pipeline-prompt.md has hardcoded URLs in AuthContext instead of using env vars

3. **Runtime vs .env mismatch**: Server started with `--frontend-port 5173` ignores `.env PORT=5013`

4. **No single source of truth**: Port defined in 4+ places with different values

## Proposed Solution

### Design Principle: **Single Port, Single Source**

Generated apps should use **ONE port** for the entire application (frontend + backend + API), configured in **ONE place** (root `.env`).

### Architecture

```
┌─────────────────────────────────────────┐
│           Root .env (SOURCE OF TRUTH)    │
│           PORT=5013                      │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Server       │        │ Client       │
│ Uses: PORT   │        │ Uses: PORT   │
└──────────────┘        └──────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
            http://localhost:5013
            (Vite serves client + proxies API)
```

### Implementation Plan

#### Phase 1: Fix Template Generation (pipeline-prompt.md)

**Location**: `docs/pipeline-prompt.md`

**Changes**:

1. **Remove hardcoded URLs from AuthContext** (line ~514):

```typescript
// ❌ WRONG (current)
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5013/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  // ...
};

// ✅ CORRECT (use api-client)
const login = async (email: string, password: string) => {
  const response = await apiClient.auth.login({
    body: { email, password }
  });
  if (response.status === 200) {
    setAuthToken(response.body.token);
    setAuthUser(response.body.user);
    setUser(response.body.user);
  } else {
    throw new Error('Login failed');
  }
};
```

2. **Ensure api-client uses env var** (already correct at line ~443):
```typescript
export const apiClient = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5013',
  baseHeaders: () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

3. **Update .env template** (line ~807):
```bash
# Development (default)
AUTH_MODE=mock
STORAGE_MODE=memory
PORT=5013

# Client will use VITE_API_URL to connect to backend
VITE_API_URL=http://localhost:5013
```

4. **Add vite.config.ts proxy configuration** (NEW SECTION):

```typescript
// File: vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: parseInt(process.env.PORT || '5013'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || '5013'}`,
        changeOrigin: true,
      },
    },
  },
});
```

#### Phase 2: Fix Existing Generated Apps

**For apps already generated** (like the one being tested):

1. **Update AuthContext.tsx** to use api-client instead of fetch:
```bash
# File: client/src/contexts/AuthContext.tsx
# Replace all raw fetch() calls with apiClient calls
```

2. **Consolidate .env files**:
```bash
# Root .env (single source of truth)
PORT=5013
VITE_API_URL=http://localhost:5013
AUTH_MODE=mock
STORAGE_MODE=memory
```

3. **Update package.json dev script**:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "tsx watch server/index.ts",
    "client": "vite --port $PORT"
  }
}
```

4. **Remove client/.env** (or ensure it matches root):
```bash
# Option 1: Delete client/.env entirely
rm client/.env

# Option 2: Make it source from root
# client/.env
VITE_API_URL=$VITE_API_URL
```

#### Phase 3: Pipeline Generation Updates

**Location**: `src/app_factory_leonardo_replit/`

**Changes needed**:

1. **AuthContext generation** - Use api-client, not raw fetch:
```python
# agents/auth_context_generator/
# Update system prompt to ALWAYS use api-client for ALL auth operations
```

2. **Single .env file** - Generate one root .env:
```python
# initialization/ or build_stage.py
# Generate .env with PORT and VITE_API_URL matching
```

3. **Vite config generation** - Include proxy setup:
```python
# Add vite.config.ts generation with server.proxy configuration
```

4. **CLI argument handling** - Respect --frontend-port:
```python
# main.py or run.py
# When --frontend-port is specified, write it to .env
# Don't let it override at runtime, bake it into .env
```

#### Phase 4: Validation & Testing

**Checklist for generated apps**:

- [ ] Root .env has single PORT value
- [ ] client/.env either doesn't exist or sources from root
- [ ] AuthContext uses api-client (no hardcoded fetch)
- [ ] api-client.ts uses VITE_API_URL env var
- [ ] vite.config.ts proxies /api to backend port
- [ ] package.json dev script uses PORT env var
- [ ] Server index.ts reads PORT from env
- [ ] No hardcoded port numbers anywhere in code

**Test procedure**:

```bash
# 1. Fresh generation
cd apps/test-app
cat .env  # Should show PORT=5013

# 2. Start dev server
npm run dev  # Should use PORT from .env

# 3. Verify both running on same port
curl http://localhost:5013/health  # Backend
open http://localhost:5013         # Frontend (Vite serves)

# 4. Test auth
# Login should work without CORS errors
```

## Migration Path

### For Current Development

**Immediate fix for app being tested**:

```bash
# 1. Update AuthContext to use api-client
# Edit: client/src/contexts/AuthContext.tsx
# Replace fetch() calls with apiClient.auth.login(), etc.

# 2. Ensure .env consistency
echo "PORT=5013" > .env
echo "VITE_API_URL=http://localhost:5013" >> .env

# 3. Restart dev server
npm run dev
```

### For Pipeline

**Order of implementation**:

1. ✅ **DONE**: Updated pipeline-prompt.md PORT to 5013
2. **TODO**: Fix AuthContext template to use api-client (not fetch)
3. **TODO**: Add vite.config.ts proxy to template
4. **TODO**: Update .env template to include VITE_API_URL
5. **TODO**: Test generation with new template
6. **TODO**: Update existing apps with migration script

## Prevention Strategy

### Code Review Checklist

Before merging any changes to pipeline-prompt.md:

- [ ] No hardcoded `localhost:XXXX` URLs in templates
- [ ] All API calls use `api-client.ts` (type-safe)
- [ ] All ports reference `process.env.PORT` or `import.meta.env.VITE_API_URL`
- [ ] .env template has PORT and VITE_API_URL with matching values
- [ ] vite.config.ts includes server.port and server.proxy configuration

### Linting Rules

Add to pipeline critic validation:

```typescript
// Forbidden patterns in generated code:
const FORBIDDEN_PATTERNS = [
  /fetch\(['"]http:\/\/localhost:\d+/,  // No hardcoded fetch URLs
  /localhost:5000/,                      // No hardcoded ports
  /localhost:5001/,
  /localhost:3000/,
  // Allow only env var references
];
```

### Documentation

Update `CLAUDE.md` with:

```markdown
## Port Configuration

Generated apps use a **single port** (default: 5013) for both frontend and backend:

- Vite dev server runs on PORT
- Express backend runs on PORT
- Vite proxies /api requests to backend
- All API calls use api-client.ts with VITE_API_URL

**Configuration**: Root `.env` file only
- `PORT=5013` - Server port
- `VITE_API_URL=http://localhost:5013` - Client API endpoint

**Never hardcode ports** in generated code. Always use environment variables.
```

## Success Criteria

A properly configured app will:

1. ✅ Start with `npm run dev` using PORT from .env
2. ✅ Serve frontend on http://localhost:{PORT}
3. ✅ Serve API on http://localhost:{PORT}/api/*
4. ✅ All auth operations work without CORS
5. ✅ No port numbers hardcoded in any .ts/.tsx file
6. ✅ Single .env file at root (no client/.env needed)
7. ✅ Type-safe API calls via api-client.ts
8. ✅ `--frontend-port` CLI flag updates .env, not runtime override

## Timeline

- **Immediate** (today): Fix pipeline-prompt.md AuthContext template
- **Short-term** (this week): Add vite.config.ts proxy + .env updates
- **Medium-term** (next sprint): Update all existing apps with migration script
- **Long-term** (ongoing): Add critic validation for port references

## Appendix: Port History

- **Original**: 5000 (Vite default: 5173, separate ports)
- **Sep 2025**: Changed from 3000 to 5000 (commit 157a9af4)
- **Jan 2025**: Changed from 5000 to 5013 (commit 8cb6482d)

**Lesson**: Changing default port doesn't fix architecture. Need single-port design with env-based configuration.
