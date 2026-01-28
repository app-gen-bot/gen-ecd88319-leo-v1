# Prompt Expander Update - January 2025

## Overview
Updated the prompt expander to be context-aware and testing-focused, using Sonnet model for better quality expansions.

## Key Changes

### 1. Model Upgrade
- Changed from `haiku` to `sonnet` for better understanding and expansion quality
- Updated in both `prompt_expander.py` and `config.py`

### 2. Context Awareness
The prompt expander now understands that the main agent:
- Has FULL context about the app being modified
- Knows all entities, features, and architecture
- Can read all files directly
- Has browser and curl tools for testing
- Maintains session history

### 3. Testing Emphasis
The expander now ALWAYS includes testing steps when users request features:

#### Backend Testing Pattern
```bash
# After implementing API endpoint
curl -X [METHOD] http://localhost:5013/api/[endpoint]
# Verify response matches schema
# Show actual JSON response
```

#### Frontend Testing Pattern
```
1. Open browser with mcp__browser__open_browser
2. Navigate to http://localhost:5013
3. Test full user flow with specific actions
4. Verify data persists after refresh
5. Take screenshots as proof
```

### 4. When to Expand vs Pass Through

**ALWAYS EXPAND:**
- New features or functionality
- API endpoint changes
- Frontend UI changes
- Database/schema modifications
- CRUD operations
- Data seeding

**PASS THROUGH (NO_EXPANSION_NEEDED):**
- User already included testing steps
- Fixing typos or comments
- User says "don't test"
- Purely cosmetic changes (CSS only)

## Example Expansions

### Simple Request
**Input:** "Add a delete button to posts"

**Expanded Output:**
```
Add a delete button to posts with full-stack integration and testing:

1. Backend: Implement DELETE /api/posts/:id endpoint
   - Add route handler in server/routes/posts.ts
   - Include authorization checks
   - Test with: curl -X DELETE http://localhost:5013/api/posts/1
   - Verify response and that post is deleted from database

2. Frontend: Add delete button to post components
   - Use apiClient.posts.delete(id) - NO mock implementation
   - Add confirmation dialog before deletion
   - Handle loading state during deletion
   - Show success/error messages

3. Browser Testing:
   - Open browser with mcp__browser__open_browser
   - Navigate to http://localhost:5013 with mcp__browser__navigate_browser
   - Click delete button on a test post
   - Confirm deletion dialog appears
   - Complete deletion and verify post disappears
   - Refresh page to confirm deletion persisted
   - Take screenshot of working feature
```

### Data Seeding
**Input:** "Seed it with companies"

**Expanded Output:**
```
Add seed data for companies with verification:

1. Schema Verification:
   - Read shared/schema.zod.ts to get exact Company type
   - List all required fields and their types
   - Note any enums or special validations

2. Create Seed Data:
   - Generate 5-10 realistic companies
   - Ensure all field names match schema exactly
   - Use proper types (strings, numbers, booleans)

3. API Testing:
   - Add companies via POST /api/companies
   - Test: curl -X POST http://localhost:5013/api/companies -H 'Content-Type: application/json' -d '{"name":"Example Corp",...}'
   - Verify each company is created successfully
   - GET all companies to confirm: curl http://localhost:5013/api/companies

4. Browser Verification:
   - Open browser and navigate to companies page
   - Verify all seeded companies appear correctly
   - Check that all fields display properly
   - Take screenshot of populated list
```

## Philosophy

The prompt expander enforces a quality-first approach:
1. **Backend First**: Always implement and test backend before frontend
2. **Test Everything**: Every feature must be tested with curl and browser
3. **No Mock Data**: All frontend must use real API connections
4. **Visual Verification**: Browser testing confirms features actually work
5. **Integration Focus**: Verify frontend and backend work together

## Benefits

1. **Higher Quality**: Features are thoroughly tested before completion
2. **Fewer Bugs**: API testing catches issues early
3. **Real Integration**: No mock data means real end-to-end testing
4. **Visual Proof**: Screenshots show features actually work
5. **Context Aware**: Doesn't over-expand when agent has sufficient context

## Usage

The prompt expander runs automatically in:
- `generate_app()` - When creating new apps
- `resume_generation()` - When modifying existing apps
- Interactive mode - For all user inputs

It uses the Sonnet model for better understanding and only expands when it adds value, particularly for testing and verification steps.