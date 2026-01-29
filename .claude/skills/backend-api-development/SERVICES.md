# Services - Detailed Guide

## Service Layer Patterns

### Basic Service Structure

```typescript
// services/user.service.ts
import { db } from '../db';
import { users, type User, type NewUser } from '../db/schema';
import { eq, and, or, ilike, sql, desc, asc } from 'drizzle-orm';
import { ValidationError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcrypt';

export interface UserFilters {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export class UserService {
  /**
   * Create a new user with validation and password hashing
   */
  async createUser(data: NewUser & { password: string }) {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: or(
        eq(users.email, data.email),
        data.username ? eq(users.username, data.username) : undefined
      ),
    });

    if (existingUser) {
      throw new ValidationError('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        ...data,
        passwordHash: hashedPassword,
      })
      .returning();

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user by ID with error handling
   */
  async getUserById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false, // Exclude password
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(filters: UserFilters) {
    const { page = 1, limit = 10, sort = 'createdAt:desc', search } = filters;

    const offset = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split(':');

    // Build where clause for search
    const whereClause = search
      ? or(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      : undefined;

    // Get paginated data and count in parallel
    const [data, countResult] = await Promise.all([
      db.query.users.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: sortOrder === 'desc'
          ? [desc(users[sortField as keyof typeof users])]
          : [asc(users[sortField as keyof typeof users])],
        columns: {
          passwordHash: false,
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(whereClause),
    ]);

    const total = countResult[0].count;

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Update user with partial data support
   */
  async updateUser(id: string, data: Partial<NewUser>) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

      if (userWithEmail) {
        throw new ValidationError('Email already in use');
      }
    }

    // Update user
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    const { passwordHash, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    await db
      .update(users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(users.id, id));

    return { message: 'User deleted successfully' };
  }
}
```

### Transaction Handling

```typescript
// services/transaction.service.ts
import { db } from '../db';
import { accounts, transactions } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { NotFoundError, InsufficientFundsError } from '../utils/errors';

export class TransactionService {
  /**
   * Transfer funds between accounts with transaction
   */
  async transferFunds(fromAccountId: string, toAccountId: string, amount: number) {
    return await db.transaction(async (tx) => {
      // Get accounts
      const fromAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, fromAccountId),
      });

      const toAccount = await tx.query.accounts.findFirst({
        where: eq(accounts.id, toAccountId),
      });

      if (!fromAccount || !toAccount) {
        throw new NotFoundError('One or both accounts not found');
      }

      if (fromAccount.balance < amount) {
        throw new InsufficientFundsError('Insufficient funds');
      }

      // Perform transfer
      await tx
        .update(accounts)
        .set({ balance: sql`${accounts.balance} - ${amount}` })
        .where(eq(accounts.id, fromAccountId));

      await tx
        .update(accounts)
        .set({ balance: sql`${accounts.balance} + ${amount}` })
        .where(eq(accounts.id, toAccountId));

      // Create transaction record
      const [record] = await tx
        .insert(transactions)
        .values({
          fromAccountId,
          toAccountId,
          amount,
          type: 'TRANSFER',
          status: 'COMPLETED',
        })
        .returning();

      return {
        fromBalance: fromAccount.balance - amount,
        toBalance: toAccount.balance + amount,
        transactionId: record.id,
      };
    });
  }
}
```

### Service with Caching

```typescript
// services/cached.service.ts
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { cache } from '../utils/cache';
import { NotFoundError } from '../utils/errors';

export class CachedUserService {
  private cachePrefix = 'user:';
  private cacheTTL = 3600; // 1 hour

  async getUserById(id: string) {
    // Check cache first
    const cacheKey = `${this.cachePrefix}${id}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        passwordHash: false,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Set cache
    await cache.set(cacheKey, JSON.stringify(user), 'EX', this.cacheTTL);

    return user;
  }

  async updateUser(id: string, data: any) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Invalidate cache
    const cacheKey = `${this.cachePrefix}${id}`;
    await cache.del(cacheKey);

    return user;
  }
}
```

### Service with Event Emission

```typescript
// services/event.service.ts
import { EventEmitter } from 'events';
import { db } from '../db';
import { users, type NewUser } from '../db/schema';
import { EmailService } from './email.service';

export class UserServiceWithEvents extends EventEmitter {
  private emailService: EmailService;

  constructor() {
    super();
    this.emailService = new EmailService();

    // Register event handlers
    this.on('user:created', this.handleUserCreated);
    this.on('user:deleted', this.handleUserDeleted);
  }

  async createUser(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();

    // Emit event
    this.emit('user:created', user);

    return user;
  }

  private handleUserCreated = async (user: any) => {
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  private handleUserDeleted = async (user: any) => {
    try {
      await this.emailService.sendGoodbyeEmail(user.email, user.name);
    } catch (error) {
      console.error('Failed to send goodbye email:', error);
    }
  };
}
```

### Service with External API Integration

```typescript
// services/payment.service.ts
import axios from 'axios';
import { db } from '../db';
import { payments } from '../db/schema';
import { eq } from 'drizzle-orm';
import { PaymentError, NotFoundError } from '../utils/errors';

export class PaymentService {
  private stripeApiKey: string;
  private stripeBaseUrl = 'https://api.stripe.com/v1';

  constructor() {
    this.stripeApiKey = process.env.STRIPE_SECRET_KEY!;
  }

  async createPayment(userId: string, amount: number, currency: string = 'usd') {
    try {
      // Call external API
      const response = await axios.post(
        `${this.stripeBaseUrl}/charges`,
        {
          amount: amount * 100, // Convert to cents
          currency,
          source: 'tok_visa' // In production, get from request
        },
        {
          headers: {
            Authorization: `Bearer ${this.stripeApiKey}`
          }
        }
      );

      // Save to database
      const [payment] = await db
        .insert(payments)
        .values({
          userId,
          amount,
          currency,
          status: response.data.status,
          transactionId: response.data.id,
          metadata: response.data,
        })
        .returning();

      return payment;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new PaymentError(
          error.response?.data?.error?.message || 'Payment failed'
        );
      }
      throw error;
    }
  }

  async refundPayment(paymentId: string) {
    const payment = await db.query.payments.findFirst({
      where: eq(payments.id, paymentId),
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new PaymentError('Can only refund successful payments');
    }

    try {
      await axios.post(
        `${this.stripeBaseUrl}/refunds`,
        {
          charge: payment.transactionId
        },
        {
          headers: {
            Authorization: `Bearer ${this.stripeApiKey}`
          }
        }
      );

      const [updated] = await db
        .update(payments)
        .set({ status: 'refunded' })
        .where(eq(payments.id, paymentId))
        .returning();

      return updated;
    } catch (error) {
      throw new PaymentError('Refund failed');
    }
  }
}
```

### Service with Validation

```typescript
// services/validated.service.ts
import { db } from '../db';
import { users, type NewUser } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { ValidationError } from '../utils/errors';
import { validateEmail, validatePassword } from '../utils/validators';

export class ValidatedUserService {
  async createUser(data: NewUser & { password: string; dateOfBirth?: Date; organizationId?: string }) {
    // Validate email
    if (!validateEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.errors.join(', '));
    }

    // Validate age
    if (data.dateOfBirth) {
      const age = this.calculateAge(data.dateOfBirth);
      if (age < 18) {
        throw new ValidationError('Must be at least 18 years old');
      }
    }

    // Business rule validation
    if (data.organizationId) {
      const userCountResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.organizationId, data.organizationId));

      const userCount = userCountResult[0].count;
      const maxUsers = await this.getMaxUsersForOrganization(data.organizationId);

      if (userCount >= maxUsers) {
        throw new ValidationError('Organization has reached maximum user limit');
      }
    }

    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private async getMaxUsersForOrganization(organizationId: string): Promise<number> {
    // Fetch organization plan limits
    // This is a placeholder
    return 10;
  }
}
```

### Service Composition Pattern

```typescript
// services/order.service.ts
import { db } from '../db';
import { orders, orderItems } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { ProductService } from './product.service';
import { UserService } from './user.service';
import { InventoryService } from './inventory.service';
import { NotificationService } from './notification.service';

export class OrderService {
  private productService: ProductService;
  private userService: UserService;
  private inventoryService: InventoryService;
  private notificationService: NotificationService;

  constructor() {
    this.productService = new ProductService();
    this.userService = new UserService();
    this.inventoryService = new InventoryService();
    this.notificationService = new NotificationService();
  }

  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>) {
    // Use composed services
    const user = await this.userService.getUserById(userId);

    // Validate products and calculate total
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await this.productService.getProductById(item.productId);
      const price = product.price;

      // Check inventory
      await this.inventoryService.checkAvailability(item.productId, item.quantity);

      total += price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
      });
    }

    // Create order with transaction
    return await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          total,
          status: 'pending',
        })
        .returning();

      // Create order items
      await tx.insert(orderItems).values(
        orderItemsData.map((item) => ({ ...item, orderId: order.id }))
      );

      // Deduct from inventory
      for (const item of items) {
        await this.inventoryService.deductStock(item.productId, item.quantity, tx);
      }

      // Send notification (non-critical, don't block)
      this.notificationService
        .sendOrderConfirmation(user.email, order.id)
        .catch(console.error);

      return order;
    });
  }
}
```

## Service Best Practices

### 1. Single Responsibility
Each service should handle one domain or business capability.

### 2. Dependency Injection
Pass dependencies through constructor for testability.

### 3. Error Handling
Throw specific error types that controllers can handle appropriately.

### 4. No HTTP Concerns
Services should not know about HTTP, requests, or responses.

### 5. Use Transactions
For multi-step operations that modify database, always use transactions.

### 6. Validation
Implement business logic validation in services, not just data validation.

### 7. Logging
Add appropriate logging for debugging and monitoring.

### 8. Testing
Services should be easy to unit test with mocked dependencies.
