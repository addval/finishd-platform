# Finishd Platform - Claude Guidelines

## Project Overview

This is a full-stack JavaScript application built with:
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM
- **Frontend**: React, TypeScript
- **Architecture**: MVC + Service Layer pattern
- **Database**: PostgreSQL with Drizzle migrations

## Code Conventions

### General Principles
- Follow **Clean Code** principles with clear, descriptive naming
- Use **TypeScript strict mode** for type safety
- Apply **SOLID principles** for object-oriented design
- Write **DRY (Don't Repeat Yourself)** code with proper abstraction
- Maintain **separation of concerns** across layers

### TypeScript Standards
- Enable strict mode in `tsconfig.json`
- Use explicit return types for functions
- Prefer interfaces over types for object shapes
- Use `unknown` instead of `any` when type is uncertain
- Leverage utility types (`Partial`, `Pick`, `Omit`, etc.)

### Error Handling
- Use custom error classes extending `Error`
- Implement global error handling middleware
- Return consistent error response format
- Log errors with appropriate context
- Never expose sensitive data in error messages

### Backend Structure (Node.js/Express)
```
backend/src/
├── config/         # Configuration files (database, environment)
├── controllers/    # Request handlers (thin layer)
├── services/       # Business logic (fat layer)
├── db/             # Drizzle schema, migrations, and database setup
│   ├── schema.ts   # Drizzle schema definitions
│   ├── index.ts    # Database connection
│   └── migrate.ts  # Migration runner
├── routes/         # Express route definitions
├── middlewares/    # Custom middleware functions
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
├── tests/          # Test files (Vitest)
└── server.ts       # Application entry point
```

### Frontend Structure (React)
```
frontend/src/
├── components/
│   ├── features/     # Feature-specific components
│   └── shared/       # Reusable UI components
├── hooks/            # Custom React hooks
├── services/         # API calls and external services
├── context/          # React Context providers
├── utils/            # Helper functions
├── types/            # TypeScript type definitions
├── assets/           # Static assets
└── App.tsx           # Root component
```

### Drizzle ORM Best Practices
- Define schema in `src/db/schema.ts` using Drizzle's type-safe schema builder
- Use **camelCase** for TypeScript field names, **snake_case** for database columns
- Use `pnpm db:generate` to generate migrations from schema changes
- Use `pnpm db:push` for development (pushes schema directly)
- Use `pnpm db:migrate` for production (runs generated migrations)
- Use transactions for multi-step operations with `db.transaction()`
- Define relations in schema for type-safe joins
- Use Drizzle's query builder or raw SQL for complex queries
- Implement proper indexes in schema definitions

### API Design Standards
- Use RESTful conventions for endpoints
- Implement proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Use consistent response format:
  ```json
  {
    "success": true,
    "data": {...},
    "message": "Operation successful",
    "error": null
  }
  ```
- Implement request validation (Joi/Zod)
- Add pagination, sorting, and filtering for list endpoints
- Version APIs when making breaking changes (/api/v1/)

### React Best Practices
- Use **functional components** with hooks (no class components)
- Implement proper error boundaries
- Use custom hooks to reuse logic
- Keep components small and focused (single responsibility)
- Use TypeScript for all props and state
- Implement proper loading and error states
- Optimize performance with useMemo, useCallback, React.memo
- Follow feature-based component organization

### Git Workflow
- Use **conventional commits** format:
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `refactor:` - Code refactoring
  - `style:` - Code style changes (formatting)
  - `docs:` - Documentation updates
  - `test:` - Adding or updating tests
  - `chore:` - Maintenance tasks
- Write clear, descriptive commit messages
- Create feature branches from `develop`
- Use PR templates for code reviews
- Ensure tests pass before committing

### Testing Standards
- Write **unit tests** for business logic (services, utilities)
- Write **integration tests** for API endpoints
- Write **component tests** for React components
- Aim for **80%+ code coverage**
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables for configuration
- Implement proper authentication (JWT)
- Add rate limiting to prevent abuse
- Validate and sanitize all user inputs
- Use parameterized queries (Drizzle handles this)
- Implement CORS policies
- Add helmet.js for security headers
- Keep dependencies updated

### Performance Optimization
- Implement database query optimization
- Use caching where appropriate (Redis)
- Add database indexes for frequently queried fields
- Implement lazy loading for React components
- Optimize images and static assets
- Use code splitting for React
- Monitor bundle size

## When to Ask for Permission

Always ask before:
- Running database migrations
- Modifying existing migrations
- Changing the database schema
- Installing new dependencies
- Making breaking API changes
- Deleting files or data

## Dev Documentation Pattern

This project uses the **Dev Docs pattern** for persistent task documentation across context resets.

### What are Dev Docs?

Dev Docs are a three-file structure that captures everything needed to resume work after context resets:

```
dev/active/[task-name]/
├── [task-name]-plan.md      # Strategic plan
├── [task-name]-context.md   # Key decisions & files
└── [task-name]-tasks.md     # Checklist format
```

### When to Use Dev Docs

**Use for:**
- Complex multi-day tasks
- Features with many moving parts
- Tasks likely to span multiple sessions
- Work that needs careful planning

**Skip for:**
- Simple bug fixes
- Single-file changes
- Quick updates

**Rule of thumb:** If it takes more than 2 hours or spans multiple sessions, use dev docs.

### Creating Dev Docs

**For new complex tasks:**
1. Ask Claude: "Create dev docs for [task description]"
2. Claude will create the three-file structure
3. Review and adjust the plan
4. Start implementing

**Example:**
```
"Create dev docs for implementing real-time notifications with WebSockets"
```

### Using Dev Docs

**During implementation:**
1. Refer to `plan.md` for overall strategy
2. Update `context.md` frequently (especially SESSION PROGRESS)
3. Check off tasks in `tasks.md` as you complete them

**After context reset:**
1. Claude reads all three files
2. Understands complete state in seconds
3. Resumes exactly where you left off

### Current Dev Docs

**Active:**
- `dev/active/authentication-system/` - JWT authentication with OTP email verification
  - Authentication system implementation
  - Email service integration
  - Device tracking and session management

**See:** `dev/README.md` for complete documentation of the pattern

### Files Reference

- **`dev/README.md`** - Complete dev docs pattern guide
- **`dev/active/[task]/[task]-plan.md`** - Strategic implementation plan
- **`dev/active/[task]/[task]-context.md`** - Current progress and decisions
- **`dev/active/[task]/[task]-tasks.md`** - Detailed task checklist

## Available Skills

This project includes specialized Claude Skills for:
1. **Backend API Development** - Express routes, controllers, services
2. **Database Schema & Migrations** - Drizzle schema and migrations
3. **React Component Development** - React components and hooks
4. **Code Quality & Testing** - Tests and linting
5. **Git Workflow** - Commits and PRs

Claude will automatically use these skills based on your request context.
