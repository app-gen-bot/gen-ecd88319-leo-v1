# FIS API Client Integration Guide
## How to Use the Generated API Client for Frontend Interaction Specs

**Date**: October 5, 2025
**Purpose**: Ensure FIS generates frontend specs that use ONLY real API methods via the ts-rest client

---

## Understanding the API Client

### What Gets Generated

The `tsrest_api_client_generator` creates a **complete, type-safe API client** at `client/src/lib/api.ts`:

```typescript
// Auto-generated ts-rest client
export const apiClient = initClient(contractsRouter, {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  baseHeaders: {
    'Content-Type': 'application/json'
  }
});

// The client includes ALL contracts:
const contractsRouter = {
  bookings: bookingsContract,
  chapels: chapelsContract,
  packages: packagesContract,
  timeslots: timeSlotsContract,
  users: usersContract
};
```

### How to Use in Frontend

Instead of raw fetch:
```typescript
// ❌ WRONG - Don't do this
const response = await fetch('/api/chapels');
```

Use the API client:
```typescript
// ✅ CORRECT - Use the generated client
import { apiClient } from '@/lib/api';

const response = await apiClient.chapels.getChapels({
  query: { page: 1, limit: 10 }
});
```

---

## For FIS Generation

### The Key Insight

**The API client already encapsulates EVERYTHING the backend supports!**

- Every contract method is available via `apiClient`
- Type-safe with full IntelliSense
- No way to call non-existent endpoints
- Parameters and responses are validated

### What This Means for FIS

1. **FIS doesn't need to read contracts directly** - the API client has them all
2. **FIS should reference apiClient methods** - not raw contracts
3. **Frontend can ONLY call what's in apiClient** - guaranteed correctness

---

## Updated FIS Generation Approach

### Master Spec Should Document Available API Methods

Instead of reading contracts, the master spec should document what's available via `apiClient`:

```markdown
## Available API Methods via apiClient

### chapels
- `apiClient.chapels.getChapels(query)` - Get list with filters
- `apiClient.chapels.getChapel({ params: { id } })` - Get single chapel
- `apiClient.chapels.createChapel({ body })` - Admin: create chapel
- `apiClient.chapels.updateChapel({ params, body })` - Admin: update
- `apiClient.chapels.deleteChapel({ params })` - Admin: delete

### users
- `apiClient.users.login({ body })` - User authentication
- `apiClient.users.register({ body })` - Create account
- `apiClient.users.getProfile()` - Get current user
- `apiClient.users.updateProfile({ body })` - Update profile

### bookings
- `apiClient.bookings.createBooking({ body })` - Create booking
- `apiClient.bookings.getMyBookings()` - Get user's bookings
- `apiClient.bookings.getBooking({ params })` - Get single booking
- `apiClient.bookings.updateBooking({ params, body })` - Update booking
- `apiClient.bookings.cancelBooking({ params })` - Cancel booking

### packages
- `apiClient.packages.getPackages()` - Get all packages
- `apiClient.packages.getPackage({ params })` - Get single package

### timeslots
- `apiClient.timeslots.getAvailableSlots({ query })` - Check availability
```

### Page Specs Should Use apiClient Syntax

In page specifications:

```markdown
## ChapelsPage API Calls

**On Page Load**:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: {
    page: 1,
    limit: 12,
    isActive: true,
    sortBy: 'name'
  }
});
```

**On Search**:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: {
    search: searchTerm,
    page: 1,
    limit: 12
  }
});
```

**On Filter Change**:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: {
    city: selectedCity,
    minCapacity: minGuests,
    maxCapacity: maxGuests,
    page: 1,
    limit: 12
  }
});
```
```

---

## Implementation Strategy

### Step 1: Generate API Client First

In the build pipeline, generate the API client BEFORE FIS:

```python
# In build_stage.py or pipeline
1. Generate contracts
2. Generate API client <- Do this FIRST
3. Generate FIS (master + pages) <- Then this
4. Generate frontend pages <- Finally this
```

### Step 2: Pass API Client Info to FIS

The FIS agents should know about the API client:

```python
# When calling FIS master agent
master_agent.generate_master_spec(
    plan=plan_content,
    schema=schema_content,
    api_client_path="client/src/lib/api.ts",  # NEW
    # Note: We don't need contracts_content anymore!
)
```

### Step 3: Update FIS Prompts

**Master Spec Prompt Addition**:
```python
"""
## API Integration via apiClient

The application has a generated API client at `client/src/lib/api.ts`.
This client provides type-safe access to ALL backend endpoints.

Document the available methods:
- List each contract namespace (chapels, users, bookings, etc.)
- List each method available under that namespace
- Use the syntax: apiClient.namespace.method()

Frontend specs MUST use this apiClient, never raw fetch().
"""
```

**Page Spec Prompt Addition**:
```python
"""
## API Calls

For any data fetching or mutations, use the apiClient:

Example:
```typescript
// Fetching data
const response = await apiClient.chapels.getChapels({ query: {...} });

// Creating data
const response = await apiClient.bookings.createBooking({ body: {...} });

// Updating data
const response = await apiClient.users.updateProfile({ body: {...} });
```

NEVER use:
- fetch()
- axios
- Raw HTTP requests

ALWAYS use:
- apiClient.namespace.method()
"""
```

---

## Benefits of This Approach

### 1. Guaranteed Correctness
- Frontend can ONLY call methods that exist
- Type-safe with full parameter validation
- No invented endpoints possible

### 2. Simpler FIS Generation
- Don't need to parse contract files
- API client is the single source of truth
- Clear, consistent syntax

### 3. Better Developer Experience
- Generated frontend code will have IntelliSense
- Type errors caught at compile time
- Consistent API usage patterns

### 4. Automatic Updates
- If contracts change, API client regenerates
- FIS can be regenerated to match
- Frontend stays in sync

---

## Example: Complete Flow

### 1. Contracts Define the API
```typescript
// chapels.contract.ts
export const chapelsContract = c.router({
  getChapels: { ... },
  getChapel: { ... },
  createChapel: { ... }
});
```

### 2. API Client Generated Automatically
```typescript
// api.ts (generated)
export const apiClient = initClient({
  chapels: chapelsContract,
  users: usersContract,
  // ... all contracts
});
```

### 3. FIS References API Client
```markdown
## HomePage API Calls

Load featured chapels:
```typescript
const { data } = await apiClient.chapels.getChapels({
  query: { limit: 6, isActive: true }
});
```
```

### 4. Frontend Implementation Uses Exact Same Code
```typescript
// HomePage.tsx
import { apiClient } from '@/lib/api';

export function HomePage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['chapels', 'featured'],
    queryFn: () => apiClient.chapels.getChapels({
      query: { limit: 6, isActive: true }
    })
  });
}
```

---

## Key Rules for FIS

### DO:
✅ Use `apiClient.namespace.method()` syntax
✅ Document all available apiClient methods
✅ Include proper TypeScript syntax with parameters
✅ Show query/body structure for each call

### DON'T:
❌ Use fetch() or raw HTTP
❌ Invent API endpoints
❌ Reference contracts directly (use apiClient)
❌ Create methods that don't exist in apiClient

---

## Validation Strategy

### Check FIS Output
1. Extract all API calls from FIS
2. Verify each matches `apiClient.namespace.method()` pattern
3. Ensure no fetch() calls
4. Confirm all methods exist in API client

### Automated Validation
```python
def validate_fis_api_usage(fis_content, api_client_path):
    # Extract all apiClient calls from FIS
    api_calls = extract_api_calls(fis_content)

    # Parse available methods from api.ts
    available_methods = parse_api_client(api_client_path)

    # Validate
    for call in api_calls:
        if not call.startswith('apiClient.'):
            return False, f"Invalid API call: {call}"

        method = call.replace('apiClient.', '').split('(')[0]
        if method not in available_methods:
            return False, f"Method doesn't exist: {method}"

    # Check for fetch usage
    if 'fetch(' in fis_content:
        return False, "FIS contains fetch() calls"

    return True, "All API usage is valid"
```

---

## Summary

**The API client is the bridge between backend contracts and frontend usage.**

1. **Contracts** define what's possible
2. **API Client** provides type-safe access
3. **FIS** documents how to use the API client
4. **Frontend** implements exactly what FIS specifies

By having FIS reference the API client instead of raw contracts, we ensure:
- ✅ Frontend only calls real APIs
- ✅ Type-safe, validated calls
- ✅ No invented endpoints
- ✅ Consistent usage patterns
- ✅ Working application out of the box