---
name: git-workflow
description: Generate conventional commit messages, create branch naming conventions, write PR descriptions, and enforce code review standards. Use when committing changes, creating branches, or making pull requests.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Git Workflow

Standardized Git practices for consistent version control, clear commit history, and effective code reviews.

## Conventional Commits

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add JWT token refresh` |
| `fix` | Bug fix | `fix(api): handle null user in response` |
| `refactor` | Code refactoring | `refactor(services): extract user validation logic` |
| `style` | Code style changes | `style(components): format with prettier` |
| `docs` | Documentation only | `docs(readme): add setup instructions` |
| `test` | Adding or updating tests | `test(user): add integration tests` |
| `chore` | Maintenance tasks | `chore(deps): update dependencies` |
| `perf` | Performance improvements | `perf(database): add index to email column` |
| `ci` | CI/CD changes | `ci(github): add automated tests` |

### Commit Examples

#### Simple Commit
```
feat: add user registration endpoint

Implement POST /api/v1/auth/register with email validation
and password hashing using bcrypt.
```

#### Detailed Commit
```
feat(posts): add post CRUD operations

- Create POST /api/v1/posts for creating posts
- Add GET /api/v1/posts with pagination
- Implement PUT /api/v1/posts/:id for updates
- Add DELETE /api/v1/posts/:id for deletion

All endpoints require authentication and include proper
error handling and validation.

Closes #123
```

#### Bug Fix Commit
```
fix(auth): resolve token expiration check

The JWT middleware was checking expiration incorrectly,
causing valid tokens to be rejected. Fixed by using the
correct clockTimestamp option in jwt.verify.

Fixes #456
```

#### Refactoring Commit
```
refactor(services): extract validation logic

Move common validation patterns from UserService and
PostService into a dedicated ValidationService class
to reduce code duplication and improve maintainability.
```

### Breaking Changes

```
feat(api): change user response format

BREAKING CHANGE: The user object structure has changed.
The `name` field is now split into `firstName` and
`lastName`. Update API consumers accordingly.

Migration guide: docs/migrations/v2.md
```

## Branch Naming Conventions

### Branch Types

```
<type>/<ticket-id>-<short-description>
```

### Branch Patterns

| Type | Format | Example |
|------|--------|---------|
| Feature | `feat/<ticket>-description` | `feat/PROJ-101-add-user-auth` |
| Bugfix | `fix/<ticket>-description` | `fix/PROJ-102-login-error` |
| Hotfix | `hotfix/<ticket>-description` | `hotfix/PROJ-103-security-patch` |
| Release | `release/v<version>` | `release/v1.0.0` |
| Refactor | `refactor/<ticket>-description` | `refactor/PROJ-104-cleanup-code` |

### Examples

```bash
# Feature branch
feat/PROJ-101-user-registration

# Bug fix branch
fix/PROJ-102-payment-gateway-error

# Hotfix branch (for production issues)
hotfix/PROJ-103-critical-security-fix

# Release branch
release/v2.0.0

# Refactor branch
refactor/PROJ-104-database-cleanup
```

## Workflow Process

### Feature Branch Workflow

```bash
# 1. Start from main/develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feat/PROJ-101-user-auth

# 3. Make changes and commit
git add .
git commit -m "feat(auth): add user authentication"

# 4. Push to remote
git push -u origin feat/PROJ-101-user-auth

# 5. Create Pull Request
# (Use PR template below)

# 6. After merge, delete branch
git checkout develop
git branch -d feat/PROJ-101-user-auth
git push origin --delete feat/PROJ-101-user-auth
```

### Pull Request Process

#### PR Title Format

Follow conventional commits format:

```
feat(posts): add post management system

or

fix(auth): resolve JWT token expiration issue
```

#### PR Template

```markdown
## Description
Brief description of changes made in this PR.

## Type of Change
- [ ] feat - New feature
- [ ] fix - Bug fix
- [ ] refactor - Code refactoring
- [ ] style - Code style changes
- [ ] docs - Documentation changes
- [ ] test - Adding or updating tests
- [ ] chore - Maintenance tasks

## Related Ticket
Closes #[ticket-number]
Related to #[ticket-number]

## Changes Made
- List key changes here
- Use bullet points
- Be specific

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing locally

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests with sufficient coverage added
- [ ] All tests passing
- [ ] No merge conflicts

## Additional Notes
Any additional context or considerations for reviewers
```

## Code Review Standards

### Reviewer Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs

#### Code Quality
- [ ] Code is readable and understandable
- [ ] Follows project conventions
- [ ] Appropriate comments where needed
- [ ] No unnecessary complexity
- [ ] DRY principle followed

#### Performance
- [ ] No obvious performance issues
- [ ] Efficient algorithms used
- [ ] Database queries optimized
- [ ] No memory leaks

#### Security
- [ ] No security vulnerabilities
- [ ] Input validation present
- [ ] Sensitive data protected
- [ ] No hardcoded secrets

#### Testing
- [ ] Tests cover new functionality
- [ ] Tests are meaningful
- [ ] Edge cases tested
- [ ] No flaky tests

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] API documentation updated
- [ ] README updated if needed

### Review Comments Format

#### Suggestion
```markdown
**Suggestion**

Consider using async/await here for better readability:

\`\`\`typescript
// Instead of:
getUser().then(user => processUser(user));

// Use:
const user = await getUser();
processUser(user);
\`\`\`
```

#### Issue
```markdown
**Issue**

This could potentially cause a race condition. Consider adding
proper locking or using transactions.

See: [link to relevant documentation]
```

#### Approval
```markdown
**Approved**

Looks good! Minor suggestions that don't block merge:
- Consider extracting this into a separate function
- Add JSDoc comment for clarity

LGTM with optional changes.
```

## Git Hooks

### Pre-commit Hook (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test

# Run format check
npm run format:check
```

### Commit-msg Hook (.husky/commit-msg)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message format
npx commitlint --edit $1
```

### Commitlint Configuration

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'refactor', 'style',
      'docs', 'test', 'chore', 'perf', 'ci'
    ]],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100]
  }
};
```

## Release Process

### Version Numbering

Follow Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Pre-Release**
   - [ ] All tests passing
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   - [ ] Version number updated

2. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0
   ```

3. **Update Version Files**
   - package.json (version)
   - CHANGELOG.md (add release notes)

4. **Commit and Tag**
   ```bash
   git commit -m "chore: release v1.2.0"
   git tag -a v1.2.0 -m "Release v1.2.0"
   ```

5. **Merge and Push**
   ```bash
   git checkout main
   git merge release/v1.2.0
   git push origin main --tags
   ```

### CHANGELOG Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2024-01-15

### Added
- User authentication with JWT
- Post CRUD operations
- File upload functionality

### Changed
- Improved error handling
- Updated API response format

### Fixed
- Token expiration bug
- Memory leak in data fetching

### Security
- Added rate limiting
- Implemented CORS policies

## [1.1.0] - 2024-01-01
...
```

## Best Practices

### DO's ✅

- **Write clear, descriptive commit messages**
- **Keep commits atomic** (one logical change per commit)
- **Review your own changes** before requesting review
- **Update documentation** with code changes
- **Write meaningful PR descriptions**
- **Respond to review feedback** promptly
- **Keep branches short-lived** (merge within a few days)
- **Resolve merge conflicts** before requesting review
- **Test thoroughly** before pushing
- **Follow conventional commits** format

### DON'Ts ❌

- **Don't commit directly to main/develop**
- **Don't make huge commits** (break them down)
- **Don't include sensitive data** (API keys, passwords)
- **Don't skip code review**
- **Don't ignore failing tests**
- **Don't leave TODOs** in committed code
- **Don't use vague commit messages** like "update files"
- **Don't commit dependencies** (node_modules, etc.)
- **Don't force push** to shared branches
- **Don't rewrite public history**

## Useful Git Commands

### Viewing History
```bash
git log --oneline --graph --all      # Visual commit history
git log --author="John"              # Commits by author
git show <commit-hash>               # View commit details
```

### Branching
```bash
git branch -a                        # List all branches
git branch -d <branch>               # Delete local branch
git push origin --delete <branch>    # Delete remote branch
```

### Stashing
```bash
git stash                            # Stash changes
git stash pop                        # Apply stashed changes
git stash list                       # List stashes
```

### Undoing Changes
```bash
git reset --soft HEAD~1              # Undo last commit, keep changes
git reset --hard HEAD~1              # Undo last commit, discard changes
git revert <commit-hash>             # Revert commit safely
```

See [COMMITS.md](COMMITS.md) for more detailed commit message examples.
