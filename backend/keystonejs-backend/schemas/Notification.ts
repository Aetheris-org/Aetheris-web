/**
 * Notification schema
 * Уведомления для пользователей о различных событиях
 */
import { list } from '@keystone-6/core';
import { relationship, select, checkbox, timestamp, json } from '@keystone-6/core/fields';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';

export const Notification = list({
  access: accessControl.Notification,
  hooks: {
    afterOperation: async ({ operation, item, context, originalItem }) => {
      // Логируем обновление уведомления для отладки
      if (operation === 'update' && item) {
        logger.info(`[Notification] afterOperation update:`, {
          notificationId: item.id,
          isRead: item.isRead,
          readAt: item.readAt,
          originalIsRead: originalItem?.isRead,
        });
      }
    },
  },
  fields: {
    user: relationship({
      ref: 'User.notifications',
      many: false,
      validation: { isRequired: true },
      isIndexed: true,
    }),
    type: select({
      type: 'string',
      options: [
        { label: 'Comment', value: 'comment' },
        { label: 'Comment Reply', value: 'comment_reply' },
        { label: 'Follow', value: 'follow' },
        { label: 'Article Published', value: 'article_published' },
        { label: 'Article Like', value: 'article_like' },
        { label: 'Comment Like', value: 'comment_like' },
      ],
      validation: { isRequired: true },
      isIndexed: true,
    }),
    actor: relationship({
      ref: 'User',
      many: false,
      validation: { isRequired: true },
    }),
    article: relationship({
      ref: 'Article',
      many: false,
    }),
    comment: relationship({
      ref: 'Comment',
      many: false,
    }),
    isRead: checkbox({
      defaultValue: false,
      isIndexed: true,
    }),
    readAt: timestamp(),
    metadata: json(),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
      isIndexed: true,
    }),
  },
});

