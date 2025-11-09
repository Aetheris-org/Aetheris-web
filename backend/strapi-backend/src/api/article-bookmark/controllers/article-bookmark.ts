/**
 * Article Bookmark controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article-bookmark.article-bookmark', ({ strapi }) => ({
  /**
   * Toggle bookmark for an article
   * POST /api/articles/:articleId/bookmark
   */
  async toggle(ctx) {
    const { articleId } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to bookmark articles');
    }

    try {
      const result = await strapi.service('api::article-bookmark.article-bookmark').toggleBookmark(
        parseInt(articleId),
        userId
      );

      return ctx.send({ data: result });
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      if (error.message === 'Article not found') {
        return ctx.notFound('Article not found');
      }
      return ctx.internalServerError('Failed to toggle bookmark');
    }
  },

  /**
   * Check if article is bookmarked
   * GET /api/articles/:articleId/bookmark
   */
  async check(ctx) {
    const { articleId } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.send({ data: { is_bookmarked: false } });
    }

    try {
      const isBookmarked = await strapi.service('api::article-bookmark.article-bookmark').isBookmarked(
        parseInt(articleId),
        userId
      );

      return ctx.send({ data: { is_bookmarked: isBookmarked, article_id: parseInt(articleId) } });
    } catch (error) {
      console.error('❌ Error checking bookmark:', error);
      return ctx.send({ data: { is_bookmarked: false } });
    }
  },

  /**
   * Get user's bookmarked articles
   * GET /api/bookmarks
   */
  async getBookmarkedArticles(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to view bookmarks');
    }

    const { skip = 0, limit = 100 } = ctx.query;

    try {
      console.log(`🔵 [getBookmarkedArticles] Fetching bookmarks for user ${userId}`);
      
      // Используем db.query для более надежной работы с populate
      const bookmarks: any = await strapi.db.query('api::article-bookmark.article-bookmark').findMany({
        where: {
          user: userId
        },
        populate: {
          article: {
            populate: {
              author: {
                select: ['id', 'username'],
                populate: {
                  avatar: { select: ['url', 'name'] }
                }
              },
              preview_image: { select: ['url', 'name', 'alternativeText'] }
            }
          }
        },
        limit: Math.min(parseInt(limit as string) || 100, 1000),
        offset: parseInt(skip as string) || 0
      });

      console.log(`🔵 [getBookmarkedArticles] Found ${bookmarks?.length || 0} bookmarks`);
      
      // Логируем структуру первой закладки для отладки
      if (bookmarks && bookmarks.length > 0) {
        console.log(`🔵 [getBookmarkedArticles] Sample bookmark:`, {
          id: bookmarks[0].id,
          hasArticle: !!bookmarks[0].article,
          articleId: bookmarks[0].article?.id,
          articleTitle: bookmarks[0].article?.title
        });
      }

      // Если bookmarks null или undefined, возвращаем пустой массив
      if (!bookmarks || !Array.isArray(bookmarks)) {
        console.log(`⚠️ [getBookmarkedArticles] bookmarks is not an array, returning empty array`);
        return ctx.send({
          data: [],
          meta: {
            pagination: {
              total: 0
            }
          }
        });
      }

      // Extract articles from bookmarks
      // Фильтруем только опубликованные статьи
      const articles = bookmarks
        .filter((b: any) => {
          const hasArticle = b && b.article;
          const isPublished = hasArticle && b.article.publishedAt !== null;
          if (hasArticle && !isPublished) {
            console.log(`⚠️ [getBookmarkedArticles] Article ${b.article.id} is not published, skipping`);
          }
          return isPublished;
        })
        .map((b: any) => ({
          id: b.article.id,
          attributes: {
            ...b.article,
            is_bookmarked: true
          }
        }));

      console.log(`✅ [getBookmarkedArticles] Returning ${articles.length} articles (filtered from ${bookmarks.length} bookmarks)`);

      return ctx.send({
        data: articles,
        meta: {
          pagination: {
            total: articles.length
          }
        }
      });
    } catch (error) {
      console.error('❌ Error fetching bookmarked articles:', error);
      // Возвращаем пустой массив вместо ошибки, если нет закладок
      return ctx.send({
        data: [],
        meta: {
          pagination: {
            total: 0
          }
        }
      });
    }
  }
}));

