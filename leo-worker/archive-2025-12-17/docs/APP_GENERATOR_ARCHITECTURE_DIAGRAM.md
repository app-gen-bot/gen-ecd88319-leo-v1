# App Generator Architecture Diagram

## High-Level Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER PROMPT                                      │
│              "Create a todo app with authentication"                     │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    run-app-generator.py                                  │
│  Parses args → Creates AppGeneratorAgent → Routes to generation path   │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
      ┌─────────────────┐      ┌──────────────────────┐
      │  NEW APP MODE   │      │  RESUME MODE         │
      │                 │      │                      │
      │ generate_app()  │      │ resume_generation()  │
      │                 │      │ resume_with_session()│
      └────────┬────────┘      └──────────┬───────────┘
               │                         │
               │                         ▼
               │              ┌──────────────────────┐
               │              │ Load App Session     │
               │              │ Validate UUID        │
               │              │ Create Checkpoint    │
               │              │ Switch CWD           │
               │              └──────────┬───────────┘
               │                         │
               └────────────┬────────────┘
                            │
                            ▼
      ┌──────────────────────────────────────────────────┐
      │  AppGeneratorAgent.__init__()                    │
      │  ├─ Load pipeline-prompt.md (50K+ chars)        │
      │  ├─ Initialize PromptExpander                    │
      │  ├─ Load Subagents (8 specialized agents)        │
      │  └─ Create Agent with 11+ MCP tools              │
      └──────────────────────┬───────────────────────────┘
                             │
                             ▼
      ┌──────────────────────────────────────────────────┐
      │  Prompt Expansion (if enabled)                   │
      │  Expands user request following best practices   │
      └──────────────────────┬───────────────────────────┘
                             │
                             ▼
      ┌──────────────────────────────────────────────────┐
      │  Run Agent with Session Support                  │
      │  System Prompt: pipeline-prompt.md               │
      │  User Prompt: Expanded generation request        │
      │  Max Turns: 50+                                  │
      └──────────────────────┬───────────────────────────┘
                             │
                             ▼
      ╔════════════════════════════════════════════════════════════════════════╗
      ║           AGENT EXECUTES PIPELINE-PROMPT.MD STAGES                     ║
      ║                (All stages automatic)                                  ║
      ╚════════════════════════════════════════════════════════════════════════╝
                             │
                             ▼
      ┌────────────────────────────────────────────────────┐
      │  STAGE 1: PLAN CREATION                            │
      │  ├─ Agent analyzes user request                    │
      │  ├─ Creates: plan/plan.md                          │
      │  │   ├─ Features & requirements                    │
      │  │   ├─ Entity definitions                         │
      │  │   ├─ User workflows                             │
      │  │   └─ API specifications                         │
      │  └─ Returns plan content                           │
      └────────────────────┬─────────────────────────────┘
                           │
                           ▼
      ┌────────────────────────────────────────────────────────┐
      │  STAGE 2: BUILD APPLICATION                            │
      │           (Orchestrated via build_stage.py)            │
      │                                                         │
      │  Step 1: Extract Vite-Express Template               │
      │          ├─ Creates: app/client/                      │
      │          ├─ Creates: app/server/                      │
      │          └─ Creates: app/shared/                      │
      │                                                         │
      │  Step 2: Generate Backend Specification              │
      │          ├─ Schema Designer → schema.zod.ts          │
      │          └─ Contracts Designer → contracts/           │
      │                                                         │
      │  Step 3: Setup TypeScript Configuration              │
      │                                                         │
      │  Step 4: Copy Plan & Artifacts                       │
      │          ├─ plan.md → specs/plan.md                  │
      │          └─ App.tsx → specs/App.tsx (if exists)      │
      │                                                         │
      │  Step 5: Define Agent Pipeline                       │
      │  Step 6: Execute Writer-Critic Loops                │
      └────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   SEQUENTIAL        SEQUENTIAL            PARALLEL ORCHESTRATORS
   (Critical)        (Non-Critical)        (After Dependencies)
        │                  │                  │
        ▼                  ▼                  ▼

    ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐
    │  PHASE 1    │  │   PHASE 2    │  │   PHASE 3          │
    │             │  │              │  │                    │
    │ Schema      │→ │ Storage      │→ │ Frontend Specs     │
    │ Generator   │  │ Generator    │  │ (Parallel Pages)   │
    │             │  │              │  │                    │
    │ (W+C Loop)  │  │ (W+C Loop)   │  │ Master Spec + 5    │
    │  Max 3 itr  │  │  Max 3 itr   │  │ concurrent pages   │
    └─────────────┘  └──────────────┘  │                    │
            │                 │         │ ┌──────────────┐   │
            │                 │         │ │ FIS Master   │   │
            │                 │         │ │ Generator    │   │
            │                 │         │ │              │   │
            │                 │         │ │ (No Critic)  │   │
            │                 │         │ └──────────────┘   │
            │                 │         │         │          │
            │                 │         │         ▼          │
            │                 │         │ ┌──────────────┐   │
            │                 │         │ │ FIS Page     │   │
            │                 │         │ │ Generators   │   │
            │                 │         │ │ (Parallel)   │   │
            │                 │         │ │              │   │
            │                 │         │ │ 5 pages at a │   │
            │                 │         │ │ time         │   │
            │                 │         │ └──────────────┘   │
            │                 │         └────────────────────┘
            │                 │                   │
            ▼                 ▼                   ▼

    ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐
    │  PHASE 4    │  │   PHASE 5    │  │   PHASE 6          │
    │             │  │              │  │                    │
    │ Routes      │→ │ API Client   │→ │ Frontend           │
    │ Generator   │  │ Generator    │  │ Implementation     │
    │             │  │              │  │ (Parallel Pages)   │
    │ (W+C Loop)  │  │ (W+C Loop)   │  │                    │
    │  Max 3 itr  │  │  Max 3 itr   │  │ Layout + 5-10      │
    └─────────────┘  └──────────────┘  │ concurrent pages   │
            │                 │         │                    │
            │                 │         │ ┌──────────────┐   │
            │                 │         │ │ Layout       │   │
            │                 │         │ │ Generator    │   │
            │                 │         │ │              │   │
            │                 │         │ │ (W+C Loop)   │   │
            │                 │         │ │  Max 3 itr   │   │
            │                 │         │ └──────────────┘   │
            │                 │         │         │          │
            │                 │         │         ▼          │
            │                 │         │ ┌──────────────┐   │
            │                 │         │ │ Page         │   │
            │                 │         │ │ Generators   │   │
            │                 │         │ │ (Parallel)   │   │
            │                 │         │ │              │   │
            │                 │         │ │ 5-10 pages   │   │
            │                 │         │ │ at a time    │   │
            │                 │         │ └──────────────┘   │
            │                 │         └────────────────────┘
            │                 │                   │
            ▼                 ▼                   ▼

    ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐
    │  PHASE 7    │  │   PHASE 8    │  │   PHASE 9          │
    │             │  │              │  │                    │
    │ App Shell   │→ │ Context      │→ │ Frontend Interaction
    │ Generator   │  │ Providers    │  │ Spec Master        │
    │             │  │ Generator    │  │                    │
    │ (W+C Loop)  │  │              │  │ (No Critic -       │
    │  Max 3 itr  │  │ (W+C Loop)   │  │  Triggers Pages)   │
    │             │  │  Max 3 itr   │  │                    │
    │ CRITICAL    │  │              │  │ CRITICAL           │
    │ FAILURE     │  │ (Non-Critic) │  │ FAILURE STOPS      │
    │ STOPS PIPE  │  │              │  │ PIPELINE           │
    └─────────────┘  └──────────────┘  └────────────────────┘
            │                 │                   │
            │                 │                   │
            └──────────────────┼───────────────────┘
                               │
                               ▼
      ┌────────────────────────────────────────────────────┐
      │  STAGE 3: VALIDATION                               │
      │  ├─ Type Check: tsc --noEmit                       │
      │  ├─ Lint: oxc (50-100x faster than ESLint)         │
      │  ├─ Build Test: npm run build                      │
      │  └─ Browser Automation: Chrome DevTools            │
      └────────────────────┬─────────────────────────────┘
                           │
                           ▼
      ┌────────────────────────────────────────────────────┐
      │  APP GENERATION COMPLETE                           │
      │  ├─ Initialize Git Repository                      │
      │  ├─ Create Initial Commit                          │
      │  ├─ Save Session to .agent_session.json            │
      │  ├─ Generate CHANGELOG.md                          │
      │  └─ Generate CLAUDE.md                             │
      └────────────────────┬─────────────────────────────┘
                           │
                           ▼
      ┌────────────────────────────────────────────────────┐
      │  OPTIONAL: INTERACTIVE LOOP                        │
      │  ├─ Interactive Mode: User enters prompts          │
      │  ├─ Confirm-First: Agent suggests, user approves   │
      │  └─ Autonomous: Agent auto-continues (max N itr)   │
      │                                                     │
      │  Reprompter analyzes:                              │
      │  ├─ Current app state                              │
      │  ├─ Suggests next improvements                     │
      │  └─ User can: approve/redirect/add/exit            │
      └────────────────────┬─────────────────────────────┘
                           │
                           ▼
      ┌────────────────────────────────────────────────────┐
      │  APP READY                                         │
      │  └─ cd {app_path} && npm install && npm run dev   │
      └────────────────────────────────────────────────────┘
```

---

## Writer-Critic Loop Pattern (Simplified)

```
┌───────────────────────────────────────────────────────┐
│           Writer-Critic Loop (Per Agent)              │
│           Max 3 iterations by default                 │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴────────────┬────────────┐
        │                        │            │
        ▼ Iteration 1            │            │
    ┌──────────────┐             │            │
    │   WRITER 1   │             │            │
    │              │             │            │
    │ Generates    │             │            │
    │ code +       │             │            │
    │ self-tests   │             │            │
    │              │             │            │
    │ TypeScript   │             │            │
    │ compilation  │             │            │
    │ OXC linting  │             │            │
    └────────┬─────┘             │            │
             │                   │            │
             ▼                   │            │
    ┌──────────────┐             │            │
    │   CRITIC 1   │             │            │
    │              │             │            │
    │ Validates    │             │            │
    │ output       │             │            │
    │              │             │            │
    │ Domain-      │             │            │
    │ specific     │             │            │
    │ checks       │             │            │
    └────┬─────────┘             │            │
         │                       │            │
    ┌────┴────────┬──────────┬───┘            │
    │             │          │                │
 COMPLETE    CONTINUE      FAIL              │
    │             │          │                │
    │             │          ▼                │
    │             │      ┌──────────┐         │
    │             │      │ PIPELINE │         │
    │             │      │ STOPS    │         │
    │             │      │          │         │
    │             │      │ (Critical)        │
    │             │      └──────────┘         │
    │             │                          │
    │             ├──► Iteration 2           │
    │             │      WRITER 2            │
    │             │      + Critic feedback   │
    │             │      (Previous XML)      │
    │             │                          │
    │             └──► Iteration 3           │
    │                  WRITER 3              │
    │                  If not complete      │
    │                  → FAILURE             │
    │                                        │
    ▼                                        ▼
  MOVE TO NEXT AGENT               FAILURE HANDLED

    ┌──────────────┐      ┌──────────────────┐
    │ Next Agent   │      │ If Critical:     │
    │ in Pipeline  │      │ Stop Pipeline    │
    │              │      │                  │
    │ Success!     │      │ If Non-Critical: │
    └──────────────┘      │ Log & Continue   │
                          └──────────────────┘
```

---

## Agent Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                      PLAN (plan.md)                             │
│    ┌───────────────────────────┬──────────────────────────┐    │
│    │ Feature requirements      │ Entity definitions       │    │
│    │ Workflows                 │ API specifications       │    │
│    └───────────────────────────┴──────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    ┌─────────────┐  ┌──────────────┐
    │   BACKEND   │  │    FRONTEND  │
    │  SPEC STAGE │  │  SPEC STAGE  │
    └──────┬──────┘  │              │
           │         └──────────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  ┌────────┐  ┌──────────┐
  │ Schema │  │ Contracts│
  │ Zod.ts │  │ /*.ts    │
  └────┬───┘  └────┬─────┘
       │           │
       │   ┌───────┘
       │   │
       ▼   ▼
    ┌─────────────────────────────────────────┐
    │    BUILD STAGE WRITER-CRITIC CHAIN     │
    │                                         │
    │  1. Schema Generator                   │
    │     Input: plan.md, schema.zod.ts     │
    │     Output: shared/schema.ts          │
    │              │                         │
    │  2. Storage Generator ◄───────────────┤
    │     Input: plan.md, schema.ts         │
    │     Output: server/storage.ts         │
    │              │                         │
    │  3. Routes Generator ◄────────────────┤
    │     Input: plan.md, schema.ts, ...    │
    │     Output: server/routes.ts          │
    │              │                         │
    │  4. API Client Generator ◄────────────┤
    │     Input: contracts/                 │
    │     Output: client/lib/api-client.ts  │
    │              │                         │
    │  5. App Shell Generator ◄──────────────┤
    │     Input: plan.md, specs             │
    │     Output: client/src/App.tsx        │
    │              │                         │
    └──────────────┼──────────────────────────┘
                   │
                   ▼
         ┌──────────────────────┐
         │  FIS Master Gen      │
         │                      │
         │  Input: plan, schema,│
         │  contracts, routes   │
         │                      │
         │  Output: specs/FIS   │
         │  -master.md          │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ FIS Page Generators  │
         │ (Parallel)           │
         │                      │
         │ Input: plan, master  │
         │                      │
         │ Output: specs/pages/ │
         │ *.md (5 concurrent)  │
         └──────────┬───────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
         ▼                      ▼
    ┌────────────────┐  ┌──────────────────┐
    │ Layout Gen     │  │ Frontend Pages   │
    │                │  │ Generators       │
    │ Input: master  │  │ (Parallel)       │
    │                │  │                  │
    │ Output:        │  │ Input: master,   │
    │ AppLayout.tsx  │  │ pages, schema    │
    │                │  │                  │
    │                │  │ Output: pages/   │
    │                │  │ *.tsx (10 conc)  │
    └────────────────┘  └──────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ VALIDATION STAGE      │
        │                       │
        │ • Type Check (tsc)    │
        │ • Lint (oxc)          │
        │ • Build (npm)         │
        │ • Browser Test        │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  APP READY            │
        │  (npm run dev)        │
        └───────────────────────┘
```

---

## Data Flow Through Pipeline

```
┌────────────────┐
│  User Prompt   │
└────────┬───────┘
         │ Expansion (optional)
         ▼
┌────────────────────────┐
│ Expanded Prompt        │
│ + Best Practices       │
└────────┬───────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │  PLAN STAGE                 │
    │  Output: plan.md            │
    └────────┬────────────────────┘
             │ plan.md content
             ▼
    ┌─────────────────────────────┐
    │  BACKEND SPEC STAGE         │
    │  Outputs:                   │
    │  - schema.zod.ts            │
    │  - contracts/*.ts           │
    └────────┬────────────────────┘
             │
             │ Both files needed by Build Stage
             ▼
    ┌──────────────────────────────────────────────┐
    │  BUILD STAGE                                 │
    │                                              │
    │  Copy plan.md → specs/plan.md               │
    │  Copy contracts → shared/contracts/         │
    │  Copy schema.zod.ts → shared/               │
    │                                              │
    │  Schema Generator:                          │
    │  ├─ Reads: plan.md, schema.zod.ts          │
    │  └─ Writes: shared/schema.ts                │
    │                                              │
    │  Storage Generator:                         │
    │  ├─ Reads: plan.md, shared/schema.ts       │
    │  └─ Writes: server/storage.ts               │
    │                                              │
    │  Routes Generator:                          │
    │  ├─ Reads: plan.md, schema.ts,             │
    │  │          contracts/, storage.ts          │
    │  └─ Writes: server/routes.ts                │
    │                                              │
    │  API Client Generator:                      │
    │  ├─ Reads: contracts/                       │
    │  └─ Writes: client/lib/api-client.ts       │
    │                                              │
    │  App Shell Generator:                       │
    │  ├─ Reads: plan.md, FIS master              │
    │  └─ Writes: client/src/App.tsx              │
    │                                              │
    │  FIS Master Generator:                      │
    │  ├─ Reads: plan.md, schema.ts,             │
    │  │          contracts/, routes.ts           │
    │  └─ Writes: specs/frontend-interaction-spec │
    │             -master.md                      │
    │                                              │
    │  FIS Page Generators (Parallel):            │
    │  ├─ Reads: plan.md, FIS master              │
    │  └─ Writes: specs/pages/*.md                │
    │                                              │
    │  Layout Generator:                          │
    │  ├─ Reads: plan.md, FIS master              │
    │  └─ Writes: client/components/layout/       │
    │             AppLayout.tsx                   │
    │                                              │
    │  Frontend Pages (Parallel):                 │
    │  ├─ Reads: plan.md, FIS master/pages,      │
    │  │          schema.ts, contracts/,          │
    │  │          api-client.ts                   │
    │  └─ Writes: client/src/pages/*.tsx         │
    │             client/src/hooks/*.ts           │
    └────────┬──────────────────────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  VALIDATION STAGE          │
    │  Input: All generated code │
    │  Validates: Type safety    │
    │  Linting, Build, UI        │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  APP READY                 │
    │  All files in place        │
    │  Session saved             │
    │  Git initialized           │
    └────────────────────────────┘
```

---

## Session Management Flow

```
┌──────────────────────┐
│  App Generation      │
│  or Modification     │
└──────────┬───────────┘
           │
           ▼
    ┌────────────────────┐
    │ Generate UUID      │
    │ session_id = UUID  │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ Run Agent with Session Support     │
    │                                    │
    │ await agent.run_with_session(      │
    │   prompt,                          │
    │   session_id=session_id            │
    │ )                                  │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Agent Executes Generation  │
    │ (User may interrupt)       │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ Build Session Data                 │
    │                                    │
    │ {                                  │
    │   "session_id": "uuid-here",       │
    │   "app_path": "/path/to/app",      │
    │   "timestamp": "2025-01-08T...",   │
    │   "context": {                     │
    │     "app_name": "todo-app",        │
    │     "features": [features],        │
    │     "entities": [entities],        │
    │     "last_action": "action",       │
    │   }                                │
    │ }                                  │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ Save to .agent_session.json        │
    │ {app_path}/.agent_session.json     │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────┐
    │ Later: Resume Generation                 │
    │                                          │
    │ Load session from .agent_session.json   │
    │ If valid UUID, use for run_with_session │
    │ If invalid/expired, create fresh       │
    │                                          │
    │ Error handling:                          │
    │ ├─ Session expired → Create new          │
    │ ├─ Process terminated → Try fresh        │
    │ └─ Multiple fallbacks with retries       │
    └──────────────────────────────────────────┘
```

---

## MCP Tools Ecosystem

```
┌──────────────────────────────────────────────────────────────┐
│              AppGeneratorAgent MCP Tools                     │
│                    (11+ tools)                               │
└──────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬────────────┐
        │                 │                 │            │
        ▼                 ▼                 ▼            ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐
   │ chrome_devtools │ build_test  │ package_mgr  │ dev_server │
   │                 │             │              │            │
   │ • Browser       │ • TypeScript│ • npm install│ • Start dev│
   │   automation    │   compile   │ • Add/remove │   server   │
   │ • DOM interact  │ • tsc check │   packages   │ • Monitor  │
   │ • Network logs  │             │              │            │
   │ • Console logs  │             │              │            │
   └──────────────┘ └─────────────┘ └──────────────┘ └──────────┘
        │                 │                 │            │
        └─────────────────┼─────────────────┴────────────┘
                          │
        ┌─────────────────┼─────────────────┬────────────┐
        │                 │                 │            │
        ▼                 ▼                 ▼            ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐
   │  shadcn_ui   │ cwd_reporter │   mem0        │ graphiti │
   │              │              │                │          │
   │ • Add UI      │ • Path info  │ • Store facts│ • Entity │
   │   components  │ • CWD state  │ • Retrieve   │   graph  │
   │ • Component   │ • File test  │   memories   │ • Query  │
   │   templates   │ • Manage     │ • Search     │   rels   │
   │              │   access     │   context    │          │
   └──────────────┘ └─────────────┘ └──────────────┘ └──────────┘
        │                 │                 │            │
        └─────────────────┼─────────────────┴────────────┘
                          │
        ┌─────────────────┼──────────────┬──────────────┐
        │                 │              │              │
        ▼                 ▼              ▼              ▼
   ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐
   │context_mgr   │integration   │  supabase     │ (More tools)
   │              │analyzer      │               │
   │ • Session    │ • Template   │ • Database    │
   │   track      │   compare    │ • Auth        │
   │ • Context    │ • Changed    │ • Storage     │
   │   persist    │   files      │               │
   └──────────────┘ └─────────────┘ └──────────────┘ └──────────┘
```

---

## Error Recovery & Resilience

```
┌─────────────────────────────────────────┐
│        Error Detection Points           │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴───────┬──────────┐
        │                │          │
        ▼                ▼          ▼
   ┌─────────┐    ┌──────────┐  ┌──────────┐
   │ Writer  │    │  Critic  │  │  Failure │
   │ Fails   │    │  Fails   │  │  Points  │
   └────┬────┘    └────┬─────┘  └────┬─────┘
        │              │              │
        ▼              ▼              ▼
   ┌──────────────┐┌─────────────┐┌──────────┐
   │Log & Continue││Log & Continue ││Stop     │
   │If            ││If             ││Pipeline │
   │Non-Critical  ││Non-Critical    ││If       │
   │              ││                 ││Critical │
   │Continue      ││Continue to Next │└─────┬──┘
   │to Next       ││Agent            │      │
   │Agent         │└─────────────────┘      │
   └──────────────┘                         │
        │                                   │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌──────────────────────────────────┐
        │  Pipeline Continues or Stops     │
        │                                  │
        │  Critical agents must succeed    │
        │  Non-critical can fail gracefully│
        │                                  │
        │  Never-Broken Principle:         │
        │  - No broken code in output      │
        │  - Early failure detection       │
        │  - Clear error messages          │
        └──────────────────────────────────┘
```

---

## Parallel Execution Timeline

```
Time  FIS Master → Page Specs (Parallel)    Frontend Impl (Parallel)
─────────────────────────────────────────────────────────────────────

0s    ▌ FIS Master Gen Start
      ▌

5s    ▌ FIS Master Gen Complete
      ▌
      ├─ Page1 [═════════════════════════════════] 25s

10s   ├─ Page2 [═════════════════════════════════] 25s
      ├─ Page3 [═════════════════════════════════] 25s
      ├─ Page4 [═════════════════════════════════] 25s
      ├─ Page5 [═════════════════════════════════] 25s

15s   │                                    (Waiting for FIS)

20s   │

25s   │ Page specs ready
      │
      ├─ FrontPage1 [════════════════════════════] 20s
      ├─ FrontPage2 [════════════════════════════] 20s
      ├─ FrontPage3 [════════════════════════════] 20s
      ├─ FrontPage4 [════════════════════════════] 20s
      ├─ FrontPage5 [════════════════════════════] 20s

35s   │

40s   │ All pages complete
      │
      ▼

Sequential section: ~70s (Master + Specs + Frontend)
Parallel saves ~20-30s vs sequential

Total build for N pages:
Sequential: Master (5s) + (Pages × 25s) + (Pages × 20s) = slow
Parallel:   Master (5s) + max(Specs, Frontend) = much faster
```

---

## Agent Lifecycle

```
┌─────────────────────────────────────┐
│     Single Agent Execution          │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌──────────┐    ┌─────────────┐
   │ Skip?    │    │ First Run   │
   │          │    │             │
   │ Output   │    │ Initialize  │
   │ exists?  │    │ Agent       │
   │ YES ─────┼────► SKIP        │
   │          │    │             │
   │ NO       │    │ Continue ▼  │
   └────┬─────┘    └─────────────┘
        │                 │
        │                 ▼
        │          ┌──────────────────┐
        │          │  Iteration Loop  │
        │          │  (Max 3)         │
        │          └────┬─────────────┘
        │               │
        │          ┌────┴────┐
        │          │          │
        │          ▼          ▼
        │      ┌────────┐  ┌──────────┐
        │      │ Writer │  │  Critic  │
        │      │        │  │          │
        │      │Generate│  │ Validate │
        │      │        │  │          │
        │      │        │  │ Decision │
        │      │ Self-  │  │          │
        │      │ test   │  │ Complete │
        │      │        │  │ Continue │
        │      │        │  │ Fail     │
        │      └───┬────┘  └────┬─────┘
        │          │            │
        │          └────┬───────┘
        │               │
        │          ┌────┴────────┐
        │          │             │
        │      COMPLETE      CONTINUE
        │          │             │
        │          │      Iteration 2
        │          │      with feedback
        │          │             │
        │          │      CONTINUE
        │          │             │
        │          │      Iteration 3
        │          │             │
        │          │      If not complete
        │          │      → FAIL
        │          │
        │          ▼
        │      ┌─────────────────┐
        │      │ Next Agent      │
        │      │ OR              │
        │      │ Pipeline Stops  │
        └─────►│ (if critical)   │
               └─────────────────┘
```

