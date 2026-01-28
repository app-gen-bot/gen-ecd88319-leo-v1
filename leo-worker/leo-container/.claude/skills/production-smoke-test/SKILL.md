---
name: production-smoke-test
description: Catch production deployment failures before deploying to Fly.io
category: validation
priority: P0
issue_addressed: Fizzcard Issue #5 - Production deployment failure (400+ errors in Fly.io)
---

# Production Smoke Test

## Purpose

**Proactive Teaching**: Teach production-specific issues BEFORE marking app as complete.

**Reactive Validation**: Run smoke tests in Docker to catch deployment failures BEFORE pushing to Fly.io.

**Problem Being Solved**:
```typescript
// Development: Works fine
const clientDistPath = path.join(__dirname, '../client/dist');

// Production (TypeScript compiled to dist/):
// __dirname = /app/server/dist/server  (not /app/server!)
// Resolves to: /app/server/dist/server/../client/dist ❌ WRONG
// Actual location: /app/client/dist

// Result: 400+ errors in Fly.io deployment, static files not found
```

---

## When to Invoke (Proactive Teaching + Validation)

### 🔧 BEFORE Completing Application

**Pipeline Stage**: Stage 3 Validation → Final Check

**Purpose**: Catch production build and deployment issues BEFORE pushing to Fly.io

**Timing**: After all code generation, type checking, and linting pass

---

## What Agent Will Learn

### 1. Production vs Development Differences

**Development Environment**:
```
app/
├── client/
│   ├── src/          ← Source files
│   └── dist/         ← Vite build output
├── server/
│   ├── index.ts      ← __dirname here is /app/server
│   └── routes/
└── shared/
```

**Production Environment** (after TypeScript compilation):
```
app/
├── client/
│   └── dist/         ← Static files
├── server/
│   ├── dist/         ← Compiled JavaScript
│   │   └── server/
│   │       ├── index.js    ← __dirname here is /app/server/dist/server
│   │       └── routes/
│   └── *.ts (source files not deployed)
└── shared/
```

**The Problem**:
- `__dirname` in development: `/app/server`
- `__dirname` in production: `/app/server/dist/server`
- Path calculations break if you don't account for this difference!

---

### 2. Common Production Issues

#### Issue 1: Static File Path Resolution

```typescript
// ❌ WRONG: Fails in production
const clientDist = path.join(__dirname, '../client/dist');
// Development: /app/server/../client/dist = /app/client/dist ✅
// Production:  /app/server/dist/server/../client/dist = /app/server/dist/client/dist ❌

// ✅ CORRECT: Works in both environments
const clientDist = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');
```

#### Issue 2: Environment Variables Not Set

```bash
# Development: .env file loaded by dotenv
STORAGE_MODE=database
PORT=5000

# Production: Docker container doesn't have .env file
# Must pass env vars via docker run -e or Fly.io secrets
```

#### Issue 3: Port Binding

```typescript
// ❌ WRONG: Hardcoded port
app.listen(5000);

// ✅ CORRECT: Read from env var (Fly.io assigns PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0');  // Bind to 0.0.0.0, not localhost
```

#### Issue 4: Missing Build Step

```json
// package.json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "tsc && cd client && vite build",  // ✅ Must exist
    "start": "node server/dist/server/index.js"  // ✅ Must use compiled JS
  }
}
```

---

## What Agent Should Do

### Step 1: Ensure Correct Path Resolution

**Check `server/index.ts`**:
```typescript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// ✅ CORRECT: Environment-aware path resolution
const clientDistPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');

app.use(express.static(clientDistPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});
```

---

### Step 2: Ensure Environment Variables Handling

**Development (.env)**:
```bash
NODE_ENV=development
PORT=5000
STORAGE_MODE=memory
AUTH_MODE=mock
```

**Production (Fly.io secrets)**:
```bash
fly secrets set NODE_ENV=production
fly secrets set STORAGE_MODE=database  # Drizzle ORM with pooler
fly secrets set AUTH_MODE=supabase
fly secrets set SUPABASE_URL=...
fly secrets set SUPABASE_ANON_KEY=...
```

**Code should have fallbacks**:
```typescript
const PORT = process.env.PORT || 5000;
const STORAGE_MODE = process.env.STORAGE_MODE || 'memory';
const AUTH_MODE = process.env.AUTH_MODE || 'mock';
```

---

### Step 3: Ensure Build Scripts Exist

**package.json** (root):
```json
{
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc",
    "build:client": "cd client && vite build",
    "start": "node server/dist/server/index.js",
    "test": "vitest"
  }
}
```

---

### Step 4: Ensure Dockerfile is Correct

**Dockerfile**:
```dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["npm", "start"]
```

---

## Validation (Reactive Testing)

### ✅ AFTER All Generation Complete

**Purpose**: Run production smoke tests to catch deployment failures

**Test Suite**: `scripts/docker-smoke-test.sh`

**What It Tests**:
1. **Build Test**: `npm run build` succeeds without errors
2. **Docker Build**: Docker image builds successfully
3. **Docker Start**: Container starts without crashes
4. **Static Files**: GET / returns index.html
5. **API Health**: GET /health returns 200
6. **Auth Flow**: POST /api/auth/login → token → POST /api/resource (protected route)

---

## How to Run Smoke Tests

### Manual Execution

```bash
cd /workspace/app
~/.claude/skills/production-smoke-test/scripts/docker-smoke-test.sh
```

### Automated (Pipeline)

The pipeline will automatically invoke this after Stage 3 validation.

**Expected Output**:
```
🔧 Production Smoke Test
========================

Test 1: Build Application
  Running: npm run build
  ✅ Build succeeded

Test 2: Build Docker Image
  Running: docker build -t app-test .
  ✅ Docker image built

Test 3: Start Container
  Running: docker run -d -p 8080:8080 app-test
  ✅ Container started (ID: abc123)

Test 4: Static Files Serve
  Waiting 5s for server to start...
  Testing: curl http://localhost:8080/
  ✅ Static files serve (200 OK, 2.4KB)

Test 5: API Health Check
  Testing: curl http://localhost:8080/health
  ✅ Health endpoint responds (200 OK)

Test 6: Auth Flow
  Step 1: POST /api/auth/login
  ✅ Login successful (token received)

  Step 2: POST /api/users (with auth token)
  ✅ Protected route accessible (200 OK)

========================
✅ ALL SMOKE TESTS PASSED

Cleanup: docker stop abc123 && docker rm abc123
```

---

## Common Failure Scenarios

### Failure 1: Static Files Not Found

**Error**:
```
Test 4: Static Files Serve
  Testing: curl http://localhost:8080/
  ❌ FAILED: 404 Not Found
```

**Cause**: Incorrect static file path in server/index.ts

**Fix**:
```typescript
// Change from:
const clientDist = path.join(__dirname, '../client/dist');

// To:
const clientDist = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');
```

---

### Failure 2: Build Fails

**Error**:
```
Test 1: Build Application
  Running: npm run build
  ❌ FAILED: Type errors in server/routes/users.ts
```

**Cause**: TypeScript compilation errors

**Fix**: Run `npm run build` locally, fix type errors

---

### Failure 3: Container Crashes

**Error**:
```
Test 3: Start Container
  Running: docker run -d -p 8080:8080 app-test
  ✅ Container started (ID: abc123)

Test 4: Static Files Serve
  Waiting 5s for server to start...
  ❌ FAILED: Container exited (check logs)

Docker logs:
  Error: Cannot find module 'express'
```

**Cause**: Dependencies not installed in Docker image

**Fix**: Ensure Dockerfile runs `npm install` before `npm run build`

---

### Failure 4: Port Mismatch

**Error**:
```
Test 4: Static Files Serve
  Testing: curl http://localhost:8080/
  ❌ FAILED: Connection refused
```

**Cause**: Server listening on wrong port or wrong interface

**Fix**:
```typescript
// Change from:
app.listen(5000);  // Wrong port

// To:
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0');  // Correct port + interface
```

---

## Teaching Examples

### Example 1: Path Resolution Fix

**Before (Fails in Production)**:
```typescript
// server/index.ts
import express from 'express';
import path from 'path';

const app = express();

const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(5000);
```

**After (Works in Production)**:
```typescript
// server/index.ts
import express from 'express';
import path from 'path';

const app = express();

// Environment-aware path resolution
const clientDist = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');

app.use(express.static(clientDist));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Environment-aware port
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
```

---

### Example 2: Production-Ready package.json

```json
{
  "name": "app",
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "npm run build:server && npm run build:client",
    "build:server": "tsc -p server/tsconfig.json",
    "build:client": "cd client && vite build",
    "start": "node server/dist/server/index.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "test": "vitest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

---

## Summary

**Before completing application**:
1. Invoke this skill to learn production-specific issues
2. Understand __dirname differences between dev and production
3. Ensure path resolution is environment-aware
4. Ensure build scripts exist and work

**During validation**:
1. Run `npm run build` to catch TypeScript errors
2. Build Docker image to catch Dockerfile issues
3. Start container to catch runtime crashes
4. Test static files, API endpoints, auth flow

**After validation**:
1. Fix any failures found
2. Re-run smoke tests until all pass
3. Commit fixes
4. NOW safe to deploy to Fly.io

**Impact**: Prevents Fizzcard Issue #5 (400+ errors in Fly.io due to wrong paths)
