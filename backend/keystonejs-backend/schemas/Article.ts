/**
 * Article schema
 * Статьи пользователей с поддержкой draftAndPublish
 */
import { list } from '@keystone-6/core';
import { text, relationship, integer, select, timestamp, json, virtual } from '@keystone-6/core/fields';
import { graphql } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';
import { accessControl } from '../src/access-control';
import logger from '../src/lib/logger';
import { createNotification } from '../src/lib/notifications';

export const Article = list({
  access: accessControl.Article,
  hooks: {
    resolveInput: async ({ resolvedData, operation, context, inputData }) => {
      // Автоматически устанавливаем автора из сессии при создании статьи
      if (operation === 'create') {
        const session = context.session;
        logger.info(`[Article] resolveInput create: session.itemId=${session?.itemId}, inputData.author=${JSON.stringify(inputData?.author)}, resolvedData.author=${JSON.stringify(resolvedData?.author)}`);
        
        if (!session?.itemId) {
          logger.error('[Article] Attempted to create article without authentication');
          throw new Error('Authentication required to create an article');
        }
        
        // Всегда устанавливаем автора из сессии при создании
        // Это гарантирует, что статья всегда имеет автора
        // Преобразуем userId в число, так как Prisma ожидает Int для ID
        let userId: string | number = session.itemId;
        if (typeof userId === 'string') {
          const parsedId = parseInt(userId, 10);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          } else {
            logger.error(`[Article] Invalid session.itemId format (string, not parsable to int): ${session.itemId}`);
            throw new Error('Invalid user ID format');
          }
        } else if (typeof userId !== 'number') {
          logger.error(`[Article] Invalid session.itemId type (not string or number): ${typeof session.itemId}`);
          throw new Error('Invalid user ID type');
        }

        resolvedData.author = { connect: { id: userId } };
        logger.info(`[Article] Auto-setting author from session: userId=${userId}, author=${JSON.stringify(resolvedData.author)}`);
      }
      return resolvedData;
    },
    afterOperation: async ({ operation, item, context, originalItem }) => {
      // Создаем уведомления только при обновлении статьи (публикация)
      if (operation === 'update' && item) {
        try {
          // Получаем текущую и предыдущую версии статьи
          const currentArticle = await context.query.Article.findOne({
            where: { id: item.id },
            query: `
              id
              publishedAt
              author {
                id
              }
            `,
          });

          if (!currentArticle || !currentArticle.author) {
            logger.warn(`[Article] afterOperation: Article or author not found: articleId=${item.id}`);
            return;
          }

          // Проверяем, что статья была только что опубликована (publishedAt изменился с null на значение)
          const wasPublished = currentArticle.publishedAt !== null;
          const wasPreviouslyPublished = originalItem?.publishedAt !== null;

          if (wasPublished && !wasPreviouslyPublished) {
            // Статья только что опубликована - уведомляем всех подписчиков автора
            logger.debug(`[Article] afterOperation: Article published, finding followers:`, {
              articleId: currentArticle.id,
              authorId: currentArticle.author.id,
            });

            const followers = await context.query.Follow.findMany({
              where: {
                following: { id: { equals: String(currentArticle.author.id) } },
              },
              query: `
                id
                follower {
                  id
                }
              `,
            });

            logger.debug(`[Article] afterOperation: Found ${followers.length} followers`);

            // Создаем уведомления для всех подписчиков
            for (const follow of followers) {
              if (follow.follower?.id) {
                await createNotification(context, {
                  type: 'article_published',
                  userId: follow.follower.id,
                  actorId: currentArticle.author.id,
                  articleId: currentArticle.id,
                });
              }
            }

            logger.info(`[Article] afterOperation: Created ${followers.length} notifications for article publication`);
          }
        } catch (error: any) {
          logger.error(`[Article] afterOperation: Failed to create notifications:`, {
            error: error.message,
            stack: error.stack,
            articleId: item.id,
          });
        }
      }
    },
  },
  fields: {
    title: text({
      validation: { isRequired: true, length: { min: 10, max: 200 } },
      isIndexed: true,
    }),
    content: document({
      formatting: true,
      dividers: true,
      links: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
      ],
    }),
    excerpt: text({
      validation: { isRequired: true, length: { max: 500 } },
    }),
    author: relationship({
      ref: 'User.articles',
      many: false,
      validation: { isRequired: true },
    }),
    tags: json(),
    difficulty: select({
      type: 'string',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'medium' },
        { label: 'Hard', value: 'hard' },
      ],
      defaultValue: 'medium',
      validation: { isRequired: true },
    }),
    previewImage: text(), // URL строки (от imgBB или Cloudinary)
    likes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    dislikes_count: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    views: integer({
      defaultValue: 0,
      validation: { min: 0 },
    }),
    comments: relationship({
      ref: 'Comment.article',
      many: true,
    }),
    reactions: relationship({
      ref: 'ArticleReaction.article',
      many: true,
    }),
    bookmarks: relationship({
      ref: 'Bookmark.article',
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
          const articleId = item.id;

          if (!articleId) {
            return null;
          }

          try {
            // Находим реакцию пользователя
            const reaction = await context.query.ArticleReaction.findMany({
              where: {
                article: { id: { equals: String(articleId) } },
                user: { id: { equals: userId } },
              },
              query: 'reaction',
              take: 1,
            });

            return reaction.length > 0 ? reaction[0].reaction : null;
          } catch (error) {
            // Логируем ошибку, но не выбрасываем исключение
            logger.error('Failed to get userReaction for article:', error);
            return null;
          }
        },
      }),
    }),
    publishedAt: timestamp(),
    createdAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
    updatedAt: timestamp({
      defaultValue: { kind: 'now' },
    }),
  },
});

