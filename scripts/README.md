# Scripts

Self-referential build and deploy scripts for Leo SaaS. These scripts build from THIS repo,
allowing Leo to modify code and then build/deploy those changes.

## Scripts

| Script | Purpose |
|--------|---------|
| `build.sh` | Build Docker images for local development (native arch) |
| `deploy-ecs.sh` | Build AMD64, push to ECR, deploy to ECS (OLD stack) |
| `run-leo.sh` | Run locally using built images |

## Production Stack (OLD - Battle-Tested)

- **CloudFront:** `d386l1mt30903c` (E2D5W0FK2JGR85)
- **ECS Cluster:** `leo-saas-cluster`
- **Supabase:** `fwhwbmjwbdvmnrpszirc`

## Source (What Scripts Build From)

These scripts are **self-referential** - they build from THIS repo:

| Component | Path |
|-----------|------|
| `leo-worker` | `./leo-worker/` |
| `leo-web` | `./leo-web/` |

This means Leo can modify code in this repo and immediately build/deploy those changes.

## Workflow

```bash
# 1. Build images locally (native arch for dev)
./scripts/build.sh

# 2. Run locally
./scripts/run-leo.sh

# 3. Deploy to production (AMD64, ECR, ECS)
./scripts/deploy-ecs.sh
```

## Prerequisites

- Docker running
- AWS credentials: `aws sso login --profile jake-dev`
- `.build-state` created by `build.sh`

## Key Files

- **Dockerfile:** `leo-worker/Dockerfile` - skill copying at lines 79-80:
  ```dockerfile
  COPY .claude/settings.json /home/leo-user/.claude/settings.json
  COPY .claude/skills/ /home/leo-user/.claude/skills/
  ```

## Reference

- `/Users/jake/WILSON/WORKING-DOC.md` - Comprehensive system overview
- `/Users/jake/WILSON/MEMORY/deployments.md` - Deployment history
