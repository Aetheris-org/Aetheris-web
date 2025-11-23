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
import { extendGraphqlSchemaProfile } from './profile';

export const extendGraphqlSchema = graphql.extend((base) => {
  // Определяем enum для реакций
  const ReactionType = graphql.enum({
    name: 'ReactionType',
    values: graphql.enumValues(['like', 'dislike']),
  });

  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Создаем кастомный GraphQL тип для результата поиска
  // Это предотвращает автоматическую загрузку связанных данных через неправильное поле articlesId
  // Используем base.object('Article') для полей, но возвращаем plain objects
  // KeystoneJS не будет пытаться автоматически загружать связанные данные, если мы вернем plain objects
  
  // Создаем кастомный тип для Author, чтобы избежать автоматической загрузки
  const SearchArticleAuthor = graphql.object<{ id: number; username: string; avatar: string | null }>()({
    name: 'SearchArticleAuthor',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      username: graphql.field({ type: graphql.nonNull(graphql.String) }),
      avatar: graphql.field({ type: graphql.String }),
    },
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

  // Создаем кастомный тип для Content (document field)
  const SearchArticleContent = graphql.object<{ document: any }>()({
    name: 'SearchArticleContent',
    fields: {
      document: graphql.field({ 
        type: graphql.JSON,
        resolve: (content) => content?.document || content,
      }),
    },
  });

  // Создаем кастомный тип для результата поиска статей
  // Используем base.object('Article') для совместимости, но возвращаем plain objects
  const SearchArticle = graphql.object<{
    id: number;
    title: string;
    content: any;
    excerpt: string | null;
    author: { id: number; username: string; avatar: string | null } | null;
    previewImage: string | null;
    tags: string[];
    difficulty: string;
    likes_count: number;
    dislikes_count: number;
    views: number;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    comments: { id: number }[];
    userReaction: string | null;
  }>()({
    name: 'SearchArticle',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      title: graphql.field({ type: graphql.nonNull(graphql.String) }),
      content: graphql.field({ 
        type: SearchArticleContent,
        resolve: (article) => article.content,
      }),
      excerpt: graphql.field({ type: graphql.String }),
      author: graphql.field({ 
        type: SearchArticleAuthor,
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
        type: graphql.list(graphql.object<{ id: number }>()({
          name: 'SearchArticleComment',
          fields: {
            id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
          },
        })),
        resolve: (article) => article.comments || [],
      }),
      userReaction: graphql.field({ type: graphql.String }),
    },
  });

  // Создаем тип для результата поиска с total
  const SearchArticlesResult = graphql.object<{
    articles: any[];
    total: number;
  }>()({
    name: 'SearchArticlesResult',
    fields: {
      articles: graphql.field({
        type: graphql.list(SearchArticle),
        resolve: (result) => result.articles,
      }),
      total: graphql.field({
        type: graphql.nonNull(graphql.Int),
        resolve: (result) => result.total,
      }),
    },
  });

  return {
    query: {
      // Query для поиска и фильтрации статей
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Возвращаем объект с articles и total вместо просто массива
      searchArticles: graphql.field({
        type: SearchArticlesResult,
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
            logger.debug('[searchArticles] Resolver called with args:', args);
            // Преобразуем null значения в undefined для совместимости с searchAndFilterArticles
            const normalizedArgs = {
              search: args.search ?? undefined,
              tags: args.tags ? args.tags.filter((tag): tag is string => tag !== null) : undefined,
              difficulty: args.difficulty ?? undefined,
              sort: args.sort ?? undefined,
              skip: args.skip ?? undefined,
              take: args.take ?? undefined,
            };
            const result = await searchAndFilterArticles(context, normalizedArgs);
            logger.debug('[searchArticles] Result from searchAndFilterArticles:', {
              articlesCount: result.articles?.length || 0,
              total: result.total,
              firstArticleId: result.articles?.[0]?.id,
              firstArticleIdType: typeof result.articles?.[0]?.id,
            });
            
            // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ перед возвратом
            if (result.articles && result.articles.length > 0) {
              logger.debug('[searchArticles] First article before return:', {
                id: result.articles[0].id,
                idType: typeof result.articles[0].id,
                hasAuthor: !!result.articles[0].author,
                author: result.articles[0].author ? {
                  id: result.articles[0].author.id,
                  idType: typeof result.articles[0].author.id,
                  username: result.articles[0].author.username,
                } : null,
              });
            }
            
            // Возвращаем объект с articles и total
            return {
              articles: result.articles,
              total: result.total,
            };
          } catch (error: any) {
            logger.error('[searchArticles] Error:', error);
            throw error;
          }
        },
      }),
    },
    mutation: {
      // Mutation для реакций на статьи
      // Используем кастомный тип, чтобы избежать автоматической загрузки связанных данных
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

          if (reaction !== 'like' && reaction !== 'dislike') {
            logger.error(`[reactToArticle] Invalid reaction type: ${reaction}`);
            throw new Error('Invalid reaction type');
          }

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

          if (!article) {
            logger.error(`[reactToArticle] Article not found: articleId=${articleIdNum}`);
            throw new Error('Article not found');
          }

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
                article: { connect: { id: String(articleIdNum) } },
                user: { connect: { id: userIdNum } },
                reaction,
              },
            });
            finalUserReaction = reaction;
          }

          // Пересчитываем счетчики
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

          await context.sudo().query.Article.updateOne({
            where: { id: String(articleIdNum) },
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
                  article: { id: { equals: String(articleIdNum) } },
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
                    actorId: userIdNum,
                    articleId: String(articleIdNum),
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

          // Загружаем данные через Prisma напрямую, чтобы избежать проблем с автоматической загрузкой связанных данных
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
      // Mutation для обновления профиля пользователя
      updateProfile: graphql.field({
        type: base.object('User'),
        args: {
          username: graphql.arg({ type: graphql.String }),
          bio: graphql.arg({ type: graphql.String }),
          avatar: graphql.arg({ type: graphql.String }),
          coverImage: graphql.arg({ type: graphql.String }),
        },
        async resolve(root, args, context) {
          logger.info('[updateProfile] START:', {
            hasUsername: !!args.username,
            hasBio: args.bio !== undefined,
            hasAvatar: args.avatar !== undefined,
            hasCoverImage: args.coverImage !== undefined,
          });

          const session = context.session;
          if (!session?.itemId) {
            logger.error('[updateProfile] Authentication required');
            throw new Error('Authentication required');
          }

          const userId = session.itemId;
          logger.info(`[updateProfile] userId=${userId}`);

          // Валидация входных данных
          if (args.username !== undefined && (args.username.length < 3 || args.username.length > 50)) {
            throw new Error('Username must be between 3 and 50 characters');
          }
          
          if (args.bio !== undefined && args.bio !== null && args.bio.length > 500) {
            throw new Error('Bio must be 500 characters or less');
          }

          // Подготавливаем данные для обновления
          // ВАЖНО: KeystoneJS требует, чтобы опциональные поля передавались явно, даже если null
          const updateData: any = {};
          
          if (args.username !== undefined) {
            updateData.username = args.username;
          }
          
          // Обрабатываем bio: если передано null или пустая строка, устанавливаем null
          // Если не передано вообще (undefined), не включаем в updateData
          if (args.bio !== undefined) {
            // Преобразуем пустую строку в null для опционального поля
            updateData.bio = args.bio === null || args.bio === '' ? null : args.bio.trim();
          }
          
          if (args.avatar !== undefined) {
            // Преобразуем пустую строку в null
            updateData.avatar = args.avatar === null || args.avatar === '' ? null : args.avatar;
          }
          
          if (args.coverImage !== undefined) {
            // Преобразуем пустую строку в null
            updateData.coverImage = args.coverImage === null || args.coverImage === '' ? null : args.coverImage;
          }
          
          logger.debug('[updateProfile] Update data prepared:', {
            hasUsername: 'username' in updateData,
            hasBio: 'bio' in updateData,
            bioValue: 'bio' in updateData ? (updateData.bio === null ? 'null' : `"${updateData.bio.substring(0, 50)}"`) : 'not set',
            hasAvatar: 'avatar' in updateData,
            avatarValue: 'avatar' in updateData ? (updateData.avatar === null ? 'null' : 'url') : 'not set',
            hasCoverImage: 'coverImage' in updateData,
            coverImageValue: 'coverImage' in updateData ? (updateData.coverImage === null ? 'null' : 'url') : 'not set',
          });

          // Обновляем профиль пользователя
          // ВАЖНО: Используем sudo() для обхода ограничений доступа при обновлении своего профиля
          logger.info(`[updateProfile] Updating user profile: userId=${userId}`);
          logger.debug('[updateProfile] UpdateData before update:', JSON.stringify(updateData, null, 2));
          
          // Загружаем текущего пользователя, чтобы проверить существующие значения
          const currentUser = await context.sudo().query.User.findOne({
            where: { id: String(userId) },
            query: 'id username email bio avatar coverImage',
          });
          
          if (!currentUser) {
            logger.error(`[updateProfile] User not found: userId=${userId}`);
            throw new Error('User not found');
          }
          
          // Обновляем только измененные поля
          // Для опциональных полей (bio, avatar, coverImage) используем явное значение или оставляем текущее
          const finalUpdateData: any = {};
          
          if (args.username !== undefined && args.username !== currentUser.username) {
            finalUpdateData.username = args.username;
          }
          
          // Для bio: если передано значение (включая null), обновляем
          // ВАЖНО: KeystoneJS text() поля не могут быть null, используем пустую строку
          if (args.bio !== undefined) {
            const newBio = args.bio === null || args.bio === '' ? '' : args.bio.trim();
            const currentBio = currentUser.bio || '';
            // Обновляем только если значение изменилось
            if (newBio !== currentBio) {
              finalUpdateData.bio = newBio;
            }
          }
          
          // Для avatar: если передано значение (включая null), обновляем
          if (args.avatar !== undefined) {
            const newAvatar = args.avatar === null || args.avatar === '' ? null : args.avatar;
            if (newAvatar !== currentUser.avatar) {
              finalUpdateData.avatar = newAvatar;
            }
          }
          
          // Для coverImage: если передано значение (включая null), обновляем
          if (args.coverImage !== undefined) {
            const newCoverImage = args.coverImage === null || args.coverImage === '' ? null : args.coverImage;
            if (newCoverImage !== currentUser.coverImage) {
              finalUpdateData.coverImage = newCoverImage;
            }
          }
          
          logger.debug('[updateProfile] Final update data:', JSON.stringify(finalUpdateData, null, 2));
          
          // Если есть что обновлять, выполняем обновление
          let updatedUser;
          if (Object.keys(finalUpdateData).length > 0) {
            updatedUser = await context.sudo().query.User.updateOne({
              where: { id: String(userId) },
              data: finalUpdateData,
              query: 'id username email bio avatar coverImage createdAt updatedAt',
            });
          } else {
            // Если ничего не изменилось, возвращаем текущего пользователя с полными данными
            updatedUser = await context.sudo().query.User.findOne({
              where: { id: String(userId) },
              query: 'id username email bio avatar coverImage createdAt updatedAt',
            });
          }

          if (!updatedUser) {
            logger.error(`[updateProfile] User not found after update: userId=${userId}`);
            throw new Error('User not found');
          }

          // ВАЖНО: GraphQL DateTime scalar ожидает объекты Date, а не строки ISO
          // Преобразуем строки в Date объекты, если они пришли как строки
          const result = {
            ...updatedUser,
            createdAt: updatedUser.createdAt instanceof Date 
              ? updatedUser.createdAt 
              : new Date(updatedUser.createdAt),
            updatedAt: updatedUser.updatedAt instanceof Date 
              ? updatedUser.updatedAt 
              : new Date(updatedUser.updatedAt),
          };

          logger.info(`[updateProfile] SUCCESS: userId=${userId}, username=${result.username}`);
          return result;
        },
      }),
    },
  };
});

