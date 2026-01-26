# Authentication System - Task Checklist

## Phase 1: Database & Models ✅ COMPLETE

### Database Setup
- [x] Create User model with TypeScript
- [x] Create Role model
- [x] Create UserDevice model
- [x] Create UserPermission model
- [x] Set up model relationships and associations
- [x] Add database indexes (email, deviceId)
- [x] Configure model validations
- [x] Add model scopes (active, verified, withDeleted)
- [x] Migrate all models from JavaScript to TypeScript

**Status:** ✅ 100% COMPLETE
**Files:** `apps/backend/src/models/*.ts`

## Phase 2: Authentication Services ✅ COMPLETE

### Core Auth Service
- [x] Create AuthService structure
- [x] Implement register() method
  - Acceptance: User created, OTP sent, hashed password stored
- [x] Implement login() method
  - Acceptance: Tokens generated, device tracked, login recorded
- [x] Implement verifyOTP() method
  - Acceptance: Email verified, OTP invalidated
- [x] Implement refreshToken() method
  - Acceptance: New access token if refresh token valid
- [x] Implement logout() method
  - Acceptance: Tokens blacklisted, session ended
- [x] Implement logoutAllDevices() method
  - Acceptance: All sessions invalidated
- [x] Implement resendVerificationEmail() method
  - Acceptance: New OTP sent, expiry updated

**Status:** ✅ 100% COMPLETE
**File:** `apps/backend/src/services/auth.service.ts`

### Supporting Services
- [x] Create TokenUtil (generate, verify, refresh tokens)
- [x] Create PasswordUtil (hash, compare passwords)
- [x] Create OTPUtil (generate, validate OTP)
- [x] Create RedisUtil (client setup, token operations)
- [x] Create DeviceUtil (extract device info)
- [x] CreateUserUtil (user helpers, safeUser)
- [x] Create EmailUtil (send verification, welcome emails)
- [x] Create ResponseUtil (standardized API responses)

**Status:** ✅ 100% COMPLETE
**Files:** `apps/backend/src/utils/*.ts`

### User Service
- [x] Create UserService structure
- [x] Implement user management methods

**Status:** ✅ COMPLETE
**File:** `apps/backend/src/services/user.service.ts`

## Phase 3: API Controllers & Routes ✅ COMPLETE

### Auth Controller
- [x] Create AuthController structure
- [x] Implement POST /api/auth/register
  - Acceptance: 201 on success, validation errors handled
- [x] Implement POST /api/auth/login
  - Acceptance: 200 on success, tokens returned
- [x] Implement POST /api/auth/verify-email
  - Acceptance: 200 on success, email marked verified
- [x] Implement POST /api/auth/resend-verification
  - Acceptance: 200 on success, new OTP sent
- [x] Implement POST /api/auth/refresh-token
  - Acceptance: 200 on success, new access token
- [x] Implement POST /api/auth/logout
  - Acceptance: 200 on success, tokens invalidated
- [x] Implement POST /api/auth/logout-all
  - Acceptance: 200 on success, all sessions terminated

**Status:** ✅ 100% COMPLETE
**File:** `apps/backend/src/controllers/auth.controller.ts`

### User Controller
- [x] Create UserController structure
- [ ] Implement GET /api/users/profile
  - Acceptance: Returns current user profile
- [ ] Implement PUT /api/users/profile
  - Acceptance: Updates user profile
- [ ] Implement POST /api/users/change-password
  - Acceptance: Password changed successfully
- [ ] Implement POST /api/users/logout-all
  - Acceptance: All sessions terminated

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/controllers/user.controller.ts`

### Routes Structure
- [x] Create auth.public.routes.ts
- [x] Create auth.protected.routes.ts
- [x] Create user.routes.ts
- [ ] Add all public auth endpoints to auth.public.routes.ts
- [ ] Add all protected auth endpoints to auth.protected.routes.ts
- [ ] Add all user endpoints to user.routes.ts
- [ ] Register routes in main router (index.ts)
- [ ] Apply auth middleware to protected routes

**Status:** 🟡 IN PROGRESS
**Files:** `apps/backend/src/routes/*.ts`

## Phase 4: Email Service 🟡 IN PROGRESS

### Brevo Service Integration
- [x] Create BrevoService structure
- [ ] Install Brevo SDK (`@getbrevo/brevo`)
- [ ] Implement sendEmail() method
  - Acceptance: Can send emails via Brevo API
- [ ] Add error handling and retry logic
  - Acceptance: Failed emails logged, retry 3 times
- [ ] Add email delivery tracking
  - Acceptance: Log delivery status, handle bounces
- [ ] Test email delivery with real API
  - Acceptance: Emails received in inbox

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/services/brevo.service.ts`

### Email Template Service
- [x] Create EmailTemplateService structure
- [ ] Implement loadTemplate() method
  - Acceptance: Load HTML templates from file system
- [ ] Implement renderTemplate() method
  - Acceptance: Replace variables ({{ otp }}, {{ name }}, etc.)
- [ ] Add template caching
  - Acceptance: Templates cached after first load
- [ ] Handle missing templates gracefully
  - Acceptance: Returns default template if custom missing

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/services/emailTemplate.service.ts`

### Email Templates
- [x] Create email-templates directory
- [ ] Create verification.html template
  - Content: OTP code, expiry time, company branding
  - Variables: {{ otp }}, {{ expiryMinutes }}, {{ name }}
- [ ] Create welcome.html template
  - Content: Welcome message, next steps, link to login
  - Variables: {{ name }}, {{ loginUrl }}
- [ ] Create password-reset.html template (future)
  - Content: Reset link, expiry time, security warning
  - Variables: {{ resetLink }}, {{ expiryMinutes }}

**Status:** 🟡 IN PROGRESS
**Directory:** `apps/backend/src/email-templates/`

### Email Integration Testing
- [ ] Test verification email delivery
- [ ] Test welcome email delivery
- [ ] Test email template rendering
- [ ] Test OTP expiry handling
- [ ] Test resend verification flow
- [ ] Test email delivery failures
- [ ] Test spam score (use mail-tester.com)

**Status:** ⏳ NOT STARTED

## Phase 5: Middleware 🟡 IN PROGRESS

### Authentication Middleware
- [x] Create auth middleware structure
- [ ] Extract JWT from Authorization header
  - Acceptance: Token extracted from "Bearer <token>"
- [ ] Verify access token
  - Acceptance: Valid tokens pass, invalid rejected with 401
- [ ] Check token blacklist in Redis
  - Acceptance: Blacklisted tokens rejected with 401
- [ ] Load user data into req.user
  - Acceptance: req.user populated with user object
- [ ] Load deviceId into req.deviceId
  - Acceptance: req.deviceId populated from token
- [ ] Handle token expiry gracefully
  - Acceptance: Expired tokens return 401 with clear message
- [ ] Add rate limiting per user
  - Acceptance: 100 requests per minute per user

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/middlewares/auth.middleware.ts`

### Validation Middleware
- [x] Create validation middleware structure
- [ ] Install Zod (`zod`)
- [ ] Define schema for register request
  - Fields: email (valid email), password (min 8 chars), name (optional)
- [ ] Define schema for login request
  - Fields: email, password
- [ ] Define schema for verify-email request
  - Fields: email, code (6 digits)
- [ ] Define schema for refresh-token request
  - Fields: refreshToken, deviceId
- [ ] Implement validation logic
  - Acceptance: Invalid requests return 400 with error details
- [ ] Add sanitization to prevent injection
  - Acceptance: All input sanitized, trimmed

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/middlewares/validation.middleware.ts`

### Rate Limiting Middleware
- [x] Create rate limiting structure
- [ ] Configure Redis store for rate limiting
- [ ] Set rate limit for /auth/register
  - Limit: 5 requests per minute per IP
- [ ] Set rate limit for /auth/login
  - Limit: 5 requests per minute per IP
- [ ] Set rate limit for /auth/verify-email
  - Limit: 10 requests per minute per IP
- [ ] Set rate limit for other auth endpoints
  - Limit: 20 requests per minute per IP
- [ ] Add custom error messages
  - Acceptance: Clear message "Too many attempts, try again later"
- [ ] Test rate limiting works
  - Acceptance: Requests blocked after limit reached

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/middlewares/rateLimit.middleware.ts`

### Error Handler
- [x] Create global error handler
- [ ] Add specific handling for auth errors
  - Acceptance: Proper status codes (401, 403, 404, 500)
- [ ] Add error logging
  - Acceptance: All errors logged with context
- [ ] Add error response format
  - Acceptance: { success: false, error: message, data: null }
- [ ] Handle ValidationError (400)
- [ ] Handle UnauthorizedError (401)
- [ ] Handle ForbiddenError (403)
- [ ] Handle NotFoundError (404)
- [ ] Handle ConflictError (409)

**Status:** 🟡 IN PROGRESS
**File:** `apps/backend/src/middlewares/errorHandler.ts`

## Phase 6: Frontend Integration ⏳ NOT STARTED

### Setup & Configuration
- [ ] Install frontend dependencies
  - `axios` for API calls
  - `react-router-dom` for routing
  - `react-hook-form` for forms
  - `zod` for validation
- [ ] Create API service layer
  - File: `apps/frontend/src/services/api.ts`
  - Acceptance: Axios instance with base URL, interceptors
- [ ] Create auth service
  - File: `apps/frontend/src/services/authService.ts`
  - Acceptance: Methods for all auth API calls

**Status:** ⏳ NOT STARTED

### Auth Components - Registration
- [ ] Create RegisterForm component
  - File: `apps/frontend/src/components/features/auth/RegisterForm.tsx`
- [ ] Add email input with validation
- [ ] Add password input with strength indicator
- [ ] Add confirm password input
- [ ] Add name input (optional)
- [ ] Show registration errors
- [ ] Handle success (redirect to verify OTP)
- [ ] Add loading state during registration

**Status:** ⏳ NOT STARTED

### Auth Components - Login
- [ ] Create LoginForm component
  - File: `apps/frontend/src/components/features/auth/LoginForm.tsx`
- [ ] Add email input
- [ ] Add password input with show/hide
- [ ] Add "remember me" checkbox
- [ ] Show login errors
- [ ] Handle success (store tokens, redirect to dashboard)
- [ ] Add loading state during login
- [ ] Add "forgot password" link (future)

**Status:** ⏳ NOT STARTED

### Auth Components - OTP Verification
- [ ] Create VerifyOTP component
  - File: `apps/frontend/src/components/features/auth/VerifyOTP.tsx`
- [ ] Add OTP input (6 digits)
- [ ] Auto-focus OTP input fields
- [ ] Show OTP expiry countdown
- [ ] Add "resend OTP" button (with cooldown)
- [ ] Show verification errors
- [ ] Handle success (redirect to login)
- [ ] Add loading state

**Status:** ⏳ NOT STARTED

### Auth State Management
- [ ] Create AuthContext
  - File: `apps/frontend/src/context/AuthContext.tsx`
- [ ] Store user data
- [ ] Store access token
- [ ] Store refresh token
- [ ] Add login method
- [ ] Add logout method
- [ ] Add register method
- [ ] Add refresh token method
- [ ] Add loading and error states

**Status:** ⏳ NOT STARTED

### Auth Hooks
- [ ] Create useAuth hook
  - File: `apps/frontend/src/hooks/useAuth.ts`
- [ ] Expose auth state and methods
- [ ] Handle auto token refresh
- [ ] Handle token expiry

**Status:** ⏳ NOT STARTED

### Protected Routes
- [ ] Create ProtectedRoute component
  - File: `apps/frontend/src/components/shared/ProtectedRoute.tsx`
- [ ] Check if user is authenticated
- [ ] Redirect to login if not authenticated
- [ ] Show loading state while checking auth
- [ ] Pass user data to children

**Status:** ⏳ NOT STARTED

### Token Management
- [ ] Implement token storage strategy
  - Decision needed: localStorage vs httpOnly cookies
- [ ] Add token refresh logic
  - Refresh 1 minute before expiry
- [ ] Handle token refresh failures
  - Logout on refresh failure
- [ ] Clear tokens on logout
- [ ] Handle logout across tabs
  - Use storage event listener

**Status:** ⏳ NOT STARTED

### Routing
- [ ] Configure React Router routes
- [ ] Add /login route
- [ ] Add /register route
- [ ] Add /verify-otp route
- [ ] Add /dashboard route (protected)
- [ ] Add /profile route (protected)
- [ ] Redirect to login if not authenticated

**Status:** ⏳ NOT STARTED

## Phase 7: Testing ⏳ NOT STARTED

### Unit Tests - Services
- [ ] Test AuthService.registerUser()
  - Test: Successful registration
  - Test: Duplicate email
  - Test: Weak password
  - Test: OTP generation
- [ ] Test AuthService.verifyEmail()
  - Test: Valid OTP
  - Test: Invalid OTP
  - Test: Expired OTP
  - Test: Already verified
- [ ] Test AuthService.loginUser()
  - Test: Valid credentials
  - Test: Invalid credentials
  - Test: Inactive user
  - Test: Device tracking
- [ ] Test AuthService.refreshToken()
  - Test: Valid refresh token
  - Test: Invalid refresh token
  - Test: Token rotation
- [ ] Test AuthService.logoutUser()
  - Test: Successful logout
  - Test: Token deletion from Redis
- [ ] Test TokenUtil functions
- [ ] Test PasswordUtil functions
- [ ] Test OTPUtil functions
- [ ] Test BrevoService (mocked)

**Status:** ⏳ NOT STARTED
**Target:** 80%+ code coverage

### Integration Tests - API Endpoints
- [ ] Test POST /api/auth/register
  - Test: Valid registration → 201
  - Test: Duplicate email → 409
  - Test: Weak password → 400
  - Test: Missing fields → 400
- [ ] Test POST /api/auth/login
  - Test: Valid credentials → 200
  - Test: Invalid credentials → 401
  - Test: Inactive user → 401
  - Test: Missing fields → 400
- [ ] Test POST /api/auth/verify-email
  - Test: Valid OTP → 200
  - Test: Invalid OTP → 400
  - Test: Expired OTP → 400
- [ ] Test POST /api/auth/refresh-token
  - Test: Valid refresh token → 200
  - Test: Invalid refresh token → 401
- [ ] Test POST /api/auth/logout (protected)
  - Test: Valid token → 200
  - Test: Invalid token → 401
- [ ] Test POST /api/auth/logout-all (protected)
  - Test: Valid token → 200
  - Test: Verify all tokens invalidated
- [ ] Test rate limiting
  - Test: Requests blocked after limit

**Status:** ⏳ NOT STARTED
**Tool:** Vitest + Supertest

### E2E Tests - Auth Flows
- [ ] Test complete registration flow
  - Register → Verify email → Can login
- [ ] Test complete login flow
  - Login → Tokens stored → Can access protected route
- [ ] Test token refresh flow
  - Access token expires → Auto refresh → New token stored
- [ ] Test logout flow
  - Logout → Tokens cleared → Redirected to login
- [ ] Test logout all flow
  - Logout all → All devices logged out
- [ ] Test OTP expiry flow
  - OTP expires → Resend → New OTP works

**Status:** ⏳ NOT STARTED
**Tool:** Playwright or Cypress

## Phase 8: Documentation & Deployment ⏳ NOT STARTED

### API Documentation
- [ ] Install Swagger/OpenAPI dependencies
  - `swagger-ui-express`, `swagger-jsdoc`
- [ ] Create API documentation
  - Document all auth endpoints
  - Add request/response examples
  - Add authentication notes
- [ ] Generate OpenAPI spec
- [ ] Test Swagger UI

**Status:** ⏳ NOT STARTED

### Environment Documentation
- [ ] Update .env.example with auth variables
  - JWT_ACCESS_SECRET
  - JWT_REFRESH_SECRET
  - BREVO_API_KEY
  - REDIS_URL
  - DATABASE_URL
- [ ] Create environment setup guide
  - Step-by-step .env configuration
  - How to generate JWT secrets
  - How to get Brevo API key
- [ ] Add secrets to production deployment guide

**Status:** ⏳ NOT STARTED

### Setup Guides
- [ ] Create backend setup guide
  - Dependencies installation
  - Database setup and migration
  - Redis setup
  - Environment configuration
  - Running the server
- [ ] Create frontend setup guide
  - Dependencies installation
  - Environment configuration
  - Running the app
- [ ] Update main README.md
  - Add authentication section
  - Link to setup guides

**Status:** ⏳ NOT STARTED

### Deployment Guide
- [ ] Create deployment checklist
- [ ] Document environment variables for production
- [ ] Add database migration steps
- [ ] Add Redis setup steps
- [ ] Add Brevo configuration
- [ ] Add CORS configuration
- [ ] Add HTTPS setup
- [ ] Add monitoring setup (Sentry)

**Status:** ⏳ NOT STARTED

### Code Cleanup
- [ ] Remove console.log statements (or disable in production)
- [ ] Remove TODO comments
- [ ] Add JSDoc comments to public methods
- [ ] Ensure no TypeScript errors
- [ ] Ensure no ESLint warnings
- [ ] Run Prettier on all files
- [ ] Add gitignore patterns for .env, logs

**Status:** ⏳ NOT STARTED

## Phase 9: Security & Monitoring ⏳ NOT STARTED

### Security Hardening
- [ ] Add Helmet.js for security headers
- [ ] Configure CORS properly
- [ ] Add CSRF protection (if using cookies)
- [ ] Implement account lockout after failed logins
  - Lock after 5 failed attempts
  - Unlock after 30 minutes
- [ ] Add security HTTP headers
  - X-Content-Type-Options
  - X-Frame-Options
  - Strict-Transport-Security
- [ ] Run npm audit
  - Fix all vulnerabilities
- [ ] Run SAST scan (semgrep, sonarqube)

**Status:** ⏳ NOT STARTED

### Monitoring & Logging
- [ ] Set up Sentry for error tracking
- [ ] Add logging for auth events
  - Logins (success and failure)
  - Registrations
  - Password changes
  - Suspicious activity
- [ ] Add metrics monitoring
  - Response times
  - Error rates
  - Email delivery rates
- [ ] Set up alerts
  - High failure rate
  - Email delivery failures
  - Unusual login patterns

**Status:** ⏳ NOT STARTED

### Performance Testing
- [ ] Load test auth endpoints
  - 100 concurrent logins
  - 1000 concurrent logins
  - Measure response times
- [ ] Test Redis performance
  - Token read/write latency
  - OTP storage/retrieval latency
- [ ] Test database performance
  - User query performance
  - Device query performance
  - Add indexes if needed
- [ ] Optimize bottlenecks
  - Add caching where appropriate
  - Optimize database queries

**Status:** ⏳ NOT STARTED

## Quick Resume

### Current Focus (Next Session)

**Priority 1 - Email Service:**
1. Complete Brevo API integration
2. Create HTML email templates
3. Test email delivery end-to-end

**Priority 2 - Middleware:**
1. Complete auth middleware (JWT validation)
2. Add validation schemas with Zod
3. Configure rate limiting

**Priority 3 - Routes:**
1. Add all routes to route files
2. Register in main router
3. Test with curl/Postman

### Completed This Session

- ✅ Created all dev doc files (plan, context, tasks)
- ✅ Analyzed current auth system state
- ✅ Identified what's complete vs in progress
- ✅ Prioritized remaining work

### Next Session Checklist

**Before coding:**
- [ ] Read this tasks file
- [ ] Review context.md for current state
- [ ] Check plan.md for overall strategy

**During coding:**
- [ ] Check off tasks as completed
- [ ] Update context.md SESSION PROGRESS
- [ ] Note any new tasks discovered

**After session:**
- [ ] Update context.md with what was done
- [ ] Check off completed tasks
- [ ] Add any new tasks discovered

---

**Task Completion:** ~35% complete
**Estimated Remaining:** 20-30 hours
**Last Updated:** 2026-01-13
**Next Milestone:** Complete email service and middleware (Phase 4-5)
