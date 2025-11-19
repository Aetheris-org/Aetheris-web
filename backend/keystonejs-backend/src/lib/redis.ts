/**
 * Redis client с fallback на in-memory storage
 * Используется для кеширования и сессий
 */
import Redis from 'ioredis';
import logger from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  redisClient = new Redis({
    host,
    port,
    password,
    retryStrategy: (times) => {
      // Останавливаем попытки после 3 неудач
      if (times > 3) {
        logger.warn('Redis connection failed after 3 attempts, using in-memory fallback');
        return null; // Останавливаем попытки
      }
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    connectTimeout: 2000, // Таймаут подключения 2 секунды
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis client connected');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis client error:', error);
  });

  redisClient.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis reconnecting...');
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    await redisClient?.quit();
  });

  process.on('SIGINT', async () => {
    await redisClient?.quit();
  });

  return redisClient;
}

// Fallback для development (если Redis недоступен)
export async function getRedisClientWithFallback(): Promise<Redis | null> {
  try {
    const client = getRedisClient();
    await client.ping();
    return client;
  } catch (error) {
    logger.warn('⚠️ Redis unavailable, using in-memory fallback');
    return null;
  }
}

