# ⚠️ Rate Limiting Disabled Temporarily

The global rate limiting middleware in `src/index.ts` has been **commented out** to allow unrestricted access to the Strapi admin panel during local testing.

- Disable date: 2025-11-09
- Reason: Admin UI kept hitting the in-memory rate limiter while we diagnose OAuth/auth flows.

## What to do later

1. Re-enable the middleware in `src/index.ts` (look for the warning log `Rate limiting middleware temporarily disabled`).
2. Consider lowering limits instead of full removal if the problem was too aggressive throttling:
   ```ts
   strapi.server.use(rateLimit({
     driver: 'memory',
     db: new Map(),
     duration: 60_000,
     max: 500,
     ...
   }))
   ```
3. If you keep rate limits disabled, document the decision in `SECURITY_IMPLEMENTATION_STATUS.md` so it isn’t forgotten.

> 🛡️ **Important:** before deploying anywhere beyond local dev, restore the rate limiting to prevent brute-force attempts.


