# Frontend Interaction Specification - Owner Dashboard Page

**Page Name**: Owner Dashboard Page
**Route**: `/dashboard/owner`
**Layout**: Dashboard Layout (Template 2)
**Purpose**: Provide chapel owners with an overview of their chapels, bookings, and key metrics.

---

## 1. Page Setup

**Layout**: Dashboard Layout
- Fixed header with logo, "Dashboard" nav link, and profile menu
- Fixed left sidebar (240px width, #1E293B background)
- Main content area with full width minus sidebar, 32px padding
- No footer

**Authentication**: Required (role: `chapel_owner`)
- Redirect to `/login?redirect=/dashboard/owner` if not authenticated
- Redirect to `/dashboard/couple` if authenticated as couple role

---

## 2. Content Structure

### 2.1 Sidebar Navigation

**Background**: #1E293B
**Width**: 240px (fixed)
**Padding**: 24px vertical, 16px horizontal

**Navigation Links** (vertical stack, 8px gap):
1. "Overview" - Purple background (#8B5CF6), white text (active state)
2. "My Chapels" - Transparent background, #94A3B8 text
3. "All Bookings" - Transparent background, #94A3B8 text
4. "Profile" - Transparent background, #94A3B8 text

Each link:
- Height: 44px
- Padding: 12px 16px
- Border radius: 8px
- Font size: 16px
- Hover state: rgba(139, 92, 246, 0.1) background

---

### 2.2 Main Content Area

#### Section 1: Page Header
**Position**: Top of main content
**Margin Bottom**: 32px

- **Heading**: "Dashboard Overview"
  - Font size: 36px (h2)
  - Color: #FAFAFA
  - Font weight: 700
  - Line height: 1.2

- **Subtitle**: "Welcome back! Here's what's happening with your chapels."
  - Font size: 16px
  - Color: #94A3B8
  - Margin top: 8px

---

#### Section 2: Statistics Cards Grid
**Display**: Grid
**Columns**: 4 equal columns
**Gap**: 24px
**Margin Bottom**: 48px

**Card 1: Total Chapels**
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Icon: Building icon (purple #8B5CF6, 32px)
- Label: "Total Chapels" (#94A3B8, 14px)
- Value: Dynamic number (#FAFAFA, 36px, bold)

**Card 2: Pending Bookings**
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Icon: Clock icon (warning yellow #F59E0B, 32px)
- Label: "Pending Bookings" (#94A3B8, 14px)
- Value: Dynamic number (#FAFAFA, 36px, bold)
- Badge: If count > 0, show "Needs Attention" badge (warning yellow)

**Card 3: Total Revenue**
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Icon: Dollar sign icon (success green #10B981, 32px)
- Label: "Total Revenue" (#94A3B8, 14px)
- Value: Dynamic currency (#FAFAFA, 36px, bold) formatted as "$X,XXX"

**Card 4: This Month's Bookings**
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Icon: Calendar icon (info blue #3B82F6, 32px)
- Label: "This Month's Bookings" (#94A3B8, 14px)
- Value: Dynamic number (#FAFAFA, 36px, bold)

---

#### Section 3: My Chapels Preview
**Margin Bottom**: 48px

**Section Header**:
- Display: Flex, space-between alignment
- Heading: "My Chapels" (24px, #FAFAFA, bold)
- "Add New Chapel" button (primary purple button)
  - Label: "+ Add New Chapel"
  - Background: #8B5CF6
  - Padding: 12px 24px
  - Border radius: 8px
  - White text

**Chapel Cards Grid**:
- Display: Grid
- Columns: 3 equal columns
- Gap: 24px
- Margin top: 24px
- Show maximum 3 most recently updated chapels

**Individual Chapel Card**:
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Overflow: hidden
- Cursor: pointer
- Hover: Border color changes to #8B5CF6
- Transition: border-color 200ms

**Card Structure**:
1. **Image Area** (top):
   - Height: 200px
   - Background: #334155 (placeholder if no image)
   - Object-fit: cover
   - Display primary chapel image

2. **Content Area** (padding: 24px):
   - **Chapel Name**: 20px, #FAFAFA, bold, margin bottom 8px
   - **Location**: 14px, #94A3B8, margin bottom 16px
     - Format: "City, State"
   - **Stats Row** (flex, space-between):
     - **Capacity**: "Capacity: X guests" (14px, #94A3B8)
     - **Price**: "$XXX" (16px, #FAFAFA, bold)
   - **Status Badge** (margin top: 16px):
     - If active: Green badge "Active" (#10B981 bg with opacity 0.1, #10B981 text)
     - If inactive: Red badge "Inactive" (#EF4444 bg with opacity 0.1, #EF4444 text)

3. **Action Buttons Row** (margin top: 16px, gap: 8px):
   - Display: Flex, gap 8px
   - **Edit Button**: Secondary button "Edit" (small, 10px 16px padding)
   - **Manage Button**: Secondary button "Manage" (small, 10px 16px padding)

**View All Link**:
- Position: Below grid
- Margin top: 16px
- Text: "View All Chapels →"
- Color: #8B5CF6
- Font size: 16px
- Hover: Underline

---

#### Section 4: Recent Bookings Preview
**Margin Bottom**: 48px

**Section Header**:
- Display: Flex, space-between alignment
- Heading: "Recent Bookings" (24px, #FAFAFA, bold)
- "View All" link (#8B5CF6, 16px, hover underline)

**Bookings List**:
- Display: Vertical stack
- Gap: 16px
- Margin top: 24px
- Show maximum 5 most recent bookings

**Individual Booking Card**:
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 20px 24px
- Display: Flex, space-between, align-items center
- Cursor: pointer
- Hover: Border color changes to #8B5CF6
- Transition: border-color 200ms

**Card Layout** (flex row):

1. **Left Section** (flex: 1):
   - **Chapel Name**: 16px, #FAFAFA, bold, margin bottom 4px
   - **Customer Name**: 14px, #94A3B8, margin bottom 4px
   - **Date & Time**: 14px, #94A3B8
     - Format: "Jan 15, 2025 • Morning (9 AM - 12 PM)"

2. **Middle Section**:
   - **Guest Count**: 14px, #94A3B8
     - Format: "X guests"

3. **Right Section** (flex column, align-items end, gap 8px):
   - **Status Badge**:
     - Pending: Yellow badge (#F59E0B background 0.1 opacity, #F59E0B text)
     - Confirmed: Green badge (#10B981 background 0.1 opacity, #10B981 text)
     - Cancelled: Red badge (#EF4444 background 0.1 opacity, #EF4444 text)
     - Completed: Blue badge (#3B82F6 background 0.1 opacity, #3B82F6 text)
   - **Price**: 16px, #FAFAFA, bold
     - Format: "$XXX"

**Empty State** (if no bookings):
- Center-aligned content
- Icon: Calendar icon (64px, #64748B)
- Heading: "No Bookings Yet" (20px, #FAFAFA, bold)
- Text: "Your bookings will appear here once customers start booking." (16px, #94A3B8)
- Margin top: 48px

---

## 3. User Interactions

### 3.1 Sidebar Navigation

| Element | Label | Type | Trigger | Destination |
|---------|-------|------|---------|-------------|
| Nav Link 1 | "Overview" | Link | Click | Navigate to `/dashboard/owner` |
| Nav Link 2 | "My Chapels" | Link | Click | Navigate to `/dashboard/owner/chapels` |
| Nav Link 3 | "All Bookings" | Link | Click | Navigate to `/dashboard/owner/bookings` |
| Nav Link 4 | "Profile" | Link | Click | Navigate to `/dashboard/owner/profile` |

---

### 3.2 Statistics Cards

| Element | Type | Trigger | Action |
|---------|------|---------|--------|
| Total Chapels Card | Static Card | None | Display only |
| Pending Bookings Card | Clickable Card | Click | Navigate to `/dashboard/owner/bookings?status=pending` |
| Total Revenue Card | Static Card | None | Display only |
| This Month's Bookings Card | Static Card | None | Display only |

---

### 3.3 My Chapels Section

| Element | Label | Type | Trigger | Destination |
|---------|-------|------|---------|-------------|
| Add Chapel Button | "+ Add New Chapel" | Button (Primary) | Click | Navigate to `/dashboard/owner/chapels/new` |
| Chapel Card | Entire card | Card | Click | Navigate to `/dashboard/owner/chapels/:id` |
| Edit Button | "Edit" | Button (Secondary) | Click | Navigate to `/dashboard/owner/chapels/:id` |
| Manage Button | "Manage" | Button (Secondary) | Click | Navigate to `/dashboard/owner/chapels/:id` |
| View All Link | "View All Chapels →" | Link | Click | Navigate to `/dashboard/owner/chapels` |

---

### 3.4 Recent Bookings Section

| Element | Label | Type | Trigger | Destination |
|---------|-------|------|---------|-------------|
| View All Link | "View All" | Link | Click | Navigate to `/dashboard/owner/bookings` |
| Booking Card | Entire card | Card | Click | Navigate to `/dashboard/owner/bookings/:id` |
| Pending Badge | Status badge | Badge | Click on card | Navigate to `/dashboard/owner/bookings/:id` |

---

## 4. API Integration

### 4.1 On Page Load

**Fetch Owner's Chapels** (for stats and preview):
```typescript
const { data: chapelsData } = await apiClient.chapels.getMyChapels({
  query: { page: 1, limit: 3 }
});

// Extract data
const chapels = chapelsData.chapels;
const totalChapels = chapelsData.total;
```

**Fetch All Bookings for Owner** (for stats and preview):
```typescript
const { data: bookingsData } = await apiClient.bookings.getBookings({
  query: {
    page: 1,
    limit: 5,
    // Backend should filter by owner's chapels automatically
  }
});

// Extract data
const recentBookings = bookingsData.bookings;
const totalBookings = bookingsData.total;

// Calculate metrics
const pendingBookings = recentBookings.filter(b => b.status === 'pending').length;
const thisMonthBookings = recentBookings.filter(b => {
  const bookingMonth = new Date(b.bookingDate).getMonth();
  const currentMonth = new Date().getMonth();
  return bookingMonth === currentMonth;
}).length;
```

**Calculate Revenue** (from bookings):
```typescript
// Calculate total revenue from completed bookings
const totalRevenue = recentBookings
  .filter(b => b.status === 'completed')
  .reduce((sum, booking) => {
    // Get chapel base price for this booking
    const chapel = chapels.find(c => c.id === booking.chapelId);
    return sum + (chapel?.basePrice || 0);
  }, 0);
```

---

### 4.2 User Action Triggers

**Add New Chapel Button Click**:
```typescript
// Navigation handled by router - no API call
// Navigate to: /dashboard/owner/chapels/new
```

**Chapel Card Click**:
```typescript
// Navigation handled by router - no API call
// Navigate to: /dashboard/owner/chapels/:id
```

**Booking Card Click**:
```typescript
// Navigation handled by router - no API call
// Navigate to: /dashboard/owner/bookings/:id
```

**Pending Bookings Card Click**:
```typescript
// Navigation with query parameter
// Navigate to: /dashboard/owner/bookings?status=pending
```

---

## 5. States

### 5.1 Loading State

**On Initial Page Load**:
- Show skeleton loaders for all sections
- Statistics cards: Show 4 skeleton cards with pulsing gradient
- Chapel cards: Show 3 skeleton cards with image placeholder and text lines
- Booking cards: Show 5 skeleton list items

**Skeleton Card Styling**:
```css
background: linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%)
background-size: 200% 100%
animation: pulse 1.5s ease-in-out infinite
border-radius: 12px
```

---

### 5.2 Empty States

**No Chapels State**:
- Hide "My Chapels" preview section
- Show centered empty state in statistics area:
  - Icon: Building icon (64px, #64748B)
  - Heading: "No Chapels Yet" (24px, #FAFAFA, bold)
  - Description: "Start by creating your first chapel listing." (16px, #94A3B8)
  - CTA Button: "+ Create Your First Chapel" (primary purple button)
    - Action: Navigate to `/dashboard/owner/chapels/new`

**No Bookings State**:
- Show "Recent Bookings" section header
- Display empty state message:
  - Icon: Calendar icon (64px, #64748B)
  - Heading: "No Bookings Yet" (20px, #FAFAFA, bold)
  - Description: "Your bookings will appear here once customers start booking." (16px, #94A3B8)
  - Margin: 48px top

**Statistics When Empty**:
- Total Chapels: Show "0"
- Pending Bookings: Show "0"
- Total Revenue: Show "$0"
- This Month's Bookings: Show "0"

---

### 5.3 Error State

**API Error** (chapels or bookings fetch fails):
- Show error notification at top of page:
  - Background: rgba(239, 68, 68, 0.1)
  - Border: 1px solid #EF4444
  - Border radius: 8px
  - Padding: 16px
  - Color: #EF4444
  - Message: "Unable to load dashboard data. Please try again."
  - Retry Button: "Retry" (secondary button, 10px 16px padding)
    - Action: Refetch all API data

**Network Error**:
- Show error state with icon:
  - Icon: Alert triangle (64px, #EF4444)
  - Heading: "Connection Error" (24px, #FAFAFA, bold)
  - Description: "Unable to connect to the server. Please check your internet connection." (16px, #94A3B8)
  - Retry Button: "Try Again" (primary button)
    - Action: Reload page

**401 Unauthorized**:
- Clear authentication token
- Redirect to `/login?redirect=/dashboard/owner`

**403 Forbidden** (wrong role):
- Redirect to appropriate dashboard based on user role
- If couple role: Redirect to `/dashboard/couple`
- If no valid role: Redirect to `/login`

---

### 5.4 Success States

**Data Loaded Successfully**:
- Display all statistics with actual data
- Show chapel cards with images and details
- Show booking cards with status badges
- All sections visible and interactive

**Pending Bookings Indicator**:
- If pending bookings > 0:
  - Show warning badge on "Pending Bookings" card
  - Add subtle pulse animation to the card border
  - Make card clickable to navigate to filtered bookings

---

## 6. Responsive Behavior

### Mobile (0-768px)
- Sidebar becomes bottom navigation bar (fixed at bottom)
- Statistics grid: 2 columns (2x2 grid)
- Chapel cards grid: 1 column (stack vertically)
- Booking cards: Full width, stack content vertically within each card
- Reduce padding to 16px

### Tablet (768-1024px)
- Sidebar remains visible but compressed (200px width)
- Statistics grid: 4 columns (maintain)
- Chapel cards grid: 2 columns
- Booking cards: Full width, maintain horizontal layout
- Reduce main content padding to 24px

### Desktop (1024px+)
- Use full Dashboard Layout as specified
- All grids at full column count
- Full sidebar width (240px)
- Main content padding: 32px

---

## 7. Design Tokens Reference

**From Master Spec**:
- Background colors: #0F172A (primary), #1E293B (secondary), #334155 (tertiary)
- Text colors: #FAFAFA (primary), #94A3B8 (secondary), #64748B (tertiary)
- Accent: #8B5CF6 (primary), #7C3AED (hover)
- Semantic: #10B981 (success), #EF4444 (error), #F59E0B (warning), #3B82F6 (info)
- Spacing: 8px, 16px, 24px, 32px, 48px, 64px
- Border radius: 8px (buttons/inputs), 12px (cards), 16px (modals)
- Typography: Inter font family, 16px body, 400 regular weight, 700 bold for headings

---

**End of Owner Dashboard Page Specification**
