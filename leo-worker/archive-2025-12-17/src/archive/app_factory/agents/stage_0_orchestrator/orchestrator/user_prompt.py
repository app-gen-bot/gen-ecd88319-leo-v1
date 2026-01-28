"""User prompt templates for the Orchestrator Agent."""

import datetime


def create_user_prompt(user_request: str, skip_questions: bool = False) -> str:
    """Create the initial prompt for the orchestrator agent.
    
    Args:
        user_request: The user's initial application request
        skip_questions: If True, skip questions and generate PRD directly
        
    Returns:
        Formatted prompt for the orchestrator
    """
    current_date = datetime.datetime.now().strftime("%Y-%m-%d")
    
    if skip_questions:
        return f"""I want to build an application based on this request:

"{user_request}"

Please generate a comprehensive Product Requirements Document (PRD) for this application WITHOUT asking any questions. Make reasonable assumptions:
- Target: Small to medium teams (50-200 users initially)
- Focus: Balance between real-time communication and task management
- Priority: Seamless integration of chat and project management features
- Scale: Cloud-based SaaS application

Generate the complete PRD now following the standard template.

Today's date is {current_date}."""
    else:
        return f"""I want to build an application based on this request:

"{user_request}"

Please help me create a comprehensive Product Requirements Document (PRD) for this application. 

Feel free to ask me a few clarifying questions if needed to understand the core requirements, but please keep it brief. Make reasonable assumptions for standard features based on the type of application I'm describing.

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

Please continue with generating the PRD or ask any final critical questions if absolutely necessary."""


def create_prd_generation_prompt(collected_requirements: dict) -> str:
    """Create the final PRD generation prompt with all collected requirements.
    
    Args:
        collected_requirements: Dictionary of requirements gathered during conversation
        
    Returns:
        Formatted prompt for final PRD generation
    """
    req_summary = "\n".join([f"- {key}: {value}" for key, value in collected_requirements.items()])
    
    return f"""Based on our conversation, I've gathered the following requirements:

{req_summary}

Please now generate a comprehensive Product Requirements Document (PRD) following the standard template. Make reasonable assumptions for any unspecified standard features."""


def create_refinement_prompt(prd_content: str, refinement_request: str) -> str:
    """Create a prompt for refining an existing PRD.
    
    Args:
        prd_content: The current PRD content
        refinement_request: What needs to be refined
        
    Returns:
        Formatted refinement prompt
    """
    return f"""I have the following PRD:

{prd_content}

Please refine it based on this feedback:
{refinement_request}

Update the PRD while maintaining the standard structure and format."""