"""Retry handler with exponential backoff for API errors."""

import asyncio
import logging
from typing import Any, Callable, TypeVar, Union
from functools import wraps

# Default module logger - can be overridden by passing a logger instance
default_logger = logging.getLogger(__name__)
T = TypeVar('T')


async def retry_with_exponential_backoff(
    func: Callable[..., T],
    *args,
    max_retries: int = 5,
    base_delays: list[float] = None,
    logger: logging.Logger = None,
    **kwargs
) -> T:
    """Execute async function with exponential backoff on API errors.
    
    Args:
        func: Async function to execute
        *args: Positional arguments for func
        max_retries: Maximum number of retry attempts
        base_delays: List of delays in seconds [60, 120, 240, 480, 960]
        logger: Optional logger instance (uses module logger if not provided)
        **kwargs: Keyword arguments for func
        
    Returns:
        Result from func
        
    Raises:
        Exception: If all retries are exhausted
    """
    if base_delays is None:
        base_delays = [60, 120, 240, 480, 960]  # Default exponential backoff
    
    # Use provided logger or fall back to module logger
    if logger is None:
        logger = default_logger
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            # Call the async function
            if asyncio.iscoroutinefunction(func):
                return await func(*args, **kwargs)
            else:
                # Handle sync functions wrapped in async
                return func(*args, **kwargs)
        except Exception as e:
            last_error = e
            error_str = str(e)
            error_type = type(e).__name__
            
            # Check if it's an API overload or timeout error
            is_retryable = any([
                "Overloaded" in error_str,
                "overloaded" in error_str,
                "500" in error_str and "api_error" in error_str,
                "rate_limit" in error_str.lower(),
                "too many requests" in error_str.lower(),
                "timed out" in error_str.lower(),
                "timeout" in error_str.lower(),
                "Request timed out" in error_str
            ])
            
            if is_retryable and attempt < max_retries - 1:
                # Calculate delay - use provided delays or exponential backoff
                delay = base_delays[min(attempt, len(base_delays) - 1)]
                
                logger.warning(
                    f"🔄 Retryable error detected: {error_type}: {error_str[:100]}..."
                )
                logger.info(
                    f"⏱️  Retrying in {delay} seconds (attempt {attempt + 1}/{max_retries})"
                )
                
                # Show countdown for better UX
                for remaining in range(int(delay), 0, -10):
                    if remaining > 10:
                        logger.info(f"   Waiting... {remaining}s remaining")
                        await asyncio.sleep(10)
                    else:
                        await asyncio.sleep(remaining)
                        break
                
                logger.info("🚀 Retrying now...")
                continue
            else:
                # Not an API overload error or max retries reached
                logger.error(f"❌ Error not retryable or max retries reached: {error_type}: {error_str}")
                raise
    
    # All retries exhausted
    logger.error(f"❌ Failed after {max_retries} retry attempts")
    raise last_error if last_error else Exception(f"Failed after {max_retries} retries")


def retry_on_overload(max_retries: int = 5, base_delays: list[float] = None):
    """Decorator to add retry logic to async functions.
    
    Args:
        max_retries: Maximum number of retry attempts
        base_delays: List of delays in seconds
        
    Usage:
        @retry_on_overload(max_retries=3)
        async def my_api_call():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await retry_with_exponential_backoff(
                func, 
                *args, 
                max_retries=max_retries,
                base_delays=base_delays,
                **kwargs
            )
        return wrapper
    return decorator


# Special handling for async generators (like the query function)
async def retry_async_generator(
    async_gen_func: Callable[..., Any],
    *args,
    max_retries: int = 5,
    base_delays: list[float] = None,
    logger: logging.Logger = None,
    **kwargs
):
    """Retry logic for async generator functions.
    
    This is needed for functions that return async generators,
    like the claude_agent_sdk query function.
    
    Args:
        async_gen_func: Async generator function to retry
        *args: Positional arguments for the generator function
        max_retries: Maximum number of retry attempts
        base_delays: List of delays in seconds
        logger: Optional logger instance (uses module logger if not provided)
        **kwargs: Keyword arguments for the generator function
    """
    if base_delays is None:
        base_delays = [60, 120, 240, 480, 960]
    
    # Use provided logger or fall back to module logger
    if logger is None:
        logger = default_logger
    
    last_error = None
    
    for attempt in range(max_retries):
        try:
            # Try to create and iterate the generator
            collected_items = []
            async for item in async_gen_func(*args, **kwargs):
                collected_items.append(item)
                yield item
            return  # Success - generator completed
            
        except Exception as e:
            last_error = e
            error_str = str(e)
            
            # Check if it's an API overload or timeout error
            is_retryable = any([
                "Overloaded" in error_str,
                "overloaded" in error_str,
                "500" in error_str and "api_error" in error_str,
                "rate_limit" in error_str.lower(),
                "too many requests" in error_str.lower(),
                "timed out" in error_str.lower(),
                "timeout" in error_str.lower(),
                "Request timed out" in error_str
            ])
            
            if is_retryable and attempt < max_retries - 1:
                delay = base_delays[min(attempt, len(base_delays) - 1)]
                
                logger.warning(f"🔄 Retryable error during streaming: {error_str[:100]}...")
                logger.info(f"⏱️  Retrying in {delay} seconds (attempt {attempt + 1}/{max_retries})")
                
                # Countdown
                for remaining in range(int(delay), 0, -10):
                    if remaining > 10:
                        logger.info(f"   Waiting... {remaining}s remaining")
                        await asyncio.sleep(10)
                    else:
                        await asyncio.sleep(remaining)
                        break
                
                logger.info("🚀 Retrying stream...")
                continue
            else:
                raise
    
    # All retries exhausted
    logger.error(f"❌ Stream failed after {max_retries} retry attempts")
    raise last_error if last_error else Exception(f"Stream failed after {max_retries} retries")