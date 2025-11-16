/**
 * Расширение users-permissions plugin для правильной обработки OAuth
 * 
 * Используем стандартный подход Strapi через extension
 */
export default (plugin) => {
  // Сохраняем оригинальный callback
  const originalCallback = plugin.controllers.auth.callback;

  // Полностью заменяем callback, но используем стандартные сервисы Strapi
  plugin.controllers.auth.callback = async (ctx) => {
    // Получаем strapi из контекста запроса
    const strapi = ctx.strapi;
    
    const provider = ctx.params.provider || 'google';
    const { code } = ctx.query;
    
    strapi.log.info(`OAuth callback for provider: ${provider}, code: ${code ? 'present' : 'missing'}`);
    
    if (!code) {
      // Если нет code, пробуем вызвать оригинальный callback
      try {
        return await originalCallback(ctx);
      } catch (error: any) {
        strapi.log.error('Original callback failed:', error);
        return ctx.badRequest('Missing authorization code');
      }
    }

    try {
      // Используем стандартные сервисы Strapi для обработки OAuth
      const providersService = strapi.plugin('users-permissions').service('providers');
      const jwtService = strapi.plugin('users-permissions').service('jwt');

      // Получаем настройки провайдера
      const providerConfig = await providersService.get(provider);
      
      if (!providerConfig) {
        strapi.log.warn(`Provider ${provider} not found, trying original callback`);
        return await originalCallback(ctx);
      }

      strapi.log.info(`Processing OAuth with provider config for: ${provider}`);

      // Обмениваем code на access_token через Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code as string,
          client_id: providerConfig.key,
          client_secret: providerConfig.secret,
          redirect_uri: providerConfig.callback,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        strapi.log.error('Failed to exchange code for token:', errorText);
        // Пробуем оригинальный callback как fallback
        return await originalCallback(ctx);
      }

      const tokenData = await tokenResponse.json() as { access_token?: string };
      const { access_token } = tokenData;
      
      if (!access_token) {
        strapi.log.warn('No access_token in response, trying original callback');
        return await originalCallback(ctx);
      }

      // Получаем информацию о пользователе
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        strapi.log.error('Failed to get user information from Google');
        return await originalCallback(ctx);
      }

      const userInfo = await userInfoResponse.json() as { email?: string; email_verified?: boolean };
      
      if (!userInfo.email) {
        strapi.log.error('No email in user info from Google');
        return await originalCallback(ctx);
      }

      // Ищем или создаем пользователя
      const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { email: userInfo.email },
        limit: 1,
      });

      let user = users?.[0] || null;

      if (!user) {
        const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
          filters: { type: 'authenticated' },
          limit: 1,
        });

        if (!roles?.[0]) {
          strapi.log.error('Default authenticated role not found');
          return ctx.internalServerError('Default role not found');
        }

        const baseUsername = userInfo.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
        let username = baseUsername;
        let attempts = 0;

        while (attempts < 10) {
          const existing = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { username },
            limit: 1,
          });
          if (existing.length === 0) break;
          username = `${baseUsername}_${Date.now()}_${attempts}`;
          attempts++;
        }

        user = await strapi.entityService.create('plugin::users-permissions.user', {
          data: {
            username,
            email: userInfo.email,
            provider,
            confirmed: userInfo.email_verified !== false,
            blocked: false,
            role: roles[0].id,
          },
        });
        
        strapi.log.info(`New user created via OAuth: ${user.id} (${userInfo.email})`);
      } else {
        // Обновляем провайдер, если нужно
        const userWithProvider = user as any;
        if (userWithProvider.provider !== provider) {
          user = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
            data: { provider },
          });
        }
        
        if (user.blocked) {
          return ctx.forbidden('User account is blocked');
        }
      }

      // Генерируем JWT через стандартный сервис Strapi
      const jwt = jwtService.issue({ id: user.id });

      // Получаем redirect URL из query или используем дефолтный
      const redirectUrl = ctx.query.redirect || process.env.FRONTEND_URL || 'http://localhost:5173';
      const frontendCallback = `${redirectUrl}/auth/callback?access_token=${jwt}`;

      strapi.log.info(`Redirecting to frontend with JWT token`);
      
      // Редиректим на фронтенд с JWT токеном
      ctx.redirect(frontendCallback);
    } catch (error: any) {
      strapi.log.error('OAuth callback processing failed:', error);
      // В случае ошибки пробуем оригинальный callback
      try {
        return await originalCallback(ctx);
      } catch (originalError) {
        strapi.log.error('Original callback also failed:', originalError);
        return ctx.internalServerError('OAuth callback failed');
      }
    }
  };

  return plugin;
};

