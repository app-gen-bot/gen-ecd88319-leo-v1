
# Fitness Pro — Frontend Interaction Specs (Concrete Examples)

This document lists **machine-readable FIS snippets** for 8 core pages, using the binding pattern discussed. They assume a **ts-rest** contract and **React Query** client generated under `api.*`. Visual/UX content is abbreviated; only minimal data bindings are shown here. Copy these blocks into your `spec/pages/` folder (YAML/MDX).

> Naming conventions:

> - Contract route keys: `namespace.operation` (e.g., `workouts.getWorkout`).

> - Generated hook paths: `api.namespace.operation.useQuery` or `.useMutation`.

> - Route params: `:id` captured by the router and substituted in `params.path`.


---

## 1) Discover (Home) — `/`

```yaml
route: "/"
page: "Discover"

data:
  queries:
    - id: workoutTemplates
      bind:
        contract: "workouts.listTemplates"
        hook: "api.workouts.listTemplates.useQuery"
        params:
          query: { limit: 12 }
      cacheKey: ["workoutTemplates", 12]
      staleTime: "10m"

    - id: trendingWorkouts
      bind:
        contract: "workouts.listTrending"
        hook: "api.workouts.listTrending.useQuery"
        params:
          query: { limit: 12, window: "7d" }
      cacheKey: ["trendingWorkouts", 12, "7d"]
      staleTime: "5m"

    - id: activeCoaches
      bind:
        contract: "users.listCoachesActive"
        hook: "api.users.listCoachesActive.useQuery"
        params:
          query: { limit: 8 }
      cacheKey: ["activeCoaches", 8]
      staleTime: "15m"

ui:
  components:
    - name: "Hero"
    - name: "TemplateCarousel"
      data: "$queries.workoutTemplates.data"
    - name: "TrendingGrid"
      data: "$queries.trendingWorkouts.data"
    - name: "CoachRail"
      data: "$queries.activeCoaches.data"

states:
  loading: ["workoutTemplates", "trendingWorkouts"]
  error:
    - of: "workoutTemplates"
      show: "ErrorToast"
prefetch:
  onVisible:
    - ["workoutTemplates", 12]
    - ["trendingWorkouts", 12, "7d"]
```

---

## 2) Workouts List — `/workouts`

```yaml
route: "/workouts"
page: "WorkoutCatalog"

data:
  queries:
    - id: workouts
      bind:
        contract: "workouts.listWorkouts"
        hook: "api.workouts.listWorkouts.useQuery"
        params:
          query:
            page: "$state.page"       # derived from local pagination state
            limit: 24
            difficulty: "$state.filters.difficulty?"
            coachId: "$state.filters.coachId?"
      cacheKey: ["workouts", "$state.page", 24, "$state.filters.difficulty", "$state.filters.coachId"]

ui:
  components:
    - name: "FilterBar"
      twoWayBind:
        - "$state.filters.difficulty"
        - "$state.filters.coachId"
    - name: "WorkoutCardGrid"
      data: "$queries.workouts.data.items"
    - name: "Pagination"
      twoWayBind: "$state.page"

states:
  loading: ["workouts"]
  empty:
    - when: "$queries.workouts.data.items.length === 0"
      show: "EmptyState"
```

---

## 3) Workout Detail — `/workouts/:id`

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

    - id: sessions
      bind:
        contract: "sessions.listByWorkout"
        hook: "api.sessions.listByWorkout.useQuery"
        params:
          path: { id: ":id" }
      cacheKey: ["sessions", ":id"]

    - id: related
      bind:
        contract: "workouts.listRelated"
        hook: "api.workouts.listRelated.useQuery"
        params:
          path: { id: ":id" }
          query: { limit: 6 }
      cacheKey: ["related", ":id", 6]

mutations:
  - id: startSession
    bind:
      contract: "sessions.createSession"
      hook: "api.sessions.createSession.useMutation"
      bodyFrom:
        workoutId: ":id"
        # server uses JWT for userId; do not send from client
    invalidate: [["sessions", ":id"]]

  - id: toggleFavorite
    bind:
      contract: "favorites.toggle"
      hook: "api.favorites.toggle.useMutation"
      params:
        path: { workoutId: ":id" }
    optimisticUpdate:
      queries: ["workout"]
      path: "data.isFavorited"
      toggle: true

ui:
  components:
    - name: "Header"
      props:
        title: "$queries.workout.data.title"
        coach: "$queries.workout.data.coach.name"
        difficulty: "$queries.workout.data.difficulty"
    - name: "ExerciseList"
      data: "$queries.workout.data.exercises"
    - name: "RelatedCarousel"
      data: "$queries.related.data"

states:
  loading: ["workout"]
  error:
    - of: "workout"
      show: "NotFoundCard"
prefetch:
  onRouteHover:
    - ["related", ":id", 6]
```

---

## 4) Session Runner — `/sessions/:id`

```yaml
route: "/sessions/:id"
page: "SessionRunner"

data:
  queries:
    - id: session
      bind:
        contract: "sessions.getSession"
        hook: "api.sessions.getSession.useQuery"
        params:
          path: { id: ":id" }
      cacheKey: ["session", ":id"]

    - id: logs
      bind:
        contract: "exerciseLogs.listBySession"
        hook: "api.exerciseLogs.listBySession.useQuery"
        params:
          path: { sessionId: ":id" }
      cacheKey: ["logs", ":id"]

mutations:
  - id: updateSession
    bind:
      contract: "sessions.updateSession"
      hook: "api.sessions.updateSession.useMutation"
      params:
        path: { id: ":id" }
      bodyFrom: "$forms.session"   # contains status/start/end/notes
    invalidate: [["session", ":id"]]

  - id: logSet
    bind:
      contract: "exerciseLogs.create"
      hook: "api.exerciseLogs.create.useMutation"
      bodyFrom:
        workoutSessionId: ":id"
        exerciseId: "$state.currentExerciseId"
        setNo: "$state.currentSet"
        reps: "$forms.set.reps"
        weight: "$forms.set.weight"
        notes: "$forms.set.notes?"
    invalidate: [["logs", ":id"]]

ui:
  components:
    - name: "HeaderTimer"
    - name: "StepList"
      data: "$queries.session.data.exercises"
    - name: "SetForm"
      bind: "$forms.set"

states:
  loading: ["session"]
  empty:
    - when: "$queries.session.data.exercises.length === 0"
      show: "EmptyWorkout"
```

---

## 5) Coach Profile — `/coaches/:id`

```yaml
route: "/coaches/:id"
page: "CoachProfile"

data:
  queries:
    - id: coach
      bind:
        contract: "users.getUser"
        hook: "api.users.getUser.useQuery"
        params:
          path: { id: ":id" }
      cacheKey: ["coach", ":id"]

    - id: coachWorkouts
      bind:
        contract: "workouts.listByCoach"
        hook: "api.workouts.listByCoach.useQuery"
        params:
          path: { coachId: ":id" }
      cacheKey: ["coachWorkouts", ":id"]

    - id: relationships
      bind:
        contract: "relationships.listByCoach"
        hook: "api.relationships.listByCoach.useQuery"
        params:
          path: { coachId: ":id" }
      cacheKey: ["relationships", ":id"]

mutations:
  - id: requestCoaching
    bind:
      contract: "relationships.create"
      hook: "api.relationships.create.useMutation"
      bodyFrom:
        coachId: ":id"
        # server derives clientId from JWT
    invalidate: [["relationships", ":id"]]

ui:
  components:
    - name: "CoachHeader"
      props:
        name: "$queries.coach.data.username"
        avatar: "$queries.coach.data.avatar"
    - name: "WorkoutRail"
      data: "$queries.coachWorkouts.data"
    - name: "RequestCTA"
      onClick: "mutations.requestCoaching.mutate()"
```

---

## 6) Matchmaking — `/match`

```yaml
route: "/match"
page: "Matchmaking"

data:
  queries:
    - id: recommendedCoaches
      bind:
        contract: "users.listCoachesRecommended"
        hook: "api.users.listCoachesRecommended.useQuery"
        params:
          query:
            goals: "$state.goals[]?"
            level: "$state.level?"
            availability: "$state.availability?"
      cacheKey: ["recommendedCoaches", "$state.goals", "$state.level", "$state.availability"]

mutations:
  - id: requestCoaching
    bind:
      contract: "relationships.create"
      hook: "api.relationships.create.useMutation"
      bodyFrom:
        coachId: "$event.coachId"
    invalidate: []

ui:
  components:
    - name: "PreferencePanel"
      twoWayBind:
        - "$state.goals"
        - "$state.level"
        - "$state.availability"
    - name: "CoachSwipeDeck"
      data: "$queries.recommendedCoaches.data"
      onAction:
        like: "mutations.requestCoaching.mutate({ body: { coachId: $item.id } })"
```

---

## 7) Progress Dashboard — `/progress`

```yaml
route: "/progress"
page: "ProgressDashboard"

data:
  queries:
    - id: metrics
      bind:
        contract: "progress.listByUser"
        hook: "api.progress.listByUser.useQuery"
        params:
          query:
            window: "$state.window"    # '7d' | '30d' | '90d'
            types: "$state.types[]?"
      cacheKey: ["metrics", "$state.window", "$state.types"]

    - id: goals
      bind:
        contract: "goals.listByUser"
        hook: "api.goals.listByUser.useQuery"
        params: {}
      cacheKey: ["goals"]

    - id: achievements
      bind:
        contract: "achievements.listByUser"
        hook: "api.achievements.listByUser.useQuery"
        params: {}
      cacheKey: ["achievements"]

mutations:
  - id: addMetric
    bind:
      contract: "progress.create"
      hook: "api.progress.create.useMutation"
      bodyFrom: "$forms.metric"
    invalidate: [["metrics", "$state.window", "$state.types"]]

  - id: createGoal
    bind:
      contract: "goals.create"
      hook: "api.goals.create.useMutation"
      bodyFrom: "$forms.goal"
    invalidate: [["goals"]]

  - id: completeGoal
    bind:
      contract: "goals.update"
      hook: "api.goals.update.useMutation"
      params:
        path: { id: "$event.goalId" }
      bodyFrom:
        status: "completed"
    invalidate: [["goals"], ["achievements"]]

ui:
  components:
    - name: "TrendsChart"
      data: "$queries.metrics.data"
    - name: "GoalsList"
      data: "$queries.goals.data"
    - name: "AchievementsMasonry"
      data: "$queries.achievements.data"
```

---

## 8) Messaging — `/messages` and `/messages/:userId`

```yaml
route: "/messages"
page: "MessagesInbox"

data:
  queries:
    - id: threads
      bind:
        contract: "messages.listThreads"
        hook: "api.messages.listThreads.useQuery"
        params: {}
      cacheKey: ["threads"]

ui:
  components:
    - name: "ThreadList"
      data: "$queries.threads.data"
    - name: "InboxEmpty"
      when: "$queries.threads.data.length === 0"
```

```yaml
route: "/messages/:userId"
page: "MessageThread"

data:
  queries:
    - id: messages
      bind:
        contract: "messages.betweenUsers"
        hook: "api.messages.betweenUsers.useQuery"
        params:
          path:
            otherUserId: ":userId"
      cacheKey: ["messages", ":userId"]
      refetchInterval: "15s"

mutations:
  - id: sendMessage
    bind:
      contract: "messages.create"
      hook: "api.messages.create.useMutation"
      bodyFrom:
        receiverId: ":userId"
        content: "$forms.message.content"
    optimisticAppend:
      targetQuery: "messages"
      itemFrom:
        id: "$uuid()"
        senderId: "$me.id"
        receiverId: ":userId"
        content: "$forms.message.content"
        isRead: false
        createdAt: "$now()"

  - id: markRead
    bind:
      contract: "messages.markRead"
      hook: "api.messages.markRead.useMutation"
      params:
        path: { id: "$event.messageId" }
    invalidate: [["messages", ":userId"]]

ui:
  components:
    - name: "MessageList"
      data: "$queries.messages.data"
    - name: "Composer"
      bind: "$forms.message"
      onSubmit: "mutations.sendMessage.mutate()"
```

---

## Validation Notes

- A CI validator should confirm that every `bind.contract` and `bind.hook` exists and that the `params` and `bodyFrom` align with the Zod types declared in the contract.
- ESLint should forbid raw `fetch('/api')` in page code; only generated hooks are allowed.
- MSW handlers can be generated from OpenAPI to enable Storybook and Playwright tests without a live API.

---

*End of FIS examples.*
