# Integration Impedance Guide

**Purpose**: Document and handle impedance mismatches between different framework idioms to prevent integration failures in AI-generated code.

## Executive Summary

AI models have a training bias toward idiomatic implementations for each framework. While this produces high-quality code within a single framework, it creates integration failures when multiple frameworks must work together. This guide documents common friction points and their resolutions.

## The Impedance Mismatch Problem

### Core Issue
- **AI's training**: Optimized for "most common" patterns in isolation
- **Integration needs**: Requires explicit coordination between different idioms
- **Result**: Subtle bugs at framework boundaries

### The Training Bias Effect

When generating code, AI naturally gravitates toward patterns it has seen most frequently:

```python
# FastAPI - what AI generates (idiomatic)
@router.post("/")  # Creates /messages/ with redirect
async def create_message(...):
    pass

# What integration needs (explicit)
@router.post("")   # Creates /messages without redirect
async def create_message(...):
    pass
```

The AI chose the "correct" FastAPI pattern, but it's wrong for integration.

## Common Framework Impedance Mismatches

### 1. URL Trailing Slashes

| Framework | Default Behavior | Integration Impact |
|-----------|-----------------|-------------------|
| **Next.js** | No trailing slashes (`/api/messages`) | Expects exact match |
| **FastAPI** | Auto-adds trailing slash with redirect | 307 redirect breaks CORS |
| **Django** | Configurable (`APPEND_SLASH`) | May cause double redirects |
| **Express.js** | Treats as different routes | 404 errors possible |

**Resolution**:
```python
# FastAPI - Integration-friendly approach
@router.post("")  # Empty string, not "/"
@router.get("", include_in_schema=True)

# Or disable redirects globally
app = FastAPI(redirect_slashes=False)
```

### 2. Authentication Headers

| Framework | Idiomatic Approach | Format |
|-----------|-------------------|---------|
| **Next.js** | Cookies for SSR, localStorage for SPA | `Cookie: session=...` |
| **FastAPI** | Bearer tokens | `Authorization: Bearer <token>` |
| **Django** | Session + CSRF | `Cookie: sessionid=...; X-CSRFToken: ...` |
| **Rails** | Custom headers | `X-Auth-Token: ...` |

**Resolution**:
```typescript
// Unified auth approach
interface AuthConfig {
  method: 'bearer' | 'cookie' | 'custom';
  headerName: string;
  tokenPrefix?: string;
}
```

### 3. Error Response Formats

| Framework | Error Format | Example |
|-----------|-------------|---------|
| **Next.js** | `{ error: string }` | `{ error: "Not found" }` |
| **FastAPI** | `{ detail: string }` | `{ detail: "Not found" }` |
| **Rails** | `{ errors: {} }` | `{ errors: { base: ["Not found"] } }` |
| **Django** | `{ message: string }` | `{ message: "Not found" }` |

**Resolution**:
```python
# Standardized error middleware
async def unified_error_handler(request, exc):
    return JSONResponse({
        "error": {
            "message": str(exc),
            "code": exc.code if hasattr(exc, 'code') else 'ERROR',
            "details": exc.details if hasattr(exc, 'details') else None
        }
    })
```

### 4. Request/Response Wrapping

| Framework | Default Response | Wrapped Format |
|-----------|-----------------|----------------|
| **Next.js API Routes** | Direct return | `return data` |
| **FastAPI** | Pydantic model | `return UserResponse(...)` |
| **GraphQL** | Always wrapped | `{ data: {...}, errors: [...] }` |
| **JSON:API** | Strict format | `{ data: {...}, meta: {...} }` |

**Resolution**:
```python
# Explicit response format in contract
response_format:
  style: "direct" | "wrapped" | "json-api"
  wrapper_key: "data" | null
  meta_included: boolean
```

### 5. HTTP Method Expectations

| Framework | PUT vs PATCH | DELETE Response |
|-----------|-------------|-----------------|
| **REST purist** | PUT = full replacement | 204 No Content |
| **Pragmatic API** | PUT = partial update | 200 with result |
| **FastAPI default** | Both work same | Any status code |
| **Rails** | PATCH preferred | 204 standard |

## Generation Rules for Integration

### 1. URL Patterns
```yaml
rules:
  - Always match contract exactly, no assumptions
  - If contract says /messages, don't add trailing slash
  - Test with exact URL matching, no redirects
  - Document redirect behavior if unavoidable
```

### 2. Authentication
```yaml
rules:
  - Explicitly specify auth method in contract
  - Support multiple auth methods if needed
  - Document header names and formats
  - Include auth in integration tests
```

### 3. Response Formats
```yaml
rules:
  - Follow contract, not framework conventions
  - If contract shows wrapped, wrap responses
  - If contract shows direct, return direct
  - Transform in middleware if needed
```

## AI Generation Prompts

### Instead of:
> "Generate a FastAPI backend for this API contract"

### Use:
> "Generate a FastAPI backend for this API contract using INTEGRATION MODE:
> - Match URLs exactly as specified (no trailing slashes unless explicit)
> - Use response format exactly as shown in contract
> - Disable automatic redirects
> - Include CORS for origins: [list specific origins]
> - Error format must be: { error: { message, code, details } }
> - Do not use framework idioms that conflict with contract"

## Implementation Strategies

### 1. Pre-Generation Checklist
- [ ] Document exact URL patterns from frontend
- [ ] Note authentication method used
- [ ] Capture exact request/response formats
- [ ] List all error scenarios and formats
- [ ] Identify wrapper patterns

### 2. Integration Contract Extension
```typescript
interface IntegrationContract {
  endpoint: {
    path: string;
    trailingSlash: 'required' | 'forbidden' | 'optional';
    redirects: 'follow' | 'error';
  };
  auth: {
    method: 'bearer' | 'cookie' | 'session';
    headerName: string;
    required: boolean;
  };
  responses: {
    successWrapper: 'none' | 'data-object' | 'custom';
    errorFormat: 'simple' | 'detailed' | 'custom';
    contentType: string;
  };
}
```

### 3. Conformance Test Template
```python
def test_endpoint_conformance():
    """Auto-generated from integration contract"""
    # Exact URL match
    response = client.post("/api/v1/messages")  # No trailing slash
    assert response.status_code != 307  # No redirects
    
    # Response format match
    data = response.json()
    if contract.response_wrapper == "direct":
        assert "data" not in data  # Direct response
    else:
        assert "data" in data  # Wrapped response
    
    # Error format match
    error_response = client.post("/api/v1/messages", json={})
    assert "error" in error_response.json()
```

## DynamoDB Multi-Table Integration Patterns

### Why Multi-Table for AI Generation

The traditional DynamoDB single-table design creates impedance mismatches:
- Complex SK patterns are hard for AI to generate consistently
- Overloaded attributes confuse type systems
- Access patterns aren't obvious from table structure

Multi-table design aligns better with AI generation:
- Table name = Entity name (Users, Messages, Workspaces)
- Clear, predictable key patterns
- Obvious GSI purposes

### DynamoDB ↔ FastAPI Integration

**Common Mismatches:**

1. **Empty Strings**
```python
# Frontend sends
{ "bio": "" }

# DynamoDB rejects empty strings
# Resolution: Convert in service layer
if not value:
    value = None
```

2. **Reserved Words**
```python
# Can't use 'name', 'status' as attribute names
# Resolution: Prefix all attributes
{
    "user_name": "John",  # Not "name"
    "user_status": "active"  # Not "status"
}
```

3. **Type Conversions**
```python
# DynamoDB stores numbers as Decimal
# FastAPI expects float/int
# Resolution: Custom encoder
class DynamoDBEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)
```

### Pre-Built DynamoDB Patterns

```python
# Standardized key patterns for all tables
KEY_PATTERNS = {
    "partition_key": "{ENTITY}#{id}",
    "sort_key": "METADATA",  # For main record
    "gsi1_pk": "{INDEX_ENTITY}#{index_id}",
    "gsi1_sk": "{ENTITY}#{timestamp}"
}

# This consistency makes AI generation predictable
```

## Living Document Sections

## Infrastructure Creation Anti-pattern

### The Problem

AI models are trained on tutorials and examples that often create infrastructure inline:

```python
# What AI generates (from tutorials)
async def init_db():
    """Create tables if they don't exist"""
    try:
        await dynamodb.create_table(...)
    except ResourceInUseException:
        pass  # Table exists

# This violates separation of concerns!
```

### Why This Is Wrong

1. **Environment Inconsistency**: Dev might have different tables than prod
2. **Permission Issues**: Apps shouldn't have table creation permissions
3. **State Drift**: Infrastructure state becomes unknowable
4. **Deployment Order**: Can't deploy app before infrastructure

### The Correct Pattern

```python
# What should be generated
async def check_infrastructure():
    """Verify required infrastructure exists"""
    required_tables = ['users', 'messages', 'channels']
    
    for table in required_tables:
        try:
            await dynamodb.describe_table(TableName=f'slack-clone-{table}-{env}')
        except ResourceNotFoundException:
            logger.error(f"Required table '{table}' not found. Deploy infrastructure via CDK first.")
            sys.exit(1)
```

### AI Generation Rules

1. **Never generate table creation code in applications**
2. **Always check infrastructure exists on startup**
3. **Fail fast with helpful error messages**
4. **Document infrastructure requirements in README**

### Specification Requirements

Every backend spec MUST include:
```markdown
## Infrastructure Requirements

- Backend assumes DynamoDB tables exist. Infrastructure is managed by CDK.
- Backend applications MUST NOT create database tables or other infrastructure
- Applications should fail fast with clear error messages if tables don't exist

## Initialization Sequence
1. CDK Deployment - Creates all AWS resources
2. Database Seeding - Populates initial data
3. Application Start - Backend assumes all infrastructure exists
```

### Recently Discovered Mismatches
1. **CORS on redirects** (2025-06-30): FastAPI redirects don't include CORS headers
2. **Infrastructure creation** (2025-06-30): Backends creating their own tables
3. **Empty string vs null** (TBD): Different frameworks handle empty values differently
4. **Date format strings** (TBD): ISO8601 vs Unix timestamp preferences

### Framework-Specific Gotchas

#### FastAPI
- Default trailing slash redirects
- Pydantic validation changes nulls
- Response model affects output

#### Next.js
- API routes are serverless (connection limits)
- Body parsing must be explicit
- Error handling varies by deployment

#### DynamoDB
- Attribute names can't be reserved words
- Empty strings not allowed (use null)
- Numbers stored as strings need conversion

## Conclusion

Integration-first thinking requires fighting against AI's training bias toward idiomatic code. By explicitly documenting impedance mismatches and providing clear resolution strategies, we can generate code that works together rather than just works correctly in isolation.

This guide should be:
1. Consulted before any cross-framework generation
2. Updated with new discoveries
3. Used to create integration tests
4. Eventually fed back into AI training