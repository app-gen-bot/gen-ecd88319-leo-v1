# Pattern 4: ESM Import Extensions

**Source:** EdVisor Issue #18
**Impact:** Prevents ERR_MODULE_NOT_FOUND in production

---

## The Problem

Missing extensions cause production failures:

```typescript
// server/routes/items.ts
// ❌ WRONG: No .js extension (fails in production)
import { storage } from './lib/storage/factory';
import { auth } from '../lib/auth/factory';

// Error at runtime:
// ERR_MODULE_NOT_FOUND: Cannot find module './lib/storage/factory'
// Did you mean to import './lib/storage/factory.js'?
```

**Why**: Node.js ESM requires explicit extensions. TypeScript doesn't add them during compilation.

---

## The Solution

**ALL relative imports in server code MUST use .js extensions:**

```typescript
// server/routes/items.ts
// ✅ CORRECT: Include .js extension
import { storage } from './lib/storage/factory.js';
import { auth } from '../lib/auth/factory.js';
import { validateRequest } from '../middleware/validate.js';

// server/middleware/auth.ts
// ✅ CORRECT: All relative imports need .js
import { auth } from '../lib/auth/factory.js';

// server/lib/storage/factory.ts
// ✅ CORRECT: Adapters also need .js
import { MemoryStorage } from './mem-storage.js';
import { DatabaseStorage } from './db-storage.js';

// server/index.ts
// ✅ CORRECT: Route imports need .js
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
```

---

## When to Use .js Extensions

- ✅ All relative imports in `server/` directory: `import X from './path.js'`
- ✅ All relative imports in `server/` subdirectories: `import X from '../path.js'`
- ❌ NOT for npm packages: `import express from 'express'` (no .js)
- ❌ NOT for path aliases: `import X from '@shared/schema'` (no .js)
- ❌ NOT for client code: Client bundler handles extensions

---

## Validation Check

```bash
# Scan server/ for relative imports without .js
grep -r "from '\\.\\.\\./" server/ | grep -v "\\.js'" | grep -v "node_modules"
grep -r "from '\\./" server/ | grep -v "\\.js'" | grep -v "node_modules"

# Expected: ZERO matches
# If ANY matches found → missing .js extensions → MUST FIX
```

---

## Common Mistake

**Adding .ts extensions instead of .js:**

```typescript
// ❌ WRONG: .ts extension
import { storage } from './lib/storage/factory.ts';

// ✅ CORRECT: .js extension (even though source is .ts)
import { storage } from './lib/storage/factory.js';
```

**Why .js not .ts**: TypeScript outputs .js files, so imports reference the OUTPUT not SOURCE.

---

## Production Build Test

```bash
# Build server code
npm run build:server

# Test that dist/ runs without ERR_MODULE_NOT_FOUND
node dist/server/index.js
```

---

**EdVisor Evidence**: Issue #18 - "the dist/ thing got wrong again" - ESM import failures in production
