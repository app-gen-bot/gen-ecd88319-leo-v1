# Happy Llama - AI App Generator SaaS

Generated: 2025-10-23
Last Updated: 2025-10-26

## 🚨 START HERE - READ FIRST 🚨

**MANDATORY FOR EVERY SESSION:** Read `AI_AGENT_BRIEFING.md` before doing ANYTHING.

**Why:** This EC2 instance has specific constraints (no X11, use Docker not ECS, real Supabase auth). The briefing doc explains everything to avoid repeating mistakes.

**TL;DR:**
- Environment: EC2 with real AWS secrets, use Local Docker orchestrator
- Testing: API testing only (no headed browsers), jake@happyllama.ai login
- DON'T: Try registration tests, ECS mode, mock auth, browser automation
- DO: Verify generation workflow end-to-end with real Docker containers
- Production: 1 day deadline

## Architecture Overview

### Project Description
Happy Llama is a SaaS platform that generates production-ready full-stack applications from natural language prompts using Claude Code. Users submit app descriptions, and the platform creates complete applications with frontend, backend, database schemas, and deployment configurations.

## Multi-Repository Architecture

This is **one of three interconnected repositories** that make up the Happy Llama AI App Generator SaaS:

### The Three Repositories

1. **app-gen** (Python - Generator Agent)
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/gen`
   - Branch: `leonardo-saas`
   - Role: The AI agent that actually generates applications using Claude Code
   - Output: Packaged as Docker container `app-gen-saas-generator:latest`
   - Tech: Python, cc-agent framework, FastAPI server for orchestration

2. **app-gen-saas** (TypeScript - Application Server) **← YOU ARE HERE**
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/saas`
   - Branch: `v1`
   - Role: Web application that provides UI, orchestrates generation jobs, handles auth
   - Output: Packaged as Docker container `app-gen-saas-app:latest`
   - Tech: React + Express, WebSocket streaming, Supabase auth, GitHub integration

3. **app-gen-infra** (TypeScript - Infrastructure)
   - Location: `/home/jake/WORK/APP_GEN_SAAS/V1/infra`
   - Branch: `v1`
   - Role: AWS CDK definitions that deploy both containers to ECS Fargate
   - Output: CloudFormation templates → deployed AWS infrastructure
   - Tech: AWS CDK, ECS, S3, Secrets Manager, ALB, VPC

### How This Repo Fits In

**app-gen-saas is the orchestrator:**
- Provides web UI for users to submit app generation requests
- Receives user prompts and creates generation records in database
- Spawns app-gen agent containers (via Docker locally or ECS in production)
- Streams logs from generator containers to user browsers via WebSocket
- Stores generated apps (S3 in prod, filesystem in dev)
- Creates GitHub repositories with generated code
- Serves download links and deployment instructions

### Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│ User Request Flow                                               │
├─────────────────────────────────────────────────────────────────┤
│ User submits prompt → Dashboard (this repo)                     │
│         ↓                                                        │
│ Orchestrator (local-orchestrator.ts or aws-orchestrator.ts)     │
│         ↓                                                        │
│ Spawns app-gen container (from ../app-gen repo)                 │
│         ↓                                                        │
│ WebSocket streams logs back to user                             │
│         ↓                                                        │
│ Generated app → S3 + GitHub → Deploy instructions shown         │
└─────────────────────────────────────────────────────────────────┘
```

### Branch Coordination

These repos use coordinated experimental branches:
- **app-gen-saas**: `leonardo` branch ← YOU ARE HERE
- **app-gen-infra**: `leonardo` branch
- **app-gen**: `leonardo-saas` branch (naming conflict with old leonardo/* branches)

**Safe rollback point**: Tag `working_20251023_1030` exists on all three repos marking the last known-good state before leonardo experiments.

To revert all repos to safe state:
```bash
cd /home/jake/NEW/WORK/APP_GEN/app-gen-saas && git checkout working_20251023_1030
cd /home/jake/NEW/WORK/APP_GEN/app-gen-infra && git checkout working_20251023_1030
cd /home/jake/NEW/WORK/APP_GEN/app-gen && git checkout working_20251023_1030
```

### VS Code Workspace

All three repositories are managed in a single workspace:
```
/home/jake/NEW/WORK/APP_GEN/APP_GEN_SAAS.code-workspace
```

Open this file in VS Code to see all three repos as folders in one window.

### Entities
- **users** - User accounts (legacy - auth now via Supabase)
- **generationRequests** - App generation tracking with status, logs, downloads, GitHub URLs

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Wouter
- **Backend**: Node.js, Express, TypeScript, ts-rest contracts
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle
- **Authentication**: Supabase Auth (JWT tokens)
- **Orchestration**: AWS ECS Fargate (production), Docker (local development)
- **Storage**: AWS S3 (production), local filesystem (development)
- **Real-time**: WebSocket (ws library) for live log streaming
- **Integrations**: GitHub API (Octokit v22), Fly.io deployment configs

### Features
- **AI App Generation**: Claude Code generates full applications from user prompts (10-5000 chars)
- **Real-time Progress**: WebSocket-based live logs during generation
- **GitHub Integration**: Automatic repository creation with generated code
- **Fly.io Deployment**: Auto-generated deployment configurations and instructions
- **Download Management**: ZIP downloads of generated applications
- **User Authentication**: Supabase-powered auth with registration/login
- **Generation History**: Dashboard showing all user's generation requests with status tracking
- **Multi-environment**: Adapter pattern for local (Docker) vs production (ECS) orchestration

## Key Files and Directories

### Shared
- `shared/schema.zod.ts` - Zod validation schemas (source of truth)
- `shared/schema.ts` - Drizzle ORM table definitions
- `shared/contracts/auth.contract.ts` - Authentication API contract
- `shared/contracts/generations.contract.ts` - Generation API contract

### Server
- `server/index.ts` - Express app setup, middleware, WebSocket initialization
- `server/routes/generations.ts` - Generation CRUD and download endpoints
- `server/middleware/auth.ts` - Supabase JWT validation middleware
- `server/lib/orchestrator/` - Generation orchestration layer
  - `factory.ts` - Selects Local vs AWS orchestrator
  - `local-orchestrator.ts` - Docker-based development orchestration
  - `aws-orchestrator.ts` - ECS Fargate production orchestration
  - `docker-manager.ts` - Docker container lifecycle management
  - `ecs-manager.ts` - ECS task lifecycle and S3 integration
  - `file-manager.ts` - ZIP creation and file handling
- `server/lib/auth/` - Authentication adapters (mock/Supabase)
- `server/lib/storage/` - Storage adapters (memory/database)
- `server/lib/github-manager.ts` - GitHub repo creation, Fly.io config generation
- `server/lib/websocket-server.ts` - WebSocket session and log streaming
- `server/lib/templates/fly-toml.ts` - Fly.io configuration template

### Client
- `client/src/pages/DashboardPage.tsx` - Main app interface (generation form, history, logs)
- `client/src/pages/HomePage.tsx` - Landing page
- `client/src/pages/LoginPage.tsx` - Authentication pages
- `client/src/components/LogViewer.tsx` - Real-time log display component
- `client/src/components/DeployModal.tsx` - Fly.io deployment instructions
- `client/src/components/auth/` - Auth components (ProtectedRoute, UserMenu)
- `client/src/components/layout/AppLayout.tsx` - Main layout with navigation
- `client/src/components/ui/` - shadcn/ui components
- `client/src/contexts/AuthContext.tsx` - Supabase auth state management
- `client/src/hooks/useGenerationLogs.ts` - WebSocket hook for live logs
- `client/src/lib/api-client.ts` - ts-rest client with auth headers
- `client/src/lib/supabase-client.ts` - Supabase client initialization

### Infrastructure
- `infrastructure/` - AWS CDK for ECS, S3, networking, security
- `Dockerfile` - Production container image
- `docker-compose.yml` - Local development environment

## Recent Changes

- **2025-10-22**: Rebranded from "launch-platform" to "Happy Llama"
- **2025-10-22**: Added GitHub token to docker-compose for local testing
- **2025-10-21**: Version tracking added to health endpoint
- **2025-10-21**: Updated Octokit API to v22 format (repos.createForAuthenticatedUser)
- **2025-10-21**: Complete GitHub + Fly.io deployment integration
- **2025-10-21**: WebSocket integration for ECS generator tasks
- **2025-10-21**: Supabase session-based download authentication
- **2025-10-20**: Increased generation timeout from 10 to 60 minutes

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
