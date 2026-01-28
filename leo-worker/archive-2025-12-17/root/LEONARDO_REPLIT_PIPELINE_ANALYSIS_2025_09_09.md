# LEONARDO REPLIT PIPELINE ANALYSIS & IMPLEMENTATION PLAN - 2025-09-09

## Executive Summary

The Leonardo Replit pipeline demonstrates excellent agent capabilities but violates the **"Never Broken" Principle** by
proceeding even when files don't compile. We will implement proper **Writer-Critic loops** following the existing
app_factory patterns to ensure each step produces working, validated code before moving forward.

## Current State Analysis

### What's Working

- ✅ Agents generate high-quality TypeScript code
- ✅ Git isolation fix resolved path contamination
- ✅ Template extraction and cleanup works perfectly
- ✅ 5 of 6 agents successfully write files
- ✅ Cost efficient at $0.70 total

### Critical Issues

1. **No Writer-Critic Loops** - Pipeline blindly proceeds even with broken code
2. **Misleading Validation** - Programmatic file checks cause false warnings
3. **App Shell Generator Failure** - Agent doesn't invoke Write tool
4. **Violates "Never Broken" Principle** - Continues with non-compiling code

## THE "NEVER BROKEN" PRINCIPLE (Replit)

```typescript
const neverBrokenPrinciple = {
    compilation: 'ALWAYS compiles without errors',
    server: 'ALWAYS starts and serves requests',
    frontend: 'ALWAYS renders basic functionality',
    workflow: 'Critical user paths ALWAYS work'
};
```

**Core Philosophy:**

- Start with working code
- Add incrementally while maintaining working state
- NEVER proceed if current step is broken
- Each agent output must compile and run

## IMPLEMENTATION PLAN FOR 2025-09-09

### Phase 1: RIP OUT Programmatic Validation (30 mins)

**DELETE ALL OF THIS GARBAGE:**

```python
# DELETE these misleading checks from build_stage.py:
if not schema_path.exists():
    logger.warning("⚠️ Schema file not found at expected location")

# DELETE from all agent files:
expected_app_path = Path("client/src/App.tsx")
if expected_app_path.exists():
    logger.info("File found")
else:
    logger.warning("File not found")
```

**Replace with ONLY:**

```python
# Just log what the agent says it did
logger.info(f"✅ {agent_name} completed")
# The Critic will handle all validation
```

### Phase 2: Implement Writer-Critic Loops (3 hours)

#### Pattern from Existing app_factory Code:

```python
async def run_agent_with_critic(
        writer_agent,
        critic_agent,
        max_iterations=3,
        app_dir: Path
):
    """Run agent with Writer-Critic loop following Never Broken principle."""

    for iteration in range(max_iterations):
        logger.info(f"🔄 Iteration {iteration + 1}/{max_iterations}")

        # WRITER: Generate code
        writer_result = await writer_agent.generate()

        if not writer_result.success:
            logger.error(f"❌ Writer failed")
            continue

        # CRITIC: Validate it actually works
        critic_eval = await critic_agent.evaluate(app_dir)

        # Critical checks for Never Broken principle:
        checks = {
            'file_exists': critic_eval.file_exists,
            'typescript_compiles': critic_eval.typescript_valid,
            'imports_resolve': critic_eval.imports_valid,
            'min_size_met': critic_eval.size > 100
        }

        if all(checks.values()):
            logger.info(f"✅ Critic approved - code works!")
            return writer_result
        else:
            # Tell writer EXACTLY what's broken
            failed_checks = [k for k, v in checks.items() if not v]
            critic_feedback = f"Failed checks: {failed_checks}"
            writer_agent.set_feedback(critic_feedback)
            logger.info(f"🔄 Critic requested fixes: {failed_checks}")

    logger.error(f"❌ Failed after {max_iterations} attempts")
    return None
```

#### Specific Implementation for Each Agent:

**1. Schema Generator Critic**

```python
class SchemaGeneratorCritic:
    async def evaluate(self, app_dir: Path):
        schema_path = app_dir / "shared/schema.ts"

        # Check 1: File exists
        if not schema_path.exists():
            return CriticResult(success=False, reason="File not created")

        # Check 2: TypeScript compiles
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", str(schema_path)],
            cwd=app_dir,
            capture_output=True
        )
        if result.returncode != 0:
            return CriticResult(success=False, reason=f"TypeScript errors: {result.stderr}")

        # Check 3: Required exports exist
        content = schema_path.read_text()
        required = ['export const tasks', 'export type Task', 'insertTaskSchema']
        missing = [r for r in required if r not in content]
        if missing:
            return CriticResult(success=False, reason=f"Missing exports: {missing}")

        return CriticResult(success=True, decision="complete")
```

**2. Storage Generator Critic**

```python
class StorageGeneratorCritic:
    async def evaluate(self, app_dir: Path):
        storage_path = app_dir / "server/storage.ts"

        # Must import from schema
        if not (app_dir / "shared/schema.ts").exists():
            return CriticResult(success=False, reason="Schema dependency missing")

        # TypeScript compilation with imports
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", str(storage_path)],
            cwd=app_dir,
            capture_output=True
        )
        if result.returncode != 0:
            return CriticResult(success=False, reason=f"Compilation failed: {result.stderr}")

        return CriticResult(success=True, decision="complete")
```

**3. App Shell Generator Critic (CRITICAL FIX)**

```python
class AppShellGeneratorCritic:
    async def evaluate(self, app_dir: Path):
        app_path = app_dir / "client/src/App.tsx"

        # CRITICAL: File MUST exist
        if not app_path.exists():
            return CriticResult(
                success=False,
                reason="App.tsx NOT CREATED - You MUST use Write tool!",
                priority_fix="Use Write tool to create client/src/App.tsx"
            )

        # Check React/TypeScript compilation
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--jsx", "react", str(app_path)],
            cwd=app_dir,
            capture_output=True
        )
        if result.returncode != 0:
            return CriticResult(success=False, reason=f"React/TS errors: {result.stderr}")

        return CriticResult(success=True, decision="complete")
```

### Phase 3: Update build_stage.py (2 hours)

```python
async def run_stage(plan_path, react_component_path, output_dir=None):
    """Build stage with Writer-Critic loops following Never Broken principle."""

    # Extract template
    app_dir = extract_template(workspace_dir)

    # Schema Generator with Critic
    logger.info("🤖 Generating Schema with Writer-Critic loop...")
    schema_result = await run_agent_with_critic(
        SchemaGeneratorAgent(cwd=app_dir),
        SchemaGeneratorCritic(),
        max_iterations=3,
        app_dir=app_dir
    )

    if not schema_result:
        logger.error("❌ STOPPING - Schema generation failed Never Broken check")
        return AgentResult(success=False, content="Schema generation failed validation")

    # Storage Generator with Critic
    logger.info("🤖 Generating Storage with Writer-Critic loop...")
    storage_result = await run_agent_with_critic(
        StorageGeneratorAgent(cwd=app_dir),
        StorageGeneratorCritic(),
        max_iterations=3,
        app_dir=app_dir
    )

    if not storage_result:
        logger.error("❌ STOPPING - Storage generation failed Never Broken check")
        return AgentResult(success=False, content="Storage generation failed validation")

    # Continue for all agents...

    # FINAL VALIDATION - The app MUST work
    logger.info("🏁 Final Never Broken validation...")

    # 1. Full TypeScript compilation
    tsc_result = subprocess.run(["npx", "tsc", "--noEmit"], cwd=app_dir)
    if tsc_result.returncode != 0:
        logger.error("❌ TypeScript compilation failed - violates Never Broken")
        return AgentResult(success=False, content="App doesn't compile")

    # 2. Build test
    build_result = subprocess.run(["npm", "run", "build"], cwd=app_dir)
    if build_result.returncode != 0:
        logger.error("❌ Build failed - violates Never Broken")
        return AgentResult(success=False, content="App doesn't build")

    logger.info("✅ Never Broken validation passed - app compiles and builds!")
    return AgentResult(success=True, content="Pipeline completed with working app")
```

### Phase 4: Fix App Shell Generator Prompt (30 mins)

```python
SYSTEM_PROMPT = """You are the App Shell Generator Agent.

## CRITICAL REQUIREMENT - YOU MUST WRITE THE FILE
You MUST use the Write tool to create `client/src/App.tsx`
DO NOT just describe or explain the code
DO NOT say "I would write" or "The code should be"
ACTUALLY WRITE THE FILE using the Write tool

The pipeline will FAIL if you don't create this file.

## Never Broken Principle
Your generated App.tsx MUST:
1. Compile without TypeScript errors
2. Import components that exist
3. Render without runtime errors
4. Provide basic app structure

## Your Task
1. Read the plan.md for app requirements
2. Read preview-react/App.tsx for UI structure
3. Read schema.ts for type definitions
4. CREATE client/src/App.tsx using Write tool  # <-- CRITICAL
5. Verify it compiles with `npx tsc --noEmit`
"""
```

## Success Metrics

### Immediate (End of Day)

1. ✅ ALL agents use Writer-Critic loops
2. ✅ Pipeline stops on first real failure
3. ✅ No misleading validation warnings
4. ✅ App.tsx is actually created
5. ✅ Final app compiles and builds

### Quality Metrics

1. ✅ `npx tsc --noEmit` passes after EACH agent
2. ✅ `npm run build` succeeds at end
3. ✅ `npm run dev` starts the app
4. ✅ No "file not found" false warnings
5. ✅ Clear feedback on actual failures

## Timeline

**Morning (9am - 12pm)**

- 30 mins: Delete all programmatic validation
- 30 mins: Fix App Shell Generator prompt
- 2 hours: Implement SchemaGeneratorCritic

**Afternoon (1pm - 5pm)**

- 1 hour: Implement remaining Critics
- 2 hours: Update build_stage.py with loops
- 1 hour: Testing and debugging

**End of Day**

- Working pipeline following Never Broken principle
- Documentation of patterns for team

## Key Insights

1. **Programmatic validation is worthless** - Critics should compile and test, not check paths
2. **Never Broken > Speed** - Better to retry 3 times than proceed with broken code
3. **Explicit Write Requirements** - Agents need crystal clear instructions to use tools
4. **Feedback Loops Work** - Existing Writer-Critic pattern is proven and effective

## Conclusion

The Leonardo Replit pipeline has strong foundations but needs proper Writer-Critic loops to ensure the "Never Broken"
principle. By removing misleading validation and implementing proper Critics that actually compile and test code, we can
achieve 100% success rate while maintaining code quality at every step.