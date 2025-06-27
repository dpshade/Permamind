#!/bin/bash

# Permamind Installation Script for Unix/Linux/macOS
# Usage: curl -sSL https://raw.githubusercontent.com/ALLiDoizCode/Permamind/main/scripts/install.sh | bash

set -e

PERMAMIND_VERSION="latest"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d 'v' -f 2)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
    
    if [ "$NODE_MAJOR" -lt 20 ]; then
        print_error "Node.js version $NODE_VERSION is not supported. Please upgrade to Node.js 20 or higher."
        exit 1
    fi
    
    print_success "Node.js version $NODE_VERSION is supported"
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    NPM_VERSION=$(npm --version)
    print_success "npm version $NPM_VERSION found"
}

install_permamind() {
    print_status "Installing Permamind globally..."
    
    if [ "$PERMAMIND_VERSION" = "latest" ]; then
        npm install -g permamind
    else
        npm install -g "permamind@$PERMAMIND_VERSION"
    fi
    
    print_success "Permamind installed successfully!"
}

verify_installation() {
    print_status "Verifying installation..."
    
    if command -v permamind &> /dev/null; then
        INSTALLED_VERSION=$(permamind --version)
        print_success "Permamind $INSTALLED_VERSION is installed and available"
    else
        print_error "Installation verification failed. Permamind command not found."
        exit 1
    fi
}

run_setup() {
    print_status "Would you like to run the setup wizard now? (y/n)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Running setup wizard..."
        permamind --setup
    else
        print_status "Setup skipped. You can run it later with: permamind --setup"
    fi
}

main() {
    echo ""
    echo "🧠 Permamind Installer"
    echo "======================"
    echo ""
    
    check_dependencies
    install_permamind
    verify_installation
    
    echo ""
    print_success "Installation complete!"
    echo ""
    print_status "Next steps:"
    echo "  1. Run 'permamind --setup' to configure your installation"
    echo "  2. Start the server with 'permamind'"
    echo "  3. Get help with 'permamind --help'"
    echo ""
    
    run_setup
}

# Handle script arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            PERMAMIND_VERSION="$2"
            shift 2
            ;;
        --help)
            echo "Permamind Installation Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --version VERSION  Install specific version (default: latest)"
            echo "  --help            Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

main