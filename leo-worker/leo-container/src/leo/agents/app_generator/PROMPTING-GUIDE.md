# AI Development Prompting Guide

## How to Avoid Schema Mismatch and Integration Issues

This guide documents lessons learned from building the Advisory Board Marketplace and provides best practices for prompting AI agents to avoid common pitfalls.

## The Problem We Had

When building features quickly, we encountered:
1. **Schema mismatch** - Seed data used different field names than the actual schema
2. **Mock data** - Frontend pages used hardcoded data instead of API calls
3. **Missing routes** - Backend routes weren't created for all entities
4. **Type inconsistency** - Different status enums in different places

## Root Cause

The AI agent (me!) was asked to:
- "Seed it with opportunities and advisors" ← Added seed data
- "Create a page to display them" ← Created UI with mock data
- "Make the UI amazing" ← Focused on aesthetics, not integration

**What was missing**: Explicit instructions to check the existing schema and wire everything together properly.

## Best Practices for Prompting

### 1. Schema-First Development

**❌ DON'T SAY:**
```
"Add seed data for companies, advisors, and opportunities"
```

**✅ DO SAY:**
```
"Before adding seed data:
1. Read shared/schema.zod.ts to understand the exact field names and types
2. Create seed data that matches the schema exactly
3. Verify the data types match (arrays vs strings, field names, enums)
4. Show me the schema fields vs your seed data fields for review"
```

### 2. End-to-End Feature Development

**❌ DON'T SAY:**
```
"Create a page to display applications"
```

**✅ DO SAY:**
```
"Create an applications feature with full stack integration:
1. Verify backend routes exist in server/routes/
2. Verify contracts exist in shared/contracts/
3. Create the page that fetches from the actual API using apiClient
4. Show me the data flow: API → Contract → Page"
```

### 3. Explicit Integration Checks

**❌ DON'T SAY:**
```
"Make the opportunities page look better"
```

**✅ DO SAY:**
```
"Improve the opportunities page, ensuring:
1. It uses apiClient.opportunities.getOpportunities() (not mock data)
2. The response matches the OpportunityWithCompany type
3. Error states are handled
4. Loading states are shown
5. Test the API endpoint with curl first"
```

### 4. Systematic Route Creation

**❌ DON'T SAY:**
```
"Add routes for the missing entities"
```

**✅ DO SAY:**
```
"For each entity in the schema, ensure:
1. Backend route exists in server/routes/[entity].ts
2. Contract exists in shared/contracts/[entity].contract.ts
3. Route is registered in server/routes/index.ts
4. Storage methods exist in server/lib/storage/
5. Create a checklist and verify each item"
```

### 5. Type Safety Verification

**❌ DON'T SAY:**
```
"Fix the TypeScript errors"
```

**✅ DO SAY:**
```
"Fix TypeScript errors by:
1. Identifying which schema definition is the source of truth
2. Updating all references to match that schema
3. Running through: schema.zod.ts → schema.ts → storage → routes → frontend
4. Verify enums match everywhere (e.g., 'active' vs 'open')"
```

### 6. Test Before Completion

**❌ DON'T SAY:**
```
"Add the reviews feature"
```

**✅ DO SAY:**
```
"Add the reviews feature and test before completion:

1. Backend Testing:
   - Use curl to test all API endpoints (GET, POST, PUT, DELETE)
   - Verify response structure matches contracts
   - Test error cases (invalid data, missing auth)

2. Frontend Testing:
   - Use browser MCP tool to test the UI
   - Verify data displays correctly
   - Test form submissions and interactions
   - Check error handling and loading states

3. Sanity Testing:
   - End-to-end flow (create → read → update → delete)
   - Auth flow (protected routes, login/logout)
   - Edge cases (empty states, invalid inputs)

4. Only declare complete after all tests pass"
```

**Testing Tools:**
- **curl** - Test API endpoints from command line
- **Browser MCP tool** - Automated browser testing and screenshots
- **Dev server logs** - Check for errors and warnings

## Checklist Template for AI Agents

When asked to add a new feature, use this checklist:

```markdown
## Feature: [Name]

### Backend
- [ ] Schema defined in `shared/schema.zod.ts`
- [ ] Drizzle schema in `shared/schema.ts` matches
- [ ] Contract defined in `shared/contracts/[feature].contract.ts`
- [ ] Storage methods in `server/lib/storage/mem-storage.ts`
- [ ] Routes in `server/routes/[feature].ts`
- [ ] Routes registered in `server/routes/index.ts`
- [ ] API tested with curl/HTTP client

### Frontend
- [ ] Types imported from schema.zod
- [ ] API calls use `apiClient.[feature].*`
- [ ] No mock/hardcoded data
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Forms use correct field names from schema

### Integration
- [ ] Seed data matches schema exactly
- [ ] Field names consistent everywhere
- [ ] Enums match across files
- [ ] Tested end-to-end data flow

### Testing
- [ ] API endpoints tested with curl
- [ ] All CRUD operations verified
- [ ] Frontend tested with browser MCP tool
- [ ] Error handling tested
- [ ] Edge cases validated
```

## Specific Prompting Examples

### Example 1: Adding a New Entity

**Good Prompt:**
```
I need to add a "Reviews" entity for advisor reviews. Follow this workflow:

1. Schema Definition:
   - Add to shared/schema.zod.ts with these fields: [list fields]
   - Add matching Drizzle schema to shared/schema.ts
   - Show me both schemas side-by-side for verification

2. Backend Implementation:
   - Create contract in shared/contracts/reviews.contract.ts
   - Implement storage methods in mem-storage.ts
   - Create routes in server/routes/reviews.ts
   - Register in server/routes/index.ts
   - Test with curl

3. Frontend Implementation:
   - Create ReviewsPage.tsx that uses apiClient.reviews
   - Add route to App.tsx
   - Ensure no mock data

4. Verification:
   - Show me the full data flow from API to UI
   - Verify all field names match the schema
```

### Example 2: Adding Seed Data

**Good Prompt:**
```
Add seed data for reviews. Before you start:

1. Read the reviews schema from shared/schema.zod.ts
2. List out every required field and its type
3. Create 5 sample reviews that match the schema exactly
4. Show me a comparison table:
   | Field Name (Schema) | Type (Schema) | Sample Value |
5. Only proceed after I confirm the schema match
```

### Example 3: UI Feature with API Integration

**Good Prompt:**
```
Create a "My Reviews" page for advisors. Requirements:

1. Verification Phase:
   - Check if GET /api/reviews/advisor/:id endpoint exists
   - If not, create it following the pattern in other routes
   - Test the endpoint returns data

2. Implementation Phase:
   - Create MyReviewsPage.tsx
   - Use apiClient.reviews.getReviewsByAdvisor()
   - Handle loading (show skeleton)
   - Handle error (show error message)
   - Handle empty (show "No reviews yet")

3. NO MOCK DATA - must use real API

4. Show me the API response structure vs the component's expected props
```

## Key Principles

1. **Schema is Source of Truth** - Always read existing schemas before creating anything
2. **No Mock Data** - If you need data, create the API first
3. **Type Safety All the Way** - From DB → Schema → API → Frontend
4. **Verify Before Building** - Check what exists before adding new code
5. **Test Before Completion** - Use curl for APIs, browser MCP tool for UI, verify end-to-end
6. **Test the Integration** - Don't just test the UI, test the full flow

## Red Flags in Prompts

Watch out for prompts that:
- Don't mention checking existing schemas
- Don't specify end-to-end integration
- Focus only on UI without mentioning data source
- Don't ask for verification steps
- Skip testing/validation steps
- Declare completion without testing (curl, browser MCP tool)

## Summary

**Before** (led to issues):
> "Add seed data and create pages to display it"

**After** (better approach):
> "Following our schema in shared/schema.zod.ts exactly, create seed data, verify the backend routes exist and work, then create pages that use apiClient to fetch real data. Test with curl and browser MCP tool before declaring complete. Show me the schema-to-UI data flow for verification."

The key is being explicit about:
- What to check first (existing schemas, routes, contracts)
- What the source of truth is (schema files)
- How to verify correctness (show comparisons, test APIs)
- What to avoid (mock data, type mismatches)
- How to test (curl for APIs, browser MCP tool for UI, end-to-end verification)
