/**
 * Strapi Middlewares Configuration
 * Порядок важен: middlewares выполняются сверху вниз
 */
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      hsts: process.env.NODE_ENV === 'production', // Включаем HSTS только в production
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Для Strapi admin
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'", 'https://oauth2.googleapis.com', 'https://www.googleapis.com', 'https://api.imgbb.com'],
        },
      },
      crossOriginEmbedderPolicy: false, // Отключаем для совместимости
    },
  },
  
  // Rate limiting (защита от brute-force)
  {
    name: 'global::rate-limit',
    config: {},
  },
  
  // CORS с строгими настройками
  {
    name: 'strapi::cors',
    config: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        process.env.PUBLIC_URL || 'http://localhost:1337',
      ],
      headers: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
        'x-require-auth',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  },

  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb', // 10MB max for form data (для загрузки изображений)
      jsonLimit: '5mb',
      textLimit: '5mb',
      multipart: true, // Включаем парсинг multipart/form-data
      formidable: {
        maxFileSize: 10 * 1024 * 1024, // 10MB max file size
        keepExtensions: true,
      },
    },
  },
  'strapi::session',
  {
    name: 'global::jwt-cookie',
    config: {},
  },
  'strapi::favicon',
  'strapi::public',
];
