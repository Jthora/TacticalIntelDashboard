#!/bin/bash

# validate_multi_protocol.sh
# Validates Earth Alliance sources across multiple protocols

cd "$(dirname "$0")/.."
BASE_DIR="$(pwd)"
VALIDATOR_DIR="$BASE_DIR/tools/feed-validator"
REPORTS_DIR="$VALIDATOR_DIR/reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Ensure the reports directory exists
mkdir -p "$REPORTS_DIR"

# Display banner
echo "🌐 EARTH ALLIANCE MULTI-PROTOCOL SOURCE VALIDATOR"
echo "=================================================="
echo "Validating sources across multiple protocols: RSS, JSON, API, IPFS, Mastodon, SSB"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    exit 1
fi

# Check if package dependencies are installed
if [ ! -d "$VALIDATOR_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$VALIDATOR_DIR" && npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies."
        exit 1
    fi
fi

# Parse command line arguments
PROTOCOL=""
ROSTER_PATH="$BASE_DIR/docs/EARTH_ALLIANCE_SOURCE_ROSTER.md"

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--protocol)
            PROTOCOL="$2"
            shift 2
            ;;
        -f|--file)
            ROSTER_PATH="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./validate_multi_protocol.sh [-p protocol] [-f roster_file]"
            echo "  -p, --protocol: Specific protocol to validate (rss, json, api, ipfs, mastodon, ssb)"
            echo "  -f, --file: Custom roster file to validate"
            exit 1
            ;;
    esac
done

# Run the validator
echo "🔄 Running multi-protocol validator..."
echo "📝 Source roster: $ROSTER_PATH"
if [ -n "$PROTOCOL" ]; then
    echo "🔍 Protocol filter: $PROTOCOL"
    cd "$VALIDATOR_DIR" && node multi-protocol-validator.js --protocol "$PROTOCOL" --file "$ROSTER_PATH"
else
    echo "🔍 Validating all protocols"
    cd "$VALIDATOR_DIR" && node multi-protocol-validator.js --file "$ROSTER_PATH"
fi

# Check if validation was successful
if [ $? -ne 0 ]; then
    echo "❌ Validation failed."
    exit 1
fi

echo
echo "✅ Multi-protocol validation complete."
echo "📊 View the reports in: $REPORTS_DIR"
echo
