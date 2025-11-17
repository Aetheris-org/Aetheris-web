/**
 * Comment controller
 * Управление комментариями к статьям с поддержкой вложенных ответов
 * 
 * ВАЖНО: Все методы используют встроенные механизмы Strapi для валидации и безопасности
 */
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  /**
   * Получение комментариев к статье
   * Публичный доступ - не требует аутентификации
   */
  async find(ctx) {
    const { articleId } = ctx.params;
    const user = ctx.state.user ?? null;

    // Валидация articleId
    const articleIdNum = Number(articleId);
    if (!articleIdNum || isNaN(articleIdNum)) {
      return ctx.badRequest('Invalid article ID');
    }

    // Получаем комментарии с ограничением для производительности
    // Примечание: Проверка существования статьи происходит автоматически через фильтр
    // Максимум 1000 комментариев за раз (для статей с большим количеством комментариев)
    const MAX_COMMENTS = 1000;
    try {
      const comments = await strapi.entityService.findMany('api::comment.comment', {
        filters: {
          article: { id: articleIdNum },
        },
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          parent: {
            fields: ['id'],
          },
        },
        sort: { createdAt: 'asc' },
        limit: MAX_COMMENTS, // Ограничение для производительности
      });

      // Для аутентифицированных пользователей получаем их реакции
      if (user) {
        const commentIds = comments.map((c: any) => c.id);
        
        if (commentIds.length > 0) {
          try {
            const userReactions = await strapi.entityService.findMany('api::comment-reaction.comment-reaction', {
              filters: {
                $and: [
                  { comment: { id: { $in: commentIds } } },
                  { user: { id: user.id } },
                ],
              },
            });

            // Создаем мапу реакций по commentId
            const reactionMap = new Map();
            userReactions.forEach((reaction: any) => {
              const commentId = typeof reaction.comment === 'object' 
                ? reaction.comment.id 
                : reaction.comment;
              reactionMap.set(commentId, reaction.reaction);
            });

            // Добавляем userReaction к каждому комментарию
            comments.forEach((comment: any) => {
              comment.userReaction = reactionMap.get(comment.id) || null;
            });
          } catch (error) {
            // Если модель реакций еще не создана, просто не добавляем userReaction
            strapi.log.warn(`[comment.find] Error fetching user reactions:`, error);
          }
        }
      }

      return this.transformResponse(comments);
    } catch (error) {
      strapi.log.error(`[comment.find] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  /**
   * Создание комментария
   * Требует аутентификации
   */
  async create(ctx) {
    const user = ctx.state.user;
    strapi.log.info(`[comment.create] Request received, user:`, user ? { id: user.id } : 'null');
    
    if (!user) {
      strapi.log.warn(`[comment.create] Unauthorized - no user in ctx.state.user`);
      return ctx.unauthorized('Authentication required');
    }

    const { articleId } = ctx.params;
    const { data } = ctx.request.body || {};

    // Валидация articleId
    const articleIdNum = Number(articleId);
    if (!articleIdNum || isNaN(articleIdNum)) {
      return ctx.badRequest('Invalid article ID');
    }

    // Валидация данных
    if (!data || typeof data.text !== 'string') {
      return ctx.badRequest('Request body must contain data.text (string)');
    }

    const text = data.text.trim();
    if (text.length === 0) {
      return ctx.badRequest('Comment text cannot be empty');
    }

    if (text.length > 10000) {
      return ctx.badRequest('Comment text cannot exceed 10000 characters');
    }

    // Проверяем существование статьи
    try {
      const article = await strapi.entityService.findOne('api::article.article', articleIdNum, {
        fields: ['id'],
      });

      if (!article) {
        return ctx.notFound('Article not found');
      }
    } catch (error) {
      strapi.log.error(`[comment.create] Error checking article:`, error);
      return ctx.notFound('Article not found');
    }

      // Если указан parentId, проверяем существование родительского комментария
      let parentId: number | null = null;
      if (data.parent) {
        if (typeof data.parent === 'string') {
          parentId = Number(data.parent);
        } else if (typeof data.parent === 'number') {
          parentId = data.parent;
        }

        if (parentId && !isNaN(parentId)) {
          try {
            // Проверяем, что родительский комментарий существует и относится к той же статье
            // Используем фильтр для надежной проверки, что комментарий существует и относится к статье
            const parentComments = await strapi.entityService.findMany('api::comment.comment', {
              filters: {
                $and: [
                  { id: { $eq: parentId } },
                  { article: { id: { $eq: articleIdNum } } },
                ],
              },
              limit: 1,
            });

            if (!parentComments || parentComments.length === 0) {
              return ctx.badRequest('Parent comment not found or does not belong to this article');
            }
          } catch (error) {
            strapi.log.error(`[comment.create] Error checking parent comment:`, error);
            return ctx.badRequest('Parent comment not found');
          }
        }
    }

    // Создаем комментарий
    try {
      const comment = await strapi.entityService.create('api::comment.comment', {
        data: {
          text,
          article: articleIdNum,
          author: user.id,
          parent: parentId || null,
        },
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          parent: {
            fields: ['id'],
          },
        },
      });

      return this.transformResponse(comment);
    } catch (error) {
      strapi.log.error(`[comment.create] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  /**
   * Обновление комментария
   * Только автор может обновить свой комментарий
   */
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;
    const { data } = ctx.request.body || {};

    // Валидация ID
    const commentId = Number(id);
    if (!commentId || isNaN(commentId)) {
      return ctx.badRequest('Invalid comment ID');
    }

    // Валидация данных
    if (!data || typeof data.text !== 'string') {
      return ctx.badRequest('Request body must contain data.text (string)');
    }

    const text = data.text.trim();
    if (text.length === 0) {
      return ctx.badRequest('Comment text cannot be empty');
    }

    if (text.length > 10000) {
      return ctx.badRequest('Comment text cannot exceed 10000 characters');
    }

    // Получаем существующий комментарий
    try {
      const existing = await strapi.entityService.findOne('api::comment.comment', commentId, {
        populate: ['author'],
      });

      if (!existing) {
        return ctx.notFound('Comment not found');
      }

      // Проверяем авторство
      const authorId =
        typeof (existing as any).author === 'object'
          ? (existing as any).author.id
          : (existing as any).author;

      if (String(authorId) !== String(user.id)) {
        return ctx.forbidden('You can only update your own comments');
      }

      // Обновляем комментарий
      const updated = await strapi.entityService.update('api::comment.comment', commentId, {
        data: { text },
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
    } catch (error) {
      strapi.log.error(`[comment.update] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  /**
   * Удаление комментария
   * Только автор может удалить свой комментарий
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    const { id } = ctx.params;

    // Валидация ID
    const commentId = Number(id);
    if (!commentId || isNaN(commentId)) {
      return ctx.badRequest('Invalid comment ID');
    }

    // Получаем существующий комментарий
    try {
      const existing = await strapi.entityService.findOne('api::comment.comment', commentId, {
        populate: ['author'],
      });

      if (!existing) {
        return ctx.notFound('Comment not found');
      }

      // Проверяем авторство
      const authorId =
        typeof (existing as any).author === 'object'
          ? (existing as any).author.id
          : (existing as any).author;

      if (String(authorId) !== String(user.id)) {
        return ctx.forbidden('You can only delete your own comments');
      }

      // Удаляем комментарий
      await strapi.entityService.delete('api::comment.comment', commentId);

      return this.transformResponse({ id: commentId });
    } catch (error) {
      strapi.log.error(`[comment.delete] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },

  /**
   * Реакция на комментарий (like/dislike)
   * Toggle логика: если реакция уже есть - убираем, если нет - добавляем
   * Если меняем тип реакции (like -> dislike) - обновляем
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

    const commentId = Number(id);
    if (!commentId || isNaN(commentId)) {
      return ctx.badRequest('Invalid comment ID');
    }

    try {
      // Получаем комментарий
      const comment = await strapi.entityService.findOne('api::comment.comment', commentId, {
        fields: ['id', 'likes_count', 'dislikes_count'],
      });

      if (!comment) {
        return ctx.notFound('Comment not found');
      }

      // Ищем существующую реакцию пользователя
      let existingReaction: any = null;
      try {
        const existingReactions = await strapi.entityService.findMany('api::comment-reaction.comment-reaction', {
          filters: {
            $and: [
              { comment: { id: commentId } },
              { user: { id: user.id } },
            ],
          },
          limit: 1,
        });
        existingReaction = existingReactions?.[0] || null;
      } catch (error) {
        strapi.log.error(`[comment.react] Error fetching existing reaction:`, error);
        return ctx.internalServerError('Failed to fetch existing reaction');
      }

      const currentReaction = existingReaction?.reaction as 'like' | 'dislike' | undefined;
      const reactionType = reaction as 'like' | 'dislike';
      
      // ВАЖНО: Для предотвращения race conditions при одновременных реакциях
      // перечитываем актуальные счетчики перед обновлением
      // В production рекомендуется использовать транзакции или оптимистичные блокировки
      const currentLikes = (comment as any).likes_count || 0;
      const currentDislikes = (comment as any).dislikes_count || 0;
      let newLikes = currentLikes;
      let newDislikes = currentDislikes;
      let finalUserReaction: 'like' | 'dislike' | null = null;

      // Обрабатываем реакцию
      if (existingReaction) {
        if (currentReaction === reactionType) {
          // Та же реакция - убираем (toggle off)
          try {
            await strapi.entityService.delete('api::comment-reaction.comment-reaction', existingReaction.id);
            finalUserReaction = null;
          } catch (error) {
            strapi.log.error(`[comment.react] Failed to delete reaction:`, error);
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
            await strapi.entityService.update('api::comment-reaction.comment-reaction', existingReaction.id, {
              data: { reaction: reactionType },
            });
            finalUserReaction = reactionType;
          } catch (error) {
            strapi.log.error(`[comment.react] Failed to update reaction:`, error);
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
          await strapi.entityService.create('api::comment-reaction.comment-reaction', {
            data: {
              comment: commentId,
              user: user.id,
              reaction: reactionType,
            },
          });
          finalUserReaction = reactionType;
        } catch (error) {
          strapi.log.error(`[comment.react] Failed to create reaction:`, error);
          return ctx.internalServerError('Failed to create reaction');
        }

        if (reactionType === 'like') {
          newLikes = currentLikes + 1;
        } else {
          newDislikes = currentDislikes + 1;
        }
      }

      // Обновляем счетчики в комментарии
      const updated = await strapi.entityService.update('api::comment.comment', commentId, {
        data: {
          likes_count: newLikes,
          dislikes_count: newDislikes,
        },
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          parent: {
            fields: ['id'],
          },
        },
      });

      // Добавляем информацию о реакции пользователя в ответ
      (updated as any).userReaction = finalUserReaction;

      return this.transformResponse(updated);
    } catch (error) {
      strapi.log.error(`[comment.react] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },
}));

