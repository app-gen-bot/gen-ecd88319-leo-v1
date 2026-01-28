# Backend Specification - Slack Clone v1.0

**Version**: 1.0  
**Generated**: 2025-06-29  
**Source**: Wireframe integration analysis and implementation requirements

## Infrastructure Requirements

### CRITICAL: Infrastructure Separation
- **Backend assumes DynamoDB tables exist. Infrastructure is managed by CDK.**
- Backend applications MUST NOT create database tables or other infrastructure
- Applications should fail fast with clear error messages if tables don't exist
- All infrastructure (tables, buckets, queues) must be provisioned via AWS CDK

### Initialization Sequence
1. **CDK Deployment** - Creates all DynamoDB tables, S3 buckets, and other AWS resources
2. **Database Seeding** - Populates initial data (test users, default channels)
3. **Application Start** - Backend assumes all infrastructure exists

### Environment Detection
- Backend should check for required tables on startup
- If tables missing, fail with: "DynamoDB tables not found. Deploy infrastructure via CDK first."
- Never attempt to create missing infrastructure

## Technology Stack
- Python 3.12
- FastAPI
- DynamoDB
- S3 for file storage
- Redis for WebSocket pub/sub and caching
- JWT for authentication
- AWS Lambda (optional for background tasks)
- AWS SES for email notifications

## Project Structure
```
app/
  api/
    v1/
      auth.py           # Authentication & OAuth
      workspaces.py     # Workspace management
      channels.py       # Channel operations
      messages.py       # Message CRUD & threads
      files.py          # File upload/download
      users.py          # User profiles & presence
      search.py         # Search functionality
      admin.py          # Admin operations
      websocket.py      # WebSocket connections
      notifications.py  # Notification system (NEW)
      conversations.py  # DM conversations (NEW)
      reactions.py      # Message reactions (NEW)
      threads.py        # Thread management (NEW)
  core/
    auth.py            # JWT & OAuth logic
    config.py          # Configuration
    security.py        # Security utilities
    cache.py           # Redis caching layer (NEW)
    queue.py           # Background job queue (NEW)
  db/
    models.py          # Pydantic models
    dynamodb.py        # DynamoDB client
    queries.py         # Query patterns (NEW)
  services/
    email.py           # Email notifications
    storage.py         # S3 file storage
    presence.py        # Presence tracking (NEW)
    search_indexer.py  # Search indexing (NEW)
    thumbnail.py       # Image processing (NEW)
  background/
    workers.py         # Background job workers (NEW)
    tasks.py          # Task definitions (NEW)
  main.py
```

## API Implementation

### Authentication Service
- Password hashing with bcrypt
- JWT token generation (7 day expiry) with refresh tokens
- Google OAuth integration with account linking
- Token validation middleware
- Session management with Redis
- Rate limiting on auth endpoints

### Enhanced Services

#### 1. Notification Service (notifications.py)
```python
class NotificationService:
    async def create_notification(
        user_id: str,
        type: str,  # mention, channel, dm, file
        title: str,
        subtitle: str,
        link_type: str,
        link_id: str,
        avatar_url: Optional[str] = None
    ) -> Notification:
        # Create notification with TTL (30 days)
        # Publish to WebSocket for real-time delivery
        # Queue email notification if user preference
    
    async def mark_read(notification_id: str, user_id: str):
        # Update read status
        # Update unread count cache
    
    async def get_unread_count(user_id: str) -> int:
        # Check Redis cache first
        # Query if cache miss
```

#### 2. Presence Service (presence.py)
```python
class PresenceService:
    async def update_presence(
        user_id: str,
        workspace_id: str,
        status: str  # online, away, offline
    ):
        # Update DynamoDB with TTL (30 minutes)
        # Publish to Redis pub/sub
        # Broadcast via WebSocket
    
    async def get_online_users(workspace_id: str) -> List[User]:
        # Query presence table
        # Filter by workspace and status
    
    async def auto_away_check():
        # Background job every 5 minutes
        # Set users to away after 30 min inactivity
```

#### 3. Thread Service (threads.py)
```python
class ThreadService:
    async def create_thread(parent_message_id: str) -> Thread:
        # Create thread record
        # Subscribe thread creator
    
    async def add_reply(
        thread_id: str,
        user_id: str,
        content: str
    ) -> Message:
        # Create message with parent_message_id
        # Update thread counts
        # Notify subscribed users
    
    async def get_thread_messages(
        thread_id: str,
        limit: int = 50
    ) -> List[Message]:
        # Query messages by parent_message_id
        # Include user data
```

#### 4. Conversation Service (conversations.py)
```python
class ConversationService:
    async def create_conversation(
        participant_ids: List[str],
        creator_id: str
    ) -> Conversation:
        # Support 2-8 participants
        # Create conversation record
        # Add all participants
    
    async def get_conversations_for_user(
        user_id: str,
        workspace_id: str
    ) -> List[ConversationWithLastMessage]:
        # Query participant table
        # Join with conversations
        # Include last message and unread count
```

### Data Access Patterns

#### DynamoDB Tables (12 total)

**1. Users Table**
```
PK: USER#{user_id}
SK: METADATA
GSI1: EMAIL#{email}
Attributes: name, avatar_url, title, role, created_at, updated_at
```

**2. Workspaces Table**
```
PK: WORKSPACE#{workspace_id}
SK: METADATA
Attributes: name, owner_id, stats (cached), created_at
```

**3. WorkspaceMemberships Table**
```
PK: WORKSPACE#{workspace_id}
SK: USER#{user_id}
GSI1 PK: USER#{user_id}, SK: WORKSPACE#{workspace_id}
Attributes: role (admin|member), joined_at, is_active
```

**4. Channels Table**
```
PK: WORKSPACE#{workspace_id}
SK: CHANNEL#{channel_id}
GSI1: CHANNEL#{channel_id}
Attributes: name, type, member_count, message_count, created_by
```

**5. ChannelMemberships Table**
```
PK: CHANNEL#{channel_id}
SK: USER#{user_id}
GSI1 PK: USER#{user_id}, SK: CHANNEL#{channel_id}
Attributes: joined_at, unread_count, last_read_at, notification_pref
```

**6. Messages Table**
```
PK: CHANNEL#{channel_id} or CONVERSATION#{conversation_id}
SK: MSG#{timestamp}#{message_id}
GSI1: USER#{user_id}, SK: MSG#{timestamp}
GSI2: PARENT#{parent_message_id}, SK: MSG#{timestamp}
Attributes: content, user_name, user_avatar, reactions, thread_count
Stream: Enabled for real-time
```

**7. Conversations Table**
```
PK: CONVERSATION#{conversation_id}
SK: METADATA
GSI1: WORKSPACE#{workspace_id}, SK: CONV#{conversation_id}
Attributes: type, name, last_message_preview, last_message_at
```

**8. ConversationParticipants Table**
```
PK: CONVERSATION#{conversation_id}
SK: USER#{user_id}
GSI1 PK: USER#{user_id}, SK: CONV#{conversation_id}
Attributes: unread_count, last_read_at, joined_at
```

**9. Notifications Table**
```
PK: USER#{user_id}
SK: NOTIF#{timestamp}#{notification_id}
GSI1: USER#{user_id}#UNREAD, SK: NOTIF#{timestamp}
Attributes: type, title, subtitle, is_read, link_type, link_id
TTL: expires_at (30 days)
```

**10. Files Table**
```
PK: WORKSPACE#{workspace_id}
SK: FILE#{file_id}
GSI1: USER#{user_id}, SK: FILE#{timestamp}
Attributes: filename, mimetype, size, s3_key, thumbnail_key
```

**11. Presence Table**
```
PK: WORKSPACE#{workspace_id}
SK: USER#{user_id}
GSI1: STATUS#{status}, SK: USER#{user_id}
Attributes: status, status_message, last_active_at
TTL: expires_at (30 minutes)
```

**12. Reactions Table** (or embed in Messages)
```
PK: MESSAGE#{message_id}
SK: REACTION#{emoji}
Attributes: users[], count, user_names[]
```

### Business Logic

#### Workspace Management
- Create workspace (user becomes admin)
- Invite users via email with expiry
- Deactivate users (admin only)
- Default channels (#general, #random) auto-created
- Track workspace statistics (cached)

#### Channel Management
- Create channels (public: any user, private: admin)
- Join/leave channels with notifications
- Add members to private channels
- Track last read timestamp and unread counts
- Channel-specific notification preferences
- Archive channels (soft delete)

#### Message Handling
- Store messages with denormalized user data
- Update message (author only, within 5 minutes)
- Delete message (soft delete with tombstone)
- Thread support with participant tracking
- Reaction aggregation with user lists
- @mention extraction and notification
- Message search indexing

#### Thread Management (NEW)
- Any message can start a thread
- Thread replies are messages with parent_message_id
- Track thread participants automatically
- Thread-specific notifications
- Unread thread count tracking

#### File Management
- Upload to S3 with pre-signed URLs
- Generate thumbnails for images (Lambda)
- Track file metadata in DynamoDB
- 50MB size limit enforcement
- Virus scanning integration
- 1-year retention policy
- CDN distribution for performance

#### Real-time Features
- WebSocket connection management
- Channel-based rooms in Redis
- Typing indicators (3-second expiry)
- Presence updates with auto-away
- Message delivery confirmation
- Connection state recovery

#### Notification System (NEW)
- Create notifications for mentions, DMs, channel activity
- Real-time delivery via WebSocket
- Email queuing for offline users
- Notification preferences per channel
- Do not disturb scheduling
- Unread count caching

#### Search Implementation
- Multi-index search across entities
- ElasticSearch or DynamoDB streams to OpenSearch
- Search result ranking by relevance
- Recent search history per user
- Faceted search with filters
- Highlighting matched terms

### External Integrations

#### AWS S3
- File upload with multipart support
- Pre-signed URL generation (5 min expiry)
- Bucket lifecycle policies
- CloudFront CDN integration
- Thumbnail bucket for images

#### Email Service (AWS SES)
- Workspace invitations with custom templates
- Password reset flows
- Notification digests for offline users
- Unsubscribe handling
- Bounce/complaint processing

#### Redis
- WebSocket pub/sub for real-time events
- Channel-specific rooms
- Presence set management (ZSET with scores)
- Typing indicator expiry (SETEX)
- Connection registry for sticky sessions
- Cache layer for hot data:
  - User profiles (5 min TTL)
  - Channel memberships (10 min TTL)
  - Unread counts (1 min TTL)
  - Workspace metadata (30 min TTL)

### Performance Optimizations

#### Caching Strategy
```python
# Redis cache keys
USER_PROFILE = "user:{user_id}"
CHANNEL_MEMBERS = "channel:{channel_id}:members"
UNREAD_COUNT = "user:{user_id}:channel:{channel_id}:unread"
WORKSPACE_STATS = "workspace:{workspace_id}:stats"

# Cache-aside pattern with TTL
async def get_user_profile(user_id: str):
    # Check Redis first
    cached = await redis.get(f"user:{user_id}")
    if cached:
        return json.loads(cached)
    
    # Query DynamoDB
    user = await dynamodb.get_user(user_id)
    
    # Cache with TTL
    await redis.setex(
        f"user:{user_id}",
        300,  # 5 minutes
        json.dumps(user)
    )
    return user
```

#### Query Optimization
- Batch DynamoDB operations (up to 25 items)
- Pagination for message history (50 per page)
- Efficient GSI usage for access patterns
- DynamoDB streams for denormalization
- Projection expressions to limit data transfer

#### Background Jobs
```python
# Celery or Lambda for async tasks
@background_task
async def process_message(message_id: str):
    # Extract mentions
    # Update search index
    # Create notifications
    # Update channel stats

@scheduled_task(cron="*/5 * * * *")
async def update_presence():
    # Check last activity
    # Set auto-away status
    # Clean expired records

@scheduled_task(cron="0 2 * * *")
async def calculate_workspace_stats():
    # Aggregate daily stats
    # Update workspace cache
    # Clean old stats
```

### Security

#### Authentication & Authorization
- JWT validation on every request
- Workspace membership verification
- Channel access control (public vs private)
- Resource-level permissions
- Admin-only endpoint protection
- Rate limiting per user/IP

#### Data Validation
```python
# Pydantic models for all requests
class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    channel_id: Optional[str] = None
    conversation_id: Optional[str] = None
    
    @validator('content')
    def sanitize_content(cls, v):
        # Remove script tags
        # Escape HTML
        return sanitize_html(v)
```

#### Security Headers
```python
# FastAPI middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### Error Handling

#### Consistent Error Responses
```python
class APIException(Exception):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: dict = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details or {}

@app.exception_handler(APIException)
async def api_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )
```

#### Logging & Monitoring
```python
# Structured logging
import structlog
logger = structlog.get_logger()

# Log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    logger.info(
        "api_request",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration * 1000,
        user_id=request.state.user_id
    )
    return response
```

### WebSocket Protocol Implementation

#### Connection Manager
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_channels: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        
        # Subscribe to user's channels
        channels = await get_user_channels(user_id)
        for channel in channels:
            await self.join_channel(user_id, channel.id)
    
    async def broadcast_to_channel(
        self,
        channel_id: str,
        message: dict,
        exclude_user: Optional[str] = None
    ):
        # Publish to Redis for multi-instance support
        await redis.publish(
            f"channel:{channel_id}",
            json.dumps(message)
        )
```

#### Event Handlers
```python
async def handle_typing_start(user_id: str, channel_id: str):
    # Set typing indicator with TTL
    await redis.setex(
        f"typing:{channel_id}:{user_id}",
        3,  # 3 seconds
        "1"
    )
    
    # Broadcast to channel
    await broadcast_to_channel(
        channel_id,
        {
            "type": "typing.user",
            "data": {
                "channel_id": channel_id,
                "user": await get_user_info(user_id),
                "is_typing": True
            }
        },
        exclude_user=user_id
    )
```

### Deployment Configuration

#### Environment Variables
```bash
# Core
DATABASE_URL=dynamodb://...
REDIS_URL=redis://...
S3_BUCKET=slack-clone-files
S3_BUCKET_THUMBNAILS=slack-clone-thumbnails

# Auth
JWT_SECRET=...
JWT_ALGORITHM=HS256
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AWS
AWS_REGION=us-east-1
SES_FROM_EMAIL=noreply@example.com

# Features
ENABLE_EMAIL_NOTIFICATIONS=true
MAX_FILE_SIZE_MB=50
MESSAGE_EDIT_WINDOW_MINUTES=5
```

#### Container Configuration
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

#### Monitoring & Observability
- CloudWatch metrics for API latency
- X-Ray tracing for distributed debugging
- Custom metrics for business KPIs
- Error tracking with Sentry
- WebSocket connection monitoring
- DynamoDB consumed capacity alerts

### Scaling Considerations

#### Horizontal Scaling
- Stateless API servers
- Redis for shared state
- DynamoDB auto-scaling
- S3 for unlimited file storage
- CloudFront for static assets

#### Performance Targets
- API response time: < 200ms (p95)
- WebSocket latency: < 100ms
- Search response: < 500ms
- File upload: 10MB/s minimum
- Concurrent users: 10,000+
- Messages per second: 1,000+

### Testing Strategy

#### Unit Tests
```python
# Test message creation
async def test_create_message():
    message = await create_message(
        user_id="test_user",
        channel_id="test_channel",
        content="Hello, world!"
    )
    assert message.id is not None
    assert message.content == "Hello, world!"
    assert message.user_name == "Test User"
```

#### Integration Tests
```python
# Test full message flow
async def test_message_flow():
    # Create message
    response = await client.post(
        "/api/v1/messages",
        json={"channel_id": "chan_1", "content": "Test"}
    )
    assert response.status_code == 201
    
    # Verify WebSocket broadcast
    ws_message = await websocket_queue.get()
    assert ws_message["type"] == "message.new"
    
    # Verify notification created
    notifications = await get_notifications("user_2")
    assert len(notifications) == 1
```

#### Load Testing
- Locust for API endpoints
- Artillery for WebSocket connections
- Simulate 1000 concurrent users
- Message sending rate tests
- File upload stress testing