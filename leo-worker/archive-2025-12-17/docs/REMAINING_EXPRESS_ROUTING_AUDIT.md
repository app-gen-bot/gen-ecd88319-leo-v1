# Remaining Express Routing Audit

**Date:** 2025-11-17
**Purpose:** Complete inventory of Express routing examples that need ts-rest conversion

---

## Files to Fix

### 1. docs/pipeline-prompt.md (3 locations)

#### Location 1: Lines 218-231 - Security Model Example
```typescript
// CURRENT (WRONG):
router.get('/api/campaigns', authMiddleware(), async (req, res) => {
  const campaigns = await db.select()
    .from(schema.campaigns)
    .where(eq(schema.campaigns.userId, req.user.id));
  res.json(campaigns);
});
```

**Should be ts-rest handler**

#### Location 2: Lines 1626-1629 - CRUD Operations
```typescript
// CURRENT (WRONG):
router.get('/api/items', authMiddleware(), async (req, res) => {
  const items = await storage.getItems(req.user.id);
  res.json(items);
});
```

**Should be ts-rest handler**

#### Location 3: Lines 1641-1648 - AI Generation
```typescript
// CURRENT (WRONG):
router.post('/api/items/:id/generate', authMiddleware(), async (req, res) => {
  const result = await aiAgent.generate({
    itemId: req.params.id,
    ...req.body
  });
  res.json(result);
});
```

**Should be ts-rest handler**

---

### 2. docs/patterns/code_writer/

#### PROXY_METHOD_BINDING.md
- Lines showing auth routes with `router.post('/api/auth/login', ...)`

#### ID_FLEXIBILITY.md
- Multiple instances of `router.get('/api/metrics/campaigns/:id', ...)`

#### CODE_PATTERNS.md
- CRUD examples using `router.post('/api/items', ...)`
- Multiple Express patterns

#### VALIDATION_CHECKLIST.md
- Grep commands referencing `router.get.*metrics`

---

### 3. docs/patterns/api_architect/

#### CONTRACT_REGISTRATION.md
- Need to verify if has Express routing

#### Files we ALREADY FIXED (verify they're clean):
- CORE_IDENTITY.md
- HTTP_STATUS_CODES.md
- RESPONSE_SERIALIZATION.md

---

## Strategy

1. **Verify api_architect files** - Check if our previous fixes worked
2. **Fix pipeline-prompt.md** - Convert 3 examples to ts-rest
3. **Fix code_writer patterns** - Convert all Express examples
4. **Single commit** - "fix: Remove all remaining Express routing examples"

---

## Pattern for Conversion

### Before (Express):
```typescript
router.get('/api/items', authMiddleware(), async (req, res) => {
  const items = await storage.getItems();
  res.json(items);
});
```

### After (ts-rest):
```typescript
list: {
  middleware: [authMiddleware()],
  handler: async ({ req }) => {
    const storage = req.app.locals.storage;
    const items = await storage.getItems();
    return { status: 200 as const, body: items };
  }
}
```
