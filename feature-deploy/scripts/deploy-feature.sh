#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOY_ROOT="$(dirname "$PROJECT_ROOT")"
CONFIG_DIR="$SCRIPT_DIR/../config"
LOGS_DIR="$SCRIPT_DIR/../logs"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"
source "$SCRIPT_DIR/lib/ports.sh"

# Parse arguments
FEATURE_BRANCH=""
SUBDOMAIN=""
ENV_FILE=".env.staging"
SKIP_BUILD=false
FORCE=false
PR_NUMBER=""
PRODUCTION_MODE=false
WITH_LIVEKIT=false

show_usage() {
    echo "Usage: $0 <feature-branch> [options]"
    echo ""
    echo "Options:"
    echo "  -s, --subdomain <name> Specify subdomain (default: auto-assign from feature03-feature20)"
    echo "  -e, --env <file>       Environment file to use (default: .env.staging)"
    echo "  --skip-build           Skip npm build step"
    echo "  --force               Force deployment even if already exists"
    echo "  --pr <number>         Associate with PR number"
    echo "  --production          Use production PM2 environment"
    echo "  --with-livekit        Deploy LiveKit agent from same feature branch"
    echo "  -h, --help            Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--subdomain)
            SUBDOMAIN="$2"
            shift 2
            ;;
        -e|--env)
            ENV_FILE="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --pr)
            PR_NUMBER="$2"
            shift 2
            ;;
        --production)
            PRODUCTION_MODE=true
            shift
            ;;
        --with-livekit)
            WITH_LIVEKIT=true
            shift
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            if [ -z "$FEATURE_BRANCH" ]; then
                FEATURE_BRANCH="$1"
            else
                echo_error "Unknown option: $1"
                show_usage
            fi
            shift
            ;;
    esac
done

# Validate arguments
if [ -z "$FEATURE_BRANCH" ]; then
    echo_error "Error: Feature branch name is required"
    show_usage
fi

# Extract feature name from branch
FEATURE_NAME=$(echo "$FEATURE_BRANCH" | sed 's/[^a-zA-Z0-9-]/-/g' | sed 's/^-*//' | sed 's/-*$//')
WORKTREE_DIR="$DEPLOY_ROOT/aisales-backend-$FEATURE_NAME"
PM2_NAME="aisales-$FEATURE_NAME"

echo_info "🚀 Deploying feature: $FEATURE_NAME"
echo_info "   Branch: $FEATURE_BRANCH"
echo_info "   Directory: $WORKTREE_DIR"

# Check if deployment already exists and retrieve its port/subdomain
EXISTING_PORT=""
EXISTING_SUBDOMAIN=""
MAPPING_FILE="$DEPLOY_ROOT/feature-deployment-mappings.json"

if [ -f "$MAPPING_FILE" ]; then
    EXISTING_INFO=$(node -e "
        const fs = require('fs');
        const data = JSON.parse(fs.readFileSync('$MAPPING_FILE', 'utf8'));
        const entry = data['$FEATURE_BRANCH'];
        if (entry && entry.appPort) {
            console.log(entry.appPort + ' ' + entry.subdomain);
        }
    " 2>/dev/null || echo "")

    if [ -n "$EXISTING_INFO" ]; then
        EXISTING_PORT=$(echo "$EXISTING_INFO" | awk '{print $1}')
        EXISTING_SUBDOMAIN=$(echo "$EXISTING_INFO" | awk '{print $2}')
    fi
fi

if [ -n "$EXISTING_PORT" ]; then
    # Existing deployment found - reuse its port/subdomain and enable force mode
    if [ "$FORCE" != "true" ]; then
        echo_info "Existing deployment found, enabling --force for redeploy"
        FORCE=true
    fi
    APP_PORT="$EXISTING_PORT"
    SUBDOMAIN="$EXISTING_SUBDOMAIN"
    echo_success "Reusing existing slot: $SUBDOMAIN (port $APP_PORT)"
elif [ -z "$SUBDOMAIN" ]; then
    # New deployment - auto-assign subdomain/port
    echo_info "Auto-assigning subdomain..."
    APP_PORT=$(find_available_port) || true
    if [ -z "$APP_PORT" ]; then
        echo_error "No available deployment slots"
        exit 1
    fi
    SUBDOMAIN=$(port_to_subdomain "$APP_PORT")
    echo_success "Assigned subdomain: $SUBDOMAIN (port $APP_PORT)"
else
    # User specified subdomain for a new deployment
    if [[ ! "$SUBDOMAIN" =~ ^feature(0[3-9]|1[0-9]|20)$ ]]; then
        echo_error "Invalid subdomain: $SUBDOMAIN (must be feature03-feature20)"
        exit 1
    fi
    APP_PORT=$(subdomain_to_port "$SUBDOMAIN")
    if is_port_in_use "$APP_PORT"; then
        echo_error "Subdomain $SUBDOMAIN is already in use (port $APP_PORT is busy)"
        exit 1
    fi
    echo_info "Using subdomain: $SUBDOMAIN (port $APP_PORT)"
fi

# Get the full URL
DEPLOYMENT_URL=$(port_to_url "$APP_PORT")
echo_info "Deployment URL: $DEPLOYMENT_URL"

# Create or update worktree
echo_info "Setting up git worktree..."
cd "$PROJECT_ROOT"

# Fetch latest changes
git fetch origin

if [ -d "$WORKTREE_DIR" ]; then
    echo_info "Worktree already exists, updating..."

    # Ensure this directory is marked as safe for this user
    git config --global --add safe.directory "$WORKTREE_DIR" 2>/dev/null || true

    cd "$WORKTREE_DIR"
    git fetch origin "$FEATURE_BRANCH"
    git checkout "origin/$FEATURE_BRANCH" --force 2>/dev/null || git reset --hard "origin/$FEATURE_BRANCH"
elif [ ! -d "$WORKTREE_DIR" ]; then
    git worktree add "$WORKTREE_DIR" "origin/$FEATURE_BRANCH" || {
        echo_error "Failed to create worktree. Make sure branch exists on remote."
        echo_info "Push your branch first: git push origin $FEATURE_BRANCH"
        exit 1
    }

    # Add as safe directory for this user
    git config --global --add safe.directory "$WORKTREE_DIR"
    echo_info "Added $WORKTREE_DIR to git safe.directory"
fi

# Setup environment
echo_info "Setting up environment..."
cd "$WORKTREE_DIR"

# Copy environment file from project root (priority order)
ENV_SOURCE=""
ENV_TARGET=""
if [ -f "$PROJECT_ROOT/.env" ]; then
    ENV_SOURCE="$PROJECT_ROOT/.env"
    ENV_TARGET=".env"
    echo_info "Using .env from project root"
elif [ -f "$PROJECT_ROOT/.env.local" ]; then
    ENV_SOURCE="$PROJECT_ROOT/.env.local"
    ENV_TARGET=".env.local"
    echo_info "Using .env.local from project root"
elif [ -f "$PROJECT_ROOT/.env.prod" ]; then
    ENV_SOURCE="$PROJECT_ROOT/.env.prod"
    ENV_TARGET=".env.prod"
    echo_info "Using .env.prod from project root"
elif [ -f "$PROJECT_ROOT/.env.staging" ]; then
    ENV_SOURCE="$PROJECT_ROOT/.env.staging"
    ENV_TARGET=".env.staging"
    echo_info "Using .env.staging from project root"
elif [ -f "$PROJECT_ROOT/$ENV_FILE" ]; then
    ENV_SOURCE="$PROJECT_ROOT/$ENV_FILE"
    ENV_TARGET="$(basename "$ENV_FILE")"
    echo_info "Using $ENV_FILE from project root"
elif [ -f "$CONFIG_DIR/$ENV_FILE" ]; then
    ENV_SOURCE="$CONFIG_DIR/$ENV_FILE"
    ENV_TARGET="$(basename "$ENV_FILE")"
    echo_info "Using $ENV_FILE from deploy/config"
else
    echo_error "No environment file found. Checked:"
    echo "  - $PROJECT_ROOT/.env"
    echo "  - $PROJECT_ROOT/.env.local"
    echo "  - $PROJECT_ROOT/.env.prod"
    echo "  - $PROJECT_ROOT/.env.staging"
    echo "  - $PROJECT_ROOT/$ENV_FILE"
    echo "  - $CONFIG_DIR/$ENV_FILE"
    exit 1
fi

# Copy the selected environment file with same name
cp "$ENV_SOURCE" "$ENV_TARGET"
echo_success "✓ Copied environment to: $ENV_TARGET"

# Apply overrides on top of the base env file.
# 1) .env.feature-overrides        - shared across all features (e.g. staging DATABASE_URL)
# 2) .env.feature-overrides.<name> - optional per-feature overrides
apply_env_overrides() {
    local overrides_file="$1"
    local label="$2"
    if [ ! -f "$overrides_file" ]; then
        return
    fi
    echo_info "Applying $label overrides..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        local key="${line%%=*}"
        local value="${line#*=}"
        key=$(echo "$key" | xargs)
        [ -z "$key" ] && continue
        # Remove existing line (if any) and append the new value.
        # Avoids sed which breaks on special chars like & in URIs.
        grep -v "^${key}=" "$ENV_TARGET" > "$ENV_TARGET.tmp" && mv "$ENV_TARGET.tmp" "$ENV_TARGET"
        echo "${key}=${value}" >> "$ENV_TARGET"
        echo_info "  $key overridden"
    done < "$overrides_file"
    echo_success "✓ $label overrides applied"
}

apply_env_overrides "$PROJECT_ROOT/.env.feature-overrides" "common feature"
apply_env_overrides "$PROJECT_ROOT/.env.feature-overrides.$FEATURE_NAME" "feature-specific ($FEATURE_NAME)"

# Update environment variables in the copied file
echo "" >> "$ENV_TARGET"
echo "# Feature deployment configuration" >> "$ENV_TARGET"
echo "PORT=$APP_PORT" >> "$ENV_TARGET"
echo "FEATURE_ENV=$FEATURE_NAME" >> "$ENV_TARGET"
echo "FEATURE_BRANCH=$FEATURE_BRANCH" >> "$ENV_TARGET"
echo "SENTRY_PROFILING_ENABLED=false" >> "$ENV_TARGET"
FEATURE_FRONTEND_URL="https://$(echo "$FEATURE_BRANCH" | sed 's/\//-/g')--huposalesai.netlify.app"
echo "FEATURE_FRONTEND_URL=$FEATURE_FRONTEND_URL" >> "$ENV_TARGET"

# Add LiveKit agent name if deploying with livekit
if [ "$WITH_LIVEKIT" == "true" ]; then
    LIVEKIT_AGENT_NAME="aisales-livekit-agent-${FEATURE_NAME}"
    echo "LIVEKIT_AGENT_NAME=$LIVEKIT_AGENT_NAME" >> "$ENV_TARGET"
    echo_info "LiveKit agent name configured: $LIVEKIT_AGENT_NAME"
fi

# Install dependencies
echo_info "Installing dependencies..."
# Use npm ci with optional dependencies, but skip prepare script to avoid Husky issues
HUSKY=0 npm ci || {
    echo_error "Failed to install dependencies"
    exit 1
}

# Build if not skipped
if [ "$SKIP_BUILD" != "true" ]; then
    echo_info "Building application..."
    npm run build || {
        echo_error "Build failed"
        exit 1
    }
else
    echo_warning "Skipping build step"
fi

# Stop existing PM2 process if it exists
pm2 delete "$PM2_NAME" 2>/dev/null || true

# Start with PM2
echo_info "Starting application with PM2..."

# Determine if we're using production environment
IS_PRODUCTION=false
NODE_ENV="development"
if [ "$PRODUCTION_MODE" == "true" ]; then
    IS_PRODUCTION=true
    NODE_ENV="production"
elif [ "$ENV_TARGET" == ".env.prod" ] || [ "$ENV_TARGET" == ".env.production" ]; then
    IS_PRODUCTION=true
    NODE_ENV="production"
elif [ "$ENV_TARGET" == ".env.staging" ]; then
    IS_PRODUCTION=true
    NODE_ENV="staging"
fi

# Determine which start script to use
START_SCRIPT="start"
if [ "$IS_PRODUCTION" == "true" ]; then
    echo_info "Production mode detected"
    
    # Check for production-specific start scripts in package.json
    if grep -q '"start:prod"' "$WORKTREE_DIR/package.json" 2>/dev/null; then
        START_SCRIPT="start:prod"
        echo_info "Using npm run start:prod"
    elif grep -q '"start:production"' "$WORKTREE_DIR/package.json" 2>/dev/null; then
        START_SCRIPT="start:production"
        echo_info "Using npm run start:production"
    elif grep -q '"production"' "$WORKTREE_DIR/package.json" 2>/dev/null; then
        START_SCRIPT="production"
        echo_info "Using npm run production"
    else
        echo_info "Using npm run start with NODE_ENV=production"
    fi
fi

# Start PM2 with explicit parameters to ensure isolation
echo_info "Starting PM2 process: $PM2_NAME"
echo_info "  Subdomain: $SUBDOMAIN"
echo_info "  App Port: $APP_PORT (Node.js/internal)"
echo_info "  NODE_ENV: $NODE_ENV"
echo_info "  Script: npm run $START_SCRIPT"

# Build the PM2 command with all overrides
# We DON'T use the pm2.config file to avoid production settings override
# Use env command to set environment variables (use APP_PORT for the application)
env NODE_ENV="$NODE_ENV" PORT="$APP_PORT" pm2 start npm \
    --name "$PM2_NAME" \
    --cwd "$WORKTREE_DIR" \
    --error "$LOGS_DIR/$FEATURE_NAME-error.log" \
    --output "$LOGS_DIR/$FEATURE_NAME-out.log" \
    --log "$LOGS_DIR/$FEATURE_NAME.log" \
    --pid "$LOGS_DIR/$FEATURE_NAME.pid" \
    --time \
    --merge-logs \
    --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
    --update-env \
    -- run "$START_SCRIPT" || {
    echo_error "Failed to start application"
    exit 1
}

echo_success "✓ PM2 process started successfully"

# Save PM2 configuration
pm2 save

# Deploy LiveKit agent if --with-livekit flag is set
if [ "$WITH_LIVEKIT" == "true" ]; then
    echo ""
    "$SCRIPT_DIR/deploy-livekit-feature.sh" "$FEATURE_NAME" --subdomain "$SUBDOMAIN" || {
        echo_error "LiveKit deployment failed"
        exit 1
    }
fi

# Save deployment info
echo_info "Saving deployment information..."

node -e "
const fs = require('fs');
const path = require('path');

// Use single source of truth - external mapping file
const mappingPath = path.join(process.cwd(), '../feature-deployment-mappings.json');
let deployments = {};

// Read existing deployments
if (fs.existsSync(mappingPath)) {
    try {
        const mappingData = fs.readFileSync(mappingPath, 'utf8');
        const rawMapping = JSON.parse(mappingData);
        
        // Convert to deployments format if it's just URL mapping
        if (typeof rawMapping === 'object') {
            deployments = {};
            Object.entries(rawMapping).forEach(([branch, url]) => {
                if (typeof url === 'string') {
                    // This is old format, keep for backward compatibility
                    deployments[branch] = { url, branch };
                } else {
                    // This is new format with full deployment info
                    deployments[branch] = url;
                }
            });
        }
    } catch (e) {
        console.warn('Invalid deployments file, starting fresh');
        deployments = {};
    }
}

// Add/Update deployment
deployments['$FEATURE_BRANCH'] = {
    name: '$FEATURE_NAME',
    branch: '$FEATURE_BRANCH',
    appPort: $APP_PORT,
    subdomain: '$SUBDOMAIN',
    url: 'https://$SUBDOMAIN.trainapi.hupo.co',
    directory: '$WORKTREE_DIR',
    pm2Name: '$PM2_NAME',
    pr: ${PR_NUMBER:-null},
    deployedAt: new Date().toISOString(),
    deployedBy: process.env.USER || 'unknown',
    hasLivekit: $($WITH_LIVEKIT == "true" && echo "true" || echo "false"),
    livekitAgentName: $($WITH_LIVEKIT == "true" && echo "'aisales-livekit-agent-$FEATURE_NAME'" || echo "null"),
    livekitContainerName: $($WITH_LIVEKIT == "true" && echo "'aisales-livekit-agent-$FEATURE_NAME'" || echo "null")
};

// Write deployments file
fs.writeFileSync(mappingPath, JSON.stringify(deployments, null, 2));
console.log('Updated deployment: $FEATURE_BRANCH -> https://$SUBDOMAIN.trainapi.hupo.co');
"

# Show success message
echo ""
echo_success "✨ Feature deployed successfully!"
echo ""
echo_info "📋 Deployment Details:"
echo "   Feature: $FEATURE_NAME"
echo "   Branch: $FEATURE_BRANCH"
echo "   Subdomain: $SUBDOMAIN"
echo "   App Port: $APP_PORT (Node.js/internal)"
echo "   Backend URL: $DEPLOYMENT_URL"
echo "   Frontend URL: https://$(echo "$FEATURE_BRANCH" | sed 's/\//-/g')--huposalesai.netlify.app"
echo "   PM2 Process: $PM2_NAME"
echo ""
echo_info "📝 Useful commands:"
echo "   View logs:    ./logs-feature.sh $FEATURE_NAME"
echo "   Restart:      ./restart-feature.sh $FEATURE_NAME"
echo "   Update:       ./deploy-feature.sh $FEATURE_BRANCH --force"
echo "   Remove:       ./remove-feature.sh $FEATURE_NAME"
echo ""