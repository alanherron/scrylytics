#!/bin/bash

# Scrylytics - GitHub Branch Protection Setup Script
# This script configures branch protection rules for the main branches

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_OWNER="${GITHUB_REPOSITORY%/*}"
REPO_NAME="${GITHUB_REPOSITORY#*/}"

# Fallback for local development
if [[ -z "$REPO_OWNER" ]] || [[ -z "$REPO_NAME" ]]; then
    echo -e "${YELLOW}Warning: GITHUB_REPOSITORY not set. Using git remote to determine repo.${NC}"
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [[ "$REMOTE_URL" =~ github\.com[\/:]([^\/]+)\/([^\/\.]+) ]]; then
        REPO_OWNER="${BASH_REMATCH[1]}"
        REPO_NAME="${BASH_REMATCH[2]}"
    else
        echo -e "${RED}Error: Could not determine repository owner and name.${NC}"
        echo "Please run this script from a GitHub repository or set GITHUB_REPOSITORY environment variable."
        exit 1
    fi
fi

echo -e "${BLUE}Setting up branch protection for ${REPO_OWNER}/${REPO_NAME}${NC}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Function to set up branch protection
setup_branch_protection() {
    local branch=$1
    local is_main_branch=$2

    echo -e "${YELLOW}Setting up protection for branch: ${branch}${NC}"

    # Base protection rules
    PROTECTION_RULES='{
        "required_status_checks": {
            "strict": true,
            "contexts": []
        },
        "enforce_admins": false,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "dismissal_restrictions": {}
        },
        "restrictions": null,
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false
    }'

    # For main branch, add more strict rules
    if [[ "$is_main_branch" == "true" ]]; then
        PROTECTION_RULES=$(echo "$PROTECTION_RULES" | jq '.required_pull_request_reviews.required_approving_review_count = 2')
    fi

    # Apply the protection rules
    if gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}/protection" \
        -f "required_status_checks[strict]=true" \
        -f "required_status_checks[contexts][]=" \
        -f "enforce_admins=false" \
        -f "required_pull_request_reviews[required_approving_review_count]=${is_main_branch:+2}${is_main_branch:-1}" \
        -f "required_pull_request_reviews[dismiss_stale_reviews]=true" \
        -f "required_pull_request_reviews[require_code_owner_reviews]=false" \
        -f "restrictions=null" \
        -f "allow_force_pushes=false" \
        -f "allow_deletions=false" \
        -f "block_creations=false" &> /dev/null; then

        echo -e "${GREEN}✓ Successfully configured branch protection for ${branch}${NC}"
    else
        echo -e "${RED}✗ Failed to configure branch protection for ${branch}${NC}"
        return 1
    fi
}

# Main branches to protect
MAIN_BRANCHES=("main" "develop")

for branch in "${MAIN_BRANCHES[@]}"; do
    # Check if branch exists
    if gh api "repos/${REPO_OWNER}/${REPO_NAME}/branches/${branch}" &> /dev/null; then
        if [[ "$branch" == "main" ]]; then
            setup_branch_protection "$branch" "true"
        else
            setup_branch_protection "$branch" "false"
        fi
    else
        echo -e "${YELLOW}Branch '${branch}' does not exist, skipping...${NC}"
    fi
done

# Set default branch to main if it exists
if gh api "repos/${REPO_OWNER}/${REPO_NAME}/branches/main" &> /dev/null; then
    echo -e "${YELLOW}Setting default branch to 'main'...${NC}"
    if gh api \
        --method PATCH \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "repos/${REPO_OWNER}/${REPO_NAME}" \
        -f "default_branch=main" &> /dev/null; then
        echo -e "${GREEN}✓ Default branch set to 'main'${NC}"
    else
        echo -e "${RED}✗ Failed to set default branch${NC}"
    fi
fi

echo -e "${GREEN}Branch protection setup complete!${NC}"
echo -e "${BLUE}Protected branches:${NC}"
for branch in "${MAIN_BRANCHES[@]}"; do
    echo "  - $branch"
done
