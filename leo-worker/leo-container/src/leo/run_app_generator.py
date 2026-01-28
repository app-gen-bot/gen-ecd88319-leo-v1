#!/usr/bin/env python3
"""App Generator - Simple Runner using new architecture.

This script uses the new AppGeneratorAgent instead of the legacy stages pipeline.

Usage:
    uv run python src/leo/run_app_generator.py "Create a todo app"
    uv run python src/leo/run_app_generator.py "Create a todo app" --app-name todo-app
"""

import argparse
import asyncio
import logging
from pathlib import Path

from leo.agents.app_generator import AppGeneratorAgent
from cc_agent.logging import setup_logging

logger = logging.getLogger(__name__)


async def main():
    """Main entry point for app generator."""
    parser = argparse.ArgumentParser(description="App Generator - New Architecture")

    parser.add_argument(
        "prompt",
        nargs="?",
        default="Create a todo app with authentication",
        help="User prompt describing the app to create"
    )

    parser.add_argument(
        "--app-name",
        type=str,
        required=True,
        help="Name for the app directory (required)"
    )

    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Output directory for apps (default: ~/apps/app-factory/apps/)"
    )

    parser.add_argument(
        "--no-expansion",
        action="store_true",
        help="Disable prompt expansion"
    )

    parser.add_argument(
        "--no-subagents",
        action="store_true",
        help="Disable specialized subagents"
    )

    parser.add_argument(
        "--resume",
        type=str,
        help="Resume existing app at this path with additional instructions"
    )

    args = parser.parse_args()

    # Initialize logging
    log_dir = Path(__file__).parent.parent.parent / "logs"
    setup_logging("app_generator", log_dir=log_dir)

    logger.info("\n" + "="*80)
    logger.info("🤖 App Generator (New Architecture)")
    logger.info("="*80)

    # Create agent
    agent = AppGeneratorAgent(
        output_dir=args.output_dir,
        enable_expansion=not args.no_expansion,
        enable_subagents=not args.no_subagents
    )

    try:
        if args.resume:
            # Resume existing app
            logger.info(f"\n📝 Resuming app at: {args.resume}")
            logger.info(f"📄 Instructions: {args.prompt}\n")

            app_path, expansion = await agent.resume_generation(
                app_path=args.resume,
                additional_instructions=args.prompt
            )

            logger.info("\n" + "="*80)
            logger.info("✅ APP MODIFICATION COMPLETE")
            logger.info("="*80)
            logger.info(f"📁 App: {app_path}")

            if expansion["was_expanded"]:
                logger.info(f"\n📋 Expanded Instructions:")
                logger.info(expansion["expansion_note"])
        else:
            # Generate new app
            logger.info(f"\n📝 Prompt: {args.prompt}")
            logger.info(f"📁 App Name: {args.app_name}\n")

            app_path, expansion = await agent.generate_app(
                user_prompt=args.prompt,
                app_name=args.app_name
            )

            logger.info("\n" + "="*80)
            logger.info("✅ APP GENERATION COMPLETE")
            logger.info("="*80)
            logger.info(f"📁 App: {app_path}")

            if expansion["was_expanded"]:
                logger.info(f"\n📋 Expanded Prompt:")
                logger.info(expansion["expansion_note"])

        # Next steps
        logger.info(f"\n🚀 Next steps:")
        logger.info(f"   cd {app_path}")
        logger.info(f"   npm install")
        logger.info(f"   npm run dev")

        return 0

    except Exception as e:
        logger.error(f"\n❌ Error: {e}")
        logger.exception("Full traceback:")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
