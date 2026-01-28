"""User prompt templates for the Plan Orchestrator Agent."""

import datetime


def create_user_prompt(user_request: str, skip_questions: bool = False) -> str:
    """Create the initial prompt for the plan orchestrator agent.
    
    Args:
        user_request: The user's initial application request
        skip_questions: If True, skip questions and generate plan directly
        
    Returns:
        Formatted prompt for the orchestrator
    """
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    if skip_questions:
        return f"""I want to build an application based on this request:

"{user_request}"

Please generate a simple application plan for this WITHOUT asking any questions. Use the Fullstack JavaScript stack (React + Express.js) and create intelligent features specific to this app type.

Generate the complete plan now following the three-step structure (Understanding, Initial Version, Feature List).

Today's date is {current_date}."""
    else:
        return f"""I want to build an application based on this request:

"{user_request}"

Please help me create a simple application plan for this. 

Feel free to ask me a brief clarifying question if needed, but please keep it minimal. Use the Fullstack JavaScript stack and create intelligent features specific to this app type.

Today's date is {current_date}."""


def create_followup_prompt(previous_response: str, user_response: str) -> str:
    """Create a follow-up prompt during conversation.
    
    Args:
        previous_response: The agent's previous response
        user_response: The user's response to questions
        
    Returns:
        Formatted follow-up prompt
    """
    return f"""Thank you for that information. Based on your response:

{user_response}

Please continue with generating the plan following the three-step structure (Understanding, Initial Version, Feature List)."""


def create_plan_generation_prompt(collected_requirements: dict) -> str:
    """Create the final plan generation prompt with all collected requirements.
    
    Args:
        collected_requirements: Dictionary of requirements gathered during conversation
        
    Returns:
        Formatted prompt for final plan generation
    """
    req_summary = "\n".join([f"- {key}: {value}" for key, value in collected_requirements.items()])
    
    return f"""Based on our conversation, I've gathered the following requirements:

{req_summary}

Please now generate a simple application plan following the three-step structure. Make intelligent assumptions for features specific to this app type."""


def create_refinement_prompt(plan_content: str, refinement_request: str) -> str:
    """Create a prompt for refining an existing plan.
    
    Args:
        plan_content: The current plan content
        refinement_request: What needs to be refined
        
    Returns:
        Formatted refinement prompt
    """
    return f"""I have the following plan:

{plan_content}

Please refine it based on this feedback:
{refinement_request}

Update the plan while maintaining the three-step structure (Understanding, Initial Version, Feature List)."""