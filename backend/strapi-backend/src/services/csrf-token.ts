import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './session-store';

const CSRF_TOKEN_PREFIX = 'csrf_token:';
const CSRF_TOKEN_TTL = 60 * 60; // 1 hour

/**
 * CSRF Token Service
 * Защита от Cross-Site Request Forgery атак
 * 
 * SECURITY:
 * - UUID-based tokens (криптографически стойкие)
 * - Хранение в Redis с TTL 1 час
 * - Привязка к IP адресу для дополнительной защиты
 * - Double Submit Cookie pattern
 */
export const csrfTokenService = {
  /**
   * Генерирует новый CSRF token для клиента
   * @param ip - IP адрес клиента
   * @returns CSRF token
   */
  async generate(ip: string): Promise<string> {
    const token = uuidv4();
    const key = CSRF_TOKEN_PREFIX + token;
    
    const data = {
      ip,
      createdAt: Date.now(),
    };
    
    await sessionStore.set(key, JSON.stringify(data), CSRF_TOKEN_TTL);
    
    console.log(`✅ CSRF token generated for IP ${ip.substring(0, 10)}...`);
    return token;
  },

  /**
   * Валидирует CSRF token
   * @param token - CSRF token из заголовка
   * @param ip - IP адрес клиента
   * @returns true если токен валиден
   */
  async validate(token: string, ip: string): Promise<boolean> {
    if (!token) {
      console.warn('⚠️  CSRF validation failed: no token provided');
      return false;
    }
    
    const key = CSRF_TOKEN_PREFIX + token;
    const data = await sessionStore.get(key);
    
    if (!data) {
      console.warn(`⚠️  CSRF validation failed: token not found or expired`);
      return false;
    }
    
    const tokenData = JSON.parse(data);
    
    // Проверяем IP адрес (опционально, можно убрать если проблемы с proxy)
    if (tokenData.ip !== ip) {
      console.warn(`⚠️  CSRF validation failed: IP mismatch (expected ${tokenData.ip}, got ${ip})`);
      // Для development можем быть менее строгими
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Development mode: allowing IP mismatch');
        return true;
      }
      return false;
    }
    
    console.log(`✅ CSRF token validated for IP ${ip.substring(0, 10)}...`);
    return true;
  },

  /**
   * Удаляет CSRF token (используется редко, токены истекают автоматически)
   * @param token - CSRF token
   */
  async revoke(token: string): Promise<void> {
    const key = CSRF_TOKEN_PREFIX + token;
    await sessionStore.delete(key);
    console.log(`🔒 CSRF token revoked: ${token.substring(0, 8)}...`);
  },
};

