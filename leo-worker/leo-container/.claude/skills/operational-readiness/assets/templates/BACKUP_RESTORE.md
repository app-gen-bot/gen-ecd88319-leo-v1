# Backup and Restore Procedures

## Overview

This document describes the backup strategy and restore procedures for the application.

| Field | Value |
|-------|-------|
| **App Name** | [TODO: App name] |
| **Version** | [TODO: Version] |
| **Date** | [TODO: Date] |
| **Database Provider** | Supabase (PostgreSQL) |
| **Hosting Provider** | Fly.io |

## Backup Summary

| Component | Backup Method | Frequency | Retention |
|-----------|---------------|-----------|-----------|
| Database | Supabase automatic | Daily | 7 days (Pro: 30 days) |
| Database PITR | Supabase Pro | Continuous | 7 days |
| Application Code | GitHub | On commit | Unlimited |
| Secrets | AWS Secrets Manager | On change | Versioned |
| Container Images | Fly.io Registry | On deploy | Recent releases |

## Database Backups

### Supabase Automatic Backups

Supabase provides automatic daily backups:

| Plan | Backup Frequency | Retention | PITR |
|------|-----------------|-----------|------|
| Free | Daily | 7 days | No |
| Pro | Daily | 30 days | Yes (7 days) |
| Team | Daily | 30 days | Yes (14 days) |

**Access Backups**:
1. Go to Supabase Dashboard
2. Navigate to Settings → Database
3. Click "Backups" tab
4. Download or restore from available snapshots

### Point-in-Time Recovery (PITR)

For Supabase Pro/Team plans:

```bash
# PITR allows recovery to any point within retention window
# Contact Supabase support for PITR restore requests
```

**When to use PITR**:
- Accidental data deletion
- Corruption from bad migration
- Recovery from security incident

### Manual Backup (pg_dump)

For additional backup control:

```bash
# Get connection string from Supabase Dashboard
# Settings → Database → Connection string → URI

# Create backup
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Backup specific tables
pg_dump "postgresql://..." \
  --table=users \
  --table=items \
  --file=partial_backup.dump
```

**Store backups securely**:
- Encrypt backup files
- Store in separate location (S3, etc.)
- Test restore periodically

## Restore Procedures

### Restore from Supabase Dashboard

1. Go to Supabase Dashboard → Settings → Database → Backups
2. Select the backup point to restore
3. Click "Restore"
4. **Warning**: This replaces current data

### Restore from pg_dump Backup

```bash
# Restore to a clean database
pg_restore \
  --dbname="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --clean \
  --if-exists \
  backup_file.dump

# Restore specific tables only
pg_restore \
  --dbname="postgresql://..." \
  --table=users \
  backup_file.dump
```

### Partial Data Recovery

For recovering specific records:

```bash
# 1. Restore backup to a temporary database
createdb temp_restore
pg_restore --dbname=temp_restore backup_file.dump

# 2. Extract needed data
psql temp_restore -c "COPY (SELECT * FROM users WHERE id = 'xxx') TO STDOUT WITH CSV HEADER" > recovered_users.csv

# 3. Import to production
psql production_db -c "COPY users FROM STDIN WITH CSV HEADER" < recovered_users.csv

# 4. Clean up
dropdb temp_restore
```

## Application Rollback

### Code Rollback (Git)

```bash
# View recent commits
git log --oneline -10

# Revert to specific commit
git revert HEAD  # Revert last commit
git revert abc123  # Revert specific commit

# Force rollback (use with caution)
git reset --hard abc123
git push --force  # Requires force push permission
```

### Container Rollback (Fly.io)

See FLYIO_ROLLBACK.md for detailed procedures.

```bash
# Quick rollback to previous release
fly releases rollback -a [app-name]
```

## Disaster Recovery

### Scenario 1: Database Corruption

**Symptoms**: Application errors, data inconsistency

**Steps**:
1. **Assess**: Determine extent of corruption
2. **Stop writes**: Scale app to 0 or enable maintenance mode
3. **Identify recovery point**: Find last known good backup
4. **Restore**: Use Supabase restore or pg_restore
5. **Verify**: Test application functionality
6. **Resume**: Scale app back up

**RTO**: 1-4 hours (depending on database size)

### Scenario 2: Accidental Data Deletion

**Symptoms**: User reports missing data

**Steps**:
1. **Identify**: Determine what was deleted and when
2. **Use PITR**: If available, restore to point before deletion
3. **Or manual**: Restore from backup, extract needed records
4. **Merge**: Insert recovered records into production
5. **Verify**: Confirm data restored correctly

**RTO**: 30 minutes - 2 hours

### Scenario 3: Complete Supabase Outage

**Symptoms**: Database connection failures

**Steps**:
1. **Check status**: https://status.supabase.com
2. **Wait or failover**: If prolonged, restore from backup to alternate provider
3. **Update DNS**: Point to failover database
4. **Notify users**: Communicate status

**Note**: For high-availability requirements, consider multi-region setup.

## Testing Backup/Restore

### Monthly Backup Test

```bash
# 1. Download recent backup from Supabase
# 2. Create test database
createdb backup_test_$(date +%Y%m%d)

# 3. Restore backup
pg_restore --dbname=backup_test_$(date +%Y%m%d) backup_file.dump

# 4. Verify data integrity
psql backup_test_$(date +%Y%m%d) -c "SELECT COUNT(*) FROM users"
psql backup_test_$(date +%Y%m%d) -c "SELECT COUNT(*) FROM items"

# 5. Run application tests against restored database
DATABASE_URL="..." npm test

# 6. Clean up
dropdb backup_test_$(date +%Y%m%d)

# 7. Document results
echo "Backup test passed: $(date)" >> backup_test_log.txt
```

### Quarterly DR Drill

1. Simulate database failure
2. Execute restore procedure
3. Verify application functionality
4. Document lessons learned
5. Update procedures as needed

## Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Database Admin | [TODO] | Backup configuration, restore execution |
| On-Call Engineer | [TODO] | First response, escalation |
| Supabase Support | support@supabase.com | Platform issues, PITR requests |

---

*This document is part of the Release Assurance Evidence Pack. See EVIDENCE_MANIFEST.json for integrity verification.*
