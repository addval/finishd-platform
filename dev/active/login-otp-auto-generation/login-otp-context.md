# Login OTP Auto-Generation - Implementation Context

## Task Overview
Enhance login flow to automatically generate and send a new OTP when unverified users log in.

**Status:** Planning
**Last Updated:** 2025-01-14
**Current Phase:** Phase 1 - Backend Login Enhancement

---

## Session Progress

### Session 1 - 2025-01-14
**Focus:** Understanding the issue and creating dev docs
**Progress:**
- Identified issue: Login doesn't send new OTP for unverified users
- Created dev docs structure
- Analyzed current login flow

**Blockers:** None

**Next Session:**
- [ ] Implement backend OTP generation in login service
- [ ] Test complete flow

---

## Key Decisions

### Decision 1: Auto-Generate OTP on Login
**Date:** 2025-01-14
**Decision:** Backend should automatically generate and send new OTP when unverified user logs in
**Rationale:** Better UX - user doesn't need to request new OTP manually
**Impact:** Affects login service, email service

### Decision 2: Reuse Existing OTP Logic
**Date:** 2025-01-14
**Decision:** Extract OTP generation to reusable function instead of duplicating code
**Rationale:** DRY principle, easier maintenance
**Impact:** Need to create utility function in auth service

---

## Important Files

### Backend Files
- `apps/backend/src/services/auth.service.ts` - Login logic, needs OTP generation
- `apps/backend/src/controllers/auth.controller.ts` - Login controller
- `apps/backend/src/utils/email.util.ts` - Email sending utility (likely exists)
- `apps/backend/src/models/User.ts` - User model with verification fields

### Frontend Files
- `apps/frontend/src/features/auth/pages/loginPage.tsx` - Already handles redirect correctly
- `apps/frontend/src/features/auth/pages/verifyEmail.tsx` - Verification page

---

## Technical Notes

### Current Login Flow
1. Frontend sends POST /auth/signin with email/password
2. Backend validates credentials
3. Backend returns user object
4. Frontend checks `user.emailVerified` flag
5. If false, redirects to /verify-email

### Missing Piece
Backend doesn't generate new OTP or send email when unverified user logs in.

### OTP Format
- 6-digit numeric code
- 15-minute expiration
- Stored in `emailVerificationCode` field
- Expiration in `emailVerificationCodeExpiresAt` field

---

## Dependencies

### External Dependencies
- None new

### Internal Dependencies
- Email service must be configured and working
- User model must have verification fields

---

## Testing Strategy

### Manual Testing
1. **Test Case 1**: Unverified Login
   - Signup new user
   - Logout without verifying
   - Login again
   - Expected: Receive new OTP email, redirected to verification page

2. **Test Case 2**: Verified Login
   - Signup and verify email
   - Logout
   - Login again
   - Expected: Go to appropriate next step (profile/permissions/dashboard)

3. **Test Case 3**: Expired OTP
   - Signup
   - Wait 15+ minutes for OTP to expire
   - Login
   - Expected: Receive fresh OTP email

---

## Open Questions

### Question 1: Should we resend OTP even if existing OTP is still valid?
**Status:** Open
**Resolution:** TBD - leaning towards always resending for consistency

---

## Next Steps

1. Read existing auth service to understand OTP generation
2. Implement OTP generation in login flow
3. Test complete flow
4. Verify email sending works
