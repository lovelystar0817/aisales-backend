#!/bin/bash

# Subdomain-based deployment configuration
# Application ports (internal, used by PM2/Node.js)
APP_PORT_RANGE_START=5003
APP_PORT_RANGE_END=5020
RESERVED_PORTS=(5000 5001 5002) # Production ports

# Subdomain configuration
SUBDOMAIN_PREFIX="feature"
BASE_DOMAIN="trainapi.hupo.co"

# Convert app port to subdomain (5003 -> feature03, 5010 -> feature10)
port_to_subdomain() {
    local app_port=$1
    # Direct mapping: 5003->03, 5004->04, ..., 5010->10
    local slot=$((app_port - 5000))
    if [ "$slot" -lt 10 ]; then
        echo "${SUBDOMAIN_PREFIX}0${slot}"
    else
        echo "${SUBDOMAIN_PREFIX}${slot}"
    fi
}

# Convert subdomain to app port (feature03 -> 5003, feature10 -> 5010)
subdomain_to_port() {
    local subdomain=$1
    # Extract number from subdomain (feature03 -> 03, feature10 -> 10)
    local num=$(echo "$subdomain" | sed "s/^${SUBDOMAIN_PREFIX}//")
    # Convert to integer and add 5000 (03->5003, 10->5010)
    echo $((10#$num + 5000))
}

# Get full domain URL for a port
port_to_url() {
    local app_port=$1
    local subdomain=$(port_to_subdomain "$app_port")
    echo "https://${subdomain}.${BASE_DOMAIN}"
}

# Check if an application port is valid (within our range)
is_port_valid() {
    local port=$1
    if [ "$port" -ge $APP_PORT_RANGE_START ] && [ "$port" -le $APP_PORT_RANGE_END ]; then
        return 0
    else
        return 1
    fi
}

# Check if a port is currently in use
is_port_in_use() {
    local port=$1
    
    # Check if port is reserved
    for reserved in "${RESERVED_PORTS[@]}"; do
        if [ "$port" == "$reserved" ]; then
            return 0
        fi
    done
    
    # Check if port is listening
    if command -v lsof >/dev/null 2>&1; then
        if lsof -Pi ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
            return 0
        fi
    elif command -v netstat >/dev/null 2>&1; then
        if netstat -ln | grep -q ":$port "; then
            return 0
        fi
    elif command -v ss >/dev/null 2>&1; then
        if ss -ln | grep -q ":$port "; then
            return 0
        fi
    fi
    
    # Check PM2 processes
    if command -v pm2 >/dev/null 2>&1; then
        # Get PM2 process list and check for port usage
        local pm2_ports=$(pm2 jlist 2>/dev/null | node -e "
            let data = '';
            process.stdin.on('data', chunk => data += chunk);
            process.stdin.on('end', () => {
                try {
                    const apps = JSON.parse(data);
                    const ports = apps
                        .filter(app => app.pm2_env && app.pm2_env.env && app.pm2_env.env.PORT)
                        .map(app => parseInt(app.pm2_env.env.PORT))
                        .filter(port => !isNaN(port));
                    console.log(ports.join(' '));
                } catch (e) {
                    // Ignore errors
                }
            });
        " 2>/dev/null || echo "")
        
        if [[ " $pm2_ports " =~ " $port " ]]; then
            return 0
        fi
    fi
    
    # Check deployments.json
    local config_file="$CONFIG_DIR/deployments.json"
    if [ -f "$config_file" ]; then
        local used_in_config=$(node -e "
            try {
                const fs = require('fs');
                const deps = JSON.parse(fs.readFileSync('$config_file', 'utf8'));
                const ports = deps.map(d => d.appPort);
                console.log(ports.includes($port) ? 'true' : 'false');
            } catch (e) {
                console.log('false');
            }
        " 2>/dev/null || echo "false")
        
        if [ "$used_in_config" == "true" ]; then
            return 0
        fi
    fi
    
    return 1
}

# Find the first available port in the range (returns app port)
find_available_port() {
    for port in $(seq $APP_PORT_RANGE_START $APP_PORT_RANGE_END); do
        if ! is_port_in_use "$port"; then
            echo "$port"
            return 0
        fi
    done
    return 1
}

# Get list of all used ports
get_used_ports() {
    local used_ports=()
    
    # Add reserved ports
    used_ports+=("${RESERVED_PORTS[@]}")
    
    # Check listening ports
    if command -v lsof >/dev/null 2>&1; then
        local listening_ports=$(lsof -Pi -sTCP:LISTEN | awk 'NR>1 {split($9,a,":"); if(a[2]>=3000 && a[2]<=3010) print a[2]}' | sort -u)
        while read -r port; do
            if [ -n "$port" ]; then
                used_ports+=("$port")
            fi
        done <<< "$listening_ports"
    fi
    
    # Check PM2 ports
    if command -v pm2 >/dev/null 2>&1; then
        local pm2_ports=$(pm2 jlist 2>/dev/null | node -e "
            let data = '';
            process.stdin.on('data', chunk => data += chunk);
            process.stdin.on('end', () => {
                try {
                    const apps = JSON.parse(data);
                    const ports = apps
                        .filter(app => app.pm2_env && app.pm2_env.env && app.pm2_env.env.PORT)
                        .map(app => parseInt(app.pm2_env.env.PORT))
                        .filter(port => !isNaN(port) && port >= 3000 && port <= 3010);
                    console.log(ports.join('\n'));
                } catch (e) {
                    // Ignore errors
                }
            });
        " 2>/dev/null)
        
        while read -r port; do
            if [ -n "$port" ]; then
                used_ports+=("$port")
            fi
        done <<< "$pm2_ports"
    fi
    
    # Check deployments.json
    if [ -f "$CONFIG_DIR/deployments.json" ]; then
        local config_ports=$(node -e "
            try {
                const fs = require('fs');
                const deps = JSON.parse(fs.readFileSync('$CONFIG_DIR/deployments.json', 'utf8'));
                console.log(deps.map(d => d.port).join('\n'));
            } catch (e) {
                // Ignore errors
            }
        " 2>/dev/null)
        
        while read -r port; do
            if [ -n "$port" ]; then
                used_ports+=("$port")
            fi
        done <<< "$config_ports"
    fi
    
    # Remove duplicates and sort
    printf '%s\n' "${used_ports[@]}" | sort -u | grep -E '^[0-9]+$' | sort -n
}

# Get list of available ports
get_available_ports() {
    local all_ports=()
    local used_ports_array
    mapfile -t used_ports_array < <(get_used_ports)
    
    for port in $(seq $APP_PORT_RANGE_START $APP_PORT_RANGE_END); do
        local is_used=false
        for used_port in "${used_ports_array[@]}"; do
            if [ "$port" == "$used_port" ]; then
                is_used=true
                break
            fi
        done
        if [ "$is_used" == "false" ]; then
            all_ports+=("$port")
        fi
    done
    
    printf '%s\n' "${all_ports[@]}"
}

# Check if a specific port can be allocated
can_allocate_port() {
    local port=$1
    
    if ! is_port_valid "$port"; then
        echo_error "Port $port is outside valid range ($APP_PORT_RANGE_START-$APP_PORT_RANGE_END)"
        return 1
    fi
    
    if is_port_in_use "$port"; then
        echo_error "Port $port is already in use"
        return 1
    fi
    
    return 0
}

# Display port usage summary with subdomain mappings
show_port_usage() {
    echo_info "Port & Subdomain Usage Summary:"
    echo ""
    
    local used_ports_array
    mapfile -t used_ports_array < <(get_used_ports)
    
    echo "Port Range: $APP_PORT_RANGE_START-$APP_PORT_RANGE_END"
    echo "Subdomain Range: feature03-feature20"
    echo ""
    
    for port in $(seq $APP_PORT_RANGE_START $APP_PORT_RANGE_END); do
        local subdomain=$(port_to_subdomain "$port")
        local status="available"
        for used_port in "${used_ports_array[@]}"; do
            if [ "$port" == "$used_port" ]; then
                status="in use"
                break
            fi
        done
        echo "  $subdomain.${BASE_DOMAIN} -> port $port [$status]"
    done
    echo ""
}