# Backend API Reference - Rituality Platform

## 📋 Overview

This document provides a comprehensive reference for all available API endpoints in the Rituality Platform backend.

**Last Updated**: January 12, 2026
**Version**: 1.0.0
**Base URL**: `http://localhost:3000/api`

---

## 📡 Response Format

All API endpoints follow a consistent response format.

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "message": "Error message here"
}
```

---

## 🔒 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## 📚 API Endpoints

### **Authentication Endpoints**

#### 1. Register New User

Create a new user account.

**Endpoint**: `POST /api/auth/register`
**Auth Required**: ❌ No
**Rate Limit**: 5 requests per hour per IP

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "username": "johndoe",
  "city": "New York",
  "phone_number": "+1234567890",
  "country_code": "+1",
  "timezone": "America/New_York"
}
```

**Required Fields**:
- `email` (string, email format): User's email address
- `password` (string, min 8 chars): User's password

**Optional Fields**:
- `name` (string, 2-100 chars): User's display name
- `username` (string, 3-50 chars, alphanumeric + underscores): Unique username
- `city` (string, 2-100 chars): User's city
- `phone_number` (string, E.164 format): Phone number
- `country_code` (string, 5 chars): Country code
- `timezone` (string, IANA format): User's timezone

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "role_id": "550e8400-e29b-41d4-a716-446655440004",
      "email_verified": false,
      "onboarding_completed": false,
      "created_at": "2026-01-12T10:00:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    },
    "device": {
      "id": "device-id-uuid",
      "device_type": "desktop",
      "user_agent": "Mozilla/5.0...",
      "is_active": true
    }
  },
  "message": "User registered successfully. Please verify your email."
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 409 | USER_EXISTS | Email or username already exists |
| 500 | INTERNAL_ERROR | Server error |

---

#### 2. Login

Authenticate a user and receive access tokens.

**Endpoint**: `POST /api/auth/login`
**Auth Required**: ❌ No
**Rate Limit**: 10 requests per minute per IP

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Required Fields**:
- `email` (string): User's email
- `password` (string): User's password

**Optional Fields**:
- `device_name` (string): Custom device name
- `device_type` (string): Device type (mobile, desktop, tablet)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "name": "John Doe",
      "email_verified": true,
      "onboarding_completed": false,
      "last_login_at": "2026-01-12T10:05:00.000Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    },
    "device": {
      "id": "device-id-uuid",
      "device_type": "desktop",
      "device_name": "My Chrome Browser",
      "is_active": true
    }
  },
  "message": "Login successful"
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | INVALID_CREDENTIALS | Email or password is incorrect |
| 403 | ACCOUNT_DISABLED | Account is disabled |
| 429 | TOO_MANY_ATTEMPTS | Too many login attempts |
| 500 | INTERNAL_ERROR | Server error |

---

#### 3. Verify Email

Verify user's email address using OTP code.

**Endpoint**: `POST /api/auth/verify-email`
**Auth Required**: ❌ No (code-based verification)
**Rate Limit**: 10 requests per minute per email

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Required Fields**:
- `email` (string): User's email
- `code` (string, 6 digits): Verification OTP code

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "email_verified": true,
      "email_verified_at": "2026-01-12T10:10:00.000Z"
    }
  },
  "message": "Email verified successfully"
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 400 | INVALID_CODE | Verification code is invalid or expired |
| 404 | USER_NOT_FOUND | User not found |
| 409 | ALREADY_VERIFIED | Email already verified |
| 500 | INTERNAL_ERROR | Server error |

---

#### 4. Resend Email Verification

Resend email verification code.

**Endpoint**: `POST /api/auth/resend-verification`
**Auth Required**: ❌ No
**Rate Limit**: 3 requests per hour per email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Verification code sent to your email"
}
```

---

#### 5. Request Password Reset

Request a password reset code via email.

**Endpoint**: `POST /api/auth/forgot-password`
**Auth Required**: ❌ No
**Rate Limit**: 3 requests per hour per email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Password reset code sent to your email"
}
```

---

#### 6. Reset Password

Reset password using reset code.

**Endpoint**: `POST /api/auth/reset-password`
**Auth Required**: ❌ No (code-based reset)
**Rate Limit**: 5 requests per hour per email

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "654321",
  "new_password": "NewSecurePass123"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Password reset successfully"
}
```

---

#### 7. Refresh Access Token

Refresh access token using refresh token.

**Endpoint**: `POST /api/auth/refresh-token`
**Auth Required**: ❌ No (refresh token in request body)
**Rate Limit**: 20 requests per minute per device

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  },
  "message": "Token refreshed successfully"
}
```

**Error Responses**:

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | INVALID_TOKEN | Refresh token is invalid or expired |
| 500 | INTERNAL_ERROR | Server error |

---

#### 8. Logout (Current Device)

Logout from current device only.

**Endpoint**: `POST /api/auth/logout`
**Auth Required**: ✅ Yes
**Rate Limit**: 10 requests per minute per user

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

#### 9. Logout (All Devices)

Logout from all devices.

**Endpoint**: `POST /api/auth/logout-all`
**Auth Required**: ✅ Yes
**Rate Limit**: 5 requests per hour per user

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Logged out from all devices successfully"
}
```

---

#### 10. Get Current User

Get currently authenticated user's profile.

**Endpoint**: `GET /api/auth/me`
**Auth Required**: ✅ Yes

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "email": "user@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "city": "New York",
      "phone_number": "+1234567890",
      "country_code": "+1",
      "timezone": "America/New_York",
      "email_verified": true,
      "email_verified_at": "2026-01-12T10:10:00.000Z",
      "onboarding_completed": false,
      "profile_picture_url": null,
      "bio": null,
      "status": "active",
      "role": {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "user"
      },
      "permissions": {
        "calendar_enabled": false,
        "notifications_enabled": false,
        "contacts_enabled": false,
        "location_enabled": false,
        "marketing_emails_enabled": true,
        "ritual_reminders_enabled": true,
        "community_updates_enabled": true
      },
      "created_at": "2026-01-12T10:00:00.000Z",
      "updated_at": "2026-01-12T10:00:00.000Z"
    }
  },
  "message": "User retrieved successfully"
}
```

---

#### 11. Update User Profile

Update authenticated user's profile.

**Endpoint**: `PATCH /api/auth/me`
**Auth Required**: ✅ Yes

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "name": "John Updated",
  "username": "johnupdated",
  "city": "San Francisco",
  "phone_number": "+1987654321",
  "country_code": "+1",
  "timezone": "America/Los_Angeles",
  "bio": "Software developer and ritual enthusiast"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... }
  },
  "message": "Profile updated successfully"
}
```

---

#### 12. Change Password

Change authenticated user's password.

**Endpoint**: `POST /api/auth/change-password`
**Auth Required**: ✅ Yes

**Request Headers**:
```
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "current_password": "OldPass123",
  "new_password": "NewSecurePass123"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

---

#### 13. Get User Devices

Get all devices for authenticated user.

**Endpoint**: `GET /api/auth/devices`
**Auth Required**: ✅ Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device-id-1",
        "device_type": "desktop",
        "device_name": "My Chrome Browser",
        "user_agent": "Mozilla/5.0...",
        "ip_address": "192.168.1.1",
        "is_active": true,
        "last_used_at": "2026-01-12T10:05:00.000Z",
        "created_at": "2026-01-12T10:00:00.000Z"
      }
    ]
  },
  "message": "Devices retrieved successfully"
}
```

---

#### 14. Revoke Device

Revoke a specific device/session.

**Endpoint**: `DELETE /api/auth/devices/:deviceId`
**Auth Required**: ✅ Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": null,
  "message": "Device revoked successfully"
}
```

---

### **Health Check Endpoint**

#### 15. Health Check

Check API health status.

**Endpoint**: `GET /api/health`
**Auth Required**: ❌ No

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-12T10:00:00.000Z",
    "uptime": 3600,
    "database": "connected",
    "redis": "connected"
  },
  "message": "API is healthy"
}
```

---

## 🚫 Error Codes

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 400 | INVALID_CODE | OTP/verification code is invalid or expired |
| 400 | WEAK_PASSWORD | Password does not meet strength requirements |
| 401 | UNAUTHORIZED | Authentication required |
| 401 | INVALID_CREDENTIALS | Invalid email or password |
| 401 | INVALID_TOKEN | JWT token is invalid or expired |
| 403 | FORBIDDEN | Access denied (insufficient permissions) |
| 403 | ACCOUNT_DISABLED | Account has been disabled |
| 404 | NOT_FOUND | Resource not found |
| 404 | USER_NOT_FOUND | User not found |
| 409 | CONFLICT | Resource already exists |
| 409 | USER_EXISTS | Email or username already exists |
| 409 | ALREADY_VERIFIED | Email already verified |
| 422 | UNPROCESSABLE_ENTITY | Cannot process request |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 429 | TOO_MANY_ATTEMPTS | Too many login attempts |
| 500 | INTERNAL_ERROR | Internal server error |

---

## 📊 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/auth/register` | 5 requests | per hour per IP |
| `POST /api/auth/login` | 10 requests | per minute per IP |
| `POST /api/auth/verify-email` | 10 requests | per minute per email |
| `POST /api/auth/resend-verification` | 3 requests | per hour per email |
| `POST /api/auth/forgot-password` | 3 requests | per hour per email |
| `POST /api/auth/reset-password` | 5 requests | per hour per email |
| `POST /api/auth/refresh-token` | 20 requests | per minute per device |
| `POST /api/auth/logout` | 10 requests | per minute per user |
| `POST /api/auth/logout-all` | 5 requests | per hour per user |

**Rate Limit Response** (429 Too Many Requests):
```json
{
  "success": false,
  "data": null,
  "message": "Too many requests. Please try again later."
}
```

---

## 🔐 Security Best Practices

1. **Always use HTTPS** in production
2. **Never log tokens** or passwords
3. **Implement proper CORS** policies
4. **Use helmet.js** for security headers
5. **Validate all inputs** on the server side
6. **Hash sensitive data** (passwords, codes, tokens) before storage
7. **Implement rate limiting** to prevent abuse
8. **Rotate tokens** periodically
9. **Revoke tokens** on logout and password change
10. **Monitor and log** suspicious activities

---

## 📝 Future Endpoints

The following endpoints are planned but not yet implemented:

- **User Profile**: Avatar upload, delete account
- **User Permissions**: Update permissions and preferences
- **Admin**: User management, role management
- **Rituals**: CRUD operations for rituals
- **Calendar**: Calendar integration and events
- **Notifications**: Push notification management
- **Community**: Posts, comments, likes
- **Analytics**: User analytics and insights

---

## 📚 Related Documentation

- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [Auth Flow](./backend-auth-flow.md) - Detailed authentication flow
- [Database Schema](../../../DATABASE_SCHEMA.md) - Database structure
