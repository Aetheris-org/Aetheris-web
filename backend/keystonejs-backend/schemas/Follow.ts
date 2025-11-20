/**
 * Follow schema
 * Подписки пользователей друг на друга
 */
import { list } from '@keystone-6/core';
import { relationship, timestamp } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';
import { createNotification } from '../src/lib/notifications';

export const Follow = list({
  access: accessControl.Follow,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      // Автоматически устанавливаем follower из сессии при создании подписки
      if (operation === 'create') {
        const session = context.session;
        logger.info(`[Follow] resolveInput create: session.itemId=${session?.itemId}, inputData.follower=${JSON.stringify(inputData?.follower)}, resolvedData.follower=${JSON.stringify(resolvedData?.follower)}`);
        
        if (!session?.itemId) {
          logger.error('[Follow] Attempted to create follow without authentication');
          throw new Error('Authentication required to create a follow');
        }
        
        // Всегда устанавливаем follower из сессии при создании
        let userId: string | number = session.itemId;
        if (typeof userId === 'string') {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger.error(`[Follow] Invalid session.itemId format (string, not parsable to int): ${session.itemId}`);
            throw new Error('Invalid user ID format');
          }
        } else if (typeof userId !== 'number') {
          logger.error(`[Follow] Invalid session.itemId type (not string or number): ${typeof session.itemId}`);
          throw new Error('Invalid user ID type');
        }

        resolvedData.follower = { connect: { id: userId } };
        logger.info(`[Follow] Auto-setting follower from session: userId=${userId}, follower=${JSON.stringify(resolvedData.follower)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context }) => {
      // Создаем уведомление только при создании подписки
      if (operation === 'create' && item) {
        try {
          // Получаем полные данные подписки с отношениями
          const follow = await context.query.Follow.findOne({
            where: { id: item.id },
            query: `
              id
              follower {
                id
              }
              following {
                id
              }
            `,
          });

          if (!follow || !follow.follower || !follow.following) {
            logger.warn(`[Follow] afterOperation: Follow or relationships not found: followId=${item.id}`);
            return;
          }

          const followerId = follow.follower.id;
          const followingId = follow.following.id;

          logger.debug(`[Follow] afterOperation: Creating notification for follow:`, {
            followId: follow.id,
            followerId,
            followingId,
          });

          // Уведомляем пользователя, на которого подписались
          // Проверка дубликатов предотвратит создание уведомления при повторной подписке
          await createNotification(context, {
            type: 'follow',
            userId: followingId,
            actorId: followerId,
          }, false); // Проверка дубликатов включена
        } catch (error: any) {
          logger.error(`[Follow] afterOperation: Failed to create notification:`, {
            error: error.message,
            stack: error.stack,
            followId: item.id,
          });
        }
      }
    },
  },
  fields: {
    follower: relationship({
      ref: 'User.following',
      many: false,
      validation: { isRequired: true },
    }),
    following: relationship({
      ref: 'User.followers',
      many: false,
      validation: { isRequired: true },
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

