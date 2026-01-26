# Authentication System - Context

## SESSION PROGRESS (2026-01-13)

### ✅ COMPLETED

**Database Layer:**
- User, Role, UserDevice, UserPermission models created in TypeScript
- Model relationships and associations configured
- Database indexes and validations implemented
- Migration to TypeScript completed (all models converted from .js to .ts)

**Authentication Service:**
- `apps/backend/src/services/auth.service.ts` - 100% COMPLETE
  - `registerUser()` - User registration with OTP, password validation ✅
  - `verifyEmail()` - Email verification with OTP validation ✅
  - `loginUser()` - Login with device tracking and JWT generation ✅
  - `refreshToken()` - Token refresh with rotation ✅
  - `logoutUser()` - Logout from current device ✅
  - `logoutAllDevices()` - Logout from all devices ✅
  - `resendVerificationEmail()` - Resend OTP for verification ✅

**Authentication Controller:**
- `apps/backend/src/controllers/auth.controller.ts` - 100% COMPLETE
  - All HTTP endpoints implemented (register, login, verify, resend, refresh, logout, logout-all) ✅

**Utility Functions:**
- `apps/backend/src/utils/token.util.ts` - JWT generation and validation ✅
- `apps/backend/src/utils/password.util.ts` - Password hashing and strength validation ✅
- `apps/backend/src/utils/otp.util.ts` - OTP generation and validation ✅
- `apps/backend/src/utils/redis.util.ts` - Redis client for token/OTP storage ✅
- `apps/backend/src/utils/device.util.ts` - Device information extraction ✅
- `apps/backend/src/utils/user.util.ts` - User helper functions ✅
- `apps/backend/src/utils/email.util.ts` - Email sending functions (verify, welcome) ✅

**Response Utilities:**
- `apps/backend/src/utils/response.util.ts` - Standardized API response helpers ✅

**Constants:**
- `apps/backend/src/constants/messages.ts` - API response messages ✅
- `apps/backend/src/constants/httpStatus.ts` - HTTP status codes ✅

**Types:**
- `apps/backend/src/types/index.ts` - TypeScript type definitions ✅
- `apps/backend/src/types/email.types.ts` - Email-related types ✅

### 🟡 IN PROGRESS

**Email Service Integration:**
- `apps/backend/src/services/brevo.service.ts` - Brevo API integration (PARTIAL)
  - Service structure created
  - Need to complete API calls and error handling
  - Next: Implement sendEmail() method with retry logic

- `apps/backend/src/services/emailTemplate.service.ts` - Template manager (PARTIAL)
  - Service structure created
  - Need to implement template loading and variable replacement
  - Next: Create template loading function

**Email Templates:**
- `apps/backend/src/email-templates/` directory created
  - Need to create HTML templates for:
    - Verification email
    - Welcome email
    - Password reset email (future)
  - Next: Design and implement HTML templates

**Route Integration:**
- `apps/backend/src/routes/auth.public.routes.ts` - Public auth endpoints (STRUCTURE)
  - File created, routes need to be added
  - Next: Add all public routes (register, login, verify, resend)

- `apps/backend/src/routes/auth.protected.routes.ts` - Protected endpoints (STRUCTURE)
  - File created, routes need to be added
  - Next: Add protected routes (logout, logout-all, refresh)

- `apps/backend/src/routes/user.routes.ts` - User endpoints (STRUCTURE)
  - File created, need to implement profile, update-profile, change-password
  - Next: Add all user management routes

**Middleware Implementation:**
- `apps/backend/src/middlewares/auth.middleware.ts` - JWT validation (PARTIAL)
  - Structure created, need to complete validation logic
  - Next: Verify JWT, check blacklist, load user into request

- `apps/backend/src/middlewares/validation.middleware.ts` - Request validation (PARTIAL)
  - Structure created, need to add validation schemas
  - Next: Implement Zod schemas for auth requests

- `apps/backend/src/middlewares/rateLimit.middleware.ts` - Rate limiting (PARTIAL)
  - Structure created, need to configure limits
  - Next: Set 5 req/min for login/register, 10 req/min for others

**User Controller:**
- `apps/backend/src/controllers/user.controller.ts` - User endpoints (STARTED)
  - File created, endpoints need implementation
  - Next: Implement getProfile, updateProfile, changePassword, logoutAll

### ⏳ NOT STARTED

**Frontend Integration:**
- Login/register forms
- OTP verification component
- Token storage and management
- Auth context/hook
- Protected route components
- Auto token refresh logic

**Testing:**
- Unit tests for auth services
- Integration tests for API endpoints
- E2E tests for auth flows

**Documentation:**
- API documentation (Swagger/OpenAPI)
- Environment variable documentation
- Setup and deployment guides

### ⚠️ BLOCKERS

**Current Blockers:**
- None identified - authentication backend is largely functional

**Potential Blockers:**
- Brevo API credentials not yet confirmed (need to verify .env configuration)
- Email templates need design before implementation
- Frontend token storage strategy not yet decided (localStorage vs cookies)

## Key Files

### Models (Database Layer)

**`apps/backend/src/models/User.ts`**
- Comprehensive user model with all authentication fields
- Email verification, phone verification, password reset fields
- Profile fields: name, username, bio, profile picture
- Status tracking: active/inactive, deleted (soft delete)
- Validations: email format, password hash required, phone E.164 format
- Scopes: withDeleted, active, verified
- **Status:** ✅ COMPLETE

**`apps/backend/src/models/Role.ts`**
- Role model for RBAC
- **Status:** ✅ COMPLETE

**`apps/backend/src/models/UserDevice.ts`**
- Device tracking for multi-device session management
- Fields: deviceId, userAgent, ipAddress, deviceType, browser, os
- Timestamps: lastLoginAt, loggedOutAt
- **Status:** ✅ COMPLETE

**`apps/backend/src/models/UserPermission.ts`**
- Granular user permissions
- **Status:** ✅ COMPLETE

**`apps/backend/src/models/index.ts`**
- Model exports and associations
- **Status:** ✅ COMPLETE

### Services (Business Logic)

**`apps/backend/src/services/auth.service.ts`** ⭐ MOST CRITICAL
- **Status:** ✅ 100% COMPLETE
- All authentication methods implemented
- Comprehensive error handling and logging
- Console debugging for development (to be removed in production)
- **Methods:**
  - `registerUser()` - Creates user, generates OTP, sends email
  - `verifyEmail()` - Validates OTP, marks email verified
  - `loginUser()` - Authenticates, tracks device, generates tokens
  - `refreshToken()` - Rotates refresh token
  - `logoutUser()` - Invalidates session
  - `logoutAllDevices()` - Invalidates all sessions
  - `resendVerificationEmail()` - Sends new OTP

**`apps/backend/src/services/user.service.ts`**
- User management operations
- **Status:** ✅ COMPLETE
- **Next:** Integrate with UserController

**`apps/backend/src/services/brevo.service.ts`** 🟡 IN PROGRESS
- Brevo (Sendinblue) email service integration
- **Status:** PARTIAL
- **Current:** Service structure created
- **Next:**
  1. Complete API integration with Brevo SDK
  2. Implement sendEmail() method
  3. Add error handling and retry logic
  4. Add logging and monitoring

**`apps/backend/src/services/emailTemplate.service.ts`** 🟡 IN PROGRESS
- Email template management
- **Status:** PARTIAL
- **Current:** Service structure created
- **Next:**
  1. Implement template loading from file system
  2. Add variable replacement logic
  3. Cache templates for performance

### Controllers (Request Handlers)

**`apps/backend/src/controllers/auth.controller.ts`** ⭐ MOST CRITICAL
- **Status:** ✅ 100% COMPLETE
- All HTTP endpoints implemented with proper error handling
- **Endpoints:**
  - `register` - POST /auth/register
  - `login` - POST /auth/login
  - `verifyEmail` - POST /auth/verify-email
  - `resendVerification` - POST /auth/resend-verification
  - `refreshToken` - POST /auth/refresh-token
  - `logout` - POST /auth/logout (protected)
  - `logoutAll` - POST /auth/logout-all (protected)
- **Next:** Connect to routes

**`apps/backend/src/controllers/user.controller.ts`** 🟡 IN PROGRESS
- User management endpoints
- **Status:** PARTIAL
- **Next:** Implement profile, update-profile, change-password endpoints

### Middleware

**`apps/backend/src/middlewares/auth.middleware.ts`** 🔒 CRITICAL FOR SECURITY
- JWT authentication middleware
- **Status:** PARTIAL
- **Current:** Structure created
- **Next:**
  1. Extract and verify JWT from Authorization header
  2. Check if token is blacklisted in Redis
  3. Load user data into req.user
  4. Handle token expiry and invalid tokens
  5. Add device ID validation

**`apps/backend/src/middlewares/validation.middleware.ts`**
- Request validation middleware
- **Status:** PARTIAL
- **Current:** Structure created
- **Next:**
  1. Define Zod schemas for auth requests
  2. Implement validation logic
  3. Return 400 errors with validation details

**`apps/backend/src/middlewares/rateLimit.middleware.ts`**
- Rate limiting to prevent abuse
- **Status:** PARTIAL
- **Current:** Structure created
- **Next:**
  1. Configure Redis store for rate limiting
  2. Set limits: 5 req/min for login/register
  3. Set limits: 10 req/min for other endpoints
  4. Add custom error messages

**`apps/backend/src/middlewares/errorHandler.ts`**
- Global error handling middleware
- **Status:** ✅ COMPLETE
- **Next:** Add specific handling for auth errors

### Routes

**`apps/backend/src/routes/auth.public.routes.ts`**
- Public authentication endpoints (no auth required)
- **Status:** STRUCTURE CREATED
- **Next:** Add routes: register, login, verify-email, resend-verification, refresh-token

**`apps/backend/src/routes/auth.protected.routes.ts`**
- Protected authentication endpoints (auth required)
- **Status:** STRUCTURE CREATED
- **Next:** Add routes: logout, logout-all (with auth middleware)

**`apps/backend/src/routes/user.routes.ts`**
- User management endpoints (auth required)
- **Status:** STRUCTURE CREATED
- **Next:** Add routes: profile, update-profile, change-password, logout-all

**`apps/backend/src/routes/index.ts`**
- Main router that combines all routes
- **Status:** NEEDS UPDATE
- **Next:** Register auth and user routes

### Utilities

**`apps/backend/src/utils/token.util.ts`** ✅
- JWT token generation and validation
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- **Functions:** generateTokenPair(), verifyAccessToken(), verifyRefreshToken()

**`apps/backend/src/utils/password.util.ts`** ✅
- Password hashing with bcrypt
- Password strength validation
- **Functions:** hashPassword(), comparePassword(), validatePasswordStrength()

**`apps/backend/src/utils/otp.util.ts`** ✅
- OTP generation and validation
- OTP hashing with bcrypt
- Expiry checking
- **Functions:** generateVerificationCodeWithExpiry(), hashOTP(), verifyOTP(), isCodeExpired()

**`apps/backend/src/utils/redis.util.ts`** ✅
- Redis client operations
- Token storage and retrieval
- **Functions:** setRefreshToken(), getRefreshToken(), deleteRefreshToken(), deleteAllUserTokens()

**`apps/backend/src/utils/device.util.ts`** ✅
- Device information extraction from request
- **Functions:** extractDeviceInfo()
- **Extracts:** deviceId (fingerprint), userAgent, ipAddress, deviceType, browser, os

**`apps/backend/src/utils/user.util.ts`** ✅
- User helper functions
- **Functions:** getUserByEmail(), userExistsByEmail(), getUserById(), createSafeUser()

**`apps/backend/src/utils/email.util.ts`** ✅
- Email sending utilities
- **Functions:** sendVerificationEmail(), sendWelcomeEmail()
- **Status:** Working, uses Brevo SMTP

**`apps/backend/src/utils/response.util.ts`** ✅
- Standardized API response helpers
- **Functions:** successResponse(), createdResponse(), errorResponse()

### Configuration

**`apps/backend/src/config/database.ts`** ✅
- PostgreSQL database configuration with Sequelize

**`apps/backend/src/config/redis.ts`** ✅
- Redis client configuration

**`apps/backend/.env.example`** ✅
- Environment variable template
- **Need to verify:** JWT secrets, Brevo credentials

### Types

**`apps/backend/src/types/index.ts`** ✅
- All TypeScript type definitions
- User, Role, Device, Auth types

**`apps/backend/src/types/email.types.ts`** ✅
- Email-related types

### Constants

**`apps/backend/src/constants/messages.ts`** ✅
- API response messages
- Success and error messages for auth flows

**`apps/backend/src/constants/httpStatus.ts`** ✅
- HTTP status code constants

### Validators

**`apps/backend/src/validators/auth.validator.ts`** 🟡
- Auth request validation schemas
- **Status:** PARTIAL
- **Next:** Define Zod schemas for all auth requests

### Email Templates

**`apps/backend/src/email-templates/`** 📧 DIRECTORY CREATED
- **Status:** EMPTY
- **Next:** Create HTML templates:
  1. `verification.html` - Email verification with OTP
  2. `welcome.html` - Welcome email after verification
  3. `password-reset.html` - Password reset (future)

## Important Decisions

### 1. JWT Token Strategy ✅
**Decision:** Access tokens (15 min) + Refresh tokens (7 days)

**Why:**
- Short-lived access tokens limit security exposure
- Refresh tokens provide good UX without frequent re-login
- Token rotation enhances security

**Trade-offs:**
- More complex than single token system
- Requires Redis for token storage
- Additional latency for refresh token checks

**Status:** ✅ IMPLEMENTED in `token.util.ts` and `auth.service.ts`

### 2. OTP Configuration ✅
**Decision:** 6-digit OTP, 60-minute expiry

**Why:**
- 6 digits is industry standard, easy to type
- 60 minutes gives users sufficient time
- Resend functionality handles expired codes

**Trade-offs:**
- Longer expiry increases exposure window
- Shorter expiry hurts user experience

**Status:** ✅ IMPLEMENTED in `otp.util.ts`

### 3. Email Provider ✅
**Decision:** Brevo (formerly Sendinblue)

**Why:**
- Generous free tier (300 emails/day)
- Good API and documentation
- Template management features
- Email analytics included

**Trade-offs:**
- Vendor lock-in
- Rate limits on free tier
- Delivery delays possible

**Status:** 🟡 PARTIAL - Service structure created, API integration incomplete

### 4. Device Tracking ✅
**Decision:** Track devices for session management

**Why:**
- Users can see and manage active sessions
- Logout from specific devices
- Enhanced security (detect unusual logins)
- Required for per-device refresh tokens

**Trade-offs:**
- Additional database storage
- Privacy considerations (must be transparent)

**Status:** ✅ IMPLEMENTED in `UserDevice` model and `device.util.ts`

### 5. Token Storage ✅
**Decision:** Redis for refresh token storage

**Why:**
- Fast read/write operations
- Built-in TTL support
- Easy invalidation on logout
- Scales well horizontally

**Trade-offs:**
- Additional infrastructure dependency
- Need to handle Redis failures gracefully

**Status:** ✅ IMPLEMENTED in `redis.util.ts`

### 6. Password Requirements ✅
**Decision:** Strength validation with bcrypt hashing

**Why:**
- Enforce strong passwords (min 8 chars, mixed case, numbers)
- Bcrypt is industry standard (cost factor 10)
- Future-proof with adaptable cost factor

**Trade-offs:**
- Strong passwords may frustrate users
- Bcrypt is slower than alternatives (but more secure)

**Status:** ✅ IMPLEMENTED in `password.util.ts`

### 7. Database Strategy ✅
**Decision:** PostgreSQL with Sequelize ORM, soft deletes

**Why:**
- PostgreSQL is reliable and feature-rich
- Sequelize provides good TypeScript support
- Soft deletes allow data recovery
- Scopes for common queries (active, verified)

**Trade-offs:**
- Sequelize overhead vs raw SQL
- Soft deletes complicate unique constraints

**Status:** ✅ IMPLEMENTED

### 8. Rate Limiting Strategy 🟡
**Decision:** Rate limit on auth endpoints using Redis

**Planned:**
- 5 requests/minute for login/register
- 10 requests/minute for other endpoints
- Redis-based for distributed systems

**Status:** 🟡 PARTIAL - Middleware structure created, configuration incomplete

### 9. Frontend Token Storage ⏳ NOT DECIDED
**Decision Needed:** localStorage vs httpOnly cookies

**Considerations:**
- **localStorage:** More flexible, vulnerable to XSS
- **httpOnly cookies:** More secure, less flexible, CSRF risk
- **Hybrid:** Access token in memory, refresh token in httpOnly cookie

**Status:** ⏳ DEFERRED - Need to decide before frontend implementation

## Technical Constraints

### Database Constraints
1. **Database:** PostgreSQL (required, no alternative)
2. **ORM:** Sequelize (established, no changes)
3. **Migrations:** Required for all schema changes
4. **Naming:** snake_case in database, camelCase in code

### Cache Constraints
1. **Cache Layer:** Redis (required for OTP and token storage)
2. **TTL:** OTP codes expire in 60 minutes
3. **Token Storage:** Refresh tokens stored with 7-day TTL

### Security Constraints
1. **JWT Secrets:** Must be in environment variables (never in code)
2. **Password Hashing:** Bcrypt with cost factor 10+
3. **HTTPS:** Required for production (mandatory for auth)
4. **CORS:** Must be configured for frontend domain

### Email Constraints
1. **Provider:** Brevo API (chosen, has rate limits)
2. **Templates:** HTML templates in `email-templates/` directory
3. **OTP Format:** 6-digit numeric code
4. **Retry Logic:** Must handle failed email sends

### API Constraints
1. **Response Format:** Standardized JSON format (success, data, message, error)
2. **Error Codes:** Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
3. **Validation:** Request validation with clear error messages
4. **Rate Limits:** Prevent abuse on all public endpoints

### Performance Constraints
1. **Response Time:** Auth endpoints < 200ms (p95)
2. **Token Validation:** < 50ms (p95)
3. **Email Delivery:** < 5 seconds
4. **Database Indexes:** Required on frequently queried fields (email, deviceId)

### Infrastructure Constraints
1. **Node.js:** Version 18+ (required)
2. **TypeScript:** Strict mode enabled
3. **Environment:** Development, staging, production
4. **Monitoring:** Need logging and error tracking (Sentry planned)

## Quick Resume

### To Continue Implementation:

**Step 1: Complete Email Service**
```bash
# File: apps/backend/src/services/brevo.service.ts
# Tasks:
1. Complete Brevo API integration
2. Implement sendEmail() with retry logic
3. Add error handling and logging
4. Test email delivery
```

**Step 2: Create Email Templates**
```bash
# Directory: apps/backend/src/email-templates/
# Tasks:
1. Create verification.html template
2. Create welcome.html template
3. Add template variables ({{ otp }}, {{ expiryMinutes }}, etc.)
4. Test template rendering
```

**Step 3: Complete Middleware**
```bash
# Files: apps/backend/src/middlewares/
# Tasks:
1. auth.middleware.ts - Complete JWT validation
2. validation.middleware.ts - Add Zod schemas
3. rateLimit.middleware.ts - Configure rate limits
4. Test all middleware chains
```

**Step 4: Register Routes**
```bash
# Files: apps/backend/src/routes/
# Tasks:
1. Add all routes to auth.public.routes.ts
2. Add all routes to auth.protected.routes.ts
3. Add all routes to user.routes.ts
4. Register in main index.ts router
5. Test all endpoints with curl/Postman
```

**Step 5: Testing**
```bash
# Tasks:
1. Test complete auth flow (register → verify → login)
2. Test token refresh flow
3. Test logout flows (single and all devices)
4. Test error scenarios (invalid OTP, wrong password, etc.)
5. Load testing for performance
```

### Current Priority

**HIGH PRIORITY (Do Next):**
1. Complete Brevo service integration
2. Create email HTML templates
3. Finish auth middleware (JWT validation + blacklist)
4. Add validation schemas
5. Register all routes and test endpoints

**MEDIUM PRIORITY (This Week):**
1. Configure rate limiting
2. Implement UserController endpoints
3. Add comprehensive error handling
4. Test complete auth flow end-to-end

**LOW PRIORITY (Next Week):**
1. Start frontend auth components
2. Add unit tests for services
3. Create API documentation
4. Set up monitoring/logging

### Refer To:
- **This file** (context.md) - For current state and decisions
- **tasks.md** - For detailed task checklist
- **plan.md** - For overall strategy and architecture

### Commands to Test:

```bash
# Start backend server
cd apps/backend
npm run dev

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test email verification
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## Related Files

**Database:**
- `apps/backend/src/config/database.ts` - DB configuration
- `apps/backend/src/scripts/migrate.ts` - Migration script
- `apps/backend/src/scripts/seed.ts` - Seed script (creates default roles)

**Server:**
- `apps/backend/src/server.ts` - Express server setup
- `apps/backend/src/app.ts` - App configuration (if separated)

**Environment:**
- `apps/backend/.env` - Environment variables (not in git)
- `apps/backend/.env.example` - Environment template

**Testing:**
- `apps/backend/src/tests/setup.ts` - Test setup
- `apps/backend/vitest.config.ts` - Vitest configuration

**Project Root:**
- `.claude/CLAUDE.md` - Project guidelines and conventions
- `package.json` - Root package.json
- `pnpm-lock.yaml` - Dependency lock file

## Notes

**Current Session Focus:**
- Complete email service integration
- Create HTML email templates
- Finish middleware implementation
- Register and test all routes

**Development Environment:**
- Console logs are intentional for debugging
- Remove or disable console.log in production
- OTP codes are logged for testing convenience
- Set DEBUG environment variable for verbose logging

**Security Reminders:**
- Never commit .env files
- Use strong JWT secrets in production
- Enable CORS for trusted domains only
- Use HTTPS in production
- Monitor failed login attempts
- Implement account lockout after N failed attempts

**Performance Notes:**
- Database queries should use indexes
- Redis operations should be pipelined when possible
- Email sending is async - don't block responses
- Consider queue for high-volume email sending

---

**Document Status:** ✅ Up to date
**Last Updated:** 2026-01-13
**Next Update:** After completing email service and middleware
