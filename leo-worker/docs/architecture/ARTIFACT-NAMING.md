# Artifact Naming & Identity

## Decision: Anonymous IDs with DB Lookup

Artifacts use anonymous request IDs. The SaaS database links these to users/apps.

```
Request ID:  req_abc123              (generated per generation request)
S3 Path:     generations/req_abc123/app.tar.gz
GitHub:      leo-generated/req_abc123
Container:   leo-gen-req_abc123
Volume:      leo-workspace-req_abc123
```

## Rationale

- **Privacy**: No PII in artifact paths
- **Simplicity**: Container is stateless, just uses what it's given
- **Flexibility**: DB schema can evolve without renaming artifacts
- **Recovery**: DB is backed up; losing DB is recoverable, losing S3/GitHub is worse

## Container Identity Model

One container = one user's app. Container can create or resume an app but never changes users or apps mid-lifecycle.

**Passed to container at spawn:**

| Variable | Example | Purpose |
|----------|---------|---------|
| `REQUEST_ID` | `req_abc123` | WebSocket routing, artifact naming |
| `APP_NAME` | `todo-app` | Human-readable name |
| `PROMPT` | `Create a todo app` | What to build |
| `MODE` | `autonomous` | Execution mode |
| `MAX_ITERATIONS` | `10` | Loop limit |

## Artifact Locations

| Artifact | Path | Created By |
|----------|------|------------|
| S3 archive | `s3://leo-saas-generated-apps-{account}/generations/{request_id}/app.tar.gz` | Container |
| S3 metadata | `s3://.../{request_id}/metadata.json` | Container |
| GitHub repo | `github.com/leo-generated/{request_id}` | Container |
| Local workspace | `/workspace/app/` | Container |

## S3 Metadata File

Each S3 upload includes a metadata file for disaster recovery:

```json
{
  "request_id": "req_abc123",
  "app_name": "todo-app",
  "created_at": "2025-12-11T20:30:00Z",
  "prompt_hash": "sha256:...",
  "generation_number": 1
}
```

## CLI Output

leo-remote displays artifact references at start and end:

```
════════════════════════════════════════════════════════════
  Leo Remote - App Generator
════════════════════════════════════════════════════════════

  Request ID: req_abc123
  App Name: todo-app

  Artifacts (on completion):
  - S3: s3://leo-saas-generated-apps.../generations/req_abc123/
  - GitHub: github.com/leo-generated/req_abc123

... generation ...

════════════════════════════════════════════════════════════
  Generation Complete!
════════════════════════════════════════════════════════════

  Download: aws s3 cp s3://.../req_abc123/app.tar.gz ./
  Clone: git clone https://github.com/leo-generated/req_abc123
```

## SaaS Database Schema (Reference)

```sql
-- Links anonymous artifacts to users/apps
CREATE TABLE generations (
  id UUID PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL,  -- req_abc123
  user_id UUID REFERENCES users(id),
  app_id UUID REFERENCES apps(id),
  app_name TEXT,
  prompt TEXT,
  s3_path TEXT,
  github_repo TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
);
```
