/**
 * Article service
 * Handles reactions, search, and custom business logic
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::article.article', ({ strapi }) => ({
  /**
   * Handle article reaction (like/dislike)
   * Uses database to persist reactions across restarts
   */
  async handleReaction(articleId: number, userId: number, reaction: 'like' | 'dislike') {
    // Get current article
    const article: any = await strapi.entityService.findOne('api::article.article', articleId, {
      populate: ['author', 'preview_image'] as any
    });

    if (!article) {
      throw new Error('Article not found');
    }

    // Check if user already reacted
    const existingReaction = await strapi.db.query('api::article-reaction.article-reaction').findOne({
      where: {
        user: userId,
        article: articleId
      }
    });

    let likesCount = article.likes_count || 0;
    let dislikesCount = article.dislikes_count || 0;

    // Remove old reaction if exists
    if (existingReaction) {
      if (existingReaction.reaction === 'like') {
        likesCount = Math.max(0, likesCount - 1);
      } else {
        dislikesCount = Math.max(0, dislikesCount - 1);
      }

      // If same reaction, remove it (toggle)
      if (existingReaction.reaction === reaction) {
        await strapi.db.query('api::article-reaction.article-reaction').delete({
          where: { id: existingReaction.id }
        });

        // Update article counters and get updated article
        const updatedArticle: any = await strapi.entityService.update('api::article.article', articleId, {
          data: {
            likes_count: likesCount,
            dislikes_count: dislikesCount
          },
          populate: ['author', 'preview_image'] as any
        });

        // Подсчитываем количество комментариев
        const commentsCount = await strapi.db.query('api::comment.comment').count({
          where: { article: { id: articleId } }
        });

        return {
          ...updatedArticle,
          user_reaction: null,
          comments_count: commentsCount || 0
        };
      }

      // Update existing reaction to new type
      await strapi.db.query('api::article-reaction.article-reaction').update({
        where: { id: existingReaction.id },
        data: { reaction }
      });
    } else {
      // Create new reaction
      await strapi.db.query('api::article-reaction.article-reaction').create({
        data: {
          user: userId,
          article: articleId,
          reaction
        }
      });
    }

    // Update counters
    if (reaction === 'like') {
      likesCount += 1;
    } else {
      dislikesCount += 1;
    }

    // Update article counters
    const updatedArticle: any = await strapi.entityService.update('api::article.article', articleId, {
      data: {
        likes_count: likesCount,
        dislikes_count: dislikesCount
      },
      populate: ['author', 'preview_image'] as any
    });

    // Подсчитываем количество комментариев
    const commentsCount = await strapi.db.query('api::comment.comment').count({
      where: { article: { id: articleId } }
    });

    // Check for like milestones and create notifications
    if (reaction === 'like' && !existingReaction) {
      await this.checkLikeMilestones(articleId, likesCount, article.author?.id);
    }

    return {
      ...updatedArticle,
      user_reaction: reaction,
      comments_count: commentsCount || 0
    };
  },

  /**
   * Get user's reaction for an article from database
   */
  async getUserReaction(articleId: number, userId: number): Promise<'like' | 'dislike' | null> {
    const reaction = await strapi.db.query('api::article-reaction.article-reaction').findOne({
      where: {
        user: userId,
        article: articleId
      }
    });
    return reaction?.reaction || null;
  },

  /**
   * Search articles by title, content, tags, or author username
   */
  async searchArticles(query: string, userId: number | undefined, skip: number = 0, limit: number = 100) {
    const knex = strapi.db.connection;

    // Build search query
    let queryBuilder = knex('articles')
      .select('articles.*')
      .leftJoin('up_users', 'articles.author', 'up_users.id')
      .where(function() {
        this.where('articles.title', 'like', `%${query}%`)
          .orWhere('articles.content', 'like', `%${query}%`)
          .orWhere('articles.tags', 'like', `%${query}%`)
          .orWhere('up_users.username', 'like', `%${query}%`);
      });

    // Filter out unpublished drafts unless user is the author
    if (!userId) {
      queryBuilder = queryBuilder.whereNotNull('articles.published_at');
    } else {
      queryBuilder = queryBuilder.where(function() {
        this.whereNotNull('articles.published_at')
          .orWhere('articles.author', userId);
      });
    }

    // Get total count
    const countResult = await queryBuilder.clone().count('* as count').first();
    const total = countResult?.count || 0;

    // Get paginated results
    const results = await queryBuilder
      .offset(skip)
      .limit(limit)
      .orderBy('articles.created_at', 'desc');

    // Transform to Strapi format
    const data = await Promise.all(results.map(async (article) => {
      // Populate author
      const author: any = await strapi.entityService.findOne('plugin::users-permissions.user', article.author, {
        populate: ['avatar'] as any
      });

      // Get user reaction if authenticated
      let userReaction = null;
      if (userId) {
        userReaction = await this.getUserReaction(article.id, userId);
      }

      // Подсчитываем количество комментариев
      const commentsCount = await strapi.db.query('api::comment.comment').count({
        where: { article: { id: article.id } }
      });

      return {
        id: article.id,
        attributes: {
          ...article,
          author: { data: author },
          user_reaction: userReaction,
          comments_count: commentsCount || 0,
          tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags) : []
        }
      };
    }));

    return {
      data,
      meta: {
        pagination: {
          start: skip,
          limit,
          total: typeof total === 'number' ? total : parseInt(total)
        }
      }
    };
  },

  /**
   * Check if article reached like milestones and create notifications
   */
  async checkLikeMilestones(articleId: number, currentLikes: number, authorId: number) {
    const milestones = [10, 50, 100, 500, 1000];
    const thresholds = milestones.filter(m => currentLikes >= m && currentLikes - 1 < m);

    for (const threshold of thresholds) {
      // Check if notification already sent
      const existingNotification = await strapi.db.query('api::notification.notification').findOne({
        where: {
          user: authorId,
          related_article: articleId,
          type: 'article_milestone',
          message: { $contains: `${threshold}` }
        }
      });

      if (!existingNotification) {
        await strapi.entityService.create('api::notification.notification', {
          data: {
            user: authorId,
            type: 'article_milestone',
            title: `${threshold} Likes!`,
            message: `Your article reached ${threshold} likes! 🎉`,
            related_article: articleId,
            is_read: false
          }
        });
      }
    }
  }
}));

