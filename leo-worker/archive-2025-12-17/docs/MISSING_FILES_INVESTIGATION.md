# Missing Files Investigation

**Date**: 2025-10-11
**Issue**: Multiple critical files missing from generated apps

## Problems Identified

### 1. ❌ App.tsx Missing - CRITICAL

**Responsible Agent**: `AppShellGeneratorAgent`
**Expected Output**: `client/src/App.tsx`
**Status**: ⚠️ **AGENT NOT IN PIPELINE EXECUTION**

#### Root Cause

The `AppShellGeneratorAgent` is imported but **NEVER added to the agent_pairs execution list** in `build_stage.py`:

**Evidence**:
- ✅ Line 39: `from ..agents.app_shell_generator import AppShellGeneratorAgent` (imported)
- ✅ Line 57: `from ..agents.app_shell_generator.critic import AppShellGeneratorCritic` (imported)
- ✅ Line 881: Docstring says "7. Runs App Shell Generator Writer-Critic loop"
- ✅ Line 1604: Validation checks for "App Shell Generator" completion
- ❌ **Lines 1110-1213**: Agent pairs list has only 7 agents - **App Shell Generator NOT included!**

**Current Pipeline** (7 agents):
1. Schema Generator
2. Storage Generator
3. Routes Generator
4. API Client Generator
5. Frontend Interaction Spec (Master)
6. Layout Generator
7. Frontend Implementation ← **NOT App Shell Generator!**

**What's Missing**: App Shell Generator agent pair between API Client Generator and FIS Master.

#### Known Issues with This Agent

From `agents/app_shell_generator/critic/system_prompt.py`:

> "🚨🚨🚨 CRITICAL ROLE: CATCH THE APP SHELL FILE CREATION BUG! 🚨🚨🚨
>
> This is THE MOST IMPORTANT CRITIC in the entire pipeline because:
> **THE APP SHELL GENERATOR WRITER HAS A KNOWN BUG - IT DOESN'T CREATE FILES!**"

So there are **TWO** issues:
1. Agent not in execution pipeline
2. Agent has a documented bug where it claims success without creating files

#### Impact

- **Browser Visual Critic** had to create App.tsx manually (line in logs: "Let me create a minimal App component")
- App cannot run without App.tsx (routing, page integration all broken)
- Pages are generated but have no App shell to mount into

---

### 2. ✅ index.css Present (False Alarm)

**Responsible**: Vite Template
**Expected Location**: `client/src/index.css`
**Status**: ✅ **Included in template v2.1.1-2025**

#### Verification

```bash
tar -tzf ~/.mcp-tools/templates/vite-express-template-v2.1.1-2025.tar.gz | grep index.css
# Output: vite-express-template-v2.1.1-2025/client/src/index.css
```

The Browser Visual Critic created it only because App.tsx was missing and it couldn't test properly.

---

### 3. ❌ Contract Naming Mismatch - CRITICAL

**Responsible**: `utilities/fix_api_client.py`
**Location**: Lines 36-40
**Status**: ⚠️ **BUG IN CONTRACT NAME GENERATION**

#### The Bug

In `fix_api_client.py`, the code generates imports like this:

```python
for contract_file in contract_files:
    entity_name = contract_file.stem.replace('.contract', '')
    # Assume standard naming convention
    contract_var = f"{entity_name}Contract"
    imports.append(f"import {{ {contract_var} }} from '@shared/contracts/{contract_file.name}';")
```

**Problem**: If the contract file is named `blocked-dates.contract.ts`:
- `entity_name` = `"blocked-dates"` (keeps the hyphen)
- `contract_var` = `"blocked-datesContract"` ❌ **INVALID IDENTIFIER**

But the actual export in the contract file uses camelCase:
```typescript
export const blockedDatesContract = c.router({ ... });
```

#### Why It Happens

The code assumes entity names are already valid JavaScript identifiers, but contract files may have:
- Hyphens: `blocked-dates.contract.ts`
- Underscores: `blocked_dates.contract.ts`
- Multiple words: `chapel-bookings.contract.ts`

The fix needs to convert to camelCase:
- `blocked-dates` → `blockedDates`
- `chapel-bookings` → `chapelBookings`
- `blocked_dates` → `blockedDates`

#### Impact

- **Import statements fail**: `import { blocked-datesContract }` is invalid JavaScript
- **TypeScript compilation fails**: Cannot parse the generated api-client.ts
- **API client unusable**: Pages cannot make API calls

#### Browser Visual Critic's Finding

From logs:
> "Perfect! The contract exports use camelCase (`blockedDatesContract`), not hyphenated names. Let me fix the api-client.ts file."

The critic had to manually fix the generated api-client.ts file.

---

## Summary of Issues

| Issue | Severity | Responsible | Status | Fix Required |
|-------|----------|-------------|--------|--------------|
| **App.tsx missing** | 🔴 CRITICAL | AppShellGenerator not in pipeline | Agent not executed | Add agent to pipeline |
| **App.tsx creation bug** | 🔴 CRITICAL | AppShellGenerator writer | Known bug | Fix agent writer |
| **Contract naming** | 🔴 CRITICAL | fix_api_client.py | Bug in name conversion | Convert to camelCase |
| **index.css missing** | 🟢 FALSE ALARM | Template | Template includes it | None |

---

## Required Fixes

### Fix 1: Add AppShellGenerator to Pipeline

**Location**: `stages/build_stage.py` lines 1110-1213

**Action**: Add agent pair between API Client Generator and FIS Master:

```python
{
    "name": "App Shell Generator",
    "output_file": app_dir / "client" / "src" / "App.tsx",  # For skip check
    "writer": AppShellGeneratorAgent(cwd=cwd),
    "critic": AppShellGeneratorCritic(cwd=cwd, logger=logger),
    "critical": True  # CRITICAL - app won't run without it
},
```

### Fix 2: Fix Contract Naming in fix_api_client.py

**Location**: `utilities/fix_api_client.py` lines 36-40

**Action**: Add camelCase conversion function:

```python
def to_camel_case(snake_str: str) -> str:
    """Convert snake-case or kebab-case to camelCase.

    Examples:
        blocked-dates -> blockedDates
        blocked_dates -> blockedDates
        chapel-bookings -> chapelBookings
    """
    # Replace hyphens and underscores with spaces, then split
    components = snake_str.replace('-', ' ').replace('_', ' ').split()
    # First component stays lowercase, rest are capitalized
    return components[0].lower() + ''.join(x.capitalize() for x in components[1:])

# Then use it:
for contract_file in contract_files:
    entity_name = contract_file.stem.replace('.contract', '')
    entity_name_camel = to_camel_case(entity_name)  # NEW
    contract_var = f"{entity_name_camel}Contract"
    imports.append(f"import {{ {contract_var} }} from '@shared/contracts/{contract_file.name}';")
    router_entries.append(f"  {entity_name}: {contract_var}")
```

### Fix 3: Fix AppShellGenerator Writer Bug

**Location**: `agents/app_shell_generator/agent.py`

**Action**: Ensure the agent actually uses the Write tool to create App.tsx. Review agent prompts to emphasize file creation.

---

## Testing Plan

After fixes:

1. **Run full pipeline** on test app
2. **Verify App.tsx exists** at `client/src/App.tsx`
3. **Verify contract imports** use camelCase (no hyphens in identifiers)
4. **Run build** to confirm TypeScript compiles
5. **Start dev server** to confirm app runs

---

## Priority

All three issues are **CRITICAL** - the app cannot function without these fixes:
- No App.tsx = No routing = No app
- Invalid contract names = TypeScript errors = Cannot compile
- Both must be fixed before any app can run successfully
