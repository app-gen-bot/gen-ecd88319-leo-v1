# Frontend Interaction Specification: UserDashboardPage

## Page Setup
- **Name**: UserDashboardPage
- **Route**: `/dashboard`
- **Layout**: Dashboard Layout (header, sidebar, main content, no footer)
- **Access**: Authenticated users with role 'couple' only
- **Purpose**: Central hub for couples to view their booking summary, upcoming bookings, and quick actions

## Content Structure

### 1. Page Header
- **Heading**: "Welcome back, [User's First Name]!" (48px, bold, white text)
- **Subtitle**: "Manage your chapel bookings and explore more options" (16px, slate-300 text)
- **Background**: Dark slate (#0F172A)
- **Spacing**: 32px padding top and bottom

### 2. Quick Stats Section (Grid of Metric Cards)
**Layout**: 3-column grid, 16px gap between cards
**Position**: Below page header, 24px margin

#### Card 1: Upcoming Bookings
- **Background**: Slate-800 (#1E293B), 16px padding, 8px border radius
- **Icon**: Calendar icon (purple, 24px)
- **Metric Value**: Large number (36px, bold, white) showing count
- **Label**: "Upcoming Bookings" (14px, slate-400)
- **Action**: "View All" button (text link, purple, 14px) → Navigate to MyBookingsPage

#### Card 2: Total Bookings
- **Background**: Slate-800 (#1E293B), 16px padding, 8px border radius
- **Icon**: Book icon (purple, 24px)
- **Metric Value**: Large number (36px, bold, white) showing total count
- **Label**: "Total Bookings" (14px, slate-400)
- **Action**: "View History" button (text link, purple, 14px) → Navigate to BookingHistoryPage

#### Card 3: Favorite Chapels
- **Background**: Slate-800 (#1E293B), 16px padding, 8px border radius
- **Icon**: Heart icon (purple, 24px)
- **Metric Value**: Large number (36px, bold, white) showing count
- **Label**: "Favorite Chapels" (14px, slate-400)
- **Action**: "View Favorites" button (text link, purple, 14px) → Navigate to FavoriteChapelsPage

### 3. Upcoming Bookings Section
**Position**: Below Quick Stats, 32px margin
**Layout**: Vertical stack

#### Section Header
- **Heading**: "Your Upcoming Bookings" (24px, bold, white)
- **Action Button**: "View All Bookings" (purple button, 14px) → Navigate to MyBookingsPage
- **Layout**: Flexbox row, space-between alignment

#### Bookings List
**Layout**: Vertical stack, 16px gap between cards

Each booking card displays:
- **Background**: Slate-800 (#1E293B), 16px padding, 8px border radius
- **Border**: 1px solid slate-700
- **Hover**: Slight elevation (shadow-md), cursor pointer

**Card Content (Left to Right)**:
1. **Chapel Photo**: 80px x 80px rounded image, object-fit cover
2. **Booking Details** (Flex column, 12px gap):
   - Chapel Name (16px, bold, white)
   - Booking Date: "Mon, Jan 15, 2025" (14px, slate-300)
   - Time: "2:00 PM - 4:00 PM" (14px, slate-300)
   - Status Badge: "Confirmed" (green bg, white text, 12px, uppercase, 4px padding, rounded)
3. **Actions** (Right aligned):
   - "View Details" button (outline purple button, 14px) → Navigate to BookingDetailPage with booking ID
   - "Confirmation #": Small text (12px, slate-400) showing confirmation number

**Empty State** (if no upcoming bookings):
- Icon: Calendar-X icon (slate-600, 48px)
- Message: "No upcoming bookings" (16px, slate-400)
- Subtext: "Ready to book your perfect chapel?" (14px, slate-500)
- CTA Button: "Browse Chapels" (purple button, 16px) → Navigate to ChapelsListPage

**Limit**: Show maximum 3 upcoming bookings. Display "View All" link if more exist.

### 4. Favorite Chapels Section
**Position**: Below Upcoming Bookings, 32px margin
**Layout**: Vertical stack

#### Section Header
- **Heading**: "Your Favorite Chapels" (24px, bold, white)
- **Action Button**: "View All Favorites" (purple button, 14px) → Navigate to FavoriteChapelsPage
- **Layout**: Flexbox row, space-between alignment

#### Chapels Grid
**Layout**: 3-column grid, 16px gap between cards

Each chapel card displays:
- **Background**: Slate-800 (#1E293B), overflow hidden, 8px border radius
- **Hover**: Scale 1.02 transform, cursor pointer

**Card Content (Top to Bottom)**:
1. **Chapel Photo**: Full-width, 160px height, object-fit cover
2. **Card Body** (16px padding):
   - Chapel Name (16px, bold, white)
   - Location: "City, State" (14px, slate-400)
   - Rating: Star icons + numeric rating (e.g., "★★★★★ 4.8") (14px, yellow stars, white text)
   - Base Price: "$150/hour" (16px, purple, bold)
3. **Card Actions** (16px padding, border-top slate-700):
   - "View Details" button (text link, purple, 14px) → Navigate to ChapelDetailPage with chapel ID
   - Heart icon (filled red, 20px) with hover tooltip "Remove from favorites"

**Click Behavior**: Clicking card (not buttons) navigates to ChapelDetailPage

**Empty State** (if no favorites):
- Icon: Heart icon (slate-600, 48px)
- Message: "No favorite chapels yet" (16px, slate-400)
- Subtext: "Explore chapels and save your favorites" (14px, slate-500)
- CTA Button: "Browse Chapels" (purple button, 16px) → Navigate to ChapelsListPage

**Limit**: Show maximum 3 favorite chapels. Display "View All" link if more exist.

### 5. Quick Actions Section
**Position**: Below Favorite Chapels, 32px margin
**Layout**: Vertical stack

#### Section Header
- **Heading**: "Quick Actions" (24px, bold, white)

#### Actions Grid
**Layout**: 2-column grid, 16px gap between action cards

#### Action Card 1: Book a Chapel
- **Background**: Purple gradient subtle (purple-900 to purple-800), 24px padding, 8px border radius
- **Icon**: Plus-circle icon (white, 32px)
- **Title**: "Book a Chapel" (18px, bold, white)
- **Description**: "Find and book your perfect wedding venue" (14px, purple-200)
- **Button**: "Start Booking" (white button with purple text, 14px) → Navigate to SelectChapelPage

#### Action Card 2: Manage Profile
- **Background**: Slate-800 (#1E293B), 24px padding, 8px border radius, border 1px slate-700
- **Icon**: User icon (purple, 32px)
- **Title**: "Manage Profile" (18px, bold, white)
- **Description**: "Update your personal information and settings" (14px, slate-400)
- **Button**: "Edit Profile" (outline purple button, 14px) → Navigate to UserProfilePage

## User Interactions

### On Page Load
1. **Fetch Current User**:
   ```typescript
   const { data: user } = await apiClient.users.getCurrentUser();
   ```
   - Display user's first name in page header
   - Store user ID for subsequent calls

2. **Fetch Upcoming Bookings**:
   ```typescript
   const { data: upcomingData } = await apiClient.bookings.getUpcomingBookings({
     query: { limit: 3 }
   });
   ```
   - Display in "Upcoming Bookings" section
   - Show count in Quick Stats "Upcoming Bookings" metric

3. **Fetch Booking History Count**:
   ```typescript
   const { data: historyData } = await apiClient.bookings.getBookingHistory({
     query: { page: 1, limit: 1 }
   });
   ```
   - Use `historyData.total` for Quick Stats "Total Bookings" metric

4. **Fetch Favorite Chapels**:
   ```typescript
   const { data: favoritesData } = await apiClient.users.getUserFavorites({
     params: { id: user.id }
   });
   ```
   - Display first 3 chapels in "Favorite Chapels" section
   - Show count in Quick Stats "Favorite Chapels" metric

### Interactive Elements

#### Quick Stats Cards
- **"View All" on Upcoming Bookings**: Navigate to `/my-bookings` (MyBookingsPage)
- **"View History" on Total Bookings**: Navigate to `/booking-history` (BookingHistoryPage)
- **"View Favorites" on Favorite Chapels**: Navigate to `/favorites` (FavoriteChapelsPage)

#### Upcoming Bookings Section
- **"View All Bookings" button**: Navigate to `/my-bookings` (MyBookingsPage)
- **Booking Card Click**: Navigate to `/bookings/:id` (BookingDetailPage) with specific booking ID
- **"View Details" button**: Navigate to `/bookings/:id` (BookingDetailPage) with specific booking ID
- **"Browse Chapels" button (empty state)**: Navigate to `/chapels` (ChapelsListPage)

#### Favorite Chapels Section
- **"View All Favorites" button**: Navigate to `/favorites` (FavoriteChapelsPage)
- **Chapel Card Click**: Navigate to `/chapels/:id` (ChapelDetailPage) with specific chapel ID
- **"View Details" link**: Navigate to `/chapels/:id` (ChapelDetailPage) with specific chapel ID
- **Heart Icon Click**: Remove chapel from favorites
  ```typescript
  await apiClient.users.removeFavorite({
    params: { id: user.id, chapelId: chapel.id }
  });
  // Refresh favorites list
  ```
- **"Browse Chapels" button (empty state)**: Navigate to `/chapels` (ChapelsListPage)

#### Quick Actions Section
- **"Start Booking" button**: Navigate to `/booking/select-chapel` (SelectChapelPage) to begin booking workflow
- **"Edit Profile" button**: Navigate to `/profile` (UserProfilePage)

## API Integration

### On Page Load (Parallel Requests)
```typescript
const [user, upcomingBookings, bookingHistory, favoriteChapels] = await Promise.all([
  apiClient.users.getCurrentUser(),
  apiClient.bookings.getUpcomingBookings({ query: { limit: 3 } }),
  apiClient.bookings.getBookingHistory({ query: { page: 1, limit: 1 } }),
  apiClient.users.getUserFavorites({ params: { id: currentUserId } })
]);
```

### On Remove Favorite
```typescript
const handleRemoveFavorite = async (chapelId: string) => {
  try {
    await apiClient.users.removeFavorite({
      params: { id: user.id, chapelId }
    });

    // Refresh favorites list
    const { data: updatedFavorites } = await apiClient.users.getUserFavorites({
      params: { id: user.id }
    });

    // Update state with new favorites
    setFavorites(updatedFavorites.chapels);

    // Show success toast
    toast.success('Chapel removed from favorites');
  } catch (error) {
    toast.error('Failed to remove favorite. Please try again.');
  }
};
```

## States

### Loading State
**Initial Page Load**:
- Show skeleton screens for all sections:
  - Quick Stats: 3 skeleton cards (slate-700 background, animated pulse)
  - Upcoming Bookings: 3 skeleton booking cards
  - Favorite Chapels: 3 skeleton chapel cards
  - Quick Actions: 2 skeleton action cards
- No spinners, use skeleton placeholders that match content layout

**Removing Favorite**:
- Disable heart icon
- Show small spinner (16px) over heart icon
- Prevent multiple clicks

### Empty States

#### No Upcoming Bookings
- Calendar-X icon (slate-600, 48px, centered)
- "No upcoming bookings" (16px, slate-400, centered)
- "Ready to book your perfect chapel?" (14px, slate-500, centered)
- "Browse Chapels" button (purple, centered) → ChapelsListPage

#### No Favorite Chapels
- Heart icon (slate-600, 48px, centered)
- "No favorite chapels yet" (16px, slate-400, centered)
- "Explore chapels and save your favorites" (14px, slate-500, centered)
- "Browse Chapels" button (purple, centered) → ChapelsListPage

#### No Bookings History (Total = 0)
- Show "0" in Quick Stats card
- Message appears on BookingHistoryPage when navigated

### Error State

#### API Fetch Failure
**Display**:
- Alert icon (red, 24px)
- Error message: "Unable to load dashboard data" (16px, red-400)
- Retry button: "Try Again" (outline red button, 14px)

**Retry Action**:
- Re-fetch all data using same API calls
- Show loading skeletons during retry

#### Remove Favorite Failure
- Toast notification (red background): "Failed to remove favorite. Please try again."
- Re-enable heart icon for retry

### Success State
**Remove Favorite Success**:
- Toast notification (green background): "Chapel removed from favorites"
- Chapel card smoothly fades out from grid
- Grid re-flows to fill gap

## Reference Master Spec

### Colors (from Master)
- Background: `bg-slate-950` (#0F172A)
- Card Background: `bg-slate-800` (#1E293B)
- Border: `border-slate-700`
- Text Primary: `text-white`
- Text Secondary: `text-slate-300`
- Text Muted: `text-slate-400`
- Accent: `text-purple-500` (#8B5CF6), `bg-purple-600`
- Success: `bg-green-600`
- Error: `bg-red-600`

### Typography (from Master)
- Page Heading: 48px, weight 700
- Section Heading: 24px, weight 700
- Card Title: 16-18px, weight 700
- Body Text: 14-16px, weight 400
- Small Text: 12-14px, weight 400
- Font Family: Inter

### Spacing (from Master)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Components (from Master)
- **Button Primary**: Purple background (#8B5CF6), white text, 16px padding horizontal, 12px padding vertical, 6px border radius, hover darkens
- **Button Outline**: Transparent background, purple border (2px), purple text, same padding/radius, hover fills with purple
- **Card**: Slate-800 background, 16px padding, 8px border radius, optional border slate-700
- **Badge**: Appropriate color background, white text, 4-6px padding, 4px border radius, uppercase, 12px font

### Layouts (from Master)
**Dashboard Layout** (this page uses):
- Header: Fixed top, dark slate background, logo left, user menu right
- Sidebar: Fixed left (240px wide), dark slate background, navigation links
- Main Content: Left margin 240px, full height, scrollable, 24px padding
- No Footer

## Permissions
- **Access**: Only authenticated users with `role: 'couple'`
- **Redirect**: If not authenticated → LoginPage
- **Redirect**: If role is not 'couple' → UnauthorizedPage (403)
- **Data Scope**: User can only see their own bookings and favorites

## Responsive Behavior
- **Desktop (>1024px)**: 3-column grids as specified
- **Tablet (768-1023px)**:
  - Quick Stats: 3 columns (unchanged)
  - Favorite Chapels: 2 columns
  - Quick Actions: 2 columns (unchanged)
- **Mobile (<768px)**:
  - All grids: 1 column
  - Sidebar collapses to hamburger menu
  - Booking cards stack vertically
  - Chapel cards full width

## Key Navigation Paths
From this page, users can navigate to:
- **MyBookingsPage** (`/my-bookings`): View all bookings
- **BookingDetailPage** (`/bookings/:id`): View specific booking details
- **BookingHistoryPage** (`/booking-history`): View past bookings
- **FavoriteChapelsPage** (`/favorites`): View all favorite chapels
- **ChapelDetailPage** (`/chapels/:id`): View chapel details
- **ChapelsListPage** (`/chapels`): Browse available chapels
- **SelectChapelPage** (`/booking/select-chapel`): Start new booking
- **UserProfilePage** (`/profile`): Edit user profile
- **UserSettingsPage** (via sidebar): Manage account settings

## Implementation Notes
1. Use TanStack Query for all API calls with proper caching
2. Implement optimistic updates for remove favorite action
3. Use React Router for navigation with proper route params
4. Lazy load chapel images for performance
5. Implement infinite scroll or "Load More" if user has >3 items in any section
6. Add hover tooltips for all interactive icons
7. Ensure all clickable areas have proper focus states for accessibility
8. Format dates using date-fns or similar library
9. Format currency consistently ($XXX.XX format)
10. Implement proper error boundaries for section-level failures
