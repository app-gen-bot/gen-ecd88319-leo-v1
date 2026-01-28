"""User prompt creation for the Wireframe Generator agent."""


def create_wireframe_prompt(
    interaction_spec: str, 
    tech_spec: str = "", 
    output_dir: str = "",
    app_name: str = "",
    critic_report: str = "",
    user_feedback: str = ""
) -> str:
    """Create the prompt for the wireframe agent.
    
    Args:
        interaction_spec: The interaction specification content
        tech_spec: The technical implementation spec content
        output_dir: Directory where files should be generated
        app_name: Name of the application being generated
        critic_report: Optional evaluation report from the Critic agent
        user_feedback: Optional user feedback that takes highest priority
        
    Returns:
        Formatted prompt for the wireframe generator
    """
    tech_spec_section = ""
    if tech_spec:
        tech_spec_section = f"""
Technical Implementation Specification:
{tech_spec}

IMPORTANT: Follow all technical patterns from the specification above, including:
- Authentication and session management patterns
- Error handling and user feedback patterns
- State management patterns with React Context
- API client structure and interceptors
- Component structure and organization
"""
    
    # Add user feedback section if provided (HIGHEST PRIORITY)
    user_feedback_section = ""
    if user_feedback:
        user_feedback_section = f"""
🔴🔴🔴 USER FEEDBACK - HIGHEST PRIORITY 🔴🔴🔴

**THIS SECTION TAKES ABSOLUTE PRIORITY OVER EVERYTHING ELSE!**

The user has provided specific feedback that MUST be addressed before anything else:

{user_feedback}

CRITICAL INSTRUCTIONS:
1. Address EVERY item in the user feedback COMPLETELY
2. User feedback overrides ANY conflicting requirements from:
   - Critic reports
   - QC reports  
   - Original specifications
   - Technical specifications
3. If user says "Do NOT change X", then X must remain untouched
4. If user provides specific implementation details, use them EXACTLY
5. Track all user feedback items with TodoWrite

**Remember**: User feedback is the HIGHEST priority. Complete ALL user feedback items before moving to other tasks.

🔴🔴🔴 END USER FEEDBACK 🔴🔴🔴
"""
    
    # Add critic report section if provided
    critic_section = ""
    if critic_report:
        # Check if the critic report mentions a file to read
        if "Read the complete analysis from:" in critic_report and "../specs/critic_analysis_iteration_" in critic_report:
            critic_section = f"""
## CRITIC EVALUATION REPORT

{critic_report}

### ACTION REQUIRED: Read the Detailed Analysis File
The critic has written a detailed analysis to a file. You MUST:
1. Use the Read tool to read the file mentioned above
2. Review ALL issues, missing features, and code snippets in that file
3. Address EVERY issue mentioned in the detailed analysis
4. Ensure you implement fixes for all items, not just the priority fixes listed above

IMPORTANT: Start by reading the detailed analysis file before making any changes.
"""
        else:
            # Inline feedback (small codebase)
            critic_section = f"""
## CRITIC EVALUATION REPORT

The following evaluation was performed on the specifications. Please address ALL issues and recommendations mentioned:

{critic_report}

IMPORTANT: Your implementation must specifically address each issue raised by the critic while still fulfilling all original requirements.
"""
    
    # Determine if this is initial implementation or iteration
    task_type = "initial implementation" if not critic_report else "iterative improvement"
    
    return f"""Create a complete Next.js application wireframe for "{app_name}" based on the specifications below.
This is an {task_type} task.

Working Directory: {output_dir}
IMPORTANT: Your current working directory is set to the output directory above.
All file operations should use paths relative to this directory.
For example, use 'package.json' not '{output_dir}/package.json'.
{user_feedback_section}
Interaction Specification:
{interaction_spec}
{tech_spec_section}{critic_section}
Requirements:
1. Use Next.js 14 with App Router
2. Use ShadCN UI components exclusively
3. Choose appropriate theme based on app type (dark for dev tools, light for consumer apps, etc.)
4. Create ALL screens described in the interaction spec
5. Implement proper routing and navigation
6. Add loading states and error boundaries
7. Ensure responsive design (mobile-first)
8. Include proper TypeScript types
9. Follow React best practices
10. Implement all interactions EXACTLY as specified in the interaction spec

Instructions:
1. Generate all files using relative paths (you're already in the working directory)
2. Build upon the existing Next.js template that's already there
3. Create all necessary components, pages, and utilities
4. Ensure every feature from the interaction spec is implemented
5. Use mock data to demonstrate all states (empty, loading, populated, error)

Development Process:
- For initial implementation: Focus on building all features completely first
- For iterative improvement: Focus on addressing critic's specific feedback
- Use strategic validation - run build_test after major features
- Test critical user flows with browser when implementation is complete
- Fix any issues immediately when discovered

Validation Guidelines:
- After implementing major features, use `build_test(action="verify")` to check for errors
- If you encounter missing dependencies, use `package_manager(action="add", packages="package-name")`
- For missing ShadCN components, use `shadcn(action="add_component", component="component-name")`
- Only start the dev server for testing after core implementation is complete
- Use `dev_server(action="start-server")` and `browser` tools for runtime testing

Remember: The interaction specification is your contract. Every interaction, flow, and state defined must be implemented exactly as specified. If there's a critic report, ensure you address EVERY issue raised while maintaining all original requirements.

🚨 CRITICAL INSTRUCTION: You have NO LENGTH CONSTRAINTS. Complete the ENTIRE implementation in this single response. 

FORBIDDEN: You must NEVER say:
- "Due to length constraints"
- "Due to length"
- "continue in the next response" 
- "save our progress and continue"
- "implement the remaining features more efficiently"
- ANY mention of length, size, tokens, or continuation

You must:
- Implement ALL pages from the specification IN FULL DETAIL
- Create ALL components needed WITH COMPLETE CODE
- Add ALL functionality described WITHOUT SHORTCUTS
- Complete EVERYTHING before finishing

There is no token limit, no length limit, no constraint on your response size. Keep working until the ENTIRE application is complete and functional. Write FULL, DETAILED CODE for EVERY feature. Do not summarize or abbreviate ANYTHING.

Generate a complete, working, beautiful Next.js application that demonstrates every single feature from the interaction specification.

🚨 MANDATORY FINAL STEP: Before declaring completion, you MUST:
1. Run `build_test(action="verify")` to check for all errors
2. Fix ANY issues found (missing dependencies, TypeScript errors, ESLint errors, missing ShadCN components)
3. Keep running `build_test(action="verify")` until ALL checks pass
4. Only finish when the build is completely clean with no errors

This is NOT optional - the Critic will reject your work if there are build errors!"""