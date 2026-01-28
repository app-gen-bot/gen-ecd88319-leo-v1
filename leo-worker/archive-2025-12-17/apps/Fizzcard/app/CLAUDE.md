# Fizzcard - Context

Generated: 2025-10-23T10:02:07.665447
Session: d6d8a06a-01a6-4972-92d8-584659a4aaa3

## Architecture Overview

### Entities
users

### Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL (via Supabase)
- ORM: Drizzle
- API: ts-rest contracts

### Features
- CRUD operations
- RESTful API

## Key Files and Directories

- `shared/schema.zod.ts` - Zod validation schemas (source of truth)
- `shared/schema.ts` - Drizzle ORM schemas
- `shared/contracts/` - ts-rest API contracts
- `server/routes/` - API route implementations
- `server/lib/auth/` - Authentication adapters (mock/Supabase)
- `server/lib/storage/` - Storage adapters (memory/database)
- `client/src/pages/` - React page components
- `client/src/components/` - Reusable UI components
- `client/src/contexts/` - React contexts (Auth, etc.)
- `client/src/lib/` - Client utilities (api-client, auth-helpers)

## Recent Changes

No recent changes recorded
Last modified: Unknown

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (port 5013)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

See `.env` file for configuration. Key variables:
- `AUTH_MODE`: mock (dev) or supabase (prod)
- `STORAGE_MODE`: memory (dev) or database (prod)
- `PORT`: Server port (default: 5013)
- `VITE_API_URL`: API endpoint for client

## Notes for Future Development

This file helps Claude Code maintain context across sessions. When resuming work,
Claude will read this file to understand the app's architecture and recent changes.
