/**
 * Article Bookmark service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::article-bookmark.article-bookmark', ({ strapi }) => ({
  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  async toggleBookmark(articleId: number, userId: number) {
    // Check if article exists
    const article = await strapi.entityService.findOne('api::article.article', articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    // Check if bookmark already exists
    const existingBookmark = await strapi.db.query('api::article-bookmark.article-bookmark').findOne({
      where: {
        user: userId,
        article: articleId
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await strapi.entityService.delete('api::article-bookmark.article-bookmark', existingBookmark.id);
      return {
        is_bookmarked: false,
        was_added: false,
        article_id: articleId
      };
    } else {
      // Add bookmark
      await strapi.entityService.create('api::article-bookmark.article-bookmark', {
        data: {
          user: userId,
          article: articleId
        }
      });
      return {
        is_bookmarked: true,
        was_added: true,
        article_id: articleId
      };
    }
  },

  /**
   * Check if article is bookmarked by user
   */
  async isBookmarked(articleId: number, userId: number): Promise<boolean> {
    const bookmark = await strapi.db.query('api::article-bookmark.article-bookmark').findOne({
      where: {
        user: userId,
        article: articleId
      }
    });

    return !!bookmark;
  }
}));

