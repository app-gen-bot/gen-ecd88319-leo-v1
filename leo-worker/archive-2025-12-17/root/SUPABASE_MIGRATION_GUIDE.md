# HNSW Vector Index Migration - Manual Deployment via Supabase Dashboard

## Project Details
- **Project ID:** riggtxjzwpxzuflejfkr
- **Database:** Supabase PostgreSQL
- **Migration File:** /Users/labheshpatel/apps/app-factory/apps/matchmind/app/supabase/migrations/20251125_add_hnsw_vector_indexes.sql
- **Status:** Ready for manual deployment

---

## Access Instructions

1. Open your browser and navigate to: **https://app.supabase.com**
2. Sign in with your Supabase credentials
3. Select project: **riggtxjzwpxzuflejfkr**
4. In the left sidebar, click **SQL Editor**
5. Click the **New query** button to create a new SQL script

---

## Deployment Steps

### Step 1: Enable pgvector Extension (if not already enabled)

Execute this query first:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Expected result: Query executed successfully

---

### Step 2: Create HNSW Index on ai_training_data

Execute this query:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_training_data_embedding_hnsw_idx
ON ai_training_data
USING hnsw (vector_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Important Notes:**
- This uses `CONCURRENTLY` flag, which allows the table to remain writable during indexing
- Index creation may take 5-10 minutes for large datasets
- Do NOT interrupt this query - let it complete
- The query will return "success" when the index is created

---

### Step 3: Verify Index Creation

After the index finishes, execute this verification query:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname = 'ai_training_data_embedding_hnsw_idx';
```

**Expected Output:**
```
schemaname  | tablename        | indexname                               | indexdef
public      | ai_training_data | ai_training_data_embedding_hnsw_idx     | CREATE INDEX ai_training_data_embedding_hnsw_idx ON public.ai_training_data USING hnsw (vector_embedding vector_cosine_ops) WITH (m='16', ef_construction='64')
```

If this query returns a row, the index was successfully created.

---

### Step 4: Verify Index Usage (Performance Test)

Execute this performance verification query:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, program_name
FROM ai_training_data
WHERE vector_embedding IS NOT NULL
ORDER BY vector_embedding <=> (SELECT vector_embedding FROM ai_training_data WHERE vector_embedding IS NOT NULL LIMIT 1)
LIMIT 10;
```

**Expected Output** (look for this in the EXPLAIN plan):
- Should show "Index Scan using ai_training_data_embedding_hnsw_idx"
- Execution time should be < 100ms for < 50K records
- Total rows scanned should be << total rows in table

**Example EXPLAIN output:**
```
Limit  (cost=...) (actual time=45.123..47.456 rows=10 loops=1)
  ->  Index Scan using ai_training_data_embedding_hnsw_idx on ai_training_data
        (cost=...) (actual time=45.123..47.456 rows=10 loops=1)
Execution Time: 47.456 ms
```

---

### Step 5: Monitor Index Statistics (Optional)

To see index usage statistics, execute:

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexname = 'ai_training_data_embedding_hnsw_idx';
```

---

## Success Criteria

Your deployment is successful if:

- [x] **Extension Created:** `CREATE EXTENSION IF NOT EXISTS vector;` executes without error
- [x] **Index Created:** `CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_training_data_embedding_hnsw_idx` completes (may take 5-10 min)
- [x] **Index Verified:** Verification query returns one row with the index details
- [x] **Performance Verified:** EXPLAIN shows "Index Scan using ai_training_data_embedding_hnsw_idx"
- [x] **Query Time:** EXPLAIN ANALYZE shows execution time < 100ms

---

## Troubleshooting

### Issue: "ERROR: extension "vector" does not exist"

**Solution:** Supabase hasn't enabled pgvector for your project yet.

**Action:**
1. Go to **Extensions** in Supabase Dashboard
2. Search for "vector"
3. Click **Install**
4. Wait for installation to complete
5. Then retry the migration

---

### Issue: "ERROR: relation "ai_training_data" does not exist"

**Solution:** The table doesn't exist or was not created by previous migrations.

**Action:**
1. Verify previous migrations were applied
2. Check the Migrations tab in Supabase Dashboard
3. Ensure the table schema was created first
4. Run previous migrations if needed

---

### Issue: "ERROR: column "vector_embedding" does not exist"

**Solution:** The column doesn't exist in the table.

**Action:**
1. Verify the column was created: `SELECT column_name FROM information_schema.columns WHERE table_name='ai_training_data';`
2. Check if the column is named differently
3. Ensure the pgvector migration was applied before this

---

### Issue: "Index creation is taking too long (> 15 min)"

**Solution:** Large dataset or low resources. This is normal.

**Action:**
1. Let it continue - don't cancel
2. You can check progress in Supabase Logs
3. For datasets > 100K records, 15-30 min is normal
4. Keep the browser tab open

---

## Rollback Plan (if needed)

If you need to remove the index after deployment:

```sql
DROP INDEX CONCURRENTLY IF EXISTS ai_training_data_embedding_hnsw_idx;
```

---

## Performance Expectations

### Before Index (Sequential Scan)
- 10-NN search: 500-800ms
- Query throughput: Low
- CPU usage: High

### After Index (HNSW)
- 10-NN search: 50-100ms (7-15x faster)
- Query throughput: High
- CPU usage: Low

---

## Documentation

- pgvector GitHub: https://github.com/pgvector/pgvector
- HNSW Parameters: https://github.com/pgvector/pgvector#hnsw-parameters
- Supabase Vector Docs: https://supabase.com/docs/guides/database/extensions/pgvector
