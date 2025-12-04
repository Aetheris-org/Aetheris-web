/**
 * Main Server Entry Point
 * Express + Apollo Server + Supabase
 */

// Явный вывод в самом начале
console.log('🚀 Загрузка приложения...');

// Загружаем переменные окружения ПЕРВЫМ делом
import 'dotenv/config';

// Проверяем критические переменные сразу
if (!process.env.SUPABASE_URL) {
  console.error('❌ ОШИБКА: SUPABASE_URL не установлен в .env');
  console.error('💡 Создайте файл .env или запустите: bash scripts/copy-env.sh');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('❌ ОШИБКА: DATABASE_URL не установлен в .env');
  process.exit(1);
}

console.log('✅ Переменные окружения проверены');

// Импорты
import express, { Express } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import morgan from 'morgan';
import { setupSecurityMiddleware } from './middleware/security';
import { authenticate } from './middleware/auth';
import { createContext } from './graphql/context';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import logger from './lib/logger';

// Используем Supabase напрямую вместо Prisma (обход проблемы с engines)
console.log('✅ Используем Supabase напрямую (без Prisma)');

import prisma from './lib/prisma';
console.log('✅ Все модули загружены');

const PORT = parseInt(process.env.PORT || '1337', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  console.log('🚀 startServer() вызвана');
  try {
    console.log('🔍 Проверка переменных окружения...');
    
    // Проверка обязательных переменных окружения
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DATABASE_URL',
    ];

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Отсутствуют переменные окружения:', missingVars.join(', '));
      console.error('💡 Создайте файл .env на основе .env.example');
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    }
    
    console.log('✅ Переменные окружения проверены');

    logger.info('🚀 Starting Supabase Backend Server...', {
      port: PORT,
      env: NODE_ENV,
    });

    // Создаем Express приложение
    const app: Express = express();
    const httpServer = http.createServer(app);

    // Настройка middleware
    setupSecurityMiddleware(app);

    // Morgan для логирования HTTP запросов
    app.use(
      morgan('combined', {
        stream: {
          write: (message: string) => {
            logger.info(message.trim());
          },
        },
      })
    );

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'supabase-backend',
      });
    });

    // Создаем Apollo Server
    const server = new ApolloServer<ReturnType<typeof createContext>>({
      typeDefs,
      resolvers,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
      ],
      introspection: NODE_ENV === 'development',
      formatError: (error) => {
        logger.error('GraphQL Error', {
          message: error.message,
          path: error.path,
          extensions: error.extensions,
        });

        // В production не возвращаем stack trace
        if (NODE_ENV === 'production') {
          return {
            message: error.message,
            extensions: {
              code: error.extensions?.code,
            },
          };
        }

        return error;
      },
    });

    console.log('📦 Apollo Server создан, запуск...');
    await server.start();
    console.log('✅ Apollo Server запущен');

    // GraphQL endpoint
    app.use(
      '/api/graphql',
      cors<cors.CorsRequest>(),
      express.json(),
      authenticate,
      expressMiddleware(server, {
        context: createContext,
      })
    );

    // Запускаем сервер
    await new Promise<void>((resolve) => {
      httpServer.listen({ port: PORT }, resolve);
    });

    console.log(`✅ Server ready at http://localhost:${PORT}`);
    console.log(`✅ GraphQL API available at http://localhost:${PORT}/api/graphql`);
    logger.info(`✅ Server ready at http://localhost:${PORT}`);
    logger.info(`✅ GraphQL API available at http://localhost:${PORT}/api/graphql`);

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      await server.stop();
      await prisma.$disconnect();
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error: any) {
    console.error('❌ ОШИБКА ПРИ ЗАПУСКЕ СЕРВЕРА:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

console.log('🎯 Вызов startServer()...');
startServer().catch((error) => {
  console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
  process.exit(1);
});
