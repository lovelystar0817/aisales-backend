#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FEATURE_NAME=""
FORCE=false

show_usage() {
    echo "Usage: $0 <feature-name> [options]"
    echo ""
    echo "Remove LiveKit agent deployment for a feature"
    echo ""
    echo "Options:"
    echo "  --force            Force removal without confirmation"
    echo "  -h, --help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 my-feature"
    echo "  $0 auth-improvements --force"
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
CONTAINER_NAME="aisales-livekit-agent-${FEATURE_NAME}"

echo_info "🗑️  Removing LiveKit agent deployment: $FEATURE_NAME"
echo_info "   Container: $CONTAINER_NAME"

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo_warning "Docker is not running. Skipping Docker cleanup."
else
    # Check if container exists
    if docker ps -a --filter "name=^${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo_info "Container found: $CONTAINER_NAME"

        # Confirm removal
        if [ "$FORCE" != "true" ]; then
            echo -n "Are you sure you want to remove this LiveKit agent? (y/N): "
            read -r CONFIRM
            if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
                echo_info "Removal cancelled"
                exit 0
            fi
        fi

        # Stop container if running
        if docker ps --filter "name=^${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            echo_info "Stopping container..."
            docker stop "$CONTAINER_NAME" || {
                echo_warning "Failed to stop container gracefully"
            }
        fi

        # Remove container
        echo_info "Removing container..."
        docker rm "$CONTAINER_NAME" || {
            echo_warning "Failed to remove container"
        }

        echo_success "✓ Container removed: $CONTAINER_NAME"
    else
        echo_warning "Container not found: $CONTAINER_NAME"
    fi

    # Clean up Docker network
    NETWORK_NAME="aisales-feature-${FEATURE_NAME}_livekit-network"
    if docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
        echo_info "Removing Docker network: $NETWORK_NAME"
        docker network rm "$NETWORK_NAME" 2>/dev/null || {
            echo_warning "Failed to remove network (may still be in use)"
        }
    fi

    # Clean up Docker images for this feature
    FEATURE_IMAGES=$(docker images --format '{{.Repository}}:{{.Tag}}' | grep "aisales-feature-${FEATURE_NAME}-livekit-agent" || true)
    if [ -n "$FEATURE_IMAGES" ]; then
        echo_info "Removing Docker images..."
        echo "$FEATURE_IMAGES" | xargs -r docker rmi 2>/dev/null || {
            echo_warning "Some images could not be removed"
        }
    fi
fi

# Show success message
echo ""
echo_success "✨ LiveKit agent deployment removed!"
echo_info "Container $CONTAINER_NAME has been stopped and removed"
echo ""
