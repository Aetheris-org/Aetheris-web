/**
 * Article Resolvers
 */
import { GraphQLContext } from '../context';
import { requireAuth, requireOwnership } from '../../utils/auth';
import { searchAndFilterArticles } from '../../services/article';

export const Query = {
  article: async (_, { id }, context) => {
    const article = await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(id) },
      include: { author: true },
    });

    // Увеличиваем счетчик просмотров
    await context.prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return article;
  },
  articles: async (_, { skip = 0, take = 10, authorId, published }, context) => {
    const where: any = {};
    if (authorId) where.authorId = authorId;
    if (published !== undefined) {
      where.publishedAt = published ? { not: null } : null;
    }

    return await context.prisma.article.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
  },
  searchArticles: async (_, { input }, context) => {
    return await searchAndFilterArticles(context, {
      search: input.search || undefined,
      tags: input.tags?.filter((t): t is string => t !== null) || undefined,
      difficulty: input.difficulty || undefined,
      sort: input.sort || undefined,
      skip: input.skip || undefined,
      take: input.take || undefined,
    });
  },
};

export const Mutation = {
  createArticle: async (_, { input }, context) => {
    requireAuth(context);

    if (input.title.length < 10 || input.title.length > 200) {
      throw new Error('Title must be between 10 and 200 characters');
    }
    if (input.excerpt.length > 500) {
      throw new Error('Excerpt must be 500 characters or less');
    }

    return await context.prisma.article.create({
      data: {
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        tags: input.tags,
        difficulty: input.difficulty,
        previewImage: input.previewImage || null,
        publishedAt: input.publishedAt || null,
        authorId: context.user!.id,
      },
      include: { author: true },
    });
  },
  updateArticle: async (_, { id, input }, context) => {
    requireAuth(context);

    const article = await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    requireOwnership(context, article.authorId, 'You can only edit your own articles');

    const updateData: any = {};
    if (input.title !== undefined) {
      if (input.title.length < 10 || input.title.length > 200) {
        throw new Error('Title must be between 10 and 200 characters');
      }
      updateData.title = input.title;
    }
    if (input.content !== undefined) updateData.content = input.content;
    if (input.excerpt !== undefined) {
      if (input.excerpt.length > 500) {
        throw new Error('Excerpt must be 500 characters or less');
      }
      updateData.excerpt = input.excerpt;
    }
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.previewImage !== undefined) updateData.previewImage = input.previewImage || null;
    if (input.publishedAt !== undefined) updateData.publishedAt = input.publishedAt || null;

    return await context.prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { author: true },
    });
  },
  deleteArticle: async (_, { id }, context) => {
    requireAuth(context);

    const article = await context.prisma.article.findUniqueOrThrow({
      where: { id: parseInt(id) },
    });

    requireOwnership(context, article.authorId, 'You can only delete your own articles');

    await context.prisma.article.delete({
      where: { id: parseInt(id) },
    });

    return true;
  },
};

export const Article = {
  comments: async (parent, _, context) => {
    return await context.prisma.comment.findMany({
      where: { articleId: parent.id },
      orderBy: { createdAt: 'asc' },
      include: { author: true },
    });
  },
  reactions: async (parent, _, context) => {
    return await context.prisma.articleReaction.findMany({
      where: { articleId: parent.id },
      include: { user: true },
    });
  },
  bookmarks: async (parent, _, context) => {
    return await context.prisma.bookmark.findMany({
      where: { articleId: parent.id },
      include: { user: true },
    });
  },
  userReaction: async (parent, _, context) => {
    if (!context.user) return null;

    const reaction = await context.prisma.articleReaction.findUnique({
      where: {
        articleId_userId: {
          articleId: parent.id,
          userId: context.user.id,
        },
      },
    });

    return reaction?.reaction as any || null;
  },
};

