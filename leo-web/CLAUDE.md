# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leo SaaS is an AI-powered application generator platform. Users describe their app in natural language, and Leo (powered by Claude Code) generates production-ready full-stack applications with real database, authentication, and deployment configurations.

The browser's console page acts as a WSI (WebSocket Interface) client, identical to the Leo Remote CLI terminal - same protocol, same interaction model.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Run dev server (frontend: 5173, backend: 5013)
npm run build        # Build for production
npm run start:prod   # Run production server
npx playwright test  # Run E2E tests (requires server running on 5013)
```

## Architecture

### Request Flow
```
User prompt → ConsolePage → WSI Server (/wsi) → Container Manager → Leo Container
     ↑                           ↓
     └────── WebSocket logs ─────┘
```

### Key Directories

**Server (`server/`)**
- `index.ts` - Express app, WSI server attachment on `/wsi`
- `routes/generations.ts` - Generation CRUD, download endpoints
- `lib/wsi/` - WebSocket Interface server (container orchestration)
- `lib/github-manager.ts` - GitHub repo creation, code push
- `middleware/auth.ts` - Supabase JWT validation

**Client (`client/src/`)**
- `pages/ConsolePage.tsx` - Main generation UI with xterm.js terminal
- `pages/AppsPage.tsx` - User's generation history
- `components/terminal/REPLTerminal.tsx` - xterm.js terminal component
- `components/iteration/` - Iteration history viewer
- `contexts/AuthContext.tsx` - Supabase auth state
- `lib/wsi-client.ts` - Browser WSI client
- `hooks/useWsi.ts` - React hook for WSI connection

**Shared (`shared/`)**
- `schema.ts` - Drizzle ORM table definitions
- `schema.zod.ts` - Zod validation schemas (source of truth)
- `contracts/` - ts-rest API contracts

### Database Schema

Uses Drizzle ORM with PostgreSQL (via Supabase):
- `generation_requests` - App generation tracking (status, GitHub URL, iterations)
- `iteration_snapshots` - Point-in-time snapshots for resume functionality

Run migrations: `npx drizzle-kit push`

### WSI Protocol (v2.1)

The browser speaks WSI protocol directly to the server. Key message types:
- **Client sends**: `start_generation`, `decision_response`
- **Server sends**: `ready`, `log`, `progress`, `decision_prompt`, `iteration_complete`, `all_work_complete`, `error`

See `docs/wsi-protocol.md` for full specification.

### Authentication

Supabase Auth handles all authentication:
- Frontend uses `@supabase/supabase-js` client
- Backend validates JWTs via `server/middleware/auth.ts`
- No local user table - uses Supabase Auth UUIDs

### API Contracts

Uses ts-rest for type-safe API contracts:
- Contracts defined in `shared/contracts/`
- Client uses `client/src/lib/api-client.ts`
- Routes implement contracts in `server/routes/`

## Testing

E2E tests use Playwright (`tests/e2e/`):
```bash
# Server must be running on port 5013
npm run build && npm run start:prod &
npx playwright test
```

Test credentials: `jake@happyllama.ai` / `p@12345678`

## Environment Variables

```bash
# Supabase (Leo SaaS's own project)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
LEO_DATABASE_URL=postgresql://...   # Falls back to DATABASE_URL

# Container
CONTAINER_IMAGE=leo-container:latest

# GitHub (platform bot)
GITHUB_BOT_TOKEN=ghp_xxx
```

## Code Patterns

### Adding API Endpoints
1. Define contract in `shared/contracts/`
2. Implement route in `server/routes/`
3. Use `authMiddleware` for protected endpoints

### Adding UI Pages
1. Create page in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Wrap with `<ProtectedRoute>` if authentication required

### Handling WSI Messages
Browser WSI client (`lib/wsi-client.ts`) mirrors Leo Remote CLI behavior. Add handlers for new message types in the appropriate hook/component.
