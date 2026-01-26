---
name: backend-api-development
description: Generate Express.js routes, controllers, and services following MVC + Service Layer architecture with TypeScript, Sequelize ORM, and best practices. Use when creating API endpoints, RESTful controllers, or backend business logic.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Backend API Development

Generates production-ready backend code for Node.js/Express applications with TypeScript and Sequelize.

## Architecture Pattern

This project follows **MVC + Service Layer** architecture:

1. **Routes** - Define endpoints and map to controllers
2. **Controllers** - Handle HTTP requests/responses (thin layer)
3. **Services** - Contain business logic (fat layer)
4. **Models** - Sequelize database models
5. **Middlewares** - Request processing pipeline

## Quick Start

When creating a new API endpoint, I will:

1. Create **Sequelize model** (if not exists)
2. Create **service** with business logic
3. Create **controller** with request/response handling
4. Create **route** and register with Express
5. Add **validation** using Joi or Zod
6. Add **error handling** and status codes
7. Create **TypeScript types** for request/response

## File Structure

```
backend/src/
├── routes/
│   └── {resource}.routes.ts    # Route definitions
├── controllers/
│   └── {resource}.controller.ts # Request handlers
├── services/
│   └── {resource}.service.ts    # Business logic
├── models/
│   └── {resource}.model.ts      # Sequelize model
├── middlewares/
│   └── validateRequest.ts       # Validation middleware
└── types/
    └── {resource}.types.ts      # TypeScript types
```

## Coding Standards

### 1. Service Layer (Business Logic)

Services should:
- Contain all business logic
- Be independent of HTTP concerns
- Handle database operations through models
- Throw custom errors with status codes
- Use transactions for multi-step operations

```typescript
// services/user.service.ts
import { User } from '../models';
import { ValidationError, NotFoundError } from '../utils/errors';

export class UserService {
  async createUser(data: CreateUserInput) {
    // Business logic here
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    const user = await User.create(data);
    return user;
  }

  async getUserById(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}
```

### 2. Controller Layer (Request/Response)

Controllers should:
- Be thin and delegate to services
- Handle HTTP-specific concerns
- Return consistent response format
- Catch and handle service errors
- Use proper HTTP status codes

```typescript
// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { successResponse } from '../utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);
      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(Number(req.params.id));
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };
}
```

### 3. Routes Definition

Routes should:
- Group endpoints by resource
- Apply middleware appropriately
- Use RESTful conventions
- Include validation middleware
- Follow semantic versioning

```typescript
// routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers';
import { validate } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema } from '../types/user.types';

const router = Router();
const userController = new UserController();

router.post(
  '/',
  validate(createUserSchema),
  userController.createUser
);

router.get(
  '/:id',
  userController.getUserById
);

router.put(
  '/:id',
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  userController.deleteUser
);

export default router;
```

### 4. Response Format

Use consistent response structure:

```typescript
// utils/response.ts
export const successResponse = (
  res: Response,
  data: any,
  message: string = 'Success',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error
  });
};
```

### 5. Custom Error Classes

```typescript
// utils/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}
```

### 6. Request Validation

Use Joi or Zod for validation:

```typescript
// types/user.types.ts
import { JoiSchema } from '../middlewares/validateRequest';

export const createUserSchema: JoiSchema = {
  email: Joi.string().email().required().messages({
    'string.email': 'Must be a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
    }),
  name: Joi.string().min(2).max(100).required()
};
```

## RESTful API Conventions

| Method | Endpoint | Purpose | Status Codes |
|--------|----------|---------|--------------|
| GET | `/api/v1/{resource}` | List all items | 200, 400, 401, 500 |
| GET | `/api/v1/{resource}/:id` | Get single item | 200, 404, 400, 401 |
| POST | `/api/v1/{resource}` | Create new item | 201, 400, 401, 500 |
| PUT | `/api/v1/{resource}/:id` | Update entire item | 200, 400, 404, 401 |
| PATCH | `/api/v1/{resource}/:id` | Partial update | 200, 400, 404, 401 |
| DELETE | `/api/v1/{resource}/:id` | Delete item | 204, 404, 401, 500 |

### Query Parameters for Lists

```
GET /api/v1/users?page=1&limit=10&sort=name:asc&search=john

- page: Page number (default: 1)
- limit: Items per page (default: 10, max: 100)
- sort: field:order (default: id:asc)
- search: Search term for filtering
- filter[field]: Exact match filter (e.g., filter[status]=active)
```

## Best Practices

### DO's:
- ✅ Use async/await for asynchronous operations
- ✅ Implement proper error handling with try-catch
- ✅ Add TypeScript types for all function parameters and returns
- ✅ Use environment variables for configuration
- ✅ Add logging for debugging and monitoring
- ✅ Write unit tests for services
- ✅ Write integration tests for endpoints
- ✅ Use HTTP status codes appropriately
- ✅ Implement rate limiting for public endpoints
- ✅ Add request ID for tracing

### DON'Ts:
- ❌ Put business logic in controllers
- ❌ Use `any` type (use `unknown` if needed)
- ❌ Hardcode configuration values
- ❌ Expose sensitive data in responses
- ❌ Use synchronous functions for I/O operations
- ❌ Return inconsistent response formats
- ❌ Skip input validation
- ❌ Forget to handle errors
- ❌ Write deeply nested code (use early returns)
- ❌ Ignore TypeScript errors

## Additional Resources

For detailed implementation examples, see:
- [ROUTES.md](ROUTES.md) - Route patterns and middleware
- [CONTROLLERS.md](CONTROLLERS.md) - Controller patterns and examples
- [SERVICES.md](SERVICES.md) - Service layer patterns

## Utility Scripts

Generate a complete CRUD module:
```bash
node .claude/skills/backend-api-development/scripts/generate-crud.js [resource-name]
```

This will create all necessary files for a new resource with proper structure.
