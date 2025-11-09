/**
 * Session Store Service
 * Хранит OAuth state tokens и user sessions
 * Использует Redis если доступен, иначе fallback на in-memory Map
 */

import Redis from 'ioredis';

interface SessionData {
  userId?: number;
  createdAt: number;
  expiresAt: number;
  [key: string]: any;
}

class SessionStore {
  private redis: Redis | null = null;
  private memoryStore: Map<string, SessionData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeRedis();
    this.startCleanup();
  }

  private initializeRedis() {
    try {
      const redisHost = process.env.REDIS_HOST || 'localhost';
      const redisPort = parseInt(process.env.REDIS_PORT || '6379');
      const redisPassword = process.env.REDIS_PASSWORD;

      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword || undefined,
        retryStrategy: (times) => {
          // Попытки переподключения: 3 раза, затем fallback на memory
          if (times > 3) {
            console.warn('⚠️  Redis connection failed, falling back to in-memory storage');
            return null; // Прекратить попытки
          }
          return Math.min(times * 100, 2000);
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.redis.connect().catch(() => {
        console.warn('⚠️  Redis not available, using in-memory session storage');
        this.redis = null;
      });

      this.redis.on('error', (err) => {
        console.warn('Redis error:', err.message);
      });
    } catch (err) {
      console.warn('⚠️  Redis initialization failed, using in-memory session storage');
      this.redis = null;
    }
  }

  private startCleanup() {
    // Очистка expired sessions каждые 5 минут
    this.cleanupInterval = setInterval(() => {
      if (!this.redis) {
        const now = Date.now();
        for (const [key, data] of Array.from(this.memoryStore.entries())) {
          if (data.expiresAt < now) {
            this.memoryStore.delete(key);
          }
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Сохранить OAuth state token
   * @param state - UUID state token
   * @param ttl - Time to live в секундах (default: 300 = 5 минут)
   */
  async saveOAuthState(state: string, ttl: number = 300): Promise<void> {
    const data: SessionData = {
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
    };

    if (this.redis) {
      await this.redis.set(`oauth:state:${state}`, JSON.stringify(data), 'EX', ttl);
    } else {
      this.memoryStore.set(`oauth:state:${state}`, data);
    }
  }

  /**
   * Проверить и удалить OAuth state token
   * @returns true если state валиден
   */
  async validateOAuthState(state: string): Promise<boolean> {
    if (this.redis) {
      const data = await this.redis.get(`oauth:state:${state}`);
      if (data) {
        await this.redis.del(`oauth:state:${state}`); // One-time use
        return true;
      }
      return false;
    } else {
      const key = `oauth:state:${state}`;
      const data = this.memoryStore.get(key);
      if (data && data.expiresAt > Date.now()) {
        this.memoryStore.delete(key); // One-time use
        return true;
      }
      return false;
    }
  }

  /**
   * Сохранить user session
   * @param sessionId - Session ID (JWT или UUID)
   * @param userId - User ID
   * @param ttl - Time to live в секундах (default: 604800 = 7 дней)
   */
  async saveSession(sessionId: string, userId: number, ttl: number = 604800): Promise<void> {
    const data: SessionData = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
    };

    if (this.redis) {
      await this.redis.set(`session:${sessionId}`, JSON.stringify(data), 'EX', ttl);
    } else {
      this.memoryStore.set(`session:${sessionId}`, data);
    }
  }

  /**
   * Получить user session
   * @returns userId или null
   */
  async getSession(sessionId: string): Promise<number | null> {
    if (this.redis) {
      const data = await this.redis.get(`session:${sessionId}`);
      if (data) {
        const parsed: SessionData = JSON.parse(data);
        return parsed.userId || null;
      }
      return null;
    } else {
      const data = this.memoryStore.get(`session:${sessionId}`);
      if (data && data.expiresAt > Date.now()) {
        return data.userId || null;
      }
      return null;
    }
  }

  /**
   * Удалить session (logout)
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`session:${sessionId}`);
    } else {
      this.memoryStore.delete(`session:${sessionId}`);
    }
  }

  /**
   * Сохранить refresh token
   * @param refreshToken - Refresh token string
   * @param userId - User ID
   * @param ttl - Time to live в секундах (default: 604800 = 7 дней)
   */
  async saveRefreshToken(refreshToken: string, userId: number, ttl: number = 604800): Promise<void> {
    const data: SessionData = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttl * 1000,
    };

    if (this.redis) {
      await this.redis.set(`refresh:${refreshToken}`, JSON.stringify(data), 'EX', ttl);
    } else {
      this.memoryStore.set(`refresh:${refreshToken}`, data);
    }
  }

  /**
   * Проверить и получить userId по refresh token
   */
  async validateRefreshToken(refreshToken: string): Promise<number | null> {
    if (this.redis) {
      const data = await this.redis.get(`refresh:${refreshToken}`);
      if (data) {
        const parsed: SessionData = JSON.parse(data);
        return parsed.userId || null;
      }
      return null;
    } else {
      const data = this.memoryStore.get(`refresh:${refreshToken}`);
      if (data && data.expiresAt > Date.now()) {
        return data.userId || null;
      }
      return null;
    }
  }

  /**
   * Удалить refresh token (logout или rotation)
   */
  async deleteRefreshToken(refreshToken: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`refresh:${refreshToken}`);
    } else {
      this.memoryStore.delete(`refresh:${refreshToken}`);
    }
  }

  /**
   * Generic get method for any key
   */
  async get(key: string): Promise<string | null> {
    if (this.redis) {
      return await this.redis.get(key);
    } else {
      const data = this.memoryStore.get(key);
      if (data && data.expiresAt > Date.now()) {
        // Return the full data as JSON string to match Redis behavior
        return JSON.stringify(data);
      }
      return null;
    }
  }

  /**
   * Generic set method for any key
   */
  async set(key: string, value: string, ttl: number): Promise<void> {
    if (this.redis) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      // For memory store, parse the value and add expiration
      const data: SessionData = {
        ...JSON.parse(value),
        expiresAt: Date.now() + ttl * 1000,
      };
      this.memoryStore.set(key, data);
    }
  }

  /**
   * Generic delete method for any key
   */
  async delete(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }

  /**
   * Cleanup при shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}

// Singleton instance
export const sessionStore = new SessionStore();

// Cleanup on process exit
process.on('SIGTERM', () => sessionStore.destroy());
process.on('SIGINT', () => sessionStore.destroy());

