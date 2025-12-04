/**
 * Comment schema
 * Комментарии к статьям с поддержкой вложенных ответов
 */
import { list } from '@keystone-6/core';
import { text, relationship, integer, timestamp, virtual } from '@keystone-6/core/fields';
import { graphql } from '@keystone-6/core';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';
import { createNotification } from '../src/lib/notifications';

export const Comment = list({
  access: accessControl.Comment,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      // Автоматически устанавливаем автора из сессии при создании комментария
      if (operation === 'create') {
        const session = context.session;
        logger.info(`[Comment] resolveInput create: session.itemId=${session?.itemId}, inputData.author=${JSON.stringify(inputData?.author)}, resolvedData.author=${JSON.stringify(resolvedData?.author)}`);
        
        if (!session?.itemId) {
          logger.error('[Comment] Attempted to create comment without authentication');
          throw new Error('Authentication required to create a comment');
        }
        
        // Всегда устанавливаем автора из сессии при создании
        // Это гарантирует, что комментарий всегда имеет автора
        // Преобразуем userId в число, так как Prisma ожидает Int для ID
        const userId = typeof session.itemId === 'string' 
          ? parseInt(session.itemId, 10) 
          : Number(session.itemId);
        if (isNaN(userId)) {
          logger.error(`[Comment] Invalid userId: ${session.itemId}`);
          throw new Error('Invalid user ID in session');
        }
        resolvedData.author = { connect: { id: userId } };
        logger.info(`[Comment] Auto-setting author from session: userId=${userId} (type: ${typeof userId}), author=${JSON.stringify(resolvedData.author)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context, originalItem }) => {
      // Создаем уведомления только при создании комментария
      if (operation === 'create' && item) {
        try {
          // Получаем полные данные комментария с отношениями
          const comment = await context.query.Comment.findOne({
            where: { id: item.id },
            query: `
              id
              author {
                id
              }
              article {
                id
                author {
                  id
                }
              }
              parent {
                id
                author {
                  id
                }
              }
            `,
          });

          if (!comment || !comment.author) {
            logger.warn(`[Comment] afterOperation: Comment or author not found: commentId=${item.id}`);
            return;
          }

          const commentAuthorId = comment.author.id;
          const articleId = comment.article?.id;
          const articleAuthorId = comment.article?.author?.id;
          const parentCommentId = comment.parent?.id;
          const parentAuthorId = comment.parent?.author?.id;

          logger.debug(`[Comment] afterOperation: Creating notifications for comment:`, {
            commentId: comment.id,
            commentAuthorId,
            articleId,
            articleAuthorId,
            parentCommentId,
            parentAuthorId,
          });

          // Если есть родительский комментарий - уведомляем автора родительского комментария
          if (parentCommentId && parentAuthorId) {
            await createNotification(context, {
              type: 'comment_reply',
              userId: parentAuthorId,
              actorId: commentAuthorId,
              articleId,
              commentId: parentCommentId,
            }, false); // Проверка дубликатов включена
          } else if (articleId && articleAuthorId) {
            // Если нет родительского комментария - уведомляем автора статьи
            await createNotification(context, {
              type: 'comment',
              userId: articleAuthorId,
              actorId: commentAuthorId,
              articleId,
              commentId: comment.id,
            }, false); // Проверка дубликатов включена
          }
        } catch (error: any) {
          logger.error(`[Comment] afterOperation: Failed to create notifications:`, {
            error: error.message,
            stack: error.stack,
            commentId: item.id,
          });
        }
      }
    },
  },
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
    // ВРЕМЕННО ОТКЛЮЧЕНО: self-referencing relationship вызывает ошибку Admin Meta
    // parent: relationship({
    //   ref: 'Comment.children',
    //   many: false,
    // }),
    // children: relationship({
    //   ref: 'Comment.parent',
    //   many: true,
    // }),
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
            logger.error('Failed to get userReaction for comment:', error);
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

