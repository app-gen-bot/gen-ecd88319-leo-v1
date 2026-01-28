# Parallel FIS Page Spec Generation - Implementation Plan

**Date**: 2025-01-15
**Purpose**: Design and implement parallel generation of FIS page specs to handle 40+ pages efficiently
**Status**: Planning (no code changes yet)

---

## Executive Summary

### Current State
- **Sequential generation**: `run-modular-fis-standalone.py` generates page specs one at a time (lines 198-240)
- **40+ pages**: For large apps, sequential generation takes hours
- **Proven pattern exists**: `ParallelFrontendGenerator` successfully parallelizes React component generation

### Proposed Solution
- **Create `ParallelFISOrchestrator`**: Reuse proven patterns from build stage parallelization
- **Master → Pages flow**: Generate master spec first (sequential), then all page specs in parallel
- **Configurable concurrency**: Default 5 concurrent pages, configurable up to 10-15
- **Robust error handling**: Retry logic, continue-on-error, progress tracking

### Expected Impact
- **Time savings**: 40 pages sequentially (8-10 hours) → parallel with concurrency=5 (~2 hours)
- **Scalability**: Handle apps with 100+ pages
- **Reliability**: Partial failures don't block entire generation
- **User experience**: Real-time progress visibility

---

## Architecture Analysis

### Existing Parallel Pattern (Build Stage)

**File**: `src/app_factory_leonardo_replit/orchestrators/parallel_frontend_generator.py`

**Key Components**:
1. **ParallelFrontendGenerator**: Core parallelization logic
   - `asyncio.Semaphore` for concurrency control
   - `asyncio.gather()` for parallel task execution
   - Timeout handling per page
   - Exception handling with `return_exceptions=True`

2. **ParallelFrontendOrchestrator**: High-level orchestration
   - Loads master and page specs
   - Ensures prerequisites (AppLayout)
   - Runs parallel generation
   - Validates results with critic

3. **Pattern Features**:
   ```python
   # Concurrency control
   semaphore = asyncio.Semaphore(max_concurrency)

   # Parallel execution
   tasks = [generate_page(page) for page in pages]
   results = await asyncio.gather(*tasks, return_exceptions=True)

   # Individual page timeout
   result = await asyncio.wait_for(
       agent.generate_page(...),
       timeout=timeout_per_page
   )
   ```

**Why This Pattern Works**:
- ✅ Each page gets its own agent instance (no shared state)
- ✅ Semaphore prevents resource exhaustion
- ✅ `return_exceptions=True` allows continue-on-error
- ✅ Timeouts prevent hanging tasks
- ✅ Results collected and summarized at end

### Current FIS Generation (Sequential)

**File**: `run-modular-fis-standalone.py`

**Current Flow** (lines 126-264):
```python
# Step 1: Generate Master Spec (sequential) ✅
master_agent = FrontendInteractionSpecMasterAgent(app_dir)
result = await master_agent.generate_master_spec(...)

# Step 2: Extract pages
pages = extract_pages_from_tech_spec(tech_spec_path)

# Step 3: Generate page specs (SEQUENTIAL - THIS IS THE PROBLEM)
for i, page in enumerate(pages, 1):  # <-- Sequential loop
    page_agent = FrontendInteractionSpecPageAgent(app_dir, page_info)
    result = await page_agent.generate_page_spec(...)
    # Takes ~10-15 minutes per page
```

**Problems**:
- ❌ Sequential processing: 40 pages × 12 minutes = 8 hours
- ❌ One failure can require full restart
- ❌ No concurrency control (all sequential anyway)
- ❌ No progress tracking beyond simple counter

**What Works**:
- ✅ Master spec generated first (dependency satisfied)
- ✅ API Registry loaded once and reused
- ✅ Each page spec written to separate file (no race conditions)
- ✅ Skip existing files (idempotent)

---

## Proposed Architecture

### New Component: ParallelFISOrchestrator

**File**: `src/app_factory_leonardo_replit/orchestrators/parallel_fis_generator.py` (NEW)

**Class Structure**:
```python
class ParallelFISOrchestrator:
    """Orchestrates parallel FIS page spec generation."""

    def __init__(
        self,
        app_dir: Path,
        max_concurrency: int = 5,
        timeout_per_page: int = 900,  # 15 minutes
        retry_attempts: int = 3
    ):
        self.app_dir = app_dir
        self.max_concurrency = max_concurrency
        self.timeout_per_page = timeout_per_page
        self.retry_attempts = retry_attempts
        self.semaphore = asyncio.Semaphore(max_concurrency)

    async def generate_all_specs(self) -> Dict:
        """Generate master spec + all page specs in parallel.

        Returns:
            {
                'master': {...},
                'pages': {
                    'summary': {...},
                    'succeeded': [...],
                    'failed': [...]
                }
            }
        """
        # Phase 1: Generate master spec (MUST complete first)
        master_result = await self._generate_master_spec()

        if not master_result['success']:
            return {'error': 'Master spec generation failed', 'master': master_result}

        # Phase 2: Extract pages
        pages = await self._extract_pages()

        # Phase 3: Generate page specs in parallel
        page_results = await self._generate_pages_parallel(pages)

        return {
            'master': master_result,
            'pages': page_results
        }
```

### Parallel Page Generation Logic

```python
async def _generate_pages_parallel(self, pages: List[Dict]) -> Dict:
    """Generate all page specs in parallel with concurrency control."""

    # Prepare shared context (loaded once, used by all)
    shared_context = await self._prepare_shared_context()

    # Create tasks for all pages
    tasks = [
        self._generate_single_page_with_control(page, shared_context)
        for page in pages
    ]

    # Execute with progress tracking
    progress_tracker = ProgressTracker(total=len(pages))

    logger.info(f"🚀 Starting parallel generation of {len(pages)} page specs")
    logger.info(f"   Max concurrency: {self.max_concurrency}")
    logger.info(f"   Timeout per page: {self.timeout_per_page}s")

    start_time = time.time()
    results = await asyncio.gather(*tasks, return_exceptions=True)
    elapsed = time.time() - start_time

    logger.info(f"✅ Parallel generation completed in {elapsed:.1f}s")

    # Process and summarize results
    return self._process_results(pages, results)

async def _generate_single_page_with_control(
    self,
    page: Dict,
    shared_context: Dict
) -> Dict:
    """Generate single page spec with semaphore, retry, and timeout."""

    async with self.semaphore:  # Concurrency control
        return await self._generate_page_with_retry(page, shared_context)

async def _generate_page_with_retry(
    self,
    page: Dict,
    shared_context: Dict
) -> Dict:
    """Generate page spec with retry logic."""

    page_name = page['name']

    for attempt in range(1, self.retry_attempts + 1):
        try:
            logger.info(f"📝 [{attempt}/{self.retry_attempts}] Generating {page_name}...")

            # Timeout per attempt
            result = await asyncio.wait_for(
                self._generate_single_page(page, shared_context),
                timeout=self.timeout_per_page
            )

            if result['success']:
                logger.info(f"✅ {page_name} generated successfully")
                return result
            else:
                # Agent returned failure (e.g., validation error)
                if attempt < self.retry_attempts:
                    logger.warning(f"⚠️  {page_name} failed, retrying...")
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"❌ {page_name} failed after {attempt} attempts")
                    return result

        except asyncio.TimeoutError:
            if attempt < self.retry_attempts:
                logger.warning(f"⏱️  {page_name} timed out, retrying...")
                await asyncio.sleep(2 ** attempt)
            else:
                logger.error(f"❌ {page_name} timed out after {attempt} attempts")
                return {
                    'page': page_name,
                    'success': False,
                    'error': f"Timeout after {self.timeout_per_page}s × {attempt} attempts"
                }

        except Exception as e:
            if attempt < self.retry_attempts:
                logger.warning(f"⚠️  {page_name} error: {e}, retrying...")
                await asyncio.sleep(1)
            else:
                logger.error(f"❌ {page_name} failed with error: {e}")
                return {
                    'page': page_name,
                    'success': False,
                    'error': str(e)
                }

    # Should never reach here, but return failure just in case
    return {
        'page': page_name,
        'success': False,
        'error': 'Max retries exceeded'
    }

async def _generate_single_page(
    self,
    page: Dict,
    shared_context: Dict
) -> Dict:
    """Generate a single page spec (no retry, no timeout - handled by caller)."""

    page_name = page['name']
    page_route = page['route']

    # Each page gets its own agent instance
    page_info = {"name": page_name, "route": page_route}
    agent = FrontendInteractionSpecPageAgent(
        app_dir=self.app_dir,
        page_info=page_info
    )

    # Generate page spec
    result = await agent.generate_page_spec(
        master_spec=shared_context['master_spec'],
        page_name=page_name,
        page_route=page_route,
        api_registry=shared_context['api_registry']
    )

    return {
        'page': page_name,
        'success': result.get('success', False),
        'spec_path': result.get('spec_path'),
        'error': result.get('error')
    }
```

### Shared Context Preparation

```python
async def _prepare_shared_context(self) -> Dict:
    """Prepare context shared by all page generations.

    Load once, use many times (reduces file I/O).
    """

    # Read master spec
    master_spec_path = self.app_dir / "specs" / "frontend-interaction-spec-master.md"
    master_spec_content = master_spec_path.read_text()

    # Read API Registry
    api_registry_path = self.app_dir / "client" / "src" / "lib" / "api-registry.md"
    api_registry_content = None
    if api_registry_path.exists():
        api_registry_content = api_registry_path.read_text()
        logger.info(f"✅ Loaded API Registry ({len(api_registry_content)} chars)")
    else:
        logger.warning("⚠️ API Registry not found")

    return {
        'master_spec': master_spec_content,
        'api_registry': api_registry_content
    }
```

### Progress Tracking

```python
class ProgressTracker:
    """Thread-safe progress tracking for concurrent operations."""

    def __init__(self, total: int):
        self.total = total
        self.completed = 0
        self.failed = 0
        self.in_progress = 0
        self.lock = asyncio.Lock()

    async def mark_started(self, page_name: str):
        async with self.lock:
            self.in_progress += 1
            progress = self.completed + self.failed + self.in_progress
            logger.info(f"📝 {page_name} ({progress}/{self.total})")

    async def mark_completed(self, page_name: str):
        async with self.lock:
            self.in_progress -= 1
            self.completed += 1
            logger.info(f"✅ {page_name} ({self.completed}/{self.total} completed)")

    async def mark_failed(self, page_name: str, error: str):
        async with self.lock:
            self.in_progress -= 1
            self.failed += 1
            logger.error(f"❌ {page_name}: {error} ({self.failed} failures)")

    def summary(self) -> Dict:
        return {
            'total': self.total,
            'completed': self.completed,
            'failed': self.failed,
            'success_rate': f"{(self.completed / self.total * 100):.1f}%"
        }
```

### Results Processing

```python
def _process_results(self, pages: List[Dict], results: List) -> Dict:
    """Process parallel generation results."""

    succeeded = []
    failed = []

    for page, result in zip(pages, results):
        page_name = page['name']

        # Handle exceptions returned by gather()
        if isinstance(result, Exception):
            failed.append({
                'page': page_name,
                'error': str(result)
            })
        elif result.get('success'):
            succeeded.append({
                'page': page_name,
                'spec_path': result.get('spec_path')
            })
        else:
            failed.append({
                'page': page_name,
                'error': result.get('error', 'Unknown error')
            })

    summary = {
        'total': len(pages),
        'succeeded': len(succeeded),
        'failed': len(failed),
        'success_rate': f"{(len(succeeded) / len(pages) * 100):.1f}%"
    }

    return {
        'summary': summary,
        'succeeded': succeeded,
        'failed': failed
    }
```

---

## Configuration Strategy

### Multi-Layered Configuration

**1. Code Defaults** (in orchestrator class):
```python
DEFAULT_MAX_CONCURRENCY = 5
DEFAULT_TIMEOUT_PER_PAGE = 900  # 15 minutes
DEFAULT_RETRY_ATTEMPTS = 3
```

**2. Config File** (NEW: `config/fis_generation.yaml`):
```yaml
fis:
  parallelization:
    max_concurrency: 5
    timeout_per_page: 900  # seconds
    retry_attempts: 3
    backoff_factor: 2  # Exponential backoff multiplier

  master_spec:
    timeout: 600  # 10 minutes for master spec

  page_spec:
    skip_existing: true  # Skip pages that already have specs
```

**3. Environment Variables** (runtime override):
```bash
export FIS_MAX_CONCURRENCY=10
export FIS_TIMEOUT_PER_PAGE=1200
export FIS_RETRY_ATTEMPTS=5
```

**4. Command-Line Arguments** (one-off override):
```bash
./run-modular-fis-standalone.py app_dir --max-concurrency 8 --timeout 600
```

**Priority Order** (highest to lowest):
1. Command-line arguments
2. Environment variables
3. Config file
4. Code defaults

### Configuration Loading

```python
class FISConfig:
    """Configuration loader with multi-layered override."""

    @staticmethod
    def load_config() -> Dict:
        """Load configuration from all sources."""

        # 1. Start with code defaults
        config = {
            'max_concurrency': 5,
            'timeout_per_page': 900,
            'retry_attempts': 3,
            'backoff_factor': 2,
            'skip_existing': True
        }

        # 2. Override with config file (if exists)
        config_file = Path('config/fis_generation.yaml')
        if config_file.exists():
            import yaml
            file_config = yaml.safe_load(config_file.read_text())
            fis_config = file_config.get('fis', {}).get('parallelization', {})
            config.update(fis_config)

        # 3. Override with environment variables
        if 'FIS_MAX_CONCURRENCY' in os.environ:
            config['max_concurrency'] = int(os.environ['FIS_MAX_CONCURRENCY'])
        if 'FIS_TIMEOUT_PER_PAGE' in os.environ:
            config['timeout_per_page'] = int(os.environ['FIS_TIMEOUT_PER_PAGE'])
        if 'FIS_RETRY_ATTEMPTS' in os.environ:
            config['retry_attempts'] = int(os.environ['FIS_RETRY_ATTEMPTS'])

        return config
```

---

## Error Handling Strategy

### Error Categories

**1. Transient Errors** (retry):
- Network timeouts
- Rate limit errors (429)
- Temporary API unavailability

**2. Permanent Errors** (don't retry):
- Validation errors
- Invalid spec format
- Missing prerequisites (plan.md not found)

**3. Critical Errors** (fail-fast):
- Master spec generation failure
- Invalid app directory
- Missing required files

### Error Handling Logic

```python
async def _generate_page_with_retry(self, page, shared_context):
    """Smart retry with error categorization."""

    for attempt in range(1, self.retry_attempts + 1):
        try:
            result = await self._generate_single_page(page, shared_context)

            if result['success']:
                return result

            # Check error type
            error = result.get('error', '')

            # Permanent errors - don't retry
            if 'validation' in error.lower() or 'invalid format' in error.lower():
                logger.error(f"❌ {page['name']}: Permanent error, not retrying")
                return result

            # Transient errors - retry with backoff
            if attempt < self.retry_attempts:
                wait_time = self.backoff_factor ** attempt
                logger.warning(f"⚠️  {page['name']}: Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)

        except RateLimitError as e:
            # Special handling for rate limits
            wait_time = 60  # Wait 1 minute for rate limit
            logger.warning(f"⏸️  Rate limit hit, waiting {wait_time}s...")
            await asyncio.sleep(wait_time)

        except Exception as e:
            if attempt < self.retry_attempts:
                logger.warning(f"⚠️  {page['name']}: Error {e}, retrying...")
                await asyncio.sleep(self.backoff_factor ** attempt)

    return {'page': page['name'], 'success': False, 'error': 'Max retries exceeded'}
```

### Failure Mode: Continue vs. Fail-Fast

**Recommendation**: **Continue-on-Error** for page specs

**Rationale**:
- Page specs are independent
- Partial success is valuable (35/40 pages is better than 0/40)
- User can retry failed pages separately
- Failures don't block pipeline (can continue to build stage)

**Implementation**:
```python
# asyncio.gather with return_exceptions=True
results = await asyncio.gather(*tasks, return_exceptions=True)

# Process all results, collect failures
summary = self._process_results(pages, results)

# Log failures but don't raise exception
if summary['failed'] > 0:
    logger.warning(f"⚠️  {summary['failed']} pages failed:")
    for failure in failed:
        logger.warning(f"   - {failure['page']}: {failure['error']}")
    logger.warning(f"   You can retry failed pages with:")
    logger.warning(f"   ./retry-fis-pages.py {app_dir} {','.join(f['page'] for f in failed)}")

# Return results even with partial failure
return {'summary': summary, ...}
```

---

## Safety Mechanisms

### 1. Concurrency Limits

**Problem**: Too many concurrent agents exhaust resources (memory, API rate limits)

**Solution**: Semaphore-based concurrency control
```python
semaphore = asyncio.Semaphore(max_concurrency)

async def _generate_single_page_with_control(self, page, context):
    async with self.semaphore:
        # Only N pages generate at once
        return await self._generate_page_with_retry(page, context)
```

**Configuration**:
- Default: 5 concurrent pages
- Max recommended: 10 concurrent pages
- Adjustable based on hardware (memory) and API limits

### 2. Timeouts

**Per-Page Timeout**:
```python
result = await asyncio.wait_for(
    agent.generate_page_spec(...),
    timeout=self.timeout_per_page
)
```

**Total Timeout** (optional):
```python
async def generate_all_specs(self, total_timeout=7200):  # 2 hours
    try:
        return await asyncio.wait_for(
            self._generate_all_pages_internal(),
            timeout=total_timeout
        )
    except asyncio.TimeoutError:
        return {'error': f'Total generation timeout after {total_timeout}s'}
```

### 3. File System Safety

**Atomic Writes**:
```python
async def _write_spec_safely(self, spec_path: Path, content: str):
    """Write spec file atomically to prevent partial writes."""

    temp_path = spec_path.with_suffix('.tmp')

    # Write to temp file
    temp_path.write_text(content)

    # Atomic rename (OS-level guarantee)
    temp_path.rename(spec_path)
```

**Directory Creation Race Conditions**:
```python
pages_dir = self.app_dir / "specs" / "pages"
pages_dir.mkdir(parents=True, exist_ok=True)  # exist_ok prevents race
```

### 4. Resource Cleanup

```python
class ParallelFISOrchestrator:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        # Cleanup resources (agents, connections, etc.)
        await self._cleanup()

    async def _cleanup(self):
        """Cleanup any resources used during generation."""
        # Close agent connections, clear caches, etc.
        pass
```

### 5. State Tracking

**Track Generation State**:
```python
class GenerationState:
    """Persistent state for resumable generation."""

    def __init__(self, app_dir: Path):
        self.state_file = app_dir / "specs" / ".generation_state.json"

    def save_state(self, completed: List[str], failed: List[str]):
        """Save generation state for resume capability."""
        state = {
            'timestamp': time.time(),
            'completed': completed,
            'failed': failed
        }
        self.state_file.write_text(json.dumps(state, indent=2))

    def load_state(self) -> Dict:
        """Load previous generation state."""
        if self.state_file.exists():
            return json.loads(self.state_file.read_text())
        return {'completed': [], 'failed': []}

    def get_remaining_pages(self, all_pages: List[str]) -> List[str]:
        """Get list of pages that haven't been generated yet."""
        state = self.load_state()
        completed = set(state['completed'])
        return [p for p in all_pages if p not in completed]
```

**Resume Capability**:
```python
async def generate_all_specs(self, resume=True):
    """Generate specs with optional resume from previous run."""

    if resume:
        state = GenerationState(self.app_dir)
        remaining_pages = state.get_remaining_pages(all_pages)

        if remaining_pages:
            logger.info(f"📝 Resuming generation for {len(remaining_pages)} remaining pages")
            pages_to_generate = remaining_pages
        else:
            pages_to_generate = all_pages
    else:
        pages_to_generate = all_pages

    # Generate only remaining pages
    results = await self._generate_pages_parallel(pages_to_generate)

    # Update state
    state.save_state(completed=[...], failed=[...])
```

---

## Integration Points

### Modified Script: run-modular-fis-standalone.py

**Before** (lines 126-264): Sequential generation

**After**: Use orchestrator
```python
async def generate_modular_fis(app_dir: Path, config: Dict):
    """Generate modular FIS with parallel page spec generation."""

    # Create orchestrator
    orchestrator = ParallelFISOrchestrator(
        app_dir=app_dir,
        max_concurrency=config.get('max_concurrency', 5),
        timeout_per_page=config.get('timeout_per_page', 900),
        retry_attempts=config.get('retry_attempts', 3)
    )

    # Run orchestrated generation
    results = await orchestrator.generate_all_specs()

    # Process results
    if results.get('error'):
        logger.error(f"❌ Generation failed: {results['error']}")
        return False

    master_result = results['master']
    pages_result = results['pages']

    # Display summary
    summary = pages_result['summary']
    logger.info(f"✅ Master Spec: Generated")
    logger.info(f"📊 Page Specs: {summary['succeeded']}/{summary['total']} successful")
    logger.info(f"   Success Rate: {summary['success_rate']}")

    # Show failures
    if pages_result['failed']:
        logger.warning(f"⚠️  Failed pages:")
        for failure in pages_result['failed']:
            logger.warning(f"   - {failure['page']}: {failure['error']}")

    return summary['succeeded'] == summary['total']
```

### Command-Line Interface

**Enhanced Arguments**:
```python
parser.add_argument(
    'app_dir',
    type=Path,
    help='Path to app directory'
)
parser.add_argument(
    '--max-concurrency',
    type=int,
    default=None,  # Use config/code default
    help='Maximum concurrent page generations (default: 5)'
)
parser.add_argument(
    '--timeout',
    type=int,
    default=None,
    help='Timeout per page in seconds (default: 900)'
)
parser.add_argument(
    '--retry-attempts',
    type=int,
    default=None,
    help='Number of retry attempts per page (default: 3)'
)
parser.add_argument(
    '--no-parallel',
    action='store_true',
    help='Disable parallelization (sequential generation)'
)
parser.add_argument(
    '--resume',
    action='store_true',
    help='Resume from previous partial generation'
)
```

### Usage Examples

**Default (parallel with config defaults)**:
```bash
./run-modular-fis-standalone.py apps/my-app/app
```

**Custom concurrency**:
```bash
./run-modular-fis-standalone.py apps/my-app/app --max-concurrency 10
```

**Sequential mode (for debugging)**:
```bash
./run-modular-fis-standalone.py apps/my-app/app --no-parallel
```

**Resume failed generation**:
```bash
./run-modular-fis-standalone.py apps/my-app/app --resume
```

**Full customization**:
```bash
./run-modular-fis-standalone.py apps/my-app/app \
  --max-concurrency 8 \
  --timeout 1200 \
  --retry-attempts 5
```

---

## Files to Create/Modify

### New Files

**1. `src/app_factory_leonardo_replit/orchestrators/parallel_fis_generator.py`**
- `ParallelFISOrchestrator` class
- `ProgressTracker` class
- `GenerationState` class
- Parallel generation logic
- Error handling and retry logic
- ~400-500 lines

**2. `config/fis_generation.yaml`** (optional)
- Default configuration
- ~20 lines

**3. `src/app_factory_leonardo_replit/utils/fis_config.py`** (optional)
- `FISConfig` class for config loading
- Multi-layered config resolution
- ~100 lines

### Modified Files

**1. `run-modular-fis-standalone.py`**
- Import `ParallelFISOrchestrator`
- Replace sequential loop (lines 198-240) with orchestrator call
- Add command-line arguments for parallelization config
- ~50 line change

**2. `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/agent.py`** (if needed)
- Ensure thread-safe operation
- Ensure no shared mutable state between instances
- Likely no changes needed (already separate instances)

### No Changes Needed

- ✅ `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_master/agent.py` (sequential generation fine)
- ✅ `src/app_factory_leonardo_replit/agents/frontend_interaction_spec_page/system_prompt.py` (already correct)
- ✅ `run-parallel-frontend.py` (different stage, no conflicts)

---

## Testing Strategy

### Unit Tests

**File**: `tests/test_parallel_fis_generator.py`

**Test Cases**:
```python
# Test 1: Orchestrator initialization
def test_orchestrator_init():
    orchestrator = ParallelFISOrchestrator(
        app_dir=Path("/tmp/test"),
        max_concurrency=3
    )
    assert orchestrator.max_concurrency == 3
    assert orchestrator.semaphore._value == 3

# Test 2: Shared context preparation
@pytest.mark.asyncio
async def test_prepare_shared_context(tmp_path):
    # Setup mock master spec and API registry
    # Call _prepare_shared_context()
    # Assert context has correct keys

# Test 3: Progress tracking
@pytest.mark.asyncio
async def test_progress_tracker():
    tracker = ProgressTracker(total=5)
    await tracker.mark_started("Page1")
    await tracker.mark_completed("Page1")
    summary = tracker.summary()
    assert summary['completed'] == 1
    assert summary['total'] == 5

# Test 4: Results processing
def test_process_results():
    pages = [{'name': 'Page1'}, {'name': 'Page2'}]
    results = [
        {'success': True, 'page': 'Page1'},
        {'success': False, 'page': 'Page2', 'error': 'Test error'}
    ]
    processed = orchestrator._process_results(pages, results)
    assert processed['summary']['succeeded'] == 1
    assert processed['summary']['failed'] == 1

# Test 5: Retry logic
@pytest.mark.asyncio
async def test_retry_logic_with_transient_error(mock_agent):
    # Mock agent fails twice, succeeds third time
    # Verify retry happens and succeeds

# Test 6: Timeout handling
@pytest.mark.asyncio
async def test_timeout_handling(mock_slow_agent):
    # Mock agent that hangs
    # Verify timeout exception caught and handled
```

### Integration Tests

**File**: `tests/integration/test_fis_parallel_generation.py`

**Test Cases**:
```python
# Test 1: Small app (5 pages)
@pytest.mark.asyncio
async def test_generate_small_app(tmp_path):
    # Create mock app with 5 pages
    # Run orchestrator
    # Verify all 5 specs generated
    # Verify no errors

# Test 2: Medium app (20 pages) with concurrency=5
@pytest.mark.asyncio
async def test_generate_medium_app_concurrent(tmp_path):
    # Create mock app with 20 pages
    # Run with max_concurrency=5
    # Verify all 20 specs generated
    # Measure time (should be ~4x faster than sequential)

# Test 3: Partial failure (2 out of 10 fail)
@pytest.mark.asyncio
async def test_partial_failure_handling(tmp_path, mock_failing_agent):
    # Mock agent fails for pages 3 and 7
    # Run orchestrator
    # Verify 8 succeeded, 2 failed
    # Verify failed pages reported correctly

# Test 4: Resume capability
@pytest.mark.asyncio
async def test_resume_from_partial_generation(tmp_path):
    # Run orchestrator, stop after 5/10 pages
    # Save state
    # Run orchestrator again with resume=True
    # Verify only remaining 5 pages generated

# Test 5: Master spec failure
@pytest.mark.asyncio
async def test_master_spec_failure_stops_pipeline(tmp_path):
    # Mock master spec agent to fail
    # Run orchestrator
    # Verify page specs not generated
    # Verify error reported
```

### Performance Tests

**File**: `tests/performance/test_fis_parallelization.py`

**Test Cases**:
```python
# Test 1: Measure speedup
@pytest.mark.benchmark
def test_parallelization_speedup(benchmark_app_40_pages):
    # Sequential baseline
    sequential_time = run_sequential_generation()

    # Parallel with concurrency=5
    parallel_5_time = run_parallel_generation(max_concurrency=5)

    # Verify speedup
    assert parallel_5_time < sequential_time / 3  # At least 3x faster

# Test 2: Measure concurrency scaling
@pytest.mark.benchmark
def test_concurrency_scaling():
    times = {}
    for concurrency in [1, 3, 5, 10]:
        times[concurrency] = run_parallel_generation(max_concurrency=concurrency)

    # Verify diminishing returns (not linear)
    # e.g., concurrency=10 shouldn't be 10x faster than concurrency=1
    # (due to agent overhead, API limits, etc.)

# Test 3: Memory usage under concurrent load
@pytest.mark.benchmark
def test_memory_usage():
    # Monitor memory during generation
    memory_before = get_memory_usage()
    run_parallel_generation(max_concurrency=10)
    memory_after = get_memory_usage()

    # Verify memory doesn't grow unbounded
    assert memory_after - memory_before < THRESHOLD
```

---

## Rollout Plan

### Phase 1: Core Implementation (Week 1)
- [ ] Create `parallel_fis_generator.py` with orchestrator
- [ ] Implement semaphore-based concurrency control
- [ ] Implement basic retry logic
- [ ] Implement progress tracking
- [ ] Write unit tests

### Phase 2: Integration (Week 1-2)
- [ ] Modify `run-modular-fis-standalone.py` to use orchestrator
- [ ] Add command-line arguments
- [ ] Test with small app (5 pages)
- [ ] Test with medium app (20 pages)

### Phase 3: Configuration & Polish (Week 2)
- [ ] Create `fis_generation.yaml` config file
- [ ] Implement config loading with multi-layer override
- [ ] Add resume capability with state tracking
- [ ] Write integration tests

### Phase 4: Testing & Validation (Week 2-3)
- [ ] Run on existing apps (timeless-weddings: 16 pages)
- [ ] Run on large test app (40+ pages)
- [ ] Performance benchmarking
- [ ] Error handling validation (network failures, timeouts)

### Phase 5: Documentation & Release (Week 3)
- [ ] Update CLAUDE.md with parallelization info
- [ ] Create user guide for configuration
- [ ] Create troubleshooting guide
- [ ] Release to production

---

## Expected Benefits

### Performance Improvements

**Scenario 1: Small App (10 pages)**
- Sequential: 10 pages × 12 min = 120 minutes (2 hours)
- Parallel (concurrency=5): 10 pages / 5 × 12 min = 24 minutes
- **Speedup: 5x faster**

**Scenario 2: Medium App (25 pages)**
- Sequential: 25 pages × 12 min = 300 minutes (5 hours)
- Parallel (concurrency=5): 25 pages / 5 × 12 min = 60 minutes (1 hour)
- **Speedup: 5x faster**

**Scenario 3: Large App (50 pages)**
- Sequential: 50 pages × 12 min = 600 minutes (10 hours)
- Parallel (concurrency=5): 50 pages / 5 × 12 min = 120 minutes (2 hours)
- **Speedup: 5x faster**

**Note**: Actual speedup depends on:
- Agent overhead (creating agents, loading context)
- API rate limits (may throttle concurrent requests)
- Hardware resources (CPU, memory, network)
- Realistic speedup: 3-4x (not perfect 5x due to overhead)

### Reliability Improvements

**Before** (sequential):
- ❌ One page fails at position 38/40 → Lose 7.5 hours of work
- ❌ Network hiccup at page 15 → Restart from beginning
- ❌ No progress visibility during long runs

**After** (parallel):
- ✅ One page fails → Other 39 continue, only retry 1 page
- ✅ Transient errors → Automatic retry with exponential backoff
- ✅ Real-time progress → See which pages are generating
- ✅ Resume capability → Continue from where we left off

### Scalability Improvements

**Handles Large Apps**:
- 100+ pages feasible (parallel with concurrency=10: ~24 hours → ~3 hours)
- Each page independent (no bottlenecks)
- Resource usage controlled (semaphore limits)

**Configurable for Different Environments**:
- Local dev: concurrency=3 (conserve laptop resources)
- CI/CD: concurrency=10 (maximize throughput)
- Production: concurrency=5 (balance speed and reliability)

---

## Risk Assessment & Mitigation

### Risk 1: API Rate Limits

**Risk**: Concurrent requests hit Anthropic API rate limits

**Mitigation**:
- Default concurrency=5 (conservative)
- Exponential backoff on rate limit errors
- Configurable concurrency (can lower if needed)
- Retry logic specifically handles rate limit responses

### Risk 2: Memory Exhaustion

**Risk**: 10 concurrent agents consume too much memory

**Mitigation**:
- Semaphore limits concurrent agents
- Each agent cleaned up after completion
- Monitor memory usage during tests
- Recommended concurrency based on available RAM

### Risk 3: File System Race Conditions

**Risk**: Concurrent writes to same directory cause corruption

**Mitigation**:
- Each page writes to separate file (no contention)
- Atomic file writes (temp file + rename)
- `exist_ok=True` for directory creation

### Risk 4: Partial Failures

**Risk**: Some pages succeed, some fail → inconsistent state

**Mitigation**:
- Continue-on-error strategy (collect all failures)
- Clear failure summary at end
- Resume capability to retry only failed pages
- State tracking for resumable generation

### Risk 5: Debugging Difficulty

**Risk**: Parallel execution makes debugging harder

**Mitigation**:
- `--no-parallel` flag for sequential debugging
- Detailed logging per page (with page name prefix)
- Progress tracking shows which page is being generated
- Separate log file per page (optional feature)

---

## Success Metrics

### Performance Metrics
- [ ] 10-page app generates in < 30 minutes (target: 24 min)
- [ ] 25-page app generates in < 75 minutes (target: 60 min)
- [ ] 50-page app generates in < 150 minutes (target: 120 min)

### Reliability Metrics
- [ ] 95% of pages succeed on first attempt
- [ ] 99% of pages succeed after retries
- [ ] Partial failures don't block pipeline

### User Experience Metrics
- [ ] Real-time progress visibility
- [ ] Clear error messages for failures
- [ ] Resume capability works correctly
- [ ] Configuration easy to understand and modify

---

## Conclusion

This plan provides a comprehensive approach to parallel FIS page spec generation based on proven patterns from the build stage parallelization. The implementation:

✅ **Reuses proven patterns** from `ParallelFrontendGenerator`
✅ **Configurable concurrency** (default 5, up to 10-15)
✅ **Robust error handling** (retry logic, continue-on-error, state tracking)
✅ **Safe** (semaphore control, timeouts, atomic writes)
✅ **Backwards compatible** (optional `--no-parallel` flag)
✅ **Well-tested** (unit, integration, performance tests)

**Estimated development time**: 2-3 weeks (including testing and documentation)

**Expected performance improvement**: 3-5x faster for large apps

**Risk level**: Low (following proven patterns, comprehensive safety mechanisms)

**Next steps**: Get approval on this plan, then begin Phase 1 implementation.
