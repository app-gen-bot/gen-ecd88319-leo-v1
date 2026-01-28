# Pattern 1: Storage Method Completeness Check

**Source:** EdVisor Issue #5
**Impact:** Prevents 80% stub methods causing runtime failures at T+60min

---

## The Problem

EdVisor monitoring showed 80% of storage methods were stubs that throw errors:

```typescript
// ❌ WRONG: Stub method (causes runtime failure)
async getItems() {
  throw new Error('Not implemented');  // Feature doesn't work!
}

async createItem(item: InsertItem) {
  throw new Error('Not implemented');  // User gets error!
}
```

**Result**: Features appear to work in development but fail in production. User clicks button → gets "Not implemented" error → feature is broken.

---

## The Solution

**ALL storage methods MUST be fully implemented. NO stubs allowed.**

### Complete Implementation Example

```typescript
// ✅ CORRECT: Full implementation with proper logic
class MemoryStorage implements IStorage {
  private items = new Map<string, Item>();

  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItemById(id: string): Promise<Item | null> {
    return this.items.get(id) || null;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const id = `00000000-0000-0000-0000-${String(this.items.size + 1).padStart(12, '0')}`;
    const newItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item | null> {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...item,
      updatedAt: new Date().toISOString(),
    };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  // Additional methods also fully implemented...
}
```

---

## Validation Check

**RUN BEFORE marking storage layer complete:**

```bash
# Check for stub methods
grep -r "throw new Error.*Not implemented" server/lib/storage/
grep -r "TODO: Implement" server/lib/storage/

# Expected: ZERO matches
# If ANY matches found → implementation INCOMPLETE → MUST FIX
```

**Alternative check using grep count:**
```bash
# Count stub methods
stub_count=$(grep -r "throw new Error.*Not implemented" server/lib/storage/ | wc -l)

if [ "$stub_count" -gt 0 ]; then
  echo "❌ ERROR: Found $stub_count stub methods"
  echo "❌ MUST implement ALL methods before proceeding"
  exit 1
else
  echo "✅ All storage methods implemented"
fi
```

---

## IStorage Interface

**Reference for ALL required methods:**

```typescript
interface IStorage {
  // Basic CRUD
  getItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | null>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;

  // Queries
  findItemsBy(filter: Partial<Item>): Promise<Item[]>;
  countItems(filter?: Partial<Item>): Promise<number>;

  // User-scoped (if applicable)
  getItemsByUserId(userId: string): Promise<Item[]>;
}
```

**Every method MUST be implemented**. No exceptions.

---

## Common Stub Patterns to Avoid

### ❌ Pattern 1: Throw Error
```typescript
async getItems() {
  throw new Error('Not implemented');
}
```

### ❌ Pattern 2: TODO Comment
```typescript
async getItems() {
  // TODO: Implement this
  return [];
}
```

### ❌ Pattern 3: Empty Implementation
```typescript
async getItems() {
  return [];  // Always empty - not actually implemented
}
```

### ❌ Pattern 4: Partial Implementation
```typescript
async getItems() {
  // Only returns one hardcoded item
  return [{ id: '1', name: 'Test' }];
}
```

---

## Why This Matters

**Timeline of Failure:**
1. T+0: Generate code with stubs
2. T+10min: Code compiles, tests pass (no runtime checks)
3. T+60min: User tests feature → clicks button → "Not implemented" error
4. T+120min: Developer debugging, rewriting methods

**Prevention**: Implement ALL methods upfront = saves 2+ hours debugging later.

---

## ENFORCEMENT RULE

**IF grep finds ANY stubs:**
1. STOP immediately
2. Implement ALL missing methods
3. Re-run grep validation
4. Only proceed when grep returns ZERO matches

**NO EXCEPTIONS**. Stubs cause production failures.

---

## EdVisor Evidence

- **Issue:** #5 - Storage method completeness
- **Frequency:** 80% of storage implementations had stubs
- **Discovery Time:** T+60 minutes (after initial testing)
- **Debug Time:** 2-3 hours per occurrence
- **Fix:** Mandatory grep validation before completion

---

**Next Pattern**: Interactive Component State Management (INTERACTIVE_STATE.md)
