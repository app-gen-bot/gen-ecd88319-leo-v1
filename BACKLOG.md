# Leo V1 Backlog

Tasks for future prompts to Leo.

---

## 1. Filter Screenshot Streaming by Start Time

**Priority:** Medium
**Added:** 2026-01-30

### Problem

When leo-worker starts, it streams ALL screenshots from the workspace, including old ones from previous generations. This causes a rapid flood of stale images during startup.

### Solution

Filter screenshots by modification time:
1. Record start time when leo-worker initializes
2. Only stream screenshots where mtime >= start_time
3. Add 1-second buffer (start_time - 1s) to handle edge cases

### Files to Investigate

- `runtime/wsi/client.py` - WSI client, likely handles screenshot streaming
- `leo/monitor/` - Process monitor (may also be involved)

### Constraint

DO NOT modify `leo/agents/` - changes limited to runtime/wsi layer.

### Prompt

```
Fix screenshot streaming to only show current session images.

When leo-worker starts, it streams ALL screenshots from the workspace, including
old ones from previous generations. This causes a rapid flood of stale images.

Filter screenshots by modification time:
1. Record start time when leo-worker initializes
2. Only stream screenshots where mtime >= start_time
3. Add 1-second buffer (start_time - 1s) to handle edge cases

Files to investigate:
- runtime/wsi/client.py - WSI client, likely handles screenshot streaming
- leo/monitor/ - Process monitor (may also be involved)

Constraint: DO NOT modify leo/agents/ - changes limited to runtime/wsi layer.
```

---
