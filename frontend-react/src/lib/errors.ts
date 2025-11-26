/**
 * Кастомные классы ошибок для приложения
 */

import type { RequestType } from './rateLimiter';

export class RateLimitError extends Error {
  public readonly waitTime: number; // Время ожидания в секундах
  public readonly type: RequestType;
  public readonly source?: 'client' | 'server'; // Источник ошибки для отладки

  constructor(waitTime: number, type: RequestType, source?: 'client' | 'server') {
    const message = waitTime > 0
      ? `Rate limit exceeded. Please wait ${waitTime} second${waitTime !== 1 ? 's' : ''} before trying again.`
      : 'Rate limit exceeded. Please wait a moment before trying again.';
    
    super(message);
    this.name = 'RateLimitError';
    this.waitTime = waitTime;
    this.type = type;
    this.source = source || 'client';
    
    // Сохраняем правильный прототип для instanceof
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

