# Frontend Interaction Specification - Chapel Detail Page

**Route**: `/chapels/:id`
**Layout**: Standard Layout (Template 1)
**Purpose**: Display comprehensive chapel information with photo gallery, details, and booking capabilities

---

## 1. Page Setup

**Name**: Chapel Detail Page
**Route**: `/chapels/:id`
**Layout**: Standard Layout from master spec
**Access**: Public (unauthenticated users can view)
**Purpose**: Show detailed chapel information including photos, amenities, pricing, location, and availability with ability to book

---

## 2. Content Structure

### 2.1 Header Section
Uses Standard Layout header:
- **Unauthenticated**: Logo | "Browse Chapels" | "Sign In" | "Register"
- **Authenticated**: Logo | "Browse Chapels" | "Dashboard" | Profile Menu

### 2.2 Back Navigation Bar
Background: #1E293B
Padding: 16px 32px
Border-bottom: 1px solid #334155

**Elements**:
- Back button with left arrow icon "← Back to Browse"
- Text color: #94A3B8
- Hover color: #FAFAFA

### 2.3 Main Content Area
Max-width: 1200px
Centered with 32px horizontal padding
Vertical padding: 48px

#### Section A: Photo Gallery (Top)

**Primary Image Display**:
- Width: 100%
- Height: 500px
- Border-radius: 12px
- Object-fit: cover
- Cursor: pointer (clickable to open full gallery)
- Background: #334155 (while loading)

**Thumbnail Gallery** (below primary image):
- Horizontal scroll container
- Gap: 16px between thumbnails
- Margin-top: 16px

**Each Thumbnail**:
- Width: 120px
- Height: 80px
- Border-radius: 8px
- Border: 2px solid transparent
- Active border: 2px solid #8B5CF6
- Cursor: pointer
- Object-fit: cover

**"View All Photos" Button**:
- Position: Absolute bottom-right of primary image
- Background: rgba(15, 23, 42, 0.8)
- Color: #FAFAFA
- Padding: 8px 16px
- Border-radius: 8px
- Font-size: 14px

#### Section B: Chapel Information Grid

Two-column layout on desktop (stacks on mobile):
- Left column: 66% width
- Right column: 33% width
- Gap: 32px

**Left Column - Details**:

**Chapel Name**:
- Font-size: 48px (h1)
- Color: #FAFAFA
- Font-weight: 700
- Line-height: 1.2
- Margin-bottom: 16px

**Location Row**:
- Display: flex
- Gap: 8px
- Color: #94A3B8
- Font-size: 16px
- Margin-bottom: 24px
- Icon: Location pin (before text)

**Description**:
- Font-size: 16px
- Color: #FAFAFA
- Line-height: 1.5
- Margin-bottom: 32px
- White-space: pre-wrap

**Details Grid**:
- Display: grid
- Grid-columns: 2
- Gap: 24px
- Margin-bottom: 32px

Each detail item:
- Background: #1E293B
- Padding: 20px
- Border-radius: 8px
- Border: 1px solid #334155

**Detail Item Structure**:
- Label (top): Color #94A3B8, font-size 14px
- Value (bottom): Color #FAFAFA, font-size 20px, font-weight 700

**Details to show**:
1. **Capacity**: `{chapel.capacity} guests`
2. **Base Price**: `$${chapel.basePrice}`
3. **City**: `{chapel.city}, {chapel.state}`
4. **Status**: Badge (green "Active" or red "Inactive")

**Contact Information Section**:
- Heading: "Contact Information" (h3, 24px, color #FAFAFA)
- Margin-bottom: 16px

Contact details background: #1E293B
Padding: 24px
Border-radius: 12px
Border: 1px solid #334155

**Contact Items**:
1. **Email**: Icon + `{chapel.contactEmail}` (color #8B5CF6, clickable mailto:)
2. **Phone**: Icon + `{chapel.contactPhone}` (color #8B5CF6, clickable tel:)

**Right Column - Booking Card**:

**Sticky Card** (stays in view on scroll):
- Position: sticky
- Top: 80px
- Background: #1E293B
- Border: 1px solid #334155
- Border-radius: 12px
- Padding: 24px

**Price Display** (top of card):
- Font-size: 36px
- Color: #FAFAFA
- Font-weight: 700
- Line-height: 1.2
- Small text below: "base price" (14px, color #94A3B8)
- Margin-bottom: 24px

**Primary CTA Button**: "Book This Chapel"
- Width: 100%
- Background: #8B5CF6
- Color: #FAFAFA
- Padding: 16px 24px
- Border-radius: 8px
- Font-size: 18px
- Font-weight: 400
- Hover background: #7C3AED
- Margin-bottom: 16px

**Secondary Actions**:

**"Check Availability" Button**:
- Width: 100%
- Background: transparent
- Color: #8B5CF6
- Border: 1px solid #8B5CF6
- Padding: 12px 24px
- Border-radius: 8px
- Font-size: 16px
- Hover background: rgba(139, 92, 246, 0.1)
- Margin-bottom: 16px

**Availability Preview** (if check availability clicked):
- Background: #0F172A
- Padding: 16px
- Border-radius: 8px
- Margin-bottom: 16px

Mini calendar component:
- Shows current month
- Date cells: 32px × 32px
- Available dates: Border 1px solid #10B981
- Booked dates: Background #EF4444 with opacity 0.2
- Blocked dates: Background #64748B with opacity 0.2
- Selectable dates: Cursor pointer, hover border #8B5CF6

**Selected Date Display**:
- Color: #FAFAFA
- Font-size: 14px
- Margin-bottom: 12px

**Time Slot Buttons** (if date selected):
- Display: flex
- Flex-direction: column
- Gap: 8px

Each time slot button:
- Width: 100%
- Background: #0F172A
- Border: 1px solid #334155
- Color: #FAFAFA
- Padding: 12px
- Border-radius: 8px
- Text-align: left
- Cursor: pointer
- Hover border: #8B5CF6
- Active background: #8B5CF6
- Disabled: Opacity 0.5, cursor not-allowed

Time slots:
1. "Morning (9 AM - 12 PM)"
2. "Afternoon (1 PM - 5 PM)"
3. "Evening (6 PM - 9 PM)"

**Divider**:
- Border-top: 1px solid #334155
- Margin: 16px 0

**"Contact Owner" Button**:
- Width: 100%
- Background: transparent
- Color: #94A3B8
- Border: 1px solid #334155
- Padding: 12px 24px
- Border-radius: 8px
- Font-size: 14px
- Hover border: #8B5CF6
- Hover color: #FAFAFA

**Share Button**:
- Width: 100%
- Background: transparent
- Color: #94A3B8
- Border: none
- Padding: 8px
- Font-size: 14px
- Text-align: center
- Cursor: pointer
- Hover color: #FAFAFA
- Icon: Share icon

---

## 3. User Interactions

### 3.1 Navigation Elements

| Element | Label | Action |
|---------|-------|--------|
| Back Button | "← Back to Browse" | Navigate to `/chapels` |
| Header Logo | "Chapel Bookings" | Navigate to `/` |
| Header Nav Link | "Browse Chapels" | Navigate to `/chapels` |
| Header Sign In (unauth) | "Sign In" | Navigate to `/login` |
| Header Register (unauth) | "Register" | Navigate to `/register` |
| Header Dashboard (auth) | "Dashboard" | Navigate to `/dashboard/couple` or `/dashboard/owner` (role-based) |

### 3.2 Gallery Interactions

| Element | Label | Trigger | Action |
|---------|-------|---------|--------|
| Primary Image | Large chapel photo | Click | Open full gallery modal |
| Thumbnail Image | Small photo | Click | Update primary image to clicked thumbnail, scroll into view |
| View All Photos Button | "View All Photos" | Click | Open full gallery modal at current image |

### 3.3 Booking Actions

| Element | Label | Trigger | Action |
|---------|-------|---------|--------|
| Book This Chapel Button | "Book This Chapel" | Click | If authenticated: Navigate to `/chapels/:id/book`<br>If not authenticated: Navigate to `/login?redirect=/chapels/:id/book` |
| Check Availability Button | "Check Availability" | Click | Expand availability calendar in booking card, fetch initial month data |
| Calendar Date Cell | Date number | Click | Select date, fetch available time slots for that date via API |
| Time Slot Button | "Morning", "Afternoon", "Evening" | Click | Highlight selected slot, enable book button with pre-selected date/time |
| Calendar Month Previous | "←" arrow | Click | Load previous month availability data |
| Calendar Month Next | "→" arrow | Click | Load next month availability data |
| Contact Owner Button | "Contact Owner" | Click | Open contact modal with email/phone |
| Share Button | Share icon | Click | Copy page URL to clipboard, show success toast |

### 3.4 Contact Actions

| Element | Label | Trigger | Action |
|---------|-------|---------|--------|
| Email Link | Chapel contact email | Click | Open mailto: link in new window |
| Phone Link | Chapel contact phone | Click | Open tel: link (mobile devices initiate call) |

---

## 4. API Integration

### 4.1 On Page Load

```typescript
// Get chapel ID from route params
const { id: chapelId } = useParams();

// Fetch chapel details
const { data: chapel, isLoading, error } = useQuery({
  queryKey: ['chapel', chapelId],
  queryFn: async () => {
    const { data } = await apiClient.chapels.getChapel({
      params: { id: chapelId }
    });
    return data;
  }
});

// Fetch chapel images
const { data: imagesResponse } = useQuery({
  queryKey: ['chapel-images', chapelId],
  queryFn: async () => {
    const { data } = await apiClient.chapelImages.getChapelImages({
      params: { chapelId },
      query: { page: 1, limit: 20 }
    });
    return data;
  },
  enabled: !!chapelId
});

const images = imagesResponse?.images || [];
const primaryImage = images.find(img => img.isPrimary) || images[0];
```

### 4.2 Check Availability (on button click)

```typescript
// When user clicks "Check Availability"
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [showCalendar, setShowCalendar] = useState(false);
const [currentMonth, setCurrentMonth] = useState(new Date());

const handleCheckAvailability = () => {
  setShowCalendar(true);
  // Calendar component will trigger month data fetch
};

// Fetch availability for current month view
const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

const { data: availabilityData } = useQuery({
  queryKey: ['chapel-availability', chapelId, startDate, endDate],
  queryFn: async () => {
    const { data } = await apiClient.chapelAvailability.getChapelAvailability({
      params: { chapelId },
      query: { startDate, endDate }
    });
    return data;
  },
  enabled: showCalendar && !!chapelId
});

// Also fetch blocked dates for the month
const { data: blockedDatesData } = useQuery({
  queryKey: ['blocked-dates', chapelId, startDate, endDate],
  queryFn: async () => {
    const { data } = await apiClient.blockedDates.getBlockedDates({
      params: { chapelId },
      query: { startDate, endDate }
    });
    return data;
  },
  enabled: showCalendar && !!chapelId
});

// Fetch bookings to show which dates/times are already taken
const { data: bookingsData } = useQuery({
  queryKey: ['chapel-bookings-calendar', chapelId, startDate, endDate],
  queryFn: async () => {
    const { data } = await apiClient.bookings.getChapelBookings({
      params: { chapelId },
      query: {
        startDate,
        endDate,
        status: 'confirmed' // Only show confirmed bookings
      }
    });
    return data;
  },
  enabled: showCalendar && !!chapelId
});
```

### 4.3 Select Date and Time Slot

```typescript
// When user selects a date from calendar
const handleDateSelect = (date: string) => {
  setSelectedDate(date);
};

// Fetch available time slots for selected date
const { data: timeSlotAvailability } = useQuery({
  queryKey: ['availability-by-date', chapelId, selectedDate],
  queryFn: async () => {
    const { data } = await apiClient.chapelAvailability.getAvailabilityByDate({
      params: {
        chapelId,
        date: selectedDate!
      }
    });
    return data;
  },
  enabled: !!selectedDate && !!chapelId
});

// Check if date is blocked
const { data: dateBlockedCheck } = useQuery({
  queryKey: ['check-blocked', chapelId, selectedDate],
  queryFn: async () => {
    const { data } = await apiClient.blockedDates.checkDateBlocked({
      params: { chapelId },
      query: { date: selectedDate! }
    });
    return data;
  },
  enabled: !!selectedDate && !!chapelId
});

// When user selects a time slot and clicks book
const handleBookWithPreselection = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
  // Navigate to booking page with query params
  navigate(`/chapels/${chapelId}/book?date=${selectedDate}&timeSlot=${timeSlot}`);
};
```

### 4.4 Share Functionality

```typescript
const handleShare = async () => {
  const url = window.location.href;

  try {
    await navigator.clipboard.writeText(url);
    // Show success toast: "Link copied to clipboard!"
    showToast({
      type: 'success',
      message: 'Link copied to clipboard!'
    });
  } catch (err) {
    // Fallback for older browsers
    showToast({
      type: 'error',
      message: 'Failed to copy link'
    });
  }
};
```

---

## 5. States

### 5.1 Loading State

**Initial Page Load**:
- Show skeleton UI for entire page
- Header: Loaded immediately (static)
- Back button: Loaded immediately
- Primary image area: Gray rectangle with pulse animation (#334155)
- Chapel name: Gray bar 300px wide with pulse
- Location: Gray bar 200px wide with pulse
- Description: 3 gray bars full width with pulse
- Details grid: 4 gray cards with pulse
- Booking card: Gray card with pulse
- No gallery thumbnails shown

**Skeleton Style**:
```css
background: linear-gradient(
  90deg,
  #334155 0%,
  #475569 50%,
  #334155 100%
);
animation: pulse 2s ease-in-out infinite;
```

### 5.2 Empty States

**No Images Available**:
- Primary image area shows placeholder:
  - Background: #334155
  - Centered icon: Image icon (64px, color #64748B)
  - Text below icon: "No photos available" (color #94A3B8, 16px)
- No thumbnail gallery shown
- "View All Photos" button hidden

**No Contact Information**:
- Contact section shows:
  - "Contact information not available" (color #94A3B8, 16px)
  - "Contact Owner" button still visible (uses chapel owner's user data if available)

**No Availability Data**:
- Calendar shows all dates as unavailable (grayed out)
- Message below calendar: "Availability information not set by owner" (color #94A3B8, 14px)

### 5.3 Error State

**Chapel Not Found (404)**:
- Full page centered message:
  - Icon: Warning triangle (64px, color #EF4444)
  - Heading: "Chapel Not Found" (h2, color #FAFAFA)
  - Text: "The chapel you're looking for doesn't exist or has been removed." (color #94A3B8)
  - Button: "Browse All Chapels" (navigate to `/chapels`)
  - Padding: 64px vertical

**API Error (500 / Network)**:
- Full page centered message:
  - Icon: Alert circle (64px, color #EF4444)
  - Heading: "Unable to Load Chapel" (h2, color #FAFAFA)
  - Text: "We couldn't load this chapel's information. Please try again." (color #94A3B8)
  - Primary button: "Try Again" (reload page)
  - Secondary button: "Back to Browse" (navigate to `/chapels`)
  - Padding: 64px vertical

**Availability Check Error**:
- Show error toast: "Unable to check availability. Please try again."
- Calendar remains collapsed
- User can still click "Book This Chapel" to proceed to booking page

### 5.4 Inactive Chapel

**If chapel.isActive === false**:
- Show warning banner at top of page:
  - Background: rgba(245, 158, 11, 0.1)
  - Border: 1px solid #F59E0B
  - Color: #F59E0B
  - Padding: 16px 32px
  - Border-radius: 8px
  - Icon: Info icon
  - Text: "This chapel is currently inactive and not accepting new bookings."
  - Margin-bottom: 24px

**Booking Card Changes**:
- "Book This Chapel" button:
  - Background: #64748B (grayed out)
  - Cursor: not-allowed
  - Disabled: true
  - No hover effect
- "Check Availability" button: Still functional (shows unavailable)
- Show text below buttons: "Currently not accepting bookings" (color #94A3B8, 14px)

### 5.5 Success States

**Link Copied**:
- Toast notification (bottom-right):
  - Background: #10B981
  - Color: #FAFAFA
  - Icon: Checkmark
  - Text: "Link copied to clipboard!"
  - Duration: 3 seconds
  - Auto-dismiss

**Date/Time Selected**:
- Selected date: Border 2px solid #8B5CF6
- Selected time slot: Background #8B5CF6, color #FAFAFA
- "Book This Chapel" button text updates to: "Book for [Date] - [Time Slot]"

---

## 6. Gallery Modal

### 6.1 Modal Structure

**Overlay**:
- Position: fixed
- Inset: 0
- Background: rgba(15, 23, 42, 0.95)
- Z-index: 100
- Backdrop-filter: blur(4px)

**Modal Content**:
- Position: fixed
- Inset: 0
- Display: flex
- Flex-direction: column
- Padding: 0

**Image Container**:
- Flex: 1
- Display: flex
- Align-items: center
- Justify-content: center
- Padding: 80px 100px

**Full Image**:
- Max-width: 90vw
- Max-height: 80vh
- Object-fit: contain
- Border-radius: 8px

**Caption** (if exists):
- Position: absolute
- Bottom: 100px
- Left: 50%
- Transform: translateX(-50%)
- Background: rgba(15, 23, 42, 0.9)
- Padding: 12px 24px
- Border-radius: 8px
- Color: #FAFAFA
- Font-size: 16px
- Max-width: 600px
- Text-align: center

**Controls**:

**Close Button** (top-right):
- Position: absolute
- Top: 24px
- Right: 24px
- Background: rgba(15, 23, 42, 0.8)
- Border: 1px solid #334155
- Color: #FAFAFA
- Width: 48px
- Height: 48px
- Border-radius: 50%
- Font-size: 24px
- Cursor: pointer
- Hover background: rgba(30, 41, 59, 0.9)
- Z-index: 110

**Previous Button** (left center):
- Position: absolute
- Left: 24px
- Top: 50%
- Transform: translateY(-50%)
- Background: rgba(15, 23, 42, 0.8)
- Border: 1px solid #334155
- Color: #FAFAFA
- Width: 48px
- Height: 48px
- Border-radius: 50%
- Font-size: 24px
- Cursor: pointer
- Hover background: rgba(30, 41, 59, 0.9)
- Disabled (first image): opacity 0.5, cursor not-allowed

**Next Button** (right center):
- Same as Previous but positioned right: 24px
- Disabled (last image): opacity 0.5, cursor not-allowed

**Image Counter** (top-center):
- Position: absolute
- Top: 24px
- Left: 50%
- Transform: translateX(-50%)
- Background: rgba(15, 23, 42, 0.8)
- Padding: 8px 16px
- Border-radius: 8px
- Color: #FAFAFA
- Font-size: 14px
- Text: "{currentIndex + 1} / {totalImages}"

### 6.2 Modal Interactions

| Element | Label | Trigger | Action |
|---------|-------|---------|--------|
| Close Button | "×" | Click | Close modal, return to page |
| Previous Button | "←" | Click | Show previous image in gallery |
| Next Button | "→" | Click | Show next image in gallery |
| Overlay | Background | Click | Close modal |
| Keyboard ESC | N/A | Keydown | Close modal |
| Keyboard Left Arrow | N/A | Keydown | Previous image |
| Keyboard Right Arrow | N/A | Keydown | Next image |
| Image | Current photo | Click | Next image (alternative to next button) |

---

## 7. Responsive Behavior

### Mobile (0-768px)

**Layout Changes**:
- Two-column grid becomes single column
- Booking card moves below details (no longer sticky)
- Gallery thumbnails: Scroll horizontally (hide scrollbar)
- Details grid: 1 column instead of 2
- Primary image height: 300px (reduced from 500px)
- Thumbnail size: 80px × 60px (reduced)
- Horizontal padding: 16px (reduced from 32px)
- Vertical padding: 24px (reduced from 48px)

**Modal Changes**:
- Image padding: 24px
- Controls: Smaller (40px × 40px)
- Caption: Bottom 24px, max-width 90%

**Calendar Changes**:
- Date cells: 28px × 28px (reduced from 32px)
- Font-size: 12px

### Tablet (768-1024px)

**Layout Changes**:
- Keep two-column layout
- Left column: 60% width
- Right column: 40% width
- Booking card: Sticky still active
- Reduce some padding slightly

---

## 8. Accessibility

**Keyboard Navigation**:
- All interactive elements: Tab-accessible
- Gallery modal: ESC closes, arrows navigate
- Buttons: Enter/Space activates
- Calendar: Arrow keys navigate dates

**Screen Readers**:
- Image alt text: "{chapel.name} - Photo {index + 1}"
- Button labels: Clear action text
- Status indicators: Announced properly
- Error messages: Announced via ARIA live regions

**Color Contrast**:
- All text meets WCAG AA standards
- Focus indicators: 2px solid #8B5CF6 outline
- Disabled states: Clear visual difference

**ARIA Attributes**:
- Modal: `role="dialog"`, `aria-modal="true"`
- Close button: `aria-label="Close gallery"`
- Navigation buttons: `aria-label="Previous/Next image"`
- Calendar: Proper date button labels
- Loading states: `aria-busy="true"`

---

## 9. Reference to Master Spec

**Colors**: All from master spec color system
**Typography**: All from master spec typography system
**Spacing**: All from master spec spacing scale
**Components**: Button, Card, Badge, Modal, Input styles from master
**Layout**: Standard Layout (Template 1) from master
**Routes**: All navigation uses exact routes from master's navigation map
**API Methods**: All from API Registry (chapels, chapelImages, chapelAvailability, blockedDates, bookings namespaces)

---

**End of Chapel Detail Page Specification**
