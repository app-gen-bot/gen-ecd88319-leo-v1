# Frontend Interaction Specification: Slack Clone

## Overview

A real-time messaging application where users collaborate in workspaces through channels and direct messages. This specification defines all user interactions, ensuring complete feature coverage.

## Global Components

### Navigation Bar (Top)
- **Left**: Workspace name with dropdown menu
- **Center**: Search bar (click to open search modal)
- **Right**: Notifications bell, User avatar with dropdown

### Sidebar (Left)
- **Width**: 250px fixed
- **Sections**: 
  - Workspace switcher
  - Channels list
  - Direct Messages list
  - User profile section

### Main Content Area
- **Components**: Channel/DM header, Message list, Message input
- **Behavior**: Updates based on selected channel/DM

## Pages

### Page: Login (/login)

#### Purpose
Authenticate users and direct them to their workspace

#### Components

**LoginForm**
- **Type**: Form
- **Fields**:
  - email: Email input (required, valid email)
  - password: Password input (required, min 8 chars)
- **Actions**:
  - Submit: Authenticate user → Navigate to workspace
  - Forgot Password: Link to password reset
  - Sign Up: Link to registration
- **Error States**:
  - Invalid credentials: "Invalid email or password"
  - Network error: "Connection failed. Please try again."

### Page: Workspace (/workspace)

#### Purpose
Main application interface for messaging and collaboration

#### Layout
- **Header**: Navigation bar with search and user actions
- **Sidebar**: Channel navigation and user presence
- **Main**: Selected channel or DM conversation

#### Components

**WorkspaceSwitcher**
- **Type**: Dropdown
- **Location**: Top of sidebar
- **Trigger**: Click on workspace name
- **Menu Items**:
  - Switch Workspace → Show workspace list
  - Workspace Settings → /settings/workspace (admin only)
  - Invite People → Open invite modal
  - Sign Out → Logout and redirect to /login ✓

**ChannelSection**
- **Type**: Collapsible list
- **Header**: 
  - Text: "CHANNELS"
  - Action: Plus button → CreateChannelModal ✓
- **Items**: List of channels
  - Click: Navigate to channel
  - Hover: Show options icon
  - Options: Edit (owner), Leave, Mute
- **Empty State**: "No channels yet"

**CreateChannelModal**
- **Trigger**: Plus button in channel section
- **Fields**:
  - name: Text input (required, unique)
  - description: Textarea (optional)
  - private: Checkbox (default false)
- **Actions**:
  - Create: Validate → Create channel → Navigate to it
  - Cancel: Close modal

**DirectMessageSection**
- **Type**: List with presence indicators
- **Header**: "DIRECT MESSAGES"
- **Items**: Users with online status
  - Green dot: Online
  - Gray dot: Offline
  - Click: Open DM conversation
- **Search**: Type to filter users

**MessageArea**
- **Type**: Scrollable message list
- **Messages Display**:
  - Avatar: Click → UserProfilePopover
  - Name and timestamp
  - Content with formatting
  - Reactions: Click to toggle ✓
  - Thread indicator: Click to open thread ✓
- **Actions** (on hover):
  - Add reaction: Plus icon → Emoji picker
  - Reply in thread: Speech bubble icon
  - Edit (own, <15 min): Pencil icon ✓
  - Delete (own): Trash icon ✓
  - More: Three dots → Copy link, Pin, Report

**MessageInput**
- **Type**: Rich text input
- **Location**: Bottom of main area
- **Features**:
  - Textarea: Grows with content
  - Formatting toolbar: Bold, Italic, Code, Link
  - Attachments: Paperclip → File picker
  - Emoji: Smiley → Emoji picker
  - Send: Enter key or button
- **States**:
  - Empty: Send button disabled
  - Typing: Show formatting options
  - Sending: Disable input, show progress

**SearchModal**
- **Trigger**: Click search bar
- **Type**: Full-screen modal with tabs
- **Tabs**: All, Messages, Files, Channels, People
- **Behavior**:
  - Type to search across workspace
  - Results update as you type
  - Click result → Navigate to context
  - Escape → Close modal

**NotificationsDropdown**
- **Trigger**: Click bell icon
- **Badge**: Shows unread count
- **Items**: Recent notifications
  - Mentions: "@user mentioned you"
  - Replies: "Reply to your message"
  - Channel: "New channel #design"
- **Actions**:
  - Click: Navigate to context
  - Mark all read: Button at top

**UserMenu**
- **Trigger**: Click user avatar
- **Items**:
  - View Profile → UserProfileModal
  - Set Status → StatusPicker
  - Profile Settings → /settings/profile ✓
  - ---
  - Sign Out → Logout ✓

### Page: Profile Settings (/settings/profile) ✓

#### Purpose
Allow users to edit their profile information

#### Components

**ProfileForm**
- **Fields**:
  - name: Text input
  - email: Email input  
  - title: Text input (job title)
  - avatar: Image upload
- **Actions**:
  - Save: Update profile → Show success
  - Cancel: Discard changes → Back to workspace
  - Delete Account: Confirmation → Delete

## User Flows

### Flow: Send Message
1. User types in message input
2. Text appears in input field
3. Send button enables
4. User presses Enter or clicks Send
5. Message appears immediately (optimistic)
6. If success → Message persists
7. If failure → Error state with retry

### Flow: Edit Message ✓
**Conditions**: Own message, <15 minutes old
1. User hovers over message → Edit icon appears
2. Clicks edit icon → Message becomes editable
3. User modifies text
4. Press Enter to save, Escape to cancel
5. If saved → Show "(edited)" indicator
6. If cancelled → Revert to original

### Flow: Start Direct Message
1. User clicks username in sidebar
2. OR clicks "New DM" button
3. Select user from list
4. DM conversation opens
5. Message input focused

### Flow: Create Channel ✓
1. User clicks Plus next to CHANNELS
2. Modal opens with form
3. User enters name (required)
4. Optionally adds description
5. Optionally marks as private
6. Clicks Create
7. Channel created and user navigated to it

### Flow: React to Message ✓
1. User hovers over message
2. Clicks add reaction or existing reaction
3. If new → Emoji picker opens
4. Selects emoji → Added to message
5. If existing → Toggles on/off

### Flow: User Logout ✓
1. User clicks avatar → Menu opens
2. Clicks "Sign Out"
3. Local state cleared
4. Redirected to /login

## State Management

### User Presence
- Updates every 30 seconds
- Shows in DM list and profiles
- States: Online, Away (>5 min idle), Offline

### Unread Indicators
- Bold channel names with unread
- Unread count badges
- Clear on channel visit

### Typing Indicators
- Show "User is typing..." in channels
- Multiple users: "Several people are typing"
- Timeout after 3 seconds

## Error Handling

### Network Errors
- Show inline where action failed
- Provide retry button
- Don't block entire UI

### Validation Errors
- Show below relevant field
- Clear, specific messages
- Highlight problem fields

### Permission Errors
- "You don't have permission to [action]"
- Disable unavailable actions
- Explain requirements

## Validation Checklist

✓ **Authentication**
- [x] Login page exists
- [x] Logout option in user menu
- [x] Session persistence handled

✓ **Channel Management**  
- [x] Create channel UI
- [x] List channels
- [x] Join/leave channels
- [x] Channel settings (admin)

✓ **Messaging**
- [x] Send messages
- [x] Edit own messages
- [x] Delete own messages
- [x] React to messages
- [x] Thread replies

✓ **User Features**
- [x] View profiles  
- [x] Edit own profile
- [x] Set status
- [x] See presence

✓ **Search & Navigation**
- [x] Global search
- [x] Navigate all sections
- [x] Notifications
- [x] Direct messages

## Notes

This specification would have prevented all 8 missing features:
1. ✓ Logout - Explicitly in UserMenu
2. ✓ Create Channel - Plus button specified
3. ✓ Profile Settings - Page defined
4. ✓ Edit Message - Flow documented
5. ✓ Delete Message - In message actions
6. ✓ Interactive Reactions - Click behavior defined
7. ✓ Thread Replies - Click to open specified
8. ✓ Search Results - Full flow included

By defining interactions before visual design, we ensure completeness while allowing creative freedom in implementation.