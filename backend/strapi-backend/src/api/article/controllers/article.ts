// @ts-nocheck

import { factories } from '@strapi/strapi';

const ARTICLE_UID = 'api::article.article';
const ARTICLE_REACTION_UID = 'api::article-reaction.article-reaction';
const ARTICLE_BOOKMARK_UID = 'api::article-bookmark.article-bookmark';

const slugify = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 200);

type ReactionType = 'like' | 'dislike';

export default factories.createCoreController(ARTICLE_UID as any, ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Необходима авторизация');
    }

    const payload = ctx.request.body?.data ?? {};
    const title = payload.title?.trim();
    const content = payload.content?.trim();

    if (!title || !content) {
      return ctx.badRequest('Необходимо заполнить заголовок и контент');
    }

    const excerpt = payload.excerpt?.trim() || null;
    const tags = Array.isArray(payload.tags)
      ? payload.tags.filter((tag: unknown) => typeof tag === 'string' && tag.trim())
      : [];
    const difficulty = ['easy', 'medium', 'hard'].includes(payload.difficulty)
      ? payload.difficulty
      : 'medium';
    const previewImageId =
      typeof payload.preview_image === 'number' ? payload.preview_image : null;
    const publishDate =
      typeof payload.publishedAt === 'string' ? new Date(payload.publishedAt).toISOString() : null;

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let suffix = 1;

    // ensure unique slug
    while (
      await strapi.entityService.count(ARTICLE_UID, {
        filters: { slug },
      })
    ) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const entry = await strapi.entityService.create(ARTICLE_UID, {
      data: {
        title,
        slug,
        content,
        excerpt,
        tags,
        difficulty,
        preview_image: previewImageId,
        author: user.id,
        status: publishDate ? 'published' : 'draft',
        publishedAt: publishDate,
      },
      populate: {
        author: {
          fields: ['username'],
          populate: { avatar: true },
        },
        preview_image: true,
      },
    });

    const response = await this.transformResponse(entry);
    if (response.data) {
      await this.enrichArticlesWithUserState(ctx, [response.data]);
    }
    ctx.body = response;
  },

  async find(ctx) {
    const userId = ctx.state.user?.id ?? null;
    strapi.log.info(
      `🔎 Article.find requested by ${userId ? `user ${userId}` : 'public'} with query: ${JSON.stringify(ctx.query || {})}`,
    );

    const response = await super.find(ctx);

    const count = Array.isArray(response?.data) ? response.data.length : 0;
    strapi.log.info(`📦 Article.find returning ${count} item(s) for ${userId ? `user ${userId}` : 'public'}`);

    await this.enrichArticlesWithUserState(ctx, response?.data);
    return response;
  },

  async findOne(ctx) {
    const { id } = ctx.params ?? {};
    const userId = ctx.state.user?.id ?? null;

    strapi.log.info(
      `🔍 Article.findOne requested for id=${id} by ${userId ? `user ${userId}` : 'public'} with query: ${JSON.stringify(
        ctx.query || {},
      )}`,
    );

    const response = await super.findOne(ctx);

    if (!response?.data) {
      strapi.log.warn(`⚠️ Article.findOne could not find article with id=${id}. Returning 404.`);
      return ctx.notFound('article.notFound');
    }

    const rawArticle = response.data.attributes ?? response.data;
    const slug = rawArticle.slug ?? '<no-slug>';
    const publishedAt = rawArticle.publishedAt ?? rawArticle.published_at ?? null;

    strapi.log.info(
      `✅ Article.findOne resolved id=${response.data.id} slug=${slug} publishedAt=${publishedAt} for ${userId ? `user ${userId}` : 'public'}`,
    );

    await this.enrichArticlesWithUserState(ctx, [response.data]);

    return response;
  },

  async search(ctx) {
    const { q = '', skip = 0, limit = 100 } = ctx.query as Record<string, string>;

    const results = await strapi.entityService.findMany(ARTICLE_UID, {
      filters: {
        $and: [
          { publishedAt: { $notNull: true } },
          {
            $or: [
              { title: { $containsi: q } },
              { excerpt: { $containsi: q } },
              { content: { $containsi: q } },
              { tags: { $containsi: q } },
            ],
          },
        ],
      },
      populate: {
        author: {
          fields: ['username'],
          populate: { avatar: true },
        },
        preview_image: true,
      },
      sort: [{ createdAt: 'desc' }],
      offset: Number(skip) || 0,
      limit: Number(limit) || 100,
    });

    const transformed = await this.transformResponse(results);
    await this.enrichArticlesWithUserState(ctx, transformed.data);
    return transformed;
  },

  async react(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Необходима авторизация');
    }

    const documentId = ctx.params?.id;
    const { reaction } = ctx.request.body as { reaction?: ReactionType };

    if (!documentId) {
      strapi.log.warn('⚠️ Article.react called without documentId in params');
      return ctx.badRequest('Некорректный идентификатор статьи');
    }

    if (!reaction || !['like', 'dislike'].includes(reaction)) {
      return ctx.badRequest('reaction должен быть "like" или "dislike"');
    }

    const [articleEntry] = await strapi.entityService.findMany(ARTICLE_UID, {
      filters: {
        documentId,
      },
      limit: 1,
    });

    if (!articleEntry) {
      strapi.log.warn(`⚠️ Article.react unable to find article for documentId=${documentId}`);
      return ctx.notFound('article.notFound');
    }

    const articleDbId = articleEntry.id;

    const existing = await strapi.entityService.findMany(ARTICLE_REACTION_UID, {
      filters: {
        user: user.id,
        article: articleDbId,
      },
      limit: 1,
    });

    let userReaction: ReactionType | null = null;

    if (existing.length > 0) {
      const current = existing[0];
      if (current.reaction === reaction) {
        await strapi.entityService.delete(ARTICLE_REACTION_UID, current.id);
        userReaction = null;
      } else {
        await strapi.entityService.update(ARTICLE_REACTION_UID, current.id, {
          data: { reaction },
        });
        userReaction = reaction;
      }
    } else {
      await strapi.entityService.create(ARTICLE_REACTION_UID, {
        data: {
          reaction,
        article: articleDbId,
          user: user.id,
        },
      });
      userReaction = reaction;
    }

    const [likesCount, dislikesCount] = await Promise.all([
      strapi.entityService.count(ARTICLE_REACTION_UID, {
        filters: { article: articleDbId, reaction: 'like' },
      }),
      strapi.entityService.count(ARTICLE_REACTION_UID, {
        filters: { article: articleDbId, reaction: 'dislike' },
      }),
    ]);

    await strapi.entityService.update(ARTICLE_UID, articleDbId, {
      data: {
        likes_count: likesCount,
        dislikes_count: dislikesCount,
      },
    });

    const updatedArticle = await strapi.entityService.findOne(ARTICLE_UID, articleDbId, {
      populate: {
        author: {
          fields: ['username'],
          populate: { avatar: true },
        },
        preview_image: true,
      },
    });

    const transformed = await this.transformResponse(updatedArticle);
    if (transformed.data) {
      transformed.data.attributes.user_reaction = userReaction;
      transformed.data.attributes.is_bookmarked = await this.checkIsBookmarked(
        Number(id),
        user.id,
      );
    }

    return transformed;
  },

  async enrichArticlesWithUserState(
    ctx,
    entries: Array<{ id: number; attributes: Record<string, any> }>
  ) {
    if (!Array.isArray(entries)) {
      strapi.log.info('ℹ️ enrichArticlesWithUserState called with non-array entries, skipping.');
      return;
    }

    const userId = ctx.state.user?.id;
    strapi.log.info(
      `🔧 enrichArticlesWithUserState for ${userId ? `user ${userId}` : 'public'} on ${entries.length} item(s)`,
    );

    for (const entry of entries) {
      if (!entry) continue;

      const target =
        entry.attributes && typeof entry.attributes === 'object' ? entry.attributes : entry;
      const articleId = entry.id ?? target.id;

      if (!articleId) {
        continue;
      }

      if (userId) {
        strapi.log.debug
          ? strapi.log.debug(`🔐 Enriching article ${articleId} with reactions/bookmarks for user ${userId}`)
          : strapi.log.info(`🔐 Enriching article ${articleId} with reactions/bookmarks for user ${userId}`);

        const reaction = await strapi.entityService.findMany(ARTICLE_REACTION_UID, {
          filters: {
            user: userId,
            article: articleId,
          },
          fields: ['reaction'],
          limit: 1,
        });

        target.user_reaction = reaction[0]?.reaction ?? null;
        target.is_bookmarked = await this.checkIsBookmarked(articleId, userId);
      } else {
        target.user_reaction = null;
        target.is_bookmarked = false;
      }
    }
  },

  async checkIsBookmarked(articleId: number, userId: number) {
    const bookmark = await strapi.entityService.findMany(ARTICLE_BOOKMARK_UID, {
      filters: {
        article: articleId,
        user: userId,
      },
      fields: ['id'],
      limit: 1,
    });

    return bookmark.length > 0;
  },
}));

