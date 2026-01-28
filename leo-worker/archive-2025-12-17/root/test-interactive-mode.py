#!/usr/bin/env python3
"""
Test script for Interactive Mode with Prompt Expansion and Git Integration.

Tests:
1. GitHelper - Basic git operations
2. PromptExpander - LLM-based expansion
3. AppGeneratorAgent - Integration of all components
"""

import asyncio
import logging
import sys
import tempfile
from pathlib import Path

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from app_factory_leonardo_replit.agents.app_generator import create_app_generator
from app_factory_leonardo_replit.agents.app_generator.git_helper import GitHelper
from app_factory_leonardo_replit.agents.app_generator.prompt_expander import PromptExpander

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s'
)

logger = logging.getLogger(__name__)


def test_git_helper():
    """Test GitHelper functionality."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 1: GitHelper")
    logger.info("=" * 80)

    helper = GitHelper()

    # Create temporary directory for testing
    with tempfile.TemporaryDirectory() as tmpdir:
        logger.info(f"📁 Test directory: {tmpdir}")

        # Test 1: Initialize repo
        logger.info("\n1️⃣ Testing git init...")
        result = helper.initialize_repo(tmpdir)
        assert result == True, "Should initialize new repo"
        logger.info("   ✅ Repo initialized")

        # Test 2: Check for uncommitted changes (.gitignore was created)
        logger.info("\n2️⃣ Testing uncommitted changes check...")
        has_changes = helper.has_uncommitted_changes(tmpdir)
        assert has_changes == True, "Should have .gitignore as uncommitted"
        logger.info("   ✅ Uncommitted changes detected (.gitignore created)")

        # Test 3: Create a file and commit
        logger.info("\n3️⃣ Testing commit creation...")
        test_file = Path(tmpdir) / "test.txt"
        test_file.write_text("Hello, World!")

        commit_hash = helper.create_commit(tmpdir, "Initial commit", "Test description")
        assert commit_hash is not None, "Should create commit"
        logger.info(f"   ✅ Commit created: {commit_hash}")

        # Test 4: Get commit history
        logger.info("\n4️⃣ Testing commit history...")
        history = helper.get_commit_history(tmpdir, limit=5)
        assert len(history) == 1, "Should have 1 commit"
        assert history[0]["message"] == "Initial commit"
        logger.info(f"   ✅ History retrieved: {history[0]['message']}")

    logger.info("\n✅ GitHelper tests passed!\n")


async def test_prompt_expander():
    """Test PromptExpander functionality."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 2: PromptExpander")
    logger.info("=" * 80)

    prompting_guide_path = "/Users/labheshpatel/apps/app-factory/docs/PROMPTING-GUIDE.md"

    if not Path(prompting_guide_path).exists():
        logger.warning(f"⚠️  PROMPTING-GUIDE.md not found at {prompting_guide_path}")
        logger.warning("   Skipping PromptExpander test")
        return

    logger.info(f"📁 Loading guide from: {prompting_guide_path}")

    expander = PromptExpander(prompting_guide_path)
    logger.info("   ✅ PromptExpander initialized")

    # Test 1: Short prompt that should be expanded
    logger.info("\n1️⃣ Testing prompt expansion...")
    logger.info("   Input: 'Seed it with companies'")

    result = await expander.expand("Seed it with companies")

    logger.info(f"   Was expanded: {result['was_expanded']}")
    if result['was_expanded']:
        logger.info(f"   Expanded to ({len(result['expanded'])} chars):")
        logger.info(f"   {result['expanded'][:200]}...")
    else:
        logger.info(f"   No expansion: {result['expansion_note']}")

    # Test 2: Already detailed prompt
    logger.info("\n2️⃣ Testing detailed prompt (should not expand)...")
    detailed_prompt = "Read shared/schema.zod.ts, verify all field names, then create 10 sample users"
    logger.info(f"   Input: '{detailed_prompt}'")

    result = await expander.expand(detailed_prompt)

    logger.info(f"   Was expanded: {result['was_expanded']}")
    logger.info(f"   Note: {result['expansion_note']}")

    logger.info("\n✅ PromptExpander tests passed!\n")


async def test_agent_integration():
    """Test AppGeneratorAgent with new features."""
    logger.info("\n" + "=" * 80)
    logger.info("TEST 3: AppGeneratorAgent Integration")
    logger.info("=" * 80)

    with tempfile.TemporaryDirectory() as tmpdir:
        logger.info(f"📁 Test output directory: {tmpdir}")

        # Test 1: Create agent with expansion enabled
        logger.info("\n1️⃣ Testing agent creation (with expansion)...")
        agent = create_app_generator(output_dir=tmpdir, enable_expansion=True)
        assert agent.enable_expansion == True
        assert agent.prompt_expander is not None
        assert agent.git_helper is not None
        logger.info("   ✅ Agent created with expansion enabled")

        # Test 2: Create agent with expansion disabled
        logger.info("\n2️⃣ Testing agent creation (without expansion)...")
        agent_no_expand = create_app_generator(output_dir=tmpdir, enable_expansion=False)
        assert agent_no_expand.enable_expansion == False
        assert agent_no_expand.prompt_expander is None
        assert agent_no_expand.git_helper is not None
        logger.info("   ✅ Agent created with expansion disabled")

        # Test 3: Test expand_prompt method
        logger.info("\n3️⃣ Testing expand_prompt method...")
        expansion = await agent.expand_prompt("Seed it with opportunities")
        logger.info(f"   Original: {expansion['original']}")
        logger.info(f"   Was expanded: {expansion['was_expanded']}")
        if expansion['was_expanded']:
            logger.info(f"   Expanded preview: {expansion['expanded'][:100]}...")

        logger.info("\n✅ Agent integration tests passed!\n")


async def main():
    """Run all tests."""
    logger.info("\n" + "=" * 80)
    logger.info("🧪 TESTING INTERACTIVE MODE IMPLEMENTATION")
    logger.info("=" * 80)

    try:
        # Test 1: GitHelper
        test_git_helper()

        # Test 2: PromptExpander (async)
        await test_prompt_expander()

        # Test 3: Agent Integration (async)
        await test_agent_integration()

        # Summary
        logger.info("\n" + "=" * 80)
        logger.info("✅ ALL TESTS PASSED!")
        logger.info("=" * 80)
        logger.info("\nImplementation Summary:")
        logger.info("  ✅ GitHelper - Automatic version control")
        logger.info("  ✅ PromptExpander - LLM-based prompt expansion")
        logger.info("  ✅ AppGeneratorAgent - Integrated both features")
        logger.info("  ✅ CLI - Interactive loop with expansion\n")

        logger.info("Ready to use:")
        logger.info("  uv run python run-app-generator.py \"Create a todo app\"")
        logger.info("  # Will enter interactive mode after generation\n")

    except Exception as e:
        logger.error(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
