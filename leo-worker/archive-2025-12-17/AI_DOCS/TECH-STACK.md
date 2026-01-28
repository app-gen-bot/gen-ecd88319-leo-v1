# TECH STACK

## Frontend
- **Vite** + **React 18** + **TypeScript**
- **Wouter** for routing (not React Router)
- **TanStack Query** for server state
- **Tailwind CSS** + **shadcn/ui**
- **react-hook-form** + **Zod** validation

## Backend
- **Node.js** + **Express** + **TypeScript**
- **Single port (5000)** - Express serves both API and static files
- **RESTful API** (not GraphQL)
- **Drizzle ORM** + **PostgreSQL** (Supabase compatible)

## Key Patterns
- **Schema-first**: Zod schemas are source of truth
- **IStorage interface**: MemStorage (dev) / PostgresStorage (prod)
- **Template-based**: Extract from `vite-express-template-v2.1.1-2025.tar.gz`
- **Demo auth**: demo@example.com / DemoRocks2025!

## Development Tools
- **OXC** for linting (via MCP)
- **TypeScript strict mode**
- **Path aliases**: `@/components`, `@shared/*`

## What We DON'T Use
- ❌ Next.js (use Vite)
- ❌ React Router (use Wouter)
- ❌ Redux/Zustand (use TanStack Query)
- ❌ Prisma (use Drizzle)
- ❌ GraphQL (use REST)