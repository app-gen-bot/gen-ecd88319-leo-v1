# Pattern 6: Date Calculation Edge Cases

**Source:** Coverage Gap #1
**Impact:** Prevents negative percentages and broken UI displays

---

## The Problem

Unclamped calculations break UI displays:

```typescript
// ❌ WRONG: No clamping (allows negative values)
function calculateProgress(startDate: Date, endDate: Date) {
  const now = new Date();
  const daysElapsed = now.diff(startDate, 'days');  // -42 for future dates!
  const totalDays = endDate.diff(startDate, 'days');
  const progress = (daysElapsed / totalDays) * 100;  // -42.9%!
  return progress;
}

// Result: Negative percentages, broken UI, confusing displays
```

---

## The Solution

**Always clamp date-based calculations to valid ranges:**

```typescript
// ✅ CORRECT: Clamped calculations
function calculateProgress(startDate: Date, endDate: Date) {
  const now = new Date();

  // Prevent negative values for future start dates
  const daysElapsed = Math.max(0, daysBetween(startDate, now));
  const totalDays = daysBetween(startDate, endDate);

  // Clamp percentage to 0-100 range
  const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));

  return progress;
}

function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
```

---

## Common Edge Cases to Handle

### 1. Future start dates
```typescript
const daysElapsed = Math.max(0, daysBetween(startDate, now));
```

### 2. Past end dates
```typescript
const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
```

### 3. Same-day ranges
```typescript
if (totalDays === 0) return 100;  // Same day = complete
const progress = (daysElapsed / totalDays) * 100;
```

### 4. Timezone issues
```typescript
const startUTC = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
const endUTC = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));
```

### 5. Month indexing
```typescript
// ✅ CORRECT: February is month 1
new Date(2025, 1, 15)  // February 15, 2025 (month 1 = Feb)

// ❌ WRONG: February is NOT month 2
// new Date(2025, 2, 15)  // March 15, 2025 (not February!)
```

---

## Seed Data Timestamp Generation

```typescript
// ✅ CORRECT: Use helper for consistent timestamps
function generateTimestamp(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

// Usage in seed data
private seedData() {
  this.items.set('item-1', {
    id: 'item-1',
    name: 'Sample Item',
    createdAt: generateTimestamp(-7),   // 7 days ago
    startDate: generateTimestamp(0),    // Today
    endDate: generateTimestamp(30),     // 30 days from now
  });
}
```

---

## Validation Check

```bash
# Check for unclamped date calculations
grep -r "daysElapsed\|progress.*=" server/ client/ | grep -v "Math.max\|Math.min"

# Expected: ZERO matches (all calculations should use Math.max/min)
```

---

## Why This Matters

Unclamped calculations break UI displays, show confusing negative values, and cause rendering errors.
