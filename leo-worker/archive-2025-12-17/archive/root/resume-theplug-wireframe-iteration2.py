#!/usr/bin/env python3
"""Resume ThePlugStreet wireframe generation from iteration 2 with critic feedback."""

import json
from pathlib import Path
from datetime import datetime

# App configuration
APP_NAME = "theplug_20250718_151044"
APP_DIR = Path(f"apps/{APP_NAME}")
SPECS_DIR = APP_DIR / "specs"

# Check if critic feedback exists
critic_file = SPECS_DIR / "critic_analysis_iteration_1.md"
if not critic_file.exists():
    print(f"❌ Critic feedback not found: {critic_file}")
    print("Please ensure the iteration 1 critic analysis exists.")
    exit(1)

print("📋 Preparing to resume wireframe generation from iteration 2...")
print(f"   App: {APP_NAME}")
print(f"   Critic feedback: {critic_file}")

# Read the critic analysis to extract key information
critic_content = critic_file.read_text()

# Extract compliance score and key issues from the markdown
compliance_score = 72  # From the analysis
missing_routes = 31
priority_fixes = [
    "Implement 31 missing routes (see detailed list in critic analysis)",
    "Add functionality to interactive elements (search, notifications)",
    "Clean up unused imports in multiple files",
    "Remove or populate empty contexts/ and hooks/ directories"
]

# Create the feedback JSON structure expected by the pipeline
feedback_data = {
    "evaluation": {
        "compliance_score": compliance_score,
        "missing_features": {
            "routes": f"{missing_routes} routes specified but not implemented",
            "interactive_elements": "Some UI elements lack functionality"
        },
        "summary": f"Implementation has solid foundation but needs completion. {missing_routes} routes missing, some interactive elements are display-only.",
        "detailed_report_path": f"../specs/critic_analysis_iteration_1.md"
    },
    "decision": "continue",
    "reasoning": f"The implementation demonstrates a solid foundation with {100-missing_routes/47*100:.0f}% route coverage, but significant gaps exist. Missing routes and incomplete interactive elements prevent full functionality.",
    "priority_fixes": priority_fixes
}

# Save the feedback file
feedback_file = Path(f"critic_feedback_{APP_NAME}_iter1.json")
with open(feedback_file, 'w') as f:
    json.dump(feedback_data, f, indent=2)

print(f"\n✅ Created feedback file: {feedback_file}")

# Generate the resume command
resume_command = f"""uv run python -m app_factory.main_v2 \\
    --start-at-critic \\
    --app-name {APP_NAME} \\
    --critic-iteration 2 \\
    --critic-feedback-file {feedback_file}"""

print("\n🚀 To resume wireframe generation from iteration 2, run:")
print(resume_command)

print("\n📌 What will happen:")
print("1. The Writer will receive the critic's feedback about missing routes")
print("2. With exponential backoff retry, API errors will be handled gracefully")
print("3. The Writer will implement the 31 missing routes")
print("4. The Critic will evaluate again (iteration 2)")
print("5. The process continues until the Critic approves or max iterations reached")

print("\n💡 The exponential backoff delays are: 60s, 120s, 240s, 480s, 960s")
print("   This prevents API overload errors from stopping the expensive process.")

# Also create a shell script for convenience
shell_script = f"""#!/bin/bash
# Resume ThePlugStreet wireframe generation from iteration 2

echo "🚀 Resuming wireframe generation with API retry protection..."
echo "   If API errors occur, the system will automatically retry with exponential backoff"
echo ""

{resume_command}
"""

shell_script_path = Path(f"resume-theplug-wireframe.sh")
shell_script_path.write_text(shell_script)
shell_script_path.chmod(0o755)

print(f"\n📄 Also created shell script: {shell_script_path}")
print("   Run with: ./resume-theplug-wireframe.sh")