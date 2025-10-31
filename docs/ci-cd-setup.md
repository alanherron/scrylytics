# CI/CD Setup Guide

This guide covers the automated setup of GitHub branch protection, skip-vercel workflows, and Vercel CI rules for the Scrylytics project.

## 🚀 Automated Setup

The easiest way to set up everything is using the automated script:

```bash
bash scripts/setup-ci-cd.sh
```

This script will:
1. Check prerequisites (GitHub CLI, Vercel CLI, authentication)
2. Set up GitHub Actions workflows
3. Configure branch protection rules
4. Link the project to Vercel
5. Provide instructions for setting up secrets

## 📋 Prerequisites

### Required Tools
- [GitHub CLI](https://cli.github.com/) (`gh`)
- [Vercel CLI](https://vercel.com/cli) (`vercel`)
- Node.js 18+ and npm

### Authentication
```bash
# Authenticate with GitHub
gh auth login

# Authenticate with Vercel (if not already done)
vercel login
```

## 🔒 Branch Protection

The setup configures protection for `main` and `develop` branches:

### Main Branch (`main`)
- ✅ Required status checks (strict)
- ✅ Required PR reviews (2 approvals)
- ✅ Dismiss stale reviews
- ✅ No force pushes
- ✅ No deletions

### Develop Branch (`develop`)
- ✅ Required status checks (strict)
- ✅ Required PR reviews (1 approval)
- ✅ Dismiss stale reviews
- ✅ No force pushes
- ✅ No deletions

### Manual Branch Protection Setup
```bash
bash scripts/setup-branch-protection.sh
```

## 🔄 GitHub Actions Workflows

### Skip-Vercel Workflow (`.github/workflows/skip-vercel.yml`)
Automatically skips Vercel deployments when:
- PR title/body contains: `[skip vercel]`, `[no-deploy]`, `[skip deploy]`
- Commit message contains skip keywords
- Only documentation files changed (`docs/` directory)
- Only README.md or LICENSE changed

### Deploy to Vercel Workflow (`.github/workflows/deploy-vercel.yml`)
- Runs on pushes to `main`/`develop` and PRs
- Checks skip conditions first
- Installs dependencies and runs build
- Deploys to Vercel
- Comments on PRs with preview URLs

## ⚙️ Vercel Configuration

The `vercel.json` file includes:
- Build settings for Next.js
- Security headers (X-Frame-Options, etc.)
- Function timeout configurations
- Redirect rules
- Environment settings

## 🔑 Required GitHub Secrets

Set these in your repository settings (Settings → Secrets and variables → Actions):

### VERCEL_TOKEN
```bash
# Get from: https://vercel.com/account/tokens
```

### VERCEL_ORG_ID & VERCEL_PROJECT_ID
```bash
# After running: vercel link
# These will be available in .vercel/project.json
```

## 🎯 Skip Deployment Examples

### In PR Title
```
[skip vercel] Update documentation
```

### In PR Description
```
This PR only updates documentation.

skip vercel deployment
```

### In Commit Message
```bash
git commit -m "docs: update README [skip vercel]"
```

## 🚦 Workflow Status Checks

The setup ensures:
- All PRs require passing CI checks
- Deployments only happen when necessary
- Preview deployments for all PRs (unless skipped)
- Production deployments for main branch merges

## 🔧 Troubleshooting

### Workflows not running
- Check that workflows are in `.github/workflows/`
- Ensure GitHub Actions is enabled for the repository
- Verify branch protection rules aren't blocking pushes

### Vercel deployment fails
- Check GitHub secrets are set correctly
- Ensure Vercel project is linked: `vercel link`
- Verify build commands work locally: `npm run build`

### Branch protection issues
- Ensure you have admin access to the repository
- Check that branches exist before applying protection
- Use the manual script if automated setup fails

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
