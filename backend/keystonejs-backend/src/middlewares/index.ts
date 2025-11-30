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
import { hashEmail, isEmailHash } from '../lib/email-hash';

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
  
 
  // Используем путь /files/upload, чтобы graphql-upload точно не перехватил его
  // graphql-upload обрабатывает только запросы к /api/graphql
  app.post('/files/upload', upload.single('files'), async (req, res) => {
    try {
      logger.debug('Image upload request received (early handler):', {
        method: req.method,
        path: req.path,
        hasFile: !!req.file,
        cookies: req.headers.cookie ? 'present' : 'missing',
        contentType: req.headers['content-type'],
      });

      // Проверяем аутентификацию через KeystoneJS session
      const ctx = context || keystoneContext;
      if (!ctx) {
        logger.error('KeystoneJS context not available for image upload', {
          hasContext: !!context,
          hasKeystoneContext: !!keystoneContext,
        });
        return res.status(500).json({ error: 'KeystoneJS context not available' });
      }

      if (!ctx.sessionStrategy) {
        logger.error('KeystoneJS sessionStrategy not available', {
          hasContext: !!ctx,
          contextKeys: Object.keys(ctx || {}),
        });
        return res.status(500).json({ error: 'Session strategy not available' });
      }
      
      logger.debug('KeystoneJS context available for image upload', {
        hasSessionStrategy: !!ctx.sessionStrategy,
        sessionStrategyType: typeof ctx.sessionStrategy,
      });

      // Создаем контекст с Express request и response для sessionStrategy
      const sessionContext = {
        ...ctx,
        req: req,
        res: res,
      } as any;

      // Получаем session через sessionStrategy
      let sessionData;
      try {
        sessionData = await ctx.sessionStrategy.get({ context: sessionContext });
        logger.debug('Image upload session check:', {
          hasSession: !!sessionData,
          itemId: sessionData?.itemId,
          cookies: req.headers.cookie ? 'present' : 'missing',
        });
      } catch (sessionError: any) {
        logger.error('Session check failed for image upload:', {
          error: sessionError?.message,
          stack: sessionError?.stack,
          name: sessionError?.name,
          cookies: req.headers.cookie ? 'present' : 'missing',
        });
        return res.status(401).json({ 
          error: 'Authentication required',
          details: process.env.NODE_ENV === 'development' ? sessionError?.message : undefined,
        });
      }

      // Проверяем, что пользователь аутентифицирован
      if (!sessionData?.itemId) {
        logger.warn('Image upload attempted without authentication', {
          hasSession: !!sessionData,
          cookies: req.headers.cookie ? 'present' : 'missing',
        });
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      logger.debug('Image upload request from authenticated user:', {
        userId: sessionData.itemId,
      });

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

      logger.debug('Preparing ImgBB upload:', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        base64Length: base64Image.length,
        hasApiKey: !!imgbbApiKey,
      });

      // Загружаем изображение через ImgBB API
      const formData = new URLSearchParams();
      formData.append('key', imgbbApiKey);
      formData.append('image', base64Image);
      
      if (file.originalname) {
        formData.append('name', file.originalname);
      }
      
      const requestBody = formData.toString();
      logger.debug('ImgBB request body length:', requestBody.length);

      // Отправляем запрос к ImgBB API
      const https = await import('https');
      const timeoutMs = 30000; // 30 секунд таймаут
      
      try {
        const imgbbResponse = await new Promise<{ statusCode: number; data: any }>((resolve, reject) => {
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
                data += chunk.toString();
              });
              
              res.on('end', () => {
                clearTimeout(timeout);
                
                logger.debug('ImgBB API response:', {
                  statusCode: res.statusCode,
                  headers: res.headers,
                  dataLength: data.length,
                  dataPreview: data.substring(0, 200),
                });
                
                if (!data || data.trim().length === 0) {
                  logger.error('ImgBB API returned empty response', {
                    statusCode: res.statusCode,
                    headers: res.headers,
                  });
                  reject(new Error(`Empty response from ImgBB API (status: ${res.statusCode})`));
                  return;
                }
                
                if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
                  logger.error('ImgBB API returned error status:', {
                    statusCode: res.statusCode,
                    data: data.substring(0, 1000),
                    headers: res.headers,
                  });
                }
                
                try {
                  const jsonData = JSON.parse(data);
                  resolve({
                    statusCode: res.statusCode || 500,
                    data: jsonData,
                  });
                } catch (parseError: any) {
                  logger.error('Failed to parse ImgBB response:', {
                    error: parseError.message,
                    dataLength: data.length,
                    dataPreview: data.substring(0, 1000),
                    statusCode: res.statusCode,
                    headers: res.headers,
                    contentType: res.headers['content-type'],
                  });
                  reject(new Error(`Failed to parse response: ${parseError.message}. Status: ${res.statusCode}, Response preview: ${data.substring(0, 200)}`));
                }
              });
              
              res.on('error', (error) => {
                clearTimeout(timeout);
                logger.error('ImgBB API response error:', error);
                reject(error);
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
        logger.error('Failed to upload image to ImgBB:', {
          error: uploadError.message,
          code: uploadError.code,
          stack: uploadError.stack,
        });
        
        if (process.env.NODE_ENV === 'development') {
          return res.status(500).json({ 
            error: 'Image upload failed',
            details: uploadError.message || 'Unknown error',
            code: uploadError.code,
          });
        }
        
        return res.status(500).json({ 
          error: 'Image upload failed',
        });
      }
    } catch (error: any) {
      logger.error('Unexpected error in image upload handler:', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  });
  

  app.use((req, res, next) => {
    // Пропускаем body parser для multipart/form-data запросов (обрабатываются multer)
    if ((req.path === '/files/upload' || req.path === '/upload/img' || req.path === '/upload/image' || req.path === '/api/upload/image') && req.method === 'POST') {
      return next();
    }
    express.json()(req, res, next);
  });
  
  app.use((req, res, next) => {

    if ((req.path === '/files/upload' || req.path === '/upload/img' || req.path === '/upload/image' || req.path === '/api/upload/image') && req.method === 'POST') {
      return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
  });
  app.set('trust proxy', 1);

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
  // Специальные лимитеры для критичных операций
  // Комментарии через REST API: 1 запрос за 25 секунд
  const commentLimiter = rateLimit({
    windowMs: 25 * 1000, // 25 секунд
    max: 1, // максимум 1 запрос
    message: 'Too many comment requests, please try again later.',
    skip: (req) => {
      // Применяем только к комментариям через REST API
      return !req.path.includes('/comments');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: 'Too many comment requests',
        message: 'Too many comment requests. Please wait 25 seconds before trying again.',
        waitTime: 25,
      });
    },
  });
  app.use('/api/', commentLimiter);

  // Загрузка файлов: 5 запросов за 1 минуту
  const uploadLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 5, // максимум 5 запросов
    message: 'Too many upload requests, please try again later.',
    skip: (req) => {
      // Применяем только к загрузке файлов
      return !req.path.includes('/upload');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, req.path, userAgent);
      res.status(429).json({
        error: 'Too many upload requests',
        message: 'Too many upload requests. Please wait a minute before trying again.',
        waitTime: 60,
      });
    },
  });
  app.use('/api/', uploadLimiter);

  // Общий лимитер для остальных API endpoints
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // максимум 100 запросов с одного IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Пропускаем GraphQL endpoint (он имеет свои лимитеры)
      // Пропускаем комментарии и загрузку (у них свои лимитеры)
      return req.path === '/api/graphql' 
        || req.path.includes('/comments')
        || req.path.includes('/upload');
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
    windowMs: 5 * 60 * 1000, // 5 минут (синхронизировано с клиентом)
    max: 5, // максимум 5 попыток входа с одного IP (синхронизировано с клиентом)
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
        waitTime: 300, // 5 минут в секундах
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
      
      // Пропускаем запросы на аутентификацию
      if (query.includes('authenticateUserWithPassword')) return true;
      
      // Пропускаем все запросы от Admin UI (они содержат специфичные поля)
      // Admin UI делает запросы с полями: adminMeta, StaticAdminMeta, ItemPage, RelationshipSelect и т.д.
      const adminQueryIndicators = [
        'adminMeta',
        'StaticAdminMeta',
        'ItemPage',
        'RelationshipSelect',
        'ListPage',
        'keystone {',
        '__typename', // Admin UI часто использует __typename
      ];
      
      // Если запрос содержит хотя бы один индикатор админки - пропускаем rate limiting
      const isAdminQuery = adminQueryIndicators.some(indicator => 
        query.includes(indicator)
      );
      
      return isAdminQuery;
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

  // Rate limiting для комментариев через GraphQL
  const graphqlCommentLimiter = rateLimit({
    windowMs: 25 * 1000, // 25 секунд
    max: 1, // максимум 1 запрос
    message: 'Too many comment requests, please try again later.',
    skip: (req) => {
      // Пропускаем, если это не запрос на создание/обновление/удаление/реакцию комментария
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      const commentMutations = ['createComment', 'updateComment', 'deleteComment'];
      return !commentMutations.some(mutation => query.includes(mutation));
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (comment)', userAgent);
      res.status(429).json({
        error: 'Too many comment requests',
        message: 'Too many comment requests. Please wait 25 seconds before trying again.',
        waitTime: 25,
      });
    },
  });

  // Rate limiting для реакций на статьи и комментарии
  const graphqlReactionLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 секунд
    max: 3, // максимум 3 реакции
    message: 'Too many reaction requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('reactToArticle') && !query.includes('reactToComment');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (reaction)', userAgent);
      res.status(429).json({
        error: 'Too many reaction requests',
        message: 'Too many reaction requests. Please wait 5 seconds before trying again.',
        waitTime: 5,
      });
    },
  });

  // Rate limiting для подписок (follow/unfollow)
  const graphqlFollowLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 секунд
    max: 2, // максимум 2 подписки/отписки
    message: 'Too many follow requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('createFollow') && !query.includes('deleteFollow');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (follow)', userAgent);
      res.status(429).json({
        error: 'Too many follow requests',
        message: 'Too many follow requests. Please wait 5 seconds before trying again.',
        waitTime: 5,
      });
    },
  });

  // Rate limiting для автосохранения черновиков (более мягкий лимит)
  const graphqlDraftAutoSaveLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 10, // максимум 10 автосохранений в минуту
    message: 'Too many auto-save requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      // Только для updateDraft (автосохранение)
      return !query.includes('updateDraft') || query.includes('createArticle');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (draft auto-save)', userAgent);
      res.status(429).json({
        error: 'Too many auto-save requests',
        message: 'Too many auto-save requests. Please wait a moment before trying again.',
        waitTime: 60,
      });
    },
  });

  // Rate limiting для создания/публикации статей (строгий лимит)
  const graphqlArticleMutationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 1, // максимум 1 мутация
    message: 'Too many article mutation requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      // Только для createArticle и updateArticle (публикация), НЕ для updateDraft
      const articleMutations = ['createArticle', 'updateArticle'];
      return !articleMutations.some(mutation => query.includes(mutation));
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (article mutation)', userAgent);
      res.status(429).json({
        error: 'Too many article mutation requests',
        message: 'Too many article mutation requests. Please wait 60 seconds before trying again.',
        waitTime: 60,
      });
    },
  });

  // Rate limiting для удаления статей/черновиков
  const graphqlDeleteLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 минута
    max: 5, // максимум 5 удалений
    message: 'Too many delete requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('deleteArticle') && !query.includes('deleteDraft');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (delete)', userAgent);
      res.status(429).json({
        error: 'Too many delete requests',
        message: 'Too many delete requests. Please wait a minute before trying again.',
        waitTime: 60,
      });
    },
  });

  // Rate limiting для закладок
  const graphqlBookmarkLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 секунд
    max: 1, // максимум 1 операция
    message: 'Too many bookmark requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('createBookmark') && !query.includes('deleteBookmark');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (bookmark)', userAgent);
      res.status(429).json({
        error: 'Too many bookmark requests',
        message: 'Too many bookmark requests. Please wait 5 seconds before trying again.',
        waitTime: 5,
      });
    },
  });

  // Rate limiting для обновления профиля
  const graphqlProfileUpdateLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 секунд
    max: 1, // максимум 1 обновление профиля
    message: 'Too many profile update requests, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('updateProfile');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (profile update)', userAgent);
      res.status(429).json({
        error: 'Too many profile update requests',
        message: 'Too many profile update requests. Please wait 10 seconds before trying again.',
        waitTime: 10,
      });
    },
  });

  // Rate limiting для регистрации
  const graphqlSignUpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 минут
    max: 3, // максимум 3 попытки регистрации
    message: 'Too many sign up attempts, please try again later.',
    skip: (req) => {
      if (req.method !== 'POST' || !req.body) return true;
      const query = req.body.query || '';
      return !query.includes('createUser') || query.includes('authenticateUserWithPassword');
    },
    handler: (req, res) => {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      logRateLimitExceeded(ip, '/api/graphql (sign up)', userAgent);
      res.status(429).json({
        error: 'Too many sign up attempts',
        message: 'Too many sign up attempts. Please wait 5 minutes before trying again.',
        waitTime: 300,
      });
    },
  });

  // Применяем все лимитеры к GraphQL endpoint в правильном порядке
  // Сначала специфичные лимитеры (более строгие), потом общие
  app.use('/api/graphql', graphqlLoginLimiter);
  app.use('/api/graphql', graphqlSignUpLimiter);
  app.use('/api/graphql', graphqlCommentLimiter);
  app.use('/api/graphql', graphqlReactionLimiter);
  app.use('/api/graphql', graphqlFollowLimiter);
  app.use('/api/graphql', graphqlDraftAutoSaveLimiter); // Сначала мягкий лимит для автосохранения
  app.use('/api/graphql', graphqlArticleMutationLimiter); // Затем строгий лимит для публикации
  app.use('/api/graphql', graphqlDeleteLimiter);
  app.use('/api/graphql', graphqlBookmarkLimiter);
  app.use('/api/graphql', graphqlProfileUpdateLimiter);
  app.use('/api/graphql', graphqlLimiter); // Общий лимитер в конце
  
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


  app.use((req, res, next) => {
    // Перехватываем установку cookie через setHeader
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = function(name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie' && Array.isArray(value)) {

        value = value.map((cookie: string) => {
          if (cookie.includes('keystonejs-session=')) {

            cookie = cookie.replace(/;\s*sameSite=[^;]*/gi, '');
            cookie = cookie.replace(/;\s*secure/gi, '');
            cookie = cookie.replace(/;\s*partitioned/gi, '');
            
            // Добавляем правильные атрибуты для production (кросс-доменные запросы)
            if (process.env.NODE_ENV === 'production') {
              cookie += '; SameSite=None; Secure; Partitioned';
            } else {
              cookie += '; SameSite=Lax';
            }
            
            logger.debug('Updated keystonejs-session cookie with cross-domain attributes');
          }
          return cookie;
        });
      }
      return originalSetHeader(name, value);
    };
    const originalCookie = res.cookie.bind(res);
    res.cookie = function(name: string, value: any, options: any = {}) {
      if (name === 'keystonejs-session') {
        
        if (process.env.NODE_ENV === 'production') {
          options.sameSite = 'none';
          options.secure = true;
         
          if (!options.partitioned) {
            setTimeout(() => {
              const setCookieHeader = res.getHeader('Set-Cookie');
              if (Array.isArray(setCookieHeader)) {
                const updated = setCookieHeader.map((cookie: string) => {
                  if (cookie.includes('keystonejs-session=') && !cookie.includes('Partitioned')) {
                    return cookie + '; Partitioned';
                  }
                  return cookie;
                });
                res.setHeader('Set-Cookie', updated);
              }
            }, 0);
          }
        } else {
          options.sameSite = 'lax';
        }
      }
      return originalCookie(name, value, options);
    };
    
    next();
  });

  // 7. Session store с Redis
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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        maxAge: 7 * 24 * 60 * 60 * 1000, 

      },
      name: 'connect.sid', 
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
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не сохраняем email в session (он хеширован и не нужен)
        
        // ВАЖНО: Явно сохраняем session перед редиректом
        // Это гарантирует, что oauthUserId и oauthEmail будут доступны в последующем запросе
        await new Promise<void>((resolve, reject) => {
          (req.session as any).save((err: any) => {
            if (err) {
              logger.error('Failed to save session with oauthUserId:', err);
              reject(err);
            } else {
              logger.debug('Session saved with oauthUserId:', keystoneUser.id);
              resolve();
            }
          });
        });
        
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

      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Хешируем email перед сохранением
      const hashedEmail = hashEmail(email);

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
              email: hashedEmail, // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Сохраняем хеш email вместо оригинального
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

        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем оригинальный email для безопасности
        logger.info(`✅ First admin created via initial setup endpoint: ${admin.id}`);

        res.json({
          success: true,
          message: 'First admin created successfully',
          user: {
            id: admin.id,
            email: '', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
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

      // Отладочное логирование для диагностики проблемы с сессией
      logger.debug('OAuth session endpoint called', {
        hasSession: !!req.session,
        sessionId: (req.session as any)?.id,
        cookies: req.headers.cookie,
        sessionKeys: req.session ? Object.keys(req.session) : [],
        oauthUserIdFromSession: (req.session as any)?.oauthUserId,
        userIdFromBody: (req.body as any)?.userId,
        origin: req.headers.origin,
        referer: req.headers.referer,
      });

      // Пробуем получить userId из сессии (основной способ)
      // Если сессия не передается между доменами, используем userId из body (fallback)
      // userId передается через query параметр в редиректе и может быть передан в body
      let oauthUserId = (req.session as any)?.oauthUserId;
      
      // Fallback: если сессия не найдена, пробуем получить userId из body
      // Это безопасно, так как userId уже был передан в query параметре редиректа
      if (!oauthUserId && (req.body as any)?.userId) {
        logger.debug('Using userId from body as fallback (session not available)');
        oauthUserId = (req.body as any).userId;
      }
      
      if (!oauthUserId) {
        logger.error('OAuth session not found', {
          hasSession: !!req.session,
          sessionId: (req.session as any)?.id,
          cookies: req.headers.cookie,
          sessionKeys: req.session ? Object.keys(req.session) : [],
          userIdFromBody: (req.body as any)?.userId,
          origin: req.headers.origin,
          referer: req.headers.referer,
        });
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
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не включаем email в sessionData (он хеширован и не нужен)
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

      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не логируем email для безопасности
      logger.info(`✅ OAuth session created for user: ${user.id}`);
      
      // Логируем информацию о cookie для диагностики
      const setCookieHeader = res.getHeader('Set-Cookie');
      logger.debug('Cookie set in response:', {
        hasSetCookie: !!setCookieHeader,
        setCookieValue: setCookieHeader ? (Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader).toString().substring(0, 100) : null,
        origin: req.headers.origin,
        referer: req.headers.referer,
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          email: '', // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Не возвращаем email (даже хешированный) для безопасности
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

  // 11. Image upload endpoint - УДАЛЕН (перенесен в начало функции для обработки до graphql-upload)

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
              // ИСПРАВЛЕНИЕ: Убираем неработающий фильтр - вторая часть OR всегда true
              const lines = textContent.split('\n').filter(line => line.trim());
              
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
            
            // ИСПРАВЛЕНИЕ: Убираем неработающий фильтр - вторая часть OR всегда true
            const lines = textContent.split('\n').filter(line => line.trim());
            
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
  app.use('/api/graphql', async (req, res, next) => {
    // Проверяем, является ли это запросом на аутентификацию
    if (req.method === 'POST' && req.body) {
      const body = req.body;
      const query = body.query || '';
      
      // Проверяем наличие mutation authenticateUserWithPassword
      if (query.includes('authenticateUserWithPassword')) {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.get('user-agent') || 'unknown';
        
        // Извлекаем email из переменных (KeystoneJS использует $identity, а не $email)
        const variables = body.variables || {};
        const originalEmail = variables.identity || variables.email; // Проверяем оба варианта для совместимости
        
        logger.info('[authenticateUserWithPassword] Middleware triggered', {
          hasEmail: !!originalEmail,
          emailType: typeof originalEmail,
          isEmailHash: originalEmail ? isEmailHash(originalEmail) : 'N/A',
          emailLength: originalEmail ? originalEmail.length : 0,
          hasIdentity: !!variables.identity,
          hasEmailVar: !!variables.email,
        });
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Хешируем email и проверяем оба формата для обратной совместимости
        if (originalEmail && typeof originalEmail === 'string' && !isEmailHash(originalEmail)) {
          logger.info('[authenticateUserWithPassword] Email is not hashed, will hash it');
          try {
            // Хешируем email новым способом (HMAC-SHA256)
            const hashedEmail = hashEmail(originalEmail);
            
            // Проверяем, существует ли пользователь с новым хешем
            // Если нет - пробуем старый формат (SHA-256) и обновляем при необходимости
            const ctx = keystoneContext;
            if (ctx) {
              const { createHash } = await import('crypto');
              const hashEmailOld = (email: string): string => {
                const normalizedEmail = email.toLowerCase().trim();
                const hash = createHash('sha256');
                hash.update(normalizedEmail);
                return hash.digest('hex');
              };
              
              // Пробуем найти пользователя по новому хешу
              let user = await ctx.sudo().query.User.findMany({
                where: { email: { equals: hashedEmail } },
                take: 1,
              });
              
              logger.info(`[authenticateUserWithPassword] Checking user with new hash (HMAC-SHA256): found=${user.length > 0}`);
              
              // Если не найден по новому хешу, пробуем по старому (SHA-256)
              if (user.length === 0) {
                const oldHashedEmail = hashEmailOld(originalEmail);
                logger.info(`[authenticateUserWithPassword] User not found with new hash, trying old hash (SHA-256)`);
                user = await ctx.sudo().query.User.findMany({
                  where: { email: { equals: oldHashedEmail } },
                  take: 1,
                });
                
                logger.info(`[authenticateUserWithPassword] Checking user with old hash (SHA-256): found=${user.length > 0}`);
                
                // Если найден по старому хешу - перехешируем email с новым алгоритмом
                if (user.length > 0) {
                  logger.info(`[authenticateUserWithPassword] Found user ${user[0].id} with old email hash format, rehashing to HMAC-SHA256`);
                  await ctx.sudo().query.User.updateOne({
                    where: { id: user[0].id },
                    data: { email: hashedEmail },
                  });
                  
                  // Проверяем, что обновление прошло успешно
                  const updatedUser = await ctx.sudo().query.User.findMany({
                    where: { id: { equals: user[0].id } },
                    query: 'id email',
                    take: 1,
                  });
                  
                  if (updatedUser.length > 0 && updatedUser[0].email === hashedEmail) {
                    logger.info(`[authenticateUserWithPassword] Rehashed email for user ${user[0].id} from old format to HMAC-SHA256 - verified`);
                  } else {
                    logger.error(`[authenticateUserWithPassword] Failed to verify email rehash for user ${user[0].id}`);
                  }
                } else {
                  logger.warn(`[authenticateUserWithPassword] User not found with either hash format - authentication will likely fail`);
                }
              } else {
                logger.info(`[authenticateUserWithPassword] User found with new hash (HMAC-SHA256)`);
              }
            } else {
              logger.warn('[authenticateUserWithPassword] KeystoneJS context not available for email hash migration check');
            }
            
            // Передаем новый хеш в KeystoneJS (всегда используем новый формат)
            // Обновляем variables.identity, так как KeystoneJS использует $identity
            variables.identity = hashedEmail;
            // Также обновляем variables.email на случай, если где-то используется старый формат
            if (variables.email) {
              variables.email = hashedEmail;
            }
            body.variables = variables;
            logger.info('[authenticateUserWithPassword] Email hashed and passed to KeystoneJS (HMAC-SHA256)');
          } catch (error) {
            logger.error('[authenticateUserWithPassword] Failed to hash email:', error);
            // В случае ошибки не передаем хешированный email, пусть KeystoneJS обработает оригинальный
          }
        } else if (originalEmail && isEmailHash(originalEmail)) {
          logger.info('[authenticateUserWithPassword] Email already hashed, passing to KeystoneJS as-is');
        } else {
          logger.warn('[authenticateUserWithPassword] Email is missing or invalid', {
            hasEmail: !!originalEmail,
            emailType: typeof originalEmail,
            hasIdentity: !!variables.identity,
            hasEmailVar: !!variables.email,
          });
        }
        
        // Логируем попытку входа
        logLoginAttempt(ip, 'hidden', userAgent);
      }

      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Хешируем email для операций сброса пароля
      if (query.includes('sendUserPasswordResetLink') || 
          query.includes('redeemUserPasswordResetToken') || 
          query.includes('validateUserPasswordResetToken')) {
        const variables = body.variables || {};
        if (variables.email && typeof variables.email === 'string' && !isEmailHash(variables.email)) {
          try {
            variables.email = hashEmail(variables.email);
            body.variables = variables;
            logger.debug('Email hashed for password reset operation', {
              operation: query.match(/(sendUserPasswordResetLink|redeemUserPasswordResetToken|validateUserPasswordResetToken)/)?.[1] || 'unknown',
              // НЕ логируем оригинальный email для безопасности
            });
          } catch (error) {
            logger.error('Failed to hash email for password reset operation:', error);
          }
        }
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
  // Логируем ошибки GraphQL ответов и результаты аутентификации
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
      
      // Логируем результат аутентификации
      if (req.body && req.body.query && req.body.query.includes('authenticateUserWithPassword')) {
        if (body && body.data && body.data.authenticate) {
          const authResult = body.data.authenticate;
          if (authResult.__typename === 'UserAuthenticationWithPasswordSuccess') {
            logger.info('[authenticateUserWithPassword] Authentication successful', {
              userId: authResult.item?.id,
            });
          } else if (authResult.__typename === 'UserAuthenticationWithPasswordFailure') {
            logger.warn('[authenticateUserWithPassword] Authentication failed', {
              message: authResult.message,
            });
          }
        } else if (body && body.errors) {
          logger.error('[authenticateUserWithPassword] Authentication error in response', {
            errors: body.errors,
          });
        }
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





