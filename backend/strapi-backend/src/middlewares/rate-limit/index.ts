import rateLimit from 'koa-ratelimit';
import Redis from 'ioredis';

/**
 * Global rate limiting middleware
 * Strapi v5 middleware factory pattern
 */
module.exports = (config, { strapi }) => {
  let redis = null;

  try {
    if (process.env.REDIS_HOST) {
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: () => null,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      redis.connect().catch(() => {
        console.warn('⚠️  Redis connection failed, using in-memory rate limiting');
        redis = null;
      });
    }
  } catch (error) {
    console.warn('⚠️  Redis initialization failed, using in-memory rate limiting');
    redis = null;
  }

  return rateLimit({
    driver: redis ? 'redis' : 'memory',
    db: redis || new Map(),
    duration: 60000,
    max: 500,
    errorMessage: 'Too many requests from this IP address. Please try again later.',
    id: (ctx) => ctx.ip || ctx.request.ip || 'unknown',
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total',
    },
    disableHeader: false,
  });
};
