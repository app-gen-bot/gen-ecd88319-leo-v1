# Leo Remote Naming Conventions

## Entity Identifiers

| Entity | Format | Example | Source |
|--------|--------|---------|--------|
| **user_id** | UUID | `550e8400-e29b-41d4-a716-446655440000` | Supabase Auth / OAuth |
| **app_id** | UUID | `7c9e6679-7425-40de-944b-e07fc1f90ae7` | Generated at app creation |
| **generation_id** | UUID | `f47ac10b-58cc-4372-a567-0e02b2c3d479` | Generated per run |
| **commit_sha** | Git SHA | `a1b2c3d4` | Git (short form: 8 chars) |

## Container/Request Identifiers

| Entity | Format | Example | Purpose |
|--------|--------|---------|---------|
| **request_id** | `req_{base36}_{random}` | `req_m3xyz_abc123` | Docker container tracking |
| **container_id** | Docker SHA | `abc123def456` | Docker internal |

## Repository Naming

### App Repository (User Code)
```
Owner: app-gen-saas-bot (hosted) OR user's GitHub account
Name: gen-{user_id_short}-{app_id_short}
URL:  https://github.com/app-gen-saas-bot/gen-446655440000-0e02b2c3d479
```

- `user_id_short`: Last 8 chars of user_id UUID (no dashes)
- `app_id_short`: Last 8 chars of app_id UUID (no dashes)

### Artifacts Repository (Internal State)
```
Owner: app-gen-saas-bot (always internal)
Name: artifacts-{app_id_short}
URL:  https://github.com/app-gen-saas-bot/artifacts-0e02b2c3d479
```

## File/Path Naming

### Container Workspace
```
/workspace/
├── app/                    # App code (user's deliverable)
│   └── .git/
└── leo-artifacts/          # Internal state (sessions, plans)
    └── .git/
```

### App Directory Structure
```
/workspace/app/
├── {app-name}/             # kebab-case from prompt
│   ├── client/
│   ├── server/
│   └── shared/
└── .git/
```

### Artifacts Directory Structure
```
/workspace/leo-artifacts/
├── leo-state.json          # Current state pointer
├── sessions/               # Generation session logs
│   └── {generation_id}.json
└── .git/
```

### App Name Generation
- Derived from prompt: extract 2-3 meaningful words
- Format: `kebab-case`
- Fallback: `app-{timestamp_base36}`
- Examples:
  - "Create a todo app" → `todo-app`
  - "Build a recipe manager" → `recipe-manager`
  - "" → `app-m3xyz`

## S3 Paths (if used)

```
s3://leo-saas-generated-apps-{account_id}/
└── generations/
    └── {generation_id}/
        └── app.tar.gz
```

## Environment Variables

| Variable | Value | Example |
|----------|-------|---------|
| `USER_ID` | UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `APP_ID` | UUID | `7c9e6679-7425-40de-944b-e07fc1f90ae7` |
| `GENERATION_ID` | UUID | `f47ac10b-58cc-4372-a567-0e02b2c3d479` |
| `APP_NAME` | kebab-case | `todo-app` |

## Consistency Rules

1. **UUIDs everywhere** - All primary identifiers use UUID v4
2. **Short forms use 8 chars** - When abbreviating UUIDs, use last 8 chars (no dashes)
3. **Kebab-case for names** - App names, file names use kebab-case
4. **No underscores in repo names** - GitHub repo names use dashes only
5. **Timestamps in base36** - For human-readable compact timestamps

## Example Flow

```
CLI Request:
  user_id:       550e8400-e29b-41d4-a716-446655440000
  app_id:        7c9e6679-7425-40de-944b-e07fc1f90ae7  (new or existing)
  generation_id: f47ac10b-58cc-4372-a567-0e02b2c3d479  (always new)
  prompt:        "Create a recipe manager"

Container Creates:
  /workspace/app/recipe-manager/
  /workspace/leo-artifacts/

Git Push Creates:
  https://github.com/app-gen-saas-bot/gen-55440000-c3d479
  https://github.com/app-gen-saas-bot/artifacts-c3d479

leo-state.json:
  {
    "app_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "generation_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "app_commit": "a1b2c3d4",
    "app_name": "recipe-manager"
  }
```

## Migration Notes

### From TypeScript GitHubManager
The original implementation used:
- `generationId` as INTEGER (auto-increment from DB)
- Repo name: `gen-{userIdShort}-{generationId}`

We're changing to:
- `generation_id` as UUID
- Repo name: `gen-{user_id_short}-{app_id_short}`

Rationale: UUIDs allow distributed ID generation without DB round-trip, and using `app_id` in repo name maintains stable URLs across multiple generations.
