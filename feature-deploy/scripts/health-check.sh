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
MAPPING_PATH="$SCRIPT_DIR/../../../feature-deployment-mappings.json"
if [ -f "$MAPPING_PATH" ]; then
    DEPLOYMENT_COUNT=$(node -e "const deployments = JSON.parse(require('fs').readFileSync('$MAPPING_PATH', 'utf8')); console.log(Object.keys(deployments).filter(k => deployments[k] && deployments[k].name).length)" 2>/dev/null || echo "0")
    echo_success "✓ Deployments registry accessible"
    echo_info "  Registered deployments: $DEPLOYMENT_COUNT"
else
    echo_error "❌ Deployments registry not found"
fi

# Check port availability
source "$SCRIPT_DIR/lib/ports.sh"
AVAILABLE_PORTS=$(get_available_ports | wc -l)
echo_info "  Available ports: $AVAILABLE_PORTS/10"

echo ""
