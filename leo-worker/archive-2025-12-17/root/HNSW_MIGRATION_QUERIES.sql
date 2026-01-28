-- ============================================================================
-- HNSW Vector Index Migration - SQL Queries for Supabase Dashboard
-- ============================================================================
-- 
-- Project: MatchMind
-- Database: riggtxjzwpxzuflejfkr
-- Date: 2025-11-25
--
-- Execute these queries in order in the Supabase SQL Editor
--
-- ============================================================================

-- STEP 1: Enable pgvector extension
-- Execute this first to ensure pgvector is available

CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================================================

-- STEP 2: Create HNSW index on ai_training_data.vector_embedding
-- Note: This uses CONCURRENTLY to avoid blocking writes
-- Expected time: 5-10 minutes depending on dataset size

CREATE INDEX CONCURRENTLY IF NOT EXISTS ai_training_data_embedding_hnsw_idx
ON ai_training_data
USING hnsw (vector_embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);


-- ============================================================================

-- STEP 3: Verify index creation
-- Run this after the index creation completes
-- Expected: Should return 1 row with index details

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE indexname = 'ai_training_data_embedding_hnsw_idx';


-- ============================================================================

-- STEP 4: Verify index is being used (performance test)
-- Expected: Should show "Index Scan using ai_training_data_embedding_hnsw_idx"
-- Execution time should be < 100ms

EXPLAIN (ANALYZE, BUFFERS)
SELECT id, program_name
FROM ai_training_data
WHERE vector_embedding IS NOT NULL
ORDER BY vector_embedding <=> (SELECT vector_embedding FROM ai_training_data WHERE vector_embedding IS NOT NULL LIMIT 1)
LIMIT 10;


-- ============================================================================

-- STEP 5: (Optional) Monitor index statistics
-- Shows how many times the index has been used

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


-- ============================================================================

-- ROLLBACK (if needed): Remove the index
-- DROP INDEX CONCURRENTLY IF EXISTS ai_training_data_embedding_hnsw_idx;
