# GitHub Project Automation Package

A comprehensive, AI-driven GitHub project tracking and automation system that automatically manages issues, pull requests, and project boards with intelligent status updates, field mapping, and deployment controls.

## 🚀 Features

### 📋 **Project Board Automation**
- **Auto-add to Projects**: Automatically adds issues and pull requests to your GitHub project board
- **Status Tracking**: Updates project status based on PR lifecycle (Backlog → In Progress → Done)
- **Field Mapping**: Maps GitHub labels to project fields (Area, Priority, Status)
- **Manual Triggers**: Add existing items to projects via workflow dispatch

### 🏷️ **Smart Labeling**
- **Path-based Labeling**: Automatically labels PRs based on changed file paths
- **Configurable Rules**: Customize label mappings to match your project structure
- **Multi-label Support**: PRs can receive multiple labels based on changes

### 💬 **Status Comments**
- **Issue Linking**: Automatically comments on linked issues when PR status changes
- **Status Updates**: Posts status change notifications on issues and PRs
- **Label-based Status**: Updates status when labels are added/removed

### 🚫 **Smart Deployment Control**
- **Skip Detection**: Automatically skips deployments for documentation-only changes
- **Keyword Detection**: Skip deployments using `[skip vercel]`, `[no-deploy]` keywords
- **Path-based Skipping**: Skip deployments when only docs/README/LICENSE files change

### 🔒 **Branch Protection**
- **Automated Setup**: Scripts to configure branch protection rules
- **Configurable Reviews**: Set required review counts per branch
- **Strict Status Checks**: Enforce passing CI checks before merge

### 📝 **Templates**
- **Issue Templates**: Structured issue templates with area and priority dropdowns
- **PR Templates**: Standardized pull request templates with checklists

## 📦 Installation

### Quick Start

1. **Clone or copy this package** into your project:
   ```bash
   cd your-project
   cp -r github-automation-package/* .
   ```

2. **Run the installation script**:
   ```bash
   bash scripts/install.sh
   ```

3. **Configure your project**:
   ```bash
   # Edit the configuration file
   cp config.example.yml github-automation-config.yml
   # Edit github-automation-config.yml with your project settings
   ```

4. **Set up GitHub secrets**:
   ```bash
   bash scripts/setup-secrets.sh
   ```

5. **Configure branch protection**:
   ```bash
   bash scripts/setup-branch-protection.sh
   ```

## ⚙️ Configuration

### GitHub Secrets

Set these secrets in your repository (Settings → Secrets and variables → Actions):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `PROJECTS_TOKEN` | GitHub token with project write access | [Create token](https://github.com/settings/tokens) with `repo` and `project` scopes |
| `PROJECT_URL` | Your GitHub project URL | Found in your project's URL: `https://github.com/users/USERNAME/projects/N` |
| `PROJECT_USER` | Your GitHub username | Your GitHub username |
| `PROJECT_ID` | Your GitHub project number | The number in your project URL |
| `PROJECT_FIELD_MAPPINGS` | Field mapping configuration | See Field Mappings section below |

### Field Mappings

The `PROJECT_FIELD_MAPPINGS` secret should contain field mappings in this format:

```
Area=Library:label:Library
Area=Deckbuilder:label:Deckbuilder
Area=AI:label:AI
Priority=P0:label:P0
Priority=P1:label:P1
Status=Backlog:label:backlog
Status=In Progress:label:in-progress
```

Format: `ProjectField=Value:label:LabelName`

### Labeler Configuration

Edit `.github/labeler.yml` to match your project structure:

```yaml
Frontend:
  - 'src/components/**'
  - 'src/pages/**'
Backend:
  - 'api/**'
  - 'server/**'
Docs:
  - '**/*.md'
```

### Issue Template

Customize `.github/ISSUE_TEMPLATE/feature.yml` with your project's areas and priorities.

## 📚 Workflow Documentation

### 1. Project Auto (`project-auto.yml`)

**Purpose**: Automatically adds issues and PRs to your GitHub project board.

**Triggers**:
- Issue opened, reopened, edited, or labeled
- PR opened, reopened, ready for review, synchronized, or closed
- Manual workflow dispatch

**How it works**:
1. Detects when an issue or PR is created
2. Resolves the GraphQL node_id
3. Adds the item to your project board using the `PROJECT_URL` secret

**Manual Usage**:
```bash
# Via GitHub Actions UI:
# Actions → Project Auto → Run workflow
# Type: issue or pr
# Number: issue/PR number
```

### 2. Project Status (`project-status.yml`)

**Purpose**: Updates project card status based on PR lifecycle.

**Status Mappings**:
- PR opened/reopened/ready for review → **In Progress**
- PR merged → **Done**
- PR closed (not merged) → **Backlog**
- PR converted to draft → **Backlog**

**Triggers**: PR events (opened, reopened, ready_for_review, closed, converted_to_draft)

### 3. Project Field Mapper (`project-fields.yml`)

**Purpose**: Maps GitHub labels to project board fields.

**How it works**:
1. Listens for label events on issues and PRs
2. Checks if the label matches a field mapping
3. Updates the project card field accordingly

**Example**: Adding label `Library` to an issue updates the `Area` field to `Library` on the project card.

**Triggers**: Issue/PR labeled or opened

### 4. Status Comment Bot (`status-comment.yml`)

**Purpose**: Posts status update comments on linked issues and PRs.

**Features**:
- Comments on issues when linked PRs change status
- Posts status updates when labels change
- Parses `Closes #123` style references in PR descriptions

**Triggers**: PR status changes, issue label changes

### 5. Auto Label (`auto-label.yml`)

**Purpose**: Automatically labels PRs based on changed file paths.

**How it works**:
1. Analyzes files changed in a PR
2. Matches paths against `.github/labeler.yml` rules
3. Applies matching labels automatically

**Triggers**: PR opened, synchronized, or reopened

### 6. Skip Vercel Deployment (`skip-vercel.yml`)

**Purpose**: Intelligently skips deployments when not needed.

**Skip Conditions**:
- PR title/body contains: `[skip vercel]`, `[no-deploy]`, `[skip deploy]`
- Commit message contains skip keywords
- Only documentation files changed (`docs/` directory)
- Only README.md or LICENSE changed

**Usage**:
```bash
# In PR title:
[skip vercel] Update documentation

# In commit message:
git commit -m "docs: update README [skip vercel]"
```

**Output**: Sets `should_skip` output that can be used by other workflows.

## 🔧 Customization

### Customizing Project Fields

1. **Update Field Mappings**: Edit the `PROJECT_FIELD_MAPPINGS` secret with your field names
2. **Update Status Values**: Modify `project-status.yml` to match your project's status values
3. **Add Custom Fields**: Extend `project-fields.yml` with additional field mappings

### Customizing Labels

1. **Edit Labeler Config**: Update `.github/labeler.yml` with your project paths
2. **Add New Labels**: Create new label rules following the existing pattern
3. **Update Issue Template**: Modify `.github/ISSUE_TEMPLATE/feature.yml` with your areas

### Customizing Branch Protection

Edit `scripts/setup-branch-protection.sh` to:
- Change protected branches
- Adjust required review counts
- Modify protection rules

## 📖 Usage Examples

### Example 1: Automatic Project Tracking

1. Create an issue with label `Library` and priority `P1`
2. The issue is automatically added to your project board
3. The `Area` field is set to `Library` and `Priority` to `P1`
4. When you create a PR that closes the issue, it's also added to the project
5. PR status updates automatically: In Progress → Done (when merged)

### Example 2: Smart Labeling

1. Create a PR that changes files in `src/components/` and `docs/`
2. PR automatically receives `Frontend` and `Docs` labels
3. Project card `Area` field updates based on labels

### Example 3: Deployment Control

1. Create a PR that only changes `README.md`
2. Deployment is automatically skipped
3. No preview deployment is created
4. Saves build minutes and resources

## 🐛 Troubleshooting

### Items Not Being Added to Project

**Check**:
1. `PROJECTS_TOKEN` has correct permissions (repo, project)
2. `PROJECT_URL` is correct and accessible
3. Project board exists and is accessible
4. Workflow runs are not failing (check Actions tab)

**Debug**:
```bash
# Check token permissions
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Verify project access
gh api graphql -f query='
  query {
    user(login: "YOUR_USERNAME") {
      projectV2(number: PROJECT_ID) {
        id
        title
      }
    }
  }
'
```

### Status Not Updating

**Check**:
1. `PROJECT_FIELD_MAPPINGS` includes Status mappings
2. Project board has a `Status` field
3. Status values match exactly (case-sensitive)

### Labels Not Applying

**Check**:
1. `.github/labeler.yml` paths match your project structure
2. Labels exist in your repository
3. Workflow has `pull-requests: write` permission

### Branch Protection Not Working

**Check**:
1. GitHub CLI is installed: `gh --version`
2. Authenticated: `gh auth status`
3. Have admin access to repository
4. Branches exist before running script

## 🔐 Security Considerations

1. **Token Permissions**: Use minimal required permissions for `PROJECTS_TOKEN`
2. **Secret Management**: Never commit secrets to repository
3. **Workflow Permissions**: Review and limit workflow permissions
4. **Branch Protection**: Always protect main branches

## 📝 Best Practices

1. **Start Small**: Enable one workflow at a time to test
2. **Monitor Actions**: Check GitHub Actions tab regularly
3. **Customize Gradually**: Adjust configurations based on your needs
4. **Document Changes**: Keep your team informed of automation changes
5. **Test First**: Test workflows on a test repository first

## 🤝 Contributing

To contribute improvements:

1. Fork the package
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Open an issue in the repository

## 🎯 Roadmap

Future enhancements:
- [ ] Support for multiple projects
- [ ] Custom status workflows
- [ ] Integration with external project management tools
- [ ] AI-powered issue categorization
- [ ] Automated changelog generation
- [ ] Release automation

---

**Made with ❤️ for better GitHub project management**
