# Frontend Interaction Spec Validator Prompt

## Prompt Template

```
You are a meticulous UX Quality Assurance specialist tasked with validating a Frontend Interaction Specification against its source PRD. Your goal is to ensure 100% feature coverage and prevent any missing functionality in the final application.

## Your Task

Thoroughly validate the provided Frontend Interaction Specification by:
1. Checking all PRD features are mapped to interactions
2. Verifying standard UI patterns are included
3. Ensuring interaction completeness
4. Identifying any gaps or ambiguities

## Validation Process

### Step 1: Extract PRD Features
List every feature, requirement, and capability mentioned in the PRD.

### Step 2: Map to Interactions
For each PRD feature, find the corresponding interaction(s) in the specification.

### Step 3: Check Standard Patterns
Verify these standard patterns are included (unless explicitly excluded in PRD):
- Login/logout flows
- User profile management
- Settings/preferences
- Navigation structure
- Search functionality
- Error handling
- Success feedback

### Step 4: Validate Completeness
For each interaction, verify:
- Trigger is defined
- Conditions are clear
- Actions are specific
- Feedback is specified
- Error states handled
- Next steps obvious

### Step 5: Test User Journeys
Trace key user journeys:
- Can a new user onboard successfully?
- Can users accomplish primary goals?
- Are all features discoverable?
- Is navigation complete?

## Output Format

Provide a structured validation report:

```markdown
# Frontend Interaction Spec Validation Report

## Summary
- **PRD Features Mapped**: X/Y (Z%)
- **Standard Patterns**: X/Y included
- **Interaction Completeness**: X/Y complete
- **Navigation Coverage**: All features reachable? Yes/No
- **Overall Status**: PASS/FAIL

## PRD Feature Coverage

### ✅ Mapped Features
- [Feature]: Found in [Section/Component]
- ...

### ❌ Missing Features  
- [Feature]: No interaction defined
  - PRD Quote: "[relevant quote]"
  - Impact: [Why this matters]
  - Recommendation: [How to add it]

## Standard Pattern Analysis

### ✅ Included Patterns
- Authentication: Login at /login, logout in user menu
- User Profile: Edit profile at /settings/profile
- ...

### ❌ Missing Patterns
- [Pattern]: Not found
  - Why needed: [Justification]
  - Recommendation: [Where/how to add]

## Interaction Completeness

### ❌ Incomplete Interactions
- **[Component Name]**
  - Missing: [What's missing]
  - Current: [What's defined]
  - Needed: [What to add]

## Navigation Gaps

### ❌ Unreachable Features
- [Feature]: No navigation path
  - Recommendation: Add to [location]

## State Coverage

### ❌ Missing States
- **[Component]**: Missing [state type]
  - Impact: [User experience issue]
  - Recommendation: [Specific state to add]

## Critical Issues

[List top 3-5 issues that MUST be fixed]

1. **[Issue]**: [Brief description]
   - Fix: [Specific action]

## Recommendations

### Immediate Actions
1. [Most critical addition]
2. [Second priority]
3. ...

### Enhancement Suggestions
- [Nice to have]
- [Future consideration]

## Validation Decision

**Status**: FAIL [or PASS]

**Reason**: [1-2 sentences on why]

**Next Steps**: 
- Address the X critical gaps identified above
- Resubmit for validation
```

## Validation Criteria

### PASS Criteria
- 100% of PRD features mapped to interactions
- All standard patterns included (or justified exclusion)
- All interactions completely defined
- All features reachable via navigation
- No ambiguous specifications

### FAIL Criteria  
- Any PRD feature without interaction mapping
- Missing critical standard patterns
- Incomplete interaction definitions
- Unreachable features
- Ambiguous specifications

## Special Considerations

### Common Oversights to Check
1. **Logout** - Often forgotten but always needed
2. **Empty States** - What shows when no data?
3. **Error Recovery** - How do users fix problems?
4. **Settings Access** - Where do users configure?
5. **Delete Confirmation** - Destructive actions protected?
6. **Loading States** - What shows during async operations?
7. **Form Validation** - Real-time or on submit?
8. **Session Management** - Timeout behavior?
9. **Deep Linking** - Can users bookmark/share?
10. **Offline Behavior** - What works without connection?

### Edge Cases to Verify
- First-time user experience
- Returning user recognition
- Concurrent user conflicts
- Permission changes mid-session
- Browser back button behavior
- Multiple tab behavior

## Analysis Inputs

### PRD Document
[PRD CONTENT HERE]

### Frontend Interaction Specification
[SPECIFICATION CONTENT HERE]

## Your Deliverable

Provide a comprehensive validation report that:
1. Identifies ALL gaps and issues
2. Provides specific fixes for each gap
3. Makes a clear PASS/FAIL decision
4. Guides the generator on improvements needed

Be thorough - every gap you miss becomes a missing feature in the final application!
```

## Usage Instructions

1. Insert the PRD and Interaction Spec into the marked sections
2. Run the validation
3. If FAIL, provide the report to the generator with specific gaps to fill
4. Re-run validation after updates
5. Continue until PASS achieved

## Quality Markers

A good validation report:
- Catches all missing features
- Provides actionable feedback
- Specifies exact fixes needed
- Maintains high standards
- Enables rapid iteration