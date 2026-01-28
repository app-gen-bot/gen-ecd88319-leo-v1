"""WSI logging configuration constants."""

# Log truncation limits (characters)
# Controls how many characters are displayed in various log outputs before truncating with "..."

LOG_TRUNCATE_PROMPT_DEBUG = 5000      # Debug-level prompt logs (e.g., "Received start_generation: ...")
LOG_TRUNCATE_PROMPT_DISPLAY = 5000    # Config display prompt (e.g., "Prompt: ..." in startup output)
LOG_TRUNCATE_PROMPT_REPROMPTER = 5000 # Reprompter suggestion logs
LOG_TRUNCATE_PROMPT_MESSAGE = 5000    # Log message display (e.g., "Next task: ...")
LOG_TRUNCATE_PROMPT_CONFIRM = 5000    # Confirm suggestion logs
LOG_TRUNCATE_PROMPT_EXECUTE = 5000    # Executing task logs (e.g., "Executing: ...")
