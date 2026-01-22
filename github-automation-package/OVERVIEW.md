# Package Overview

## 📦 Package Structure

```
github-automation-package/
├── .github/
│   ├── workflows/
│   │   ├── project-auto.yml          # Auto-add issues/PRs to projects
│   │   ├── project-status.yml        # Update project status from PR lifecycle
│   │   ├── project-fields.yml        # Map labels to project fields
│   │   ├── status-comment.yml        # Post status updates on issues
│   │   ├── auto-label.yml            # Label PRs based on file paths
│   │   └── skip-vercel.yml           # Smart deployment skipping
│   ├── ISSUE_TEMPLATE/
│   │   └── feature.yml               # Structured issue template
│   ├── labeler.yml                   # Path-based labeling rules
│   └── pull_request_template.md      # PR template
├── scripts/
│   ├── install.sh                    # Installation script
│   ├── setup-secrets.sh              # Secrets setup helper
│   └── setup-branch-protection.sh    # Branch protection setup
├── config.example.yml                # Configuration template
├── README.md                         # Comprehensive documentation
├── QUICKSTART.md                     # Quick start guide
├── CHANGELOG.md                      # Version history
├── package.json                      # Package metadata
└── .gitignore                        # Git ignore rules
```

## 🎯 Core Features

### 1. Project Board Automation
- **project-auto.yml**: Automatically adds issues and PRs to GitHub project boards
- **project-status.yml**: Updates project card status based on PR state
- **project-fields.yml**: Maps GitHub labels to project board fields

### 2. Smart Labeling
- **auto-label.yml**: Automatically labels PRs based on changed file paths
- **labeler.yml**: Configurable path-to-label mappings

### 3. Status Communication
- **status-comment.yml**: Posts status updates on linked issues and PRs
- Tracks PR lifecycle and label changes

### 4. Deployment Control
- **skip-vercel.yml**: Intelligently skips deployments for docs-only changes
- Keyword and path-based skip detection

### 5. Templates
- **feature.yml**: Structured issue template with area/priority dropdowns
- **pull_request_template.md**: Standardized PR template

### 6. Setup Scripts
- **install.sh**: One-command installation
- **setup-secrets.sh**: Interactive secrets configuration
- **setup-branch-protection.sh**: Automated branch protection

## 🔄 Workflow Dependencies

```
Issue Created
    ↓
[project-auto.yml] → Adds to Project Board
    ↓
[project-fields.yml] → Maps Labels to Fields
    ↓
PR Created
    ↓
[auto-label.yml] → Labels PR
    ↓
[project-auto.yml] → Adds PR to Project
    ↓
[project-status.yml] → Updates Status to "In Progress"
    ↓
[status-comment.yml] → Comments on Linked Issues
    ↓
PR Merged
    ↓
[project-status.yml] → Updates Status to "Done"
    ↓
[status-comment.yml] → Posts Final Status Update
```

## 📋 Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `PROJECTS_TOKEN` | GitHub token with project write access |
| `PROJECT_URL` | Your GitHub project URL |
| `PROJECT_USER` | Your GitHub username |
| `PROJECT_ID` | Your GitHub project number |
| `PROJECT_FIELD_MAPPINGS` | Field mapping configuration |

## 🚀 Quick Installation

```bash
# 1. Copy package to your project
cp -r github-automation-package/* .

# 2. Install
bash scripts/install.sh

# 3. Configure secrets
bash scripts/setup-secrets.sh

# 4. Set up branch protection (optional)
bash scripts/setup-branch-protection.sh
```

## 📚 Documentation

- **[README.md](README.md)**: Complete documentation with all features
- **[QUICKSTART.md](QUICKSTART.md)**: 5-minute setup guide
- **[CHANGELOG.md](CHANGELOG.md)**: Version history

## 🎨 Customization Points

1. **Labeler Rules**: Edit `.github/labeler.yml`
2. **Field Mappings**: Update `PROJECT_FIELD_MAPPINGS` secret
3. **Issue Template**: Customize `.github/ISSUE_TEMPLATE/feature.yml`
4. **Status Values**: Modify workflow files for custom statuses
5. **Branch Protection**: Edit `scripts/setup-branch-protection.sh`

## ✅ Testing Checklist

After installation, test:

- [ ] Create an issue → Should appear in project board
- [ ] Add labels to issue → Fields should update
- [ ] Create PR → Should be added to project
- [ ] PR status → Should update automatically
- [ ] PR labels → Should apply based on file paths
- [ ] Merge PR → Status should change to "Done"
- [ ] Docs-only PR → Deployment should be skipped

## 🔗 Related Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Projects API](https://docs.github.com/en/graphql/reference/objects#projectv2)
- [GitHub CLI](https://cli.github.com/)
