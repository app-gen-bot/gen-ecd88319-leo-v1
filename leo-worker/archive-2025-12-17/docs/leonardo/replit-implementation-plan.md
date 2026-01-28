# Replit-Style Leonardo Pipeline Implementation Plan

## Overview

This plan outlines how to restructure the Leonardo pipeline to follow Replit's proven methodology, ensuring 100% build success rate through discovery-first generation and continuous error correction.

## Phase 1: Template Discovery System

### 1.1 Create Template Analyzer

**New Module: `template_analyzer.py`**
```python
class TemplateAnalyzer:
    """Discovers and documents template structure and expectations."""
    
    def analyze_template(self, app_dir: Path) -> TemplateStructure:
        """
        Analyzes extracted template to understand:
        - File naming conventions (home.tsx vs HomePage.tsx)
        - Import patterns in App.tsx
        - Available scripts in package.json
        - Component structure expectations
        - API route patterns
        """
        
    def get_agent_context(self) -> Dict[str, Any]:
        """
        Returns context that ALL agents need:
        - Expected file names for each component
        - Import patterns to follow
        - Naming conventions to use
        - Available UI components
        """
```

### 1.2 Template Structure Documentation

Create a `template_structure.json` after extraction:
```json
{
  "pages": {
    "home": {
      "expectedPath": "client/src/pages/home.tsx",
      "importedAs": "Home",
      "importPattern": "@/pages/home"
    }
  },
  "components": {
    "ui": ["button", "card", "input", "checkbox"],
    "importPattern": "@/components/ui/{component}"
  },
  "api": {
    "routePattern": "/api/{resource}",
    "storageLocation": "server/storage.ts"
  },
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build && esbuild...",
    "check": "tsc"
  }
}
```

## Phase 2: Incremental Generation with Validation

### 2.1 Replace Multi-Agent Pipeline with Single Orchestrator

**New Approach: `leonardo_orchestrator.py`**
```python
class LeonardoOrchestrator:
    """Single agent that generates app incrementally with validation."""
    
    async def build_app(self, plan: str, preview: str, app_dir: Path):
        # Step 1: Discover template structure
        template_info = self.analyze_template(app_dir)
        
        # Step 2: Generate schema with validation
        await self.generate_and_validate("schema", template_info)
        
        # Step 3: Generate storage with validation
        await self.generate_and_validate("storage", template_info)
        
        # Step 4: Generate routes with validation
        await self.generate_and_validate("routes", template_info)
        
        # Step 5: Generate main page (respecting template)
        await self.generate_and_validate("main_page", template_info)
        
    async def generate_and_validate(self, component: str, context: dict):
        # Generate component
        await self.generate_component(component, context)
        
        # Run build to check for errors
        errors = await self.run_validation()
        
        # Fix any errors before proceeding
        if errors:
            await self.fix_errors(errors)
            
        # Verify fix worked
        await self.verify_no_errors()
```

### 2.2 Error Detection and Correction Loop

**Error Correction System:**
```python
class ErrorCorrector:
    """Fixes common build errors automatically."""
    
    async def fix_import_errors(self, error: str, app_dir: Path):
        """
        Fixes import mismatches:
        - If looking for 'home', but found 'HomePage', create redirect
        - Or rename file to match expected import
        """
        
    async def fix_missing_scripts(self, package_json: Path):
        """
        Adds missing scripts:
        - If lint is missing, add "lint": "tsc --noEmit"
        """
        
    async def fix_typescript_errors(self, errors: List[str]):
        """
        Fixes common TS errors:
        - Type mismatches
        - Missing imports
        - Incorrect prop types
        """
```

## Phase 3: Template Conformance System

### 3.1 Template-Aware Generation

**Update ALL agent prompts to include:**
```python
TEMPLATE_CONTEXT = """
IMPORTANT: You are working with an existing template that has specific expectations.

Template Structure:
- Main page must be at: {expected_home_path}
- It will be imported as: {import_statement}
- Available UI components: {ui_components}
- Naming convention: {naming_pattern}

You MUST:
1. Create files at the exact paths the template expects
2. Use the exact names the template imports
3. Follow the template's patterns and conventions
"""
```

### 3.2 Import Resolution System

**Create import compatibility layer:**
```typescript
// client/src/pages/home.tsx (compatibility file)
// This file ensures template imports work regardless of actual component name
export { HomePage as default } from './HomePage';
```

OR

```typescript
// Generate as home.tsx directly (matching template expectation)
export function Home() {
  // Component implementation
}
export default Home;
```

## Phase 4: Continuous Validation Pipeline

### 4.1 Validation After Each Step

```python
class ContinuousValidator:
    """Validates build state after each generation step."""
    
    async def validate_step(self, step_name: str, app_dir: Path):
        results = {
            "typescript": await self.check_typescript(app_dir),
            "imports": await self.verify_imports(app_dir),
            "build": await self.try_build(app_dir),
            "lint": await self.run_lint_if_available(app_dir)
        }
        
        if any(not r["success"] for r in results.values()):
            return self.get_errors(results)
        return None
        
    async def check_typescript(self, app_dir: Path):
        """Run tsc --noEmit to check for TS errors."""
        
    async def verify_imports(self, app_dir: Path):
        """Ensure all imports resolve correctly."""
        
    async def try_build(self, app_dir: Path):
        """Run build to catch any issues."""
```

### 4.2 Progressive Build States

```python
BUILD_STAGES = [
    "TEMPLATE_EXTRACTED",
    "SCHEMA_GENERATED",
    "SCHEMA_VALIDATED",
    "STORAGE_GENERATED", 
    "STORAGE_VALIDATED",
    "ROUTES_GENERATED",
    "ROUTES_VALIDATED",
    "UI_GENERATED",
    "UI_VALIDATED",
    "BUILD_SUCCESSFUL"
]
```

## Phase 5: Implementation Steps

### Step 1: Create Template Discovery (Week 1)
- [ ] Build `template_analyzer.py`
- [ ] Generate `template_structure.json` after extraction
- [ ] Pass context to all agents

### Step 2: Add Error Correction (Week 1)
- [ ] Implement `ErrorCorrector` class
- [ ] Add common error fixes (imports, scripts, types)
- [ ] Test with known failure cases

### Step 3: Update Agent Prompts (Week 2)
- [ ] Add template context to all agent prompts
- [ ] Ensure agents respect template structure
- [ ] Coordinate file naming between agents

### Step 4: Implement Validation Loop (Week 2)
- [ ] Add validation after each agent
- [ ] Implement error correction before proceeding
- [ ] Ensure working state maintained

### Step 5: Test and Refine (Week 3)
- [ ] Test with multiple app types
- [ ] Refine error detection and correction
- [ ] Achieve 100% build success rate

## Quick Wins (Immediate Implementation)

### 1. Fix the home.tsx Problem

**Option A: Update Main Page Generator prompt**
```python
# In main_page_generator/system_prompt.py
SYSTEM_PROMPT = """
...
You need to generate a `client/src/pages/home.tsx` file (NOT HomePage.tsx).
The component should be named and exported as default:
export default function Home() { ... }
...
"""
```

**Option B: Add compatibility layer in build_stage.py**
```python
# After generating HomePage.tsx, create home.tsx
compatibility_content = """
// Compatibility layer for template imports
export { HomePage as default } from './HomePage';
"""
app_dir / "client/src/pages/home.tsx").write_text(compatibility_content)
```

### 2. Add Lint Script

**In build_stage.py after template extraction:**
```python
# Add lint script to package.json
package_json_path = app_dir / "package.json"
package_data = json.loads(package_json_path.read_text())
if "lint" not in package_data.get("scripts", {}):
    package_data["scripts"]["lint"] = "tsc --noEmit"
    package_json_path.write_text(json.dumps(package_data, indent=2))
```

### 3. Run Validation After Each Agent

**Modify build_stage.py:**
```python
# After each agent runs
async def run_agent_with_validation(agent, method, *args, **kwargs):
    # Run agent
    result = await getattr(agent, method)(*args, **kwargs)
    
    # Check for basic errors
    if not await quick_build_check(app_dir):
        # Try to fix common issues
        await fix_common_errors(app_dir)
    
    return result
```

## Success Metrics

### Target Metrics
- **Build Success Rate**: 100% (up from current ~0%)
- **Error Detection Time**: During generation (not at end)
- **Error Correction Rate**: 95%+ automated fixes
- **Template Conformance**: 100% matching imports

### Validation Criteria
- All generated apps build successfully
- No import errors
- All TypeScript compiles
- Lint passes (when configured)
- App runs without console errors

## Risk Mitigation

### Potential Issues and Solutions

1. **Performance Impact**
   - Risk: Validation after each step slows pipeline
   - Mitigation: Use quick checks (tsc --noEmit) not full builds
   - Parallel validation where possible

2. **Complex Error Patterns**
   - Risk: Some errors too complex to auto-fix
   - Mitigation: Fail gracefully with clear error messages
   - Log patterns for future improvement

3. **Template Variations**
   - Risk: Different templates have different structures
   - Mitigation: Make analyzer adaptive
   - Support multiple template patterns

## Timeline

### Week 1: Foundation
- Implement template discovery
- Add basic error correction
- Fix immediate issues (home.tsx, lint)

### Week 2: Integration  
- Update all agents with template context
- Implement validation loop
- Test with existing apps

### Week 3: Refinement
- Handle edge cases
- Optimize performance
- Achieve 100% success rate

## Conclusion

By adopting Replit's approach of:
1. **Discovery before generation**
2. **Continuous validation**
3. **Immediate error correction**
4. **Template conformance**

We can transform the Leonardo pipeline from a "generate and hope" system to a reliable, self-correcting pipeline that produces working applications 100% of the time.

The key insight: **Work WITH the template, not despite it.**