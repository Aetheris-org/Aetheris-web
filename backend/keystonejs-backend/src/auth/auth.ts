/**
 * KeystoneJS authentication configuration
 * Использует встроенную аутентификацию KeystoneJS
 */
import { statelessSessions } from '@keystone-6/core/session';
import { createAuth } from '@keystone-6/auth';
import logger from '../lib/logger';

// Stateless sessions с JWT
// ВАЖНО: Имя cookie должно совпадать с тем, что используется в /api/auth/oauth/session
export const session = statelessSessions({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  maxAge: 7 * 24 * 60 * 60, // 7 дней

  secure: process.env.NODE_ENV === 'production', // Только HTTPS в production
  path: '/', // Cookie доступен для всех путей
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Кросс-доменные запросы в production
  // Явно указываем имя cookie для совместимости
  // По умолчанию KeystoneJS использует 'keystonejs-session'
});

// Базовая аутентификация через email/password
// Passport.js для OAuth2 уже интегрирован в src/auth/passport.ts
const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id username role', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убрали email из sessionData (он хеширован и не нужен в сессии)
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      // Не используется, т.к. авторизация только через OAuth2
      logger.info(`Password reset token requested (OAuth2 only, not implemented)`);
    },
    tokensValidForMins: 60,
  },
  magicAuthLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      // Не используется, т.к. авторизация только через OAuth2
      logger.info(`Magic auth token requested (OAuth2 only, not implemented)`);
    },
    tokensValidForMins: 60,
  },
});

logger.info('✅ KeystoneJS authentication configured');

export { withAuth };
