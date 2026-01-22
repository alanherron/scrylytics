# Quick Start Guide

Get up and running with GitHub Project Automation in 5 minutes!

## Prerequisites

- GitHub repository with admin access
- [GitHub CLI](https://cli.github.com/) installed (`gh`)
- Node.js 14+ (for scripts)

## Step 1: Install the Package

```bash
# Copy the package to your project
cd your-project
cp -r github-automation-package/* .

# Run installation
bash scripts/install.sh
```

## Step 2: Create GitHub Project

1. Go to your GitHub repository
2. Click "Projects" → "New project"
3. Create a new project (or use existing)
4. Note the project URL (e.g., `https://github.com/users/username/projects/1`)
5. Note the project number from the URL

## Step 3: Create GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Name it: "Project Automation Token"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:org` (if using organization project)
   - ✅ `project` (Full control of user projects)
5. Generate and copy the token

## Step 4: Set Up Secrets

```bash
# Interactive setup
bash scripts/setup-secrets.sh
```

Or manually:
1. Go to: `https://github.com/OWNER/REPO/settings/secrets/actions`
2. Add these secrets:
   - `PROJECTS_TOKEN`: Your GitHub token
   - `PROJECT_URL`: Your project URL
   - `PROJECT_USER`: Your GitHub username
   - `PROJECT_ID`: Your project number
   - `PROJECT_FIELD_MAPPINGS`: See below

### Field Mappings Secret

Set `PROJECT_FIELD_MAPPINGS` to:
```
Area=Library:label:Library
Area=Deckbuilder:label:Deckbuilder
Area=AI:label:AI
Area=Infra:label:Infra
Area=Design:label:Design
Area=Docs:label:Docs
Priority=P0:label:P0
Priority=P1:label:P1
Priority=P2:label:P2
Priority=P3:label:P3
Status=Backlog:label:backlog
Status=In Progress:label:in-progress
```

## Step 5: Configure Project Fields

In your GitHub project:
1. Go to your project board
2. Add these fields (if not already present):
   - **Status**: Single select (Backlog, In Progress, Done)
   - **Area**: Single select (Library, Deckbuilder, AI, etc.)
   - **Priority**: Single select (P0, P1, P2, P3)

## Step 6: Customize Configuration

1. Edit `.github/labeler.yml` to match your project structure
2. Edit `.github/ISSUE_TEMPLATE/feature.yml` with your areas
3. (Optional) Set up branch protection:
   ```bash
   bash scripts/setup-branch-protection.sh
   ```

## Step 7: Test It!

1. **Create a test issue**:
   - Add label `Library` and `P1`
   - Issue should appear in your project automatically
   - `Area` should be set to `Library`, `Priority` to `P1`

2. **Create a test PR**:
   - PR should be added to project
   - Status should be "In Progress"
   - When merged, status should change to "Done"

3. **Test labeling**:
   - Create PR that changes files in `docs/`
   - PR should automatically get `Docs` label

## Troubleshooting

### Workflows not running?
- Check Actions tab for errors
- Verify secrets are set correctly
- Ensure workflows are in `.github/workflows/`

### Items not added to project?
- Verify `PROJECTS_TOKEN` has correct permissions
- Check `PROJECT_URL` is correct
- Ensure project exists and is accessible

### Status not updating?
- Verify `PROJECT_FIELD_MAPPINGS` includes Status mappings
- Check project has Status field
- Ensure status values match exactly

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize workflows for your needs
- Set up branch protection for your main branches
- Configure deployment skipping for your CI/CD

## Need Help?

Check the [README.md](README.md) troubleshooting section or open an issue!
