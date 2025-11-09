/**
 * Article controller
 * Extends default CRUD with custom reactions and search
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  /**
   * SECURITY: Override create to automatically set author from authenticated user
   * This prevents users from creating articles on behalf of others
   * POST /api/articles
   */
  async create(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to create articles');
    }

    try {
      // Extract article data from request
      const { data } = ctx.request.body;
      
      console.log('🔵 Creating article with data:', JSON.stringify(data, null, 2));
      console.log('🔵 User ID:', userId);

      // SECURITY: Force author to be current user (ignore any author field from frontend)
      // Handle both 'status' (frontend legacy) and 'publishedAt' (Strapi v5 standard)
      let publishedAt = data.publishedAt;
      if (!publishedAt && data.status === 'published') {
        // Convert legacy status='published' to publishedAt date
        publishedAt = new Date().toISOString();
        console.log('🔵 Converting status=published to publishedAt:', publishedAt);
      }
      
      const articleData = {
        ...data,
        author: userId, // Strapi will create relation automatically
        publishedAt: publishedAt || null, // null = draft, date = published
      };
      
      console.log('🔵 Final articleData:', JSON.stringify(articleData, null, 2));

      // Create article using Entity Service
      const entity = await strapi.entityService.create('api::article.article', {
        data: articleData,
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] }
            }
          },
          preview_image: { fields: ['url'] }
        }
      });
      
      console.log('🔵 Created entity:', JSON.stringify(entity, null, 2));

      // ⚠️ НЕ используем sanitizeOutput, так как он удаляет relations (author)
      // Мы уже контролируем, какие поля возвращаем через populate
      return ctx.send({ data: entity });
    } catch (error) {
      console.error('❌ Error creating article:', error);
      return ctx.internalServerError('Failed to create article');
    }
  },

  /**
   * SECURITY: Override update to ensure user can only update their own articles
   * PUT /api/articles/:id
   */
  async update(ctx) {
    const userId = ctx.state.user?.id;
    const { id } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to update articles');
    }

    try {
      // Check if article exists and user is the author
      const existingArticle = await strapi.entityService.findOne('api::article.article', id, {
        populate: ['author']
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // SECURITY: Check ownership
      if ((existingArticle as any).author?.id !== userId) {
        return ctx.forbidden('You can only update your own articles');
      }

      // Extract article data from request
      const { data } = ctx.request.body;

      // Handle both 'status' (frontend legacy) and 'publishedAt' (Strapi v5 standard)
      let publishedAt = data.publishedAt;
      if (data.status === 'published' && !publishedAt) {
        // Convert legacy status='published' to publishedAt date
        publishedAt = new Date().toISOString();
      } else if (data.status === 'draft') {
        // Convert status='draft' to publishedAt=null
        publishedAt = null;
      }

      // SECURITY: Force author to remain unchanged
      const articleData = {
        ...data,
        author: userId, // Keep original author
        publishedAt: publishedAt !== undefined ? publishedAt : data.publishedAt,
      };

      // Update article
      const entity = await strapi.entityService.update('api::article.article', id, {
        data: articleData,
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] }
            }
          },
          preview_image: { fields: ['url'] }
        }
      });

      // ⚠️ НЕ используем sanitizeOutput, так как он удаляет relations (author)
      return ctx.send({ data: entity });
    } catch (error) {
      console.error('❌ Error updating article:', error);
      return ctx.internalServerError('Failed to update article');
    }
  },

  /**
   * SECURITY: Override delete to ensure user can only delete their own articles
   * DELETE /api/articles/:id
   */
  async delete(ctx) {
    const userId = ctx.state.user?.id;
    const { id } = ctx.params;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to delete articles');
    }

    try {
      // Check if article exists and user is the author
      const existingArticle = await strapi.entityService.findOne('api::article.article', id, {
        populate: ['author']
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // SECURITY: Check ownership
      if ((existingArticle as any).author?.id !== userId) {
        return ctx.forbidden('You can only delete your own articles');
      }

      // Delete article
      const entity = await strapi.entityService.delete('api::article.article', id);

      // ⚠️ НЕ используем sanitizeOutput, так как он удаляет relations (author)
      return ctx.send({ data: entity });
    } catch (error) {
      console.error('❌ Error deleting article:', error);
      return ctx.internalServerError('Failed to delete article');
    }
  },

  /**
   * React to an article (like/dislike)
   * POST /api/articles/:id/react
   */
  async react(ctx) {
    const { id } = ctx.params;
    const { reaction } = ctx.request.body;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('You must be logged in to react to articles');
    }

    if (!['like', 'dislike'].includes(reaction)) {
      return ctx.badRequest('Reaction must be "like" or "dislike"');
    }

    try {
      const article = await strapi.service('api::article.article').handleReaction(
        parseInt(id),
        userId,
        reaction
      );

      return ctx.send({ data: article });
    } catch (error) {
      console.error('❌ Error in article react:', error);
      return ctx.internalServerError('Failed to process reaction');
    }
  },

  /**
   * Search articles by title, content, tags, or author
   * GET /api/articles/search?q=query
   */
  async search(ctx) {
    const { q, skip = 0, limit = 100 } = ctx.query;
    const userId = ctx.state.user?.id;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return ctx.send({ data: [], meta: { pagination: { total: 0 } } });
    }

    try {
      const results = await strapi.service('api::article.article').searchArticles(
        q.trim(),
        userId,
        parseInt(skip as string) || 0,
        Math.min(parseInt(limit as string) || 100, 100)
      );

      return ctx.send(results);
    } catch (error) {
      console.error('❌ Error in article search:', error);
      return ctx.internalServerError('Failed to search articles');
    }
  },

  /**
   * Get user's reaction for an article
   * GET /api/articles/:id/user-reaction
   */
  async getUserReaction(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.send({ data: null });
    }

    try {
      const reaction = await strapi.service('api::article.article').getUserReaction(
        parseInt(id),
        userId
      );

      return ctx.send({ data: reaction });
    } catch (error) {
      console.error('❌ Error getting user reaction:', error);
      return ctx.send({ data: null });
    }
  },

  /**
   * Override default find to include reactions and populate properly
   */
  async find(ctx) {
    const userId = ctx.state.user?.id;
    console.log('🔵 Article.find - userId:', userId, 'authenticated:', !!ctx.state.user);

    // SECURITY: Используем entityService напрямую, чтобы обойти sanitization
    // который убирает relations из-за permissions
    
    // Parse filters from query
    const queryFilters = (ctx.query as any).filters || {};
    const filters: any = {
      ...queryFilters,
      // IMPORTANT: Добавляем фильтр для только опубликованных статей
      // publicationState: 'live' в Strapi v5 не работает корректно, используем фильтр
      publishedAt: { $notNull: true }
    };
    
    // Обрабатываем фильтр author.id (для статистики пользователя)
    // Strapi v5 может парсить параметры как вложенные объекты или плоские строки
    let authorId: number | undefined;
    try {
      // Пробуем разные форматы: filters.author.id.$eq или filters[author][id][$eq]
      const authorFilter = queryFilters?.author?.id || (ctx.query as any)?.filters?.author?.id;
      const authorFilterValue = authorFilter?.$eq || authorFilter;
      
      if (authorFilterValue) {
        if (authorFilterValue === '$USER_ID') {
          // Специальный токен для текущего пользователя
          authorId = userId || undefined;
          console.log('🔵 Using $USER_ID token, resolved to userId:', authorId);
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
          console.log('🔵 Using direct $USER_ID token from query string');
        } else {
          const parsed = parseInt(String(directAuthorId));
          if (!isNaN(parsed)) {
            authorId = parsed;
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ Error parsing author filter:', err);
    }
    
    // Parse pagination
    const pagination = (ctx.query as any).pagination || {};
    const start = parseInt(pagination.start) || 0;
    const limit = parseInt(pagination.limit) || 100;
    const withCount = pagination.withCount === true || pagination.withCount === 'true';

    try {
      console.log('🔵 Fetching articles with filters:', JSON.stringify(filters, null, 2));
      console.log('🔵 Author filter:', authorId);
      
      // ДИАГНОСТИКА: Проверяем что в БД
      const totalCount = await strapi.db.query('api::article.article').count();
      const publishedCount = await strapi.db.query('api::article.article').count({
        where: { publishedAt: { $notNull: true } }
      });
      console.log(`🔵 DB Stats: Total=${totalCount}, Published=${publishedCount}`);
      
      // Строим where условие для db.query
      const where: any = { publishedAt: { $notNull: true } };
      if (authorId !== undefined && !isNaN(authorId)) {
        where.author = authorId;
      }
      
      // Fetch articles using db.query (more reliable than entityService for filtering)
      const articles = await strapi.db.query('api::article.article').findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        limit,
        offset: start,
        populate: {
          author: {
            select: ['id', 'username'],
            populate: {
              avatar: { select: ['url', 'name'] }
            }
          },
          preview_image: { select: ['url', 'name', 'alternativeText'] }
        }
      });

      console.log(`🔵 Article.find returned ${articles.length} published articles`);
      if (articles.length > 0) {
        const firstArticle = articles[0] as any;
        console.log('🔵 Sample article:', {
          id: firstArticle.id,
          title: firstArticle.title,
          publishedAt: firstArticle.publishedAt,
          hasAuthor: !!firstArticle.author
        });
      }

      // Get total count for pagination (используем db.query для точного подсчета)
      let total = articles.length; // Default to returned count
      if (withCount) {
        total = await strapi.db.query('api::article.article').count({ where });
        console.log(`🔵 Total count with filters: ${total}`);
      }

      // Add user reactions, comments count, and bookmarks if authenticated
      let data = articles;
      if (userId && Array.isArray(articles)) {
        console.log(`🔵 Loading reactions, comments count, and bookmarks for ${articles.length} articles for user ${userId}`);
        
        // Получаем все закладки пользователя одним запросом (оптимизация)
        const articleIds = articles.map(a => a.id);
        const bookmarks = await strapi.db.query('api::article-bookmark.article-bookmark').findMany({
          where: {
            user: userId,
            article: { $in: articleIds }
          },
          populate: {
            article: { select: ['id'] }
          }
        });
        const bookmarkedArticleIds = new Set(bookmarks.map((b: any) => b.article?.id || b.article));
        console.log(`🔵 Found ${bookmarkedArticleIds.size} bookmarked articles out of ${articles.length}`);
        
        data = await Promise.all(
          articles.map(async (article) => {
            const reaction = await strapi.service('api::article.article').getUserReaction(
              article.id,
              userId
            );
            
            // Подсчитываем количество комментариев для статьи
            const commentsCount = await strapi.db.query('api::comment.comment').count({
              where: { article: { id: article.id } }
            });
            
            return {
              ...article,
              user_reaction: reaction,
              comments_count: commentsCount || 0,
              is_bookmarked: bookmarkedArticleIds.has(article.id)
            };
          })
        );
        const reactionsCount = data.filter(a => a.user_reaction).length;
        console.log(`🔵 Loaded reactions: ${reactionsCount} articles have user reactions`);
      } else {
        // Подсчитываем количество комментариев даже для неавторизованных пользователей
        data = await Promise.all(
          articles.map(async (article) => {
            const commentsCount = await strapi.db.query('api::comment.comment').count({
              where: { article: { id: article.id } }
            });
            
            return {
              ...article,
              comments_count: commentsCount || 0
            };
          })
        );
        console.log('🔵 Skipping reactions loading:', userId ? 'articles not array' : 'user not authenticated');
      }

      return {
        data,
        meta: {
          pagination: {
            start,
            limit,
            total
          }
        }
      };
    } catch (error) {
      console.error('❌ Error in Article.find:', error);
      return ctx.internalServerError('Failed to fetch articles');
    }
  },

  /**
   * Override default findOne to include reactions
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const userId = ctx.state.user?.id;
    
    console.log(`🔵 findOne called for article ${id}, user: ${userId}`);

    // Add default populate
    if (!ctx.query.populate) {
      ctx.query.populate = {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: {
              fields: ['url', 'name']
            }
          }
        },
        preview_image: {
          fields: ['url', 'name', 'alternativeText']
        },
        comments: {
          populate: {
            author: {
              fields: ['id', 'username'],
              populate: {
                avatar: {
                  fields: ['url', 'name']
                }
              }
            },
            parent: {
              fields: ['id']
            }
          }
        }
      };
    }

    // Use db.query with explicit id filter to avoid any resolver quirks
    let data: any;
    try {
      const numericId = parseInt(id);
      data = await strapi.db.query('api::article.article').findOne({
        where: { id: numericId },
        populate: ctx.query.populate as any
      });
      console.log(`🔵 db.query.findOne result:`, data ? `id=${data.id}` : 'no data');
    } catch (error) {
      console.error('❌ Error in entityService.findOne:', error);
      return ctx.notFound('Article not found');
    }

    // SECURITY: Check if article exists
    if (!data) {
      console.log(`❌ Article ${id} not found - entityService returned null`);
      return ctx.notFound('Article not found');
    }
    
    const meta = undefined;

    // SECURITY: Check if user can see draft (only author can see drafts)
    if (data.publishedAt === null) {
      const authorId = data.author?.id;
      if (!userId || userId !== authorId) {
        return ctx.notFound('Article not found');
      }
    }

    // Подсчитываем количество комментариев
    const commentsCount = await strapi.db.query('api::comment.comment').count({
      where: { article: { id: parseInt(id) } }
    });
    
    // Add user reaction if authenticated
    if (userId && data) {
      const reaction = await strapi.service('api::article.article').getUserReaction(
        parseInt(id),
        userId
      );

      // Strapi v5 uses flat format, not nested attributes
      return {
        data: {
          ...data,
          user_reaction: reaction,
          comments_count: commentsCount || 0
        },
        meta
      };
    }

    return { 
      data: {
        ...data,
        comments_count: commentsCount || 0
      }, 
      meta 
    };
  }
}));

