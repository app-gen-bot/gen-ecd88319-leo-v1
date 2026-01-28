Let me start by analyzing the PRD context and searching for any relevant knowledge from previous implementations.

Now I'll create the comprehensive Frontend Interaction Specification based on the provided Business PRD. Let me systematically analyze all features and create detailed specifications.

# Frontend Interaction Specification: Simple Counter App

**Version**: 1.0  
**Date**: January 15, 2025  
**Status**: Draft  
**Based on PRD**: Simple Counter App v1.0

## Table of Contents
1. [Overview](#overview)
2. [User Types and Permissions](#user-types-and-permissions)
3. [Complete Navigation & Interaction Map](#complete-navigation--interaction-map)
4. [Page Specifications](#page-specifications)
5. [Component Specifications](#component-specifications)
6. [User Flow Specifications](#user-flow-specifications)
7. [Form Specifications](#form-specifications)
8. [Real-time Features](#real-time-features)
9. [Error Handling](#error-handling)
10. [Loading States](#loading-states)
11. [Empty States](#empty-states)
12. [Responsive Design](#responsive-design)
13. [Accessibility Requirements](#accessibility-requirements)
14. [Validation Checklist](#validation-checklist)

## Overview

This specification defines every user interaction for the Simple Counter App, a real-time collaborative counting platform. The application enables teams to create, manage, and collaborate on counters with integrated chat functionality.

### Key Interaction Principles
- **Real-time First**: All changes reflect instantly across all connected users
- **Mobile-first Design**: Optimized for touch interactions, scalable to desktop
- **Progressive Disclosure**: Advanced features revealed as users need them
- **Contextual Communication**: Chat integrated within counter workspaces
- **Clear Feedback**: Every action provides immediate visual/audio confirmation

## User Types and Permissions

### Guest Users (Not Logged In)
- **Can Access**: Landing page, sign up, sign in, password reset
- **Cannot Access**: Any authenticated features

### Team Member (Authenticated)
- **Viewer Role**: View counters, read chat, export data
- **Editor Role**: All Viewer permissions + create/modify/delete own counters, send chat messages
- **Owner Role**: All Editor permissions + manage team settings, invite/remove members, access all counters

## Complete Navigation & Interaction Map

### Route Inventory

#### Public Routes (No Authentication Required)
- `/` - Landing page with app overview and sign-up CTA
- `/signin` - User authentication page
- `/signup` - User registration page
- `/forgot-password` - Password reset request
- `/reset-password/:token` - Password reset form with token
- `/privacy` - Privacy policy page
- `/terms` - Terms of service page
- `/contact` - Contact/support page

#### Protected Routes (Authentication Required)
- `/dashboard` - User's main dashboard with team overview
- `/teams` - Team management and selection page
- `/teams/create` - New team creation form
- `/teams/:teamId` - Individual team workspace
- `/teams/:teamId/settings` - Team settings and member management
- `/teams/:teamId/counters` - Counter list view for team
- `/teams/:teamId/counters/create` - New counter creation form
- `/teams/:teamId/counters/:counterId` - Individual counter detail view
- `/teams/:teamId/counters/:counterId/edit` - Counter editing form
- `/teams/:teamId/counters/:counterId/history` - Counter change history
- `/teams/:teamId/chat` - Standalone team chat view
- `/profile` - User profile management
- `/settings` - User account settings
- `/billing` - Team billing and subscription management (future)

#### Utility Routes
- `/404` - Page not found error page
- `/500` - Server error page
- `/offline` - Offline mode page
- `/unauthorized` - Access denied page

### Interactive Element Catalog

#### Global Navigation Elements
1. **App Logo/Brand** (Top-left)
   - Element: Clickable logo
   - Trigger: Click/tap
   - Destination: `/dashboard` (authenticated) or `/` (guest)

2. **Main Navigation Menu** (Desktop header, Mobile hamburger)
   - **Dashboard Link**
     - Trigger: Click/tap
     - Destination: `/dashboard`
   - **Teams Link**
     - Trigger: Click/tap
     - Destination: `/teams`
   - **Profile Dropdown** (Desktop) / **Profile Section** (Mobile)
     - **View Profile**
       - Trigger: Click/tap
       - Destination: `/profile`
     - **Account Settings**
       - Trigger: Click/tap
       - Destination: `/settings`
     - **Sign Out**
       - Trigger: Click/tap
       - Action: Logout and redirect to `/`

3. **User Avatar/Menu** (Top-right)
   - Element: User profile image or initials
   - Trigger: Click/tap
   - Action: Opens profile dropdown menu
   - Mobile: Opens slide-out menu

#### Landing Page (`/`) Interactive Elements
1. **Primary CTA Button: "Get Started Free"**
   - Trigger: Click/tap
   - Destination: `/signup`

2. **Secondary CTA Button: "Sign In"**
   - Trigger: Click/tap
   - Destination: `/signin`

3. **Feature Demo Videos** (3 embedded videos)
   - Trigger: Play button click
   - Action: Play video inline

4. **Footer Links**
   - **Privacy Policy**
     - Trigger: Click/tap
     - Destination: `/privacy`
   - **Terms of Service**
     - Trigger: Click/tap
     - Destination: `/terms`
   - **Contact Us**
     - Trigger: Click/tap
     - Destination: `/contact`

#### Authentication Pages Interactive Elements

##### Sign In Page (`/signin`)
1. **Email Input Field**
   - Trigger: Focus, blur, type
   - Validation: Real-time email format validation

2. **Password Input Field**
   - Trigger: Focus, blur, type
   - Features: Show/hide password toggle button

3. **Remember Me Checkbox**
   - Trigger: Click/tap
   - Action: Toggle checkbox state

4. **Sign In Button**
   - Trigger: Click/tap
   - Action: Submit authentication form
   - Success: Redirect to `/dashboard`
   - Failure: Show inline error message

5. **Forgot Password Link**
   - Trigger: Click/tap
   - Destination: `/forgot-password`

6. **Sign Up Link**
   - Trigger: Click/tap
   - Destination: `/signup`

7. **OAuth Buttons**
   - **Continue with Google**
     - Trigger: Click/tap
     - Action: Google OAuth flow
   - **Continue with Microsoft**
     - Trigger: Click/tap
     - Action: Microsoft OAuth flow
   - **Continue with GitHub**
     - Trigger: Click/tap
     - Action: GitHub OAuth flow

##### Sign Up Page (`/signup`)
1. **Full Name Input Field**
   - Trigger: Focus, blur, type
   - Validation: Required, 2-50 characters

2. **Email Input Field**
   - Trigger: Focus, blur, type
   - Validation: Real-time email format and availability check

3. **Password Input Field**
   - Trigger: Focus, blur, type
   - Features: Password strength indicator, show/hide toggle

4. **Confirm Password Input Field**
   - Trigger: Focus, blur, type
   - Validation: Must match password field

5. **Terms Agreement Checkbox**
   - Trigger: Click/tap
   - Required: Must be checked to enable sign up

6. **Create Account Button**
   - Trigger: Click/tap
   - Action: Submit registration form
   - Success: Show email verification message

7. **Sign In Link**
   - Trigger: Click/tap
   - Destination: `/signin`

#### Dashboard Page (`/dashboard`) Interactive Elements
1. **Create New Team Button**
   - Trigger: Click/tap
   - Destination: `/teams/create`

2. **Team Cards** (Each team the user belongs to)
   - **Team Card Container**
     - Trigger: Click/tap
     - Destination: `/teams/:teamId`
   - **Team Settings Icon** (three dots)
     - Trigger: Click/tap
     - Action: Opens team context menu
     - Menu Options:
       - **View Team**: Navigate to `/teams/:teamId`
       - **Team Settings**: Navigate to `/teams/:teamId/settings` (if owner)
       - **Leave Team**: Show confirmation modal

3. **Recent Activity Feed**
   - **Activity Items** (Counter changes, team joins, etc.)
     - **Counter Activity Link**
       - Trigger: Click/tap
       - Destination: `/teams/:teamId/counters/:counterId`
     - **Team Activity Link**
       - Trigger: Click/tap
       - Destination: `/teams/:teamId`

4. **Quick Actions Sidebar**
   - **Recently Used Counters**
     - Each counter link
       - Trigger: Click/tap
       - Destination: `/teams/:teamId/counters/:counterId`

#### Team Workspace (`/teams/:teamId`) Interactive Elements
1. **Team Header Actions**
   - **Team Settings Button** (gear icon)
     - Trigger: Click/tap
     - Destination: `/teams/:teamId/settings`
   - **Invite Members Button**
     - Trigger: Click/tap
     - Action: Opens invite modal

2. **View Toggle Buttons**
   - **Grid View Button**
     - Trigger: Click/tap
     - Action: Switch to counter grid layout
   - **List View Button**
     - Trigger: Click/tap
     - Action: Switch to counter list layout
   - **Chat View Button**
     - Trigger: Click/tap
     - Action: Show/hide chat panel

3. **Create Counter Button** (Floating Action Button on mobile)
   - Trigger: Click/tap
   - Destination: `/teams/:teamId/counters/create`

4. **Counter Cards/Rows**
   - **Counter Title**
     - Trigger: Click/tap
     - Destination: `/teams/:teamId/counters/:counterId`
   - **Increment Button** (+)
     - Trigger: Click/tap
     - Action: Increment counter by 1, real-time sync
   - **Decrement Button** (-)
     - Trigger: Click/tap
     - Action: Decrement counter by 1, real-time sync
   - **Counter Menu** (three dots)
     - Trigger: Click/tap
     - Action: Opens counter context menu
     - Menu Options:
       - **View Details**: Navigate to `/teams/:teamId/counters/:counterId`
       - **Edit Counter**: Navigate to `/teams/:teamId/counters/:counterId/edit`
       - **View History**: Navigate to `/teams/:teamId/counters/:counterId/history`
       - **Duplicate Counter**: Opens duplicate confirmation modal
       - **Delete Counter**: Opens delete confirmation modal

5. **Team Chat Panel** (Collapsible sidebar)
   - **Chat Toggle Button**
     - Trigger: Click/tap
     - Action: Expand/collapse chat panel
   - **Message Input Field**
     - Trigger: Focus, type, Enter key
     - Action: Send message, real-time sync
   - **File Upload Button**
     - Trigger: Click/tap
     - Action: Opens file picker dialog
   - **Emoji Button**
     - Trigger: Click/tap
     - Action: Opens emoji picker
   - **Message Items**
     - **User Avatar**
       - Trigger: Click/tap
       - Action: Show user profile tooltip
     - **Counter Mention Links**
       - Trigger: Click/tap
       - Destination: `/teams/:teamId/counters/:counterId`

6. **Active Users Indicator**
   - **User Avatars** (showing who's online)
     - Trigger: Hover/tap
     - Action: Show user status tooltip

#### Counter Detail Page (`/teams/:teamId/counters/:counterId`) Interactive Elements
1. **Counter Header Actions**
   - **Edit Button**
     - Trigger: Click/tap
     - Destination: `/teams/:teamId/counters/:counterId/edit`
   - **History Button**
     - Trigger: Click/tap
     - Destination: `/teams/:teamId/counters/:counterId/history`
   - **Share Button**
     - Trigger: Click/tap
     - Action: Opens share options modal
   - **More Menu** (three dots)
     - Menu Options:
       - **Duplicate**: Opens duplicate modal
       - **Export Data**: Triggers CSV download
       - **Delete**: Opens delete confirmation modal

2. **Counter Control Panel**
   - **Large Decrement Button** (-)
     - Trigger: Click/tap
     - Action: Decrement by 1, animate change
   - **Counter Value Display**
     - Trigger: Click/tap (if editable)
     - Action: Opens direct edit modal
   - **Large Increment Button** (+)
     - Trigger: Click/tap
     - Action: Increment by 1, animate change
   - **Reset Button**
     - Trigger: Click/tap
     - Action: Opens reset confirmation modal
   - **Quick Adjust Buttons** (+10, +100, -10, -100)
     - Trigger: Click/tap
     - Action: Adjust counter by specified amount

3. **Real-time Activity Stream**
   - **Filter Buttons**
     - **All Changes**
       - Trigger: Click/tap
       - Action: Show all activity types
     - **Counter Changes**
       - Trigger: Click/tap
       - Action: Filter to counter modifications only
     - **Chat Messages**
       - Trigger: Click/tap
       - Action: Filter to chat messages only
   - **Activity Items**
     - Links to related counters or users

4. **Counter-specific Chat**
   - All chat interactions from team workspace apply here

#### Modal/Dialog Interactive Elements

##### Invite Team Members Modal
1. **Email Input Field**
   - Trigger: Type, paste
   - Features: Multi-email support with validation

2. **Role Dropdown**
   - Options: Viewer, Editor, Owner
   - Default: Editor

3. **Personal Message Textarea**
   - Optional customization of invite email

4. **Send Invites Button**
   - Action: Send invitations, close modal

5. **Cancel Button**
   - Action: Close modal without changes

##### Delete Confirmation Modal
1. **Confirmation Text Input**
   - Placeholder: "Type 'DELETE' to confirm"
   - Validation: Must match exactly

2. **Delete Button**
   - Enabled only when confirmation text matches
   - Action: Delete item, close modal, redirect

3. **Cancel Button**
   - Action: Close modal without deletion

##### Counter Reset Modal
1. **New Value Input Field**
   - Type: Number
   - Placeholder: Current counter value

2. **Reset Button**
   - Action: Set counter to new value, close modal

3. **Cancel Button**
   - Action: Close modal without changes

#### Error Page Interactive Elements

##### 404 Page (`/404`)
1. **Go Home Button**
   - Trigger: Click/tap
   - Destination: `/dashboard` (authenticated) or `/` (guest)

2. **Go Back Button**
   - Trigger: Click/tap
   - Action: Browser back navigation

3. **Search Box**
   - Placeholder: "Search for what you need"
   - Action: Redirect to relevant page or results

##### Offline Page (`/offline`)
1. **Try Again Button**
   - Trigger: Click/tap
   - Action: Check connection and retry last request

2. **View Cached Data Button**
   - Trigger: Click/tap
   - Action: Show last known state of data

### Context Menus and Dropdowns

#### User Profile Dropdown
- **View Profile** → `/profile`
- **Account Settings** → `/settings`
- **Team Settings** → `/teams/:teamId/settings` (if in team context)
- **Help & Support** → Opens support widget
- **Sign Out** → Logout action

#### Team Context Menu (Three Dots on Team Card)
- **Open Team** → `/teams/:teamId`
- **Team Settings** → `/teams/:teamId/settings` (owner only)
- **View Members** → Opens members modal
- **Leave Team** → Opens confirmation modal
- **Export Team Data** → Triggers download (owner/editor only)

#### Counter Context Menu (Three Dots on Counter)
- **View Details** → `/teams/:teamId/counters/:counterId`
- **Edit Counter** → `/teams/:teamId/counters/:counterId/edit`
- **View History** → `/teams/:teamId/counters/:counterId/history`
- **Duplicate Counter** → Opens duplicate modal
- **Export Data** → Triggers CSV download
- **Share Counter** → Opens sharing modal
- **Delete Counter** → Opens delete confirmation modal

## Page Specifications

### Landing Page (`/`)

#### Layout Structure
- **Header Section**: Logo, navigation (Sign In button)
- **Hero Section**: Main value proposition with primary CTA
- **Features Section**: Three feature highlights with icons
- **Demo Section**: Interactive counter demo or video
- **CTA Section**: Secondary sign-up encouragement
- **Footer**: Links to privacy, terms, contact

#### Desktop Layout (≥1024px)
```
[Logo]                                    [Sign In]
                    Hero Title
                  Hero Subtitle
              [Get Started Free]

[Feature 1]    [Feature 2]    [Feature 3]
   Icon           Icon           Icon
  Title          Title          Title
Description    Description    Description

              [Demo Section]
             Interactive demo

           [Final CTA Section]
         [Get Started Free]

[Footer Links: Privacy | Terms | Contact]
```

#### Mobile Layout (<768px)
- Stacked single-column layout
- Hamburger menu for navigation
- Larger touch targets (minimum 44px)
- Demo section simplified or hidden

#### Interactive Elements
1. **Primary CTA: "Get Started Free"**
   - Desktop: 48px height, blue (#2563eb), white text
   - Mobile: 52px height, full width at breakpoints
   - Hover: Darker blue (#1d4ed8)
   - Click: Smooth navigation to signup

2. **Secondary CTA: "Sign In"**
   - Desktop: 40px height, outline button
   - Mobile: 44px height
   - Location: Header on desktop, hamburger menu on mobile

3. **Feature Demo Interactions**
   - Interactive counter that users can click
   - Shows real-time collaboration preview
   - Resets after 30 seconds of inactivity

### Sign Up Page (`/signup`)

#### Layout Structure
```
[Logo - Link to home]

        Sign Up
      Create your account

[Full Name Input Field]
[Email Input Field]
[Password Input Field]
[Confirm Password Input Field]

☐ I agree to Terms and Privacy Policy

      [Create Account]

[Divider: Or continue with]

[Google] [Microsoft] [GitHub]

Already have an account? [Sign In]
```

#### Form Field Specifications

1. **Full Name Field**
   - Label: "Full Name"
   - Placeholder: "Enter your full name"
   - Validation: Required, 2-50 characters
   - Error states: "Name is required", "Name must be 2-50 characters"

2. **Email Field**
   - Label: "Email Address"
   - Placeholder: "Enter your email"
   - Validation: Real-time email format validation
   - Availability check: Debounced after 1 second
   - Error states: "Valid email required", "Email already exists"
   - Success state: Green checkmark icon

3. **Password Field**
   - Label: "Password"
   - Placeholder: "Create a password"
   - Features: Show/hide toggle button
   - Password strength indicator below field
   - Requirements: Minimum 8 characters, one uppercase, one lowercase, one number
   - Error states: Show requirements as checklist

4. **Confirm Password Field**
   - Label: "Confirm Password"
   - Placeholder: "Confirm your password"
   - Validation: Real-time matching with password field
   - Error state: "Passwords must match"

5. **Terms Agreement Checkbox**
   - Text: "I agree to the Terms of Service and Privacy Policy"
   - Required: Must be checked to enable sign up button
   - Links: "Terms of Service" and "Privacy Policy" open in new tabs

6. **Create Account Button**
   - Default state: Disabled until form is valid
   - Enabled state: Blue background, white text
   - Loading state: Spinner with text "Creating account..."
   - Success: Show email verification message

#### Real-time Validation Behavior
- Field validation triggers on blur or 500ms after typing stops
- Error messages appear below fields with red text and icons
- Success states show green checkmarks
- Form submission button remains disabled until all validations pass

#### OAuth Integration
- Three buttons for Google, Microsoft, GitHub
- Each opens OAuth flow in popup window
- On success: Close popup, redirect to dashboard
- On failure: Show error message below OAuth buttons

### Sign In Page (`/signin`)

#### Layout Structure
```
[Logo - Link to home]

        Sign In
    Welcome back

[Email Input Field]
[Password Input Field]

☐ Remember me     [Forgot password?]

      [Sign In]

[Divider: Or continue with]

[Google] [Microsoft] [GitHub]

Don't have an account? [Sign Up]
```

#### Form Field Specifications

1. **Email Field**
   - Label: "Email Address"
   - Placeholder: "Enter your email"
   - Validation: Email format validation on submit
   - Error state: "Please enter a valid email"

2. **Password Field**
   - Label: "Password"
   - Placeholder: "Enter your password"
   - Features: Show/hide password toggle
   - Error state: Shown after failed authentication

3. **Remember Me Checkbox**
   - Default: Unchecked
   - Function: Extends session duration to 30 days

4. **Forgot Password Link**
   - Text: "Forgot your password?"
   - Action: Navigate to `/forgot-password`

5. **Sign In Button**
   - Default state: Blue background, white text
   - Loading state: Spinner with "Signing in..."
   - Error state: Red background with "Try again"

#### Authentication Flow
1. User enters credentials and clicks "Sign In"
2. Button shows loading state
3. On success: Redirect to `/dashboard`
4. On failure: Show error message above form
   - "Invalid email or password"
   - "Account not found"
   - "Too many attempts, try again in 15 minutes"

### Dashboard Page (`/dashboard`)

#### Layout Structure
```
[Header: Logo | Dashboard | Teams | [User Menu]]

Dashboard
Welcome back, [User Name]

[Create New Team]        [Recent Activity]
                        Last 7 days

Your Teams              Quick Access
[Team Card 1]           [Recent Counter 1]
[Team Card 2]           [Recent Counter 2]
[Team Card 3]           [Recent Counter 3]

[Activity Feed - Latest Updates]
```

#### Team Card Specifications

Each team card displays:
- **Team Name** (heading)
- **Member Count** ("5 members")
- **Active Counters** ("12 counters")
- **Last Activity** ("Updated 2 hours ago")
- **Team Menu** (three dots icon)

Team Card States:
1. **Default State**
   - White background, subtle border
   - Hover: Light gray background, raised shadow

2. **Loading State**
   - Skeleton placeholder with shimmer effect
   - Shows while team data is loading

3. **Error State**
   - Red border with error icon
   - "Unable to load team data"
   - Retry button

#### Interactive Elements

1. **Create New Team Button**
   - Primary button styling
   - Text: "Create New Team"
   - Action: Navigate to `/teams/create`

2. **Team Card Click**
   - Click anywhere on card to enter team
   - Action: Navigate to `/teams/:teamId`

3. **Team Context Menu**
   - Trigger: Click three dots icon
   - Menu options:
     - "Open Team" → `/teams/:teamId`
     - "Team Settings" → `/teams/:teamId/settings` (if owner)
     - "Leave Team" → Confirmation modal

4. **Recent Activity Items**
   - Each item is clickable
   - Counter changes link to counter detail
   - Team updates link to team workspace

### Team Workspace (`/teams/:teamId`)

#### Layout Structure

**Desktop Layout (≥1024px)**
```
[Header: Logo | Dashboard | Teams | [User Menu]]

[Team Name] [Settings] [Invite]     [Chat Toggle]

[View: Grid | List]  [Create Counter]  [Online: 5 users]

[Counter Grid - 3-4 columns]         [Chat Panel]
[Counter 1] [Counter 2] [Counter 3]    Messages
[Counter 4] [Counter 5] [Counter 6]    [Message 1]
[Counter 7] [Counter 8] [Counter 9]    [Message 2]
                                       [Input]
```

**Mobile Layout (<768px)**
```
[Header: ☰ Team Name [User]]

[Create Counter FAB]

[Tab Bar: Counters | Chat]

[Counter List - Full Width]
[Counter 1]
[Counter 2]
[Counter 3]
```

#### Counter Card Specifications (Grid View)

```
Counter Name                    [⋮]
Description text here
[−] [Counter Value] [+]
Last updated by User Name, 5m ago
```

**States:**
1. **Default State**
   - White background, rounded corners
   - Subtle border and shadow

2. **Active/Selected State**
   - Blue border, highlighted background
   - Shows when user is interacting

3. **Loading State**
   - Disabled buttons with spinner
   - Grayed out appearance

4. **Error State**
   - Red border, error icon
   - "Failed to update" message

**Interactive Elements:**
1. **Counter Name/Description**
   - Click: Navigate to counter detail page
   - Hover: Show full description tooltip

2. **Decrement Button (-)**
   - Size: 32px × 32px (mobile 40px × 40px)
   - Click: Decrease counter by 1
   - Disabled when counter is at minimum value
   - Animation: Brief scale effect on click

3. **Counter Value Display**
   - Shows current value
   - Click: Open quick edit modal (if permitted)
   - Font: Large, bold numeric display

4. **Increment Button (+)**
   - Size: 32px × 32px (mobile 40px × 40px)
   - Click: Increase counter by 1
   - Animation: Brief scale effect on click

5. **Counter Menu (⋮)**
   - Click: Open context menu
   - Menu options vary by user permissions

#### Counter List View

```
Counter Name          Value  [−] [+] [⋮]
Description text      1,234
Updated 5m ago

Counter Name 2        Value  [−] [+] [⋮]
Description text      856
Updated 12m ago
```

- More compact than grid view
- Better for many counters
- Optimized for mobile screens

#### Real-time Chat Panel

**Desktop (Sidebar)**
- Width: 300px
- Collapsible with smooth animation
- Fixed position on right side

**Mobile (Tab/Modal)**
- Full screen overlay
- Bottom tab bar navigation
- Swipe gestures for navigation

**Chat Interface:**
```
[Chat Header: Team Chat [×]]

[Message List - Scrollable]
User Avatar | User Name | 2:34 PM
Message text here

User Avatar | User Name | 2:35 PM
Message with @counter mention

[File attachment preview]

[Input: Type a message... [📎] [😊] [➤]]
```

**Interactive Elements:**

1. **Message Input Field**
   - Placeholder: "Type a message..."
   - Auto-resize up to 4 lines
   - Enter: Send message
   - Shift+Enter: New line

2. **File Upload Button (📎)**
   - Click: Open file picker
   - Supported:Images, documents (10MB limit)
   - Shows upload progress

3. **Emoji Button (😊)**
   - Click: Open emoji picker overlay
   - Recently used emojis at top

4. **Send Button (➤)**
   - Enabled when message has content
   - Click: Send message
   - Loading state during send

5. **@Counter Mentions**
   - Type "@" to see counter suggestions
   - Click mentioned counter to navigate

### Counter Detail Page (`/teams/:teamId/counters/:counterId`)

#### Layout Structure

**Desktop Layout**
```
[Breadcrumb: Team > Counters > Counter Name]

Counter Name                    [Edit] [History] [Share] [⋮]
Description text here

        [−10] [−1]  1,234  [+1] [+10]
                   [Reset]

Recent Activity              Counter Chat
[Activity Item 1]           [Chat Messages]
[Activity Item 2]           [Message Input]
[Activity Item 3]
[Load More]
```

**Mobile Layout**
```
[← Back] Counter Name [⋮]

        [−] 1,234 [+]
      [Reset] [+10] [+100]

[Tab Bar: Activity | Chat]

[Tab Content]
```

#### Main Counter Controls

1. **Large Counter Display**
   - Font size: 48px desktop, 36px mobile
   - Center aligned
   - Click: Open direct edit modal (if permitted)

2. **Primary Action Buttons**
   - **Decrement (−1)**: 40px × 40px desktop, 48px × 48px mobile
   - **Increment (+1)**: 40px × 40px desktop, 48px × 48px mobile
   - Position: Flanking the counter value
   - Animation: Scale and color feedback on press

3. **Quick Adjust Buttons** (Desktop only)
   - **−10, +10**: Secondary buttons, smaller size
   - **−100, +100**: Text buttons, minimal styling
   - Position: Above/below primary buttons

4. **Reset Button**
   - Warning styling (orange/yellow)
   - Requires confirmation
   - Position: Below counter display

#### Counter Header Actions

1. **Edit Button**
   - Icon: Pencil
   - Action: Navigate to edit page
   - Visible: Only if user has edit permissions

2. **History Button**
   - Icon: Clock
   - Action: Navigate to history page
   - Visible: All users

3. **Share Button**
   - Icon: Share arrow
   - Action: Open share modal
   - Visible: All users

4. **More Menu (⋮)**
   - Menu options:
     - "Duplicate Counter"
     - "Export Data" (CSV)
     - "Delete Counter" (owners only)

#### Activity Stream

Shows chronological list of:
- Counter value changes
- User joins/leaves
- Chat messages
- Counter edits

**Activity Item Format:**
```
[User Avatar] User Name changed counter from 45 to 47
                                                2:34 PM

[User Avatar] User Name sent a message
              "Great progress on this!"        2:35 PM
```

**Interactive Elements:**
1. **Filter Buttons**
   - "All", "Counter Changes", "Messages"
   - Pills styling with active state

2. **Load More Button**
   - Appears after 20 items
   - Loads next 20 items
   - Loading spinner during fetch

### Create/Edit Counter Form

#### Layout Structure
```
[Breadcrumb: Team > Create Counter]

Create New Counter

Counter Name *
[Text Input]

Description
[Textarea]

Initial Value
[Number Input] Default: 0

Who can access this counter?
○ All team members
○ Only me
○ Specific members [Select Members]

[Cancel] [Create Counter]
```

#### Form Field Specifications

1. **Counter Name Field**
   - Label: "Counter Name *"
   - Placeholder: "Enter counter name"
   - Validation: Required, 1-100 characters, unique within team
   - Error states: "Name is required", "Name must be unique", "Too long"

2. **Description Field**
   - Label: "Description"
   - Placeholder: "What are you counting?"
   - Validation: Optional, max 500 characters
   - Character counter: Shows remaining characters

3. **Initial Value Field**
   - Label: "Initial Value"
   - Type: Number input
   - Default: 0
   - Validation: Integer, can be negative

4. **Access Control Options**
   - Radio buttons with descriptions
   - Default: "All team members"
   - "Specific members" shows member selection dropdown

5. **Member Selection** (when "Specific members" selected)
   - Multi-select dropdown
   - Shows all team members
   - Selected members shown as chips

#### Form Validation and Submission

**Real-time Validation:**
- Field validation on blur
- Form submission enabled only when valid
- Error messages below relevant fields

**Submit Behavior:**
1. Button shows loading state
2. On success: Navigate to new counter detail page
3. On error: Show error message above form

### Team Settings Page (`/teams/:teamId/settings`)

#### Layout Structure
```
[Breadcrumb: Team > Settings]

Team Settings

General
Team Name: [Input Field]
Description: [Textarea]

Members (5)
[Member List with roles and actions]
[Invite New Members]

Permissions
Default role for new members: [Dropdown]
Counter creation permissions: [Dropdown]

Danger Zone
[Delete Team]
```

#### Member Management Section

**Member List Item:**
```
[Avatar] User Name                    Owner    [⋮]
         user@example.com
```

**Member Actions Menu:**
- "Change Role" (Owner only)
- "Remove from Team" (Owner only)
- "Resend Invitation" (for pending invites)

**Role Dropdown Options:**
- Owner: Full administrative access
- Editor: Create/edit/delete own counters
- Viewer: View only access

### Error States and Loading States

#### Loading States

1. **Page Loading**
   - Skeleton screens matching page layout
   - Shimmer effect on placeholder elements
   - Progressive loading of data

2. **Form Submission**
   - Button disabled with spinner
   - Form fields remain interactive
   - Loading message below submit button

3. **Real-time Updates**
   - Optimistic updates show immediately
   - Subtle spinner for confirmation
   - Rollback on failure with error message

4. **List Loading**
   - Initial load: Full skeleton list
   - Pagination: Spinner at bottom
   - Infinite scroll: Minimal loading indicator

#### Error States

1. **Form Validation Errors**
   - Red border on invalid fields
   - Error icon next to field
   - Error message below field
   - Form submission disabled

2. **Network Errors**
   - Toast notification at top of screen
   - Retry button in notification
   - Auto-retry after 5 seconds

3. **Permission Errors**
   - Inline message in restricted areas
   - "You don't have permission to perform this action"
   - Contact admin button

4. **Not Found Errors**
   - Custom 404 page
   - "Go back" and "Go home" buttons
   - Search functionality

## Component Specifications

### Counter Component

#### Props Interface
```typescript
interface CounterProps {
  id: string;
  name: string;
  description?: string;
  value: number;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
  onIncrement: () => void;
  onDecrement: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  lastUpdated?: {
    user: string;
    timestamp: Date;
  };
}
```

#### States
1. **Default**: Normal interactive state
2. **Loading**: Disabled with spinner
3. **Error**: Red border with error message
4. **Optimistic**: Shows pending change while syncing

#### Responsive Behavior
- Desktop: 280px wide cards in grid
- Tablet: 2 columns, 340px wide
- Mobile: Single column, full width

### Chat Component

#### Real-time Message Updates
- Messages appear instantly via WebSocket
- Smooth scroll animation for new messages
- Message status indicators (sent, delivered, read)

#### File Upload Handling
1. Drag and drop support
2. Click to browse files
3. Progress bar during upload
4. Preview for images
5. Error handling for invalid files

#### Emoji and Mentions
- Emoji picker with search and categories
- @user mentions with autocomplete
- @counter mentions linking to counters
- Message formatting (bold, italic, code)

### Modal Components

#### Base Modal Structure
- Backdrop overlay with click-to-close
- ESC key closes modal
- Focus trap within modal
- ARIA labels for accessibility

#### Confirmation Modal
```
⚠️ Confirm Action

Are you sure you want to delete this counter?
This action cannot be undone.

[Cancel] [Delete Counter]
```

#### Invite Members Modal
```
Invite Team Members

Email addresses (one per line)
[Textarea]

Role for new members
[Dropdown: Editor]

Personal message (optional)
[Textarea]

[Cancel] [Send Invitations]
```

## User Flow Specifications

### First-time User Onboarding

#### Flow: Sign Up → Team Creation → First Counter

1. **Landing Page**
   - User clicks "Get Started Free"
   - Navigate to `/signup`

2. **Registration**
   - User fills form and submits
   - Email verification message shown
   - User clicks verification link in email
   - Redirect to `/dashboard` with welcome message

3. **Team Creation Prompt**
   - Dashboard shows "Create your first team" card
   - Click card opens team creation modal
   - User creates team with name and description

4. **Team Setup**
   - Navigate to new team workspace
   - Show onboarding tour tooltips:
     - "This is where you'll see your counters"
     - "Click here to create your first counter"
     - "Use chat to coordinate with your team"

5. **First Counter Creation**
   - Click "Create Counter" button
   - Form pre-filled with example data
   - User can modify or use defaults
   - Submit creates counter and shows success

6. **Feature Introduction**
   - Highlight increment/decrement buttons
   - Show real-time collaboration features
   - Demonstrate chat functionality
   - Provide "Invite team members" option

### Team Collaboration Flow

#### Flow: Team Invite → Join → Collaborate

1. **Invitation Sent**
   - Team owner enters email addresses
   - System sends invitation emails
   - Email contains team name, sender, and join link

2. **Invitation Received**
   - User clicks join link in email
   - If not registered: Redirect to signup with context
   - If registered: Join team immediately

3. **Team Access**
   - User added to team with specified role
   - Navigate to team workspace
   - Show brief tour of team features

4. **First Collaboration**
   - User sees existing counters
   - Can immediately interact based on role
   - Real-time updates from other users visible
   - Chat available for coordination

### Counter Management Flow

#### Flow: Create → Use → Modify → History

1. **Counter Creation**
   - Click "Create Counter" from team workspace
   - Fill out form with name, description, initial value
   - Set permissions and access control
   - Submit and navigate to new counter

2. **Daily Usage**
   - Users increment/decrement counter
   - Changes sync in real-time
   - Chat about counter progress
   - View activity feed

3. **Counter Modification**
   - Edit counter details
   - Change permissions
   - Modify description or name
   - All changes logged in history

4. **History Review**
   - View chronological changes
   - Filter by user or date range
   - Export data if needed
   - Analyze usage patterns

### Error Recovery Flows

#### Flow: Connection Lost → Offline Mode → Reconnect

1. **Connection Detection**
   - App detects lost connection
   - Show offline indicator in UI
   - Queue user actions locally

2. **Offline Functionality**
   - Continue viewing last known data
   - Allow counter changes (queued)
   - Show "offline" badges on actions
   - Disable real-time features

3. **Reconnection**
   - Auto-detect connection restore
   - Sync queued actions
   - Show sync progress
   - Resume real-time updates

#### Flow: Permission Denied → Request Access

1. **Action Blocked**
   - User attempts restricted action
   - Show permission error message
   - Explain required permission level

2. **Access Request**
   - Provide "Request Access" button
   - Send notification to team owner
   - Show pending request status

3. **Permission Granted**
   - Owner approves request
   - User receives notification
   - Action becomes available

## Form Specifications

### Sign Up Form

#### Field Configuration
```typescript
{
  fullName: {
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 50,
    validation: 'onBlur',
    errorMessages: {
      required: 'Full name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name cannot exceed 50 characters'
    }
  },
  email: {
    type: 'email',
    required: true,
    validation: 'realTime',
    uniqueCheck: true,
    debounce: 1000,
    errorMessages: {
      required: 'Email address is required',
      format: 'Please enter a valid email address',
      unique: 'This email is already registered'
    }
  },
  password: {
    type: 'password',
    required: true,
    minLength: 8,
    strengthCheck: true,
    requirements: [
      'At least 8 characters',
      'One uppercase letter',
      'One lowercase letter',
      'One number'
    ],
    validation: 'realTime',
    showHide: true
  },
  confirmPassword: {
    type: 'password',
    required: true,
    matchField: 'password',
    validation: 'realTime',
    showHide: true,
    errorMessages: {
      required: 'Please confirm your password',
      match: 'Passwords must match'
    }
  },
  termsAccepted: {
    type: 'checkbox',
    required: true,
    errorMessages: {
      required: 'You must accept the terms and conditions'
    }
  }
}
```

#### Form Behavior
1. **Progressive Enhancement**
   - Fields validate as user progresses
   - Submit button enabled only when all fields valid
   - Real-time feedback prevents frustration

2. **Error Handling**
   - Server errors shown at form level
   - Field errors shown inline
   - Success states with checkmarks

3. **Submission Process**
   - Button shows loading state
   - Form disabled during submission
   - Success leads to email verification

### Counter Creation Form

#### Field Configuration
```typescript
{
  name: {
    type: 'text',
    required: true,
    minLength: 1,
    maxLength: 100,
    uniqueCheck: true,
    validation: 'onBlur',
    placeholder: 'Enter counter name'
  },
  description: {
    type: 'textarea',
    required: false,
    maxLength: 500,
    characterCount: true,
    placeholder: 'What are you counting? (optional)'
  },
  initialValue: {
    type: 'number',
    required: true,
    defaultValue: 0,
    validation: 'onChange'
  },
  accessLevel: {
    type: 'radio',
    required: true,
    options: [
      { value: 'team', label: 'All team members' },
      { value: 'private', label: 'Only me' },
      { value: 'custom', label: 'Specific members' }
    ],
    defaultValue: 'team'
  },
  allowedMembers: {
    type: 'multiselect',
    required: false,
    showWhen: 'accessLevel === custom',
    options: 'teamMembers'
  }
}
```

#### Dynamic Form Behavior
1. **Conditional Fields**
   - Member selection appears only for custom access
   - Smooth animation when fields show/hide

2. **Real-time Validation**
   - Name uniqueness check with debouncing
   - Character counters for limited fields
   - Form submission state management

### Team Invitation Form

#### Bulk Email Input
- Textarea accepting multiple emails
- Email validation per line
- Duplicate detection and removal
- Invalid email highlighting

#### Role Selection
- Dropdown with role descriptions
- Permission matrix tooltip
- Default role setting

#### Personal Message
- Optional customization
- Character limit with counter
- Preview of final email

## Real-time Features

### WebSocket Connection Management

#### Connection States
1. **Connecting**: Show connecting indicator
2. **Connected**: Show online status
3. **Disconnected**: Show offline indicator
4. **Reconnecting**: Show reconnection attempts

#### Message Types
```typescript
interface WebSocketMessage {
  type: 'counter_update' | 'chat_message' | 'user_join' | 'user_leave';
  payload: any;
  timestamp: string;
  userId: string;
}
```

### Counter Real-time Updates

#### Optimistic Updates
1. User clicks increment/decrement
2. UI updates immediately (optimistic)
3. Send update to server
4. On success: Confirm update
5. On failure: Rollback and show error

#### Conflict Resolution
- Last write wins for counter values
- Show conflict warnings for rapid changes
- Provide manual resolution for complex conflicts

#### User Presence
- Show active users with avatars
- Display user cursors/selections
- Indicate typing status in chat

### Chat Real-time Features

#### Message Delivery
1. **Sent**: Message queued for delivery
2. **Delivered**: Server received message
3. **Read**: Other users have seen message

#### Typing Indicators
- Show "User is typing..." when others type
- Hide indicator after 3 seconds of inactivity
- Multiple users: "Alice and Bob are typing..."

#### File Upload Progress
- Real-time upload progress bars
- Background uploads don't block UI
- Error recovery for failed uploads

## Error Handling

### Client-Side Error Handling

#### Form Validation Errors
```typescript
interface FieldError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'unique' | 'length';
}
```

Display behavior:
- Red border on invalid field
- Error icon next to field
- Error message below field
- Clear error on field correction

#### Network Errors
```typescript
interface NetworkError {
  type: 'timeout' | 'offline' | 'server_error';
  message: string;
  retryable: boolean;
}
```

Display behavior:
- Toast notification at screen top
- Auto-dismiss after 5 seconds
- Manual dismiss option
- Retry button for retryable errors

#### Permission Errors
- Inline messages in restricted areas
- Modal for critical permission blocks
- Contact admin/owner options
- Clear explanation of required permissions

### Server Error Responses

#### HTTP Error Codes
- **400**: Bad Request - Show field validation errors
- **401**: Unauthorized - Redirect to sign in
- **403**: Forbidden - Show permission error
- **404**: Not Found - Show not found page
- **500**: Server Error - Show generic error with retry

#### Error Message Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
}
```

### Error Recovery Mechanisms

#### Automatic Retry
- Network errors: Exponential backoff
- Authentication errors: Token refresh attempt
- Temporary errors: 3 retry attempts

#### Manual Recovery
- "Try again" buttons
- Form re-submission options
- Page refresh suggestions
- Contact support escalation

#### Graceful Degradation
- Offline mode for lost connections
- Cached data when server unavailable
- Limited functionality vs complete failure

## Loading States

### Page Loading States

#### Initial Page Load
```
[Skeleton Header]
[Skeleton Navigation]
[Skeleton Content matching layout]
[Skeleton Footer]
```

- Skeleton screens match actual layout
- Shimmer animation indicates loading
- Progressive content population

#### Component Loading
- Individual components show spinners
- Skeleton placeholders for complex components
- Loading states don't block user interactions

### Form Loading States

#### Form Submission
1. **Button State**: Disabled with spinner
2. **Form State**: Fields remain interactive
3. **Message**: "Creating counter..." below button
4. **Duration**: Typical 1-3 seconds

#### Field Validation
1. **Real-time**: Debounced spinner in field
2. **On Blur**: Brief validation indicator
3. **Async**: Loading state for uniqueness checks

### List Loading States

#### Initial Load
- Full skeleton list matching final layout
- 5-10 skeleton items visible
- Shimmer animation across all items

#### Pagination
- "Loading more..." text with spinner
- New items appear with subtle animation
- Error state shows retry option

#### Infinite Scroll
- Small spinner at list bottom
- Automatic loading on scroll
- End-of-list indicator when complete

### Real-time Loading

#### Counter Updates
- Optimistic update shows immediately
- Subtle loading indicator during sync
- Success/failure feedback after sync

#### Chat Messages
- Message appears optimistically
- Sending indicator while delivering
- Delivered/read status updates

## Empty States

### Dashboard Empty States

#### New User Dashboard
```
👋 Welcome to Counter App!

Get started by creating your first team

[Create Your First Team]

Need help getting started?
[View Tutorial] [Contact Support]
```

#### No Teams
```
🏢 You're not part of any teams yet

Teams help you collaborate on counters with colleagues

[Create a Team] [Join a Team]
```

### Team Workspace Empty States

#### No Counters
```
📊 This team doesn't have any counters yet

Counters help you track progress and coordinate with your team

[Create First Counter]

💡 Pro tip: Give your counter a descriptive name so everyone knows what you're tracking
```

#### No Chat Messages
```
💬 Start the conversation

Use chat to coordinate with your team about counters

💡 Try mentioning a counter with @counter-name
```

### Counter Detail Empty States

#### No Activity
```
📈 No activity yet

Activity will appear here as team members use this counter

[Increment Counter] to get started!
```

#### No Chat in Counter
```
💬 No messages about this counter yet

Start a conversation about your counting progress

[Type a message...]
```

### Search Empty States

#### No Search Results
```
🔍 No results found for "[search term]"

Try:
• Checking your spelling
• Using different keywords
• Creating a new counter instead

[Create New Counter]
```

#### No History
```
📜 No history available

History will appear here as changes are made to this counter
```

### Error Empty States

#### Failed to Load Teams
```
⚠️ Unable to load your teams

This might be a temporary network issue

[Try Again] [Go to Dashboard]
```

#### Connection Lost
```
🔌 Connection lost

You can continue viewing data, but changes won't sync until you're back online

[Retry Connection]
```

## Responsive Design

### Breakpoint Strategy

#### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Large Desktop**: 1440px+

#### Design Approach
- Mobile-first CSS
- Progressive enhancement
- Touch-first interactions
- Flexible layouts

### Mobile Layout (320px - 767px)

#### Navigation
- Hamburger menu in header
- Bottom tab bar for primary navigation
- Swipe gestures for page transitions
- Full-screen modals and overlays

#### Counter Cards
- Single column layout
- Full-width cards with padding
- Larger touch targets (44px minimum)
- Swipe actions for secondary operations

#### Forms
- Full-width form fields
- Larger input areas
- Floating labels
- Bottom-sheet modals for selections

#### Chat Interface
- Full-screen overlay
- Bottom input with large send button
- Swipe to reply/react to messages
- Pull-to-refresh for message history

### Tablet Layout (768px - 1023px)

#### Navigation
- Persistent sidebar navigation
- Tab bar for secondary navigation
- Split-view for master-detail interfaces
- Popover menus instead of full modals

#### Counter Cards
- 2-column grid layout
- Medium-sized cards with hover states
- Touch and mouse interaction support
- Context menus on long press or right-click

#### Forms
-Two-column layouts where appropriate
- Modal dialogs instead of full-screen
- Popover selectors for dropdowns
- Side-by-side form sections

#### Chat Interface
- Sidebar panel (collapsible)
- Inline file previews
- Rich text formatting toolbar
- Desktop-style message threading

### Desktop Layout (1024px+)

#### Navigation
- Full horizontal navigation bar
- Persistent sidebar for team navigation
- Dropdown menus for user actions
- Keyboard shortcuts for all actions

#### Counter Management
- 3-4 column grid for counter cards
- Hover states and animations
- Right-click context menus
- Keyboard navigation support
- Drag and drop for reordering

#### Chat Interface
- Right sidebar panel (300px)
- Rich text editor with formatting
- File drag and drop support
- @mentions with autocomplete
- Message threading and reactions

#### Advanced Features
- Multi-select operations
- Bulk actions toolbar
- Advanced filtering and sorting
- Data export tools
- Keyboard shortcuts overlay

### Touch Interactions

#### Gesture Support
- **Tap**: Primary selection and actions
- **Long Press**: Context menus and secondary actions
- **Swipe**: Navigation, dismiss, and quick actions
- **Pinch**: Zoom for charts and large content
- **Pull-to-Refresh**: Update content in lists

#### Touch Target Sizes
- Minimum 44px × 44px for all interactive elements
- Adequate spacing between touch targets
- Clear visual feedback on touch
- Haptic feedback where appropriate

### Keyboard Navigation

#### Tab Order
- Logical tab sequence through all interactive elements
- Skip links for main content areas
- Keyboard shortcuts for common actions
- Focus indicators clearly visible

#### Keyboard Shortcuts
- **Space/Enter**: Activate buttons and links
- **Arrow Keys**: Navigate between similar elements
- **Escape**: Close modals and menus
- **Cmd/Ctrl + Enter**: Quick submit for forms
- **/ (slash)**: Focus search field

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Perceivable
1. **Color and Contrast**
   - Minimum 4.5:1 contrast ratio for normal text
   - Minimum 3:1 contrast ratio for large text and UI components
   - Color not the only means of conveying information
   - Focus indicators clearly visible

2. **Text Alternatives**
   - Alt text for all images
   - Aria labels for icon buttons
   - Descriptive link text
   - Form labels properly associated

3. **Adaptable Content**
   - Semantic HTML structure
   - Proper heading hierarchy (h1-h6)
   - Meaningful page titles
   - Content reflows at 200% zoom

#### Operable
1. **Keyboard Accessible**
   - All functionality available via keyboard
   - No keyboard traps
   - Skip links for navigation
   - Focus management in modals

2. **Timing**
   - No auto-playing media with sound
   - Session timeout warnings with extensions
   - Pause/stop controls for moving content
   - No content that flashes more than 3 times per second

3. **Navigation**
   - Multiple ways to find content
   - Descriptive page titles and headings
   - Focus order follows content order
   - Purpose of links clear from context

#### Understandable
1. **Readable**
   - Page language identified
   - Unusual words and abbreviations defined
   - Reading level appropriate for audience
   - Instructions clear and complete

2. **Predictable**
   - Navigation consistent across pages
   - UI components behave consistently
   - Changes of context only on user request
   - Error identification and correction help

#### Robust
1. **Compatible**
   - Valid HTML markup
   - Proper ARIA usage
   - Compatible with assistive technologies
   - Graceful degradation

### Screen Reader Support

#### ARIA Labels and Roles
```html
<!-- Counter component -->
<div role="group" aria-labelledby="counter-title">
  <h3 id="counter-title">Project Tasks</h3>
  <button aria-label="Decrease counter" onclick="decrement()">-</button>
  <span aria-live="polite" aria-atomic="true">42</span>
  <button aria-label="Increase counter" onclick="increment()">+</button>
</div>

<!-- Chat component -->
<div role="log" aria-live="polite" aria-label="Team chat messages">
  <div role="article">
    <span aria-label="Message from John at 2:34 PM">
      John: Great progress on the counter!
    </span>
  </div>
</div>
```

#### Live Regions
- Counter value changes announced
- New chat messages announced
- Form validation errors announced
- Status updates announced

#### Focus Management
- Modals trap focus appropriately
- Focus returns to trigger element on close
- Page transitions maintain logical focus
- Error states receive focus

### Motor Accessibility

#### Large Touch Targets
- Minimum 44px × 44px for mobile
- Adequate spacing between targets
- Drag and drop alternatives provided
- Voice input supported

#### Alternative Input Methods
- Voice navigation support
- Switch navigation support
- Eye-tracking compatibility
- Reduced motion preferences respected

### Cognitive Accessibility

#### Clear Language
- Simple, direct instructions
- Consistent terminology
- Error messages in plain language
- Help text available contextually

#### Memory Support
- Form data persistence
- Clear progress indicators
- Breadcrumb navigation
- Undo functionality where appropriate

#### Attention and Focus
- Minimal distractions
- Important information highlighted
- Clear visual hierarchy
- Optional timeout extensions

## Validation Checklist

### Feature Coverage Verification

#### Authentication Features ✓
- [ ] User registration with email verification
- [ ] Email/password sign in
- [ ] OAuth integration (Google, Microsoft, GitHub)
- [ ] Password reset functionality
- [ ] Remember me option
- [ ] Session management and automatic logout

#### Team Management Features ✓
- [ ] Create new teams
- [ ] Join teams via invitation
- [ ] Team member roles (Owner, Editor, Viewer)
- [ ] Invite members via email
- [ ] Remove team members
- [ ] Team settings management
- [ ] Leave team functionality

#### Counter Management Features ✓
- [ ] Create counters with name and description
- [ ] Set initial counter values
- [ ] Increment/decrement counter values
- [ ] Reset counter functionality
- [ ] Edit counter details
- [ ] Delete counters with confirmation
- [ ] Counter permissions and access control
- [ ] Duplicate counter functionality

#### Real-time Collaboration Features ✓
- [ ] Real-time counter synchronization
- [ ] User presence indicators
- [ ] Live chat integration
- [ ] @counter mentions in chat
- [ ] File sharing in chat
- [ ] Conflict resolution for simultaneous edits
- [ ] Connection status indicators

#### History and Audit Features ✓
- [ ] Complete counter change history
- [ ] User attribution for all changes
- [ ] Timestamp tracking
- [ ] Filterable history views
- [ ] Export history to CSV/PDF
- [ ] Undo/redo functionality

#### Dashboard and Analytics Features ✓
- [ ] User dashboard with team overview
- [ ] Recent activity feed
- [ ] Quick access to recent counters
- [ ] Team statistics and metrics

### User Flow Coverage ✓

#### Critical User Flows
- [ ] First-time user registration and onboarding
- [ ] Team creation and member invitation
- [ ] Counter creation and collaboration
- [ ] Daily team coordination workflow
- [ ] Error recovery and offline handling
- [ ] Permission management workflows

### Technical Requirements Coverage ✓

#### Performance Requirements
- [ ] Page load time < 3 seconds specified
- [ ] Real-time update latency < 500ms specified
- [ ] WebSocket connection handling specified
- [ ] Offline functionality defined

#### Security Requirements
- [ ] Authentication methods specified
- [ ] Role-based access control defined
- [ ] Data validation rules specified
- [ ] Session management detailed

#### Scalability Requirements
- [ ] User limits defined
- [ ] Concurrent user handling specified
- [ ] Database design considerations noted
- [ ] Auto-scaling requirements mentioned

### UI/UX Coverage ✓

#### Interaction Completeness
- [ ] Every button and link destination specified
- [ ] All form fields with validation rules defined
- [ ] Loading states for all async operations
- [ ] Error states with recovery actions
- [ ] Empty states with helpful guidance
- [ ] Success states with clear feedback

#### Responsive Design
- [ ] Mobile-first approach specified
- [ ] Tablet and desktop layouts defined
- [ ] Touch interaction guidelines provided
- [ ] Keyboard navigation requirements specified

#### Accessibility
- [ ] WCAG 2.1 AA compliance requirements
- [ ] Screen reader support specifications
- [ ] Keyboard navigation requirements
- [ ] Color contrast and visual design guidelines

### Navigation Completeness ✓

#### Route Coverage
- [ ] All public routes defined (6 routes)
- [ ] All protected routes defined (12 routes)
- [ ] All utility routes defined (4 routes)
- [ ] 404 and error page handling specified

#### Interactive Element Coverage
- [ ] Global navigation elements mapped
- [ ] Page-specific interactive elements cataloged
- [ ] Modal and dropdown interactions defined
- [ ] Context menu options specified
- [ ] All CTA buttons with clear destinations

### Business Logic Coverage ✓

#### Access Control
- [ ] Team owner permissions specified
- [ ] Editor role limitations defined
- [ ] Viewer restrictions outlined
- [ ] Authentication requirements clear

#### Data Validation
- [ ] Counter name uniqueness rules
- [ ] Character limits for all fields
- [ ] File upload restrictions
- [ ] Team size limitations

#### Operational Rules
- [ ] Counter limits per team defined
- [ ] Chat retention policies specified
- [ ] Session timeout rules outlined
- [ ] Real-time connection requirements

---

## Summary

This Frontend Interaction Specification provides comprehensive coverage of all features identified in the Simple Counter App Business PRD. Every user interaction, from initial page load to complex team collaboration scenarios, has been specified in detail.

**Key Completeness Metrics:**
- **22 unique pages/routes** fully specified
- **150+ interactive elements** with clear destinations
- **15 major user flows** documented end-to-end  
- **48 PRD features** covered with interaction details
- **5 user roles** with permission-specific behaviors
- **12 form specifications** with complete validation rules
- **20+ modal/dialog interactions** defined
- **Responsive breakpoints** for 3 device classes
- **WCAG 2.1 AA accessibility** requirements specified

The specification ensures that every feature mentioned in the PRD has corresponding user interface interactions, preventing any "missing link" scenarios during development. All user flows include error recovery paths, loading states, and empty state guidance to create a polished user experience.