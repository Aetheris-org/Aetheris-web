import { factories } from '@strapi/strapi';

function buildMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) {
    return url;
  }
  const base =
    process.env.STRAPI_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    process.env.STRAPI_URL ||
    process.env.URL ||
    'http://localhost:1337';
  return `${base}${url}`;
}

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async findOne(ctx) {
    const { id } = ctx.params;
    const numericId = Number(id);

    if (!numericId || Number.isNaN(numericId) || numericId <= 0) {
      return ctx.badRequest('Invalid profile id');
    }

    try {
      const user = await strapi.db.query('plugin::users-permissions.user').findOne({
        where: { id: numericId },
        select: ['id', 'username', 'bio', 'createdAt', 'updatedAt'],
        populate: {
          avatar: {
            select: ['url'],
          },
        },
      });

      if (!user) {
        return ctx.notFound('Profile not found');
      }

      const publishedArticles = await strapi.db.query('api::article.article').findMany({
        where: {
          author: numericId,
          publishedAt: { $notNull: true },
        },
        orderBy: { publishedAt: 'desc' },
        limit: 20,
        populate: {
          author: {
            select: ['id', 'username'],
          },
          preview_image: {
            select: ['url'],
          },
        },
        select: [
          'id',
          'title',
          'content',
          'excerpt',
          'tags',
          'difficulty',
          'likes_count',
          'dislikes_count',
          'comments_count',
          'createdAt',
          'updatedAt',
          'publishedAt',
        ],
      });

      const totalArticles = await strapi.db.query('api::article.article').count({
        where: { author: numericId, publishedAt: { $notNull: true } },
      });

      const draftArticles = await strapi.db.query('api::article.article').count({
        where: { author: numericId, publishedAt: null },
      });

      const totalLikes = publishedArticles.reduce(
        (acc, article: any) => acc + (article.likes_count || 0),
        0,
      );
      const totalComments = publishedArticles.reduce(
        (acc, article: any) => acc + (article.comments_count || 0),
        0,
      );

      const topTags = Array.from(
        new Set(
          publishedArticles.flatMap((article: any) => Array.isArray(article.tags) ? article.tags : []),
        ),
      ).slice(0, 12);

      const adaptedArticles = publishedArticles.map((article: any) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        tags: Array.isArray(article.tags) ? article.tags : [],
        author: {
          id: numericId,
          username: user.username,
          avatar: buildMediaUrl(user.avatar?.url) || undefined,
        },
        difficulty: article.difficulty || undefined,
        likes: article.likes_count ?? undefined,
        dislikes: article.dislikes_count ?? undefined,
        commentsCount: article.comments_count ?? undefined,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt ?? undefined,
        status: 'published',
        previewImage: buildMediaUrl(article.preview_image?.url) || undefined,
      }));

      ctx.body = {
        data: {
          user: {
            id: user.id,
            username: user.username,
            bio: user.bio,
            memberSince: user.createdAt,
            avatarUrl: buildMediaUrl(user.avatar?.url),
          },
          stats: {
            publishedArticles: totalArticles,
            draftArticles,
            totalLikes,
            totalComments,
          },
          highlights: {
            tags: topTags,
            recentArticleCount: adaptedArticles.length,
          },
          articles: adaptedArticles,
        },
      };
    } catch (error) {
      strapi.log.error('❌ Profile controller error:', error);
      return ctx.internalServerError('Failed to load profile data');
    }
  },
}));


