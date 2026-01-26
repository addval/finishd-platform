# Frontend Testing Guide - Rituality Platform

## 📋 Overview

This document covers testing practices for the frontend using Vitest and React Testing Library.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🧪 Test Setup

Already configured in `apps/frontend/vitest.config.ts`.

---

## 📝 Writing Tests

### Component Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../ui/button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Hook Tests

```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

test('authenticates user', async () => {
  const { result } = renderHook(() => useAuth())

  await waitFor(() => {
    expect(result.current.isAuthenticated).toBe(true)
  })
})
```

---

## 🎯 Coverage Goals

- **Component tests**: 70%+ coverage
- **Hook tests**: 80%+ coverage
- **Critical paths**: Auth flow, data fetching

---

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
