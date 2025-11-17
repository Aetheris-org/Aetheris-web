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

    // Настройка прав доступа для комментариев
    try {
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (authenticatedRole) {
        // В Strapi v5 формат action: api::content-type.content-type.method
        const commentPermissions = [
          { action: 'api::comment.comment.create' },
          { action: 'api::comment.comment.update' },
          { action: 'api::comment.comment.delete' },
          { action: 'api::comment.comment.find' },
          { action: 'api::comment.comment.findOne' },
          { action: 'api::comment-reaction.comment-reaction.create' },
          { action: 'api::comment-reaction.comment-reaction.update' },
          { action: 'api::comment-reaction.comment-reaction.delete' },
        ];

        // Получаем существующие права
        const existingPermissions = await strapi
          .query('plugin::users-permissions.permission')
          .findMany({
            where: {
              role: authenticatedRole.id,
              action: { $in: commentPermissions.map((p) => p.action) },
            },
          });

        const existingActionSet = new Set(existingPermissions.map((p: any) => p.action));

        // Создаем недостающие права
        for (const perm of commentPermissions) {
          if (!existingActionSet.has(perm.action)) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                ...perm,
                role: authenticatedRole.id,
              },
            });
            strapi.log.info(`✅ Created permission: ${perm.action} for Authenticated role`);
          }
        }
      }

      // Настройка прав для Public роли (только чтение комментариев)
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (publicRole) {
        const publicCommentPermissions = [
          { action: 'api::comment.comment.find' },
          { action: 'api::comment.comment.findOne' },
        ];

        const existingPublicPermissions = await strapi
          .query('plugin::users-permissions.permission')
          .findMany({
            where: {
              role: publicRole.id,
              action: { $in: publicCommentPermissions.map((p) => p.action) },
            },
          });

        const existingPublicActionSet = new Set(existingPublicPermissions.map((p: any) => p.action));

        for (const perm of publicCommentPermissions) {
          if (!existingPublicActionSet.has(perm.action)) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: {
                ...perm,
                role: publicRole.id,
              },
            });
            strapi.log.info(`✅ Created permission: ${perm.action} for Public role`);
          }
        }
      }
    } catch (error) {
      strapi.log.warn('⚠️ Failed to setup comment permissions:', error);
    }

    // Создание индексов базы данных для оптимизации производительности
    try {
      const db = strapi.db;
      const connection = db.connection;
      
      // Список индексов для создания
      const indexes = [
        // Индексы для комментариев
        { name: 'idx_comments_article', sql: 'CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)' },
        { name: 'idx_comments_parent', sql: 'CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id)' },
        { name: 'idx_comments_created', sql: 'CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at)' },
        
        // Индексы для реакций на статьи
        { name: 'idx_article_reactions_article', sql: 'CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON article_reactions(article_id)' },
        { name: 'idx_article_reactions_user', sql: 'CREATE INDEX IF NOT EXISTS idx_article_reactions_user ON article_reactions(user_id)' },
        { name: 'idx_article_reactions_composite', sql: 'CREATE INDEX IF NOT EXISTS idx_article_reactions_composite ON article_reactions(article_id, user_id)' },
        
        // Индексы для реакций на комментарии
        { name: 'idx_comment_reactions_comment', sql: 'CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id)' },
        { name: 'idx_comment_reactions_user', sql: 'CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id)' },
        { name: 'idx_comment_reactions_composite', sql: 'CREATE INDEX IF NOT EXISTS idx_comment_reactions_composite ON comment_reactions(comment_id, user_id)' },
        
        // Индексы для статей
        { name: 'idx_articles_published', sql: 'CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at)' },
        { name: 'idx_articles_author', sql: 'CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id)' },
        { name: 'idx_articles_created', sql: 'CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at)' },
      ];

      for (const { name, sql } of indexes) {
        try {
          // Используем Knex raw query (работает для всех БД)
          const result = connection.raw(sql);
          // Обрабатываем как промис, если это промис
          if (result && typeof result.then === 'function') {
            await result;
          }
          strapi.log.info(`✅ Created index: ${name}`);
        } catch (error: any) {
          // Игнорируем ошибки, если индекс уже существует или таблица не существует
          const errorMessage = error?.message || String(error);
          const errorCode = error?.code;
          
          if (
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            errorMessage.includes('no such table') ||
            errorCode === '42P07' || // PostgreSQL: duplicate_table
            errorCode === '23505'    // PostgreSQL: unique_violation
          ) {
            strapi.log.debug(`ℹ️ Index ${name} already exists or table not found`);
          } else {
            strapi.log.warn(`⚠️ Failed to create index ${name}:`, errorMessage);
          }
        }
      }
    } catch (error: any) {
      strapi.log.warn('⚠️ Failed to create database indexes:', error?.message || error);
    }
  },
};
