# Leo SaaS - AI App Generator Platform

> Web interface for Leo, the AI-powered application generator

**Source**: Seed app from [leo-monorepo-v2/saas](https://github.com/fastdev-ai/leo-monorepo-v2). Historical docs available in that repo if needed.

## Overview

Leo SaaS provides a browser-based interface for generating full-stack applications from natural language prompts. Users describe their app, and Leo (powered by Claude Code) generates production-ready code with real database, authentication, and deployment configuration.

## Architecture

This app is being integrated with [Leo Remote](../../remote/) to share backend modules:

- **WSI Server** - WebSocket protocol for container communication
- **Container Manager** - Docker/Fargate container orchestration
- **Supabase Pool Manager** - Database allocation for free tier

See [Integration Plan](../docs/INTEGRATION_PLAN.md) and [Spec](../../remote/docs/app-generator-saas-spec.md) for details.

## Project Structure

```
app/
├── client/          # React frontend (Vite, TypeScript, Tailwind)
│   └── src/
│       ├── pages/       # ConsolePage, AppsPage, Login, Register
│       ├── components/  # UI components, terminal, iteration history
│       └── contexts/    # AuthContext (Supabase)
├── server/          # Express backend
│   └── lib/
│       ├── orchestrator/    # Container orchestration (being replaced)
│       ├── storage/         # Database storage (Drizzle)
│       └── github-manager.ts
├── shared/          # Contracts, schema
└── tests/           # Playwright e2e tests
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5013
```

## Environment Variables

```bash
# Supabase (Leo SaaS's own project for auth/data)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...

# GitHub (platform bot)
GITHUB_BOT_TOKEN=ghp_xxx
```

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Console UI | `client/src/pages/ConsolePage.tsx` | Real-time log viewer with xterm.js |
| Terminal | `client/src/components/terminal/REPLTerminal.tsx` | xterm.js terminal component |
| Iteration History | `client/src/components/iteration/` | View generation snapshots |
| Auth Context | `client/src/contexts/AuthContext.tsx` | Supabase auth state |
| GitHub Manager | `server/lib/github-manager.ts` | Repo creation, code push |
| Fly Templates | `server/lib/templates/` | Dockerfile, fly.toml generation |

## Integration Status

- [x] Seed app copied from leo-monorepo-v2
- [ ] Replace orchestrator with Leo Remote's Container Manager
- [ ] Replace WebSocket with Leo Remote's WSI Server
- [ ] Integrate Supabase Pool Manager
- [ ] Update ConsolePage for WSI Protocol v2.1
