# Logging Configuration Attempt - 2025-09-25

## Goal
Configure the Leonardo App Factory logging to use:
- **Console**: INFO level (clean user output)
- **File**: DEBUG level (detailed logs for debugging)

## Issue Identified
The Leonardo App Factory uses `cc_agent.logging.setup_logging()` which already supports separate console/file log levels, but wasn't being used correctly.

## Changes Made (To Be Reverted)

### 1. main.py (src/app_factory_leonardo_replit/main.py)

**Line 28-29 (Original):**
```python
# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
```

**Changed to:**
```python
# Logger will be configured later with setup_logging
logger = logging.getLogger(__name__)
```

**Line 283-286 (Original):**
```python
# Initialize logging
log_dir = Path(__file__).parent.parent.parent / "logs"
setup_logging("app_factory", log_dir=log_dir)
```

**Changed to:**
```python
# Initialize logging with INFO for console, DEBUG for file
log_dir = Path(__file__).parent.parent.parent / "logs"
global logger
logger = setup_logging("app_factory", log_dir=log_dir, console_level="INFO", file_level="DEBUG")
```

### 2. run.py (src/app_factory_leonardo_replit/run.py)

**Line 94-97 (Original):**
```python
# Initialize logging
log_dir = Path(__file__).parent.parent.parent / "logs"
setup_logging("leonardo_app_factory", log_dir=log_dir)
```

**Changed to:**
```python
# Initialize logging with INFO for console, DEBUG for file
log_dir = Path(__file__).parent.parent.parent / "logs"
global logger
logger = setup_logging("leonardo_app_factory", log_dir=log_dir, console_level="INFO", file_level="DEBUG")
```

## Root Cause Analysis

The logging wasn't working because of a logger name mismatch:

1. **Module-level logger**: Used `logging.getLogger(__name__)` which creates loggers named:
   - "app_factory_leonardo_replit.main"
   - "app_factory_leonardo_replit.run"

2. **setup_logging()**: Was configuring different logger names:
   - "app_factory"
   - "leonardo_app_factory"

3. **Timing issue**: The module-level `logger` variable was created at import time before `setup_logging()` was called, so it had no handlers configured.

## Correct Solution (For Future)

Option 1: Use consistent logger names
```python
# At module level
logger = logging.getLogger("app_factory")  # Use same name as in setup_logging

# In main()
setup_logging("app_factory", log_dir=log_dir, console_level="INFO", file_level="DEBUG")
```

Option 2: Configure root logger and propagate
```python
# Configure root logger to affect all loggers
root_logger = logging.getLogger()
setup_logging("", log_dir=log_dir, console_level="INFO", file_level="DEBUG")  # Empty string for root
```

Option 3: Use the logger returned by setup_logging
```python
# Don't create logger at module level
# In main()
logger = setup_logging("app_factory", log_dir=log_dir, console_level="INFO", file_level="DEBUG")
# Pass logger to functions that need it
```

## Files to Revert

1. `/home/jake/LEAPFROG/MICHAELANGELO/app-factory/src/app_factory_leonardo_replit/main.py`
2. `/home/jake/LEAPFROG/MICHAELANGELO/app-factory/src/app_factory_leonardo_replit/run.py`

## Next Steps

1. Revert the changes to restore original functionality
2. Later, implement a proper solution that:
   - Ensures logger names match between module-level and setup_logging
   - Configures logging before any logger.info() calls
   - Possibly refactors to pass logger instances rather than using global logger