---
name: code-quality-testing
description: Generate Vitest tests for React components and backend services, Biome configurations, and TypeScript strict mode enforcement. Use when writing tests, linting code, or ensuring code quality standards.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Code Quality & Testing

Comprehensive guide for testing with Vitest, code quality tools, and maintaining high standards for Node.js and React projects.

## Testing Stack

This project uses:
- **Vitest** - Fast unit testing framework (Jest-compatible)
- **React Testing Library** - Test React components
- **@testing-library/react** - For React component testing
- **@testing-library/user-event** - Simulate user interactions
- **Biome** - Linting and formatting for JavaScript/TypeScript

## Configuration Files

### Vitest Configuration

```typescript
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.test.tsx',
        '**/*.spec.tsx'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Vitest Setup Files

```typescript
// backend/tests/setup.ts
import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Global test utilities
global.console = {
  ...console,
  // Silence console.log during tests
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
```

```typescript
// frontend/src/tests/setup.ts
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## Backend Testing with Vitest

### Unit Testing Services

```typescript
// tests/unit/user.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../src/services/user.service';
import { User } from '../src/models';
import bcrypt from 'bcrypt';
import { ValidationError, NotFoundError } from '../src/utils/errors';

// Mock the User model
vi.mock('../src/models', () => ({
  User: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    findAndCountAll: vi.fn()
  }
}));

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      vi.mocked(User.findOne).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password');
      vi.mocked(User.create).mockResolvedValue({
        id: 1,
        ...userData,
        toJSON: () => ({ id: 1, ...userData })
      });

      const result = await userService.createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: 'hashed_password'
      });
      expect(result).toHaveProperty('id', 1);
    });

    it('should throw ValidationError if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      vi.mocked(User.findOne).mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });

      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
      await expect(userService.createUser(userData)).rejects.toThrow(
        'User with this email or username already exists'
      );
    });

    it('should handle database errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      vi.mocked(User.findOne).mockRejectedValue(new Error('Database error'));

      await expect(userService.createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    it('should return user without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      vi.mocked(User.findByPk).mockResolvedValue({
        ...mockUser,
        toJSON: () => mockUser
      });

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ['password'] }
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      vi.mocked(User.findByPk).mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow(NotFoundError);
      await expect(userService.getUserById(999)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com' },
        { id: 2, email: 'user2@example.com' }
      ];

      vi.mocked(User.findAndCountAll).mockResolvedValue({
        count: 2,
        rows: mockUsers
      });

      const result = await userService.getAllUsers({
        page: 1,
        limit: 10,
        sort: 'id:asc'
      });

      expect(result).toEqual({
        data: mockUsers,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      });
    });

    it('should handle search queries', async () => {
      vi.mocked(User.findAndCountAll).mockResolvedValue({
        count: 1,
        rows: [{ id: 1, email: 'john@example.com' }]
      });

      await userService.getAllUsers({
        page: 1,
        limit: 10,
        sort: 'id:asc',
        search: 'john'
      });

      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [expect.any(String)]: expect.any(Object)
          })
        })
      );
    });
  });
});
```

### Integration Testing API Endpoints

```typescript
// tests/integration/auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';
import { sequelize } from '../src/config/database';

describe('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await sequelize.truncate({ cascade: true });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe'
          }
        },
        message: 'Registration successful'
      });
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if email already exists', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        });

      // Try to create again
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'Jane',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: 'test@example.com'
          },
          accessToken: expect.any(String)
        }
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## Frontend Testing with Vitest

### Testing React Components

```typescript
// src/components/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading is true', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });
});
```

```typescript
// src/components/__tests__/LoginForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import * as authHooks from '@/hooks/useAuth';

// Mock the auth hook
vi.mock('@/hooks/useAuth');

describe('LoginForm Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authHooks, 'useAuth').mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      loading: false
    });
  });

  it('should render login form', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should call login with form data', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should handle login errors', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', () => {
    vi.spyOn(authHooks, 'useAuth').mockReturnValue({
      user: null,
      login: mockLogin,
      logout: vi.fn(),
      loading: true
    });

    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });
});
```

### Testing Custom Hooks

```typescript
// src/hooks/__tests__/useFetch.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../useFetch';

global.fetch = vi.fn();

describe('useFetch Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test User' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as Response);

    const { result } = renderHook(() => useFetch<{ id: number; name: string }>('/api/users/1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/api/users/1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should handle HTTP errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response);

    const { result } = renderHook(() => useFetch('/api/users/999'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('HTTP error! status: 404');
  });

  it('should refetch data', async () => {
    const mockData1 = { id: 1, name: 'User 1' };
    const mockData2 = { id: 2, name: 'User 2' };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2
      } as Response);

    const { result } = renderHook(() => useFetch('/api/users/current'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- user.service.test.ts

# Run tests matching pattern
npm test -- --grep "UserService"

# Run tests for frontend only
npm run test:frontend

# Run tests for backend only
npm run test:backend
```

## Code Quality Tools

### Biome Configuration

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedImports": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "arrowParentheses": "always"
    }
  }
}
```

See [TESTING.md](TESTING.md) for detailed testing patterns and best practices.
