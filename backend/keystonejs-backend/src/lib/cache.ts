/**
 * Утилиты для кеширования с Redis и fallback на in-memory
 */
import { getRedisClientWithFallback } from './redis';
import logger from './logger';

// In-memory fallback для development
const memoryCache = new Map<string, { value: any; expires: number }>();

export async function getCache(key: string): Promise<any | null> {
  const redis = await getRedisClientWithFallback();
  
  if (redis) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  } else {
    // Fallback на memory
    const cached = memoryCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
    memoryCache.delete(key);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 3600
): Promise<void> {
  const redis = await getRedisClientWithFallback();
  
  if (redis) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  } else {
    // Fallback на memory
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }
}

export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClientWithFallback();
  
  if (redis) {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Redis delete error:', error);
    }
  } else {
    memoryCache.delete(key);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = await getRedisClientWithFallback();
  
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Redis delete pattern error:', error);
    }
  } else {
    // Fallback: удаляем из memory cache по паттерну
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }
}

// Очистка expired entries из memory cache
setInterval(() => {
  const now = Date.now();
  for (const [key, cached] of memoryCache.entries()) {
    if (cached.expires <= now) {
      memoryCache.delete(key);
    }
  }
}, 60000); // Каждую минуту

