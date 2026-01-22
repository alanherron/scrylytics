#!/bin/bash

# GitHub Project Automation - Installation Script
# This script installs the automation workflows and templates into your project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

print_header "GitHub Project Automation - Installation"

# Check if in a git repository
if ! git rev-parse --git-dir &> /dev/null; then
    print_error "Not in a git repository."
    echo "Please run this script from within a git repository."
    exit 1
fi

print_success "Detected git repository at: $PROJECT_ROOT"

# Create .github directory structure
print_status "Creating .github directory structure..."
mkdir -p "$PROJECT_ROOT/.github/workflows"
mkdir -p "$PROJECT_ROOT/.github/ISSUE_TEMPLATE"
print_success "Directory structure created"

# Copy workflows
print_status "Installing GitHub Actions workflows..."
cp -r "$PACKAGE_DIR/.github/workflows/"* "$PROJECT_ROOT/.github/workflows/"
print_success "Workflows installed"

# Copy templates
print_status "Installing issue and PR templates..."
if [ -d "$PROJECT_ROOT/.github/ISSUE_TEMPLATE" ]; then
    cp -r "$PACKAGE_DIR/.github/ISSUE_TEMPLATE/"* "$PROJECT_ROOT/.github/ISSUE_TEMPLATE/" 2>/dev/null || true
fi
cp "$PACKAGE_DIR/.github/pull_request_template.md" "$PROJECT_ROOT/.github/" 2>/dev/null || true
print_success "Templates installed"

# Copy labeler config
print_status "Installing labeler configuration..."
cp "$PACKAGE_DIR/.github/labeler.yml" "$PROJECT_ROOT/.github/" 2>/dev/null || true
print_success "Labeler configuration installed"

# Copy configuration example
if [ ! -f "$PROJECT_ROOT/github-automation-config.yml" ]; then
    print_status "Creating configuration file..."
    cp "$PACKAGE_DIR/config.example.yml" "$PROJECT_ROOT/github-automation-config.yml"
    print_success "Configuration file created at github-automation-config.yml"
    print_warning "Please edit github-automation-config.yml with your project settings"
else
    print_warning "Configuration file already exists, skipping..."
fi

# Copy setup scripts
print_status "Installing setup scripts..."
mkdir -p "$PROJECT_ROOT/scripts"
cp "$PACKAGE_DIR/scripts/setup-branch-protection.sh" "$PROJECT_ROOT/scripts/" 2>/dev/null || true
cp "$PACKAGE_DIR/scripts/setup-secrets.sh" "$PROJECT_ROOT/scripts/" 2>/dev/null || true
chmod +x "$PROJECT_ROOT/scripts/"*.sh 2>/dev/null || true
print_success "Setup scripts installed"

print_header "Installation Complete!"

print_success "GitHub automation features have been installed!"
echo ""
echo "Next steps:"
echo "1. Edit github-automation-config.yml with your project settings"
echo "2. Set up GitHub secrets (run: bash scripts/setup-secrets.sh)"
echo "3. Configure branch protection (run: bash scripts/setup-branch-protection.sh)"
echo "4. Customize .github/labeler.yml to match your project structure"
echo "5. Customize .github/ISSUE_TEMPLATE/feature.yml for your project areas"
echo ""
echo "Required GitHub Secrets:"
echo "  - PROJECTS_TOKEN: GitHub token with project write access"
echo "  - PROJECT_URL: Your GitHub project URL"
echo "  - PROJECT_USER: Your GitHub username"
echo "  - PROJECT_ID: Your GitHub project number"
echo "  - PROJECT_FIELD_MAPPINGS: Field mapping configuration"
echo ""
echo "See README.md for detailed documentation."
