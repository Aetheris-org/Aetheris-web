/**
 * Article schema
 * Статьи пользователей с поддержкой draftAndPublish
 */
import { list } from '@keystone-6/core';
import { text, relationship, integer, select, timestamp, json, virtual } from '@keystone-6/core/fields';
import { graphql } from '@keystone-6/core';
import { document } from '@keystone-6/fields-document';
import { accessControl } from '../src/access-control';

export const Article = list({
  access: accessControl.Article,
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
      validation: { length: { max: 500 } },
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
            if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
              console.error('Failed to get userReaction for article:', error);
            }
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

