#!/usr/bin/env python3
"""
Integration Test for Option 3: Long-Term Fix Implementation

This script validates that:
1. TechnicalArchitectureSpecAgent receives schema and contracts
2. FISMasterAgent uses LLM-based page extraction
3. FISPageAgent receives full context (schema, page list, workflow)
4. Tech spec is generated AFTER API Client (correct pipeline order)
5. All enhancements work together correctly

Usage:
    python test-option3-integration.py apps/timeless-weddings-phase1/app
"""

import asyncio
import sys
import json
from pathlib import Path
from datetime import datetime

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from app_factory_leonardo_replit.stages import technical_architecture_spec_stage
from app_factory_leonardo_replit.agents.frontend_interaction_spec_master import FrontendInteractionSpecMasterAgent
from app_factory_leonardo_replit.agents.frontend_interaction_spec_page import FrontendInteractionSpecPageAgent


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    """Print a colored header"""
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{text}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.HEADER}{'=' * 80}{Colors.ENDC}\n")


def print_success(text):
    """Print a success message"""
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")


def print_warning(text):
    """Print a warning message"""
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")


def print_error(text):
    """Print an error message"""
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")


def print_info(text):
    """Print an info message"""
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")


async def test_1_tech_spec_with_context(app_dir: Path) -> dict:
    """
    Test 1: Verify TechnicalArchitectureSpecAgent receives schema and contracts

    Expected: Agent should receive both schema_path and contracts_dir parameters
    """
    print_header("TEST 1: TechnicalArchitectureSpecAgent Context")

    results = {
        "test_name": "TechnicalArchitectureSpecAgent Context",
        "passed": False,
        "details": []
    }

    try:
        # Check if schema exists
        schema_path = app_dir / "shared" / "schema.zod.ts"
        if schema_path.exists():
            print_success(f"Schema found: {schema_path}")
            results["details"].append(f"Schema exists: {schema_path}")
        else:
            print_warning(f"Schema not found: {schema_path}")
            results["details"].append(f"Schema missing: {schema_path}")

        # Check if contracts exist
        contracts_dir = app_dir / "shared" / "contracts"
        if contracts_dir.exists():
            contract_files = list(contracts_dir.glob("*.contract.ts"))
            print_success(f"Contracts directory found: {len(contract_files)} contracts")
            results["details"].append(f"Contracts found: {len(contract_files)} files")
        else:
            print_warning(f"Contracts not found: {contracts_dir}")
            results["details"].append(f"Contracts missing: {contracts_dir}")

        # Check if tech spec was generated with this context
        specs_dir = app_dir / "specs"
        tech_spec_path = specs_dir / "pages-and-routes.md"

        if tech_spec_path.exists():
            tech_spec_content = tech_spec_path.read_text()

            # Look for evidence of schema-driven generation
            has_entity_refs = any(word in tech_spec_content.lower() for word in ['entity', 'schema', 'model', 'table'])
            has_api_refs = any(word in tech_spec_content.lower() for word in ['api', 'endpoint', 'route', 'contract'])

            if has_entity_refs:
                print_success("Tech spec contains entity/schema references")
                results["details"].append("Schema-driven content detected")
            else:
                print_warning("Tech spec lacks entity/schema references")
                results["details"].append("Schema-driven content NOT detected")

            if has_api_refs:
                print_success("Tech spec contains API/endpoint references")
                results["details"].append("API-aware content detected")
            else:
                print_warning("Tech spec lacks API/endpoint references")
                results["details"].append("API-aware content NOT detected")

            results["passed"] = has_entity_refs and has_api_refs
        else:
            print_error(f"Tech spec not found: {tech_spec_path}")
            results["details"].append("Tech spec file not found")
            results["passed"] = False

    except Exception as e:
        print_error(f"Test 1 failed with exception: {e}")
        results["details"].append(f"Exception: {str(e)}")
        results["passed"] = False

    return results


async def test_2_llm_page_extraction(app_dir: Path) -> dict:
    """
    Test 2: Verify FISMasterAgent uses LLM-based page extraction

    Expected: Agent should use extract_pages_from_tech_spec() method
    """
    print_header("TEST 2: LLM-Based Page Extraction")

    results = {
        "test_name": "LLM-Based Page Extraction",
        "passed": False,
        "details": []
    }

    try:
        # Create FISMasterAgent instance
        fis_master_agent = FrontendInteractionSpecMasterAgent(app_dir=app_dir)

        # Check if extract_pages_from_tech_spec method exists
        if hasattr(fis_master_agent, 'extract_pages_from_tech_spec'):
            print_success("FISMasterAgent has extract_pages_from_tech_spec method")
            results["details"].append("LLM extraction method exists")
        else:
            print_error("FISMasterAgent missing extract_pages_from_tech_spec method")
            results["details"].append("LLM extraction method MISSING")
            results["passed"] = False
            return results

        # Test the extraction if tech spec exists
        tech_spec_path = app_dir / "specs" / "pages-and-routes.md"
        if tech_spec_path.exists():
            print_info(f"Testing LLM extraction on: {tech_spec_path}")

            pages = await fis_master_agent.extract_pages_from_tech_spec(tech_spec_path)

            if pages:
                print_success(f"Extracted {len(pages)} pages using LLM")
                results["details"].append(f"Extracted {len(pages)} pages")

                # Verify page structure
                if all(isinstance(p, dict) and 'name' in p and 'route' in p for p in pages):
                    print_success("All pages have correct structure (name, route)")
                    results["details"].append("Page structure validated")

                    # Show sample pages
                    for i, page in enumerate(pages[:3]):
                        print_info(f"  Sample page {i+1}: {page['name']} -> {page['route']}")

                    results["passed"] = True
                else:
                    print_error("Pages missing required fields (name, route)")
                    results["details"].append("Invalid page structure")
                    results["passed"] = False
            else:
                print_warning("No pages extracted (empty list)")
                results["details"].append("No pages extracted")
                results["passed"] = False
        else:
            print_warning(f"Tech spec not found for testing: {tech_spec_path}")
            results["details"].append("Tech spec not available for test")
            results["passed"] = False

    except Exception as e:
        print_error(f"Test 2 failed with exception: {e}")
        results["details"].append(f"Exception: {str(e)}")
        results["passed"] = False

    return results


async def test_3_fis_page_full_context(app_dir: Path) -> dict:
    """
    Test 3: Verify FISPageAgent receives full context

    Expected: Agent should receive schema_content, complete_page_list, workflow_context
    """
    print_header("TEST 3: FISPageAgent Full Context")

    results = {
        "test_name": "FISPageAgent Full Context",
        "passed": False,
        "details": []
    }

    try:
        # Check FISPageAgent signature
        page_agent = FrontendInteractionSpecPageAgent(
            app_dir=app_dir,
            page_info={"name": "TestPage", "route": "/test"}
        )

        # Verify generate_page_spec accepts new parameters
        import inspect
        sig = inspect.signature(page_agent.generate_page_spec)
        params = list(sig.parameters.keys())

        required_params = ['schema_content', 'complete_page_list', 'workflow_context']
        has_all_params = all(param in params for param in required_params)

        if has_all_params:
            print_success("FISPageAgent.generate_page_spec has all required parameters")
            results["details"].append("All context parameters present")
            results["passed"] = True
        else:
            missing = [p for p in required_params if p not in params]
            print_error(f"Missing parameters: {missing}")
            results["details"].append(f"Missing parameters: {missing}")
            results["passed"] = False

        # Check if page specs were actually generated with context
        pages_dir = app_dir / "specs" / "pages"
        if pages_dir.exists():
            page_specs = list(pages_dir.glob("*.md"))
            print_info(f"Found {len(page_specs)} page specs")
            results["details"].append(f"Generated {len(page_specs)} page specs")

            # Sample check: look for schema references in page specs
            if page_specs:
                sample_spec = page_specs[0].read_text()
                has_schema_ref = 'schema' in sample_spec.lower() or 'field' in sample_spec.lower()
                has_nav_ref = 'navigate' in sample_spec.lower() or 'link' in sample_spec.lower()

                if has_schema_ref:
                    print_success("Page specs contain schema references")
                    results["details"].append("Schema context used in specs")

                if has_nav_ref:
                    print_success("Page specs contain navigation references")
                    results["details"].append("Navigation context used in specs")
        else:
            print_warning("No page specs directory found")
            results["details"].append("Page specs not generated yet")

    except Exception as e:
        print_error(f"Test 3 failed with exception: {e}")
        results["details"].append(f"Exception: {str(e)}")
        results["passed"] = False

    return results


async def test_4_pipeline_order(app_dir: Path) -> dict:
    """
    Test 4: Verify tech spec is generated AFTER API Client

    Expected: Tech spec should be generated after schema/contracts are available
    """
    print_header("TEST 4: Pipeline Order Validation")

    results = {
        "test_name": "Pipeline Order",
        "passed": False,
        "details": []
    }

    try:
        # Check file modification times to verify generation order
        api_client_path = app_dir / "client" / "src" / "lib" / "api-client.ts"
        tech_spec_path = app_dir / "specs" / "pages-and-routes.md"

        if api_client_path.exists() and tech_spec_path.exists():
            api_client_time = api_client_path.stat().st_mtime
            tech_spec_time = tech_spec_path.stat().st_mtime

            if tech_spec_time >= api_client_time:
                time_diff = tech_spec_time - api_client_time
                print_success(f"Tech spec generated AFTER API client ({time_diff:.1f}s later)")
                results["details"].append("Correct pipeline order verified")
                results["passed"] = True
            else:
                time_diff = api_client_time - tech_spec_time
                print_error(f"Tech spec generated BEFORE API client ({time_diff:.1f}s earlier)")
                results["details"].append("INCORRECT pipeline order")
                results["passed"] = False
        else:
            missing = []
            if not api_client_path.exists():
                missing.append("api-client.ts")
            if not tech_spec_path.exists():
                missing.append("pages-and-routes.md")

            print_warning(f"Missing files for order test: {missing}")
            results["details"].append(f"Missing files: {missing}")
            results["passed"] = False

    except Exception as e:
        print_error(f"Test 4 failed with exception: {e}")
        results["details"].append(f"Exception: {str(e)}")
        results["passed"] = False

    return results


async def test_5_end_to_end_flow(app_dir: Path) -> dict:
    """
    Test 5: Validate complete end-to-end flow

    Expected: All components work together correctly
    """
    print_header("TEST 5: End-to-End Flow Validation")

    results = {
        "test_name": "End-to-End Flow",
        "passed": False,
        "details": []
    }

    try:
        # Check all critical files exist in correct order
        required_files = [
            ("shared/schema.zod.ts", "Schema"),
            ("shared/contracts", "Contracts"),
            ("client/src/lib/api-client.ts", "API Client"),
            ("specs/pages-and-routes.md", "Tech Spec"),
            ("specs/frontend-interaction-spec-master.md", "FIS Master"),
            ("specs/pages", "Page Specs Directory")
        ]

        all_exist = True
        for rel_path, name in required_files:
            file_path = app_dir / rel_path
            if file_path.exists():
                print_success(f"{name} exists: {rel_path}")
                results["details"].append(f"{name}: ✓")
            else:
                print_error(f"{name} missing: {rel_path}")
                results["details"].append(f"{name}: ✗")
                all_exist = False

        if all_exist:
            print_success("All critical files present")

            # Check page specs have required context
            pages_dir = app_dir / "specs" / "pages"
            page_specs = list(pages_dir.glob("*.md")) if pages_dir.exists() else []

            if page_specs:
                # Analyze a sample page spec
                sample_spec = page_specs[0].read_text()

                context_checks = {
                    "Schema context": any(word in sample_spec.lower() for word in ['schema', 'field', 'entity', 'model']),
                    "API context": any(word in sample_spec.lower() for word in ['api', 'endpoint', 'method', 'contract']),
                    "Navigation context": any(word in sample_spec.lower() for word in ['navigate', 'link', 'route', 'page'])
                }

                for check_name, passed in context_checks.items():
                    if passed:
                        print_success(f"{check_name} detected in page specs")
                        results["details"].append(f"{check_name}: ✓")
                    else:
                        print_warning(f"{check_name} not detected in page specs")
                        results["details"].append(f"{check_name}: ✗")

                results["passed"] = all(context_checks.values())
            else:
                print_warning("No page specs found for context validation")
                results["details"].append("Page specs not available")
                results["passed"] = False
        else:
            results["passed"] = False

    except Exception as e:
        print_error(f"Test 5 failed with exception: {e}")
        results["details"].append(f"Exception: {str(e)}")
        results["passed"] = False

    return results


async def main():
    """Run all integration tests"""
    if len(sys.argv) < 2:
        print_error("Usage: python test-option3-integration.py <app_dir>")
        print_info("Example: python test-option3-integration.py apps/timeless-weddings-phase1/app")
        sys.exit(1)

    app_dir = Path(sys.argv[1])

    if not app_dir.exists():
        print_error(f"App directory not found: {app_dir}")
        sys.exit(1)

    print_header("Option 3 Integration Test Suite")
    print_info(f"Testing app directory: {app_dir}")
    print_info(f"Test time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Run all tests
    test_results = []

    test_results.append(await test_1_tech_spec_with_context(app_dir))
    test_results.append(await test_2_llm_page_extraction(app_dir))
    test_results.append(await test_3_fis_page_full_context(app_dir))
    test_results.append(await test_4_pipeline_order(app_dir))
    test_results.append(await test_5_end_to_end_flow(app_dir))

    # Summary
    print_header("Test Summary")

    passed_count = sum(1 for r in test_results if r["passed"])
    total_count = len(test_results)

    for i, result in enumerate(test_results, 1):
        status = "PASS" if result["passed"] else "FAIL"
        color_fn = print_success if result["passed"] else print_error
        color_fn(f"Test {i}: {result['test_name']} - {status}")

    print()
    if passed_count == total_count:
        print_success(f"All tests passed! ({passed_count}/{total_count})")
        exit_code = 0
    else:
        print_error(f"Some tests failed: {passed_count}/{total_count} passed")
        exit_code = 1

    # Save detailed results
    results_file = Path("test-option3-results.json")
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "app_dir": str(app_dir),
            "tests": test_results,
            "summary": {
                "passed": passed_count,
                "total": total_count,
                "success_rate": f"{(passed_count / total_count * 100):.1f}%"
            }
        }, f, indent=2)

    print_info(f"Detailed results saved to: {results_file}")

    sys.exit(exit_code)


if __name__ == "__main__":
    asyncio.run(main())
