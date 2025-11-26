/**
 * Client-side rate limiter для защиты от спама запросов
 * Использует sliding window алгоритм для отслеживания запросов
 * Сохраняет историю в localStorage для персистентности между перезагрузками
 */

import { logger } from './logger'

export type RequestType = 'mutation' | 'query' | 'comment' | 'login' | 'upload' | 'reaction' | 'follow' | 'bookmark' | 'article-mutation' | 'profile-update';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<RequestType, RateLimitConfig> = {
  mutation: {
    maxRequests: 3,
    windowMs: 5000, // 5 секунд
  },
  query: {
    maxRequests: 10,
    windowMs: 5000, // 5 секунд
  },
  comment: {
    maxRequests: 1,
    windowMs: 25000, // 25 секунд
  },
  login: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000, // 5 минут
  },
  upload: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 минута
  },
  reaction: {
    maxRequests: 3,
    windowMs: 5000, // 5 секунд - для реакций на статьи и комментарии
  },
  follow: {
    maxRequests: 2,
    windowMs: 5000, // 5 секунд - для подписок/отписок
  },
  bookmark: {
    maxRequests: 1,
    windowMs: 5000, // 5 секунд - для закладок
  },
  'article-mutation': {
    maxRequests: 1,
    windowMs: 60 * 1000, // 1 минута - для создания/обновления статей
  },
  'profile-update': {
    maxRequests: 1,
    windowMs: 10 * 1000, // 10 секунд - для обновления профиля
  },
};

const STORAGE_KEY = 'rateLimiter:history';

class RateLimiter {
  private requestHistory: Map<RequestType, number[]> = new Map();

  constructor() {
    // Восстанавливаем историю из localStorage при инициализации
    this.loadFromStorage();
  }

  /**
   * Загружает историю запросов из localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return; // SSR или localStorage недоступен
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as Record<string, number[]>;
      const now = Date.now();

      // Восстанавливаем историю и очищаем устаревшие записи
      for (const [type, timestamps] of Object.entries(parsed)) {
        // Проверяем, что тип существует в RATE_LIMITS (защита от старых/неправильных типов)
        if (type in RATE_LIMITS) {
          const config = RATE_LIMITS[type as RequestType];
          // Фильтруем только актуальные записи (в пределах окна времени)
          const validTimestamps = timestamps.filter(
            (timestamp) => now - timestamp < config.windowMs
          );
          
          if (validTimestamps.length > 0) {
            this.requestHistory.set(type as RequestType, validTimestamps);
          }
        } else {
          // Игнорируем неизвестные типы (старые типы, которые были удалены)
          logger.warn(`[RateLimiter] Ignoring unknown type in storage: ${type}`);
        }
      }
    } catch (error) {
      // Если ошибка при загрузке - очищаем localStorage и начинаем с чистого листа
      logger.warn('[RateLimiter] Failed to load from storage, clearing:', error);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // Игнорируем ошибки при очистке
      }
    }
  }

  /**
   * Сохраняет историю запросов в localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return; // SSR или localStorage недоступен
    }

    try {
      const toStore: Record<string, number[]> = {};
      this.requestHistory.forEach((timestamps, type) => {
        toStore[type] = timestamps;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      // Если ошибка при сохранении - просто игнорируем (не критично)
      logger.warn('[RateLimiter] Failed to save to storage:', error);
    }
  }

  /**
   * Проверяет, разрешен ли запрос данного типа (без добавления в историю)
   * @param type Тип запроса (mutation или query)
   * @returns Объект с информацией о разрешении и времени ожидания
   */
  checkLimit(type: RequestType): { allowed: boolean; waitTime?: number } {
    const config = RATE_LIMITS[type];
    if (!config) {
      // Если тип не найден в RATE_LIMITS, разрешаем запрос (fallback)
      logger.warn(`[RateLimiter] Unknown request type: ${type}, allowing request`);
      return { allowed: true };
    }
    
    const now = Date.now();
    
    // Получаем историю запросов для данного типа
    let history = this.requestHistory.get(type) || [];
    
    // Удаляем запросы, которые вышли за окно времени
    history = history.filter((timestamp) => now - timestamp < config.windowMs);
    
    // Проверяем, не превышен ли лимит
    if (history.length >= config.maxRequests) {
      // Вычисляем время до следующего разрешенного запроса
      const oldestRequest = history[0];
      const waitTime = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
      
      return {
        allowed: false,
        waitTime,
      };
    }
    
    // Запрос разрешен (но не добавляем в историю здесь - это делается в recordRequest)
    return { allowed: true };
  }

  /**
   * Записывает успешный запрос в историю
   * Вызывается только после успешного выполнения запроса
   * @param type Тип запроса
   */
  recordRequest(type: RequestType): void {
    const config = RATE_LIMITS[type];
    if (!config) {
      return; // Игнорируем неизвестные типы
    }
    
    const now = Date.now();
    
    // Получаем историю запросов для данного типа
    let history = this.requestHistory.get(type) || [];
    
    // Удаляем запросы, которые вышли за окно времени
    history = history.filter((timestamp) => now - timestamp < config.windowMs);
    
    // Добавляем текущий timestamp только для успешных запросов
    history.push(now);
    this.requestHistory.set(type, history);
    
    // Сохраняем в localStorage после каждого успешного запроса
    this.saveToStorage();
  }

  /**
   * Очищает историю запросов для указанного типа
   * Полезно для тестирования или сброса лимитов
   */
  clear(type?: RequestType): void {
    if (type) {
      this.requestHistory.delete(type);
    } else {
      this.requestHistory.clear();
    }
    // Сохраняем изменения в localStorage
    this.saveToStorage();
  }

  /**
   * Получает количество оставшихся запросов для типа
   */
  getRemainingRequests(type: RequestType): number {
    const config = RATE_LIMITS[type];
    const now = Date.now();
    const history = this.requestHistory.get(type) || [];
    const validHistory = history.filter((timestamp) => now - timestamp < config.windowMs);
    
    return Math.max(0, config.maxRequests - validHistory.length);
  }
}

// Экспортируем singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Очищает всю историю rate limiter из памяти и localStorage
 * Полезно для отладки или сброса лимитов
 */
export function clearRateLimiterHistory(): void {
  rateLimiter.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.warn('[RateLimiter] Failed to clear localStorage:', error);
    }
  }
}

