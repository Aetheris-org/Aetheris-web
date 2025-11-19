/**
 * Comment schema
 * Комментарии к статьям с поддержкой вложенных ответов
 */
import { list } from '@keystone-6/core';
import { text, relationship, integer, timestamp, virtual } from '@keystone-6/core/fields';
import { graphql } from '@keystone-6/core';
import { accessControl } from '../src/access-control';

export const Comment = list({
  access: accessControl.Comment,
  fields: {
    text: text({
      validation: { isRequired: true, length: { min: 1, max: 10000 } },
    }),
    article: relationship({
      ref: 'Article.comments',
      many: false,
      validation: { isRequired: true },
    }),
    author: relationship({
      ref: 'User.comments',
      many: false,
      validation: { isRequired: true },
    }),
    parent: relationship({
      ref: 'Comment',
      many: false,
    }),
    likes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    dislikes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    reactions: relationship({
      ref: 'CommentReaction.comment',
      many: true,
    }),
    userReaction: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const session = context.session;
          if (!session?.itemId) {
            return null;
          }

          const userId = session.itemId;
          const commentId = item.id;

          if (!commentId) {
            return null;
          }

          try {
            // Находим реакцию пользователя
            const reaction = await context.query.CommentReaction.findMany({
              where: {
                comment: { id: { equals: String(commentId) } },
                user: { id: { equals: userId } },
              },
              query: 'reaction',
              take: 1,
            });

            return reaction.length > 0 ? reaction[0].reaction : null;
          } catch (error) {
            // Логируем ошибку, но не выбрасываем исключение
            if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
              console.error('Failed to get userReaction for comment:', error);
            }
            return null;
          }
        },
      }),
    }),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

