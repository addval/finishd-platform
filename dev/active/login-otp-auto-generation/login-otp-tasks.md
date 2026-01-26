# Login OTP Auto-Generation - Implementation Tasks

## Phase 1: Backend Enhancement

- [ ] Task 1.1: Read existing auth service code
  - [ ] Understand current signup flow (OTP generation)
  - [ ] Understand current login flow
  - [ ] Identify OTP generation logic to extract
- [ ] Task 1.2: Extract OTP generation to reusable function
  - [ ] Create `generateVerificationOTP()` utility function
  - [ ] Create `sendVerificationEmail()` utility function
  - [ ] Add proper error handling
- [ ] Task 1.3: Modify login service to check email verification
  - [ ] After password validation, check `user.emailVerified`
  - [ ] If false: call OTP generation and email sending
  - [ ] Ensure user object is returned with updated verification status
- [ ] Task 1.4: Test backend changes
  - [ ] Test login with verified user
  - [ ] Test login with unverified user
  - [ ] Verify OTP is generated and email is sent

## Phase 2: Integration Testing

- [ ] Task 2.1: Test complete signup → logout → login flow
  - [ ] Signup new account
  - [ ] Logout without verifying
  - [ ] Login again
  - [ ] Verify new OTP email received
  - [ ] Verify redirect to /verify-email
- [ ] Task 2.2: Test verified user login
  - [ ] Use existing verified account
  - [ ] Login
  - [ ] Verify correct redirect (dashboard/profile/permissions)
- [ ] Task 2.3: Edge case testing
  - [ ] Test with expired OTP
  - [ ] Test email service failure handling
  - [ ] Test concurrent login attempts

---

## Task Details

### Task 1.1: Read Existing Auth Service
**Description:** Understand how OTP generation currently works in signup
**Files:**
- `apps/backend/src/services/auth.service.ts`
**Estimated Complexity:** Low
**Dependencies:** None
**Notes:** Need to find where OTP is generated during signup to reuse that logic

### Task 1.2: Extract OTP Generation
**Description:** Create reusable functions for OTP generation and email sending
**Files:**
- `apps/backend/src/services/auth.service.ts` (or new util file)
**Estimated Complexity:** Medium
**Dependencies:** Task 1.1
**Notes:** Should extract existing logic, not rewrite from scratch

### Task 1.3: Modify Login Service
**Description:** Add OTP generation to login flow for unverified users
**Files:**
- `apps/backend/src/services/auth.service.ts`
**Estimated Complexity:** Medium
**Dependencies:** Task 1.2
**Notes:** Key condition: `if (!user.emailVerified)` then generate OTP

### Task 1.4: Backend Testing
**Description:** Test login with both verified and unverified users
**Files:**
- All modified files
**Estimated Complexity:** Low
**Dependencies:** Task 1.3
**Notes:** Use existing test accounts and create new ones

---

## Completion Checklist

### Phase 1
- [ ] All Phase 1 tasks complete
- [ ] Backend code tested
- [ ] Email sending verified

### Phase 2
- [ ] All Phase 2 tasks complete
- [ ] Complete flow tested manually
- [ ] Edge cases covered

### Overall
- [ ] Manual testing successful
- [ ] Email service working correctly
- [ ] No duplicate code
- [ ] Error handling in place
