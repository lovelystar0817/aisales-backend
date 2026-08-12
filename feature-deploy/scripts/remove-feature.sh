#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_ROOT="$(dirname "$PROJECT_ROOT")"
LOGS_DIR="$SCRIPT_DIR/../logs"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FEATURE_NAME=""
FORCE=false

show_usage() {
    echo "Usage: $0 <feature-name> [options]"
    echo ""
    echo "Options:"
    echo "  --force            Force removal without confirmation"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 auth-feature"
    echo "  $0 payment --force"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
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
PM2_NAME="aisales-$FEATURE_NAME"
WORKTREE_DIR="$DEPLOY_ROOT/aisales-backend-$FEATURE_NAME"

echo_info "🗑️  Removing feature deployment: $FEATURE_NAME"

# Check if deployment exists
MAPPING_PATH="$SCRIPT_DIR/../../../feature-deployment-mappings.json"
if [ ! -f "$MAPPING_PATH" ]; then
    echo_error "No deployments found"
    exit 1
fi

DEPLOYMENT_INFO=$(node -e "
const fs = require('fs');
const path = require('path');
const mappingPath = '$MAPPING_PATH';
const deployments = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Find deployment by name
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
APP_PORT=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.appPort)")
BRANCH=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.branch)")
SUBDOMAIN=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.subdomain)")
HAS_LIVEKIT=$(echo "$DEPLOYMENT_INFO" | node -e "const d = JSON.parse(require('fs').readFileSync(0, 'utf8')); console.log(d.hasLivekit || false)")

# Show deployment details
echo_info "Deployment details:"
echo "   Branch: $BRANCH"
echo "   App Port: $APP_PORT"
echo "   Subdomain: $SUBDOMAIN"
echo "   Directory: $WORKTREE_DIR"
echo "   PM2 Process: $PM2_NAME"
if [ "$HAS_LIVEKIT" == "true" ]; then
    echo "   LiveKit Agent: aisales-livekit-agent-${FEATURE_NAME}"
fi
echo ""

# Confirm removal
if [ "$FORCE" != "true" ]; then
    echo -n "Are you sure you want to remove this deployment? (y/N): "
    read -r CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        echo_info "Removal cancelled"
        exit 0
    fi
fi

# Stop and delete PM2 process
echo_info "Stopping PM2 process..."
pm2 delete "$PM2_NAME" 2>/dev/null || {
    echo_warning "PM2 process not found or already stopped"
}

# Save PM2 configuration
pm2 save 2>/dev/null || true

# Remove git worktree
echo_info "Removing git worktree..."
if [ -d "$WORKTREE_DIR" ]; then
    cd "$PROJECT_ROOT"
    git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || {
        echo_warning "Could not remove worktree via git, removing directory directly"
        rm -rf "$WORKTREE_DIR"
    }
else
    echo_warning "Worktree directory not found"
fi

# Clean up git worktree list
cd "$PROJECT_ROOT"
git worktree prune 2>/dev/null || true

# Remove from deployment registry
echo_info "Updating deployment registry..."
node -e "
const fs = require('fs');
const path = require('path');

// Remove from single source of truth file
const mappingPath = '$MAPPING_PATH';
if (fs.existsSync(mappingPath)) {
    try {
        const deployments = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        
        // Find and remove the deployment
        let found = false;
        Object.keys(deployments).forEach(branch => {
            if (deployments[branch] && deployments[branch].name === '$FEATURE_NAME') {
                delete deployments[branch];
                found = true;
                console.log('Removed deployment: ' + branch);
            }
        });
        
        if (found) {
            fs.writeFileSync(mappingPath, JSON.stringify(deployments, null, 2));
            console.log('Updated deployments file');
        } else {
            console.warn('Deployment not found in registry');
        }
    } catch (e) {
        console.error('Could not update deployments file:', e.message);
    }
} else {
    console.warn('Deployments file not found');
}
"

# Remove log files
echo_info "Cleaning up log files..."
if [ -f "$LOGS_DIR/$FEATURE_NAME.log" ]; then
    rm -f "$LOGS_DIR/$FEATURE_NAME.log"
    rm -f "$LOGS_DIR/$FEATURE_NAME-*.log"
else
    echo_warning "No log files found"
fi

# Remove LiveKit agent if it was deployed (check registry AND Docker)
LIVEKIT_CONTAINER="aisales-livekit-agent-${FEATURE_NAME}"
LIVEKIT_EXISTS=false
if [ "$HAS_LIVEKIT" == "true" ]; then
    LIVEKIT_EXISTS=true
elif docker ps -a --filter "name=^${LIVEKIT_CONTAINER}$" --format '{{.Names}}' 2>/dev/null | grep -q "^${LIVEKIT_CONTAINER}$"; then
    LIVEKIT_EXISTS=true
    echo_warning "LiveKit container found but not tracked in registry"
fi

if [ "$LIVEKIT_EXISTS" == "true" ]; then
    echo ""
    echo_info "Removing LiveKit agent deployment..."
    "$SCRIPT_DIR/remove-livekit-feature.sh" "$FEATURE_NAME" --force || {
        echo_warning "Failed to remove LiveKit agent, but continuing..."
    }
fi

# Show success message
echo ""
echo_success "✨ Feature deployment removed successfully!"
echo_info "App port $APP_PORT and subdomain $SUBDOMAIN are now available for reuse"
echo ""