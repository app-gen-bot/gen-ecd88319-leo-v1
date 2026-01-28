# Wireframe to Specifications Workflow

## Overview

This document captures the workflow for updating DRAFT specifications based on wireframe analysis. The core principle
is: **"If it's in the wireframe, it goes in the spec."** The wireframe is the source of truth for what the application
should do.

## Phase 2: Specification Generation Workflow

### Prerequisites

- Completed wireframe (Next.js application)
- Integration analysis report
- Extracted stub data
- Delta documents comparing DRAFT specs to wireframe

### Step 1: Integration Analysis

#### 1.1 Run Integration Analyzer

```bash
# Use MCP integration analyzer tool
mcp__integration_analyzer__analyze_project --project_path /path/to/wireframe

# If tool is limited, perform manual analysis
```

#### 1.2 Manual Analysis Enhancement

When automated tools miss integration points:

1. **Search for API calls**
   ```bash
   grep -r "fetch\|axios\|api\|endpoint" --include="*.tsx" --include="*.ts"
   ```

2. **Analyze mock data structures**
   ```bash
   find . -name "*.tsx" -o -name "*.ts" | xargs grep -l "mock\|dummy\|sample"
   ```

3. **Extract component data needs**
   - Review all components for data they display
   - Note user interactions that would trigger API calls
   - Document state management patterns

#### 1.3 Create Integration Report

Structure:

```markdown
# Integration Analysis Report

## API Endpoints Discovered

1. Authentication
   - POST /api/auth/login
   - POST /api/auth/logout
     ...

## Data Structures

- User: { id, name, email, avatar, status... }
- Channel: { id, name, type, members... }
  ...

## Real-time Events

- message:new
- user:typing
  ...
```

### Step 2: Extract Stub Data

#### 2.1 Collect Mock Data

```typescript
// Extract from components
const users = [...];
const channels = [...];
const messages = [...];
```

#### 2.2 Structure Data Collections

```json
{
   "users": [
      ...
   ],
   "channels": [
      ...
   ],
   "messages": [
      ...
   ],
   "notifications": [
      ...
   ]
   // ... all collections
}
```

#### 2.3 Generate Database Schema

Based on stub data, create:

- DynamoDB table definitions
- Access patterns (queries)
- Global Secondary Indexes
- Seed scripts

### Step 3: Delta Analysis

#### 3.1 Compare Each Specification

For each DRAFT specification (01-05), create delta documents:

```markdown
# [Spec Name] vs Wireframe Delta Analysis

## Executive Summary

- Implementation rate: X%
- Missing features: [list]
- Additional features: [list]

## Detailed Comparison

### Feature 1

**Specified**: ...
**Implemented**: ...
**Delta**: ...
```

#### 3.2 Key Metrics to Track

- Feature coverage percentage
- Missing entities/endpoints
- Additional discoveries
- Data model gaps

### Step 4: Update Specifications

#### 4.1 Update Order

1. **Data Models (05)** - Foundation for everything
2. **API Contract (02)** - Based on integration points
3. **Backend Specification (04)** - Implementation details
4. **Frontend Specification (03)** - Component details
5. **Business Specification (01)** - High-level features

#### 4.2 Data Models Update

**Sources**:

- `stub-data-extracted.json` - Raw data
- `seed-data.ts` - Typed structures
- `dynamodb-tables.ts` - NoSQL schema

**Process**:

1. Extract all entities from stub data
2. Define fields based on actual usage
3. Add relationships discovered
4. Include UI-specific fields (denormalized data)
5. Add missing entities (Notifications, Threads, etc.)

**Example**:

```typescript
// From stub data
const user = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "JD",
  status: "online",
  title: "Senior Developer",
  lastActive: "2 minutes ago"
};

// Becomes in spec
User {
  id: string (UUID)
  name: string
  email: string
  avatar_url: string
  avatar_initials: string  // UI field
  status: enum [online, away, offline]
  title: string  // job title
  last_active_at: datetime
  last_active_human: string  // "2 minutes ago"
}
```

#### 4.3 API Contract Update

**Sources**:

- `integration-analysis-report.md` - All endpoints
- Component interactions
- Mock data API shapes

**Process**:

1. List all endpoints from integration analysis
2. Define request/response based on wireframe data
3. Add discovered endpoints not in DRAFT
4. Include WebSocket events
5. Document rate limits and pagination

**Example**:

```yaml
# From integration analysis
   GET /api/channels/{channel_id}/messages
Response: {
   messages: [ ... ],
   hasMore: boolean,
   oldestTimestamp: string
}

   # From wireframe behavior
   - Loads 50 messages initially
   - Infinite scroll for more
   - Includes user data (denormalized)
```

#### 4.4 Backend Specification Update

**Sources**:

- API Contract (updated)
- DynamoDB tables
- Integration patterns

**Process**:

1. Add missing services (notifications, presence, threads)
2. Define all DynamoDB access patterns
3. Include Redis caching strategy
4. Add background job specifications
5. Detail WebSocket protocol

**Additions needed**:

```python
# New services from wireframe
app / api / v1 /
notifications.py  # Bell icon functionality
presence.py  # Online/away/offline
threads.py  # Message threads
conversations.py  # DM management
reactions.py  # Emoji reactions
oauth.py  # Google OAuth flow
```

#### 4.5 Frontend Specification Update

**Sources**:

- Actual component list from wireframe
- Component interactions
- State management patterns

**Process**:

1. List all implemented components
2. Document component props/state
3. Add routing structure
4. Include discovered UI patterns
5. Document real-time subscriptions

#### 4.6 Business Specification Update

**Sources**:

- All implemented features
- User workflows in wireframe
- Additional features discovered

**Process**:

1. Update feature list with implementations
2. Add discovered features (threads, search modal)
3. Clarify ambiguous requirements
4. Document actual user flows

### Step 5: Validation

#### 5.1 Cross-Reference Check

- Ensure every wireframe feature appears in specs
- Verify all API endpoints have implementations
- Confirm data models support all UI needs
- Check WebSocket events match real-time features

#### 5.2 Completeness Test

Run through user workflows:

1. Login → Workspace → Channel → Send message
2. Search for content
3. Receive notification
4. Start thread
5. Upload file

Each workflow should have:

- UI components (Frontend spec)
- API endpoints (API contract)
- Backend services (Backend spec)
- Data models (Data models spec)

### Step 6: Documentation

#### 6.1 Update Status Notes

Replace DRAFT status with version numbers:

```markdown
# API Contract v1.0

Generated from wireframe analysis on [date]
Based on integration points discovered in implemented UI
```

#### 6.2 Traceability

Document source of each specification element:

```markdown
## Message Threading

Source: Wireframe components/message.tsx:45-67
Integration: GET /api/messages/{id}/thread
Implementation: services/threads.py
```

## Automation Opportunities

### 1. AST-Based Analysis

```typescript
// Future tool enhancement
function analyzeComponent(ast: TSNode) {
  // Find all data dependencies
  // Extract API call patterns
  // Identify state management
}
```

### 2. Automatic Delta Generation

```python
def compare_spec_to_implementation(spec, wireframe_analysis):
# Compare features
# Calculate coverage
# Generate delta report
```

### 3. Specification Templates

```yaml
# Template for consistent updates
endpoint:
   path: /api/...
   method: GET|POST|PUT|DELETE
   source: component/file.tsx:line
   request: { schema }
   response: { schema }
```

### 4. Validation Rules

```javascript
// Ensure consistency
rules = {
  "every_endpoint_has_implementation": true,
  "every_ui_field_in_data_model": true,
  "every_user_action_has_api": true
}
```

## Key Principles

1. **Wireframe is Truth** - If it's in the UI, it must be in the specs
2. **Data Drives Design** - Stub data reveals the real data model
3. **Integration Points Matter** - Every click/interaction needs backend support
4. **Denormalization is OK** - UI performance trumps data purity
5. **Real-time First** - WebSocket events for live features

## Common Pitfalls to Avoid

1. **Don't ignore UI-specific fields** - "2 minutes ago" needs storage
2. **Don't miss implied features** - Unread counts imply tracking
3. **Don't skip performance fields** - Cached counts prevent slow queries
4. **Don't forget real-time** - Live updates need WebSocket events
5. **Don't assume REST only** - Some features need real-time push

## Success Criteria

Updated specifications are complete when:

- [ ] Every wireframe feature has API support
- [ ] Every UI data need has a data model
- [ ] Every user action has a backend service
- [ ] Every real-time feature has WebSocket events
- [ ] Every integration point is documented
- [ ] No DRAFT labels remain

## Next Steps

After completing specification updates:

1. Review with stakeholders
2. Version specifications (v1.0)
3. Begin Phase 3: Implementation
4. Use specs as implementation checklist
5. Update specs if implementation discovers gaps

---

This workflow ensures specifications accurately reflect the implemented wireframe, providing a solid foundation for
backend development and future automation of the specification generation process.