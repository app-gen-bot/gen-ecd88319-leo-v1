# Build Pipeline Agents Documentation

## Overview

This document outlines the multi-agent architecture for the Leonardo Build Pipeline, designed to transform `plan.md` + `preview-react/App.tsx` + generated `schema.ts` into a complete, production-ready web application.

## Analysis from Replit Todo App Generation

### File Generation Order (from screenshots)

**Screenshot 1 - Backend Foundation:**
1. ✅ `shared/schema.ts` - Database schema (Schema Generator Agent)
2. ✅ `server/storage.ts` - Storage layer implementation (Storage Generator Agent)
3. ✅ `server/routes.ts` - API routes (Routes Generator Agent)
4. ✅ `client/src/App.tsx` - Main app component (App Shell Generator Agent)

**Screenshot 2 - Frontend Components:**
5. ✅ `client/src/App.tsx` - Main app component (completed)
6. ✅ `client/src/pages/home.tsx` - Home page component (Main Page Generator Agent)
7. ✅ `client/src/components/task-form.tsx` - Form component (Component Generator Agent)

### File Classification

#### **Universal Files (Every App Needs)**
These files have predictable patterns and can use template-based generation:

1. **`shared/schema.ts`** ✅ *Already handled by Schema Generator Agent*
2. **`server/storage.ts`** - Storage interface & implementation
   - Adapts to schema entities
   - Standard CRUD operations
   - IStorage interface + MemStorage implementation
3. **`server/routes.ts`** - RESTful API routes
   - Adapts to schema entities and validation schemas
   - Standard CRUD endpoints with error handling
4. **`client/src/App.tsx`** - Application shell
   - Standard providers (QueryClient, Tooltip, Toaster)
   - Wouter routing setup
5. **`client/src/pages/home.tsx`** - Main page structure
   - React Query data fetching
   - Layout matching preview component

#### **App-Specific Files (Vary by Domain)**
These files require AI-driven generation based on app requirements:

6. `client/src/components/[entity]-form.tsx` - Forms for creating/editing
7. `client/src/components/[entity]-list.tsx` - List components
8. `client/src/components/[entity]-item.tsx` - Individual item components  
9. `client/src/components/[entity]-filters.tsx` - Filter/search controls

## Multi-Agent Architecture

### **Phase 1: Backend Agents (Template-Based)**

#### 1. Storage Generator Agent
- **Input**: `shared/schema.ts`
- **Output**: `server/storage.ts`
- **Strategy**: Template-based with AST parsing
- **Logic**:
  - Parse Drizzle schema to extract entities
  - Generate IStorage interface with methods for each entity
  - Implement MemStorage class with Map-based storage
  - Add proper type imports and error handling
  - Pattern: `get[Entity]()`, `get[Entity]s()`, `create[Entity]()`, etc.

#### 2. Routes Generator Agent  
- **Input**: `shared/schema.ts`, `server/storage.ts`
- **Output**: `server/routes.ts`
- **Strategy**: Template-based with schema analysis
- **Logic**:
  - Parse schema entities and validation schemas
  - Generate RESTful endpoints for each entity
  - Include Zod validation on POST/PATCH requests
  - Standard HTTP patterns with proper error responses
  - Pattern: GET `/api/[entity]s`, POST `/api/[entity]s`, etc.

### **Phase 2: Frontend Foundation Agents (Semi-Generic)**

#### 3. App Shell Generator Agent
- **Input**: `plan.md`, `preview-react/App.tsx`
- **Output**: `client/src/App.tsx`
- **Strategy**: Template with minor variations
- **Logic**:
  - Always includes QueryClientProvider, TooltipProvider, Toaster
  - Set up Wouter routing with NotFound fallback
  - Analyze plan to determine additional pages needed
  - Mostly static structure with standard providers

#### 4. Main Page Generator Agent
- **Input**: `plan.md`, `preview-react/App.tsx`, `shared/schema.ts`
- **Output**: `client/src/pages/home.tsx`
- **Strategy**: Pattern-based with AI assistance
- **Logic**:
  - Analyze preview component for layout structure
  - Set up React Query hooks for data fetching
  - Generate state management for filters/forms
  - Import necessary components (to be generated)
  - Match visual structure of preview

### **Phase 3: Component Generation (AI-Driven)**

#### 5. Component Analyzer Agent
- **Input**: `plan.md`, `preview-react/App.tsx`, `client/src/pages/home.tsx`
- **Output**: Component specification list
- **Strategy**: AI analysis of component boundaries
- **Logic**:
  - Analyze preview React for component boundaries
  - Identify forms, lists, items, filters, modals, etc.
  - Create component dependency tree
  - Determine props and interactions for each component

#### 6. Generic Component Generator Agent
- **Input**: Component spec, `shared/schema.ts`, preview patterns
- **Output**: Individual component files
- **Strategy**: Full AI generation with established patterns
- **Logic**:
  - Generate form components with react-hook-form + Zod validation
  - Generate list components with proper TypeScript typing
  - Generate item components with CRUD operation handlers
  - Use ShadCN UI components consistently
  - Follow established patterns from replit-todo reference

## Technical Implementation Strategy

### **Progressive Complexity**
1. **Templates First** - Use proven patterns for predictable files
2. **Pattern Recognition** - Semi-generic agents for common structures  
3. **AI Generation** - Full AI for creative, app-specific components

### **Validation Strategy**
Each agent should:
- Use MCP tools (oxc, build_test) to validate generated code compiles
- Check TypeScript types are correct
- Ensure imports resolve properly
- Validate against schema types

### **Error Handling**
- Each agent can fail independently
- Rollback capabilities for failed generations
- Clear error messages for debugging
- Fallback to placeholder templates if needed

### **Agent Integration**
- Extend existing `build_stage.py` to orchestrate agents
- Run agents sequentially (order matters!)
- Pass outputs between agents
- Proper workspace isolation

## File Generation Patterns

### **Storage Pattern**
```typescript
// Generated from schema with entities [Task, User, etc.]
export interface IStorage {
  // For each entity:
  getTask(id: string): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, updates: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
}
```

### **Routes Pattern**
```typescript
// Generated RESTful routes for each entity
app.get("/api/tasks", async (req, res) => {
  const tasks = await storage.getTasks();
  res.json(tasks);
});

app.post("/api/tasks", async (req, res) => {
  const validatedData = insertTaskSchema.parse(req.body);
  const task = await storage.createTask(validatedData);
  res.status(201).json(task);
});
```

### **Component Patterns**
```tsx
// Form Component Pattern
export default function TaskForm() {
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: InsertTask) => 
      apiRequest("POST", "/api/tasks", data),
    onSuccess: () => queryClient.invalidateQueries(["/api/tasks"])
  });
}
```

## Benefits of This Architecture

1. **Incremental Complexity** - Start simple, get more sophisticated
2. **Reusable Patterns** - Template-based agents work across all apps
3. **Quality Assurance** - Each agent validates its own output
4. **Maintainable** - Clear separation of concerns
5. **Extensible** - Easy to add new agent types
6. **Fast** - Templates are faster than full AI generation
7. **Reliable** - Proven patterns reduce errors

## Success Metrics

- **Coverage**: Generate 80%+ of application code automatically
- **Quality**: Generated code passes TypeScript compilation and linting
- **Consistency**: All generated apps follow same patterns and conventions
- **Speed**: Complete app generation in under 5 minutes
- **Maintainability**: Generated code is readable and follows best practices

This architecture transforms the Leonardo pipeline from "schema generator" to "complete application factory" while maintaining quality and reliability.