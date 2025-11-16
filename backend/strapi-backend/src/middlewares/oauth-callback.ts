/**
 * Middleware для перехвата OAuth callback и обработки напрямую
 * Это гарантирует, что мы обработаем callback ДО стандартного обработчика Strapi
 */
export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Перехватываем инициацию OAuth для Google - изменяем redirect_uri перед редиректом на Google
    if (ctx.url.includes('/api/connect/google') && ctx.method === 'GET' && !ctx.url.includes('/callback')) {
      // Продолжаем стандартную обработку Strapi, но после редиректа изменим redirect_uri
      await next();
      
      // Если Strapi вернул редирект на Google, перехватываем его и изменяем redirect_uri
      if (ctx.status === 302 && ctx.response.headers.location) {
        const redirectUrl = ctx.response.headers.location;
        
        // Проверяем, что это редирект на Google OAuth
        if (redirectUrl.includes('accounts.google.com') || redirectUrl.includes('oauth2.googleapis.com')) {
          const isProduction = process.env.NODE_ENV === 'production';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const backendUrl = strapi.config.get('server.url') || 
                            process.env.PUBLIC_URL || 
                            'http://localhost:1337';
          
          // Правильный redirect_uri для development (через прокси) или production (прямой)
          const correctRedirectUri = isProduction 
            ? `${backendUrl}/api/connect/google/callback`
            : `${frontendUrl}/api/connect/google/callback`;
          
          // Парсим URL и заменяем redirect_uri
          try {
            const url = new URL(redirectUrl);
            url.searchParams.set('redirect_uri', correctRedirectUri);
            
            strapi.log.info(`🔧 Fixed OAuth redirect_uri: ${correctRedirectUri}`);
            ctx.redirect(url.toString());
            return;
          } catch (error) {
            strapi.log.warn('⚠️ Failed to fix OAuth redirect_uri:', error);
          }
        }
      }
      return;
    }
    
    // Перехватываем OAuth callback для Google
    if (ctx.url.includes('/api/connect/google/callback') && ctx.method === 'GET') {
      const { code } = ctx.query;
      
      if (code) {
        strapi.log.info('🔄 Intercepting Google OAuth callback, processing with custom handler');
        
        // Обрабатываем OAuth callback напрямую в middleware
        try {
          const provider = 'google';
          
          // Используем стандартные сервисы Strapi для обработки OAuth
          const jwtService = strapi.plugin('users-permissions').service('jwt');

          // Получаем настройки провайдера из переменных окружения или базы данных
          // В Strapi 5 настройки провайдеров хранятся в базе данных
          // Получаем их через entityService или используем переменные окружения
          const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
          const providersConfig = await pluginStore.get({ key: 'grant' });
          
          const providerConfig = providersConfig?.[provider];
          
          if (!providerConfig || !providerConfig.enabled) {
            strapi.log.error(`Provider ${provider} not found or not enabled`);
            await next();
            return;
          }

          if (!providerConfig.key || !providerConfig.secret) {
            strapi.log.error(`Provider ${provider} missing key or secret`);
            await next();
            return;
          }

          // Убираем избыточное логирование чувствительных данных
          strapi.log.info(`Processing OAuth with provider config for: ${provider}`);

          // Формируем redirect_uri - должен точно совпадать с тем, что зарегистрирован в Google Console
          // В development используем прокси URL (localhost:5173), в production - прямой URL бэкенда
          const isProduction = process.env.NODE_ENV === 'production';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const backendUrl = strapi.config.get('server.url') || 
                            process.env.PUBLIC_URL || 
                            'http://localhost:1337';
          
          // В development OAuth callback идет через прокси Vite, поэтому используем frontend URL
          // В production используем прямой backend URL
          const redirectUri = isProduction 
            ? `${backendUrl}/api/connect/${provider}/callback`
            : `${frontendUrl}/api/connect/${provider}/callback`;

          strapi.log.info(`🔍 Using redirect_uri: ${redirectUri}`);
          strapi.log.info(`🔍 Frontend URL: ${frontendUrl}`);
          strapi.log.info(`🔍 Backend URL: ${backendUrl}`);
          strapi.log.info(`🔍 Is Production: ${isProduction}`);

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
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });

          if (!tokenResponse.ok) {
            // Не логируем детали ошибки в production - защита от information leakage
            if (process.env.NODE_ENV === 'development') {
              const errorText = await tokenResponse.text();
              strapi.log.error('Failed to exchange code for token:', errorText);
            } else {
              strapi.log.error('Failed to exchange code for token (details hidden in production)');
            }
            await next();
            return;
          }

          const tokenData = await tokenResponse.json() as { access_token?: string };
          const { access_token } = tokenData;
          
          if (!access_token) {
            strapi.log.error('No access_token in response');
            await next();
            return;
          }

          // Получаем информацию о пользователе
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          if (!userInfoResponse.ok) {
            strapi.log.error('Failed to get user information from Google');
            await next();
            return;
          }

          const userInfo = await userInfoResponse.json() as { 
            email?: string; 
            email_verified?: boolean;
          };
          
          if (!userInfo.email) {
            strapi.log.error('No email in user info from Google');
            await next();
            return;
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
              ctx.status = 500;
              ctx.body = { error: 'Default role not found' };
              return;
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

            // Явная проверка email verification - защита от неподтвержденных аккаунтов
            const isEmailVerified = userInfo.email_verified === true;
            
            user = await strapi.entityService.create('plugin::users-permissions.user', {
              data: {
                username,
                email: userInfo.email,
                provider,
                confirmed: isEmailVerified, // Только если email явно подтвержден
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
              ctx.status = 403;
              ctx.body = { error: 'User account is blocked' };
              return;
            }
            
            strapi.log.info(`✅ Existing user logged in via OAuth: ${user.id} (${userInfo.email})`);
          }

          // Генерируем JWT через стандартный сервис Strapi
          const jwt = jwtService.issue({ id: user.id });
          
          // Логируем для отладки (только в development)
          if (process.env.NODE_ENV === 'development') {
            try {
              const jwtDecoded = jwt.split('.')[1];
              const payload = JSON.parse(Buffer.from(jwtDecoded, 'base64').toString());
              strapi.log.info(`🔍 Generated JWT payload: ${JSON.stringify(payload)}`);
            } catch (e) {
              // Игнорируем ошибки декодирования
            }
          }

          // ВАЛИДАЦИЯ REDIRECT URL - защита от open redirect атак
          const allowedFrontendUrls = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            process.env.PUBLIC_URL || 'http://localhost:1337',
          ].filter(Boolean);
          
          let redirectUrl = ctx.query.redirect as string | undefined;
          
          // Проверяем, что redirect URL находится в whitelist
          if (redirectUrl) {
            try {
              const redirectUrlObj = new URL(redirectUrl);
              const isValidRedirect = allowedFrontendUrls.some(allowed => {
                try {
                  const allowedUrl = new URL(allowed);
                  return redirectUrlObj.origin === allowedUrl.origin;
                } catch {
                  return false;
                }
              });
              
              if (!isValidRedirect) {
                strapi.log.warn(`⚠️ Invalid redirect URL attempted: ${redirectUrl}`);
                redirectUrl = undefined;
              }
            } catch {
              // Некорректный URL - игнорируем
              strapi.log.warn(`⚠️ Malformed redirect URL: ${redirectUrl}`);
              redirectUrl = undefined;
            }
          }
          
          // Используем первый разрешенный URL если redirect невалидный
          const finalRedirectUrl = redirectUrl || allowedFrontendUrls[0] || 'http://localhost:5173';
          const frontendCallback = `${finalRedirectUrl}/auth/callback`;

          // Устанавливаем JWT в secure httpOnly cookie вместо передачи в URL
          // Это защищает от утечки токена через history, logs, referrer
          // isProduction уже объявлена выше (строка 46)
          
          // ВАЖНО: Cookie устанавливается на бэкенде (localhost:1337), но нужна на фронтенде (localhost:5173)
          // Для кросс-доменных запросов через прокси Vite cookie должна работать автоматически
          // Но если cookie устанавливается на бэкенде, она не будет доступна на фронтенде
          // Решение: устанавливаем cookie с domain: undefined (для localhost это работает)
          // И используем sameSite: 'lax' для работы через прокси
          const cookieOptions = {
            httpOnly: true, // Защита от XSS - JavaScript не может прочитать
            secure: isProduction, // HTTPS только в production
            sameSite: 'lax' as const, // Работает для same-origin запросов через прокси
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
            path: '/',
            // domain не указываем - для localhost это работает через прокси
          };
          
          // ВАЖНО: Для кросс-доменных запросов (localhost:1337 -> localhost:5173)
          // cookie, установленная на бэкенде, не будет доступна на фронтенде
          // В production с одним доменом используем httpOnly cookie
          // В development передаем токен через URL (менее безопасно, но работает)
          if (isProduction) {
            // Production: используем httpOnly cookie
            strapi.log.info(`🍪 Setting JWT cookie (httpOnly: true, sameSite: lax)`);
            ctx.cookies.set('accessToken', jwt, cookieOptions);
            ctx.cookies.set('jwtToken', jwt, cookieOptions);
            strapi.log.info(`🚀 Redirecting to frontend (JWT in secure httpOnly cookie)`);
            ctx.redirect(frontendCallback);
          } else {
            // Development: передаем токен через URL (работает для кросс-доменных запросов)
            // Фронтенд получит токен, сохранит в cookie, и сразу удалит из URL
            const frontendCallbackWithToken = `${frontendCallback}?access_token=${jwt}`;
            strapi.log.info(`🚀 Redirecting to frontend with JWT in URL (development mode)`);
            ctx.redirect(frontendCallbackWithToken);
          }
          return; // Важно: не вызываем next(), так как мы уже обработали запрос
        } catch (error: any) {
          strapi.log.error('❌ OAuth callback processing failed:', error);
          // В случае ошибки продолжаем стандартную обработку
          await next();
          return;
        }
      }
    }
    
    // Продолжаем стандартную обработку для всех остальных запросов
    await next();
  };
};

