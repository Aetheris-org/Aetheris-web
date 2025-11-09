/**
 * Comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  /**
   * React to a comment (like/dislike)
   * POST /api/comments/:id/react
   */
  async react(ctx) {
    const { id } = ctx.params;
    const { reaction } = ctx.request.body;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to react to comments');
    }

    if (!['like', 'dislike'].includes(reaction)) {
      return ctx.badRequest('Reaction must be "like" or "dislike"');
    }

    try {
      const comment = await strapi.service('api::comment.comment').handleReaction(
        parseInt(id),
        userId,
        reaction
      );

      return ctx.send({ data: comment });
    } catch (error) {
      console.error('❌ Error in comment react:', error);
      return ctx.internalServerError('Failed to process reaction');
    }
  },

  /**
   * Create a comment with automatic notification
   */
  async create(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to comment');
    }

    try {
      const body = ctx.request.body?.data || {};
      const text = body.text;
      const articleId = body.article;
      const parentId = body.parent ?? null;

      if (!text || typeof text !== 'string' || text.trim().length < 1) {
        return ctx.badRequest('Comment text is required');
      }
      if (!articleId || isNaN(Number(articleId))) {
        return ctx.badRequest('Valid article id is required');
      }

      // Ensure article exists
      const article = await strapi.entityService.findOne('api::article.article', Number(articleId));
      if (!article) {
        return ctx.badRequest('Article not found');
      }

      // Optionally validate parent comment exists when provided
      if (parentId != null) {
        const parent = await strapi.entityService.findOne('api::comment.comment', Number(parentId));
        if (!parent) {
          return ctx.badRequest('Parent comment not found');
        }
      }

      // Create comment explicitly to avoid sanitize issues
      const created = await strapi.entityService.create('api::comment.comment', {
        data: {
          text: String(text),
          article: Number(articleId),
          parent: parentId != null ? Number(parentId) : null,
          author: userId,
        },
        populate: {
          author: { fields: ['id', 'username'], populate: { avatar: { fields: ['url'] } } } as any,
          parent: { fields: ['id'] } as any,
          article: { fields: ['id'] } as any,
        }
      });

    // Create notification for article author if comment is on article
    if ((created as any)?.article?.id) {
      const articleId = (created as any).article.id;
      const article: any = await strapi.entityService.findOne('api::article.article', articleId, {
        populate: ['author'] as any
      });

      if (article?.author?.id && article.author.id !== userId) {
        await strapi.entityService.create('api::notification.notification', {
          data: {
            user: article.author.id,
            type: 'comment_on_article',
            title: 'New Comment',
            message: `Someone commented on your article`,
            related_article: articleId,
            related_comment: (created as any).id,
            is_read: false
          }
        });
      }
    }

    // Create notification for parent comment author if reply
    if ((created as any)?.parent?.id) {
      const parentId = (created as any).parent.id;
      const parentComment: any = await strapi.entityService.findOne('api::comment.comment', parentId, {
        populate: ['author'] as any
      });

      if (parentComment?.author?.id && parentComment.author.id !== userId) {
        await strapi.entityService.create('api::notification.notification', {
          data: {
            user: parentComment.author.id,
            type: 'comment_reply',
            title: 'New Reply',
            message: `Someone replied to your comment`,
            related_comment: (created as any).id,
            is_read: false
          }
        });
      }
    }
      return ctx.send({ data: created });
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      return ctx.badRequest('Failed to create comment');
    }
  },

  /**
   * Override find to add user reactions and increment comments_count
   */
  async find(ctx) {
    const userId = ctx.state.user?.id;

    // Extract simple filters we rely on from query (supports frontend pattern)
    const rawFilters = (ctx.query as any)?.filters || {};
    let articleId: number | undefined;
    let authorId: number | undefined;
    try {
      const v = rawFilters?.article?.id?.['$eq'];
      if (v !== undefined) articleId = parseInt(String(v));
      
      // Обрабатываем фильтр author.id (для статистики пользователя)
      // Strapi v5 может парсить параметры как вложенные объекты или плоские строки
      const authorFilter = rawFilters?.author?.id;
      const authorFilterValue = authorFilter?.$eq || authorFilter;
      
      if (authorFilterValue) {
        if (authorFilterValue === '$USER_ID') {
          // Специальный токен для текущего пользователя
          authorId = userId || undefined;
          console.log('🔵 Comments: Using $USER_ID token, resolved to userId:', authorId);
        } else if (typeof authorFilterValue === 'number') {
          authorId = authorFilterValue;
        } else if (typeof authorFilterValue === 'string') {
          const parsed = parseInt(authorFilterValue);
          if (!isNaN(parsed)) {
            authorId = parsed;
          }
        }
      }
      
      // Также проверяем прямой формат из query string (для совместимости)
      const directAuthorId = (ctx.query as any)['filters[author][id][$eq]'];
      if (directAuthorId && authorId === undefined) {
        if (directAuthorId === '$USER_ID') {
          authorId = userId || undefined;
          console.log('🔵 Comments: Using direct $USER_ID token from query string');
        } else {
          const parsed = parseInt(String(directAuthorId));
          if (!isNaN(parsed)) {
            authorId = parsed;
          }
        }
      }
    } catch {}

    // Pagination (optional)
    const pagination = (ctx.query as any)?.pagination || {};
    const start = parseInt(pagination.start) || 0;
    const limit = parseInt(pagination.limit) || 100;
    const withCount = pagination.withCount === true || pagination.withCount === 'true';

    // Fetch directly via db.query to avoid sanitize removing relations
    const where: any = {};
    if (!Number.isNaN(articleId!) && articleId !== undefined) where.article = articleId;
    if (authorId !== undefined && !isNaN(authorId)) where.author = authorId;

    const rows = await strapi.db.query('api::comment.comment').findMany({
      where,
      orderBy: { createdAt: 'asc' },
      offset: start,
      limit,
      populate: {
        author: { select: ['id', 'username'], populate: { avatar: { select: ['url', 'name'] } } },
        parent: { select: ['id'] },
        article: { select: ['id'] }
      }
    });

    console.log(`🔵 Comments.db.findMany returned ${rows.length} items (articleId=${articleId ?? 'any'}, authorId=${authorId ?? 'any'})`);

    const data = await Promise.all(rows.map(async (src: any) => {
      // Attach user reaction when authenticated
      let userReaction = null;
      if (userId) {
        userReaction = await strapi.service('api::comment.comment').getUserReaction(src.id, userId);
      }

      const author = src.author
        ? {
            id: src.author.id,
            username: src.author.username,
            avatar: src.author.avatar?.url || null,
          }
        : null;

      return {
        id: src.id,
        text: src.text,
        article: src.article?.id || null,
        parent: src.parent ? { id: src.parent.id } : null,
        author,
        author_id: author?.id ?? null,
        author_name: author?.username ?? null,
        author_avatar: author?.avatar ?? null,
        createdAt: src.createdAt,
        updatedAt: src.updated_at_custom || src.updatedAt || src.updated_at,
        likes_count: src.likes_count || 0,
        dislikes_count: src.dislikes_count || 0,
        user_reaction: userReaction
      };
    }));

    try { console.log('🔵 Comments normalized sample:', data[0]); } catch {}

    // Get total count if requested
    let total = data.length; // Default to returned count
    if (withCount) {
      total = await strapi.db.query('api::comment.comment').count({ where });
      console.log(`🔵 Total comments count with filters: ${total}`);
    }

    return { data, meta: { pagination: { start, limit, total } } };
  }
}));

