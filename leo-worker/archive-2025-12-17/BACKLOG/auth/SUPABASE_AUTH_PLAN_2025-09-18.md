# SUPABASE_AUTH_PLAN_2025-09-18.md

## 🎯 Authentication Split-Brain Fix Plan

### Executive Summary
The Leonardo App Factory pipeline successfully generates web applications but creates a "split-brain" authentication system where frontend and backend make incompatible auth decisions. Additionally, a critical gap was discovered: the pipeline doesn't run `npm install` after template extraction, preventing generated apps from running.

### Discovery Date: 2025-01-18
### Plan Created: 2025-09-18
### Priority: CRITICAL - Security vulnerabilities and non-functional apps

## 📋 Problem Analysis

### The Split-Brain Authentication Issue
**Problem**: The pipeline generates incompatible authentication systems:
```
FRONTEND (Context Provider Generator)     BACKEND (Other Generators)
✅ Full Supabase Auth                    ❌ Plain text passwords  
✅ JWT token handling                    ❌ No token validation
✅ AuthContext + hooks                   ❌ No auth middleware
✅ Login/Signup forms                    ❌ No /auth endpoints
✅ Demo credentials UI                   ❌ No demo user seed
✅ Mock auth fallback                    ❌ No bcrypt hashing
```

### Root Causes Identified

#### 1. Lack of Agent Coordination
- **Context Provider Generator**: Always generates Supabase auth (hardcoded)
- **Schema Generator**: Conditionally adds users table based on plan
- **Storage Generator**: Stores passwords as plain text
- **Routes Generator**: Creates CRUD endpoints only, no auth routes
- **No Communication**: Agents work independently without sharing auth strategy

#### 2. Missing npm install Step
- Template extraction doesn't include node_modules
- Pipeline doesn't run `npm install` after extraction
- Apps can't run even if code is correct
- Critical gap in the pipeline workflow

#### 3. Template Architecture Issue
- Auth not included in base template (v2.1.1-2025)
- Context Provider Generator tries to add auth after the fact
- Creates inconsistency between frontend and backend

## 🔧 Work Already Completed

### Phase 1: Immediate Security Fixes (✅ COMPLETED)
Modified `apps/timeless-weddings_2025-09-18/`:
1. Added auth dependencies to package.json
2. Updated storage.ts to use bcrypt for password hashing
3. Added auth endpoints to routes.ts (/auth/login, /auth/signup, /auth/me)
4. Created seed.ts with demo user

**Note**: App still needs `npm install` to run!

### Phase 2: Template v2.2.0 Created (✅ COMPLETED)
Created new template with complete auth infrastructure:
- **Location**: `/home/jake/.mcp-tools/templates/vite-express-template-v2.2.0.tar.gz`
- **Features**:
  - AuthAdapter with multi-strategy support (JWT/Supabase/Mock)
  - Auth routes and middleware included
  - React AuthContext and components
  - Demo user seeding
  - Security best practices (bcrypt, JWT)

## 📝 Implementation Plan

### Phase 3: Pipeline Updates (🔄 PENDING)

#### 3.1 Add npm install to Pipeline (CRITICAL)
**File**: `src/app_factory_leonardo_replit/stages/build_stage.py`
**Location**: After template extraction (around line 280)
```python
# Install dependencies
logger.info("📦 Installing npm dependencies...")
install_result = subprocess.run(
    ["npm", "install"],
    cwd=app_dir,
    capture_output=True,
    text=True
)
if install_result.returncode != 0:
    logger.error(f"npm install failed: {install_result.stderr}")
    return AgentResult(
        success=False,
        error=f"npm install failed: {install_result.stderr}",
        agent_name="build_stage"
    )
else:
    logger.info("✅ Dependencies installed successfully")
```

#### 3.2 Update Template Reference (CRITICAL)
**File**: `src/app_factory_leonardo_replit/stages/build_stage.py`
**Line**: 46
**Change**: 
```python
TEMPLATE_NAME = "vite-express-template-v2.2.0.tar.gz"  # Updated from v2.1.1-2025
```

#### 3.3 Disable Auth Generation in Context Provider Generator (HIGH)
**Location**: `src/app_factory_leonardo_replit/agents/context_provider_generator/`

**Files to modify**:
1. `system_prompt.py` - Remove auth generation instructions
2. `agent.py` - Remove Supabase auth file copying logic

**New behavior**: Only generate app-specific context providers, not authentication

#### 3.4 Update Schema Generator Guidance (MEDIUM)
**File**: `src/app_factory_leonardo_replit/agents/schema_generator/system_prompt.py`
**Add note**: Authentication is handled by base template, not generated

#### 3.5 Update Storage Generator (MEDIUM)
**File**: `src/app_factory_leonardo_replit/agents/storage_generator/`
**Change**: If users table exists, reference template's AuthAdapter instead of plain storage

#### 3.6 Update Routes Generator (MEDIUM)
**File**: `src/app_factory_leonardo_replit/agents/routes_generator/`
**Change**: Skip auth endpoints - they're in the template

### Phase 4: Validation Updates (🔄 PENDING)

#### 4.1 Update Validator Stage
**File**: `src/app_factory_leonardo_replit/stages/validator_stage.py`
**Add checks for**:
- node_modules directory exists
- package-lock.json exists
- Auth consistency between frontend and backend

#### 4.2 Update Fixer Agent
**File**: `src/app_factory_leonardo_replit/agents/app_fixer/`
**Add logic to**:
- Auto-run `npm install` if node_modules missing
- Check for auth configuration issues
- Validate no plain text passwords

#### 4.3 Create Auth Consistency Critic (NEW)
**Location**: `src/app_factory_leonardo_replit/agents/auth_validator/` (new)
**Purpose**: Validate auth consistency across the application
**Checks**:
- Frontend and backend use same auth strategy
- Auth dependencies exist in package.json
- No plain text password storage
- Auth middleware properly configured

### Phase 5: Documentation Updates (🔄 PENDING)

#### 5.1 Update CLAUDE.md
- Document that auth is template-provided
- Note npm install requirement
- Update agent descriptions

#### 5.2 Update Template README
- Document auth configuration options
- Environment variable setup
- Strategy selection guide

## 📊 Implementation Timeline

### Day 1 (Immediate - Tomorrow)
1. [ ] Add npm install to build_stage.py
2. [ ] Update template reference to v2.2.0
3. [ ] Test pipeline with new changes

### Day 2
4. [ ] Modify Context Provider Generator
5. [ ] Update Schema Generator guidance
6. [ ] Test auth generation is disabled

### Day 3
7. [ ] Update Storage and Routes generators
8. [ ] Add validation checks
9. [ ] Full pipeline testing

### Day 4
10. [ ] Documentation updates
11. [ ] Create auth consistency critic
12. [ ] Final testing and verification

## 🧪 Testing Plan

### Test Cases
1. **Simple App (No Auth)**: "Create a todo list app"
   - Should NOT generate users table
   - Should NOT generate auth code
   - Template auth remains unused but available

2. **App With Auth**: "Create a wedding booking app with user accounts"
   - Should use template auth
   - Should NOT generate additional auth code
   - Auth should work out of the box

3. **npm install Verification**:
   - Verify node_modules created
   - Verify app runs with `npm run dev`
   - No missing dependency errors

### Success Criteria
- [ ] No plain text passwords in any generated app
- [ ] Frontend and backend auth strategies match
- [ ] Apps run immediately after generation
- [ ] Auth works with demo credentials
- [ ] No duplicate auth code generation

## 🚨 Critical Files to Modify

### Priority 1 (Must change)
1. `src/app_factory_leonardo_replit/stages/build_stage.py`
   - Line 46: Update template name
   - After line 280: Add npm install

### Priority 2 (Auth generation)
2. `src/app_factory_leonardo_replit/agents/context_provider_generator/system_prompt.py`
3. `src/app_factory_leonardo_replit/agents/context_provider_generator/agent.py`

### Priority 3 (Validation)
4. `src/app_factory_leonardo_replit/stages/validator_stage.py`
5. `src/app_factory_leonardo_replit/agents/app_fixer/agent.py`

## 📝 Notes and Observations

### Positive Discoveries
- Agents show emergent intelligence (Context Provider found auth template autonomously)
- Template system works well for base infrastructure
- Writer-Critic pattern catches many issues

### Lessons Learned
- Auth is too complex for generation - should be infrastructure
- npm install is critical and was overlooked
- Agent coordination needs improvement
- Security must be validated explicitly

### Architecture Insights
The split-brain problem mirrors human organizational silos - different teams (agents) solving the same problem differently without coordination. The solution is to move auth to infrastructure (template) rather than generated code.

## 🎯 Expected Outcomes

After implementing this plan:
1. **Security**: No more plain text passwords
2. **Functionality**: Apps run immediately after generation
3. **Consistency**: Frontend and backend auth always match
4. **Simplicity**: Auth is infrastructure, not generated
5. **Reliability**: Fewer moving parts, less chance of failure

## 📚 Related Documents
- `AUTH_SCHIZOPHRENIA_ISSUE_2025_01_18.md` - Original issue discovery
- `AUTH_FIX_REQUIRED_2025_01_18.md` - Initial fix requirements
- `CLAUDE.md` - AI assistant guidance
- `src/app_factory_leonardo_replit/templates/supabase-auth-only/` - Auth template files

---

*Plan created: 2025-09-18*  
*Priority: CRITICAL*  
*Estimated implementation: 4 days*  
*Impact: All future generated applications*