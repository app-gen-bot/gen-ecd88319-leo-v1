# Web Application Generator Patterns

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