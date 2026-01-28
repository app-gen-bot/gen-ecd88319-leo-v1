# Leo SaaS Schema

## Enums

| Enum | Values |
|------|--------|
| generation_status | queued, generating, completed, failed, paused, cancelled |
| generation_mode | single-shot, autonomous, confirm_first |
| generation_type | new, resume |
| snapshot_type | automatic, manual, checkpoint |

---

## Current Tables

### generation_requests
Core table tracking app generations.

| Column | Type | Purpose |
|--------|------|---------|
| id | serial | PK |
| app_id | uuid | Unique app identifier (for GitHub naming) |
| user_id | uuid | Supabase Auth user |
| app_name | text | Display name (NOT UNIQUE) |
| prompt | text | User's generation prompt |
| initial_prompt | text | First prompt that started generation |
| status | enum | queued/generating/completed/failed/paused/cancelled |
| generation_type | enum | new/resume |
| mode | enum | single-shot/autonomous/confirm_first |
| github_url | text | GitHub repo URL (nullable) |
| deployment_url | text | Fly.io URL (nullable) |
| error_message | text | Error details if failed |
| max_iterations | int | Iteration limit |
| current_iteration | int | Current progress |
| last_session_id | text | For resuming context |
| created_at | timestamp | |
| updated_at | timestamp | |
| completed_at | timestamp | |

### iteration_snapshots
Checkpoints during generation.

| Column | Type | Purpose |
|--------|------|---------|
| id | serial | PK |
| generation_request_id | int | FK to generation_requests |
| iteration_number | int | Which iteration |
| snapshot_type | enum | automatic/manual/checkpoint |
| files_snapshot | text | JSON of all files |
| prompt_used | text | Prompt for this iteration |
| timestamp | timestamp | |
| metadata | jsonb | tokens, duration, changed files |

---

## What's Missing

### No Users Table
- Auth handled by Supabase Auth only
- No local user profile or preferences storage
- Can't store user-specific settings

### No Config Tables
- No `deployment_config` for Leo SaaS settings
- No `user_secrets` for OAuth tokens
- All config in env files

### App Metadata Gaps
- `app_name` not unique per user
- No Supabase project reference (which pool was used)
- No schema snapshot (what tables were created)
- No cost tracking (tokens used, compute time)

### No Audit Trail
- No history of config changes
- No generation cost history
- No user activity log

---

## Proposed Schema Changes

### New Table: apps (lightweight anchor)

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| user_id | uuid | FK to Supabase Auth |
| app_name | text | Display name, UNIQUE per user |
| created_at | timestamp | |

**Constraint**: `UNIQUE(user_id, app_name)`

### Updated: generation_requests

| Change | Details |
|--------|---------|
| Add `app_id` | FK to apps table (replaces app_name as identifier) |
| Add `github_commit` | Commit SHA for this generation |
| Keep `app_name` | Denormalized for convenience, or remove |

**Relationship**: `apps` 1:N `generation_requests` (an app has many generations/versions)

### New Table: deployment_config

| Column | Type | Purpose |
|--------|------|---------|
| key | text | PK, config key name |
| value | text | Config value |
| encrypted | boolean | Is value KMS-encrypted? |
| description | text | Human-readable description |
| updated_at | timestamp | |

### New Table: user_secrets

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | PK |
| user_id | uuid | FK to Supabase Auth |
| provider | text | supabase, github, fly, etc. |
| encrypted_token | text | KMS-encrypted OAuth token |
| expires_at | timestamp | Token expiration |
| created_at | timestamp | |
| updated_at | timestamp | |

**Constraint**: `UNIQUE(user_id, provider)`

---

## Model Summary

```
apps (stable identity, unique names)
 └── generation_requests (versions/history of each app)
      └── iteration_snapshots (checkpoints within a generation)

deployment_config (Leo SaaS platform settings)
user_secrets (per-user OAuth tokens)
```
