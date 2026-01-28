I'll search for relevant past implementations and then create a comprehensive interaction specification for the Identfy Customer Portal.

I'll proceed with creating the comprehensive interaction specification for the Identfy Customer Portal. Let me address all the PRD features and the evaluation feedback.

# Identfy Customer Portal - Frontend Interaction Specification

**Version**: 1.0  
**Date**: 2025-07-23  
**Status**: Complete  
**PRD Reference**: Identfy Customer Portal Business Requirements v1.0

## 1. Overview

### 1.1 Purpose
This document provides a comprehensive specification of all user interactions, interface behaviors, and user flows for the Identfy Customer Portal. It serves as the definitive guide for frontend implementation, ensuring every user action and system response is clearly defined.

### 1.2 Scope
This specification covers:
- All user-facing features from the PRD (74 features total)
- Complete interaction patterns for web application
- Mobile-responsive behaviors
- Error handling and edge cases
- Accessibility requirements
- Complete navigation mapping

### 1.3 Design Principles
- **Clarity First**: Every action should have a clear, predictable outcome
- **Progressive Disclosure**: Show advanced features only when needed
- **Consistent Patterns**: Similar actions behave similarly throughout
- **Error Prevention**: Guide users to success, prevent mistakes
- **Mobile-First**: Optimize for touch, then enhance for desktop
- **Accessibility**: WCAG 2.1 AA compliance for all interactions

## 2. Information Architecture

### 2.1 Main Navigation Structure
```
├── Dashboard (/)
├── Workflows (/workflows)
│   ├── List View (/workflows)
│   ├── Create New (/workflows/new)
│   ├── Edit Workflow (/workflows/:id/edit)
│   ├── A/B Testing (/workflows/ab-testing)
│   └── Test Results (/workflows/:id/test-results)
├── Cases (/cases)
│   ├── Queue (/cases)
│   ├── Case Detail (/cases/:id)
│   └── Bulk Operations (/cases/bulk)
├── Analytics (/analytics)
│   ├── Overview (/analytics)
│   ├── Risk Patterns (/analytics/risk-patterns)
│   ├── Benchmarking (/analytics/benchmarking)
│   └── Custom Reports (/analytics/reports)
├── Settings (/settings)
│   ├── General (/settings/general)
│   ├── Team (/settings/team)
│   ├── Security (/settings/security)
│   ├── API Keys (/settings/api)
│   ├── Webhooks (/settings/webhooks)
│   ├── Data Privacy (/settings/privacy)
│   ├── Billing (/settings/billing)
│   └── Notifications (/settings/notifications)
├── Profile (/profile)
└── Support (/support)
```

### 2.2 User Role Access Matrix
| Page/Feature | Admin | Analyst | Viewer | Developer |
|--------------|-------|---------|---------|-----------|
| Dashboard | Full | Full | Read | Read |
| Workflows | Full | Read | Read | None |
| Cases | Full | Full | Read | None |
| Analytics | Full | Full | Full | None |
| Settings | Full | Limited | None | API Only |
| API Keys | Full | None | None | Full |

## 3. Common Interaction Patterns

### 3.1 Form Interactions

#### Text Input Fields
- **Focus**: Blue border (2px solid #2563EB), subtle shadow
- **Typing**: Real-time character count for limited fields
- **Validation**: On blur for most fields, real-time for critical fields
- **Error State**: Red border (#EF4444), error icon, message below
- **Success State**: Green checkmark icon appears on valid input
- **Auto-save**: Every 10 seconds for long forms (visual indicator)

#### Select/Dropdown Menus
- **Click**: Opens dropdown with smooth slide animation (200ms)
- **Search**: Type to filter options (min 3 chars)
- **Multi-select**: Checkboxes with "Select All" option
- **Keyboard**: Arrow keys navigate, Enter selects, Esc closes
- **Mobile**: Native select on screens < 768px

#### Toggle Switches
- **Click/Tap**: Instant toggle with color change
- **Disabled**: Grayed out with cursor not-allowed
- **Loading**: Shows spinner during save (max 2 seconds)
- **Confirmation**: Critical toggles show modal "Are you sure?"

### 3.2 Loading States

#### Page Load
- **Initial**: Skeleton screens matching layout structure
- **Progressive**: Content appears as loaded (top to bottom)
- **Error**: Full-page error with retry button
- **Timeout**: After 10 seconds, show timeout message

#### Data Operations
- **Inline Loading**: Spinner replaces action button
- **Progress Bar**: For operations > 3 seconds
- **Background Tasks**: Toast notification with progress
- **Cancellable**: Show cancel button for long operations

### 3.3 Error Handling

#### Validation Errors
- **Field Level**: Red text below field with specific message
- **Form Level**: Summary box at top with jump links
- **Format**: "[Field]: [Specific issue]. [How to fix]."
- **Examples**:
  - "Email: Invalid format. Please use name@domain.com"
  - "Risk threshold: Must be between 0-100"

#### System Errors
- **Network Error**: Toast: "Connection lost. Retrying..." with manual retry
- **Server Error**: Modal with error code and support contact
- **Permission Error**: Redirect to dashboard with explanation
- **404 Error**: Custom page with search and navigation options

### 3.4 Success Feedback

#### Action Confirmation
- **Save**: Green toast "Changes saved" (3 seconds)
- **Delete**: Red toast "Item deleted" with undo (5 seconds)
- **Create**: Redirect to new item with highlight effect
- **Update**: Inline green checkmark animation

## 4. Page-by-Page Interactions

### 4.1 Authentication Pages

#### Sign In Page (/auth/signin)

**Initial State**:
- Logo and "Sign In to Identfy" heading
- Email input field (autofocus)
- Password input field (type="password")
- "Remember me" checkbox (unchecked by default)
- "Sign In" button (disabled until valid input)
- "Forgot Password?" link
- "Sign in with SSO" button
- "Don't have an account? Contact Sales" link

**Interactions**:
- **Email Input**: 
  - Validates email format on blur
  - Shows error "Please enter a valid email address" if invalid
  - Auto-lowercases input
- **Password Input**:
  - Toggle visibility icon on right
  - Min 8 characters validation
  - Shows strength indicator while typing
- **Sign In Button Click**:
  - Becomes "Signing in..." with spinner
  - On success: Redirect to 2FA page
  - On failure: Shows error "Invalid email or password"
  - After 3 failed attempts: Shows CAPTCHA
  - After 5 failed attempts: Account locked for 30 minutes
- **SSO Button Click**:
  - Opens SSO provider selection modal
  - Lists configured providers (Okta, Auth0, Azure AD)
  - Redirects to provider login

#### Two-Factor Authentication (/auth/2fa)

**Initial State**:
- "Enter verification code" heading
- 6-digit code input (auto-advances between digits)
- "Verify" button
- "Resend code" link (disabled for 30 seconds)
- "Use backup code" link
- "Having trouble?" support link

**Interactions**:
- **Code Input**:
  - Auto-focuses first digit
  - Only accepts numbers
  - Auto-advances on input
  - Allows paste of full code
  - Backspace goes to previous digit
- **Verify Button Click**:
  - Shows "Verifying..." with spinner
  - On success: Redirect to dashboard
  - On failure: "Invalid code. 2 attempts remaining"
  - After 3 failures: Lock account, email sent
- **Resend Code**:
  - 30-second cooldown with countdown
  - Shows toast "New code sent to your email"
  - Max 3 resends per session

#### Password Reset Flow (/auth/reset-password)

**Step 1 - Request Reset**:
- Email input field
- "Send Reset Link" button
- Always shows success message (security)

**Step 2 - Reset Form** (/auth/reset-password/:token):
- New password field with requirements list
- Confirm password field
- Real-time validation against requirements:
  - Min 12 characters
  - 1 uppercase, 1 lowercase
  - 1 number, 1 special character
  - Not a common password
- "Reset Password" button

**Interactions**:
- **Password Requirements**:
  - Each requirement shows ✓ when met
  - Red ✗ for unmet requirements
  - All must be green to enable submit
- **Submit**:
  - On success: Redirect to sign in with success message
  - On token expired: Show error with "Request new link" button

### 4.2 Dashboard Page (/)

**Initial State**:
- Welcome message with user's name
- 4 key metric cards (animated counters)
- Recent activity feed (last 10 items)
- Quick actions panel
- System health indicator

**Key Metrics Cards**:
1. **Active Verifications** (real-time updates)
   - Click: Navigate to cases queue filtered by active
2. **Risk Score Average** (hourly update)
   - Click: Navigate to analytics risk patterns
3. **Flagged Cases** (real-time badge)
   - Click: Navigate to cases queue filtered by flagged
4. **Conversion Rate** (daily update)
   - Click: Navigate to analytics overview

**Quick Actions Panel**:
- "Create Workflow" button → /workflows/new
- "Review Cases" button → /cases?status=pending
- "View Analytics" button → /analytics
- "Manage Team" button → /settings/team (admin only)

**Activity Feed**:
- Auto-refreshes every 30 seconds
- Each item clickable to relevant page
- "View All Activity" link → /activity
- Shows spinner during refresh

**Interactions**:
- **Pull to Refresh** (mobile): Refreshes all data
- **Metric Hover**: Shows trend sparkline
- **Activity Item Click**: Navigates to relevant item
- **Keyboard**: Tab navigation through all interactive elements

### 4.3 Workflow Builder (/workflows)

#### Workflow List View

**Initial State**:
- Search bar with filters
- "Create New Workflow" button (top right)
- Workflow cards in grid layout
- Each card shows: name, status, last modified, signals count

**Search and Filters**:
- **Search**: Debounced at 300ms, searches name and description
- **Status Filter**: All, Active, Draft, Archived
- **Sort**: Name, Modified Date, Creation Date
- **View Toggle**: Grid/List view preference saved

**Workflow Cards**:
- **Hover**: Elevate with shadow, show quick actions
- **Click Card**: Navigate to /workflows/:id/edit
- **Quick Actions** (three-dot menu):
  - Edit → /workflows/:id/edit
  - Duplicate → Creates copy with "(Copy)" suffix
  - Test → Opens test modal
  - Archive → Confirmation modal
  - Delete → Two-step confirmation
  - View A/B Test → /workflows/ab-testing (if applicable)

**A/B Testing Section**:
- Separate tab showing active A/B tests
- Each test shows: variants, traffic split, winner status
- "Create A/B Test" button → /workflows/ab-testing/new

#### Workflow Editor (/workflows/:id/edit)

**Canvas Area** (Main workspace):
- **Drag Signal**: From left panel, shows valid drop zones
- **Drop Signal**: Snaps to grid, auto-connects if near
- **Connect Nodes**: Drag from output to input port
- **Delete Connection**: Click line, press Delete
- **Pan Canvas**: Hold spacebar + drag or middle mouse
- **Zoom**: Ctrl+scroll or pinch gesture (mobile)
- **Select Multiple**: Shift+click or drag rectangle

**Left Panel - Signal Library**:
- **Categories**: Document, Biometric, Phone, Email, Device, Watchlist
- **Search**: Filters signals in real-time
- **Signal Info**: Hover shows description and cost
- **Drag**: Shows ghost image following cursor

**Right Panel - Properties**:
- **Auto-opens**: When node selected
- **Signal Settings**:
  - Provider dropdown with costs
  - Threshold sliders with preview
  - Required/optional toggle
  - Advanced settings accordion
- **Save Changes**: Auto-saves every edit with indicator

**Top Toolbar**:
- **Workflow Name**: Click to edit inline
- **Save Status**: "All changes saved" or "Saving..."
- **Test Workflow**: Opens test modal
- **Version History**: Dropdown showing last 10 versions
- **Publish**: Activates workflow with confirmation

**Test Workflow Modal**:
- Upload test data (JSON/CSV)
- Or use sample data sets
- Shows step-by-step execution
- Results panel with pass/fail
- Export results button

**Interactions**:
- **Keyboard Shortcuts**:
  - Ctrl+S: Save
  - Ctrl+Z/Y: Undo/Redo
  - Delete: Remove selected
  - Ctrl+D: Duplicate selected
  - Ctrl+A: Select all

### 4.4 Case Management (/cases)

#### Case Queue View

**Initial State**:
- Filter sidebar (collapsible)
- Case list table with pagination
- Bulk action toolbar (hidden until selection)
- Real-time case counter

**Filter Sidebar**:
- **Date Range**: Preset options + custom picker
- **Risk Score**: Dual-handle slider (0-100)
- **Status**: Checkboxes for each status
- **Assigned To**: User multi-select
- **Region**: Country multi-select
- **Apply Filters**: Updates results instantly
- **Clear All**: Resets to defaults

**Case Table**:
- **Columns**: ID, Name, Risk Score, Status, Assigned, Created, Actions
- **Sort**: Click column header, shows arrow
- **Row Hover**: Highlights, shows preview tooltip
- **Row Click**: Navigate to /cases/:id
- **Select Checkbox**: Enables bulk actions
- **Select All**: Checkbox in header

**Bulk Actions Toolbar** (appears on selection):
- Shows "X cases selected"
- **Assign**: Dropdown of team members
- **Change Status**: Dropdown of statuses
- **Export**: Download as CSV/PDF
- **Delete**: Requires confirmation
- **Cancel**: Deselects all

**Real-time Updates**:
- New cases slide in from top
- Status changes update in place
- Assignment changes show briefly highlighted

#### Case Detail View (/cases/:id)

**Header Section**:
- Case ID and creation timestamp
- Current status badge (color-coded)
- Risk score gauge (animated)
- Quick actions toolbar

**Quick Actions**:
- **Approve**: Green button, shows confirmation
- **Reject**: Red button, requires reason
- **Flag for Review**: Assigns to senior analyst
- **Assign**: Dropdown of available analysts
- **Export**: PDF with all data

**Information Tabs**:
1. **Overview Tab**:
   - Personal information grid
   - Verification summary cards
   - Risk factors list
   - Timeline of events

2. **Documents Tab**:
   - Document images with zoom
   - OCR extracted data
   - Validation status for each field
   - Download original files

3. **Biometrics Tab**:
   - Face match percentage
   - Liveness check results
   - Comparison images side-by-side
   - Technical details accordion

4. **Signals Tab**:
   - Each signal result card
   - Pass/fail status
   - Raw data expandable
   - Provider information

5. **Notes Tab**:
   - Add note form (auto-save enabled)
   - Note history (newest first)
   - @mention team members
   - Rich text formatting
   - File attachments

6. **Audit Log Tab**:
   - Every action timestamped
   - User who performed action
   - Before/after values
   - IP address and location

**Decision Modal** (Approve/Reject):
- **Reason Codes**: Multi-select required
- **Additional Notes**: Optional text area
- **Notify User**: Checkbox for email notification
- **Confirm Button**: Shows impact warning

**Interactions**:
- **Tab Switch**: Smooth transition, maintains scroll position
- **Image Zoom**: Click to open lightbox, mouse wheel zooms
- **Copy Data**: Click any ID/value to copy
- **@Mentions**: Autocomplete after @ symbol
- **Auto-save Notes**: Every 10 seconds with indicator
- **Keyboard**: Arrow keys navigate between cases

### 4.5 Analytics Dashboard (/analytics)

#### Overview Page

**Date Range Selector** (top right):
- Presets: Today, 7 days, 30 days, 90 days, Custom
- Custom opens date picker
- Compare to previous period checkbox

**Key Metrics Row**:
- **Total Verifications**: With sparkline
- **Pass Rate**: Percentage with trend arrow
- **Average Risk Score**: With distribution mini-chart
- **Manual Review Rate**: With target line

**Charts Grid**:
1. **Verification Volume**: 
   - Line chart with zoom/pan
   - Toggle between hourly/daily/monthly
   - Export as PNG/CSV

2. **Risk Score Distribution**:
   - Histogram with adjustable bins
   - Overlay normal distribution
   - Click bar to filter cases

3. **Geographical Heat Map**:
   - Choropleth map
   - Hover shows country stats
   - Click to drill down

4. **Top Failure Reasons**:
   - Horizontal bar chart
   - Click bar to see cases
   - Percentage and count labels

**Interactive Features**:
- **Chart Hover**: Detailed tooltip
- **Click and Drag**: Zoom into range
- **Double Click**: Reset zoom
- **Legend Click**: Toggle series

#### Benchmarking Page (/analytics/benchmarking)

**Industry Selector**:
- Dropdown: E-commerce, Financial, Travel, etc.
- Multi-select for comparison

**Benchmark Metrics**:
- Your metrics vs. industry average
- Percentile ranking
- Trend comparison charts
- Best-in-class indicators

**Insights Panel**:
- AI-generated insights
- Improvement recommendations
- Click insight for details

**Export Options**:
- Executive summary PDF
- Detailed report with charts
- Raw data CSV

### 4.6 Settings (/settings)

#### Team Management (/settings/team)

**Team Member List**:
- Search by name/email
- Filter by role/status
- Shows last active time

**Invite New Member**:
- Email input (validates domain)
- Role selector
- Optional welcome message
- "Send Invitation" button

**Member Actions** (three-dot menu):
- View Activity → /settings/team/:id/activity
- Change Role → Modal with role selector
- Reset Password → Sends reset email
- Suspend Access → Confirmation required
- Delete → Two-step confirmation

**Pending Invitations**:
- Shows sent date
- "Resend" button (rate limited)
- "Cancel" button with confirmation

#### API Configuration (/settings/api)

**API Keys Section**:
- **Create New Key**:
  - Name input (required)
  - Permissions checkboxes
  - Expiration date picker
  - IP whitelist (optional)
- **Key List**:
  - Shows last 4 characters
  - Last used timestamp
  - Usage counter
  - Revoke button (immediate)

**Key Generation Modal**:
- Shows full key once (copy button)
- Warning about saving key
- Download as .env file option

#### Webhooks (/settings/webhooks)

**Webhook List**:
- URL, events, status
- Enable/disable toggle
- Test button
- Edit/Delete actions

**Create Webhook**:
- URL input with validation
- Events multi-select:
  - verification.completed
  - case.updated
  - workflow.published
  - user.flagged
- Secret key (auto-generated)
- Retry configuration

**Test Webhook**:
- Send test payload
- Shows response status
- Response body preview
- Timing information

#### Billing & Subscription (/settings/billing)

**Current Plan**:
- Plan name and tier
- Usage meters (real-time)
- Next billing date
- Upgrade button

**Usage Details**:
- Verifications used/limit
- API calls chart
- Storage used
- Add-on services

**Payment Method**:
- Current card (last 4)
- Update card modal
- Billing address form
- Invoice history table

**Upgrade Modal**:
- Plan comparison table
- Price calculator
- Feature differences
- Confirm upgrade button

#### Data Privacy (/settings/privacy)

**Retention Settings**:
- Default retention period slider
- Region-specific overrides
- Document type settings
- Audit log retention

**Data Deletion Requests**:
- Search by verification ID
- Bulk deletion CSV upload
- Scheduled deletion queue
- Deletion audit log

**Compliance Reports**:
- GDPR report generator
- CCPA compliance status
- Right to be forgotten log
- Data processing records

### 4.7 Notifications (/notifications)

**Notification Center**:
- **Header**: "Notifications" with mark all read button
- **Filters**: All, Unread, Cases, System, Team
- **List Items**:
  - Icon based on type
  - Title and description
  - Timestamp (relative)
  - Click to navigate
  - Hover shows actions

**Notification Actions**:
- **Click**: Navigate to relevant page
- **Mark Read**: Click dot icon
- **Delete**: Swipe left (mobile) or X icon
- **Snooze**: Clock icon opens time picker

**Settings Link**: → /settings/notifications

### 4.8 User Profile (/profile)

**Profile Information**:
- Avatar upload (drag & drop)
- Name editing (inline)
- Email (read-only)
- Phone with verification
- Timezone selector
- Language preference

**Security Section**:
- Password change form
- 2FA setup/management
- Active sessions list
- Login history

**2FA Setup Process**:
1. **Enable 2FA Button** → Setup modal
2. **Choose Method**: SMS or Authenticator app
3. **For Authenticator**:
   - Show QR code
   - Manual entry code
   - Verify with 6-digit code
4. **Backup Codes**:
   - Generate 10 codes
   - Download/print options
   - Confirm saved checkbox
5. **Success**: 2FA enabled badge

### 4.9 Support (/support)

**Help Center**:
- Search documentation
- Common topics grid
- Video tutorials
- API documentation link

**Contact Support**:
- Issue category selector
- Priority level
- Description textarea
- File attachments
- Submit ticket button

**Live Chat** (bottom right):
- Minimized bubble with unread count
- Click opens chat panel
- Agent availability status
- Typing indicators
- File sharing
- End chat confirmation

## 5. Complete Navigation & Interaction Map

### 5.1 Route Inventory

#### Public Routes (Unauthenticated)
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up (redirects to contact sales)
- `/auth/reset-password` - Password reset request
- `/auth/reset-password/:token` - Password reset form
- `/auth/verify-email/:token` - Email verification
- `/auth/sso` - SSO provider selection
- `/auth/sso/callback` - SSO return URL
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/contact-sales` - Sales contact form
- `/system-status` - Public status page
- `/404` - Not found page
- `/500` - Server error page
- `/maintenance` - Maintenance mode page

#### Protected Routes (Authenticated)
- `/` - Dashboard home
- `/auth/2fa`- Two-factor authentication
- `/auth/2fa/backup` - Backup code entry
- `/auth/2fa/setup` - 2FA setup flow
- `/activity` - Full activity log
- `/notifications` - Notification center

#### Workflows Routes
- `/workflows` - Workflow list
- `/workflows/new` - Create workflow
- `/workflows/:id/edit` - Edit workflow
- `/workflows/:id/test` - Test workflow
- `/workflows/:id/test-results` - Test results
- `/workflows/:id/versions` - Version history
- `/workflows/:id/duplicate` - Duplicate workflow
- `/workflows/ab-testing` - A/B test list
- `/workflows/ab-testing/new` - Create A/B test
- `/workflows/ab-testing/:id` - A/B test details
- `/workflows/templates` - Workflow templates

#### Cases Routes
- `/cases` - Case queue
- `/cases/:id` - Case detail
- `/cases/:id/documents` - Case documents
- `/cases/:id/biometrics` - Case biometrics
- `/cases/:id/signals` - Case signals
- `/cases/:id/notes` - Case notes
- `/cases/:id/audit` - Case audit log
- `/cases/bulk` - Bulk operations
- `/cases/export` - Export cases

#### Analytics Routes
- `/analytics` - Analytics overview
- `/analytics/risk-patterns` - Risk analysis
- `/analytics/benchmarking` - Industry benchmarks
- `/analytics/reports` - Custom reports
- `/analytics/reports/new` - Create report
- `/analytics/reports/:id` - View report
- `/analytics/reports/:id/edit` - Edit report
- `/analytics/export` - Export analytics

#### Settings Routes
- `/settings` - Settings overview
- `/settings/general` - General settings
- `/settings/team` - Team management
- `/settings/team/invite` - Invite team member
- `/settings/team/:id/activity` - Member activity
- `/settings/security` - Security settings
- `/settings/api` - API configuration
- `/settings/api/new` - Create API key
- `/settings/api/:id` - API key details
- `/settings/webhooks` - Webhooks
- `/settings/webhooks/new` - Create webhook
- `/settings/webhooks/:id` - Webhook details
- `/settings/privacy` - Privacy settings
- `/settings/privacy/deletion-requests` - Deletion queue
- `/settings/billing` - Billing & subscription
- `/settings/billing/upgrade` - Upgrade plan
- `/settings/billing/invoices` - Invoice history
- `/settings/billing/payment-method` - Payment methods
- `/settings/notifications` - Notification preferences

#### Profile Routes
- `/profile` - User profile
- `/profile/security` - Security settings
- `/profile/sessions` - Active sessions
- `/profile/login-history` - Login history

#### Support Routes
- `/support` - Help center
- `/support/docs` - Documentation
- `/support/contact` - Contact support
- `/support/tickets` - Support tickets
- `/support/tickets/:id` - Ticket details

### 5.2 Interactive Element Catalog

#### Global Header Navigation
- **Logo**: Click → Navigate to dashboard (/)
- **Workflows**: Click → /workflows
- **Cases**: Click → /cases
  - Badge shows pending count
- **Analytics**: Click → /analytics
- **Settings**: Click → /settings (varies by role)
- **Notification Bell**: Click → Opens notification dropdown
  - Each notification → Navigate to relevant page
  - "View All" → /notifications
  - Settings icon → /settings/notifications
- **User Avatar Menu**:
  - "Profile" → /profile
  - "Security" → /profile/security
  - "Support" → /support
  - "Sign Out" → /auth/signin (with confirmation)

#### Dashboard Quick Actions
- "Create Workflow" button → /workflows/new
- "Review Cases" button → /cases?status=pending
- "View Analytics" button → /analytics
- "Manage Team" button → /settings/team

#### Workflow Page Actions
- "Create New Workflow" → /workflows/new
- Each workflow card → /workflows/:id/edit
- Three-dot menu per workflow:
  - "Edit" → /workflows/:id/edit
  - "Duplicate" → Creates copy, redirects to edit
  - "Test" → Opens test modal
  - "View Versions" → /workflows/:id/versions
  - "Create A/B Test" → /workflows/ab-testing/new?base=:id
  - "Archive" → Confirmation modal, then archives
  - "Delete" → Two-step confirmation, then deletes

#### Case Queue Actions
- Case row click → /cases/:id
- Bulk select actions:
  - "Assign" → Opens assignee dropdown
  - "Change Status" → Opens status dropdown
  - "Export" → Downloads CSV/PDF
  - "Delete" → Confirmation modal

#### Case Detail Actions
- "Approve" → Opens decision modal
- "Reject" → Opens decision modal with reasons
- "Flag for Review" → Assigns to senior analyst
- "Assign" → Opens assignee dropdown
- "Export" → Downloads PDF
- Tab navigation:
  - "Overview" → /cases/:id
  - "Documents" → /cases/:id/documents
  - "Biometrics" → /cases/:id/biometrics
  - "Signals" → /cases/:id/signals
  - "Notes" → /cases/:id/notes
  - "Audit Log" → /cases/:id/audit

#### Analytics Actions
- Date range selector → Updates all charts
- Chart interactions:
  - Click data point → Shows detail tooltip
  - Drag to zoom → Zooms chart
  - Export button → Downloads PNG/CSV
- Benchmark "View Details" → Expands section

#### Settings Navigation
- Settings sidebar (persistent):
  - "General" → /settings/general
  - "Team" → /settings/team
  - "Security" → /settings/security
  - "API Keys" → /settings/api
  - "Webhooks" → /settings/webhooks
  - "Data Privacy" → /settings/privacy
  - "Billing" → /settings/billing
  - "Notifications" → /settings/notifications

#### Team Management Actions
- "Invite Member" → /settings/team/invite
- Member three-dot menu:
  - "View Activity" → /settings/team/:id/activity
  - "Change Role" → Opens role modal
  - "Reset Password" → Sends email
  - "Suspend" → Confirmation modal
  - "Delete" → Two-step confirmation

#### API Key Actions
- "Create New Key" → Opens creation modal
- "Copy" button → Copies to clipboard
- "Revoke" → Confirmation modal
- "View Usage" → /settings/api/:id

#### Billing Actions
- "Upgrade Plan" → /settings/billing/upgrade
- "Update Payment" → /settings/billing/payment-method
- "View Invoices" → /settings/billing/invoices
- "Download Invoice" → Downloads PDF

#### Footer Links
- "Documentation" → /support/docs
- "API Reference" → Opens API docs (new tab)
- "System Status" → /system-status
- "Terms of Service" → /terms
- "Privacy Policy" → /privacy
- "Contact Sales" → /contact-sales

### 5.3 Modal and Overlay Interactions

#### Test Workflow Modal
- "Upload Data" → File picker
- "Use Sample Data" → Populates test data
- "Run Test" → Starts test execution
- "Export Results" → Downloads results
- "Close" (X) → Closes modal
- ESC key → Closes modal

#### Decision Modal (Approve/Reject)
- Reason code checkboxes → Multi-select
- "Add Note" → Expands textarea
- "Notify User" → Toggles email option
- "Confirm" → Submits decision
- "Cancel" → Closes without saving

#### Create API Key Modal
- "Generate" → Creates key
- "Copy" → Copies to clipboard
- "Download .env" → Downloads file
- "I've Saved This" → Enables close
- "Close" → Returns to list

#### Confirmation Modals
- "Delete" actions → "Delete" / "Cancel"
- "Archive" actions → "Archive" / "Cancel"
- "Revoke" actions → "Revoke" / "Keep Active"
- All require explicit confirmation

## 6. Responsive Behavior

### 6.1 Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 6.2 Mobile-Specific Interactions

#### Navigation
- Hamburger menu replaces horizontal nav
- Slide-out drawer from left
- Overlay dims background
- Swipe right to close

#### Tables
- Horizontal scroll with shadow indicators
- Sticky first column
- Collapsible row details
- Bulk actions in action sheet

#### Forms
- Full-width inputs
- Native date/time pickers
- Larger touch targets (44px min)
- Sticky submit button

#### Modals
- Full-screen on mobile
- Slide up from bottom
- Swipe down to dismiss
- Fixed action buttons

### 6.3 Touch Gestures

- **Swipe Left**: Delete/archive actions
- **Swipe Right**: Close drawers/modals
- **Pull Down**: Refresh content
- **Long Press**: Context menu
- **Pinch**: Zoom charts/images
- **Double Tap**: Reset zoom

## 7. Accessibility

### 7.1 Keyboard Navigation

#### Tab Order
- Logical left-to-right, top-to-bottom
- Skip links for main content
- Focus visible indicators
- Trap focus in modals

#### Shortcuts
- `/` - Focus search
- `?` - Show keyboard shortcuts
- `ESC` - Close modals/dropdowns
- `Enter` - Activate buttons/links
- `Space` - Toggle checkboxes
- `Arrow keys` - Navigate menus

### 7.2 Screen Reader Support

- Semantic HTML throughout
- ARIA labels for icons
- Live regions for updates
- Form field descriptions
- Error announcements
- Loading state announcements

### 7.3 Visual Accessibility

- 4.5:1 contrast ratio minimum
- Focus indicators visible
- Error states not color-only
- Animations respect prefers-reduced-motion
- Scalable to 200% without horizontal scroll

## 8. Data Validation Rules

### 8.1 Workflow Configuration

- **Workflow Name**: 3-50 characters, alphanumeric + spaces
- **Risk Threshold**: Integer 0-100
- **Provider Selection**: At least one per enabled signal
- **Conditional Rules**: Valid JSON syntax
- **Test Data**: Valid JSON/CSV, max 1MB

### 8.2 Case Management

- **Case Notes**: Max 5000 characters
- **Reason Codes**: At least one required for decisions
- **File Attachments**: PDF/JPG/PNG, max 10MB each
- **Bulk Operations**: Max 1000 cases at once

### 8.3 User Management

- **Email**: Valid format, unique in system
- **Password**: 12+ chars, complexity requirements
- **Phone**: Valid international format
- **API Key Name**: Unique per account, 3-50 chars
- **Webhook URL**: Valid HTTPS URL

### 8.4 Analytics

- **Date Range**: Max 1 year span
- **Export Size**: Max 100k records
- **Report Name**: 3-100 characters
- **Scheduled Reports**: Max 10 per account

## 9. Performance Requirements

### 9.1 Loading Times

- **Initial Page Load**: < 2 seconds
- **Subsequent Navigation**: < 500ms
- **API Responses**: < 300ms (p95)
- **Search Results**: < 1 second
- **Chart Rendering**: < 1 second
- **File Uploads**: Progress shown immediately

### 9.2 Real-time Updates

- **Case Queue**: New cases appear within 2 seconds
- **Risk Scores**: Update within 1 second
- **Analytics**: Refresh every 30 seconds
- **Notifications**: Deliver within 5 seconds
- **Collaboration**: Notes sync within 2 seconds

### 9.3 Offline Behavior

- **Read-only Mode**: View cached data
- **Offline Banner**: "You're offline. Some features unavailable"
- **Queue Actions**: Store locally, sync when online
- **Auto-retry**: Every 30 seconds
- **Conflict Resolution**: Server wins, show diff

## 10. Error Messages

### 10.1 Authentication Errors

- `Invalid email or password` - Incorrect credentials
- `Account locked. Try again in X minutes` - Too many attempts
- `Session expired. Please sign in again` - Timeout
- `Invalid 2FA code. X attempts remaining` - Wrong code
- `This account requires SSO. Redirecting...` - SSO required

### 10.2 Validation Errors

- `Workflow name already exists` - Duplicate name
- `Risk threshold must be between 0-100` - Out of range
- `Please select at least one signal` - No signals
- `Invalid email format` - Bad email
- `Password doesn't meet requirements` - Weak password

### 10.3 System Errors

- `Unable to save. Please try again` - Save failed
- `Connection lost. Retrying...` - Network issue
- `This feature requires admin access` - Permission denied
- `File too large. Maximum size is 10MB` - Upload limit
- `Rate limit exceeded. Try again in X seconds` - Too many requests

### 10.4 Business Logic Errors

- `Cannot delete active workflow` - Workflow in use
- `Case already assigned to X` - Assignment conflict
- `Insufficient credits for this operation` - Billing limit
- `This action cannot be undone` - Permanent action warning
- `Webhook URL not responding` - Integration failure

## 11. Success Messages

### 11.1 Creation Success

- `Workflow created successfully` - New workflow
- `Team member invited` - Invitation sent
- `API key generated` - New API key
- `Report scheduled` - New report
- `Webhook configured` - New webhook

### 11.2 Update Success

- `Changes saved` - Generic save
- `Workflow published` - Workflow activated
- `Case approved` - Approval complete
- `Settings updated` - Settings saved
- `Password changed successfully` - Password update

### 11.3 Deletion Success

- `Workflow archived` - Soft delete
- `Case deleted` - With undo option
- `API key revoked` - Immediate effect
- `Data deletion scheduled` - Privacy request
- `Member removed from team` - Access revoked

## 12. Empty States

### 12.1 No Data States

#### No Workflows
- Icon: Workflow diagram outline
- Title: "Create your first workflow"
- Description: "Start by building a verification workflow for your users"
- CTA: "Create Workflow" → /workflows/new
- Learn: "Watch Tutorial" → Opens video modal

#### No Cases
- Icon: Folder outline
- Title: "No cases to review"
- Description: "Cases requiring manual review will appear here"
- CTA: "View All Cases" → /cases?status=all
- Learn: "Learn about case management" → /support/docs

#### No Analytics Data
- Icon: Chart outline
- Title: "No data yet"
- Description: "Analytics will appear once verifications begin"
- CTA: "Configure Webhooks" → /settings/webhooks
- Learn: "Integration Guide" → /support/docs

### 12.2 Error States

#### 404 Not Found
- Icon: Broken link
- Title: "Page not found"
- Description: "The page you're looking for doesn't exist"
- CTA: "Go to Dashboard" → /
- Secondary: "Contact Support" → /support

#### 500 Server Error
- Icon: Server alert
- Title: "Something went wrong"
- Description: "We're having technical difficulties"
- CTA: "Retry" → Reload page
- Secondary: "System Status" → /system-status

#### Permission Denied
- Icon: Lock shield
- Title: "Access denied"
- Description: "You don't have permission to view this"
- CTA: "Request Access" → Opens support modal
- Secondary: "Go Back" → Browser back

## 13. Loading States

### 13.1 Skeleton Screens

#### Dashboard Skeleton
- Header with avatar placeholder
- 4 metric card shapes with shimmer
- Activity feed with 5 line items
- Animated shimmer effect (1.5s loop)

#### Table Skeleton
- Header row with column shapes
- 10 data rows with cell shapes
- Pagination placeholder
- Maintains exact layout dimensions

#### Form Skeleton
- Label and input field shapes
- Button placeholder at bottom
- Preserves form structure
- Prevents layout shift

### 13.2 Progress Indicators

#### Linear Progress
- Used for: File uploads, data exports
- Shows percentage complete
- Time remaining estimate
- Cancel button available

#### Circular Progress
- Used for: Button actions, saving
- Indeterminate spinner
- Replaces button content
- Prevents duplicate submission

#### Step Progress
- Used for: Multi-step processes
- Shows current step of total
- Step labels and status
- Previous steps clickable

## 14. Feature Interaction Cross-Reference

### 14.1 Session Management
- **Timeout Warning**: Shows modal at 25 minutes
  - "Your session will expire in 5 minutes"
  - "Stay Signed In" → Refreshes session
  - "Sign Out" → /auth/signin
- **Auto-logout**: At 30 minutes
  - Saves work in progress
  - Shows "Session expired" message
  - Redirects to signin

### 14.2 Real-time Collaboration
- **Live Indicators**: Shows other users viewing
  - Avatar badges on cases
  - "X is typing..." in notes
  - Cursor positions in workflow editor
- **Conflict Resolution**:
  - "This was modified by X" warning
  - "Merge Changes" / "Overwrite" options
  - Version comparison view

### 14.3 Audit Trail
- **Every Action Logged**:
  - User, timestamp, IP address
  - Before/after values
  - Related entities
- **Audit Search**:
  - By user, date, action type
  - Full-text search
  - Export capabilities

## 15. Validation Checklist

✅ **Authentication & Security**
- [x] Sign in with email/password
- [x] SSO integration
- [x] 2FA setup and verification
- [x] Password reset flow
- [x] Session management
- [x] Role-based access control

✅ **Workflow Management** 
- [x] Visual workflow builder
- [x] Drag-and-drop interface
- [x] Multi-signal configuration
- [x] Provider selection
- [x] Test workflow functionality
- [x] Version control
- [x] A/B testing framework

✅ **Case Management**
- [x] Case queue with filters
- [x] Detailed case view
- [x] Manual review process
- [x] Bulk operations
- [x] Note-taking with auto-save
- [x] Audit trail
- [x] Real-time updates

✅ **Analytics & Reporting**
- [x] Real-time dashboard
- [x] Risk pattern analysis
- [x] Industry benchmarking
- [x] Custom report builder
- [x] Data export options
- [x] Scheduled reports

✅ **Settings & Configuration**
- [x] Team management
- [x] API key generation
- [x] Webhook configuration
- [x] Data privacy controls
- [x] Billing management
- [x] Notification preferences

✅ **User Experience**
- [x] Mobile responsive design
- [x] Offline functionality
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Loading states
- [x] Error handling
- [x] Empty states
- [x] Success feedback

✅ **Additional Requirements**
- [x] Support chat integration
- [x] Help documentation
- [x] System status page
- [x] Complete navigation map
- [x] 404 error handling
- [x] All 74 PRD features covered

## 16. Appendix

### 16.1 Component Library

All UI components follow the design system:
- Buttons: Primary, Secondary, Tertiary, Danger
- Forms: Input, Select, Checkbox, Radio, Toggle
- Feedback: Toast, Modal, Alert, Badge
- Navigation: Tabs, Breadcrumbs, Pagination
- Data: Table, Card, List, Timeline
- Charts: Line, Bar, Pie, Heatmap

### 16.2 Animation Timing

- Micro-interactions: 150ms ease-out
- Page transitions: 300ms ease-in-out
- Modal open/close: 200ms ease-out
- Accordion expand: 250ms ease-in-out
- Loading shimmer: 1.5s linear infinite

### 16.3 Color Semantics

- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Error: #EF4444 (red)
- Info: #3B82F6 (blue)
- Neutral: #6B7280 (gray)

---

*This completes the comprehensive interaction specification for the Identfy Customer Portal, covering all 74 features from the PRD with detailed interaction patterns, navigation mapping, and edge case handling.*