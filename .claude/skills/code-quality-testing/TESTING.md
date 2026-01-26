# Testing Best Practices & Patterns

## Test Organization

### AAA Pattern (Arrange, Act, Assert)

```typescript
describe('UserService', () => {
  it('should create user with hashed password', async () => {
    // Arrange - Set up test data and mocks
    const userData = {
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password');
    vi.mocked(User.create).mockResolvedValue({ id: 1, ...userData });

    // Act - Execute the function being tested
    const result = await userService.createUser(userData);

    // Assert - Verify the expected outcome
    expect(result).toHaveProperty('id', 1);
    expect(bcrypt.hash).toHaveBeenCalledWith('Password123', 10);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed_password' })
    );
  });
});
```

## Testing Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ BAD - Testing implementation
it('should set state to loading', () => {
  render(<UserProfile userId={1} />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});

// ✅ GOOD - Testing behavior
it('should show loading indicator while fetching user', () => {
  render(<UserProfile userId={1} />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### 2. Use Descriptive Test Names

```typescript
// ❌ BAD
it('should work', () => {});

// ✅ GOOD
it('should create user with valid data', () => {});
it('should return 401 when credentials are invalid', () => {});
it('should display error message when API call fails', () => {});
```

### 3. One Assertion Per Test (When Possible)

```typescript
// ❌ BAD - Too many assertions
it('should validate form', () => {
  expect(getByLabelText('Email').required).toBe(true);
  expect(getByLabelText('Password').required).toBe(true);
  expect(getByLabelText('Name').required).toBe(true);
});

// ✅ GOOD - Separate tests
it('should require email field', () => {
  expect(getByLabelText('Email')).toBeRequired();
});

it('should require password field', () => {
  expect(getByLabelText('Password')).toBeRequired();
});
```

### 4. Use Matchers Effectively

```typescript
// Object matching
expect(user).toEqual({ id: 1, name: 'John' });
expect(user).toMatchObject({ name: 'John' }); // Partial match

// String matching
expect(message).toContain('error');
expect(message).toMatch(/error/i);

// Number matching
expect(count).toBeGreaterThan(0);
expect(count).toBeLessThanOrEqual(10);

// Array matching
expect(users).toHaveLength(5);
expect(users).toContain(expect.objectContaining({ id: 1 }));

// Async
await waitFor(() => expect(element).toBeInTheDocument());
await findByText('Success') // Built-in waiting
```

## Common Testing Patterns

### Testing Asynchronous Code

```typescript
// Using async/await
it('should fetch user data', async () => {
  const { result } = renderHook(() => useFetch('/api/users/1'));

  await waitFor(() => {
    expect(result.current.data).toEqual(mockUser);
  });
});

// Using promises
it('should resolve promise', () => {
  return expect(userService.getUserById(1)).resolves.toEqual(mockUser);
});

// Using timers
vi.useFakeTimers();

it('should debounce search', () => {
  const { result } = renderHook(() => useDebounce('test', 500));

  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(result.current).toBe('test');
});

vi.useRealTimers();
```

### Testing User Interactions

```typescript
it('should submit form on button click', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();

  render(<ContactForm onSubmit={handleSubmit} />);

  // Fill form
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.type(screen.getByLabelText('Email'), 'john@example.com');
  await user.type(screen.getByLabelText('Message'), 'Test message');

  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Assert
  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Test message'
    });
  });
});
```

### Testing Error Boundaries

```typescript
it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  const { container } = render(
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(container.textContent).toContain('Something went wrong');
});
```

### Testing Conditional Rendering

```typescript
it('should show login button when not authenticated', () => {
  vi.mocked(useAuth).mockReturnValue({ user: null });

  render(<Header />);

  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.queryByText('Logout')).not.toBeInTheDocument();
});

it('should show logout button when authenticated', () => {
  vi.mocked(useAuth).mockReturnValue({ user: { name: 'John' } });

  render(<Header />);

  expect(screen.getByText('Logout')).toBeInTheDocument();
  expect(screen.queryByText('Login')).not.toBeInTheDocument();
});
```

### Testing API Calls

```typescript
it('should call login API with credentials', async () => {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ token: 'test-token', user: mockUser })
  });

  const { result } = renderHook(() => useAuth());
  await act(async () => {
    await result.current.login('test@example.com', 'password123');
  });

  expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    })
  });
});
```

## Mocking Strategies

### Mocking External Dependencies

```typescript
// Mock entire module
vi.mock('../src/services/email.service', () => ({
  EmailService: {
    sendWelcome: vi.fn().mockResolvedValue(true)
  }
}));

// Mock specific function
vi.spyOn(Date, 'now').mockReturnValue(1609459200000);

// Mock implementation
vi.mocked(fetch).mockImplementation((url) => {
  if (url === '/api/users') {
    return Promise.resolve({
      ok: true,
      json: async () => ({ users: [] })
    } as Response);
  }
  return Promise.reject(new Error('Not found'));
});
```

### Mocking React Context

```typescript
const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn()
};

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

it('should use auth context', () => {
  render(<ProtectedRoute />);
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
});
```

### Mocking Custom Hooks

```typescript
vi.mock('../src/hooks/useFetch', () => ({
  useFetch: vi.fn()
}));

vi.mocked(useFetch).mockReturnValue({
  data: mockData,
  loading: false,
  error: null,
  refetch: vi.fn()
});
```

## Coverage Goals

Aim for:
- **80%+ overall coverage**
- **90%+ for critical business logic**
- **70%+ for UI components**

```bash
# Generate coverage report
npm test:coverage

# View coverage in browser
open coverage/index.html
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Testing Checklist

Before committing code:
- [ ] All new features have unit tests
- [ ] Critical paths have integration tests
- [ ] Edge cases are covered
- [ ] Error handling is tested
- [ ] All tests pass
- [ ] Coverage meets threshold (80%+)
- [ ] No console errors in tests
- [ ] Tests run quickly (< 5 seconds)
- [ ] Tests are deterministic (no flaky tests)

## Common Pitfalls

### 1. Testing Implementation Details

```typescript
// ❌ Don't test internal methods
it('should call validateEmail', () => {
  const spy = vi.spyOn(utils, 'validateEmail');
  // ...
  expect(spy).toHaveBeenCalled(); // Fragile
});

// ✅ Test the outcome
it('should reject invalid email', () => {
  // Test that form shows error for invalid email
});
```

### 2. Not Cleaning Up

```typescript
// ❌ Forgetting cleanup
afterEach(() => {
  // Missing cleanup
});

// ✅ Always cleanup
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 3. Race Conditions

```typescript
// ❌ Not waiting for async
it('should show data', () => {
  render(<UserProfile />);
  expect(screen.getByText('John')).toBeInTheDocument(); // Fails
});

// ✅ Wait for async
it('should show data', async () => {
  render(<UserProfile />);
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

## Performance Tips

1. **Run tests in parallel** - Vitest does this by default
2. **Use `vi.clearAllMocks()`** instead of recreating mocks
3. **Mock heavy dependencies** - databases, external APIs
4. **Use `vi.mock()`** for modules, not individual functions
5. **Avoid unnecessary waits** - use `waitFor` sparingly
