/**
 * KeystoneJS configuration
 * Главный файл конфигурации приложения
 */
// Загружаем переменные окружения ПЕРВЫМ делом, до всех импортов
import 'dotenv/config';

import { config, graphql } from '@keystone-6/core';
import { lists } from './schemas';
import { withAuth, session } from './src/auth/auth';
import { extendExpressApp } from './src/middlewares';
import { extendGraphqlSchema } from './src/graphql/combined';
import logger from './src/lib/logger';
import { logAdminAccessDenied, logAdminAccessGranted } from './src/lib/security-logger';

const databaseURL = process.env.DATABASE_URL || 'file:./.tmp/data.db';

// Проверка силы SESSION_SECRET при старте
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  logger.error('❌ SECURITY WARNING: SESSION_SECRET is too short or missing!');
  logger.error('   SESSION_SECRET must be at least 32 characters long.');
  logger.error('   Generate a secure secret: openssl rand -base64 64');
  if (process.env.NODE_ENV === 'production') {
    logger.error('   Application will not start in production with weak SESSION_SECRET.');
    process.exit(1);
  } else {
    logger.warn('   ⚠️  Using default secret in development (NOT SECURE FOR PRODUCTION)');
  }
} else {
  logger.info('✅ SESSION_SECRET is secure (length: ' + sessionSecret.length + ' characters)');
}

export default withAuth(
  config({
    db: {
      provider: 'sqlite',
      url: databaseURL,
      useMigrations: true,
      idField: { kind: 'autoincrement' },
    },
    lists,
    session,
    graphql: {
      path: '/api/graphql',
      apolloConfig: {
        introspection: process.env.NODE_ENV === 'development',
      },
      extendGraphqlSchema,
    },
    server: {
      port: parseInt(process.env.PORT || '1337', 10),
      extendExpressApp,
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:5173',
          process.env.PUBLIC_URL || 'http://localhost:1337',
        ],
        credentials: true,
      },
    },
    ui: {
      isAccessAllowed: async (context) => {
        // Получаем IP адрес из контекста запроса (если доступен)
        const req = (context as any).req;
        const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';
        const userAgent = req?.get?.('user-agent') || 'unknown';

        // Если пользователь не авторизован - KeystoneJS автоматически покажет страницу входа
        // На странице входа можно зарегистрироваться (если база пустая) или войти
        if (!context.session?.itemId) {
          logAdminAccessDenied(ip, undefined, 'Not authenticated', userAgent);
          return false; // KeystoneJS покажет страницу signin/signup
        }

        // Если пользователь авторизован - проверяем роль
        const sessionData = context.session.data as any;
        const userRole = sessionData?.role;
        const userId = context.session.itemId;
        const email = sessionData?.email || 'unknown';

        // Доступ к Admin UI только для админов
        if (userRole !== 'admin') {
          logAdminAccessDenied(ip, String(userId), `User role is '${userRole}', not 'admin'`, userAgent);
          return false; // Не админы не могут получить доступ к Admin UI
        }

        // Логируем успешный доступ к Admin UI
        logAdminAccessGranted(ip, String(userId), email, userAgent);
        return true; // Админы имеют полный доступ
      },
    },
  })
);

