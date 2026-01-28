# Frontend Interaction Specification - Edit Chapel Page

**Route**: `/dashboard/owner/chapels/:id`
**Layout**: Dashboard Layout (Template 2)
**Role**: Chapel Owner Only
**Purpose**: Edit chapel details, manage photos, availability, and view bookings

---

## 1. Page Setup

**Route**: `/dashboard/owner/chapels/:id`
**Layout**: Dashboard Layout (Sidebar + Main Content)
**Authentication**: Required (chapel_owner role only)
**Parent Route**: `/dashboard/owner/chapels`

---

## 2. Content Structure

### Header Section
- Back button: "← Back to My Chapels" (purple text, 16px)
- Page title: Chapel name (48px, white text, bold)
- Status badge: "Active" (green) or "Inactive" (gray)

### Tab Navigation
Horizontal tab bar with 4 tabs:
- **Details** (active state: purple underline, white text)
- **Photos** (gray text, hover: purple)
- **Availability** (gray text, hover: purple)
- **Bookings** (gray text, hover: purple)

### Details Tab Content (Default View)

**Form Container** (card with #1E293B background, 12px border radius, 24px padding):

**Basic Information Section**:
- Label: "Basic Information" (20px, white, bold, margin-bottom: 24px)
- Chapel Name Input (full width)
- Description Textarea (full width, min-height: 150px, 5 rows)

**Location Section**:
- Label: "Location" (20px, white, bold, margin-top: 32px, margin-bottom: 24px)
- Address Input (full width)
- City Input (50% width, inline with State)
- State Input (25% width)
- ZIP Code Input (25% width)

**Capacity & Pricing Section**:
- Label: "Capacity & Pricing" (20px, white, bold, margin-top: 32px, margin-bottom: 24px)
- Guest Capacity Input (50% width, number input)
- Base Price Input (50% width, number input with "$" prefix)

**Contact Information Section**:
- Label: "Contact Information" (20px, white, bold, margin-top: 32px, margin-bottom: 24px)
- Contact Email Input (50% width)
- Contact Phone Input (50% width)

**Status Section**:
- Label: "Chapel Status" (20px, white, bold, margin-top: 32px, margin-bottom: 16px)
- Toggle Switch: "Active" / "Inactive" (purple when active)
- Helper text: "Inactive chapels won't appear in search results" (14px, #94A3B8)

**Action Buttons** (margin-top: 48px, right-aligned):
- Cancel Button (secondary button, margin-right: 16px)
- Save Changes Button (primary purple button)

**Danger Zone** (margin-top: 64px, border-top: 1px solid #334155, padding-top: 32px):
- Label: "Danger Zone" (20px, #EF4444, bold, margin-bottom: 16px)
- Delete Chapel Button (red button)
- Helper text: "This action cannot be undone" (14px, #94A3B8)

---

## 3. User Interactions

### Navigation Interactions

| Element | Label | Type | Trigger | Destination/Action |
|---------|-------|------|---------|-------------------|
| Back Button | "← Back to My Chapels" | Link | Click | Navigate to `/dashboard/owner/chapels` |
| Details Tab | "Details" | Button | Click | Show details form (current page) |
| Photos Tab | "Photos" | Button | Click | Navigate to `/dashboard/owner/chapels/:id/images` |
| Availability Tab | "Availability" | Button | Click | Navigate to `/dashboard/owner/chapels/:id/availability` |
| Bookings Tab | "Bookings" | Button | Click | Navigate to `/dashboard/owner/chapels/:id/bookings` |

### Form Interactions

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Chapel Name Input | "Chapel Name" | Text Input | Type | Update form state |
| Description Textarea | "Description" | Textarea | Type | Update form state, show character count |
| Address Input | "Street Address" | Text Input | Type | Update form state |
| City Input | "City" | Text Input | Type | Update form state |
| State Input | "State" | Text Input | Type | Update form state |
| ZIP Code Input | "ZIP Code" | Text Input | Type | Update form state |
| Capacity Input | "Guest Capacity" | Number Input | Type | Update form state, validate min: 1 |
| Base Price Input | "Base Price" | Number Input | Type | Update form state, validate min: 0, format as currency |
| Contact Email Input | "Contact Email" | Email Input | Type | Update form state, validate email format |
| Contact Phone Input | "Contact Phone" | Tel Input | Type | Update form state |
| Status Toggle | Toggle Switch | Toggle | Click | Update form state (isActive boolean) |

### Action Buttons

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Cancel Button | "Cancel" | Button (Secondary) | Click | Reset form to original values from API, discard changes |
| Save Changes Button | "Save Changes" | Button (Primary) | Click | Call `apiClient.chapels.updateChapel()`, show success message, reload page |
| Delete Chapel Button | "Delete Chapel" | Button (Danger) | Click | Open delete confirmation modal |

### Modal Interactions

**Delete Confirmation Modal**:

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Modal Overlay | N/A | Overlay | Click outside | Close modal |
| Modal Close Button | "×" | Button | Click | Close modal |
| Modal Title | "Delete Chapel?" | Heading | N/A | Display warning |
| Warning Text | "This will permanently delete..." | Text | N/A | Display consequences |
| Cancel Button | "Cancel" | Button (Secondary) | Click | Close modal |
| Confirm Delete Button | "Yes, Delete Chapel" | Button (Danger) | Click | Call `apiClient.chapels.deleteChapel()`, navigate to `/dashboard/owner/chapels` |

---

## 4. API Integration

### On Page Load

```typescript
// Fetch chapel details
const { data: chapel } = await apiClient.chapels.getChapel({
  params: { id: chapelId }
});

// Populate form with chapel data
// Check if current user owns this chapel (ownerId matches current user)
// If not owner, show 403 error or redirect to owner dashboard
```

### On Save Changes

```typescript
const handleSaveChanges = async () => {
  try {
    const { data: updatedChapel } = await apiClient.chapels.updateChapel({
      params: { id: chapelId },
      body: {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        capacity: formData.capacity,
        basePrice: formData.basePrice,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        isActive: formData.isActive
      }
    });

    // Show success toast: "Chapel updated successfully"
    // Refresh page data
  } catch (error) {
    // Show error toast: "Failed to update chapel"
  }
};
```

### On Delete Chapel

```typescript
const handleDeleteChapel = async () => {
  try {
    await apiClient.chapels.deleteChapel({
      params: { id: chapelId }
    });

    // Show success toast: "Chapel deleted successfully"
    // Navigate to /dashboard/owner/chapels
  } catch (error) {
    // Show error toast: "Failed to delete chapel"
    // Close modal
  }
};
```

---

## 5. States

### Loading State

**On Initial Load**:
- Show skeleton loaders for form fields
- Disable all input fields and buttons
- Display loading spinner in center of main content area

**Skeleton Structure**:
- Gray animated rectangles for each input field
- Larger rectangle for textarea
- Button-sized rectangles for action buttons

### Success State (Normal Display)

**Form Populated**:
- All fields filled with chapel data from API
- Inputs enabled and editable
- Save button enabled
- Status badge shows correct state (Active/Inactive)

### Empty State

**N/A** - Edit page always has data (loaded from API)

### Error States

**Failed to Load Chapel** (404 or network error):
- Show error card in center of page
- Message: "Unable to load chapel details"
- Subtitle: "This chapel may not exist or you don't have permission to edit it"
- Action button: "Back to My Chapels" (navigates to `/dashboard/owner/chapels`)

**Permission Denied** (403 - user doesn't own chapel):
- Show error card
- Message: "Access Denied"
- Subtitle: "You don't have permission to edit this chapel"
- Action button: "Back to Dashboard" (navigates to `/dashboard/owner`)

**Validation Errors**:
- Show inline error messages below each invalid field
- Border color changes to #EF4444 (red)
- Error text: 14px, #EF4444, margin-top: 4px

**Common Validation Rules**:
- Chapel Name: Required, min 3 characters, max 100 characters
- Description: Required, min 10 characters, max 1000 characters
- Address: Required
- City: Required
- State: Required
- ZIP Code: Required, valid ZIP format
- Capacity: Required, minimum 1, must be integer
- Base Price: Required, minimum 0
- Contact Email: Required, valid email format
- Contact Phone: Required, valid phone format

**Save Failed**:
- Show error toast notification at top-right
- Message: "Failed to save changes. Please try again."
- Toast auto-dismisses after 5 seconds
- Red background (#EF4444), white text

**Delete Failed**:
- Show error toast notification
- Message: "Failed to delete chapel. Please try again."
- Close confirmation modal
- Toast auto-dismisses after 5 seconds

### Submitting State

**When Saving**:
- Disable all form inputs
- Save button shows loading spinner
- Button text: "Saving..." (gray text)
- Prevent form submission during save

**When Deleting**:
- Disable all modal buttons
- Confirm button shows loading spinner
- Button text: "Deleting..." (gray text)
- Prevent modal close during delete

---

## 6. Visual Specifications

### Form Layout

**Grid Structure**:
- Single column on mobile (< 768px)
- Two columns for paired inputs on desktop (≥ 768px)
- Full width for name, description, address
- 50/50 split for city/state, capacity/price, email/phone

**Spacing**:
- Section margin-bottom: 32px
- Input margin-bottom: 24px
- Label margin-bottom: 8px
- Helper text margin-top: 4px

### Input Fields

**Default State**:
- Background: #1E293B
- Border: 1px solid #334155
- Text: #FAFAFA, 16px
- Padding: 12px 16px
- Border radius: 8px
- Placeholder: #64748B

**Focus State**:
- Border: 2px solid #8B5CF6
- Outline: none

**Error State**:
- Border: 2px solid #EF4444
- Error text below input: #EF4444, 14px

### Toggle Switch

**Inactive State**:
- Track: #334155
- Thumb: #FAFAFA
- Width: 48px, Height: 24px

**Active State**:
- Track: #8B5CF6
- Thumb: #FAFAFA (slides right)

### Delete Confirmation Modal

**Modal Dimensions**:
- Max-width: 480px
- Padding: 32px
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 16px

**Modal Content**:
- Title: 24px, white, bold
- Warning icon: Red circle with exclamation (margin-bottom: 16px)
- Body text: 16px, #94A3B8, line-height: 1.5
- Consequence list: Bullet points, #94A3B8

**Modal Buttons**:
- Aligned right, margin-top: 32px
- Cancel: Secondary button, margin-right: 16px
- Delete: Danger button (#EF4444 background)

---

## 7. Accessibility

**Keyboard Navigation**:
- Tab through all form fields in logical order
- Enter key submits form (triggers Save)
- Escape key closes modal
- Focus visible indicators on all interactive elements

**Screen Reader Labels**:
- All inputs have associated labels
- Status toggle has aria-label: "Toggle chapel active status"
- Delete button has aria-label: "Delete chapel permanently"

**Error Announcements**:
- Validation errors announced via aria-live regions
- Success/error toasts announced to screen readers

---

## 8. Responsive Behavior

**Desktop (≥ 1024px)**:
- Full dashboard layout with sidebar
- Two-column form layout
- Modal centered with overlay

**Tablet (768px - 1023px)**:
- Compressed sidebar or collapsed
- Two-column form layout maintained
- Reduced padding (24px → 16px)

**Mobile (< 768px)**:
- Bottom navigation replaces sidebar
- Single-column form layout
- Full-width inputs
- Modal takes 90% viewport width
- Reduced padding (24px → 16px)
- Stacked action buttons (full width)

---

## 9. Reference Master Spec

**Colors**: Use master spec color system (Section 1)
**Typography**: Use master spec typography (Section 1)
**Spacing**: Use master spec spacing scale (Section 1)
**Button Styles**: Use master spec button styles (Section 5)
**Input Styles**: Use master spec input styles (Section 5)
**Modal Styles**: Use master spec modal styles (Section 5)

**Navigation Routes**: All routes verified against master spec Section 3.1
**API Methods**: All methods verified against API Registry

---

**End of Edit Chapel Page Specification**
