# TECH STACK COMPARISON FOR AI GENERATION - 2025-01-19

## Context
Analysis of which tech stack is easier for AI to auto-generate applications: Next.js with App Router vs React-Vite-Express with wouter and TanStack Query (Leonardo stack).

## Current Files Analyzed
- `apps/timeless-weddings_2025-09-18/app/shared/schema.ts` - Drizzle ORM schema with PostgreSQL
- `apps/timeless-weddings_2025-09-18/app/server/routes.ts` - Express REST API routes
- `apps/timeless-weddings_2025-09-18/app/server/storage.ts` - Storage abstraction layer

## Key Finding: React-Vite-Express is Significantly Easier for AI

### Why Vite-Express (Leonardo Stack) is Easier

#### 1. Clear Separation of Concerns
- Frontend runs on port 5173 (Vite dev server)
- Backend runs on port 5000 (Express server)
- No mixing of server/client code
- AI doesn't need to reason about SSR boundaries

#### 2. Predictable File Structure
```
app/
├── client/           # Everything here is client-side
│   ├── components/
│   └── pages/
├── server/           # Everything here is server-side
│   ├── routes.ts
│   └── storage.ts
└── shared/           # Shared types/schemas
```

#### 3. Simple Mental Model
- Express routes = REST API endpoints
- React components = UI components
- No confusion about "use client" directives
- No server components vs client components decisions

#### 4. Explicit Data Fetching
```typescript
// Clear and explicit with TanStack Query
const { data } = useQuery({
  queryKey: ['chapels'],
  queryFn: () => fetch('/api/chapels').then(r => r.json())
})
```

### Why Next.js App Router is Harder

#### 1. Complex Decision Tree
AI must decide for EVERY component:
- Server Component or Client Component?
- Where to fetch data? (server component, route handler, client-side)
- Static or dynamic rendering?
- Streaming or blocking?
- Edge runtime or Node.js runtime?

#### 2. Mixed Paradigms
```typescript
// Is this server or client? AI must track context constantly
export default async function Page() {  // Server component
  const data = await fetch()            // Server-side fetch
  
  return <Button />  // Is Button server or client? Depends on its implementation
}
```

#### 3. More Ways to Break
- Accidentally importing server-only code in client components
- Using hooks in server components
- Hydration mismatches
- Metadata export conflicts
- Mixing dynamic and static rendering incorrectly

#### 4. Validation Challenges
- Harder to validate without running full Next.js build
- TypeScript alone doesn't catch server/client boundary errors
- More complex error messages that require deep Next.js knowledge
- Build-time vs runtime errors harder to predict

## Leonardo Stack Advantages for AI Generation

1. **Single validation pass** - OXC lints everything as client code, simple and fast
2. **Template-based approach** - AI fills in a working skeleton
3. **No SSR complexity** - No hydration issues to debug
4. **Clear patterns** - REST API + SPA is a well-established pattern
5. **Faster iteration** - Vite hot reload vs Next.js compilation
6. **Proven success** - Leonardo App Factory successfully generates working apps

## Portability Analysis for Supabase Migration

### Current Stack Components
- **Drizzle ORM** - Works with Supabase PostgreSQL
- **Zod validation** - Framework agnostic
- **JWT auth** - Would be replaced by Supabase Auth
- **Express routes** - Need conversion to Next.js API routes or Supabase Edge Functions

### With Supabase Integration

#### What Changes:
1. **Authentication** - Remove custom JWT/bcrypt, use Supabase Auth
2. **Database access** - Replace Drizzle with Supabase client (or keep Drizzle with Supabase PostgreSQL)
3. **User table** - Remove password field, reference auth.users table
4. **API layer** - Can use Supabase client directly or keep REST API pattern

#### What Stays:
1. **Data model** - Table structure and relationships
2. **Business logic** - CRUD operations patterns
3. **Validation schemas** - Zod schemas for forms
4. **TypeScript types** - Core type definitions

## Recommendation

**For AI generation: Stick with React-Vite-Express (Leonardo) stack**

Reasons:
1. **Proven working** - Leonardo pipeline successfully generates apps
2. **"Never Broken Principle"** - Easier to maintain with clear separation
3. **Simpler validation** - OXC can validate in one pass
4. **Clearer errors** - No SSR/hydration complexity
5. **Faster development cycle** - Both for AI and human developers

## Migration Path if Needed

If migration to Next.js is required later:
1. Keep business logic separate (as currently done)
2. Port REST API to Next.js API routes (mechanical translation)
3. Replace wouter with Next.js routing
4. Keep TanStack Query for client-side data fetching
5. Add SSR progressively where beneficial

## Evidence

The Leonardo App Factory's success rate with the Vite-Express stack demonstrates that this architecture is more suitable for AI generation. The clear boundaries and explicit patterns reduce the complexity that AI agents need to handle.

## Future Considerations

- **Edge deployment**: Current stack can deploy to Cloudflare Workers with modifications
- **Serverless**: Express routes can be converted to serverless functions
- **Real-time**: Can add WebSockets or Server-Sent Events without framework changes
- **Mobile**: React Native can share business logic and API client code