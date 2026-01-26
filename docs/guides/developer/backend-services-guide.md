# Backend Services Guide - Rituality Platform

## 📋 Overview

This document provides a comprehensive guide to the service layer in the Rituality Platform backend, including responsibilities, patterns, and best practices.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🎯 What is the Service Layer?

The service layer is where all **business logic** lives. It sits between controllers and models, providing:

- **Business rule enforcement**: Validation, workflows, and orchestration
- **Reusability**: Logic that can be used by multiple controllers
- **Separation of concerns**: Controllers handle HTTP, services handle logic
- **Testability**: Easy to test business logic in isolation

### Architecture Flow

```
Controller (HTTP Layer)
        ↓
    [Parse Request]
        ↓
Service Layer (Business Logic)
        ↓
    [Validate Data]
    [Business Rules]
    [Workflows]
    [Transactions]
        ↓
Model Layer (Data Access)
        ↓
    [Database Operations]
```

---

## 📁 Service Layer Structure

```
apps/backend/src/services/
├── auth.service.ts       # Authentication business logic
├── email.service.ts      # Email sending service
├── user.service.ts       # User management (planned)
├── ritual.service.ts     # Ritual business logic (planned)
└── ...
```

---

## 🔧 Core Services

### 1. Auth Service (`auth.service.ts`)

**Purpose**: Handle all authentication-related business logic.

**Responsibilities**:
- User registration with validation
- Email verification
- Login and authentication
- Password reset
- Token generation and refresh
- Device management
- Logout (single and all devices)

**Key Methods**:

```typescript
class AuthService {
  // Register new user
  async register(data: RegisterDto): Promise<AuthResponse>

  // Verify email
  async verifyEmail(email: string, code: string): Promise<void>

  // Login user
  async login(email: string, password: string, deviceInfo?: DeviceInfo): Promise<AuthResponse>

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenResponse>

  // Logout from current device
  async logout(userId: string, deviceId: string): Promise<void>

  // Logout from all devices
  async logoutAll(userId: string): Promise<void>

  // Request password reset
  async forgotPassword(email: string): Promise<void>

  // Reset password with code
  async resetPassword(email: string, code: string, newPassword: string): Promise<void>

  // Change password (authenticated)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>

  // Get current user
  async getCurrentUser(userId: string): Promise<UserResponse>

  // Update user profile
  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserResponse>

  // Get user devices
  async getUserDevices(userId: string): Promise<Device[]>

  // Revoke device
  async revokeDevice(userId: string, deviceId: string): Promise<void>
}
```

**Example Usage**:

```typescript
// In controller
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

### 2. Email Service (`email.service.ts`)

**Purpose**: Handle all email sending operations.

**Current Status**: Stub implementation (logs to console)

**Responsibilities**:
- Send verification emails
- Send welcome emails
- Send password reset emails
- Send confirmation emails
- Handle email templates
- Queue emails (future: with BullMQ)

**Key Methods**:

```typescript
class EmailService {
  // Send verification email
  async sendVerificationEmail(email: string, name: string, code: string): Promise<void>

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<void>

  // Send password reset email
  async sendPasswordResetEmail(email: string, name: string, code: string): Promise<void>

  // Send confirmation email
  async sendConfirmationEmail(email: string, name: string, code: string): Promise<void>
}
```

**Current Implementation**:

```typescript
async sendVerificationEmail(email: string, name: string, code: string): Promise<void> {
  // TODO: Integrate with email provider (SendGrid, AWS SES)
  console.log('=== EMAIL SERVICE (STUB) ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Verify your email`);
  console.log(`Body: Your verification code is: ${code}`);
}
```

**Required Integration**:
- SendGrid
- AWS SES
- Mailgun
- Postmark

---

## 🎨 Service Layer Patterns

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

**Example**:

```typescript
async register(data: RegisterDto): Promise<AuthResponse> {
  // 1. Validate email format and password strength
  if (!this.isEmailValid(data.email)) {
    throw new ValidationError('Invalid email format');
  }

  if (!this.isPasswordStrong(data.password)) {
    throw new ValidationError('Password is too weak');
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ where: { email: data.email } });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // 3. Execute registration logic
  const hashedPassword = await hashPassword(data.password);
  const user = await this.createUserWithTransaction(data, hashedPassword);

  // 4. Send verification email
  await emailService.sendVerificationEmail(user.email, user.name, user.verificationCode);

  // 5. Generate tokens
  const tokens = await this.generateTokens(user);

  // 6. Create device record
  const device = await this.createDevice(user.id, tokens, data.deviceInfo);

  // 7. Return formatted response
  return { user: this.sanitizeUser(user), tokens, device };
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
async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.password_reset_code) {
    throw new ValidationError('No password reset requested');
  }

  const isValidCode = await bcrypt.compare(code, user.password_reset_code);

  if (!isValidCode) {
    throw new ValidationError('Invalid reset code');
  }

  if (new Date() > user.password_reset_code_expires_at) {
    throw new ValidationError('Reset code has expired');
  }

  // Continue with password reset...
}
```

**Handle errors in controllers**:

```typescript
// Controllers should NOT catch errors
// Let global error middleware handle them
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, new_password } = req.body;
    await authService.resetPassword(email, code, new_password);
    res.status(200).json(successResponse(null, 'Password reset successfully'));
  } catch (error) {
    next(error); // Pass to error middleware
  }
};
```

---

### Pattern 3: Transactions

Use transactions for multi-step operations:

```typescript
async register(data: RegisterDto): Promise<User> {
  const transaction = await sequelize.transaction();

  try {
    // Create user
    const user = await User.create({
      email: data.email,
      password_hash: hashedPassword,
      role_id: userRoleId
    }, { transaction });

    // Create permissions
    await UserPermission.create({
      user_id: user.id,
      notifications_enabled: false
    }, { transaction });

    // Commit transaction
    await transaction.commit();

    return user;

  } catch (error) {
    // Rollback on error
    await transaction.rollback();
    throw error;
  }
}
```

---

### Pattern 4: DTOs (Data Transfer Objects)

Use TypeScript interfaces/zod schemas for input validation:

```typescript
// types/dto.ts
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
  username?: string;
  city?: string;
  phone_number?: string;
  country_code?: string;
  timezone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  device_name?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
}

// In service
async register(data: RegisterDto): Promise<AuthResponse> {
  // TypeScript will ensure type safety
  const { email, password, name } = data;
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
  device: DeviceResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  email_verified: boolean;
  // ... other fields (exclude sensitive data)
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Helper function to sanitize user
function sanitizeUser(user: User): UserResponse {
  const { password_hash, verification_codes, ...sanitized } = user.toJSON();
  return sanitized as UserResponse;
}
```

---

## 📝 How to Add a New Service

### Step 1: Create Service File

```bash
touch apps/backend/src/services/ritual.service.ts
```

### Step 2: Define Service Class

```typescript
// services/ritual.service.ts
import { Ritual } from '../models/Ritual.model';
import { AppError } from '../utils/errors';

export class RitualService {
  // Create ritual
  async createRitual(userId: string, data: CreateRitualDto): Promise<RitualResponse> {
    // 1. Validate input
    this.validateRitualData(data);

    // 2. Check business rules
    await this.validateUserCanCreateRitual(userId);

    // 3. Create ritual
    const ritual = await Ritual.create({
      user_id: userId,
      title: data.title,
      description: data.description,
      frequency: data.frequency
    });

    // 4. Post-processing
    await this.notifyFollowers(userId, ritual);

    // 5. Return response
    return this.formatRitualResponse(ritual);
  }

  // Get ritual by ID
  async getRitualById(ritualId: string): Promise<RitualResponse> {
    const ritual = await Ritual.findByPk(ritualId);

    if (!ritual) {
      throw new NotFoundError('Ritual not found');
    }

    return this.formatRitualResponse(ritual);
  }

  // Update ritual
  async updateRitual(ritualId: string, userId: string, data: UpdateRitualDto): Promise<RitualResponse> {
    const ritual = await Ritual.findOne({
      where: { id: ritualId, user_id: userId }
    });

    if (!ritual) {
      throw new NotFoundError('Ritual not found or access denied');
    }

    await ritual.update(data);
    return this.formatRitualResponse(ritual);
  }

  // Delete ritual
  async deleteRitual(ritualId: string, userId: string): Promise<void> {
    const ritual = await Ritual.findOne({
      where: { id: ritualId, user_id: userId }
    });

    if (!ritual) {
      throw new NotFoundError('Ritual not found or access denied');
    }

    await ritual.destroy(); // Soft delete
  }

  // Helper methods
  private validateRitualData(data: CreateRitualDto): void {
    if (!data.title || data.title.length < 3) {
      throw new ValidationError('Title must be at least 3 characters');
    }
  }

  private async validateUserCanCreateRitual(userId: string): Promise<void> {
    // Check user subscription, limits, etc.
  }

  private formatRitualResponse(ritual: Ritual): RitualResponse {
    return {
      id: ritual.id,
      title: ritual.title,
      description: ritual.description,
      frequency: ritual.frequency,
      created_at: ritual.created_at
    };
  }
}

export const ritualService = new RitualService();
```

### Step 3: Create Controller

```typescript
// controllers/ritual.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ritualService } from '../services/ritual.service';
import { successResponse } from '../utils/response';

export const createRitual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const result = await ritualService.createRitual(userId, req.body);
    res.status(201).json(successResponse(result, 'Ritual created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getRitual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ritualId } = req.params;
    const result = await ritualService.getRitualById(ritualId);
    res.status(200).json(successResponse(result, 'Ritual retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
```

### Step 4: Create Routes

```typescript
// routes/ritual.routes.ts
import { Router } from 'express';
import { ritualController } from '../controllers/ritual.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, ritualController.createRitual);
router.get('/:ritualId', authenticate, ritualController.getRitual);
router.patch('/:ritualId', authenticate, ritualController.updateRitual);
router.delete('/:ritualId', authenticate, ritualController.deleteRitual);

export default router;
```

---

## 🎯 Service Layer Best Practices

### ✅ DO

1. **Keep services stateless**: Don't store state in service classes
2. **Use dependency injection**: Pass dependencies (models, other services) to constructors
3. **Write reusable methods**: Break down complex logic into smaller private methods
4. **Use transactions**: Wrap multi-step operations in transactions
5. **Validate business rules**: Enforce business logic in services, not controllers
6. **Throw custom errors**: Use domain-specific error classes
7. **Sanitize responses**: Don't return sensitive data (passwords, tokens)
8. **Add logging**: Log important operations and errors
9. **Write tests**: Unit test all business logic
10. **Document methods**: Add JSDoc comments for complex methods

### ❌ DON'T

1. **Don't handle HTTP concerns**: No res.status(), no req.headers parsing
2. **Don't access req/res objects**: Services should be HTTP-agnostic
3. **Don't format HTTP responses**: That's the controller's job
4. **Don't duplicate logic**: Extract common logic to helper methods
5. **Don't mix concerns**: Services should only contain business logic
6. **Don't swallow errors**: Always throw or return errors
7. **Don't hardcode values**: Use constants or environment variables
8. **Don't make services too large**: Split into multiple services if needed

---

## 🧪 Testing Services

Services should be unit tested in isolation:

```typescript
// tests/services/auth.service.test.ts
import { authService } from '../../services/auth.service';
import { User } from '../../models/User.model';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const data = {
        email: 'test@example.com',
        password: 'TestPass123',
        name: 'Test User'
      };

      const result = await authService.register(data);

      expect(result.user).toHaveProperty('id');
      expect(result.user.email).toBe(data.email);
      expect(result.tokens).toHaveProperty('access_token');
    });

    it('should throw error if user already exists', async () => {
      const data = {
        email: 'existing@example.com',
        password: 'TestPass123'
      };

      // Create existing user
      await User.create({ ... });

      await expect(authService.register(data))
        .rejects
        .toThrow('User with this email already exists');
    });
  });
});
```

---

## 📚 Related Documentation

- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [API Reference](./backend-api-reference.md) - Available endpoints
- [Auth Flow](./backend-auth-flow.md) - Authentication details
- [Database Setup](./backend-database-setup.md) - Database guide

---

## 🔗 Resources

- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Sequelize Transactions](https://sequelize.org/docs/v6/other-topics/transactions/)
