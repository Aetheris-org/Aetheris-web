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
    let user = ctx.state.user ?? null;

    // Валидация articleId
    const articleIdNum = Number(articleId);
    if (!articleIdNum || isNaN(articleIdNum)) {
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
              populate: {
                comment: {
                  fields: ['id'],
                },
              },
            });

            // Создаем мапу реакций по commentId
            const reactionMap = new Map();
            userReactions.forEach((reaction: any, index: number) => {
              const commentId = typeof reaction.comment === 'object' && reaction.comment !== null
                ? reaction.comment.id 
                : reaction.comment;
              
              // Логирование для первой реакции
              if (index === 0) {
                strapi.log.info(`[comment.find] Processing reaction: reactionId=${reaction.id}, comment=${reaction.comment}, commentType=${typeof reaction.comment}, commentIsObject=${typeof reaction.comment === 'object'}, commentIsNull=${reaction.comment === null}, extractedCommentId=${commentId}, extractedCommentIdType=${typeof commentId}, reactionValue=${reaction.reaction}`);
              }
              
              if (commentId !== undefined && commentId !== null) {
                reactionMap.set(commentId, reaction.reaction);
              } else {
                strapi.log.warn(`[comment.find] Skipping reaction with invalid commentId: reactionId=${reaction.id}, comment=${reaction.comment}, commentType=${typeof reaction.comment}`);
              }
            });

            // Добавляем userReaction к каждому комментарию
            // ВАЖНО: Всегда устанавливаем userReaction, даже если он null
            // null означает "нет реакции", undefined означает "неизвестно"
            comments.forEach((comment: any, index: number) => {
              // reactionMap.get() возвращает undefined, если реакции нет
              // Преобразуем undefined в null для консистентности
              const reaction = reactionMap.get(comment.id);
              const finalReaction = reaction ?? null;
              (comment as any).userReaction = finalReaction;
              
              // Логирование для первого комментария
              if (index === 0) {
                strapi.log.info(`[comment.find] Setting userReaction for comment ${comment.id}: reaction=${reaction}, reactionType=${typeof reaction}, finalReaction=${finalReaction}, finalReactionType=${typeof finalReaction}`);
              }
            });
            
            // Логирование для отладки
            const commentsWithReactions = comments.filter((c: any) => c.userReaction !== null && c.userReaction !== undefined);
            const firstComment = comments[0];
            strapi.log.info(`[comment.find] Added userReactions: articleId=${articleIdNum}, userId=${user.id}, reactionsCount=${reactionMap.size}, commentsWithReactions=${commentsWithReactions.length}, totalComments=${comments.length}, firstCommentId=${firstComment?.id}, firstCommentUserReaction=${firstComment ? (firstComment as any).userReaction : null}, firstCommentUserReactionType=${firstComment ? typeof (firstComment as any).userReaction : 'N/A'}`);
            
            // Дополнительное логирование для reactionMap
            if (reactionMap.size > 0) {
              const sampleEntry = Array.from(reactionMap.entries())[0];
              strapi.log.info(`[comment.find] Sample reactionMap entry: commentId=${sampleEntry[0]}, reaction=${sampleEntry[1]}, reactionType=${typeof sampleEntry[1]}`);
            }
          } catch (error) {
            // Если модель реакций еще не создана, просто не добавляем userReaction
            strapi.log.warn(`[comment.find] Error fetching user reactions:`, error);
          }
        }
      }

      // В Strapi v5 transformResponse может не сохранять кастомные поля (userReaction)
      // Используем ctx.body напрямую, чтобы гарантировать, что userReaction будет в ответе
      if (user && comments.length > 0) {
        // Преобразуем комментарии через transformResponse, но затем добавляем userReaction
        const transformed = this.transformResponse(comments) as any;
        
        // Детальное логирование для отладки
        const logData = {
          articleId: articleIdNum,
          userId: user.id,
          commentsLength: comments.length,
          transformedType: typeof transformed,
          transformedIsArray: Array.isArray(transformed),
          hasData: !!transformed?.data,
          transformedDataLength: transformed?.data ? (Array.isArray(transformed.data) ? transformed.data.length : 'not array') : 'no data',
          transformedKeys: transformed && typeof transformed === 'object' && !Array.isArray(transformed) ? Object.keys(transformed) : [],
          firstCommentOriginal: comments[0] ? {
            id: comments[0].id,
            userReaction: (comments[0] as any).userReaction,
          } : null,
          transformedPreview: transformed ? (typeof transformed === 'object' ? (Array.isArray(transformed) ? `Array(${transformed.length})` : JSON.stringify(transformed).slice(0, 200)) : String(transformed).slice(0, 200)) : 'null',
        };
        strapi.log.info(`[comment.find] transformResponse result:`, logData);
        
        // В Strapi v5 transformResponse для массива может вернуть:
        // 1. { data: [...] } - стандартный формат
        // 2. Просто массив [...] - если используется кастомный контроллер
        // 3. { data: [...], meta: {...} } - с метаданными
        let commentsArray: any[] = [];
        
        if (Array.isArray(transformed)) {
          // transformResponse вернул массив напрямую
          commentsArray = transformed;
        } else if (transformed?.data && Array.isArray(transformed.data)) {
          // transformResponse вернул { data: [...] }
          commentsArray = transformed.data;
        } else {
          // Неожиданный формат - логируем и используем fallback
          const transformedStr = transformed ? (typeof transformed === 'object' ? JSON.stringify(transformed).slice(0, 500) : String(transformed).slice(0, 500)) : 'null';
          strapi.log.warn(`[comment.find] Unexpected transformResponse format:`, {
            articleId: articleIdNum,
            transformedType: typeof transformed,
            transformedIsArray: Array.isArray(transformed),
            hasData: !!transformed?.data,
            transformedValue: transformedStr,
            transformedConstructor: transformed ? transformed.constructor?.name : 'null',
          });
          
          // Fallback: создаем массив напрямую из оригинальных комментариев
          // НЕ используем transformResponse для каждого комментария отдельно,
          // так как это может потерять userReaction
          // Вместо этого создаем объекты вручную, сохраняя все поля включая userReaction
          commentsArray = comments.map((comment: any, index: number) => {
            // Создаем объект комментария вручную, сохраняя userReaction
            const commentData: any = {
              id: comment.id,
              text: comment.text,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              likes_count: comment.likes_count || 0,
              dislikes_count: comment.dislikes_count || 0,
            };
            
            // ВАЖНО: Всегда сохраняем userReaction, даже если он null
            // Это нужно для того, чтобы frontend знал, что пользователь не поставил реакцию
            // (null означает "нет реакции", undefined означает "неизвестно")
            const originalUserReaction = (comment as any).userReaction;
            
            // Проверяем, что originalUserReaction является строкой 'like'/'dislike' или null
            // typeof null === 'object' в JavaScript (известный баг), поэтому проверяем явно
            let finalUserReaction: string | null;
            if (originalUserReaction === null) {
              finalUserReaction = null;
            } else if (originalUserReaction === 'like' || originalUserReaction === 'dislike') {
              finalUserReaction = originalUserReaction;
            } else if (originalUserReaction === undefined) {
              finalUserReaction = null;
            } else {
              // Неожиданный тип - логируем и устанавливаем null
              strapi.log.warn(`[comment.find] Fallback: unexpected userReaction type for comment ${comment.id}: value=${originalUserReaction}, type=${typeof originalUserReaction}, isNull=${originalUserReaction === null}, isUndefined=${originalUserReaction === undefined}`);
              finalUserReaction = null;
            }
            
            commentData.userReaction = finalUserReaction;
            
            // Логирование для первого комментария
            if (index === 0) {
              strapi.log.info(`[comment.find] Fallback: setting userReaction for comment ${comment.id}: original=${originalUserReaction}, originalType=${typeof originalUserReaction}, originalIsNull=${originalUserReaction === null}, originalIsUndefined=${originalUserReaction === undefined}, final=${finalUserReaction}, finalType=${typeof finalUserReaction}`);
            }
            
            // Добавляем автора (может быть объектом или ID)
            if (comment.author) {
              if (typeof comment.author === 'object' && comment.author !== null) {
                commentData.author = {
                  id: comment.author.id,
                  username: comment.author.username || 'Anonymous',
                  avatar: comment.author.avatar ? (typeof comment.author.avatar === 'object' ? comment.author.avatar.url : comment.author.avatar) : null,
                };
              } else {
                commentData.author = { id: comment.author };
              }
            }
            
            // Добавляем parent (может быть объектом или ID)
            if (comment.parent) {
              if (typeof comment.parent === 'object' && comment.parent !== null) {
                commentData.parent = { id: comment.parent.id };
              } else {
                commentData.parent = { id: comment.parent };
              }
            } else if (comment.parentId) {
              commentData.parent = { id: comment.parentId };
            }
            
            // Добавляем article (может быть объектом или ID)
            if (comment.article) {
              if (typeof comment.article === 'object' && comment.article !== null) {
                commentData.article = { id: comment.article.id };
              } else {
                commentData.article = { id: comment.article };
              }
            }
            
            return commentData;
          });
          
          // Проверяем, что userReaction действительно сохранен
          const commentsWithReactionField = commentsArray.filter((c: any) => 'userReaction' in c);
          const commentsWithNonNullReaction = commentsArray.filter((c: any) => c.userReaction !== null && c.userReaction !== undefined);
          
          strapi.log.info(`[comment.find] Fallback: created ${comments.length} comments manually`, {
            articleId: articleIdNum,
            commentsArrayLength: commentsArray.length,
            commentsWithReactionField: commentsWithReactionField.length,
            commentsWithNonNullReaction: commentsWithNonNullReaction.length,
            firstCommentHasReaction: commentsArray[0] ? !!(commentsArray[0] as any).userReaction : false,
            firstCommentId: commentsArray[0]?.id,
            firstCommentUserReaction: commentsArray[0]?.userReaction,
            firstCommentHasReactionField: commentsArray[0] ? ('userReaction' in commentsArray[0]) : false,
            firstCommentOriginalUserReaction: comments[0] ? (comments[0] as any).userReaction : null,
          });
        }
        
        if (Array.isArray(commentsArray) && commentsArray.length > 0) {
          // Если использовали fallback, userReaction уже добавлен при создании объектов
          // Если использовали transformResponse, нужно добавить userReaction
          if (!Array.isArray(transformed) && !transformed?.data) {
            // Fallback использован - userReaction уже в объектах
            strapi.log.info(`[comment.find] Using fallback comments with userReaction already included`, {
              articleId: articleIdNum,
              userId: user.id,
              commentsCount: commentsArray.length,
              firstCommentHasReaction: commentsArray[0] ? !!(commentsArray[0] as any).userReaction : false,
              firstCommentId: commentsArray[0]?.id,
              firstCommentUserReaction: commentsArray[0]?.userReaction,
            });
          } else {
            // transformResponse использован - нужно добавить userReaction
            commentsArray.forEach((comment: any, index: number) => {
              const originalComment = comments[index];
              if (originalComment && (originalComment as any).userReaction !== undefined) {
                comment.userReaction = (originalComment as any).userReaction;
              }
            });
            
            const addedCount = commentsArray.filter((c: any) => c.userReaction !== undefined && c.userReaction !== null).length;
            
            if (addedCount > 0) {
              strapi.log.info(`[comment.find] Added userReactions to ${addedCount} comments`, {
                articleId: articleIdNum,
                userId: user.id,
                addedCount,
                sampleComment: commentsArray.find((c: any) => c.userReaction) ? {
                  id: commentsArray.find((c: any) => c.userReaction)?.id,
                  userReaction: commentsArray.find((c: any) => c.userReaction)?.userReaction,
                } : null,
              });
            }
          }
          
          // Финальная проверка - убеждаемся, что userReaction присутствует во ВСЕХ комментариях
          // Проверяем наличие поля, а не его значение (null - это валидное значение)
          const commentsWithReactionField = commentsArray.filter((c: any) => 'userReaction' in c).length;
          const commentsWithNonNullReaction = commentsArray.filter((c: any) => c.userReaction !== null && c.userReaction !== undefined).length;
          const firstComment = commentsArray[0];
          
          strapi.log.info(`[comment.find] Final check: total=${commentsArray.length}, withField=${commentsWithReactionField}, withNonNull=${commentsWithNonNullReaction}, firstCommentId=${firstComment?.id}, firstHasField=${firstComment ? 'userReaction' in firstComment : false}, firstUserReaction=${firstComment?.userReaction}, firstUserReactionType=${typeof firstComment?.userReaction}`);
          
          // Дополнительное логирование для отладки
          if (commentsWithReactionField !== commentsArray.length) {
            strapi.log.warn(`[comment.find] Some comments missing userReaction field!`, JSON.stringify({
              total: commentsArray.length,
              withField: commentsWithReactionField,
              missing: commentsArray.length - commentsWithReactionField,
              sampleMissing: commentsArray.find((c: any) => !('userReaction' in c)) ? {
                id: commentsArray.find((c: any) => !('userReaction' in c))?.id,
                keys: Object.keys(commentsArray.find((c: any) => !('userReaction' in c)) || {}),
              } : null,
            }));
          }
          
          // Используем ctx.body напрямую, чтобы гарантировать сохранение userReaction
          ctx.body = { data: commentsArray };
          return;
        } else {
          strapi.log.warn(`[comment.find] Failed to extract comments array:`, {
            articleId: articleIdNum,
            commentsLength: comments.length,
            commentsArrayLength: commentsArray.length,
            transformedType: typeof transformed,
            isArray: Array.isArray(transformed),
            hasData: !!transformed?.data,
          });
        }
      }
      
      // Если пользователь не аутентифицирован или формат неожиданный, используем стандартный transformResponse
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
          
          // Логирование перед transformResponse
          strapi.log.info(`[comment.react] Before transformResponse: commentId=${commentId}, userId=${user.id}, finalUserReaction=${finalUserReaction}, finalUserReactionType=${typeof finalUserReaction}, updatedHasUserReaction=${!!(updated as any).userReaction}, updatedUserReaction=${(updated as any).userReaction}, updatedUserReactionType=${typeof (updated as any).userReaction}`);

          const response = this.transformResponse(updated) as any;
          
          // Логирование после transformResponse
          const responseDataKeys = response?.data ? Object.keys(response.data) : [];
          const responseDataUserReaction = response?.data ? (response.data as any).userReaction : undefined;
          const responseUserReaction = response && typeof response === 'object' && !Array.isArray(response) ? (response as any).userReaction : undefined;
          
          strapi.log.info(`[comment.react] After transformResponse: commentId=${commentId}, responseType=${typeof response}, responseIsArray=${Array.isArray(response)}, hasData=${!!response?.data}, responseDataKeys=${responseDataKeys.join(',')}, responseDataUserReaction=${responseDataUserReaction}, responseDataUserReactionType=${typeof responseDataUserReaction}, responseUserReaction=${responseUserReaction}, responseUserReactionType=${typeof responseUserReaction}`);
          
          // В Strapi v5 transformResponse может не сохранять кастомные поля
          // Добавляем userReaction в ответ вручную, если его там нет
          // transformResponse может вернуть { data: {...} } или просто объект
          if (response?.data) {
            (response.data as any).userReaction = finalUserReaction;
            strapi.log.info(`[comment.react] Added userReaction to response.data:`, {
              commentId,
              userId: user.id,
              userReaction: finalUserReaction,
              responseDataUserReaction: (response.data as any).userReaction,
              responseDataUserReactionType: typeof (response.data as any).userReaction,
            });
          } else if (response && typeof response === 'object' && !Array.isArray(response)) {
            // Если transformResponse вернул плоский объект
            (response as any).userReaction = finalUserReaction;
            strapi.log.info(`[comment.react] Added userReaction to response object:`, {
              commentId,
              userId: user.id,
              userReaction: finalUserReaction,
              responseUserReaction: (response as any).userReaction,
              responseUserReactionType: typeof (response as any).userReaction,
              responseId: (response as any).id,
            });
          } else {
            // Если формат неожиданный, используем ctx.body напрямую
            strapi.log.warn(`[comment.react] Unexpected response format, using ctx.body:`, {
              commentId,
              responseType: typeof response,
              isArray: Array.isArray(response),
              hasData: !!response?.data,
            });
            
            // Используем ctx.body напрямую, чтобы гарантировать, что userReaction будет в ответе
            const transformed = this.transformResponse(updated) as any;
            const finalData = transformed?.data || transformed;
            if (finalData) {
              (finalData as any).userReaction = finalUserReaction;
              strapi.log.info(`[comment.react] Using ctx.body with userReaction:`, {
                commentId,
                userId: user.id,
                userReaction: finalUserReaction,
                finalDataUserReaction: (finalData as any).userReaction,
                finalDataUserReactionType: typeof (finalData as any).userReaction,
              });
              ctx.body = { data: finalData };
              return;
            }
          }
          
          return response;
    } catch (error) {
      strapi.log.error(`[comment.react] Unexpected error:`, error);
      return ctx.internalServerError('An unexpected error occurred');
    }
  },
}));

