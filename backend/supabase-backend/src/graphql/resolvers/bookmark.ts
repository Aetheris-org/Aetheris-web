/**
 * Bookmark Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth } from '../../utils/auth';

export const Query = {
  bookmarks: async (_, { skip = 0, take = 20 }, context) => {
    requireAuth(context);

    return await context.prisma.bookmark.findMany({
      where: { userId: context.user!.id },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  },
};

export const Mutation = {
  toggleBookmark: async (_, { articleId }, context) => {
    requireAuth(context);

    const articleIdNum = parseInt(articleId);

    // Проверяем существование статьи
    await context.prisma.article.findUniqueOrThrow({
      where: { id: articleIdNum },
    });

    const existing = await context.prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId: context.user!.id,
          articleId: articleIdNum,
        },
      },
    });

    if (existing) {
      // Удаляем закладку
      await context.prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return null;
    } else {
      // Создаем закладку
      return await context.prisma.bookmark.create({
        data: {
          userId: context.user!.id,
          articleId: articleIdNum,
        },
        include: {
          article: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });
    }
  },
};

