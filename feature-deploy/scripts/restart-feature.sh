#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="$SCRIPT_DIR/../config"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FEATURE_NAME=""

show_usage() {
    echo "Usage: $0 <feature-name>"
    echo ""
    echo "Examples:"
    echo "  $0 auth-feature"
    echo "  $0 payment"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
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

echo_info "🔄 Restarting feature: $FEATURE_NAME"

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
PORT=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.appPort)")

# Restart PM2 process
echo_info "Restarting PM2 process: $PM2_NAME"
pm2 restart "$PM2_NAME" || {
    echo_error "Failed to restart PM2 process"
    echo_info "Process might not be running. Try: pm2 list"
    exit 1
}

# Wait a moment and check status
sleep 2
STATUS=$(pm2 jlist 2>/dev/null | node -e "
const stdin = process.stdin;
let data = '';
stdin.on('data', chunk => data += chunk);
stdin.on('end', () => {
    try {
        const apps = JSON.parse(data);
        const app = apps.find(a => a.name === '$PM2_NAME');
        if (app) {
            console.log(app.pm2_env.status);
        } else {
            console.log('not_found');
        }
    } catch (e) {
        console.log('error');
    }
});
" || echo "error")

if [ "$STATUS" == "online" ]; then
    echo_success "✨ Feature restarted successfully!"
    echo_info "Process is running on port $PORT"
elif [ "$STATUS" == "stopped" ]; then
    echo_warning "Process restarted but is currently stopped"
    echo_info "Try: pm2 start $PM2_NAME"
else
    echo_error "Failed to verify restart status"
fi

echo_info "View logs with: ./logs-feature.sh $FEATURE_NAME"
echo ""