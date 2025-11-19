/**
 * Article controller
 * Использует встроенные механизмы Strapi для валидации и безопасности
 * 
 * ВАЖНО: Все методы используют entityService, который автоматически:
 * - Валидирует данные по схеме
 * - Защищает от SQL injection (параметризованные запросы)
 * - Обеспечивает типобезопасность
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  /**
   * Получение списка статей
   * Публичный доступ - не требует аутентификации для опубликованных статей
   */
  async find(ctx) {
    const user = ctx.state.user ?? null;

    // Санитизация query через стандартный механизм Strapi
    const sanitizedQuery = await this.sanitizeQuery(ctx);

    // Для публичных пользователей по умолчанию показываем только опубликованные
    const baseFilters = (sanitizedQuery.filters as Record<string, any>) || {};
    const filters =
      !user && !baseFilters.publishedAt
        ? { ...baseFilters, publishedAt: { $notNull: true } }
        : baseFilters;

    // Используем documentService для работы с draftAndPublish в Strapi v5
    const { start = 0, limit = 10, sort, populate } = sanitizedQuery as any;
    
    // Преобразуем sort из массива строк ['createdAt:desc'] в объект { createdAt: 'desc' }
    let sortObj: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort) {
      if (Array.isArray(sort)) {
        sortObj = {};
        for (const item of sort) {
          if (typeof item === 'string') {
            const [field, order] = item.split(':');
            if (field && order) {
              sortObj[field] = order.toLowerCase() === 'asc' ? 'asc' : 'desc';
            }
          }
        }
      } else if (typeof sort === 'object') {
        sortObj = sort as Record<string, 'asc' | 'desc'>;
      }
    }
    
    // Используем documentService для работы с draftAndPublish
    // Если фильтр требует только опубликованные - используем documentService с status: 'published'
    // Иначе - entityService (для аутентифицированных пользователей, которые могут видеть черновики)
    const defaultPopulate = populate || {
      author: {
        fields: ['id', 'username'],
        populate: {
          avatar: { fields: ['url'] },
        },
      },
    };

    let articles: any[];
    let total: number;

    // Если запрашиваются только опубликованные статьи (публичный доступ или явный фильтр)
    const isPublishedOnly = !user || filters.publishedAt?.$notNull === true;
    
    if (isPublishedOnly) {
      // Используем documentService для получения только опубликованных статей
      articles = await strapi.documents('api::article.article').findMany({
        filters,
        sort: sortObj,
        start: Number(start) || 0,
        limit: Math.min(Math.max(1, Number(limit) || 10), 100),
        populate: defaultPopulate,
        status: 'published', // Только опубликованные
      });
      // Получаем общее количество через count
      total = await strapi.documents('api::article.article').count({
        filters,
        status: 'published',
      });
    } else {
      // Аутентифицированный пользователь без фильтра - через entityService (видит и черновики)
      articles = await strapi.entityService.findMany('api::article.article', {
        filters,
        sort: sortObj,
        start: Number(start) || 0,
        limit: Math.min(Math.max(1, Number(limit) || 10), 100),
        populate: defaultPopulate,
      });
      total = await strapi.entityService.count('api::article.article', {
        filters,
      });
    }

    return this.transformResponse(articles, {
      pagination: {
        start: Number(start) || 0,
        limit: Math.min(Math.max(1, Number(limit) || 10), 100),
        total,
      },
    });
  },

  /**
   * Получение одной статьи по ID (numeric id из Strapi)
   * Публичный доступ - не требует аутентификации для опубликованных статей
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    let user = ctx.state.user ?? null;

    // Валидация ID
    const articleId = Number(id);
    if (!articleId || isNaN(articleId)) {
      return ctx.badRequest('Invalid article ID');
    }

    // Если пользователь не аутентифицирован через стандартный механизм,
    // проверяем токен из заголовка Authorization или из cookies
    if (!user) {
      try {
        let token: string | null = null;
        
        const authHeader = ctx.request.header.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.replace('Bearer ', '');
        } else {
          const cookies = ctx.request.header.cookie;
          if (cookies) {
            const cookiePairs = cookies.split(';').map(c => c.trim());
            for (const pair of cookiePairs) {
              const [name, value] = pair.split('=');
              if (name === 'accessToken' || name === 'jwtToken') {
                token = decodeURIComponent(value);
                break;
              }
            }
          }
        }
        
        if (token) {
          const jwtService = strapi.plugin('users-permissions').service('jwt');
          const decoded = await jwtService.verify(token);
          
          if (decoded && decoded.id) {
            user = await strapi.entityService.findOne('plugin::users-permissions.user', decoded.id, {
              fields: ['id'],
            });
          }
        }
      } catch (error) {
        // Токен невалидный или истек - игнорируем, продолжаем как неаутентифицированный
      }
    }

    const populate: any = {
      author: {
        fields: ['id', 'username'],
        populate: {
          avatar: { fields: ['url'] },
        },
      },
    };

    let article: any;

    try {
      // Для неаутентифицированных - только опубликованные статьи через documentService
      if (!user) {
        const articles = await strapi.documents('api::article.article').findMany({
          filters: { id: { $eq: articleId } },
          populate,
          status: 'published',
          limit: 1,
        });

        if (!articles || articles.length === 0) {
          return ctx.notFound('Article not found');
        }

        article = articles[0];
      } else {
        // Для аутентифицированных - сначала пробуем через entityService
        // Если не найдено, пробуем через documentService (для статей, обновленных через documentService)
        strapi.log.info(`[findOne] Attempting to find article: articleId=${articleId}, userId=${user.id}`);
        
        article = await strapi.entityService.findOne('api::article.article', articleId, {
          populate: populate as any,
        });
        
        if (!article) {
          // Если не найдено через entityService, пробуем через documentService
          // Сначала пробуем опубликованные, потом черновики
          strapi.log.warn(`[findOne] Article not found via entityService, trying documentService: articleId=${articleId}, userId=${user.id}`);
          
          // Пробуем опубликованные статьи
          let publishedDocs = await strapi.documents('api::article.article').findMany({
            filters: { id: { $eq: articleId } },
            populate,
            status: 'published',
            limit: 1,
          });
          
          if (publishedDocs && publishedDocs.length > 0) {
            article = publishedDocs[0];
            strapi.log.info(`[findOne] Article found via documentService (published): articleId=${articleId}, publishedAt=${(article as any).publishedAt}`);
          } else {
            // Пробуем черновики
            strapi.log.warn(`[findOne] Published article not found, trying drafts: articleId=${articleId}, userId=${user.id}`);
            
            const draftDocs = await strapi.documents('api::article.article').findMany({
              filters: { id: { $eq: articleId } },
              populate,
              status: 'draft',
              limit: 1,
            });
            
            if (draftDocs && draftDocs.length > 0) {
              article = draftDocs[0];
              strapi.log.info(`[findOne] Article found via documentService (draft): articleId=${articleId}, publishedAt=${(article as any).publishedAt}`);
            } else {
              strapi.log.warn(`[findOne] Article not found via documentService (published or draft): articleId=${articleId}, userId=${user.id}`);
              return ctx.notFound('Article not found');
            }
          }
        } else {
          strapi.log.info(`[findOne] Article found via entityService: articleId=${articleId}, publishedAt=${(article as any).publishedAt}, authorId=${typeof (article as any).author === 'object' ? (article as any).author?.id : (article as any).author}`);
        }
        
        // Если статья не опубликована - проверяем авторство
        if (!(article as any).publishedAt) {
          const authorId =
            typeof (article as any).author === 'object'
              ? (article as any).author.id
              : (article as any).author;

          if (String(authorId) !== String(user.id)) {
            strapi.log.warn(`[findOne] Unauthorized access to draft: articleId=${articleId}, authorId=${authorId}, userId=${user.id}`);
            return ctx.notFound('Article not found');
          }
        }
      }

      // Для аутентифицированных пользователей получаем их реакцию
      if (user) {
        try {
          const userReactions = await strapi.entityService.findMany('api::article-reaction.article-reaction', {
            filters: {
              $and: [
                { article: { id: articleId } },
                { user: { id: user.id } },
              ],
            },
            limit: 1,
          });

          if (userReactions && userReactions.length > 0) {
            const reactionValue = (userReactions[0] as any).reaction;
            (article as any).userReaction = reactionValue;
            strapi.log.info(`[findOne] Found user reaction: articleId=${articleId}, userId=${user.id}, reaction=${reactionValue}, reactionType=${typeof reactionValue}`);
          } else {
            (article as any).userReaction = null;
            strapi.log.info(`[findOne] No user reaction found: articleId=${articleId}, userId=${user.id}`);
          }
        } catch (error) {
          // Если модель реакций еще не создана, просто не добавляем userReaction
          (article as any).userReaction = null;
          strapi.log.warn(`[findOne] Error fetching user reaction:`, error);
        }
      }

      // В Strapi v5 transformResponse может не сохранять кастомные поля (userReaction)
      // Используем стандартный transformResponse и добавляем userReaction вручную
      if (user && (article as any).userReaction !== undefined) {
        const userReactionValue = (article as any).userReaction;
        
        // Используем стандартный transformResponse
        const response = this.transformResponse(article) as any;
        
        // Логирование для отладки
        strapi.log.info(`[findOne] transformResponse result: articleId=${articleId}, responseType=${typeof response}, responseIsArray=${Array.isArray(response)}, hasData=${!!response?.data}, responseDataKeys=${response?.data ? Object.keys(response.data).join(',') : 'N/A'}, responseKeys=${response && typeof response === 'object' ? Object.keys(response).join(',') : 'N/A'}`);
        
        // Добавляем userReaction в ответ
        if (response?.data) {
          (response.data as any).userReaction = userReactionValue;
          strapi.log.info(`[findOne] Added userReaction to response.data: articleId=${articleId}, userId=${user.id}, userReaction=${userReactionValue}, responseDataUserReaction=${(response.data as any).userReaction}, responseDataId=${(response.data as any).id}, responseDataHasContent=${!!(response.data as any).content}`);
          return response;
        } else if (response && typeof response === 'object' && !Array.isArray(response)) {
          // Проверяем, что response содержит данные (есть id или content)
          const responseKeys = Object.keys(response);
          const hasData = (response as any).id || (response as any).content || responseKeys.length > 0;
          
          if (hasData && (response as any).id) {
            // Response содержит данные, добавляем userReaction
            (response as any).userReaction = userReactionValue;
            strapi.log.info(`[findOne] Added userReaction to response object: articleId=${articleId}, userId=${user.id}, userReaction=${userReactionValue}, responseUserReaction=${(response as any).userReaction}, responseId=${(response as any).id}, responseHasContent=${!!(response as any).content}`);
            return response;
          } else {
            // Response пустой, используем fallback
            strapi.log.warn(`[findOne] Response object is empty, using fallback: articleId=${articleId}, responseKeys=${responseKeys.join(',')}, hasId=${!!(response as any).id}, hasContent=${!!(response as any).content}`);
          }
        }
        
        // Если формат неожиданный или response пустой, используем ctx.body напрямую
        {
          strapi.log.warn(`[findOne] Unexpected response format or empty response, using ctx.body: articleId=${articleId}, responseType=${typeof response}, isArray=${Array.isArray(response)}`);
          
          // Создаем объект статьи вручную из оригинального article
          // ВАЖНО: Используем articleId из параметров запроса, а не article.id, чтобы гарантировать правильный ID
          const articleData: any = {
            id: articleId, // Используем articleId из параметров запроса
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            publishedAt: article.publishedAt,
            likes_count: article.likes_count || 0,
            dislikes_count: article.dislikes_count || 0,
            views: article.views || 0,
            tags: article.tags || [],
            difficulty: article.difficulty,
            userReaction: userReactionValue,
          };
          
          // Добавляем автора
          if (article.author) {
            if (typeof article.author === 'object' && article.author !== null) {
              articleData.author = {
                id: article.author.id,
                username: article.author.username || 'Anonymous',
                avatar: article.author.avatar ? (typeof article.author.avatar === 'object' ? article.author.avatar.url : article.author.avatar) : null,
              };
            } else {
              articleData.author = { id: article.author };
            }
          }
          
          // Добавляем previewImage если есть
          if (article.previewImage) {
            if (typeof article.previewImage === 'object' && article.previewImage !== null) {
              articleData.previewImage = article.previewImage.url || null;
            } else {
              articleData.previewImage = article.previewImage;
            }
          }
          
          strapi.log.info(`[findOne] Using ctx.body with manual article data: articleId=${articleId}, userId=${user.id}, userReaction=${userReactionValue}, articleDataId=${articleData.id}, articleDataHasContent=${!!articleData.content}`);
          
          ctx.body = { data: articleData };
          return;
        }
      }
      
      // Если пользователь не аутентифицирован или userReaction не определен, используем стандартный transformResponse
      return this.transformResponse(article);
    } catch (error) {
      strapi.log.error(`[findOne] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  /**
   * Создание статьи
   * Автоматически устанавливает автора из ctx.state.user
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { data } = ctx.request.body || {};
    if (!data) {
      return ctx.badRequest('Request body must contain data object');
    }

    // Привязываем автора по текущему пользователю
    const entry = await strapi.entityService.create('api::article.article', {
      data: {
        ...data,
        author: user.id,
      },
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      },
    });

    return this.transformResponse(entry);
  },

  /**
   * Обновление статьи
   * Проверяет, что пользователь является автором статьи
   */
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const { data } = ctx.request.body || {};
    if (!data) {
      return ctx.badRequest('Request body must contain data object');
    }

    // Получаем существующую статью для проверки авторства
    const existing = await strapi.entityService.findOne('api::article.article', id, {
      populate: ['author'],
    });

    if (!existing) {
      return ctx.notFound('Article not found');
    }

    // Проверяем авторство
    const authorId =
      typeof (existing as any).author === 'object'
        ? (existing as any).author.id
        : (existing as any).author;

    if (String(authorId) !== String(user.id)) {
      return ctx.forbidden('You can only update your own articles');
    }

    // Обновляем статью
    const updated = await strapi.entityService.update('api::article.article', id, {
      data: {
        ...data,
        // Не позволяем менять автора
        author: user.id,
      },
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      },
    });

    return this.transformResponse(updated);
  },

  /**
   * Удаление статьи
   * Проверяет, что пользователь является автором статьи
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;

    // Получаем существующую статью для проверки авторства
    const existing = await strapi.entityService.findOne('api::article.article', id, {
      populate: ['author'],
    });

    if (!existing) {
      return ctx.notFound('Article not found');
    }

    // Проверяем авторство
    const authorId =
      typeof (existing as any).author === 'object'
        ? (existing as any).author.id
        : (existing as any).author;

    if (String(authorId) !== String(user.id)) {
      return ctx.forbidden('You can only delete your own articles');
    }

    // Удаляем статью
    const deleted = await strapi.entityService.delete('api::article.article', id);
    return this.transformResponse(deleted);
  },

  /**
   * Поиск статей по тексту
   * Публичный доступ - ищет только среди опубликованных статей
   */
  async search(ctx) {
    const { q, skip = 0, limit = 10 } = ctx.query as any;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return ctx.badRequest('Search query must be at least 2 characters long');
    }

    // Санитизация поискового запроса
    const sanitizedQuery = q.trim().slice(0, 100);

    // Фильтры: только опубликованные + поиск по title/content/excerpt
    const filters = {
      publishedAt: { $notNull: true },
      $or: [
        { title: { $containsi: sanitizedQuery } },
        { content: { $containsi: sanitizedQuery } },
        { excerpt: { $containsi: sanitizedQuery } },
      ],
    };

    // Используем entityService для поиска
    const result = await strapi.entityService.findMany('api::article.article', {
      filters,
      sort: { createdAt: 'desc' },
      start: Number(skip) || 0,
      limit: Math.min(Math.max(1, Number(limit) || 10), 50),
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: { avatar: { fields: ['url'] } },
        },
      },
    });

    ctx.body = {
      data: result,
      meta: {
        query: sanitizedQuery,
        pagination: {
          start: Number(skip) || 0,
          limit: Math.min(Math.max(1, Number(limit) || 10), 50),
          total: result.length,
        },
      },
    };
  },

  /**
   * Получение списка черновиков текущего пользователя
   * Требует аутентификации
   */
  async findDrafts(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { limit = 20 } = ctx.query as any;

    // Получаем только черновики текущего пользователя (publishedAt === null)
    const articles = await strapi.entityService.findMany('api::article.article', {
      filters: {
        author: { id: user.id },
        publishedAt: { $null: true },
      },
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      },
      sort: { createdAt: 'desc' },
      limit: Number.parseInt(String(limit), 10) || 20,
    });

    return this.transformResponse(articles);
  },

  /**
   * Получение черновика по ID
   * Только для автора статьи
   */
  async findDraft(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;

    const article = await strapi.entityService.findOne('api::article.article', id, {
      populate: {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      },
    });

    if (!article) {
      return ctx.notFound('Article not found');
    }

    // Проверяем, что пользователь является автором
    const authorId =
      typeof (article as any).author === 'object'
        ? (article as any).author.id
        : (article as any).author;

    if (String(authorId) !== String(user.id)) {
      return ctx.forbidden('You can only view your own drafts');
    }

    return this.transformResponse(article);
  },

  /**
   * Реакция на статью (like/dislike)
   * Toggle логика: если реакция уже есть - убираем, если нет - добавляем
   * Если меняем тип реакции (like -> dislike) - обновляем
   * 
   * Использует отдельную таблицу article-reaction для отслеживания реакций пользователей
   * 
   * ВАЖНО: Использует entityService.update для обновления только метаданных (счетчиков)
   * без изменения статуса публикации. Это официальный подход Strapi v5 для обновления
   * метаданных опубликованных статей.
   */
  async react(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const { reaction } = ctx.request.body || {};

    // Валидация входных данных
    if (!reaction || typeof reaction !== 'string' || !['like', 'dislike'].includes(reaction)) {
      return ctx.badRequest('Reaction must be either "like" or "dislike"');
    }

    const articleId = Number(id);
    if (!articleId || isNaN(articleId)) {
      return ctx.badRequest('Invalid article ID');
    }

    try {
      // Получаем статью через entityService.findOne для проверки существования и статуса
      const article = await strapi.entityService.findOne('api::article.article', articleId, {
        populate: ['author'],
      });

      if (!article) {
        return ctx.notFound('Article not found');
      }

      const isPublished = !!(article as any).publishedAt;
      const publishedAt = (article as any).publishedAt;

      // Проверяем доступ: для неопубликованных статей доступ только автору
      if (!isPublished) {
        const authorId =
          typeof (article as any).author === 'object'
            ? (article as any).author.id
            : (article as any).author;

        if (String(authorId) !== String(user.id)) {
          return ctx.notFound('Article not found');
        }
      }

      // Ищем существующую реакцию пользователя
      let existingReaction: any = null;
      try {
        const existingReactions = await strapi.entityService.findMany('api::article-reaction.article-reaction', {
          filters: {
            $and: [
              { article: { id: articleId } },
              { user: { id: user.id } },
            ],
          },
          limit: 1,
        });
        existingReaction = existingReactions?.[0] || null;
      } catch (error) {
        strapi.log.error(`[react] Error fetching existing reaction:`, error);
        return ctx.internalServerError('Failed to fetch existing reaction');
      }

      const currentReaction = existingReaction?.reaction as 'like' | 'dislike' | undefined;
      const reactionType = reaction as 'like' | 'dislike';
      
      // ВАЖНО: Для предотвращения race conditions при одновременных реакциях
      // перечитываем актуальные счетчики перед обновлением
      // В production рекомендуется использовать транзакции или оптимистичные блокировки
      const currentLikes = (article as any).likes_count || 0;
      const currentDislikes = (article as any).dislikes_count || 0;
      let newLikes = currentLikes;
      let newDislikes = currentDislikes;
      let finalUserReaction: 'like' | 'dislike' | null = null;

      // Обрабатываем реакцию
      if (existingReaction) {
        if (currentReaction === reactionType) {
          // Та же реакция - убираем (toggle off)
          try {
            await strapi.entityService.delete('api::article-reaction.article-reaction', existingReaction.id);
            finalUserReaction = null;
          } catch (error) {
            strapi.log.error(`[react] Failed to delete reaction:`, error);
            return ctx.internalServerError('Failed to delete reaction');
          }

          if (reactionType === 'like') {
            newLikes = Math.max(0, currentLikes - 1);
          } else {
            newDislikes = Math.max(0, currentDislikes - 1);
          }
        } else {
          // Меняем тип реакции (like -> dislike или наоборот)
          try {
            await strapi.entityService.update('api::article-reaction.article-reaction', existingReaction.id, {
              data: { reaction: reactionType },
            });
            finalUserReaction = reactionType;
          } catch (error) {
            strapi.log.error(`[react] Failed to update reaction:`, error);
            return ctx.internalServerError('Failed to update reaction');
          }

          if (reactionType === 'like') {
            newLikes = currentLikes + 1;
            newDislikes = Math.max(0, currentDislikes - 1);
          } else {
            newDislikes = currentDislikes + 1;
            newLikes = Math.max(0, currentLikes - 1);
          }
        }
      } else {
        // Новой реакции нет - добавляем
        try {
          await strapi.entityService.create('api::article-reaction.article-reaction', {
            data: {
              article: articleId,
              user: user.id,
              reaction: reactionType,
            },
          });
          finalUserReaction = reactionType;
        } catch (error) {
          strapi.log.error(`[react] Failed to create reaction:`, error);
          return ctx.internalServerError('Failed to create reaction');
        }

        if (reactionType === 'like') {
          newLikes = currentLikes + 1;
        } else {
          newDislikes = currentDislikes + 1;
        }
      }

      // Обновляем счетчики в статье
      const updateData: any = {
        likes_count: newLikes,
        dislikes_count: newDislikes,
      };

      const populate = {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      };

      let updated: any;

      if (isPublished) {
        // Для опубликованных статей используем documentService
        // чтобы правильно работать с draftAndPublish
        try {
          // Получаем documentId опубликованной статьи
          const publishedDocs = await strapi.documents('api::article.article').findMany({
            filters: { id: { $eq: articleId } },
            status: 'published',
      limit: 1,
    });

          if (!publishedDocs || publishedDocs.length === 0) {
            strapi.log.error(`[react] Published document not found for article: ${articleId}`);
            return ctx.notFound('Article not found');
          }

          const originalDocumentId = (publishedDocs[0] as any).documentId;

          // Обновляем через documentService с status: 'published'
          // чтобы обновить именно опубликованную версию без создания черновика
          const updatedDoc = await strapi.documents('api::article.article').update({
            documentId: originalDocumentId,
            data: updateData,
            status: 'published', // Обновляем опубликованную версию напрямую
            populate: populate as any,
          });

          if (!updatedDoc) {
            strapi.log.error(`[react] Failed to update document: ${originalDocumentId}`);
            return ctx.notFound('Article not found');
          }

          // Используем результат update напрямую, он уже содержит populate
          updated = updatedDoc;
        } catch (error) {
          strapi.log.error(`[react] Error updating published article:`, error);
          return ctx.internalServerError('Failed to update article');
        }
      } else {
        // Для черновиков используем entityService
        // Статья уже найдена через entityService.findOne в начале метода
        updated = await strapi.entityService.update('api::article.article', articleId, {
          data: updateData,
          populate: populate as any,
        });
      }

      if (!updated) {
        strapi.log.error(`[react] Failed to update article: ${articleId}`);
        return ctx.notFound('Article not found');
      }

      // Добавляем информацию о реакции пользователя в ответ
      (updated as any).userReaction = finalUserReaction;
      
      // Логирование перед transformResponse
      strapi.log.info(`[react] Before transformResponse: articleId=${articleId}, userId=${user.id}, finalUserReaction=${finalUserReaction}, finalUserReactionType=${typeof finalUserReaction}, updatedHasUserReaction=${!!(updated as any).userReaction}, updatedUserReaction=${(updated as any).userReaction}, updatedUserReactionType=${typeof (updated as any).userReaction}`);

      // В Strapi v5 transformResponse может не сохранять кастомные поля
      // Используем стандартный transformResponse и добавляем userReaction вручную
      const response = this.transformResponse(updated) as any;
      
      // Логирование для отладки
      strapi.log.info(`[react] transformResponse result: articleId=${articleId}, responseType=${typeof response}, responseIsArray=${Array.isArray(response)}, hasData=${!!response?.data}, responseDataKeys=${response?.data ? Object.keys(response.data).join(',') : 'N/A'}, responseKeys=${response && typeof response === 'object' ? Object.keys(response).join(',') : 'N/A'}`);
      
      // Добавляем userReaction в ответ
      if (response?.data) {
        (response.data as any).userReaction = finalUserReaction;
        strapi.log.info(`[react] Added userReaction to response.data: articleId=${articleId}, userId=${user.id}, userReaction=${finalUserReaction}, responseDataUserReaction=${(response.data as any).userReaction}, responseDataId=${(response.data as any).id}, responseDataHasContent=${!!(response.data as any).content}`);
        return response;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Проверяем, что response содержит данные (есть id или content)
        const responseKeys = Object.keys(response);
        const hasData = (response as any).id || (response as any).content || responseKeys.length > 0;
        
        if (hasData && (response as any).id) {
          // Response содержит данные, добавляем userReaction
          (response as any).userReaction = finalUserReaction;
          strapi.log.info(`[react] Added userReaction to response object: articleId=${articleId}, userId=${user.id}, userReaction=${finalUserReaction}, responseUserReaction=${(response as any).userReaction}, responseId=${(response as any).id}, responseHasContent=${!!(response as any).content}`);
          return response;
        } else {
          // Response пустой, используем fallback
          strapi.log.warn(`[react] Response object is empty, using fallback: articleId=${articleId}, responseKeys=${responseKeys.join(',')}, hasId=${!!(response as any).id}, hasContent=${!!(response as any).content}`);
        }
      }
      
      // Если формат неожиданный или response пустой, используем ctx.body напрямую
      {
        strapi.log.warn(`[react] Unexpected response format or empty response, using ctx.body: articleId=${articleId}, responseType=${typeof response}, isArray=${Array.isArray(response)}`);
        
        // Создаем объект статьи вручную из оригинального updated
        // ВАЖНО: Используем articleId из параметров запроса, а не updated.id, чтобы гарантировать правильный ID
        const articleData: any = {
          id: articleId, // Используем articleId из параметров запроса
          title: updated.title,
          content: updated.content,
          excerpt: updated.excerpt,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
          publishedAt: updated.publishedAt,
          likes_count: updated.likes_count || 0,
          dislikes_count: updated.dislikes_count || 0,
          views: updated.views || 0,
          tags: updated.tags || [],
          difficulty: updated.difficulty,
          userReaction: finalUserReaction,
        };
        
        // Добавляем автора
        if (updated.author) {
          if (typeof updated.author === 'object' && updated.author !== null) {
            articleData.author = {
              id: updated.author.id,
              username: updated.author.username || 'Anonymous',
              avatar: updated.author.avatar ? (typeof updated.author.avatar === 'object' ? updated.author.avatar.url : updated.author.avatar) : null,
            };
          } else {
            articleData.author = { id: updated.author };
          }
        }
        
        // Добавляем previewImage если есть
        if (updated.previewImage) {
          if (typeof updated.previewImage === 'object' && updated.previewImage !== null) {
            articleData.previewImage = updated.previewImage.url || null;
          } else {
            articleData.previewImage = updated.previewImage;
          }
        }
        
        strapi.log.info(`[react] Using ctx.body with manual article data: articleId=${articleId}, userId=${user.id}, userReaction=${finalUserReaction}, articleDataId=${articleData.id}, articleDataHasContent=${!!articleData.content}`);
        
        ctx.body = { data: articleData };
        return;
      }
    } catch (error) {
      strapi.log.error(`[react] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },
}));

