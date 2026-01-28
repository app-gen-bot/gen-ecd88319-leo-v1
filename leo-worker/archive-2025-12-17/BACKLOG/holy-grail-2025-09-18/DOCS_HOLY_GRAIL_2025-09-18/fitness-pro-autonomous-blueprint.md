
# Fitness Pro — Autonomous Full-Stack Generation Blueprint (2025)

This blueprint describes how to go from a single prompt (“Build the world’s best Fitness Pro app”) to a **fully working, type-safe, beautiful** React + Vite + Wouter + Tailwind/shadcn UI powered by **Node/Express + Drizzle + PostgreSQL (Supabase)** — using a **schema-first**, **contract-first** pipeline with **Zod** and **ts-rest**. It is intentionally tool-agnostic in spirit and code-light (pseudocode), while being practical enough to implement directly.

---

## 0) Goals & Principles

- **Beauty remains first-class**: our Frontend Interaction Spec (FIS) retains your rich visual and interaction language.
- **Contracts are the source of truth**: all data shapes and endpoints come from Zod + contract files.
- **Autonomous generation**: agents can scaffold & implement pages without hand-holding.
- **Type safety end-to-end**: compile-time safety for paths, params, bodies, and responses.
- **Mock-first flow**: UI can run against generated mocks while backend evolves.
- **Auth is server-trust**: never trust client-submitted `userId`; use Supabase JWT middleware.

---

## 1) Schema-First: Data Models (Drizzle) → Zod

We author the domain in tables that map to Zod schemas (using Drizzle + drizzle-zod). Key entities:

- **User**: `{ id, email, username, avatar, role: ('coach'|'client'), createdAt, updatedAt }`
- **Coach–Client Relationship**: `{ id, coachId, clientId, status: ('pending'|'active'|'ended'), createdAt }`
- **Exercise**: `{ id, name, category, difficulty, muscleGroup, createdAt }`
- **Workout**: `{ id, title, ownerId, difficulty, isTemplate, createdAt, updatedAt }`
- **WorkoutExercise**: `{ id, workoutId, exerciseId, orderIndex, targetSets, targetReps, targetWeight, restSeconds }`
- **WorkoutSession**: `{ id, userId, workoutId, status, scheduledDate, startTime, endTime, totalMinutes, notes }`
- **ExerciseLog**: `{ id, workoutSessionId, exerciseId, setNo, reps, weight, notes, createdAt }`
- **Goal**: `{ id, userId, title, target, unit, deadline, status, createdAt, updatedAt }`
- **Achievement**: `{ id, userId, type, title, description, value, unit, badgeIcon, createdAt }`
- **ProgressMetric**: `{ id, userId, metricType, value, unit, recordedDate, notes }`
- **Message**: `{ id, senderId, receiverId, content, isRead, readAt, createdAt }`

> Output: a **shared package** `@shared/schema` exporting Zod insert/update/select types for every entity.

---

## 2) Storage Layer (Repository)

- Implemented twice:
  - **MemStorage** (in-memory) for development & tests.
  - **PostgresStorage** (Drizzle) for production.
- Methods mirror domain verbs, e.g. `getWorkoutsByCoach(coachId)`, `createWorkout(insert: InsertWorkout)`.
- **No business rules here**; pure data access.

> Output: `storage/` with `IStorage` interface and concrete implementations. The server chooses storage at boot.

---

## 3) Contract-First: Zod + ts-rest routes

- Define **route contracts** (pseudocode) binding Zod schemas for `path`, `query`, `body`, and `responses`.
- Example groups:
  - `users`: list/get/create/update/delete, get by email/username, active coaches/clients.
  - `relationships`: list/create/update status, by-coach/by-client.
  - `exercises`: list/get/create/update/delete, by-category/difficulty/muscleGroup.
  - `workouts`: list/get/create/update/delete, by-coach, templates, by-difficulty.
  - `workout-exercises`: CRUD, by-workout.
  - `sessions`: CRUD, by-user, active/all/completed.
  - `exercise-logs`: CRUD, by-session, personal-records.
  - `goals`: CRUD, by-user, active/completed.
  - `achievements`: CRUD, by-user, by-type.
  - `progress-metrics`: CRUD, by-user, by-type.
  - `messages`: CRUD, between users, unread, mark-read.

**Contract naming convention (examples):**
- `users.getUser`, `users.listUsers`, `users.createUser`
- `workouts.getWorkout`, `workouts.listWorkouts`, `workouts.createWorkout`
- `sessions.createSession`, `sessions.updateSession`, `sessions.listByUser`
- …

**Server adapters:**
- Use `@ts-rest/express` to implement handlers with your `storage`.
- **Auth middleware** validates Supabase JWT; sets `req.user`. Business logic uses `req.user.id`.

> Output: `contracts/*.contract.ts` + server glue that exposes routes on `/api/...` with typed handlers.

---

## 4) Code Generation

- **Client hooks**: `@ts-rest/react-query` generates real **TanStack Query hooks** (`useQuery`, `useMutation`) for every route.
- **OpenAPI export**: `@ts-rest/open-api` outputs spec for docs and mocks.
- **Mocks**:
  - Generate **MSW handlers** from the contract/OpenAPI for Storybook/Playwright.
  - Optionally run **Prism** mock server for integration tests.

> Output: `@generated/api` (clients/hooks) + `@generated/openapi.json` + `@generated/msw` handlers.

---

## 5) Frontend Interaction Spec (FIS)

Your **current FIS format remains** (to preserve beauty) with a minimal **binding extension** so agents must use the generated client. Each page keeps all layout/motion/visual instructions and adds a tiny `bind` object for each data dependency.

### FIS Concepts

- `route`: Wouter path pattern (e.g., `/workouts/:id`).
- `data.queries[]`: A named query with **binding** to a generated hook + its typed params.
- `mutations[]`: A named mutation with **binding**, optional cache invalidation.
- `ui`: Your existing rich layout (cards, sections, shadcn components, animations).
- `states`: Loading/empty/error rules bound to queries/mutations.
- `prefetch`: Optional prefetch hints for route transitions.

### Sample Pages & Their Data Bindings

#### 5.1 Discover (Home) — `/`

- **Purpose**: Show recommended templates, trending workouts, active coaches, quick start.
- **Queries**:
  - `workoutTemplates` → `workouts.listTemplates`
  - `trending` → `workouts.listTrending` (contract returns top N by sessions/likes)
  - `activeCoaches` → `users.listCoachesActive`
- **UI**: Hero, carousels, grid cards, animated micro-interactions.

#### 5.2 Workout Detail — `/workouts/:id`

- **Queries**:
  - `workout` → `workouts.getWorkout` (returns workout, exercises, coach summary, isFavorited)
  - `sessions` → `sessions.listByWorkout` (recent/active sessions)
  - `related` → `workouts.listRelated` (by goal/difficulty/coach)
- **Mutations**:
  - `startSession` → `sessions.createSession` (server injects `userId`)
  - `toggleFavorite` → uses per-user favorites (`favorites.create` / `favorites.deleteByTrack`)
- **States**: empty exercises, loading shimmer, 404 card, toast on favorite.

#### 5.3 Session Runner — `/sessions/:id`

- **Queries**:
  - `session` → `sessions.getSession` (with nested workout + steps)
  - `logs` → `exerciseLogs.listBySession`
- **Mutations**:
  - `updateSession` (status, start/end, totalMinutes)
  - `logSet` (append set: reps, weight, RPE)
- **UX**: sticky progress bar, timer, set-by-set forms, mobile-first gestures.

#### 5.4 Coach Profile — `/coaches/:id`

- **Queries**:
  - `coach` → `users.getUser` (+ derived metrics)
  - `coachWorkouts` → `workouts.listByCoach`
  - `relationships` → `relationships.listByCoach`
- **Mutations**:
  - `requestCoaching` → `relationships.create` (status: pending)
  - `accept/decline` → `relationships.updateStatus` (coach only)
- **UX**: bio header, badges, schedule CTA, DM button.

#### 5.5 Matchmaking — `/match`

- **Queries**:
  - `recommendedCoaches` → `users.listCoachesRecommended` (by goals/history)
- **Mutations**:
  - `requestCoaching` (same as above)
- **UX**: swipeable cards, preference sliders, comparisons.

#### 5.6 Progress Dashboard — `/progress`

- **Queries**:
  - `metrics` → `progress.listByUser` (time-windowed)
  - `goals` → `goals.listByUser`
  - `achievements` → `achievements.listByUser`
- **Mutations**:
  - `addMetric`, `createGoal`, `completeGoal`
- **UX**: charts (area/line), trend callouts, celebratory Lottie on achievements.

#### 5.7 Messaging — `/messages` and `/messages/:userId`

- **Queries**:
  - `threads` (latest with each participant)
  - `messagesByUser` → `messages.between(senderId: me, receiverId)`
- **Mutations**:
  - `sendMessage`, `markRead`
- **UX**: chat bubbles, typing indicator, read receipts.

---

## 6) Example FIS Binding (Pseudocode)

> NOTE: The visual portion (layout, animations, component variants) is exactly your current style — only `bind` is new.

```yaml
route: "/workouts/:id"
page: "WorkoutDetail"

data:
  queries:
    - id: workout
      bind:
        contract: "workouts.getWorkout"
        hook: "api.workouts.getWorkout.useQuery"
        params:
          path: { id: ":id" }
      cacheKey: ["workout", ":id"]
      staleTime: "5m"

    - id: related
      bind:
        contract: "workouts.listRelated"
        hook: "api.workouts.listRelated.useQuery"
        params:
          path: { id: ":id" }
          query: { limit: 6 }
      cacheKey: ["related", ":id", 6]

    - id: sessions
      bind:
        contract: "sessions.listByWorkout"
        hook: "api.sessions.listByWorkout.useQuery"
        params:
          path: { id: ":id" }
      cacheKey: ["sessions", ":id"]

mutations:
  - id: startSession
    bind:
      contract: "sessions.createSession"
      hook: "api.sessions.createSession.useMutation"
      bodyFrom: "form.sessionConfig"  # the spec defines how UI form maps to body
    invalidate: [["sessions", ":id"]]  # after success

  - id: toggleFavorite
    bind:
      contract: "favorites.toggle"
      hook: "api.favorites.toggle.useMutation"
      params:
        path: { workoutId: ":id" }
    optimisticUpdate:
      queries: ["workout"]
      path: "workout.data.isFavorited"
      toggle: true

ui:
  states:
    loading: ["workout"]
    error:
      - of: "workout"
        show: "ErrorCard"
    empty:
      - when: "sessions.data.length === 0"
        show: "EmptySessions"
  components:
    - name: "HeroHeader"
      props:
        title: "$queries.workout.data.title"
        subtitle: "$queries.workout.data.coach.name"
        badge: "$queries.workout.data.difficulty"
    - name: "StartButton"
      onClick: "mutations.startSession.mutate()"
  animations:
    pageTransition: "fade-slide-up-md"
    microInteractions:
      - target: "StartButton"
        on: "hover"
        effect: "pulse"
prefetch:
  onRouteHover:
    - ["related", ":id", 6]
```

---

## 7) CI/Automation & Safety Rails

- **Monorepo** with `@shared/schema`, `contracts/*`, server, client, `spec/pages/*` (FIS).
- **Generators** run on each change to contracts → regenerate hooks, OpenAPI, MSW.
- **FIS Validator (CI step)**:
  - Ensures every `bind.contract` exists.
  - Ensures every `bind.hook` exists.
  - Validates `params`/`bodyFrom` shape against Zod.
- **ESLint rule**: disallow raw `fetch('/api')` inside pages; enforce import from `@generated/api`.
- **Storybook/Playwright**: run against **MSW mocks** generated from OpenAPI.
- **Contract conformance**: optional **Prism** or **Dredd** runs against the live server.
- **Auth**: Supabase JWT middleware; server sets `req.user`; clients never supply `userId`.

---

## 8) Runtime Wiring (End-to-End)

1. **User navigates**: Wouter matches FIS `route` → renders the page.
2. **Data layer**: FIS `queries` auto-wire to generated React Query hooks; params come from route & UI state.
3. **UI/UX**: Your spec’s components/animations render with state-driven props (loading, empty, error).
4. **Mutations**: FIS-defined actions call generated mutation hooks, with optimistic updates + invalidation.
5. **Server**: Express handlers (ts-rest) validate with Zod, enforce auth, call `storage` (Mem/Postgres).
6. **DB**: Drizzle executes SQL; results mapped to Zod response schemas.
7. **Everything type-safe**: any drift fails compilation or CI validation before runtime.

---

## 9) Autonomy Flow (From Prompt → App)

1. **Prompt**: “Build Fitness Pro (coaches, users, workouts, sessions, goals, progress, messaging).”
2. **Agent 1 — Schema**: Generates/updates Drizzle tables + Zod schemas in `@shared/schema`.
3. **Agent 2 — Storage**: Implements `IStorage` for Mem + Postgres.
4. **Agent 3 — Contracts**: Writes `contracts/*.contract.ts` with Zod references.
5. **Codegen**: Produces `@generated/api` hooks + OpenAPI + MSW.
6. **Agent 4 — FIS**: Authors `spec/pages/*.yaml` focusing on beauty + data bindings.
7. **Agent 5 — Scaffolder**: Generates page files that import the exact hooks named in FIS; injects UI skeleton with shadcn/Tailwind variants specified by FIS; no raw fetch.
8. **CI**: Validates spec vs contracts; builds; runs Storybook/Playwright against MSW; optional conformance tests.
9. **Release**: Single-port Express serves API + built SPA; Supabase handles auth; Drizzle/Postgres for prod.

---

## 10) What Changes vs Today

- Your **visual spec remains** unchanged except for tiny `bind` blocks.
- **No more stringly URLs** in components; everything calls generated hooks.
- **Per-user semantics** (favorites, sessions) rely on server auth; client bodies don’t include `userId`.
- **Query Zod** covers pagination/sort; errors standardized for consistent UI handling.
- **Mocks always available**, so designers/agents ship pages even before the server is ready.

---

## 11) Appendix — Route Inventory (Illustrative, not exhaustive)

- **Users**: list, get, create, update, delete, getByEmail, getByUsername, listCoachesActive, listClientsActive
- **Relationships**: list, get, create, updateStatus, listByCoach, listByClient
- **Exercises**: list, get, create, update, delete, listByCategory, listByDifficulty, listByMuscleGroup
- **Workouts**: list, get, create, update, delete, listByCoach, listTemplates, listByDifficulty, listRelated
- **WorkoutExercises**: list, get, create, update, delete, listByWorkout
- **Sessions**: list, get, create, update, delete, listByUser, listActive, listCompleted, listByWorkout
- **ExerciseLogs**: list, get, create, update, delete, listBySession, listPersonalRecords
- **Goals**: list, get, create, update, delete, listByUser, listActive, listCompleted
- **Achievements**: list, get, create, update, delete, listByUser, listByType
- **ProgressMetrics**: list, get, create, update, delete, listByUser, listByType
- **Messages**: list, get, create, update, delete, betweenUsers, listUnread, markRead

---

## 12) Success Criteria

- A page spec that references any non-existent contract or hook **fails CI**.
- Any mismatch of param/body/response types **fails compile**.
- FE can run on **generated mocks** without a live backend.
- Developers and agents keep focusing on the **experience**; plumbing is guaranteed.

---

*End of document.*


---

# Appendix: Concrete FIS Examples (First 7 Pages)

Below are concrete examples of how the **Front-end Interaction Spec (FIS)** would look for the first seven core pages of the **Fitness Pro** app. Each example shows how beauty (layout/UX) remains central while adding minimal `bind` blocks to enforce type safety with the generated client.

---

## 1. Discover Page (`/`)

```yaml
route: "/"
page: "Discover"

data:
  queries:
    - id: templates
      bind:
        contract: "workouts.listTemplates"
        hook: "api.workouts.listTemplates.useQuery"
        params: {}
      cacheKey: ["templates"]
    - id: trending
      bind:
        contract: "workouts.listTrending"
        hook: "api.workouts.listTrending.useQuery"
        params: { query: { limit: 10 } }
      cacheKey: ["trending"]
    - id: activeCoaches
      bind:
        contract: "users.listCoachesActive"
        hook: "api.users.listCoachesActive.useQuery"
        params: {}
      cacheKey: ["coaches", "active"]

ui:
  components:
    - name: HeroBanner
    - name: Carousel
      props: { items: "$queries.trending.data" }
    - name: CoachGrid
      props: { coaches: "$queries.activeCoaches.data" }
```

---

## 2. Workout Detail (`/workouts/:id`)

```yaml
route: "/workouts/:id"
page: "WorkoutDetail"

data:
  queries:
    - id: workout
      bind:
        contract: "workouts.getWorkout"
        hook: "api.workouts.getWorkout.useQuery"
        params: { path: { id: ":id" } }
    - id: related
      bind:
        contract: "workouts.listRelated"
        hook: "api.workouts.listRelated.useQuery"
        params: { path: { id: ":id" }, query: { limit: 6 } }
    - id: sessions
      bind:
        contract: "sessions.listByWorkout"
        hook: "api.sessions.listByWorkout.useQuery"
        params: { path: { workoutId: ":id" } }

mutations:
  - id: startSession
    bind:
      contract: "sessions.createSession"
      hook: "api.sessions.createSession.useMutation"
      bodyFrom: "form.sessionConfig"
    invalidate: [["sessions", ":id"]]
  - id: toggleFavorite
    bind:
      contract: "favorites.toggle"
      hook: "api.favorites.toggle.useMutation"
      params: { path: { workoutId: ":id" } }
    optimisticUpdate:
      queries: ["workout"]
      path: "workout.data.isFavorited"
      toggle: true

ui:
  components:
    - name: WorkoutHero
      props:
        title: "$queries.workout.data.title"
        coach: "$queries.workout.data.coach.name"
```

---

## 3. Session Runner (`/sessions/:id`)

```yaml
route: "/sessions/:id"
page: "SessionRunner"

data:
  queries:
    - id: session
      bind:
        contract: "sessions.getSession"
        hook: "api.sessions.getSession.useQuery"
        params: { path: { id: ":id" } }
    - id: logs
      bind:
        contract: "exerciseLogs.listBySession"
        hook: "api.exerciseLogs.listBySession.useQuery"
        params: { path: { sessionId: ":id" } }

mutations:
  - id: updateSession
    bind:
      contract: "sessions.updateSession"
      hook: "api.sessions.updateSession.useMutation"
      params: { path: { id: ":id" } }
  - id: logSet
    bind:
      contract: "exerciseLogs.create"
      hook: "api.exerciseLogs.create.useMutation"
      bodyFrom: "form.setData"

ui:
  components:
    - name: ProgressBar
    - name: ExerciseStepper
      props: { session: "$queries.session.data", logs: "$queries.logs.data" }
```

---

## 4. Coach Profile (`/coaches/:id`)

```yaml
route: "/coaches/:id"
page: "CoachProfile"

data:
  queries:
    - id: coach
      bind:
        contract: "users.getUser"
        hook: "api.users.getUser.useQuery"
        params: { path: { id: ":id" } }
    - id: workouts
      bind:
        contract: "workouts.listByCoach"
        hook: "api.workouts.listByCoach.useQuery"
        params: { path: { coachId: ":id" } }
    - id: relationships
      bind:
        contract: "relationships.listByCoach"
        hook: "api.relationships.listByCoach.useQuery"
        params: { path: { coachId: ":id" } }

mutations:
  - id: requestCoaching
    bind:
      contract: "relationships.create"
      hook: "api.relationships.create.useMutation"
      bodyFrom: "{ coachId: ':id' }"

ui:
  components:
    - name: ProfileHeader
      props: { coach: "$queries.coach.data" }
    - name: WorkoutGrid
      props: { workouts: "$queries.workouts.data" }
```

---

## 5. Matchmaking (`/match`)

```yaml
route: "/match"
page: "Matchmaking"

data:
  queries:
    - id: recommendedCoaches
      bind:
        contract: "users.listCoachesRecommended"
        hook: "api.users.listCoachesRecommended.useQuery"
        params: { query: { limit: 20 } }

mutations:
  - id: requestCoaching
    bind:
      contract: "relationships.create"
      hook: "api.relationships.create.useMutation"
      bodyFrom: "{ coachId: '$selectedCoachId' }"

ui:
  components:
    - name: SwipeDeck
      props: { coaches: "$queries.recommendedCoaches.data" }
```

---

## 6. Progress Dashboard (`/progress`)

```yaml
route: "/progress"
page: "ProgressDashboard"

data:
  queries:
    - id: metrics
      bind:
        contract: "progress.listByUser"
        hook: "api.progress.listByUser.useQuery"
        params: { query: { window: '30d' } }
    - id: goals
      bind:
        contract: "goals.listByUser"
        hook: "api.goals.listByUser.useQuery"
        params: {}
    - id: achievements
      bind:
        contract: "achievements.listByUser"
        hook: "api.achievements.listByUser.useQuery"
        params: {}

mutations:
  - id: addMetric
    bind:
      contract: "progress.create"
      hook: "api.progress.create.useMutation"
      bodyFrom: "form.metric"
  - id: createGoal
    bind:
      contract: "goals.create"
      hook: "api.goals.create.useMutation"
      bodyFrom: "form.goal"

ui:
  components:
    - name: MetricsChart
      props: { metrics: "$queries.metrics.data" }
    - name: GoalsList
      props: { goals: "$queries.goals.data" }
```

---

## 7. Messaging (`/messages/:userId?`)

```yaml
route: "/messages/:userId?"
page: "Messaging"

data:
  queries:
    - id: threads
      bind:
        contract: "messages.listThreads"
        hook: "api.messages.listThreads.useQuery"
        params: {}
    - id: conversation
      bind:
        contract: "messages.betweenUsers"
        hook: "api.messages.betweenUsers.useQuery"
        params: { path: { userId: ":userId" } }

mutations:
  - id: sendMessage
    bind:
      contract: "messages.create"
      hook: "api.messages.create.useMutation"
      bodyFrom: "form.message"
  - id: markRead
    bind:
      contract: "messages.markRead"
      hook: "api.messages.markRead.useMutation"
      params: { path: { id: "$messageId" } }

ui:
  components:
    - name: ThreadList
      props: { threads: "$queries.threads.data" }
    - name: ChatWindow
      props: { messages: "$queries.conversation.data" }
```

---

**Result:**  
Each page spec now contains **data bindings** tied to generated API clients (`api.*.useQuery` / `api.*.useMutation`). This guarantees type safety and eliminates stringly-typed fetches while preserving all your visual/interaction richness.

