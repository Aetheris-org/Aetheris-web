/**
 * Расширение плагина users-permissions для кастомного OAuth callback
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from '../../services/session-store';
import { refreshTokenService } from '../../services/refresh-token';
import { csrfTokenService } from '../../services/csrf-token';

/**
 * Генерирует псевдо-email из реального email для защиты персональных данных
 * Использует HMAC-SHA256 для безопасного хеширования
 */
function generatePseudoEmail(realEmail: string): string {
  let secret = process.env.EMAIL_HASH_SECRET;
  
  // CRITICAL: В production EMAIL_HASH_SECRET обязателен
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: EMAIL_HASH_SECRET is not set in production environment. Application cannot start.');
    }
    // В development используем APP_KEYS как fallback с предупреждением
    const fallbackSecret = process.env.APP_KEYS?.split(',')[0];
    if (!fallbackSecret) {
      throw new Error('EMAIL_HASH_SECRET is required. Please set it in your .env file.');
    }
    console.warn('⚠️  WARNING: Using APP_KEYS as EMAIL_HASH_SECRET fallback. Set EMAIL_HASH_SECRET in production!');
    secret = fallbackSecret;
  }
  
  // Нормализуем email: lowercase и trim
  const normalizedEmail = String(realEmail || '').toLowerCase().trim();
  
  // Генерируем HMAC-SHA256 хеш
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(normalizedEmail)
    .digest('hex');
  
  // Берём первые 16 символов хеша для псевдо-email
  const pseudoEmail = `hash-${hmac.substring(0, 16)}@internal.local`;
  
  return pseudoEmail;
}

interface GoogleGrantConfig {
  enabled: boolean;
  key: string;
  secret: string;
  callback: string;
}

interface GrantConfig {
  google?: GoogleGrantConfig;
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  verified_email: boolean;
  picture?: string;
}

export default (plugin) => {
  console.log('🔵 Loading strapi-server.ts extension...');
  
  /**
   * Custom connect handler - генерирует state token для CSRF защиты
   */
  const customConnect = async (ctx) => {
    const provider = ctx.params.provider || 'google';
    console.log(`🔵 OAuth connect initiated for provider: ${provider}`);
    
    try {
      // Получаем конфигурацию провайдера
      const pluginStore = await strapi.store({
        type: 'plugin',
        name: 'users-permissions',
        key: 'grant',
      });
      const grantConfig = (await pluginStore.get()) as GrantConfig | null;
      
      if (!grantConfig?.google?.enabled) {
        return ctx.badRequest('Google provider is not enabled');
      }
      
      const googleConfig = grantConfig.google!;
      
      // Генерируем OAuth state token для CSRF защиты
      const state = uuidv4();
      
      // Сохраняем state в session store на 5 минут
      await sessionStore.saveOAuthState(state, 300);
      
      console.log(`🔵 Generated OAuth state token: ${state.substring(0, 8)}...`);
      
      // Формируем Google OAuth URL с state parameter
      const redirectUri = googleConfig.callback || `${process.env.PUBLIC_URL || 'http://localhost:1337'}/api/connect/google/callback`;
      const scope = encodeURIComponent('email profile');
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(googleConfig.key)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${scope}` +
        `&state=${state}` + // CSRF protection
        `&access_type=offline` +
        `&prompt=consent`;
      
      console.log(`🔵 Redirecting to Google OAuth with state protection`);
      ctx.redirect(googleAuthUrl);
    } catch (err) {
      console.error('❌ OAuth connect error:', err);
      return ctx.badRequest('OAuth connection failed');
    }
  };
  
  // Кастомный callback контроллер
  const customCallback = async (ctx) => {
    console.log(`🔵🔵🔵 CUSTOM CALLBACK CALLED! 🔵🔵🔵`);
    
    // Определяем провайдера из пути URL
    const pathMatch = ctx.request.path.match(/\/connect\/(\w+)\/callback/);
    const provider = pathMatch ? pathMatch[1] : 'google';

    console.log(`🔵 OAuth callback called for provider: ${provider}`);
    console.log(`🔵 Query params:`, ctx.query);
    console.log(`🔵 Request URL: ${ctx.request.url}`);
    console.log(`🔵 Request path: ${ctx.request.path}`);

    try {
      // SECURITY: Проверяем OAuth state для защиты от CSRF
      const state = ctx.query.state as string;
      if (!state) {
        console.error('❌ Missing OAuth state parameter');
        throw new Error('Missing state parameter - possible CSRF attack');
      }
      
      const isStateValid = await sessionStore.validateOAuthState(state);
      if (!isStateValid) {
        console.error('❌ Invalid OAuth state:', state.substring(0, 8));
        throw new Error('Invalid state parameter - possible CSRF attack');
      }
      
      console.log('✅ OAuth state validated successfully');
      
      // Проверяем наличие code (это OAuth2 authorization code flow)
      if (!ctx.query.code) {
        throw new Error('Authorization code is missing');
      }

      // Получаем конфигурацию Google провайдера
      const pluginStore = await strapi.store({
        type: 'plugin',
        name: 'users-permissions',
        key: 'grant',
      });
      const grantConfig = (await pluginStore.get()) as GrantConfig | null;
      
      console.log('🔵 Grant config loaded:', {
        hasGoogle: !!grantConfig?.google,
        googleEnabled: grantConfig?.google?.enabled,
      });

      if (!grantConfig?.google?.enabled) {
        throw new Error('Google provider is not enabled');
      }

      const googleConfig = grantConfig.google!; // TypeScript: уже проверили выше

      // Формируем redirect_uri - должен точно совпадать с тем, что в Google Console
      const redirectUri = googleConfig.callback || `${process.env.PUBLIC_URL || 'http://localhost:1337'}/api/connect/google/callback`;
      
      console.log('🔵 Google config:', {
        key: googleConfig.key ? `${googleConfig.key.substring(0, 20)}...` : 'missing',
        secret: googleConfig.secret ? '***' : 'missing',
        callback: googleConfig.callback,
        redirectUri: redirectUri,
      });

      // Обмениваем authorization code на access_token
      // ВАЖНО: Увеличиваем таймаут для fetch запросов к Google API (30 секунд)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут
      
      let tokenResponse: Response;
      try {
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: ctx.query.code as string,
          client_id: googleConfig.key,
          client_secret: googleConfig.secret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
          signal: controller.signal,
      });
        clearTimeout(timeoutId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
          console.error('❌ Google OAuth token exchange timeout:', fetchError.message);
          throw new Error('Connection timeout: Unable to reach Google OAuth server. Please check your internet connection and try again.');
        }
        throw fetchError;
      }

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Google token exchange failed:', errorText);
        throw new Error(`Failed to exchange code for token: ${tokenResponse.status}`);
      }

      const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
      console.log('🔵 Google token received:', {
        hasAccessToken: !!tokenData.access_token,
        tokenType: tokenData.token_type,
      });

      // Получаем данные пользователя от Google
      // ВАЖНО: Увеличиваем таймаут для fetch запросов к Google API (30 секунд)
      const userInfoController = new AbortController();
      const userInfoTimeoutId = setTimeout(() => userInfoController.abort(), 30000); // 30 секунд таймаут
      
      let userInfoResponse: Response;
      try {
        userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
          signal: userInfoController.signal,
      });
        clearTimeout(userInfoTimeoutId);
      } catch (fetchError: any) {
        clearTimeout(userInfoTimeoutId);
        if (fetchError.name === 'AbortError' || fetchError.code === 'UND_ERR_CONNECT_TIMEOUT') {
          console.error('❌ Google user info fetch timeout:', fetchError.message);
          throw new Error('Connection timeout: Unable to fetch user info from Google. Please check your internet connection and try again.');
        }
        throw fetchError;
      }

      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
      }

      const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;
      
      // Генерируем псевдо-email для защиты персональных данных
      const pseudoEmail = generatePseudoEmail(googleUser.email);
      
      console.log('🔵 Google user data received:', {
        verified: googleUser.verified_email,
        pseudoEmail: pseudoEmail,
      });

      // Ищем или создаём пользователя в Strapi по псевдо-email
      let user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { email: pseudoEmail },
      });

      const defaultRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (!user) {
        // Создаём нового пользователя с псевдо-email
        // ВАЖНО: username оставляем null, чтобы не показывать хеш на фронтенде
        user = await strapi.db.query('plugin::users-permissions.user').create({
          data: {
            username: `user_${Date.now()}`, // Временный уникальный username (не хеш!)
            email: pseudoEmail,              // Храним только хеш, не реальный email
            provider: 'google',
            confirmed: true,
            blocked: false,
            role: defaultRole.id,
          },
        });
        console.log(`🔵 Created new user with hashed email (ID: ${user.id})`);
      } else {
        console.log(`🔵 Existing user found (ID: ${user.id})`);
      }

      // Генерируем Strapi JWT (15 минут)
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });

      // Генерируем refresh token (7 дней)
      const refreshToken = await refreshTokenService.create(user.id);

      console.log(`✅ OAuth success for user ID: ${user.id}, JWT length: ${jwt.length}`);

      // SECURITY: Устанавливаем tokens в HttpOnly cookies вместо URL
      // Access token (15 минут) - может быть прочитан JS для API запросов
      ctx.cookies.set('accessToken', jwt, {
        httpOnly: false, // Фронтенд должен читать для Authorization header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      // Refresh token (7 дней) - полностью защищён от XSS
      ctx.cookies.set('refreshToken', refreshToken, {
        httpOnly: true, // SECURITY: Недоступен для JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      // Редиректим на фронтенд БЕЗ токена в URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/auth/callback`;
      
      console.log(`🔵 Redirecting to: ${redirectUrl} (tokens in cookies)`);
      
      ctx.redirect(redirectUrl);
    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error message:', err.message);
      console.error('❌ Error stack:', err.stack);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorMsg = err.message || 'Authentication failed';
      console.error(`❌ Redirecting to frontend with error: ${errorMsg}`);
      ctx.redirect(`${frontendUrl}/auth?error=${encodeURIComponent(errorMsg)}`);
    }
  };

  // Переопределяем контроллер
  plugin.controllers.auth.callback = customCallback;
  
  // Находим и переопределяем ВСЕ роуты с callback
  console.log(`🔵 Total routes before: ${plugin.routes['content-api'].routes.length}`);
  
  // Логируем все роуты для отладки
  console.log('🔵 All routes:');
  plugin.routes['content-api'].routes.forEach((route, index) => {
    if (route.path.includes('callback') || route.path.includes('connect')) {
      console.log(`  [${index}] ${route.method} ${route.path} -> handler: ${route.handler}`);
    }
  });
  
  // Удаляем все существующие callback и connect роуты
  // Важно: роут /connect/(.*) перехватывает всё, включая callback
  plugin.routes['content-api'].routes = plugin.routes['content-api'].routes.filter(
    (route) => {
      const isCallback = route.path.includes('callback');
      const isConnectRegex = route.path === '/connect/(.*)' || route.path === '/connect/(.*)/';
      const shouldRemove = isCallback || isConnectRegex;
      
      if (shouldRemove) {
        console.log(`🔵 Removing route: ${route.method} ${route.path} (handler: ${route.handler})`);
      }
      return !shouldRemove;
    }
  );
  
  console.log(`🔵 Total routes after filtering: ${plugin.routes['content-api'].routes.length}`);
  
  // Добавляем наш кастомный роут ПЕРВЫМ (чтобы он сработал первым)
  // Важно: добавляем оба варианта пути, так как Strapi может использовать любой
  // Используем прямой вызов функции, а не строку-резолвер
  plugin.routes['content-api'].routes.unshift(
    {
      // Явный точный маршрут для Google, чтобы гарантировать перехват
      method: 'GET',
      path: '/connect/google/callback',
      handler: customCallback, // Прямая функция вместо строки
      config: {
        prefix: '',
        policies: [],
        auth: false,
        // ADMIN: скрываем от админки (не показывать в Settings → Roles)
        admin: false,
      },
    },
    {
      method: 'GET',
      path: '/connect/:provider/callback',
      handler: customCallback, // Прямая функция вместо строки
      config: {
        prefix: '',
        policies: [],
        auth: false,
        // ADMIN: скрываем от админки (не показывать в Settings → Roles)
        admin: false,
      },
    },
    {
      method: 'GET',
      path: '/auth/:provider/callback',
      handler: customCallback, // Прямая функция вместо строки
      config: {
        prefix: '',
        policies: [],
        auth: false,
        // ADMIN: скрываем от админки (не показывать в Settings → Roles)
        admin: false,
      },
    }
  );
  
  // Также добавляем роут для /connect/:provider (без callback) - редирект на Google с state token
  // Это нужно, чтобы /connect/google работал
  plugin.routes['content-api'].routes.unshift({
    method: 'GET',
    path: '/connect/:provider',
    handler: customConnect, // SECURITY: Наш handler с CSRF protection
    config: {
      prefix: '',
      policies: [],
      auth: false,
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });
  
  console.log(`🔵 Total routes after adding custom: ${plugin.routes['content-api'].routes.length}`);
  console.log('✅ strapi-server.ts extension loaded successfully');

  // Кастомный контроллер для обновления профиля
  const updateMeController = async (ctx) => {
    console.log('🔵 PUT /api/users/me called');
    console.log('🔵 User:', ctx.state.user ? { id: ctx.state.user.id } : 'not authenticated');
    
    const userId = ctx.state.user?.id;

    if (!userId) {
      console.error('❌ Unauthorized: no user in state');
      return ctx.unauthorized('You must be logged in');
    }

    // Поддержка обоих форматов: { username } и { data: { username } }
    const requestData = ctx.request.body.data || ctx.request.body;
    console.log('🔵 Request body:', requestData);

    const updateData: any = {};

    // Обработка username (если передан)
    if (requestData.username !== undefined) {
      const username = requestData.username;
      
      if (typeof username !== 'string') {
        return ctx.badRequest('Username must be a string');
    }

    const trimmed = username.trim();
    if (trimmed.length < 3 || trimmed.length > 24) {
      return ctx.badRequest('Username must be between 3 and 24 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return ctx.badRequest('Username can only contain letters, numbers, hyphens and underscores');
    }

      // Проверка уникальности
      const existing = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { username: trimmed } });

      if (existing && existing.id !== userId) {
        return ctx.badRequest('This username is already taken');
      }

      updateData.username = trimmed;
    }

    // Обработка bio (если передан)
    if (requestData.bio !== undefined) {
      if (requestData.bio === null) {
        updateData.bio = null;
      } else if (typeof requestData.bio === 'string') {
        if (requestData.bio.length > 300) {
          return ctx.badRequest('Bio must be no more than 300 characters');
        }
        updateData.bio = requestData.bio.trim() || null;
      } else {
        return ctx.badRequest('Bio must be a string or null');
      }
    }

    // Обработка avatar (если передан)
    if (requestData.avatar !== undefined) {
      if (requestData.avatar === null) {
        // Удаляем аватар (устанавливаем null)
        updateData.avatar = null;
      } else if (typeof requestData.avatar === 'string' || typeof requestData.avatar === 'number') {
        // Avatar - это ID файла (строка или число)
        const avatarId = typeof requestData.avatar === 'string' ? parseInt(requestData.avatar, 10) : requestData.avatar;
        
        if (isNaN(avatarId) || avatarId <= 0) {
          return ctx.badRequest('Avatar must be a valid file ID');
        }

        // Проверяем что файл существует
        const file = await strapi.db
          .query('plugin::upload.file')
          .findOne({ where: { id: avatarId } });

        if (!file) {
          return ctx.badRequest('Avatar file not found');
        }

        updateData.avatar = avatarId;
      } else {
        return ctx.badRequest('Avatar must be a file ID (number or string) or null');
      }
    }

    // Проверяем что есть хотя бы одно поле для обновления
    if (Object.keys(updateData).length === 0) {
      return ctx.badRequest('No fields to update');
    }

    try {
      console.log('🔵 Updating user with data:', updateData);

      // Используем entityService для обновления (поддерживает медиа-связи)
      await strapi.entityService.update(
        'plugin::users-permissions.user',
        userId,
        {
          data: updateData,
        }
      );

      // После обновления получаем пользователя с populate для корректного возврата
      // В Strapi v5 update может не возвращать populate правильно, поэтому делаем findOne
      const updatedUser: any = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        userId,
        {
          populate: {
            avatar: {
              fields: ['url']
            }
          } as any,
        }
      );

      // Убираем чувствительные данные
      if (updatedUser) {
        delete updatedUser.password;
        delete updatedUser.resetPasswordToken;
        delete updatedUser.confirmationToken;
      }

      // Детальное логирование avatar для отладки
      console.log('✅ User updated successfully:', { 
        id: updatedUser.id, 
        username: updatedUser.username,
        hasAvatar: !!updatedUser.avatar,
        avatarType: typeof updatedUser.avatar,
        avatarValue: updatedUser.avatar ? JSON.stringify(updatedUser.avatar, null, 2) : 'null'
      });

      ctx.send(updatedUser);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error stack:', error.stack);
      ctx.internalServerError('Failed to update profile');
    }
  };

  // Добавляем кастомный роут для обновления своего профиля
  // Важно: добавляем ПЕРЕД другими роутами, чтобы он перехватывал запрос
  plugin.routes['content-api'].routes.unshift({
    method: 'PUT',
    path: '/users/me',
    handler: updateMeController, // Прямая функция вместо строки
    config: {
      prefix: '',
      policies: [],
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });

  // Также добавляем контроллер в plugin.controllers для совместимости
  plugin.controllers.user.updateMe = updateMeController;

  // Логируем все PUT роуты для отладки
  console.log('🔵 PUT routes after adding updateMe:');
  plugin.routes['content-api'].routes.forEach((route, index) => {
    if (route.method === 'PUT') {
      console.log(`  [${index}] ${route.method} ${route.path} -> handler: ${typeof route.handler}`);
    }
  });

  /**
   * Refresh Token Endpoint
   * Обменивает refresh token на новый access token
   */
  const refreshTokenHandler = async (ctx) => {
    console.log('🔵 POST /api/auth/refresh called');
    
    try {
      // Получаем refresh token из HttpOnly cookie
      const refreshToken = ctx.cookies.get('refreshToken');
      
      if (!refreshToken) {
        console.error('❌ No refresh token in cookies');
        return ctx.unauthorized('No refresh token provided');
      }
      
      console.log(`🔵 Validating refresh token: ${refreshToken.substring(0, 8)}...`);
      
      // Валидируем refresh token и получаем userId
      const userId = await refreshTokenService.validate(refreshToken);
      
      if (!userId) {
        console.error('❌ Invalid or expired refresh token');
        return ctx.unauthorized('Invalid or expired refresh token');
      }
      
      console.log(`✅ Refresh token valid for user ${userId}`);
      
      // Получаем пользователя
      const user = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { id: userId } });
      
      if (!user) {
        console.error(`❌ User ${userId} not found`);
        return ctx.unauthorized('User not found');
      }
      
      // Генерируем новый access token (15 минут)
      const newAccessToken = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });
      
      // Генерируем новый refresh token (7 дней) - token rotation
      const newRefreshToken = await refreshTokenService.create(user.id);
      
      // Устанавливаем новый refresh token в HttpOnly cookie
      ctx.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });
      
      console.log(`✅ Tokens refreshed for user ${userId}`);
      
      // Возвращаем новый access token
      ctx.send({
        jwt: newAccessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('❌ Refresh token error:', error);
      return ctx.internalServerError('Failed to refresh token');
    }
  };

  // Добавляем refresh token endpoint
  plugin.routes['content-api'].routes.unshift({
    method: 'POST',
    path: '/auth/refresh',
    handler: refreshTokenHandler,
    config: {
      prefix: '',
      policies: [],
      auth: false, // Не требует authentication, только refresh token cookie
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });

  /**
   * Logout Endpoint
   * SECURITY: Удаляет refresh token из Redis и очищает cookies
   */
  const logoutHandler = async (ctx) => {
    console.log('🔵 POST /api/auth/logout called');
    
    try {
      // Получаем refresh token из HttpOnly cookie
      const refreshToken = ctx.cookies.get('refreshToken');
      
      if (refreshToken) {
        // Удаляем refresh token из Redis (revoke)
        await refreshTokenService.revoke(refreshToken);
        console.log(`✅ Refresh token revoked: ${refreshToken.substring(0, 8)}...`);
      }
      
      // Очищаем оба cookie (access + refresh)
      ctx.cookies.set('accessToken', null, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      });
      
      ctx.cookies.set('refreshToken', null, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/',
      });
      
      console.log('✅ User logged out successfully');
      
      ctx.send({
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Даже если есть ошибка, очищаем cookies
      ctx.cookies.set('accessToken', null, { maxAge: 0, path: '/' });
      ctx.cookies.set('refreshToken', null, { maxAge: 0, path: '/' });
      return ctx.internalServerError('Logout failed, but cookies cleared');
    }
  };

  // Добавляем logout endpoint
  plugin.routes['content-api'].routes.unshift({
    method: 'POST',
    path: '/auth/logout',
    handler: logoutHandler,
    config: {
      prefix: '',
      policies: [],
      auth: false, // Не требует authentication (можно вызвать даже с expired token)
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });

  /**
   * CSRF Token Endpoint
   * SECURITY: Генерирует CSRF token для защиты от CSRF атак
   */
  const csrfTokenHandler = async (ctx) => {
    console.log('🔵 GET /api/auth/csrf called');
    
    try {
      // Получаем IP адрес клиента
      const ip = ctx.ip || ctx.request.ip || 'unknown';
      
      // Генерируем CSRF token
      const csrfToken = await csrfTokenService.generate(ip);
      
      console.log(`✅ CSRF token generated for IP ${ip}`);
      
      ctx.send({
        csrfToken,
      });
    } catch (error) {
      console.error('❌ CSRF token generation error:', error);
      return ctx.internalServerError('Failed to generate CSRF token');
    }
  };

  // Добавляем CSRF token endpoint
  plugin.routes['content-api'].routes.unshift({
    method: 'GET',
    path: '/auth/csrf',
    handler: csrfTokenHandler,
    config: {
      prefix: '',
      policies: [],
      auth: false, // Публичный endpoint
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });

  /**
   * Avatar Upload Endpoint
   * SECURITY: Загружает файл через серверные права (обходит проблему с правами Upload плагина)
   */
  const avatarUploadHandler = async (ctx) => {
    console.log('📤 POST /api/users/avatar/upload called');
    console.log('📤 Request headers:', ctx.request.headers);
    console.log('📤 Request files:', ctx.request.files ? Object.keys(ctx.request.files) : 'no files object');
    
    try {
      // Проверяем авторизацию
      const userId = ctx.state.user?.id;
      if (!userId) {
        console.warn('❌ Avatar upload: unauthorized');
        return ctx.unauthorized('Authentication required');
      }
      
      console.log(`📤 Avatar upload for user ID: ${userId}`);
      
      // В Strapi v5 файлы могут быть в ctx.request.files.files или напрямую ctx.request.files
      let files = null;
      
      if (ctx.request.files?.files) {
        files = Array.isArray(ctx.request.files.files) 
          ? ctx.request.files.files 
          : [ctx.request.files.files];
      } else if (ctx.request.files && Object.keys(ctx.request.files).length > 0) {
        // Если файлы в корне ctx.request.files
        const fileKeys = Object.keys(ctx.request.files);
        files = fileKeys.map(key => ctx.request.files[key]).flat();
      }
      
      if (!files || files.length === 0) {
        console.warn('❌ Avatar upload: no file provided');
        console.warn('  - ctx.request.files:', ctx.request.files);
        console.warn('  - ctx.request.body:', ctx.request.body);
        return ctx.badRequest('No file provided');
      }
      
      console.log(`📤 Found ${files.length} file(s) to upload`);
      
      // Используем Strapi Upload Service для загрузки файла
      // Это работает от имени сервера, поэтому имеет все права
      const uploadService = strapi.plugin('upload').service('upload');
      
      console.log(`📤 Uploading ${files.length} file(s) via Strapi Upload Service...`);
      
      const uploadedFiles = await uploadService.upload({
        data: {},
        files: files,
      });
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        console.error('❌ Avatar upload: Strapi upload service returned no files');
        return ctx.internalServerError('Upload failed');
      }
      
      const uploadedFile = uploadedFiles[0];
      
      // ВАЖНО: Проверяем что файл действительно валидный
      if (!uploadedFile.id || !uploadedFile.url) {
        console.error('❌ Avatar upload: Invalid file data:', uploadedFile);
        return ctx.internalServerError('Upload failed: invalid file data');
      }
      
      // Проверяем что файл существует на диске
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', uploadedFile.url);
      
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.error('❌ Avatar upload: File is empty (0 bytes)');
          return ctx.internalServerError('Upload failed: file is empty');
        }
        console.log(`✅ Avatar file validated: ${stats.size} bytes, path: ${filePath}`);
      } catch (err) {
        console.error('❌ Avatar upload: File not found on disk:', filePath, err);
        // Не возвращаем ошибку, т.к. файл может быть еще обрабатываться
        console.warn('⚠️  Continuing despite file check error (file may be processing)');
      }
      
      console.log(`✅ Avatar uploaded successfully, file ID: ${uploadedFile.id}, URL: ${uploadedFile.url}`);
      
      // Возвращаем ID файла (frontend будет использовать его для связывания с пользователем)
      ctx.send({
        id: uploadedFile.id,
        url: uploadedFile.url,
      });
    } catch (error) {
      console.error('❌ Avatar upload error:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error stack:', error.stack);
      return ctx.internalServerError(`Upload failed: ${error.message}`);
    }
  };

  // Добавляем avatar upload endpoint
  plugin.routes['content-api'].routes.unshift({
    method: 'POST',
    path: '/users/avatar/upload',
    handler: avatarUploadHandler,
    config: {
      prefix: '',
      policies: [],
      // auth не указываем - по умолчанию требует авторизации
      // ADMIN: скрываем от админки (не показывать в Settings → Roles)
      admin: false,
    },
  });

  console.log(`🔵 Total routes final: ${plugin.routes['content-api'].routes.length}`);
  
  return plugin;
};

