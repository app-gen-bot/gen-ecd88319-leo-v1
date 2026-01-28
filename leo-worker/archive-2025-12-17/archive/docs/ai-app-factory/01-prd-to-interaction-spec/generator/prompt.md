# Frontend Interaction Specification Generator Prompt

## Prompt Template

```
You are an expert UX designer tasked with creating a comprehensive Frontend Interaction Specification from a Business Requirements Document (PRD). Your specification will ensure 100% feature coverage by defining every user interaction before visual design begins.

## Your Task

Transform the provided PRD into a detailed interaction specification that captures:
1. Every user-facing feature
2. All interaction flows 
3. Navigation paths
4. Error states
5. Empty states
6. Standard UI patterns

## Format

Use this structure for your specification:

```markdown
# Frontend Interaction Specification: [App Name]

## Overview
[Brief description of the application and its primary purpose]

## Global Navigation
[Define the persistent navigation structure]

### [Navigation Component]
- **Location**: [Where it appears]
- **Items**: [List of navigation items]
- **Behavior**: [How it works]

## Pages

### Page: [Page Name] ([route])

#### Purpose
[What this page is for]

#### Components

**[Component Name]**
- **Type**: [Form, List, Modal, etc.]
- **Trigger**: [What initiates this]
- **Fields/Content**: [What it contains]
- **Actions**: [Available actions]
- **States**: [Loading, empty, error, success]
- **Validation**: [Rules if applicable]

## User Flows

### Flow: [Flow Name]
1. [Step 1]
2. [Step 2]
3. [Success path]
4. [Error handling]

## State Management

### [State Category]
- [State description and behavior]

## Error Handling

### [Error Type]
- **Display**: [How shown to user]
- **Recovery**: [How to fix]

## Validation Checklist
[List of all PRD features with ✓ marks]
```

## Critical Instructions

1. **Be Exhaustive**: Include every single interaction, even "obvious" ones like logout
2. **Be Specific**: "Click avatar → Dropdown opens → Click Settings → Navigate to /settings"
3. **Include Standard Patterns**: Always add login/logout, profile, settings, search
4. **Define All States**: Empty, loading, error, success for every component
5. **Specify Validation**: Form rules, character limits, required fields
6. **Consider Mobile**: Touch interactions, responsive behaviors
7. **Map Every Feature**: Ensure each PRD feature has corresponding interactions

## Standard Patterns to Always Include

Unless the PRD explicitly excludes them, always include:

1. **Authentication**
   - Login page with email/password
   - Logout option in user menu
   - Session management
   - Password reset flow

2. **User Profile**
   - View own profile
   - Edit profile information
   - Upload avatar
   - Change password

3. **Settings**
   - User preferences
   - Notification settings
   - Privacy settings
   - Account management

4. **Search**
   - Global search accessibility
   - Search results presentation
   - Filtering and sorting
   - No results state

5. **Navigation**
   - How to reach all features
   - Mobile menu pattern
   - Breadcrumbs where appropriate
   - Back button behavior

## Example Interaction Definition

```markdown
**CreateItemModal**
- **Trigger**: Click "New Item" button in header
- **Type**: Modal dialog
- **Fields**:
  - name: Text input (required, 3-50 chars)
  - description: Textarea (optional, max 500 chars)
  - category: Dropdown (required)
- **Actions**:
  - Create: Validate → Submit → Close modal → Show success toast → Refresh list
  - Cancel: Close modal without saving
- **Validation**:
  - Name required and unique
  - Show inline errors below fields
  - Disable submit until valid
- **Error States**:
  - Network error: "Failed to create. Please try again."
  - Duplicate name: "An item with this name already exists."
```

## PRD to Analyze

[PRD CONTENT WILL BE INSERTED HERE]

## Deliverable

Provide a complete Frontend Interaction Specification that:
1. Maps every PRD feature to user interactions
2. Includes all standard UI patterns
3. Defines all states and error handling
4. Ensures users can discover and use every feature
5. Can be used to generate a complete, functional wireframe

Remember: Your specification prevents missing features. Be thorough!
```

## Usage Notes

1. **PRD Insertion**: Replace `[PRD CONTENT WILL BE INSERTED HERE]` with the actual PRD
2. **Customization**: Adjust standard patterns based on application type
3. **Validation**: Run the output through the validator agent
4. **Iteration**: If validation fails, provide specific gaps to fill

## Success Metrics

A successful generation:
- Maps 100% of PRD features
- Includes all standard patterns
- Specifies all interaction states
- Provides clear navigation paths
- Handles all error scenarios