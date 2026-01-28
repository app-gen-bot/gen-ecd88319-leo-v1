# Business Specification - Slack Clone

## Core Features

### Channels
- Public channels visible to all workspace members
- Private channels with invite-only access  
- Users can create public channels
- Default channels: #general (auto-join), #random
- Maximum 100 channels per workspace
- Maximum 500 members per channel

### Direct Messages
- 1-on-1 messages between any two users
- Group messages up to 8 participants
- Persistent message history
- Typing indicators

### Messaging
- Real-time message delivery
- Edit own messages
- Delete own messages
- @mentions with notifications
- Emoji reactions (basic set)
- Message timestamps
- Unread message indicators

### File Sharing
- Upload files up to 50MB
- Support all file types
- Image preview inline (JPG, PNG, GIF)
- Other files as download links
- Files attached to messages

### Search
- Search messages by content
- Search across all channels user has access to
- Search in DMs
- Results show message context

### User Presence
- Online/offline status
- Auto-away after 30 minutes
- Manual status setting

### Notifications
- Desktop browser notifications
- Notification on @mention
- Notification on DM
- Per-channel notification preferences

### User Management
- User registration with email/password
- Google OAuth authentication
- User profiles with name and avatar
- Workspace membership

### Admin Features
- Workspace creation
- User invitation via email
- User deactivation
- Channel deletion
- Basic usage statistics

## Business Rules

### Access Control
- Users can only see channels they're members of
- Private channel access by invitation only
- Users can only edit/delete own messages
- Admins can delete any channel
- Admins can deactivate users

### Limits
- Workspace size: 50 users (from orchestrator)
- Message retention: Unlimited
- File retention: 1 year
- Channel limit: 100 per workspace
- Group DM limit: 8 participants

### Authentication
- Session timeout: 7 days
- Password requirements: 8+ characters
- OAuth providers: Google only

## User Flows

### First-Time User
1. Register or login with Google
2. Create workspace or join via invite
3. Auto-join #general channel
4. See welcome message

### Daily Usage
1. Login
2. See unread messages
3. Navigate channels/DMs
4. Send messages
5. Upload files
6. Search history

### Admin Tasks
1. Access admin panel
2. View user list
3. Invite new users
4. Manage channels
5. View statistics