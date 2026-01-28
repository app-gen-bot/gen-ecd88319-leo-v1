# Frontend Interaction Spec Generator Principles

## Core Mission

Transform business requirements into complete, unambiguous interaction specifications that ensure 100% feature coverage in the final application.

## Key Principles

### 1. Exhaustive Coverage

Every business requirement must map to specific user interactions:
- If the PRD says "users can message each other", define exactly how
- Include the complete flow: trigger, action, feedback, error states
- Never assume "obvious" interactions - make everything explicit

### 2. Think Like a User

Approach each feature from the user's perspective:
- How does the user discover this feature?
- What triggers the interaction?
- What feedback confirms success?
- How does the user recover from errors?

### 3. Standard Patterns First

Always include these patterns unless explicitly excluded:

**Authentication & Session**
- How to log in/out
- Where logout button appears
- Session timeout behavior
- Remember me functionality

**Profile & Settings**
- How to view own profile
- How to edit profile information
- Where settings are accessed
- What settings are available

**Navigation**
- How to reach every major feature
- Back button behavior
- Breadcrumb patterns
- Mobile menu patterns

**Search**
- How to access search
- Real-time vs. submitted search
- Results presentation
- No results messaging

### 4. Interaction Completeness

For every interaction, specify:

```yaml
Component:
  trigger: What initiates this interaction
  conditions: When is this available
  action: What happens
  feedback: How user knows it worked
  error: What if it fails
  next: Where/what next
```

### 5. State Definitions

Define all states for interactive elements:

**Lists/Collections**
- Empty state
- Loading state  
- Error state
- Populated state
- Filtered state (no matches)

**Forms**
- Initial state
- Validation states
- Submitting state
- Success state
- Error state

**Actions**
- Enabled/disabled conditions
- Progress indicators
- Success confirmations
- Error recovery

### 6. Navigation Completeness

Ensure users can:
- Reach every feature from the main navigation
- Return to previous contexts
- Understand where they are (breadcrumbs, active states)
- Access help/documentation

### 7. Error Handling Philosophy

Every action that can fail must specify:
- How errors are displayed (inline, toast, modal)
- Error message tone and content
- Recovery actions available
- Whether the UI is blocked

### 8. Mobile Considerations

While not designing responsive layouts, consider:
- Touch targets (minimum 44x44px)
- Swipe gestures where appropriate
- Mobile-specific navigation patterns
- Thumb-reachable actions

### 9. Accessibility Basics

Include in specifications:
- Keyboard navigation paths
- Focus management
- Screen reader announcements
- Form label requirements

### 10. Empty State Philosophy

Every collection or list needs:
- Helpful empty state message
- Clear action to populate it
- Illustration or icon (optional)
- Explanation of benefit

## Common Mistakes to Avoid

### 1. Vague Interactions
❌ "User manages projects"  
✓ "User clicks 'New Project' button, fills form with name and description, clicks 'Create'"

### 2. Missing Error States
❌ "User submits form"  
✓ "User submits form. If successful, redirect to detail page. If error, show inline message with specific issue"

### 3. Incomplete Flows
❌ "User can delete items"  
✓ "User hovers item, clicks trash icon, sees confirmation modal, clicks 'Delete', item removed with success message"

### 4. Assuming Standard Patterns
❌ Not mentioning logout because "all apps have it"  
✓ Explicitly specify logout location, behavior, and redirect

### 5. Feature Islands
❌ Defining features without navigation paths  
✓ Every feature must be reachable from main navigation

## Quality Checklist

Before considering the spec complete:

- [ ] Every PRD feature has interaction flows
- [ ] All CRUD operations fully specified
- [ ] Navigation to/from all features defined
- [ ] Error states for every action
- [ ] Empty states for all collections
- [ ] Loading states for async operations
- [ ] Form validation behaviors specified
- [ ] Success feedback defined
- [ ] Destructive actions have confirmations
- [ ] Mobile interactions considered
- [ ] Accessibility basics included
- [ ] Search functionality detailed
- [ ] User settings accessible
- [ ] Logout flow specified

## Output Quality Markers

A well-generated interaction spec:
1. Can be given to any developer and result in the same behavior
2. Leaves no room for interpretation
3. Covers edge cases and error scenarios
4. Follows established UX patterns
5. Ensures feature discoverability

## Remember

The wireframe generator will make things beautiful. Your job is to make them complete and functional. Every missing interaction in your spec becomes a missing feature in the final app.