# ADR 002: JWT Authentication Strategy

## Status
Accepted

## Context
The Finishd Platform needs a secure, scalable authentication system that supports multiple devices and token refresh.

## Decision
Implement **JWT (JSON Web Token)** based authentication:
- **Access tokens**: 15-minute expiry for API access
- **Refresh tokens**: 7-day expiry for token renewal
- **Device management**: Track and revoke devices

## Benefits
- Stateless authentication (no server-side sessions)
- Mobile-friendly (works across platforms)
- Secure (short-lived access tokens)
- Revocable (device tracking + token refresh)

## Consequences
- Token storage must be secure (httpOnly cookies recommended)
- Requires token refresh mechanism
- Device management adds complexity

## Alternatives Considered
- **Session-based auth**: Requires server-side session store, less mobile-friendly
- **OAuth 2.0**: Overkill for current needs (no third-party integrations yet)

---

## Date
January 12, 2026
