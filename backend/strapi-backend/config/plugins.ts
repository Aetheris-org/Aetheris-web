export default ({ env }) => ({
    'users-permissions': {
      config: {
        jwt: {
          // SECURITY: Короткий access token (15 минут)
          // Refresh token механизм будет реализован отдельно
          expiresIn: '15m',
        },
        providers: {
          google: {
            enabled: true,
            key: env('GOOGLE_CLIENT_ID'),
            secret: env('GOOGLE_CLIENT_SECRET'),
            callback: env('GOOGLE_CALLBACK_URL', 'http://localhost:1337/api/connect/google/callback'),
            scope: ['email', 'profile'],
          },
        },
      },
    },
  });