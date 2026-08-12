#!/bin/bash

# LiveKit Agent Deployment Script
# Supports both production and development deployments with zero downtime
# Usage: ./deploy.sh [prod|dev] [feature-name] [--skip-build]
#   feature-name: (optional) Feature branch name for feature deployments
#   --skip-build: (dev only) Skip rebuilding the image if it exists

set -e

# Parse environment argument (default to prod)
DEPLOY_ENV=${1:-prod}

# Parse feature name argument (optional, for feature deployments)
FEATURE_NAME=${2:-""}

# Configuration
if [ "$DEPLOY_ENV" = "dev" ]; then
    if [ -n "$FEATURE_NAME" ]; then
        # Feature deployment
        PROJECT_NAME="aisales-feature-${FEATURE_NAME}"
        APP_NAME="aisales-livekit-agent-${FEATURE_NAME}"
    else
        # Regular dev deployment
        PROJECT_NAME="aisales-dev"
        APP_NAME="aisales-livekit-agent-dev"
    fi
else
    PROJECT_NAME="aisales"
    APP_NAME="aisales-livekit-agent"
fi

SERVICE_NAME="livekit-agent"
SERVICE_DIR="livekit-service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Function to check if .env file exists and has required variables
check_env_file() {
    if [[ ! -f ".env" ]]; then
        error "❌ .env file not found!"
        echo ""
        echo "Please create a .env file with your API keys. You can use .env.template as a starting point:"
        echo "  cp .env.template .env"
        echo "  # Edit .env with your actual API keys"
        echo ""
        exit 1
    fi

    # Check for required environment variables
    source .env
    local missing_vars=()
    
    [[ -z "$OPENAI_API_KEY" ]] && missing_vars+=("OPENAI_API_KEY")
    [[ -z "$ELEVENLABS_API_KEY" ]] && missing_vars+=("ELEVENLABS_API_KEY")
    [[ -z "$LIVEKIT_API_KEY" ]] && missing_vars+=("LIVEKIT_API_KEY")
    [[ -z "$LIVEKIT_API_SECRET" ]] && missing_vars+=("LIVEKIT_API_SECRET")
    [[ -z "$LIVEKIT_URL" ]] && missing_vars+=("LIVEKIT_URL")
    [[ -z "$GOOGLE_CREDENTIALS_PATH" ]] && missing_vars+=("GOOGLE_CREDENTIALS_PATH")

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        error "❌ Missing required environment variables in .env file:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Please update your .env file with the missing variables."
        exit 1
    fi

    # Check if Google credentials file exists
    if [[ ! -f "$GOOGLE_CREDENTIALS_PATH" ]]; then
        error "❌ Google credentials file not found at: $GOOGLE_CREDENTIALS_PATH"
        echo "Please ensure the file exists and GOOGLE_CREDENTIALS_PATH is correct in .env"
        exit 1
    fi

    log "✅ Environment variables and credentials validated"
}

# Function to check if a container is healthy
check_container_health() {
    local container_name=$1
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        # Check if container exists and is running
        if docker ps --filter "name=$container_name" --filter "status=running" | grep -q "$container_name"; then
            # Check if Python processes are running (pidof returns 0 if found)
            # We use pidof since pgrep is not available in python:3.12-slim
            if docker exec "$container_name" pidof python > /dev/null 2>&1; then
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo -n "."
            sleep 2
        fi
    done
    
    return 1
}

# Change to service directory
if [[ -d "$SERVICE_DIR" ]]; then
    cd "$SERVICE_DIR"
    log "📂 Changed to $SERVICE_DIR directory"
fi

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        error "❌ Docker Desktop is not running!"
        error "Please start Docker Desktop and try again."
    else
        error "❌ Docker daemon is not running!"
        error "Please start Docker service: sudo systemctl start docker"
    fi
    exit 1
fi

log "✅ Docker is running"

# Detect Docker Compose command
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    log "✅ Using Docker Compose V2"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    warn "⚠️  Using legacy docker-compose. Consider upgrading to Docker Compose V2"
else
    error "❌ Neither 'docker compose' nor 'docker-compose' found!"
    echo "Please install Docker Compose. See: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if there are uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    warn "⚠️  You have uncommitted changes. Continuing anyway..."
fi

# Get current commit hash and build info
COMMIT_HASH=$(git rev-parse --short HEAD)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
if [ -n "$FEATURE_NAME" ]; then
    IMAGE_TAG="${PROJECT_NAME}-livekit-agent:${COMMIT_HASH}"
else
    IMAGE_TAG="${APP_NAME}:${COMMIT_HASH}"
fi
DEPLOYMENT_ID=$(date +%s)

# Export variables immediately for docker-compose
export COMMIT_HASH BUILD_DATE DEPLOYMENT_ID

log "🚀 Starting zero-downtime deployment for $PROJECT_NAME LiveKit Agent"
info "📋 Deployment Info:"
info "   - Environment: $DEPLOY_ENV"
if [ -n "$FEATURE_NAME" ]; then
    info "   - Feature: $FEATURE_NAME"
fi
info "   - Project: $PROJECT_NAME"
info "   - Container: $APP_NAME"
info "   - Commit: $COMMIT_HASH"
info "   - Build Date: $BUILD_DATE"
info "   - Image Tag: $IMAGE_TAG"
info "   - Deployment ID: $DEPLOYMENT_ID"

# Check environment file
check_env_file

# Pull latest changes (skip for dev)
if [ "$DEPLOY_ENV" = "prod" ]; then
    log "📥 Pulling latest changes from GitHub..."
    git pull origin main
else
    warn "⚠️  Skipping git pull for development deployment"
fi

# Update .env file with build information
log "📝 Updating .env file with build info..."
# Create a temporary file to avoid issues with in-place editing
cp .env .env.backup
awk -v commit="$COMMIT_HASH" -v date="$BUILD_DATE" '
/^COMMIT_HASH=/ { print "COMMIT_HASH=" commit; next }
/^BUILD_DATE=/ { print "BUILD_DATE=" date; next }
{ print }
' .env.backup > .env

# Clean up backup file
rm -f .env.backup

# Check if Docker Compose file exists
if [[ ! -f "docker-compose.yml" ]]; then
    error "❌ docker-compose.yml not found!"
    exit 1
fi

# Set compose files based on environment
if [ "$DEPLOY_ENV" = "dev" ]; then
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.dev.yml"
    info "🔧 Using development configuration"
else
    COMPOSE_FILES="-f docker-compose.yml"
    info "🚀 Using production configuration"
fi

# Define container names
OLD_CONTAINER="${APP_NAME}"
NEW_CONTAINER="${APP_NAME}-new-${DEPLOYMENT_ID}"

# Clean up any stale containers from previous failed deploys
STALE_CONTAINERS=$(docker ps -a --filter "name=${APP_NAME}-new-" --format "{{.Names}}" 2>/dev/null || true)
if [ -n "$STALE_CONTAINERS" ]; then
    warn "🧹 Cleaning up stale containers from previous deploys..."
    echo "$STALE_CONTAINERS" | xargs -r docker rm -f 2>/dev/null || true
fi

# Check if old container is running
OLD_CONTAINER_RUNNING=false
if docker ps --filter "name=^${OLD_CONTAINER}$" --filter "status=running" | grep -q "$OLD_CONTAINER"; then
    OLD_CONTAINER_RUNNING=true
    log "📦 Found existing container: $OLD_CONTAINER"
else
    warn "⚠️  No existing container found. Proceeding with standard deployment."
fi

# Build new image
log "🔨 Building new image: $IMAGE_TAG"
if [ "$DEPLOY_ENV" = "prod" ]; then
    # Production: always rebuild from scratch
    $COMPOSE_CMD $COMPOSE_FILES -p $PROJECT_NAME build --no-cache
else
    # Development: check if image exists and skip build if requested
    if [ "$2" = "--skip-build" ]; then
        if docker images | grep -q "^${PROJECT_NAME}-${SERVICE_NAME}.*latest"; then
            warn "⚠️  Skipping build, using existing image"
        else
            error "❌ No existing image found. Cannot skip build."
            exit 1
        fi
    else
        # Use Docker layer cache for faster rebuilds
        # Docker will only rebuild layers that changed (e.g., if requirements.txt or code changes)
        log "📦 Building with layer cache for development (fast!)"
        $COMPOSE_CMD $COMPOSE_FILES -p $PROJECT_NAME build
    fi
fi

# Tag the image for easy identification
BUILT_IMAGE="${PROJECT_NAME}-${SERVICE_NAME}"

# Try to find and tag the built image
if docker images | grep -q "$BUILT_IMAGE"; then
    docker tag "${BUILT_IMAGE}:latest" "$IMAGE_TAG"
    log "✅ Tagged image: $IMAGE_TAG"
else
    # Alternative naming pattern
    BUILT_IMAGE="${PROJECT_NAME}_${SERVICE_NAME}"
    if docker images | grep -q "$BUILT_IMAGE"; then
        docker tag "${BUILT_IMAGE}:latest" "$IMAGE_TAG"
        log "✅ Tagged image: $IMAGE_TAG"
    else
        warn "⚠️  Could not tag image automatically"
    fi
fi

# Ensure the Docker network exists
NETWORK_NAME="${PROJECT_NAME}_livekit-network"
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    log "🌐 Creating Docker network: $NETWORK_NAME"
    docker network create "$NETWORK_NAME"
else
    log "✅ Docker network exists: $NETWORK_NAME"
fi

# Create a temporary docker-compose file for the new deployment
log "📝 Creating temporary deployment configuration..."
cat > docker-compose.temp.yml <<EOF
services:
  ${SERVICE_NAME}-new:
    image: ${BUILT_IMAGE}:latest
    container_name: ${NEW_CONTAINER}
    env_file:
      - .env
    environment:
      - COMMIT_HASH=${COMMIT_HASH}
      - BUILD_DATE=${BUILD_DATE}
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs:rw
      - ${GOOGLE_CREDENTIALS_PATH}:/app/google-credentials.json:ro
    networks:
      - livekit-network
    labels:
      - "com.livekit.service=agent"
      - "deployment.id=${DEPLOYMENT_ID}"
      - "deployment.type=blue-green"
      - "deployment.stage=new"

networks:
  livekit-network:
    external: true
    name: ${PROJECT_NAME}_livekit-network
EOF

# Start the new container
log "▶️  Starting new container: $NEW_CONTAINER"
$COMPOSE_CMD -f docker-compose.temp.yml -p "${PROJECT_NAME}-temp-${DEPLOYMENT_ID}" up -d

# Wait for new container to be healthy
log "⏳ Waiting for new container to be healthy..."
if check_container_health "$NEW_CONTAINER"; then
    echo ""
    log "✅ New container is healthy!"
    
    # Perform additional health checks
    log "🔍 Performing additional health checks..."
    
    # Check container logs for errors
    RECENT_LOGS=$(docker logs "$NEW_CONTAINER" --tail 50 2>&1)
    if echo "$RECENT_LOGS" | grep -qi "error\|exception\|failed"; then
        warn "⚠️  Found potential errors in logs. Reviewing..."
        # Continue but show warning
    fi
    
    # If old container exists, switch traffic
    if [ "$OLD_CONTAINER_RUNNING" = true ]; then
        log "🔄 Switching from old to new container..."
        
        # Stop old container gracefully
        log "🛑 Stopping old container: $OLD_CONTAINER"
        docker stop --time=30 "$OLD_CONTAINER" || true
        
        # Remove old container
        log "🗑️  Removing old container: $OLD_CONTAINER"
        docker rm "$OLD_CONTAINER" || true
        
        # Rename new container to standard name
        log "✏️  Renaming new container to standard name..."
        docker rename "$NEW_CONTAINER" "$OLD_CONTAINER"
        
        log "✅ Traffic switched successfully!"
    else
        # No old container, just rename the new one
        log "✏️  Renaming container to standard name..."
        docker rename "$NEW_CONTAINER" "$OLD_CONTAINER"
    fi
    
    # Clean up temporary compose file
    # NOTE: Do NOT run "docker compose down" here — it would remove the container
    # we just renamed, since Compose tracks containers by internal labels, not name.
    log "🧹 Cleaning up temporary files..."
    rm -f docker-compose.temp.yml

    log "✅ Deployment complete — container is running as: $OLD_CONTAINER"

else
    echo ""
    error "❌ New container failed health check!"
    
    # Show logs for debugging
    error "📊 Container logs:"
    docker logs "$NEW_CONTAINER" --tail=50
    
    # Rollback: stop and remove the new container
    log "⏮️  Rolling back deployment..."
    docker stop "$NEW_CONTAINER" || true
    docker rm "$NEW_CONTAINER" || true
    
    # Clean up temporary files
    $COMPOSE_CMD -f docker-compose.temp.yml -p "${PROJECT_NAME}-temp-${DEPLOYMENT_ID}" down --remove-orphans || true
    rm -f docker-compose.temp.yml
    
    if [ "$OLD_CONTAINER_RUNNING" = true ]; then
        log "✅ Old container is still running. Deployment rolled back."
    else
        error "❌ No container is running. Please run standard deployment."
    fi
    
    exit 1
fi

# Show deployment summary
log "✅ Zero-downtime deployment successful!"
echo ""
info "📊 Deployment Summary:"
info "   - Project: $PROJECT_NAME"
info "   - Service: LiveKit Agent"
info "   - Container: $APP_NAME"
info "   - Commit: $COMMIT_HASH"
info "   - Image: $IMAGE_TAG"
info "   - Build Date: $BUILD_DATE"
info "   - Network: ${PROJECT_NAME}_livekit-network"
info "   - Downtime: ~0 seconds"
echo ""

# Show running containers
info "🐳 Running containers:"
docker ps --filter "name=$APP_NAME"

# Show recent logs
info "📋 Recent logs:"
docker logs "$APP_NAME" --tail=20

# Optional: Clean up old images (keep last 5)
log "🧹 Cleaning up old images..."
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}" | grep "^${APP_NAME}" | tail -n +6 | awk '{print $3}' | xargs -r docker rmi 2>/dev/null || true

echo ""
log "🎉 $PROJECT_NAME LiveKit Agent deployment complete!"
info "💡 Useful commands:"
info "   - View logs: docker logs -f $APP_NAME"
info "   - Restart: docker restart $APP_NAME"
info "   - Stop: docker stop $APP_NAME"
info "   - Status: docker ps --filter name=$APP_NAME"