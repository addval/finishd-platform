# Claude Skills for Finishd Platform

This directory contains world-class Claude Skills tailored for a Node.js, React, PostgreSQL, and Drizzle ORM project.

## Structure

```
.claude/
├── CLAUDE.md                          # Project-specific guidelines
├── README.md                          # This file
└── skills/
    ├── backend-api-development/       # Express.js, TypeScript, Drizzle
    ├── database-schema-migrations/    # PostgreSQL, Drizzle migrations
    ├── react-component-development/   # React, TypeScript, Hooks
    ├── code-quality-testing/          # Vitest, Biome
    └── git-workflow/                  # Conventional commits, PRs
```

## Skills Overview

### 1. Backend API Development
**Location**: `.claude/skills/backend-api-development/`

Generates production-ready backend code following MVC + Service Layer architecture.

**What it does**:
- Creates Express.js routes with TypeScript
- Builds controllers with proper error handling
- Implements service layer for business logic
- Adds validation middleware
- Follows RESTful conventions

**Supporting files**:
- `ROUTES.md` - Route patterns and middleware
- `CONTROLLERS.md` - Controller patterns and examples
- `SERVICES.md` - Service layer patterns

**Example usage**:
> "Create a CRUD API for user management with authentication"

---

### 2. Database Schema & Migrations
**Location**: `.claude/skills/database-schema-migrations/`

Handles PostgreSQL database design with Drizzle ORM schema and migrations.

**What it does**:
- Designs database schemas using Drizzle schema definitions
- Generates Drizzle migrations with `drizzle-kit`
- Creates type-safe schema definitions
- Implements relations (one-to-one, one-to-many, many-to-many)
- Adds indexes and constraints

**Supporting files**:
- `MODELS.md` - Schema definitions and patterns
- `ASSOCIATIONS.md` - Relationship types and examples

**Example usage**:
> "Create a posts table with author foreign key and tags relationship"

---

### 3. React Component Development
**Location**: `.claude/skills/react-component-development/`

Builds modern React components with TypeScript and hooks.

**What it does**:
- Creates reusable React components
- Implements custom hooks
- Manages state with Context API
- Follows feature-based structure
- Optimizes performance

**Supporting files**:
- `COMPONENTS.md` - Component patterns and examples
- `HOOKS.md` - Custom hooks and patterns

**Example usage**:
> "Create a LoginForm component with validation and error handling"

---

### 4. Code Quality & Testing
**Location**: `.claude/skills/code-quality-testing/`

Ensures code quality using Vitest and Biome.

**What it does**:
- Generates Vitest tests for React and backend
- Creates unit and integration tests
- Sets up Biome configuration
- Enforces TypeScript strict mode
- Provides testing best practices

**Supporting files**:
- `TESTING.md` - Testing patterns and best practices

**Example usage**:
> "Write unit tests for UserService with Vitest"

---

### 5. Git Workflow
**Location**: `.claude/skills/git-workflow/`

Standardizes Git practices with conventional commits and code review standards.

**What it does**:
- Generates conventional commit messages
- Creates branch naming conventions
- Writes PR descriptions
- Enforces code review standards
- Manages release process

**Supporting files**:
- `COMMITS.md` - Commit message examples

**Example usage**:
> "Create a commit message for adding user authentication feature"

---

## How Skills Work

### Automatic Activation
Claude automatically activates skills based on your request context. You don't need to manually invoke them.

### Skill Context
Each skill has:
- **Clear description** - Claude knows when to use it
- **Allowed tools** - Specific permissions for safe execution
- **Progressive disclosure** - Essential info in SKILL.md, details in supporting files
- **Utility scripts** - Automated generators for common tasks

### Best Practices

**DO's**:
- Be specific in your requests
- Provide context about what you're building
- Reference existing code when making changes
- Ask for explanations if needed
- Test generated code before committing

**DON'Ts**:
- Run migrations without reviewing them first
- Commit sensitive data
- Skip testing generated code
- Make breaking changes without understanding impact

## Quick Start Examples

### Backend Development
```
> Create a REST API for blog posts with CRUD operations
> Add authentication middleware to protected routes
> Generate a Drizzle schema for users with email validation
```

### Frontend Development
```
> Create a PostCard component with like functionality
> Build a custom useFetch hook with error handling
> Implement a context provider for user authentication
```

### Database
```
> Create a schema for posts table with author foreign key
> Add a many-to-many relationship between posts and tags
> Generate a seeder for initial users data
```

### Testing
```
> Write unit tests for UserService with Vitest
> Create integration tests for the login endpoint
> Add tests for a React component using React Testing Library
```

### Git Workflow
```
> Create a commit message for fixing login bug
> Generate a PR description for the new feature branch
> Create a feature branch for user registration
```

## Project Guidelines

See `CLAUDE.md` for:
- Architecture patterns
- Code conventions
- File structure
- Security best practices
- Performance optimization tips

## Configuration

### Environment Setup

1. **Backend** (`apps/backend/`)
   - TypeScript with strict mode
   - Express.js server
   - Drizzle ORM with PostgreSQL
   - PostgreSQL database
   - Vitest for testing

2. **Frontend** (`apps/frontend/`)
   - React with TypeScript
   - Vite build tool
   - React Testing Library
   - Vitest for testing

### Recommended VS Code Extensions

- Biome
- TypeScript Vue Plugin (if using Vue)
- Vitest
- GitLens
- Thunder Client (API testing)

## Contributing

When adding new features:
1. Create feature branch: `feat/PROJ-101-description`
2. Make changes with conventional commits
3. Test thoroughly
4. Create PR with description
5. Address review feedback

## Additional Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Version**: 2.0.0
**Last Updated**: January 2025
**Maintained by**: Finishd Platform Team
