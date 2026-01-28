# Infrastructure Scripts

## Service Scaling (Cost Savings)

### scale-down.sh

Put the service to sleep when not in use:

```bash
./scripts/scale-down.sh
```

**What it does:**
- Scales ECS service desired count to 0
- Stops all running tasks within 1-2 minutes
- Reduces costs to near-zero (only data storage costs remain)

**Cost savings:** ~$17/month while scaled down

### scale-up.sh

Wake up the service when you need it:

```bash
./scripts/scale-up.sh
```

**What it does:**
- Scales ECS service desired count to 1
- Starts the orchestrator task
- Waits for health checks to pass (60-90 seconds)
- Shows service URL when ready

**Use case:** Scale down overnight/weekends, scale up when testing or demoing

---

## Memory Usage Monitoring

### check-memory-stats.sh

Get P50/P90/P99 percentile stats for generator task memory usage:

```bash
# Check last 24 hours (default)
./scripts/check-memory-stats.sh

# Check last 7 days
./scripts/check-memory-stats.sh 168

# Check last 30 days
./scripts/check-memory-stats.sh 720
```

**Output includes:**
- Recent memory utilization samples
- Statistical summary (min, avg, P50, P90, P95, P99, max)
- Actual memory usage in MB based on current allocation
- Recommendations for right-sizing

**Example output:**
```
📊 ECS Task Memory Statistics (last 24 hours)
==========================================

Generator Task Memory Utilization:
------------------------------------------
[Recent samples shown here]

Summary Statistics:
------------------------------------------
Total samples: 245
Average: 42.3%
Min: 28.1%
P50 (median): 41.2%
P90: 58.7%
P95: 62.4%
P99: 71.3%
Max: 75.8%

Actual Memory Usage (based on 8192MB allocation):
P95: 5113 MB
P99: 5841 MB

✅ Memory allocation looks good
```

**Right-sizing recommendations:**
- **P99 > 90%**: Increase memory (risk of OOM)
- **P95 < 50%**: Can reduce memory (cost optimization)
- **P95 50-90%**: Current allocation is good

### Cost Comparison

Current allocation (8GB / 4 vCPU):
- **$0.20/hour** = **$0.05 per 15-minute generation**
- Very cheap for MVP - prevents user-facing failures

After collecting stats, you can right-size:
- If P99 < 60%, could use 4GB ($0.10/hour)
- If P99 > 85%, should use 16GB ($0.40/hour)
