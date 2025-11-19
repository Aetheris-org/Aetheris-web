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
  // Явно указываем имя cookie для совместимости
  // По умолчанию KeystoneJS использует 'keystonejs-session'
});

// Базовая аутентификация через email/password
// TODO: Интегрировать с Passport.js для OAuth2
const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id email username role',
  passwordResetLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      // TODO: Реализовать отправку email с токеном сброса пароля
      logger.info(`Password reset token for ${identity}: ${token}`);
    },
    tokensValidForMins: 60,
  },
  magicAuthLink: {
    sendToken: async ({ itemId, identity, token, context }) => {
      // TODO: Реализовать отправку email с magic link
      logger.info(`Magic auth token for ${identity}: ${token}`);
    },
    tokensValidForMins: 60,
  },
});

logger.info('✅ KeystoneJS authentication configured');

export { withAuth };

