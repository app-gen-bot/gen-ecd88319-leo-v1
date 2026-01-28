# Frontend Interaction Specification Template

## Overview

This template provides the standard structure for Frontend Interaction Specifications. Use this as a reference when generating or validating specifications.

---

# Frontend Interaction Specification: [Application Name]

*Generated from [PRD Name/Version]*

## Overview

[Brief description of the application's purpose and primary user value]

## Global Navigation

### Application Layout
- **Header** ([height]): [Components in header]
- **Sidebar** ([width]): [Components in sidebar]  
- **Main Content**: [Primary content area]
- **Footer** (if applicable): [Footer contents]
- **Responsive**: [Mobile/tablet behavior]

### Primary Navigation
- **Location**: [Where it appears]
- **Items**:
  - [Nav Item] → [Destination]
  - [Nav Item] → [Destination]
- **Mobile**: [Hamburger menu, bottom tabs, etc.]

### User Menu
- **Location**: [Typically top-right]
- **Trigger**: Click [avatar/username]
- **Menu Items**:
  - Profile → [/profile or modal]
  - Settings → [/settings]
  - ---
  - Sign Out → [Logout flow]

### Global Search
- **Location**: [Header center, nav bar, etc.]
- **Trigger**: [Click search icon, Cmd/Ctrl+K]
- **Behavior**: [Inline, modal, page]
- **Features**: [Real-time, filters, categories]

## Complete Navigation & Interaction Map

### Route Inventory
*List EVERY route in your application, organized by access level and purpose*

#### Public Routes
```
/                   → Landing page
/login              → Authentication page
/register           → New user registration
/forgot-password    → Password recovery
/reset-password     → Password reset (with token)
/about              → About page (if applicable)
/contact            → Contact page (if applicable)
/privacy            → Privacy policy
/terms              → Terms of service
```

#### Protected Routes (Authentication Required)
```
/dashboard          → Main user dashboard
/profile            → User profile page
/settings           → User settings
  /settings/profile → Profile settings
  /settings/notifications → Notification preferences
  /settings/security → Security settings
/[feature-routes]   → List all feature-specific routes
```

#### Utility Routes
```
/404                → Not found page
/500                → Server error page
/maintenance        → Maintenance mode (if applicable)
```

### Interactive Element Catalog
*For EVERY page, document ALL clickable/interactive elements*

#### Global Elements (Present on Multiple Pages)
**Header Navigation**
- Logo → / (home/dashboard based on auth state)
- Nav Item 1 → [exact destination]
- Nav Item 2 → [exact destination]
- Search Icon → Opens search modal
- Notification Bell (if applicable) → Opens dropdown
  - Notification Item → /notifications/[id]
  - "View All" → /notifications
  - "Mark All Read" → Action: clear all
- User Avatar → Opens dropdown
  - "Profile" → /profile
  - "Settings" → /settings
  - "Sign Out" → Action: logout → /login

**Footer (if applicable)**
- Link 1 → [destination]
- Link 2 → [destination]
- Social Icons → [external URLs]

#### Page-Specific Interactions
*Example format - replicate for each page:*

**Dashboard Page (/dashboard)**
- "Create New [Item]" button → Opens modal OR /[items]/new
- [Item] Card → /[items]/[id]
- [Item] Card Options (three dots) → Opens dropdown
  - "Edit" → /[items]/[id]/edit OR opens modal
  - "Delete" → Opens confirmation modal
  - "Share" → Opens share modal
- Filter Dropdown → Updates list view
- Sort Options → Updates list order
- Pagination → Updates current page

### Modal & Dialog Actions
*Document every modal's interactive elements*

**Delete Confirmation Modal**
- "Cancel" → Close modal, no action
- "Delete" → Execute deletion → Return to list/dashboard

**Create/Edit Modal**
- "Cancel" → Close modal, discard changes
- "Save" → Validate → Save → Close modal → Navigate to item OR refresh list

### Navigation Validation Checklist
- [ ] Every route listed has a corresponding page implementation
- [ ] Every interactive element has a defined destination or action
- [ ] No placeholder destinations (e.g., "#", "javascript:void(0)")
- [ ] All dropdown/menu items are accounted for
- [ ] Modal actions are fully specified
- [ ] 404 page exists for undefined routes
- [ ] No interactive element is left without definition

## Pages

### Page: Home (/)

#### Purpose
[What this page is for, who sees it]

#### Components

**[HeroSection]**
- **Type**: Banner/Hero
- **Content**: [Headline, subtext, CTA]
- **Actions**: 
  - [Primary CTA] → [Destination]
  - [Secondary CTA] → [Destination]

**[FeatureList]**
- **Type**: Grid/List
- **Items**: [What's displayed]
- **Item Actions**:
  - Click → [Detail view]
  - Hover → [Preview]
- **Empty State**: "[No items message]"
- **Loading**: [Skeleton/spinner]

### Page: Authentication (/login)

#### Purpose
Authenticate users and provide account access

#### Components

**LoginForm**
- **Fields**:
  - email: Email input (required, valid email)
  - password: Password input (required, min 8 chars)
  - remember_me: Checkbox (optional)
- **Actions**:
  - Sign In: Validate → Authenticate → [Redirect to app]
  - Forgot Password: → /forgot-password
  - Create Account: → /register
- **Validation**:
  - Email format required
  - Show errors inline below fields
- **Error States**:
  - Invalid credentials: "Email or password incorrect"
  - Account locked: "Too many attempts. Try again in X minutes"
  - Network error: "Connection failed. Please try again"

**SocialLogin** (if applicable)
- **Providers**: [Google, GitHub, etc.]
- **Flow**: Click → OAuth → Return → [App home]

### Page: User Dashboard (/dashboard)

#### Purpose
[User's primary workspace]

#### Components

**StatsOverview**
- **Type**: Card grid
- **Metrics**: [Active items, recent activity, etc.]
- **Refresh**: [Auto-refresh interval]
- **Click**: → [Detailed view]

**RecentActivity**
- **Type**: Timeline/List
- **Items**: [Last X activities]
- **Actions**: 
  - View Details → [Item page]
  - Quick Action → [Inline action]
- **Load More**: [Pagination/infinite scroll]

### Page: Settings (/settings)

#### Purpose
User configuration and preferences

#### Sections

**ProfileSettings**
- **Fields**:
  - name: Text input
  - email: Email input
  - avatar: Image upload (5MB max)
  - bio: Textarea (optional)
- **Actions**:
  - Save: Validate → Update → Success message
  - Cancel: Discard → Back
  - Delete Account: → Confirmation flow

**NotificationSettings**
- **Options**:
  - Email notifications: Toggle
  - Push notifications: Toggle
  - Notification types: Checkboxes
- **Save**: Auto-save or explicit button

**SecuritySettings**
- **Actions**:
  - Change Password → Modal/page
  - Two-Factor Auth → Enable flow
  - Active Sessions → List with revoke

## User Flows

### Flow: First-Time User Onboarding
1. User lands on homepage
2. Clicks "Get Started"
3. Redirected to /register
4. Fills registration form
5. Email verification (if required)
6. Welcome screen with tour
7. Guided to create first [item]
8. Success → Dashboard

### Flow: Create New [Entity]
1. User clicks "New [Entity]" button
2. Modal/page opens with form
3. User fills required fields
4. Optional fields available
5. Click "Create"
6. If valid → Success message → Redirect to [entity]
7. If invalid → Show errors inline → Fix → Retry

### Flow: Search and Filter
1. User clicks search bar or uses Cmd+K
2. Search modal opens
3. User types query
4. Results appear in real-time
5. User can:
   - Click result → Navigate to item
   - Switch tabs → Filter by type
   - Clear search → Reset
   - ESC → Close modal

### Flow: Delete [Entity]
1. User hovers/selects [entity]
2. Clicks delete icon/button
3. Confirmation modal appears
4. Shows impact of deletion
5. User confirms
6. Entity deleted → Success message
7. UI updates to reflect deletion

## State Management

### User Presence
- Updates every [30] seconds
- States: Online, Away, Offline
- Visible in: [User lists, profiles]

### Session Management
- Session duration: [7 days]
- Remember me: [30 days]
- Timeout warning: [5 min before]
- Auto-logout: Clear state → /login

### UI Persistence
- Collapsed panels: Remember per user
- Sort preferences: Store locally
- Filter choices: Session only
- Theme selection: Account setting

### Real-time Updates
- New data: [WebSocket/polling]
- Notifications: Instant delivery
- Presence: Live updates
- Collaborative: Conflict resolution

## Error Handling

### Network Errors
- **Display**: Toast/inline message
- **Message**: "Connection lost. Retrying..."
- **Actions**: Auto-retry with backoff
- **Recovery**: Manual retry button

### Validation Errors
- **Display**: Below form fields
- **Format**: Red text, icon
- **Message**: Specific guidance
- **Clear**: On field edit

### Permission Errors
- **Display**: Modal/page
- **Message**: "You don't have permission to [action]"
- **Actions**: 
  - Request Access
  - Go Back
  - Contact Admin

### Not Found Errors
- **Display**: Full page
- **Message**: "Page not found"
- **Actions**:
  - Go Home
  - Search
  - Report Issue

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in menus/lists
- ESC to close modals/menus
- Keyboard shortcuts documented

### Screen Reader Support
- Semantic HTML structure
- ARIA labels on icons
- Form labels associated
- Error announcements
- Loading state announcements

### Visual Accessibility
- Focus indicators visible
- Color not sole indicator
- Contrast ratios met
- Text resizable
- Animations optional

## Responsive Behavior

### Mobile (< 768px)
- Navigation: [Hamburger/bottom tabs]
- Sidebar: Slides in/out
- Tables: Card view
- Modals: Full screen
- Touch: Swipe gestures

### Tablet (768px - 1024px)
- Navigation: Condensed
- Sidebar: Collapsible
- Layout: Adjusted grid
- Touch: Maintained

### Desktop (> 1024px)
- Full featured interface
- Sidebar always visible
- Multi-column layouts
- Hover states active

## Validation Checklist

✓ **Authentication**
- [x] Login page exists
- [x] Logout option accessible
- [x] Session management defined

✓ **Navigation**
- [x] All features reachable
- [x] Mobile navigation specified
- [x] Breadcrumbs where needed

✓ **CRUD Operations**
- [x] Create flows complete
- [x] Read/list views defined
- [x] Update mechanisms clear
- [x] Delete confirmations present

✓ **Error Handling**
- [x] Network errors handled
- [x] Validation errors shown
- [x] Permission errors graceful
- [x] Not found pages exist

✓ **States**
- [x] Empty states defined
- [x] Loading states shown
- [x] Error states handled
- [x] Success feedback given

---

## Notes

[Any additional context, assumptions, or clarifications]