export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    // Security headers middleware (Koa-compatible)
    strapi.server.use(async (ctx, next) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';

      // Content Security Policy
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data: https://fonts.gstatic.com",
        `connect-src 'self' ${frontendUrl} ${publicUrl} https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com`,
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self' https://accounts.google.com",
        "object-src 'none'",
        "frame-src 'self' https://accounts.google.com",
      ].join('; ');

      ctx.set('Content-Security-Policy', csp);

      // HSTS (только в production)
      if (process.env.NODE_ENV === 'production') {
        ctx.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      // Security headers
      ctx.set('X-Frame-Options', 'DENY');
      ctx.set('X-Content-Type-Options', 'nosniff');
      ctx.set('X-XSS-Protection', '1; mode=block');
      ctx.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      ctx.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');
      ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
      
      // ВАЖНО: Cross-Origin-Embedder-Policy: require-corp может блокировать изображения
      // Отключаем его для статических файлов (uploads) чтобы изображения могли загружаться
      if (ctx.path.startsWith('/uploads/')) {
        // Для статических файлов необходимо разрешить встраивание с фронтенда (другой origin)
        ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
        // Также добавляем Cache-Control для изображений
        ctx.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // Для HTML страниц используем строгие политики только в production
        if (process.env.NODE_ENV === 'production') {
      ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
        }
      ctx.set('Cross-Origin-Resource-Policy', 'same-origin');
      }

      await next();
    });

    console.log('✅ Security headers middleware registered (Koa-compatible)');

    // Rate Limiting (защита от brute-force и DDoS)
    const rateLimit = require('koa-ratelimit');

    // Global rate limiting (500 requests/minute per IP)
    strapi.server.use(
      rateLimit({
        driver: 'memory',
        db: new Map(),
        duration: 60000, // 1 minute
        max: 500, // 500 requests per minute
        errorMessage: 'Too many requests. Please try again later.',
        id: (ctx) => ctx.ip || ctx.request.ip || 'unknown',
        headers: {
          remaining: 'Rate-Limit-Remaining',
          reset: 'Rate-Limit-Reset',
          total: 'Rate-Limit-Total',
        },
        disableHeader: false,
      })
    );

    console.log('✅ Rate limiting middleware registered (memory only)');

    // CSRF Protection (защита от Cross-Site Request Forgery)
    const { csrfTokenService } = require('./services/csrf-token');

    strapi.server.use(async (ctx, next) => {
      // Проверяем только небезопасные методы (POST, PUT, DELETE, PATCH)
      const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      if (!unsafeMethods.includes(ctx.method)) {
        await next();
        return;
      }

      // Пропускаем некоторые пути (OAuth, CSRF endpoint, Admin panel)
      const skipPaths = [
        '/api/connect/',           // OAuth endpoints
        '/api/auth/refresh',       // Refresh token (защищён HttpOnly cookie)
        '/api/auth/csrf',          // CSRF token endpoint
        '/api/auth/logout',        // Logout endpoint
        '/admin',                  // Strapi admin panel (свои проверки)
        '/content-manager',        // Admin content manager
        '/upload',                 // Admin file upload
        '/users-permissions',      // Admin users & permissions management
        '/i18n',                   // Admin i18n
        '/content-type-builder',   // Admin content type builder
      ];

      const shouldSkip = skipPaths.some(path => ctx.path.startsWith(path));
      if (shouldSkip) {
        await next();
        return;
      }

      // Получаем CSRF token из заголовка
      const csrfToken = ctx.get('X-CSRF-Token') || ctx.get('x-csrf-token');

      if (!csrfToken) {
        console.warn(`⚠️  CSRF validation failed: missing token for ${ctx.method} ${ctx.path}`);
        return ctx.forbidden('CSRF token is missing. Please include X-CSRF-Token header.');
      }

      // Валидируем CSRF token
      const ip = ctx.ip || ctx.request.ip || 'unknown';
      const isValid = await csrfTokenService.validate(csrfToken, ip);

      if (!isValid) {
        console.warn(`⚠️  CSRF validation failed: invalid token for ${ctx.method} ${ctx.path}`);
        return ctx.forbidden('Invalid CSRF token.');
      }

      await next();
    });

    console.log('✅ CSRF protection middleware registered');
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Permissions настраиваются вручную через Strapi Admin Panel:
    // Settings → Users & Permissions → Roles
    // http://localhost:1337/admin/settings/users-permissions/roles
    console.log('✅ Strapi started. Configure permissions manually in Admin Panel.');
  },
};
