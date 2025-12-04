/**
 * ЕДИНАЯ GraphQL схема - все queries и mutations в одном месте
 * Переписано с нуля для устранения конфликтов OrderDirection
 * 
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем только base типы, не создаем новые enums
 * которые могут конфликтовать с встроенными типами KeystoneJS
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';
import { createNotification, shouldNotifyAboutLike } from '../lib/notifications';
import { searchAndFilterArticles } from './articles';

export const extendGraphqlSchema = graphql.extend((base) => {
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Определяем enum ВНУТРИ функции extend,
  // но убеждаемся, что он не конфликтует с встроенными типами
  const ReactionType = graphql.enum({
    name: 'ReactionType',
    values: graphql.enumValues(['like', 'dislike']),
  });

  // ============================================
  // CUSTOM TYPES - используем base.object() для существующих типов
  // ============================================
  
  // Тип для автора в результатах реакций
  const ReactToArticleAuthor = graphql.object<{ id: string; username: string; avatar: string | null }>()({
    name: 'ReactToArticleAuthor',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      username: graphql.field({ type: graphql.nonNull(graphql.String) }),
      avatar: graphql.field({ type: graphql.String }),
    },
  });

  // Тип для контента статьи
  const ReactToArticleContent = graphql.object<{ document: any }>()({
    name: 'ReactToArticleContent',
    fields: {
      document: graphql.field({ type: graphql.JSON }),
    },
  });

  // Тип для результата reactToArticle
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

  // Тип для автора в результатах поиска
  const SearchArticleAuthor = graphql.object<{ id: number; username: string; avatar: string | null }>()({
    name: 'SearchArticleAuthor',
    fields: {
      id: graphql.field({ type: graphql.nonNull(graphql.ID) }),
      username: graphql.field({ type: graphql.nonNull(graphql.String) }),
      avatar: graphql.field({ type: graphql.String }),
    },
  });

  // Тип для контента в результатах поиска
  const SearchArticleContent = graphql.object<{ document: any }>()({
    name: 'SearchArticleContent',
    fields: {
      document: graphql.field({ 
        type: graphql.JSON,
        resolve: (content) => content?.document || content,
      }),
    },
  });

  // Тип для статьи в результатах поиска
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

  // Тип для результата поиска с total
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

  // ============================================
  // QUERIES
  // ============================================
  const queries = {
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
          const normalizedArgs = {
            search: args.search ?? undefined,
            tags: args.tags ? args.tags.filter((tag): tag is string => tag !== null) : undefined,
            difficulty: args.difficulty ?? undefined,
            sort: args.sort ?? undefined,
            skip: args.skip ?? undefined,
            take: args.take ?? undefined,
          };
          const result = await searchAndFilterArticles(context, normalizedArgs);
          logger.debug('[searchArticles] Result:', {
            articlesCount: result.articles?.length || 0,
            total: result.total,
          });
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
  };

  // ============================================
  // MUTATIONS
  // ============================================
  const mutations = {
    reactToArticle: graphql.field({
      type: ReactToArticleResult,
      args: {
        articleId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        reaction: graphql.arg({ type: graphql.nonNull(ReactionType) }),
      },
      async resolve(root, { articleId, reaction }, context) {
        logger.info(`[reactToArticle] START: articleId=${articleId}, reaction=${reaction}`);
        
        const session = context.session;
        if (!session?.itemId) {
          throw new Error('Authentication required');
        }

        const userId = session.itemId;
        const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        if (isNaN(userIdNum)) {
          throw new Error('Invalid user ID');
        }

        const articleIdNum = typeof articleId === 'string' ? parseInt(articleId, 10) : articleId;
        if (isNaN(articleIdNum)) {
          throw new Error('Invalid article ID');
        }

        if (reaction !== 'like' && reaction !== 'dislike') {
          throw new Error('Invalid reaction type');
        }

        const article = await context.query.Article.findOne({
          where: { id: String(articleIdNum) },
          query: 'id likes_count dislikes_count author { id }',
        });

        if (!article) {
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
        
        await context.sudo().query.Article.updateOne({
          where: { id: String(articleIdNum) },
          data: {
            likes_count: likeReactions,
            dislikes_count: dislikeReactions,
          },
          query: 'id',
        });

        if (reaction === 'like' && finalUserReaction === 'like' && article.author?.id) {
          try {
            const thresholds = [1, 5, 10, 50, 100, 500, 1000];
            const threshold = shouldNotifyAboutLike(likeReactions, previousLikes, thresholds);
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
                  metadata: { threshold, likesCount: likeReactions },
                }, true);
              }
            }
          } catch (error: any) {
            logger.error(`[reactToArticle] Failed to create notification:`, error);
          }
        }

        const articleData = await context.sudo().prisma.article.findUnique({
          where: { id: articleIdNum },
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            comments: { select: { id: true } },
          },
        });

        if (!articleData) {
          throw new Error('Article not found');
        }

        const userReactionRecord = await context.sudo().prisma.articleReaction.findFirst({
          where: { articleId: articleIdNum, userId: userIdNum },
          select: { reaction: true },
        });

        const userReaction = userReactionRecord?.reaction || null;

        return {
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
          userReaction,
        };
      },
    }),

    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем base.object() вместо создания нового типа
    // Это предотвращает конфликты с OrderDirection и другими встроенными типами
    reactToComment: graphql.field({
      type: base.object('Comment'),
      args: {
        commentId: graphql.arg({ type: graphql.nonNull(graphql.ID) }),
        reaction: graphql.arg({ type: graphql.nonNull(ReactionType) }),
      },
      async resolve(root, { commentId, reaction }, context) {
        logger.info(`[reactToComment] START: commentId=${commentId}, reaction=${reaction}`);
        
        const session = context.session;
        if (!session?.itemId) {
          throw new Error('Authentication required');
        }

        const userId = session.itemId;
        if (reaction !== 'like' && reaction !== 'dislike') {
          throw new Error('Invalid reaction type');
        }

        const comment = await context.query.Comment.findOne({
          where: { id: commentId },
          query: 'id likes_count dislikes_count author { id } article { id }',
        });

        if (!comment) {
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
        
        await context.sudo().query.Comment.updateOne({
          where: { id: commentId },
          data: {
            likes_count: likeReactions,
            dislikes_count: dislikeReactions,
          },
          query: 'id',
        });

        if (reaction === 'like' && finalUserReaction === 'like' && comment.author?.id) {
          try {
            const thresholds = [1, 3, 5, 10, 25];
            const threshold = shouldNotifyAboutLike(likeReactions, previousLikes, thresholds);
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
                  metadata: { threshold, likesCount: likeReactions },
                }, true);
              }
            }
          } catch (error: any) {
            logger.error(`[reactToComment] Failed to create notification:`, error);
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

    updateProfile: graphql.field({
      type: base.object('User'),
      args: {
        username: graphql.arg({ type: graphql.String }),
        bio: graphql.arg({ type: graphql.String }),
        avatar: graphql.arg({ type: graphql.String }),
        coverImage: graphql.arg({ type: graphql.String }),
      },
      async resolve(root, args, context) {
        logger.info('[updateProfile] START:', args);

        const session = context.session;
        if (!session?.itemId) {
          throw new Error('Authentication required');
        }

        const userId = session.itemId;

        if (args.username !== undefined && (args.username.length < 3 || args.username.length > 50)) {
          throw new Error('Username must be between 3 and 50 characters');
        }
        
        if (args.bio !== undefined && args.bio !== null && args.bio.length > 500) {
          throw new Error('Bio must be 500 characters or less');
        }

        const updateData: any = {};
        if (args.username !== undefined) {
          updateData.username = args.username;
        }
        if (args.bio !== undefined) {
          updateData.bio = args.bio === null || args.bio === '' ? null : args.bio.trim();
        }
        if (args.avatar !== undefined) {
          updateData.avatar = args.avatar === null || args.avatar === '' ? null : args.avatar;
        }
        if (args.coverImage !== undefined) {
          updateData.coverImage = args.coverImage === null || args.coverImage === '' ? null : args.coverImage;
        }

        const currentUser = await context.sudo().query.User.findOne({
          where: { id: String(userId) },
          query: 'id username bio avatar coverImage',
        });
        
        if (!currentUser) {
          throw new Error('User not found');
        }

        const finalUpdateData: any = {};
        if (args.username !== undefined && args.username !== currentUser.username) {
          finalUpdateData.username = args.username;
        }
        if (args.bio !== undefined) {
          const newBio = args.bio === null || args.bio === '' ? '' : args.bio.trim();
          const currentBio = currentUser.bio || '';
          if (newBio !== currentBio) {
            finalUpdateData.bio = newBio;
          }
        }
        if (args.avatar !== undefined) {
          const newAvatar = args.avatar === null || args.avatar === '' ? null : args.avatar;
          if (newAvatar !== currentUser.avatar) {
            finalUpdateData.avatar = newAvatar;
          }
        }
        if (args.coverImage !== undefined) {
          const newCoverImage = args.coverImage === null || args.coverImage === '' ? null : args.coverImage;
          if (newCoverImage !== currentUser.coverImage) {
            finalUpdateData.coverImage = newCoverImage;
          }
        }

        let updatedUser;
        if (Object.keys(finalUpdateData).length > 0) {
          updatedUser = await context.sudo().query.User.updateOne({
            where: { id: String(userId) },
            data: finalUpdateData,
            query: 'id username bio avatar coverImage createdAt updatedAt',
          });
        } else {
          updatedUser = await context.sudo().query.User.findOne({
            where: { id: String(userId) },
            query: 'id username bio avatar coverImage createdAt updatedAt',
          });
        }

        if (!updatedUser) {
          throw new Error('User not found');
        }

        return {
          ...updatedUser,
          createdAt: updatedUser.createdAt instanceof Date 
            ? updatedUser.createdAt 
            : new Date(updatedUser.createdAt),
          updatedAt: updatedUser.updatedAt instanceof Date 
            ? updatedUser.updatedAt 
            : new Date(updatedUser.updatedAt),
        };
      },
    }),
  };

  // ============================================
  // RETURN - один раз, без дублирования
  // ============================================
  return {
    query: queries,
    mutation: mutations,
  };
});
