#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_ROOT="$(dirname "$PROJECT_ROOT")"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FEATURE_NAME=""
SUBDOMAIN=""
FORCE=false

show_usage() {
    echo "Usage: $0 <feature-name> [options]"
    echo ""
    echo "Deploy LiveKit agent for a feature branch"
    echo ""
    echo "Options:"
    echo "  --subdomain <name> Backend subdomain (e.g. feature03)"
    echo "  --force            Force deployment even if container exists"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 my-feature --subdomain feature03"
    echo "  $0 auth-improvements --force"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --subdomain)
            SUBDOMAIN="$2"
            shift 2
            ;;
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

# Clean feature name (sanitize special characters, matching deploy-feature.sh behavior)
FEATURE_NAME=$(echo "$FEATURE_NAME" | sed 's/[^a-zA-Z0-9-]/-/g' | sed 's/^-*//' | sed 's/-*$//')
WORKTREE_DIR="$DEPLOY_ROOT/aisales-backend-$FEATURE_NAME"

# Resolve subdomain from deployment registry if not provided
if [ -z "$SUBDOMAIN" ]; then
    MAPPING_FILE="$DEPLOY_ROOT/feature-deployment-mappings.json"
    if [ -f "$MAPPING_FILE" ]; then
        SUBDOMAIN=$(node -e "
            const data = JSON.parse(require('fs').readFileSync('$MAPPING_FILE', 'utf8'));
            const dep = Object.values(data).find(d => d && d.name === '$FEATURE_NAME');
            if (dep && dep.subdomain) console.log(dep.subdomain);
        " 2>/dev/null || true)
    fi
    if [ -z "$SUBDOMAIN" ]; then
        echo_error "Could not determine backend subdomain. Pass --subdomain or deploy backend first."
        exit 1
    fi
fi

FEATURE_BACKEND_URL="https://${SUBDOMAIN}.trainapi.hupo.co"

echo_info "🎙️  Deploying LiveKit agent for feature: $FEATURE_NAME"

# Check if worktree exists
if [ ! -d "$WORKTREE_DIR" ]; then
    echo_error "Worktree not found: $WORKTREE_DIR"
    echo_info "Please deploy the backend feature first using ./deploy-feature.sh"
    exit 1
fi

# Navigate to livekit-service directory in the worktree
LIVEKIT_SERVICE_DIR="$WORKTREE_DIR/livekit-service"
if [ ! -d "$LIVEKIT_SERVICE_DIR" ]; then
    echo_error "livekit-service directory not found in worktree"
    exit 1
fi

cd "$LIVEKIT_SERVICE_DIR"
echo_info "Working directory: $LIVEKIT_SERVICE_DIR"

# Copy .env from project root livekit-service
LIVEKIT_ENV_SOURCE="$PROJECT_ROOT/livekit-service/.env"
if [ ! -f "$LIVEKIT_ENV_SOURCE" ]; then
    echo_error "LiveKit .env not found at: $LIVEKIT_ENV_SOURCE"
    echo_info "Please ensure livekit-service/.env exists in your main project"
    exit 1
fi

cp "$LIVEKIT_ENV_SOURCE" .env
echo_success "✓ Copied LiveKit .env from main project"

# Configure feature-specific values
LIVEKIT_AGENT_NAME="aisales-livekit-agent-${FEATURE_NAME}"

echo_info "Configuring LiveKit agent..."
echo_info "  Agent Name: $LIVEKIT_AGENT_NAME"
echo_info "  Backend URL: $FEATURE_BACKEND_URL"

# Update AGENT_NAME in .env
if grep -q "^AGENT_NAME=" .env; then
    sed -i.bak "s|^AGENT_NAME=.*|AGENT_NAME=${LIVEKIT_AGENT_NAME}|" .env
else
    echo "AGENT_NAME=${LIVEKIT_AGENT_NAME}" >> .env
fi

# Update BASE_URL in .env
if grep -q "^BASE_URL=" .env; then
    sed -i.bak "s|^BASE_URL=.*|BASE_URL=${FEATURE_BACKEND_URL}|" .env
else
    echo "BASE_URL=${FEATURE_BACKEND_URL}" >> .env
fi

# Set environment to feature
if grep -q "^ENVIRONMENT=" .env; then
    sed -i.bak "s|^ENVIRONMENT=.*|ENVIRONMENT=feature|" .env
else
    echo "ENVIRONMENT=feature" >> .env
fi

# Clean up backup files
rm -f .env.bak

echo_success "✓ LiveKit .env configured"

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

echo_success "✓ Docker is running"

# Use deploy.sh from the main project root so feature deploys always get
# the latest deployment infrastructure, regardless of the feature branch.
DEPLOY_SCRIPT="$PROJECT_ROOT/livekit-service/deploy.sh"
if [ ! -f "$DEPLOY_SCRIPT" ]; then
    echo_error "deploy.sh not found at: $DEPLOY_SCRIPT"
    exit 1
fi

# Deploy using deploy.sh with feature name as parameter
echo_info "Starting LiveKit agent deployment..."
echo_info "Container name will be: aisales-livekit-agent-${FEATURE_NAME}"

if [ "$FORCE" == "true" ]; then
    echo_warning "Force mode: Will recreate container if it exists"
fi

"$DEPLOY_SCRIPT" dev "$FEATURE_NAME" || {
    echo_error "LiveKit agent deployment failed"
    exit 1
}

echo ""
echo_success "✨ LiveKit agent deployed successfully!"
echo ""
echo_info "📋 LiveKit Deployment Details:"
echo "   Feature: $FEATURE_NAME"
echo "   Agent Name: $LIVEKIT_AGENT_NAME"
echo "   Container: aisales-livekit-agent-${FEATURE_NAME}"
echo "   Backend URL: $FEATURE_BACKEND_URL"
echo "   Environment: feature"
echo ""
echo_info "📝 Useful commands:"
echo "   View logs:    docker logs -f aisales-livekit-agent-${FEATURE_NAME}"
echo "   Restart:      docker restart aisales-livekit-agent-${FEATURE_NAME}"
echo "   Stop:         docker stop aisales-livekit-agent-${FEATURE_NAME}"
echo "   Remove:       ./remove-livekit-feature.sh $FEATURE_NAME"
echo ""
