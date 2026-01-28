# Data Models - Slack Clone v1.0

**Version**: 1.0  
**Generated**: 2025-06-29  
**Source**: Wireframe implementation analysis

## Core Entities

### Overview
The data models are derived from the implemented wireframe and reflect actual UI needs. These models support both relational concepts and NoSQL (DynamoDB) implementation patterns, with denormalized fields for performance.

### User
```
User {
  id: string (UUID)
  email: string (unique)
  password_hash: string
  name: string
  avatar_url: string (optional)
  avatar_initials: string  // For UI display (e.g., "JD")
  status: enum [online, away, offline]  // Real-time status
  role: enum [Admin, Member]  // Workspace-level role
  title: string  // Job title (e.g., "Senior Developer")
  last_active_at: datetime
  last_active_human: string  // Human-readable (e.g., "2 minutes ago")
  created_at: datetime
  updated_at: datetime
}
```

### Workspace
```
Workspace {
  id: string (UUID)
  name: string
  owner_id: string (User.id)
  total_members: number  // Cached count
  total_channels: number  // Cached count
  total_messages: number  // Cached count
  storage_used: string  // e.g., "5.2 GB"
  created_at: datetime
  updated_at: datetime
}
```

### WorkspaceMember
```
WorkspaceMember {
  workspace_id: string (Workspace.id)
  user_id: string (User.id)
  role: enum [admin, member]
  joined_at: datetime
  is_active: boolean
}
```
Primary Key: (workspace_id, user_id)

### Channel
```
Channel {
  id: string (UUID)
  workspace_id: string (Workspace.id)
  name: string
  type: enum [Public, Private]
  is_private: boolean  // Backwards compatibility
  member_count: number  // Cached for UI
  message_count: number  // Cached for UI
  created_by: string (User.id)
  created_human: string  // e.g., "3 days ago"
  created_at: datetime
  updated_at: datetime
}
```
Unique: (workspace_id, name)

### ChannelMember
```
ChannelMember {
  channel_id: string (Channel.id)
  user_id: string (User.id)
  unread_count: number  // Messages since last_read_at
  joined_at: datetime
  joined_human: string  // e.g., "Member for 2 months"
  last_read_at: datetime
  notification_preference: enum [all, mentions, none]
}
```
Primary Key: (channel_id, user_id)

### Message
```
Message {
  id: string (UUID)
  channel_id: string (Channel.id) (optional)
  conversation_id: string (Conversation.id) (optional)
  user_id: string (User.id)
  user_name: string  // Denormalized for performance
  user_avatar: string  // Denormalized avatar URL/initials
  content: string
  is_edited: boolean
  edited_at: datetime (optional)
  thread_count: number  // Number of thread replies
  parent_message_id: string (optional)  // For thread replies
  timestamp_human: string  // e.g., "10:30 AM"
  created_at: datetime
  updated_at: datetime
}
```

### MessageReaction
```
MessageReaction {
  message_id: string (Message.id)
  emoji: string
  count: number  // Total reactions of this emoji
  users: string[]  // Array of user IDs who reacted
  user_names: string[]  // Denormalized for hover display
  created_at: datetime
  updated_at: datetime
}
```
Primary Key: (message_id, emoji)

### Conversation
```
Conversation {
  id: string (UUID)
  workspace_id: string (Workspace.id)
  type: enum [direct, group]  // Support for group DMs
  name: string (optional)  // For group conversations
  last_message_id: string (optional)  // For conversation list
  last_message_preview: string  // Truncated message text
  last_message_at: datetime
  created_at: datetime
  updated_at: datetime
}
```

### ConversationParticipant
```
ConversationParticipant {
  conversation_id: string (Conversation.id)
  user_id: string (User.id)
  unread_count: number
  last_read_at: datetime
  joined_at: datetime
}
```
Primary Key: (conversation_id, user_id)

### File
```
File {
  id: string (UUID)
  workspace_id: string (Workspace.id)
  uploaded_by: string (User.id)
  filename: string
  mimetype: string
  size: integer (bytes)
  storage_key: string
  created_at: datetime
}
```

### MessageAttachment
```
MessageAttachment {
  message_id: string (Message.id)
  file_id: string (File.id)
}
```
Primary Key: (message_id, file_id)

### Notification
```
Notification {
  id: string (UUID)
  user_id: string (User.id)
  workspace_id: string (Workspace.id)
  type: enum [mention, channel, dm, file]
  title: string  // e.g., "Sarah mentioned you"
  subtitle: string  // e.g., "in #general"
  avatar_url: string (optional)  // User/channel avatar
  is_read: boolean
  link_type: string  // e.g., "channel", "dm"
  link_id: string  // Channel ID or Conversation ID
  timestamp_human: string  // e.g., "5 minutes ago"
  created_at: datetime
  expires_at: datetime  // TTL for cleanup
}
```

### Thread
```
Thread {
  id: string (UUID)
  parent_message_id: string (Message.id)
  participant_ids: string[]  // Users who replied
  reply_count: number
  last_reply_at: datetime
  last_reply_preview: string  // Truncated last message
  created_at: datetime
  updated_at: datetime
}
```

### Presence
```
Presence {
  user_id: string (User.id)
  workspace_id: string (Workspace.id)
  status: enum [online, away, offline]
  status_message: string (optional)  // Custom status
  last_active_at: datetime
  expires_at: datetime  // TTL for offline detection
}
```
Primary Key: (user_id, workspace_id)

### WorkspaceStats
```
WorkspaceStats {
  workspace_id: string (Workspace.id)
  date: date  // For historical tracking
  total_users: number
  active_users: number  // Active in last 7 days
  total_channels: number
  total_messages: number
  total_files: number
  storage_gb: float
  messages_last_7_days: number
  calculated_at: datetime
}
```
Primary Key: (workspace_id, date)

### SearchHistory
```
SearchHistory {
  id: string (UUID)
  user_id: string (User.id)
  workspace_id: string (Workspace.id)
  query: string
  result_count: number
  clicked_result_id: string (optional)
  searched_at: datetime
}
```

## Additional Entities for Features

### Mention
```
Mention {
  message_id: string (Message.id)
  mentioned_user_id: string (User.id)
  mentioned_channel_id: string (Channel.id) (optional)
  position: number  // Character position in message
  created_at: datetime
}
```
Primary Key: (message_id, mentioned_user_id)

### TypingIndicator
```
TypingIndicator {
  channel_id: string (Channel.id) (optional)
  conversation_id: string (Conversation.id) (optional)
  user_id: string (User.id)
  started_at: datetime
  expires_at: datetime  // Auto-expire after 3 seconds
}
```

## Relationships

### User Relations
- User has many WorkspaceMembers
- User has many ChannelMembers
- User has many Messages
- User has many Files
- User has many Notifications
- User has one Presence per Workspace
- User has many SearchHistory entries

### Workspace Relations
- Workspace has one owner (User)
- Workspace has many WorkspaceMembers
- Workspace has many Channels
- Workspace has many DMConversations

### Channel Relations
- Channel belongs to Workspace
- Channel has many ChannelMembers
- Channel has many Messages
- Channel has cached member_count and message_count

### Message Relations
- Message belongs to User
- Message belongs to Channel OR Conversation
- Message has many MessageReactions (grouped by emoji)
- Message has many MessageAttachments
- Message may have one Thread
- Message may be a reply (parent_message_id)
- Message has denormalized user data for performance

### Conversation Relations
- Conversation has many ConversationParticipants (2-8)
- Conversation has many Messages
- Conversation caches last_message for list display
- Conversation supports both direct and group types

## Constraints

### Business Rules
- User can only be in channels within their workspaces
- Private channels require explicit membership
- Messages must belong to either channel or conversation
- Conversations have 2-8 participants
- Files are scoped to workspace
- Only message author can edit/delete (within 5 minutes)
- Workspace owner cannot be removed
- Notifications expire after 30 days
- Presence expires after 30 minutes of inactivity
- Typing indicators expire after 3 seconds
- Thread participants are automatically subscribed
- Unread counts are tracked per user per channel/conversation

### Data Integrity
- Cascade delete workspace → channels, members, notifications
- Cascade delete channel → messages, members
- Cascade delete message → reactions, attachments, thread
- Soft delete for audit trail (add deleted_at field)
- TTL on notifications (30 days)
- TTL on presence records (30 minutes)
- TTL on typing indicators (3 seconds)

## Indexes

### Performance Critical
- User.email (unique)
- WorkspaceMember.(workspace_id, user_id)
- Channel.(workspace_id, name)
- ChannelMember.(channel_id, user_id)
- ChannelMember.unread_count (for badge display)
- Message.channel_id + created_at
- Message.conversation_id + created_at
- ConversationParticipant.user_id
- Notification.(user_id, is_read)
- Thread.parent_message_id
- Presence.(workspace_id, status)

### Search
- Message.content (full text)
- User.name
- Channel.name
- File.filename
- Multi-field search across entities
- Search result ranking by relevance
- Recent searches for autocomplete

## Table Provisioning

### CRITICAL: Infrastructure Management
- **These tables are created via CDK infrastructure code, NOT by the application**
- Applications should fail fast with helpful error if tables don't exist
- Never create tables from application code

### CDK Deployment
All DynamoDB tables must be provisioned through AWS CDK:
1. Tables are defined in infrastructure code
2. CDK manages table creation, indexes, and capacity
3. Applications assume tables exist

### Error Handling
If tables are missing, applications should:
- Check table existence on startup
- Log clear error: "Required DynamoDB table 'slack-clone-users-{env}' not found. Deploy infrastructure first."
- Exit with non-zero status code
- Never attempt to create missing tables

## NoSQL Considerations (DynamoDB)

### Access Patterns
1. **User Queries**
   - Get user by email (GSI)
   - Get user workspaces
   - Get user notifications

2. **Channel Queries**
   - List channels by workspace
   - Get channel members
   - Get messages by channel (sorted by time)

3. **Message Queries**
   - Get messages by channel/conversation
   - Get thread replies
   - Get user's mentions

4. **Real-time Queries**
   - Get online users in workspace
   - Get typing users in channel
   - Get unread counts

### Denormalization Strategy
- User data in messages (name, avatar)
- Counts cached in parent entities
- Last message preview in conversations
- Human-readable timestamps alongside ISO dates

### DynamoDB Streams
- Message creation → Update counts, send notifications
- Reaction changes → Update reaction counts
- Presence updates → Broadcast to WebSocket
- Channel membership → Update member counts