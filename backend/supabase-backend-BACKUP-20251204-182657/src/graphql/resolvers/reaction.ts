/**
 * Reaction Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth } from '../../utils/auth';
import { createNotification } from '../../services/notification';

export const Mutation = {
  reactToArticle: async (_, { articleId, reaction }, context) => {
    requireAuth(context);

    const article = await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(articleId) },
      include: { author: true },
    });

    const existingReaction = await context.prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId: parseInt(articleId),
          userId: context.user!.id,
        },
      },
    });

    let finalReaction: string | null = null;
    const previousLikes = article.likesCount;

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        // Удаляем реакцию (toggle off)
        await context.prisma.articleReaction.delete({
          where: { id: existingReaction.id },
        });
        finalReaction = null;
      } else {
        // Изменяем реакцию
        await context.prisma.articleReaction.update({
          where: { id: existingReaction.id },
          data: { reaction },
        });
        finalReaction = reaction;
      }
    } else {
      // Создаем новую реакцию
      await context.prisma.articleReaction.create({
        data: {
          articleId: parseInt(articleId),
          userId: context.user!.id,
          reaction,
        },
      });
      finalReaction = reaction;
    }

    // Пересчитываем счетчики
    const likesCount = await context.prisma.articleReaction.count({
      where: {
        articleId: parseInt(articleId),
        reaction: 'like',
      },
    });
    const dislikesCount = await context.prisma.articleReaction.count({
      where: {
        articleId: parseInt(articleId),
        reaction: 'dislike',
      },
    });

    await context.prisma.article.update({
      where: { id: parseInt(articleId) },
      data: {
        likesCount,
        dislikesCount,
      },
    });

    // Создаем уведомление о лайке
    if (reaction === 'like' && finalReaction === 'like' && article.authorId !== context.user!.id) {
      try {
        const thresholds = [1, 5, 10, 50, 100, 500, 1000];
        const threshold = shouldNotifyAboutLike(likesCount, previousLikes, thresholds);

        if (threshold !== null) {
          await createNotification(context, {
            type: 'article_like',
            userId: article.authorId,
            actorId: context.user!.id,
            articleId: article.id,
            metadata: { threshold, likesCount },
          });
        }
      } catch (error: any) {
        context.logger.error('Failed to create notification for article like', {
          error: error.message,
          articleId: parseInt(articleId),
        });
      }
    }

    return await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(articleId) },
      include: { author: true },
    });
  },
  reactToComment: async (_, { commentId, reaction }, context) => {
    requireAuth(context);

    const comment = await context.prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(commentId) },
      include: { author: true },
    });

    const existingReaction = await context.prisma.commentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId: parseInt(commentId),
          userId: context.user!.id,
        },
      },
    });

    let finalReaction: string | null = null;
    const previousLikes = comment.likesCount;

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        await context.prisma.commentReaction.delete({
          where: { id: existingReaction.id },
        });
        finalReaction = null;
      } else {
        await context.prisma.commentReaction.update({
          where: { id: existingReaction.id },
          data: { reaction },
        });
        finalReaction = reaction;
      }
    } else {
      await context.prisma.commentReaction.create({
        data: {
          commentId: parseInt(commentId),
          userId: context.user!.id,
          reaction,
        },
      });
      finalReaction = reaction;
    }

    // Пересчитываем счетчики
    const likesCount = await context.prisma.commentReaction.count({
      where: {
        commentId: parseInt(commentId),
        reaction: 'like',
      },
    });
    const dislikesCount = await context.prisma.commentReaction.count({
      where: {
        commentId: parseInt(commentId),
        reaction: 'dislike',
      },
    });

    await context.prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        likesCount,
        dislikesCount,
      },
    });

    // Создаем уведомление о лайке
    if (reaction === 'like' && finalReaction === 'like' && comment.authorId !== context.user!.id) {
      try {
        const thresholds = [1, 3, 5, 10, 25];
        const threshold = shouldNotifyAboutLike(likesCount, previousLikes, thresholds);

        if (threshold !== null) {
          await createNotification(context, {
            type: 'comment_like',
            userId: comment.authorId,
            actorId: context.user!.id,
            commentId: comment.id,
            metadata: { threshold, likesCount },
          });
        }
      } catch (error: any) {
        context.logger.error('Failed to create notification for comment like', {
          error: error.message,
          commentId: parseInt(commentId),
        });
      }
    }

    return await context.prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(commentId) },
      include: {
        author: true,
        article: true,
        parent: true,
      },
    });
  },
};

function shouldNotifyAboutLike(
  currentLikes: number,
  previousLikes: number,
  thresholds: number[]
): number | null {
  for (const threshold of thresholds) {
    if (currentLikes >= threshold && previousLikes < threshold) {
      return threshold;
    }
  }
  return null;
}

