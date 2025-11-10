// @ts-nocheck

const ARTICLE_UID = 'api::article.article';

const normalizeMediaUrl = (file) => {
  if (!file) return null;
  if (typeof file === 'string') return file;
  if (file.url) return file.url;
  if (file?.formats?.thumbnail?.url) return file.formats.thumbnail.url;
  return null;
};

const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

const getHighlights = (articles) => {
  const tags = new Set();
  let recentCount = 0;
  const threshold = Date.now() - 1000 * 60 * 60 * 24 * 30;

  for (const article of articles) {
    ensureArray(article.tags).forEach((tag) => tags.add(tag));
    const createdAt = article.createdAt ? new Date(article.createdAt).getTime() : 0;
    if (createdAt >= threshold) {
      recentCount += 1;
    }
  }

  return {
    tags: Array.from(tags).slice(0, 10),
    recentArticleCount: recentCount,
  };
};

export default {
  async findOne(ctx) {
    const userId = Number(ctx.params.id);

    if (!Number.isFinite(userId)) {
      return ctx.badRequest('Некорректный идентификатор пользователя');
    }

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      fields: ['username', 'createdAt', 'bio'],
      populate: { avatar: true, coverImage: true },
    });

    if (!user) {
      return ctx.notFound('Пользователь не найден');
    }

    const [publishedArticles, draftArticles, articleStats, recentArticles] = await Promise.all([
      strapi.entityService.count(ARTICLE_UID, {
        filters: { author: userId, publishedAt: { $notNull: true } },
      }),
      strapi.entityService.count(ARTICLE_UID, {
        filters: { author: userId, publishedAt: { $null: true } },
      }),
      strapi.entityService.findMany(ARTICLE_UID, {
        filters: { author: userId },
        fields: ['likes_count', 'comments_count', 'tags'],
      }),
      strapi.entityService.findMany(ARTICLE_UID, {
        filters: { author: userId, publishedAt: { $notNull: true } },
        populate: {
          preview_image: true,
          author: { populate: { avatar: true }, fields: ['username'] },
        },
        fields: [
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
        sort: [{ createdAt: 'desc' }],
        limit: 10,
      }),
    ]);

    const articlesPayload = recentArticles.map((article) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt ?? undefined,
      tags: ensureArray(article.tags),
      author: {
        id: userId,
        username: article.author?.username ?? user.username,
        avatar: normalizeMediaUrl(article.author?.avatar),
      },
      difficulty: article.difficulty ?? null,
      likes: article.likes_count ?? 0,
      dislikes: article.dislikes_count ?? 0,
      commentsCount: article.comments_count ?? 0,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      status: article.publishedAt ? 'published' : 'draft',
      previewImage: normalizeMediaUrl(article.preview_image),
    }));

    let totalLikes = 0;
    let totalComments = 0;

    for (const stat of articleStats) {
      totalLikes += stat.likes_count ?? 0;
      totalComments += stat.comments_count ?? 0;
    }

    const highlights = getHighlights(articlesPayload);

    const response = {
      data: {
        user: {
          id: userId,
          username: user.username,
          bio: user.bio ?? null,
          memberSince: user.createdAt,
          avatarUrl: normalizeMediaUrl(user.avatar),
          coverImageUrl: normalizeMediaUrl(user.coverImage),
        },
        stats: {
          publishedArticles,
          draftArticles,
          totalLikes,
          totalComments,
        },
        highlights,
        articles: articlesPayload,
      },
    };

    ctx.body = response;
  },
};

