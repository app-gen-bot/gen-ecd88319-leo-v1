# Frontend Interaction Specification - ManageAvailabilityPage

**Route**: `/dashboard/owner/chapels/:id/availability`
**Layout**: Dashboard Layout
**Role**: Chapel Owner Only
**Purpose**: Manage chapel availability through calendar view, recurring patterns, and blocked dates

---

## 1. Page Setup

**Name**: ManageAvailabilityPage
**Route**: `/dashboard/owner/chapels/:id/availability`
**Layout**: Dashboard Layout (Template 2 from master spec)
**Authentication**: Required (chapel_owner role)
**Purpose**: Allow chapel owners to set specific date availability, recurring weekly patterns, and block date ranges for their chapel

---

## 2. Content Structure

### Header Section
- **Back Button**: "← Back to Chapel" - Purple text (#8B5CF6), positioned top-left
- **Page Title**: "Manage Availability" - White text (#FAFAFA), 36px, bold (700)
- **Chapel Name Subtitle**: Chapel name in secondary text (#94A3B8), 16px below title

### Tab Navigation
Horizontal tab bar with three tabs, 16px below header:
- **Tab 1**: "Calendar View" - Active by default
- **Tab 2**: "Recurring Patterns"
- **Tab 3**: "Blocked Dates"

**Tab Styling**:
- Active: Purple bottom border (#8B5CF6, 2px), purple text
- Inactive: Secondary text (#94A3B8), no border
- Hover: Purple text (#8B5CF6)

### Tab 1: Calendar View

**Calendar Container**:
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px

**Month Navigation**:
- Current month/year display: White text (#FAFAFA), 24px, bold, centered
- Previous month button: "←" icon button, left side
- Next month button: "→" icon button, right side
- Button styling: Secondary text, purple on hover

**Calendar Grid**:
- 7 columns (Sun-Sat)
- Day headers: Secondary text (#94A3B8), 14px, centered
- Date cells:
  - Size: 48px × 48px minimum
  - Background: #334155 for current month dates
  - Background: #1E293B for dates outside current month
  - Border radius: 8px
  - Text: White (#FAFAFA), centered
  - Spacing: 8px gap between cells

**Date Cell States**:
- **Default**: #334155 background, white text
- **Hover**: Purple border (#8B5CF6, 2px)
- **Today**: Purple outline (#8B5CF6, 2px dashed)
- **Has Availability**: Green dot indicator (#10B981, 6px circle) in top-right corner
- **Fully Booked**: Red background overlay (rgba(239, 68, 68, 0.2))
- **Blocked**: Diagonal red strikethrough line
- **Past Date**: Reduced opacity (0.4), not clickable

### Tab 2: Recurring Patterns

**Section Layout**:
Grid of 7 day cards (Monday-Sunday), 2 columns on mobile, 4 on tablet, 7 on desktop

**Day Card**:
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 24px
- Width: Full width with gap of 16px

**Day Card Content**:
- **Day Name Header**: White text (#FAFAFA), 20px, bold
- **Time Slot Toggles** (3 per card):
  - Morning (9 AM - 12 PM)
  - Afternoon (1 PM - 5 PM)
  - Evening (6 PM - 9 PM)

**Toggle Switch Styling**:
- Track width: 44px
- Track height: 24px
- Track color off: #334155
- Track color on: #8B5CF6
- Thumb: White circle, 20px diameter
- Smooth transition: 200ms

**Each Toggle Row**:
- Time slot label: Secondary text (#94A3B8), 16px, left-aligned
- Toggle switch: Right-aligned
- Padding: 12px vertical

**Save Button**:
- Label: "Save Recurring Patterns"
- Background: Purple (#8B5CF6)
- Color: White (#FAFAFA)
- Position: Bottom-right, sticky
- Padding: 12px 24px
- Border radius: 8px
- Margin-top: 32px

### Tab 3: Blocked Dates

**Header Section**:
- **Title**: "Blocked Date Ranges" - White text, 20px
- **Add Button**: "+ Block Dates" - Purple button, top-right

**Blocked Dates List**:
- Vertical list of cards
- Empty state if no blocked dates

**Blocked Date Card**:
- Background: #1E293B
- Border: 1px solid #334155
- Border radius: 12px
- Padding: 20px
- Margin-bottom: 16px

**Card Content**:
- **Date Range**: White text (#FAFAFA), 18px, bold
  - Format: "Jan 15, 2025 - Jan 20, 2025"
- **Reason**: Secondary text (#94A3B8), 16px, margin-top: 8px
  - Format: "Reason: {reason text}"
- **Delete Button**: Red text (#EF4444), "Delete" label, right-aligned at bottom

**Empty State** (when no blocked dates):
- Icon: Calendar with slash icon, 48px, secondary color (#64748B)
- Message: "No blocked dates" - Secondary text, 20px, centered
- Submessage: "Block date ranges when your chapel is unavailable" - Tertiary text, 14px

---

## 3. User Interactions

### Back Button
- **Label**: "← Back to Chapel"
- **Position**: Top-left of page
- **Trigger**: Click
- **Action**: Navigate to `/dashboard/owner/chapels/:id`

### Tab Navigation
- **Tab 1 Button**: "Calendar View"
  - **Trigger**: Click
  - **Action**: Show calendar view content, hide other tabs, update active state

- **Tab 2 Button**: "Recurring Patterns"
  - **Trigger**: Click
  - **Action**: Show recurring patterns content, hide other tabs, update active state

- **Tab 3 Button**: "Blocked Dates"
  - **Trigger**: Click
  - **Action**: Show blocked dates content, hide other tabs, update active state

### Calendar View Interactions

#### Month Navigation
- **Previous Month Button**: "←"
  - **Trigger**: Click
  - **Action**: Update calendar to show previous month, refetch availability data

- **Next Month Button**: "→"
  - **Trigger**: Click
  - **Action**: Update calendar to show next month, refetch availability data

#### Date Cell
- **Label**: Date number (1-31)
- **Position**: Calendar grid
- **Trigger**: Click on available date cell (not past dates)
- **Action**: Open date availability modal

#### Date Availability Modal
- **Modal Background**: Overlay with rgba(15, 23, 42, 0.8)
- **Modal Content**:
  - Background: #1E293B
  - Border: 1px solid #334155
  - Border radius: 16px
  - Max-width: 480px
  - Padding: 32px

**Modal Header**:
- Title: "Set Availability for {date}" - White text, 24px, bold
- Close button: "×" icon, top-right, secondary text

**Modal Body - Time Slot Toggles**:
- **Morning Toggle**:
  - Label: "Morning (9 AM - 12 PM)"
  - Toggle switch (same styling as recurring patterns)
  - Position: First row

- **Afternoon Toggle**:
  - Label: "Afternoon (1 PM - 5 PM)"
  - Toggle switch
  - Position: Second row

- **Evening Toggle**:
  - Label: "Evening (6 PM - 9 PM)"
  - Toggle switch
  - Position: Third row

**Time Slot Toggle Action**:
- **Trigger**: Click toggle switch
- **Action**: Update local state (on/off)

**Modal Footer Buttons**:
- **Cancel Button**:
  - Label: "Cancel"
  - Background: Transparent
  - Color: Secondary text (#94A3B8)
  - Border: 1px solid #334155
  - Trigger: Click
  - Action: Close modal without saving

- **Save Button**:
  - Label: "Save"
  - Background: Purple (#8B5CF6)
  - Color: White
  - Trigger: Click
  - Action: Call API to save availability, close modal, refresh calendar

### Recurring Patterns Interactions

#### Time Slot Toggle (per day)
- **Label**: Time slot name (Morning/Afternoon/Evening)
- **Type**: Toggle switch
- **Trigger**: Click toggle
- **Action**: Update local form state (isAvailable true/false)

#### Save Recurring Patterns Button
- **Label**: "Save Recurring Patterns"
- **Type**: Primary button
- **Position**: Bottom-right, below day cards
- **Trigger**: Click
- **Action**: Call bulk update API, show success toast, keep on same view

### Blocked Dates Interactions

#### Add Block Dates Button
- **Label**: "+ Block Dates"
- **Type**: Primary button
- **Position**: Top-right of blocked dates section
- **Trigger**: Click
- **Action**: Open block dates modal

#### Block Dates Modal
- **Modal Styling**: Same as date availability modal

**Modal Header**:
- Title: "Block Date Range" - White text, 24px, bold
- Close button: "×" icon

**Modal Body**:
- **Start Date Input**:
  - Label: "Start Date"
  - Type: Date picker
  - Background: #1E293B
  - Border: 1px solid #334155
  - Border radius: 8px
  - Padding: 12px 16px
  - Trigger: Select date
  - Action: Update form state

- **End Date Input**:
  - Label: "End Date"
  - Type: Date picker
  - Same styling as start date
  - Trigger: Select date
  - Action: Update form state, validate end >= start

- **Reason Input**:
  - Label: "Reason (Optional)"
  - Type: Text input
  - Placeholder: "e.g., Renovation, Private event"
  - Same styling as date inputs
  - Trigger: Type
  - Action: Update form state

**Modal Footer Buttons**:
- **Cancel Button**: Same styling as date modal cancel
- **Save Button**:
  - Label: "Block Dates"
  - Background: Purple (#8B5CF6)
  - Trigger: Click
  - Action: Validate dates, call create blocked date API, close modal, refresh list

#### Delete Blocked Date Button
- **Label**: "Delete"
- **Type**: Text button
- **Color**: Red (#EF4444)
- **Position**: Bottom-right of blocked date card
- **Trigger**: Click
- **Action**: Show confirmation dialog

#### Delete Confirmation Dialog
- **Modal**: Small modal (320px max-width)
- **Title**: "Delete Blocked Date?"
- **Message**: "This will remove the blocked date range: {date range}"
- **Buttons**:
  - **Cancel**: Secondary button
  - **Delete**: Red danger button
    - Trigger: Click
    - Action: Call delete API, close dialog, remove card from list

---

## 4. API Integration

### On Page Load

```typescript
// Get chapel details for header
const { data: chapel } = await apiClient.chapels.getChapel({
  params: { id: chapelId }
});

// Initial calendar data (current month)
const startDate = getFirstDayOfMonth(currentDate);
const endDate = getLastDayOfMonth(currentDate);

const { data: availabilityData } = await apiClient.chapelAvailability.getChapelAvailability({
  params: { chapelId },
  query: {
    startDate: formatDate(startDate), // "2025-01-01"
    endDate: formatDate(endDate)      // "2025-01-31"
  }
});

// Get recurring patterns for tab 2
const { data: recurringData } = await apiClient.recurringAvailability.getRecurringPatterns({
  params: { chapelId }
});

// Get blocked dates for tab 3
const { data: blockedData } = await apiClient.blockedDates.getBlockedDates({
  params: { chapelId },
  query: {
    startDate: formatDate(startDate),
    endDate: formatDate(addMonths(endDate, 12)) // Next 12 months
  }
});
```

### Calendar View - Month Navigation

```typescript
// On previous/next month click
const newStartDate = getFirstDayOfMonth(newMonthDate);
const newEndDate = getLastDayOfMonth(newMonthDate);

const { data: availabilityData } = await apiClient.chapelAvailability.getChapelAvailability({
  params: { chapelId },
  query: {
    startDate: formatDate(newStartDate),
    endDate: formatDate(newEndDate)
  }
});
```

### Calendar View - Save Date Availability

```typescript
// On save button click in date modal
// Check if availability already exists for this date/time slots
const existingAvailability = availabilityData.availability.find(
  a => a.date === selectedDate
);

if (existingAvailability) {
  // Update existing entries
  for (const timeSlot of ['morning', 'afternoon', 'evening']) {
    const existing = availabilityData.availability.find(
      a => a.date === selectedDate && a.timeSlot === timeSlot
    );

    if (existing) {
      await apiClient.chapelAvailability.updateAvailability({
        params: { id: existing.id },
        body: {
          availabilityType: formState[timeSlot] ? 'available' : 'unavailable'
        }
      });
    } else if (formState[timeSlot]) {
      // Create new availability entry
      await apiClient.chapelAvailability.createAvailability({
        body: {
          chapelId,
          date: selectedDate,
          timeSlot: timeSlot,
          availabilityType: 'available'
        }
      });
    }
  }
} else {
  // Bulk create for all enabled time slots
  const availabilities = Object.entries(formState)
    .filter(([_, isEnabled]) => isEnabled)
    .map(([timeSlot]) => ({
      date: selectedDate,
      timeSlot: timeSlot,
      availabilityType: 'available' as const,
      notes: ''
    }));

  if (availabilities.length > 0) {
    await apiClient.chapelAvailability.bulkCreateAvailability({
      params: { chapelId },
      body: { availabilities }
    });
  }
}

// Refresh calendar data
// Call getChapelAvailability again
```

### Recurring Patterns - Save

```typescript
// On "Save Recurring Patterns" button click
// Build patterns array from form state
const patterns = [];

for (const day of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
  for (const timeSlot of ['morning', 'afternoon', 'evening']) {
    patterns.push({
      dayOfWeek: day,
      timeSlot: timeSlot,
      isAvailable: formState[day][timeSlot] // true or false from toggles
    });
  }
}

const { data } = await apiClient.recurringAvailability.bulkUpdateRecurringPatterns({
  params: { chapelId },
  body: { patterns }
});

// Show success toast
// Stay on same tab
```

### Blocked Dates - Create

```typescript
// On save button click in block dates modal
const { data: newBlockedDate } = await apiClient.blockedDates.createBlockedDate({
  body: {
    chapelId,
    startDate: formState.startDate, // "2025-01-15"
    endDate: formState.endDate,     // "2025-01-20"
    reason: formState.reason || ''
  }
});

// Add to local state
// Close modal
```

### Blocked Dates - Delete

```typescript
// On confirm delete in confirmation dialog
await apiClient.blockedDates.deleteBlockedDate({
  params: { id: blockedDateId }
});

// Remove from local state
// Close dialog
```

---

## 5. States

### Loading State

**Initial Page Load**:
- Show full-page spinner centered
- Background: #0F172A
- Spinner: Purple (#8B5CF6), 48px

**Calendar Loading** (month navigation):
- Overlay on calendar grid with opacity 0.6
- Small spinner: 24px, centered on calendar
- Existing dates remain visible but dimmed

**Save Button Loading**:
- Button disabled
- Text changes to "Saving..."
- Small spinner icon (16px) to left of text
- Purple background remains

### Empty State

**Calendar with No Availability**:
- Calendar grid shows normal date cells
- No green dots or indicators
- All dates appear as default state

**Recurring Patterns with No Settings**:
- All toggles default to OFF position
- Helper text below save button: "Set weekly availability patterns to apply to all future dates" - Tertiary text (#64748B)

**No Blocked Dates**:
- Icon: Calendar with slash icon, 48px, secondary color (#64748B), centered
- Heading: "No blocked dates" - White text, 20px, centered, margin-top: 16px
- Subtext: "Block date ranges when your chapel is unavailable for bookings" - Secondary text, 16px, centered, margin-top: 8px
- Action button: "+ Block Dates" - Purple button, centered, margin-top: 24px

### Error State

**Page Load Error**:
- Replace page content with centered error card
- Background: #1E293B
- Border: 1px solid #EF4444
- Border radius: 12px
- Max-width: 480px
- Padding: 32px
- Centered on screen

**Error Card Content**:
- Icon: Alert triangle, 48px, red (#EF4444)
- Title: "Unable to Load Availability" - White text, 24px, bold, centered
- Message: "There was a problem loading the availability data. Please try again." - Secondary text, 16px, centered, margin-top: 16px
- Retry button: "Try Again" - Purple button, centered, margin-top: 24px
- Back button: "Back to Chapel" - Secondary button, centered, margin-top: 12px

**API Error Toast**:
- Position: Top-right of screen
- Background: rgba(239, 68, 68, 0.9)
- Color: White
- Padding: 16px 24px
- Border radius: 8px
- Max-width: 360px
- Auto-dismiss after 5 seconds
- Message format: "Error: {error message}"
- Close button: "×" icon, right side

**Validation Error** (in modals):
- Show error text below invalid input
- Color: Red (#EF4444)
- Font size: 14px
- Margin-top: 4px
- Examples:
  - "End date must be after start date"
  - "Please select a date"

### Success State

**Success Toast**:
- Position: Top-right of screen
- Background: rgba(16, 185, 129, 0.9)
- Color: White
- Padding: 16px 24px
- Border radius: 8px
- Max-width: 360px
- Auto-dismiss after 3 seconds
- Messages:
  - "Availability updated successfully"
  - "Recurring patterns saved"
  - "Blocked dates created"
  - "Blocked date deleted"

### Calendar Cell Visual States Summary

**Combined State Display** (multiple indicators can appear):
- **Past dates**: Opacity 0.4, not clickable
- **Today**: Purple dashed border (#8B5CF6)
- **Available time slots**: Green dot in top-right corner
- **Fully booked**: Red overlay (rgba(239, 68, 68, 0.2))
- **Blocked**: Red diagonal strikethrough line
- **Hover** (if clickable): Purple border (#8B5CF6, 2px solid)

---

## Reference to Master Spec

- **Colors**: Use color system from master spec section 1
- **Typography**: Use typography scale from master spec section 1
- **Spacing**: Use spacing scale from master spec (xs: 8px, sm: 16px, md: 24px, lg: 32px)
- **Dashboard Layout**: Use Template 2 from master spec section 2
- **Header**: Use Dashboard Layout header from master spec section 3.2
- **Sidebar**: Use Owner Dashboard sidebar links from master spec section 3.2
- **Button Styles**: Use button components from master spec section 5
- **Input Styles**: Use input components from master spec section 5
- **Modal Styles**: Use modal components from master spec section 5

---

**End of ManageAvailabilityPage Specification**
