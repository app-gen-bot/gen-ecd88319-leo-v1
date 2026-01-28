# Frontend Interaction Spec Validator Principles

## Core Mission

Ensure the Frontend Interaction Specification is complete, unambiguous, and will result in a fully functional application with no missing features.

## Validation Philosophy

### 1. Completeness Over Perfection

Better to have a rough specification for every feature than a perfect specification for half the features. We can refine, but we can't use what's missing.

### 2. User Journey Validation

Can a user discover and successfully use every feature mentioned in the PRD? Trace each user journey from start to finish.

### 3. The "Stranger Test"

Could a developer who has never seen the PRD implement the exact intended behavior using only this specification? If there's room for interpretation, it's incomplete.

### 4. Standard Pattern Enforcement

Certain patterns are so fundamental that their absence indicates a gap, even if not explicitly in the PRD:
- Authentication (login/logout)
- User profile management
- Settings/preferences
- Error recovery
- Search functionality

### 5. State Coverage

Every interactive element must have all its states defined:
- Initial/default state
- Loading state
- Success state
- Error state
- Empty state (for collections)
- Disabled state (when applicable)

## Validation Checklist

### PRD Feature Coverage
- [ ] Every PRD feature mapped to interactions
- [ ] All user personas can accomplish their goals
- [ ] Business rules enforced through UI constraints
- [ ] Success criteria achievable through defined interactions

### Standard UI Patterns
- [ ] Authentication flow (login, logout, session)
- [ ] User profile (view, edit)
- [ ] Settings/preferences page
- [ ] Navigation to all features
- [ ] Search functionality
- [ ] Error handling patterns
- [ ] Success feedback patterns
- [ ] Help/documentation access

### Interaction Completeness
For each interaction:
- [ ] Trigger clearly defined
- [ ] Conditions/permissions specified
- [ ] Action outcomes described
- [ ] Success feedback defined
- [ ] Error scenarios handled
- [ ] Next steps clear

### Navigation Validation
- [ ] Every feature reachable from main navigation
- [ ] Back/cancel paths defined
- [ ] Deep linking considered
- [ ] Mobile navigation patterns
- [ ] Breadcrumbs where appropriate

### Form Validation
For each form:
- [ ] All fields defined with types
- [ ] Required vs optional clear
- [ ] Validation rules specified
- [ ] Error message patterns
- [ ] Submit/cancel behaviors
- [ ] Success actions defined

### List/Collection Validation
For each list:
- [ ] Empty state defined
- [ ] Loading state specified
- [ ] Error state handled
- [ ] Sorting/filtering interactions
- [ ] Pagination/infinite scroll
- [ ] Item interactions (click, hover)

### State Management
- [ ] User session state
- [ ] UI state (open/closed panels)
- [ ] Form state persistence
- [ ] Navigation state
- [ ] Error recovery state

## Validation Process

### 1. Automated Checks

Run these programmatic validations:

```python
def validate_spec(spec, prd):
    # Check PRD feature coverage
    prd_features = extract_features(prd)
    spec_features = extract_interactions(spec)
    missing = prd_features - spec_features
    
    # Check standard patterns
    required_patterns = [
        'login', 'logout', 'profile', 
        'settings', 'search', 'navigation'
    ]
    missing_patterns = check_patterns(spec, required_patterns)
    
    # Check state completeness
    components = extract_components(spec)
    incomplete_states = check_states(components)
    
    return ValidationReport(
        missing_features=missing,
        missing_patterns=missing_patterns,
        incomplete_states=incomplete_states
    )
```

### 2. Manual Review

Beyond automated checks, manually verify:

1. **User Journey Tracing**
   - Pick a user goal from PRD
   - Trace the complete journey in the spec
   - Identify any gaps or ambiguities

2. **Edge Case Consideration**
   - What if the user has no data?
   - What if actions fail?
   - What if permissions change?
   - What about concurrent users?

3. **Mobile Consideration**
   - Are touch interactions specified?
   - Is responsive behavior clear?
   - Are mobile-specific patterns included?

### 3. Gap Analysis

When gaps are found:

1. **Categorize the Gap**
   - Missing feature
   - Incomplete interaction
   - Undefined state
   - Navigation gap

2. **Specify the Fix**
   - Exactly what needs to be added
   - Where it should be added
   - What pattern to follow

3. **Verify the Fix**
   - Re-run validation
   - Ensure fix doesn't break other flows
   - Confirm completeness

## Common Validation Failures

### 1. Missing Logout
**Issue**: No way for users to end their session  
**Fix**: Add logout to user menu with clear navigation

### 2. Incomplete CRUD
**Issue**: Can create and read, but not update or delete  
**Fix**: Add edit/delete actions with confirmations

### 3. No Empty States
**Issue**: Lists don't specify what shows when empty  
**Fix**: Add helpful empty state with action prompts

### 4. Missing Error Recovery
**Issue**: Errors shown but no recovery path  
**Fix**: Add retry actions and helpful guidance

### 5. Orphaned Features
**Issue**: Feature defined but not reachable  
**Fix**: Add navigation path from main menu

## Quality Metrics

### Completeness Score
```
(Implemented Features / Total PRD Features) × 100
```
Target: 100%

### Pattern Coverage
```
(Included Standard Patterns / Expected Patterns) × 100
```
Target: 100%

### State Definition
```
(Fully Defined Components / Total Components) × 100
```
Target: 100%

### Navigation Coverage
```
(Reachable Features / Total Features) × 100
```
Target: 100%

## Output Format

The validator should produce a clear report:

```markdown
# Validation Report

## Summary
- PRD Features: 24/25 mapped (96%)
- Standard Patterns: 8/8 included (100%)
- State Coverage: 15/18 complete (83%)
- Navigation: All features reachable ✓

## Missing Items

### Missing Feature
- **PRD Requirement**: "Users can export their data"
- **Status**: No export interaction defined
- **Recommendation**: Add export button to settings page

### Incomplete State
- **Component**: UserList
- **Missing**: Empty state definition
- **Recommendation**: Add "No users yet" message with invite action

## Validation Result: FAIL

Please address the 2 missing items above and resubmit.
```

## Remember

The validator is the quality gate that prevents the 50% feature miss rate. Be thorough, be specific, and don't let incomplete specifications pass. Every gap found here saves hours of debugging later.