#!/usr/bin/env python3
"""Test that cc_agent logs go to both console and file."""

import logging
from pathlib import Path
from cc_agent.logging import setup_logging

# Setup logging like run-app-generator.py does
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Setup root logger for console
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(message)s')
console_handler.setFormatter(console_formatter)
root_logger.addHandler(console_handler)

# Setup file logging for both namespaces
setup_logging("app_generator", log_dir=log_dir)
setup_logging("cc_agent", log_dir=log_dir, console_level="INFO", file_level="DEBUG")

# Test logging from different namespaces
app_logger = logging.getLogger("app_generator")
agent_logger = logging.getLogger("cc_agent.AppGeneratorAgent")

print("\n" + "=" * 80)
print("Testing Logging Configuration")
print("=" * 80)

app_logger.info("✅ This is an app_generator log message")
agent_logger.info("🔧 [AppGeneratorAgent] Turn 1/10 - Using tool: Task")
agent_logger.info("🤖 Delegating to research_agent...")
agent_logger.debug("📝 DEBUG: This should only appear in file, not console")

print("\n" + "=" * 80)
print("Log File Locations:")
print("=" * 80)
print(f"App logs:   logs/app_generator_{Path('logs').glob('app_generator_*.log').__next__().name.split('_', 2)[2]}")
print(f"Agent logs: logs/cc_agent_{Path('logs').glob('cc_agent_*.log').__next__().name.split('_', 2)[2]}")
print("\nCheck these files - you should see:")
print("  - app_generator log in app_generator_*.log")
print("  - Agent execution logs in cc_agent_*.log")
print("  - All INFO logs in console")
print("  - DEBUG logs only in files")
print("=" * 80)
