# Slack Clone Backend

A FastAPI-based backend for the Slack Clone application, using DynamoDB for data storage and Redis for caching/real-time features.

## Technology Stack

- **Framework**: FastAPI
- **Database**: DynamoDB (with local development support)
- **Cache/PubSub**: Redis
- **Authentication**: JWT + Google OAuth
- **File Storage**: AWS S3
- **WebSocket**: Built-in FastAPI WebSocket support
- **Container**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- AWS credentials (for production)
- Google OAuth credentials (for authentication)

### Local Development Setup

1. **Clone and navigate to backend directory**:
   ```bash
   cd slack-clone/backend
   ```

2. **Copy environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker Compose**:
   ```bash
   docker-compose up
   ```

   This will start:
   - FastAPI backend (http://localhost:8000)
   - DynamoDB Local (http://localhost:8001)
   - Redis (localhost:6379)
   - DynamoDB Admin UI (http://localhost:8002)

4. **API Documentation**:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Running without Docker

If you prefer to run without Docker:

1. **Install dependencies**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Start local services**:
   - Install and run DynamoDB Local
   - Install and run Redis

3. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

```
backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Core functionality (config, auth, logging)
│   ├── db/              # Database models and connections
│   ├── services/        # Business logic services
│   ├── background/      # Background tasks
│   └── main.py          # FastAPI application
├── tests/               # Test files
├── docker-compose.yml   # Local development setup
├── Dockerfile          # Container definition
└── requirements.txt    # Python dependencies
```

## API Endpoints

The API follows RESTful conventions with the following main endpoints:

- `/api/v1/auth/*` - Authentication (login, register, OAuth)
- `/api/v1/users/*` - User management
- `/api/v1/workspaces/*` - Workspace operations
- `/api/v1/channels/*` - Channel management
- `/api/v1/messages/*` - Message operations
- `/api/v1/files/*` - File uploads/downloads
- `/api/v1/ws` - WebSocket connections

## Database Schema

The application uses DynamoDB with the following tables:
- Users
- Workspaces
- Channels
- ChannelMemberships
- Messages
- Conversations
- ConversationParticipants
- Notifications
- Files
- Presence
- Reactions

## Testing

```bash
# Run all tests
docker-compose run backend pytest

# Run with coverage
docker-compose run backend pytest --cov=app

# Run specific test file
docker-compose run backend pytest tests/test_auth.py
```

## Deployment

The application is designed to be deployed on AWS with:
- ECS/Fargate for the application
- DynamoDB for data storage
- S3 for file storage
- ElastiCache for Redis
- API Gateway for the API
- CloudFront for CDN

## Environment Variables

See `.env.example` for all required environment variables.

## License

[Your License]