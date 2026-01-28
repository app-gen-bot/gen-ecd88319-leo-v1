# Supabase Integration Problems: Deep Analysis

## Executive Summary

The IStorage factory pattern promised **"change 2 env vars → production mode"** with seamless switching between in-memory and Supabase storage. In practice, the RaiseIQ app encountered **systematic failures** when switching to Supabase, requiring extensive debugging and fixes to 20+ methods.

This document analyzes the **root causes**, **manifestations**, and **systematic solutions** to prevent this class of bugs in future app-factory generated applications.

---

## The Promise vs. Reality

### The Design Promise (from pipeline-prompt.md)

```typescript
// Lines 207-234: Storage Scaffolding (Factory Pattern)
export interface IStorage {
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  // Add CRUD for all entities
}

export function createStorage(): IStorage {
  const mode = process.env.STORAGE_MODE || 'memory';

  if (mode === 'database') {
    return new DatabaseStorage();
  }

  return new MemoryStorage();
}
```

**Implicit Promise**: Both implementations return the SAME object shapes. The consuming code (routes, business logic) should work identically regardless of which adapter is used.

### The Reality (RaiseIQ Experience)

When switching from `STORAGE_MODE=memory` to `STORAGE_MODE=supabase`, the app immediately broke with:

1. **PostgreSQL Error 22P02**: `invalid input syntax for type integer: "undefined"`
2. **Undefined property access**: `hand.playerCards` → `undefined` (actual DB field: `player_cards`)
3. **Session ownership failures**: `session.studentId !== profile.id` always true (snake_case mismatch)
4. **Silent data corruption**: Methods accepting `undefined` instead of `null`

---

## Root Cause Analysis

### The Three-Layer Problem

```
┌─────────────────────────────────────────────────┐
│  Layer 1: DESIGN FLAW                          │
│  Pipeline prompt lacks snake_case guidance      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Layer 2: IMPLEMENTATION INCONSISTENCY          │
│  Supabase storage methods missing conversions   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Layer 3: RUNTIME FAILURES                      │
│  PostgreSQL rejects "undefined", properties     │
│  missing, type mismatches                       │
└─────────────────────────────────────────────────┘
```

### Layer 1: Design Flaw - The Missing Guidance

**Problem**: The pipeline-prompt.md (lines 207-251) shows the factory pattern but **completely omits** the snake_case ↔ camelCase impedance mismatch.

**Evidence**:
- MemoryStorage example (lines 236-251): Returns JavaScript objects with camelCase properties
- No mention of PostgreSQL column naming conventions
- No helper functions documented
- No discussion of Supabase PostgREST client behavior

**Why This Matters**:
PostgreSQL best practice uses `snake_case` for column names. JavaScript/TypeScript convention is `camelCase`. Supabase's PostgREST client **preserves database column names** in returned objects.

```typescript
// What MemoryStorage returns:
{ id: 1, playerCards: ["As", "Kh"], playerStack: 990 }

// What Supabase PostgREST returns (WITHOUT conversion):
{ id: 1, player_cards: ["As", "Kh"], player_stack: 990 }

// Consuming code expects:
hand.playerCards  // ← undefined when using Supabase!
```

### Layer 2: Implementation Inconsistency

**Systematic Analysis** of `server/lib/storage/supabase-storage.ts` (834 lines):

#### SELECT Methods Missing `toCamelCase()` Conversion

**18 methods** return snake_case data directly from PostgreSQL:

| Line | Method | Return Type | Impact |
|------|--------|-------------|--------|
| 87 | `getUserById()` | User | Auth failures |
| 101 | `getUserByEmail()` | User | Login failures |
| 234 | `getConceptById()` | Concept | Teaching logic breaks |
| 270 | `getStudentConceptMastery()` | StudentConceptMastery | Progress tracking fails |
| 280 | `getMasteryByStudentAndConcept()` | StudentConceptMastery | Skill assessment broken |
| 307 | `getWeakSpots()` | WeakSpot | AI coaching degraded |
| 339 | `getActiveSessions()` | GameSession | Dashboard empty |
| **414** | **`getHand()`** | **Hand** | **Practice sessions crash** |
| 465 | `getDecisionById()` | Decision | Review system fails |
| 515 | `getFeedbackByDecision()` | AiFeedback | Learning loop broken |
| 549 | `getScenarioById()` | TrainingScenario | Scenarios unloadable |
| 560 | `getScenarioAttempt()` | ScenarioAttempt | Progress lost |
| 628 | `getStudentAchievement()` | StudentAchievement | Gamification broken |
| 655 | `getConversationById()` | ChatConversation | Chat fails to load |
| 669 | `getActiveConversation()` | ChatConversation | Chat session lost |
| 691 | `getMessages()` | ChatMessage | Message history empty |
| 722 | `getOrCreateConversation()` | ChatConversation | New chats fail |
| 737 | `getGameplayEvent()` | GameplayEvent | Analytics broken |

**15 array-returning methods** also missing conversion:

| Line | Method | Return Type | Why Arrays Are Worse |
|------|--------|-------------|---------------------|
| 220 | `getAllConcepts()` | Concept[] | Every element has wrong shape |
| 248 | `getAllMasteryRecords()` | StudentConceptMastery[] | Batch operations fail |
| 296 | `getWeakSpots()` | WeakSpot[] | AI gets corrupted input |
| 402 | `getSessionHands()` | Hand[] | History view crashes |
| 451 | `getHandDecisions()` | Decision[] | Multi-turn AI broken |
| 481 | `getStudentDecisions()` | Decision[] | Player stats wrong |
| 535 | `getAllScenarios()` | TrainingScenario[] | Scenario list empty |
| 572 | `getMyAttempts()` | ScenarioAttempt[] | Progress tracking fails |
| 606 | `getAllAchievements()` | Achievement[] | Gamification UI broken |
| 617 | `getMyAchievements()` | StudentAchievement[] | Trophy case empty |
| 680 | `getRecentConversations()` | ChatConversation[] | Chat history inaccessible |
| 702 | `getMessages()` | ChatMessage[] | Conversation display fails |
| 779 | `getSessionEvents()` | GameplayEvent[] | Session replay broken |
| 790 | `getHandEvents()` | GameplayEvent[] | Hand analysis fails |
| 801 | `getDecisionEvents()` | GameplayEvent[] | Decision review empty |

#### INSERT Methods Missing `toSnakeCase()` Conversion

**6 methods** pass camelCase data directly to PostgreSQL:

| Line | Method | Problem | PostgreSQL Sees |
|------|--------|---------|----------------|
| 275 | `createStudentConceptMastery()` | Passes `insertData` | `studentId` → error (expects `student_id`) |
| 302 | `createWeakSpot()` | Passes `insertData` | `studentId, conceptId` → errors |
| 555 | `createScenarioAttempt()` | Passes `insertData` | `scenarioId, wasSuccessful` → errors |
| 623 | `awardAchievement()` | Inline object | `{ student_id, achievement_id }` works BUT inconsistent |
| 650 | `createConversation()` | Inline object | `{ student_id }` works BUT inconsistent |
| 686 | `addMessage()` | Inline object | `{ conversation_id, role, content }` works BUT inconsistent |
| 732 | `createGameplayEvent()` | Passes `insertData` | All camelCase fields → errors |

**Note**: Lines 623, 650, 686 use inline objects with **hardcoded snake_case** - these work but create maintenance burden and inconsistency.

#### The Undefined → Null Problem

**Critical Issue**: JavaScript `undefined` is not a valid PostgreSQL value for nullable columns.

```typescript
// In game.ts route (line 477 - BEFORE fix):
const decision = await storage.createDecision({
  optimalAmount: aiDecision.amount,  // ← undefined for fold/check
});

// PostgreSQL sees: optimal_amount = "undefined" (string!)
// Error: invalid input syntax for type integer: "undefined"
```

**Why This Happens**:
1. JSON.stringify() converts undefined → "undefined" (string)
2. Supabase PostgREST sends this string to PostgreSQL
3. PostgreSQL integer column rejects the string
4. Error 22P02 thrown

**Correct Behavior**:
```typescript
optimalAmount: aiDecision.amount ?? null  // Convert undefined → null
```

### Layer 3: Runtime Failures - The Cascade

#### Failure Cascade in Practice Session Flow

```
User clicks "Fold"
    ↓
POST /api/game/hand/7/decision
    ↓
getHand(7) returns { player_cards: [...], opponent_cards: [...] }  ← snake_case
    ↓
Code accesses hand.playerCards  ← undefined!
    ↓
AI coach receives undefined cards
    ↓
AI decision calculation fails silently
    ↓
aiDecision.amount = undefined
    ↓
createDecision({ optimalAmount: undefined })
    ↓
toSnakeCase() NOT called on this object
    ↓
Supabase insert: { optimal_amount: "undefined" }
    ↓
PostgreSQL: ERROR 22P02
    ↓
User sees: "Failed to make decision"
```

**Each layer multiplies the problem:**
1. Missing toCamelCase → undefined properties
2. Undefined properties → corrupted business logic
3. Undefined values → PostgreSQL errors
4. PostgreSQL errors → cryptic user-facing errors

---

## Why the IStorage Pattern Failed to Deliver

### The Contract Violation

**The Implicit Contract**:
```typescript
interface IStorage {
  getHand(id: number): Promise<Hand>;
}
```

**What the contract SHOULD mean**:
- MemoryStorage returns Hand with camelCase properties
- SupabaseStorage returns Hand with camelCase properties
- Routes can use either interchangeably

**What ACTUALLY happened**:
- MemoryStorage returns Hand with camelCase ✅
- SupabaseStorage returns Hand with snake_case ❌
- Routes break when switching storage implementations ❌

**This is a Liskov Substitution Principle violation** - subtypes (MemoryStorage, SupabaseStorage) don't maintain behavioral compatibility.

### Type System Didn't Save Us

TypeScript's type system **cannot enforce runtime object shapes**:

```typescript
type Hand = {
  id: number;
  playerCards: string[];
  playerStack: number;
  // ...
};

// This compiles fine:
return data as Hand;

// But at runtime, data is:
// { id: 1, player_cards: [...], player_stack: 990 }

// TypeScript casts are runtime no-ops!
```

The `as Hand` cast is a **lie** that TypeScript trusts. Only runtime validation (or conversion) can fix this.

---

## Correct Implementation Patterns

### Pattern 1: SELECT with toCamelCase (Single Object)

```typescript
async getHand(id: number): Promise<Hand | null> {
  const { data, error } = await getSupabaseClient()
    .from('hands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;  // Not found
    throw error;
  }

  // ✅ CRITICAL: Convert snake_case → camelCase
  return toCamelCase(data) as Hand;
}
```

### Pattern 2: SELECT with toCamelCase (Array)

```typescript
async getSessionHands(sessionId: number): Promise<Hand[]> {
  const { data, error } = await getSupabaseClient()
    .from('hands')
    .select('*')
    .eq('session_id', sessionId)
    .order('hand_number', { ascending: false });

  if (error) throw error;

  // ✅ CRITICAL: Convert each element
  return (data || []).map(item => toCamelCase(item)) as Hand[];
}
```

### Pattern 3: INSERT with toSnakeCase

```typescript
async createDecision(insertData: InsertDecision): Promise<Decision> {
  // ✅ CRITICAL: Convert camelCase → snake_case BEFORE insert
  const dbData = toSnakeCase(insertData);

  const { data, error } = await getSupabaseClient()
    .from('decisions')
    .insert(dbData)
    .select()
    .single();

  if (error) throw error;

  // ✅ CRITICAL: Convert result back to camelCase
  return toCamelCase(data) as Decision;
}
```

### Pattern 4: Handling Undefined → Null

**In route handlers** (before calling storage):
```typescript
const decision = await storage.createDecision({
  handId: hand.id,
  studentId: profile.id,
  action,
  amount: amount ?? null,           // ✅ Convert undefined → null
  optimalAmount: aiDecision.amount ?? null,  // ✅ Convert undefined → null
});
```

**In helper function** (toSnakeCase):
```typescript
function toSnakeCase(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // ✅ Convert undefined → null for PostgreSQL
    result[snakeKey] = obj[key] === undefined ? null : obj[key];
  }
  return result;
}
```

### Pattern 5: UPDATE Operations

```typescript
async updateHand(id: number, updates: Partial<Hand>): Promise<Hand> {
  // ✅ Convert updates to snake_case
  const dbUpdates = toSnakeCase(updates);

  const { data, error } = await getSupabaseClient()
    .from('hands')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // ✅ Convert result back to camelCase
  return toCamelCase(data) as Hand;
}
```

---

## Systematic Fixes Required

### Immediate Fixes for RaiseIQ (Priority Order)

#### Phase 1: Critical Path (Practice Sessions)
- [x] `getHand()` - line 376 - **FIXED**
- [x] `getSession()` - line 342 - **FIXED**
- [x] `createDecision()` - line 417 - **FIXED**
- [x] `createAiFeedback()` - line 478 - **FIXED**
- [ ] `getHandDecisions()` - line 433 - **NEEDED** (multi-turn AI context)
- [ ] `getWeakSpots()` - line 291 - **NEEDED** (AI coaching)

#### Phase 2: High Impact Features
- [ ] `getUserById()` - line 74 - Auth/profile features
- [ ] `getUserByEmail()` - line 88 - Login
- [ ] `getActiveSessions()` - line 327 - Dashboard
- [ ] `getSessionHands()` - line 390 - History view
- [ ] `getAllConcepts()` - line 215 - Teaching system
- [ ] `getStudentConceptMastery()` - line 258 - Progress tracking

#### Phase 3: Remaining Features
- [ ] All chat-related methods (12 methods)
- [ ] Scenario methods (4 methods)
- [ ] Achievement methods (4 methods)
- [ ] Gameplay event methods (3 methods)
- [ ] Concept mastery methods (3 methods)

### Long-term Pipeline Fixes

#### 1. Update pipeline-prompt.md (lines 207-251)

**ADD comprehensive storage section**:

```markdown
#### 2.2.3 Storage Scaffolding (Factory Pattern)

**CRITICAL: PostgreSQL snake_case ↔ JavaScript camelCase Conversion**

PostgreSQL columns use `snake_case` (e.g., `player_cards`).
JavaScript/TypeScript uses `camelCase` (e.g., `playerCards`).

**Helper Functions** (add to supabase-storage.ts):

```typescript
// Convert camelCase object to snake_case for PostgreSQL
function toSnakeCase(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // Convert undefined → null for PostgreSQL compatibility
    result[snakeKey] = obj[key] === undefined ? null : obj[key];
  }
  return result;
}

// Convert snake_case object to camelCase for JavaScript
function toCamelCase(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}
```

**MANDATORY PATTERNS**:

1. **SELECT (single)**: ALWAYS use `toCamelCase()`
   ```typescript
   async getEntity(id: number): Promise<Entity | null> {
     const { data, error } = await supabase.from('table').select('*').eq('id', id).single();
     if (error) throw error;
     return toCamelCase(data) as Entity;  // ← REQUIRED
   }
   ```

2. **SELECT (array)**: ALWAYS map with `toCamelCase()`
   ```typescript
   async getEntities(): Promise<Entity[]> {
     const { data, error } = await supabase.from('table').select('*');
     if (error) throw error;
     return (data || []).map(item => toCamelCase(item)) as Entity[];  // ← REQUIRED
   }
   ```

3. **INSERT**: ALWAYS use `toSnakeCase()` + `toCamelCase()`
   ```typescript
   async createEntity(insert: InsertEntity): Promise<Entity> {
     const dbData = toSnakeCase(insert);  // ← REQUIRED
     const { data, error } = await supabase.from('table').insert(dbData).select().single();
     if (error) throw error;
     return toCamelCase(data) as Entity;  // ← REQUIRED
   }
   ```

4. **UPDATE**: ALWAYS use `toSnakeCase()` + `toCamelCase()`
   ```typescript
   async updateEntity(id: number, updates: Partial<Entity>): Promise<Entity> {
     const dbUpdates = toSnakeCase(updates);  // ← REQUIRED
     const { data, error } = await supabase.from('table').update(dbUpdates).eq('id', id).select().single();
     if (error) throw error;
     return toCamelCase(data) as Entity;  // ← REQUIRED
   }
   ```

**WHY THIS MATTERS**:
- MemoryStorage returns camelCase objects
- SupabaseStorage MUST return identical shapes
- Without conversion, switching storage modes breaks the app
- Type casts (`as Entity`) don't enforce runtime shapes
```

#### 2. Add Validation Layer (Optional but Recommended)

**Create runtime validator using Zod**:

```typescript
import { z } from 'zod';
import { handSchema } from '@shared/schema.zod';

async getHand(id: number): Promise<Hand | null> {
  const { data, error } = await getSupabaseClient()
    .from('hands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  const camelCaseData = toCamelCase(data);

  // ✅ VALIDATE at runtime - catches shape mismatches
  const validated = handSchema.parse(camelCaseData);
  return validated;
}
```

**Benefits**:
- Catches conversion bugs immediately
- Provides clear error messages
- Documents expected shape
- No runtime cost in production (can strip in build)

#### 3. Add Integration Tests

**Test both storage implementations**:

```typescript
// tests/storage.integration.test.ts
import { MemoryStorage } from '../server/lib/storage/mem-storage';
import { SupabaseStorage } from '../server/lib/storage/supabase-storage';

describe('Storage Implementation Parity', () => {
  const memStorage = new MemoryStorage();
  const dbStorage = new SupabaseStorage();

  it('both implementations return same object shape', async () => {
    const memHand = await memStorage.createHand({ /* ... */ });
    const dbHand = await dbStorage.createHand({ /* ... */ });

    // ✅ Verify EXACT property names match
    expect(Object.keys(memHand).sort()).toEqual(Object.keys(dbHand).sort());

    // ✅ Verify camelCase (not snake_case)
    expect(memHand).toHaveProperty('playerCards');
    expect(dbHand).toHaveProperty('playerCards');
    expect(dbHand).not.toHaveProperty('player_cards');
  });
});
```

---

## Prevention Strategies for Future Apps

### Code Generation Checklist

When `code_writer` or other subagents generate `supabase-storage.ts`:

**MANDATORY**:
- [ ] Add `toSnakeCase()` and `toCamelCase()` helper functions at top of file
- [ ] Every SELECT method MUST use `toCamelCase()` on return
- [ ] Every SELECT array MUST use `.map(toCamelCase)` on return
- [ ] Every INSERT method MUST use `toSnakeCase()` before insert, `toCamelCase()` after
- [ ] Every UPDATE method MUST use `toSnakeCase()` before update, `toCamelCase()` after
- [ ] Add comment above each conversion explaining why it's needed

**VALIDATION**:
- [ ] Run static analysis: `grep "return data as" supabase-storage.ts` should return 0 results
- [ ] All returns should be `return toCamelCase(data) as Type`
- [ ] All inserts should use `const dbData = toSnakeCase(insertData)`

### Schema Design Checklist

When `schema_designer` creates Drizzle schemas:

**MANDATORY**:
- [ ] Every Drizzle column definition MUST specify both names:
  ```typescript
  // ✅ CORRECT - explicit snake_case column name
  playerCards: jsonb('player_cards').notNull(),

  // ❌ WRONG - implicit name matches property (doesn't work with PostgREST)
  playerCards: jsonb().notNull(),
  ```

- [ ] Add comment in schema.ts explaining the pattern:
  ```typescript
  // Drizzle property names: camelCase (JavaScript convention)
  // Database column names: snake_case (PostgreSQL convention)
  // Conversion handled by supabase-storage.ts helpers
  ```

### Review Checklist for error_fixer

When debugging storage-related issues:

**CHECK THESE FIRST**:
1. Is the method using Supabase? → Check for toCamelCase/toSnakeCase
2. Are properties undefined at runtime? → Likely missing toCamelCase conversion
3. PostgreSQL "invalid input" error? → Check for undefined → null conversion
4. Session/ownership mismatches? → Missing conversion in parent object

**DON'T**:
- Cast to fix type errors without verifying runtime shape
- Assume `data as Type` means the shape is correct
- Trust TypeScript types for runtime validation

---

## Metrics: Scope of the Problem

### RaiseIQ Supabase Storage File
- **Total lines**: 834
- **Total methods**: ~60
- **Methods with bugs**: 33 (55%)
  - SELECT missing toCamelCase: 18 single, 15 array
  - INSERT missing toSnakeCase: 6

### Bug Impact Radius
- **Practice sessions**: Completely broken
- **Chat system**: Broken
- **Achievement system**: Broken
- **Analytics/Events**: Broken
- **Progress tracking**: Broken
- **Scenario system**: Broken

**Only working features**: Auth (partial - getProfile was fixed), Session creation (partial)

### Time Cost
- **User debugging time**: 2+ hours
- **Methods fixed**: 4 out of 33 (12%)
- **Remaining work**: ~29 methods need fixing
- **Estimated fix time**: 2-3 hours for complete fix
- **Prevention cost if in pipeline**: 15 minutes per app

---

## Recommendations

### Immediate Actions

1. **Fix RaiseIQ systematically**:
   - Apply batch fix to all 33 methods
   - Run integration tests to verify
   - Document the fix in code comments

2. **Update app-factory pipeline**:
   - Add snake_case conversion section to pipeline-prompt.md
   - Create `supabase-storage.template.ts` with helper functions
   - Add validation rules for code_writer subagent

3. **Add quality checks**:
   - Static analysis rule: No `return data as Type` in Supabase storage
   - Runtime validation: Schema parsing on development builds
   - Integration tests: Memory vs Supabase parity checks

### Long-term Improvements

1. **Consider Drizzle ORM instead of PostgREST**:
   - Drizzle handles snake_case ↔ camelCase automatically
   - Type-safe queries at compile time
   - Better developer experience
   - Trade-off: Slightly more complex setup

2. **Generate validation layers**:
   - Use Zod schemas for runtime validation
   - Catch shape mismatches immediately
   - Provide clear error messages

3. **Improve error messages**:
   - Detect "undefined" in PostgreSQL errors
   - Suggest checking for undefined → null conversion
   - Point to specific line in code causing issue

4. **Create diagnostic tools**:
   - `npm run validate:storage` - checks all methods for conversions
   - `npm run test:storage-parity` - tests memory vs database equivalence
   - `npm run fix:storage` - auto-fixes missing conversions

---

## Conclusion

The IStorage factory pattern is **architecturally sound** but had a **critical implementation gap**: **snake_case ↔ camelCase conversion**.

This gap caused **55% of storage methods to fail** when switching from memory to Supabase, violating the Liskov Substitution Principle and breaking the "just works" promise.

**The fix is systematic and mechanical** - add `toCamelCase()` and `toSnakeCase()` conversions in all the right places. But **prevention is better** - updating the pipeline prompt to mandate these conversions will save hours of debugging on every future app.

**Key Insight**: TypeScript's type system cannot enforce runtime object shapes. The `as Type` cast is a promise, not a guarantee. Only runtime conversion or validation can bridge the PostgreSQL/JavaScript impedance mismatch.

---

## Appendix: Quick Reference

### Snake_case ↔ CamelCase Cheat Sheet

| Operation | Input | Helper | Output |
|-----------|-------|--------|--------|
| SELECT single | `{ player_cards: [...] }` | `toCamelCase(data)` | `{ playerCards: [...] }` |
| SELECT array | `[{ player_cards: [...] }]` | `.map(toCamelCase)` | `[{ playerCards: [...] }]` |
| INSERT | `{ playerCards: [...] }` | `toSnakeCase(data)` | `{ player_cards: [...] }` → DB |
| UPDATE | `{ playerCards: [...] }` | `toSnakeCase(data)` | `{ player_cards: [...] }` → DB |

### Helper Functions (Copy-Paste Ready)

```typescript
// Helper: Convert camelCase to snake_case
function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    // Convert undefined to null for PostgreSQL compatibility
    result[snakeKey] = obj[key] === undefined ? null : obj[key];
  }
  return result;
}

// Helper: Convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const result: any = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}
```

### Verification Commands

```bash
# Check for missing conversions (should return 0 lines)
grep -n "return data as" server/lib/storage/supabase-storage.ts

# Check for proper conversions (should return all SELECT methods)
grep -n "return toCamelCase" server/lib/storage/supabase-storage.ts

# Check for proper INSERT conversions
grep -n "toSnakeCase(insert" server/lib/storage/supabase-storage.ts
```

---

**Document Version**: 1.0
**Date**: 2025-01-21
**Author**: Debugging session analysis
**Status**: Comprehensive analysis complete, fixes in progress
