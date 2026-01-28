#!/bin/bash
# Monitor all conversation logs in real-time (watches for new files)
#
# Usage:
#   ./monitor-conversations.sh              # Monitor all conversations
#   ./monitor-conversations.sh text         # Text logs only
#   ./monitor-conversations.sh jsonl        # JSONL logs only
#   ./monitor-conversations.sh <agent-name> # Specific agent only

LOG_DIR="logs/conversations"
MODE="${1:-all}"
MONITORED_FILE="/tmp/monitor-conversations-pids-$$"

# Create directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "=================================="
echo "Conversation Log Monitor"
echo "=================================="
echo "Log directory: $LOG_DIR"
echo "Mode: $MODE"
echo ""
echo "📡 Watching for conversation logs..."
echo "💡 This shows BOTH existing and newly created files"
echo "🛑 Press Ctrl+C to exit"
echo "=================================="
echo ""

# Create temp file to track monitored files
> "$MONITORED_FILE"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping all monitoring..."

    # Kill all tail processes we started
    if [ -f "$MONITORED_FILE" ]; then
        while read pid; do
            kill "$pid" 2>/dev/null
        done < "$MONITORED_FILE"
        rm -f "$MONITORED_FILE"
    fi

    exit 0
}

trap cleanup INT TERM EXIT

# Function to check if file is already being monitored
is_monitored() {
    local file="$1"
    [ -f "$MONITORED_FILE" ] && grep -q ":$file$" "$MONITORED_FILE"
}

# Function to start monitoring a file
start_monitoring() {
    local file="$1"

    if [ -f "$file" ] && ! is_monitored "$file"; then
        echo ""
        echo "🔵 Started monitoring: $file"
        echo "─────────────────────────────────────────"
        echo ""

        # Start tailing in background
        tail -f "$file" &
        local pid=$!

        # Record PID and filename
        echo "$pid:$file" >> "$MONITORED_FILE"
    fi
}

# Change to log directory
cd "$LOG_DIR" || exit 1

# Determine file pattern
case "$MODE" in
    text)
        PATTERN="conversation_*.txt"
        ;;
    jsonl)
        PATTERN="conversation_*.jsonl"
        ;;
    all)
        PATTERN="conversation_*.txt"
        ;;
    *)
        # Specific agent
        PATTERN="conversation_*${MODE}*.txt"
        ;;
esac

echo "📂 Pattern: $PATTERN"
echo ""

# Start monitoring existing files
shopt -s nullglob  # Make glob return empty if no matches
for file in $PATTERN; do
    start_monitoring "$file"
done

# Check if we found any files
if [ ! -s "$MONITORED_FILE" ]; then
    echo "⏳ No matching files found yet. Waiting for new files..."
    echo ""
fi

# Poll for new files every 2 seconds
while true; do
    for file in $PATTERN; do
        start_monitoring "$file"
    done
    sleep 2
done
