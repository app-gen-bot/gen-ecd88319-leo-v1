#!/bin/bash
# Test improved chained sprint breakdown with PawsFlow PRD

echo "🚀 Running improved chained sprint breakdown test with PawsFlow PRD..."
echo ""
echo "This version includes:"
echo "  - Better context handling between sprints"
echo "  - Explicit file creation for each document"
echo "  - Improved error handling and progress tracking"
echo "  - Clear instructions to not read non-existent files"
echo ""

# Run the test
uv run python test_pawsflow_chained_v4.py