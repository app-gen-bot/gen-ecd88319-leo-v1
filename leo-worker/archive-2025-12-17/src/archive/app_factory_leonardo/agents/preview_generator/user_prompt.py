"""User prompt template for Preview Generator Agent."""

def create_user_prompt(plan_content: str) -> str:
    """Create a user prompt from plan content.
    
    Args:
        plan_content: The content of the plan.md file
        
    Returns:
        Formatted user prompt for the agent
    """
    return f"""Generate a React component preview for this application plan:

---

{plan_content}

---

Based on this plan, create a React component that:

1. **Showcases the core features** described in the plan
2. **Uses appropriate ShadCN UI components** for the interface
3. **Includes realistic demo data** that demonstrates the app's functionality
4. **Follows the technical requirements** from the system prompt
5. **Creates an engaging preview** that represents the planned user experience

Focus on the "Initial Version" features and create a component that would serve as an excellent preview of what the final application will look like and how it will function.

Generate the complete React component code now."""