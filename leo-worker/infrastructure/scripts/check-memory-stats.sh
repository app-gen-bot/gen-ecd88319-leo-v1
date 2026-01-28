#!/bin/bash
# Check ECS task memory usage statistics
# Usage: ./check-memory-stats.sh [hours-back] [percentiles]

HOURS_BACK=${1:-24}
PROFILE=${AWS_PROFILE:-jake-dev}

echo "📊 ECS Task Memory Statistics (last ${HOURS_BACK} hours)"
echo "=========================================="

# Get CloudWatch metrics for generator tasks
START_TIME=$(date -u -d "${HOURS_BACK} hours ago" +%Y-%m-%dT%H:%M:%S)
END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)

echo ""
echo "Generator Task Memory Utilization:"
echo "------------------------------------------"

# Get raw datapoints
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=TaskDefinitionFamily,Value=AppGenSaasStackAppGeneratorTaskDef8A17B48C \
             Name=ClusterName,Value=app-gen-saas-cluster \
  --start-time "$START_TIME" \
  --end-time "$END_TIME" \
  --period 60 \
  --statistics Average --statistics Maximum \
  --region us-east-1 \
  --profile "$PROFILE" \
  --query 'Datapoints[*].[Timestamp,Average,Maximum]' \
  --output text | sort | tail -20

echo ""
echo "Summary Statistics:"
echo "------------------------------------------"

# Calculate percentiles using awk
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=TaskDefinitionFamily,Value=AppGenSaasStackAppGeneratorTaskDef8A17B48C \
             Name=ClusterName,Value=app-gen-saas-cluster \
  --start-time "$START_TIME" \
  --end-time "$END_TIME" \
  --period 60 \
  --statistics Maximum \
  --region us-east-1 \
  --profile "$PROFILE" \
  --query 'Datapoints[*].Maximum' \
  --output text | tr '\t' '\n' | sort -n | \
  awk '
    BEGIN { count = 0; sum = 0; }
    {
      values[count++] = $1;
      sum += $1;
    }
    END {
      if (count > 0) {
        print "Total samples: " count;
        print "Average: " sum/count "%";
        print "Min: " values[0] "%";
        print "P50 (median): " values[int(count*0.50)] "%";
        print "P90: " values[int(count*0.90)] "%";
        print "P95: " values[int(count*0.95)] "%";
        print "P99: " values[int(count*0.99)] "%";
        print "Max: " values[count-1] "%";

        # Calculate actual memory usage if P95 is known
        # Current allocation: 4096 MB
        p95_pct = values[int(count*0.95)];
        p95_mb = (p95_pct / 100) * 4096;
        p99_pct = values[int(count*0.99)];
        p99_mb = (p99_pct / 100) * 4096;

        print "";
        print "Actual Memory Usage (based on 4096MB allocation):";
        print "P95: " p95_mb " MB";
        print "P99: " p99_mb " MB";

        # Recommendations
        if (p99_pct > 90) {
          print "";
          print "⚠️  RECOMMENDATION: Increase memory (P99 > 90%)";
        } else if (p95_pct < 50) {
          print "";
          print "💡 OPTIMIZATION: Can reduce memory (P95 < 50%)";
        } else {
          print "";
          print "✅ Memory allocation looks good";
        }
      }
    }
  '
