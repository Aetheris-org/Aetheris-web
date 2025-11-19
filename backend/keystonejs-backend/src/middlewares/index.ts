/**
 * Express middleware configuration
 * Настройка всех middleware в правильном порядке
 */
import type { Express } from 'express';
import type { KeystoneContext } from '@keystone-6/core/types';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import expressSession from 'express-session';
import RedisStore from 'connect-redis';
import morgan from 'morgan';
import passport from 'passport';
import multer from 'multer';
import { getRedisClientWithFallback } from '../lib/redis';
import logger from '../lib/logger';
import { findOrCreateGoogleUser } from '../auth/oauth-handler';
import '../auth/passport'; // Инициализация Passport.js
import { logRateLimitExceeded, logLoginAttempt } from '../lib/security-logger';

// Сохраняем context в модуле для доступа из OAuth handlers
let keystoneContext: KeystoneContext | null = null;

export function setKeystoneContext(context: KeystoneContext) {
  keystoneContext = context;
}

export async function extendExpressApp(
  app: Express,
  context?: KeystoneContext
) {
  // Сохраняем context для использования в OAuth handlers
  if (context) {
    setKeystoneContext(context);
  }
  
  // Настраиваем multer для загрузки изображений (должен быть определен до использования)
  const upload = multer({
    storage: multer.memoryStorage(), // Храним файл в памяти для отправки на ImgBB
    limits: {
      fileSize: 8 * 1024 * 1024, // 8MB максимум
    },
    fileFilter: (req, file, cb) => {
      // Валидация типа файла
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`));
      }
    },
  });
  
  // 0. Body parser для JSON (должен быть первым для парсинга тела запросов)
  // ВАЖНО: Не применяем body parser к /api/upload/image, так как там используется multer
  app.use((req, res, next) => {
    // Пропускаем body parser для multipart/form-data запросов (обрабатываются multer)
    if (req.path === '/api/upload/image' && req.method === 'POST') {
      return next();
    }
    express.json()(req, res, next);
  });
  
  app.use((req, res, next) => {
    // Пропускаем urlencoded parser для multipart/form-data запросов
    if (req.path === '/api/upload/image' && req.method === 'POST') {
      return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
  });

  // 2. Helmet - Security headers
  // В development отключаем CSP для Admin UI (Next.js требует unsafe-eval для hot reload)
  const isDevelopment = process.env.NODE_ENV === 'development';
  app.use(
    helmet({
      contentSecurityPolicy: isDevelopment
        ? false // Отключаем CSP в development для Admin UI
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Требуется для Next.js
              ],
              imgSrc: ["'self'", 'data:', 'https:', 'http:'],
              connectSrc: [
                "'self'",
                'https://oauth2.googleapis.com',
                'https://www.googleapis.com',
              ],
            },
          },
      // Дополнительные security headers
      hsts: {
        maxAge: 31536000, // 1 год
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny', // Запрещаем встраивание в iframe (защита от clickjacking)
      },
      noSniff: true, // Запрещаем MIME type sniffing
      xssFilter: true, // XSS фильтр
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    })
  );

  // 3. CORS
  app.use(
    cors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        process.env.PUBLIC_URL || 'http://localhost:1337',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  // 4. Compression
  app.use(compression());

  // 5. Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Пропускаем GraphQL endpoint (он имеет свои лимитеры)
      return req.path === '/api/graphql';
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Too many requests from this IP, please try again later.',
      });
    },
  });
  app.use('/api/', limiter);

  // Более строгий лимит для OAuth endpoints (инициация OAuth)
  // НО: исключаем /api/auth/oauth/session, так как это часть успешного OAuth flow
  const oauthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Увеличиваем лимит для OAuth flow
    message: 'Too many OAuth attempts, please try again later.',
    skip: (req) => {
      // Пропускаем /api/auth/oauth/session, так как это часть успешного OAuth callback
      // и должно быть разрешено после успешной авторизации
      return req.path === '/api/auth/oauth/session';
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: 'Too many OAuth attempts',
        message: 'Too many OAuth attempts, please try again later.',
      });
    },
  });
  app.use('/api/auth/', oauthLimiter);
  app.use('/api/connect/', oauthLimiter);

  // Rate limiting для GraphQL
  // Разделяем лимиты для попыток входа и обычных запросов
  const graphqlLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 10, // максимум 10 попыток входа с одного IP
    message: 'Too many login attempts, please try again later.',
    skip: (req) => {
      // Пропускаем, если это не запрос на аутентификацию
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('authenticateUserWithPassword');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (login)', userAgent);
      res.status(429).json({
        error: 'Too many login attempts',
        message: 'Too many login attempts from this IP, please try again later.',
      });
    },
  });

  // Более мягкий лимит для остальных GraphQL запросов (Admin UI делает много запросов)
  const graphqlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 500, // максимум 500 GraphQL запросов с одного IP (Admin UI может делать много запросов)
    message: 'Too many GraphQL requests, please try again later.',
    skip: (req) => {
      // Пропускаем запросы на аутентификацию (они обрабатываются отдельным лимитером)
      if (req.method !== 'POST' || !req.body) return false;
      const query = req.body.query || '';
      return query.includes('authenticateUserWithPassword');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql', userAgent);
      res.status(429).json({
        error: 'Too many GraphQL requests',
        message: 'Too many requests from this IP, please try again later.',
      });
    },
  });

  // Применяем оба лимитера к GraphQL endpoint
  app.use('/api/graphql', graphqlLoginLimiter);
  app.use('/api/graphql', graphqlLimiter);
  
  // Middleware для логирования cookie в GraphQL запросах (только в development)
  if (process.env.NODE_ENV === 'development') {
    app.use('/api/graphql', (req, res, next) => {
      const cookies = req.headers.cookie || '';
      const keystoneCookie = cookies.split(';').find(c => c.trim().startsWith('keystonejs-session='));
      if (keystoneCookie) {
        const token = keystoneCookie.split('=')[1];
        logger.debug(`GraphQL request with keystonejs-session cookie: ${token.substring(0, 30)}...`);
        
        // Пытаемся декодировать токен для проверки
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.decode(token, { complete: false });
          if (decoded) {
            logger.debug('Decoded JWT payload:', JSON.stringify(decoded, null, 2));
          }
        } catch (error) {
          logger.debug('Failed to decode JWT token:', error);
        }
      } else {
        logger.debug('GraphQL request WITHOUT keystonejs-session cookie');
      }
      next();
    });
  }

  // 6. Session store с Redis
  const redisClient = await getRedisClientWithFallback();
  const sessionStore = redisClient
    ? new RedisStore({ client: redisClient, prefix: 'session:' })
    : new expressSession.MemoryStore();

  app.use(
    expressSession({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'change-me-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      },
    })
  );

  // 7. Passport.js initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // 8. OAuth2 routes
  // CSRF защита: генерируем state параметр и сохраняем в session
  app.get('/api/connect/google', async (req, res, next) => {
    try {
      // Генерируем криптографически стойкий state токен для CSRF защиты
      const crypto = require('crypto');
      const state = crypto.randomBytes(32).toString('hex');
      
      // Сохраняем state в session для проверки в callback
      (req.session as any).oauthState = state;
      
      // ВАЖНО: Явно сохраняем session перед редиректом на Google
      // Это гарантирует, что state будет доступен в callback
      await new Promise<void>((resolve, reject) => {
        (req.session as any).save((err: any) => {
          if (err) {
            logger.error('Failed to save session with oauthState:', err);
            reject(err);
          } else {
            logger.debug('Session saved with oauthState:', state.substring(0, 20) + '...');
            resolve();
          }
        });
      });
      
      // Передаем state в Passport.js для отправки в Google
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state, // Google вернет этот state в callback
      })(req, res, next);
    } catch (error) {
      logger.error('OAuth initiation error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?error=oauth_init_failed`);
    }
  });
  
  app.get(
    '/api/connect/google/callback',
    // CSRF защита: проверяем state параметр ДО вызова passport.authenticate()
    // Passport.js может удалить state из query string после обработки
    (req, res, next) => {
      const receivedState = req.query.state as string;
      const savedState = (req.session as any)?.oauthState;
      
      logger.debug('OAuth callback state check:', {
        received: receivedState?.substring(0, 20) + '...',
        saved: savedState?.substring(0, 20) + '...',
        sessionId: (req.session as any)?.id,
        hasSession: !!req.session,
      });
      
      if (!receivedState || !savedState || receivedState !== savedState) {
        logger.error('OAuth callback: CSRF protection failed - invalid state parameter', {
          received: receivedState,
          saved: savedState,
          ip: req.ip,
          sessionId: (req.session as any)?.id,
          hasSession: !!req.session,
        });
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?error=csrf_protection_failed`);
      }
      
      // Удаляем использованный state из session перед вызовом passport.authenticate
      delete (req.session as any).oauthState;
      
      // Продолжаем обработку OAuth callback
      next();
    },
    passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        
        // Используем сохраненный context или переданный параметр
        const ctx = context || keystoneContext;
        if (!ctx) {
          logger.error('KeystoneJS context not available for OAuth callback');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
        }

        const user = req.user as any;
        if (!user || !user.email) {
          logger.error('OAuth callback: Invalid user data');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.redirect(`${frontendUrl}/auth/callback?error=invalid_user`);
        }

        // Находим или создаем пользователя в KeystoneJS
        const keystoneUser = await findOrCreateGoogleUser(ctx, user);
        if (!keystoneUser) {
          logger.error('OAuth callback: Failed to create/find user');
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          return res.redirect(`${frontendUrl}/auth/callback?error=user_creation_failed`);
        }

        // Сохраняем userId в Express session для последующего создания KeystoneJS session
        (req.session as any).oauthUserId = keystoneUser.id;
        (req.session as any).oauthEmail = keystoneUser.email;
        
        // Редиректим на frontend, который вызовет GraphQL mutation для создания session
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?oauth=success&userId=${keystoneUser.id}`);
      } catch (error) {
        logger.error('OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?error=server_error`);
      }
    }
  );

  // 9. Initial setup endpoint - создание первого администратора
  // ЗАЩИТА ОТ RACE CONDITIONS: Используем Prisma транзакцию для атомарной операции
  // ВАЛИДАЦИЯ: Используем Zod для валидации входных данных
  app.post('/api/setup/initial', async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      // Валидация входных данных через Zod (как требует text.text)
      const { z } = await import('zod');
      const setupSchema = z.object({
        email: z.string().email('Invalid email format').min(5).max(255),
        password: z.string().min(8, 'Password must be at least 8 characters').max(128),
        username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
        name: z.string().min(1, 'Name is required').max(100),
      });

      const validationResult = setupSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors,
        });
      }

      const { email, password, username, name } = validationResult.data;

      // ИСПОЛЬЗУЕМ PRISMA ТРАНЗАКЦИЮ для защиты от race conditions
      // В SQLite транзакция блокирует базу, предотвращая одновременное создание нескольких админов
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        // Атомарная транзакция: проверка + создание
        // ЗАЩИТА ОТ RACE CONDITIONS: транзакция блокирует базу, предотвращая одновременное создание
        const admin = await prisma.$transaction(async (tx) => {
          // Проверяем, есть ли уже пользователи (внутри транзакции)
          const existingUsers = await tx.user.findMany({ take: 1 });
          
          if (existingUsers.length > 0) {
            throw new Error('Initial setup already completed. Users exist in database.');
          }

          // Хешируем пароль (KeystoneJS использует bcrypt)
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash(password, 10);

          // Создаем первого администратора (внутри транзакции)
          // ВАЖНО: Роль 'admin' устанавливается ЯВНО, а не через hook
          const newAdmin = await tx.user.create({
            data: {
              email,
              password: hashedPassword,
              username,
              name,
              role: 'admin', // Явно устанавливаем роль 'admin' (безопасно, т.к. внутри транзакции)
              provider: 'local',
              confirmed: true,
              blocked: false,
            },
          });

          return newAdmin;
        }, {
          isolationLevel: 'Serializable', // Максимальная изоляция для SQLite (блокирует конкурентные запросы)
        });

        logger.info(`✅ First admin created via initial setup endpoint: ${admin.email}`);

        res.json({
          success: true,
          message: 'First admin created successfully',
          user: {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            name: admin.name,
            role: admin.role,
          },
        });
      } finally {
        await prisma.$disconnect();
      }
    } catch (error: any) {
      logger.error('Initial setup error:', error);
      
      // Если ошибка связана с тем, что пользователи уже существуют
      if (error.message?.includes('already completed')) {
        return res.status(400).json({ 
          error: 'Initial setup already completed',
          message: error.message 
        });
      }

      res.status(500).json({ 
        error: 'Failed to create first admin',
        message: error.message 
      });
    }
  });

  // 10. OAuth session creation endpoint
  // Frontend вызывает этот endpoint после OAuth callback для создания KeystoneJS session
  // ВАЖНО: Этот endpoint создает KeystoneJS session для OAuth пользователей
  app.post('/api/auth/oauth/session', async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      const oauthUserId = (req.session as any)?.oauthUserId;
      if (!oauthUserId) {
        return res.status(400).json({ error: 'OAuth session not found' });
      }

      // Получаем пользователя
      const user = await ctx.query.User.findOne({
        where: { id: oauthUserId },
        query: 'id email username role',
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Создаем KeystoneJS session для OAuth пользователя
      // Используем встроенный механизм KeystoneJS sessionStrategy.start()
      // вместо ручного создания Iron токена
      const userId = String(user.id);
      const sessionData = {
        id: userId,
        email: user.email,
        username: user.username,
        role: user.role || 'user',
      };
      
      try {
        // Создаем контекст с Express response для sessionStrategy
        // sessionStrategy.start() требует context.res для установки cookie
        const sessionContext = {
          ...ctx,
          res: res, // Express response объект
        } as any;
        
        // Используем встроенный механизм KeystoneJS для создания session
        // Это гарантирует совместимость с настройками session из auth.ts
        const sessionToken = await ctx.sessionStrategy.start({
          context: sessionContext,
          data: {
            itemId: userId,
            listKey: 'User',
            data: sessionData,
          },
        });
        
        if (!sessionToken) {
          logger.error('Session token is null or undefined after creation');
          return res.status(500).json({ error: 'Failed to create session token' });
        }
        
        logger.debug(`Session token created for user ${user.id}, token length: ${sessionToken.length}`);
      } catch (error: any) {
        logger.error('Error creating session token via sessionStrategy:', error);
        logger.error('Error stack:', error.stack);
        return res.status(500).json({ error: 'Failed to create session token', details: error.message });
      }

      logger.info(`✅ OAuth session created for user: ${user.email}`);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });

      // Очищаем временные данные из Express session
      delete (req.session as any).oauthUserId;
      delete (req.session as any).oauthEmail;
    } catch (error) {
      logger.error('OAuth session creation error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  // 11. Image upload endpoint
  // Загрузка изображений через ImgBB API
  // ВАЖНО: multer уже настроен выше
  app.post('/api/upload/image', upload.single('files'), async (req, res) => {
    try {
      // Проверяем аутентификацию через KeystoneJS session
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      // Проверяем, что пользователь аутентифицирован через KeystoneJS session
      // Session cookie автоматически передается с запросом благодаря credentials: 'include'
      // Проверяем наличие session cookie
      const sessionCookie = req.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith('keystonejs-session='));
      
      if (!sessionCookie) {
        logger.warn('Image upload attempted without session cookie');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      logger.debug('Image upload request from authenticated user');

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const file = req.file;
      
      logger.debug('Image upload request:', {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      // Валидация размера файла
      const maxFileSize = 8 * 1024 * 1024; // 8MB
      if (file.size > maxFileSize) {
        return res.status(400).json({ 
          error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB` 
        });
      }

      // Получаем API ключ ImgBB из переменных окружения
      const imgbbApiKey = process.env.IMGBB_API_KEY;
      
      if (!imgbbApiKey) {
        logger.error('IMGBB_API_KEY not configured in environment variables');
        // Fallback: возвращаем временный URL (в production нужно настроить ImgBB)
        const publicUrl = process.env.PUBLIC_URL || 'http://localhost:1337';
        const tempUrl = `${publicUrl}/uploads/${Date.now()}-${file.originalname}`;
        
        logger.warn('⚠️ ImgBB not configured, using temporary URL (not persisted)');
        return res.json([{
          id: Date.now().toString(),
          url: tempUrl,
          display_url: tempUrl,
          delete_url: null,
          size: file.size,
          width: null,
          height: null,
          mime: file.mimetype,
          name: file.originalname,
        }]);
      }

      // Конвертируем файл в base64 для ImgBB API
      const base64Image = file.buffer.toString('base64');

      // Загружаем изображение через ImgBB API
      const formData = new URLSearchParams();
      formData.append('key', imgbbApiKey);
      formData.append('image', base64Image);
      
      if (file.originalname) {
        formData.append('name', file.originalname);
      }

      // Отправляем запрос к ImgBB API
      const https = await import('https');
      const timeoutMs = 30000; // 30 секунд таймаут
      
      try {
        const imgbbResponse = await new Promise<{ statusCode: number; data: any }>((resolve, reject) => {
          const requestBody = formData.toString();
          let timeout: NodeJS.Timeout;
          
          timeout = setTimeout(() => {
            reject(new Error('Request timeout'));
          }, timeoutMs);
          
          const req = https.request(
            {
              hostname: 'api.imgbb.com',
              path: '/1/upload',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(requestBody),
              },
            },
            (res) => {
              let data = '';
              
              res.on('data', (chunk) => {
                data += chunk;
              });
              
              res.on('end', () => {
                clearTimeout(timeout);
                try {
                  const jsonData = JSON.parse(data);
                  resolve({
                    statusCode: res.statusCode || 500,
                    data: jsonData,
                  });
                } catch (parseError) {
                  reject(new Error(`Failed to parse response: ${parseError}`));
                }
              });
            }
          );
          
          req.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
          });
          
          req.on('timeout', () => {
            req.destroy();
            clearTimeout(timeout);
            reject(new Error('Request timeout'));
          });
          
          req.write(requestBody);
          req.end();
        });

        if (imgbbResponse.statusCode < 200 || imgbbResponse.statusCode >= 300) {
          const errorText = typeof imgbbResponse.data === 'string' 
            ? imgbbResponse.data 
            : JSON.stringify(imgbbResponse.data);
          logger.error('ImgBB API error:', {
            status: imgbbResponse.statusCode,
            error: errorText,
          });
          return res.status(imgbbResponse.statusCode).json({ 
            error: 'Image upload failed',
            details: process.env.NODE_ENV === 'development' ? errorText : undefined,
          });
        }

        const imgbbData = imgbbResponse.data as {
          success?: boolean;
          data?: {
            id?: string;
            url?: string;
            display_url?: string;
            delete_url?: string;
            size?: number;
            width?: number;
            height?: number;
          };
          error?: {
            message?: string;
            code?: number;
          };
        };

        if (!imgbbData.success || !imgbbData.data) {
          const errorMessage = imgbbData.error?.message || 'Unknown error';
          logger.error('ImgBB upload failed:', errorMessage);
          return res.status(400).json({ 
            error: 'Image upload failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          });
        }

        logger.info('✅ Image uploaded successfully to ImgBB:', {
          url: imgbbData.data.url,
          size: imgbbData.data.size,
        });

        // Возвращаем данные в формате, совместимом с фронтендом
        res.json([{
          id: imgbbData.data.id || Date.now().toString(),
          url: imgbbData.data.url || imgbbData.data.display_url,
          display_url: imgbbData.data.display_url,
          delete_url: imgbbData.data.delete_url,
          size: imgbbData.data.size || file.size,
          width: imgbbData.data.width,
          height: imgbbData.data.height,
          mime: file.mimetype,
          name: file.originalname,
        }]);
      } catch (uploadError: any) {
        logger.error('Failed to upload image to ImgBB:', uploadError);
        
        // В development показываем детали ошибки
        if (process.env.NODE_ENV === 'development') {
          return res.status(500).json({ 
            error: 'Image upload failed',
            details: uploadError.message || 'Unknown error',
          });
        }
        
        return res.status(500).json({ error: 'Image upload failed. Please try again.' });
      }
    } catch (error: any) {
      logger.error('Image upload endpoint error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // 11. CSRF token endpoint (для совместимости с frontend)
  // В KeystoneJS CSRF защита реализована через session cookies
  // Этот endpoint возвращает пустой ответ, так как CSRF токен не требуется
  app.get('/api/auth/csrf', (req, res) => {
    // Возвращаем пустой CSRF токен для совместимости
    // В KeystoneJS CSRF защита реализована через session cookies и state параметр для OAuth
    res.json({ csrfToken: null });
  });

  // 12. REST API для статей (для совместимости с frontend)
  // ВАЖНО: Это временный endpoint для совместимости. В будущем нужно обновить frontend для использования GraphQL API
  app.post('/api/articles', async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      // Проверяем аутентификацию через KeystoneJS session
      // Создаем контекст с req для чтения cookies
      const sessionContext = {
        ...ctx,
        req: req,
        res: res,
      } as any;

      // Получаем session из cookie через sessionStrategy
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
      } catch (sessionError) {
        logger.debug('Session check failed:', sessionError);
        return res.status(401).json({ error: 'Invalid session' });
      }

      if (!sessionData || !sessionData.itemId) {
        logger.warn('Article creation attempted without valid session');
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userId = sessionData.itemId;
      const body = req.body?.data || req.body;

      // Валидация входных данных
      if (!body.title || !body.content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      // Преобразуем content из HTML строки в document format для KeystoneJS
      // Если content уже в формате document, используем его как есть
      let contentDocument;
      if (typeof body.content === 'string') {
        // Преобразуем HTML в document format (ProseMirror/TipTap формат)
        // Простой парсер HTML для базовых тегов
        const htmlContent = body.content.trim();
        
        // Если это пустая строка или только пробелы
        if (!htmlContent || htmlContent === '<p></p>' || htmlContent === '<p><br></p>') {
          contentDocument = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
              },
            ],
          };
        } else {
          // Парсим HTML в document format
          // Убираем обертки <p> и </p>, если они есть
          let cleanHtml = htmlContent;
          if (cleanHtml.startsWith('<p>') && cleanHtml.endsWith('</p>')) {
            cleanHtml = cleanHtml.slice(3, -4);
          }
          
          // Разбиваем на параграфы по </p><p> или <br>
          const paragraphs = cleanHtml.split(/<\/p>\s*<p>|<\/p><p>/).filter(p => p.trim());
          
          if (paragraphs.length === 0) {
            // Если нет параграфов, создаем один пустой
            contentDocument = {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                },
              ],
            };
          } else {
            // Преобразуем каждый параграф
            const content: any[] = [];
            
            for (const para of paragraphs) {
              const cleanPara = para.replace(/^<p>|<\/p>$/g, '').trim();
              
              if (!cleanPara) {
                content.push({ type: 'paragraph' });
                continue;
              }
              
              // Простое преобразование: убираем HTML теги и создаем текст
              const textContent = cleanPara
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
              
              // Разбиваем на строки и создаем параграфы
              const lines = textContent.split('\n').filter(line => line.trim() || textContent.includes('\n'));
              
              if (lines.length === 0) {
                content.push({ type: 'paragraph' });
              } else {
                for (const line of lines) {
                  if (line.trim()) {
                    content.push({
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: line.trim(),
                        },
                      ],
                    });
                  } else {
                    content.push({ type: 'paragraph' });
                  }
                }
              }
            }
            
            contentDocument = {
              type: 'doc',
              content: content.length > 0 ? content : [{ type: 'paragraph' }],
            };
          }
        }
      } else if (body.content && typeof body.content === 'object') {
        // Если уже в формате document, используем как есть
        contentDocument = body.content;
      } else {
        // Fallback: пустой документ
        contentDocument = {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
            },
          ],
        };
      }

      // Создаем статью через GraphQL API
      const article = await ctx.sudo().query.Article.createOne({
        data: {
          title: body.title,
          content: contentDocument,
          excerpt: body.excerpt || null,
          author: { connect: { id: userId } },
          tags: body.tags || [],
          difficulty: body.difficulty || 'medium',
          previewImage: body.preview_image || null,
          publishedAt: body.publishedAt || null,
        },
        query: 'id title content { document } excerpt author { id username avatar } tags difficulty previewImage likes_count dislikes_count views publishedAt createdAt updatedAt',
      });

      // Преобразуем в формат, совместимый с frontend
      const response = {
        data: {
          id: String(article.id),
          attributes: {
            title: article.title,
            content: typeof article.content === 'object' && article.content.document 
              ? JSON.stringify(article.content.document)
              : article.content,
            excerpt: article.excerpt,
            author: {
              data: {
                id: article.author.id,
                attributes: {
                  username: article.author.username,
                  avatar: article.author.avatar,
                },
              },
            },
            tags: article.tags,
            difficulty: article.difficulty,
            preview_image: article.previewImage,
            likes_count: article.likes_count,
            dislikes_count: article.dislikes_count,
            views: article.views,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          },
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Failed to create article:', error);
      res.status(500).json({ 
        error: 'Failed to create article',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // Обновление статьи
  app.put('/api/articles/:id', async (req, res) => {
    try {
      const ctx = context || keystoneContext;
      if (!ctx) {
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      // Проверяем аутентификацию через KeystoneJS session
      // Создаем контекст с req для чтения cookies
      const sessionContext = {
        ...ctx,
        req: req,
        res: res,
      } as any;

      // Получаем session из cookie через sessionStrategy
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
      } catch (sessionError) {
        logger.debug('Session check failed:', sessionError);
        return res.status(401).json({ error: 'Invalid session' });
      }

      if (!sessionData || !sessionData.itemId) {
        logger.warn('Article update attempted without valid session');
        return res.status(401).json({ error: 'Authentication required' });
      }

      const articleId = req.params.id;
      const body = req.body?.data || req.body;

      // Проверяем, что статья принадлежит пользователю
      const existingArticle = await ctx.query.Article.findOne({
        where: { id: articleId },
        query: 'id author { id }',
      });

      if (!existingArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }

      if (String(existingArticle.author.id) !== String(sessionData.itemId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Преобразуем content из HTML строки в document format для KeystoneJS
      // Используем ту же логику, что и при создании
      let contentDocument;
      if (typeof body.content === 'string') {
        const htmlContent = body.content.trim();
        
        if (!htmlContent || htmlContent === '<p></p>' || htmlContent === '<p><br></p>') {
          contentDocument = {
            type: 'doc',
            content: [{ type: 'paragraph' }],
          };
        } else {
          let cleanHtml = htmlContent;
          if (cleanHtml.startsWith('<p>') && cleanHtml.endsWith('</p>')) {
            cleanHtml = cleanHtml.slice(3, -4);
          }
          
          const paragraphs = cleanHtml.split(/<\/p>\s*<p>|<\/p><p>/).filter(p => p.trim());
          const content: any[] = [];
          
          for (const para of paragraphs) {
            const cleanPara = para.replace(/^<p>|<\/p>$/g, '').trim();
            if (!cleanPara) {
              content.push({ type: 'paragraph' });
              continue;
            }
            
            const textContent = cleanPara
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<[^>]*>/g, '')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'");
            
            const lines = textContent.split('\n').filter(line => line.trim() || textContent.includes('\n'));
            
            if (lines.length === 0) {
              content.push({ type: 'paragraph' });
            } else {
              for (const line of lines) {
                if (line.trim()) {
                  content.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: line.trim() }],
                  });
                } else {
                  content.push({ type: 'paragraph' });
                }
              }
            }
          }
          
          contentDocument = {
            type: 'doc',
            content: content.length > 0 ? content : [{ type: 'paragraph' }],
          };
        }
      } else if (body.content && typeof body.content === 'object') {
        contentDocument = body.content;
      } else {
        contentDocument = {
          type: 'doc',
          content: [{ type: 'paragraph' }],
        };
      }

      // Обновляем статью
      const updateData: any = {};
      if (body.title) updateData.title = body.title;
      if (contentDocument) updateData.content = contentDocument;
      if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
      if (body.tags) updateData.tags = body.tags;
      if (body.difficulty) updateData.difficulty = body.difficulty;
      if (body.preview_image !== undefined) updateData.previewImage = body.preview_image;
      if (body.publishedAt !== undefined) updateData.publishedAt = body.publishedAt;

      const article = await ctx.sudo().query.Article.updateOne({
        where: { id: articleId },
        data: updateData,
        query: 'id title content { document } excerpt author { id username avatar } tags difficulty previewImage likes_count dislikes_count views publishedAt createdAt updatedAt',
      });

      // Преобразуем в формат, совместимый с frontend
      const response = {
        data: {
          id: String(article.id),
          attributes: {
            title: article.title,
            content: typeof article.content === 'object' && article.content.document 
              ? JSON.stringify(article.content.document)
              : article.content,
            excerpt: article.excerpt,
            author: {
              data: {
                id: article.author.id,
                attributes: {
                  username: article.author.username,
                  avatar: article.author.avatar,
                },
              },
            },
            tags: article.tags,
            difficulty: article.difficulty,
            preview_image: article.previewImage,
            likes_count: article.likes_count,
            dislikes_count: article.dislikes_count,
            views: article.views,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
          },
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Failed to update article:', error);
      res.status(500).json({ 
        error: 'Failed to update article',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });

  // 13. GraphQL security logging middleware
  // Логируем попытки аутентификации через GraphQL
  app.use('/api/graphql', (req, res, next) => {
    // Проверяем, является ли это запросом на аутентификацию
    if (req.method === 'POST' && req.body) {
      const body = req.body;
      const query = body.query || '';
      
      // Проверяем наличие mutation authenticateUserWithPassword
      if (query.includes('authenticateUserWithPassword')) {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.get('user-agent') || 'unknown';
        
        // Извлекаем email из переменных (если доступен)
        const variables = body.variables || {};
        const email = variables.email || 'unknown';
        
        // Логируем попытку входа
        logLoginAttempt(ip, email, userAgent);
      }

      // Логируем createArticle mutation для отладки
      if (query.includes('createArticle') || query.includes('CreateArticle')) {
        const variables = body.variables || {};
        logger.info('[GraphQL] ⚡ createArticle mutation request:', {
          query: query.substring(0, 500),
          variables: {
            ...variables,
            data: variables.data ? {
              ...variables.data,
              title: variables.data.title,
              content: variables.data.content 
                ? (Array.isArray(variables.data.content) 
                    ? `[Array of ${variables.data.content.length} blocks, first: ${JSON.stringify(variables.data.content[0] || {}).substring(0, 300)}]` 
                    : typeof variables.data.content)
                : 'undefined',
              excerpt: variables.data.excerpt,
              tags: variables.data.tags,
              difficulty: variables.data.difficulty,
              previewImage: variables.data.previewImage,
              publishedAt: variables.data.publishedAt,
            } : undefined,
          },
        });
      }
      
      // Логируем ВСЕ GraphQL запросы для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        const queryName = query.match(/(?:query|mutation)\s+(\w+)/)?.[1] || 'unknown';
        const allVariables = body.variables || {};
        logger.debug(`[GraphQL] Request: ${queryName}`, {
          query: query.substring(0, 200),
          hasVariables: !!allVariables && Object.keys(allVariables).length > 0,
        });
      }
    }
    next();
  });

  // 14. GraphQL error logging middleware
  // Логируем ошибки GraphQL ответов
  app.use('/api/graphql', (req, res, next) => {
    const originalJson = res.json;
    res.json = function (body: any) {
      if (body && body.errors) {
        logger.error('[GraphQL] GraphQL errors in response:', {
          errors: body.errors,
          path: req.path,
          method: req.method,
        });
      }
      return originalJson.call(this, body);
    };
    next();
  });

  // 15. HTTP request logging
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    })
  );

  // 16. Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Express error:', err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  });

  logger.info('✅ Express middleware configured');
}

