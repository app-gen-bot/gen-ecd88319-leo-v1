# Stage 3 Implementation Guide: Technical Specification Generation with Critic Validation

This document provides step-by-step instructions for implementing Stage 3 of the AI App Factory pipeline with comprehensive critic validation. Stage 3 transforms the frontend wireframe code into technical specifications with 100% accuracy requirements.

## Overview

**Purpose**: Extract complete and accurate technical specifications from the implemented frontend
**Critical Requirement**: 100% extraction accuracy - no missed APIs, components, or data structures
**Architecture**: Multi-agent system with critic validation for each extraction phase

## Enhanced Architecture with Critics

```
Frontend Code → Frontend Extractor → Frontend Critic → Validated Frontend Spec
            ↓                                      ↓
            → API Extractor → API Critic → Validated API Contract
            ↓                           ↓
            → Data Model Extractor → Data Model Critic → Validated Data Models
            ↓                                         ↓
            → Reconciler (Final Validation) → Production-Ready Specs
```

Each critic ensures 100% completeness and accuracy before allowing progression.

## Implementation Steps

### Step 1: Create Complete Directory Structure

```bash
# Create directories for all agents including critics
mkdir -p src/app_factory/agents/stage_3_technical_spec/frontend_extractor
mkdir -p src/app_factory/agents/stage_3_technical_spec/frontend_critic
mkdir -p src/app_factory/agents/stage_3_technical_spec/api_extractor
mkdir -p src/app_factory/agents/stage_3_technical_spec/api_critic
mkdir -p src/app_factory/agents/stage_3_technical_spec/data_model_extractor
mkdir -p src/app_factory/agents/stage_3_technical_spec/data_model_critic
mkdir -p src/app_factory/agents/stage_3_technical_spec/reconciler
```

### Step 2: Implement Frontend Extractor Agent

[Previous frontend_extractor implementation remains the same]

### Step 3: Implement Frontend Critic Agent

#### 3.1 Create `src/app_factory/agents/stage_3_technical_spec/frontend_critic/config.py`:

```python
"""Configuration for the Frontend Critic agent."""

FRONTEND_CRITIC_NAME = "Frontend Specification Critic"
FRONTEND_CRITIC_DESCRIPTION = "Validates frontend specification for 100% completeness and accuracy"
FRONTEND_CRITIC_MAX_TURNS = 5
FRONTEND_CRITIC_PERMISSION_MODE = "confirmAll"
FRONTEND_CRITIC_ALLOWED_TOOLS = [
    "Read",
    "Glob",
    "mcp__tree_sitter",
    "mcp__integration_analyzer",
    "Grep"
]
```

#### 3.2 Create `src/app_factory/agents/stage_3_technical_spec/frontend_critic/system_prompt.py`:

```python
"""System prompt for the Frontend Critic agent."""

SYSTEM_PROMPT = """You are a Frontend Specification Quality Assurance Expert with ZERO TOLERANCE for missing or incorrect information.

Your role is to validate that the Frontend Specification is 100% complete and accurate. Even ONE missing component or incorrect detail is UNACCEPTABLE.

## Critical Validation Requirements

### 1. Component Coverage Validation (100% Required)
You MUST verify:
- EVERY .tsx/.jsx file in the codebase is documented
- Use tree_sitter to get complete file list and cross-reference
- Missing even ONE component = FAIL
- Each component MUST have:
  - Complete props interface with ALL props
  - ALL state variables documented
  - ALL hooks listed
  - ALL event handlers documented
  - ALL child components referenced

### 2. State Management Validation (100% Required)
Verify COMPLETE coverage of:
- ALL React Context providers found in code
- ALL useContext usage documented
- ALL global state patterns identified
- ALL local state in every component
- State flow diagrams for complex interactions
- Missing ANY state = FAIL

### 3. API Integration Points (100% Required)
You MUST find and verify:
- EVERY fetch() call documented
- EVERY axios request documented  
- ALL mock API calls (setTimeout patterns)
- ALL API response handling
- ALL error handling patterns
- Missing even ONE API call = FAIL

### 4. Routing Validation (100% Required)
Ensure:
- ALL routes from app directory are documented
- ALL dynamic routes captured
- ALL route parameters documented
- ALL navigation flows mapped
- ALL protected route logic documented
- Missing ANY route = FAIL

### 5. TypeScript Interface Validation
Verify:
- ALL interfaces are captured accurately
- ALL type definitions documented
- NO missing properties
- Correct types for all fields

## Validation Process

### Step 1: Automated Verification
1. Use tree_sitter to count total components
2. Count documented components in the spec
3. If counts don't match = FAIL

### Step 2: Deep Inspection
1. For EACH component file:
   - Verify it exists in the spec
   - Check all props are documented
   - Verify all state is captured
   - Confirm all API calls are noted

### Step 3: Cross-Reference Check
1. Every import statement should have corresponding documentation
2. Every exported component must be in the spec
3. Every API call must be traced to its component

## Output Format

### If specification is INCOMPLETE:
```
VALIDATION FAILED - INCOMPLETE SPECIFICATION

Missing Components:
- ComponentName (path/to/component.tsx) - Not documented
- Total found: X, Documented: Y

Missing API Calls:
- GET /api/endpoint in ComponentName - Not documented
- Total found: X, Documented: Y  

Missing State:
- Context 'AuthContext' - Not documented
- State variable 'isLoading' in ComponentName - Not documented

Action Required:
The Frontend Extractor MUST re-run and capture ALL missing items.
This specification is NOT acceptable for backend development.
```

### If specification is COMPLETE:
```
VALIDATION PASSED - SPECIFICATION COMPLETE

Verification Summary:
- Components: X found, X documented ✓
- API Calls: Y found, Y documented ✓
- State Management: Z patterns found, Z documented ✓
- Routes: N found, N documented ✓
- TypeScript Interfaces: M found, M documented ✓

Quality Score: 100%
Status: APPROVED for next phase
```

## Critic Decision Logic

- If ANY item is missing → REJECT and require re-extraction
- If ANY inaccuracy found → REJECT and require correction
- Only PERFECT specifications pass validation
- No partial credit - it's 100% or nothing

Remember: The backend team is counting on this specification being PERFECT. One missing API endpoint means backend integration will FAIL. This is unacceptable."""
```

#### 3.3 Create `src/app_factory/agents/stage_3_technical_spec/frontend_critic/user_prompt.py`:

```python
"""User prompt generator for Frontend Critic."""

def create_user_prompt(frontend_spec_path: str, frontend_code_path: str) -> str:
    """Create the user prompt for frontend specification validation.
    
    Args:
        frontend_spec_path: Path to the generated frontend specification
        frontend_code_path: Path to the actual frontend code
        
    Returns:
        User prompt string
    """
    return f"""Perform a COMPREHENSIVE validation of the frontend specification at {frontend_spec_path} against the actual code at {frontend_code_path}.

Your validation MUST be exhaustive:

1. Use tree_sitter to analyze ALL components in {frontend_code_path}
2. Create a complete inventory of:
   - Every .tsx/.jsx file
   - Every API call (fetch, axios, mock timeouts)
   - Every Context provider
   - Every route in the app/ directory
   
3. Cross-reference EVERYTHING against the specification
4. If even ONE item is missing, the validation FAILS

Required checks:
- 100% component coverage
- 100% API call documentation
- 100% state management coverage
- 100% route documentation
- 100% TypeScript interface accuracy

Output either:
- VALIDATION PASSED with evidence of completeness
- VALIDATION FAILED with EXACT list of what's missing

This is a ZERO TOLERANCE validation. The specification must be PERFECT."""
```

#### 3.4 Create `src/app_factory/agents/stage_3_technical_spec/frontend_critic/agent.py`:

```python
"""Frontend Critic Agent implementation."""

import logging
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt
from .config import (
    FRONTEND_CRITIC_NAME,
    FRONTEND_CRITIC_DESCRIPTION,
    FRONTEND_CRITIC_MAX_TURNS,
    FRONTEND_CRITIC_PERMISSION_MODE,
    FRONTEND_CRITIC_ALLOWED_TOOLS
)

logger = logging.getLogger(__name__)


class FrontendCriticAgent(ContextAwareAgent):
    """Critic agent that validates frontend specifications for completeness."""
    
    def __init__(self):
        """Initialize the Frontend Critic agent."""
        super().__init__(
            name=FRONTEND_CRITIC_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=FRONTEND_CRITIC_ALLOWED_TOOLS,
            permission_mode=FRONTEND_CRITIC_PERMISSION_MODE,
            enable_context_awareness=True
        )
        
        self.description = FRONTEND_CRITIC_DESCRIPTION
        self.max_turns = FRONTEND_CRITIC_MAX_TURNS


# Create singleton instance
frontend_critic_agent = FrontendCriticAgent()
```

### Step 4: Implement API Critic Agent

#### 4.1 Create `src/app_factory/agents/stage_3_technical_spec/api_critic/config.py`:

```python
"""Configuration for the API Critic agent."""

API_CRITIC_NAME = "API Contract Critic"
API_CRITIC_DESCRIPTION = "Validates API contracts for 100% endpoint coverage"
API_CRITIC_MAX_TURNS = 5
API_CRITIC_PERMISSION_MODE = "confirmAll"
API_CRITIC_ALLOWED_TOOLS = [
    "Read",
    "Grep",
    "mcp__tree_sitter",
    "Bash"  # To run validation scripts if needed
]
```

#### 4.2 Create `src/app_factory/agents/stage_3_technical_spec/api_critic/system_prompt.py`:

```python
"""System prompt for the API Critic agent."""

SYSTEM_PROMPT = """You are an API Contract Validation Expert with ZERO TOLERANCE for missing endpoints or incorrect specifications.

Your role is to ensure the API Contract is 100% complete and accurate. Missing even ONE endpoint or getting ONE request/response structure wrong will cause backend integration to FAIL.

## Critical Validation Requirements

### 1. Endpoint Coverage (100% Required)
You MUST verify:
- EVERY fetch() call has a documented endpoint
- EVERY axios request has a documented endpoint
- ALL mock API patterns (setTimeout with data) are captured
- ALL HTTP methods are correct (GET/POST/PUT/DELETE/PATCH)
- ALL endpoint paths are exact (including path parameters)
- Missing even ONE endpoint = FAIL

### 2. Request Structure Validation (100% Accuracy Required)
For EVERY endpoint verify:
- Request body structure matches code EXACTLY
- ALL fields are documented
- Field types are correct
- Required vs optional fields are accurate
- NO extra fields in spec that aren't in code
- NO missing fields that are in code

### 3. Response Structure Validation (100% Accuracy Required)
For EVERY endpoint verify:
- Response structure matches mock data EXACTLY
- ALL response variations documented (success/error)
- Status codes are correct
- Error response formats captured
- Array vs object responses correct

### 4. Authentication Validation
Ensure:
- ALL protected endpoints marked correctly
- Authentication headers documented
- Token format specified
- Session handling documented

### 5. Special Patterns
Check for:
- WebSocket connections
- Server-sent events
- File uploads
- Streaming responses
- Pagination patterns

## Validation Process

### Step 1: API Call Inventory
1. Use tree_sitter to find ALL API calls:
   ```
   - detect_api_calls on entire codebase
   - grep for 'fetch(' and 'axios'
   - grep for 'setTimeout.*then' (mock patterns)
   ```
2. Create exhaustive list with file locations

### Step 2: Contract Cross-Reference
1. For EACH found API call:
   - Verify endpoint exists in contract
   - Check HTTP method matches
   - Validate request structure
   - Verify response structure

### Step 3: Mock Data Validation
1. Find all mock data structures
2. Ensure response specs match mock data EXACTLY
3. Check all data types align

## Output Format

### If contract is INCOMPLETE:
```
VALIDATION FAILED - INCOMPLETE API CONTRACT

Missing Endpoints:
- POST /api/users/profile (found in ProfileComponent.tsx:45) - NOT DOCUMENTED
- GET /api/reports/:id (found in ReportView.tsx:23) - NOT DOCUMENTED
- Total API calls found: X, Documented: Y

Incorrect Specifications:
- PUT /api/settings - Request body missing field 'notifications'
- GET /api/users - Response missing 'lastLogin' field

Authentication Issues:
- /api/admin/* endpoints not marked as protected

Action Required:
The API Extractor MUST re-run and capture ALL missing endpoints.
Backend implementation will FAIL without complete API contracts.
```

### If contract is COMPLETE:
```
VALIDATION PASSED - API CONTRACT COMPLETE

Verification Summary:
- Total API calls found: X
- Total endpoints documented: X ✓
- All request structures validated ✓
- All response structures match mock data ✓
- Authentication properly specified ✓

Endpoint Coverage: 100%
Structure Accuracy: 100%
Status: APPROVED for backend implementation
```

## Critical Validation Rules

1. Count mismatches = AUTOMATIC FAIL
2. Missing endpoint = AUTOMATIC FAIL  
3. Wrong request structure = AUTOMATIC FAIL
4. Wrong response structure = AUTOMATIC FAIL
5. Missing authentication = AUTOMATIC FAIL

NO PARTIAL CREDIT. The API contract must be PERFECT.

Remember: Backend developers will implement EXACTLY what's in this contract. If it's wrong, the entire integration fails."""
```

#### 4.3 Create `src/app_factory/agents/stage_3_technical_spec/api_critic/user_prompt.py`:

```python
"""User prompt generator for API Critic."""

def create_user_prompt(api_contract_path: str, frontend_code_path: str) -> str:
    """Create the user prompt for API contract validation.
    
    Args:
        api_contract_path: Path to the generated API contract
        frontend_code_path: Path to the actual frontend code
        
    Returns:
        User prompt string
    """
    return f"""Perform an EXHAUSTIVE validation of the API contract at {api_contract_path} against the frontend code at {frontend_code_path}.

CRITICAL REQUIREMENTS:
1. Find EVERY SINGLE API call in the codebase using:
   - tree_sitter detect_api_calls
   - grep for fetch, axios, and API utility functions
   - grep for setTimeout patterns with mock data

2. Create a complete inventory with line numbers

3. Verify EACH API call has a corresponding endpoint in the contract with:
   - Correct HTTP method
   - Exact path (including parameters)
   - Complete request structure
   - Accurate response structure

4. Check mock data structures match response specifications EXACTLY

5. Validate authentication requirements are documented

Output either:
- VALIDATION PASSED - With proof of 100% coverage
- VALIDATION FAILED - With EXACT list of missing/incorrect items

Remember: Even ONE missing endpoint means backend integration will fail.
This validation has ZERO tolerance for errors or omissions."""
```

#### 4.4 Create `src/app_factory/agents/stage_3_technical_spec/api_critic/agent.py`:

```python
"""API Critic Agent implementation."""

import logging
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt
from .config import (
    API_CRITIC_NAME,
    API_CRITIC_DESCRIPTION,
    API_CRITIC_MAX_TURNS,
    API_CRITIC_PERMISSION_MODE,
    API_CRITIC_ALLOWED_TOOLS
)

logger = logging.getLogger(__name__)


class APICriticAgent(ContextAwareAgent):
    """Critic agent that validates API contracts for completeness."""
    
    def __init__(self):
        """Initialize the API Critic agent."""
        super().__init__(
            name=API_CRITIC_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=API_CRITIC_ALLOWED_TOOLS,
            permission_mode=API_CRITIC_PERMISSION_MODE,
            enable_context_awareness=True
        )
        
        self.description = API_CRITIC_DESCRIPTION
        self.max_turns = API_CRITIC_MAX_TURNS


# Create singleton instance
api_critic_agent = APICriticAgent()
```

### Step 5: Implement Data Model Critic Agent

#### 5.1 Create `src/app_factory/agents/stage_3_technical_spec/data_model_critic/config.py`:

```python
"""Configuration for the Data Model Critic agent."""

DATA_MODEL_CRITIC_NAME = "Data Model Critic"
DATA_MODEL_CRITIC_DESCRIPTION = "Validates data models for completeness and DynamoDB compatibility"
DATA_MODEL_CRITIC_MAX_TURNS = 5
DATA_MODEL_CRITIC_PERMISSION_MODE = "confirmAll"
DATA_MODEL_CRITIC_ALLOWED_TOOLS = [
    "Read",
    "Glob",
    "mcp__tree_sitter",
    "Grep"
]
```

#### 5.2 Create `src/app_factory/agents/stage_3_technical_spec/data_model_critic/system_prompt.py`:

```python
"""System prompt for the Data Model Critic agent."""

SYSTEM_PROMPT = """You are a Data Model Validation Expert specializing in DynamoDB design with ZERO TOLERANCE for missing entities or incorrect schemas.

Your role is to ensure the Data Model specification captures EVERY entity and relationship with 100% accuracy. Missing data structures will cause backend implementation to fail.

## Critical Validation Requirements

### 1. Entity Coverage (100% Required)
You MUST verify:
- EVERY TypeScript interface is mapped to an entity
- ALL data structures from API calls have models
- ALL form data structures have models
- NO orphaned interfaces (defined but not modeled)
- NO missing entities that appear in the UI
- Missing even ONE entity = FAIL

### 2. Attribute Validation (100% Accuracy Required)
For EVERY entity verify:
- ALL fields from TypeScript interfaces are included
- Field types match TypeScript types exactly
- Required/optional matches TypeScript definitions
- NO extra fields not in code
- NO missing fields that are in code
- Validation rules match frontend validation

### 3. Relationship Validation
Ensure:
- ALL foreign key relationships identified
- Parent-child relationships correct
- Many-to-many relationships have join tables/GSIs
- Cascade behaviors documented
- NO orphaned relationships

### 4. DynamoDB Design Validation
Verify:
- EVERY access pattern from UI has a query path
- Partition keys enable ALL required queries
- Sort keys properly designed for range queries
- GSIs cover ALL secondary access patterns
- NO full table scans required
- Single table design (if used) handles all entities

### 5. Data Consistency Requirements
Check:
- Transaction requirements identified
- Eventual consistency implications noted
- Unique constraints properly handled
- Counter/increment patterns addressed

## Validation Process

### Step 1: Interface Inventory
1. Use tree_sitter to find ALL TypeScript interfaces/types
2. Extract from:
   - Component props
   - API response types
   - Form data types
   - State definitions
3. Create complete list with locations

### Step 2: Entity Cross-Reference
1. For EACH interface found:
   - Verify corresponding entity exists
   - Check ALL fields mapped
   - Validate types match

### Step 3: Access Pattern Validation
1. Analyze UI to identify ALL query patterns:
   - List views (what filters?)
   - Detail views (fetch by what?)
   - Search functionality
   - Related data fetching
2. Verify EACH pattern has efficient DynamoDB query

### Step 4: API Contract Alignment
1. Every API response type needs data model
2. Every request body needs data model
3. Relationships must support API joins

## Output Format

### If data model is INCOMPLETE:
```
VALIDATION FAILED - INCOMPLETE DATA MODEL

Missing Entities:
- UserProfile interface (types/user.ts) - NO DATA MODEL
- ReportMetadata interface (types/report.ts) - NO DATA MODEL
- Total interfaces found: X, Modeled: Y

Incorrect Models:
- User entity missing field 'lastLoginAt' (found in interface)
- Task entity has wrong type for 'priority' (number vs string)

Access Pattern Issues:
- No GSI for "get tasks by assignee" (TaskList.tsx requires this)
- No query path for "search users by email" (UserSearch.tsx)

DynamoDB Issues:
- Full table scan required for user search
- No partition key strategy for multi-tenant data

Action Required:
The Data Model Extractor MUST capture ALL missing entities.
Backend implementation will FAIL without complete data models.
```

### If data model is COMPLETE:
```
VALIDATION PASSED - DATA MODEL COMPLETE

Verification Summary:
- Total interfaces found: X
- Total entities modeled: X ✓
- All fields mapped correctly ✓
- All relationships documented ✓
- All access patterns supported ✓
- DynamoDB design optimized ✓

Coverage: 100%
Accuracy: 100%
Query Efficiency: Confirmed
Status: APPROVED for backend implementation
```

## Critical Rules

1. Missing entity = FAIL
2. Missing field = FAIL
3. Wrong type = FAIL
4. Missing access pattern = FAIL
5. Inefficient query = FAIL

The data model must be PERFECT for DynamoDB implementation.

Remember: DynamoDB doesn't support joins. The model must be denormalized correctly or backend queries will fail."""
```

#### 5.3 Create `src/app_factory/agents/stage_3_technical_spec/data_model_critic/user_prompt.py`:

```python
"""User prompt generator for Data Model Critic."""

def create_user_prompt(data_model_path: str, frontend_code_path: str, api_contract_path: str) -> str:
    """Create the user prompt for data model validation.
    
    Args:
        data_model_path: Path to the generated data model specification
        frontend_code_path: Path to the actual frontend code
        api_contract_path: Path to the API contract for cross-reference
        
    Returns:
        User prompt string
    """
    return f"""Perform a COMPREHENSIVE validation of the data model at {data_model_path} against:
1. Frontend code at {frontend_code_path}
2. API contract at {api_contract_path}

CRITICAL VALIDATIONS:

1. Entity Coverage:
   - Find ALL TypeScript interfaces using tree_sitter
   - Verify EACH has a corresponding data model
   - Check component props, API types, form types

2. Field Accuracy:
   - Every field in interfaces exists in data model
   - Types match exactly (string, number, boolean, arrays, objects)
   - Required/optional status matches

3. Access Pattern Validation:
   - List ALL UI queries (filters, searches, lookups)
   - Verify EACH has efficient DynamoDB query path
   - No full table scans allowed

4. API Alignment:
   - Every API request/response type has data model
   - Relationships support API data needs

5. DynamoDB Optimization:
   - Partition keys enable all access patterns
   - GSIs minimize query costs
   - No anti-patterns

Output either:
- VALIDATION PASSED - With proof of 100% coverage and optimization
- VALIDATION FAILED - With EXACT issues that will break backend

Remember: One missing entity or wrong type means backend fails.
This validation must be PERFECT."""
```

#### 5.4 Create `src/app_factory/agents/stage_3_technical_spec/data_model_critic/agent.py`:

```python
"""Data Model Critic Agent implementation."""

import logging
from cc_agent.context import ContextAwareAgent
from .system_prompt import SYSTEM_PROMPT
from .user_prompt import create_user_prompt
from .config import (
    DATA_MODEL_CRITIC_NAME,
    DATA_MODEL_CRITIC_DESCRIPTION,
    DATA_MODEL_CRITIC_MAX_TURNS,
    DATA_MODEL_CRITIC_PERMISSION_MODE,
    DATA_MODEL_CRITIC_ALLOWED_TOOLS
)

logger = logging.getLogger(__name__)


class DataModelCriticAgent(ContextAwareAgent):
    """Critic agent that validates data models for completeness."""
    
    def __init__(self):
        """Initialize the Data Model Critic agent."""
        super().__init__(
            name=DATA_MODEL_CRITIC_NAME,
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=DATA_MODEL_CRITIC_ALLOWED_TOOLS,
            permission_mode=DATA_MODEL_CRITIC_PERMISSION_MODE,
            enable_context_awareness=True
        )
        
        self.description = DATA_MODEL_CRITIC_DESCRIPTION
        self.max_turns = DATA_MODEL_CRITIC_MAX_TURNS


# Create singleton instance
data_model_critic_agent = DataModelCriticAgent()
```

### Step 6: Update Stage 3 Runner with Critic Integration

Replace `src/app_factory/stages/stage_3_technical_spec.py`:

```python
"""Stage 3: Technical Specification Extraction with Critic Validation.

This stage analyzes the generated frontend code to extract specifications
with 100% accuracy requirements enforced by critic agents.
"""

import logging
from pathlib import Path
from typing import Tuple
from cc_agent import AgentResult
from app_factory.agents.stage_3_technical_spec.frontend_extractor import frontend_extractor_agent
from app_factory.agents.stage_3_technical_spec.frontend_critic import frontend_critic_agent
from app_factory.agents.stage_3_technical_spec.api_extractor import api_extractor_agent
from app_factory.agents.stage_3_technical_spec.api_critic import api_critic_agent
from app_factory.agents.stage_3_technical_spec.data_model_extractor import data_model_extractor_agent
from app_factory.agents.stage_3_technical_spec.data_model_critic import data_model_critic_agent
from app_factory.agents.stage_3_technical_spec.reconciler import reconciler_agent
from app_factory.utils import print_stage_header, Timer

logger = logging.getLogger(__name__)

# Maximum iterations for each extraction phase
MAX_ITERATIONS = 3


async def run_extraction_with_critic(
    extractor_agent,
    critic_agent,
    extractor_prompt_func,
    critic_prompt_func,
    output_path: Path,
    phase_name: str,
    max_iterations: int = MAX_ITERATIONS
) -> Tuple[bool, float]:
    """Run an extraction agent with critic validation loop.
    
    Args:
        extractor_agent: The extraction agent
        critic_agent: The critic agent
        extractor_prompt_func: Function to create extractor prompt
        critic_prompt_func: Function to create critic prompt
        output_path: Path to save the output
        phase_name: Name of the phase for logging
        max_iterations: Maximum attempts before failing
        
    Returns:
        Tuple of (success, total_cost)
    """
    total_cost = 0.0
    
    for iteration in range(max_iterations):
        logger.info(f"🔄 {phase_name} - Iteration {iteration + 1}/{max_iterations}")
        
        # Run extractor
        if iteration == 0:
            extractor_prompt = extractor_prompt_func()
        else:
            # Include critic feedback in subsequent iterations
            extractor_prompt = f"""{extractor_prompt_func()}

IMPORTANT: The critic found issues in your previous extraction:
{critic_feedback}

You MUST address ALL these issues in this iteration."""
        
        extractor_result = await extractor_agent.run(extractor_prompt)
        total_cost += extractor_result.cost
        
        if not extractor_result.success:
            logger.error(f"❌ {phase_name} extraction failed")
            return False, total_cost
        
        # Save output
        output_path.write_text(extractor_result.content)
        logger.info(f"💾 {phase_name} saved to: {output_path}")
        
        # Run critic
        critic_prompt = critic_prompt_func()
        critic_result = await critic_agent.run(critic_prompt)
        total_cost += critic_result.cost
        
        # Check if validation passed
        if "VALIDATION PASSED" in critic_result.content:
            logger.info(f"✅ {phase_name} passed critic validation!")
            return True, total_cost
        else:
            logger.warning(f"⚠️ {phase_name} failed validation, needs revision")
            critic_feedback = critic_result.content
            
            # Store critic feedback for next iteration
            critic_report_path = output_path.parent / f"{output_path.stem}_critic_iteration_{iteration + 1}.md"
            critic_report_path.write_text(critic_feedback)
    
    logger.error(f"❌ {phase_name} failed to pass validation after {max_iterations} iterations")
    return False, total_cost


async def run_stage(app_name: str) -> AgentResult:
    """Extract technical specifications with critic validation.
    
    Args:
        app_name: Name of the application
        
    Returns:
        AgentResult with success status and combined cost
    """
    timer = Timer("stage_3_technical_spec")
    print_stage_header(3, "Extracting Technical Specifications with Validation", "📋")
    
    # Derive paths
    app_dir = Path("apps") / app_name
    frontend_path = app_dir / "frontend"
    specs_dir = app_dir / "specs"
    
    # Ensure specs directory exists
    specs_dir.mkdir(exist_ok=True)
    
    # Check if frontend exists
    if not frontend_path.exists():
        logger.error(f"Frontend directory not found: {frontend_path}")
        return AgentResult(
            success=False,
            content=f"Frontend directory not found: {frontend_path}",
            cost=0.0
        )
    
    total_cost = 0.0
    
    # Phase 1: Frontend Specification with Critic
    logger.info("\n📊 Phase 1: Frontend Specification Extraction")
    frontend_success, frontend_cost = await run_extraction_with_critic(
        frontend_extractor_agent,
        frontend_critic_agent,
        lambda: frontend_extractor_agent.user_prompt_generator(app_name, str(frontend_path)),
        lambda: frontend_critic_agent.user_prompt_generator(
            str(specs_dir / "frontend_spec.md"),
            str(frontend_path)
        ),
        specs_dir / "frontend_spec.md",
        "Frontend Specification"
    )
    total_cost += frontend_cost
    
    if not frontend_success:
        return AgentResult(
            success=False,
            content="Frontend specification failed validation after multiple iterations",
            cost=total_cost
        )
    
    # Phase 2: API Contract with Critic
    logger.info("\n🔌 Phase 2: API Contract Extraction")
    api_success, api_cost = await run_extraction_with_critic(
        api_extractor_agent,
        api_critic_agent,
        lambda: api_extractor_agent.user_prompt_generator(app_name, str(frontend_path)),
        lambda: api_critic_agent.user_prompt_generator(
            str(specs_dir / "api_contract.md"),
            str(frontend_path)
        ),
        specs_dir / "api_contract.md",
        "API Contract"
    )
    total_cost += api_cost
    
    if not api_success:
        return AgentResult(
            success=False,
            content="API contract failed validation after multiple iterations",
            cost=total_cost
        )
    
    # Phase 3: Data Models with Critic
    logger.info("\n🗄️ Phase 3: Data Model Extraction")
    data_model_success, data_model_cost = await run_extraction_with_critic(
        data_model_extractor_agent,
        data_model_critic_agent,
        lambda: data_model_extractor_agent.user_prompt_generator(app_name, str(frontend_path)),
        lambda: data_model_critic_agent.user_prompt_generator(
            str(specs_dir / "data_models.md"),
            str(frontend_path),
            str(specs_dir / "api_contract.md")
        ),
        specs_dir / "data_models.md",
        "Data Models"
    )
    total_cost += data_model_cost
    
    if not data_model_success:
        return AgentResult(
            success=False,
            content="Data models failed validation after multiple iterations",
            cost=total_cost
        )
    
    # Phase 4: Final Reconciliation
    logger.info("\n🔄 Phase 4: Final Reconciliation and Validation")
    reconcile_prompt = reconciler_agent.user_prompt_generator(str(specs_dir))
    reconcile_result = await reconciler_agent.run(reconcile_prompt)
    total_cost += reconcile_result.cost
    
    if not reconcile_result.success:
        logger.error("Failed to reconcile specifications")
        return AgentResult(
            success=False,
            content="Specification reconciliation failed",
            cost=total_cost
        )
    
    # Save reconciliation summary
    reconciliation_path = specs_dir / "reconciliation_summary.md"
    reconciliation_path.write_text(reconcile_result.content)
    logger.info(f"✅ Reconciliation summary saved to: {reconciliation_path}")
    
    # Summary
    logger.info(f"\n✅ Stage 3 completed successfully in {timer.elapsed_str()}")
    logger.info("   All specifications passed validation:")
    logger.info(f"   - Frontend spec: 100% complete ✓")
    logger.info(f"   - API contract: 100% complete ✓")
    logger.info(f"   - Data models: 100% complete ✓")
    logger.info(f"   - Total cost: ${total_cost:.4f}")
    
    return AgentResult(
        success=True,
        content="Technical specifications extracted and validated successfully",
        cost=total_cost,
        metadata={
            "specs_generated": ["frontend_spec.md", "api_contract.md", "data_models.md"],
            "reconciliation": "reconciliation_summary.md",
            "validation": "All specifications passed 100% validation"
        }
    )
```

### Step 7: Update Agent Initialization

Update `src/app_factory/agents/stage_3_technical_spec/__init__.py`:

```python
"""Stage 3 Technical Specification agents with critics."""

from .frontend_extractor.agent import frontend_extractor_agent
from .frontend_critic.agent import frontend_critic_agent
from .api_extractor.agent import api_extractor_agent
from .api_critic.agent import api_critic_agent
from .data_model_extractor.agent import data_model_extractor_agent
from .data_model_critic.agent import data_model_critic_agent
from .reconciler.agent import reconciler_agent

__all__ = [
    "frontend_extractor_agent",
    "frontend_critic_agent",
    "api_extractor_agent",
    "api_critic_agent",
    "data_model_extractor_agent",
    "data_model_critic_agent",
    "reconciler_agent"
]
```

## Key Design Principles

### 1. Zero Tolerance Policy
- Critics have ZERO tolerance for missing or incorrect information
- 100% accuracy is required - no partial credit
- Multiple iterations allowed but must eventually pass

### 2. Exhaustive Validation
- Critics use tree_sitter for complete code analysis
- Every file, every API call, every interface must be checked
- Cross-reference validation between code and specifications

### 3. Clear Failure Reporting
- Critics provide exact lists of what's missing
- Line numbers and file paths included
- Actionable feedback for the extractor agents

### 4. Iteration Loop
- Extractors get critic feedback and must fix issues
- Maximum 3 iterations before declaring failure
- Each iteration builds on previous feedback

### 5. Production Ready Output
- Only specifications that pass validation proceed
- Backend can trust the specifications are complete
- No integration failures due to missing information

## Testing the Implementation

1. **Test with Missing APIs**: Intentionally skip an API endpoint and verify critic catches it
2. **Test with Wrong Types**: Change a field type and verify critic identifies mismatch
3. **Test with Missing Entity**: Skip a TypeScript interface and verify critic fails validation
4. **Test Perfect Extraction**: Ensure valid specs pass on first iteration

## Success Metrics

Stage 3 is successful when:
- 100% of components are documented
- 100% of API endpoints are captured correctly
- 100% of data structures have models
- All critics pass validation
- Backend team can implement without any missing information

This implementation ensures Stage 3 produces perfect specifications for backend development.