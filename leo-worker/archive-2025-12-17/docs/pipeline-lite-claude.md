# Prompt to URL: The Leonardo Pipeline (Lite Guide)

**Build production-ready web apps from a single prompt in minutes.**

## Quick Start

```bash
# Generate an app from a prompt
uv run python src/app_factory_leonardo_replit/run.py "Create a wedding venue booking platform"

# Run the generated app
cd apps/your-app/app
npm install
npm run dev

# App is live at http://localhost:5002 (frontend) + http://localhost:5003 (backend)
```

**That's it.** You have a full-stack app with auth, database schema, API, and UI.

---

## The Three-Stage Pipeline

### Stage 1: Plan (Product Thinking)
**Input**: User prompt
**Output**: `plan/plan.md`

The `OrchestratorAgent` analyzes your prompt and creates:
- Feature specifications
- Data model requirements
- User flow descriptions

**Example**:
```
Prompt: "Create a travel itinerary planner with AI recommendations"
→ Plan includes: trips, itineraries, activities, user preferences, AI integration
```

### Stage 2: Build (Code Generation)
**Process**: Multi-agent Writer-Critic loops
**Output**: Full-stack application

#### Build Sub-Stages

1. **Backend Specification**
   - Schema: `shared/schema.zod.ts` (Zod schema - single source of truth)
   - Contracts: `shared/contracts/*.contract.ts` (ts-rest API contracts)

2. **Backend Implementation**
   - Schema: `shared/schema.ts` (Drizzle ORM from Zod)
   - Storage: `server/storage.ts` (Factory pattern: memory/database)
   - Routes: `server/routes.ts` (Express endpoints with auth middleware)
   - Auth Routes: `server/routes/auth.ts` (Login, signup, logout, me)

3. **Frontend Specification**
   - API Client: `client/src/lib/api-client.ts` (Type-safe, auth-ready)
   - API Registry: `client/src/lib/api-registry.md` (Human-readable API docs)
   - FIS Master: `specs/frontend-interaction-spec-master.md` (Design system, patterns)

4. **Frontend Implementation**
   - App Shell: `client/src/App.tsx` (Routing with Wouter, AuthProvider)
   - Layout: `client/src/components/layout/AppLayout.tsx` (Nav, footer, auth UI)
   - Pages: `client/src/pages/*.tsx` (Generated from FIS specs)

**Key Innovation**: Each step uses **Writer-Critic loops** (up to 5 iterations) to ensure quality.

### Stage 3: Validator (Quality Assurance)
**Input**: Generated app
**Output**: Validated, working application

The `AppValidatorCritic` runs:
- ✅ OXC linting (50-100x faster than ESLint)
- ✅ TypeScript build checks
- ✅ Browser smoke tests (launches actual browser)
- ✅ Auto-fix attempts by `AppFixerAgent`

---

## Writer-Critic Pattern

**The secret sauce for quality AI-generated code.**

```
Writer Agent
  ↓
Generates code based on specs
  ↓
Critic Agent
  ↓
Validates: structure, patterns, integration
  ↓
Decision: complete | continue | fail
  ↓
If continue → Writer iterates (max 5 times)
```

**Example**: LayoutGeneratorCritic

```xml
<decision>continue</decision>
<reasoning>
The layout is mostly correct but missing:
1. User menu component in header
2. Auth state loading skeleton
3. Mobile menu auth integration
</reasoning>
<recommendations>
- Add UserMenu component from @/components/auth/UserMenu
- Show loading skeleton while auth initializes
- Include sign in/out in mobile menu
</recommendations>
```

Writer receives this feedback and regenerates the layout.

---

## Auth Scaffolding (80/20 Approach)

**Key Insight**: Auth is 80% boilerplate, 20% app-specific.

### Scaffolding Strategy

**80% from Template** (vite-express-template-v3.0.0-auth):
- `server/lib/auth/` - Mock and Supabase adapters
- `server/middleware/auth.ts` - JWT validation middleware
- `client/src/contexts/AuthContext.tsx` - React auth provider
- `client/src/components/auth/` - ProtectedRoute, UserMenu, LoadingScreen
- `client/src/lib/auth-helpers.ts` - Token management utilities

**20% Generated** by Agents:
- Users table in schema (with app-specific fields)
- Auth routes (integrated with app's storage layer)
- Protected route wiring in App.tsx
- User menu in layout (connected to app nav)

### One-Variable Switching

**Development** (`.env`):
```bash
AUTH_MODE=mock       # Accept any credentials
STORAGE_MODE=memory  # In-memory storage
```

**Production** (`.env.production`):
```bash
AUTH_MODE=supabase              # Real auth with Supabase
STORAGE_MODE=database           # PostgreSQL with Drizzle
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
DATABASE_URL=postgresql://...
```

**Change one line** → Instant dev/prod switch.

### Factory Pattern Implementation

```typescript
// server/lib/auth/factory.ts
import { mockAuth } from './mock-adapter';
import { supabaseAuth } from './supabase-adapter';

export function createAuth() {
  const mode = process.env.AUTH_MODE || 'mock';

  if (mode === 'supabase') {
    console.log('🔐 Auth Mode: SUPABASE (production)');
    return supabaseAuth;
  }

  console.log('🔓 Auth Mode: MOCK (development)');
  return mockAuth;
}

export const auth = createAuth();
```

**Same pattern for storage**:
```typescript
// server/lib/storage/factory.ts
export function createStorage() {
  const mode = process.env.STORAGE_MODE || 'memory';
  return mode === 'database'
    ? new DatabaseStorage()
    : new MemoryStorage();
}
```

**Result**: Zero code changes needed to switch environments.

---

## Generated App Structure

```
apps/your-app/app/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui components (Button, Card, etc.)
│   │   │   ├── auth/                # Auth components (scaffolded)
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── UserMenu.tsx
│   │   │   │   └── LoadingScreen.tsx
│   │   │   └── layout/
│   │   │       └── AppLayout.tsx    # Generated with auth integration
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx      # Scaffolded
│   │   ├── lib/
│   │   │   ├── api-client.ts        # Generated with auth headers
│   │   │   └── auth-helpers.ts      # Scaffolded token management
│   │   ├── pages/                   # Generated from FIS specs
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx        # Scaffolded
│   │   │   ├── SignupPage.tsx       # Scaffolded
│   │   │   └── ... (app-specific pages)
│   │   └── App.tsx                  # Generated with AuthProvider + routing
│   └── vite.config.ts
│
├── server/                          # Express backend
│   ├── lib/
│   │   ├── auth/                    # Scaffolded
│   │   │   ├── factory.ts
│   │   │   ├── mock-adapter.ts
│   │   │   ├── supabase-adapter.ts
│   │   │   └── interfaces.ts
│   │   ├── storage/                 # Scaffolded + generated
│   │   │   ├── factory.ts
│   │   │   ├── mem-storage.ts
│   │   │   ├── supabase-storage.ts
│   │   │   └── interfaces.ts
│   │   ├── ai-agent.ts              # Generated (if AI features requested)
│   │   └── db/
│   │       └── schema.ts            # Generated Drizzle schema
│   ├── middleware/
│   │   └── auth.ts                  # Scaffolded JWT middleware
│   ├── routes/
│   │   └── auth.ts                  # Generated (uses scaffolded adapters)
│   ├── routes.ts                    # Generated app routes
│   ├── storage.ts                   # Generated storage instance
│   └── index.ts                     # Scaffolded server setup
│
├── shared/
│   ├── schema.zod.ts               # Generated (source of truth)
│   ├── schema.ts                   # Generated (Drizzle from Zod)
│   └── contracts/                  # Generated
│       └── *.contract.ts           # ts-rest contracts
│
├── .env                            # Environment config
├── package.json                    # Dependencies
└── README.md                       # Generated docs
```

**Legend**:
- **Scaffolded**: From template, reusable across all apps
- **Generated**: AI-created, app-specific

---

## Agent Pipeline Details

### Backend Spec Generation

```
SchemaDesignerAgent + SchemaDesignerCritic
  → shared/schema.zod.ts (Zod schema with users table)

ContractsDesignerAgent + ContractsDesignerCritic
  → shared/contracts/*.contract.ts (ts-rest API contracts)
```

**Critical**: Users table is ALWAYS added, even if not in original prompt.

### Main Build Pipeline

```
1. SchemaGeneratorAgent + Critic
   → shared/schema.ts (Drizzle ORM)

2. StorageGeneratorAgent + Critic
   → server/storage.ts (uses factory pattern)

3. RoutesGeneratorAgent + Critic
   → server/routes.ts (with authMiddleware on protected routes)

4. Auth Routes Generator
   → server/routes/auth.ts (integrates with auth factory)

5. TsRestApiClientGeneratorAgent + Critic
   → client/src/lib/api-client.ts (auto-injects auth headers)
   → client/src/lib/api-registry.md (human-readable API docs)

6. Context Provider Generator
   → client/src/contexts/AuthContext.tsx (app-aware)

7. AppShellGeneratorAgent + Critic
   → client/src/App.tsx (wraps with AuthProvider, uses ProtectedRoute)

8. FIS Master Spec Generator
   → specs/frontend-interaction-spec-master.md (design patterns)

9. LayoutGeneratorAgent + Critic
   → client/src/components/layout/AppLayout.tsx (with UserMenu)

10. Frontend Implementation (Parallel)
    → All pages and components
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: Wouter (1.2KB, simpler than React Router)
- **State**: TanStack Query (server state caching)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (copy-paste, not npm package)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express
- **ORM**: Drizzle (type-safe, SQL-like)
- **Validation**: Zod schemas
- **Auth**: Supabase Auth / Mock (switchable)
- **Contracts**: ts-rest (OpenAPI-like, type-safe)
- **AI** (optional): Anthropic SDK

### Development
- **Build**: Vite (instant HMR)
- **Linting**: OXC (50-100x faster than ESLint)
- **Type Check**: TypeScript strict mode
- **Testing**: MCP tools + browser automation

---

## AI Agent Integration (Optional)

If your prompt mentions "AI", "intelligent", "recommendations", etc., the pipeline generates an AI agent.

**Example**: Travel Planner AI Agent

```typescript
// server/lib/ai-agent.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class TravelPlannerAgent {
  async generateItinerary(tripInput: TripInput): Promise<GeneratedDay[]> {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 16000,
      temperature: 0.7,
      system: expertTravelPlannerPrompt,
      messages: [{ role: 'user', content: tripDetails }],
    });

    // Parse structured JSON response
    const itinerary = JSON.parse(response);
    return itinerary.days;
  }

  // Fallback if API fails
  private generateFallbackItinerary(tripInput: TripInput): GeneratedDay[] {
    // Template-based generation
  }
}
```

**Key Features**:
- ✅ Structured JSON output with validated schemas
- ✅ Graceful fallback to templates if API fails
- ✅ Transparent reasoning (AI explains WHY it suggested each item)
- ✅ Context-aware (uses user preferences, budget, dates)

**Cost**: ~$0.10-0.15 per request (Claude Sonnet 4.5)

---

## How It All Works Together

### 1. Prompt Analysis
```
User: "Create a wedding venue booking platform"

Plan Stage:
- Identifies entities: venues, bookings, users, reviews
- Determines features: search, availability calendar, booking flow
- Specifies auth requirements: venue owners vs customers
```

### 2. Schema Generation
```
SchemaDesigner creates:
- users (id, email, name, role: 'customer' | 'owner')
- venues (id, name, description, ownerId, capacity, price)
- bookings (id, venueId, customerId, date, status)
- reviews (id, venueId, customerId, rating, comment)

All with proper foreign keys and constraints.
```

### 3. API Contract Generation
```
ContractsDesigner creates:
- GET /api/venues (public)
- POST /api/venues (protected, owner role)
- GET /api/bookings (protected, own bookings only)
- POST /api/bookings (protected)
- POST /api/reviews (protected, only if booked)
```

### 4. Backend Generation
```
Routes with proper protection:

router.get('/api/venues', async (req, res) => {
  // Public - no auth needed
  const venues = await storage.getVenues();
  res.json(venues);
});

router.post('/api/venues', authMiddleware(), async (req, res) => {
  // Protected - user must be authenticated
  // authMiddleware adds req.user
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner role required' });
  }
  const venue = await storage.createVenue({
    ...req.body,
    ownerId: req.user.id
  });
  res.json(venue);
});
```

### 5. Frontend Generation
```
FIS Master Spec defines:
- Design system (colors, typography, spacing)
- Component patterns (cards, forms, modals)
- Navigation structure
- Auth UI patterns (login, signup, user menu)

Page Generation:
- VenuesListPage: Search, filters, grid of venue cards
- VenueDetailPage: Photos, description, booking calendar
- BookingPage: Date picker, guest count, payment
- MyBookingsPage: List of user's bookings with status
```

### 6. Auth Integration
```
App.tsx wraps everything:

<AuthProvider>
  <Router>
    <Route path="/" component={HomePage} />
    <Route path="/login" component={LoginPage} />
    <Route path="/venues" component={VenuesListPage} />
    <Route path="/venues/:id">
      <ProtectedRoute>
        <VenueDetailPage />
      </ProtectedRoute>
    </Route>
    <Route path="/my-bookings">
      <ProtectedRoute>
        <MyBookingsPage />
      </ProtectedRoute>
    </Route>
  </Router>
</AuthProvider>
```

### 7. Launch
```bash
npm run dev

# Development mode:
# - Mock auth (any credentials work)
# - In-memory storage
# - No database required
# App runs immediately!

# When ready for production:
# 1. Change .env: AUTH_MODE=supabase, STORAGE_MODE=database
# 2. Add Supabase and PostgreSQL credentials
# 3. Run migrations
# 4. Deploy

# No code changes needed!
```

---

## The Modular FIS Secret

**Problem**: Claude has a 32K output token limit. A complete app spec exceeds this.

**Solution**: Modular Frontend Interaction Spec (FIS)

```
frontend-interaction-spec-master.md (~7K tokens)
  - Shared design system
  - Component patterns
  - API registry
  - Navigation structure

specs/pages/frontend-interaction-spec-HomePage.md (~1.2K)
specs/pages/frontend-interaction-spec-VenuesListPage.md (~1.2K)
specs/pages/frontend-interaction-spec-VenueDetailPage.md (~1.2K)
...
```

**Benefits**:
1. Each page spec is small → fast generation
2. Pages can be generated in parallel → 10x speedup
3. Master spec prevents duplication
4. Easy to regenerate individual pages

---

## Development Workflow

### Generate App
```bash
uv run python src/app_factory_leonardo_replit/run.py "Your app description"

# Wait 3-5 minutes
# Pipeline creates ~50+ files
```

### Run App
```bash
cd apps/your-app/app
npm install
npm run dev

# Frontend: http://localhost:5002
# Backend: http://localhost:5003
```

### Test Auth
```bash
# Development mode (mock auth)
# Any credentials work!
Email: test@example.com
Password: anything

# You're logged in immediately
```

### Test API
```bash
# Health check
curl http://localhost:5003/health

# Login
curl -X POST http://localhost:5003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Get user info (with token)
curl http://localhost:5003/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Iterate
```bash
# Modify files in client/src/ or server/
# Vite auto-reloads on save
# TypeScript catches errors immediately
```

### Deploy to Production
```bash
# 1. Update .env
AUTH_MODE=supabase
STORAGE_MODE=database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key
DATABASE_URL=postgresql://user:pass@host:5432/db

# 2. Run migrations
npx drizzle-kit push

# 3. Build
npm run build

# 4. Deploy (Vercel, Render, Railway, etc.)
npm start
```

---

## Key Success Factors

### 1. Scaffolding-First Approach
**80% template, 20% generated** = Reliable + Fast

Benefits:
- Consistent auth patterns across all apps
- No need to regenerate common code
- Agents focus on app-specific logic
- Easier to maintain and update

### 2. Writer-Critic Loops
**Quality through iteration**

Benefits:
- Catches integration errors early
- Ensures consistency across components
- Self-correcting (up to 5 attempts)
- Learns common patterns

### 3. Factory Pattern
**Runtime flexibility with zero code changes**

Benefits:
- Instant dev/prod switching
- Easy A/B testing
- Same codebase for all environments
- Type-safe with interfaces

### 4. Type Safety End-to-End
**Zod → Drizzle → ts-rest → React**

Benefits:
- Catch errors at compile time
- Auto-completion in IDE
- Refactoring is safe
- Contracts enforce API compliance

---

## Troubleshooting

### App doesn't start
```bash
# Check node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check logs
npm run dev 2>&1 | tee debug.log
```

### Auth not working
```bash
# Verify environment
cat .env
# Should have: AUTH_MODE=mock (development)

# Check server logs
# Should see: 🔓 Auth Mode: MOCK (development)

# Try explicit credentials
# Email: demo@example.com
# Password: password
```

### Database errors
```bash
# In development, should use memory storage
cat .env
# Should have: STORAGE_MODE=memory

# If using database mode:
# 1. Verify DATABASE_URL is correct
# 2. Run migrations:
npx drizzle-kit push
```

### TypeScript errors
```bash
# Generate types
npm run typecheck

# Common fix: missing path mappings
# Check tsconfig.json has:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Examples

### Simple CRUD App
```
Prompt: "Create a recipe manager with ingredients and cooking instructions"

Generated:
- Schema: recipes, ingredients, recipe_ingredients (junction table)
- API: GET/POST/PUT/DELETE for recipes
- Pages: RecipeList, RecipeDetail, AddRecipe, EditRecipe
- Features: Search, filter by dietary preferences, save favorites

Time: 3 minutes
Files: 47
Lines of code: ~3,500
```

### Marketplace App
```
Prompt: "Create a marketplace for handmade crafts with seller profiles and reviews"

Generated:
- Schema: users, products, orders, reviews, seller_profiles
- API: Product catalog, order management, review system
- Pages: Home, ProductList, ProductDetail, SellerProfile, Cart, Checkout, MyOrders
- Features: Search, categories, ratings, order tracking

Time: 4 minutes
Files: 63
Lines of code: ~5,200
```

### AI-Powered App
```
Prompt: "Create a travel itinerary planner with AI-generated recommendations"

Generated:
- Schema: users, trips, itineraries, activities
- API: Trip management + AI generation endpoints
- AI Agent: Claude integration for itinerary generation
- Pages: TripList, NewTrip, ItineraryView, ActivityDetail
- Features: Natural language parsing, budget optimization, alternative suggestions

Time: 5 minutes
Files: 54
Lines of code: ~4,800
```

---

## Cost Breakdown

### Development (Free)
- Auth: Mock mode (no cost)
- Storage: In-memory (no cost)
- AI: Fallback templates (no cost)

### Production (Pay as you go)
- **Auth**: Supabase Free Tier
  - 50,000 monthly active users
  - Unlimited auth requests
  - Cost: $0 until 50K users

- **Database**: Supabase / Railway / Neon
  - ~$5-25/month for small apps
  - Scales with usage

- **AI** (optional): Anthropic API
  - Claude Sonnet 4.5: ~$0.01 per 1K tokens
  - Typical request: 8-10K tokens
  - Cost: ~$0.10-0.15 per AI-generated response

**Total for small app**: $5-30/month (mostly database)

---

## Next Steps

1. **Try it**: Generate your first app with a simple prompt
2. **Explore**: Look at the generated code structure
3. **Customize**: Modify pages, add features
4. **Deploy**: Switch to production mode and launch

**The pipeline handles the boilerplate. You focus on the unique features.**

---

## Additional Resources

- **Pipeline Details**: `/docs/leonardo-pipeline-gemini.md`
- **Auth Architecture**: `/docs/auth-supabase-scaffolding-revised-analysis.md`
- **Agentic Pipeline**: `/docs/agentic-pipeline.md`
- **Baby Examples**: `/apps/travel-planner-baby/`, `/apps/coliving-marketplace-baby/`

**Questions?** Check the generated `README.md` in your app directory.
