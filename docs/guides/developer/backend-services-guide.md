# Backend Services Guide - Finishd Platform

## Overview

This document provides a comprehensive guide to the service layer in the Finishd Platform backend, including responsibilities, patterns, and best practices.

**Last Updated**: January 28, 2026
**Version**: 2.0.0

---

## What is the Service Layer?

The service layer is where all **business logic** lives. It sits between controllers and the database layer, providing:

- **Business rule enforcement**: Validation, workflows, and orchestration
- **Reusability**: Logic that can be used by multiple controllers
- **Separation of concerns**: Controllers handle HTTP, services handle logic
- **Testability**: Easy to test business logic in isolation

### Architecture Flow

```
Controller (HTTP Layer)
        |
    [Parse Request]
        |
Service Layer (Business Logic)
        |
    [Validate Data]
    [Business Rules]
    [Workflows]
    [Transactions]
        |
Drizzle ORM (Data Access)
        |
    [Database Operations]
```

---

## Service Layer Structure

```
apps/backend/src/services/
├── auth.service.ts       # Authentication business logic
├── email.service.ts      # Email sending service
├── user.service.ts       # User management
└── ...
```

---

## Service Layer Patterns

### Pattern 1: Service Method Structure

All service methods should follow this structure:

```typescript
async methodName(params: Dto): Promise<Response> {
  // 1. Validate input (if not done in middleware)
  this.validateInput(params);

  // 2. Check business rules/preconditions
  await this.checkPreconditions(params);

  // 3. Execute business logic
  const result = await this.executeLogic(params);

  // 4. Post-processing (notifications, cache invalidation, etc.)
  await this.postProcess(result);

  // 5. Return formatted response
  return this.formatResponse(result);
}
```

---

### Pattern 2: Error Handling in Services

**Use custom error classes**:

```typescript
// utils/errors.ts
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
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
```

**Throw errors in services**:

```typescript
async getUserById(userId: string): Promise<User> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
```

---

### Pattern 3: Transactions with Drizzle

Use transactions for multi-step operations:

```typescript
async register(data: RegisterDto): Promise<User> {
  return await db.transaction(async (tx) => {
    // Create user
    const [user] = await tx.insert(users).values({
      phone: data.phone,
      userType: 'homeowner',
    }).returning();

    // Create profile
    await tx.insert(homeownerProfiles).values({
      userId: user.id,
      name: data.name,
    });

    return user;
  });
}
```

---

### Pattern 4: DTOs (Data Transfer Objects)

Use TypeScript interfaces/Zod schemas for input validation:

```typescript
// types/dto.ts
export interface RegisterDto {
  phone: string;
  name?: string;
  city?: string;
}

export interface LoginDto {
  phone: string;
  otp: string;
}

// In service
async register(data: RegisterDto): Promise<AuthResponse> {
  // TypeScript ensures type safety
  const { phone, name } = data;
  // ...
}
```

---

### Pattern 5: Response Formatting

Consistent response objects:

```typescript
// types/response.ts
export interface AuthResponse {
  user: UserResponse;
  tokens: TokenResponse;
}

export interface UserResponse {
  id: string;
  phone: string;
  name: string | null;
  // ... other fields (exclude sensitive data)
}

// Helper function to sanitize user
function sanitizeUser(user: User): UserResponse {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
}
```

---

## How to Add a New Service

### Step 1: Create Service File

```bash
touch apps/backend/src/services/project.service.ts
```

### Step 2: Define Service Class

```typescript
// services/project.service.ts
import { db } from '../db';
import { projects, tasks } from '../db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ProjectService {
  // Create project
  async createProject(homeownerId: string, data: CreateProjectDto) {
    // 1. Validate input
    if (!data.title || data.title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters');
    }

    // 2. Create project
    const [project] = await db.insert(projects).values({
      homeownerId,
      title: data.title,
      scope: data.scope,
      status: 'draft',
    }).returning();

    return project;
  }

  // Get project by ID
  async getProjectById(projectId: string) {
    const result = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        homeowner: true,
        designer: true,
        tasks: true,
      },
    });

    if (!result) {
      throw new NotFoundError('Project not found');
    }

    return result;
  }

  // Update project
  async updateProject(projectId: string, homeownerId: string, data: UpdateProjectDto) {
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existing || existing.homeownerId !== homeownerId) {
      throw new NotFoundError('Project not found or access denied');
    }

    const [updated] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, projectId))
      .returning();

    return updated;
  }

  // Delete project
  async deleteProject(projectId: string, homeownerId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!existing || existing.homeownerId !== homeownerId) {
      throw new NotFoundError('Project not found or access denied');
    }

    await db.delete(projects).where(eq(projects.id, projectId));
  }
}

export const projectService = new ProjectService();
```

### Step 3: Create Controller

```typescript
// controllers/project.controller.ts
import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { successResponse } from '../utils/response';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const homeownerId = req.user?.profileId;
    const result = await projectService.createProject(homeownerId, req.body);
    res.status(201).json(successResponse(result, 'Project created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const result = await projectService.getProjectById(projectId);
    res.status(200).json(successResponse(result, 'Project retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
```

### Step 4: Create Routes

```typescript
// routes/project.routes.ts
import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, projectController.createProject);
router.get('/:projectId', authenticate, projectController.getProject);
router.patch('/:projectId', authenticate, projectController.updateProject);
router.delete('/:projectId', authenticate, projectController.deleteProject);

export default router;
```

---

## Service Layer Best Practices

### DO

1. **Keep services stateless**: Don't store state in service classes
2. **Use dependency injection**: Pass dependencies to constructors
3. **Write reusable methods**: Break down complex logic into smaller methods
4. **Use transactions**: Wrap multi-step operations in transactions
5. **Validate business rules**: Enforce business logic in services
6. **Throw custom errors**: Use domain-specific error classes
7. **Sanitize responses**: Don't return sensitive data
8. **Add logging**: Log important operations and errors
9. **Write tests**: Unit test all business logic

### DON'T

1. **Don't handle HTTP concerns**: No res.status(), no req.headers parsing
2. **Don't access req/res objects**: Services should be HTTP-agnostic
3. **Don't format HTTP responses**: That's the controller's job
4. **Don't duplicate logic**: Extract common logic to helper methods
5. **Don't swallow errors**: Always throw or return errors
6. **Don't hardcode values**: Use constants or environment variables

---

## Testing Services

Services should be unit tested in isolation:

```typescript
// tests/services/project.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { projectService } from '../../services/project.service';

describe('ProjectService', () => {
  describe('createProject', () => {
    it('should create a new project', async () => {
      const data = {
        title: 'Test Project',
        scope: 'full_home',
      };

      const result = await projectService.createProject(homeownerId, data);

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(data.title);
    });

    it('should throw error if title is too short', async () => {
      const data = { title: 'AB', scope: 'full_home' };

      await expect(projectService.createProject(homeownerId, data))
        .rejects
        .toThrow('Title must be at least 3 characters');
    });
  });
});
```

---

## Related Documentation

- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [Database Setup](./backend-database-setup.md) - Database guide
- [API Reference](./backend-api-reference.md) - Available endpoints
