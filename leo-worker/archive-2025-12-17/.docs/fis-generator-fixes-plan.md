# FIS Generator Fixes Plan
## Modifying Generator Agents to Produce Optimized Specs

**Date**: 2025-10-13
**Goal**: Fix the FIS generator agents to produce 60% smaller specs without information loss
**Scope**: Modify agent system prompts and user prompts to change generation behavior

---

## Generators to Fix

### 1. FIS Master Generator
**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_master/`
- `system_prompt.py` - Agent behavior and output format
- `user_prompt.py` - Task-specific instructions
- `agent.py` - Agent configuration

**Current Output**: 46KB master spec with verbose examples

**Target Output**: 18KB master spec with condensed references

---

### 2. FIS Page Generator
**File**: `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/`
- `system_prompt.py` - Agent behavior and output format
- `user_prompt.py` - Task-specific instructions
- `agent.py` - Agent configuration

**Current Output**: 10-27KB per page with full TypeScript implementations

**Target Output**: 4-8KB per page with method call lists

---

## Master Generator Fixes

### Fix #1: System Prompt - Add Condensation Rules

**File**: `agents/frontend_interaction_spec_master/system_prompt.py`

**Location**: Add new section after existing rules

```python
## CRITICAL: Spec Condensation Requirements

You MUST produce a condensed, efficient master spec. Follow these rules strictly:

### 1. Navigation Map - Key Flows Only
❌ **DON'T**: Document every possible navigation link with full TSX code
✅ **DO**: Document key user workflows in prose format

Example BAD (verbose):
'''
#### PropertyDetailPage Navigation
```typescript
// Breadcrumbs
<Link to="/">Home</Link>
<Link to="/search">Search</Link>
<span>Property</span>

// Host Information
<Link to={`/hosts/${property.hostId}`}>View Host Profile</Link>
// ... 30 more lines
```
'''

Example GOOD (condensed):
'''
#### Key Workflows

**Property Browsing**: Home → Search → PropertyDetail → RoomDetail
- PropertyDetail shows: host link, room links, similar properties

**Host Management**: Dashboard → PropertiesListPage → EditProperty → ManageRooms
- Workflow: Create property → immediately add rooms → publish
'''

### 2. API Methods - List Only, No Implementations
❌ **DON'T**: Show full API signatures with parameters
✅ **DO**: List method names grouped by entity

Example BAD:
'''
apiClient.users.login({ body: { email, password } }) // Login user, receive token
'''

Example GOOD:
'''
**Users**: `register`, `login`, `logout`, `getCurrentUser`, `getUsers`, `getUser`, `updateUser`
'''

### 3. Components - Specifications, Not Code
❌ **DON'T**: Provide full component implementations with className
✅ **DO**: Describe variants and key dimensions

Example BAD:
'''
<Button className="px-4 py-2 bg-accent-primary text-text-primary rounded-md">
  {children}
</Button>
'''

Example GOOD:
'''
**Button**: Variants - primary (accent), secondary (bg-tertiary), ghost, danger.
Specs: 40px height, 16px padding, 8px radius, normal weight.
'''

### 4. Shared Patterns - Structure, Not Boilerplate
❌ **DON'T**: Show complete pattern implementations
✅ **DO**: List pattern sections and key features

Example BAD:
'''
```typescript
<ListPage>
  <Toolbar className="flex justify-between">
    <h1>{title}</h1>
    <Button>Add New</Button>
  </Toolbar>
  // ... 40 more lines
</ListPage>
```
'''

Example GOOD:
'''
**List Pattern**: Toolbar (title + actions) → Filters → Grid (3 cols) → Empty state → Pagination
Features: Search input, filter dropdowns, create button
'''

### 5. Standard Patterns - Reference, Don't Repeat
❌ **DON'T**: Document standard React Query, ARIA, or auth patterns in detail
✅ **DO**: Reference external docs and note project-specific requirements

Example BAD:
'''
### Pagination
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['entities', page, limit],
  queryFn: () => apiClient.entities.getEntities({ query: { page, limit } })
});
// ... 20 more lines
```
'''

Example GOOD:
'''
**Standard Patterns**: React Query for data fetching, useAuth for authentication,
standard ARIA (labels, required, invalid). See React Query docs for mutations.

**Project-Specific**: Auth redirects based on role (host vs guest dashboards).
'''

## Size Targets

Your master spec MUST be:
- **Maximum 800 lines** (currently ~1,663)
- **Maximum 20KB** (currently ~46KB)

If your output exceeds these limits, you FAILED the task. Condense further.
```

**Expected Impact**: Master spec drops from 46KB → 18KB

---

### Fix #2: User Prompt - Emphasize Efficiency

**File**: `agents/frontend_interaction_spec_master/user_prompt.py`

**Addition to prompt**:

```python
def create_user_prompt(plan_content: str, ...) -> str:
    prompt = f"""Generate a CONDENSED master specification for the frontend.

⚠️ **CRITICAL**: Produce an efficient, reference-style spec. NOT a tutorial.

## Efficiency Requirements

1. **Navigation**: List key workflows (5-10 lines each), not exhaustive navigation trees
2. **API Methods**: Just method names, grouped by entity
3. **Components**: Variants and dimensions only
4. **Patterns**: Pattern structure and features, no boilerplate code
5. **Standard Practices**: Reference external docs (React Query, ARIA), don't repeat

## Size Limits

- Maximum 800 lines
- Maximum 20KB
- If exceeded, CONDENSE until within limits

## Quality Check

After generation, verify:
- [ ] No full TypeScript implementations (method calls only)
- [ ] No repeated design system values in multiple sections
- [ ] No standard React/ARIA patterns (reference only)
- [ ] Navigation map < 200 lines (currently ~500)
- [ ] API section < 50 lines (currently ~130)

Your master spec should be a quick reference guide, not a textbook.

{original_prompt_content}
"""
    return prompt
```

**Expected Impact**: Reinforces condensation rules from system prompt

---

## Page Generator Fixes

### Fix #3: System Prompt - API Integration Condensation

**File**: `agents/frontend_interaction_spec_page/system_prompt.py`

**Location**: Replace existing API Integration guidance

```python
## CRITICAL: API Integration Format

You MUST use condensed API integration format. NO full React Query implementations.

### Format: Method Call → Action

❌ **DON'T** write this:
'''
const updatePropertyMutation = useMutation({
  mutationFn: async (updatedData: UpdateProperty) => {
    const { data } = await apiClient.properties.updateProperty({
      params: { id: propertyId },
      body: updatedData
    });
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['property', propertyId]);
    toast.success('Property updated successfully');
    navigate('/dashboard/host/properties');
  }
});
'''

✅ **DO** write this:
'''
### API Integration

**On Load**:
- `apiClient.properties.getProperty({ params: { id } })` → Load property data
- `apiClient.properties.getPropertyAmenities({ params: { id } })` → Load amenities
- `apiClient.properties.getPropertyPhotos({ params: { id } })` → Load photos

**On Submit**:
- `apiClient.properties.updateProperty({ params: { id }, body: formData })` → Save changes
- Invalidate: `['property', id]`, `['properties']`
- Navigate: `/dashboard/host/properties`
- Toast: "Property updated successfully"

**Photo Actions**:
- Upload: `apiClient.photos.uploadMultiplePhotos({ body: { entityType: 'property', entityId, photos } })`
- Set Primary: `apiClient.photos.setPrimaryPhoto({ params: { id } })`
- Delete: `apiClient.photos.deletePhoto({ params: { id } })` → Invalidate photos
'''

### What to Include

1. **Method signature**: Exact apiClient call with params/query/body
2. **Success action**: Invalidation, navigation, or toast message
3. **Group related calls**: By user action or page section

### What to EXCLUDE

1. NO `useMutation` or `useQuery` boilerplate
2. NO full `mutationFn` implementations
3. NO `onSuccess`/`onError` callback code
4. NO variable declarations or type annotations

The agent reading this spec knows React Query. Just tell it WHICH methods to call.

---

## CRITICAL: States Section Format

You MUST use condensed states format. NO exhaustive descriptions.

❌ **DON'T** write this:
'''
### Loading State
- Display skeleton loaders for form fields
- Skeleton cards for each form section (6 sections total)
- Each skeleton shows:
  - Gray animated rectangle for heading
  - Gray animated rectangles for input fields (varying widths)
- Photo section shows 6 skeleton photo cards in grid
- "Loading property details..." text below header (text-text-secondary)
'''

✅ **DO** write this:
'''
### States

**Loading**: Skeleton loaders for all sections. Message: "Loading property details..."

**Saving**: Button shows "Saving..." with spinner. Form disabled with opacity-50 overlay.

**Errors**:
- Load failure: Red banner, "Unable to load", Retry/Back buttons
- Validation: Red borders, inline messages (see validation rules)
- Save failure: Red banner, "Failed to update property"

**Confirmations**:
- Delete property: Modal warns about X rooms being deleted
- Delete photo: Simple confirmation modal
'''

### Standard States (Reference Only)

For standard states, just mention them - don't describe:
- Loading: "Standard skeleton loaders"
- Success: "Form populated with data"
- Error: "Standard error handling per master spec"

Only elaborate on UNIQUE aspects:
- Unusual loading patterns
- Complex multi-step processes
- Page-specific error conditions
- Non-standard confirmation flows

---

## CRITICAL: Visual Specifications - Page-Specific Only

❌ **DON'T** repeat the design system:
'''
### Input Styling
- Height: 40px (inputs), min-height 128px (textareas)
- Background: bg-bg-secondary
- Border: 1px solid border (slate-700)
- Border radius: 4px
- Text: text-text-primary
- Focus: 2px ring accent-primary
'''

✅ **DO** document only page-specific visuals:
'''
### Visual Specifications

**Form**: Max-width 800px, centered. Sections in cards (24px padding, 16px gap).

**Page-Specific**:
- Photo cards: 4:3 aspect ratio, drag handles for reordering, primary badge top-left
- Amenity grid: 2 cols desktop / 1 mobile, grouped by category with sub-headings
- Quick actions: Two secondary buttons, side-by-side above form

> Standard styling per master spec (inputs, buttons, cards).
'''

### Rule: If It's in Master Spec, Reference It

- Standard input/button/card styling → "Per master spec"
- Standard colors/typography → "Per design foundation"
- Standard spacing/radius → "Per design tokens"

Only document:
- Unique layouts
- Custom dimensions
- Special arrangements
- Page-specific patterns

---

## CRITICAL: Accessibility - Non-Standard Only

❌ **DON'T** document standard ARIA:
'''
```typescript
<input
  id="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">{errors.email}</span>
)}
```
'''

✅ **DO** document only special requirements:
'''
### Accessibility

**Focus**: Email auto-focused on load. Modal traps focus.

**Special**: Photo reordering keyboard accessible (arrow keys + space to grab/drop).

> Standard patterns apply (labels, required, invalid, describedby, aria-live regions).
'''

### Rule: Standard = Reference

Standard accessibility (99% of cases):
- Input labels with `for` attribute
- Required fields with `aria-required`
- Error messages with `aria-invalid` and `aria-describedby`
- Buttons with text or `aria-label`
- Screen reader announcements with `aria-live`

Reference these in one line, then document ONLY:
- Custom focus behavior
- Non-standard keyboard shortcuts
- Complex widget patterns (drag-drop, etc.)
- Multi-step process announcements

---

## Size Targets

Your page spec MUST be:
- **Simple pages** (LoginPage): 150-200 lines, ~4KB
- **Medium pages** (SearchPage): 250-350 lines, ~7KB
- **Complex pages** (EditPropertyPage): 350-450 lines, ~8KB

If your output exceeds these limits, you FAILED. Condense further.
```

**Expected Impact**: Page specs drop from 10-27KB → 4-8KB

---

### Fix #4: User Prompt - Reinforce Condensation

**File**: `agents/frontend_interaction_spec_page/user_prompt.py`

**Addition to prompt**:

```python
def create_page_prompt(page_name: str, route: str, ...) -> str:
    prompt = f"""Generate a CONDENSED page specification for {page_name}.

⚠️ **CRITICAL**: Produce an efficient spec. The agent reading this knows React, React Query, and ARIA.

## Condensation Rules

1. **API Integration**: Method calls only → Actions (no React Query code)
2. **States**: One-liners for standard states, detail only unique ones
3. **Visual Specs**: Page-specific layouts only (reference master for standard styling)
4. **Accessibility**: Non-standard requirements only (reference master for ARIA patterns)
5. **User Interactions**: Simplified table (Element | Action | API/Navigation)

## Size Limits

- Simple page: 150-200 lines (~4KB)
- Medium page: 250-350 lines (~7KB)
- Complex page: 350-450 lines (~8KB)

If exceeded, CONDENSE until within limits.

## What Makes This Page Unique?

Focus your spec on:
- Unique business logic
- Special workflows
- Custom interactions
- Page-specific edge cases

Don't document:
- Standard CRUD operations (agents know how)
- Standard form validation (reference master)
- Standard loading/error states (agents know)
- Standard ARIA patterns (reference master)

## Quality Check

After generation, verify:
- [ ] API section: No `useMutation` or `useQuery` code
- [ ] States section: < 40 lines
- [ ] Visual specs: No repeated design tokens
- [ ] Accessibility: < 15 lines (unless complex widget)
- [ ] Total size: Within limits for complexity

{original_prompt_content}
"""
    return prompt
```

**Expected Impact**: Ensures agents understand and follow condensation rules

---

## Implementation Steps

### Phase 1: Update System Prompts (2 hours)

1. ✅ Create optimization plan with analysis (DONE)
2. ⏭️ Backup current generator prompts:
   ```bash
   cp agents/frontend_interaction_spec_master/system_prompt.py agents/frontend_interaction_spec_master/system_prompt.py.backup
   cp agents/frontend_interaction_spec_page/system_prompt.py agents/frontend_interaction_spec_page/system_prompt.py.backup
   ```

3. ⏭️ Update master generator system prompt:
   - Add condensation rules section
   - Add size targets
   - Add examples (verbose vs condensed)

4. ⏭️ Update page generator system prompt:
   - Add API integration format rules
   - Add states format rules
   - Add visual specs rules
   - Add accessibility rules
   - Add size targets

### Phase 2: Update User Prompts (1 hour)

5. ⏭️ Update master generator user prompt:
   - Add efficiency requirements to prompt
   - Add size limits warning
   - Add quality checklist

6. ⏭️ Update page generator user prompt:
   - Add condensation rules reminder
   - Add size limits by complexity
   - Add quality checklist

### Phase 3: Test with Sample Pages (2 hours)

7. ⏭️ Generate test master spec:
   ```bash
   # Run FIS master generator with updated prompts
   # Compare output size: should be ~18KB vs ~46KB
   ```

8. ⏭️ Generate test page specs (3 pages):
   - Simple: LoginPage (target 4KB vs current 10KB)
   - Medium: SearchPage (target 7KB vs current 18KB)
   - Complex: EditPropertyPage (target 8KB vs current 27KB)

9. ⏭️ Quality validation:
   - Review generated specs manually
   - Check no information loss
   - Verify condensed format followed
   - Test with page generator agent

### Phase 4: Full Regeneration (If Successful)

10. ⏭️ Backup current specs:
    ```bash
    tar -czf specs-backup-$(date +%Y%m%d).tar.gz app/specs/
    ```

11. ⏭️ Regenerate all specs:
    ```bash
    # Run FIS generation for all 34 pages
    # Monitor for errors or quality issues
    ```

12. ⏭️ Validate generated apps:
    ```bash
    # Test page generation with new condensed specs
    # Verify functionality matches previous version
    ```

---

## Testing Criteria

### Success Metrics

1. **Size Reduction**:
   - Master spec: 46KB → 18KB (61% reduction) ✅
   - Simple pages: 10KB → 4KB (60% reduction) ✅
   - Medium pages: 18KB → 7KB (61% reduction) ✅
   - Complex pages: 27KB → 8KB (70% reduction) ✅

2. **Information Preservation**:
   - All unique page features documented ✅
   - All API methods listed ✅
   - All edge cases covered ✅
   - All business logic preserved ✅

3. **Quality**:
   - Generated pages compile without errors ✅
   - Generated pages match functionality ✅
   - No missing features vs previous version ✅
   - Agent understands condensed format ✅

### Failure Conditions

- Generated page missing features ❌
- Agent confused by condensed format ❌
- Size reduction < 50% (not enough) ❌
- Information loss detected ❌

If any failure condition occurs:
1. Identify which condensation rule caused the issue
2. Adjust the rule to be less aggressive
3. Re-test with adjusted prompts
4. Iterate until success criteria met

---

## Rollback Plan

If testing reveals issues:

1. **Restore original prompts**:
   ```bash
   cp agents/frontend_interaction_spec_master/system_prompt.py.backup agents/frontend_interaction_spec_master/system_prompt.py
   cp agents/frontend_interaction_spec_page/system_prompt.py.backup agents/frontend_interaction_spec_page/system_prompt.py
   ```

2. **Keep analysis docs for future reference**:
   - `.docs/fis-spec-optimization-plan.md`
   - `.docs/fis-generator-fixes-plan.md`

3. **Document lessons learned**:
   - Which condensation rules worked
   - Which rules caused issues
   - Agent confusion points

---

## Long-Term Maintenance

### Documentation Updates

After successful implementation, update:

1. **Agent Pattern Docs**:
   - `agents/docs/AGENT_PATTERN.md`
   - Add section on spec condensation best practices

2. **Architecture Docs**:
   - `docs/LEONARDO_PIPELINE_ARCHITECTURE.md`
   - Document FIS spec condensation strategy

3. **Generator README**:
   - `agents/frontend_interaction_spec_master/README.md`
   - `agents/frontend_interaction_spec_page/README.md`
   - Explain condensation rules and rationale

### Future Generator Development

For new generator agents:
1. Start with condensed format from day 1
2. Reference external docs (don't repeat patterns)
3. Focus on unique requirements only
4. Set size targets based on complexity

---

## Key Insights

The fundamental insight driving this optimization:

> **AI agents don't need code examples - they need requirements.**

What agents need to know:
- ✅ What to build (structure, features, workflows)
- ✅ Which APIs to call (method names)
- ✅ What's unique about this page (business logic, edge cases)
- ✅ Success criteria (navigation, validation, responses)

What agents DON'T need:
- ❌ How to write React Query (they know)
- ❌ How to write ARIA attributes (they know)
- ❌ Standard design patterns (reference external docs)
- ❌ Boilerplate implementations (they can generate)

By removing what agents already know and focusing on what's unique, we get:
- **60% smaller specs** (faster to generate and process)
- **Clearer intent** (less noise, more signal)
- **Easier maintenance** (less to update when patterns change)
- **Better scalability** (can fit more context in agent memory)

---

## Next Steps

1. **Immediate**: Review this plan with team
2. **This Sprint**: Update generator prompts (Phases 1-2)
3. **Next Sprint**: Test and validate (Phases 3-4)
4. **Future**: Apply learnings to other generator agents

**Status**: Ready for implementation
**Owner**: TBD
**Timeline**: 2 sprints (5-6 hours total work)
