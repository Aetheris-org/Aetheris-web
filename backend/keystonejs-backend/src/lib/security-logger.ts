/**
 * Security logger
 * Логирование событий безопасности: попытки доступа, неудачные входы, подозрительная активность
 */
import logger from './logger';

interface SecurityEvent {
  type: 'login_attempt' | 'login_failure' | 'login_success' | 'admin_access_denied' | 'admin_access_granted' | 'rate_limit_exceeded';
  ip?: string;
  email?: string;
  userId?: string;
  userAgent?: string;
  reason?: string;
  timestamp?: Date;
}

/**
 * Логирует событие безопасности
 */
export function logSecurityEvent(event: SecurityEvent) {
  const timestamp = event.timestamp || new Date();
  const logData = {
    type: event.type,
    ip: event.ip,
    email: event.email,
    userId: event.userId,
    userAgent: event.userAgent,
    reason: event.reason,
    timestamp: timestamp.toISOString(),
  };

  // Критические события логируем как error, остальные как warn
  if (event.type === 'login_failure' || event.type === 'admin_access_denied' || event.type === 'rate_limit_exceeded') {
    logger.warn(`🔒 Security Event: ${event.type}`, logData);
  } else {
    logger.info(`🔒 Security Event: ${event.type}`, logData);
  }
}

/**
 * Логирует попытку входа
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email уже должен быть хеширован к моменту вызова
 */
export function logLoginAttempt(ip: string, email: string, userAgent?: string) {
  logSecurityEvent({
    type: 'login_attempt',
    ip,
    email: 'hidden', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
    userAgent,
  });
}

/**
 * Логирует неудачную попытку входа
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email уже должен быть хеширован к моменту вызова
 */
export function logLoginFailure(ip: string, email: string, reason: string, userAgent?: string) {
  logSecurityEvent({
    type: 'login_failure',
    ip,
    email: 'hidden', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
    reason,
    userAgent,
  });
}

/**
 * Логирует успешный вход
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email уже должен быть хеширован к моменту вызова
 */
export function logLoginSuccess(ip: string, email: string, userId: string, userAgent?: string) {
  logSecurityEvent({
    type: 'login_success',
    ip,
    email: 'hidden', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
    userId,
    userAgent,
  });
}

/**
 * Логирует отказ в доступе к Admin UI
 */
export function logAdminAccessDenied(ip: string, userId?: string, reason?: string, userAgent?: string) {
  logSecurityEvent({
    type: 'admin_access_denied',
    ip,
    userId,
    reason,
    userAgent,
  });
}

/**
 * Логирует успешный доступ к Admin UI
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Email уже должен быть хеширован к моменту вызова
 */
export function logAdminAccessGranted(ip: string, userId: string, email: string, userAgent?: string) {
  logSecurityEvent({
    type: 'admin_access_granted',
    ip,
    userId,
    email: 'hidden', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email (даже хешированный) для безопасности
    userAgent,
  });
}

/**
 * Логирует превышение rate limit
 */
export function logRateLimitExceeded(ip: string, endpoint: string, userAgent?: string) {
  logSecurityEvent({
    type: 'rate_limit_exceeded',
    ip,
    reason: `Rate limit exceeded for endpoint: ${endpoint}`,
    userAgent,
  });
}

