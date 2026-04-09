# Security Test Plan

This checklist supports release testing. It is not a replacement for an independent penetration test.

## Automated checks

```bash
npm test
npm audit --omit=dev --audit-level=high
```

## Manual abuse checks

- Login endpoints return `429` after the configured rate limit.
- Tracking endpoint returns `429` after the configured rate limit.
- Expired access tokens return `401`.
- `/api/auth/refresh` rotates the refresh cookie and invalidates the previous refresh token.
- `/api/auth/logout` clears the refresh cookie and revokes the refresh token.
- Dashboard endpoints reject booth tokens with `403`.
- Commissionerate users cannot fetch complaints from another commissionerate.
- Dashboard detail endpoint rejects malformed Mongo ObjectId values with `400`.
- Complaint submission rejects payloads with unexpected extra properties.
- Complaint submission rejects missing declaration and malformed mobile values.
- Security headers include CSP, HSTS, frame denial, nosniff, referrer policy and permissions policy.

## Required external test before public launch

Schedule an independent penetration test covering authentication, authorization, session fixation,
XSS, CSRF, NoSQL injection, rate-limit bypass, IDOR, logging/redaction, backup restore and incident response.
