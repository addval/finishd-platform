# Backend Testing Guide - Rituality Platform

## 📋 Overview

This document covers testing practices for the backend using Jest.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🧪 Test Setup

```bash
npm install --save-dev jest @types/jest ts-jest
```

---

## 📝 Writing Tests

### Service Unit Tests

```typescript
// services/__tests__/auth.service.test.ts
import { authService } from '../auth.service'

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user', async () => {
      const data = { email: 'test@example.com', password: 'TestPass123' }
      const result = await authService.register(data)
      expect(result.user).toHaveProperty('id')
    })

    it('should throw error if user exists', async () => {
      await expect(authService.register(existingData))
        .rejects.toThrow('User already exists')
    })
  })
})
```

### Controller Integration Tests

```typescript
// controllers/__tests__/auth.controller.test.ts
import request from 'supertest'
import { app } from '../../server'

describe('Auth Controller', () => {
  it('should register user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'TestPass123' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })
})
```

---

## 🎯 Coverage Goals

- **Unit tests**: 80%+ coverage for services and utils
- **Integration tests**: All API endpoints
- **Critical paths**: Authentication, user management

---

## 📚 Resources

- [Jest Docs](https://jestjs.io/)
