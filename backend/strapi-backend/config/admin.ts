export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Настройка dev-сервера админ-панели
  // Убеждаемся, что админ-панель не пытается использовать порт 5173
  url: env('ADMIN_URL', env('PUBLIC_URL', 'http://localhost:1337')),
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
});
