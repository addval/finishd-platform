# Services - Detailed Guide

## Service Layer Patterns

### Basic Service Structure

```typescript
// services/user.service.ts
import { User } from '../models';
import { ValidationError, NotFoundError } from '../utils/errors';
import { CreateUserInput, UpdateUserInput, UserFilters } from '../types/user.types';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export class UserService {
  /**
   * Create a new user with validation and password hashing
   */
  async createUser(data: CreateUserInput) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: data.email },
          { username: data.username }
        ]
      }
    });

    if (existingUser) {
      throw new ValidationError('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword
    });

    // Remove password from response
    const userJSON = user.toJSON();
    delete userJSON.password;

    return userJSON;
  }

  /**
   * Get user by ID with error handling
   */
  async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
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
    const { page = 1, limit = 10, sort = 'id:asc', search } = filters;

    const offset = (page - 1) * limit;
    const [sortField, sortOrder] = sort.split(':');

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortField, sortOrder.toUpperCase()]],
      attributes: { exclude: ['password'] }
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Update user with partial data support
   */
  async updateUser(id: number, data: UpdateUserInput) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new ValidationError('Email already in use');
      }
    }

    // Update password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    await user.update(data);

    const userJSON = user.toJSON();
    delete userJSON.password;

    return userJSON;
  }

  /**
   * Soft delete user
   */
  async deleteUser(id: number) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    await user.update({ deletedAt: new Date() });

    return { message: 'User deleted successfully' };
  }
}
```

### Transaction Handling

```typescript
// services/transaction.service.ts
import { sequelize } from '../config/database';
import { User, Account, Transaction } from '../models';
import { InsufficientFundsError } from '../utils/errors';

export class TransactionService {
  /**
   * Transfer funds between accounts with transaction
   */
  async transferFunds(fromAccountId: number, toAccountId: number, amount: number) {
    const t = await sequelize.transaction();

    try {
      // Lock rows for update
      const fromAccount = await Account.findByPk(fromAccountId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const toAccount = await Account.findByPk(toAccountId, {
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!fromAccount || !toAccount) {
        throw new NotFoundError('One or both accounts not found');
      }

      if (fromAccount.balance < amount) {
        throw new InsufficientFundsError('Insufficient funds');
      }

      // Perform transfer
      await fromAccount.update({
        balance: fromAccount.balance - amount
      }, { transaction: t });

      await toAccount.update({
        balance: toAccount.balance + amount
      }, { transaction: t });

      // Create transaction record
      await Transaction.create({
        fromAccountId,
        toAccountId,
        amount,
        type: 'TRANSFER',
        status: 'COMPLETED'
      }, { transaction: t });

      // Commit transaction
      await t.commit();

      return {
        fromAccount: fromAccount.balance,
        toAccount: toAccount.balance,
        transactionId: transaction.id
      };
    } catch (error) {
      // Rollback on error
      await t.rollback();
      throw error;
    }
  }
}
```

### Service with Caching

```typescript
// services/cached.service.ts
import { User } from '../models';
import { cache } from '../utils/cache';

export class CachedUserService {
  private cachePrefix = 'user:';
  private cacheTTL = 3600; // 1 hour

  async getUserById(id: number) {
    // Check cache first
    const cacheKey = `${this.cachePrefix}${id}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    // Set cache
    await cache.set(cacheKey, JSON.stringify(user), 'EX', this.cacheTTL);

    return user;
  }

  async updateUser(id: number, data: any) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    await user.update(data);

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
import { User } from '../models';
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

  async createUser(data: any) {
    const user = await User.create(data);

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
import { Payment } from '../models';
import { PaymentError } from '../utils/errors';

export class PaymentService {
  private stripeApiKey: string;
  private stripeBaseUrl = 'https://api.stripe.com/v1';

  constructor() {
    this.stripeApiKey = process.env.STRIPE_SECRET_KEY!;
  }

  async createPayment(userId: number, amount: number, currency: string = 'usd') {
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
      const payment = await Payment.create({
        userId,
        amount,
        currency,
        status: response.data.status,
        transactionId: response.data.id,
        metadata: response.data
      });

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

  async refundPayment(paymentId: number) {
    const payment = await Payment.findByPk(paymentId);

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

      await payment.update({ status: 'refunded' });

      return payment;
    } catch (error) {
      throw new PaymentError('Refund failed');
    }
  }
}
```

### Service with Validation

```typescript
// services/validated.service.ts
import { User } from '../models';
import { ValidationError } from '../utils/errors';
import { validateEmail, validatePassword } from '../utils/validators';

export class ValidatedUserService {
  async createUser(data: any) {
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
    const age = this.calculateAge(data.dateOfBirth);
    if (age < 18) {
      throw new ValidationError('Must be at least 18 years old');
    }

    // Business rule validation
    const userCount = await User.count({ where: { organizationId: data.organizationId } });
    const maxUsers = await this.getMaxUsersForOrganization(data.organizationId);

    if (userCount >= maxUsers) {
      throw new ValidationError('Organization has reached maximum user limit');
    }

    return await User.create(data);
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

  private async getMaxUsersForOrganization(organizationId: number): Promise<number> {
    // Fetch organization plan limits
    // This is a placeholder
    return 10;
  }
}
```

### Service Composition Pattern

```typescript
// services/order.service.ts
import { Order, OrderItem, Product, User } from '../models';
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

  async createOrder(userId: number, items: Array<{ productId: number; quantity: number }>) {
    // Use composed services
    const user = await this.userService.getUserById(userId);

    // Validate products and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await this.productService.getProductById(item.productId);
      const price = product.price;

      // Check inventory
      await this.inventoryService.checkAvailability(item.productId, item.quantity);

      total += price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price
      });
    }

    // Create order with transaction
    const t = await sequelize.transaction();

    try {
      const order = await Order.create({
        userId,
        total,
        status: 'pending'
      }, { transaction: t });

      // Create order items
      await OrderItem.bulkCreate(
        orderItems.map(item => ({ ...item, orderId: order.id })),
        { transaction: t }
      );

      // Deduct from inventory
      for (const item of items) {
        await this.inventoryService.deductStock(item.productId, item.quantity, t);
      }

      await t.commit();

      // Send notification (non-critical, don't block)
      this.notificationService.sendOrderConfirmation(user.email, order.id)
        .catch(console.error);

      return order;
    } catch (error) {
      await t.rollback();
      throw error;
    }
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
