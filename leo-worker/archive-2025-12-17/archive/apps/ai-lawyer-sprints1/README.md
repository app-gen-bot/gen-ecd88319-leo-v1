# AI Tenant Rights Advisor - Sprint 1 MVP

AI-powered legal assistance for California tenants. Get instant answers about your rights, review lease agreements, and manage disputes.

## 🚀 Sprint 1 Features

### ✅ AI Legal Advisor Chat
- Context-aware chatbot trained on California Civil Code 1940-1954.1
- Provides citations to relevant laws
- Plain English explanations with examples
- Maintains conversation history for context

### ✅ User Authentication & Profile
- Secure authentication with Better Auth framework
- Email/password authentication with dedicated auth server
- User type selection (tenant/landlord)
- Profile management with rental information
- Session management with HTTP-only cookies

### ✅ Conversation History & Management
- All conversations saved to DynamoDB
- Search functionality within conversations
- Continue previous conversations
- Export conversations as PDF
- Rich demo data for testing

## 🛠 Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **ShadCN UI** components
- **Tailwind CSS** styling
- **Mock Service Worker (MSW)** for API mocking

### Backend
- **Python 3.12** with FastAPI
- **DynamoDB** (Live AWS) for data persistence
- **OpenAI GPT-4.1** for AI responses
- **Better Auth** server (Node.js) for authentication
- **boto3** for AWS integration
- **Custom DynamoDB adapter** for Better Auth

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- AWS Account with credentials
- OpenAI API key

## 🚀 Quick Start

### 1. Run Setup Script (Recommended)

```bash
# From project root
chmod +x setup.sh
./setup.sh
```

This will:
- Check prerequisites (Node.js, Python 3.12)
- Verify environment variables
- Install all dependencies
- Create Python virtual environment

### 1b. Manual Installation (Alternative)

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install  # For Better Auth server
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Setup

The project uses environment variables from the central app-factory `.env` file. The following files have been pre-configured:

- `frontend/.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables

### 3. Start Development Servers

```bash
# From project root
chmod +x start_servers.sh
./start_servers.sh
```

This will start THREE servers:
- Better Auth Server: http://localhost:3095 (authentication)
- Backend API: http://localhost:8000 (main API)
- Frontend: http://localhost:3000 (web app)
- API Docs: http://localhost:8000/docs

**Note:** The script starts all servers automatically in the correct order. Better Auth must start first!

### 4. Demo Credentials

```
Email: demo@example.com
Password: DemoRocks2025!
```

## 🧪 Testing

### MSW Mode (Default)
The frontend starts with MSW mocks enabled by default. This allows testing without the backend running.

### Real API Mode
To test with real APIs:

```bash
# Set environment variable
export NEXT_PUBLIC_USE_REAL_API=true

# Start both servers
./start_servers.sh
```

### Run User Journey Tests

```bash
# Automated test simulation
python test_user_journeys.py
```

## 📁 Project Structure

```
ai-lawyer-sprints1/
├── frontend/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utilities
│   ├── mocks/              # MSW handlers
│   └── shared/             # Shared types
├── backend/
│   ├── api/                # FastAPI routes
│   ├── auth/               # Better Auth server
│   │   ├── server.ts       # Auth server entry
│   │   ├── auth-server.ts  # Auth configuration
│   │   └── dynamodb-adapter.ts # Custom adapter
│   ├── db/                 # Database operations
│   ├── models/             # Pydantic models
│   ├── services/           # Business logic
│   ├── utils/              # Utilities
│   └── main.py             # FastAPI app
└── shared/
    └── types/              # TypeScript types

```

## 🔑 Key Features Implementation

### Authentication Flow
1. User signs up/in with email and password
2. Frontend sends request to Backend API (port 8000)
3. Backend proxies request to Better Auth server (port 3095)
4. Better Auth validates credentials and manages sessions
5. Sessions stored as HTTP-only cookies
6. Automatic session timeout after 30 minutes of inactivity

### AI Chat Implementation
1. User sends message through chat interface
2. Backend receives message with conversation context
3. OpenAI GPT-4.1 generates legal response with citations
4. Response saved to DynamoDB with conversation tracking
5. Frontend displays response with proper formatting

### Data Persistence
- All data stored in live AWS DynamoDB
- Two tables: main app table and Better Auth table
- Single-table design with composite keys
- GSI for efficient queries
- Automatic timestamps on all records
- Demo data seeded on startup

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/session` - Get current session

### Chat
- `POST /api/v1/chat/message` - Send chat message
- `GET /api/v1/chat/suggestions` - Get chat suggestions

### Conversations
- `GET /api/v1/conversations` - List user conversations
- `GET /api/v1/conversations/{id}` - Get conversation details
- `POST /api/v1/conversations/search` - Search conversations
- `POST /api/v1/conversations/{id}/export` - Export as PDF

### User
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## 🔒 Security

- Better Auth for secure authentication
- Password hashing with bcrypt
- HTTP-only cookies for sessions
- CORS configured for allowed origins
- Input validation with Pydantic
- SQL injection prevention (using DynamoDB)
- XSS protection in React

## 📝 Legal Disclaimer

This service provides legal information, not legal advice. Always consult with a qualified attorney for specific legal matters.

## 🏗 Development Notes

### Progressive Enhancement with MSW
1. Define API contracts in `shared/types/api.ts`
2. Create MSW handlers in `frontend/mocks/handlers.ts`
3. Develop frontend with mocks
4. Implement backend APIs
5. Switch between MSW and real APIs with env variable

### DynamoDB Schema
- **Main Table**: `ai-lawyer-main-table`
  - PK: Partition key (e.g., USER#123)
  - SK: Sort key (e.g., CONV#456)
  - GSI1: For email lookups
  - GSI2: For additional queries
- **Auth Table**: `better-auth-table`
  - pk: Partition key (e.g., USER#abc)
  - sk: Sort key (e.g., PROFILE)
  - Used by Better Auth for session management

### Adding New Features
1. Update API types in `shared/types/api.ts`
2. Add MSW handlers for new endpoints
3. Implement frontend components
4. Create backend endpoints
5. Update DynamoDB operations as needed
6. Test with both MSW and real APIs

## 🚨 Important Notes

- **Live AWS Only**: No local emulation, all data goes to real AWS
- **Demo Data**: Rich demo data is seeded for demo@example.com
- **Cost Awareness**: Using real AWS services incurs costs
- **API Keys**: Keep your OpenAI and AWS credentials secure

## 🛠️ Troubleshooting

### "Connection refused on port 3095"
- The Better Auth server is not running
- Check `backend/auth-server.log` for errors
- Ensure Node.js dependencies are installed: `cd backend && npm install`

### "Authentication service is not available" 
- Better Auth server crashed or failed to start
- Check if port 3095 is already in use
- Verify AWS credentials are set in `.env`

### Login/Signup not working
- Ensure all 3 servers are running (check with `lsof -i:3000,3095,8000`)
- Check browser console for CORS errors
- Verify `frontend/.env.local` has correct API URL

### Python module errors
- Make sure you're using Python 3.12
- Activate virtual environment: `source backend/venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

## 📄 License

Powered by PlanetScale

---

Built with ❤️ for California tenants