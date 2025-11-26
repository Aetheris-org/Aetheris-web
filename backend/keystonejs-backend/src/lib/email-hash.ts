/**
 * Утилита для хеширования email адресов
 * Использует HMAC-SHA256 для создания детерминированного хеша с защитой от радужных таблиц
 * 
 * Требует переменную окружения EMAIL_HMAC_SECRET (минимум 32 символа)
 */

import { createHmac } from 'crypto';
import logger from './logger';

// Получаем секретный ключ из переменных окружения
const getSecretKey = (): string => {
  const secret = process.env.EMAIL_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    const errorMsg = 'EMAIL_HMAC_SECRET must be set and at least 32 characters long';
    logger.error(`hashEmail: ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return secret;
};

/**
 * Хеширует email адрес используя HMAC-SHA256
 * 
 * @param email - Email адрес для хеширования
 * @returns Хеш email в формате hex (64 символа)
 * 
 * @example
 * hashEmail('user@example.com') // HMAC-SHA256 хеш с секретным ключом
 */
export function hashEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    logger.warn('hashEmail: Invalid email provided');
    throw new Error('Email must be a non-empty string');
  }

  // Нормализуем email: приводим к lowercase и убираем пробелы
  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail) {
    logger.warn('hashEmail: Empty email after normalization');
    throw new Error('Email cannot be empty after normalization');
  }

  // Проверяем базовый формат email (простая валидация)
  if (!normalizedEmail.includes('@')) {
    logger.warn('hashEmail: Invalid email format (no @ symbol)');
    throw new Error('Invalid email format');
  }

  // Получаем секретный ключ
  const secretKey = getSecretKey();

  // Создаем HMAC-SHA256 хеш
  const hmac = createHmac('sha256', secretKey);
  hmac.update(normalizedEmail);
  const hashedEmail = hmac.digest('hex');

  logger.debug('Email hashed successfully with HMAC-SHA256', {
    originalLength: email.length,
    hashedLength: hashedEmail.length,
    // НЕ логируем оригинальный email для безопасности
  });

  return hashedEmail;
}

/**
 * Проверяет, является ли строка хешем email (HMAC-SHA256 или SHA-256 hex, 64 символа)
 * 
 * Оба формата (старый SHA-256 и новый HMAC-SHA256) дают 64-символьный hex,
 * поэтому по формату их не отличить. Эта функция проверяет только формат.
 * 
 * @param value - Строка для проверки
 * @returns true, если строка является валидным хешем email (64 символа hex)
 */
export function isEmailHash(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // HMAC-SHA256 и SHA-256 хеш в hex формате всегда 64 символа
  // Проверяем длину и формат (только hex символы)
  return value.length === 64 && /^[a-f0-9]{64}$/i.test(value);
}

