#!/bin/bash

# GitHub Project Automation - Secrets Setup Helper
# This script helps you set up the required GitHub secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

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

print_header "GitHub Secrets Setup Helper"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    print_error "Not authenticated with GitHub CLI."
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO_OWNER="${GITHUB_REPOSITORY%/*}"
REPO_NAME="${GITHUB_REPOSITORY#*/}"

if [[ -z "$REPO_OWNER" ]] || [[ -z "$REPO_NAME" ]]; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$REMOTE_URL" =~ github\.com[\/:]([^\/]+)\/([^\/\.]+) ]]; then
        REPO_OWNER="${BASH_REMATCH[1]}"
        REPO_NAME="${BASH_REMATCH[2]}"
    else
        print_error "Could not determine repository."
        exit 1
    fi
fi

print_status "Repository: ${REPO_OWNER}/${REPO_NAME}"

echo ""
echo "This script will help you set up the required GitHub secrets."
echo ""
echo "Required secrets:"
echo "  1. PROJECTS_TOKEN - GitHub token with project write access"
echo "  2. PROJECT_URL - Your GitHub project URL"
echo "  3. PROJECT_USER - Your GitHub username"
echo "  4. PROJECT_ID - Your GitHub project number"
echo "  5. PROJECT_FIELD_MAPPINGS - Field mapping configuration"
echo ""

read -p "Do you want to set up secrets interactively? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Manual setup instructions:"
    echo "1. Go to: https://github.com/${REPO_OWNER}/${REPO_NAME}/settings/secrets/actions"
    echo "2. Click 'New repository secret' for each required secret"
    echo ""
    echo "To create a PROJECTS_TOKEN:"
    echo "1. Go to: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select scopes: 'repo', 'write:org' (if org project), 'project'"
    echo ""
    exit 0
fi

# Interactive setup
echo ""
print_status "Setting up secrets interactively..."

# PROJECTS_TOKEN
echo ""
read -p "Enter your PROJECTS_TOKEN (or press Enter to skip): " PROJECTS_TOKEN
if [ ! -z "$PROJECTS_TOKEN" ]; then
    echo "$PROJECTS_TOKEN" | gh secret set PROJECTS_TOKEN --repo "${REPO_OWNER}/${REPO_NAME}"
    print_success "PROJECTS_TOKEN set"
fi

# PROJECT_URL
echo ""
read -p "Enter your PROJECT_URL (e.g., https://github.com/users/username/projects/1): " PROJECT_URL
if [ ! -z "$PROJECT_URL" ]; then
    echo "$PROJECT_URL" | gh secret set PROJECT_URL --repo "${REPO_OWNER}/${REPO_NAME}"
    print_success "PROJECT_URL set"
fi

# PROJECT_USER
echo ""
read -p "Enter your PROJECT_USER (GitHub username): " PROJECT_USER
if [ ! -z "$PROJECT_USER" ]; then
    echo "$PROJECT_USER" | gh secret set PROJECT_USER --repo "${REPO_OWNER}/${REPO_NAME}"
    print_success "PROJECT_USER set"
fi

# PROJECT_ID
echo ""
read -p "Enter your PROJECT_ID (project number from URL): " PROJECT_ID
if [ ! -z "$PROJECT_ID" ]; then
    echo "$PROJECT_ID" | gh secret set PROJECT_ID --repo "${REPO_OWNER}/${REPO_NAME}"
    print_success "PROJECT_ID set"
fi

# PROJECT_FIELD_MAPPINGS
echo ""
print_status "For PROJECT_FIELD_MAPPINGS, you need to create a field mapping string."
print_status "Example format:"
echo "  Area=Library:label:Library"
echo "  Area=Deckbuilder:label:Deckbuilder"
echo "  Priority=P0:label:P0"
echo ""
read -p "Enter PROJECT_FIELD_MAPPINGS (or press Enter to skip): " FIELD_MAPPINGS
if [ ! -z "$FIELD_MAPPINGS" ]; then
    echo "$FIELD_MAPPINGS" | gh secret set PROJECT_FIELD_MAPPINGS --repo "${REPO_OWNER}/${REPO_NAME}"
    print_success "PROJECT_FIELD_MAPPINGS set"
fi

echo ""
print_header "Setup Complete!"
print_success "All secrets have been configured."
echo ""
echo "Next steps:"
echo "1. Verify your workflows are working by creating a test issue or PR"
echo "2. Check your GitHub project to see if items are being added automatically"
echo "3. Review the README.md for detailed feature documentation"
