# HNSW Vector Index Deployment - Verification Checklist

**Project:** MatchMind  
**Database:** Supabase (riggtxjzwpxzuflejfkr)  
**Date:** November 25, 2025  
**Index Name:** ai_training_data_embedding_hnsw_idx

---

## Pre-Deployment Verification

Use this checklist BEFORE starting the deployment.

### Prerequisites
- [ ] Supabase account access verified
- [ ] Project ID confirmed: riggtxjzwpxzuflejfkr
- [ ] Browser tab can stay open for 15-20 minutes
- [ ] Migration file exists: 20251125_add_hnsw_vector_indexes.sql
- [ ] All deployment documents downloaded/saved

### Database State
- [ ] ai_training_data table exists
- [ ] vector_embedding column exists in ai_training_data
- [ ] Previous migrations have completed successfully
- [ ] No existing index named ai_training_data_embedding_hnsw_idx

**Verification Query:**
```sql
SELECT 
  t.table_name,
  c.column_name,
  c.data_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name = 'ai_training_data'
  AND c.column_name IN ('id', 'program_name', 'vector_embedding')
ORDER BY c.ordinal_position;
```

Expected result: 3 rows (id, program_name, vector_embedding)

---

## Phase 1 Verification - pgvector Extension

### During Execution
- [ ] Supabase SQL Editor open and ready
- [ ] Query pasted correctly: `CREATE EXTENSION IF NOT EXISTS vector;`

### After Execution
- [ ] Query completes successfully
- [ ] No error messages shown
- [ ] Status shows "Query complete"

**Verification Query:**
```sql
SELECT extname, extversion 
FROM pg_extension 
WHERE extname = 'vector';
```

Expected result: 1 row showing vector extension version

---

## Phase 2 Verification - HNSW Index Creation

### Before Starting
- [ ] Phase 1 completed successfully
- [ ] Understand this will take 5-10 minutes
- [ ] Browser tab will remain open
- [ ] You will NOT interrupt the query

### During Execution
- [ ] Index creation query pasted correctly
- [ ] Query starts executing
- [ ] Browser tab remains open
- [ ] You monitor for "Query complete" message
- [ ] Expected time: 5-10 minutes
- [ ] Query is NOT interrupted

### After Execution
- [ ] Query completes without timeout
- [ ] Status shows "Query complete"
- [ ] No "already exists" or duplicate index errors
- [ ] No out-of-memory errors
- [ ] No connection timeout errors

**What to expect:** Query will show "0 rows" - this is normal for CREATE INDEX

---

## Phase 3 Verification - Index Exists

### Execution
- [ ] Phase 2 completed successfully
- [ ] Verification query copied from HNSW_MIGRATION_QUERIES.sql
- [ ] Query executes in SQL Editor

### Query Results
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname = 'ai_training_data_embedding_hnsw_idx';
```

### Expected Results
- [ ] Query returns exactly 1 row
- [ ] schemaname = 'public'
- [ ] tablename = 'ai_training_data'
- [ ] indexname = 'ai_training_data_embedding_hnsw_idx'
- [ ] indexdef contains: 'USING hnsw'
- [ ] indexdef contains: 'vector_cosine_ops'
- [ ] indexdef contains: 'm=\'16\''
- [ ] indexdef contains: 'ef_construction=\'64\''

### If No Rows Returned
- [ ] Wait 2 minutes - index creation may still be in progress
- [ ] Check Supabase Logs for any errors
- [ ] Try the query again
- [ ] If still no results, check troubleshooting in HNSW_DEPLOYMENT_REPORT.md

---

## Phase 4 Verification - Performance Test

### Execution
- [ ] Phase 3 verified successfully
- [ ] Performance test query copied from HNSW_MIGRATION_QUERIES.sql
- [ ] Query executes: EXPLAIN (ANALYZE, BUFFERS) ...

### Query Results - Index Usage
The EXPLAIN output should contain:
- [ ] "Index Scan using ai_training_data_embedding_hnsw_idx"
- [ ] No "Seq Scan" (sequential scan is slower)
- [ ] Rows returned: 10 (or less if table has < 10 records)

### Query Results - Performance
- [ ] Planning Time: typically < 1ms
- [ ] Execution Time: < 100ms (success criterion)
- [ ] Total time: < 150ms

### Query Results - Buffers
- [ ] Buffers: shared hit > 0 (index was used from cache)
- [ ] No "spilled" buffers (indicates OOM issues)

### Example Good Output
```
QUERY PLAN
-----------
Limit  (cost=0.29..13.29 rows=10) (actual time=45.123..47.456 rows=10 loops=1)
  ->  Index Scan using ai_training_data_embedding_hnsw_idx on ai_training_data
        (cost=0.29..13.29 rows=10 loops=1)
        Order By: (vector_embedding <=> ($0))
        Buffers: shared hit=42
Execution Time: 47.456 ms
```

### If Seq Scan Shown Instead of Index Scan
- [ ] Run: `ANALYZE ai_training_data;`
- [ ] Wait 30 seconds
- [ ] Retry EXPLAIN (ANALYZE, BUFFERS) query
- [ ] Check troubleshooting guide if still showing Seq Scan

### If Execution Time > 100ms
- [ ] This may be normal for very large datasets
- [ ] Check dataset size with: `SELECT COUNT(*) FROM ai_training_data;`
- [ ] If < 50K records: investigate (see troubleshooting)
- [ ] If > 100K records: performance is acceptable

---

## Post-Deployment Verification

### Immediate (After index verification)
- [ ] All 4 phases completed successfully
- [ ] Index verified in pg_indexes
- [ ] Index verified in use by EXPLAIN ANALYZE
- [ ] Query execution time < 100ms

### Short-term (Next 24 hours)
- [ ] Application running without errors
- [ ] No database connection issues
- [ ] No timeout errors in application logs
- [ ] Vector similarity queries working correctly

### Medium-term (First week)
- [ ] Monitor application performance metrics
- [ ] Track vector query response times
- [ ] Verify index_scan count > 0 (run Phase 5 query)
- [ ] Check index size hasn't exceeded limits

### Long-term (Ongoing monitoring)
- [ ] Index usage remains consistent
- [ ] Query performance remains improved
- [ ] Plan scaling if data exceeds 100K records
- [ ] Monitor index size growth

---

## Rollback Verification (if needed)

### If You Need to Rollback

Execute:
```sql
DROP INDEX CONCURRENTLY IF NOT EXISTS ai_training_data_embedding_hnsw_idx;
```

### Verify Rollback
- [ ] Query completes successfully
- [ ] Status shows "Query complete"

### Verify Index Removed
```sql
SELECT * FROM pg_indexes 
WHERE indexname = 'ai_training_data_embedding_hnsw_idx';
```

- [ ] Query returns 0 rows (index successfully removed)
- [ ] Table data remains intact (no data loss)
- [ ] Can redeploy index anytime

---

## Success Criteria Summary

Your deployment is SUCCESSFUL if ALL boxes are checked:

### Critical Success Criteria
- [ ] Phase 1: pgvector extension created
- [ ] Phase 2: HNSW index created (no timeout/errors)
- [ ] Phase 3: Index exists in pg_indexes (1 row returned)
- [ ] Phase 4: EXPLAIN shows "Index Scan using ai_training_data_embedding_hnsw_idx"
- [ ] Phase 4: Execution time < 100ms
- [ ] Phase 4: Query returns 10 rows (or less)

### Deployment is FAILED if ANY of these occur:
- [ ] Phase 1 error: CREATE EXTENSION fails
- [ ] Phase 2 timeout: Index creation exceeds 30 minutes
- [ ] Phase 2 error: Duplicate index, access denied, or other errors
- [ ] Phase 3: No rows returned from pg_indexes query
- [ ] Phase 4: Shows "Seq Scan" instead of "Index Scan"
- [ ] Phase 4: Execution time > 100ms for < 50K records
- [ ] Any error messages in any phase

---

## Performance Baseline (for comparison)

### Before Index (Sequential Scan)
- Query time: 500-800ms
- CPU usage: High (100% during query)
- Index scans: 0
- Throughput: Low

### Expected After Index (HNSW)
- Query time: 50-100ms (7-15x faster)
- CPU usage: Low (20-30% during query)
- Index scans: 100% of queries
- Throughput: High

**Acceptance threshold:**
- If execution time < 100ms: Deployment successful
- If execution time 100-200ms: Acceptable for > 50K records
- If execution time > 200ms: Investigate (see troubleshooting)

---

## Documentation Checklist

### Save These Documents
- [ ] HNSW_QUICK_REFERENCE.txt (quick reminder)
- [ ] SUPABASE_MIGRATION_GUIDE.md (step-by-step)
- [ ] HNSW_MIGRATION_QUERIES.sql (SQL commands)
- [ ] HNSW_DEPLOYMENT_REPORT.md (comprehensive reference)
- [ ] HNSW_MIGRATION_SUMMARY.md (overview)
- [ ] DEPLOYMENT_VERIFICATION_CHECKLIST.md (this file)

### Bookmark These Links
- [ ] Supabase Project: https://app.supabase.com/project/riggtxjzwpxzuflejfkr
- [ ] pgvector Docs: https://github.com/pgvector/pgvector
- [ ] HNSW Guide: https://github.com/pgvector/pgvector#hnsw-parameters
- [ ] Supabase Vector: https://supabase.com/docs/guides/database/extensions/pgvector

---

## Sign-Off

### Deployment Execution
- **Started:** _______________
- **Completed:** _______________
- **Duration:** _______________
- **Deployed By:** _______________

### Verification Results
- **Phase 1 Status:** [ ] PASS [ ] FAIL
- **Phase 2 Status:** [ ] PASS [ ] FAIL
- **Phase 3 Status:** [ ] PASS [ ] FAIL
- **Phase 4 Status:** [ ] PASS [ ] FAIL
- **Overall Status:** [ ] SUCCESS [ ] FAILED

### Notes
```
[Add any notes, observations, or issues here]




```

### Follow-up Actions Needed
```
[List any follow-up actions, tuning, or monitoring needed]




```

---

## Quick Troubleshooting Reference

| Issue | Quick Fix |
|-------|-----------|
| Extension doesn't exist | Go to Extensions tab > Install "vector" |
| Table doesn't exist | Check previous migrations in Migrations tab |
| Column doesn't exist | Apply pgvector migration first |
| Index creation timeout | Let it run longer (up to 30 min is normal) |
| Seq Scan instead of Index | Run ANALYZE ai_training_data; then retry |
| Execution time > 100ms | Check dataset size, may be normal for > 50K records |
| Any error in Phase 1-2 | See HNSW_DEPLOYMENT_REPORT.md troubleshooting section |

---

*For complete troubleshooting, refer to HNSW_DEPLOYMENT_REPORT.md*

**Deployment Package Version:** 1.0  
**Generated:** 2025-11-25
