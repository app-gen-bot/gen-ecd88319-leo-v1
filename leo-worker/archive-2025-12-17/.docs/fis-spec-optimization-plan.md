# FIS Spec Optimization Plan
## Pragmatic Size Reduction Without Information Loss

**Date**: 2025-10-13
**App Analyzed**: coliving-marketplace_v2
**Current State**:
- Master Spec: 46KB (~1,663 lines)
- Page Specs: Average 18KB, ranging from 10KB to 27KB
- Total for 34 pages: ~658KB

**Target State**:
- Master Spec: ~18KB (~650 lines) - **61% reduction**
- Page Specs: Average 7KB - **61% reduction**
- Total for 34 pages: ~256KB - **61% overall reduction**

**Token Savings**: ~102,000 tokens per full page generation (at ~4 chars/token)

---

## Analysis: Where's the Bloat?

### 1. Master Spec Redundancies (46KB)

| Section | Lines | Size | Issue | Can Reduce? |
|---------|-------|------|-------|-------------|
| Design Foundation | 1-83 | 3KB | **KEEP** - Core design system | ❌ |
| Layout Templates | 84-163 | 3KB | **KEEP** - Essential patterns | ❌ |
| Route Inventory | 164-213 | 2KB | **KEEP** - Navigation structure | ❌ |
| Navigation Map | 214-718 | **18KB** | **VERBOSE** - Exhaustive navigation flows | ✅ 80% |
| API Methods | 742-873 | **5KB** | **DUPLICATION** - Full implementations | ✅ 70% |
| Basic Components | 877-994 | 4KB | **VERBOSE** - Full code examples | ✅ 50% |
| Shared Patterns | 997-1258 | **10KB** | **VERBOSE** - Too detailed | ✅ 60% |
| Workflow/Error/Auth | 1259-1481 | 8KB | **USEFUL** - Keep most | ⚠️ 30% |
| Performance/A11y | 1484-1663 | 7KB | **BOILERPLATE** - Standard patterns | ✅ 50% |

**Reduction Potential**: 28KB → **18KB savings**

---

### 2. Page Spec Redundancies (Average 18KB)

#### Example: EditPropertyPage (27KB)

| Section | Lines | Size | Issue | Can Reduce? |
|---------|-------|------|-------|-------------|
| Page Setup | 1-45 | 1.5KB | **KEEP** - Page context | ❌ |
| Content Structure | 46-241 | 6KB | **KEEP** - UI specification | ❌ |
| User Interactions | 242-275 | 1KB | **REDUCE** - Too tabular | ⚠️ 40% |
| API Integration | 276-621 | **12KB** | **BLOAT** - Full TypeScript code | ✅ 80% |
| States | 622-709 | 3KB | **BOILERPLATE** - Standard patterns | ✅ 60% |
| Visual Specs | 710-758 | 1.5KB | **DUPLICATION** - Repeats master | ✅ 80% |
| Responsive | 759-781 | 0.7KB | **USEFUL** - Keep | ❌ |
| Accessibility | 782-811 | 1KB | **BOILERPLATE** - Standard patterns | ✅ 70% |
| Edge Cases | 812-863 | 1.5KB | **KEEP** - Page-specific | ❌ |

**Reduction Potential**: 27KB → **~7KB** (20KB savings per complex page)

---

## Optimization Strategy

### Phase 1: Master Spec Condensation

#### 1.1 Navigation Map Reduction (Lines 214-718, ~18KB → ~4KB)

**Current Problem**: Exhaustive click-by-click navigation for every page

**Example of Verbosity**:
```markdown
#### PropertyDetailPage Navigation
```typescript
// Breadcrumbs
<Link to="/">Home</Link>
<Link to="/search">Search</Link>
<span>Property</span>

// Host Information
<Link to={`/hosts/${property.hostId}`}>View Host Profile</Link>

// Room Listings
rooms.map(room => (
  <Link to={`/rooms/${room.id}`}>View Room Details</Link>
))
...
```

**Optimized Approach**:
```markdown
#### Key Navigation Flows

**Property Browsing**:
- Home → Search → PropertyDetail → RoomDetail
- PropertyDetail: Shows host profile link, room links, similar properties

**Host Management**:
- HostDashboard → PropertiesListPage → EditPropertyPage → PropertyManageRoomsPage
- Quick Actions: Add Property → Add Rooms workflow

**Guest Actions**:
- Search → SavedListings → PropertyDetail (with save/unsave actions)
```

**Reduction**: 500 lines → 120 lines (**76% reduction**)

**What's Lost**: Nothing - agents can infer navigation from route structure
**What's Kept**: Key user workflows and non-obvious navigation patterns

---

#### 1.2 API Methods Condensation (Lines 742-873, ~5KB → ~1.5KB)

**Current Problem**: Full API signatures with query/body/response details

**Example of Verbosity**:
```markdown
### Users API (`apiClient.users`)
```typescript
// Authentication
apiClient.users.register({ body }) // Register new user
apiClient.users.login({ body }) // Login user, receive token
apiClient.users.logout() // Logout current user
apiClient.users.getCurrentUser() // Get authenticated user profile

// User Management
apiClient.users.getUsers({ query }) // List users with pagination
apiClient.users.getUser({ params: { id } }) // Get user by ID
...
```

**Optimized Approach**:
```markdown
### Available API Methods

**Users**: `register`, `login`, `logout`, `getCurrentUser`, `getUsers`, `getUser`, `updateUser`, `deleteUser`, `getUserProperties`, `sendEmailVerification`, `verifyEmail`, `sendPhoneVerification`, `verifyPhone`

**Properties**: `getProperties`, `getProperty`, `createProperty`, `updateProperty`, `deleteProperty`, `searchProperties`, `getPropertyRooms`, `getPropertyPhotos`, `getPropertyAmenities`, `addPropertyAmenity`, `removePropertyAmenity`, `requestPropertyVerification`, `activateProperty`, `deactivateProperty`

**Rooms**: `getRooms`, `getRoom`, `createRoom`, `updateRoom`, `deleteRoom`, `getRoomPhotos`, `getRoomAmenities`, `addRoomAmenity`, `removeRoomAmenity`, `getRoomAvailability`, `updateRoomAvailability`, `searchRooms`, `bulkUpdateRoomAvailability`

**Photos**: `getPhotos`, `getPhoto`, `createPhoto`, `updatePhoto`, `deletePhoto`, `uploadPhoto`, `uploadMultiplePhotos`, `reorderPhotos`, `setPrimaryPhoto`, `getPhotosByEntity`, `bulkDeletePhotos`, `bulkUpdatePhotos`

**Amenities**: `getAmenities`, `getAmenity`, `createAmenity`, `updateAmenity`, `deleteAmenity`, `getPredefinedAmenities`, `bulkCreatePredefinedAmenities`, `getCustomAmenities`, `createCustomAmenity`, `getAmenitiesByCategory`, `getCategoriesWithCounts`, `searchAmenities`, `getAmenityUsageStats`, `getPopularAmenities`

> **Note**: All methods follow ts-rest patterns. See generated `apiClient` types for exact signatures.
```

**Reduction**: 132 lines → 25 lines (**81% reduction**)

**What's Lost**: Nothing - types are in generated code
**What's Kept**: Complete list of available methods for reference

---

#### 1.3 Component Examples Condensation (Lines 877-994, ~4KB → ~2KB)

**Current Problem**: Full component implementations with all styling

**Example of Verbosity**:
```markdown
### Button
```typescript
<Button
  className="px-4 py-2 bg-accent-primary text-text-primary rounded-md font-normal hover:bg-accent-hover transition-colors"
>
  {children}
</Button>

// Variants
<Button variant="secondary" className="bg-bg-tertiary hover:bg-hover" />
<Button variant="ghost" className="bg-transparent hover:bg-hover" />
<Button variant="danger" className="bg-semantic-error hover:bg-red-600" />
```

**Optimized Approach**:
```markdown
### Basic Components

**Button**: Variants - primary (accent-primary), secondary (bg-tertiary), ghost (transparent), danger (semantic-error). Default: 40px height, 16px padding, 8px radius, normal weight.

**Input/Textarea/Select**: bg-secondary, border-border, rounded-sm (4px), focus ring accent-primary. Height 40px (inputs), min-height 128px (textarea).

**Card**: bg-secondary, border-border, rounded-lg (12px), 24px padding, hover:border-accent-primary.

**Badge**: Inline-flex, rounded-full, text-xs, 12px padding. Variants match button.

**Modal**: Fixed overlay (black/50), centered card (max-w-lg), border-border, rounded-lg, 24px padding.

> **Note**: All components use design system tokens. Reference shadcn/ui for advanced patterns.
```

**Reduction**: 117 lines → 20 lines (**83% reduction**)

**What's Lost**: Exact className strings (agents know Tailwind)
**What's Kept**: Component inventory, variants, key dimensions

---

#### 1.4 Shared Patterns Condensation (Lines 997-1258, ~10KB → ~4KB)

**Current Problem**: Full pattern implementations with complete code

**Optimized Approach**: Keep pattern names and key features, remove boilerplate code

**Reduction**: 261 lines → 100 lines (**62% reduction**)

---

#### 1.5 Performance/Accessibility Condensation (Lines 1484-1663, ~7KB → ~3.5KB)

**Current Problem**: Standard React Query and ARIA patterns repeated

**Optimized Approach**:
```markdown
### Standard Patterns (Reference Only)

**Pagination**: useQuery with page/limit params. Standard Pagination component.

**Auth**: useAuth hook provides `user`, `isAuthenticated`, `login`, `logout`. ProtectedRoute checks role.

**Error Handling**: Toast notifications for API errors. Inline validation for forms.

**Accessibility**: All inputs have labels, ARIA required/invalid/describedby. Focus management in modals. Keyboard navigation (Tab, Enter, Escape).

> **Note**: Follow React Query docs for mutations/optimistic updates. Use standard ARIA patterns.
```

**Reduction**: 179 lines → 50 lines (**72% reduction**)

---

### Phase 2: Page Spec Condensation

#### 2.1 API Integration Section (Biggest Bloat)

**Current Problem**: Full TypeScript implementations for every API call

**Example from EditPropertyPage (Lines 276-621, ~12KB)**:
```typescript
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
    queryClient.invalidateQueries(['properties']);
    toast.success('Property updated successfully');
    navigate('/dashboard/host/properties');
  },
  onError: (error) => {
    toast.error('Failed to update property');
  }
});
```

**Optimized Approach**:
```markdown
### API Integration

**On Load**:
- `apiClient.properties.getProperty({ params: { id } })` → Load property data
- `apiClient.properties.getPropertyAmenities({ params: { id } })` → Load amenities
- `apiClient.properties.getPropertyPhotos({ params: { id } })` → Load photos
- `apiClient.amenities.getAmenities({ query: { limit: 100 } })` → Load all amenities
- `apiClient.properties.getPropertyRooms({ params: { id } })` → Get room count for button

**On Submit**:
- `apiClient.properties.updateProperty({ params: { id }, body: formData })` → Save changes
- Invalidate: `['property', id]`, `['properties']`
- Navigate to: `/dashboard/host/properties`

**Amenity Management**:
- Add: `apiClient.properties.addPropertyAmenity({ params: { id }, body: { amenityId } })`
- Remove: `apiClient.properties.removePropertyAmenity({ params: { propertyId, amenityId } })`

**Photo Management**:
- Upload: `apiClient.photos.uploadMultiplePhotos({ body: { entityType: 'property', entityId, photos } })`
- Set Primary: `apiClient.photos.setPrimaryPhoto({ params: { id: photoId } })`
- Update: `apiClient.photos.updatePhoto({ params: { id }, body: { altText, caption } })`
- Delete: `apiClient.photos.deletePhoto({ params: { id: photoId } })`
- Reorder: `apiClient.photos.reorderPhotos({ body: { entityType, entityId, photoOrders } })`

**Status Actions**:
- Activate: `apiClient.properties.activateProperty({ params: { id } })`
- Deactivate: `apiClient.properties.deactivateProperty({ params: { id } })`
- Request Verification: `apiClient.properties.requestPropertyVerification({ params: { id } })`
- Delete: `apiClient.properties.deleteProperty({ params: { id } })` → Navigate to list page
```

**Reduction**: 346 lines → 40 lines (**88% reduction**)

**What's Lost**: Boilerplate React Query code (agents know how to write it)
**What's Kept**: Which methods to call, what data to pass, navigation logic

---

#### 2.2 States Section Condensation

**Current Problem**: Exhaustive documentation of every state

**Example from EditPropertyPage (Lines 622-709, ~3KB)**:
```markdown
### Loading State
- Display skeleton loaders for form fields
- Skeleton cards for each form section (6 sections total)
- Each skeleton shows:
  - Gray animated rectangle for heading
  - Gray animated rectangles for input fields (varying widths)
- Photo section shows 6 skeleton photo cards in grid
- "Loading property details..." text below header (text-text-secondary)

### Success State (Default)
- All form fields populated with current property data
...
```

**Optimized Approach**:
```markdown
### States

**Loading**: Skeleton loaders for all form sections. Message: "Loading property details..."

**Success**: Form populated with property data. Amenities shown as pills. Photos in grid.

**Saving**: "Save Changes" → "Saving..." with spinner. Form disabled, opacity-50 overlay.

**Errors**:
- Load failure: Red banner, "Unable to load property details", Retry/Go Back buttons
- Validation: Red borders on invalid fields, inline error messages (see validation rules)
- Save failure: Red banner, "Failed to update property"
- Photo upload failure: Red banner above grid, show failed filenames

**Confirmations**:
- Delete property: Modal with warning about X rooms being deleted
- Delete photo: Simple confirmation modal

**Edge Cases**:
- Max photos (20): Upload disabled, message about deleting first
- No amenities available: Message with admin contact link
- Large file (>5MB): Skip with error message
- Form dirty state: Unsaved changes confirmation on navigate away
```

**Reduction**: 88 lines → 25 lines (**72% reduction**)

**What's Lost**: Repetitive state descriptions
**What's Kept**: All unique states and edge cases

---

#### 2.3 Visual Specifications Condensation

**Current Problem**: Repeats design system from master spec

**Example from EditPropertyPage (Lines 710-758, ~1.5KB)**:
```markdown
### Form Layout
- Max width: 800px
- Centered in main content area
...

### Input Styling
- Height: 40px (inputs), min-height 128px (textareas)
- Background: bg-bg-secondary
- Border: 1px solid border (slate-700)
...

### Button Styling
- Primary (Save): bg-accent-primary, text-text-primary, hover:bg-accent-hover
...
```

**Optimized Approach**:
```markdown
### Visual Specifications

**Form**: Max-width 800px, centered. Sections in separate cards (24px padding, 16px gap).

**Page-Specific**:
- Photo cards: 4:3 aspect ratio, rounded-lg, drag handles for reordering
- Amenity grid: 2 columns desktop, 1 mobile, grouped by category
- Quick actions bar: Two buttons side-by-side, secondary styling

> **Note**: Standard input/button styling per master spec design foundation.
```

**Reduction**: 49 lines → 12 lines (**76% reduction**)

**What's Lost**: Design system repetition
**What's Kept**: Page-specific visual requirements

---

#### 2.4 Accessibility Section Condensation

**Current Problem**: Standard ARIA patterns repeated on every page

**Example from LoginPage (Lines 217-262, ~1KB)**:
```markdown
### ARIA Labels
```typescript
<form aria-label="Login form" onSubmit={handleSubmit}>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" role="alert">{errors.email}</span>
  )}
...
```

**Optimized Approach**:
```markdown
### Accessibility

**Focus**: Email input auto-focused on load. Tab order: Email → Password → Links → Button.

**Special Requirements**:
- Form has aria-label="Login form"
- Error messages use role="alert" for screen reader announcement
- Submit button shows aria-busy during loading

> **Note**: Standard patterns apply (labels for inputs, required/invalid/describedby attributes).
```

**Reduction**: 46 lines → 10 lines (**78% reduction**)

**What's Lost**: Boilerplate ARIA code examples
**What's Kept**: Page-specific focus behavior, non-standard requirements

---

## Implementation Plan

### Step 1: Create Template Files

**File**: `.docs/spec-templates/master-spec-template.md`
- Condensed master spec structure
- References to external resources (shadcn docs, React Query docs)

**File**: `.docs/spec-templates/page-spec-template.md`
- Minimal page spec structure
- Standard sections with guidance on what to include

---

### Step 2: Update Generator System Prompts

**File**: `agents/frontend_interaction_spec_master/system_prompt.py`

Add condensation guidelines:
```python
## Master Spec Condensation Rules

1. **Navigation Map**: Only key user workflows (not exhaustive navigation)
2. **API Methods**: Method names only (types in generated code)
3. **Components**: Variants and dimensions (not full implementations)
4. **Patterns**: Pattern names and features (not boilerplate code)
5. **Performance/A11y**: Reference standard practices (not examples)

**Target Size**: 18KB (~650 lines)
```

**File**: `agents/frontend_interaction_spec_page/system_prompt.py`

Add condensation guidelines:
```python
## Page Spec Condensation Rules

1. **API Integration**: Method calls only (not full React Query code)
   - Format: `apiClient.entity.method({ params/query/body })` → Action/Navigation
   - Include: Which methods, what data, invalidation, navigation

2. **States**: Summary format (not exhaustive descriptions)
   - Standard states: One-liner reference to master patterns
   - Unique states: Brief description with key elements

3. **Visual Specs**: Page-specific only (not design system)
   - Reference master spec for standard styling
   - Include only unique dimensions, layouts, arrangements

4. **Accessibility**: Non-standard requirements only
   - Reference master spec for ARIA patterns
   - Include only custom focus behavior, unique interactions

5. **User Interactions**: Simplified table
   - Format: Element | Action | API Call/Navigation
   - Remove redundant "Update formData" entries

**Target Size**: 5-8KB depending on complexity
```

---

### Step 3: Regeneration Strategy

#### Option A: Incremental Update (Recommended)
1. Create condensed master spec manually (1 hour)
2. Update system prompts (1 hour)
3. Regenerate 2-3 sample pages (1 hour)
4. Validate with page generator agent (30 min)
5. If successful, regenerate remaining pages (automated)

#### Option B: Keep Current Specs
- Current specs work, just bloated
- Use condensed approach for new projects
- No immediate action required

---

### Step 4: Validation

**Test Page Generation**:
1. Select 3 pages (simple, medium, complex):
   - Simple: LoginPage (~10KB) → Target 4KB
   - Medium: SearchPage (~18KB) → Target 7KB
   - Complex: EditPropertyPage (~27KB) → Target 8KB

2. Generate pages with condensed specs
3. Compare output quality to pages from verbose specs
4. Verify no functionality lost

**Success Criteria**:
- Generated code quality unchanged
- Token usage reduced ~60%
- Agent generation speed increased ~40%
- No missing functionality

---

## Expected Results

### Token Savings

**Per Complex Page (EditPropertyPage example)**:
- Current: 27KB spec ≈ 6,750 tokens
- Optimized: 8KB spec ≈ 2,000 tokens
- **Savings**: 4,750 tokens (70% reduction)

**Full App Generation (34 pages)**:
- Current: ~658KB ≈ 164,500 tokens
- Optimized: ~256KB ≈ 64,000 tokens
- **Total Savings**: 100,500 tokens per full regeneration

**Cost Impact** (Claude Sonnet 3.5 pricing):
- Input tokens: $3/million
- 100,500 tokens saved = **$0.30 per full app regeneration**
- With 10 iterations during development: **$3.00 saved**
- Across 100 projects: **$300 saved**

### Speed Improvements

**Generation Time**:
- Current: ~10-15 sec per page (with 27KB spec loading)
- Optimized: ~4-6 sec per page (with 8KB spec loading)
- **Improvement**: ~60% faster page generation

**Iteration Speed**:
- Less context to parse = faster agent responses
- More pages fit in agent working memory
- Fewer token limit errors

---

## Risks and Mitigations

### Risk 1: Information Loss
**Mitigation**:
- Validate with test pages before full adoption
- Keep verbose specs as reference
- Add back details if agents struggle

### Risk 2: Agent Confusion
**Mitigation**:
- Update system prompts with clear guidelines
- Add examples of condensed format
- Test with multiple page types

### Risk 3: Inconsistent Quality
**Mitigation**:
- Run quality comparison tests
- Use Critic agent to validate output
- Iterate on condensation rules

### Risk 4: Regeneration Effort
**Mitigation**:
- Start with new projects (Option B)
- Or regenerate incrementally (Option A)
- Prioritize pages that change frequently

---

## Recommendations

### Immediate Actions (High Priority)
1. ✅ Create this optimization plan (DONE)
2. ⏭️ Update FIS Master generator system prompt with condensation rules
3. ⏭️ Update FIS Page generator system prompt with condensation rules
4. ⏭️ Create master spec template with condensed format

### Short-Term (Next Sprint)
1. Test with 3 sample pages (simple/medium/complex)
2. Validate quality with page generator agent
3. Measure token savings and speed improvements
4. Document learnings and adjust rules

### Long-Term (Future Projects)
1. Use condensed format for all new projects
2. Consider regenerating high-churn pages in existing projects
3. Monitor agent performance with condensed specs
4. Refine condensation rules based on experience

---

## Conclusion

This optimization achieves **~60% size reduction** while preserving all essential information. The key insight is that AI agents don't need boilerplate code examples - they need to know:

1. **What to build** (UI structure, features, workflows)
2. **Which APIs to call** (method names, not implementations)
3. **What makes this page unique** (not standard patterns)
4. **Business logic and edge cases** (not framework boilerplate)

By removing redundancy and focusing on unique requirements, we make specs more maintainable, faster to process, and clearer for both AI agents and human reviewers.

**Next Step**: Update generator system prompts and test with sample pages.
