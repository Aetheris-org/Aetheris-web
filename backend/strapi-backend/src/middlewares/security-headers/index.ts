import helmet from 'helmet';

/**
 * Security headers middleware using Helmet.js
 * Strapi v5 middleware factory pattern
 */
module.exports = (config, { strapi }) => {
  const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';
  const getPublicUrl = () => process.env.PUBLIC_URL || 'http://localhost:1337';

  return helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://accounts.google.com',
          'https://www.googletagmanager.com',
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdn.jsdelivr.net',
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          getFrontendUrl(),
          getPublicUrl(),
          'https://accounts.google.com',
          'https://oauth2.googleapis.com',
          'https://www.googleapis.com',
        ],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", 'https://accounts.google.com'],
        objectSrc: ["'none'"],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'", 'https:'],
        workerSrc: ["'self'", 'blob:'],
        frameSrc: ["'self'", 'https://accounts.google.com'],
        ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] }),
      },
    },
    strictTransportSecurity: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true, preload: true }
      : false,
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hidePoweredBy: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
  });
};
