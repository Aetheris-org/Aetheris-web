/**
 * Comment Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth, requireOwnership } from '../../utils/auth';
import { createNotification } from '../../services/notification';

export const Query = {
  comment: async (_, { id }, context) => {
    return await context.prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(id) },
      include: {
        author: true,
        article: { include: { author: true } },
        parent: true,
      },
    });
  },
  comments: async (_, { articleId, skip = 0, take = 50 }, context) => {
    return await context.prisma.comment.findMany({
      where: {
        articleId: parseInt(articleId),
        parentId: null, // Только корневые комментарии
      },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      include: {
        author: true,
        children: {
          include: {
            author: true,
            children: {
              include: { author: true },
            },
          },
        },
      },
    });
  },
};

export const Mutation = {
  createComment: async (_, { input }, context) => {
    requireAuth(context);

    if (input.text.length < 1 || input.text.length > 10000) {
      throw new Error('Comment text must be between 1 and 10000 characters');
    }

    // Проверяем существование статьи
    const article = await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(input.articleId) },
      include: { author: true },
    });

    // Если есть parentId, проверяем существование родительского комментария
    if (input.parentId) {
      await context.prisma.comment.findUniqueOrThrow({
        where: { id: parseInt(input.parentId) },
      });
    }

    const comment = await context.prisma.comment.create({
      data: {
        text: input.text,
        articleId: parseInt(input.articleId),
        authorId: context.user!.id,
        parentId: input.parentId ? parseInt(input.parentId) : null,
      },
      include: {
        author: true,
        article: { include: { author: true } },
        parent: input.parentId
          ? { include: { author: true } }
          : undefined,
      },
    });

    // Создаем уведомления
    try {
      if (input.parentId) {
        // Ответ на комментарий - уведомляем автора родительского комментария
        const parentComment = await context.prisma.comment.findUniqueOrThrow({
          where: { id: parseInt(input.parentId) },
          include: { author: true },
        });

        if (parentComment.authorId !== context.user!.id) {
          await createNotification(context, {
            type: 'comment_reply',
            userId: parentComment.authorId,
            actorId: context.user!.id,
            articleId: article.id,
            commentId: parseInt(input.parentId),
          });
        }
      } else {
        // Новый комментарий - уведомляем автора статьи
        if (article.authorId !== context.user!.id) {
          await createNotification(context, {
            type: 'comment',
            userId: article.authorId,
            actorId: context.user!.id,
            articleId: article.id,
            commentId: comment.id,
          });
        }
      }
    } catch (error: any) {
      context.logger.error('Failed to create notification for comment', {
        error: error.message,
        commentId: comment.id,
      });
    }

    return comment;
  },
  updateComment: async (_, { id, text }, context) => {
    requireAuth(context);

    if (text.length < 1 || text.length > 10000) {
      throw new Error('Comment text must be between 1 and 10000 characters');
    }

    const comment = await context.prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    requireOwnership(context, comment.authorId, 'You can only edit your own comments');

    return await context.prisma.comment.update({
      where: { id: parseInt(id) },
      data: { text },
      include: {
        author: true,
        article: true,
        parent: true,
      },
    });
  },
  deleteComment: async (_, { id }, context) => {
    requireAuth(context);

    const comment = await context.prisma.comment.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    requireOwnership(context, comment.authorId, 'You can only delete your own comments');

    await context.prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    return true;
  },
};

export const Comment = {
  children: async (parent, _, context) => {
    return await context.prisma.comment.findMany({
      where: { parentId: parent.id },
      orderBy: { createdAt: 'asc' },
      include: { author: true },
    });
  },
  reactions: async (parent, _, context) => {
    return await context.prisma.commentReaction.findMany({
      where: { commentId: parent.id },
      include: { user: true },
    });
  },
  userReaction: async (parent, _, context) => {
    if (!context.user) return null;

    const reaction = await context.prisma.commentReaction.findUnique({
      where: {
        commentId_userId: {
          commentId: parent.id,
          userId: context.user.id,
        },
      },
    });

    return reaction?.reaction as any || null;
  },
};

