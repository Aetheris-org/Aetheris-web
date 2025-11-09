# Security Documentation

## Overview

This application implements industry-standard security measures to protect user data and prevent common attack vectors. All security implementations follow OWASP guidelines and best practices.

## 🔒 Security Measures Implemented

### 1. Authentication Security

#### OAuth2 with CSRF Protection
- **State Parameter Validation**: UUID-based state tokens prevent CSRF attacks on OAuth flow
- **Session-Based Storage**: OAuth states stored in Redis with 5-minute TTL
- **Email Hashing**: User emails hashed with HMAC-SHA256 (GDPR/CCPA compliant)
- **Short JWT Expiry**: Access tokens expire after 15 minutes (configurable)
- **Secure Token Storage**: JWT tokens in localStorage (upgrade to HttpOnly cookies recommended)

#### Password Security
- No password authentication (OAuth-only by design)
- No password storage in database
- Google OAuth2 handles all credential verification

### 2. API Security

#### Rate Limiting
Comprehensive per-endpoint rate limits prevent brute force and DDoS attacks:

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| OAuth (`/api/connect/*`) | 3 requests | 5 minutes |
| Auth (`/api/auth/*`) | 5 requests | 1 minute |
| User Read (`/api/users/me`) | 20 requests | 1 minute |
| User Update (`PUT /api/users/me`) | 10 requests | 1 minute |
| General API | 100 requests | 1 minute |
| Admin API | 50 requests | 1 minute |
| Global (all endpoints) | 500 requests | 1 minute |

Rate limits are tracked per IP address for unauthenticated requests and per user ID for authenticated requests.

#### Security Headers
Implemented via Helmet.js with strict configuration:

**Content Security Policy (CSP)**:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: https: blob:
connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com
frame-ancestors 'none'
```

**Additional Headers**:
- `Strict-Transport-Security`: HTTPS enforcement (production only)
- `X-Frame-Options: DENY`: Prevents clickjacking
- `X-Content-Type-Options: nosniff`: Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer information
- `Permissions-Policy`: Disables unnecessary browser APIs (geolocation, camera, etc.)
- `Cross-Origin-*` policies: Restricts cross-origin resource sharing

### 3. Session Management

#### Redis-Backed Sessions
- OAuth state tokens stored with 5-minute expiry
- User sessions tracked (7-day expiry, configurable)
- Refresh tokens supported (implementation in progress)
- Automatic cleanup of expired sessions

#### Fallback to In-Memory
If Redis is unavailable, gracefully falls back to in-memory storage with automatic cleanup.

### 4. Input Validation

#### Username Validation
- Length: 3-24 characters
- Allowed characters: alphanumeric, hyphens, underscores
- Server-side validation enforced
- Unique username check

#### Email Processing
- Normalization: lowercase + trim
- HMAC-SHA256 hashing with pepper
- No storage of plaintext emails
- GDPR/CCPA compliant

### 5. Logout Security

#### Multi-Layer Cleanup
- Cancels all pending HTTP requests (AbortController)
- Clears localStorage and sessionStorage
- Resets application state
- Broadcasts logout to other tabs (storage event)
- Automatic logout on 401 responses

#### Multi-Tab Synchronization
- Logout in one tab triggers logout in all tabs
- Uses localStorage events for cross-tab communication

### 6. Data Privacy

#### GDPR/CCPA Compliance
- **No Email Storage**: Only HMAC-SHA256 hash stored
- **Pepper-Based Hashing**: Uses `EMAIL_HASH_SECRET` environment variable
- **Production Validation**: Application refuses to start without `EMAIL_HASH_SECRET` in production
- **Temporary Usernames**: New users get `user_{timestamp}` until they set nickname
- **No Hash Exposure**: UI never displays email hashes

## 🚨 Security Checklist

### Development Environment
- [ ] Copy `env.example` to `.env`
- [ ] Generate all secrets using secure random generators
- [ ] Never commit `.env` files to version control
- [ ] Use `http://localhost` for local development

### Production Environment
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `EMAIL_HASH_SECRET` (64 character hex)
- [ ] Enable HTTPS and set `PUBLIC_URL` with https://
- [ ] Configure Redis for production use
- [ ] Set up proper CORS origins (no wildcards)
- [ ] Enable all security headers
- [ ] Review and adjust rate limits for expected traffic
- [ ] Set up monitoring for 401/403 responses
- [ ] Implement refresh token rotation
- [ ] Consider HttpOnly cookies for JWT storage

## 🛠️ Security Configuration

### Required Environment Variables

```bash
# Critical Security Keys
EMAIL_HASH_SECRET=<64-char hex string>  # REQUIRED in production
SESSION_SECRET=<32-char hex string>     # For future session encryption
APP_KEYS=<base64 strings>               # Strapi encryption keys
JWT_SECRET=<random string>              # JWT signing key

# OAuth Configuration
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/connect/google/callback

# URLs
PUBLIC_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Redis (recommended for production)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>
```

### Generating Secrets

```bash
# EMAIL_HASH_SECRET (64-char hex)
openssl rand -hex 64

# SESSION_SECRET (32-char hex)
openssl rand -hex 32

# APP_KEYS (base64)
openssl rand -base64 32
```

## 🔍 Security Monitoring

### What to Monitor
- **Rate limit hits**: High rate of 429 responses indicates attack attempt
- **401 responses**: Failed authentication attempts
- **OAuth state failures**: Potential CSRF attack attempts
- **Session expiry patterns**: Unusual session behavior
- **Failed email hash validations**: Configuration issues

### Logging
Security-relevant events are logged with `console.log` / `console.error`:
- OAuth flow initiation and completion
- State token generation and validation
- User creation and updates
- Rate limit violations (logged by koa-ratelimit)
- Authentication failures

## ⚠️ Known Limitations

### Current Implementation
1. **JWT in URL**: OAuth callback still passes JWT via URL query parameter
   - **Risk**: Token exposure in browser history and server logs
   - **Mitigation**: Short 15-minute expiry limits damage
   - **Recommended**: Migrate to HttpOnly cookie (planned)

2. **localStorage JWT**: Access token stored in localStorage
   - **Risk**: Vulnerable to XSS attacks
   - **Mitigation**: Strict CSP policy prevents most XSS
   - **Recommended**: Move to memory-only storage with refresh tokens

3. **No Refresh Token Rotation**: Refresh tokens not yet implemented
   - **Impact**: Users must re-login every 15 minutes
   - **Status**: Implementation in progress

4. **In-Memory Session Fallback**: Without Redis, sessions not shared across instances
   - **Impact**: Load balancing requires sticky sessions
   - **Recommendation**: Use Redis in production

### Future Enhancements
- [ ] Implement refresh token endpoint with rotation
- [ ] Move JWT to HttpOnly cookies
- [ ] Add CSRF tokens for all mutations
- [ ] Implement session management dashboard
- [ ] Add 2FA support (optional)
- [ ] Implement device fingerprinting
- [ ] Add IP-based anomaly detection

## 📚 Security Resources

### Standards & Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)

### Dependencies
- [Helmet.js](https://helmetjs.github.io/) - Security headers
- [koa-ratelimit](https://github.com/koajs/ratelimit) - Rate limiting
- [ioredis](https://github.com/luin/ioredis) - Redis client
- [uuid](https://github.com/uuidjs/uuid) - State token generation

## 🐛 Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com (replace with actual email).

**Do NOT open public GitHub issues for security vulnerabilities.**

## 📝 Security Audit Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-04 | 1.0.0 | Initial security implementation |

---

**Last Updated**: 2025-11-04  
**Security Level**: Production-Ready (with noted limitations)  
**Next Review Date**: 2025-12-04 (monthly reviews recommended)

