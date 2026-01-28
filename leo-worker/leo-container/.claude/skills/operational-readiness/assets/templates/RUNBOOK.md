# Operational Runbook

## Overview

This runbook provides procedures for operating and troubleshooting the application in production.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **On-Call Contact** | [TODO: Contact info] |

## Quick Reference

| Resource | URL/Command |
|----------|-------------|
| Production URL | https://[app-name].fly.dev |
| Fly Dashboard | https://fly.io/apps/[app-name] |
| Supabase Dashboard | https://supabase.com/dashboard/project/[project-id] |
| Logs | `fly logs -a [app-name]` |
| Status | `fly status -a [app-name]` |

## Health Checks

### Application Health

```bash
# Check health endpoint
curl https://[app-name].fly.dev/health

# Expected response:
# {"status": "ok", "timestamp": "2025-01-23T12:00:00Z"}
```

### Fly.io Machine Status

```bash
# List machines
fly machine list -a [app-name]

# Check specific machine
fly machine status [machine-id] -a [app-name]
```

### Database Health

```bash
# Via Supabase Dashboard
# Settings → Database → Connection pooling status

# Or via direct query
SELECT pg_is_in_recovery(), current_timestamp;
```

## Common Issues & Remediation

### Issue 1: Application Not Responding

**Symptoms**:
- HTTP 502/503 errors
- Health check failures
- No response from endpoints

**Diagnosis**:
```bash
# Check machine status
fly status -a [app-name]

# Check recent logs
fly logs -a [app-name] --limit 100

# Check if machines are running
fly machine list -a [app-name]
```

**Remediation**:
```bash
# Restart all machines
fly apps restart [app-name]

# Or restart specific machine
fly machine restart [machine-id] -a [app-name]

# If restart fails, scale down and up
fly scale count 0 -a [app-name]
fly scale count 2 -a [app-name]
```

---

### Issue 2: Database Connection Errors

**Symptoms**:
- "Connection refused" in logs
- "Too many connections" errors
- Slow queries

**Diagnosis**:
```bash
# Check connection count (Supabase Dashboard)
# Settings → Database → Active connections

# Check for connection pool errors in logs
fly logs -a [app-name] | grep -i "connection\|pool"
```

**Remediation**:
1. **Connection pool exhausted**: Restart app to reset connections
2. **Too many connections**: Check for connection leaks in code
3. **Supabase down**: Check https://status.supabase.com

---

### Issue 3: High Memory Usage

**Symptoms**:
- OOM kills in logs
- Machine restarts
- Slow responses

**Diagnosis**:
```bash
# Check machine metrics
fly machine status [machine-id] -a [app-name]

# Look for memory warnings
fly logs -a [app-name] | grep -i "memory\|oom"
```

**Remediation**:
```bash
# Scale up machine size
fly scale vm shared-cpu-2x -a [app-name]

# Or add more machines
fly scale count 3 -a [app-name]
```

---

### Issue 4: SSL/TLS Certificate Issues

**Symptoms**:
- Browser security warnings
- Certificate expired errors

**Diagnosis**:
```bash
# Check certificates
fly certs list -a [app-name]

# Check specific cert
fly certs show [hostname] -a [app-name]
```

**Remediation**:
```bash
# Remove and re-add certificate
fly certs remove [hostname] -a [app-name]
fly certs add [hostname] -a [app-name]
```

---

### Issue 5: Authentication Failures

**Symptoms**:
- Users can't log in
- "Invalid token" errors
- Session expiry issues

**Diagnosis**:
1. Check Supabase Auth logs in dashboard
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY secrets
3. Check for clock skew (JWT validation)

**Remediation**:
```bash
# Verify secrets are set
fly secrets list -a [app-name]

# Re-deploy with updated secrets if needed
fly secrets set SUPABASE_URL=... SUPABASE_ANON_KEY=... -a [app-name]
```

## Deployment Procedures

### Standard Deployment

```bash
# Build and deploy
fly deploy -a [app-name]

# Monitor deployment
fly status -a [app-name]

# Check health after deployment
curl https://[app-name].fly.dev/health
```

### Rollback Procedure

```bash
# List recent releases
fly releases list -a [app-name]

# Rollback to previous version
fly releases rollback -a [app-name]

# Rollback to specific version
fly releases rollback v5 -a [app-name]

# Verify rollback
fly status -a [app-name]
curl https://[app-name].fly.dev/health
```

### Emergency Scale Down

```bash
# Scale to zero (stops all traffic)
fly scale count 0 -a [app-name]

# Investigate issue
fly logs -a [app-name]

# Scale back up when resolved
fly scale count 2 -a [app-name]
```

## Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Warning | Critical |
|--------|---------|----------|
| Response time | > 500ms | > 2000ms |
| Error rate | > 1% | > 5% |
| Memory usage | > 70% | > 90% |
| CPU usage | > 70% | > 90% |
| Active connections | > 80% of pool | > 95% of pool |

### Log Analysis

```bash
# Recent errors
fly logs -a [app-name] | grep -i "error\|exception\|failed"

# Auth issues
fly logs -a [app-name] | grep -i "auth\|unauthorized\|401"

# Database issues
fly logs -a [app-name] | grep -i "database\|connection\|query"
```

## Escalation Procedures

### Level 1: On-Call Engineer

**Handles**:
- Application restarts
- Basic troubleshooting
- Rollbacks

**Escalate when**:
- Issue persists after restart
- Data integrity concerns
- Security incident suspected

### Level 2: Platform Team

**Handles**:
- Infrastructure issues
- Database problems
- Complex deployments

**Escalate when**:
- Supabase outage
- Fly.io platform issues
- Need infrastructure changes

### Level 3: Security Team

**Handles**:
- Security incidents
- Data breaches
- Compliance issues

**Contact immediately for**:
- Suspected breach
- Unauthorized access
- Data exposure

## Maintenance Windows

| Task | Frequency | Duration | Impact |
|------|-----------|----------|--------|
| Database backup verification | Daily | None | None |
| Dependency updates | Weekly | 15 min | Brief downtime |
| Security patches | As needed | 30 min | Brief downtime |
| Major upgrades | Monthly | 1-2 hours | Scheduled maintenance |

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
