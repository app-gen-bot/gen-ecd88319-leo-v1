# Pattern 7: ID Type Consistency Fallback

**Source:** Coverage Gap #2
**Impact:** Prevents 404 errors when frontend passes different ID types

---

## The Problem

Strict ID type checking causes 404 errors:

```typescript
// ❌ WRONG: No fallback (strict ID type checking)
// server/routes/campaigns.routes.ts (ts-rest handler)
getCampaignMetrics: {
  middleware: [authMiddleware()],
  handler: async ({ params, req }) => {
    const storage = req.app.locals.storage;
    const campaign = await storage.getCampaignById(params.id);
    if (!campaign) {
      return { status: 404 as const, body: { error: 'Campaign not found' } };
    }
    return { status: 200 as const, body: campaign.metrics };
  }
}

// Problem: Frontend context may pass either:
// - Campaign ID: works
// - Campaign-order ID: 404 error (no fallback!)
```

---

## The Solution

**Fallback logic to handle both entity types:**

```typescript
// ✅ CORRECT: Try direct ID, fall back to parent/child lookup
// server/routes/campaigns.routes.ts (ts-rest handler)
getCampaignMetrics: {
  middleware: [authMiddleware()],
  handler: async ({ params, req }) => {
    const storage = req.app.locals.storage;
    const { id } = params;

    // 1. Try as direct campaign ID
    let campaign = await storage.getCampaignById(id);

    if (!campaign) {
      // 2. Fall back: treat as campaign-order ID, get all campaigns
      const campaigns = await storage.getCampaigns({
        campaignOrderId: id,
        userId: req.user.id  // Security: filter by user
      });

      if (campaigns.length > 0) {
        // Aggregate metrics from all campaigns for this campaign-order
        const aggregated = aggregateCampaignMetrics(campaigns);
        return { status: 200 as const, body: aggregated };
      }

      return { status: 404 as const, body: { error: 'Campaign not found' } };
    }

    // Return metrics for single campaign
    return { status: 200 as const, body: campaign.metrics };
  }
}
```

---

## Helper Function Pattern

```typescript
function aggregateCampaignMetrics(campaigns: Campaign[]) {
  return {
    totalImpressions: campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
    averageCTR: campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length,
    totalSpend: campaigns.reduce((sum, c) => sum + c.metrics.spend, 0),
  };
}
```

---

## When to Use ID Flexibility

1. **Metrics/stats endpoints** - Work on both individual and grouped resources
2. **Search endpoints** - Accept multiple ID types
3. **Hierarchical data** - project → tasks, campaign-order → campaigns

---

## Security Consideration

**ALWAYS filter by userId when using fallback queries:**

```typescript
// ✅ CORRECT: User-scoped fallback
const campaigns = await storage.getCampaigns({
  campaignOrderId: id,
  userId: req.user.id  // CRITICAL: Prevents unauthorized access
});

// ❌ WRONG: No user filter (security hole!)
// const campaigns = await storage.getCampaigns({ campaignOrderId: id });
```

---

## When NOT to Use Fallback

- Create/update/delete operations (strict ID required)
- Operations that modify state (must target exact resource)
- Simple CRUD endpoints with single entity type

---

## Validation Check

```bash
# Check metrics endpoints for fallback logic
grep -A 20 "router.get.*metrics" server/routes/*.ts | grep -c "if (!.*)"

# Expected: At least N fallback checks (where N = number of metrics endpoints)
```

---

## Why This Matters

Frontend components may pass different ID types based on user context (detail view vs list view).
