/**
 * Middleware для установки JWT токена в cookie после успешной авторизации
 * Работает с OAuth callback и обычной авторизацией
 */
export default (config, { strapi }) => {
  return async (ctx, next) => {
    await next();

    // Устанавливаем JWT в cookie только для успешных OAuth callback и login запросов
    const isOAuthCallback = ctx.url.includes('/api/auth/google/callback') || 
                            ctx.url.includes('/api/connect/google/callback') ||
                            ctx.url.includes('/connect/google/callback');
    const isLogin = ctx.url.includes('/api/auth/local') && ctx.method === 'POST';
    
    if ((isOAuthCallback || isLogin) && ctx.status === 200 && ctx.body?.jwt) {
      const jwt = ctx.body.jwt;
      const isProduction = process.env.NODE_ENV === 'production';

      // Устанавливаем токен в secure httpOnly cookie - защита от XSS
      // Фронтенд получает токен через Authorization header, а не через document.cookie
      ctx.cookies.set('accessToken', jwt, {
        httpOnly: true, // JavaScript не может прочитать - защита от XSS
        secure: isProduction, // HTTPS только в продакшене
        sameSite: 'lax', // Защита от CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        path: '/',
      });

      // Также устанавливаем jwtToken для обратной совместимости
      ctx.cookies.set('jwtToken', jwt, {
        httpOnly: true, // Защита от XSS
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
  };
};

