# API Contract - Slack Clone v1.0

**Version**: 1.0  
**Generated**: 2025-06-29  
**Source**: Wireframe integration analysis (60+ endpoints discovered)

## Prerequisites

### Infrastructure Requirements
- **API requires DynamoDB tables to be provisioned via CDK**
- Backend will fail with 500 errors if tables don't exist
- All AWS resources must be deployed before API startup

### Test Data Requirements
- **Test data must be seeded before API testing**
- Run seed script after infrastructure deployment
- Default test account: test@example.com / password123

### Startup Sequence
1. Deploy infrastructure via CDK
2. Run database seed script
3. Start API backend
4. Backend will log warning if tables missing and fail on first operation

## Base URL
`/api/v1`

## Authentication
All authenticated endpoints require:
- Header: `Authorization: Bearer <jwt_token>`
- JWT expires in 7 days
- Refresh token for seamless renewal

## Common Response Formats

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-06-29T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

### Pagination
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 50,
    "has_more": true
  }
}
```

## Endpoints

### 1. Authentication & Session Management

#### POST /auth/register
Create new account with workspace
```json
// Request
{
  "email": "string",
  "password": "string", 
  "name": "string",
  "workspace_name": "string"  // Creates first workspace
}

// Response: 201
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar_url": "string",
    "avatar_initials": "string"
  },
  "workspace": {
    "id": "string",
    "name": "string"
  }
}
```
Errors: 400 (validation), 409 (email exists)

#### POST /auth/login
Email/password authentication
```json
// Request
{
  "email": "string",
  "password": "string"
}

// Response: 200
{
  "access_token": "string",
  "refresh_token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar_url": "string",
    "avatar_initials": "string",
    "workspaces": [
      {
        "id": "string",
        "name": "string",
        "role": "admin|member"
      }
    ]
  }
}
```
Errors: 401 (invalid credentials)

#### GET /auth/google
Initiates Google OAuth flow
- Redirects to Google with proper scopes
- State parameter for CSRF protection

#### GET /auth/google/callback
Handles OAuth callback
- Query params: `code`, `state`
- Creates/links account
- Response: Redirect with JWT in secure cookie

#### POST /auth/logout
Invalidate current session
```json
// Response: 200
{
  "message": "Logged out successfully"
}
```

#### GET /auth/session
Check current session validity
```json
// Response: 200
{
  "valid": true,
  "user": { ... },
  "expires_at": "2025-07-06T10:30:00Z"
}
```

#### POST /auth/refresh
Refresh access token
```json
// Request
{
  "refresh_token": "string"
}

// Response: 200
{
  "access_token": "string",
  "refresh_token": "string"
}
```

### 2. Workspace Management

#### GET /workspaces
List user's workspaces
```json
// Response: 200
{
  "workspaces": [
    {
      "id": "string",
      "name": "string",
      "role": "admin|member",
      "unread_count": 5,
      "member_count": 25
    }
  ]
}
```

#### GET /workspaces/current
Get current active workspace
```json
// Response: 200
{
  "id": "string",
  "name": "string",
  "role": "admin|member",
  "channels": 12,
  "members": 25,
  "storage_used": "5.2 GB"
}
```

#### POST /workspaces
Create new workspace
```json
// Request
{
  "name": "string"
}

// Response: 201
{
  "id": "string",
  "name": "string",
  "owner_id": "string",
  "created_at": "datetime"
}
```

#### PUT /workspaces/{workspace_id}
Update workspace settings (admin only)
```json
// Request
{
  "name": "string"
}

// Response: 200
{
  "id": "string",
  "name": "string",
  "updated_at": "datetime"
}
```

#### POST /workspaces/{workspace_id}/switch
Switch active workspace
```json
// Response: 200
{
  "workspace": { ... },
  "channels": [ ... ],
  "unread_totals": { ... }
}
```

### 3. Channels

#### GET /channels
List workspace channels with unread counts
```
Query Parameters:
- workspace_id (required): The workspace ID to filter channels
```json
// Response: 200
{
  "channels": [
    {
      "id": "string",
      "name": "string",
      "type": "Public|Private",
      "unread_count": 0,
      "member_count": 10,
      "last_message_at": "datetime",
      "is_member": true
    }
  ]
}
```

#### GET /channels/{channel_id}
Get channel details
```json
// Response: 200
{
  "id": "string",
  "name": "string",
  "type": "Public|Private",
  "created_by": {
    "id": "string",
    "name": "string"
  },
  "created_at": "datetime",
  "member_count": 10,
  "topic": "string",
  "is_member": true,
  "notification_preference": "all|mentions|none"
}
```

#### POST /channels
Create new channel
```json
// Request
{
  "name": "string",
  "type": "Public|Private",
  "description": "string"
}

// Response: 201
{
  "id": "string",
  "name": "string",
  "type": "Public|Private"
}
```

#### POST /channels/{channel_id}/join
Join public channel
```json
// Response: 200
{
  "joined_at": "datetime"
}
```

#### POST /channels/{channel_id}/leave
Leave channel
```json
// Response: 200
{
  "message": "Left channel successfully"
}
```

#### GET /channels/{channel_id}/members
List channel members
```json
// Query params: ?limit=50&page=1

// Response: 200
{
  "members": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "avatar_url": "string",
      "status": "online|away|offline",
      "role": "admin|member",
      "joined_at": "datetime"
    }
  ],
  "pagination": { ... }
}
```

#### POST /channels/{channel_id}/members
Add member to private channel
```json
// Request
{
  "user_id": "string"
}

// Response: 200
{
  "added_at": "datetime"
}
```

#### DELETE /channels/{channel_id}/members/{user_id}
Remove member from channel (admin only)
```json
// Response: 204
```

### 4. Direct Messages (Conversations)

#### GET /workspaces/{workspace_id}/conversations
List DM conversations with last message
```json
// Response: 200
{
  "conversations": [
    {
      "id": "string",
      "type": "direct|group",
      "participants": [
        {
          "id": "string",
          "name": "string",
          "avatar_url": "string",
          "status": "online|away|offline"
        }
      ],
      "last_message": {
        "content": "string",
        "timestamp": "datetime",
        "user_name": "string"
      },
      "unread_count": 2
    }
  ]
}
```

#### POST /conversations
Create new DM conversation
```json
// Request
{
  "participant_ids": ["string"],  // 1-7 other users
  "initial_message": "string"     // Optional
}

// Response: 201
{
  "id": "string",
  "type": "direct|group",
  "created_at": "datetime"
}
```

#### GET /conversations/{conversation_id}
Get conversation details
```json
// Response: 200
{
  "id": "string",
  "type": "direct|group",
  "participants": [ ... ],
  "created_at": "datetime"
}
```

### 5. Messages

#### GET /messages
Get message history from a channel or conversation
```
Query Parameters:
- channel_id (optional): Channel ID to get messages from
- conversation_id (optional): Conversation ID for DMs
- limit (optional): Number of messages to return (default 50, max 100)
- before (optional): ISO timestamp to get messages before
- after (optional): ISO timestamp to get messages after

Note: Either channel_id OR conversation_id must be provided

// Response: 200
{
  "messages": [
    {
      "id": "string",
      "user": {
        "id": "string",
        "name": "string",
        "avatar_url": "string"
      },
      "content": "string",
      "timestamp": "datetime",
      "timestamp_human": "10:30 AM",
      "is_edited": false,
      "reactions": [
        {
          "emoji": "👍",
          "count": 3,
          "users": ["John", "Sarah", "Mike"]
        }
      ],
      "thread_count": 5,
      "last_reply_at": "datetime",
      "attachments": []
    }
  ],
  "has_more": true,
  "oldest_timestamp": "datetime"
}
```

#### GET /conversations/{conversation_id}/messages
**DEPRECATED**: Use GET /messages?conversation_id={id} instead

#### POST /messages
Send new message
```json
// Request
{
  "channel_id": "string",        // Either channel_id
  "conversation_id": "string",   // OR conversation_id
  "content": "string",
  "attachments": ["file_id"]     // Optional
}

// Response: 201
{
  "id": "string",
  "timestamp": "datetime",
  "delivered": true
}
```

#### PUT /messages/{message_id}
Edit message (author only, within 5 minutes)
```json
// Request
{
  "content": "string"
}

// Response: 200
{
  "edited_at": "datetime"
}
```

#### DELETE /messages/{message_id}
Delete message (soft delete)
```json
// Response: 204
```

#### POST /messages/{message_id}/reactions
Add reaction
```json
// Request
{
  "emoji": "👍"
}

// Response: 200
{
  "added": true,
  "count": 4
}
```

#### DELETE /messages/{message_id}/reactions/{emoji}
Remove reaction
```json
// Response: 200
{
  "removed": true,
  "count": 3
}
```

#### POST /messages/{message_id}/thread
Reply to message in thread
```json
// Request
{
  "content": "string"
}

// Response: 201
{
  "id": "string",
  "thread_id": "string",
  "timestamp": "datetime"
}
```

#### GET /messages/{message_id}/thread
Get thread replies
```json
// Query params: ?limit=50

// Response: 200
{
  "parent_message": { ... },
  "replies": [
    {
      "id": "string",
      "user": { ... },
      "content": "string",
      "timestamp": "datetime"
    }
  ],
  "participant_count": 3,
  "has_more": false
}
```

### 6. User Management

#### GET /users
List workspace users
```
Query Parameters:
- workspace_id (required): The workspace ID to get users from
- status (optional): Filter by status (online|away|offline)
- limit (optional): Number of users to return (default 50)

// Response: 200
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "title": "Senior Developer",
      "avatar_url": "string",
      "status": "online|away|offline",
      "last_active": "2 minutes ago",
      "role": "admin|member"
    }
  ]
}
```

#### GET /users/{user_id}
Get user profile
```json
// Response: 200
{
  "id": "string",
  "name": "string",
  "email": "string",
  "title": "Senior Developer",
  "avatar_url": "string",
  "status": "online|away|offline",
  "last_active": "2 minutes ago",
  "timezone": "America/New_York",
  "channels": ["general", "engineering"]
}
```

#### GET /users/me
Get current user profile
```json
// Response: 200
{
  "id": "string",
  "name": "string",
  "email": "string",
  "title": "Senior Developer",
  "avatar_url": "string",
  "status": "online|away|offline",
  "role": "admin|member",
  "workspaces": [
    {
      "id": "string",
      "name": "string",
      "role": "admin|member"
    }
  ]
}
```

#### PUT /users/me
Update current user profile
```json
// Request
{
  "name": "string",
  "title": "string",
  "avatar_url": "string"
}

// Response: 200
{
  "updated": true
}
```

#### POST /users/presence
Update presence status
```json
// Request
{
  "status": "online|away|offline",
  "status_message": "In a meeting"  // Optional
}

// Response: 200
{
  "status": "online",
  "expires_at": "datetime"  // Auto-away after 30 min
}
```

#### GET /users/online
Get currently online users
```json
// Response: 200
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "status": "online",
      "last_active": "now"
    }
  ],
  "count": 15
}
```

### 7. Search

#### GET /search
Global search across all content
```json
// Query params: ?q=<query>&type=all|messages|files|channels|users&limit=20

// Response: 200
{
  "results": {
    "messages": [
      {
        "id": "string",
        "content": "string",
        "highlights": ["matched <em>text</em>"],
        "channel": "general",
        "user": "John Doe",
        "timestamp": "datetime"
      }
    ],
    "files": [ ... ],
    "channels": [ ... ],
    "users": [ ... ]
  },
  "total_count": 45,
  "facets": {
    "type": {
      "messages": 30,
      "files": 10,
      "channels": 3,
      "users": 2
    }
  }
}
```

#### GET /search/messages
Search only messages
```json
// Query params: ?q=<query>&channel_id=<id>&user_id=<id>&from=<date>&to=<date>

// Response: 200
{
  "messages": [ ... ],
  "total": 30,
  "has_more": true
}
```

#### GET /search/files
Search files
```json
// Query params: ?q=<query>&type=<mimetype>&user_id=<id>

// Response: 200
{
  "files": [
    {
      "id": "string",
      "filename": "string",
      "mimetype": "string",
      "size": 1048576,
      "uploaded_by": "John Doe",
      "uploaded_at": "datetime",
      "channel": "general"
    }
  ]
}
```

#### GET /search/recent
Get recent searches
```json
// Response: 200
{
  "searches": [
    {
      "query": "string",
      "timestamp": "datetime",
      "result_count": 15
    }
  ]
}
```

#### POST /search/recent
Save search query
```json
// Request
{
  "query": "string"
}

// Response: 201
```

### 8. Notifications

#### GET /notifications
Get user notifications
```json
// Query params: ?unread_only=true&limit=20

// Response: 200
{
  "notifications": [
    {
      "id": "string",
      "type": "mention|channel|dm|file",
      "title": "Sarah mentioned you",
      "subtitle": "in #general",
      "avatar_url": "string",
      "is_read": false,
      "link_type": "channel",
      "link_id": "string",
      "timestamp": "5 minutes ago",
      "created_at": "datetime"
    }
  ],
  "unread_count": 3
}
```

#### PUT /notifications/{notification_id}/read
Mark notification as read
```json
// Response: 200
{
  "read": true
}
```

#### PUT /notifications/read-all
Mark all notifications as read
```json
// Response: 200
{
  "updated_count": 5
}
```

#### GET /notifications/unread-count
Get unread notification count
```json
// Response: 200
{
  "count": 3
}
```

#### POST /notifications/settings
Update notification preferences
```json
// Request
{
  "channel_notifications": "all|mentions|none",
  "dm_notifications": "all|none",
  "email_notifications": true,
  "push_notifications": true,
  "notification_schedule": {
    "start": "09:00",
    "end": "17:00",
    "timezone": "America/New_York"
  }
}

// Response: 200
{
  "updated": true
}
```

### 9. File Management

#### POST /files/upload
Upload file with multipart form data
```json
// Request: multipart/form-data
// Fields:
// - file: binary
// - channel_id: string (optional)
// - conversation_id: string (optional)

// Response: 201
{
  "id": "string",
  "filename": "string",
  "mimetype": "string",
  "size": 1048576,
  "url": "string",
  "thumbnail_url": "string",  // For images
  "uploaded_at": "datetime"
}
```

#### GET /files/{file_id}
Download file
- Returns binary data with appropriate Content-Type
- Supports range requests for partial downloads

#### GET /files/{file_id}/metadata
Get file information
```json
// Response: 200
{
  "id": "string",
  "filename": "string",
  "mimetype": "string",
  "size": 1048576,
  "uploaded_by": {
    "id": "string",
    "name": "string"
  },
  "uploaded_at": "datetime",
  "shared_in": ["general", "engineering"]
}
```

#### DELETE /files/{file_id}
Delete file (owner or admin only)
```json
// Response: 204
```

#### GET /workspaces/{workspace_id}/files
List workspace files
```json
// Query params: ?type=image|document|video&user_id=<id>&limit=50

// Response: 200
{
  "files": [ ... ],
  "total_size": 5497558138,  // bytes
  "pagination": { ... }
}
```

### 10. Admin Features

#### GET /admin/stats
Get workspace statistics
```json
// Response: 200
{
  "users": {
    "total": 25,
    "active": 20,  // Active in last 7 days
    "admins": 3
  },
  "channels": {
    "total": 12,
    "public": 8,
    "private": 4
  },
  "messages": {
    "total": 150000,
    "last_7_days": 5000,
    "average_per_day": 714
  },
  "storage": {
    "used_gb": 5.2,
    "limit_gb": 100,
    "file_count": 1523
  },
  "calculated_at": "datetime"
}
```

#### GET /admin/users
List all users with admin details
```json
// Query params: ?status=active|inactive&role=admin|member

// Response: 200
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "admin|member",
      "status": "active|inactive",
      "last_active": "datetime",
      "joined_at": "datetime",
      "message_count": 1523,
      "storage_used_mb": 125
    }
  ]
}
```

#### POST /admin/users/invite
Send invitation email
```json
// Request
{
  "email": "string",
  "role": "admin|member",
  "message": "string"  // Optional custom message
}

// Response: 201
{
  "invitation_id": "string",
  "expires_at": "datetime"
}
```

#### DELETE /admin/users/{user_id}
Remove user from workspace
```json
// Response: 204
```

#### PUT /admin/users/{user_id}/role
Change user role
```json
// Request
{
  "role": "admin|member"
}

// Response: 200
{
  "updated": true
}
```

#### GET /admin/channels
List all channels with stats
```json
// Response: 200
{
  "channels": [
    {
      "id": "string",
      "name": "string",
      "type": "Public|Private",
      "member_count": 10,
      "message_count": 1500,
      "created_at": "datetime",
      "last_activity": "datetime",
      "creator": {
        "id": "string",
        "name": "string"
      }
    }
  ]
}
```

#### DELETE /admin/channels/{channel_id}
Delete channel (archives messages)
```json
// Response: 204
```

### 11. WebSocket API

#### Connection
```
WS /api/ws
Headers: Authorization: Bearer <jwt_token>
```

#### Client → Server Events

##### message.send
```json
{
  "type": "message.send",
  "data": {
    "channel_id": "string",
    "content": "string"
  }
}
```

##### typing.start
```json
{
  "type": "typing.start",
  "data": {
    "channel_id": "string"
  }
}
```

##### typing.stop
```json
{
  "type": "typing.stop",
  "data": {
    "channel_id": "string"
  }
}
```

##### presence.update
```json
{
  "type": "presence.update",
  "data": {
    "status": "online|away|offline"
  }
}
```

##### channel.join
```json
{
  "type": "channel.join",
  "data": {
    "channel_id": "string"
  }
}
```

#### Server → Client Events

##### message.new
```json
{
  "type": "message.new",
  "data": {
    "id": "string",
    "channel_id": "string",
    "user": { ... },
    "content": "string",
    "timestamp": "datetime"
  }
}
```

##### message.updated
```json
{
  "type": "message.updated",
  "data": {
    "id": "string",
    "content": "string",
    "edited_at": "datetime"
  }
}
```

##### reaction.added
```json
{
  "type": "reaction.added",
  "data": {
    "message_id": "string",
    "emoji": "👍",
    "user": { ... },
    "count": 4
  }
}
```

##### typing.user
```json
{
  "type": "typing.user",
  "data": {
    "channel_id": "string",
    "user": {
      "id": "string",
      "name": "string"
    },
    "is_typing": true
  }
}
```

##### presence.changed
```json
{
  "type": "presence.changed",
  "data": {
    "user_id": "string",
    "status": "online|away|offline"
  }
}
```

##### notification.new
```json
{
  "type": "notification.new",
  "data": {
    "id": "string",
    "type": "mention",
    "title": "Sarah mentioned you",
    "subtitle": "in #general"
  }
}
```

## Rate Limits

### API Endpoints
- General: 60 requests/minute
- Search: 20 requests/minute
- File upload: 10 requests/minute
- Message send: 30 requests/minute

### WebSocket
- Messages: 10/second
- Typing indicators: 1/second
- Presence updates: 1/minute

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_INVALID` | Invalid token |
| `AUTH_EXPIRED` | Token expired |
| `PERMISSION_DENIED` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `RATE_LIMITED` | Too many requests |
| `SERVER_ERROR` | Internal server error |
| `WS_INVALID_MESSAGE` | Invalid WebSocket message |

## Security Considerations

1. **Authentication**
   - JWT tokens with 7-day expiry
   - Refresh tokens for seamless renewal
   - Secure cookie storage for web clients

2. **Authorization**
   - Workspace membership validation
   - Channel access control
   - Resource-level permissions

3. **Data Protection**
   - TLS for all communications
   - Input sanitization
   - SQL injection prevention
   - XSS protection

4. **File Security**
   - Virus scanning on upload
   - Type validation
   - Size limits (50MB)
   - Secure S3 presigned URLs

5. **Rate Limiting**
   - Per-user limits
   - Graduated backoff
   - WebSocket throttling