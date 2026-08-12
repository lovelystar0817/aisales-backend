#!/bin/bash

# Terminal color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Helper functions for colored output
echo_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

echo_success() {
    echo -e "${GREEN}$1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo_info() {
    echo -e "${BLUE}$1${NC}"
}

echo_debug() {
    if [ "${DEBUG:-}" == "true" ]; then
        echo -e "${GRAY}🐛 $1${NC}"
    fi
}

echo_bold() {
    echo -e "${BOLD}$1${NC}"
}

echo_header() {
    echo ""
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BLUE}$(echo "$1" | sed 's/./=/g')${NC}"
    echo ""
}

# Spinner function for long-running commands
show_spinner() {
    local -r delay='0.1'
    local spinstr='\|/-'
    local temp
    
    while true; do
        temp="${spinstr#?}"
        printf " [%c]  " "${spinstr}"
        spinstr=${temp}${spinstr%"${temp}"}
        sleep "${delay}"
        printf "\b\b\b\b\b\b"
    done
}

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))
    
    printf "\r["
    printf "%*s" $completed | tr ' ' '='
    printf "%*s" $((width - completed)) | tr ' ' '-'
    printf "] %d%%" $percentage
}

# Function to print a section divider
print_divider() {
    echo -e "${GRAY}$(printf '─%.0s' {1..80})${NC}"
}