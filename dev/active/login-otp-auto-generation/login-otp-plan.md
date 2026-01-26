# Login OTP Auto-Generation - Implementation Plan

## Issues Identified

### Issue 1: Login Doesn't Send OTP for Unverified Users
When an unverified user logs in, they're redirected to `/verify-email` but don't receive a new OTP email.

### Issue 2: Resend OTP Button Not Working
The resend OTP button on the verification page is not hitting the resend API.

---

## Current Implementation Analysis

### Existing OTP Generation (signup)
Located in `apps/backend/src/services/auth.service.ts` lines 77-100:
```typescript
const { code, expiresAt } = generateVerificationCodeWithExpiry(60)
const hashedCode = await hashOTP(code)
```

### Login Flow
Located in `apps/backend/src/services/auth.service.ts` lines 284-347:
- **MISSING**: Check for `emailVerified` status
- **MISSING**: Generate new OTP if not verified

---

## Implementation Plan

### Fix 1: Add OTP Generation to Login

**File**: `apps/backend/src/services/auth.service.ts`

**Location**: After line 308 (after password verification)

**Add**:
```typescript
// If email not verified, generate and send new OTP
if (!user.emailVerified) {
  const { code, expiresAt } = generateVerificationCodeWithExpiry(60)
  const hashedCode = await hashOTP(code)

  await user.update({
    emailVerificationCode: hashedCode,
    emailVerificationCodeExpiresAt: expiresAt,
  })

  // Send verification email
  await sendVerificationEmail(user.email, code)
    .catch((error) => {
      logger.error(`Failed to send verification email to ${user.email}:`, error)
    })
}
```

### Fix 2: Fix Resend OTP

**Files to Check**:
1. Frontend: `apps/frontend/src/features/auth/pages/verifyEmail.tsx` - Button click handler
2. Frontend: `apps/frontend/src/features/auth/services/auth.service.ts` - resendVerification function
3. Backend: `apps/backend/src/routes/auth.routes.ts` - Route definition
4. Backend: `apps/backend/src/services/auth.service.ts` - resendVerificationOTP function

**Likely Issues**:
- Wrong API path (missing /api prefix?)
- Function not called correctly
- Route not defined or wrong method

---

## Success Criteria

- [ ] Unverified user login receives new OTP email
- [ ] Resend OTP button works and sends new email
- [ ] Login succeeds even if email sending fails
- [ ] Verified users don't get unnecessary OTP emails

## Files to Modify

1. `apps/backend/src/services/auth.service.ts` - Add OTP generation in login
2. `apps/frontend/src/features/auth/pages/verifyEmail.tsx` - Check resend button
3. `apps/frontend/src/features/auth/services/auth.service.ts` - Check resend function
4. `apps/backend/src/routes/auth.routes.ts` - Check route exists
