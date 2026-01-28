"""Development configuration with generous limits to prevent silent failures.

These limits are set very high (500) to ensure the pipeline never fails due to
iteration/turn limits during development. Since you're actively monitoring the
pipeline, there's no danger in having these high limits.

For production, these should be optimized based on actual usage patterns.
"""

# Development mode limits - set to 500 for no-fail development
DEV_MAX_ITERATIONS = 500  # For Writer-Critic loops
DEV_MAX_TURNS = 500       # For individual agents
DEV_MAX_ATTEMPTS = 50     # For retry mechanisms like Loop Exit Agent

# Enable this to use development limits
USE_DEV_LIMITS = True

def get_max_iterations(default: int = 3) -> int:
    """Get max iterations with dev override."""
    return DEV_MAX_ITERATIONS if USE_DEV_LIMITS else default

def get_max_turns(default: int = 30) -> int:
    """Get max turns with dev override."""
    return DEV_MAX_TURNS if USE_DEV_LIMITS else default

def get_max_attempts(default: int = 3) -> int:
    """Get max attempts with dev override."""
    return DEV_MAX_ATTEMPTS if USE_DEV_LIMITS else default