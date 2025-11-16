import type { Core } from '@strapi/strapi';
import jwtCookieMiddleware from './middlewares/jwt-cookie';
import oauthCallbackMiddleware from './middlewares/oauth-callback';
import jwtAuthMiddleware from './middlewares/jwt-auth';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Регистрируем кастомный middleware для OAuth callback (должен быть ПЕРЕД jwt-cookie)
    strapi.server.use(oauthCallbackMiddleware({}, { strapi }));
    // Регистрируем кастомный middleware для JWT cookies
    strapi.server.use(jwtCookieMiddleware({}, { strapi }));
    // Регистрируем кастомный middleware для проверки JWT на кастомных эндпоинтах
    strapi.server.use(jwtAuthMiddleware({}, { strapi }));
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Обновляем redirect_uri для Google провайдера в development
    // чтобы он использовал прокси URL (localhost:5173) вместо прямого (localhost:1337)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const pluginStore = strapi.store({ type: 'plugin', name: 'users-permissions' });
        const providersConfig = await pluginStore.get({ key: 'grant' });
        
        if (providersConfig && typeof providersConfig === 'object') {
          const config = providersConfig as Record<string, any>;
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const correctRedirectUri = `${frontendUrl}/api/connect/google/callback`;
          
          if (config.google) {
            if (config.google.callback !== correctRedirectUri || config.google.redirectUri !== correctRedirectUri) {
              strapi.log.info(`🔄 Updating Google provider redirect_uri to: ${correctRedirectUri}`);
              config.google.callback = correctRedirectUri;
              config.google.redirectUri = correctRedirectUri;
              await pluginStore.set({ key: 'grant', value: config });
              strapi.log.info('✅ Google provider redirect_uri updated successfully');
            }
          }
        }
      } catch (error) {
        strapi.log.warn('⚠️ Failed to update Google provider redirect_uri:', error);
      }
    }
  },
};
