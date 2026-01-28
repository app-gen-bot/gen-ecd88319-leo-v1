# Frontend Interaction Specification - Couple Dashboard

**Page**: Couple Dashboard
**Route**: `/dashboard/couple`
**Layout**: Dashboard Layout (Template 2)
**Role**: Couple (Protected Route)
**Generated**: 2025-01-11

---

## 1. Page Setup

**Route**: `/dashboard/couple`
**Layout**: Dashboard Layout with fixed header, sidebar (240px), and main content area
**Purpose**: Provide couples with an overview of their bookings, quick stats, and navigation to key features.

**Authentication**:
- Requires logged-in user with role = `couple`
- Redirect to `/login?redirect=/dashboard/couple` if not authenticated
- Redirect to `/dashboard/owner` if user has `chapel_owner` role

---

## 2. Content Structure

### Header (from Dashboard Layout)
- Logo: "Chapel Bookings" (clickable)
- "Dashboard" link
- Profile avatar with dropdown menu

### Sidebar (240px, fixed, bg: #1E293B)
Navigation links (vertical):
1. **"Overview"** - Active state (purple left border, purple text)
2. "My Bookings"
3. "Browse Chapels"
4. "Profile"

### Main Content Area (full width minus sidebar, padding: 32px)

**Section 1: Page Header**
- Heading: "Welcome back, [User's First Name]!" (h1, 48px, #FAFAFA, font-weight: 700)
- Subheading: "Here's an overview of your chapel bookings" (body, 16px, #94A3B8)
- Spacing: 48px bottom margin

**Section 2: Stats Cards Grid**
- 3-column grid (gap: 24px)
- Cards: Dark slate background (#1E293B), border (#334155), radius: 12px, padding: 24px

Card 1 - Total Bookings:
- Icon: Calendar icon (purple #8B5CF6, 32px)
- Number: Large count (h2, 36px, #FAFAFA, font-weight: 700)
- Label: "Total Bookings" (small, 14px, #94A3B8)

Card 2 - Upcoming Bookings:
- Icon: Clock icon (blue #3B82F6, 32px)
- Number: Large count (h2, 36px, #FAFAFA, font-weight: 700)
- Label: "Upcoming" (small, 14px, #94A3B8)

Card 3 - Completed Bookings:
- Icon: Check circle icon (green #10B981, 32px)
- Number: Large count (h2, 36px, #FAFAFA, font-weight: 700)
- Label: "Completed" (small, 14px, #94A3B8)

**Section 3: Recent Bookings**
- Section heading: "Recent Bookings" (h2, 36px, #FAFAFA, margin-bottom: 24px)
- "View All →" link (right-aligned, purple #8B5CF6)
- List of 3 most recent booking cards (if available)
- Spacing: 48px top margin

Booking Card Structure (repeated):
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Hover: border-color changes to #8B5CF6, cursor pointer
- Margin-bottom: 16px between cards

Card Content:
- Chapel name (h3, 24px, #FAFAFA, font-weight: 700)
- Date: "[Month Day, Year]" (body, 16px, #94A3B8)
- Time slot: "Morning | Afternoon | Evening" (body, 16px, #94A3B8)
- Guest count: "[Number] guests" (small, 14px, #64748B)
- Status badge (top-right corner):
  - Pending: Orange background (#F59E0B with 0.1 opacity), orange text (#F59E0B)
  - Confirmed: Green background (#10B981 with 0.1 opacity), green text (#10B981)
  - Completed: Blue background (#3B82F6 with 0.1 opacity), blue text (#3B82F6)
  - Cancelled: Red background (#EF4444 with 0.1 opacity), red text (#EF4444)
  - Badge: padding 4px 12px, border-radius: 9999px, font-size: 14px

**Section 4: Quick Action CTA**
- Spacing: 48px top margin
- Card: Background #1E293B, border #334155, radius: 12px, padding: 32px
- Center-aligned content
- Icon: Search icon (purple #8B5CF6, 48px)
- Heading: "Find Your Perfect Chapel" (h3, 24px, #FAFAFA, font-weight: 700, margin-bottom: 12px)
- Subtext: "Browse our collection of beautiful chapels" (body, 16px, #94A3B8, margin-bottom: 24px)
- Button: "Browse Chapels" (primary purple button)

---

## 3. User Interactions

### Sidebar Navigation

| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Link 1 | "Overview" | Click | `/dashboard/couple` (current page, no navigation) |
| Link 2 | "My Bookings" | Click | Navigate to `/dashboard/couple/bookings` |
| Link 3 | "Browse Chapels" | Click | Navigate to `/chapels` |
| Link 4 | "Profile" | Click | Navigate to `/dashboard/couple/profile` |

### Header Interactions

| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| Logo | "Chapel Bookings" text/image | Click | Navigate to `/` |
| Dashboard Link | "Dashboard" | Click | Navigate to `/dashboard/couple` (refresh current) |
| Profile Avatar | User initials/image | Click | Open dropdown menu |
| Profile Menu Item 1 | "Profile Settings" | Click | Navigate to `/dashboard/couple/profile` |
| Profile Menu Item 2 | "Back to Browse" | Click | Navigate to `/chapels` |
| Profile Menu Item 3 | "Log Out" | Click | Call `apiClient.auth.logout()`, clear auth token, redirect to `/` |

### Stats Cards

| Element | Action | Destination |
|---------|--------|-------------|
| Total Bookings Card | Click | Navigate to `/dashboard/couple/bookings` |
| Upcoming Bookings Card | Click | Navigate to `/dashboard/couple/bookings?status=confirmed` |
| Completed Bookings Card | Click | Navigate to `/dashboard/couple/bookings?status=completed` |

### Recent Bookings Section

| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| "View All →" Link | "View All →" | Click | Navigate to `/dashboard/couple/bookings` |
| Booking Card | Entire card | Click | Navigate to `/dashboard/couple/bookings/:id` |
| Chapel Name | Chapel name text | Click | Navigate to `/chapels/:chapelId` |

### Quick Action CTA

| Element | Label | Action | Destination |
|---------|-------|--------|-------------|
| "Browse Chapels" Button | "Browse Chapels" | Click | Navigate to `/chapels` |

---

## 4. API Integration

### On Page Load

**Fetch Current User**:
```typescript
const { data: user } = await apiClient.auth.getCurrentUser();
// Display user's first name in page header
// Verify user.role === 'couple'
```

**Fetch User Bookings Summary**:
```typescript
const { data: bookingsData } = await apiClient.bookings.getMyBookings({
  query: {
    page: 1,
    limit: 50 // Get all bookings for stats calculation
  }
});

// Calculate stats:
// - Total bookings: bookingsData.total
// - Upcoming bookings: filter bookingsData.bookings where status === 'confirmed' or 'pending' and bookingDate >= today
// - Completed bookings: filter bookingsData.bookings where status === 'completed'
```

**Fetch Recent Bookings**:
```typescript
const { data: recentBookings } = await apiClient.bookings.getMyBookings({
  query: {
    page: 1,
    limit: 3 // Get only 3 most recent
  }
});
// Display recentBookings.bookings in "Recent Bookings" section
```

**For Each Recent Booking, Fetch Chapel Details**:
```typescript
// For each booking in recentBookings.bookings:
const { data: chapel } = await apiClient.chapels.getChapel({
  params: { id: booking.chapelId }
});
// Use chapel.name for display
```

### No User Actions with API Calls
All API calls occur on page load. User interactions navigate to other pages.

---

## 5. States

### Loading State
**When**: Initial page load while fetching data

**Display**:
- Show header and sidebar immediately (static)
- Main content area shows:
  - Page header with "Welcome back!" (without name)
  - 3 skeleton cards for stats (gray animated pulse backgrounds)
  - "Recent Bookings" heading
  - 3 skeleton booking cards (gray animated pulse backgrounds, 100px height each)
  - Skeleton quick action card

**Skeleton Card Style**:
- Background: Linear gradient animation (shimmer effect)
- Colors: #1E293B to #334155 and back
- Border-radius: 12px
- Same dimensions as real cards

### Empty State (No Bookings)
**When**: `bookingsData.total === 0`

**Display**:
- Stats cards show "0" for all counts
- Recent Bookings section shows:
  - Empty state illustration (calendar with X icon, 128px, #64748B)
  - Heading: "No bookings yet" (h3, 24px, #FAFAFA)
  - Subtext: "Start your journey by finding the perfect chapel for your special day" (body, 16px, #94A3B8)
  - Button: "Browse Chapels" (primary purple button)
  - Center-aligned in card with #1E293B background, padding: 48px

### Error State
**When**: API call fails (network error, 500 error, etc.)

**Display**:
- Toast notification (top-right corner):
  - Background: #EF4444
  - Text: "Unable to load bookings. Please try again." (white text)
  - Duration: 5 seconds
  - Close button (X icon)
- Page shows:
  - Stats cards with "—" placeholder
  - Recent Bookings section shows error message:
    - Error icon (red #EF4444, 48px)
    - Heading: "Unable to Load Bookings" (h3, 24px, #FAFAFA)
    - Subtext: "We couldn't fetch your bookings. Please check your connection and try again." (body, 16px, #94A3B8)
    - Button: "Retry" (primary purple button, onClick: reload page)
    - Center-aligned in card

### Success State (Normal)
**When**: All API calls succeed and bookings exist

**Display**:
- All sections render with real data
- Stats cards show accurate counts
- Recent bookings display with chapel names, dates, and status badges
- Smooth fade-in transition (300ms) after data loads

---

## 6. Responsive Behavior

**Desktop (1024px+)**:
- Full layout as specified
- 3-column stats grid
- Sidebar visible

**Tablet (768-1024px)**:
- Sidebar collapses to hamburger menu (top-left)
- Main content takes full width
- 3-column stats grid becomes 2-column (third card wraps)

**Mobile (0-768px)**:
- Hamburger menu for navigation
- Stats grid becomes 1-column (stacked)
- Booking cards full width
- Padding reduces to 16px

---

## 7. Design Tokens Reference

**Colors**: Use master spec color system
**Typography**: Use master spec typography (Inter font family)
**Spacing**: Use master spec spacing scale (xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px)
**Border Radius**: Use master spec radius (lg: 12px for cards)
**Buttons**: Use master spec primary button styles

---

**End of Couple Dashboard Page Specification**
