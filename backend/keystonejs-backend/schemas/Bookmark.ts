/**
 * Bookmark schema
 * Закладки пользователей на статьи
 */
import { list } from '@keystone-6/core';
import { relationship, timestamp } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';

export const Bookmark = list({
  access: accessControl.Bookmark,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      // Автоматически устанавливаем пользователя из сессии при создании закладки
      if (operation === 'create') {
        const session = context.session;
        logger.info(`[Bookmark] resolveInput create: session.itemId=${session?.itemId}, inputData.user=${JSON.stringify(inputData?.user)}, resolvedData.user=${JSON.stringify(resolvedData?.user)}`);
        
        if (!session?.itemId) {
          logger.error('[Bookmark] Attempted to create bookmark without authentication');
          throw new Error('Authentication required to create a bookmark');
        }
        
        // Всегда устанавливаем пользователя из сессии при создании
        let userId: string | number = session.itemId;
        if (typeof userId === 'string') {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger.error(`[Bookmark] Invalid session.itemId format (string, not parsable to int): ${session.itemId}`);
            throw new Error('Invalid user ID format');
          }
        } else if (typeof userId !== 'number') {
          logger.error(`[Bookmark] Invalid session.itemId type (not string or number): ${typeof session.itemId}`);
          throw new Error('Invalid user ID type');
        }

        resolvedData.user = { connect: { id: userId } };
        logger.info(`[Bookmark] Auto-setting user from session: userId=${userId}, user=${JSON.stringify(resolvedData.user)}`);
      }
      return resolvedData;
    },
  },
  fields: {
    user: relationship({
      ref: 'User.bookmarks',
      many: false,
      validation: { isRequired: true },
    }),
    article: relationship({
      ref: 'Article.bookmarks',
      many: false,
      validation: { isRequired: true },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

