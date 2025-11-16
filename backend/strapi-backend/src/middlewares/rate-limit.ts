/**
 * Rate limiting middleware для защиты от brute-force атак
 * Использует koa-ratelimit для ограничения количества запросов
 */
import RateLimit from 'koa-ratelimit';

export default (config, { strapi }) => {
  // Для OAuth endpoints - более строгий лимит (защита от brute-force)
  const oauthRateLimit = RateLimit({
    driver: 'memory', // В production используйте Redis
    db: new Map(),
    duration: 15 * 60 * 1000, // 15 минут
    max: 5, // Максимум 5 попыток за 15 минут для OAuth
    id: (ctx) => {
      // Идентифицируем по IP + user-agent для OAuth endpoints
      if (ctx.url.includes('/api/connect/') || ctx.url.includes('/api/auth/')) {
        return `${ctx.ip}-${ctx.headers['user-agent']}`;
      }
      return ctx.ip;
    },
    errorMessage: 'Too many requests, please try again later.',
    headers: {
      remaining: 'X-RateLimit-Remaining',
      reset: 'X-RateLimit-Reset',
      total: 'X-RateLimit-Total',
    },
  });

  // Для остальных API endpoints - стандартный лимит
  const apiRateLimit = RateLimit({
    driver: 'memory',
    db: new Map(),
    duration: 1 * 60 * 1000, // 1 минута
    max: 100, // 100 запросов в минуту
    id: (ctx) => ctx.ip,
    errorMessage: 'Too many requests, please try again later.',
    headers: {
      remaining: 'X-RateLimit-Remaining',
      reset: 'X-RateLimit-Reset',
      total: 'X-RateLimit-Total',
    },
  });

  return async (ctx, next) => {
    // Применяем более строгий лимит для OAuth и auth endpoints
    if (ctx.url.includes('/api/connect/') || ctx.url.includes('/api/auth/')) {
      return oauthRateLimit(ctx, next);
    }
    
    // Стандартный лимит для остальных API endpoints
    if (ctx.url.startsWith('/api/')) {
      return apiRateLimit(ctx, next);
    }
    
    await next();
  };
};

