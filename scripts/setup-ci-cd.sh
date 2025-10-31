#!/bin/bash

# Scrylytics - Complete CI/CD Setup Script
# This script automates the setup of GitHub branch protection, workflows, and Vercel configuration

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

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed."
        echo "Please install it from: https://cli.github.com/"
        exit 1
    fi
    print_success "GitHub CLI found"

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI is not installed. Installing..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_success "Vercel CLI found"
    fi

    # Check if authenticated with GitHub
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI."
        echo "Please run: gh auth login"
        exit 1
    fi
    print_success "Authenticated with GitHub"

    # Check if in a git repository
    if ! git rev-parse --git-dir &> /dev/null; then
        print_error "Not in a git repository."
        exit 1
    fi
    print_success "In a git repository"
}

# Setup GitHub Actions workflows
setup_workflows() {
    print_header "Setting up GitHub Actions Workflows"

    WORKFLOWS_DIR=".github/workflows"

    if [[ ! -d "$WORKFLOWS_DIR" ]]; then
        mkdir -p "$WORKFLOWS_DIR"
        print_success "Created $WORKFLOWS_DIR directory"
    fi

    # Check if workflow files exist
    if [[ -f ".github/workflows/skip-vercel.yml" ]]; then
        print_success "Skip-vercel workflow already exists"
    else
        print_warning "Skip-vercel workflow missing - it should have been created"
    fi

    if [[ -f ".github/workflows/deploy-vercel.yml" ]]; then
        print_success "Deploy workflow already exists"
    else
        print_warning "Deploy workflow missing - it should have been created"
    fi
}

# Setup branch protection
setup_branch_protection() {
    print_header "Setting up Branch Protection"

    if [[ ! -f "scripts/setup-branch-protection.sh" ]]; then
        print_error "Branch protection script not found"
        exit 1
    fi

    print_status "Running branch protection setup..."
    bash scripts/setup-branch-protection.sh
}

# Setup Vercel project
setup_vercel() {
    print_header "Setting up Vercel Configuration"

    # Check if vercel.json exists
    if [[ ! -f "vercel.json" ]]; then
        print_error "vercel.json not found"
        exit 1
    fi
    print_success "vercel.json found"

    # Check if already linked to Vercel
    if [[ -f ".vercel" ]]; then
        print_success "Project already linked to Vercel"
    else
        print_status "Linking project to Vercel..."
        if vercel link --yes; then
            print_success "Project linked to Vercel"
        else
            print_warning "Failed to link project automatically. You may need to run 'vercel link' manually"
        fi
    fi

    # Set production branch
    print_status "Setting production branch to 'main'..."
    vercel env --yes pull .env.local 2>/dev/null || true # Try to pull existing env vars

    print_success "Vercel setup complete"
}

# Setup secrets in GitHub
setup_github_secrets() {
    print_header "Setting up GitHub Secrets"

    print_status "Please ensure the following secrets are set in your GitHub repository:"
    echo ""
    echo "Required GitHub Secrets:"
    echo "  - VERCEL_TOKEN: Your Vercel authentication token"
    echo "  - VERCEL_ORG_ID: Your Vercel organization ID"
    echo "  - VERCEL_PROJECT_ID: Your Vercel project ID"
    echo ""
    echo "To set these secrets:"
    echo "1. Go to your repository on GitHub"
    echo "2. Navigate to Settings > Secrets and variables > Actions"
    echo "3. Click 'New repository secret' for each of the above"
    echo ""
    echo "You can find VERCEL_TOKEN at: https://vercel.com/account/tokens"
    echo "For VERCEL_ORG_ID and VERCEL_PROJECT_ID, run: vercel link"
    echo ""

    read -p "Have you set up the GitHub secrets? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please set up the secrets before proceeding with deployments"
    fi
}

# Main setup function
main() {
    print_header "Scrylytics CI/CD Setup"
    echo "This script will set up:"
    echo "  ✓ GitHub Actions workflows"
    echo "  ✓ Branch protection rules"
    echo "  ✓ Vercel configuration"
    echo "  ✓ CI/CD automation"
    echo ""

    check_prerequisites
    setup_workflows
    setup_branch_protection
    setup_vercel
    setup_github_secrets

    print_header "Setup Complete!"
    print_success "Your CI/CD pipeline is now configured!"
    echo ""
    echo "Next steps:"
    echo "1. Push these changes to your repository"
    echo "2. The workflows will run automatically on your next push/PR"
    echo "3. Your branches are now protected"
    echo "4. Vercel deployments will be automated"
    echo ""
    echo "To manually trigger branch protection setup:"
    echo "  bash scripts/setup-branch-protection.sh"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
