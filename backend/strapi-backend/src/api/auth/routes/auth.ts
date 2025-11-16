export default {
  routes: [
    {
      method: 'GET',
      path: '/auth/csrf',
      handler: 'auth.csrf',
      config: {
        auth: false, // Публичный эндпоинт, не требует авторизации
      },
    },
    {
      method: 'POST',
      path: '/auth/logout',
      handler: 'auth.logout',
      config: {
        auth: {
          scope: [], // Требует авторизации, но без дополнительных прав
        },
      },
    },
    {
      method: 'GET',
      path: '/auth/google/callback',
      handler: 'oauth.googleCallback',
      config: {
        auth: false, // Публичный эндпоинт для OAuth callback
      },
    },
  ],
};

