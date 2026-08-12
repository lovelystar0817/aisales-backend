#!/bin/bash

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/../config"
LOGS_DIR="$SCRIPT_DIR/../logs"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FEATURE_NAME=""
FOLLOW=false
LINES=100

show_usage() {
    echo "Usage: $0 <feature-name> [options]"
    echo ""
    echo "Options:"
    echo "  -f, --follow       Follow log output (like tail -f)"
    echo "  -n, --lines <num>  Number of lines to show (default: 100)"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 auth-feature"
    echo "  $0 payment --follow"
    echo "  $0 ui --lines 50"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            if [ -z "$FEATURE_NAME" ]; then
                FEATURE_NAME="$1"
            else
                echo_error "Unknown option: $1"
                show_usage
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [ -z "$FEATURE_NAME" ]; then
    echo_error "Error: Feature name is required"
    show_usage
fi

# Clean feature name
FEATURE_NAME=$(echo "$FEATURE_NAME" | sed 's/[^a-zA-Z0-9-]/-/g' | sed 's/^-*//' | sed 's/-*$//')

# Check if deployment exists
MAPPING_PATH="$SCRIPT_DIR/../../../feature-deployment-mappings.json"
if [ ! -f "$MAPPING_PATH" ]; then
    echo_error "No deployments found"
    exit 1
fi

DEPLOYMENT_INFO=$(node -e "
const fs = require('fs');
const deployments = JSON.parse(fs.readFileSync('$MAPPING_PATH', 'utf8'));
const dep = Object.values(deployments).find(d => d && d.name === '$FEATURE_NAME');
if (dep) {
    console.log(JSON.stringify(dep));
} else {
    process.exit(1);
}
" 2>/dev/null) || {
    echo_error "Deployment not found: $FEATURE_NAME"
    echo_info "Use ./list-features.sh to see active deployments"
    exit 1
}

# Parse deployment info
PM2_NAME=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.pm2Name)")

echo_info "📋 Viewing logs for: $FEATURE_NAME ($PM2_NAME)"
echo ""

# Try PM2 logs first (more comprehensive)
if command -v pm2 >/dev/null 2>&1; then
    if [ "$FOLLOW" == "true" ]; then
        echo_info "Following logs (Ctrl+C to exit)..."
        pm2 logs "$PM2_NAME" --lines "$LINES"
    else
        pm2 logs "$PM2_NAME" --lines "$LINES" --nostream
    fi
else
    # Fallback to direct log file
    LOG_FILE="$LOGS_DIR/$FEATURE_NAME.log"
    
    if [ -f "$LOG_FILE" ]; then
        if [ "$FOLLOW" == "true" ]; then
            echo_info "Following logs from file (Ctrl+C to exit)..."
            tail -n "$LINES" -f "$LOG_FILE"
        else
            echo_info "Last $LINES lines from log file:"
            tail -n "$LINES" "$LOG_FILE"
        fi
    else
        echo_error "Log file not found: $LOG_FILE"
        echo_info "PM2 might not be available or logs are in a different location"
        exit 1
    fi
fi