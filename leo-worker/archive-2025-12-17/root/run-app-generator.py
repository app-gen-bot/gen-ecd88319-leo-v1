#!/usr/bin/env python3
"""
App Generator - Prompt to URL

Generate complete full-stack applications from natural language prompts.

Usage:
    uv run python run-app-generator.py "Create a todo app" --app-name todo-app
    uv run python run-app-generator.py --prompt-file prompt.txt --app-name todo-app
    uv run python run-app-generator.py --resume /path/to/app "Add dark mode"
    uv run python run-app-generator.py --resume /path/to/app --prompt-file changes.txt

Examples:
    # Generate a new app (--app-name required)
    uv run python run-app-generator.py "Create a marketplace for advisory boards" --app-name marketplace

    # Generate from a file (avoids command-line escaping issues)
    uv run python run-app-generator.py --prompt-file my-app-spec.txt --app-name marketplace

    # Generate with custom output directory
    uv run python run-app-generator.py "Todo app with AI" --app-name ai-todos --output-dir ~/projects

    # Resume/modify existing app (--app-name not needed)
    uv run python run-app-generator.py --resume apps/my-app/app "Fix the login page"

    # Resume with prompt from file
    uv run python run-app-generator.py --resume apps/my-app/app --prompt-file modifications.txt

    # Resume with specific session for context continuity
    uv run python run-app-generator.py --resume apps/my-app/app --resume-session abc123 "Add user profiles"
"""

import argparse
import asyncio
import logging
import sys
import os
import tempfile
import subprocess
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import re

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator import create_app_generator
from app_factory_leonardo_replit.agents.reprompter import (
    create_reprompter,
    DEFAULT_MODE,
    DEFAULT_MAX_ITERATIONS
)
from cc_agent.logging import setup_logging

logger = logging.getLogger(__name__)


def extract_autonomous_suffix(text: str) -> Tuple[str, Optional[int]]:
    """
    Extract /autonomous N suffix from any input.

    Examples:
        "add: Fix login /autonomous 15" -> ("add: Fix login", 15)
        "y /autonomous" -> ("y", 5)  # Default 5
        "just a prompt" -> ("just a prompt", None)

    Returns:
        (cleaned_text, iterations) - iterations is None if no suffix found
    """
    match = re.search(r'\s*/autonomous\s*(\d*)\s*$', text, re.IGNORECASE)
    if match:
        cleaned = text[:match.start()].strip()
        num_str = match.group(1)
        iterations = int(num_str) if num_str else 5  # Default: 5
        return (cleaned, iterations)
    return (text, None)


def get_editor_input(prompt: str = "Enter your input") -> Optional[str]:
    """
    Open user's editor for multi-line input.

    Args:
        prompt: Description of what the user should enter

    Returns:
        String content from editor, or None if cancelled/empty
    """
    # Get user's preferred editor (fallback to nano)
    editor = os.environ.get('EDITOR', 'nano')

    # Create temp file with helpful header
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tf:
        tf.write(f"# {prompt}\n")
        tf.write("# Write your input below, save and close to continue\n")
        tf.write("# (Lines starting with # will be ignored)\n\n")
        temp_path = tf.name

    try:
        # Open editor
        logger.info(f"📝 Opening {editor} for multi-line input...")
        subprocess.run([editor, temp_path])

        # Read content (skip comment lines)
        with open(temp_path, 'r') as f:
            lines = [line for line in f.readlines() if not line.strip().startswith('#')]
            content = ''.join(lines).strip()

        return content if content else None
    except Exception as e:
        logger.error(f"Error opening editor: {e}")
        return None
    finally:
        # Cleanup temp file
        try:
            os.unlink(temp_path)
        except:
            pass


def check_guidance_file(app_path: str) -> Optional[List[Dict[str, str]]]:
    """
    Parse guidance file with support for multiple commands.

    Format supports multiple command blocks in one file:
        add
        Fix the login button styling
        Make sure to test on mobile

        strategic
        Focus on user experience over performance

    Returns:
        List of {'command': str, 'guidance': str} dicts, or None if empty
    """
    VALID_COMMANDS = ['override', 'redirect', 'add', 'strategic']
    guidance_file = Path(app_path) / ".reprompter_guidance.txt"

    try:
        content = guidance_file.read_text().strip()

        # Empty file - no guidance
        if not content:
            return None

        lines = content.split('\n')
        blocks = []
        current_command = None
        current_lines = []

        for line in lines:
            stripped = line.strip()

            # Skip comments and empty lines when looking for commands
            if stripped.startswith('#'):
                continue

            # Check if this line is a command keyword (on its own line)
            if stripped.lower() in VALID_COMMANDS:
                # Save previous block if exists
                if current_command and current_lines:
                    guidance_text = '\n'.join(current_lines).strip()
                    if guidance_text:
                        blocks.append({
                            'command': current_command,
                            'guidance': guidance_text
                        })
                # Start new block
                current_command = stripped.lower()
                current_lines = []
            elif current_command:
                # Add line to current block (preserve empty lines within guidance)
                current_lines.append(line)

        # Save final block
        if current_command and current_lines:
            guidance_text = '\n'.join(current_lines).strip()
            if guidance_text:
                blocks.append({
                    'command': current_command,
                    'guidance': guidance_text
                })

        if not blocks:
            return None

        return blocks

    except Exception as e:
        logger.error(f"❌ Error reading guidance file: {e}")
        return None
    finally:
        # Clear file with updated template showing multi-command format
        try:
            if guidance_file.exists():
                guidance_file.write_text(
                    "# Autonomous mode guidance file\n"
                    "# You can use MULTIPLE commands in one file!\n"
                    "#\n"
                    "# Commands (each on its own line, followed by guidance text):\n"
                    "#   override  - Use your text as exact prompt (skip reprompter)\n"
                    "#   redirect  - Reprompter regenerates with your guidance\n"
                    "#   add       - Append to reprompter's suggestion (this iteration)\n"
                    "#   strategic - Persistent guidance (all remaining iterations)\n"
                    "#\n"
                    "# Example with multiple commands:\n"
                    "#\n"
                    "# add\n"
                    "# Also fix the mobile navigation\n"
                    "#\n"
                    "# strategic\n"
                    "# Focus on accessibility\n"
                    "#\n"
                )
        except Exception as e:
            logger.warning(f"Could not clear guidance file: {e}")


async def interactive_loop(agent, app_path: str, mode: str = "interactive", max_iterations: int = None):
    """
    Interactive loop for continuing work on a generated app with session support.

    Supports three modes:
    - interactive: User provides prompts manually (classic mode)
    - confirm_first: Reprompter suggests next task, user confirms
    - autonomous: Reprompter runs continuously until max iterations

    Args:
        agent: The AppGeneratorAgent instance
        app_path: Path to the generated app
        mode: Operation mode (interactive/confirm_first/autonomous)
        max_iterations: Maximum iterations for autonomous mode
    """
    # Load app-specific session
    session = agent.load_session(app_path)
    if session:
        agent.current_session_id = session.get("session_id")
        agent.current_app_path = app_path
        if session.get("context"):
            agent.generation_context = session["context"]

    # Initialize reprompter if needed
    reprompter = None
    if mode in ["autonomous", "confirm_first"]:
        reprompter = create_reprompter(app_path)
        logger.info(f"🤖 Reprompter initialized in {mode} mode")

        # Set max iterations
        if max_iterations is None:
            max_iterations = DEFAULT_MAX_ITERATIONS
        logger.info(f"🔄 Max iterations: {max_iterations}")

        # Create guidance file (always present)
        guidance_file = Path(app_path) / ".reprompter_guidance.txt"
        if not guidance_file.exists():
            try:
                guidance_file.write_text(
                    "# Autonomous mode guidance file\n"
                    "# You can use MULTIPLE commands in one file!\n"
                    "#\n"
                    "# Commands (each on its own line, followed by guidance text):\n"
                    "#   override  - Use your text as exact prompt (skip reprompter)\n"
                    "#   redirect  - Reprompter regenerates with your guidance\n"
                    "#   add       - Append to reprompter's suggestion (this iteration)\n"
                    "#   strategic - Persistent guidance (all remaining iterations)\n"
                    "#\n"
                    "# Example with multiple commands:\n"
                    "#\n"
                    "# add\n"
                    "# Also fix the mobile navigation\n"
                    "#\n"
                    "# strategic\n"
                    "# Focus on accessibility\n"
                    "#\n"
                )
                logger.info(f"📋 Created guidance file: {guidance_file}")
            except Exception as e:
                logger.warning(f"Could not create guidance file: {e}")

    iteration = 0
    strategic_context = None  # Storage for persistent strategic guidance
    switch_to_autonomous_after = None  # Iterations to run after current task (if set)

    while True:
        print("\n" + "=" * 80)
        print("✅ Task completed!")
        print("=" * 80)

        # Show session context if available
        context = agent.get_session_context()
        if context and context.get("session_id"):
            print(f"\n📂 Session: {context['session_id'][:8] if context['session_id'] else 'New'}")
            print(f"📁 App: {app_path}")
            if context.get("context") and context["context"].get("features"):
                print(f"📋 Features: {', '.join(context['context']['features'][:3])}")

        # Reprompter modes
        if mode in ["autonomous", "confirm_first"]:
            # Check iteration limit (only for autonomous mode)
            if mode == "autonomous" and iteration >= max_iterations:
                logger.info(f"\n✅ Autonomous iterations complete ({max_iterations})")
                logger.info("🤝 Returning to confirm-first mode...")
                mode = "confirm_first"
                iteration = 0
                max_iterations = None  # No limit in confirm mode
                strategic_context = None  # Clear strategic context
                continue  # Continue loop in confirm mode

            iteration += 1
            # Show iteration counter only for autonomous mode
            if mode == "autonomous":
                logger.info(f"\n🔄 Iteration {iteration}/{max_iterations}")
            else:
                logger.info(f"\n🔄 Task {iteration}")

            # Get next prompt from reprompter
            try:
                logger.info("🤖 Reprompter analyzing current state...")
                next_prompt = await reprompter.get_next_prompt()

                logger.info("\n" + "=" * 80)
                logger.info("📝 Reprompter suggests:")
                logger.info("=" * 80)
                logger.info(f"\n{next_prompt}\n")

                # Check for guidance file (autonomous mode only)
                if mode == "autonomous":
                    guidance_blocks = check_guidance_file(app_path)

                    if guidance_blocks:
                        logger.info(f"\n📋 Found {len(guidance_blocks)} guidance block(s) in .reprompter_guidance.txt")
                        for block in guidance_blocks:
                            logger.info(f"   • {block['command']}: {block['guidance'][:60]}...")

                        # Check for override first (takes precedence over everything)
                        override_block = next((b for b in guidance_blocks if b['command'] == 'override'), None)
                        if override_block:
                            logger.info("🎯 Override found - using as exact prompt (other commands ignored)")
                            next_prompt = override_block['guidance']
                        else:
                            # Process redirect (regenerates base prompt)
                            redirect_block = next((b for b in guidance_blocks if b['command'] == 'redirect'), None)
                            if redirect_block:
                                logger.info("🔄 Redirect: Reprompter regenerating with guidance...")
                                next_prompt = await reprompter.get_next_prompt(
                                    strategic_guidance=redirect_block['guidance'],
                                    original_prompt=next_prompt
                                )

                            # Process add (appends to current prompt)
                            add_block = next((b for b in guidance_blocks if b['command'] == 'add'), None)
                            if add_block:
                                logger.info("➕ Add: Appending to prompt")
                                next_prompt = next_prompt + f"\n\nIMPORTANT: {add_block['guidance']}"

                            # Process strategic (stores for all iterations)
                            strategic_block = next((b for b in guidance_blocks if b['command'] == 'strategic'), None)
                            if strategic_block:
                                strategic_context = strategic_block['guidance']
                                logger.info("🎯 Strategic: Stored for all remaining iterations")

                        # Show updated prompt
                        logger.info("\n" + "=" * 80)
                        logger.info("📝 Updated prompt with your guidance:")
                        logger.info("=" * 80)
                        logger.info(f"\n{next_prompt}\n")

                # If strategic guidance is active, apply it to reprompter's output
                if strategic_context and mode == "autonomous":
                    logger.info(f"🎯 Applying strategic context: {strategic_context[:80]}...")
                    next_prompt = next_prompt + f"\n\nSTRATEGIC CONTEXT (applies to all work): {strategic_context}"

                # Confirm-first mode: ask user (with redirect support)
                if mode == "confirm_first":
                    redirect_count = 0  # Track redirects for logging

                    # Allow unlimited redirects until user accepts or provides custom prompt
                    while True:
                        try:
                            user_choice = input("\n✅ Proceed? (y/yes/add/redirect/custom/done or /autonomous <N>): ").strip()
                        except (EOFError, KeyboardInterrupt):
                            print("\n👋 Goodbye!")
                            break

                        # Extract /autonomous suffix if present (works with any input type)
                        user_choice, switch_to_autonomous_after = extract_autonomous_suffix(user_choice)
                        if switch_to_autonomous_after:
                            logger.info(f"🤖 Will switch to autonomous ({switch_to_autonomous_after} iterations) after this task")

                        if user_choice.lower() in ['done', 'exit', 'quit']:
                            print("\n👋 Goodbye!")
                            break
                        elif user_choice.lower() in ['y', 'yes', '']:
                            # Use reprompter's suggestion as-is
                            user_input = next_prompt
                            break
                        elif user_choice.lower() == 'redirect':
                            # Two-step redirect mode: prompt for strategic guidance
                            try:
                                guidance_input = input("\n🎯 What strategic direction should I take? (or type 'edit'): ").strip()
                                if guidance_input.lower() == 'edit':
                                    strategic_guidance = get_editor_input("Strategic guidance for reprompter")
                                else:
                                    strategic_guidance = guidance_input

                                if strategic_guidance:
                                    redirect_count += 1
                                    logger.info(f"\n🔄 Redirect #{redirect_count}: {strategic_guidance}\n")
                                    logger.info("🤖 Reprompter regenerating with strategic guidance...")

                                    # Re-run reprompter with strategic guidance and original prompt for context
                                    next_prompt = await reprompter.get_next_prompt(
                                        strategic_guidance=strategic_guidance,
                                        original_prompt=next_prompt  # Pass current suggestion for smart merging
                                    )

                                    logger.info("\n" + "=" * 80)
                                    logger.info("📝 New suggestion based on your guidance:")
                                    logger.info("=" * 80)
                                    logger.info(f"\n{next_prompt}\n")
                                    # Loop back to show new prompt
                                    continue
                                else:
                                    # No guidance provided, use current prompt
                                    user_input = next_prompt
                                    break
                            except (EOFError, KeyboardInterrupt):
                                # User cancelled, use current prompt
                                user_input = next_prompt
                                break
                        elif user_choice.lower().startswith('redirect:'):
                            # Inline redirect mode: extract strategic guidance after prefix
                            strategic_guidance = user_choice[9:].strip()
                            if strategic_guidance:
                                redirect_count += 1
                                logger.info(f"\n🔄 Redirect #{redirect_count}: {strategic_guidance}\n")
                                logger.info("🤖 Reprompter regenerating with strategic guidance...")

                                # Re-run reprompter with strategic guidance and original prompt for context
                                next_prompt = await reprompter.get_next_prompt(
                                    strategic_guidance=strategic_guidance,
                                    original_prompt=next_prompt  # Pass current suggestion for smart merging
                                )

                                logger.info("\n" + "=" * 80)
                                logger.info("📝 New suggestion based on your guidance:")
                                logger.info("=" * 80)
                                logger.info(f"\n{next_prompt}\n")
                                # Loop back to show new prompt
                                continue
                            else:
                                # No guidance provided, use current prompt
                                user_input = next_prompt
                                break
                        elif user_choice.lower() == 'add':
                            # Two-step add mode: prompt for additional instructions
                            try:
                                add_input = input("\n➕ What should I add to this prompt? (or type 'edit'): ").strip()
                                if add_input.lower() == 'edit':
                                    additional = get_editor_input("Additional instructions to add")
                                else:
                                    additional = add_input

                                if additional:
                                    user_input = next_prompt + f"\n\nIMPORTANT: {additional}"
                                    logger.info(f"\n📝 Added to prompt: {additional}\n")
                                else:
                                    user_input = next_prompt
                                break
                            except (EOFError, KeyboardInterrupt):
                                # User cancelled, use original prompt
                                user_input = next_prompt
                                break
                        elif user_choice.lower().startswith('add:') or user_choice.lower().startswith('append:'):
                            # Inline add mode: extract text after prefix
                            prefix_len = 4 if user_choice.lower().startswith('add:') else 7
                            additional = user_choice[prefix_len:].strip()
                            if additional:
                                user_input = next_prompt + f"\n\nIMPORTANT: {additional}"
                                logger.info(f"\n📝 Added to prompt: {additional}\n")
                            else:
                                user_input = next_prompt
                            break
                        elif user_choice.lower().startswith('/autonomous'):
                            # Switch to autonomous mode from confirm-first
                            parts = user_choice.split()
                            if len(parts) > 1:
                                try:
                                    num_iterations = int(parts[1])
                                    logger.info(f"\n🤖 Switching to autonomous mode for {num_iterations} iterations...")
                                    mode = "autonomous"
                                    iteration = 0
                                    max_iterations = num_iterations
                                    strategic_context = None
                                    logger.info(f"✅ Switched to autonomous mode ({max_iterations} iterations)")
                                    logger.info(f"   Type /confirm to return to confirm mode early")
                                    # Set user_input to continue outer loop
                                    user_input = None  # Signal to skip execution and continue loop
                                    break
                                except ValueError:
                                    logger.error("❌ Invalid number. Usage: /autonomous 5")
                                    continue
                            else:
                                logger.error("❌ Usage: /autonomous <N>  (e.g., /autonomous 5)")
                                continue
                        else:
                            # User provided complete custom prompt
                            if user_choice.lower() == 'edit':
                                user_input = get_editor_input("Enter your custom prompt")
                                if not user_input:
                                    logger.warning("No input provided, using reprompter's suggestion")
                                    user_input = next_prompt
                            else:
                                user_input = user_choice
                            break

                    # If user chose 'done/exit/quit' in the inner loop, exit outer loop too
                    if user_choice.lower() in ['done', 'exit', 'quit']:
                        break

                    # If mode was switched (user_input is None), skip execution and continue loop
                    if user_input is None:
                        continue
                else:
                    # Autonomous mode: just use the prompt
                    user_input = next_prompt

            except Exception as e:
                logger.error(f"❌ Reprompter error: {e}")
                import traceback
                traceback.print_exc()

                # Fallback: ask user
                try:
                    fallback_input = input("\n💬 What should I work on instead? (or type 'edit'): ").strip()
                    if fallback_input.lower() == 'edit':
                        user_input = get_editor_input("What should I work on?")
                        if not user_input:
                            print("\n👋 No input provided. Goodbye!")
                            break
                    else:
                        user_input = fallback_input
                except (EOFError, KeyboardInterrupt):
                    print("\n👋 Goodbye!")
                    break
        else:
            # Interactive mode: ask user for input
            try:
                interactive_input = input("\n💬 What else can I help you with? (or 'done' to exit, 'edit' for multi-line): ").strip()
                if interactive_input.lower() == 'edit':
                    user_input = get_editor_input("What else can I help you with?")
                    if not user_input:
                        print("\n👋 No input provided. Goodbye!")
                        break
                else:
                    user_input = interactive_input
            except (EOFError, KeyboardInterrupt):
                print("\n\n👋 Goodbye!")
                break

        # Check for special commands (all modes)
        if user_input.lower() in ['done', 'exit', 'quit', '']:
            print("\n👋 Goodbye!")
            break

        # Switch to autonomous mode
        if user_input.lower().startswith('/autonomous'):
            parts = user_input.split()
            if len(parts) > 1:
                try:
                    num_iterations = int(parts[1])
                    logger.info(f"\n🤖 Switching to autonomous mode for {num_iterations} iterations...")
                    mode = "autonomous"
                    iteration = 0  # Reset iteration counter for clean start
                    max_iterations = num_iterations  # Use specified iterations
                    strategic_context = None  # Clear strategic context

                    # Initialize reprompter if not already done
                    if not reprompter:
                        reprompter = create_reprompter(app_path)
                        logger.info(f"🤖 Reprompter initialized")

                        # Create guidance file (always present)
                        guidance_file = Path(app_path) / ".reprompter_guidance.txt"
                        if not guidance_file.exists():
                            try:
                                guidance_file.write_text(
                                    "# Autonomous mode guidance file\n"
                                    "# You can use MULTIPLE commands in one file!\n"
                                    "#\n"
                                    "# Commands (each on its own line, followed by guidance text):\n"
                                    "#   override  - Use your text as exact prompt (skip reprompter)\n"
                                    "#   redirect  - Reprompter regenerates with your guidance\n"
                                    "#   add       - Append to reprompter's suggestion (this iteration)\n"
                                    "#   strategic - Persistent guidance (all remaining iterations)\n"
                                    "#\n"
                                    "# Example with multiple commands:\n"
                                    "#\n"
                                    "# add\n"
                                    "# Also fix the mobile navigation\n"
                                    "#\n"
                                    "# strategic\n"
                                    "# Focus on accessibility\n"
                                    "#\n"
                                )
                                logger.info(f"📋 Created guidance file: {guidance_file}")
                            except Exception as e:
                                logger.warning(f"Could not create guidance file: {e}")

                    logger.info(f"✅ Switched to autonomous mode ({max_iterations} iterations)")
                    guidance_path = Path(app_path) / ".reprompter_guidance.txt"
                    logger.info(f"   Edit {guidance_path} to provide guidance")
                    logger.info(f"   Type /confirm to return to confirm mode early")
                    continue  # Skip to next iteration in autonomous mode
                except ValueError:
                    logger.error("❌ Invalid number of iterations. Usage: /autonomous 10")
                    continue
            else:
                logger.error("❌ Usage: /autonomous <iterations>  (e.g., /autonomous 10)")
                continue

        # Switch to confirm-first mode
        if user_input.lower() == '/confirm':
            logger.info(f"\n🤝 Switching to confirm-first mode...")
            mode = "confirm_first"
            iteration = 0  # Reset iteration counter
            max_iterations = None  # No limit in confirm mode
            strategic_context = None  # Clear strategic guidance

            # Initialize reprompter if not already done (preserve if exists)
            if not reprompter:
                reprompter = create_reprompter(app_path)
                logger.info("🤖 Reprompter initialized")

            logger.info("✅ Switched to confirm-first mode (iteration counter reset)")
            logger.info("   🤖 Reprompter will suggest tasks, you approve each one")
            logger.info("   Type /autonomous <N> to run N tasks automatically")
            continue

        # Context management commands
        if user_input.lower() == '/context':
            context = agent.get_session_context()
            print("\n📋 Current Context:")
            print(f"   Session ID: {context.get('session_id', 'None')}")
            print(f"   App Path: {context.get('app_path', 'None')}")
            if context.get('context'):
                print(f"   Features: {', '.join(context['context'].get('features', []))}")
                print(f"   Last Action: {context['context'].get('last_action', 'None')}")
            continue

        if user_input.lower() == '/clear':
            agent.clear_session(app_path)
            print(f"🧹 Session cleared for {app_path}")
            continue

        if user_input.lower() == '/save':
            agent.save_session(app_path)
            print(f"💾 Session saved for {app_path}")
            continue

        print(f"\n🔄 Working on: {user_input}\n")

        # Execute the task
        task_success = False
        try:
            # resume_generation now automatically handles sessions
            app_path, expansion = await agent.resume_generation(
                app_path,
                user_input
            )

            # Save session after each interaction
            agent.save_session(app_path)

            # Show what was done
            logger.info("\n" + "=" * 80)
            logger.info("✅ Modification complete! (Session preserved)")
            logger.info("=" * 80)

            if expansion["was_expanded"]:
                logger.info("\n📋 Note: Your input was expanded following best practices")
                logger.info(f"   {expansion['expansion_note']}")

            task_success = True

            # Switch to autonomous mode if requested via /autonomous suffix
            if switch_to_autonomous_after is not None:
                logger.info(f"\n🤖 Switching to autonomous mode for {switch_to_autonomous_after} iterations...")
                mode = "autonomous"
                iteration = 0
                max_iterations = switch_to_autonomous_after
                switch_to_autonomous_after = None  # Reset flag

                # Initialize reprompter if not already done
                if not reprompter:
                    reprompter = create_reprompter(app_path)
                    logger.info("🤖 Reprompter initialized")

                logger.info(f"✅ Now in autonomous mode ({max_iterations} iterations)")

        except KeyboardInterrupt:
            logger.warning("\n\n⚠️  Task interrupted by user")
            if mode == "autonomous":
                # In autonomous mode, interruption exits the loop
                break
            continue
        except Exception as e:
            logger.error(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()
            task_success = False

            if mode == "autonomous":
                # In autonomous mode, critical errors exit the loop
                logger.error("🛑 Autonomous mode stopping due to error")
                break
            continue
        finally:
            # Record task for loop detection (if reprompter is active)
            if reprompter:
                reprompter.record_task(user_input, task_success)


async def main():
    parser = argparse.ArgumentParser(
        description="Generate complete full-stack applications from natural language prompts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate new app (--app-name required)
  %(prog)s "Create a project management tool" --app-name project-mgmt

  # Generate from a file (avoids newline/escaping issues)
  %(prog)s --prompt-file my-spec.txt --app-name project-mgmt

  # Generate with custom output directory
  %(prog)s "Task tracker" --app-name my-tasks --output-dir ~/projects

  # Resume existing app (--app-name not needed)
  %(prog)s --resume apps/my-app/app "Add user profiles"

  # Resume with prompt from file
  %(prog)s --resume apps/my-app/app --prompt-file changes.txt

  # Resume with specific session for context continuity
  %(prog)s --resume apps/my-app/app --resume-session abc123 "Continue adding features"

Prompt Files:
  - Use --prompt-file to read prompts from a file
  - Avoids command-line escaping issues with newlines, quotes, etc.
  - File should contain plain text (UTF-8 encoded)
  - Whitespace is preserved (except leading/trailing)

Session Management:
  - Interactive mode automatically preserves session context
  - Use /context to view current session information
  - Use /save to explicitly save the session
  - Use --resume-session to continue a specific session

The agent will:
  1. Create a complete plan (Stage 1)
  2. Generate backend (schema, auth, storage, routes)
  3. Generate frontend (API client, pages, components)
  4. Validate and test the application
  5. Use browser automation to verify it works

Output: ~/apps/app-factory/apps/[app-name]/app
        """
    )

    parser.add_argument(
        "prompt",
        nargs="?",
        help="Natural language description of the app to build (or use --prompt-file)"
    )

    parser.add_argument(
        "--prompt-file",
        metavar="FILE",
        help="Read prompt from a file instead of command line (avoids newline/escaping issues)"
    )

    parser.add_argument(
        "--app-name",
        help="Name for the app directory (REQUIRED for new apps, not needed for --resume)"
    )

    parser.add_argument(
        "--output-dir",
        help="Custom output directory (default: ~/apps/app-factory/apps/)"
    )

    parser.add_argument(
        "--resume",
        metavar="APP_PATH",
        help="Resume/modify an existing app at the specified path"
    )

    parser.add_argument(
        "--interactive",
        action="store_true",
        default=True,
        help="Enable interactive mode after generation (default: True)"
    )

    parser.add_argument(
        "--no-interactive",
        action="store_true",
        help="Disable interactive mode"
    )

    parser.add_argument(
        "--no-expand",
        action="store_true",
        help="Disable prompt expansion"
    )

    parser.add_argument(
        "--disable-subagents",
        action="store_true",
        help="Disable specialized subagents (enabled by default)"
    )

    parser.add_argument(
        "--resume-session",
        metavar="SESSION_ID",
        help="Resume a specific session (use with --resume for context continuity)"
    )

    parser.add_argument(
        "--reprompter-mode",
        choices=["interactive", "confirm_first", "autonomous"],
        default=DEFAULT_MODE,
        help="Reprompter mode: interactive (user-driven), confirm_first (suggest+confirm), autonomous (fully automatic)"
    )

    parser.add_argument(
        "--max-iterations",
        type=int,
        default=None,
        help=f"Maximum iterations for reprompter (default: {DEFAULT_MAX_ITERATIONS})"
    )

    args = parser.parse_args()

    # Handle interactive mode flags
    interactive_mode = args.interactive and not args.no_interactive
    enable_expansion = not args.no_expand
    enable_subagents = not args.disable_subagents  # Enabled by default

    # Initialize logging (to both console and file)
    log_dir = Path(__file__).parent / "logs"
    log_dir.mkdir(exist_ok=True)

    # Configure root logger for console output
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter('%(message)s')  # Simple format for console
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File logging via setup_logging (adds file handler)
    setup_logging("app_generator", log_dir=log_dir)

    # Also setup file logging for cc_agent namespace (for Agent execution logs)
    # This ensures Turn X/Y, tool usage, and subagent delegation logs go to file
    setup_logging("cc_agent", log_dir=log_dir, console_level="INFO", file_level="DEBUG")

    # Prevent double console output - don't propagate to root logger
    logging.getLogger("app_generator").propagate = False
    logging.getLogger("cc_agent").propagate = False

    # Enable full conversation logging for ALL agents (including subagents)
    os.environ["ENABLE_CONVERSATION_LOGGING"] = "true"
    os.environ["AGENT_LOG_DIR"] = str(log_dir.absolute())

    # Test that logging is working
    logger.info("🚀 App Generator starting up...")
    logger.info(f"📁 Log directory: {log_dir}")
    logger.info(f"📝 Full conversation logging: ENABLED")
    logger.info(f"   Conversations will be logged to: {log_dir}/conversations/")

    # Handle prompt from file or command line
    prompt_text = None
    if args.prompt_file:
        # Read prompt from file
        prompt_file_path = Path(args.prompt_file)
        if not prompt_file_path.exists():
            parser.error(f"Prompt file not found: {args.prompt_file}")
        try:
            prompt_text = prompt_file_path.read_text(encoding='utf-8').strip()
            if not prompt_text:
                parser.error(f"Prompt file is empty: {args.prompt_file}")
            logger.info(f"📄 Prompt loaded from file: {args.prompt_file} ({len(prompt_text)} chars)")
        except Exception as e:
            parser.error(f"Failed to read prompt file: {e}")

        # Warn if both prompt and prompt-file are provided
        if args.prompt:
            logger.warning("⚠️  Both prompt and --prompt-file provided. Using file content.")
    elif args.prompt:
        prompt_text = args.prompt
    else:
        # Neither prompt nor prompt-file provided
        pass  # Will be validated below

    # Validation
    if args.resume:
        if not prompt_text:
            parser.error("--resume requires a prompt (provide via argument or --prompt-file)")
        resume_mode = True
        app_path = args.resume
        instructions = prompt_text
        session_id = args.resume_session  # Optional session ID for context continuity
    else:
        if not prompt_text:
            parser.error("prompt is required (provide via argument or --prompt-file)")
        if not args.app_name:
            parser.error("--app-name is required for new app generation")
        if args.resume_session:
            parser.error("--resume-session requires --resume to specify the app path")
        resume_mode = False
        user_prompt = prompt_text
        session_id = None

    # Print banner
    logger.info("\n" + "=" * 80)
    logger.info("🤖 AI APP GENERATOR - Prompt to URL")
    logger.info("=" * 80)

    if resume_mode:
        logger.info(f"📂 Mode: RESUME")
        logger.info(f"📁 App Path: {app_path}")
        logger.info(f"📝 Instructions: {instructions}")
    else:
        logger.info(f"📂 Mode: NEW APP")
        logger.info(f"📝 Prompt: {user_prompt}")
        if args.app_name:
            logger.info(f"📁 App Name: {args.app_name}")
        if args.output_dir:
            logger.info(f"📁 Output Dir: {args.output_dir}")

    logger.info("=" * 80 + "\n")

    try:
        # Create the agent with expansion and subagent settings
        agent = create_app_generator(
            output_dir=args.output_dir,
            enable_expansion=enable_expansion,
            enable_subagents=enable_subagents
        )

        # Log subagent status
        if enable_subagents:
            logger.info("🤖 Subagents: ENABLED (default)")
        else:
            logger.info("🤖 Subagents: DISABLED (via --disable-subagents)")

        # Generate or resume (async)
        if resume_mode:
            # Always use resume_generation which now automatically handles sessions
            if session_id:
                # User provided specific session ID to override
                logger.info(f"📂 Resuming with specific session: {session_id[:8]}...")
                result_path, expansion = await agent.resume_with_session(
                    app_path,
                    instructions,
                    session_id=session_id
                )
            else:
                # Let resume_generation automatically find and use the app's session
                logger.info("🔍 Checking for existing app session...")
                result_path, expansion = await agent.resume_generation(app_path, instructions)
        else:
            result_path, expansion = await agent.generate_app(user_prompt, app_name=args.app_name)

        # Success message
        logger.info("\n" + "=" * 80)
        logger.info("✅ SUCCESS!")
        logger.info("=" * 80)
        logger.info(f"\n📁 App Location: {result_path}\n")
        logger.info("🚀 Next Steps:")
        logger.info(f"   1. cd {result_path}")
        logger.info(f"   2. npm install")
        logger.info(f"   3. npm run dev")
        logger.info(f"   4. Open http://localhost:5000\n")

        # Show expansion info if applicable
        if expansion["was_expanded"]:
            logger.info("📋 Note: Your prompt was expanded following best practices")
            logger.info(f"   {expansion['expansion_note']}\n")

        # Enter interactive mode if enabled (for both new and resume)
        if interactive_mode:
            # For resume mode, result_path is the app_path from the resume operation
            path_to_use = result_path if not resume_mode else app_path
            await interactive_loop(
                agent,
                path_to_use,
                mode=args.reprompter_mode,
                max_iterations=args.max_iterations
            )

    except FileNotFoundError as e:
        logger.error(f"\n❌ ERROR: {e}")
        logger.error("\nPlease ensure pipeline-prompt.md exists at:")
        logger.error("  ~/apps/app-factory/docs/pipeline-prompt.md")
        sys.exit(1)

    except KeyboardInterrupt:
        logger.warning("\n\n⚠️  Generation interrupted by user")
        sys.exit(130)

    except Exception as e:
        logger.error(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
