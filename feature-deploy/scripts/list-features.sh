#!/bin/bash

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source helper libraries
source "$SCRIPT_DIR/lib/colors.sh"

# Parse arguments
FORMAT="table"
SHOW_ALL=false

show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --json             Output in JSON format"
    echo "  --all              Show all details"
    echo "  -h, --help         Show this help message"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            FORMAT="json"
            shift
            ;;
        --all)
            SHOW_ALL=true
            shift
            ;;
        -h|--help)
            show_usage
            ;;
        *)
            echo_error "Unknown option: $1"
            show_usage
            ;;
    esac
done

# Check if deployments file exists
MAPPING_PATH="$SCRIPT_DIR/../../../feature-deployment-mappings.json"
if [ ! -f "$MAPPING_PATH" ]; then
    if [ "$FORMAT" == "json" ]; then
        echo "[]"
    else
        echo_warning "No deployments found"
        echo_info "Deploy a feature with: ./deploy-feature.sh <branch-name>"
    fi
    exit 0
fi

# Get deployments count
DEPLOYMENT_COUNT=$(node -e "
const path = require('path');
const mappingPath = '$MAPPING_PATH';
const deployments = JSON.parse(require('fs').readFileSync(mappingPath, 'utf8'));
const count = Object.keys(deployments).filter(k => deployments[k] && deployments[k].name).length;
console.log(count);
")

if [ "$DEPLOYMENT_COUNT" == "0" ]; then
    if [ "$FORMAT" == "json" ]; then
        echo "[]"
    else
        echo_warning "No active deployments"
        echo_info "Deploy a feature with: ./deploy-feature.sh <branch-name>"
    fi
    exit 0
fi

# Output in requested format
if [ "$FORMAT" == "json" ]; then
    node -e "
const path = require('path');
const mappingPath = '$MAPPING_PATH';
const deployments = JSON.parse(require('fs').readFileSync(mappingPath, 'utf8'));
const deploymentArray = Object.values(deployments).filter(d => d && d.name);
console.log(JSON.stringify(deploymentArray, null, 2));
"
else
    echo_info "🚀 Active Feature Deployments"
    echo ""
    
    node -e "
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mappingPath = '$MAPPING_PATH';
const deploymentsMap = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
const deployments = Object.values(deploymentsMap).filter(d => d && d.name);

// Get PM2 status
let pm2Status = {};
try {
    const pm2Output = execSync('pm2 jlist', { encoding: 'utf8' });
    const pm2List = JSON.parse(pm2Output);
    pm2List.forEach(app => {
        pm2Status[app.name] = {
            status: app.pm2_env.status,
            memory: app.monit ? Math.round(app.monit.memory / 1024 / 1024) + 'MB' : 'N/A',
            cpu: app.monit ? app.monit.cpu + '%' : 'N/A',
            uptime: app.pm2_env.pm_uptime ? new Date(app.pm2_env.pm_uptime) : null,
            restarts: app.pm2_env.restart_time || 0
        };
    });
} catch (e) {
    // PM2 not available or error
}

// Calculate column widths
const cols = {
    name: Math.max(15, ...deployments.map(d => d.name.length)),
    branch: Math.max(20, ...deployments.map(d => d.branch.length)),
    subdomain: 12,
    port: 6,
    status: 10,
    memory: 8,
    cpu: 6,
    uptime: 15,
    user: Math.max(10, ...deployments.map(d => (d.deployedBy || 'unknown').length))
};

// Helper function to format uptime
function formatUptime(uptime) {
    if (!uptime) return 'N/A';
    const now = new Date();
    const diff = now - uptime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return days + 'd ' + (hours % 24) + 'h';
    }
    return hours + 'h ' + minutes + 'm';
}

// Helper function to format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) {
        const mins = Math.floor(diff / 60000);
        return mins + ' min ago';
    } else if (hours < 24) {
        return hours + ' hours ago';
    } else {
        const days = Math.floor(hours / 24);
        return days + ' days ago';
    }
}

// Helper function to get status color
function getStatusColor(status) {
    switch(status) {
        case 'online': return '\\x1b[32m'; // green
        case 'stopped': return '\\x1b[31m'; // red
        case 'stopping': return '\\x1b[33m'; // yellow
        case 'launching': return '\\x1b[33m'; // yellow
        case 'errored': return '\\x1b[31m'; // red
        default: return '\\x1b[37m'; // white
    }
}

const showAll = ${SHOW_ALL};

// Print header
const header = [
    'Feature'.padEnd(cols.name),
    'Branch'.padEnd(cols.branch),
    'Subdomain'.padEnd(cols.subdomain),
    'Port'.padEnd(cols.port),
    'Status'.padEnd(cols.status),
    'Memory'.padEnd(cols.memory),
    'CPU'.padEnd(cols.cpu),
    'Uptime'.padEnd(cols.uptime),
    'Deployed'.padEnd(15)
];

if (showAll) {
    header.push('User'.padEnd(cols.user));
}

console.log(header.join(' │ '));
console.log('─'.repeat(header.join(' │ ').length));

// Print deployments
deployments.forEach((dep, index) => {
    const pm2 = pm2Status['aisales-' + dep.name] || { status: 'stopped', memory: 'N/A', cpu: 'N/A' };
    const statusColor = getStatusColor(pm2.status);
    const resetColor = '\\x1b[0m';
    
    const row = [
        dep.name.padEnd(cols.name),
        dep.branch.substring(0, cols.branch).padEnd(cols.branch),
        (dep.subdomain || 'N/A').padEnd(cols.subdomain),
        String(dep.appPort).padEnd(cols.port),
        (statusColor + pm2.status + resetColor).padEnd(cols.status + 9), // +9 for color codes
        pm2.memory.padEnd(cols.memory),
        pm2.cpu.padEnd(cols.cpu),
        formatUptime(pm2.uptime).padEnd(cols.uptime),
        formatDate(dep.deployedAt).padEnd(15)
    ];
    
    if (showAll) {
        row.push((dep.deployedBy || 'unknown').padEnd(cols.user));
    }
    
    console.log(row.join(' │ '));
    
    // Add PR info if available
    if (dep.pr) {
        console.log('  └─ PR #' + dep.pr);
    }
});

console.log('');
console.log('Total deployments: ' + deployments.length);

// Check for available slots
const usedAppPorts = deployments.map(d => d.appPort);
const availableSlots = [];
for (let appPort = 5003; appPort <= 5020; appPort++) {
    if (!usedAppPorts.includes(appPort)) {
        const slot = appPort - 5000;
        const subdomain = slot < 10 ? 'feature0' + slot : 'feature' + slot;
        availableSlots.push(subdomain);
    }
}
console.log('Available slots: ' + (availableSlots.length > 0 ? availableSlots.join(', ') : 'None'));
"
    
    echo ""
    echo_info "📝 Commands:"
    echo "  View logs:    ./logs-feature.sh <feature-name>"
    echo "  Update:       ./deploy-feature.sh <branch-name> --force"
    echo "  Restart:      ./restart-feature.sh <feature-name>"
    echo "  Remove:       ./remove-feature.sh <feature-name>"
    echo ""
fi