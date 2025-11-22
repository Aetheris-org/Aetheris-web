/**
 * Объединение всех GraphQL resolver'ов в один
 * Правильный способ объединения без вложенных graphql.extend
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';
import { createNotification, shouldNotifyAboutLike } from '../lib/notifications';
import { 
  searchAndFilterArticles
} from './articles';

export const extendGraphqlSchema = graphql.extend((base) => {
  // Определяем enum для реакций
  const ReactionType = graphql.enum({
    name: 'ReactionType',
    values: graphql.enumValues(['like', 'dislike']),
  });

  return {
    query: {
      // Query для поиска и фильтрации статей
      searchArticles: graphql.field({
        type: graphql.list(base.object('Article')),
        args: {
          search: graphql.arg({ type: graphql.String }),
          tags: graphql.arg({ type: graphql.list(graphql.String) }),
          difficulty: graphql.arg({ type: graphql.String }),
          sort: graphql.arg({ type: graphql.String }),
          skip: graphql.arg({ type: graphql.Int }),
          take: graphql.arg({ type: graphql.Int }),
        },
        async resolve(root, args, context) {
          try {
            const result = await searchAndFilterArticles(context, args);
            return result.articles;
          } catch (error: any) {
            logger.error('[searchArticles] Error:', error);
            throw error;
          }
        },
      }),
    },
    mutation: {
      // Mutation для реакций на статьи
      reactToArticle: graphql.field({
        type: base.object('Article'),
        args: {
          articleId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          reaction: graphql.arg({
            type: graphql.nonNull(ReactionType),
          }),
        },
        async resolve(root, { articleId, reaction }, context) {
          logger.info(`[reactToArticle] START: articleId=${articleId}, reaction=${reaction}`);
          
          const session = context.session;
          if (!session?.itemId) {
            logger.error(`[reactToArticle] Authentication required`);
            throw new Error('Authentication required');
          }

          const userId = session.itemId;
          logger.info(`[reactToArticle] userId=${userId}`);

          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToArticle] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

          const article = await context.query.Article.findOne({
            where: { id: articleId },
            query: `
              id
              likes_count
              dislikes_count
              author {
                id
              }
            `,
          });

          if (!article) {
            logger.error(`[reactToArticle] Article not found: articleId=${articleId}`);
            throw new Error('Article not found');
          }

          const existingReaction = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: articleId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });

          let finalUserReaction: 'like' | 'dislike' | null = null;
          const previousLikes = article.likes_count || 0;

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            
            if (currentReaction === reaction) {
              await context.sudo().query.ArticleReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
            } else {
              await context.sudo().query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
            }
          } else {
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: articleId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
          }

          // Пересчитываем счетчики
          const likeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: articleId } },
              reaction: { equals: 'like' },
            },
          });
          const dislikeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: articleId } },
              reaction: { equals: 'dislike' },
            },
          });
          
          const newLikes = likeReactions;
          const newDislikes = dislikeReactions;

          await context.sudo().query.Article.updateOne({
            where: { id: articleId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: 'id',
          });

          // Создаем уведомление о лайке
          if (reaction === 'like' && finalUserReaction === 'like' && article.author?.id) {
            try {
              const thresholds = [1, 5, 10, 50, 100, 500, 1000];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);

              if (threshold !== null) {
                const timeWindow = threshold === 1 ? 60 * 60 * 1000 : undefined;
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;

                const where: any = {
                  user: { id: { equals: String(article.author.id) } },
                  article: { id: { equals: articleId } },
                  type: { equals: 'article_like' },
                };

                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }

                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: 'id metadata createdAt',
                });

                const hasNotificationForThreshold = existingNotifications.some(
                  (notif: any) => notif.metadata?.threshold === threshold
                );

                if (!hasNotificationForThreshold) {
                  await createNotification(context, {
                    type: 'article_like',
                    userId: article.author.id,
                    actorId: userId,
                    articleId,
                    metadata: {
                      threshold,
                      likesCount: newLikes,
                    },
                  }, true);
                }
              }
            } catch (error: any) {
              logger.error(`[reactToArticle] Failed to create like notification:`, error);
            }
          }

          const updatedArticle = await context.sudo().query.Article.findOne({
            where: { id: articleId },
            query: `
              id
              title
              excerpt
              previewImage
              tags
              difficulty
              likes_count
              dislikes_count
              views
              userReaction
            `,
          });

          return updatedArticle;
        },
      }),

      // Mutation для реакций на комментарии
      reactToComment: graphql.field({
        type: base.object('Comment'),
        args: {
          commentId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
          reaction: graphql.arg({
            type: graphql.nonNull(ReactionType),
          }),
        },
        async resolve(root, { commentId, reaction }, context) {
          logger.info(`[reactToComment] START: commentId=${commentId}, reaction=${reaction}`);
          
          const session = context.session;
          if (!session?.itemId) {
            logger.error(`[reactToComment] Authentication required`);
            throw new Error('Authentication required');
          }

          const userId = session.itemId;

          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToComment] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

          const comment = await context.query.Comment.findOne({
            where: { id: commentId },
            query: `
              id
              likes_count
              dislikes_count
              author {
                id
              }
              article {
                id
              }
            `,
          });

          if (!comment) {
            logger.error(`[reactToComment] Comment not found: commentId=${commentId}`);
            throw new Error('Comment not found');
          }

          const existingReaction = await context.query.CommentReaction.findMany({
            where: {
              comment: { id: { equals: commentId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });

          let finalUserReaction: 'like' | 'dislike' | null = null;
          const previousLikes = comment.likes_count || 0;

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            
            if (currentReaction === reaction) {
              await context.sudo().query.CommentReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
            } else {
              await context.sudo().query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
            }
          } else {
            await context.query.CommentReaction.createOne({
              data: {
                comment: { connect: { id: commentId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
          }

          // Пересчитываем счетчики
          const likeReactions = await context.sudo().query.CommentReaction.count({
            where: {
              comment: { id: { equals: commentId } },
              reaction: { equals: 'like' },
            },
          });
          const dislikeReactions = await context.sudo().query.CommentReaction.count({
            where: {
              comment: { id: { equals: commentId } },
              reaction: { equals: 'dislike' },
            },
          });
          
          const newLikes = likeReactions;
          const newDislikes = dislikeReactions;

          await context.sudo().query.Comment.updateOne({
            where: { id: commentId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: 'id',
          });

          // Создаем уведомление о лайке
          if (reaction === 'like' && finalUserReaction === 'like' && comment.author?.id) {
            try {
              const thresholds = [1, 3, 5, 10, 25];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);

              if (threshold !== null) {
                const timeWindow = threshold === 1 ? 60 * 60 * 1000 : undefined;
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;

                const where: any = {
                  user: { id: { equals: String(comment.author.id) } },
                  comment: { id: { equals: commentId } },
                  type: { equals: 'comment_like' },
                };

                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }

                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: 'id metadata createdAt',
                });

                const hasNotificationForThreshold = existingNotifications.some(
                  (notif: any) => notif.metadata?.threshold === threshold
                );

                if (!hasNotificationForThreshold) {
                  await createNotification(context, {
                    type: 'comment_like',
                    userId: comment.author.id,
                    actorId: userId,
                    articleId: comment.article?.id,
                    commentId,
                    metadata: {
                      threshold,
                      likesCount: newLikes,
                    },
                  }, true);
                }
              }
            } catch (error: any) {
              logger.error(`[reactToComment] Failed to create like notification:`, error);
            }
          }

          const updatedComment = await context.sudo().query.Comment.findOne({
            where: { id: commentId },
            query: `
              id
              text
              likes_count
              dislikes_count
              userReaction
              author {
                id
                username
                avatar
              }
              parent {
                id
              }
              article {
                id
              }
            `,
          });

          return updatedComment;
        },
      }),
    },
  };
});

