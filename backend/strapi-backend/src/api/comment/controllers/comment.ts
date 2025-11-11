import { factories } from '@strapi/strapi';

const ARTICLE_UID = 'api::article.article';
const COMMENT_UID = 'api::comment.comment';

export default factories.createCoreController(COMMENT_UID as any, ({ strapi }) => ({
  async findForArticle(ctx) {
    const { documentId } = ctx.params;
    const userId = ctx.state.user?.id ?? null;
    strapi.log.info(
      `💬 comment.findForArticle requested for documentId=${documentId} by ${
        userId ? `user ${userId}` : 'public'
      } with query=${JSON.stringify(ctx.query ?? {})}`,
    );

    if (!documentId) {
      return ctx.badRequest('Не указан идентификатор статьи');
    }

    const articlesResult = await strapi.entityService.findMany(ARTICLE_UID as any, {
      filters: { documentId },
      fields: ['id', 'documentId', 'title'],
      limit: 1,
    });
    const article = Array.isArray(articlesResult) ? articlesResult[0] : articlesResult;

    if (!article) {
      strapi.log.warn(`💬 comment.findForArticle article not found for documentId=${documentId}`);
      return ctx.notFound('article.notFound');
    }

    const limit =
      typeof ctx.query?.limit !== 'undefined'
        ? Math.min(Number(ctx.query.limit) || 20, 100)
        : 50;
    const start = typeof ctx.query?.start !== 'undefined' ? Number(ctx.query.start) || 0 : 0;

    const articleId = (article as any)?.id;

    const comments = await strapi.entityService.findMany(COMMENT_UID as any, {
      filters: { article: articleId } as any,
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: { avatar: { fields: ['url'] } },
        },
        parent: {
          fields: ['id', 'documentId'],
        },
      },
      sort: [{ createdAt: 'asc' }],
      start,
      limit,
    });

    const total = await strapi.entityService.count(COMMENT_UID as any, {
      filters: { article: articleId } as any,
    });

    const sanitized = await this.sanitizeOutput(comments, ctx);
    return this.transformResponse(sanitized, {
      meta: {
        total,
        start,
        limit,
      },
    });
  },

  async createForArticle(ctx) {
    const { documentId } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Необходима авторизация');
    }

    if (!documentId) {
      return ctx.badRequest('Не указан идентификатор статьи');
    }

    const body = ctx.request.body?.data ?? ctx.request.body ?? {};
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const parent = body.parent ?? body.parentId ?? null;

    if (!text) {
      return ctx.badRequest('Текст комментария обязателен');
    }

    const articleResult = await strapi.entityService.findMany(ARTICLE_UID as any, {
      filters: { documentId },
      fields: ['id', 'documentId', 'title'],
      limit: 1,
    });
    const article = Array.isArray(articleResult) ? articleResult[0] : articleResult;

    if (!article) {
      strapi.log.warn(`💬 comment.createForArticle article not found for documentId=${documentId}`);
      return ctx.notFound('article.notFound');
    }

    const articleId = (article as any)?.id;

    let parentCommentId: number | null = null;
    if (parent) {
      const parentPk = Number(parent);
      if (Number.isNaN(parentPk)) {
        return ctx.badRequest('Некорректный идентификатор родительского комментария');
      }

      const parentComment = await strapi.entityService.findOne(COMMENT_UID as any, parentPk, {
        fields: ['id'],
        populate: {
          article: {
            fields: ['id'],
          },
        },
      });

      const parentCommentArticleId =
        (parentComment as any)?.article?.id ?? (parentComment as any)?.article

      if (!parentComment || parentCommentArticleId !== articleId) {
        return ctx.badRequest('Родительский комментарий не найден или принадлежит другой статье');
      }

      parentCommentId = parentPk;
    }

    const now = new Date();

    const createdComment = await strapi.entityService.create(COMMENT_UID as any, {
      data: {
        text,
        article: articleId,
        author: user.id,
        parent: parentCommentId,
        publishedAt: now.toISOString(),
        updated_at_custom: now.toISOString(),
      },
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: { avatar: { fields: ['url'] } },
        },
        parent: {
          fields: ['id', 'documentId'],
        },
      },
    });

    // пересчитываем количество комментариев
    const commentsCount = await strapi.entityService.count(COMMENT_UID as any, {
      filters: { article: articleId } as any,
    });

    await strapi.entityService.update(ARTICLE_UID as any, articleId, {
      data: { comments_count: commentsCount },
    });

    strapi.log.info(
      `💬 comment.createForArticle user=${user.id} created comment=${createdComment.id} for documentId=${documentId}`,
    );

    const sanitized = await this.sanitizeOutput(createdComment, ctx);
    return this.transformResponse(sanitized);
  },
}));

