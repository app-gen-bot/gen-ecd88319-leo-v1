"""
Prompt Expander for App Generator Agent.

Uses LLM to intelligently expand short user prompts into detailed,
schema-first instructions based on PROMPTING-GUIDE.md patterns.
"""

import logging
from pathlib import Path
from typing import Dict, Optional

from cc_agent import Agent

logger = logging.getLogger(__name__)


class PromptExpander:
    """
    LLM-powered prompt expansion assistant.

    Expands short user inputs into detailed instructions following
    best practices from PROMPTING-GUIDE.md.
    """

    def __init__(self, prompting_guide_path: str):
        """
        Initialize the Prompt Expander.

        Args:
            prompting_guide_path: Path to PROMPTING-GUIDE.md
        """
        self.guide_path = Path(prompting_guide_path)
        self.guide_content = self._load_guide()
        self.system_prompt = self._build_system_prompt()

        # Use Sonnet for better quality prompt expansion
        self.agent = Agent(
            name="PromptExpander",
            system_prompt=self.system_prompt,
            model="sonnet",
            max_turns=5,  # Allow up to 5 turns for thorough expansion
        )

        logger.info("✅ PromptExpander initialized with PROMPTING-GUIDE.md")

    def _load_guide(self) -> str:
        """
        Load the prompting guide content.

        Returns:
            The guide content as a string

        Raises:
            FileNotFoundError: If guide doesn't exist
        """
        if not self.guide_path.exists():
            raise FileNotFoundError(
                f"PROMPTING-GUIDE.md not found at: {self.guide_path}"
            )

        with open(self.guide_path, 'r', encoding='utf-8') as f:
            content = f.read()

        logger.debug(f"Loaded prompting guide: {len(content):,} characters")
        return content

    def _build_system_prompt(self) -> str:
        """
        Build the system prompt for the expansion agent.

        Returns:
            The complete system prompt with guide content
        """
        return f"""# Prompt Expansion Assistant

You analyze user requests for app modifications and expand them to include proper testing and verification steps.

## Important Context About the Main Agent

The agent that will receive your expanded prompt:
- Already has FULL context about the app being modified
- Knows all entities, features, and architecture details
- Has access to all files and can read them directly
- Has Chrome DevTools (mcp__chrome_devtools__*) for comprehensive frontend testing:
  - UI interactions (click, fill, navigate)
  - Console error detection (list_console_messages)
  - Network request analysis (list_network_requests)
  - Performance profiling (available but not required)
- Has curl/bash for API testing
- Maintains session history of all previous modifications

You're NOT teaching the agent about the app structure - it knows that.
You ARE ensuring proper testing and verification steps are included.

## Your Context: PROMPTING-GUIDE.md

This guide contains best practices for prompting AI agents to build applications:

{self.guide_content}

## When to Expand vs Pass Through

**ALWAYS EXPAND when user requests:**
- New features or functionality
- API endpoint changes
- Frontend UI changes
- Database/schema modifications
- Any CRUD operations
- Data seeding or manipulation

**EXPAND TO INCLUDE:**
1. API testing with curl commands BEFORE frontend work
2. Frontend testing with Chrome DevTools AFTER implementation:
   - Navigate to app (new_page or navigate_page)
   - Check console for errors (list_console_messages) - MUST be zero
   - Verify network requests (list_network_requests) - all should return 200/201
   - Test UI interactions (click, fill, wait_for)
   - Take screenshots if issues found (take_screenshot with filePath parameter)
   - Get request details for failures (get_network_request)
3. Verification that backend and frontend integrate properly
4. Explicit checks that no mock data is used
5. Step-by-step testing of the complete user flow

**PASS THROUGH (return NO_EXPANSION_NEEDED) only when:**
- User already included explicit testing steps
- User is fixing a typo or comment
- User explicitly says "don't test" or "skip verification"
- The change is purely cosmetic (CSS only)
- User provides a detailed multi-step plan with verification

## Standard Testing Pattern to Include

When expanding, include this testing flow:

### 1. Backend First (if API changes)
- Implement the backend changes
- Test with curl: "Test the endpoint with: curl -X [METHOD] http://localhost:5013/api/[endpoint]"
- Verify response structure matches schema
- Show the actual JSON response

### 2. Frontend After Backend Verified
- Implement frontend changes using real API
- NO mock data - must use apiClient
- Include loading states and error handling

### 3. Chrome DevTools Testing
- "Create new page with mcp__chrome_devtools__new_page('http://localhost:5013')"
- "Check console for errors with mcp__chrome_devtools__list_console_messages() - must be zero errors"
- "Verify network requests with mcp__chrome_devtools__list_network_requests() - all should succeed"
- "Test the full user flow: [specific click/fill/wait_for actions]"
- "Verify data persists after page refresh"
- "Take screenshots to confirm it works with mcp__chrome_devtools__take_screenshot(filePath='./screenshots/test.png', fullPage=True)"

### 4. Integration Verification
- Confirm frontend displays backend data correctly
- Test error cases (network failure, validation errors)
- Verify all CRUD operations if applicable

## Testing Philosophy

- NEVER trust that code works without testing
- Backend MUST be tested with curl before frontend work
- Frontend MUST be tested with Chrome DevTools:
  - Zero console errors (list_console_messages)
  - All network requests succeed (list_network_requests)
  - UI interactions work (click, fill, navigate)
- Every feature needs: implement → test API → implement UI → test UI → verify integration
- Real data flow is critical - no mock data shortcuts

## Output Format

**If NO expansion needed:**
Return exactly: NO_EXPANSION_NEEDED

**If expansion needed:**
Return ONLY the expanded instructions (no preamble, no explanation).

## Examples

Input: "Add a delete button to posts"
Output:
"Add a delete button to posts with full-stack integration and testing:

1. Backend: Implement DELETE /api/posts/:id endpoint
   - Add route handler in server/routes/posts.ts
   - Include authorization checks
   - Test with: curl -X DELETE http://localhost:5013/api/posts/1
   - Verify response and that post is deleted from database

2. Frontend: Add delete button to post components
   - Use apiClient.posts.delete(id) - NO mock implementation
   - Add confirmation dialog before deletion
   - Handle loading state during deletion
   - Show success/error messages

3. Browser Testing:
   - Open browser with mcp__browser__open_browser
   - Navigate to http://localhost:5013 with mcp__browser__navigate_browser
   - Click delete button on a test post
   - Confirm deletion dialog appears
   - Complete deletion and verify post disappears
   - Refresh page to confirm deletion persisted
   - Take screenshot of working feature"

Input: "Fix the typo in the header"
Output: NO_EXPANSION_NEEDED

Input: "Seed it with companies"
Output:
"Add seed data for companies with verification:

1. Schema Verification:
   - Read shared/schema.zod.ts to get exact Company type
   - List all required fields and their types
   - Note any enums or special validations

2. Create Seed Data:
   - Generate 5-10 realistic companies
   - Ensure all field names match schema exactly
   - Use proper types (strings, numbers, booleans)

3. API Testing:
   - Add companies via POST /api/companies
   - Test: curl -X POST http://localhost:5013/api/companies -H 'Content-Type: application/json' -d '{{"name":"Example Corp",...}}'
   - Verify each company is created successfully
   - GET all companies to confirm: curl http://localhost:5013/api/companies

4. Browser Verification:
   - Open browser and navigate to companies page
   - Verify all seeded companies appear correctly
   - Check that all fields display properly
   - Take screenshot of populated list"

Input: "Create a new comments system"
Output:
"Create a comments system with full testing:

1. Schema: Add comments to schema.zod.ts
   - Define Comment type: id, postId, userId, content, createdAt
   - Update relationships as needed

2. Backend CRUD:
   - GET /api/posts/:id/comments - list comments
   - POST /api/posts/:id/comments - create comment
   - DELETE /api/comments/:id - delete comment
   - Test each endpoint with curl:
     * curl http://localhost:5013/api/posts/1/comments
     * curl -X POST http://localhost:5013/api/posts/1/comments -H 'Content-Type: application/json' -d '{{"content":"Test comment"}}'
     * Verify responses match schema

3. Frontend Components:
   - Comments list with real-time loading from API
   - Comment form with validation
   - Delete button (own comments only)
   - NO hardcoded data - fetch from API

4. Full Browser Testing:
   - Open browser and navigate to post detail
   - Add new comment via form
   - Verify it appears immediately
   - Refresh page - comment must persist
   - Delete the comment
   - Test with multiple comments
   - Take screenshots of working system"

Remember: The agent knows the app structure. Focus on adding testing and verification steps that ensure quality.
"""

    async def expand(
        self,
        user_input: str,
        app_path: Optional[str] = None,
        recent_commits: Optional[list] = None
    ) -> Dict[str, any]:
        """
        Expand a user input into detailed instructions if needed.

        Args:
            user_input: The short user input to potentially expand
            app_path: Optional app path for context
            recent_commits: Optional recent git commits for context

        Returns:
            Dict with:
                - original: Original user input
                - expanded: Expanded version (or original if no expansion)
                - was_expanded: True if expansion happened
                - expansion_note: Why expansion happened or didn't
        """
        # Build the prompt with context
        prompt = self._build_expansion_prompt(user_input, app_path, recent_commits)

        logger.debug(f"Expanding prompt: '{user_input[:50]}...'")

        try:
            # Run expansion (async)
            result = await self.agent.run(prompt)

            # Extract the response text
            response = self._extract_response(result)

            # Check if expansion happened
            if response.strip() == "NO_EXPANSION_NEEDED":
                logger.info("No expansion needed - input already detailed")
                return {
                    "original": user_input,
                    "expanded": user_input,
                    "was_expanded": False,
                    "expansion_note": "Input already detailed enough"
                }
            else:
                logger.info("✅ Prompt expanded successfully")
                return {
                    "original": user_input,
                    "expanded": response.strip(),
                    "was_expanded": True,
                    "expansion_note": "Expanded following PROMPTING-GUIDE.md patterns"
                }

        except Exception as e:
            logger.error(f"Expansion failed: {e}")
            # Fall back to original input
            return {
                "original": user_input,
                "expanded": user_input,
                "was_expanded": False,
                "expansion_note": f"Expansion failed: {e}"
            }

    def _build_expansion_prompt(
        self,
        user_input: str,
        app_path: Optional[str],
        recent_commits: Optional[list]
    ) -> str:
        """Build the prompt for expansion."""
        prompt_parts = ["# Expand User Input", ""]

        # Add context if available
        if app_path:
            prompt_parts.append(f"App Path: {app_path}")

        if recent_commits:
            prompt_parts.append("\nRecent Changes:")
            for commit in recent_commits[:3]:
                prompt_parts.append(f"  - {commit.get('message', 'Unknown')}")
            prompt_parts.append("")

        prompt_parts.extend([
            "## User Input",
            user_input,
            "",
            "## Your Task",
            "Analyze this input and either:",
            "1. Return 'NO_EXPANSION_NEEDED' if already detailed",
            "2. Return expanded instructions following PROMPTING-GUIDE.md patterns",
            "",
            "Output only your decision (NO_EXPANSION_NEEDED) or the expanded instructions."
        ])

        return "\n".join(prompt_parts)

    def _extract_response(self, result) -> str:
        """
        Extract the text response from agent result.

        Args:
            result: Agent result object

        Returns:
            The response text
        """
        # The Agent result should have the response text
        # Handle different possible result formats
        if isinstance(result, str):
            return result

        if hasattr(result, 'output'):
            return result.output

        if hasattr(result, 'content'):
            return result.content

        # Last resort - convert to string
        return str(result)
