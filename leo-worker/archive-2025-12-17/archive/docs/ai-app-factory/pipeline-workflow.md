# Pipeline Workflow

## Overview

The AI App Factory pipeline transforms natural language into deployed applications through six specialized stages. Each stage builds upon the previous one, creating a production line for software development.

## Pipeline Architecture

```
User Prompt
    ↓
┌─────────────────────────┐
│ Stage 0: PRD Generation │ → Business Requirements Document
└─────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Stage 1: Interaction Spec       │ → UI Flows & Behaviors
└─────────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Stage 2: Wireframe [ACTIVE] │ → Working Frontend Application
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Stage 3: Technical Spec     │ → API Contracts & Data Models
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Stage 4: Backend [TODO]     │ → FastAPI Implementation
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Stage 5: Deployment [TODO]  │ → Live URL on AWS
└─────────────────────────────┘
```

## Stage 0: PRD Generation

### Purpose
Transform a user's high-level idea into comprehensive business requirements.

### Input
Simple natural language prompt:
```
"I want a Slack clone for my startup"
```

### Process
1. **Orchestrator Conversation**
   - Ask clarifying questions
   - Understand target users
   - Define core features
   - Establish constraints

2. **Requirement Extraction**
   - User personas
   - Feature list
   - Acceptance criteria
   - Non-functional requirements

### Output
Business PRD document (30+ pages) containing:
```markdown
# Product Requirements Document: Slack Clone

## Executive Summary
A real-time team communication platform...

## User Personas
1. **Team Admin**: Manages workspace...
2. **Team Member**: Daily communication...
3. **Guest User**: Limited access...

## Core Features
1. **Authentication**
   - Email/password login
   - OAuth integration
   - Password reset
   
2. **Messaging**
   - Channel-based chat
   - Direct messages
   - Thread replies
   ...

## Acceptance Criteria
- Users can create channels within 3 clicks
- Messages appear in real-time (<1s delay)
- Search returns results in <500ms
...
```

### Current Implementation
```python
# Temporary implementation
def generate_prd(user_prompt: str) -> str:
    # Currently copies from examples
    return read_file("examples/slack-clone/prd.md")
```

### Future Implementation
- Interactive orchestrator agent
- Dynamic question generation
- Requirements validation
- User confirmation flow

## Stage 1: Interaction Specification

### Purpose
Transform business requirements into detailed UI interactions and user flows.

### Input
Business PRD from Stage 0

### Process
1. **Feature Analysis**
   - Extract all features from PRD
   - Prioritize by importance
   - Group related features

2. **Interaction Design**
   - Define every user action
   - Specify system responses
   - Map user journeys
   - Detail error states

3. **Flow Documentation**
   - Login/logout flows
   - Feature workflows
   - Navigation patterns
   - State transitions

### Output
Frontend Interaction Specification containing:
```markdown
# Frontend Interaction Specification

## Authentication Flows

### Login Flow
1. User navigates to /login
2. System displays login form with:
   - Email input (required, email validation)
   - Password input (required, min 8 chars)
   - "Remember me" checkbox
   - "Forgot password?" link
3. User enters credentials and clicks "Login"
4. System validates:
   - If valid: Redirect to /dashboard
   - If invalid: Show error "Invalid credentials"
   
### Channel Creation Flow
1. User clicks "+" button in sidebar
2. System shows modal with:
   - Channel name input (required, unique)
   - Description textarea (optional)
   - Privacy toggle (public/private)
3. User fills form and clicks "Create"
4. System:
   - Creates channel
   - Adds user as admin
   - Navigates to new channel
   - Shows success toast
...
```

### Agent Pattern
```
Generator → QC Agent
```

### Validation
QC agent ensures:
- Every PRD feature has UI representation
- All user journeys are complete
- Error states are defined
- Accessibility is considered

## Stage 2: Wireframe Generation [FULLY IMPLEMENTED]

### Purpose
Transform interaction specifications into a working frontend application.

### Input
- Frontend Interaction Specification
- Technical Implementation Patterns

### Process

#### Phase 1: Wireframe Generation
1. **Setup Project Structure**
   ```
   frontend/
   ├── src/
   │   ├── app/          # Pages
   │   ├── components/   # Reusable components
   │   ├── contexts/     # Global state
   │   ├── hooks/        # Custom hooks
   │   └── lib/          # Utilities
   └── package.json
   ```

2. **Implement Pages**
   - Authentication pages (login, register, reset)
   - Main application pages
   - Settings and admin pages

3. **Create Components**
   - Follow ShadCN UI patterns
   - Implement dark mode
   - Add loading states
   - Handle errors gracefully

4. **Add Interactivity**
   - Form submissions
   - State management
   - API integration (mocked)
   - Real-time updates (simulated)

5. **Verify Implementation**
   ```bash
   npm run build
   npm run lint
   npm run type-check
   ```

#### Phase 2: Quality Control
1. **Scope Analysis**
   ```bash
   integration_analyzer --base template/ --target generated/
   # Output: 10 changed files (90% reduction)
   ```

2. **Feature Validation**
   - Check all interactions implemented
   - Verify UI matches specification
   - Test error scenarios
   - Validate accessibility

3. **Generate QC Report**
   - Compliance score
   - Missing features
   - Extra features
   - Recommendations

#### Phase 3: Self-Improvement (Planned)
1. **Analyze QC Report**
2. **Identify Patterns**
3. **Generate Improvements**
4. **Update System**

### Output
Complete Next.js application:
- 30-50 React components
- TypeScript throughout
- Beautiful dark UI
- All interactions working
- Build verified
- 85%+ specification compliance

### Example Generated Code
```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        channels={channels}
        onChannelSelect={setSelectedChannel}
      />
      <main className="flex-1 flex flex-col">
        <Header channel={getChannel(selectedChannel)} />
        <MessageList channelId={selectedChannel} />
        <MessageComposer 
          channelId={selectedChannel}
          onSend={handleSendMessage}
        />
      </main>
    </div>
  );
}
```

## Stage 3: Technical Specification [TODO]

### Purpose
Extract technical requirements from the implemented wireframe.

### Input
Working Next.js frontend from Stage 2

### Process
1. **Frontend Analysis**
   - Component inventory
   - State management analysis
   - Data flow mapping
   - API usage detection

2. **API Contract Extraction**
   - Identify all API calls
   - Document request/response
   - Define error responses
   - Specify authentication

3. **Data Model Derivation**
   - Analyze data structures
   - Define entities
   - Map relationships
   - Plan database schema

4. **Reconciliation**
   - Ensure consistency
   - Resolve conflicts
   - Optimize design
   - Document decisions

### Output
Three specification documents:

#### 1. Frontend Specification
```yaml
components:
  LoginForm:
    props:
      onSuccess: (user: User) => void
      onError: (error: string) => void
    state:
      email: string
      password: string
      loading: boolean
    api_calls:
      - POST /auth/login
```

#### 2. API Contract
```yaml
endpoints:
  /auth/login:
    method: POST
    request:
      email: string
      password: string
    response:
      access_token: string
      refresh_token: string
      user: User
    errors:
      400: Invalid credentials
      429: Too many attempts
```

#### 3. Data Models
```python
class User(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    created_at: datetime
    workspace_ids: List[str]
```

### Agent Pattern
```
Frontend Extractor → API Extractor → Data Extractor → Reconciler
```

## Stage 4: Backend Implementation [TODO]

### Purpose
Generate a complete backend that perfectly matches the frontend's needs.

### Input
- API Contract from Stage 3
- Data Models from Stage 3
- Technical Patterns

### Process
1. **Project Setup**
   ```
   backend/
   ├── api/        # Route handlers
   ├── models/     # Pydantic models
   ├── services/   # Business logic
   ├── utils/      # Helpers
   └── main.py     # FastAPI app
   ```

2. **Implement Endpoints**
   - Authentication routes
   - CRUD operations
   - WebSocket handlers
   - File uploads

3. **Add Business Logic**
   - Validation rules
   - Authorization checks
   - Data transformations
   - External integrations

4. **Database Integration**
   - DynamoDB setup
   - Query implementations
   - Indexes and optimization
   - Migration scripts

5. **Testing**
   - Unit tests
   - Integration tests
   - Load testing
   - Security testing

### Output
Complete FastAPI backend:
- All endpoints implemented
- Pydantic validation
- JWT authentication
- DynamoDB integration
- WebSocket support
- Comprehensive tests

### Example Generated Code
```python
@router.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Authenticate user and return tokens."""
    user = await user_service.authenticate(
        credentials.email,
        credentials.password
    )
    if not user:
        raise HTTPException(400, "Invalid credentials")
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )
```

## Stage 5: Deployment [TODO]

### Purpose
Deploy the complete application to AWS infrastructure.

### Input
- Frontend application
- Backend application
- Configuration files

### Process
1. **Infrastructure Setup**
   - AWS CDK templates
   - Environment configuration
   - Security groups
   - IAM roles

2. **Frontend Deployment**
   - Build optimization
   - S3 upload
   - CloudFront setup
   - Domain configuration

3. **Backend Deployment**
   - Lambda packaging
   - API Gateway setup
   - Environment variables
   - Database provisioning

4. **Integration**
   - Connect frontend to backend
   - Configure CORS
   - Set up monitoring
   - Enable logging

5. **Verification**
   - Health checks
   - Smoke tests
   - Performance tests
   - Security scan

### Output
- Live application URL
- Admin credentials
- Monitoring dashboard
- Deployment documentation

### Infrastructure as Code
```typescript
// CDK Stack
export class AppFactoryStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    
    // Frontend
    const bucket = new s3.Bucket(this, 'Frontend');
    const distribution = new cloudfront.Distribution(this, 'CDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket)
      }
    });
    
    // Backend
    const api = new apigateway.RestApi(this, 'API');
    const lambda = new lambda.Function(this, 'Handler', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'main.handler'
    });
    
    // Database
    const table = new dynamodb.Table(this, 'Users', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });
  }
}
```

## Pipeline Control Flow

### Success Path
```
Stage 0 ✓ → Stage 1 ✓ → Stage 2 ✓ → Stage 3 ✓ → Stage 4 ✓ → Stage 5 ✓
                                                                    ↓
                                                              🎉 Live App
```

### Error Handling
Each stage can fail with structured errors:
```python
class StageResult:
    success: bool
    output: Optional[str]
    error: Optional[StageError]
    metrics: StageMetrics
    
class StageError:
    code: str
    message: str
    details: dict
    recoverable: bool
```

### Retry Logic
- Automatic retry on recoverable errors
- Exponential backoff
- Maximum 3 attempts
- Preserve partial outputs

## Pipeline Orchestration

### Main Entry Point
```python
async def run_pipeline(user_prompt: str) -> PipelineResult:
    """Execute the complete pipeline."""
    
    # Stage 0: Generate PRD
    prd_result = await stage_0_prd.generate(user_prompt)
    if not prd_result.success:
        return PipelineResult(error=prd_result.error)
    
    # Stage 1: Generate Interaction Spec
    spec_result = await stage_1_spec.generate(prd_result.output)
    if not spec_result.success:
        return PipelineResult(error=spec_result.error)
    
    # Stage 2: Generate Wireframe
    wireframe_result = await stage_2_wireframe.generate(
        spec_result.output,
        output_dir=f"apps/{app_name}"
    )
    
    # Continue through all stages...
    
    return PipelineResult(
        success=True,
        app_url=deployment_result.url,
        metrics=aggregate_metrics(all_results)
    )
```

### Progress Tracking
```python
class PipelineProgress:
    current_stage: int
    total_stages: int = 6
    stage_status: Dict[int, StageStatus]
    estimated_time_remaining: int
    
    def update(self, stage: int, status: StageStatus):
        self.current_stage = stage
        self.stage_status[stage] = status
        self.emit_progress_event()
```

## Metrics and Monitoring

### Stage Metrics
```python
@dataclass
class StageMetrics:
    duration_seconds: float
    token_count: int
    api_calls: int
    error_count: int
    retry_count: int
    cost_estimate: float
```

### Pipeline Metrics
```python
@dataclass
class PipelineMetrics:
    total_duration: float
    total_tokens: int
    total_cost: float
    compliance_score: float
    stage_metrics: Dict[int, StageMetrics]
```

### Success Criteria
- **Duration**: < 30 minutes total
- **Quality**: > 85% compliance score
- **Reliability**: > 95% success rate
- **Cost**: < $10 per application

## Future Enhancements

### Parallel Execution
Some stages could run in parallel:
```
Stage 3 → Frontend Spec ─┐
       → API Contract    ├→ Stage 4
       → Data Models    ─┘
```

### Incremental Generation
- Save progress between stages
- Resume from any stage
- Partial regeneration

### Human-in-the-Loop
- Optional review points
- Manual corrections
- Approval workflows

### A/B Testing
- Generate multiple variants
- Compare quality metrics
- Select best output

## Conclusion

The pipeline workflow represents a revolutionary approach to software development. By breaking down the complex task of application creation into specialized stages, we achieve:

1. **Predictable Quality**: Each stage has clear success criteria
2. **Scalability**: Stages can be optimized independently
3. **Flexibility**: New stages can be added as needed
4. **Reliability**: Error handling and retry logic ensure robustness
5. **Efficiency**: 30-minute generation time for complete applications

As we complete the remaining stages and add self-improvement capabilities, the pipeline will become increasingly powerful, eventually enabling anyone to transform their ideas into working software with minimal effort.