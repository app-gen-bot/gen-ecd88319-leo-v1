# Data Models - Slack Clone

## Core Entities

### User
```
User {
  id: string (UUID)
  email: string (unique)
  password_hash: string
  name: string
  avatar_url: string (optional)
  presence: enum [online, away, offline]
  last_seen_at: datetime
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
  is_private: boolean
  created_by: string (User.id)
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
  joined_at: datetime
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
  dm_conversation_id: string (DMConversation.id) (optional)
  user_id: string (User.id)
  content: string
  is_edited: boolean
  created_at: datetime
  updated_at: datetime
}
```

### MessageReaction
```
MessageReaction {
  message_id: string (Message.id)
  user_id: string (User.id)
  emoji: string
  created_at: datetime
}
```
Primary Key: (message_id, user_id, emoji)

### DMConversation
```
DMConversation {
  id: string (UUID)
  workspace_id: string (Workspace.id)
  created_at: datetime
}
```

### DMParticipant
```
DMParticipant {
  conversation_id: string (DMConversation.id)
  user_id: string (User.id)
  last_read_at: datetime
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

## Relationships

### User Relations
- User has many WorkspaceMembers
- User has many ChannelMembers
- User has many Messages
- User has many Files

### Workspace Relations
- Workspace has one owner (User)
- Workspace has many WorkspaceMembers
- Workspace has many Channels
- Workspace has many DMConversations

### Channel Relations
- Channel belongs to Workspace
- Channel has many ChannelMembers
- Channel has many Messages

### Message Relations
- Message belongs to User
- Message belongs to Channel OR DMConversation
- Message has many MessageReactions
- Message has many MessageAttachments

### DM Relations
- DMConversation has many DMParticipants (2-8)
- DMConversation has many Messages

## Constraints

### Business Rules
- User can only be in channels within their workspaces
- Private channels require explicit membership
- Messages must belong to either channel or DM conversation
- DM conversations have 2-8 participants
- Files are scoped to workspace
- Only message author can edit/delete
- Workspace owner cannot be removed

### Data Integrity
- Cascade delete workspace → channels, members
- Cascade delete channel → messages, members
- Cascade delete message → reactions, attachments
- Soft delete for audit trail (add deleted_at field)

## Indexes

### Performance Critical
- User.email (unique)
- WorkspaceMember.(workspace_id, user_id)
- Channel.(workspace_id, name)
- ChannelMember.(channel_id, user_id)
- Message.channel_id + created_at
- Message.dm_conversation_id + created_at
- DMParticipant.user_id

### Search
- Message.content (full text)
- User.name
- Channel.name
- File.filename