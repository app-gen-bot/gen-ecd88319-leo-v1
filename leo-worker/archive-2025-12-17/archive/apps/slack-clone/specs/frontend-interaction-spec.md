# Frontend Interaction Specification: Slack Clone
*Generated from Business Specification v1.0*

## Overview
A real-time messaging application enabling team collaboration through channels and direct messages. This specification defines all user interactions to ensure complete implementation of business requirements.

## Global Navigation

### Application Layout
- **Header** (60px height): Workspace info, search, notifications, user menu
- **Sidebar** (250px width): Workspace switcher, channels, DMs, user status
- **Main Content**: Message area or selected view
- **Responsive**: Collapsible sidebar on mobile/tablet

### Workspace Switcher
- **Location**: Top of sidebar
- **Display**: Current workspace name with chevron
- **Trigger**: Click workspace name
- **Menu Items**:
  - Switch Workspace (future) → Workspace selector
  - Workspace Settings → /admin (admin only)
  - Invite People → Opens invite modal
  - Create New Workspace → /create-workspace
  - ---
  - Sign Out → Clear session → /login

### Global Search
- **Location**: Center of header
- **Shortcut**: Cmd/Ctrl+K
- **Trigger**: Click or shortcut
- **Behavior**: Opens fullscreen modal with tabs
- **Tabs**: All, Messages, Files, Channels, People
- **Features**:
  - Real-time search as you type
  - Recent searches stored (last 10)
  - Results show context with highlighting
  - Click result → Navigate to source
  - ESC → Close modal

### Notifications Center
- **Location**: Header right (bell icon)
- **Badge**: Red count of unread
- **Trigger**: Click bell icon
- **Display**: Dropdown with notifications list
- **Item Actions**:
  - Click → Navigate to source
  - X → Dismiss individual
  - "Mark all read" → Clear all
- **Types**: @mentions, DMs, channel activity, file shares
- **Retention**: 30 days

### User Menu
- **Location**: Header far right
- **Display**: Avatar with online status indicator
- **Trigger**: Click avatar
- **Menu Items**:
  - Set Status → Status picker modal
  - Profile Settings → /settings/profile
  - Preferences → /settings/preferences
  - ---
  - Help → /help
  - Sign Out → Logout flow

## Pages

### Page: Login (/login)

#### Components

**LoginForm**
- **Fields**:
  - email: Required, valid email format
  - password: Required, min 8 characters
- **Actions**:
  - Sign In: Validate → Authenticate → /workspace
  - Sign in with Google: OAuth flow → /workspace
  - Create Account: → /register
  - Forgot Password: → /forgot-password
- **Errors**:
  - Invalid credentials: "Email or password incorrect"
  - Account locked: "Too many attempts"
  - Network: "Connection error, please retry"

**RegistrationForm** (/register)
- **Fields**:
  - email: Required, unique
  - password: Required, 8+ chars
  - name: Required
  - workspace_name: Required (creates new)
- **Actions**:
  - Create Account: Validate → Create user & workspace → /workspace
  - Sign in with Google: OAuth with workspace creation
- **Post-Registration**: Auto-join #general and #random

### Page: Main Workspace (/workspace)

#### Channel Management

**Channel List Section**
- **Header**: 
  - Text: "CHANNELS" 
  - Plus button → CreateChannelModal (all users)
- **Channel Items**:
  - Bold = unread messages
  - # = public, 🔒 = private
  - Count badge = unread count
  - Click → Navigate to channel
  - Hover → Show gear icon (members only)
- **Gear Menu**:
  - Channel Settings (admin/owner)
  - Notification Preferences
  - Mute Channel
  - Leave Channel
  - Delete Channel (admin only, confirmation required)

**CreateChannelModal**
- **Trigger**: Plus button in channels section
- **Fields**:
  - name: Required, alphanumeric+dash, unique
  - description: Optional, 250 char max
  - private: Checkbox (admin only can create private)
- **Validation**:
  - Name 3-30 chars, no spaces
  - Must be unique in workspace
- **Actions**:
  - Create: Validate → Create → Navigate to channel
  - Cancel: Close modal

**Channel Browser**
- **Access**: "Browse channels" link in sidebar
- **Display**: List of all public channels
- **For each**: Name, description, member count
- **Actions**: 
  - Join: Add user → Navigate to channel
  - Preview: Show recent messages (future)

#### Direct Messages

**DM Section**
- **Header**: "DIRECT MESSAGES"
- **Items**: Users with presence indicators
  - 🟢 Online (active now)
  - 🟡 Away (>30 min idle)
  - ⚫ Offline
- **Actions**:
  - Click user → Open/create DM
  - Search: Filter list as you type
- **New DM**: Plus button → User picker modal

#### Message Area

**Message List**
- **Display**: Chronological messages
- **Load More**: Auto-load on scroll up
- **Auto-scroll**: To bottom on new messages
- **System Messages**: "X joined channel" (italics)

**Individual Messages**
- **Display**:
  - Avatar (click → UserProfilePopover)
  - Name, timestamp (hover for full date)
  - Content with formatting preserved
  - Edited indicator if applicable
  - Reactions bar
  - Thread reply count
- **Hover Actions** (appear on right):
  - 😊 Add reaction → Emoji picker
  - 💬 Reply in thread → Open thread panel
  - ✏️ Edit (own, <5 min) → Inline edit
  - 🗑️ Delete (own) → Confirmation
  - ⋮ More → Copy link, Pin (future)

**Reactions**
- **Display**: Emoji with count
- **Click existing**: Toggle on/off
- **Add new**: Plus → Emoji picker
- **Hover**: Tooltip with user list

**Thread Panel**
- **Trigger**: Click thread reply count or reply button
- **Display**: Slide-in panel from right
- **Features**: 
  - Original message at top
  - Thread replies below
  - Separate message input
  - Close button (X)

**Message Input**
- **Components**:
  - Rich text area (auto-grow)
  - Formatting toolbar (B, I, code, link)
  - @ button → User mention picker
  - 📎 → File upload (50MB max)
  - 😊 → Emoji picker
- **Behavior**:
  - Enter: Send message
  - Shift+Enter: New line
  - Typing indicator: Show for 3 seconds
  - Character limit: 10,000
- **States**:
  - Empty: Send disabled
  - Typing: Show formatting options
  - Uploading: Progress bar
  - Error: Red border with message

**Edit Message Mode**
- **Trigger**: Edit button on own message (<5 min old)
- **Display**: Message converts to textarea
- **Actions**:
  - Save: Update message, add "edited"
  - Cancel: Revert to original
  - ESC key: Cancel edit

#### User Interactions

**UserProfilePopover**
- **Trigger**: Click any user avatar
- **Display**: 
  - Large avatar
  - Name, title, email
  - Online status
  - Local time (future)
- **Actions**:
  - Message → Open DM
  - View Profile → Full profile modal
  - Call/Video (future)

**Status Picker**
- **Trigger**: User menu → Set Status
- **Options**:
  - 🟢 Active
  - 🟡 Away  
  - ⚫ Offline
  - Custom message (future)
- **Behavior**: Updates immediately, syncs across devices

### Page: Profile Settings (/settings/profile)

**ProfileSettingsForm**
- **Sections**:
  - Basic Info: Name, title, email
  - Avatar: Upload/remove (5MB max)
  - Password: Change password form
  - Preferences: Timezone, language (future)
- **Actions**:
  - Save Changes: Validate → Update → Success message
  - Cancel: Discard → Back to workspace
  - Delete Account: Multiple confirmations → Delete

### Page: Admin Dashboard (/admin)
*Accessible to workspace admins only*

**Dashboard Overview**
- **Stats Cards**: Active users, channels, messages/day, storage
- **Charts**: 
  - User activity (7-day)
  - Channel activity
  - Storage trend

**User Management Tab**
- **Table**: All workspace users
- **Columns**: Name, email, role, status, joined date
- **Actions**:
  - Invite User → Email invite modal
  - Change Role → Admin/Member toggle
  - Deactivate → Confirmation → Remove access
- **Bulk Actions**: Select multiple → Bulk operations

**Channel Management Tab**
- **Table**: All channels
- **Columns**: Name, type, members, created
- **Actions**:
  - Create Channel → Same as regular modal
  - Edit Channel → Settings modal
  - Delete Channel → Confirmation required
  - Archive Channel (future)

## User Flows

### Send First Message
1. User clicks on channel/DM
2. Types in message input
3. Presses Enter or clicks Send
4. Message appears immediately (optimistic)
5. If error → Show retry option

### Edit Message Flow
1. User hovers over own recent message
2. Clicks edit icon
3. Message becomes editable inline
4. User makes changes
5. Presses Enter to save
6. "(edited)" appears on message

### Create Channel Flow
1. User clicks + next to CHANNELS
2. Modal opens
3. Enters channel name
4. Optionally adds description
5. Clicks Create
6. Channel created, user navigated to it
7. System message: "You created #channel-name"

### Join Channel Flow  
1. User clicks "Browse channels"
2. Sees list of public channels
3. Clicks Join on desired channel
4. Added to channel
5. Navigated to channel
6. Sees message history

### Start DM Flow
1. User clicks username anywhere OR
2. Clicks + in DM section
3. User picker opens
4. Selects user
5. DM conversation opens
6. Can immediately send message

### Search Flow
1. User presses Cmd+K or clicks search
2. Search modal opens
3. User types query
4. Results appear in real-time
5. User clicks result
6. Modal closes, navigates to result

### Logout Flow
1. User clicks avatar
2. Clicks Sign Out
3. Confirmation: "Are you sure?"
4. Session cleared
5. Redirected to /login

## State Management

### Presence Updates
- Poll every 30 seconds when active
- Set away after 30 min idle
- Sync across all user's sessions

### Unread Tracking
- Track last read per channel/DM
- Update on channel visit
- Clear on explicit "mark read"
- Persist across sessions

### Real-time Updates
- WebSocket for messages
- Presence updates
- Typing indicators
- Notification delivery

## Error Handling

### Network Errors
- Show inline error where action failed
- Provide retry button
- Don't block entire UI
- Queue actions when offline (future)

### Validation Errors  
- Show below relevant field
- Clear, actionable messages
- Prevent form submission
- Highlight invalid fields

### Permission Errors
- "You don't have permission to [action]"
- Hide/disable unauthorized actions
- Explain requirements if applicable

### Rate Limits
- "Slow down! Try again in X seconds"
- Disable action temporarily
- Show countdown (future)

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate
- ESC to close modals
- Arrow keys in lists

### Screen Readers
- Semantic HTML structure
- ARIA labels on icons
- Announce dynamic changes
- Form field descriptions

### Visual
- High contrast mode support
- Focus indicators on all elements
- Error states not just color
- Minimum touch targets (44x44)

## Validation Summary

This specification ensures all PRD features have UI:
✓ Channel creation and management
✓ Direct messaging with presence
✓ Message send, edit (<5min), delete
✓ Reactions and threads
✓ File uploads
✓ Global search
✓ Notifications
✓ User profiles and settings
✓ Admin dashboard
✓ Authentication (login, logout, register)
✓ Workspace management
✓ All navigation paths defined
✓ All error states specified
✓ All empty states defined