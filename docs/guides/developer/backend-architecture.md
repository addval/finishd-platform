# Backend Architecture - Rituality Platform

## 📋 Overview

This document provides a comprehensive overview of the Rituality Platform backend architecture, including design patterns, folder structure, technology stack, and implementation status.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🏗️ Architecture Pattern

The backend follows the **MVC (Model-View-Controller) + Service Layer** pattern, providing clear separation of concerns and maintaining clean code principles.

### Why MVC + Service Layer?

- **Controllers**: Thin layer that handles HTTP requests/responses
- **Services**: Fat layer containing business logic and reusable operations
- **Models**: Data access layer with Sequelize ORM
- **Benefits**: Testability, maintainability, scalability, single responsibility

### Request Flow Diagram

```
HTTP Request
    ↓
Middleware (Auth, Validation, Rate Limiting, Logging)
    ↓
Route Handler
    ↓
Controller (Request parsing, response formatting)
    ↓
Service Layer (Business logic, validation, orchestration)
    ↓
Model/Repository (Database operations via Sequelize)
    ↓
Database (PostgreSQL)
    ↓
Response (formatted data)
```

---

## 📁 Folder Structure

```
apps/backend/src/
├── config/              # Configuration files
├── controllers/         # Request handlers (thin layer)
├── middlewares/         # Express middleware functions
├── migrations/          # Database migrations (Sequelize)
├── models/              # Sequelize models (data layer)
├── routes/              # API route definitions
├── scripts/             # Utility scripts (migrate, seed)
├── seeders/             # Database seeders
├── services/            # Business logic (fat layer)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── tests/               # Test files (Jest)
└── server.ts            # Application entry point
```

---

## 🔧 Core Components

### 1. **Config Layer** (`/config`)

Configuration modules for external services and application settings.

**Files**:
- `database.ts` - Sequelize configuration with PostgreSQL connection pooling
- `redis.ts` - Redis client configuration (optional caching)

**Responsibilities**:
- Environment variable validation
- Connection management
- Pool configuration
- Service initialization

---

### 2. **Controllers Layer** (`/controllers`)

Thin layer that handles HTTP request/response processing.

**Files**:
- `auth.controller.ts` - Authentication endpoints (register, login, verify, reset, etc.)

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

**Files**:
- `auth.service.ts` - Authentication business logic (600+ lines)
- `email.service.ts` - Email sending service (stub)

**Responsibilities**:
- Implement business rules and workflows
- Coordinate between multiple models
- Handle complex operations (transactions, multi-step flows)
- Perform validations (business-level)
- **DO NOT**: Handle HTTP concerns, format responses

**Example**:
```typescript
async register(data: RegisterDto): Promise<AuthResponse> {
  // 1. Validate input
  // 2. Check if user exists
  // 3. Hash password
  // 4. Create user transaction
  // 5. Generate tokens
  // 6. Send verification email
  // 7. Return formatted response
}
```

---

### 4. **Models Layer** (`/models`)

Sequelize models representing database tables and relationships.

**Files**:
- `index.ts` - Model exports and associations
- `User.model.ts` - User entity with 30+ fields
- `Role.model.ts` - Role entity (admin, user, etc.)
- `UserPermission.model.ts` - User permissions and preferences
- `UserDevice.model.ts` - Device and session management

**Responsibilities**:
- Define table schema
- Define relationships (hasMany, belongsTo, etc.)
- Add instance and class methods
- Define scopes for common queries
- Add model-level validations

**Naming Conventions**:
- **Model files**: `PascalCase.model.ts` (e.g., `User.model.ts`)
- **Model classes**: `PascalCase` (e.g., `User`, `Role`)
- **Database columns**: `snake_case` (e.g., `email_verified_at`)
- **Model attributes**: `camelCase` in TypeScript (e.g., `emailVerifiedAt`)

---

### 5. **Routes Layer** (`/routes`)

API endpoint definitions and middleware attachment.

**Files**:
- `index.ts` - Route aggregator with `/api` prefix
- `auth.routes.ts` - Authentication routes

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

**Responsibilities**:
- Authentication/authorization
- Request validation
- Rate limiting
- Error handling
- Logging
- CORS, compression, etc.

---

### 7. **Migrations Layer** (`/migrations`)

Database schema version control with Sequelize migrations.

**Files**:
- `20260109120001-create-roles.js`
- `20260109120002-create-users.js`
- `20260109120003-create-user-permissions.js`
- `20260109120004-create-user-devices.js`

**Responsibilities**:
- Define database schema changes
- Ensure repeatable deployments
- Support rollbacks
- Maintain schema history

**Usage**:
```bash
npm run migrate        # Run pending migrations
npm run migrate:undo   # Rollback last migration
npm run migrate:undo:all  # Rollback all migrations
```

---

### 8. **Seeders Layer** (`/seeders`)

Database seeding for default and test data.

**Files**:
- `20260109120001-create-default-roles.js`

**Responsibilities**:
- Seed default data (roles, admin users, etc.)
- Seed test data for development
- Ensure repeatable seeding

**Usage**:
```bash
npm run seed           # Run seeders
npm run seed:undo      # Undo last seeder
```

---

### 9. **Utils Layer** (`/utils`)

Reusable utility functions and helpers.

**Files**:
- `password.util.ts` - Password hashing, validation, code generation
- `token.util.ts` - JWT token generation and verification
- `otp.util.ts` - OTP generation and validation
- `logger.ts` - Logging utility
- `errors.ts` - Custom error classes

**Responsibilities**:
- Pure functions (no side effects when possible)
- Reusable operations
- Helper methods for common tasks

---

## 🛠️ Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 4.x | Web framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Database** | PostgreSQL | 14+ | Relational database |
| **ORM** | Sequelize | 6.x | Database abstraction |
| **Authentication** | JWT | - | Token-based auth |
| **Validation** | Joi/Zod | - | Request validation |
| **Testing** | Jest | - | Unit/integration tests |
| **Code Quality** | ESLint, Prettier | - | Linting and formatting |

---

## 🎯 Code Conventions

### TypeScript Standards

- **Strict mode**: Enabled in `tsconfig.json`
- **Explicit return types**: Required for all functions
- **Interfaces**: Use for object shapes, `types` for unions/intersections
- **Unknown**: Use `unknown` instead of `any` when type is uncertain
- **Utility types**: Leverage `Partial`, `Pick`, `Omit`, `Record`, etc.

**Example**:
```typescript
// ✅ Good
interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

async function createUser(data: CreateUserDto): Promise<User> {
  // Implementation
}

// ❌ Bad
async function createUser(data: any): Promise<any> {
  // Implementation
}
```

### Error Handling

- **Custom error classes**: Extend `Error` with status codes
- **Global error handler**: Centralized error middleware
- **Consistent error format**: `{ success: false, error: {...}, message: "..." }`
- **Never expose sensitive data**: Stack traces, passwords, etc.

**Example**:
```typescript
// Custom error class
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// In service
if (await User.findOne({ where: { email } })) {
  throw new ConflictError('User with this email already exists');
}

// In error middleware
if (error instanceof AppError) {
  return res.status(error.statusCode).json(errorResponse(error.message));
}
```

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

## 🚀 Getting Started

See [Local Development Setup](./local-development-setup.md) for detailed setup instructions.

**Quick Start**:
```bash
cd apps/backend
npm install
npm run migrate
npm run seed
npm run dev
```

---

## 📚 Related Documentation

- [Database Schema](../../../DATABASE_SCHEMA.md) - Complete database schema documentation
- [API Reference](./backend-api-reference.md) - Available API endpoints
- [Auth Flow](./backend-auth-flow.md) - Authentication system details
- [Database Setup](./backend-database-setup.md) - Migration and seeder guide
- [Services Guide](./backend-services-guide.md) - Service layer patterns

---

## 🔄 Next Steps

1. **Email Service Integration**: Integrate SendGrid/AWS SES for production email
2. **Feature Development**: Add controllers and services for core features
3. **Redis Caching**: Implement caching for frequently accessed data
4. **Testing**: Write unit and integration tests (target: 80%+ coverage)
5. **API Versioning**: Version APIs for backward compatibility
6. **Background Jobs**: Add BullMQ for async tasks (emails, notifications)
7. **Documentation**: Add API documentation with Swagger/OpenAPI
