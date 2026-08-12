#!/bin/bash

set -e

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$SCRIPT_DIR/scripts"
CONFIG_DIR="$SCRIPT_DIR/config"
LOGS_DIR="$SCRIPT_DIR/logs"

# Source colors
source "$SCRIPTS_DIR/lib/colors.sh"

echo_header "Feature Deployment System Setup"

echo_info "Setting up the feature deployment system for aisales-backend..."
echo ""

# Check prerequisites
echo_info "Checking prerequisites..."

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo_error "Node.js is required but not installed"
    exit 1
fi
echo_success "✓ Node.js found: $(node --version)"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
    echo_error "npm is required but not installed"
    exit 1
fi
echo_success "✓ npm found: $(npm --version)"

# Check Git
if ! command -v git >/dev/null 2>&1; then
    echo_error "Git is required but not installed"
    exit 1
fi
echo_success "✓ Git found: $(git --version)"

# Check PM2
if ! command -v pm2 >/dev/null 2>&1; then
    echo_warning "PM2 not found. Installing PM2..."
    npm install -g pm2 || {
        echo_error "Failed to install PM2. Please install manually: npm install -g pm2"
        exit 1
    }
    echo_success "✓ PM2 installed successfully"
else
    echo_success "✓ PM2 found: $(pm2 --version)"
fi

echo ""

# Create necessary directories
echo_info "Creating directory structure..."
mkdir -p "$CONFIG_DIR" "$LOGS_DIR"
echo_success "✓ Directories created"

# Make scripts executable
echo_info "Setting script permissions..."
chmod +x "$SCRIPTS_DIR"/*.sh
chmod +x "$SCRIPTS_DIR/lib"/*.sh
echo_success "✓ Script permissions set"

# Create initial deployments.json if it doesn't exist
if [ ! -f "$CONFIG_DIR/deployments.json" ]; then
    echo_info "Creating deployments registry..."
    echo "[]" > "$CONFIG_DIR/deployments.json"
    echo_success "✓ Deployments registry created"
else
    echo_success "✓ Deployments registry exists"
fi

# Environment files will be copied from project root
echo_info "Environment setup..."
echo_success "✓ Will use existing environment files from project root"
echo_info "  Supported: .env, .env.local, .env.prod, .env.staging"
echo_info "  Files will be copied with their original names preserved"

# Create convenience scripts in project root
echo_info "Creating convenience scripts..."

# Create main deployment wrapper
cat > "$SCRIPT_DIR/../deploy-feature" << 'EOF'
#!/bin/bash
exec "$(dirname "$0")/deploy/scripts/deploy-feature.sh" "$@"
EOF
chmod +x "$SCRIPT_DIR/../deploy-feature"

# Create removal wrapper
cat > "$SCRIPT_DIR/../remove-feature" << 'EOF'
#!/bin/bash
exec "$(dirname "$0")/deploy/scripts/remove-feature.sh" "$@"
EOF
chmod +x "$SCRIPT_DIR/../remove-feature"

# Create listing wrapper
cat > "$SCRIPT_DIR/../list-features" << 'EOF'
#!/bin/bash
exec "$(dirname "$0")/deploy/scripts/list-features.sh" "$@"
EOF
chmod +x "$SCRIPT_DIR/../list-features"

echo_success "✓ Convenience scripts created in project root"

# Add to .gitignore if needed
GITIGNORE_FILE="$SCRIPT_DIR/../.gitignore"
if [ -f "$GITIGNORE_FILE" ]; then
    if ! grep -q "deploy/logs/\*.log" "$GITIGNORE_FILE"; then
        echo_info "Adding deployment files to .gitignore..."
        echo "" >> "$GITIGNORE_FILE"
        echo "# Feature deployment system" >> "$GITIGNORE_FILE"
        echo "deploy/logs/*.log" >> "$GITIGNORE_FILE"
        echo_success "✓ .gitignore updated"
    else
        echo_success "✓ .gitignore already configured"
    fi
fi

# Test port management
echo_info "Testing port management..."
source "$SCRIPTS_DIR/lib/ports.sh"
AVAILABLE_PORT=$(find_available_port)
if [ -n "$AVAILABLE_PORT" ]; then
    echo_success "✓ Port management working (next available: $AVAILABLE_PORT)"
else
    echo_error "❌ No available deployment slots"
    echo_info "This might be normal if all subdomains are in use. The system will handle this at deployment time."
fi

# Create a simple health check script
echo_info "Creating health check script..."
cat > "$SCRIPTS_DIR/health-check.sh" << 'EOF'
#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/colors.sh"

echo_info "🏥 Feature Deployment Health Check"
echo ""

# Check PM2
if command -v pm2 >/dev/null 2>&1; then
    echo_success "✓ PM2 available"
    PM2_PROCESSES=$(pm2 list | grep -c "aisales-" || echo "0")
    echo_info "  Active feature processes: $PM2_PROCESSES"
else
    echo_error "❌ PM2 not available"
fi

# Check deployments
CONFIG_DIR="$SCRIPT_DIR/../config"
if [ -f "$CONFIG_DIR/deployments.json" ]; then
    DEPLOYMENT_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$CONFIG_DIR/deployments.json', 'utf8')).length)" 2>/dev/null || echo "0")
    echo_success "✓ Deployments registry accessible"
    echo_info "  Registered deployments: $DEPLOYMENT_COUNT"
else
    echo_error "❌ Deployments registry not found"
fi

# Check subdomain availability
source "$SCRIPT_DIR/lib/ports.sh"
AVAILABLE_PORTS=$(get_available_ports | wc -l)
echo_info "  Available subdomain slots: $AVAILABLE_PORTS/8"

echo ""
EOF
chmod +x "$SCRIPTS_DIR/health-check.sh"
echo_success "✓ Health check script created"

# Display completion message
echo ""
echo_header "Setup Complete! 🎉"

echo_info "Feature Deployment System has been set up successfully!"
echo ""

echo_info "📋 Next Steps:"
echo "1. Set up DNS A records in Cloudflare (feature03-feature10.trainapi.hupo.co)"
echo "2. Install nginx configuration: sudo cp deploy/config/nginx-feature-subdomains.conf /etc/nginx/sites-available/"
echo "3. Ensure you have a .env file in your project root"
echo "4. Test the system: ./deploy-feature feature/test-branch"
echo "5. List deployments: ./list-features"
echo "6. Remove deployment: ./remove-feature test-branch"
echo ""

echo_info "📝 Available Commands:"
echo "  ./deploy-feature <branch>     Deploy a feature branch"
echo "  ./list-features               List all deployments"
echo "  ./remove-feature <name>       Remove a deployment"
echo ""
echo "  deploy/scripts/restart-feature.sh <name>  Restart a deployment"
echo "  deploy/scripts/logs-feature.sh <name>     View logs"
echo "  deploy/scripts/health-check.sh            System health check"
echo ""

echo_info "📚 Documentation:"
echo "  deploy/README.md              Usage guide"
echo "  deploy/config/                Configuration files"
echo "  deploy/logs/                  Deployment logs"
echo ""

echo_warning "⚠️  Important:"
echo "- Ensure you have a .env file in your project root before first deployment"
echo "- Set up DNS records (feature03-feature10.trainapi.hupo.co) in Cloudflare"
echo "- Install nginx configuration for subdomain routing"
echo "- Add feature subdomains to CORS settings in your application"
echo ""

echo_success "Happy deploying! 🚀"