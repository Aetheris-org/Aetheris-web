/**
 * Custom GraphQL mutations for reactions
 * Кастомные mutations для реакций на статьи и комментарии
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';
import { createNotification, shouldNotifyAboutLike } from '../lib/notifications';

export const extendGraphqlSchema = graphql.extend((base) => {
  // Определяем enum сначала
  const ReactionType = graphql.enum({
    name: 'ReactionType',
    values: graphql.enumValues(['like', 'dislike']),
  });

  return {
    mutation: {
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

          // Проверяем, что реакция валидна
          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToArticle] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

          // Находим статью
          logger.info(`[reactToArticle] Finding article: articleId=${articleId}`);
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
          logger.info(`[reactToArticle] Article found:`, { id: article?.id, likes: article?.likes_count, dislikes: article?.dislikes_count });

          if (!article) {
            logger.error(`[reactToArticle] Article not found: articleId=${articleId}`);
            throw new Error('Article not found');
          }

          // Проверяем существующую реакцию
          logger.info(`[reactToArticle] Checking existing reaction: articleId=${articleId}, userId=${userId}`);
          const existingReaction = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: articleId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });
          logger.info(`[reactToArticle] Existing reaction:`, existingReaction);

          let finalUserReaction: 'like' | 'dislike' | null = null;
          let newLikes = article.likes_count || 0;
          let newDislikes = article.dislikes_count || 0;
          const previousLikes = newLikes; // Сохраняем предыдущее значение для проверки порогов

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            logger.info(`[reactToArticle] Existing reaction found: current=${currentReaction}, new=${reaction}`);
            
            if (currentReaction === reaction) {
              // Удаляем реакцию (toggle off)
              logger.info(`[reactToArticle] Removing reaction: reactionId=${existingReaction[0].id}`);
              await context.sudo().query.ArticleReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
              
              if (reaction === 'like') {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              // Меняем реакцию
              logger.info(`[reactToArticle] Updating reaction: reactionId=${existingReaction[0].id}, newReaction=${reaction}`);
              await context.sudo().query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
              
              if (reaction === 'like') {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            // Создаем новую реакцию
            logger.info(`[reactToArticle] Creating new reaction: articleId=${articleId}, userId=${userId}, reaction=${reaction}`);
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: articleId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
            
            if (reaction === 'like') {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }

          logger.info(`[reactToArticle] New counts: likes=${newLikes}, dislikes=${newDislikes}`);

          // Обновляем счетчики в статье через sudo (обход access control)
          logger.info(`[reactToArticle] Updating article counts: articleId=${articleId}`);
          await context.sudo().query.Article.updateOne({
            where: { id: articleId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: 'id', // Минимальный запрос для обновления
          });
          logger.info(`[reactToArticle] Article counts updated`);

          // Создаем уведомление о лайке, если нужно (только для лайков, не для дизлайков)
          if (reaction === 'like' && finalUserReaction === 'like' && article.author?.id) {
            try {
              // Пороги для статей: 1, 5, 10, 50, 100, 500, 1000
              const thresholds = [1, 5, 10, 50, 100, 500, 1000];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);

              if (threshold !== null) {
                // Для первого лайка (threshold=1) проверяем дубликаты за последний час
                // Для остальных порогов проверяем все существующие уведомления
                const timeWindow = threshold === 1 ? 60 * 60 * 1000 : undefined; // 1 час для первого лайка
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;

                const where: any = {
                  user: { id: { equals: String(article.author.id) } },
                  article: { id: { equals: articleId } },
                  type: { equals: 'article_like' },
                };

                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }

                // Проверяем, не было ли уже уведомления для этого порога
                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: 'id metadata createdAt',
                });

                // Проверяем, есть ли уже уведомление с этим порогом в metadata
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
                  }, true); // Пропускаем проверку дубликатов, так как уже проверили выше
                  logger.info(`[reactToArticle] Created notification for threshold: ${threshold}, likes: ${newLikes}`);
                } else {
                  logger.debug(`[reactToArticle] Notification already exists for threshold: ${threshold}`);
                }
              }
            } catch (error: any) {
              logger.error(`[reactToArticle] Failed to create like notification:`, {
                error: error.message,
                stack: error.stack,
              });
            }
          }

          // Получаем обновленную статью (без author, так как он не запрашивается в GraphQL запросе)
          // Убираем DateTime поля, так как они вызывают проблемы с сериализацией
          logger.info(`[reactToArticle] Fetching updated article: articleId=${articleId}`);
          try {
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
            
            logger.info(`[reactToArticle] Article fetched successfully:`, {
              id: updatedArticle?.id,
              title: updatedArticle?.title,
              likes: updatedArticle?.likes_count,
              dislikes: updatedArticle?.dislikes_count,
              userReaction: updatedArticle?.userReaction,
            });

            logger.info(`[reactToArticle] SUCCESS: articleId=${articleId}, userId=${userId}, reaction=${finalUserReaction}`);
            return updatedArticle;
          } catch (error) {
            logger.error(`[reactToArticle] Error fetching article:`, error);
            throw error;
          }
        },
      }),

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
          logger.info(`[reactToComment] userId=${userId}`);

          // Проверяем, что реакция валидна
          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToComment] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

          // Находим комментарий
          logger.info(`[reactToComment] Finding comment: commentId=${commentId}`);
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
          logger.info(`[reactToComment] Comment found:`, { id: comment?.id, likes: comment?.likes_count, dislikes: comment?.dislikes_count });

          if (!comment) {
            logger.error(`[reactToComment] Comment not found: commentId=${commentId}`);
            throw new Error('Comment not found');
          }

          // Проверяем существующую реакцию
          logger.info(`[reactToComment] Checking existing reaction: commentId=${commentId}, userId=${userId}`);
          const existingReaction = await context.query.CommentReaction.findMany({
            where: {
              comment: { id: { equals: commentId } },
              user: { id: { equals: userId } },
            },
            query: 'id reaction',
            take: 1,
          });
          logger.info(`[reactToComment] Existing reaction:`, existingReaction);

          let finalUserReaction: 'like' | 'dislike' | null = null;
          let newLikes = comment.likes_count || 0;
          let newDislikes = comment.dislikes_count || 0;
          const previousLikes = newLikes; // Сохраняем предыдущее значение для проверки порогов

          if (existingReaction.length > 0) {
            const currentReaction = existingReaction[0].reaction;
            logger.info(`[reactToComment] Existing reaction found: current=${currentReaction}, new=${reaction}`);
            
            if (currentReaction === reaction) {
              // Удаляем реакцию (toggle off)
              logger.info(`[reactToComment] Removing reaction: reactionId=${existingReaction[0].id}`);
              await context.sudo().query.CommentReaction.deleteOne({
                where: { id: existingReaction[0].id },
              });
              finalUserReaction = null;
              
              if (reaction === 'like') {
                newLikes = Math.max(0, newLikes - 1);
              } else {
                newDislikes = Math.max(0, newDislikes - 1);
              }
            } else {
              // Меняем реакцию
              logger.info(`[reactToComment] Updating reaction: reactionId=${existingReaction[0].id}, newReaction=${reaction}`);
              await context.sudo().query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
              
              if (reaction === 'like') {
                newLikes = newLikes + 1;
                newDislikes = Math.max(0, newDislikes - 1);
              } else {
                newDislikes = newDislikes + 1;
                newLikes = Math.max(0, newLikes - 1);
              }
            }
          } else {
            // Создаем новую реакцию
            logger.info(`[reactToComment] Creating new reaction: commentId=${commentId}, userId=${userId}, reaction=${reaction}`);
            await context.query.CommentReaction.createOne({
              data: {
                comment: { connect: { id: commentId } },
                user: { connect: { id: userId } },
                reaction,
              },
            });
            finalUserReaction = reaction;
            
            if (reaction === 'like') {
              newLikes = newLikes + 1;
            } else {
              newDislikes = newDislikes + 1;
            }
          }

          logger.info(`[reactToComment] New counts: likes=${newLikes}, dislikes=${newDislikes}`);

          // Обновляем счетчики в комментарии через sudo (обход access control)
          logger.info(`[reactToComment] Updating comment counts: commentId=${commentId}`);
          await context.sudo().query.Comment.updateOne({
            where: { id: commentId },
            data: {
              likes_count: newLikes,
              dislikes_count: newDislikes,
            },
            query: 'id', // Минимальный запрос для обновления
          });
          logger.info(`[reactToComment] Comment counts updated`);

          // Создаем уведомление о лайке, если нужно (только для лайков, не для дизлайков)
          if (reaction === 'like' && finalUserReaction === 'like' && comment.author?.id) {
            try {
              // Пороги для комментариев: 1, 3, 5, 10, 25
              const thresholds = [1, 3, 5, 10, 25];
              const threshold = shouldNotifyAboutLike(newLikes, previousLikes, thresholds);

              if (threshold !== null) {
                // Для первого лайка (threshold=1) проверяем дубликаты за последний час
                // Для остальных порогов проверяем все существующие уведомления
                const timeWindow = threshold === 1 ? 60 * 60 * 1000 : undefined; // 1 час для первого лайка
                const cutoffTime = timeWindow ? new Date(Date.now() - timeWindow) : null;

                const where: any = {
                  user: { id: { equals: String(comment.author.id) } },
                  comment: { id: { equals: commentId } },
                  type: { equals: 'comment_like' },
                };

                if (cutoffTime) {
                  where.createdAt = { gte: cutoffTime.toISOString() };
                }

                // Проверяем, не было ли уже уведомления для этого порога
                const existingNotifications = await context.sudo().query.Notification.findMany({
                  where,
                  query: 'id metadata createdAt',
                });

                // Проверяем, есть ли уже уведомление с этим порогом в metadata
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
                  }, true); // Пропускаем проверку дубликатов, так как уже проверили выше
                  logger.info(`[reactToComment] Created notification for threshold: ${threshold}, likes: ${newLikes}`);
                } else {
                  logger.debug(`[reactToComment] Notification already exists for threshold: ${threshold}`);
                }
              }
            } catch (error: any) {
              logger.error(`[reactToComment] Failed to create like notification:`, {
                error: error.message,
                stack: error.stack,
              });
            }
          }

          // Получаем обновленный комментарий с необходимыми полями через KeystoneJS API
          // Используем правильный синтаксис для получения связей через KeystoneJS
          logger.info(`[reactToComment] Fetching updated comment: commentId=${commentId}`);
          let updatedComment = await context.sudo().query.Comment.findOne({
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

          logger.info(`[reactToComment] Comment fetched successfully:`, {
            id: updatedComment?.id,
            text: updatedComment?.text,
            author: updatedComment?.author?.id,
            parent: updatedComment?.parent?.id,
            article: updatedComment?.article?.id,
            likes: updatedComment?.likes_count,
            dislikes: updatedComment?.dislikes_count,
            userReaction: updatedComment?.userReaction,
          });

          logger.info(`[reactToComment] SUCCESS: commentId=${commentId}, userId=${userId}, reaction=${finalUserReaction}`);

          return updatedComment;
        },
      }),
    },
  };
});

