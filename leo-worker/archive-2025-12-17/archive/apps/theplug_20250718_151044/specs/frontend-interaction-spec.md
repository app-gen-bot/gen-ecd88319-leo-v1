

# Frontend Interaction Specification: The Plug

*Generated from Product Requirements Document: The Plug - Autonomous Music Registration Platform v1.1*

## Overview

The Plug is an autonomous music registration platform that enables independent artists to register their music across all major rights organizations, distribution platforms, and copyright offices through a single upload. The platform provides a unified dashboard for tracking registrations, managing credentials, and monitoring revenue projections across multiple platforms.

## Global Navigation

### Application Layout
- **Header** (64px): Logo, primary navigation, notifications, search, user menu
- **Sidebar** (240px): Secondary navigation, quick actions panel
- **Main Content**: Primary workspace with contextual actions
- **Footer** (48px): Legal links, platform status indicator, support link
- **Responsive**: Sidebar collapses to hamburger menu on mobile, bottom tab navigation for key actions

### Primary Navigation
- **Location**: Header horizontal menu (desktop), hamburger menu (mobile)
- **Items**:
  - Dashboard → /dashboard
  - My Music → /music
  - Registrations → /registrations
  - Integrations → /integrations
  - Analytics → /analytics
  - Settings → /settings
- **Mobile**: Hamburger menu with full-screen overlay

### User Menu
- **Location**: Top-right header
- **Trigger**: Click avatar/username
- **Menu Items**:
  - Profile → /profile
  - API Credentials → /settings/api-credentials
  - Billing → /settings/billing
  - Notifications → /settings/notifications
  - ---
  - Help Center → /help
  - What's New → /changelog
  - ---
  - Sign Out → Logout flow → /login

### Global Search
- **Location**: Header center
- **Trigger**: Click search bar or Cmd/Ctrl+K
- **Behavior**: Inline dropdown with categorized results
- **Features**: Real-time search across songs, registrations, platforms
- **Categories**: Songs, Registrations, Platforms, Help Articles

## Complete Navigation & Interaction Map

### Route Inventory

#### Public Routes
```
/                           → Landing page
/login                      → Authentication page
/register                   → New user registration
/verify-email              → Email verification
/forgot-password           → Password recovery
/reset-password            → Password reset (with token)
/pricing                   → Pricing plans
/features                  → Feature overview
/how-it-works              → Platform explanation
/about                     → About The Plug
/contact                   → Contact form
/privacy                   → Privacy policy
/terms                     → Terms of service
/cookie-policy             → Cookie policy
/api-docs                  → Public API documentation
/status                    → Platform status page
/demo                      → Interactive demo
```

#### Protected Routes (Authentication Required)
```
/dashboard                 → Main user dashboard
/getting-started          → Onboarding flow
/music                    → Music library
  /music/upload           → Upload new music
  /music/:id              → Song details
  /music/:id/edit         → Edit song metadata
  /music/:id/registrations → Song registration status

/registrations            → All registrations
  /registrations/active   → Active registrations
  /registrations/pending  → Pending registrations
  /registrations/failed   → Failed registrations
  /registrations/completed → Completed registrations
  /registrations/:id      → Registration details

/integrations             → Platform integrations
  /integrations/mlc       → MLC integration
  /integrations/soundexchange → SoundExchange integration
  /integrations/distribution → Distribution partners
  /integrations/pro       → PRO integrations
  /integrations/copyright → Copyright Office (Phase 2)
  /integrations/:platform/connect → Platform connection flow
  /integrations/:platform/settings → Platform settings

/analytics                → Revenue analytics
  /analytics/overview     → Analytics dashboard
  /analytics/projections  → Revenue projections
  /analytics/platforms    → Platform breakdown
  /analytics/reports      → Downloadable reports

/profile                  → User profile
/settings                 → User settings
  /settings/profile       → Profile settings
  /settings/api-credentials → API credential management
  /settings/notifications → Notification preferences
  /settings/security      → Security settings
  /settings/billing       → Billing & subscription
  /settings/team          → Team management (future)

/help                     → Help center
  /help/getting-started   → Getting started guide
  /help/platforms         → Platform guides
  /help/troubleshooting   → Troubleshooting
  /help/contact           → Contact support

/changelog                → Platform updates
```

#### Admin/Support Routes
```
/admin                    → Admin dashboard
/admin/users              → User management
/admin/registrations      → Registration queue
/admin/escalations        → Human-in-the-loop queue
/admin/platforms          → Platform status management
```

#### Utility Routes
```
/404                      → Not found page
/500                      → Server error page
/503                      → Service unavailable
/maintenance              → Maintenance mode
/unsupported-browser      → Browser compatibility
```

### Interactive Element Catalog

#### Global Elements (Present on Multiple Pages)

**Header Navigation**
- The Plug Logo → /dashboard (authenticated) or / (public)
- Dashboard → /dashboard
- My Music → /music
- Registrations → /registrations
- Integrations → /integrations
- Analytics → /analytics
- Settings → /settings
- Search Bar → Opens search dropdown
  - Recent searches → Repeat search
  - Search result → Navigate to result
  - "See all results" → /search?q=[query]
- Notification Bell → Opens dropdown
  - Registration Success → /registrations/[id]
  - Registration Failed → /registrations/[id]
  - Platform Update → /integrations/[platform]
  - "View All" → /notifications
  - "Mark All Read" → Action: mark all as read
- Quick Upload Button → /music/upload
- User Avatar → Opens dropdown
  - "Profile" → /profile
  - "API Credentials" → /settings/api-credentials
  - "Billing" → /settings/billing
  - "Notifications" → /settings/notifications
  - Divider
  - "Help Center" → /help
  - "What's New" → /changelog
  - Divider
  - "Sign Out" → Action: logout → /login

**Sidebar (Desktop Only)**
- Quick Actions Panel
  - "Upload New Song" → /music/upload
  - "Check Registration Status" → /registrations
  - "View Analytics" → /analytics
- Platform Status Indicators
  - MLC → /integrations/mlc
  - SoundExchange → /integrations/soundexchange
  - Distribution → /integrations/distribution
  - PROs → /integrations/pro
- Recent Activity Feed
  - Activity Item → Relevant page

**Footer**
- "Privacy Policy" → /privacy
- "Terms of Service" → /terms
- "Cookie Policy" → /cookie-policy
- "API Documentation" → /api-docs
- "Status" → /status
- "Contact Support" → /help/contact
- Platform Status Indicator → /status

#### Page-Specific Interactions

**Dashboard Page (/dashboard)**
- "Upload Your First Song" (empty state) → /music/upload
- Registration Overview Cards
  - "View All Active" → /registrations/active
  - "View Pending" → /registrations/pending
  - "View Failed" → /registrations/failed
- Revenue Projection Chart → /analytics/projections
- Missing Registrations Alert
  - "Fix Now" → /registrations?filter=missing
  - "Dismiss" → Hide alert for session
- Recent Registrations List
  - Registration Item → /registrations/[id]
  - "View All" → /registrations
- Platform Connection Status
  - "Connect" → /integrations/[platform]/connect
  - "Configure" → /integrations/[platform]/settings
  - Status indicator → /integrations/[platform]

**Music Library (/music)**
- "Upload New Song" button → /music/upload
- Filter Dropdown → Updates list
  - All Songs
  - Fully Registered
  - Partially Registered
  - Not Registered
- Sort Options → Updates order
  - Recently Added
  - Title A-Z
  - Title Z-A
  - Registration Status
- Song Card → /music/[id]
- Song Card Actions (three dots) → Opens dropdown
  - "View Details" → /music/[id]
  - "Edit Metadata" → /music/[id]/edit
  - "View Registrations" → /music/[id]/registrations
  - "Delete" → Opens confirmation modal
- Bulk Actions (when items selected)
  - "Register Selected" → Opens bulk registration modal
  - "Export Metadata" → Downloads CSV
  - "Delete Selected" → Opens confirmation modal

**Upload Page (/music/upload)**
- File Drop Zone → Opens file picker
- "Choose Files" button → Opens file picker
- Upload Progress → Shows per-file progress
- Metadata Form (per file)
  - "Auto-fill from file" → Extracts metadata
  - "Save as draft" → Saves without registering
  - "Save and Register" → Saves and starts registration
- "Add Another Song" → Adds new upload form
- "Cancel" → Returns to /music with confirmation

**Registration Details (/registrations/[id])**
- Status Timeline → Shows registration progress
- Platform Tabs
  - Each tab → Shows platform-specific details
- "View on Platform" → External link to platform
- "Retry Registration" → Restarts failed registration
- "Request Support" → /help/contact?registration=[id]
- "Download Report" → Downloads PDF report
- Activity Log
  - "Show More" → Loads more entries

**Integrations Page (/integrations)**
- Platform Cards
  - "Connect" → /integrations/[platform]/connect
  - "Settings" → /integrations/[platform]/settings
  - "Disconnect" → Opens confirmation modal
  - "Test Connection" → Runs connection test
- API Health Indicators
  - Green → Healthy
  - Yellow → Degraded (click for details)
  - Red → Down (click for status)

**Platform Connection Flow (/integrations/[platform]/connect)**
- Connection Method Selector
  - "API Key" → Shows API form
  - "OAuth" → Starts OAuth flow
  - "Bulk Upload" → Shows bulk upload instructions
- API Credential Form
  - "Test Connection" → Validates credentials
  - "Save and Connect" → Saves credentials
  - "Cancel" → Returns to /integrations
- OAuth Flow
  - "Authorize" → Redirects to platform
  - Platform callback → Returns to success page

### Modal & Dialog Actions

**Delete Song Confirmation Modal**
- "Cancel" → Close modal, no action
- "Delete Song Only" → Delete from library, keep registrations
- "Delete Everything" → Delete song and cancel all registrations

**Bulk Registration Modal**
- Platform checkboxes → Select platforms
- "Select All" → Check all platforms
- "Deselect All" → Uncheck all platforms
- "Cancel" → Close modal
- "Start Registration" → Begin bulk process → /registrations

**Registration Retry Modal**
- Retry options
  - "Retry with same data" → Immediate retry
  - "Update and retry" → Edit form → Retry
- "Cancel" → Close modal
- "Contact Support" → /help/contact

**Subscription Upgrade Modal**
- Plan comparison table
- "Select Plan" → /settings/billing?plan=[plan]
- "Maybe Later" → Close modal

**Human Intervention Required Modal**
- Issue description
- "Approve and Continue" → Approve action
- "Modify and Continue" → Edit form → Approve
- "Cancel Registration" → Cancel with reason
- "Escalate to Support" → Create support ticket

### Navigation Validation Checklist
- [x] Every route listed has a corresponding page implementation
- [x] Every interactive element has a defined destination or action
- [x] No placeholder destinations
- [x] All dropdown/menu items are accounted for
- [x] Modal actions are fully specified
- [x] 404 page exists for undefined routes
- [x] No interactive element is left without definition

## Pages

### Page: Landing (/)

#### Purpose
Public-facing marketing page to attract and convert new users

#### Components

**HeroSection**
- **Type**: Full-width hero with background gradient
- **Content**: 
  - Headline: "Register Your Music Everywhere in One Click"
  - Subtext: "Upload once. We handle MLC, PROs, Copyright, and more automatically."
  - Video preview button
- **Actions**: 
  - "Start Free Trial" → /register
  - "Watch Demo" → Opens video modal
  - "See How It Works" → Smooth scroll to process section

**PlatformLogos**
- **Type**: Logo carousel
- **Content**: MLC, ASCAP, BMI, SESAC, SoundExchange, Copyright Office logos
- **Behavior**: Auto-scroll, pause on hover

**ProcessOverview**
- **Type**: Three-step visual process
- **Steps**:
  1. Upload Your Music
  2. We Register Everywhere
  3. Track Your Royalties
- **Actions**: Each step clickable → /how-it-works#[step]

**FeatureGrid**
- **Type**: 2x3 feature cards
- **Features**:
  - One Upload, All Platforms
  - Automatic Metadata Extraction
  - Real-time Registration Status
  - Revenue Projections
  - Human Support When Needed
  - Secure API Integrations
- **Actions**: "Learn More" → /features#[feature]

**PricingPreview**
- **Type**: Three-tier pricing cards
- **Actions**: 
  - "Start Free Trial" → /register?plan=[plan]
  - "See Full Pricing" → /pricing

**CTASection**
- **Type**: Full-width CTA banner
- **Content**: "Ready to simplify your music registration?"
- **Actions**: 
  - "Start Your Free Trial" → /register
  - "Book a Demo" → /contact?type=demo

### Page: Authentication (/login)

#### Purpose
Authenticate existing users with support for demo access

#### Components

**LoginForm**
- **Fields**:
  - email: Email input (required, valid email)
  - password: Password input (required, min 8 chars)
  - remember_me: Checkbox (optional, default checked)
- **Actions**:
  - "Sign In": Validate → Authenticate → /dashboard
  - "Forgot Password": → /forgot-password
  - "Create Account": → /register
  - "Try Demo": Auto-fill demo@example.com/demo123 → Submit
- **Validation**:
  - Email format: "Please enter a valid email address"
  - Required fields: "[Field] is required"
  - Show errors inline below fields
- **Error States**:
  - Invalid credentials: "Email or password incorrect. Please try again."
  - Account locked: "Too many attempts. Try again in [X] minutes."
  - Account suspended: "Account suspended. Contact support."
  - Network error: "Connection failed. Please check your internet connection."

**DemoNotice**
- **Type**: Info banner
- **Content**: "Try our demo: demo@example.com / demo123"
- **Action**: Click to auto-fill → Submit form

### Page: Registration (/register)

#### Purpose
New user registration with plan selection

#### Components

**RegistrationForm**
- **Fields**:
  - email: Email input (required, valid email, unique)
  - password: Password input (required, min 8 chars, strength indicator)
  - confirm_password: Password input (required, must match)
  - artist_name: Text input (required, 2-50 chars)
  - plan: Radio buttons (Free, Pro, Enterprise)
  - terms: Checkbox (required) "I agree to Terms and Privacy Policy"
  - marketing: Checkbox (optional) "Send me tips and updates"
- **Actions**:
  - "Create Account": Validate → Create → Send verification → /verify-email
  - "Sign In Instead": → /login
  - Terms link: → /terms (new tab)
  - Privacy link: → /privacy (new tab)
- **Validation**:
  - Email uniqueness: "This email is already registered"
  - Password strength: Real-time indicator (Weak/Medium/Strong)
  - Password match: "Passwords don't match"
  - All errors shown inline

**PlanSelector**
- **Type**: Interactive cards
- **Plans**: Free (Selected default), Pro ($29/mo), Enterprise (Contact)
- **Behavior**: Click to select, highlights selection
- **Details**: Expandable feature comparison

### Page: Dashboard (/dashboard)

#### Purpose
Central hub showing registration overview and actionable insights

#### Components

**WelcomeBanner** (First-time users only)
- **Type**: Dismissible banner
- **Content**: "Welcome [Name]! Let's get your first song registered."
- **Actions**: 
  - "Upload First Song" → /music/upload
  - "Take a Tour" → Starts interactive tour
  - "Dismiss" → Hide permanently

**RegistrationStats**
- **Type**: Metric cards grid
- **Metrics**:
  - Total Songs: [Count] (Click → /music)
  - Active Registrations: [Count] (Click → /registrations/active)
  - Pending Registrations: [Count] (Click → /registrations/pending)
  - Failed Registrations: [Count] (Click → /registrations/failed)
- **Refresh**: Every 30 seconds via WebSocket

**MissingRegistrationsAlert**
- **Type**: Warning banner (only if missing > 0)
- **Content**: "[X] songs are missing important registrations"
- **Actions**:
  - "Review and Fix" → /registrations?filter=missing
  - "Dismiss for Today" → Hide for 24 hours

**RevenueProjectionChart**
- **Type**: Interactive line chart
- **Time Range Selector**: 30 days, 90 days, 1 year
- **Hover**: Shows detailed breakdown
- **Click**: → /analytics/projections

**RecentActivity**
- **Type**: Timeline with status indicators
- **Items**: Last 10 registration activities
- **Item Contents**:
  - Icon (success/pending/failed)
  - "[Song] registered with [Platform]"
  - Timestamp (relative)
  - Action button based on status
- **Actions**:
  - Success: "View Details" → /registrations/[id]
  - Pending: "Check Status" → /registrations/[id]
  - Failed: "Retry" → Opens retry modal
- **Load More**: → /registrations

**PlatformHealthGrid**
- **Type**: Platform status cards
- **Platforms**: MLC, SoundExchange, Distribution, PROs, Copyright
- **Status Indicators**:
  - Green: Connected & Healthy
  - Yellow: Action Required
  - Red: Disconnected
  - Gray: Not Set Up
- **Actions**:
  - Connected: "Manage" → /integrations/[platform]/settings
  - Action Required: "Fix" → /integrations/[platform]/settings
  - Disconnected: "Reconnect" → /integrations/[platform]/connect
  - Not Set Up: "Connect" → /integrations/[platform]/connect

**QuickActions**
- **Type**: Action button group
- **Actions**:
  - "Upload New Song" → /music/upload
  - "Check All Registrations" → /registrations
  - "View Analytics" → /analytics
  - "Manage Integrations" → /integrations

### Page: Music Library (/music)

#### Purpose
Manage uploaded songs and their metadata

#### Components

**LibraryHeader**
- **Stats Bar**: "[X] Total Songs • [Y] Fully Registered • [Z] Need Action"
- **Actions**:
  - "Upload New Song" → /music/upload
  - "Bulk Import" → Opens bulk import modal
  - "Export Library" → Downloads CSV

**FilterBar**
- **Search**: Real-time search by title, artist
- **Filter Dropdown**: 
  - All Songs (default)
  - Fully Registered
  - Partially Registered  
  - Not Registered
  - Recently Added
- **Sort Dropdown**:
  - Recently Added (default)
  - Title A-Z
  - Title Z-A
  - Registration Status
  - Release Date
- **View Toggle**: Grid view / List view

**SongGrid/List**
- **Empty State**: 
  - Icon: Music note
  - Text: "No songs yet. Upload your first track!"
  - Action: "Upload Song" → /music/upload
- **Loading**: Skeleton cards (3 rows)
- **Song Card**:
  - Album art (or placeholder)
  - Title (truncated at 2 lines)
  - Artist name
  - Registration status badge
  - Platform icons (colored by status)
  - Duration
  - Upload date
- **Card Hover**: Elevate + Show action buttons
- **Card Click**: → /music/[id]
- **Action Menu** (three dots):
  - "View Details" → /music/[id]
  - "Edit Metadata" → /music/[id]/edit
  - "View Registrations" → /music/[id]/registrations
  - "Download" → Downloads file
  - Divider
  - "Delete" → Opens delete modal

**BulkActionBar** (appears when items selected)
- **Content**: "[X] songs selected"
- **Actions**:
  - "Register Selected" → Bulk registration modal
  - "Export Selected" → Downloads CSV
  - "Delete Selected" → Bulk delete modal
  - "Cancel" → Deselect all

**Pagination**
- **Type**: Load more button
- **Text**: "Load More ([X] remaining)"
- **Behavior**: Appends next 20 items

### Page: Upload Music (/music/upload)

#### Purpose
Upload and process new music with metadata extraction

#### Components

**UploadWizard**
- **Step 1: File Upload**
  - Drag & drop zone (accepts .mp3, .wav, .flac)
  - "Choose Files" button → File picker
  - Multi-file support (up to 10)
  - File validation: Format, size (<500MB)
  - Upload progress per file
  - "Cancel Upload" → Cancels in-progress

- **Step 2: Metadata Review** (per file)
  - Auto-extracted fields (editable):
    - Title (required)
    - Artist (required)
    - Album
    - Release Date
    - Genre (dropdown)
    - Writers (multi-input)
    - Publishers (multi-input)
    - ISRC (auto-generated if empty)
  - Audio preview player
  - "Re-extract Metadata" → Re-processes file
  - "Copy to All" → Applies to all uploads

- **Step 3: Registration Options**
  - Platform selection (checkboxes, all selected default):
    - ✓ MLC (Mechanical Licensing)
    - ✓ SoundExchange (Digital Performance)
    - ✓ PROs (ASCAP/BMI/SESAC)
    - ✓ Distribution Partners
    - ✓ Copyright Office (Phase 2)
  - Registration timing:
    - "Register Immediately" (default)
    - "Save as Draft"
    - "Schedule for Later" → Date/time picker

**Actions**:
- "Back" → Previous step
- "Next"→ Validate → Next step
- "Save as Draft" → Save without registering → /music
- "Cancel" → Confirmation → /music
- "Upload & Register" → Process → /music/[id]

**UploadStatus**
- **Type**: Real-time status sidebar
- **Stages**:
  - ✓ File Upload Complete
  - ⟳ Extracting Metadata...
  - ⟳ Audio Fingerprinting...
  - ⟳ Checking for Duplicates...
  - ✓ Ready for Registration

### Page: Registration Details (/registrations/[id])

#### Purpose
Track individual registration progress across platforms

#### Components

**RegistrationHeader**
- **Song Info**: Title, Artist, Album art
- **Overall Status**: Badge (Active/Complete/Failed/Partial)
- **Actions**:
  - "View Song" → /music/[song-id]
  - "Download Report" → PDF download
  - "Share Status" → Copy status link

**PlatformTabs**
- **Tabs**: MLC | SoundExchange | PROs | Distribution | Copyright
- **Tab Indicators**: ✓ Success | ⟳ Pending | ✗ Failed | - Not Started

**PlatformPanel** (per platform)
- **Status Timeline**:
  - Connection Verified ✓
  - Data Submitted ⟳
  - Processing...
  - Registration Complete
- **Platform Details**:
  - Registration ID: [Platform ID]
  - Submitted: [Timestamp]
  - Last Updated: [Timestamp]
  - Est. Completion: [Time/Date]
- **Actions**:
  - "View on Platform" → External link
  - "Retry" (if failed) → Retry modal
  - "Update Info" → Edit modal

**ActivityLog**
- **Type**: Chronological event list
- **Events**: All platform interactions
- **Entry Format**: [Time] [Platform] [Action] [Status]
- **Pagination**: "Show More" loads 20 more

**SupportPanel** (if human intervention needed)
- **Type**: Alert banner
- **Content**: "This registration requires manual review"
- **Status**: Waiting for Review / In Progress / Resolved
- **Actions**:
  - "View Details" → Expands issue info
  - "Contact Support" → /help/contact?registration=[id]

### Page: Integrations (/integrations)

#### Purpose
Manage platform connections and API credentials

#### Components

**IntegrationsOverview**
- **Connected Platforms**: [X] of [Y] platforms connected
- **Health Status**: All Systems Operational / [X] Issues
- **Last Sync**: [Timestamp] across all platforms

**PlatformGrid**
- **Platform Card** (for each):
  - Logo
  - Name
  - Connection Status
  - Health indicator
  - Last sync time
  - Registration count
- **Card States**:
  - Connected: Green border, "Manage" button
  - Disconnected: Gray, "Connect" button
  - Error: Red border, "Fix Connection" button
  - Coming Soon: Disabled, "Phase 2" label

**Platform Actions**:
- Connected:
  - "Manage" → /integrations/[platform]/settings
  - "Test Connection" → Runs test → Shows result
  - "Disconnect" → Confirmation modal
- Disconnected:
  - "Connect" → /integrations/[platform]/connect
  - "Learn More" → Platform guide
- Error:
  - "Fix Connection" → /integrations/[platform]/settings
  - "View Error" → Error details modal

### Page: Platform Settings (/integrations/[platform]/settings)

#### Purpose
Configure individual platform integration

#### Components

**PlatformHeader**
- **Info**: Logo, name, description
- **Status**: Connected/Error badge
- **Quick Actions**:
  - "Test Connection" → Run test
  - "View Documentation" → Platform docs
  - "Disconnect" → Confirmation modal

**CredentialsForm** (varies by platform)
- **MLC Example**:
  - API Key: Password input (masked)
  - API Secret: Password input (masked)
  - Environment: Dropdown (Production/Sandbox)
- **OAuth Platforms**:
  - Current authorization status
  - "Reauthorize" button
- **Validation**: Test on save

**SettingsPanel**
- **Auto-sync**: Toggle (default on)
- **Sync frequency**: Dropdown (Hourly/Daily/Weekly)
- **Notifications**: Checkboxes for event types
- **Advanced Settings**: Platform-specific options

**Actions**:
- "Save Changes" → Validate → Save → Success message
- "Cancel" → Discard → /integrations
- "Reset to Defaults" → Confirmation → Reset

### Page: Analytics (/analytics)

#### Purpose
Revenue tracking and projections across platforms

#### Components

**AnalyticsDashboard**
- **Date Range Picker**: Last 30/90/365 days, Custom
- **Export Button**: "Download Report" → PDF/CSV options

**RevenueOverview**
- **Total Projected**: Large metric card
- **By Platform**: Stacked bar chart
- **Growth Rate**: Percentage with trend arrow
- **Interactive**: Hover for details, click to filter

**PlatformBreakdown**
- **Type**: Data table with charts
- **Columns**: Platform, Songs, Status, Projected Revenue
- **Row Actions**: "View Details" → Platform analytics
- **Sorting**: All columns sortable

**ProjectionsChart**
- **Type**: Line chart with confidence bands
- **Controls**: Toggle platforms on/off
- **Hover**: Detailed tooltip
- **Export**: "Save Chart" → PNG download

**InsightsPanel**
- **Type**: AI-generated insights
- **Content**: Key findings and recommendations
- **Actions**: "Learn More" → Detailed explanation

### Page: Settings (/settings)

#### Purpose
User account and application settings

#### Components

**SettingsSidebar**
- **Sections**:
  - Profile → /settings/profile
  - API Credentials → /settings/api-credentials
  - Notifications → /settings/notifications
  - Security → /settings/security
  - Billing → /settings/billing
  - Team → /settings/team (Phase 2)
- **Active Indicator**: Blue bar + background

**ProfileSettings** (/settings/profile)
- **Avatar Upload**:
  - Current image with overlay
  - "Change Photo" → File picker (5MB max)
  - "Remove Photo" → Confirmation → Default avatar
- **Fields**:
  - Artist Name: Text input
  - Email: Email input (with verification status)
  - Phone: Tel input (optional)
  - Bio: Textarea (500 chars)
  - Website: URL input
  - Social Links: Multiple URL inputs
- **Actions**:
  - "Save Changes" → Validate → Update → Success
  - "Cancel" → Discard changes

**APICredentials** (/settings/api-credentials)
- **API Key Management**:
  - Current keys list (masked)
  - "Generate New Key" → Modal with key display
  - "Revoke Key" → Confirmation → Remove
- **Webhook Settings**:
  - Webhook URL: URL input
  - Events: Checkbox list
  - "Test Webhook" → Send test payload

**NotificationSettings** (/settings/notifications)
- **Email Notifications**:
  - Registration Success: Toggle
  - Registration Failed: Toggle
  - Platform Updates: Toggle
  - Weekly Summary: Toggle
- **In-App Notifications**: Same options
- **Frequency**: Immediate/Daily Digest/Weekly

**SecuritySettings** (/settings/security)
- **Password Change**:
  - Current Password: Password input
  - New Password: Password input with strength
  - Confirm Password: Password input
  - "Update Password" → Validate → Update
- **Two-Factor Auth**:
  - Status: Enabled/Disabled
  - "Enable 2FA" → QR code flow
  - "Disable 2FA" → Confirmation + password
- **Active Sessions**:
  - List of devices/locations
  - "Revoke" → End session

**BillingSettings** (/settings/billing)
- **Current Plan**: Card with plan details
- **Usage**: Progress bars for limits
- **Payment Method**: Card ending in ****
- **Actions**:
  - "Change Plan" → /pricing
  - "Update Payment" → Payment modal
  - "View Invoices" → Invoice list
  - "Cancel Subscription" → Retention flow

## User Flows

### Flow: First-Time User Onboarding
1. User clicks "Start Free Trial" on landing page
2. Redirected to /register
3. Fills registration form with email, password, artist name
4. Selects plan (Free selected by default)
5. Agrees to terms and creates account
6. Redirected to /verify-email with instructions
7. Receives verification email
8. Clicks verification link
9. Redirected to /getting-started
10. Welcome screen with 3 options:
    - Upload First Song → /music/upload
    - Connect Platforms → /integrations
    - Explore Dashboard → /dashboard
11. Tooltip tour highlights key features
12. Success → Dashboard with welcome banner

### Flow: Upload and Register Song
1. User clicks "Upload New Song" from any page
2. Redirected to /music/upload
3. Drags audio file to drop zone or clicks to browse
4. File uploads with progress indicator
5. Metadata extraction runs automatically
6. User reviews/edits extracted metadata
7. Selects platforms for registration (all selected default)
8. Clicks "Upload & Register"
9. Song saved → Redirected to /music/[id]
10. Registration jobs queued for each platform
11. Real-time updates via WebSocket
12. Success notifications as each completes

### Flow: Connect Platform Integration (API)
1. User navigates to /integrations
2. Clicks "Connect" on MLC card
3. Redirected to /integrations/mlc/connect
4. Selects "API Key" method
5. Enters API credentials
6. Clicks "Test Connection"
7. Loading spinner while testing
8. If successful: Green checkmark
9. Clicks "Save and Connect"
10. Redirected to /integrations with success message
11. MLC card now shows "Connected" status

### Flow: Handle Failed Registration
1. User receives notification of failed registration
2. Clicks notification → /registrations/[id]
3. Views error details on platform tab
4. Clicks "Retry" button
5. Modal opens with options:
   - Retry with same data
   - Update and retry
6. Selects "Update and retry"
7. Edits problematic fields
8. Clicks "Retry Registration"
9. Modal closes, status updates to "Pending"
10. Monitors progress on status timeline

### Flow: Human-in-the-Loop Intervention
1. System detects registration requires human review
2. Registration status shows "Requires Review"
3. Support agent receives notification in admin queue
4. Agent reviews registration details
5. Agent approves/modifies/rejects with notes
6. User receives notification of resolution
7. If approved: Registration continues automatically
8. If modified: User reviews changes
9. If rejected: User sees reason and options
10. User can appeal or cancel registration

### Flow: Bulk Registration
1. User selects multiple songs in /music
2. Bulk action bar appears
3. Clicks "Register Selected"
4. Modal opens with platform options
5. Selects/deselects platforms
6. Reviews song list
7. Clicks "Start Registration"
8. Modal closes, redirected to /registrations
9. Bulk progress indicator shows overall status
10. Individual registrations process in parallel

### Flow: API Credential Rotation
1. User navigates to /settings/api-credentials
2. Clicks "Generate New Key"
3. Modal warns about revoking old key
4. User confirms
5. New key generated and displayed once
6. User copies key
7. Old key revoked after 24-hour grace period
8. Email notification sent about change

## State Management

### User Presence
- Updates every 30 seconds via WebSocket
- States: Online (green), Away (yellow, >5 min), Offline
- Visible in: Admin support queue

### Session Management
- Session duration: 7 days active use
- Remember me: 30 days
- Timeout warning: 5 minutes before expiry
- Auto-logout: Clear state → /login
- Concurrent sessions: Maximum 3 devices

### UI Persistence
- Collapsed sidebars: LocalStorage
- Sort preferences: LocalStorage per view
- Filter choices: SessionStorage
- Theme selection: Account setting (future)
- Tour completion: Account setting

### Real-time Updates
- Registration status: WebSocket
- Platform health: 60-second polling
- Analytics: 5-minute cache
- Notifications: Instant via WebSocket
- Activity feed: Real-time stream

### Offline Behavior
- Upload queue: LocalStorage with retry
- Form drafts: Auto-save every 30 seconds
- Offline indicator: Banner when disconnected
- Sync on reconnect: Queue processed

## Error Handling

### Network Errors
- **Display**: Toast notification, bottom-right
- **Message**: "Connection lost. Retrying..."
- **Actions**: Auto-retry with exponential backoff (1s, 2s, 4s, 8s)
- **Recovery**: Manual retry button after 4 attempts
- **Offline Mode**: Save actions to queue

### Validation Errors
- **Display**: Inline below form fields
- **Format**: Red text with error icon
- **Messages**:
  - Required: "[Field] is required"
  - Format: "Please enter a valid [type]"
  - Unique: "This [field] is already taken"
  - Custom: Platform-specific messages
- **Clear**: On field edit or form reset

### Platform API Errors
- **Display**: In registration timeline
- **Common Errors**:
  - 401: "Authentication failed. Please reconnect platform"
  - 429: "Rate limit exceeded. Will retry in [X] minutes"
  - 500: "Platform error. Our team has been notified"
  - Timeout: "Request timed out. Retrying..."
- **Actions**: Retry button, Contact support link

### Permission Errors
- **Display**: Full-page or modal
- **Message**: "You don't have permission to [action]"
- **Actions**: 
  - Upgrade Plan (if feature-limited)
  - Go Back
  - Contact Support

### File Upload Errors
- **Display**: Inline in upload component
- **Errors**:
  - Size: "File too large. Maximum size is 500MB"
  - Format: "Invalid format. Accepted: MP3, WAV, FLAC"
  - Corrupt: "File appears to be corrupted"
  - Duplicate: "This file was already uploaded"
- **Recovery**: Remove file, try again

### Not Found Errors
- **Display**: Full page
- **Message**: "Page not found"
- **Suggestions**: Based on URL pattern
- **Actions**:
  - Go to Dashboard
  - Search
  - Contact Support

## Accessibility

### Keyboard Navigation
- Tab order follows visual hierarchy
- Skip links: "Skip to main content"
- All interactive elements keyboard accessible
- Custom shortcuts:
  - Cmd/Ctrl+K: Global search
  - Cmd/Ctrl+U: Upload song
  - Cmd/Ctrl+/: Keyboard shortcuts help
- Modal escape: ESC key
- Dropdown navigation: Arrow keys

### Screen Reader Support
- Semantic HTML throughout
- ARIA labels on all icons
- Form labels properly associated
- Error messages announced
- Loading states announced
- Status updates via live regions
- Table headers properly scoped

### Visual Accessibility
- Focus indicators: 2px blue outline
- Color contrast: WCAG AA minimum
- Error states: Not just color (icons + text)
- Interactive elements: 44px minimum touch target
- Text resizable: Up to 200% without horizontal scroll
- Animations: Respect prefers-reduced-motion

### Form Accessibility
- Required fields marked with * and aria-required
- Error summary at form top
- Inline errors associated with fields
- Help text linked with aria-describedby
- Progress indicators for multi-step forms

## Responsive Behavior

### Mobile (< 768px)
- Navigation: Bottom tab bar with 5 primary actions
- Sidebar: Full-screen overlay from left
- Tables: Convert to stacked cards
- Modals: Full screen with fixed header/footer
- Forms: Single column layout
- Touch: Swipe to delete, pull to refresh
- Upload: Camera option for documents

### Tablet (768px - 1024px)
- Navigation: Collapsible sidebar
- Tables: Horizontal scroll with frozen columns
- Modals: Centered with backdrop
- Forms: Adaptive column layout
- Dashboard: 2-column grid

### Desktop (> 1024px)
- Navigation: Persistent sidebar
- Tables: Full featured with hover states
- Modals: Centered overlays
- Forms: Multi-column where appropriate
- Dashboard: 3-column grid
- Tooltips: On hover

### Responsive Images
- Album art: Responsive sizes (thumb/medium/large)
- Platform logos: SVG when possible
- User avatars: Multiple resolutions
- Loading: Progressive image loading

## Performance Optimizations

### Loading States
- **Initial Load**: App skeleton
- **Route Changes**: Progress bar at top
- **Data Loading**: Skeleton components
- **Image Loading**: Blur-up placeholders
- **Lazy Loading**: Below-fold content
- **Infinite Scroll**: Music library, activity feeds

### Caching Strategy
- **Static Assets**: 1 year cache
- **API Responses**: 
  - Platform config: 1 hour
  - User data: 5 minutes
  - Analytics: 15 minutes
- **LocalStorage**: Form drafts, preferences
- **Service Worker**: Offline queue

### Bundle Optimization
- **Code Splitting**: Per route
- **Dynamic Imports**: Modals, charts
- **Tree Shaking**: Unused code eliminated
- **Compression**: Gzip all text assets

## Validation Checklist

✓ **Authentication**
- [x] Login page with demo credentials exists
- [x] Registration with email verification exists
- [x] Password reset flow defined
- [x] Session management specified
- [x] Logout accessible from user menu

✓ **Navigation**
- [x] All 19 PRD features are reachable
- [x] Mobile navigation specified (bottom tabs)
- [x] Breadcrumbs for deep navigation
- [x] 404 page defined for invalid routes
- [x] Complete route inventory provided

✓ **Core Features**
- [x] Music upload with metadata extraction
- [x] MLC API integration interface
- [x] Distribution partner integration interface
- [x] SoundExchange integration interface
- [x] PRO bulk registration interface
- [x] Copyright Office automation (Phase 2 noted)
- [x] Unified dashboard
- [x] Registration status tracking
- [x] Revenue projections
- [x] Missing registration alerts
- [x] Human-in-the-loop system
- [x] API credentials management

✓ **CRUD Operations**
- [x] Create: Upload songs, add platforms
- [x] Read: View all lists and details
- [x] Update: Edit metadata, settings
- [x] Delete: Remove songs with confirmations

✓ **Error Handling**
- [x] Network errors with retry
- [x] Validation errors inline
- [x] Platform API errors handled
- [x] Permission errors graceful
- [x] File upload errors specific
- [x] Not found pages exist

✓ **States**
- [x] Empty states defined for all lists
- [x] Loading states with skeletons
- [x] Error states with recovery
- [x] Success feedback specified
- [x] Offline behavior defined

✓ **Responsive Design**
- [x] Mobile layout specified
- [x] Tablet adaptations defined
- [x] Desktop full experience
- [x] Touch interactions included

✓ **Accessibility**
- [x] Keyboard navigation complete
- [x] Screen reader support specified
- [x] Visual accessibility standards
- [x] Form accessibility defined

✓ **Performance**
- [x] Loading strategies defined
- [x] Caching approach specified
- [x] Optimization techniques listed

---

## Notes

- Phase 1 focuses on API integrations (MLC, Distribution Partners, SoundExchange, PRO bulk)
- Phase 2 adds browser automation (Copyright Office, Direct PRO portals)
- Demo account (demo@example.com/demo123) provides full access with sample data
- Platform health monitoring is critical for trust
- Human-in-the-loop system ensures 100% success rate
- WebSocket connections provide real-time updates for registration status
- All external platform links open in new tabs to maintain session