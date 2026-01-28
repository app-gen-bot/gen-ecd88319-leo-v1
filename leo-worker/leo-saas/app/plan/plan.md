# Launch Platform - SaaS Application Generator

## Overview
A complete SaaS platform that allows users to submit natural language prompts and receive fully generated, production-ready applications. The platform handles authentication, request queuing, containerized generation, storage, and download delivery.

## Core Features

### 1. User Authentication & Management
**User Stories:**
- As a new user, I can register with email and password
- As a returning user, I can log in to access my generation history
- As a logged-in user, I can view my profile information
- As a user, my data is isolated from other users

**Requirements:**
- JWT-based authentication
- Secure password handling
- Session persistence
- Protected routes requiring authentication

### 2. Application Generation Request Submission
**User Stories:**
- As a logged-in user, I can submit a prompt describing the app I want
- As a user, I can see my prompt added to the generation queue
- As a user, I receive feedback that my request was accepted

**Requirements:**
- Text area for prompt input (minimum 10 chars, maximum 5000 chars)
- Validation before submission
- Immediate creation of generation request record
- Assignment of unique request ID

### 3. Generation Request Tracking & Status Updates
**User Stories:**
- As a user, I can view all my generation requests
- As a user, I can see the current status of each request (queued, generating, completed, failed)
- As a user, I can see when each request was created
- As a user, I can see error messages if generation fails

**Requirements:**
- List view of all user's requests
- Status badge with visual indicators (colors, icons)
- Timestamps for created and completed dates
- Real-time or polling-based status updates
- Error message display for failed requests

### 4. Generated Application Download
**User Stories:**
- As a user, I can download my generated application when it's ready
- As a user, I receive a zip file containing the complete application
- As a user, my download links are secure and temporary

**Requirements:**
- Download button appears when status = 'completed'
- Pre-signed S3 URLs with 24-hour expiration
- Zip file format with complete project structure
- Secure, user-scoped access (can't download others' apps)

### 5. Containerized Generation Orchestration
**User Stories:**
- As the system, I need to spawn isolated containers for each generation
- As the system, I need to support both local (Docker) and cloud (AWS ECS) deployment
- As the system, I need to clean up resources after generation

**Requirements:**
- Environment detection (AWS credentials → ECS, else → Docker)
- Unique workspace isolation per request
- Container lifecycle management (spawn → execute → terminate)
- Timeout handling (max 10 minutes per generation)
- Resource cleanup to prevent orphaned containers

### 6. Storage & File Management
**User Stories:**
- As the system, I need to store generated applications securely
- As the system, I need to organize files by user and request
- As the system, I need to generate temporary download links

**Requirements:**
- S3 bucket integration
- User-scoped key structure: `generations/{userId}/{requestId}.zip`
- Pre-signed URL generation (24-hour expiry)
- Efficient storage (no duplicates)

## Data Model

### Entities

#### User
- `id`: number (primary key)
- `email`: string (unique, email format)
- `name`: string
- `role`: enum ('user', 'admin')
- `createdAt`: datetime

#### GenerationRequest
- `id`: number (primary key)
- `userId`: number (foreign key → User)
- `prompt`: string (min 10, max 5000 chars)
- `status`: enum ('queued', 'generating', 'completed', 'failed')
- `createdAt`: datetime
- `completedAt`: datetime (nullable)
- `downloadUrl`: string (nullable)
- `errorMessage`: string (nullable)

### Relationships
- User has many GenerationRequests
- GenerationRequest belongs to User

## User Flows

### New User Registration → First Generation
1. User visits landing page
2. User clicks "Sign Up"
3. User fills registration form (email, password, name)
4. User submits and receives JWT token
5. User redirected to dashboard
6. User sees prompt submission form
7. User types app description (e.g., "Build a todo list app with user authentication")
8. User clicks "Generate App"
9. Request created with status 'queued'
10. Request appears in list below
11. Status updates to 'generating' (user sees spinner)
12. Status updates to 'completed' (user sees download button)
13. User clicks download
14. Zip file downloads to user's computer

### Returning User - Check Status
1. User visits login page
2. User enters credentials
3. User redirected to dashboard
4. User sees list of previous generation requests
5. User can see status of each request
6. User can download completed apps
7. User can submit new generation request

### Admin Flow (Future)
1. Admin logs in
2. Admin sees all users' generation requests
3. Admin can view system metrics
4. Admin can manually retry failed requests

## Technical Considerations

### Backend Stack
- **Runtime:** Node.js with Express
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** JWT tokens with bcrypt password hashing
- **Storage:** AWS S3 (or compatible local storage)
- **Containerization:** Docker SDK (local) or AWS ECS API (production)
- **Validation:** Zod schemas

### Frontend Stack
- **Framework:** React with TypeScript
- **Routing:** Wouter
- **State:** React Query for server state
- **Styling:** Tailwind CSS + shadcn/ui
- **API Client:** ts-rest client with auto-auth headers

### Environment Detection
```typescript
const isProduction = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

if (isProduction) {
  // Use AWS ECS to spawn generation containers
  // Use AWS S3 for storage
} else {
  // Use Docker SDK to spawn local containers
  // Use local S3-compatible storage or mock
}
```

### Security Considerations
- JWT tokens for authentication
- User-scoped data access (can't see others' requests)
- Pre-signed URLs with expiration
- Workspace isolation per generation
- Input validation and sanitization
- Rate limiting on generation requests (future)

### Scalability Considerations
- Stateless backend (horizontal scaling)
- Queue-based generation (can add workers)
- S3 for distributed storage
- Database indexes on userId, status
- Container resource limits

### Error Handling
- Invalid prompts (too short, too long)
- Container spawn failures
- Container timeout (> 10 minutes)
- Generation errors (app-generator failures)
- S3 upload failures
- All failures set status to 'failed' with descriptive error message

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive token
- `GET /api/auth/me` - Get current user info (protected)
- `POST /api/auth/logout` - Invalidate token (protected)

### Generation Requests
- `POST /api/generations` - Create new generation request (protected)
- `GET /api/generations` - List user's generation requests (protected)
- `GET /api/generations/:id` - Get specific request details (protected)
- `GET /api/generations/:id/download` - Get download URL (protected)

## Pages

### Public Pages
- `/` - Landing page with hero, features, call-to-action
- `/login` - Login form
- `/register` - Registration form

### Protected Pages
- `/dashboard` - Main dashboard with prompt submission + request list
- `/generations/:id` - Detailed view of specific generation request

### Future Pages
- `/admin` - Admin panel for monitoring
- `/profile` - User profile settings
- `/pricing` - Pricing tiers

## MVP Scope (Phase 1)

**Must Have:**
- ✅ User registration and login
- ✅ Prompt submission form
- ✅ Generation request creation
- ✅ Status tracking (queued, generating, completed, failed)
- ✅ Orchestrator with environment detection
- ✅ S3 storage integration
- ✅ Download link generation
- ✅ User-scoped data isolation

**Nice to Have (Future):**
- ⏳ Real-time WebSocket status updates (polling for MVP)
- ⏳ Request cancellation
- ⏳ Generation request history filtering/search
- ⏳ Email notifications when generation completes
- ⏳ Rate limiting
- ⏳ Usage analytics
- ⏳ Pricing tiers

## Success Metrics

1. **User can register and log in** - Auth flow works end-to-end
2. **User can submit prompt** - Request created in database
3. **Container spawns correctly** - Docker/ECS container starts
4. **App generates successfully** - Container produces zip file
5. **Zip uploads to S3** - File stored with correct key
6. **User can download** - Pre-signed URL works
7. **Multi-user isolation** - Users only see their own requests
8. **Environment detection** - Works in local and production modes
