# 🧪 Slack Clone UI Testing Guide

## Prerequisites
- Application running at: **http://localhost:3000**
- Test credentials: **test@example.com / password123**
- Browser: Chrome, Firefox, Safari, or Edge (modern version)

---

## 1. 🔐 Login & Authentication Flow

### Test Steps:
1. **Navigate to http://localhost:3000**
   - ✅ You should see a dark-themed login page (#1a1d21 background)
   - ✅ Slack logo at the top
   - ✅ "Sign in to Slack Clone" heading

2. **Test the login form:**
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Click "Sign in with Email"
   - ✅ You should be redirected to the main workspace

3. **Test validation:**
   - Try logging in with empty fields
   - ✅ Should show "Email is required" and "Password is required"
   - Try invalid email format
   - ✅ Should show "Invalid email format"

4. **Test Google OAuth (UI only):**
   - Click "Sign in with Google" button
   - ✅ Button should be clickable (actual OAuth not connected)

---

## 2. 📁 Channel Navigation & Management

### After Login:
1. **Workspace Layout:**
   - ✅ Dark sidebar on the left with workspace name "Test Workspace"
   - ✅ Main content area showing #general channel
   - ✅ Header with search bar and user avatar

2. **Channel List (Left Sidebar):**
   - ✅ "Channels" section with dropdown arrow
   - ✅ #general and #random channels listed
   - ✅ Active channel highlighted in lighter color

3. **Navigate Channels:**
   - Click on #random channel
   - ✅ Content area updates to show #random messages
   - ✅ Channel name in header changes
   - ✅ URL updates to `/channel/random`

4. **Create New Channel:**
   - Click "+" next to "Channels" heading
   - ✅ Modal opens: "Create a channel"
   - Fill in:
     - Name: `test-channel`
     - Description: `Testing channel creation`
     - Leave as Public (default)
   - Click "Create"
   - ✅ New channel appears in sidebar
   - ✅ Automatically navigate to new channel

---

## 3. 💬 Messaging Features

### Send Messages:
1. **Basic Message:**
   - In any channel, click the message input at bottom
   - Type: `Hello, this is a test message!`
   - Press Enter or click send button
   - ✅ Message appears in chat with your name and timestamp

2. **Message with Formatting:**
   - Use the formatting toolbar:
     - **Bold**: Select text and click B
     - *Italic*: Select text and click I
     - `Code`: Select text and click </>
   - Type: `This is **bold**, this is *italic*, and this is \`code\``
   - ✅ Formatted message displays correctly

3. **File Attachment (UI):**
   - Click the paperclip icon
   - ✅ File upload dialog should appear (actual upload not implemented)

4. **Reactions:**
   - Hover over any message
   - Click the smiley face icon
   - ✅ Emoji picker appears
   - Select 👍
   - ✅ Reaction appears under the message

5. **Thread Reply:**
   - Hover over a message
   - Click "Reply in thread"
   - ✅ Thread panel opens on the right
   - Type: `This is a thread reply`
   - ✅ Reply appears indented in thread panel

---

## 4. 👤 User Interactions

### Profile Popovers:
1. **Click any user avatar** in messages or header
   - ✅ Popover appears with:
     - User's avatar
     - Name and title
     - Status (Active/Away)
     - Email
     - Timezone
     - "Message" and "View Profile" buttons

2. **Direct Messages:**
   - In sidebar, find "Direct Messages" section
   - Click on any user (e.g., "Alice Johnson")
   - ✅ Opens DM conversation
   - ✅ Green dot shows online status
   - Send a test message

---

## 5. 🔍 Search Functionality

### Global Search:
1. **Click the search bar** in the header (or press Cmd/Ctrl + K)
   - ✅ Search modal opens with tabs:
     - All
     - Messages
     - Channels
     - People
     - Files

2. **Search for messages:**
   - Type: `hello`
   - ✅ Results show messages containing "hello"
   - ✅ Each result shows channel, sender, and preview

3. **Search for people:**
   - Click "People" tab
   - Type: `alice`
   - ✅ Shows matching users with avatars

4. **Search for channels:**
   - Click "Channels" tab
   - Type: `general`
   - ✅ Shows #general channel with member count

---

## 6. 🔔 Notifications

### Notification Center:
1. **Click the bell icon** in the header
   - ✅ Red badge shows unread count (3)
   - ✅ Dropdown opens with recent notifications

2. **Notification Types:**
   - ✅ Direct messages: "@Alice mentioned you..."
   - ✅ Channel mentions: "New message in #general"
   - ✅ System: "You were added to #design"

3. **Mark as read:**
   - Click "Mark all as read"
   - ✅ Badge disappears
   - ✅ Notifications marked as read

---

## 7. ⚙️ Settings & Admin

### User Menu:
1. **Click your avatar** in the top-right corner
   - ✅ Dropdown menu appears with:
     - Profile
     - Preferences
     - Admin Dashboard (if admin)
     - Sign out

2. **Admin Dashboard** (if you're an admin):
   - Click "Admin Dashboard"
   - ✅ Dashboard shows:
     - User statistics
     - Channel overview
     - Storage usage
     - Recent activity

---

## 8. 🎨 UI/UX Elements to Verify

### Visual Consistency:
- ✅ **Dark mode**: Background #1a1d21, borders #2d2f31
- ✅ **Hover effects**: Items highlight on hover
- ✅ **Active states**: Current channel/page highlighted
- ✅ **Loading states**: Smooth transitions between pages
- ✅ **Responsive design**: Sidebar collapses on mobile

### Keyboard Shortcuts:
- `Cmd/Ctrl + K`: Open search
- `Esc`: Close modals
- `Enter`: Send message
- `Shift + Enter`: New line in message

---

## 🐛 Common Issues to Check

1. **Performance:**
   - Messages load quickly
   - No lag when switching channels
   - Search results appear instantly

2. **Error Handling:**
   - Network errors show friendly messages
   - Form validation works properly
   - No console errors in browser DevTools

3. **State Management:**
   - Unread counts update correctly
   - Online status reflects accurately
   - Messages persist after navigation

---

## 📝 Test Scenarios

### Scenario 1: New User Onboarding
1. Create a new channel called "onboarding"
2. Send a welcome message
3. Add a thread reply
4. React with 🎉

### Scenario 2: Team Collaboration
1. Navigate to #general
2. Send: `@channel Team meeting at 3pm`
3. Check that it appears with mention highlight
4. Reply in thread with: `I'll be there!`

### Scenario 3: Quick DM
1. Search for "Bob" (Cmd/Ctrl + K)
2. Click on Bob Wilson in results
3. Send: `Quick question about the project`
4. Verify message appears in DM

---

## 📊 Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login validation errors
- [ ] Logout functionality
- [ ] Session persistence

### Channels
- [ ] View channel list
- [ ] Switch between channels
- [ ] Create new channel
- [ ] Channel info/settings

### Messaging
- [ ] Send plain text message
- [ ] Send formatted message
- [ ] Add emoji reaction
- [ ] Start/reply to thread
- [ ] Edit own message
- [ ] Delete own message

### Search
- [ ] Global search (Cmd/Ctrl + K)
- [ ] Search messages
- [ ] Search channels
- [ ] Search people
- [ ] Filter search results

### User Features
- [ ] View user profiles
- [ ] Start direct message
- [ ] Check online status
- [ ] Update own profile

### Notifications
- [ ] View notification badge
- [ ] Read notifications
- [ ] Mark as read
- [ ] Notification preferences

### Admin (if applicable)
- [ ] Access admin dashboard
- [ ] View workspace stats
- [ ] Manage users
- [ ] Manage channels

---

## 🚀 Quick Start Testing Flow

1. **Login** → test@example.com / password123
2. **Send a message** in #general
3. **Switch to #random** channel
4. **Search** for "hello" (Cmd/Ctrl + K)
5. **Click a user avatar** to see profile
6. **Check notifications** (bell icon)
7. **Create a new channel** called "testing"
8. **Start a DM** with any user
9. **React to a message** with an emoji
10. **Sign out** from user menu

---

## 📱 Mobile/Responsive Testing

If testing on mobile or small screens:
1. **Sidebar**: Should collapse to hamburger menu
2. **Messages**: Should stack vertically
3. **Search**: Should be accessible via icon
4. **Navigation**: Swipe gestures may work
5. **Input**: Virtual keyboard should not cover message input

---

## 🔧 Developer Tools

For deeper testing, open browser DevTools (F12):

### Console Tab:
- Check for any red error messages
- Look for warning messages
- Monitor API calls

### Network Tab:
- Verify API endpoints are called
- Check response times
- Look for failed requests

### Application Tab:
- Check localStorage for auth tokens
- Verify session storage
- Review cookies

---

## 📞 Support & Troubleshooting

### Common Issues:

**Can't login:**
- Verify backend is running (port 8000)
- Check test user exists in database
- Clear browser cache/cookies

**Messages not sending:**
- Check browser console for errors
- Verify API connection
- Ensure you're in a valid channel

**Search not working:**
- Ensure you have messages to search
- Try refreshing the page
- Check if search modal opens

**Missing features:**
- Some features may be UI-only (mocked)
- WebSocket features may not be connected
- File uploads are UI demonstrations

---

*Last updated: 2025-06-30*
*Version: 1.0*