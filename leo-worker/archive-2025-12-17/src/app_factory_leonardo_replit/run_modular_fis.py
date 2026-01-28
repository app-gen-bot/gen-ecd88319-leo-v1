"""Test runner for modular Frontend Interaction Specification generation.

NOTE: This is a TEST RUNNER script for development/testing purposes.
The actual FIS agents (frontend_interaction_spec_master and frontend_interaction_spec_page)
are generic and work with any application domain.

This module orchestrates the two-stage FIS generation:
1. Master specification with complete navigation map
2. Individual page specifications generated in parallel
"""

import asyncio
import logging
from pathlib import Path
from typing import List, Dict

from agents.frontend_interaction_spec_master import FrontendInteractionSpecMasterAgent
from agents.frontend_interaction_spec_page import FrontendInteractionSpecPageAgent

logger = logging.getLogger(__name__)


def extract_pages_from_tech_spec(tech_spec_path: Path) -> List[Dict[str, str]]:
    """Extract pages from the technical specification.

    Args:
        tech_spec_path: Path to pages-and-routes.md

    Returns:
        List of page dictionaries with name and route
    """
    pages = []

    try:
        if not tech_spec_path.exists():
            logger.warning(f"Technical spec not found at {tech_spec_path}")
            # Provide default pages as fallback
            # Return generic default pages
            logger.info("⚠️ Using generic default pages - technical spec not found")
            return [
                {"name": "HomePage", "route": "/"},
                {"name": "LoginPage", "route": "/login"},
                {"name": "SignupPage", "route": "/signup"},
                {"name": "DashboardPage", "route": "/dashboard"},
                {"name": "ProfilePage", "route": "/profile"},
            ]

        content = tech_spec_path.read_text()

        # Parse pages from the technical spec
        import re

        # First, find all page names (bold format: **PageName**)
        page_names = re.findall(r'\*\*(\w+Page)\*\*:', content)

        # Map common page names to their standard routes
        route_mapping = {
            "HomePage": "/",
            "LoginPage": "/login",
            "SignupPage": "/signup",
            "RegisterPage": "/register",
            "DashboardPage": "/dashboard",
            "ProfilePage": "/profile",
            "ChapelsPage": "/chapels",
            "ChapelDetailPage": "/chapels/:id",
            "BookingCreatePage": "/booking/new",
            "BookingDetailPage": "/booking/:id",
            "AdminDashboardPage": "/admin",
            "AboutPage": "/about",
            "ContactPage": "/contact",
        }

        # Also try to find explicit route patterns in the content
        route_patterns = [
            r"- (\w+Page):\s*([/\w-:]+)",  # - HomePage: /
            r"(\w+Page)\s*\(([/\w-:]+)\)",  # HomePage (/)
            r"(\w+Page)\s*->\s*([/\w-:]+)",  # HomePage -> /
        ]

        explicit_routes = {}
        for pattern in route_patterns:
            matches = re.findall(pattern, content)
            for page_name, route in matches:
                explicit_routes[page_name] = route

        # Build pages list
        for page_name in page_names:
            # Use explicit route if found, otherwise use mapping or derive from name
            if page_name in explicit_routes:
                route = explicit_routes[page_name]
            elif page_name in route_mapping:
                route = route_mapping[page_name]
            else:
                # Derive route from page name (e.g., SomethingPage -> /something)
                route_base = page_name.replace("Page", "").lower()
                route = f"/{route_base}"

            pages.append({"name": page_name, "route": route})

        if not pages:
            logger.warning("No pages found in tech spec, using minimal defaults")
            return [
                {"name": "HomePage", "route": "/"},
                {"name": "LoginPage", "route": "/login"},
            ]

        logger.info(f"Found {len(pages)} pages in technical spec")
        return pages

    except Exception as e:
        logger.error(f"Error extracting pages: {e}")
        return []


def extract_api_methods(api_client_path: Path) -> str:
    """Extract available methods from generated API client.

    NOTE: This is a TEST FUNCTION with hardcoded examples for logging only.
    The actual master agent has its own generic extraction logic.
    This function is not used by the agents themselves.

    Args:
        api_client_path: Path to the API client file

    Returns:
        Formatted string of available API methods
    """
    try:
        if not api_client_path.exists():
            return None

        content = api_client_path.read_text()
        methods = []

        # Look for contract namespaces in the contractsRouter
        if "bookings:" in content or "bookingsContract" in content:
            methods.extend([
                "apiClient.bookings.createBooking({ body })",
                "apiClient.bookings.getMyBookings()",
                "apiClient.bookings.getBooking({ params: { id } })",
                "apiClient.bookings.updateBooking({ params: { id }, body })",
                "apiClient.bookings.cancelBooking({ params: { id } })"
            ])

        if "chapels:" in content or "chapelsContract" in content:
            methods.extend([
                "apiClient.chapels.getChapels({ query })",
                "apiClient.chapels.getChapel({ params: { id } })",
                "apiClient.chapels.createChapel({ body })",
                "apiClient.chapels.updateChapel({ params: { id }, body })",
                "apiClient.chapels.deleteChapel({ params: { id } })"
            ])

        if "users:" in content or "usersContract" in content:
            methods.extend([
                "apiClient.users.login({ body })",
                "apiClient.users.register({ body })",
                "apiClient.users.getProfile()",
                "apiClient.users.updateProfile({ body })",
                "apiClient.users.logout()"
            ])

        if "packages:" in content or "packagesContract" in content:
            methods.extend([
                "apiClient.packages.getPackages()",
                "apiClient.packages.getPackage({ params: { id } })"
            ])

        return "\n".join(methods) if methods else None

    except Exception as e:
        logger.warning(f"Could not extract API methods: {e}")
        return None


async def generate_fis(app_dir: Path):
    """Generate modular Frontend Interaction Specifications.

    Args:
        app_dir: Path to the application directory
    """
    try:
        logger.info("=" * 60)
        logger.info("🎨 Starting Modular FIS Generation")
        logger.info("=" * 60)

        # Step 1: Check if API client exists
        api_client_path = app_dir / "client/src/lib/api.ts"
        api_client_content = None

        if api_client_path.exists():
            # Extract available methods from API client
            api_client_content = extract_api_methods(api_client_path)
            logger.info("✅ Found API client, will use for FIS")
        else:
            logger.warning("⚠️ No API client found, FIS will need to document APIs manually")

        # Step 2: Generate Master Spec
        logger.info("\n📋 Generating Master Specification...")
        master_agent = FrontendInteractionSpecMasterAgent(app_dir)

        # Pass plan and API client (not contracts/schema)
        master_result = await master_agent.generate_master_spec(
            plan_path=app_dir / "specs/plan.md",
            api_client_path=api_client_path if api_client_path.exists() else None
        )

        if not master_result["success"]:
            logger.error(f"❌ Failed to generate master spec: {master_result.get('error')}")
            return

        master_spec = master_result["spec_content"]
        logger.info(f"✅ Master spec generated (cost: ${master_result['cost']:.4f})")

        # Step 3: Extract pages from technical spec or use defaults
        tech_spec_path = app_dir / "specs/pages-and-routes.md"
        pages = extract_pages_from_tech_spec(tech_spec_path)
        logger.info(f"\n📄 Found {len(pages)} pages to generate")

        # Step 4: Generate page specs in parallel
        logger.info("\n🚀 Generating page specifications in parallel...")
        page_tasks = []
        for page in pages:
            agent = FrontendInteractionSpecPageAgent(app_dir, page)
            task = agent.generate_page_spec(
                master_spec=master_spec,
                page_name=page["name"],
                page_route=page["route"]
            )
            page_tasks.append(task)

        page_results = await asyncio.gather(*page_tasks)

        # Report results
        successful = sum(1 for r in page_results if r["success"])
        total_cost = master_result["cost"] + sum(r["cost"] for r in page_results)

        logger.info("\n" + "=" * 60)
        logger.info("📊 FIS Generation Complete")
        logger.info(f"✅ Master spec: 1")
        logger.info(f"✅ Page specs: {successful}/{len(pages)}")
        logger.info(f"💰 Total cost: ${total_cost:.4f}")
        logger.info("=" * 60)

        # Report any failures
        for i, result in enumerate(page_results):
            if not result["success"]:
                page = pages[i]
                logger.error(f"❌ Failed: {page['name']}: {result.get('error')}")

    except Exception as e:
        logger.error(f"❌ Error during FIS generation: {e}", exc_info=True)


async def main():
    """Main entry point for the script."""
    import sys

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(message)s"
    )

    # Get app directory from command line or use default
    if len(sys.argv) > 1:
        app_dir = Path(sys.argv[1])
    else:
        # No default - require explicit path
        logger.error("❌ Usage: python run_modular_fis.py <app_directory>")
        sys.exit(1)

    if not app_dir.exists():
        logger.error(f"❌ App directory not found: {app_dir}")
        sys.exit(1)

    await generate_fis(app_dir)


if __name__ == "__main__":
    asyncio.run(main())