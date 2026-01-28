# Orchestrator Test Suite

## 🚨 TESTING CONSTRAINTS

**MUST READ:** `../TESTING_CONSTRAINTS.md` for E2E test credentials and what can/cannot be tested.

**Quick:** Use `jake@happyllama.ai` / `p@12345678`, skip registration tests, update `utils/test-data.ts`

## Overview

This directory contains automated tests for both orchestrator modes (Local Docker and AWS ECS).

## Files

- **test-orchestrators.js** - Main test suite
- **package.json** - Test dependencies

## Running Tests

### Quick Start

From project root:
```bash
./scripts/test-orchestrators.sh all
```

### Individual Mode Tests

```bash
# Test local Docker mode only
./scripts/test-orchestrators.sh local

# Test AWS ECS mode only
./scripts/test-orchestrators.sh aws
```

### Using Docker Compose

```bash
# Run automated test suite
docker-compose -f docker-compose.test.yml up test-runner

# Test specific mode
docker-compose -f docker-compose.test.yml up test-local
docker-compose -f docker-compose.test.yml up test-aws
```

### Manual Test Execution

```bash
cd tests

# Set environment variables
export TEST_LOCAL_URL=http://localhost:5013
export TEST_AWS_URL=http://localhost:5014
export TEST_EMAIL=jake@happyllama.ai
export TEST_PASSWORD=p@12345678

# Run tests
node test-orchestrators.js
```

## Test Cases

The test suite performs the following tests for **each mode**:

### 1. Health Check
- Verifies container is running
- Checks health endpoint responds
- Confirms correct mode is active

### 2. Authentication
- Tests login with real Supabase credentials
- Verifies JWT token generation
- Confirms token can be used for API calls

### 3. Create Generation Request
- Creates a new app generation request
- Verifies request is accepted
- Confirms status is "queued"

### 4. Generation Completion
- Polls generation status
- Waits for completion (up to 10 minutes)
- Verifies status changes to "completed"

### 5. Verify Output
- Checks download URL is available
- Verifies GitHub URL (if enabled)
- Confirms files can be accessed

## Test Configuration

### Environment Variables

```bash
# Service URLs
TEST_LOCAL_URL=http://localhost:5013   # Local Docker mode
TEST_AWS_URL=http://localhost:5014     # AWS ECS mode

# Test credentials
TEST_EMAIL=jake@happyllama.ai          # Supabase test account
TEST_PASSWORD=p@12345678               # Test account password
```

### Test Prompt

Default test prompt:
```
Build a simple counter app with increment, decrement, and reset buttons.
Use modern dark mode UI.
```

This is a simple app that should complete quickly for testing purposes.

## Expected Output

### Successful Test Run

```
═══════════════════════════════════════════════════════════════
🚀 ORCHESTRATOR MODE TESTING SUITE
═══════════════════════════════════════════════════════════════

ℹ️  Test Configuration:
ℹ️    Local Docker URL: http://test-local:5013
ℹ️    AWS ECS URL: http://test-aws:5013
ℹ️    Test Account: jake@happyllama.ai

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing Local Docker Mode: http://test-local:5013
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════════════════
Test: Health Check - Local Docker Mode
═══════════════════════════════════════════════════════════════
✅ Health check passed
ℹ️  Auth Mode: supabase
ℹ️  Storage Mode: database
ℹ️  Orchestrator: Local

═══════════════════════════════════════════════════════════════
Test: Login - Local Docker Mode
═══════════════════════════════════════════════════════════════
✅ Login successful
ℹ️  User: jake@happyllama.ai
ℹ️  Token: eyJhbGciOiJIUzI1NiIs...

═══════════════════════════════════════════════════════════════
Test: Create Generation - Local Docker Mode
═══════════════════════════════════════════════════════════════
✅ Generation request created
ℹ️  Request ID: 32
ℹ️  Status: queued

═══════════════════════════════════════════════════════════════
Test: Poll Generation Status - Local Docker Mode
═══════════════════════════════════════════════════════════════
ℹ️  Status: generating
✅ Generation completed!
ℹ️  Download URL: /api/generations/32/download

═══════════════════════════════════════════════════════════════
Test: Verify Generation Output - Local Docker Mode
═══════════════════════════════════════════════════════════════
✅ Download URL available: /api/generations/32/download

[Similar output for AWS ECS Mode...]

═══════════════════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════════════════════════════

Local Docker:
  ✅ Health Check
  ✅ Login
  ✅ Create Generation
  ✅ Generation Completion
  ✅ Verify Output
  Total: 5/5 passed

AWS ECS:
  ✅ Health Check
  ✅ Login
  ✅ Create Generation
  ✅ Generation Completion
  ✅ Verify Output
  Total: 5/5 passed

ℹ️  Total Tests: 10
✅ Passed: 10

═══════════════════════════════════════════════════════════════
✅ ALL TESTS PASSED!
═══════════════════════════════════════════════════════════════
✅ Both orchestrator modes are working correctly!
```

## Troubleshooting

### Tests Fail Immediately

**Problem**: Can't connect to services

**Solutions**:
```bash
# Check containers are running
docker ps

# Check health status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs test-local
docker-compose -f docker-compose.test.yml logs test-aws
```

### Authentication Fails

**Problem**: Login returns 401

**Solutions**:
```bash
# Verify test account exists in Supabase
node test-supabase-connection.mjs

# Check environment variables
docker exec test-local env | grep SUPABASE

# Test health endpoint
curl http://localhost:5013/health | jq '.auth'
```

### Generation Times Out

**Problem**: Status stuck on "generating"

**Solutions**:
```bash
# Check if generator containers are running
docker ps | grep app-gen

# Check Docker socket is mounted (local mode)
docker exec test-local ls -la /var/run/docker.sock

# Check AWS credentials (AWS mode)
docker exec test-aws env | grep AWS

# View generation logs
docker-compose -f docker-compose.test.yml logs --tail=100
```

### Test Script Crashes

**Problem**: Node.js error or exception

**Solutions**:
```bash
# Check Node.js version
node --version  # Should be 20.x

# Reinstall dependencies
cd tests
rm -rf node_modules
npm install

# Run with debugging
NODE_DEBUG=http node test-orchestrators.js
```

## Development

### Adding New Tests

Edit `test-orchestrators.js`:

```javascript
async function testNewFeature(baseUrl, token, mode) {
  header(`Test: New Feature - ${mode} Mode`);

  try {
    const { response, data } = await makeRequest(`${baseUrl}/api/new-feature`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      success('New feature works!');
      return true;
    } else {
      error('New feature failed');
      return false;
    }
  } catch (err) {
    error(`New feature error: ${err.message}`);
    return false;
  }
}

// Add to testMode() function
const newFeatureOk = await testNewFeature(baseUrl, token, mode);
testResult.tests.push({ name: 'New Feature', passed: newFeatureOk });
```

### Modifying Test Timeouts

```javascript
// In pollGenerationStatus()
async function pollGenerationStatus(baseUrl, token, requestId, mode, maxWaitSec = 300) {
  // Change maxWaitSec default to increase/decrease timeout
}
```

### Changing Test Prompt

```javascript
// At top of file
const TEST_PROMPT = 'Your custom app prompt here...';
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Test Orchestrators

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build -t app-gen-saas:test .

      - name: Run tests
        run: ./scripts/test-orchestrators.sh all
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Performance

Typical test run times:

- **Build**: ~2-3 minutes
- **Local Docker Mode**: ~2-5 minutes per test
- **AWS ECS Mode**: ~3-8 minutes per test
- **Complete Suite**: ~10-20 minutes

Times vary based on:
- Network speed
- Docker build cache
- AWS infrastructure location
- App generation complexity

## Additional Resources

- **Testing Guide**: [../DOCKER_TESTING_GUIDE.md](../DOCKER_TESTING_GUIDE.md)
- **Mode Reference**: [../ORCHESTRATOR_MODES.md](../ORCHESTRATOR_MODES.md)
- **Main Script**: [../scripts/test-orchestrators.sh](../scripts/test-orchestrators.sh)
