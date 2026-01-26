# Routes - Detailed Guide

## Route Patterns

### Basic CRUD Routes

```typescript
import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validateRequest';
import { rateLimiter } from '../middlewares/rateLimiter';

const router = Router();
const userController = new UserController();

// Public routes
router.post(
  '/register',
  rateLimiter(5, 60), // 5 requests per minute
  validate(registerSchema),
  userController.register
);

// Protected routes
router.use(authenticate); // Apply auth to all routes below

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Nested routes
router.get('/:id/posts', userController.getUserPosts);

export default router;
```

### Middleware Order

Middleware executes in the order defined:

```typescript
router.post(
  '/create',
  // 1. Rate limiting (security)
  rateLimiter(10, 60),

  // 2. Authentication (security)
  authenticate,

  // 3. Authorization (security)
  authorize('admin'),

  // 4. Validation (data integrity)
  validate(createSchema),

  // 5. Sanitization (security)
  sanitize,

  // 6. Controller (business logic)
  controller.create
);
```

### Route Groups

```typescript
// routes/index.ts
import { Router } from 'express';
import userRoutes from './user.routes';
import postRoutes from './post.routes';
import commentRoutes from './comment.routes';

const router = Router();

// API versioning
router.use('/api/v1/users', userRoutes);
router.use('/api/v1/posts', postRoutes);
router.use('/api/v1/comments', commentRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;
```

### Advanced Patterns

#### Conditional Middleware

```typescript
router.get('/admin-only',
  (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },
  adminController.getDashboard
);
```

#### Multiple Validators

```typescript
router.put('/:id',
  validate(paramsSchema, 'params'),
  validate(bodySchema, 'body'),
  validate(querySchema, 'query'),
  controller.update
);
```

#### Async Route Handlers

```typescript
router.get('/async', async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    res.json(data);
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

## Common Middleware

### Authentication Middleware

```typescript
// middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as AuthRequest['user'];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Authorization Middleware

```typescript
// middlewares/authorize.ts
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Usage
router.delete('/users/:id',
  authenticate,
  authorize('admin', 'super-admin'),
  userController.deleteUser
);
```

### Rate Limiting Middleware

```typescript
// middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const rateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    max: maxRequests,
    windowMs: windowMs * 1000,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Usage
router.post('/login',
  rateLimiter(5, 60), // 5 requests per minute
  authController.login
);
```

### Validation Middleware

```typescript
// middlewares/validateRequest.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export type JoiSchema = Record<string, Joi.Schema>;

export const validate = (schema: JoiSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = Joi.validate(req[property], schema, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req[property] = value;
    next();
  };
};
```

## Error Handling Middleware

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, AppError } from '../utils/errors';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Handle operational errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Database validation error',
      details: error.message
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};
```

## Route Registration

```typescript
// server.ts
import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
