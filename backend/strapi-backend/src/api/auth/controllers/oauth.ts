/**
 * Кастомный контроллер для OAuth callback
 * Обрабатывает OAuth callback напрямую, обходя стандартный обработчик Strapi
 */
export default {
  async googleCallback(ctx) {
    const strapi = ctx.strapi;
    const { code } = ctx.query;
    const provider = 'google';
    
    strapi.log.info(`🔐 Custom OAuth callback for ${provider}, code: ${code ? 'present' : 'missing'}`);
    
    if (!code) {
      strapi.log.error('Missing authorization code');
      return ctx.badRequest('Missing authorization code');
    }

    try {
      // Используем стандартные сервисы Strapi для обработки OAuth
      const providersService = strapi.plugin('users-permissions').service('providers');
      const jwtService = strapi.plugin('users-permissions').service('jwt');

      // Получаем настройки провайдера
      const providerConfig = await providersService.get(provider);
      
      if (!providerConfig) {
        strapi.log.error(`Provider ${provider} not found`);
        return ctx.badRequest('Provider not configured');
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
        return ctx.badRequest('Failed to exchange authorization code');
      }

      const tokenData = await tokenResponse.json() as { access_token?: string };
      const { access_token } = tokenData;
      
      if (!access_token) {
        strapi.log.error('No access_token in response');
        return ctx.badRequest('Failed to get access token from Google');
      }

      // Получаем информацию о пользователе
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        strapi.log.error('Failed to get user information from Google');
        return ctx.badRequest('Failed to get user information');
      }

      const userInfo = await userInfoResponse.json() as { 
        email?: string; 
        email_verified?: boolean;
        name?: string;
        picture?: string;
      };
      
      if (!userInfo.email) {
        strapi.log.error('No email in user info from Google');
        return ctx.badRequest('Failed to get user email from Google');
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
        
        strapi.log.info(`✅ New user created via OAuth: ${user.id} (${userInfo.email})`);
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
        
        strapi.log.info(`✅ Existing user logged in via OAuth: ${user.id} (${userInfo.email})`);
      }

      // Генерируем JWT через стандартный сервис Strapi
      const jwt = jwtService.issue({ id: user.id });

      // Получаем redirect URL из query или используем дефолтный
      const redirectUrl = ctx.query.redirect || process.env.FRONTEND_URL || 'http://localhost:5173';
      const frontendCallback = `${redirectUrl}/auth/callback?access_token=${jwt}`;

      strapi.log.info(`🚀 Redirecting to frontend with JWT token: ${frontendCallback.substring(0, 100)}...`);
      
      // Редиректим на фронтенд с JWT токеном
      ctx.redirect(frontendCallback);
    } catch (error: any) {
      strapi.log.error('❌ OAuth callback processing failed:', error);
      return ctx.internalServerError('OAuth callback failed');
    }
  },
};

