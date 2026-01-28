"""Shared XML parsing utility for Critic responses."""

import re
from typing import Tuple


def parse_critic_xml(response: str) -> Tuple[str, dict]:
    """Parse XML response from Critics into decision and evaluation data.

    Args:
        response: Raw response content from Critic agent

    Returns:
        Tuple of (decision, eval_data)
        - decision: "complete" or "continue" (defaults to "continue" if not found)
        - eval_data: Dictionary containing evaluation details
    """
    decision = "continue"  # Safe default
    eval_data = {
        "errors": "",
        "critical_issues": [],
        "minor_issues": [],
        "suggestions": [],
        "compliance_score": 0,
        "raw_response": response
    }

    try:
        # Extract decision
        decision_match = re.search(r'<decision>(.*?)</decision>', response, re.DOTALL | re.IGNORECASE)
        if decision_match:
            decision = decision_match.group(1).strip().lower()
            # Normalize decision values
            if decision not in ["complete", "continue"]:
                decision = "continue"

        # Extract errors
        errors_match = re.search(r'<errors>(.*?)</errors>', response, re.DOTALL | re.IGNORECASE)
        if errors_match:
            eval_data["errors"] = errors_match.group(1).strip()

        # Extract critical issues
        critical_match = re.search(r'<critical_issues>(.*?)</critical_issues>', response, re.DOTALL | re.IGNORECASE)
        if critical_match:
            issues = re.findall(r'<issue>(.*?)</issue>', critical_match.group(1), re.DOTALL | re.IGNORECASE)
            eval_data["critical_issues"] = [issue.strip() for issue in issues]

        # Extract minor issues
        minor_match = re.search(r'<minor_issues>(.*?)</minor_issues>', response, re.DOTALL | re.IGNORECASE)
        if minor_match:
            issues = re.findall(r'<issue>(.*?)</issue>', minor_match.group(1), re.DOTALL | re.IGNORECASE)
            eval_data["minor_issues"] = [issue.strip() for issue in issues]

        # Extract suggestions
        suggestions_match = re.search(r'<suggestions>(.*?)</suggestions>', response, re.DOTALL | re.IGNORECASE)
        if suggestions_match:
            suggestions = re.findall(r'<suggestion>(.*?)</suggestion>', suggestions_match.group(1), re.DOTALL | re.IGNORECASE)
            eval_data["suggestions"] = [suggestion.strip() for suggestion in suggestions]

        # Extract compliance score if present
        score_match = re.search(r'<compliance_score>(\d+)</compliance_score>', response, re.IGNORECASE)
        if score_match:
            eval_data["compliance_score"] = int(score_match.group(1))

        # Also try to extract scores from evaluation sections
        contract_score = re.search(r'<contract_compliance>.*?<score>(\d+)</score>', response, re.DOTALL | re.IGNORECASE)
        if contract_score:
            eval_data["contract_compliance_score"] = int(contract_score.group(1))
            if not eval_data["compliance_score"]:
                eval_data["compliance_score"] = int(contract_score.group(1))

        completeness_score = re.search(r'<completeness>.*?<score>(\d+)</score>', response, re.DOTALL | re.IGNORECASE)
        if completeness_score:
            eval_data["completeness_score"] = int(completeness_score.group(1))

        readiness_score = re.search(r'<implementation_readiness>.*?<score>(\d+)</score>', response, re.DOTALL | re.IGNORECASE)
        if readiness_score:
            eval_data["implementation_readiness_score"] = int(readiness_score.group(1))

        # Extract test results if present (for Browser Visual Critic)
        test_results_match = re.search(r'<test_results>(.*?)</test_results>', response, re.DOTALL | re.IGNORECASE)
        if test_results_match:
            test_data = {}
            tests_passed = re.search(r'<tests_passed>(\d+)</tests_passed>', test_results_match.group(1))
            tests_failed = re.search(r'<tests_failed>(\d+)</tests_failed>', test_results_match.group(1))
            coverage = re.search(r'<coverage>(.*?)</coverage>', test_results_match.group(1))

            if tests_passed:
                test_data["tests_passed"] = int(tests_passed.group(1))
            if tests_failed:
                test_data["tests_failed"] = int(tests_failed.group(1))
            if coverage:
                test_data["coverage"] = coverage.group(1).strip()

            if test_data:
                eval_data["test_results"] = test_data

        return decision, eval_data

    except Exception as e:
        # If anything goes wrong, default to continue with error description
        eval_data["errors"] = f"XML parsing error: {str(e)}"
        eval_data["critical_issues"] = [f"XML parsing failed: {str(e)}"]
        return "continue", eval_data


def create_critic_response_summary(decision: str, errors: str) -> str:
    """Create a human-readable summary of Critic response.
    
    Args:
        decision: "complete" or "continue"
        errors: Error description string
        
    Returns:
        Human-readable summary string
    """
    if decision == "complete":
        return "✅ All validation checks passed"
    else:
        if errors.strip():
            return f"❌ Issues found:\n{errors}"
        else:
            return "❌ Issues found (no details provided)"


def extract_tool_errors(errors: str) -> dict:
    """Extract specific tool errors from error string.
    
    Args:
        errors: Error description string
        
    Returns:
        Dict mapping tool names to their specific errors
    """
    tool_errors = {}
    
    if not errors.strip():
        return tool_errors
    
    # Split by lines and look for tool-specific errors
    lines = errors.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line or not line.startswith('-'):
            continue
            
        # Remove leading dash and extract tool:error pattern
        line = line.lstrip('- ').strip()
        if ':' in line:
            parts = line.split(':', 1)
            if len(parts) == 2:
                tool_name = parts[0].strip().lower()
                error_desc = parts[1].strip()
                tool_errors[tool_name] = error_desc
    
    return tool_errors