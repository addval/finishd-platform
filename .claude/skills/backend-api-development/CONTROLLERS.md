# Controllers - Detailed Guide

## Controller Patterns

### Basic Controller Structure

```typescript
// controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { successResponse } from '../utils/response';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // GET /users
  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, sort = 'id:asc', search } = req.query;

      const result = await this.userService.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        search: String(search)
      });

      return successResponse(res, result, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /users/:id
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };

  // POST /users
  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(req.body);

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  // PUT /users/:id
  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.updateUser(id, req.body);

      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  };

  // DELETE /users/:id
  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
```

### Pagination Controller

```typescript
// controllers/base.controller.ts
import { Request, Response, NextFunction } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export abstract class BaseController<T> {
  abstract service: any;
  abstract modelName: string;

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const options = this.parsePaginationOptions(req.query);
      const result = await this.service.findAll(options);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  protected parsePaginationOptions(query: any): PaginationOptions {
    return {
      page: Number(query.page) || 1,
      limit: Math.min(Number(query.limit) || 10, 100),
      sort: query.sort || 'id:asc',
      search: query.search
    };
  }
}
```

### File Upload Controller

```typescript
// controllers/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { UploadService } from '../services/upload.service';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  uploadSingle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadMiddleware = upload.single('file');

      uploadMiddleware(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }

        const result = await this.uploadService.saveFile(req.file);
        return successResponse(res, result, 'File uploaded successfully', 201);
      });
    } catch (error) {
      next(error);
    }
  };

  uploadMultiple = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const uploadMiddleware = upload.array('files', 5);

      uploadMiddleware(req, res, async (err) => {
        if (err) {
          return next(err);
        }

        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
        }

        const results = await this.uploadService.saveFiles(req.files as Express.Multer.File[]);
        return successResponse(res, results, 'Files uploaded successfully', 201);
      });
    } catch (error) {
      next(error);
    }
  };
}
```

### Authentication Controller

```typescript
// controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { setAuthCookies } from '../utils/cookies';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body;

      const { user, tokens } = await this.authService.register({
        email,
        password,
        name
      });

      setAuthCookies(res, tokens.refreshToken);

      return successResponse(res, {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken
      }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await this.authService.login(email, password);

      setAuthCookies(res, tokens.refreshToken);

      return successResponse(res, {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken
      }, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const tokens = await this.authService.refreshTokens(refreshToken);

      setAuthCookies(res, tokens.refreshToken);

      return successResponse(res, {
        accessToken: tokens.accessToken
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.cookies;

      await this.authService.logout(refreshToken);

      res.clearCookie('refreshToken');

      return successResponse(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };

  private sanitizeUser(user: any) {
    const { password, passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
```

### Batch Operations Controller

```typescript
// controllers/batch.controller.ts
import { Request, Response, NextFunction } from 'express';
import { BatchService } from '../services/batch.service';
import { successResponse } from '../utils/response';

export class BatchController {
  private batchService: BatchService;

  constructor() {
    this.batchService = new BatchService();
  }

  batchCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      if (items.length > 100) {
        return res.status(400).json({ error: 'Maximum 100 items allowed per batch' });
      }

      const results = await this.batchService.batchCreate(items);

      return successResponse(res, {
        successful: results.successful,
        failed: results.failed,
        total: items.length
      }, 'Batch operation completed', 201);
    } catch (error) {
      next(error);
    }
  };

  batchUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: 'Updates array is required' });
      }

      const results = await this.batchService.batchUpdate(updates);

      return successResponse(res, results, 'Batch update completed');
    } catch (error) {
      next(error);
    }
  };

  batchDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'IDs array is required' });
      }

      const result = await this.batchService.batchDelete(ids);

      return successResponse(res, {
        deletedCount: result
      }, 'Batch delete completed');
    } catch (error) {
      next(error);
    }
  };
}
```

## Controller Best Practices

### 1. Keep Controllers Thin

Controllers should only handle HTTP concerns:

```typescript
// BAD - Business logic in controller
getUserById = async (req: Request, res: Response) => {
  const user = await db.query.users.findFirst({ where: eq(users.id, req.params.id) });
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (user.deletedAt) return res.status(404).json({ error: 'User deleted' });
  if (!user.verified) return res.status(403).json({ error: 'Not verified' });
  res.json(user);
};

// GOOD - Delegates to service
getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await this.userService.getUserById(req.params.id);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};
```

### 2. Use Consistent Response Format

```typescript
// Always use the same response structure
return successResponse(res, data, message, statusCode);
```

### 3. Handle Errors Globally

```typescript
try {
  // business logic
  return successResponse(res, result);
} catch (error) {
  next(error); // Pass to global error handler
}
```

### 4. Validate Request Data

Validation should happen in middleware before reaching the controller:

```typescript
router.post('/users',
  validate(createUserSchema), // Validation middleware
  userController.createUser    // Controller
);
```

### 5. Type Requests Properly

```typescript
import { AuthRequest } from '../middlewares/auth';

getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Now req.user is properly typed
  const userId = req.user!.id;
  // ...
};
```
