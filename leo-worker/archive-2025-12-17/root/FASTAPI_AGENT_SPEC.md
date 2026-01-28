# FastAPI Agent Server Specification

## Overview
Create a FastAPI server that serves as a drop-in replacement for the TypeScript agent server in the Happy Llama system. This server will integrate the existing app-factory Python pipeline to generate web applications.

## Server Configuration
- **Port**: 3002 (must match existing agent server)
- **Service Name**: happy-llama-agent-python
- **Health Check Endpoint**: `GET /health`
- **Build Endpoint**: `POST /api/build`

## API Contract

### Health Check Endpoint
```
GET /health
Response: {"status": "ok", "service": "happy-llama-agent-python"}
```

### Build Endpoint
```
POST /api/build
Request Body: {
  "runId": string,          // Unique identifier for this build run
  "prompt": string,          // User's app description
  "workspaceId": string      // Docker workspace container ID
}
Response: {
  "status": "started",
  "runId": string,
  "message": "Agent is building your application..."
}
```

## Integration Requirements

### 1. Workspace Integration
- Workspace path: `/home/ec2-user/workspaces/{workspaceId}`
- This directory is bind-mounted to `/workspace` in the Docker container
- All file operations should target this directory
- Generated app should be placed directly in workspace root, not in subdirectory

### 2. Message Streaming to Orchestrator
- Send progress messages to: `http://localhost:3001/api/runs/{runId}/message`
- Message format:
```json
{
  "type": "status" | "success" | "error" | "warning" | "action" | "assistant",
  "content": string,
  "timestamp": ISO 8601 datetime
}
```

### 3. Message Types and Usage
- `status`: General progress updates
- `action`: Tool/operation being performed
- `success`: Successful completion of steps
- `error`: Failures or exceptions
- `warning`: Non-critical issues
- `assistant`: AI-generated explanations

### 4. Required Message Flow
Send these messages in order:
1. "Initializing Happy Llama Python agent..."
2. "Generating PRD and technical specifications..."
3. "Creating application structure..."
4. "Building frontend components..."
5. "Installing dependencies..."
6. "Starting application server..."
7. "✅ Application build completed. Orchestrator will verify health."

### 5. App Factory Integration
- Use existing `app_factory.main_v2` module
- Required flags: `--skip-questions --iterative-stage-1`
- App name: Generate from timestamp or use workspaceId
- Output directory: Workspace root (not apps/ subdirectory)

### 6. File Structure Transformation
Transform app-factory output structure to Happy Llama structure:
- `apps/{app_name}/frontend/*` → `/workspace/*`
- Ensure `package.json` exists with start script
- Ensure `server.js` or equivalent exists
- Port must be 5000
- Health endpoint required at `/api/health`

### 7. Docker Container Operations
For operations requiring process execution:
```python
# Execute in container via orchestrator
response = requests.post(
    f"http://localhost:3001/api/workspaces/{workspace_id}/exec",
    json={"command": "npm install", "metrics": run_id}
)
```

### 8. Background Execution
- Build process must run asynchronously
- Return immediate response to orchestrator
- Continue streaming messages during build

### 9. Error Handling
- Catch all exceptions and send as error messages
- Always send final message even on failure
- Log detailed errors to console with `[AGENT-PYTHON]` prefix

### 10. Performance Considerations
- Stream messages immediately, don't batch
- Use native file operations when possible
- Only use Docker exec for process operations (npm install, npm start)

## Expected Build Pipeline Flow

1. **Receive build request**
   - Parse request body
   - Start background task
   - Return immediate response

2. **Initialize workspace**
   - Change working directory to workspace path
   - Send initialization message

3. **Run app factory pipeline**
   - Execute main_v2 with appropriate arguments
   - Capture and stream progress
   - Handle pipeline output

4. **Transform output structure**
   - Move generated files from apps/ to workspace root
   - Ensure proper file structure
   - Add/modify package.json if needed

5. **Install dependencies**
   - Execute npm install via Docker
   - Stream installation progress

6. **Start application**
   - Execute npm start via Docker (detached)
   - Send completion message

7. **Completion**
   - Send final success message
   - Let orchestrator handle health checks

## Environment Variables
- `ORCHESTRATOR_URL`: Default "http://localhost:3001"
- `PORT`: Default 3002

## Logging Format
All console logs should use format:
```
[AGENT-PYTHON] {message}
[AGENT-PYTHON-ERROR] {error}
[AGENT-PYTHON-PERF] {performance metric}
```

## Critical Success Factors
1. Must be drop-in replacement (same endpoints, same message format)
2. Must generate working apps accessible on port 5000
3. Must stream real-time progress messages
4. Must handle workspace bind mounts correctly
5. Must complete builds within 15 minutes

## Testing Validation
Server is successful if:
1. Orchestrator can start builds via `/api/build`
2. Messages appear in web UI in real-time
3. Generated app runs on port 5000
4. Preview works in web UI iframe
5. Health checks pass after build

## File Operations Note
- Direct file I/O to workspace path is fast (bind mount)
- Process operations must use Docker exec via orchestrator
- Prefer native Python file operations over subprocess calls