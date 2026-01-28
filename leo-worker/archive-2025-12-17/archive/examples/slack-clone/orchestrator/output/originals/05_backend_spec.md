# Backend Specification - Slack Clone

## Technology Stack
- Python 3.12
- FastAPI
- DynamoDB
- S3 for file storage
- Redis for WebSocket pub/sub
- JWT for authentication

## Project Structure
```
app/
  api/
    v1/
      auth.py
      workspaces.py
      channels.py
      messages.py
      files.py
      users.py
      search.py
      admin.py
      websocket.py
  core/
    auth.py
    config.py
    security.py
  db/
    models.py
    dynamodb.py
  services/
    email.py
    storage.py
  main.py
```

## API Implementation

### Authentication Service
- Password hashing with bcrypt
- JWT token generation (7 day expiry)
- Google OAuth integration
- Token validation middleware

### Data Access Patterns

#### DynamoDB Tables

**Users Table**
- PK: USER#{user_id}
- GSI1: EMAIL#{email}

**Workspaces Table**
- PK: WORKSPACE#{workspace_id}
- SK: METADATA
- GSI1 PK: USER#{user_id}, SK: WORKSPACE#{workspace_id}

**Channels Table**
- PK: WORKSPACE#{workspace_id}
- SK: CHANNEL#{channel_id}

**Messages Table**
- PK: CHANNEL#{channel_id} or DM#{conversation_id}
- SK: MESSAGE#{timestamp}#{message_id}
- GSI1: USER#{user_id}, SK: MESSAGE#{timestamp}

**Files Table**
- PK: WORKSPACE#{workspace_id}
- SK: FILE#{file_id}

### Business Logic

#### Workspace Management
- Create workspace (user becomes admin)
- Invite users via email
- Deactivate users (admin only)
- Default channels (#general, #random)

#### Channel Management
- Create channels (public: any user, private: admin)
- Join/leave channels
- Add members to private channels
- Track last read timestamp

#### Message Handling
- Store messages with timestamps
- Update message (author only)
- Delete message (soft delete)
- Add reactions
- Handle @mentions

#### File Management
- Upload to S3 with pre-signed URLs
- Generate unique keys
- Track file metadata
- 50MB size limit enforcement

#### Real-time Features
- WebSocket connection management
- Publish events to Redis
- Subscribe to user's channels
- Typing indicators
- Presence updates

### External Integrations

#### AWS S3
- File upload with multipart
- Pre-signed URL generation
- Bucket lifecycle policies

#### Email Service
- Workspace invitations
- Password reset (future)
- Use AWS SES or SMTP

#### Redis
- WebSocket message pub/sub
- Presence tracking
- Typing indicators
- Connection registry

### Performance Optimizations

#### Caching
- User data in Redis (5 min TTL)
- Channel membership
- Workspace metadata

#### Query Optimization
- Batch DynamoDB operations
- Pagination for message history
- Efficient GSI usage

#### Rate Limiting
- API rate limits per user
- WebSocket message throttling
- File upload limits

### Security

#### Authentication
- Validate JWT on every request
- Check workspace membership
- Verify channel access

#### Authorization
- Role-based (admin/member)
- Resource-level permissions
- Admin-only endpoints

#### Data Validation
- Pydantic models for requests
- Input sanitization
- File type validation

### Error Handling

#### API Errors
- Consistent error format
- Proper HTTP status codes
- Detailed error messages

#### Exception Handling
- Global exception handler
- Logging with context
- Graceful degradation

### Background Tasks

#### Scheduled Jobs
- Clean up expired files (1 year)
- Update user presence
- Calculate statistics

#### Async Processing
- File thumbnail generation
- Search indexing
- Email sending

## WebSocket Protocol

### Connection Flow
1. Validate JWT
2. Join workspace room
3. Subscribe to channels
4. Send initial state

### Message Handling
- Validate message format
- Check permissions
- Broadcast to channel
- Store in database

### Scaling
- Redis for multi-instance
- Sticky sessions
- Graceful reconnection

## Deployment Configuration

### Environment Variables
- DATABASE_URL
- S3_BUCKET
- REDIS_URL
- JWT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

### Container
- Dockerfile with Python 3.12
- Health check endpoint
- Graceful shutdown

### Monitoring
- Request logging
- Error tracking
- Performance metrics
- WebSocket connections