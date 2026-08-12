#!/bin/bash

# Exit immediately if any command fails
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log "🚀 Starting LiveKit Agent..."

# Force production environment unless explicitly overridden
if [ -z "$ENVIRONMENT" ]; then
    if [ "$DEBUG" != "true" ]; then
        export ENVIRONMENT=prod
        log "⚙️  Setting ENVIRONMENT=prod"
    fi
fi

# Validate environment value
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    warn "⚠️  Unknown ENVIRONMENT value: $ENVIRONMENT, defaulting to prod"
    export ENVIRONMENT=prod
fi

# Display build information
echo "============================================"
echo "🚀 LIVEKIT AGENT STARTUP"
echo "============================================"
info "Build Information:"
info "  - Version: ${VERSION:-unknown}"
info "  - Commit: ${COMMIT_HASH:-unknown}"
info "  - Build Date: ${BUILD_DATE:-unknown}"
warn "  - ENVIRONMENT: ${ENVIRONMENT:-prod} (IMPORTANT!)"
info "  - Debug Mode: ${DEBUG:-false}"
echo "============================================"

# Configure resource limits
log "⚙️  Configuring resource limits..."

# Set file descriptor limit
ulimit -n ${AGENT_MAX_FDS:-65536}
log "  - File descriptor limit: $(ulimit -n)"

# Set stack size to prevent excessive memory usage
ulimit -s 8192  # 8MB stack size
log "  - Stack size limit: $(ulimit -s)KB"

# Set memory limit if specified
if [ -n "$AGENT_MAX_MEMORY_MB" ]; then
    # Convert MB to KB for ulimit
    MEMORY_KB=$((AGENT_MAX_MEMORY_MB * 1024))
    ulimit -v $MEMORY_KB 2>/dev/null || warn "  - Could not set virtual memory limit (may not be supported in container)"
    info "  - Target memory limit: ${AGENT_MAX_MEMORY_MB}MB"
fi

# Display all limits
info "Current resource limits:"
ulimit -a | sed 's/^/  /'

# Check required environment variables
log "🔍 Checking environment variables..."
REQUIRED_VARS=(
    "LIVEKIT_API_KEY"
    "LIVEKIT_API_SECRET"
    "LIVEKIT_URL"
    "OPENAI_API_KEY"
    "ELEVENLABS_API_KEY"
    "BASE_URL"
)

missing_vars=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    error "❌ Missing required environment variables:"
    printf '  - %s\n' "${missing_vars[@]}"
    exit 1
fi

log "✅ All required environment variables are set"

# Log non-sensitive configuration
info "Configuration:"
info "  - LIVEKIT_URL: $LIVEKIT_URL"
info "  - BASE_URL: $BASE_URL"
info "  - AGENT_NAME: ${AGENT_NAME:-not set}"
info "  - ENVIRONMENT: ${ENVIRONMENT:-prod}"
info "  - Memory Limit: ${AGENT_MAX_MEMORY_MB:-not set}MB"
info "  - FD Limit: ${AGENT_MAX_FDS:-65536}"

# Step 1: Download required files (if needed)
if [ -f "livekit-agent.py" ] && grep -q "download-files" "livekit-agent.py"; then
    log "📥 Downloading LiveKit agent files..."
    if python livekit-agent.py download-files; then
        log "✅ Download completed successfully"
    else
        error "❌ Failed to download required files"
        error "Agent cannot start without required files"
        exit 1
    fi
fi

# Step 2: Start the agent with exec for proper signal handling
log "▶️  Starting LiveKit agent process..."

# Use exec to replace the shell process with Python
# This ensures proper signal handling for graceful shutdown
exec python -u livekit-agent.py start