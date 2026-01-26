# Commit Message Examples

## Feature Commits

### Simple Feature
```
feat: add dark mode toggle

Implement a dark mode toggle in the user settings that
persists preference in localStorage.
```

### Feature with Scope
```
feat(auth): implement OAuth2 authentication

Add support for Google and GitHub OAuth2 providers:
- New OAuthController for handling callbacks
- User model updated to store OAuth data
- Frontend login buttons added to login form

Closes #234
```

### Breaking Feature
```
feat(api): change user endpoint structure

BREAKING CHANGE: User API endpoint now returns nested objects:
- Address fields moved into `address` object
- Phone numbers now in array `phones`

Migration guide available at docs/api-v2-migration.md
```

## Bug Fix Commits

### Simple Fix
```
fix: resolve navigation issue on mobile

The hamburger menu was not opening on mobile devices due
to incorrect z-index. Fixed by adjusting CSS.
```

### Fix with Details
```
fix(database): prevent connection pool exhaustion

The database connection pool was not being properly closed
after requests, causing connection leaks. Implemented proper
connection release in the error handling middleware.

Fixes #567
```

### Regression Fix
```
fix: restore backward compatibility for user API

The recent API changes broke existing clients. Restored
the old response format while keeping new fields optional
to maintain backward compatibility.
```

## Refactoring Commits

### Code Cleanup
```
refactor: extract common validation logic

Move duplicated validation code from UserService and
PostService into a shared ValidationService utility class.
Reduces code duplication by 40%.
```

### Performance Improvement
```
refactor(database): optimize query performance

Replace N+1 queries in user post retrieval with a single
joined query. Reduces response time from 500ms to 50ms.

Before: SELECT * FROM posts WHERE user_id = ? (N times)
After: SELECT * FROM posts WHERE user_id IN (?, ?, ...)
```

### Type Safety
```
refactor(types): add strict TypeScript types

Replace `any` types with proper interfaces and add strict
null checks. Improves type safety and catches potential
runtime errors at compile time.
```

## Documentation Commits

### README Update
```
docs(readme): update setup instructions

Add detailed installation steps for Windows and improve
Docker setup documentation. Include troubleshooting section.
```

### API Documentation
```
docs(api): add authentication endpoint documentation

Document all authentication endpoints including request/response
examples, error codes, and usage instructions. Add Postman
collection link for easy testing.
```

### Code Comments
```
docs(comments): add JSDoc to utility functions

Add comprehensive JSDoc comments to all helper functions in
src/utils/helpers.ts including parameter types, return values,
and usage examples.
```

## Testing Commits

### Unit Tests
```
test(user): add unit tests for UserService

Add comprehensive unit tests for all UserService methods:
- createUser (valid and invalid inputs)
- getUserById (existing and non-existent users)
- updateUser (various scenarios)
- deleteUser (soft delete verification)

Achieves 95% code coverage for UserService.
```

### Integration Tests
```
test(api): add integration tests for posts endpoint

Test the complete posts API flow including:
- Authentication
- CRUD operations
- Permission checks
- Error handling

Uses test database with seeded data.
```

### Bug Fix Test
```
test(auth): add regression test for token refresh

Add test to prevent regression of the token refresh bug
where expired tokens were not properly rotated. Test
covers both valid and expired token scenarios.
```

## Performance Commits

### Database Optimization
```
perf(database): add index to user email column

Add unique index on users.email to improve login query
performance. Reduces average login time from 200ms to 50ms.

CREATE UNIQUE INDEX users_email_unique ON users(email);
```

### Frontend Optimization
```
perf(frontend): implement code splitting

Split React application into route-based chunks using
React.lazy(). Reduces initial bundle size from 500KB to
200KB and improves Time to Interactive.
```

### Caching Strategy
```
perf(api): add Redis caching for frequently accessed data

Implement Redis caching for user profiles and post metadata.
Cache TTL set to 5 minutes with cache stampede protection.
Reduces database load by 60%.
```

## CI/CD Commits

### GitHub Actions
```
ci(github): add automated testing workflow

Implement GitHub Actions workflow that runs on every push:
- Linting with ESLint
- Type checking with TypeScript
- Unit tests with Vitest
- Integration tests with test database

Blocks merging if any check fails.
```

### Deployment Pipeline
```
ci(deploy): set up automated deployment to staging

Configure deployment pipeline that:
- Runs on merge to develop branch
- Builds Docker image
- Runs smoke tests
- Deploys to staging environment
- Notifies team on Slack
```

## Style Commits

### Code Formatting
```
style: apply prettier formatting

Run prettier on all TypeScript files to ensure consistent
code formatting. No logic changes.
```

### Import Organization
```
style: organize imports alphabetically

Reorganize all imports to follow the project convention:
1. Node.js imports
2. External library imports
3. Internal imports
4. Type imports

Each section sorted alphabetically.
```

## Chore Commits

### Dependencies
```
chore(deps): upgrade react to v18

Upgrade React from v17 to v18 and update related packages.
Includes breaking changes from concurrent features.

Package changes:
- react: 17.0.2 -> 18.2.0
- react-dom: 17.0.2 -> 18.2.0
- @types/react: 17.0.2 -> 18.0.0
```

### Configuration
```
chore(config): update TypeScript strict mode settings

Enable strict mode in tsconfig.json for better type safety:
- strictNullChecks: true
- noImplicitAny: true
- strictFunctionTypes: true

Fix resulting type errors in affected files.
```

### Build Tools
```
chore(build): migrate from Webpack to Vite

Replace Webpack with Vite for faster development server and
optimized production builds. Configuration updates in
vite.config.ts.

Benefits:
- 10x faster HMR
- 50% faster builds
- Simplified configuration
```

## Commit Message Anti-Patterns

### ❌ Bad Commits

```
# Too vague
fix: fixed some stuff

# Too long
feat: added a really long feature that does many different things and
should probably be broken up into multiple smaller commits for better
code organization and easier review process

# Mixed changes
fix: added feature and fixed bug

# No context
update files

# Uses conversational language
fix: so I noticed this bug and I fixed it

# No subject
feat:


Just added a new button
```

### ✅ Better Alternatives

```
# Specific and clear
fix: resolve navigation issue on mobile devices

# Break down into smaller commits
feat(auth): implement OAuth2 login
feat(ui): add social login buttons

# Separate commits
feat(api): add file upload endpoint
fix(api): handle multipart form data errors

# Action-oriented
docs: update API endpoint documentation

# Professional tone
fix(user): prevent duplicate email registration
```

## Multi-Line Commit Example

```
feat(posts): implement post search functionality

Add full-text search for posts with the following features:
- Search by title and content
- Filter by tags and categories
- Sort by relevance, date, or popularity
- Pagination support

Implementation details:
- PostgreSQL full-text search with tsvector
- Search query parsing and validation
- Response time < 100ms for 1M posts
- Caching layer for popular searches

API endpoint: GET /api/v1/posts/search?q=query&tags=tag1,tag2

Closes #123
```

## Commit Message Template

```bash
# Format
<type>(<scope>): <subject>

# Body (optional)
<details about the change>

# Footer (optional)
<references to issues>
```

Use this template to maintain consistency across all commits.
