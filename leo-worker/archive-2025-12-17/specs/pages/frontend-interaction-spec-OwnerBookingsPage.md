# Frontend Interaction Specification - Owner Bookings Page

**Page Name**: OwnerBookingsPage
**Route**: `/dashboard/owner/bookings`
**Layout**: Dashboard Layout
**Role**: chapel_owner
**Purpose**: View and manage all bookings across all owned chapels

---

## 1. Page Setup

- **Route**: `/dashboard/owner/bookings`
- **Layout**: Dashboard Layout (from master spec)
- **Authentication**: Required (chapel_owner role)
- **Purpose**: Display a filterable list of all bookings across all chapels owned by the current user, with quick actions to manage booking statuses

---

## 2. Content Structure

### Header Section
- **Page Title**: "All Bookings" (48px, bold, #FAFAFA)
- **Subtitle**: "Manage bookings across all your chapels" (16px, regular, #94A3B8)

### Filter Panel (Horizontal)
Located directly below header, full-width card with #1E293B background, 24px padding, 12px border radius

**Filter Row 1 (Left to Right)**:
- **Status Filter Dropdown**
  - Label: "Status" (14px, #FAFAFA)
  - Options: "All", "Pending", "Confirmed", "Cancelled", "Completed"
  - Default: "All"
  - Width: 200px

- **Chapel Filter Dropdown**
  - Label: "Chapel" (14px, #FAFAFA)
  - Options: "All Chapels", then list of chapel names
  - Default: "All Chapels"
  - Width: 250px

**Filter Row 2 (Left to Right)**:
- **Start Date Input**
  - Label: "From Date" (14px, #FAFAFA)
  - Type: Date picker
  - Placeholder: "Select start date"
  - Width: 200px

- **End Date Input**
  - Label: "To Date" (14px, #FAFAFA)
  - Type: Date picker
  - Placeholder: "Select end date"
  - Width: 200px

- **Apply Filters Button**
  - Label: "Apply Filters"
  - Style: Primary button (#8B5CF6 background, #FAFAFA text)
  - Position: Aligned with date inputs
  - Padding: 12px 24px

- **Clear Filters Button**
  - Label: "Clear"
  - Style: Secondary button (transparent background, #8B5CF6 border and text)
  - Position: Next to Apply button
  - Padding: 12px 24px

### Bookings List Section
- **Container**: Full width, 32px margin-top from filters
- **Layout**: Vertical stack of booking cards with 16px gap between cards

### Booking Card (Repeated for each booking)
- **Container**: #1E293B background, 1px #334155 border, 12px border radius, 24px padding
- **Hover State**: Border color changes to #8B5CF6
- **Cursor**: Pointer (entire card clickable)

**Card Layout (Grid)**:

**Left Column (60% width)**:
1. **Chapel Name Link**
   - Text: Chapel name (20px, bold, #8B5CF6)
   - Style: Underline on hover
   - Top-left position

2. **Customer Name**
   - Label: "Customer:" (14px, #94A3B8)
   - Value: Customer full name (16px, #FAFAFA)
   - 8px margin-top

3. **Booking Date & Time**
   - Label: "Date:" (14px, #94A3B8)
   - Value: Formatted date + time slot (16px, #FAFAFA)
   - Format: "January 15, 2025 • Morning (9 AM - 12 PM)"
   - 8px margin-top

4. **Guest Count**
   - Label: "Guests:" (14px, #94A3B8)
   - Value: Number (16px, #FAFAFA)
   - 8px margin-top

5. **Special Requests** (if present)
   - Label: "Special Requests:" (14px, #94A3B8)
   - Value: Truncated text (16px, #FAFAFA)
   - Max 2 lines with ellipsis
   - 8px margin-top

**Right Column (40% width, aligned right)**:
1. **Status Badge** (top-right)
   - **Pending**: #F59E0B background (10% opacity), #F59E0B text, 4px 12px padding, full border radius
   - **Confirmed**: #10B981 background (10% opacity), #10B981 text
   - **Cancelled**: #EF4444 background (10% opacity), #EF4444 text
   - **Completed**: #3B82F6 background (10% opacity), #3B82F6 text
   - Font: 14px, regular

2. **Booking ID**
   - Label: "ID:" (12px, #64748B)
   - Value: Booking ID (12px, #94A3B8)
   - 16px margin-top

3. **Action Buttons Row** (bottom-right, 24px margin-top)
   - **Confirm Button** (if status is "Pending")
     - Label: "Confirm"
     - Style: #10B981 background, #FAFAFA text, 8px 16px padding, 8px border radius
     - Font: 14px

   - **View Details Button**
     - Label: "View Details"
     - Style: Primary button (#8B5CF6 background, #FAFAFA text, 8px 16px padding, 8px border radius)
     - Font: 14px
     - 8px margin-left (if Confirm button present)

### Pagination Section
- **Container**: Centered, 48px margin-top
- **Layout**: Horizontal flex row, 8px gap

**Elements**:
- **Previous Button**: "Previous" text, secondary button style, disabled if on first page
- **Page Numbers**: Individual buttons for each page (current page has #8B5CF6 background)
- **Next Button**: "Next" text, secondary button style, disabled if on last page

### Empty State
Displayed when no bookings match filters:
- **Icon**: Calendar icon (64px, #64748B)
- **Heading**: "No Bookings Found" (24px, bold, #FAFAFA)
- **Message**: "Try adjusting your filters or wait for new booking requests." (16px, #94A3B8)
- **Clear Filters Button**: "Clear Filters" (primary button)
- Centered vertically and horizontally in bookings list area

---

## 3. User Interactions

### Filter Panel Interactions

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Status Dropdown | "All" / "Pending" / etc | Select | Change | Update local filter state (no immediate API call) |
| Chapel Dropdown | "All Chapels" / chapel name | Select | Change | Update local filter state (no immediate API call) |
| Start Date Input | Date picker | Date Input | Select | Update local filter state (no immediate API call) |
| End Date Input | Date picker | Date Input | Select | Update local filter state (no immediate API call) |
| Apply Filters Button | "Apply Filters" | Button | Click | Call `apiClient.bookings.getBookings()` with current filter values |
| Clear Filters Button | "Clear" | Button | Click | Reset all filters to default, refetch bookings with no filters |

### Booking Card Interactions

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Entire Card | N/A | Card | Click | Navigate to `/dashboard/owner/bookings/:id` (booking details page) |
| Chapel Name Link | Chapel name | Link | Click | Navigate to `/dashboard/owner/chapels/:chapelId` (stop propagation to prevent card click) |
| Confirm Button | "Confirm" | Button | Click | Call `apiClient.bookings.confirmBooking({ params: { id } })`, then reload bookings list (stop propagation) |
| View Details Button | "View Details" | Button | Click | Navigate to `/dashboard/owner/bookings/:id` (stop propagation) |

### Pagination Interactions

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Previous Button | "Previous" | Button | Click | Decrement page number, call `apiClient.bookings.getBookings()` with previous page |
| Page Number Button | Page number | Button | Click | Set page to clicked number, call `apiClient.bookings.getBookings()` with that page |
| Next Button | "Next" | Button | Click | Increment page number, call `apiClient.bookings.getBookings()` with next page |

### Empty State Interactions

| Element | Label | Type | Trigger | Action |
|---------|-------|------|---------|--------|
| Clear Filters Button | "Clear Filters" | Button | Click | Reset all filters to default, refetch bookings |

---

## 4. API Integration

### On Page Load

```typescript
// 1. Fetch current user's chapels for chapel filter dropdown
const { data: chapelsData } = await apiClient.chapels.getMyChapels({
  query: {
    page: 1,
    limit: 100  // Get all chapels for dropdown
  }
});

// 2. Fetch bookings with default filters (all bookings, page 1)
const { data: bookingsData } = await apiClient.bookings.getBookings({
  query: {
    page: 1,
    limit: 10
  }
});

// bookingsData structure:
// {
//   bookings: Booking[],
//   total: number,
//   page: number,
//   limit: number
// }
```

### On Apply Filters Click

```typescript
const { data } = await apiClient.bookings.getBookings({
  query: {
    page: 1,
    limit: 10,
    status: selectedStatus !== 'All' ? selectedStatus : undefined,
    chapelId: selectedChapelId !== 'all' ? selectedChapelId : undefined,
    // Note: API doesn't support startDate/endDate on getBookings
    // We'll need to filter client-side or note as future feature
  }
});
```

**Note**: The `getBookings` method doesn't support `startDate` and `endDate` query parameters according to the API Registry. We can either:
1. Filter results client-side after fetching
2. Note this as "Future: Backend needs date range filtering on /bookings endpoint"

For now, use `getChapelBookings` approach per chapel if date filtering is critical, or filter client-side.

### On Confirm Button Click

```typescript
const { data } = await apiClient.bookings.confirmBooking({
  params: {
    id: bookingId
  }
});

// After success, refetch bookings list
await refetchBookings();
```

### On Pagination Click

```typescript
const { data } = await apiClient.bookings.getBookings({
  query: {
    page: newPageNumber,
    limit: 10,
    status: currentFilters.status,
    chapelId: currentFilters.chapelId
  }
});
```

---

## 5. States

### Loading State
**When**: Initial page load or filter application
**Display**:
- Show 5 skeleton booking cards
- Each skeleton card has:
  - Gray animated bars for chapel name (60% width)
  - Gray animated bars for customer name (40% width)
  - Gray animated bars for date/time (70% width)
  - Gray animated circle for status badge (top-right)
  - Gray animated rectangles for buttons (bottom-right)
- Background: #1E293B
- Animation: Shimmer effect from left to right

### Empty State
**When**: No bookings match current filters OR owner has no bookings at all
**Display**:
- Calendar icon (64px, #64748B) centered
- Heading: "No Bookings Found" (24px, bold, #FAFAFA)
- Message: "Try adjusting your filters or wait for new booking requests." (16px, #94A3B8, centered, 8px margin-top)
- "Clear Filters" button (primary style, 16px margin-top) if filters are active
- "Browse Chapels" button (secondary style) if no filters active → Navigate to `/dashboard/owner/chapels`

### Error State
**When**: API call fails
**Display**:
- Red error icon (48px, #EF4444) centered
- Heading: "Unable to Load Bookings" (24px, bold, #FAFAFA)
- Message: "There was an error loading your bookings. Please try again." (16px, #94A3B8, centered, 8px margin-top)
- "Retry" button (primary style, 16px margin-top) → Retry `getBookings()` call
- Error appears in place of bookings list

### Success State (After Confirm)
**When**: Booking successfully confirmed
**Display**:
- Green toast notification at top-right of screen
- Message: "Booking confirmed successfully!"
- Background: #10B981
- Text: #FAFAFA
- Auto-dismiss after 3 seconds
- Bookings list automatically refreshes to show updated status

### Filter Loading State
**When**: Filters applied and waiting for results
**Display**:
- Disable all filter inputs and buttons
- Show spinner icon in "Apply Filters" button
- Button text changes to "Applying..."
- Prevent multiple simultaneous filter requests

---

## 6. Additional Notes

### Authentication & Authorization
- Page requires authentication (redirect to `/login` if not authenticated)
- Page requires `chapel_owner` role (redirect to `/dashboard/couple` if user is couple role)
- All API calls inherit authentication token from `apiClient`

### Data Relationships
- Each booking includes `chapelId` and `userId` references
- Chapel name displayed via relationship (included in booking response)
- Customer name displayed via relationship (included in booking response)

### Filter Persistence
- Filter state stored in component state (not URL query params)
- Filters reset on page navigation away and back
- Future enhancement: Persist filters in URL query params

### Date Range Filter Limitation
- **Current**: `getBookings()` doesn't support date range filtering per API Registry
- **Workaround**: Filter results client-side after fetching, or remove date filters from UI
- **Future**: Request backend endpoint enhancement to add `startDate` and `endDate` query params to `/bookings` endpoint

### Performance Considerations
- Default page size: 10 bookings per page
- Pagination prevents loading all bookings at once
- Chapel dropdown limited to 100 chapels (reasonable for most owners)
- Consider infinite scroll for owners with 50+ bookings

### Accessibility
- All interactive elements keyboard accessible
- Focus states visible (#8B5CF6 border)
- Status badges use both color and text
- Error messages announced to screen readers

---

**End of OwnerBookingsPage Specification**
