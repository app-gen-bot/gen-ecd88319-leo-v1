# Pattern 8: ts-rest v3 API Client Configuration

**Source**: asana-clone production failures
**Problem**: Using v2 API patterns in v3 causes 404 errors on ALL API calls

---

## The Problem

ts-rest v3 has breaking changes from v2. The `basePath` option was removed and `baseUrl` now includes the full path:

```typescript
// ❌ WRONG (v2 API - doesn't work in v3)
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

const client = initClient(contract, {
  baseUrl: 'http://localhost:5001',
  basePath: '/api',  // This option doesn't exist in v3!
});

// Error: All API calls get 404 because basePath is ignored
// GET http://localhost:5001/items → 404 (should be /api/items)
```

**Impact**: ALL data pages fail with 404s, entire application unusable

---

## The Solution

Include full path in `baseUrl`:

```typescript
// client/src/lib/api-client.ts
// ✅ CORRECT (ts-rest v3)
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL must be defined in .env');
}

export const apiClient = initClient(contract, {
  baseUrl: `${API_URL}/api`,  // Full path including /api!
  jsonQuery: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});
```

---

## Key Changes in v3

### 1. baseUrl Includes Full Path

```typescript
// v2 (OLD)
baseUrl: 'http://localhost:5001',
basePath: '/api'

// v3 (NEW)
baseUrl: `${API_URL}/api`  // Combined into single URL
```

### 2. basePath Option Removed

```typescript
// ❌ NO LONGER VALID
basePath: '/api'  // This property doesn't exist in v3

// ✅ Include in baseUrl instead
baseUrl: `${API_URL}/api`
```

### 3. Dynamic Auth Headers

Use **getter property**, NOT arrow function:

```typescript
// ✅ CORRECT: Getter property (dynamic)
baseHeaders: {
  get Authorization() {
    const token = localStorage.getItem('auth_token');
    return token ? `Bearer ${token}` : '';
  }
}

// ❌ WRONG: Arrow function (static - captures old value)
baseHeaders: {
  Authorization: () => {
    const token = localStorage.getItem('auth_token');
    return `Bearer ${token}`;
  }
}

// ❌ WRONG: Static value (never updates)
baseHeaders: {
  Authorization: `Bearer ${localStorage.getItem('auth_token')}`
}
```

### 4. Environment Variable Validation

Always validate required environment variables:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('VITE_API_URL must be defined in .env');
}
```

---

## Complete Example

```typescript
// client/src/lib/api-client.ts
import { initClient } from '@ts-rest/core';
import { contract } from '@shared/contracts';

// Validate environment variable
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error(
    'VITE_API_URL environment variable is required. ' +
    'Add it to your .env file (e.g., VITE_API_URL=http://localhost:5000)'
  );
}

// Initialize API client with v3 configuration
export const apiClient = initClient(contract, {
  // v3: Include full path in baseUrl (no separate basePath)
  baseUrl: `${API_URL}/api`,

  // Enable query string serialization
  jsonQuery: true,

  // Dynamic headers using getter property
  baseHeaders: {
    'Content-Type': 'application/json',

    // CRITICAL: Use getter for dynamic auth token
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
});

// Export helper for status checking
export function isSuccessResponse<T>(
  response: { status: number; body: T }
): response is { status: 200 | 201; body: T } {
  return response.status >= 200 && response.status < 300;
}
```

---

## Usage in Components

```typescript
// pages/ItemsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export default function ItemsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      // v3 client usage - same as before
      const response = await apiClient.items.list();

      if (response.status === 200) {
        return response.body;
      }

      throw new Error(`Failed to fetch items: ${response.status}`);
    },
  });

  // ... component logic
}
```

---

## Environment Configuration

### .env File

```bash
# Development
VITE_API_URL=http://localhost:5000

# Production
# VITE_API_URL=https://api.example.com
```

### Important Notes

1. **VITE_ prefix required** - Only env vars with `VITE_` prefix are exposed to client
2. **No trailing slash** - Don't include trailing slash in VITE_API_URL
3. **Include protocol** - Always include `http://` or `https://`

---

## Validation Checks

### 1. Check for v2 Patterns

```bash
# Check if using old basePath option
grep "basePath" client/src/lib/api-client.ts && \
  echo "❌ ERROR: Using v2 basePath option" || \
  echo "✅ No v2 patterns found"
```

**Expected**: No matches (v3 doesn't use basePath)

### 2. Verify baseUrl Includes /api

```bash
# Check baseUrl includes /api path
grep "baseUrl.*\/api" client/src/lib/api-client.ts && \
  echo "✅ baseUrl includes /api" || \
  echo "❌ ERROR: Missing /api in baseUrl"
```

**Expected**: baseUrl includes "/api"

### 3. Check Dynamic Auth Header

```bash
# Check for getter property (not arrow function)
grep "get Authorization()" client/src/lib/api-client.ts && \
  echo "✅ Using getter property" || \
  echo "❌ ERROR: Not using dynamic getter"
```

**Expected**: Uses `get Authorization()` getter

### 4. Verify Environment Variable Validation

```bash
# Check for VITE_API_URL validation
grep "if (!API_URL)" client/src/lib/api-client.ts && \
  echo "✅ Environment validation present" || \
  echo "⚠️  WARNING: Missing env var validation"
```

**Expected**: Throws error if VITE_API_URL missing

---

## Common Mistakes

### ❌ Mistake 1: Using basePath

```typescript
// WRONG - basePath doesn't exist in v3
export const apiClient = initClient(contract, {
  baseUrl: 'http://localhost:5000',
  basePath: '/api',  // Not valid in v3
});
```

### ❌ Mistake 2: Static Authorization Header

```typescript
// WRONG - Token is captured at initialization time
baseHeaders: {
  Authorization: `Bearer ${localStorage.getItem('auth_token')}`
  // If user logs in later, this won't update!
}
```

### ❌ Mistake 3: Arrow Function for Auth

```typescript
// WRONG - Arrow function doesn't work as expected
baseHeaders: {
  Authorization: () => `Bearer ${localStorage.getItem('auth_token')}`
  // ts-rest doesn't call functions, it expects values
}
```

### ❌ Mistake 4: Hardcoded URL

```typescript
// WRONG - Hardcoded URL breaks in different environments
baseUrl: 'http://localhost:5000/api'
// What happens in production? Staging? Other developer's machine?
```

---

## Migration from v2 to v3

If you have existing v2 code:

```typescript
// BEFORE (v2)
export const apiClient = initClient(contract, {
  baseUrl: process.env.API_URL,
  basePath: '/api',
  credentials: 'include',
});

// AFTER (v3)
export const apiClient = initClient(contract, {
  baseUrl: `${import.meta.env.VITE_API_URL}/api`,  // Combine baseUrl + basePath
  jsonQuery: true,                                 // Enable query serialization
  baseHeaders: {                                   // Add dynamic headers
    get Authorization() {
      const token = localStorage.getItem('auth_token');
      return token ? `Bearer ${token}` : '';
    },
  },
  // credentials option moved to fetch options if needed
});
```

---

## Why This Matters

**asana-clone Evidence**: ALL data pages failed with 404s until baseUrl was fixed to include /api

**Symptoms**:
- ✅ API routes work when tested directly (curl, Postman)
- ❌ Frontend gets 404 for all API calls
- ❌ Network tab shows requests going to wrong path
- ❌ No data loads in any page

**Time Lost**: 2+ hours debugging before discovering ts-rest v3 breaking changes

---

## Related Patterns

- **Pattern 3**: Auth helpers (for token management)
- **Pattern 13**: Port configuration consistency
- **CODE_PATTERNS.md**: React Query usage with apiClient

---

## Final Checklist

Before completing API client generation:

- [ ] baseUrl includes full path with /api
- [ ] NO basePath option present
- [ ] Authorization uses getter property (not arrow function)
- [ ] VITE_API_URL validated before use
- [ ] .env file has VITE_API_URL defined
- [ ] No hardcoded URLs anywhere in client code
- [ ] Tested API call succeeds from component

---

**Remember**: ts-rest v3 is NOT backward compatible with v2. Using v2 patterns silently fails with 404s on all API calls.
