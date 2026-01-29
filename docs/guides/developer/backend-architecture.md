# Backend Architecture - Finishd Platform

## Overview

This document provides a comprehensive overview of the Finishd Platform backend architecture, including design patterns, folder structure, technology stack, and implementation status.

**Last Updated**: January 28, 2026
**Version**: 2.0.0

---

## Architecture Pattern

The backend follows the **MVC (Model-View-Controller) + Service Layer** pattern, providing clear separation of concerns and maintaining clean code principles.

### Why MVC + Service Layer?

- **Controllers**: Thin layer that handles HTTP requests/responses
- **Services**: Fat layer containing business logic and reusable operations
- **Schema/Models**: Data access layer with Drizzle ORM
- **Benefits**: Testability, maintainability, scalability, single responsibility

### Request Flow Diagram

```
HTTP Request
    |
Middleware (Auth, Validation, Rate Limiting, Logging)
    |
Route Handler
    |
Controller (Request parsing, response formatting)
    |
Service Layer (Business logic, validation, orchestration)
    |
Drizzle ORM (Database operations)
    |
Database (PostgreSQL)
    |
Response (formatted data)
```

---

## Folder Structure

```
apps/backend/src/
├── config/              # Configuration files
├── controllers/         # Request handlers (thin layer)
├── middlewares/         # Express middleware functions
├── db/                  # Database layer (Drizzle)
│   ├── schema.ts        # Drizzle schema definitions
│   ├── index.ts         # Database connection
│   ├── migrate.ts       # Migration runner
│   └── seed-finishd.ts  # Seed data for development
├── routes/              # API route definitions
├── services/            # Business logic (fat layer)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── tests/               # Test files (Vitest)
└── server.ts            # Application entry point
```

---

## Core Components

### 1. **Config Layer** (`/config`)

Configuration modules for external services and application settings.

**Files**:
- `database.ts` - Database configuration (legacy, being migrated)
- `redis.ts` - Redis client configuration (optional caching)

**Responsibilities**:
- Environment variable validation
- Connection management
- Service initialization

---

### 2. **Controllers Layer** (`/controllers`)

Thin layer that handles HTTP request/response processing.

**Responsibilities**:
- Parse request body, params, query
- Call appropriate service methods
- Format consistent HTTP responses
- Handle HTTP status codes
- **DO NOT**: Contain business logic, directly access database

**Example**:
```typescript
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const result = await authService.register({ email, password, name });
    res.status(201).json(successResponse(result, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};
```

---

### 3. **Services Layer** (`/services`)

Fat layer containing all business logic and application rules.

**Responsibilities**:
- Implement business rules and workflows
- Coordinate between multiple tables
- Handle complex operations (transactions, multi-step flows)
- Perform validations (business-level)
- **DO NOT**: Handle HTTP concerns, format responses

---

### 4. **Database Layer** (`/db`)

Drizzle ORM schema and database operations.

**Files**:
- `schema.ts` - Table definitions, relations, and type exports
- `index.ts` - Database connection setup
- `migrate.ts` - Migration runner
- `seed-finishd.ts` - Development seed data

**Naming Conventions**:
- **Schema files**: `schema.ts`
- **Table variables**: `camelCase` (e.g., `users`, `designerProfiles`)
- **Database columns**: `snake_case` (e.g., `email_verified_at`)
- **TypeScript fields**: `camelCase` in schema (e.g., `emailVerifiedAt`)

---

### 5. **Routes Layer** (`/routes`)

API endpoint definitions and middleware attachment.

**Responsibilities**:
- Define HTTP endpoints (GET, POST, PUT, DELETE)
- Attach middleware (auth, validation, rate limiting)
- Connect routes to controllers
- Version APIs (e.g., `/api/v1/`)

**Example**:
```typescript
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
```

---

### 6. **Middlewares Layer** (`/middlewares`)

Custom Express middleware for cross-cutting concerns.

**Files**:
- `auth.middleware.ts` - JWT verification and user attachment
- `validation.middleware.ts` - Request validation
- `rateLimit.middleware.ts` - Rate limiting
- `errorHandler.ts` - Global error handling
- `requestLogger.ts` - HTTP request logging

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript runtime |
| **Framework** | Express.js | 4.x | Web framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Database** | PostgreSQL | 14+ | Relational database |
| **ORM** | Drizzle | 0.38+ | Type-safe database abstraction |
| **Authentication** | JWT | - | Token-based auth |
| **Validation** | Zod | 3.x | Request validation |
| **Testing** | Vitest | 4.x | Unit/integration tests |
| **Code Quality** | Biome | 2.x | Linting and formatting |

---

## Database Commands

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema directly to database (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Run seed data
pnpm db:seed:finishd
```

---

## Code Conventions

### TypeScript Standards

- **Strict mode**: Enabled in `tsconfig.json`
- **Explicit return types**: Required for all functions
- **Interfaces**: Use for object shapes, `types` for unions/intersections
- **Unknown**: Use `unknown` instead of `any` when type is uncertain

### Error Handling

- **Custom error classes**: Extend `Error` with status codes
- **Global error handler**: Centralized error middleware
- **Consistent error format**: `{ success: false, error: {...}, message: "..." }`

### Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { "id": "123", "email": "user@example.com" },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "success": false,
  "data": null,
  "message": "User with this email already exists"
}
```

---

## Getting Started

**Quick Start**:
```bash
cd apps/backend
pnpm install
pnpm db:push        # Push schema to database
pnpm db:seed:finishd  # Seed development data
pnpm dev            # Start development server
```

---

## Related Documentation

- [Database Setup](./backend-database-setup.md) - Migration and seeder guide
- [Services Guide](./backend-services-guide.md) - Service layer patterns
- [API Reference](./backend-api-reference.md) - Available API endpoints
