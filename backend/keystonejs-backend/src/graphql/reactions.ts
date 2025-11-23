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

  // Создаем кастомный тип для возврата из reactToArticle, чтобы избежать автоматической загрузки связанных данных
  const ReactToArticleAuthor = graphql.object<{ id: string; username: string; avatar: string | null }>()({
    name: 'ReactToArticleAuthor',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      username: graphql.field({ type: graphql.nonNull(graphql.String) }),
      avatar: graphql.field({ type: graphql.String }),
    },
  });

  const ReactToArticleContent = graphql.object<{ document: any }>()({
    name: 'ReactToArticleContent',
    fields: {
      document: graphql.field({ type: graphql.JSON }),
    },
  });

  const ReactToArticleResult = graphql.object<{
    id: string;
    title: string;
    content: any;
    excerpt: string | null;
    author: { id: string; username: string; avatar: string | null } | null;
    previewImage: string | null;
    tags: string[];
    difficulty: string;
    likes_count: number;
    dislikes_count: number;
    views: number;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    comments: { id: string }[];
    userReaction: string | null;
  }>()({
    name: 'ReactToArticleResult',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      title: graphql.field({ type: graphql.nonNull(graphql.String) }),
      content: graphql.field({ 
        type: ReactToArticleContent,
        resolve: (article) => article.content,
      }),
      excerpt: graphql.field({ type: graphql.String }),
      author: graphql.field({ 
        type: ReactToArticleAuthor,
        resolve: (article) => article.author,
      }),
      previewImage: graphql.field({ type: graphql.String }),
      tags: graphql.field({ type: graphql.list(graphql.nonNull(graphql.String)) }),
      difficulty: graphql.field({ type: graphql.nonNull(graphql.String) }),
      likes_count: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      dislikes_count: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      views: graphql.field({ type: graphql.nonNull(graphql.Int) }),
      publishedAt: graphql.field({ type: graphql.DateTime }),
      createdAt: graphql.field({ type: graphql.nonNull(graphql.DateTime) }),
      updatedAt: graphql.field({ type: graphql.nonNull(graphql.DateTime) }),
      comments: graphql.field({ 
        type: graphql.list(graphql.object<{ id: string }>()({
          name: 'ReactToArticleComment',
          fields: {
            id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
          },
        })),
        resolve: (article) => article.comments,
      }),
      userReaction: graphql.field({ type: graphql.String }),
    },
  });

  return {
    mutation: {
      reactToArticle: graphql.field({
        type: ReactToArticleResult,
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
          // Преобразуем userId в число, если это строка
          const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
          if (isNaN(userIdNum)) {
            logger.error(`[reactToArticle] Invalid userId: ${userId}`);
            throw new Error('Invalid user ID');
          }
          logger.info(`[reactToArticle] userId=${userIdNum}`);

          // Преобразуем articleId в число, если это строка (GraphQL ID может быть строкой)
          const articleIdNum = typeof articleId === 'string' ? parseInt(articleId, 10) : articleId;
          if (isNaN(articleIdNum)) {
            logger.error(`[reactToArticle] Invalid articleId: ${articleId}`);
            throw new Error('Invalid article ID');
          }

          // Проверяем, что реакция валидна
          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToArticle] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

          // Находим статью
          logger.info(`[reactToArticle] Finding article: articleId=${articleIdNum}`);
          const article = await context.query.Article.findOne({
            where: { id: String(articleIdNum) },
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
            logger.error(`[reactToArticle] Article not found: articleId=${articleIdNum}`);
            throw new Error('Article not found');
          }

          // Проверяем существующую реакцию
          logger.info(`[reactToArticle] Checking existing reaction: articleId=${articleIdNum}, userId=${userIdNum}`);
          const existingReactionResult = await context.query.ArticleReaction.findMany({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              user: { id: { equals: userIdNum } },
            },
            query: 'id reaction',
            take: 1,
          });
          
          // Убеждаемся, что результат - массив
          const existingReaction = Array.isArray(existingReactionResult) ? existingReactionResult : [];
          logger.info(`[reactToArticle] Existing reaction:`, existingReaction);

          let finalUserReaction: 'like' | 'dislike' | null = null;
          const previousLikes = article.likes_count || 0; // Сохраняем предыдущее значение для проверки порогов

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
            } else {
              // Меняем реакцию
              logger.info(`[reactToArticle] Updating reaction: reactionId=${existingReaction[0].id}, newReaction=${reaction}`);
              await context.sudo().query.ArticleReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
            }
          } else {
            // Создаем новую реакцию
            logger.info(`[reactToArticle] Creating new reaction: articleId=${articleIdNum}, userId=${userIdNum}, reaction=${reaction}`);
            await context.query.ArticleReaction.createOne({
              data: {
                article: { connect: { id: String(articleIdNum) } },
                user: { connect: { id: userIdNum } },
                reaction,
              },
            });
            finalUserReaction = reaction;
          }

          // ИСПРАВЛЕНИЕ RACE CONDITION: Пересчитываем счетчики на основе фактических записей реакций
          // Это гарантирует консистентность даже при одновременных запросах
          logger.info(`[reactToArticle] Recalculating counts from actual reactions: articleId=${articleIdNum}`);
          const likeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              reaction: { equals: 'like' },
            },
          });
          const dislikeReactions = await context.sudo().query.ArticleReaction.count({
            where: {
              article: { id: { equals: String(articleIdNum) } },
              reaction: { equals: 'dislike' },
            },
          });
          
          const newLikes = likeReactions;
          const newDislikes = dislikeReactions;
          logger.info(`[reactToArticle] Recalculated counts: likes=${newLikes}, dislikes=${newDislikes}`);

          // Обновляем счетчики в статье через sudo (обход access control)
          logger.info(`[reactToArticle] Updating article counts: articleId=${articleIdNum}`);
          await context.sudo().query.Article.updateOne({
            where: { id: String(articleIdNum) },
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
                  article: { id: { equals: String(articleIdNum) } },
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
                    actorId: userIdNum,
                    articleId: String(articleIdNum),
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

          // Получаем обновленную статью с author и comments для фронтенда
          // ВАЖНО: Загружаем данные через Prisma напрямую, чтобы избежать проблем с автоматической загрузкой связанных данных
          logger.info(`[reactToArticle] Fetching updated article: articleId=${articleIdNum}`);
          try {
            // Загружаем статью через Prisma напрямую
            const articleData = await context.sudo().prisma.article.findUnique({
              where: { id: articleIdNum },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                  },
                },
                comments: {
                  select: {
                    id: true,
                  },
                },
              },
            });

            if (!articleData) {
              logger.error(`[reactToArticle] Article not found after update: articleId=${articleIdNum}`);
              throw new Error('Article not found');
            }

            // Загружаем userReaction через Prisma напрямую, чтобы избежать автоматической загрузки связанных данных
            const userReactionRecord = await context.sudo().prisma.articleReaction.findFirst({
              where: {
                articleId: articleIdNum,
                userId: userIdNum,
              },
              select: {
                reaction: true,
              },
            });

            const userReaction = userReactionRecord?.reaction || null;

            // Формируем объект для возврата
            const updatedArticle = {
              id: String(articleData.id),
              title: articleData.title,
              content: articleData.content,
              excerpt: articleData.excerpt,
              author: articleData.author ? {
                id: String(articleData.author.id),
                username: articleData.author.username,
                avatar: articleData.author.avatar,
              } : null,
              previewImage: articleData.previewImage,
              tags: Array.isArray(articleData.tags) ? articleData.tags : [],
              difficulty: articleData.difficulty,
              likes_count: articleData.likes_count,
              dislikes_count: articleData.dislikes_count,
              views: articleData.views,
              publishedAt: articleData.publishedAt,
              createdAt: articleData.createdAt,
              updatedAt: articleData.updatedAt,
              comments: articleData.comments.map((c: any) => ({ id: String(c.id) })),
              userReaction: userReaction,
            };
            
            logger.info(`[reactToArticle] Article fetched successfully:`, {
              id: updatedArticle.id,
              title: updatedArticle.title,
              likes: updatedArticle.likes_count,
              dislikes: updatedArticle.dislikes_count,
              userReaction: updatedArticle.userReaction,
            });

            logger.info(`[reactToArticle] SUCCESS: articleId=${articleIdNum}, userId=${userIdNum}, reaction=${finalUserReaction}`);
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
          const previousLikes = comment.likes_count || 0; // Сохраняем предыдущее значение для проверки порогов

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
            } else {
              // Меняем реакцию
              logger.info(`[reactToComment] Updating reaction: reactionId=${existingReaction[0].id}, newReaction=${reaction}`);
              await context.sudo().query.CommentReaction.updateOne({
                where: { id: existingReaction[0].id },
                data: { reaction },
              });
              finalUserReaction = reaction;
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
          }

          // ИСПРАВЛЕНИЕ RACE CONDITION: Пересчитываем счетчики на основе фактических записей реакций
          // Это гарантирует консистентность даже при одновременных запросах
          logger.info(`[reactToComment] Recalculating counts from actual reactions: commentId=${commentId}`);
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
          logger.info(`[reactToComment] Recalculated counts: likes=${newLikes}, dislikes=${newDislikes}`);

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

