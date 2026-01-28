# Fly.io Deployment Rollback

## Overview

This document describes rollback procedures for Fly.io deployments.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Fly.io App** | [TODO: fly-app-name] |
| **Region(s)** | [TODO: e.g., iad, sjc] |

## Quick Reference

```bash
# Most common rollback command
fly releases rollback -a [app-name]
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Fly.io Platform                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Machine 1  │    │  Machine 2  │    │  Machine N  │     │
│  │  (Primary)  │    │  (Replica)  │    │  (Replica)  │     │
│  │  Region: iad│    │  Region: iad│    │  Region: sjc│     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                  │
│                    Fly.io Edge                               │
│                    (Load Balancer)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                     [app-name].fly.dev
```

## Release Management

### View Releases

```bash
# List recent releases
fly releases list -a [app-name]

# Output example:
# VERSION  STATUS     CREATED AT
# v10      complete   2025-01-23T12:00:00Z
# v9       complete   2025-01-22T15:30:00Z
# v8       complete   2025-01-21T10:00:00Z
```

### View Release Details

```bash
# Get details about a specific release
fly releases show v10 -a [app-name]
```

## Rollback Procedures

### Standard Rollback (Previous Version)

Use when the current release has issues:

```bash
# Step 1: Confirm current state
fly status -a [app-name]
fly releases list -a [app-name]

# Step 2: Rollback to previous version
fly releases rollback -a [app-name]

# Step 3: Verify rollback
fly status -a [app-name]
curl https://[app-name].fly.dev/health

# Step 4: Monitor logs
fly logs -a [app-name]
```

### Rollback to Specific Version

Use when you need to go back multiple versions:

```bash
# Step 1: List available versions
fly releases list -a [app-name]

# Step 2: Rollback to specific version
fly releases rollback v8 -a [app-name]

# Step 3: Verify
curl https://[app-name].fly.dev/health
```

### Emergency Stop

Use when immediate traffic halt is needed:

```bash
# Step 1: Scale to zero (stops all traffic)
fly scale count 0 -a [app-name]

# Step 2: Investigate
fly logs -a [app-name] --limit 500

# Step 3: Fix or rollback
fly releases rollback -a [app-name]

# Step 4: Scale back up
fly scale count 2 -a [app-name]
```

## Rollback Scenarios

### Scenario 1: Application Crash After Deploy

**Symptoms**:
- HTTP 502/503 errors
- Health check failures
- Container restart loops

**Steps**:
```bash
# 1. Check logs for error
fly logs -a [app-name] | tail -50

# 2. Rollback immediately
fly releases rollback -a [app-name]

# 3. Verify health
curl https://[app-name].fly.dev/health
```

**Post-mortem**:
- Review failed release changes
- Add tests to prevent recurrence
- Document in incident log

---

### Scenario 2: Performance Degradation

**Symptoms**:
- Slow response times
- Increased error rates
- Resource exhaustion

**Steps**:
```bash
# 1. Check metrics
fly status -a [app-name]

# 2. Option A: Scale up temporarily
fly scale vm shared-cpu-2x -a [app-name]

# 3. Option B: Rollback if caused by code change
fly releases rollback -a [app-name]

# 4. Monitor
fly logs -a [app-name]
```

---

### Scenario 3: Security Vulnerability Discovered

**Symptoms**:
- Security scan alert
- Vulnerability report

**Steps**:
```bash
# 1. Assess severity (if critical, rollback immediately)
fly releases rollback -a [app-name]

# 2. Identify affected versions
fly releases list -a [app-name]

# 3. Rollback to last known-good version
fly releases rollback v5 -a [app-name]  # Known safe version

# 4. Prepare hotfix
# (develop fix, deploy when ready)
```

---

### Scenario 4: Database Migration Failed

**Symptoms**:
- Application errors related to schema
- Missing columns/tables

**Steps**:
```bash
# 1. Rollback application (won't fix schema)
fly releases rollback -a [app-name]

# 2. Fix database (see BACKUP_RESTORE.md)
# May need to restore from backup

# 3. Re-deploy with fixed migration
fly deploy -a [app-name]
```

## Machine Management

### View Machines

```bash
# List all machines
fly machine list -a [app-name]

# Output example:
# ID              STATE   REGION  CREATED
# 1234abcd        started iad     2025-01-23T12:00:00Z
# 5678efgh        started sjc     2025-01-23T12:00:00Z
```

### Restart Specific Machine

```bash
# Restart single machine
fly machine restart 1234abcd -a [app-name]

# Restart all machines
fly apps restart [app-name]
```

### Stop/Start Machines

```bash
# Stop a machine
fly machine stop 1234abcd -a [app-name]

# Start a machine
fly machine start 1234abcd -a [app-name]
```

## Blue-Green Deployment

For zero-downtime deployments:

```bash
# Fly.io uses rolling deployments by default
# New machines start before old ones stop

# Configure in fly.toml:
# [deploy]
#   strategy = "rolling"  # or "bluegreen"
```

## Configuration Rollback

### Secrets

```bash
# View current secrets (names only)
fly secrets list -a [app-name]

# Rollback a secret to previous value
fly secrets set KEY=previous_value -a [app-name]
```

### Environment Variables

```bash
# Environment variables are stored in fly.toml
# Rollback requires redeploying with previous fly.toml

# Or set via CLI:
fly secrets set ENV_VAR=value -a [app-name]
```

## Pre-Rollback Checklist

Before rolling back, verify:

- [ ] Current release version noted
- [ ] Target rollback version identified
- [ ] Database compatibility confirmed (no schema conflicts)
- [ ] Stakeholders notified
- [ ] Monitoring in place

## Post-Rollback Checklist

After rolling back, verify:

- [ ] Health check passes: `curl https://[app-name].fly.dev/health`
- [ ] Key functionality works
- [ ] No error spike in logs
- [ ] Metrics return to normal
- [ ] Incident documented

## Rollback Limitations

| Situation | Limitation | Workaround |
|-----------|------------|------------|
| Database migration | Rollback won't undo schema changes | Restore from backup |
| Data changes | Rollback won't undo data modifications | Manual data fix |
| External dependencies | Third-party services may have changed | Coordinate with vendors |
| DNS propagation | May take time for traffic to shift | Wait or use direct IP |

## Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| On-Call Engineer | [TODO] | Execute rollback |
| Platform Team | [TODO] | Infrastructure issues |
| Fly.io Support | https://fly.io/docs/support | Platform problems |

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
