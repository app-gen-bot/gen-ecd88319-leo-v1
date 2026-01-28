#!/bin/bash
# View full conversation logs from the beginning
#
# Usage:
#   ./view-conversation.sh                  # List all conversations
#   ./view-conversation.sh latest           # View latest conversation
#   ./view-conversation.sh <filename>       # View specific file
#   ./view-conversation.sh <agent-name>     # View latest for agent

LOG_DIR="logs/conversations"
MODE="${1:-list}"

cd "$LOG_DIR" || exit 1

case "$MODE" in
    list)
        echo "=================================="
        echo "Available Conversation Logs"
        echo "=================================="
        echo ""
        ls -lhtr conversation_*.txt | tail -20 | awk '{print $9, "(" $5 ")", $6, $7, $8}'
        echo ""
        echo "Usage:"
        echo "  ./view-conversation.sh latest                    # View latest"
        echo "  ./view-conversation.sh <filename>                # View specific file"
        echo "  ./view-conversation.sh AppGeneratorAgent         # Latest for agent"
        echo "  ./view-conversation.sh latest --follow           # View and follow"
        ;;

    latest)
        LATEST=$(ls -t conversation_*.txt 2>/dev/null | head -1)
        if [ -z "$LATEST" ]; then
            echo "No conversation logs found."
            exit 1
        fi

        echo "=================================="
        echo "Latest Conversation: $LATEST"
        echo "=================================="
        echo ""

        if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
            # View from beginning and follow
            tail -n +1 -f "$LATEST"
        else
            # View entire file with pager
            less +G "$LATEST"
        fi
        ;;

    *.txt)
        # Specific file provided
        if [ ! -f "$MODE" ]; then
            echo "File not found: $MODE"
            exit 1
        fi

        echo "=================================="
        echo "Viewing: $MODE"
        echo "=================================="
        echo ""

        if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
            # View from beginning and follow
            tail -n +1 -f "$MODE"
        else
            # View entire file with pager
            less +G "$MODE"
        fi
        ;;

    *)
        # Agent name pattern
        PATTERN="$MODE"
        LATEST=$(ls -t conversation_*${PATTERN}*.txt 2>/dev/null | head -1)

        if [ -z "$LATEST" ]; then
            echo "No conversation logs found matching: $PATTERN"
            exit 1
        fi

        echo "=================================="
        echo "Latest for '$PATTERN': $LATEST"
        echo "=================================="
        echo ""

        if [ "$2" = "--follow" ] || [ "$2" = "-f" ]; then
            # View from beginning and follow
            tail -n +1 -f "$LATEST"
        else
            # View entire file with pager
            less +G "$LATEST"
        fi
        ;;
esac
