# Web Application Factory Patterns

A comprehensive guide to designing and implementing an agentic system for generating web applications with an opinionated technology stack and development methodology.

## 1. Planning & Analysis

### 1.1 Input Sources & Context Gathering

The system analyzes multiple input sources beyond the initial prompt to build comprehensive understanding:

**Codebase Analysis:**
- Read existing source code files to understand architecture
- Analyze package.json for dependencies and scripts
- Review configuration files (TypeScript, Vite, Tailwind, etc.)
- Examine database schemas and API routes
- Study component structure and naming conventions

**Project Memory:**
- Project documentation contains overview, architecture decisions, and user preferences
- Previous conversation context and implemented features
- Git history and checkpoints (when available)
- User preferences documented from past interactions

**External Research:**
- Latest API documentation and pricing
- Current best practices and security standards
- Framework updates and compatibility information
- Industry compliance requirements (SOC2, GDPR)

**Environment State:**
- Current workflow status (running/failed)
- Console logs and error messages
- LSP diagnostics for code quality
- Database connection status
- Installed packages and versions
- Screenshots of running application
- API endpoint responses
- Performance metrics

### 1.2 Build Plan Creation Process

**Phase 1: Request Analysis (30-60 seconds)**

```typescript
interface RequestAnalysis {
  domain: string;           // e.g., "Legal/Government", "AI/ML", "E-commerce"
  complexity: string;       // "Low", "Medium", "High", "Very High"
  userType: string;         // "Technical", "Non-technical", "Enterprise"
  timeEstimate: string;     // "1-2 hours", "Half day", "Multiple days"
  riskFactors: string[];    // ["Security", "Compliance", "Cost", "Integration"]
  dependencies: string[];   // ["External APIs", "Database changes", "Auth"]
}
```

**Phase 2: Knowledge Gap Assessment**

```typescript
const knowledgeGaps = {
  currentAPIs: 'Need latest API endpoints and pricing',
  dataFormats: 'What formats do providers accept?',
  enterpriseSecurity: 'SOC2, GDPR compliance requirements',
  costOptimization: 'Best practices for managing costs',
  performanceNeeds: 'How to measure success and optimize'
}
```

**Research Query Templates:**
1. "OpenAI API 2025 pricing limits enterprise" 
2. "Enterprise security compliance requirements SOC2"
3. "Industry best practices [domain] application architecture"
4. "Cost optimization strategies [technology] deployment"
5. "[Framework] integration patterns enterprise scale"

**Codebase Assessment Prompts:**
- "Analyze existing database schema patterns and ORM setup"
- "Locate API route structure and validation patterns" 
- "Identify authentication and security patterns implemented"
- "Find frontend component architecture and state management"

**Phase 3: Task Decomposition**

Breaking down complex requests into manageable tasks:

```typescript
const tasks = [
  {
    id: 1,
    title: "Research LLM APIs and pricing",
    type: "research",
    duration: "30 minutes",
    dependencies: []
  },
  {
    id: 2,
    title: "Design database schema for projects/datasets/jobs",
    type: "architecture",
    duration: "45 minutes",
    dependencies: [1]
  },
  {
    id: 3,
    title: "Implement file upload and validation",
    type: "development",
    duration: "2 hours",
    dependencies: [2]
  }
];
```

### 1.3 Task Dependencies & Milestones

**Technical Dependencies:**
- Database schema changes before API routes
- Storage interface before business logic
- Authentication before protected routes
- External API research before integration

**Development Dependencies:**
- Backend APIs before frontend integration
- Core components before advanced features
- Error handling alongside main functionality
- Testing throughout development process

**Milestone Planning:**

```typescript
const milestones = [
  {
    name: "Foundation Complete",
    criteria: ["Database schema", "Basic API routes", "Storage interface"],
    deliverable: "Core CRUD operations working"
  },
  {
    name: "Integration Ready",
    criteria: ["External APIs configured", "Authentication setup", "File handling"],
    deliverable: "External services connected"
  },
  {
    name: "User Experience",
    criteria: ["Frontend complete", "Error handling", "Validation"],
    deliverable: "Complete user workflow functional"
  },
  {
    name: "Production Ready",
    criteria: ["Security audit", "Performance optimization", "Documentation"],
    deliverable: "Deployment-ready application"
  }
];
```

### 1.4 Opinionated Framework Rules

The system enforces a strict set of architectural patterns and development practices to ensure consistency and quality across all generated applications.

**A. Mandated Architectural Decisions**

```typescript
const REQUIRED_PATTERNS = {
  dataModel: 'shared/schema.ts with Drizzle + Zod',
  apiValidation: 'Zod schemas for all requests',
  frontend: 'React + TypeScript with shadcn/UI',
  stateManagement: 'TanStack Query for server state',
  storage: 'IStorage interface with memory implementation',
  routing: 'Wouter for lightweight client routing'
}
```

**B. Code Organization Rules (MUST FOLLOW)**

- Put shared types in `shared/schema.ts`
- Use `createInsertSchema` from drizzle-zod
- Keep routes thin, logic in storage layer
- All forms use react-hook-form + zodResolver
- Always add data-testid attributes
- Parallel tool calls when operations are independent

**C. User Experience Mandates**

```typescript
const UX_REQUIREMENTS = {
  loadingStates: 'Show for all async operations',
  errorHandling: 'User-friendly messages, not technical',
  validation: 'Real-time with helpful feedback',
  accessibility: 'Proper labels and semantic HTML',
  mobile: 'Responsive design required'
}
```

**D. Content Simplification Rules**

```typescript
const SIMPLIFICATION_RULES = {
  legalJargon: {
    'Use-Based Application (Section 1(a))': 'Already Using Your Trademark',
    'Intent-to-Use Application (Section 1(b))': 'Planning to Use Your Trademark',
    'Standard Character Mark': 'Text Only (Standard)',
    'Stylized/Design Mark': 'Logo or Special Design (Stylized)'
  },
  addExamples: true,
  useAnalogies: true,
  provideBenefits: true
}
```

**E. Multi-File Enhancement Strategy**

```typescript
// Systematic content improvement across multiple files
const FILES_TO_UPDATE = [
  'filing-basis-step.tsx',
  'mark-info-step.tsx', 
  'applicant-info-step.tsx',
  'goods-services-step.tsx',
  'review-submit-step.tsx',
  'dashboard.tsx'
]

// Parallel edits for efficiency
Promise.all(FILES_TO_UPDATE.map(file => 
  multi_edit(file, simplificationEdits)
))
```

## 2. Development Methodology

### 2.1 Core Development Loop

The system follows a systematic Plan → Write → Run → Observe → Fix cycle:

**Phase 1: PLAN (Schema-First Design)**

```typescript
interface PlanningPhase {
  dataModeling: 'Define database schema and types first';
  apiDesign: 'Plan REST endpoints and validation';
  componentStructure: 'Map out UI component hierarchy';
  dependencyMapping: 'Identify what needs what';
}
```

Always start with data models and interfaces:
1. Database schema in shared/schema.ts
2. Storage interface in server/storage.ts
3. API endpoint structure
4. Component tree planning

**Phase 2: WRITE (Parallel Implementation)**

```typescript
const writingStrategy = {
  backend: 'Storage interface → API routes → validation',
  frontend: 'Components → hooks → integration',
  parallel: 'Independent files written simultaneously'
};
```

Writing Pattern:
1. **Data Layer First**: Schema, types, storage interface
2. **API Layer**: Routes with validation and error handling
3. **UI Layer**: Components with forms and state management
4. **Integration**: Connect frontend to backend with proper error handling

**Phase 3: RUN (Continuous Validation)**

Monitor throughout development:
- Restart development server after changes
- Watch console logs for errors
- Check TypeScript compilation status
- Verify API endpoints respond correctly

**Phase 4: OBSERVE (Multi-Layer Diagnostics)**

```typescript
const observationSources = {
  lspDiagnostics: 'TypeScript errors, lint warnings',
  consoleLogs: 'Runtime errors, API responses',
  networkRequests: 'API status codes, response data',
  uiRendering: 'Component errors, layout issues'
};
```

**Phase 5: FIX (Immediate Error Resolution)**

```typescript
const fixingPriority = [
  'compilation_errors',     // TypeScript issues block everything
  'runtime_errors',        // JavaScript errors break functionality
  'api_failures',          // Backend issues prevent frontend work
  'ui_issues',            // Layout and interaction problems
  'performance_issues'     // Optimization after functionality works
];
```

**Critical Rule**: Never move to next feature until current errors are resolved.

### 2.2 Micro & Macro Iteration Cycles

**The Micro-Loop (Every 5-10 minutes)**

Rapid iteration cycle:
1. Write code changes (1-3 files)
2. Check compilation (LSP diagnostics)  
3. Restart server if needed
4. Test functionality (manual or API)
5. Fix any errors immediately
6. Commit progress (mental checkpoint)

**Continuous Validation:**
- **Type Safety**: Fix TypeScript errors immediately
- **Runtime Validation**: Monitor console for API errors
- **User Experience**: Test critical user flows
- **Performance**: Check for slow API responses

**The Macro-Loop (Every 30-60 minutes)**

Feature completion cycle:
1. Complete functional feature
2. End-to-end testing
3. Error boundary testing
4. User experience validation
5. Performance check
6. Move to next feature

**Quality Gates:**
- All TypeScript compilation passes
- All API endpoints return correct data
- Frontend renders without errors
- User workflow works end-to-end
- No console errors or warnings

### 2.3 Error-Driven Development Pattern

**Systematic Error Resolution:**

```typescript
const errorResolution = {
  immediate: 'Compilation errors, syntax errors',
  blocking: 'API failures, missing dependencies',
  functional: 'Logic errors, incorrect behavior',
  experiential: 'UX issues, performance problems',
  polish: 'Styling issues, minor improvements'
};
```

**Example Error Resolution Sequence:**
1. **Detect error**: LSP Error: Property 'onCheckedChange' expects boolean, got CheckedState
2. **Locate in codebase**: File: client/src/components/wizard/review-submit-step.tsx
3. **Fix immediately**: `onCheckedChange={(checked) => setDeclaration(checked === true)}`
4. **Verify fix**: TypeScript compilation ✓, Component renders ✓, Functionality works ✓

### 2.4 The "Never Broken" Principle

**Continuous Functionality:**

```typescript
const workingState = {
  compilation: 'Always compiles without errors',
  server: 'Always starts and serves requests',
  frontend: 'Always renders basic functionality',
  workflow: 'Critical user paths always work'
};
```

**Progressive Enhancement:**
- Start with basic functionality working
- Add features incrementally
- Maintain working state at each step
- Never break existing functionality

### 2.5 Decision Making Framework

The system follows a clear hierarchy for making architectural and implementation decisions during development.

**Priority Matrix:**

1. **User Safety** (legal compliance, security)
2. **User Experience** (simplicity, clarity) 
3. **Technical Excellence** (best practices, performance)
4. **Feature Completeness** (functionality, edge cases)

**Architecture Decision Hierarchy:**

```typescript
// Every choice follows this hierarchy
if (user_explicitly_requested) {
  implement_exactly_as_requested()
} else if (better_ux_alternative_exists) {
  propose_and_implement_improvement()
} else if (technical_best_practice_differs) {
  follow_technical_standard()
}
```

**Decision Criteria Examples:**

```typescript
const decisionExamples = {
  userSafety: 'Choose PostgreSQL over file storage for financial data',
  userExperience: 'Simplify "Use-Based Application" to "Already Using Your Trademark"',
  technicalExcellence: 'Use TypeScript over JavaScript for type safety',
  featureCompleteness: 'Add error handling before considering feature complete'
}
```

### 2.6 Checkpoint & Progress System

The system maintains systematic progress tracking and recovery points throughout development.

**Important Reality Check:**
The system does NOT generate formal build task graphs with JSON dependencies. Instead, it uses conceptual task tracking with standard build tools handling their own dependency resolution.

**Automatic Commits Strategy:**

```bash
# At every major milestone
git add .
git commit -m "Implement trademark filing wizard with plain English UX"
# Automatic rollback points created
```

**Progress Tracking Implementation:**

```typescript
// Simple task list system for feature planning - NOT build orchestration
write_task_list([
  { id: 1, content: 'Research USPTO requirements', status: 'completed' },
  { id: 2, content: 'Fix compilation errors', status: 'completed' },
  { id: 3, content: 'Simplify legal terminology', status: 'completed' },
  { id: 4, content: 'Add USPTO API integration', status: 'in_progress' }
])
```

**What Standard Tools Handle Instead:**

```typescript
const buildDependencies = {
  moduleResolution: 'Vite/TypeScript automatically resolves import dependencies',
  assetBundling: 'Vite creates optimized bundles with code splitting',
  cssProcessing: 'Tailwind + PostCSS handle style dependencies',
  typeChecking: 'TypeScript ensures compile-time dependency validation'
};
```

**Conceptual vs Actual Dependencies:**

```typescript
// Conceptual dependency relationship (not stored as JSON):
const featureDependencies = {
  "api-setup": {
    dependencies: [],
    blocks: ["data-integration", "external-services"]
  },
  "data-integration": {
    dependencies: ["api-setup"],
    blocks: ["user-features"]
  },
  "user-features": {
    dependencies: ["data-integration"],
    blocks: []
  }
};

// But tracked mentally, not in formal task graphs:
const actualTaskTracking = {
  method: 'Sequential feature development with logical ordering',
  storage: 'Task list tool for status tracking only',
  dependencies: 'Implicit based on domain knowledge',
  coordination: 'Manual prioritization and sequencing'
};
```

**Quality Gates Before Each Checkpoint:**

- All TypeScript compilation passes
- Server starts without errors
- Critical user workflows function
- Error states handled gracefully
- Performance within acceptable limits

**Recovery Strategy:**

```typescript
const recoveryPlan = {
  rollbackPoints: 'Automatic commits at each milestone',
  errorRecovery: 'Immediate fixes before proceeding',
  stateValidation: 'Systematic checks before advancement',
  progressPersistence: 'Task lists maintained across sessions'
}
```

## 3. Architecture & Technology Stack

### 3.1 File Organization Philosophy

**Domain-Driven Structure:**

```
project/
├── shared/           # Types, schemas, utilities used by both frontend/backend
├── server/           # Backend: API routes, business logic, data access
├── client/           # Frontend: UI components, pages, state management
└── config/           # Build tools, environment, deployment settings
```

**Reasoning:**
- **Clear Separation**: Frontend and backend completely separated
- **Shared Logic**: Common types and validation in one place
- **Scalability**: Easy to find and modify related functionality

**Organization Strategy Based on Complexity:**

```typescript
const organizationStrategy = {
  simple: 'Layer-based (components/, pages/, utils/)',
  complex: 'Feature-based (auth/, billing/, reporting/)',
  hybrid: 'Domain folders with layer subfolders'
};
```

**Component Architecture Principles:**

```typescript
const componentStrategy = {
  reusability: 'ui/ folder for generic components',
  specificity: 'Feature folders for domain components',
  composition: 'Small, focused, composable components',
  coLocation: 'Related files stay together'
};
```

### 3.2 Frontend Stack Defaults

**Core Framework: React + TypeScript**

```typescript
interface ReactChoice {
  ecosystem: 'Massive component library ecosystem (shadcn, Radix, etc.)';
  hiring: 'Largest developer pool for team scaling';
  patterns: 'Well-established patterns for complex UIs';
  tooling: 'Excellent dev tools and debugging experience';
  flexibility: 'Works for simple sites to complex applications';
}
```

**TypeScript Benefits:**
- **Catch Errors Early**: Prevents runtime bugs during development
- **Better Developer Experience**: Autocomplete, refactoring, navigation
- **Self-Documenting**: Types serve as inline documentation
- **Shared Types**: Same types used across frontend/backend boundaries

**Routing: Wouter (Lightweight Client-Side)**

```typescript
const routerComparison = {
  wouter: {
    size: '2.8kb vs 44kb+ for React Router',
    simplicity: 'Hooks-based, minimal API surface',
    performance: 'No unnecessary re-renders',
    flexibility: 'Easy to customize and extend'
  },
  reactRouter: {
    features: 'More built-in features (lazy loading, data fetching)',
    ecosystem: 'Larger community and plugins',
    complexity: 'More concepts to learn and maintain'
  }
};
```

**State Management: TanStack Query + React State**

**Server State: TanStack Query**

```typescript
interface ServerStateReasoning {
  caching: 'Automatic background refetching and cache invalidation';
  devtools: 'Excellent debugging tools for API state';
  patterns: 'Standardized loading, error, and success states';
  performance: 'Automatic deduplication and request optimization';
}
```

**Client State: React's Built-in State**

```typescript
const clientStateStrategy = {
  useState: 'Component-local state (form inputs, UI toggles)',
  useReducer: 'Complex local state with multiple actions',
  useContext: 'Shared state across component tree (theme, user prefs)',
  customHooks: 'Reusable stateful logic'
};
```

**Why Not Redux/Zustand:**
- TanStack Query handles 80% of state needs (server data)
- React state handles remaining local UI state effectively
- Simpler Mental Model: Fewer concepts and patterns to learn
- Less Boilerplate: Direct state updates without actions/reducers

**Styling: Tailwind CSS + shadcn/UI**

```typescript
interface TailwindBenefits {
  speed: 'Rapid prototyping and development';
  consistency: 'Design system built into class names';
  maintenance: 'No CSS file growth over time';
  responsiveness: 'Mobile-first responsive design patterns';
  customization: 'Easy theming and design token management';
}
```

**shadcn/UI Benefits:**

```typescript
const shadcnAdvantages = {
  'copy-paste architecture': 'Own the code, customize freely',
  'accessibility first': 'Built on Radix UI primitives',
  'design consistency': 'Professional design system out of box',
  'customization': 'Easy to modify and extend components'
};
```

**Build Tooling: Vite**

```typescript
const viteBenefits = {
  speed: 'Instant HMR during development',
  simplicity: 'Zero-config TypeScript and JSX support',
  modern: 'ES modules and modern JavaScript features',
  plugins: 'Rich ecosystem for additional functionality'
};
```

### 3.3 Backend Stack Selection

**Runtime: Node.js + TypeScript**

```typescript
interface NodeJSBenefits {
  languageUnification: 'Same language (TypeScript) for frontend and backend';
  ecosystem: 'Massive npm package ecosystem for any functionality';
  performance: 'Event-driven, non-blocking I/O for web applications';
  deployment: 'Simple deployment story on most platforms';
  teamEfficiency: 'Frontend developers can work on backend code';
}
```

**Runtime Performance Considerations:**

```typescript
const nodeJSStrengths = {
  'I/O heavy workloads': 'Database queries, API calls, file operations',
  'real-time applications': 'WebSockets, Server-Sent Events',
  'rapid prototyping': 'Fast iteration and development cycles',
  'JSON processing': 'Native JSON handling without serialization overhead'
};
```

**Web Framework: Express.js**

```typescript
interface ExpressAdvantages {
  maturity: '13+ years in production, battle-tested at scale';
  ecosystem: 'Largest middleware ecosystem for any functionality';
  flexibility: 'Unopinionated - build exactly what you need';
  simplicity: 'Minimal learning curve, clear request/response model';
  debugging: 'Excellent debugging tools and logging capabilities';
}
```

**Express Middleware Benefits:**

```typescript
const middlewareEcosystem = {
  authentication: 'Passport.js for auth strategies',
  validation: 'Custom Zod validation middleware',
  logging: 'Morgan, Winston, or custom logging',
  security: 'Helmet, CORS, rate limiting',
  sessions: 'Express-session with PostgreSQL storage'
};
```

**Alternative Frameworks Considered:**

```typescript
const frameworkComparison = {
  express: {
    pros: ['Mature ecosystem', 'Flexible', 'Large community'],
    cons: ['Manual setup', 'Not opinionated'],
    bestFor: 'REST APIs, custom architectures, team learning'
  },
  fastify: {
    pros: ['Higher performance', 'Built-in validation', 'TypeScript first'],
    cons: ['Smaller ecosystem', 'Different patterns'],
    bestFor: 'Performance-critical APIs, TypeScript-heavy teams'
  },
  nextjs_api: {
    pros: ['Unified frontend/backend', 'Deployment simplicity'],
    cons: ['Tied to React', 'Less API flexibility'],
    bestFor: 'Full-stack React apps, rapid prototyping'
  }
};
```

### 3.4 Database & ORM Strategy

**Database Choice: PostgreSQL**

```typescript
interface DatabaseDecision {
  postgresql: 'Complex queries, ACID compliance, JSON support';
  drizzleOrm: 'Type safety, SQL-like syntax, migration management';
  prisma: 'Generated types, great DX, GraphQL integration';
  typeorm: 'Decorator-based, traditional ORM patterns';
}
```

**Stack Reasoning:**
- **PostgreSQL**: Enterprise-grade reliability for complex data
- **Drizzle ORM**: Type safety without code generation overhead
- **Serverless Compatible**: Works with serverless PostgreSQL providers

### 3.5 Development Server Architecture

The system uses a **single-process architecture** where frontend and backend run together, not as separate processes.

**Single Process Setup:**

Frontend and backend run in **ONE process** - not two separate processes.

**Development Commands:**

```bash
# Primary command
npm run dev
# Executes: NODE_ENV=development tsx server/index.ts

# Alternative commands  
npm run build  # Vite builds client + TypeScript compiles server
npm start      # NODE_ENV=production node dist/index.js
npm run check  # TypeScript compilation check
```

**Port Configuration:**

```typescript
// Single port serves everything
const port = parseInt(process.env.PORT || '5000', 10);
server.listen({
  port,           // Default: 5000
  host: "0.0.0.0",
  reusePort: true,
});

// Port 5000 serves:
// ✅ API endpoints (/api/*)
// ✅ Frontend React app (all other routes)  
// ✅ Static assets
// ✅ HMR WebSocket connections
```

**Vite Middleware Integration (No Proxy Needed):**

```typescript
// server/vite.ts - Vite runs as Express middleware
export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,  // Key: Vite runs as Express middleware
      hmr: { server },       // HMR through same HTTP server
      allowedHosts: true,
    },
    appType: "custom",
  });
  app.use(vite.middlewares);  // Vite middleware handles frontend
}
```

**Route Handling Order:**

```typescript
// server/index.ts execution order:
1. Express JSON/URL parsing middleware
2. API request logging middleware  
3. API routes registration (/api/*)
4. Error handling middleware
5. Vite middleware (development) OR static files (production)
6. Catch-all route (*) for React SPA
```

**Development vs Production Differences:**

```typescript
// Development mode (npm run dev)
if (app.get("env") === "development") {
  await setupVite(app, server);  // Vite middleware with HMR
} else {
  serveStatic(app);             // Serve pre-built static files
}
```

**Development Features:**
- **HMR**: Hot module replacement through Vite middleware
- **Live Reloading**: Index.html refreshed with cache-busting
- **Source Maps**: Full TypeScript debugging support
- **API Logging**: Request/response logging for /api/* endpoints

**Production Mode:**
- **Static Files**: Serves pre-built files from dist/public/
- **No HMR**: No development middleware
- **Optimized Bundles**: Minified and optimized assets

**Request Flow:**

```
http://localhost:5000/api/applications
├── Express API routes (returns JSON)

http://localhost:5000/dashboard  
├── Vite middleware (development)
├── React Router handles client-side routing
├── Returns rendered React app

http://localhost:5000/static/app.js
├── Vite middleware serves bundled JS
├── HMR updates applied automatically
```

### 3.6 Storage Layer Implementation

The system uses an abstract storage interface that enables seamless switching between in-memory and PostgreSQL storage with a single line change.

**IStorage Interface Pattern:**

```typescript
// server/storage.ts
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Application CRUD
  getTrademarkApplication(id: string): Promise<TrademarkApplication | undefined>;
  getTrademarkApplicationsByUser(userId: string): Promise<TrademarkApplication[]>;
  createTrademarkApplication(application: InsertTrademarkApplication): Promise<TrademarkApplication>;
  updateTrademarkApplication(id: string, updates: UpdateTrademarkApplication): Promise<TrademarkApplication | undefined>;
  
  // Domain-specific operations
  submitTrademarkApplication(id: string): Promise<TrademarkApplication | undefined>;
  searchClassifications(query: string): Promise<ClassificationEntry[]>;
  getClassification(classNumber: number): Promise<ClassificationEntry | undefined>;
}
```

**The One-Line Storage Switch:**

```typescript
// server/storage.ts - Line 175
// FROM (Development):
export const storage = new MemStorage();

// TO (Production):
export const storage = new PostgresStorage();
```

**PostgresStorage Implementation:**

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, ilike, or } from "drizzle-orm";

export class PostgresStorage implements IStorage {
  private db;
  
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }
  
  async createTrademarkApplication(application: InsertTrademarkApplication): Promise<TrademarkApplication> {
    const result = await this.db.insert(trademarkApplications).values(application).returning();
    return result[0];
  }
  
  async updateTrademarkApplication(id: string, updates: UpdateTrademarkApplication): Promise<TrademarkApplication | undefined> {
    const result = await this.db.update(trademarkApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trademarkApplications.id, id))
      .returning();
    return result[0];
  }
  
  async searchClassifications(query: string): Promise<ClassificationEntry[]> {
    const queryPattern = `%${query.toLowerCase()}%`;
    return await this.db.select().from(classificationDatabase)
      .where(
        or(
          ilike(classificationDatabase.title, queryPattern),
          ilike(classificationDatabase.description, queryPattern)
        )
      );
  }
}
```

**Migration Commands:**

```bash
# Primary migration command
npm run db:push

# Alternative Drizzle commands
npx drizzle-kit generate    # Generate migration files
npx drizzle-kit migrate     # Apply migrations  
npx drizzle-kit push        # Push schema directly (faster for development)
npx drizzle-kit introspect  # View current schema
```

**Example Migration File:**

```sql
-- migrations/0001_initial_schema.sql
-- Generated by Drizzle Kit

CREATE TABLE IF NOT EXISTS "trademark_applications" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "filing_basis" text NOT NULL,
  "mark_text" text NOT NULL,
  "goods_services" json NOT NULL,
  "specimens" json,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "submitted_at" timestamp
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "trademark_applications_user_id_idx" ON "trademark_applications" ("user_id");
CREATE INDEX IF NOT EXISTS "trademark_applications_status_idx" ON "trademark_applications" ("status");
```

**Complete Switch Process:**

```bash
# 1. Ensure DATABASE_URL is configured
echo $DATABASE_URL

# 2. Push schema to database  
npm run db:push

# 3. Update storage.ts line 175
# Change: export const storage = new MemStorage();
# To:     export const storage = new PostgresStorage();

# 4. Restart the application
# The workflow will restart automatically
```

**Benefits of This Pattern:**
- **Zero API changes**: Both implementations use same IStorage interface
- **Seamless transition**: Development to production with single line change
- **Type safety**: Full TypeScript coverage across both implementations
- **Easy testing**: Can switch back to MemStorage for testing
- **Clear abstraction**: Business logic separated from persistence details

## 4. API Design & Data Contracts

### 4.1 Schema-First Design

**Single Source of Truth Pattern:**

```typescript
// Always start with the data model in shared/schema.ts
export const trademarkApplications = pgTable("trademark_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull().default("draft"),
  filingBasis: text("filing_basis").notNull(), // use-based, intent-to-use
  // ... complete domain model
});

// Generate validation schemas and TypeScript types automatically
export const insertTrademarkApplicationSchema = createInsertSchema(trademarkApplications).omit({
  id: true,
  applicationNumber: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
});

export type TrademarkApplication = typeof trademarkApplications.$inferSelect;
export type InsertTrademarkApplication = z.infer<typeof insertTrademarkApplicationSchema>;
```

**Benefits:**
- Single source of truth for data structure
- Automatic validation schema generation
- Type safety across frontend and backend
- Database schema and API contracts stay in sync

**Storage Interface Abstraction:**

```typescript
// Define clear interfaces before implementation
export interface IStorage {
  // CRUD operations with explicit return types
  getTrademarkApplication(id: string): Promise<TrademarkApplication | undefined>;
  getTrademarkApplicationsByUser(userId: string): Promise<TrademarkApplication[]>;
  createTrademarkApplication(application: InsertTrademarkApplication): Promise<TrademarkApplication>;
  updateTrademarkApplication(id: string, updates: UpdateTrademarkApplication): Promise<TrademarkApplication | undefined>;

  // Domain-specific operations
  submitTrademarkApplication(id: string): Promise<TrademarkApplication | undefined>;
  searchClassifications(query: string): Promise<ClassificationEntry[]>;
}
```

### 4.2 RESTful Patterns

**Resource-Oriented Endpoints:**

```typescript
// Trademark Applications Resource
app.get("/api/applications", async (req, res) => {          // List applications
app.post("/api/applications", async (req, res) => {         // Create application
app.get("/api/applications/:id", async (req, res) => {      // Get specific application
app.patch("/api/applications/:id", async (req, res) => {    // Update application
app.post("/api/applications/:id/submit", async (req, res) => { // Submit application (action)

// Classifications Resource
app.get("/api/classifications/search", async (req, res) => { // Search classifications
app.get("/api/classifications/:classNumber", async (req, res) => { // Get classification
```

**HTTP Method Selection Strategy:**

```typescript
const httpMethodStrategy = {
  GET: 'Safe, idempotent operations - retrieving data',
  POST: 'Non-idempotent operations - creating resources or actions',
  PATCH: 'Partial updates to existing resources',
  PUT: 'Complete resource replacement (not used in current design)',
  DELETE: 'Resource removal (not implemented yet in this app)'
};
```

**Domain-Driven Endpoint Organization:**

```typescript
const apiStructure = {
  '/api/applications': 'Trademark application lifecycle management',
  '/api/classifications': 'USPTO classification database operations',
  '/api/users': 'User management (future implementation)',
  '/api/auth': 'Authentication and session management (future)'
};
```

### 4.3 Type Safety & Validation

**Request Validation Pipeline:**

```typescript
app.post("/api/applications", async (req, res) => {
  try {
    // Validate request body against schema
    const validatedData = insertTrademarkApplicationSchema.parse({
      ...req.body,
      userId: "demo-user" // Inject from auth context
    });

    const application = await storage.createTrademarkApplication(validatedData);
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: "Invalid application data", error });
  }
});
```

**Multi-Layer Validation:**

```typescript
const validationLayers = {
  schema: 'Zod runtime validation against TypeScript types',
  business: 'Domain-specific validation rules',
  authorization: 'User permissions and ownership checks',
  persistence: 'Database constraints and integrity checks'
};
```

**Frontend Type Safety:**

```typescript
// Frontend gets automatic type inference
const { data: applications } = useQuery({
  queryKey: ['/api/applications'],
  queryFn: () => apiRequest('GET', '/api/applications')
});
// data is automatically typed as TrademarkApplication[]

// Form submission with type safety
const createApplication = useMutation({
  mutationFn: (data: InsertTrademarkApplication) =>
    apiRequest('POST', '/api/applications', data)
});
```

**Form Integration with API Types:**

```typescript
// Forms use same validation schemas as API
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrademarkApplicationSchema } from "@shared/schema";

function ApplicationForm() {
  const form = useForm<InsertTrademarkApplication>({
    resolver: zodResolver(insertTrademarkApplicationSchema.extend({
      // Add frontend-specific validation
      confirmEmail: z.string().email()
    })),
    defaultValues: {
      filingBasis: "use-based",
      markType: "standard",
      // ... type-safe defaults
    }
  });

  const onSubmit = form.handleSubmit((data) => {
    // data is fully typed as InsertTrademarkApplication
    createApplication.mutate(data);
  });
}
```

### 4.4 API Documentation

**Self-Documenting Interfaces:**

```typescript
// Types serve as API documentation
interface TrademarkApplicationAPI {
  'GET /api/applications': { response: TrademarkApplication[] };
  'POST /api/applications': { body: InsertTrademarkApplication; response: TrademarkApplication };
  'GET /api/applications/:id': { response: TrademarkApplication | 404 };
  'PATCH /api/applications/:id': { body: UpdateTrademarkApplication; response: TrademarkApplication };
}
```

**Schema-Driven Documentation:**

```typescript
const documentationBenefits = {
  typeDefinitions: 'TypeScript interfaces document expected structure',
  zodSchemas: 'Runtime validation rules serve as input specifications',
  errorTypes: 'Consistent error handling provides predictable responses',
  domainModels: 'Database schema reflects business domain concepts'
};
```

## 5. Quality Assurance

### 5.1 Testing Methodology

**Multi-Layer Testing Strategy:**

**1. Static Analysis (Compile-Time Testing)**

```typescript
const staticChecks = {
  typeScript: 'All type definitions correct and imports resolved',
  syntax: 'Valid JavaScript/TypeScript syntax throughout',
  imports: 'All module imports exist and are accessible',
  schemas: 'Zod validation schemas match database types',
  eslint: 'Code quality and style consistency'
};
```

**2. Runtime Validation (Server Startup Testing)**

Every code change triggers:
1. TypeScript compilation check
2. Server restart verification
3. Port binding confirmation
4. API endpoint health check
5. Console log monitoring

**API Layer Testing:**

```typescript
const apiTesting = {
  requestValidation: 'POST /api/applications with valid data',
  responseFormat: 'Correct JSON structure returned',
  errorHandling: 'Invalid requests return proper 400/500 errors',
  statusCodes: 'Appropriate HTTP status codes',
  dataTypes: 'Response matches TypeScript interfaces'
};
```

**Frontend Component Testing:**

```typescript
const frontendTesting = {
  componentMount: 'React components render without errors',
  formValidation: 'Form submissions work with proper validation',
  stateManagement: 'React Query and local state updates correctly',
  navigation: 'Routing between pages functions properly',
  userInteraction: 'Buttons, inputs, and forms respond correctly'
};
```

**Integration Testing (End-to-End Workflows):**

```typescript
const userFlowTests = [
  'Dashboard loads and displays applications',
  'Filing wizard progresses through all steps',
  'Form validation prevents invalid submissions',
  'Auto-save functionality preserves data',
  'Classification search returns relevant results',
  'Application submission creates proper records'
];
```

**Performance Testing:**

```typescript
const performanceChecks = {
  apiResponseTime: 'API calls complete within 100ms for simple operations',
  pageLoadSpeed: 'Frontend renders within 2 seconds',
  databaseQueries: 'Database operations complete quickly',
  bundleSize: 'JavaScript bundles load efficiently',
  memoryUsage: 'No memory leaks in long-running operations'
};
```

### 5.2 Debugging & Error Detection

**Multi-Source Error Detection:**

```typescript
interface ErrorDetectionSources {
  compilation: 'TypeScript compiler errors and warnings';
  runtime: 'Server console logs and JavaScript exceptions';
  network: 'API request/response failures and timeouts';
  browser: 'Frontend rendering errors and console messages';
  database: 'SQL query failures and connection issues';
}
```

**Error Classification Strategy:**

```typescript
const errorCategories = {
  critical: 'Server won\'t start, compilation failures',
  blocking: 'API endpoints return 500 errors, frontend crashes',
  functional: 'Features work incorrectly, validation failures',
  cosmetic: 'UI styling issues, minor UX problems',
  performance: 'Slow responses, memory leaks'
};
```

**Debug Priority Framework:**

```typescript
const debuggingPriority = [
  'compilation_errors',    // Fix immediately - blocks all development
  'server_startup_issues', // Fix immediately - no functionality works
  'api_failures',         // Fix before frontend work
  'frontend_crashes',     // Fix before user testing
  'validation_errors',    // Fix before feature completion
  'styling_issues'        // Fix during polish phase
];
```

**Systematic Debugging Process:**

```typescript
const debuggingSteps = [
  'reproduce_error_consistently',
  'identify_error_source_layer',
  'examine_recent_code_changes',
  'check_related_dependencies',
  'validate_data_flow_integrity',
  'test_isolated_components',
  'implement_targeted_fix',
  'verify_fix_resolves_issue'
];
```

### 5.3 Performance Monitoring

**Performance Debugging:**

```typescript
const performanceDebugging = {
  slowQueries: 'Identify and optimize database query performance',
  bundleSize: 'Monitor and reduce JavaScript bundle size',
  apiLatency: 'Track and improve API response times',
  memoryLeaks: 'Detect and fix memory usage issues',
  renderPerformance: 'Optimize React component rendering'
};
```

**Key Performance Indicators:**
- API Response Times: GET /api/applications 304 in 2ms
- Bundle Size: ~500KB optimized JavaScript
- Memory Usage: Stable across user interactions
- Database Queries: <50ms for simple operations

### 5.4 Security Practices

**Secret Handling Protocol:**

```typescript
const secretsStrategy = {
  never_hardcode: 'Always use environment variables for sensitive data',
  request_properly: 'Use secure methods to collect API keys',
  validate_access: 'Check secrets exist before using in code',
  document_requirements: 'Clear documentation of required secrets'
};
```

**Code Security Patterns:**

```typescript
export class APIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY;
    if (!this.apiKey) {
      throw new Error('API_KEY environment variable required');
    }
  }

  // Never log or expose the actual key
  public async makeRequest(data: any) {
    // Use key securely without logging
  }
}
```

**Security Testing:**

```typescript
const securityTests = {
  inputSanitization: 'SQL injection and XSS prevention',
  authenticationCheck: 'Protected routes require proper auth',
  dataValidation: 'All inputs validated against schemas',
  errorMessages: 'No sensitive information leaked in errors',
  sessionManagement: 'Secure session handling'
};
```

## 6. Development Toolkit

### 6.1 Code Management Tools

**File Operations:**
- **Read Files**: View any file in project, including source code, configs, and documentation
- **Write Files**: Create new files or completely overwrite existing ones
- **Edit Files**: Make precise changes to existing files with find-and-replace operations
- **Multi-Edit**: Make multiple changes to the same file in one operation for efficiency
- **List Directory**: Browse file structure and see what's in folders

**Code Search & Navigation:**
- **Search Codebase**: Find files, functions, classes, or patterns across entire project
- **Pattern Matching**: Find files matching specific patterns (like all .tsx files)
- **Content Search**: Search for text within files using powerful regex patterns

### 6.2 Environment Tools

**Development Environment:**
- **Restart Server**: Stop and start development server when needed
- **Monitor Status**: Check if services are running properly
- **Environment Setup**: Install programming languages and frameworks

**Package Management:**
- **Install Dependencies**: Add new libraries and packages to project
- **System Packages**: Install system-level tools and dependencies
- **Dependency Management**: Handle npm, pip, or other package managers

**Command Execution:**
- **Run Commands**: Execute any terminal/shell command (npm install, git commands, etc.)
- **Build Scripts**: Run build processes, tests, and deployment commands
- **System Operations**: File operations, process management, and system tasks

### 6.3 Integration Tools

**Code Quality & Debugging:**
- **Language Server**: Get real-time TypeScript, linting, and compilation errors
- **Code Analysis**: Identify syntax errors, type mismatches, and code issues
- **Quality Checks**: Ensure code meets standards before deployment

**Testing & Validation:**
- **Screenshot Capture**: See how app looks and verify it's working
- **Feedback Collection**: Get screenshots and ask for user verification
- **Progress Tracking**: Monitor completion status and get user confirmation

**External Integration:**
- **Web Search**: Research APIs, documentation, and current information
- **Content Retrieval**: Get full content from web pages and documentation
- **API Integration**: Integrate with third-party services and APIs

### 6.4 Automation Features

**Parallel Operations:**
- Multiple file reads simultaneously
- Batch file edits for consistency
- Concurrent package installations
- Parallel testing and validation

**Smart Dependencies:**
- Automatic workflow restarts after changes
- Integrated error detection and fixing
- Seamless database and file operations
- Coordinated frontend and backend development

## 7. Operational Strategies

### 7.1 Context & Memory Limits

**Conversation Memory Constraints:**

```typescript
interface ContextLimits {
  conversationMemory: 'Resets completely between sessions';
  workingMemory: 'Limited context window for processing large codebases';
  fileReading: 'Can read large files but may need chunking for analysis';
  codeGeneration: 'Large applications built incrementally, not all at once';
}
```

### 7.2 Fallback Strategies

**Context Management:**

```typescript
const contextFallbacks = {
  largeCodebases: 'Read files in focused chunks, use search tool for navigation',
  longConversations: 'Rely on project documentation for memory persistence',
  complexProjects: 'Break into smaller, manageable feature increments',
  codeReview: 'Focus on specific files/components rather than entire codebase'
};
```

**Framework Limitations:**

```typescript
const frameworkFallbacks = {
  unsupportedFrameworks: 'Recommend closest supported alternative with migration path',
  outdatedVersions: 'Update to latest stable version or suggest compatibility layer',
  conflictingDependencies: 'Identify conflicts and provide resolution strategies',
  customization: 'Manual setup using standard package management'
};
```

### 7.3 Framework Adaptations

**Decision-Making Process:**

```typescript
interface DecisionMatrix {
  team_expertise: 'What languages/frameworks does team know?';
  performance_needs: 'Expected traffic and response time requirements?';
  ecosystem_requirements: 'Need for specific libraries or integrations?';
  development_speed: 'How quickly does MVP need to be delivered?';
}
```

**Adaptation Strategies:**
- **Incremental Development**: Use caching and incremental compilation to reduce build times
- **Resource Optimization**: Break large builds into smaller, more manageable chunks
- **Clear Documentation**: Provide transparent communication about limitations
- **Alternative Approaches**: Pivot to solutions that achieve user goals within constraints

## 8. Implementation Runbook

### 8.1 Development Commands Reference

**package.json Scripts:**

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push"
  }
}
```

**Typical Development Flow:**

```bash
# First run (in-memory storage)
npm i
npm run dev

# Provision database (when ready)
# Set DATABASE_URL in environment
npm run db:push

# Switch storage in server/storage.ts line 175:
# FROM: export const storage = new MemStorage();
# TO:   export const storage = new PostgresStorage();

npm run dev    # App now has persistent storage
```

### 8.2 Definition of Done Checklist

**Foundation Requirements:**
- [ ] Repo scaffold with proper directory structure
- [ ] `shared/schema.ts` generates types for both client and server
- [ ] React TS + Vite + Wouter + Tailwind + shadcn/UI rendering
- [ ] Express TS server runs with Vite middleware on single port (5000)
- [ ] Server validates requests with Zod schemas

**Storage & Data:**
- [ ] `MemStorage` implementation working for development
- [ ] **One-line switch** to `PostgresStorage` after `npm run db:push`
- [ ] Migration files generated and applied successfully
- [ ] Database indexes created for performance

**API Implementation:**
- [ ] CRUD endpoints implemented for core entities
- [ ] Search endpoints return filtered data
- [ ] Error handling returns consistent JSON format
- [ ] Request/response validation with proper status codes

**Development Workflow:**
- [ ] Micro/macro development loops practiced
- [ ] Quality gates enforced per feature
- [ ] TypeScript compilation passes without errors
- [ ] Server starts and responds to requests
- [ ] Frontend renders without console errors

**Security & Environment:**
- [ ] Secrets managed via environment variables only
- [ ] Helmet + CORS middleware in place
- [ ] No sensitive data logged or committed
- [ ] Input validation and sanitization implemented

**Quality Assurance:**
- [ ] Smoke tests for key API routes
- [ ] Form validation wired correctly
- [ ] Error states display user-friendly messages
- [ ] Performance acceptable for target use cases

### 8.3 Project Bootstrap Structure

```
project/
├── replit.md                     # Project memory and decisions
├── shared/                       # Single source of truth
│   └── schema.ts                 # Database schema + Zod + Types
├── server/
│   ├── index.ts                  # Express entry point
│   ├── vite.ts                   # Vite middleware setup
│   └── storage.ts                # IStorage + implementations
├── client/
│   └── src/
│       ├── main.tsx, App.tsx
│       ├── components/{ui/, wizard/}
│       ├── hooks/, pages/, lib/
│       └── api/                  # Typed API calls
├── migrations/                   # Drizzle SQL migrations
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── .env.example
```

### 8.4 Environment Setup Requirements

**Required Environment Variables:**

```bash
# Development
NODE_ENV=development
PORT=5000

# Database (when ready for PostgreSQL)
DATABASE_URL=postgresql://username:password@host:port/database

# API Keys (as needed)
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

**Discovery Checklist:**

**Codebase Analysis:**
- [ ] Read `package.json` for dependencies and scripts
- [ ] Check `tsconfig.json` for TypeScript configuration  
- [ ] Examine `shared/schema.ts` for data models
- [ ] Review `server/storage.ts` for business logic patterns
- [ ] Analyze `client/src/App.tsx` for component architecture

**Project Memory:**
- [ ] Create/update `replit.md` with preferences and decisions
- [ ] Document architecture choices and stack decisions
- [ ] Record user feedback and UX improvements
- [ ] Track integration patterns and API limitations

**Environment State:**
- [ ] Verify `PORT` configuration and availability
- [ ] Check `DATABASE_URL` if using PostgreSQL
- [ ] Confirm package versions and dependency resolution
- [ ] Test server startup and API endpoint responses

### 8.5 Quality Gates by Phase

**Foundation Complete:**
- Database schema defined
- Basic API routes working
- Storage interface implemented
- TypeScript compilation passing

**Integration Ready:**
- External APIs configured (where applicable)
- Authentication placeholder ready
- File handling implemented (if needed)
- Error boundaries in place

**User Experience:**
- Complete user workflows functional
- Error handling with user-friendly messages
- Form validation working correctly
- Loading states for async operations

**Production Ready:**
- Security middleware configured
- Performance optimization completed
- Documentation updated
- Deployment configuration ready

## 9. Real-World Implementation Examples

### 8.1 USPTO Trademark Filing Application Case Study

**Initial Request**: "I want to create a web app that automates US trademark filings"

**Step-by-Step Implementation:**

**Phase 1: Research & Analysis (2 minutes)**
```bash
# Immediate web search for domain knowledge
webSearch("USPTO trademark filing requirements forms process 2025")

# Key findings that shaped architecture:
- USPTO switched to Trademark Center (consolidated system)
- Two filing types: Use-based vs Intent-to-Use
- Complex classification system required
- No public API for filing (read-only TSDR API only)
```

**Phase 2: Codebase Discovery (3 minutes)**
```typescript
// Systematic exploration revealed existing sophisticated stack:
const discoveredStack = {
  frontend: 'React 18 + TypeScript + Vite + Tailwind + shadcn/UI',
  backend: 'Express.js + TypeScript + Drizzle ORM',
  database: 'PostgreSQL with session management',
  existing: 'Multi-step wizard framework already present'
}

// Critical files examined:
- shared/schema.ts      // Found comprehensive trademark data model
- server/storage.ts     // In-memory storage with demo data  
- server/routes.ts      // RESTful API endpoints
- client/src/pages/filing-wizard.tsx // 5-step wizard structure
```

**Phase 3: Quality Assurance & Fixes (5 minutes)**
```typescript
// Issue 1: CSS compilation errors
find_all_instances('bg-muted/50') → replace_with('bg-muted')

// Issue 2: TypeScript type mismatch  
old: onCheckedChange={setDeclaration}
new: onCheckedChange={(checked) => setDeclaration(checked === true)}

// Systematic fixes across 6 files in parallel
```

**Phase 4: User Experience Enhancement (15 minutes)**
```typescript
// Feedback: "I don't understand the various terms"
const simplificationEdits = {
  'Use-Based Application (Section 1(a))': 'Already Using Your Trademark',
  'Intent-to-Use Application (Section 1(b))': 'Planning to Use Your Trademark', 
  'Standard Character Mark': 'Text Only (Standard)',
  'Stylized/Design Mark': 'Logo or Special Design (Stylized)'
}

// Multi-file content improvement
Promise.all([
  'filing-basis-step.tsx',
  'mark-info-step.tsx',
  'applicant-info-step.tsx', 
  'goods-services-step.tsx',
  'review-submit-step.tsx',
  'dashboard.tsx'
].map(file => multi_edit(file, simplificationEdits)))
```

**Phase 5: API Integration Research (5 minutes)**
```typescript
// Research findings:
const apiLimitations = {
  tsdrAPI: 'Read-only trademark status/search (60 requests/minute)',
  filingAPI: 'None available - USPTO policy restriction',
  solution: 'Guide users to official Trademark Center for submission'
}

// Integration plan:
const integrationPhases = [
  'Real trademark search via TSDR API',
  'Status tracking for existing applications', 
  'Classification data lookup',
  'Conflict checking against existing registrations'
]
```

**Final Result**: Complete trademark filing application with simplified terminology, real API integration where possible, and clear guidance for official submission.

### 8.2 LLM Fine-Tuning Platform Example

**Initial Request**: "I want to build an app that can be used to fine tune LLMs on private enterprise data"

**Phase 1: Domain Analysis**
```typescript
interface RequestAnalysis {
  domain: 'Machine Learning / AI Infrastructure'
  complexity: 'Very High' // ML pipelines, data processing, API integrations
  userType: 'Technical/Enterprise'
  riskFactors: ['Data Privacy', 'Security', 'Computational Resources', 'API Costs']
  businessModel: 'Enterprise SaaS'
}
```

**Phase 2: Research Results**
```typescript
// OpenAI Fine-tuning API Research
const openAIFindings = {
  supportedModels: ['gpt-4o-mini', 'gpt-3.5-turbo', 'davinci-002'],
  dataFormat: 'JSONL with system/user/assistant messages',
  pricing: '$8.00/1M training tokens, $24.00/1M input tokens',
  limits: 'Up to 10 concurrent fine-tuning jobs',
  validationSplit: 'Automatic 20% validation split recommended'
}

// Enterprise Security Requirements
const securityRequirements = {
  dataEncryption: 'AES-256 at rest, TLS 1.3 in transit',
  accessControl: 'Role-based permissions, audit logs',
  compliance: 'SOC2 Type II, GDPR, CCPA readiness'
}
```

**Phase 3: Architecture Design**
```typescript
// Required additional components beyond standard stack
interface LLMArchitecture {
  fileStorage: 'File upload handling + S3-compatible storage'
  jobQueue: 'Background job processing for training'
  apiIntegrations: 'OpenAI, Anthropic, HuggingFace clients'
  dataProcessing: 'JSONL validation and transformation'
  monitoring: 'Training progress tracking and alerts'
  security: 'API key management and encryption'
  billing: 'Usage tracking and cost estimation'
}
```

**Phase 4: Database Schema**
```typescript
// Core entities needed
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: varchar("owner_id").notNull(),
  settings: jsonb("settings").$type<ProjectSettings>()
});

export const finetuningJobs = pgTable("finetuning_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  provider: text("provider").notNull(), // 'openai', 'anthropic' 
  status: text("status").notNull(), // 'queued', 'running', 'completed'
  costEstimate: decimal("cost_estimate", { precision: 10, scale: 4 }),
  trainingProgress: jsonb("training_progress")
});
```

**Phase 5: Cost Estimation Component**
```typescript
// Critical enterprise feature - cost transparency
export function CostEstimator({ dataset, model, provider }) {
  const estimate = useMemo(() => {
    const baseTokens = dataset.rowCount * 150; // Average per example
    const trainingCost = (baseTokens / 1_000_000) * rates[model].training;
    const inferenceCost = (baseTokens / 1_000_000) * rates[model].input * 10;
    
    return { training: trainingCost, inference: inferenceCost };
  }, [dataset, model]);

  return (
    <Card className="p-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Total Estimate: ${(estimate.training + estimate.inference).toFixed(2)}
        </AlertDescription>
      </Alert>
    </Card>
  );
}
```

**Final Result**: Enterprise-grade LLM fine-tuning platform with team collaboration, cost management, real-time training progress, and multi-provider support.

### 8.3 Development Time Breakdown

**Typical Timeline for Complex Applications:**

```typescript
const developmentPhases = {
  'Research & Planning': '25% (6-8 minutes)',
  'Core Development': '50% (20-25 minutes)', 
  'Integration & Features': '20% (8-12 minutes)',
  'Testing & Polish': '5% (3-5 minutes)'
}

const qualityMandates = {
  'Production-ready codebase': 'Real API integrations, not mocks',
  'Enterprise-grade security': 'Team management, audit trails', 
  'Cost consciousness': 'Transparent pricing, budget controls',
  'Real-time monitoring': 'Progress tracking, notifications',
  'Accessibility': 'Mobile-responsive, semantic HTML',
  'Error handling': 'Comprehensive user feedback systems'
}
```

### 8.4 Key Success Patterns

**What Makes This Methodology Work:**

1. **Research-Driven Development**: Always understand the domain before coding
2. **Schema-First Architecture**: Start with data models, build everything around them  
3. **Progressive Enhancement**: Core functionality first, then UX improvements
4. **Cost Consciousness**: Show estimates for expensive operations
5. **Enterprise UX**: Team features, security, audit trails built-in
6. **Type Safety**: Full TypeScript coverage with runtime validation
7. **Real Integration**: Use actual APIs, not mock data
8. **User-Centric**: Prioritize clarity and usability over technical purity

**Common Failure Points Avoided:**
- Building without domain research
- Starting with UI before data model
- Ignoring cost implications  
- Technical terminology in user interfaces
- Mock integrations in production apps
- Breaking existing functionality during enhancement

---

This comprehensive guide provides the foundation for building an agentic web application factory with opinionated technology choices, systematic development processes, and robust quality assurance practices.