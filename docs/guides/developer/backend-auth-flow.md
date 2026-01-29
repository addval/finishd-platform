# Backend Authentication Flow - Finishd Platform

## 📋 Overview

This document provides a detailed explanation of the authentication system in the Finishd Platform, including all authentication flows, security measures, and implementation details.

**Last Updated**: January 12, 2026
**Version**: 1.0.0

---

## 🔐 Authentication Overview

The platform uses **JWT (JSON Web Token)** based authentication with the following features:

- **Access Tokens**: Short-lived (15 minutes) JWT tokens for API access
- **Refresh Tokens**: Long-lived (7 days) tokens for token renewal
- **Device Management**: Track and manage multiple devices per user
- **Email Verification**: Required for account activation
- **Password Reset**: Secure password reset via email OTP
- **Session Management**: Ability to revoke specific or all devices

---

## 📊 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Authentication System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Registration│───▶│   Email     │───▶│   Login     │      │
│  │   Flow      │    │ Verification│    │   Flow      │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                                     │               │
│         ▼                                     ▼               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Token Management                       │    │
│  │  • Access Token (15 min, JWT)                       │    │
│  │  • Refresh Token (7 days, hashed)                   │    │
│  │  • Device Tracking (user_devices table)            │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                     │               │
│         ▼                                     ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Token     │    │  Password   │    │   Session   │      │
│  │   Refresh   │    │   Reset     │    │ Management  │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Authentication Flows

### 1. Registration Flow

**Goal**: Create a new user account with email verification.

```
User submits registration data
        ↓
   Validate input (email, password strength)
        ↓
   Check if user already exists (email, username)
        ↓
   Hash password (bcrypt, salt rounds: 10)
        ↓
   Create user with 'user' role (default)
        ↓
   Create user_permissions record (default permissions)
        ↓
   Generate email verification code (6-digit OTP)
        ↓
   Hash verification code (bcrypt)
        ↓
   Save code and expiration (15 minutes) to user record
        ↓
   Send verification email with OTP
        ↓
   Generate JWT tokens (access + refresh)
        ↓
   Create device record with hashed tokens
        ↓
   Return user data, tokens, and device info
```

**Key Files**:
- Controller: `apps/backend/src/controllers/auth.controller.ts`
- Service: `apps/backend/src/services/auth.service.ts`
- Model: `apps/backend/src/models/User.model.ts`

**Security Measures**:
- ✅ Password strength validation (min 8 chars, letter + number)
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Email uniqueness check
- ✅ Username uniqueness check
- ✅ Email verification code hashed before storage
- ✅ Code expiration (15 minutes)
- ✅ Tokens stored hashed in database

**Example Response**:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "user@example.com", "email_verified": false },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    },
    "device": { "id": "...", "device_type": "desktop" }
  },
  "message": "User registered successfully. Please verify your email."
}
```

---

### 2. Email Verification Flow

**Goal**: Verify user's email address using OTP code.

```
User submits email + verification code
        ↓
   Validate input format
        ↓
   Find user by email
        ↓
   Check if email already verified (skip if yes)
        ↓
   Retrieve stored hashed verification code
        ↓
   Compare submitted code with hashed code (bcrypt)
        ↓
   Check code expiration (current_time < expires_at)
        ↓
   Update user: email_verified = true
   Update user: email_verified_at = NOW()
   Clear verification code fields (set to NULL)
        ↓
   Return success response
```

**Security Measures**:
- ✅ Codes hashed with bcrypt
- ✅ Codes expire after 15 minutes
- ✅ Code comparison uses timing-safe bcrypt compare
- ✅ Codes cleared after successful verification
- ✅ Rate limiting (10 requests per minute per email)

**Example Request**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

---

### 3. Login Flow

**Goal**: Authenticate user and provide access tokens.

```
User submits email + password
        ↓
   Validate input format
        ↓
   Find user by email (include soft-deleted check)
        ↓
   Check account status (active/inactive)
        ↓
   Compare password with stored hash (bcrypt)
        ↓
   Check if account is disabled
        ↓
   Update last_login_at timestamp
        ↓
   Generate JWT access token (15 min expiry)
   Generate JWT refresh token (7 days expiry)
        ↓
   Create device record:
   - Hash both tokens (bcrypt)
   - Store device info (type, name, user_agent, IP)
   - Set is_active = true
        ↓
   Return user data, tokens, and device info
```

**JWT Access Token Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "roleId": "550e8400-e29b-41d4-a716-446655440004",
  "iat": 1705051200,
  "exp": 1705052100
}
```

**JWT Refresh Token Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "deviceId": "device-uuid-here",
  "type": "refresh",
  "iat": 1705051200,
  "exp": 1705656000
}
```

**Security Measures**:
- ✅ Password comparison with bcrypt
- ✅ Access tokens expire in 15 minutes
- ✅ Refresh tokens expire in 7 days
- ✅ Tokens hashed before database storage
- ✅ Device tracking with user agent and IP
- ✅ Rate limiting (10 requests per minute per IP)
- ✅ Failed login attempts logged

---

### 4. Token Refresh Flow

**Goal**: Renew access token without requiring re-authentication.

```
Client submits refresh token
        ↓
   Validate refresh token format
        ↓
   Decode JWT (verify signature, expiration)
        ↓
   Extract userId and deviceId from token
        ↓
   Find device record by deviceId and userId
        ↓
   Check if device is active (is_active = true)
        ↓
   Compare hashed refresh token with stored hash
        ↓
   Check token expiration (refresh_token_expires_at)
        ↓
   Generate new access token (15 min)
   Generate new refresh token (7 days)
        ↓
   Update device record:
   - Hash new tokens
   - Update expiration timestamps
   - Update last_used_at
        ↓
   Return new tokens
```

**Security Measures**:
- ✅ Refresh tokens are single-use (new one issued each refresh)
- ✅ Device validation (deviceId must match)
- ✅ Active device check
- ✅ Token expiration enforced
- ✅ Hashed token comparison
- ✅ Rate limiting (20 requests per minute per device)

---

### 5. Logout Flow (Single Device)

**Goal**: Invalidate current session/device.

```
Authenticated user requests logout
        ↓
   Extract access token from Authorization header
        ↓
   Decode JWT (verify signature, expiration)
        ↓
   Extract deviceId from token
        ↓
   Update device record:
   - Set is_active = false
   - Clear tokens (set to NULL)
        ↓
   Return success response
```

**Security Measures**:
- ✅ Device immediately deactivated
- ✅ Tokens cleared from database
- ✅ Client should delete local tokens

---

### 6. Logout Flow (All Devices)

**Goal**: Invalidate all user sessions/devices.

```
Authenticated user requests logout-all
        ↓
   Extract userId from access token
        ↓
   Find all active devices for user
        ↓
   Update all devices:
   - Set is_active = false
   - Clear tokens
        ↓
   Return success response with count
```

**Use Cases**:
- User suspects account compromise
- User wants to sign out from everywhere
- Password changed (optional automatic logout)

---

### 7. Password Reset Flow

**Goal**: Allow user to reset forgotten password.

```
Step 1: Request Reset
User submits email
        ↓
   Find user by email
        ↓
   Generate reset code (6-digit OTP)
        ↓
   Hash reset code (bcrypt)
        ↓
   Save code and expiration (1 hour) to user record
        ↓
   Send reset email with OTP
        ↓
   Return success (don't reveal if user exists)

Step 2: Reset Password
User submits email + code + new_password
        ↓
   Validate input
        ↓
   Find user by email
        ↓
   Compare reset code with stored hash
        ↓
   Check code expiration (1 hour)
        ↓
   Validate new password strength
        ↓
   Hash new password (bcrypt)
        ↓
   Update user password
        ↓
   Clear reset code fields
        ↓
   Logout from all devices (security measure)
        ↓
   Return success
```

**Security Measures**:
- ✅ Reset codes hashed with bcrypt
- ✅ Codes expire after 1 hour
- ✅ Single-use codes (cleared after use)
- ✅ All devices logged out after reset
- ✅ Rate limiting (3 requests per hour per email)
- ✅ Don't reveal if email exists in step 1

---

## 🔧 Device Management

### Device Record Structure

Each login creates a device record in `user_devices` table:

```typescript
{
  id: UUID,                    // Unique device ID
  user_id: UUID,               // Reference to user
  token: TEXT,                 // Hashed access token
  refresh_token: TEXT,         // Hashed refresh token
  token_expires_at: TIMESTAMP, // Access token expiration
  refresh_token_expires_at: TIMESTAMP, // Refresh token expiration
  device_type: VARCHAR,        // mobile, desktop, tablet
  device_name: VARCHAR,        // User-defined name
  user_agent: TEXT,            // Browser/app user agent
  ip_address: VARCHAR,         // IP address at login
  is_active: BOOLEAN,          // Session active status
  last_used_at: TIMESTAMP,     // Last activity
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Device Limits

- **Maximum active devices**: 5 per user
- **Old device handling**: Oldest device automatically revoked when limit exceeded
- **Inactive devices**: Devices not used for 30 days marked inactive

### Device Operations

**Get All Devices**:
```
GET /api/auth/devices
Authorization: Bearer <access_token>
```

**Revoke Device**:
```
DELETE /api/auth/devices/:deviceId
Authorization: Bearer <access_token>
```

---

## 🛡️ Security Implementation

### Password Security

**Hashing**:
- Algorithm: bcrypt
- Salt rounds: 10
- Library: `bcrypt` or `bcryptjs`

**Strength Validation**:
- Minimum length: 8 characters
- Must include: At least one letter and one number
- Optional: Special character encouragement

**Example**:
```typescript
// Hash password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Compare password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

---

### Token Security

**Access Token**:
- Algorithm: HS256 (HMAC-SHA256)
- Secret: From environment variable (`JWT_SECRET`)
- Expiration: 15 minutes (900 seconds)
- Payload: userId, email, roleId, exp, iat

**Refresh Token**:
- Algorithm: HS256
- Secret: From environment variable (`JWT_REFRESH_SECRET`)
- Expiration: 7 days (604800 seconds)
- Payload: userId, deviceId, type, exp, iat

**Storage**:
- Database: Tokens hashed with bcrypt before storage
- Client: Should store in httpOnly cookies or secure storage

---

### Code Security (OTP)

**Verification/Reset Codes**:
- Format: 6-digit numeric (e.g., "123456")
- Hashing: bcrypt with 10 salt rounds
- Verification expiration: 15 minutes
- Reset expiration: 1 hour
- Storage: Hashed in user table
- After use: Immediately cleared (set to NULL)

**Example**:
```typescript
// Generate code
const code = Math.floor(100000 + Math.random() * 900000).toString();

// Hash code
const hashedCode = await bcrypt.hash(code, 10);

// Verify code
const isValid = await bcrypt.compare(submittedCode, storedHashedCode);
```

---

### Rate Limiting

**Endpoint Limits**:

| Operation | Limit | Window |
|-----------|-------|--------|
| Register | 5/hour | IP-based |
| Login | 10/minute | IP-based |
| Email verify | 10/minute | Email-based |
| Password reset (request) | 3/hour | Email-based |
| Password reset (submit) | 5/hour | Email-based |
| Token refresh | 20/minute | Device-based |
| Logout | 10/minute | User-based |
| Logout all | 5/hour | User-based |

**Implementation**: Express-rate-limit middleware

---

### Request Validation

**All inputs validated** using Joi/Zod schemas:

```typescript
// Registration schema example
{
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(8).pattern(/[a-zA-Z]/).pattern(/[0-9]/).required(),
  name: Joi.string().min(2).max(100).optional(),
  username: Joi.string().alphanum().min(3).max(50).optional(),
  // ... other fields
}
```

---

## 📧 Email Service

**Current Status**: Stub implementation (logs to console)

**Email Types**:
1. **Verification Email**: Sent after registration
2. **Welcome Email**: Sent after email verification
3. **Password Reset**: Sent when reset requested
4. **Confirmation Email**: Sent after signup confirmation

**Required Integration**: SendGrid, AWS SES, or Mailgun

**Example Template**:
```typescript
Subject: Verify your email for Finishd Platform

Hello {{name}},

Thank you for registering! Please verify your email address using the code below:

Verification Code: {{code}}

This code will expire in 15 minutes.

If you didn't create an account, please ignore this email.

Best regards,
Finishd Platform Team
```

---

## 🚨 Security Best Practices

### Implemented ✅

1. ✅ Password hashing with bcrypt (10 salt rounds)
2. ✅ JWT tokens for authentication
3. ✅ Short-lived access tokens (15 minutes)
4. ✅ Token storage hashed in database
5. ✅ Email verification required
6. ✅ Device management and tracking
7. ✅ Rate limiting on all endpoints
8. ✅ Input validation on all requests
9. ✅ Codes (OTP) hashed before storage
10. ✅ Soft delete implementation
11. ✅ CORS configuration
12. ✅ Helmet.js for security headers

### Recommended for Production 🔜

1. 🔜 HTTPS enforcement (redirect HTTP to HTTPS)
2. 🔜 httpOnly cookies for token storage (prevent XSS)
3. 🔜 CSRF protection
4. 🔜 Account lockout after failed login attempts (5 attempts)
5. 🔜 IP-based blocking for brute force attacks
6. 🔜 Email provider integration (currently stub)
7. 🔜 2FA/MFA support (optional)
8. 🔜 Session timeout with inactivity detection
9. 🔜 Audit logging for security events
10. 🔜 Webhook notifications for suspicious activities

---

## 🧪 Testing Authentication

### Manual Testing with cURL

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "name": "Test User"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Get Current User**:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

**Logout**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"
```

---

## 📚 Related Documentation

- [Backend Architecture](./backend-architecture.md) - Architecture overview
- [API Reference](./backend-api-reference.md) - Complete API endpoints
- [Database Schema](../../../DATABASE_SCHEMA.md) - Database structure
- [Local Development Setup](./local-development-setup.md) - Setup guide
