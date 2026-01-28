# Data Models vs Wireframe Stub Data Delta Analysis

Generated: 2025-06-29

## Executive Summary

The DRAFT data models cover approximately **70%** of the data requirements discovered from wireframe stub data. While the core entities are well-defined, several fields and entire entities are missing. The extracted stub data revealed 11 data collections with relationships and fields not captured in the original models.

### Key Statistics
- **Specified Entities**: 11
- **Required Entities**: 15+ (based on stub data)
- **Missing Entities**: 4+
- **Missing Fields**: 20+
- **Additional Relationships**: 8

## Entity Comparison

### Core Entities Analysis

#### User Model
**DRAFT Specification**:
```
User {
  id, email, password_hash, name, 
  avatar_url, presence, last_seen_at,
  created_at, updated_at
}
```

**Stub Data Reveals Need For**:
```
User {
  // ... existing fields plus:
  status: enum [online, offline, away]  // duplicate of presence
  role: enum [Admin, Member]  // moved from WorkspaceMember
  lastActive: string  // human-readable
  title: string  // job title
  avatar: string  // initials for display
}
```

**Delta**: Missing title, human-readable lastActive, avatar initials

#### Message Model
**DRAFT Specification**:
```
Message {
  id, channel_id, dm_conversation_id,
  user_id, content, is_edited,
  created_at, updated_at
}
```

**Stub Data Reveals Need For**:
```
Message {
  // ... existing fields plus:
  userName: string  // denormalized for display
  userAvatar: string  // denormalized
  timestamp: string  // human-readable
  threadCount: number  // thread replies
  edited: boolean  // duplicate of is_edited
  conversationId: string  // for DMs
}
```

**Delta**: Missing thread support, denormalized user data, human timestamps

#### Channel Model
**DRAFT Specification**:
```
Channel {
  id, workspace_id, name, is_private,
  created_by, created_at, updated_at
}
```

**Stub Data Reveals Need For**:
```
Channel {
  // ... existing fields plus:
  type: enum [Public, Private]  // in addition to is_private
  members: number  // member count
  messages: number  // message count
  created: string  // human-readable
  unreadCount: number  // per user (different model)
}
```

**Delta**: Missing counts, type enum, human-readable dates

### Missing Entities ❌

#### 1. Notification Entity
**Not in DRAFT**, but stub data shows:
```
Notification {
  id: string
  userId: string
  type: enum [mention, channel, dm, file]
  title: string
  subtitle: string
  timestamp: string
  read: boolean
  avatar: string (optional)
}
```

#### 2. SearchResult Entity
**Not in DRAFT**, but needed for search features:
```
SearchResult {
  id: string
  type: enum [message, channel, user, file]
  title: string
  subtitle: string
  timestamp: string (optional)
  avatar: string (optional)
}
```

#### 3. WorkspaceStats Entity
**Not in DRAFT**, but admin dashboard needs:
```
WorkspaceStats {
  workspaceId: string
  totalUsers: number
  activeUsers: number
  totalChannels: number
  totalMessages: number
  fileStorage: string
  lastWeekMessages: number
  calculatedAt: datetime
}
```

#### 4. Thread Entity
**Not in DRAFT**, but UI shows threads:
```
Thread {
  id: string
  parentMessageId: string
  participantIds: string[]
  lastReplyAt: datetime
  replyCount: number
}
```

## Relationship Gaps

### Missing Relationships

1. **Message → Thread** (parent-child)
2. **User → Notification** (one-to-many)
3. **Channel → UnreadStatus** (per user)
4. **Conversation → LastMessage** (for DM list)
5. **User → SearchHistory** (recent searches)
6. **Message → Mention** (extracted mentions)
7. **Workspace → Stats** (calculated metrics)
8. **File → Channel** (where shared)

### Relationship Modifications

#### DMConversation Structure
**DRAFT**: Simple conversation with participants
**Required**: 
- Track last message for list display
- Support group DMs (2-8 participants)
- Include conversation metadata

#### ChannelMember Enhancement
**DRAFT**: Basic membership
**Required**:
- Unread message count
- Last viewed timestamp
- Notification preferences
- Join date for display

## Data Type Mismatches

### Timestamp Handling
- **DRAFT**: Uses `datetime` type
- **Stub Data**: Uses human-readable strings ("5m ago", "Yesterday")
- **Impact**: Need transformation layer or dual storage

### Status/Presence
- **DRAFT**: Single `presence` enum
- **Stub Data**: Multiple status fields
- **Recommendation**: Consolidate to single source of truth

### ID Formats
- **DRAFT**: UUID strings
- **Stub Data**: Simple strings ("1", "general")
- **Impact**: Need ID generation strategy

## Missing Features from Stub Data

### 1. Reactions Detail
**DRAFT**: Simple emoji storage
**Stub Data**: Includes user arrays
```
reactions: [{
  emoji: string
  count: number
  users: string[]  // usernames who reacted
}]
```

### 2. File Metadata
**DRAFT**: Basic file info
**Stub Data References**: 
- Inline display capability
- Preview generation
- Share location tracking

### 3. Presence Granularity
**DRAFT**: Three states
**Stub Data**: Needs
- Last seen timestamps
- Auto-away logic
- Custom status messages

### 4. Search Indexing
**DRAFT**: Mentions full-text on content
**Required**:
- Multi-field search
- Result ranking
- Search history
- Category filtering

## DynamoDB Considerations

### From Generated Tables Analysis

The integration analysis generated 10 DynamoDB tables vs 11 entities in DRAFT:

**Additional Tables Needed**:
1. **Notifications** - User notifications with TTL
2. **Presence** - Real-time status with TTL
3. **SearchHistory** - Recent searches
4. **WorkspaceStats** - Cached statistics

**Schema Optimizations**:
- Composite keys for relationships
- GSIs for access patterns
- TTL for temporary data
- Streams for real-time

## Recommendations for Final Data Models

### 1. High Priority Additions
- Add Notification entity
- Add Thread support to Messages
- Add unread counts to ChannelMember
- Add human-readable timestamp fields

### 2. Schema Enhancements
- Denormalize user data in messages for performance
- Add cached counts to channels
- Include last message in conversations
- Support group DMs properly

### 3. Field Standardization
- Use consistent ID formats
- Standardize timestamp handling
- Consolidate duplicate fields
- Add missing metadata fields

### 4. Performance Optimizations
- Add materialized views for stats
- Cache frequently accessed data
- Optimize for common queries
- Consider read/write patterns

## Conclusion

The DRAFT data models provide a solid relational foundation but miss approximately 30% of requirements discovered from wireframe stub data:

1. **4 missing entities** (Notifications, Threads, Stats, Search)
2. **20+ missing fields** across existing entities
3. **Denormalization needs** for performance
4. **NoSQL optimizations** for DynamoDB

The stub data analysis revealed the need for richer data models with more metadata, cached values, and UI-specific fields. The final data models should incorporate these findings while maintaining data integrity and performance.