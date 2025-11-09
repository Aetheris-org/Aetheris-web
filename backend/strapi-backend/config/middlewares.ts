/**
 * Strapi Middlewares Configuration
 * Порядок важен: middlewares выполняются сверху вниз
 */
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security', // REQUIRED by Strapi v5
  
  // CORS с строгими настройками
  {
    name: 'strapi::cors',
    config: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5174',
        'http://localhost:5173', // Старый порт для совместимости
        'http://localhost:5174', // Новый порт React приложения
        process.env.PUBLIC_URL || 'http://localhost:1337',
      ],
      headers: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-Requested-With',
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
      formLimit: '5mb', // 5MB max for form data
      jsonLimit: '5mb',
      textLimit: '5mb',
      formidable: {
        maxFileSize: 5 * 1024 * 1024, // 5MB max file size
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
