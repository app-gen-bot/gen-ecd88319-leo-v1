# Frontend Interaction Specification - My Chapels Page

**Route**: `/dashboard/owner/chapels`
**Layout**: Dashboard Layout (Template 2)
**Role**: Chapel Owner (Protected)
**Purpose**: Display all chapels owned by the authenticated chapel owner with quick access to management actions

---

## 1. Page Setup

**Layout**: Dashboard Layout from master spec
- Fixed header with logo, "Dashboard" link, and profile menu
- Fixed sidebar (240px) with navigation links
- Main content area with 32px padding
- No footer

**Authentication**:
- Must be logged in with `chapel_owner` role
- Redirect to `/login?redirect=/dashboard/owner/chapels` if not authenticated
- Redirect to `/dashboard/couple` if user has `couple` role

---

## 2. Content Structure

### Header Section
- Page title: "My Chapels" (48px, color #FAFAFA, weight 700)
- Subtitle: "Manage your chapel listings" (16px, color #94A3B8)
- Primary CTA button: "+ Add New Chapel" (purple background #8B5CF6, white text, positioned top-right)

### Main Content Area

**When chapels exist**:
- Grid layout: 3 columns on desktop (gap 24px), 2 columns on tablet, 1 column on mobile
- Each chapel displayed as a card with:
  - Primary image (300px height, 100% width, border-radius 12px top, object-fit cover)
  - Chapel name (24px, color #FAFAFA, weight 700)
  - Location text: "{city}, {state}" (14px, color #94A3B8)
  - Capacity: "Capacity: {capacity} guests" (14px, color #94A3B8)
  - Price: "${basePrice}/event" (20px, color #8B5CF6, weight 700)
  - Status badge: "Active" (green) or "Inactive" (gray) - top-right corner overlay on image
  - Action buttons row:
    - "Edit" button (secondary style)
    - "Photos" button (secondary style)
    - "Availability" button (secondary style)
    - "Bookings" button (secondary style)
  - Status toggle switch at bottom: "Active/Inactive" toggle

**When no chapels exist** (Empty State):
- Centered content (max-width 480px)
- Icon: Large chapel/building icon (64px, color #8B5CF6)
- Heading: "No Chapels Yet" (36px, color #FAFAFA, weight 700)
- Message: "Get started by creating your first chapel listing. Share your beautiful venue with couples looking for their perfect wedding location." (16px, color #94A3B8, line-height 1.5)
- CTA button: "Create Your First Chapel" (purple background, white text, 16px)

---

## 3. User Interactions

### Header Actions

| Element | Label | Type | Position | Trigger | Action |
|---------|-------|------|----------|---------|--------|
| Add Chapel Button | "+ Add New Chapel" | Button (Primary) | Top-right of header | Click | Navigate to `/dashboard/owner/chapels/new` |

### Chapel Card Actions

| Element | Label | Type | Position | Trigger | Action |
|---------|-------|------|----------|---------|--------|
| Chapel Card Container | N/A | Card | Grid item | Click (on image/name area) | Navigate to `/dashboard/owner/chapels/:id` |
| Chapel Image | Photo | Image | Top of card | Click | Navigate to `/dashboard/owner/chapels/:id` |
| Chapel Name Link | Chapel name | Link | Below image | Click | Navigate to `/dashboard/owner/chapels/:id` |
| Edit Button | "Edit" | Button (Secondary) | Action row, position 1 | Click | Navigate to `/dashboard/owner/chapels/:id` |
| Photos Button | "Photos" | Button (Secondary) | Action row, position 2 | Click | Navigate to `/dashboard/owner/chapels/:id/images` |
| Availability Button | "Availability" | Button (Secondary) | Action row, position 3 | Click | Navigate to `/dashboard/owner/chapels/:id/availability` |
| Bookings Button | "Bookings" | Button (Secondary) | Action row, position 4 | Click | Navigate to `/dashboard/owner/chapels/:id/bookings` |
| Status Toggle | Toggle switch | Toggle | Bottom of card | Click | Call `apiClient.chapels.updateChapel()` with `isActive` toggle, update UI optimistically |

### Empty State Actions

| Element | Label | Type | Position | Trigger | Action |
|---------|-------|------|----------|---------|--------|
| Create First Chapel Button | "Create Your First Chapel" | Button (Primary) | Center of empty state | Click | Navigate to `/dashboard/owner/chapels/new` |

### Sidebar Navigation (from Dashboard Layout)

| Element | Label | Type | Position | Trigger | Action |
|---------|-------|------|----------|---------|--------|
| Overview Link | "Overview" | Link | Sidebar position 1 | Click | Navigate to `/dashboard/owner` |
| My Chapels Link | "My Chapels" | Link (Active) | Sidebar position 2 | Click | Stay on `/dashboard/owner/chapels` |
| All Bookings Link | "All Bookings" | Link | Sidebar position 3 | Click | Navigate to `/dashboard/owner/bookings` |
| Profile Link | "Profile" | Link | Sidebar position 4 | Click | Navigate to `/dashboard/owner/profile` |

---

## 4. API Integration

### On Page Load

```typescript
// Fetch all chapels owned by current user
const { data, isLoading, error } = useQuery({
  queryKey: ['myChapels'],
  queryFn: async () => {
    const response = await apiClient.chapels.getMyChapels({
      query: {
        page: 1,
        limit: 50  // Load all chapels at once (no pagination for now)
      }
    });
    return response.body;
  }
});

// data structure: { chapels: Chapel[], total: number, page: number, limit: number }
```

### On Status Toggle Click

```typescript
const toggleStatus = async (chapelId: string, currentStatus: boolean) => {
  try {
    // Optimistic update
    setChapels(prevChapels =>
      prevChapels.map(chapel =>
        chapel.id === chapelId
          ? { ...chapel, isActive: !currentStatus }
          : chapel
      )
    );

    // API call
    const response = await apiClient.chapels.updateChapel({
      params: { id: chapelId },
      body: { isActive: !currentStatus }
    });

    // Show success toast
    toast.success(`Chapel ${response.body.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    // Revert optimistic update
    setChapels(prevChapels =>
      prevChapels.map(chapel =>
        chapel.id === chapelId
          ? { ...chapel, isActive: currentStatus }
          : chapel
      )
    );

    // Show error toast
    toast.error('Failed to update chapel status');
  }
};
```

---

## 5. States

### Loading State
- Show skeleton cards in grid layout (3 skeletons on desktop)
- Each skeleton card structure:
  - Rectangle placeholder for image (300px height, gray shimmer animation)
  - Two lines for title and location (shimmer animation)
  - Line for capacity and price
  - Four button placeholders in row
  - Toggle placeholder at bottom

### Empty State
- Centered content with chapel icon, message, and CTA button
- Only shown when `data.total === 0` and `!isLoading`
- Icon color: #8B5CF6
- Message: "Get started by creating your first chapel listing. Share your beautiful venue with couples looking for their perfect wedding location."
- Button: "Create Your First Chapel" → navigates to `/dashboard/owner/chapels/new`

### Error State
- Shown when API call fails
- Display error card in center:
  - Red error icon (32px)
  - Heading: "Unable to Load Chapels" (24px, #EF4444)
  - Message: "We couldn't load your chapel listings. Please try again." (16px, #94A3B8)
  - Retry button: "Try Again" (secondary style) → refetch query
  - Home button: "Go to Dashboard" (secondary style) → navigate to `/dashboard/owner`

### Success State (Default)
- Grid of chapel cards with all information displayed
- Each card shows:
  - Primary image or placeholder if no image
  - Status badge overlay ("Active" green or "Inactive" gray)
  - Chapel details (name, location, capacity, price)
  - Four action buttons
  - Active/Inactive toggle switch

### No Primary Image Handling
- If chapel has no primary image, show placeholder:
  - Gray background (#334155)
  - Chapel icon in center (64px, #64748B)
  - Same dimensions as regular image (300px height)

---

## 6. Visual Specifications

### Chapel Card Styling

```css
.chapel-card {
  background: #1E293B;
  border: 1px solid #334155;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 200ms;
}

.chapel-card:hover {
  border-color: #8B5CF6;
}

.chapel-image-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.chapel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 400;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-badge.inactive {
  background: rgba(100, 116, 139, 0.1);
  color: #64748B;
}

.chapel-card-content {
  padding: 24px;
}

.chapel-name {
  font-size: 24px;
  color: #FAFAFA;
  font-weight: 700;
  margin-bottom: 8px;
  cursor: pointer;
}

.chapel-name:hover {
  color: #8B5CF6;
}

.chapel-location {
  font-size: 14px;
  color: #94A3B8;
  margin-bottom: 12px;
}

.chapel-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chapel-capacity {
  font-size: 14px;
  color: #94A3B8;
}

.chapel-price {
  font-size: 20px;
  color: #8B5CF6;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-button {
  flex: 1;
  min-width: 80px;
  background: transparent;
  color: #8B5CF6;
  border: 1px solid #8B5CF6;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 200ms;
}

.action-button:hover {
  background: rgba(139, 92, 246, 0.1);
}

.status-toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #334155;
}

.status-toggle-label {
  font-size: 14px;
  color: #94A3B8;
}
```

### Grid Layout

```css
.chapels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .chapels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .chapels-grid {
    grid-template-columns: 1fr;
  }
}
```

### Empty State Styling

```css
.empty-state {
  max-width: 480px;
  margin: 80px auto;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: #8B5CF6;
  margin: 0 auto 24px;
}

.empty-state-heading {
  font-size: 36px;
  color: #FAFAFA;
  font-weight: 700;
  margin-bottom: 16px;
}

.empty-state-message {
  font-size: 16px;
  color: #94A3B8;
  line-height: 1.5;
  margin-bottom: 32px;
}
```

---

## 7. Responsive Behavior

### Desktop (1024px+)
- 3-column grid
- All action buttons visible in single row
- Sidebar visible and fixed

### Tablet (768px - 1024px)
- 2-column grid
- Action buttons may wrap to 2 rows (2+2)
- Sidebar compressed or becomes hamburger menu

### Mobile (0 - 768px)
- Single column grid
- Action buttons stack 2x2 or 4x1
- Sidebar becomes hamburger menu or bottom navigation
- Header button text changes to "+" icon only

---

## 8. Accessibility

- All interactive elements have proper ARIA labels
- Status toggle has `aria-label`: "Toggle active status for {chapel name}"
- Action buttons have clear labels
- Card images have alt text: "{chapel name} primary image"
- Keyboard navigation: Tab through cards and buttons, Enter to activate
- Focus indicators visible on all interactive elements (purple border #8B5CF6)

---

## 9. Edge Cases

1. **No primary image**: Show gray placeholder with chapel icon
2. **Long chapel names**: Truncate with ellipsis after 2 lines
3. **Very high/low prices**: Format with commas (e.g., "$1,500" or "$50")
4. **Toggle status during request**: Disable toggle and show loading spinner
5. **Network failure on toggle**: Revert optimistic update, show error toast
6. **No location data**: Display "Location not set" in gray
7. **Capacity 0 or null**: Display "Capacity not set" in gray

---

**End of MyChapels Page Specification**
