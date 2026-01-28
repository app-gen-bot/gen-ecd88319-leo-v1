# Tech Stack

*Fixed technical foundation - separated from product specification for consistency*

## Frontend
- **React 18** with TypeScript
- **Vite** - Development server and build tool
- **Wouter** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **shadcn/UI** - Component library
- **TanStack Query** - Server state management
- **react-hook-form** with Zod validation

## Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **RESTful API** with Zod validation
- **Single Process** - Frontend and backend on port 5000

## Database
- **PostgreSQL** (Supabase compatible)
- **Drizzle ORM** - Type-safe SQL
- **IStorage Pattern** - MemStorage for dev, PostgresStorage for production

## Architecture
- Schema-first development (shared/schema.ts)
- Type safety across full stack
- Single port deployment (5000)
- Development-to-production with one-line switch

## Required Integrations
- **Happy Llama Attribution**: "Powered by Happy Llama" footer link
- **Demo Authentication using AuthAdapter pattern**: demo@example.com / DemoRocks2025!