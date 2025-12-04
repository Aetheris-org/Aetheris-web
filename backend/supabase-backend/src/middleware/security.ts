/**
 * Security middleware
 * Настройка безопасности: CORS, Helmet, Rate Limiting, HPP
 */
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import logger from '../lib/logger';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Настройка CORS
 */
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // В development разрешаем все источники
    if (NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // В production проверяем разрешенные домены
    const allowedOrigins = [
      FRONTEND_URL,
      process.env.PUBLIC_URL,
      'https://aetheris.app',
      'https://www.aetheris.app',
    ].filter(Boolean) as string[];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  maxAge: 86400, // 24 часа
};

/**
 * Rate limiting для API
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Пропускаем health check
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Строгий rate limiting для аутентификации
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Настройка Helmet для безопасности заголовков
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.SUPABASE_URL].filter(Boolean),
    },
  },
  crossOriginEmbedderPolicy: false,
};

/**
 * Применение всех middleware безопасности
 */
export function setupSecurityMiddleware(app: Express): void {
  // Compression
  app.use(compression());

  // Helmet - безопасность заголовков
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // HPP - защита от HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting для API
  app.use('/api/', apiLimiter);

  // Rate limiting для аутентификации
  app.use('/api/auth/', authLimiter);

  logger.info('✅ Security middleware configured', {
    cors: FRONTEND_URL,
    rateLimit: 'enabled',
  });
}

export { authLimiter };

