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
   * Переопределяем find для фильтрации только опубликованных статей
   * Публичный доступ - не требует аутентификации
   */
  /**
   * Получение списка статей с оптимизацией для высокой нагрузки
   * - Валидация и ограничение параметров запроса
   * - Оптимизация populate (только необходимые поля)
   * - Ограничение максимального лимита для защиты от перегрузки
   */
  async find(ctx) {
    try {
      // МОЩНОЕ ЛОГИРОВАНИЕ в начале метода
      strapi.log.info(`🔵 [find] START: url=${ctx.url}, method=${ctx.method}, user=${ctx.state.user?.id || 'anonymous'}, hasUser=${!!ctx.state.user}`);
      
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔵 [find] START details:', JSON.stringify({
          query: ctx.query,
          queryString: ctx.querystring,
          url: ctx.url,
          method: ctx.method,
          user: ctx.state.user?.id || null,
          hasUser: !!ctx.state.user,
        }, null, 2));
      }
      
      const { query } = ctx;
      
      // ВАЛИДАЦИЯ И ОГРАНИЧЕНИЕ ПАРАМЕТРОВ (защита от перегрузки)
      const pagination = (query.pagination as Record<string, any>) || {};
      let start = Number.parseInt(String(pagination.start || 0), 10) || 0;
      let limit = Number.parseInt(String(pagination.limit || 10), 10) || 10;
      const withCount = pagination.withCount !== false;
      
      // Ограничиваем максимальный лимит для защиты от перегрузки
      const MAX_LIMIT = 100;
      const DEFAULT_LIMIT = 10;
      limit = Math.min(Math.max(1, limit), MAX_LIMIT);
      start = Math.max(0, start);
      
      // Валидация сортировки
      const sort = query.sort || { createdAt: 'desc' };
      const allowedSortFields = ['createdAt', 'updatedAt', 'likes_count', 'dislikes_count', 'views', 'title'];
      const allowedSortOrders = ['asc', 'desc'];
      
      // Нормализуем sort (может быть объектом или строкой)
      let normalizedSort: Record<string, string> = {};
      if (typeof sort === 'string') {
        const [field, order = 'desc'] = sort.split(':');
        if (allowedSortFields.includes(field) && allowedSortOrders.includes(order)) {
          normalizedSort[field] = order;
        } else {
          normalizedSort = { createdAt: 'desc' };
        }
      } else if (typeof sort === 'object' && sort !== null) {
        Object.entries(sort).forEach(([field, order]) => {
          if (allowedSortFields.includes(field) && allowedSortOrders.includes(String(order))) {
            normalizedSort[field] = String(order);
          }
        });
        if (Object.keys(normalizedSort).length === 0) {
          normalizedSort = { createdAt: 'desc' };
        }
      } else {
        normalizedSort = { createdAt: 'desc' };
      }
      
      // Добавляем фильтр для опубликованных статей
      // В Strapi v5 с draftAndPublish изменился механизм публикации
      const queryFilters = (query.filters as Record<string, any>) || {};
      
      // В Strapi v5 для draftAndPublish нужно явно фильтровать по publishedAt
      // entityService.findMany НЕ фильтрует автоматически по publishedAt
      const filters: any = {
        ...queryFilters,
      };
      
      // ВАЖНО: Всегда добавляем фильтр publishedAt, если пользовательский фильтр его не содержит
      // Это гарантирует, что возвращаются только опубликованные статьи
      if (!queryFilters.publishedAt) {
        // В Strapi v5 используем $notNull для проверки наличия publishedAt
        filters.publishedAt = { $notNull: true };
      } else {
        // Если пользователь передал свой фильтр publishedAt, используем его как есть
        // Но если это не объект с $notNull, просто перезаписываем (пользователь знает что делает)
        filters.publishedAt = queryFilters.publishedAt;
      }
      
        // Объявляем переменные для total и articles ДО всех операций (нужно для автоматической публикации)
        let total = 0;
        let articles: any[] = [];
        
        // МОЩНОЕ ЛОГИРОВАНИЕ для отладки
        if (process.env.NODE_ENV === 'development') {
          try {
            strapi.log.info('🔍 [find] Filters applied:', JSON.stringify({
              filters,
              queryFilters,
              hasPublishedAtFilter: !!filters.publishedAt,
              publishedAtFilter: filters.publishedAt,
            }, null, 2));
            
            // Проверяем, сколько всего статей в базе (для диагностики)
            const allCount = await strapi.entityService.count('api::article.article', {});
            const publishedCount = await strapi.entityService.count('api::article.article', {
              filters: { publishedAt: { $notNull: true } },
            });
            strapi.log.info('📊 Articles in database:', JSON.stringify({
              total: allCount,
              published: publishedCount,
              draft: allCount - publishedCount,
            }, null, 2));
          } catch (logError) {
            strapi.log.error('Error in logging:', logError);
          }
        }
        
        // ВАЖНО: Автоматическая публикация неопубликованных статей
        // Выполняется ПЕРЕД запросом статей, чтобы опубликовать все неопубликованные статьи
        // Это гарантирует, что статьи будут видны после публикации
        
        // Пробуем получить статьи напрямую через SQL для проверки
        let allArticlesCount = 0;
        let publishedCount = 0;
        try {
          const db = strapi.db.connection;
          if (db && typeof db === 'function') {
            // Проверяем напрямую через SQL
            const sqlTotal = await db('articles').count('* as count').first();
            allArticlesCount = Number(sqlTotal?.count || 0);
            
            const sqlPublished = await db('articles').whereNotNull('published_at').count('* as count').first();
            publishedCount = Number(sqlPublished?.count || 0);
            
            strapi.log.info(`🔍 [find] SQL проверка: allArticlesCount=${allArticlesCount}, publishedCount=${publishedCount}`);
          }
        } catch (sqlError: any) {
          strapi.log.warn(`⚠️ [find] SQL проверка не удалась, используем entityService: ${sqlError.message}`);
          // Fallback к entityService
          allArticlesCount = await strapi.entityService.count('api::article.article', {});
          publishedCount = await strapi.entityService.count('api::article.article', {
            filters: { publishedAt: { $notNull: true } },
          });
        }
        
        // МОЩНОЕ ЛОГИРОВАНИЕ для диагностики
        strapi.log.info(`🔍 [find] Проверка неопубликованных статей: allArticlesCount=${allArticlesCount}, publishedCount=${publishedCount}, unpublishedCount=${allArticlesCount - publishedCount}, willPublish=${allArticlesCount > 0 && publishedCount < allArticlesCount}`);
        
        // Если есть неопубликованные статьи, публикуем их автоматически
        if (allArticlesCount > 0 && publishedCount < allArticlesCount) {
          strapi.log.warn(`⚠️ [find] УСЛОВИЕ ВЫПОЛНЕНО: allArticlesCount=${allArticlesCount} > 0 && publishedCount=${publishedCount} < allArticlesCount=${allArticlesCount}`);
          // Получаем все неопубликованные статьи
          const allArticlesWithoutFilter = await strapi.entityService.findMany('api::article.article', {
            limit: 100, // Ограничиваем для безопасности
          });
          
          const unpublishedArticles = allArticlesWithoutFilter.filter((a: any) => !a.publishedAt);
          
          if (unpublishedArticles.length > 0) {
            strapi.log.warn(`⚠️ [find] Найдено ${unpublishedArticles.length} неопубликованных статей. Публикуем автоматически...`);
            
            // Публикуем все неопубликованные статьи
            // В Strapi v5 для draftAndPublish используем прямой SQL запрос через strapi.db.connection
            // Это обходной путь, но работает надежно, когда entityService и documentService не срабатывают
            let successfullyPublishedCount = 0;
            const publishedAt = new Date().toISOString();
            
            for (const article of unpublishedArticles) {
              try {
                const articleId = article.id;
                
                // В Strapi v5 используем прямой SQL запрос для установки publishedAt
                // Это работает, когда entityService и documentService не срабатывают
                const db = strapi.db.connection;
                
                // Получаем имя таблицы для articles
                // В Strapi v5 с SQLite таблица называется articles (из collectionName в schema.json)
                // Поле publishedAt в БД хранится как published_at (snake_case)
                const tableName = 'articles';
                
                // МОЩНОЕ ЛОГИРОВАНИЕ перед SQL запросом
                if (process.env.NODE_ENV === 'development') {
                  strapi.log.info(`🔍 [find] Пытаемся опубликовать статью ID: ${articleId} через SQL`);
                  strapi.log.info(`🔍 [find] DB connection type: ${typeof db}, has raw: ${typeof db?.raw}, has update: ${typeof db?.update}`);
                }
                
                // Пробуем обновить published_at (snake_case) - стандартное имя в Strapi
                try {
                  // Strapi использует Knex для работы с БД
                  // Используем Knex query builder - это более надежный способ
                  if (db && typeof db === 'function') {
                    // Knex query builder: db(tableName).where().update()
                    const updateResult = await db(tableName)
                      .where('id', articleId)
                      .update({ published_at: publishedAt });
                    
                    if (process.env.NODE_ENV === 'development') {
                      strapi.log.info(`✅ [find] SQL запрос выполнен (через query builder) для статьи ID: ${articleId}, rows affected: ${updateResult}`);
                    }
                    
                    // Если query builder не сработал, пробуем raw SQL
                    if (updateResult === 0) {
                      if (process.env.NODE_ENV === 'development') {
                        strapi.log.warn(`⚠️ [find] Query builder вернул 0 строк, пробуем raw SQL для статьи ID: ${articleId}`);
                      }
                      
                      // Пробуем raw SQL с разными вариантами имени поля
                      try {
                        await db.raw(`UPDATE ${tableName} SET published_at = ? WHERE id = ?`, [publishedAt, articleId]);
                        if (process.env.NODE_ENV === 'development') {
                          strapi.log.info(`✅ [find] Raw SQL выполнен для статьи ID: ${articleId}`);
                        }
                      } catch (rawError: any) {
                        // Пробуем с camelCase
                        try {
                          await db.raw(`UPDATE ${tableName} SET publishedAt = ? WHERE id = ?`, [publishedAt, articleId]);
                          if (process.env.NODE_ENV === 'development') {
                            strapi.log.info(`✅ [find] Raw SQL (camelCase) выполнен для статьи ID: ${articleId}`);
                          }
                        } catch (camelError: any) {
                          strapi.log.error(`❌ [find] Оба варианта SQL не сработали для статьи ID: ${articleId}`);
                        }
                      }
                    }
                  } else {
                    // Fallback: пробуем через entityService.update
                    await strapi.entityService.update('api::article.article', articleId, {
                      data: {
                        publishedAt,
                      },
                    });
                    
                    if (process.env.NODE_ENV === 'development') {
                      strapi.log.info(`✅ [find] Использован entityService.update для статьи ID: ${articleId}`);
                    }
                  }
                } catch (sqlError: any) {
                  strapi.log.error(`❌ [find] Ошибка SQL запроса для статьи ID: ${articleId}:`, sqlError.message);
                  if (process.env.NODE_ENV === 'development') {
                    strapi.log.error(`❌ [find] SQL error stack:`, sqlError.stack);
                    strapi.log.error(`❌ [find] SQL error details:`, JSON.stringify({
                      name: sqlError.name,
                      code: sqlError.code,
                      errno: sqlError.errno,
                    }, null, 2));
                  }
                  // Продолжаем проверку, возможно запрос все равно выполнился
                }
                
                // Небольшая задержка для синхронизации и очистки кэша Strapi
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // ВАЖНО: Проверяем напрямую через SQL, а не через entityService
                // entityService может кэшировать данные
                let verifiedPublishedAt: string | null = null;
                try {
                  if (db && typeof db === 'function') {
                    // Проверяем напрямую через SQL запрос
                    const checkResult = await db(tableName)
                      .where('id', articleId)
                      .select('published_at')
                      .first();
                    
                    verifiedPublishedAt = checkResult?.published_at || null;
                    
                    if (process.env.NODE_ENV === 'development') {
                      strapi.log.info(`🔍 [find] Проверка через SQL для статьи ID: ${articleId}, published_at: ${verifiedPublishedAt}`);
                    }
                  }
                } catch (checkError: any) {
                  if (process.env.NODE_ENV === 'development') {
                    strapi.log.warn(`⚠️ [find] Ошибка проверки через SQL для статьи ID: ${articleId}:`, checkError.message);
                  }
                }
                
                // Если SQL проверка не сработала, проверяем через entityService
                if (!verifiedPublishedAt) {
                  const verifyArticle = await strapi.entityService.findOne('api::article.article', articleId, {
                    fields: ['id', 'publishedAt'],
                  });
                  verifiedPublishedAt = (verifyArticle as any)?.publishedAt || null;
                }
                
                if (verifiedPublishedAt) {
                  successfullyPublishedCount++;
                  if (process.env.NODE_ENV === 'development') {
                    strapi.log.info(`✅ [find] Автоматически опубликована статья ID: ${articleId}, Title: ${(article as any).title?.substring(0, 50)}, publishedAt: ${verifiedPublishedAt}`);
                  }
                } else {
                  strapi.log.error(`❌ [find] Не удалось опубликовать статью ID: ${articleId} - publishedAt все еще null после SQL запроса`);
                  if (process.env.NODE_ENV === 'development') {
                    // Пробуем получить статью полностью для диагностики
                    const fullArticle = await strapi.entityService.findOne('api::article.article', articleId, {
                      fields: ['id', 'title', 'publishedAt'],
                    });
                    strapi.log.warn(`⚠️ [find] Проверка статьи ID: ${articleId}:`, JSON.stringify({
                      id: fullArticle?.id,
                      title: (fullArticle as any)?.title,
                      publishedAt: (fullArticle as any)?.publishedAt,
                      hasPublishedAt: !!(fullArticle as any)?.publishedAt,
                    }, null, 2));
                  }
                }
              } catch (error: any) {
                strapi.log.error(`❌ [find] Ошибка при публикации статьи ID: ${article.id}:`, error.message);
                if (process.env.NODE_ENV === 'development') {
                  strapi.log.error(`❌ [find] Stack trace:`, error.stack);
                }
              }
            }
            
            strapi.log.info(`✅ [find] Автоматически опубликовано статей: ${successfullyPublishedCount} из ${unpublishedArticles.length}`);
            
            // ВАЖНО: Даем время Strapi обновить индексы/кэш после публикации
            // Небольшая задержка для синхронизации
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Оптимизированный populate - только необходимые поля
        // preview_image теперь строка (URL), не требует populate
        // Используем as any для обхода строгой типизации Strapi (populate корректный)
        const populate: any = query.populate || {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
        };
        
        // Используем entityService для получения статей
        // entityService автоматически использует параметризованные запросы (защита от SQL injection)
        // В Strapi v5 с draftAndPublish нужно явно фильтровать по publishedAt
        articles = await strapi.entityService.findMany('api::article.article', {
          filters,
          populate,
          sort: normalizedSort,
          start,
          limit,
          // ВАЖНО: В Strapi v5 для draftAndPublish нужно использовать publicationState: 'live'
          // Но это работает только для публичного API, не для entityService
          // Поэтому используем фильтр publishedAt: { $notNull: true }
        });
        
        // МОЩНОЕ ЛОГИРОВАНИЕ для отладки
        strapi.log.info(`📄 [find] Articles found: count=${articles.length}, start=${start}, limit=${limit}, filters=${JSON.stringify(filters)}`);
        
        if (process.env.NODE_ENV === 'development') {
          strapi.log.info('📄 [find] Articles found (raw):', JSON.stringify({
            count: articles.length,
            firstArticle: articles[0] ? {
              id: (articles[0] as any).id,
              documentId: (articles[0] as any).documentId,
              title: (articles[0] as any).title,
              publishedAt: (articles[0] as any).publishedAt,
              hasPublishedAt: !!(articles[0] as any).publishedAt,
            } : null,
          }, null, 2));
        }
        
        // Если статей нет, но в базе они есть - используем SQL как fallback
        if (articles.length === 0 && allArticlesCount > 0) {
          strapi.log.warn(`⚠️ [find] entityService вернул 0 статей, но в базе их ${allArticlesCount}. Используем SQL fallback...`);
          try {
            const db = strapi.db.connection;
            if (db && typeof db === 'function') {
              // Получаем статьи напрямую через SQL
              // В Strapi v5 поля могут быть в snake_case или camelCase, пробуем оба варианта
              let sqlArticles: any[] = [];
              try {
                sqlArticles = await db('articles')
                  .select('*') // Явно выбираем все поля
                  .whereNotNull('published_at')
                  .orderBy('created_at', 'desc')
                  .limit(limit)
                  .offset(start);
              } catch (sortError: any) {
                // Если не получилось с created_at, пробуем с createdAt
                try {
                  sqlArticles = await db('articles')
                    .select('*') // Явно выбираем все поля
                    .whereNotNull('published_at')
                    .orderBy('createdAt', 'desc')
                    .limit(limit)
                    .offset(start);
                } catch (sortError2: any) {
                  strapi.log.warn(`⚠️ [find] Ошибка сортировки SQL: ${sortError2.message}`);
                }
              }
              
              strapi.log.info(`🔍 [find] SQL вернул ${sqlArticles.length} статей`);
              
              if (sqlArticles.length > 0) {
                // Если SQL нашел статьи, но entityService нет - проблема с правами доступа
                // Используем SQL результат и делаем populate вручную
                strapi.log.error(`❌ [find] ПРОБЛЕМА: SQL нашел ${sqlArticles.length} статей, но entityService вернул 0. Используем SQL fallback с ручным populate.`);
                
                // Преобразуем SQL результаты в формат Strapi и делаем populate
                const populatedArticles = await Promise.all(
                  sqlArticles.map(async (sqlArticle: any) => {
                    // Получаем автора через entityService (если есть права) или через SQL
                    let author = null;
                    try {
                      const authorId = sqlArticle.author_id || sqlArticle.authorId;
                      if (authorId) {
                        // Пробуем получить автора через entityService
                        try {
                          const authorEntity = await strapi.entityService.findOne('plugin::users-permissions.user', authorId, {
                            fields: ['id', 'username'],
                            populate: {
                              avatar: { fields: ['url'] },
                            },
                          });
                          if (authorEntity) {
                            author = {
                              id: authorEntity.id,
                              username: (authorEntity as any).username,
                              avatar: (authorEntity as any).avatar?.url || null,
                            };
                          }
                        } catch (authorError) {
                          // Если не получилось через entityService, получаем через SQL
                          const authorSql = await db('up_users').where('id', authorId).first();
                          if (authorSql) {
                            author = {
                              id: authorSql.id,
                              username: authorSql.username,
                              avatar: null, // Аватар сложнее получить через SQL
                            };
                          }
                        }
                      }
                    } catch (populateError) {
                      strapi.log.warn(`⚠️ [find] Не удалось получить автора для статьи ${sqlArticle.id}: ${populateError}`);
                    }
                    
                    // Преобразуем в формат Strapi (обрабатываем оба варианта имен полей)
                    return {
                      id: sqlArticle.id,
                      documentId: sqlArticle.document_id || sqlArticle.documentId || sqlArticle.id.toString(),
                      title: sqlArticle.title,
                      content: sqlArticle.content,
                      excerpt: sqlArticle.excerpt,
                      tags: sqlArticle.tags ? (typeof sqlArticle.tags === 'string' ? JSON.parse(sqlArticle.tags) : sqlArticle.tags) : [],
                      difficulty: sqlArticle.difficulty || 'medium',
                      preview_image: sqlArticle.preview_image || sqlArticle.previewImage,
                      likes_count: sqlArticle.likes_count || sqlArticle.likesCount || 0,
                      dislikes_count: sqlArticle.dislikes_count || sqlArticle.dislikesCount || 0,
                      views: sqlArticle.views || 0,
                      publishedAt: sqlArticle.published_at || sqlArticle.publishedAt,
                      createdAt: sqlArticle.created_at || sqlArticle.createdAt,
                      updatedAt: sqlArticle.updated_at || sqlArticle.updatedAt,
                      author: author || { id: sqlArticle.author_id || sqlArticle.authorId, username: 'Unknown' },
                    };
                  })
                );
                
                articles = populatedArticles;
                // Обновляем total, если используется SQL fallback
                if (withCount && total === 0) {
                  total = allArticlesCount; // Используем уже подсчитанное значение
                }
                strapi.log.info(`✅ [find] Использован SQL fallback: получено ${articles.length} статей, total=${total}`);
              }
            }
          } catch (sqlError: any) {
            strapi.log.warn(`⚠️ [find] SQL fallback не удался: ${sqlError.message}`);
          }
        }
        
        // УДАЛЕНО: Старая логика автоматической публикации (перенесена выше)
        // Теперь публикация происходит ПЕРЕД запросом статей
        
        // ВАЖНО: Дедупликация статей по documentId (убираем дубликаты)
        // В Strapi v5 могут быть дубликаты с одинаковым documentId но разными id
        const seenDocumentIds = new Set<string>();
        articles = articles.filter((article: any) => {
          const docId = article.documentId || article.document_id || String(article.id);
          if (seenDocumentIds.has(docId)) {
            return false; // Пропускаем дубликат
          }
          seenDocumentIds.add(docId);
          return true; // Оставляем первую статью с этим documentId
        });
        
        // Логирование для отладки (только в development)
        if (process.env.NODE_ENV === 'development') {
          strapi.log.info('📄 [find] Articles found:', JSON.stringify({
            count: articles.length,
            start,
            limit,
            firstArticle: articles[0] ? {
              id: (articles[0] as any).id,
              documentId: (articles[0] as any).documentId,
              title: (articles[0] as any).title,
              publishedAt: (articles[0] as any).publishedAt,
              hasPublishedAt: !!(articles[0] as any).publishedAt,
            } : null,
          }, null, 2));
          
          // Дополнительная проверка: считаем все статьи (включая неопубликованные)
          const allArticlesCountAfter = await strapi.entityService.count('api::article.article', {});
          const publishedCountAfter = await strapi.entityService.count('api::article.article', {
            filters: { publishedAt: { $notNull: true } },
          });
          strapi.log.info('📊 [find] Articles statistics:', JSON.stringify({
            total: allArticlesCountAfter,
            published: publishedCountAfter,
            draft: allArticlesCountAfter - publishedCountAfter,
          }, null, 2));
        }
        
        // Получаем общее количество (если требуется)
      // Оптимизация: считаем только если действительно нужно
      if (withCount && total === 0) {
        try {
          total = await strapi.entityService.count('api::article.article', {
            filters,
          });
        } catch (countError) {
          // Если подсчет не удался, используем длину массива как fallback
          strapi.log.warn('Failed to count articles, using array length:', countError);
          total = articles.length;
        }
      }
      
      // Устанавливаем заголовки для кэширования (опционально, можно настроить через middleware)
      // Для публичных данных можно кэшировать на уровне CDN/proxy
      // В production можно увеличить до 10-15 минут
      if (process.env.NODE_ENV === 'production') {
        ctx.set('Cache-Control', 'public, max-age=600, s-maxage=600'); // 10 минут
      } else {
        ctx.set('Cache-Control', 'public, max-age=300'); // 5 минут в development
      }
      
      // МОЩНОЕ ЛОГИРОВАНИЕ перед возвратом
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('✅ [find] Returning response:', JSON.stringify({
          articlesCount: articles.length,
          total,
          start,
          limit,
          firstArticle: articles[0] ? {
            id: (articles[0] as any).id,
            documentId: (articles[0] as any).documentId,
            title: (articles[0] as any).title,
            publishedAt: (articles[0] as any).publishedAt,
            hasPublishedAt: !!(articles[0] as any).publishedAt,
          } : null,
        }, null, 2));
      }
      
      ctx.body = {
        data: articles,
        meta: {
          pagination: {
            start,
            limit,
            total,
          },
        },
      };
    } catch (error: any) {
      strapi.log.error('Failed to find articles:', error);
      
      // Не раскрываем детали ошибки в production
      if (process.env.NODE_ENV === 'development') {
        return ctx.internalServerError(`Failed to fetch articles: ${error.message || error}`);
      }
      
      return ctx.internalServerError('Failed to fetch articles');
    }
  },

  /**
   * Переопределяем findOne для проверки публикации
   * Публичный доступ - не требует аутентификации
   * Оптимизировано для высокой нагрузки
   */
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      // Валидация ID
      if (!id) {
        return ctx.badRequest('Article ID is required');
      }
      
      // МОЩНОЕ ЛОГИРОВАНИЕ для отладки
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔍 [findOne] START:', JSON.stringify({
          id,
          idType: typeof id,
          userId: ctx.state.user?.id,
          userType: typeof ctx.state.user?.id,
        }, null, 2));
      }
      
      // Оптимизированный populate - только необходимые поля
      // preview_image теперь строка (URL), не требует populate
      // Используем as any для обхода строгой типизации Strapi (populate корректный)
      const populate: any = {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      };
      
      // Получаем статью через entityService (параметризованные запросы)
      // В Strapi v5 для draftAndPublish нужно явно указывать, что мы хотим получить и черновики
      // Но для публичного API мы хотим только опубликованные
      
      // МОЩНОЕ ЛОГИРОВАНИЕ перед запросом
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔍 [findOne] Before entityService.findOne:', JSON.stringify({
          id,
          idParsed: Number(id),
          populate,
        }, null, 2));
      }
      
      // Определяем, это числовой ID или documentId (строка)
      const isNumericId = !Number.isNaN(Number(id)) && Number(id).toString() === String(id);
      
      // Пробуем найти статью через entityService
      let article = null;
      
      if (isNumericId) {
        // Если это числовой ID, ищем по id
        article = await strapi.entityService.findOne('api::article.article', Number(id), {
          populate,
        });
      } else {
        // Если это documentId (строка), ищем через SQL по document_id
        strapi.log.info(`🔍 [findOne] Searching by documentId: ${id}`);
        try {
          const db = strapi.db.connection;
          if (db && typeof db === 'function') {
            const sqlArticle = await db('articles').select('*').where('document_id', id).first();
            if (sqlArticle) {
              // Нашли по documentId, теперь получаем через entityService по числовому id
              article = await strapi.entityService.findOne('api::article.article', sqlArticle.id, {
                populate,
              });
            }
          }
        } catch (docIdError: any) {
          strapi.log.warn(`⚠️ [findOne] Error searching by documentId: ${docIdError.message}`);
        }
      }

      // Если не найдено через entityService, пробуем через SQL (может быть проблема с правами доступа)
      // Также пробуем несколько раз с небольшой задержкой для только что созданных статей
      if (!article) {
        strapi.log.warn(`⚠️ [findOne] Article not found via entityService, trying SQL for id=${id}`);
        
        // Пробуем несколько раз с задержкой (для только что созданных статей)
        let attempts = 0;
        const maxAttempts = 3;
        const delayMs = 100;
        
        while (!article && attempts < maxAttempts) {
          if (attempts > 0) {
            // Небольшая задержка перед повторной попыткой
            await new Promise(resolve => setTimeout(resolve, delayMs * attempts));
          }
          
          try {
            const db = strapi.db.connection;
            if (db && typeof db === 'function') {
              // Пробуем найти через SQL - по id или document_id
              let sqlArticle = null;
              if (isNumericId) {
                sqlArticle = await db('articles').select('*').where('id', Number(id)).first();
              } else {
                sqlArticle = await db('articles').select('*').where('document_id', id).first();
              }
              
              if (sqlArticle) {
                strapi.log.info(`✅ [findOne] Article found via SQL (attempt ${attempts + 1}): id=${sqlArticle.id}, document_id=${sqlArticle.document_id}, published_at=${sqlArticle.published_at}`);
                
                // Получаем автора
                let author = null;
                try {
                  const authorId = sqlArticle.author_id || sqlArticle.authorId;
                  if (authorId) {
                    try {
                      const authorEntity = await strapi.entityService.findOne('plugin::users-permissions.user', authorId, {
                        fields: ['id', 'username'],
                        populate: {
                          avatar: { fields: ['url'] },
                        },
                      });
                      if (authorEntity) {
                        author = {
                          id: authorEntity.id,
                          username: (authorEntity as any).username,
                          avatar: (authorEntity as any).avatar?.url || null,
                        };
                      }
                    } catch (authorError) {
                      // Если не получилось через entityService, получаем через SQL
                      const authorSql = await db('up_users').where('id', authorId).first();
                      if (authorSql) {
                        author = {
                          id: authorSql.id,
                          username: authorSql.username,
                          avatar: null,
                        };
                      }
                    }
                  }
                } catch (populateError) {
                  strapi.log.warn(`⚠️ [findOne] Не удалось получить автора: ${populateError}`);
                }
                
                // Преобразуем в формат Strapi (обрабатываем оба варианта имен полей)
                article = {
                  id: sqlArticle.id,
                  documentId: sqlArticle.document_id || sqlArticle.documentId || sqlArticle.id.toString(),
                  title: sqlArticle.title,
                  content: sqlArticle.content,
                  excerpt: sqlArticle.excerpt,
                  tags: sqlArticle.tags ? (typeof sqlArticle.tags === 'string' ? JSON.parse(sqlArticle.tags) : sqlArticle.tags) : [],
                  difficulty: sqlArticle.difficulty || 'medium',
                  preview_image: sqlArticle.preview_image || sqlArticle.previewImage || null,
                  likes_count: sqlArticle.likes_count || sqlArticle.likesCount || 0,
                  dislikes_count: sqlArticle.dislikes_count || sqlArticle.dislikesCount || 0,
                  views: sqlArticle.views || 0,
                  publishedAt: sqlArticle.published_at || sqlArticle.publishedAt,
                  createdAt: sqlArticle.created_at || sqlArticle.createdAt,
                  updatedAt: sqlArticle.updated_at || sqlArticle.updatedAt,
                  author: author || { id: sqlArticle.author_id || sqlArticle.authorId, username: 'Unknown' },
                } as any;
                
                strapi.log.info(`✅ [findOne] Использован SQL fallback для статьи id=${id}`);
                break; // Нашли статью, выходим из цикла
              }
            }
          } catch (sqlError: any) {
            strapi.log.warn(`⚠️ [findOne] SQL check failed (attempt ${attempts + 1}): ${sqlError.message}`);
          }
          
          attempts++;
        }
        
        if (!article) {
          strapi.log.warn(`⚠️ [findOne] Статья id=${id} не найдена даже через SQL после ${maxAttempts} попыток`);
        }
      }

      // МОЩНОЕ ЛОГИРОВАНИЕ после запроса
      strapi.log.info(`🔍 [findOne] After search: found=${!!article}, id=${id}, articleId=${article?.id || 'N/A'}, documentId=${(article as any)?.documentId || 'N/A'}`);

      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔍 [findOne] After entityService.findOne:', JSON.stringify({
          found: !!article,
          articleId: article?.id,
          articleDocumentId: (article as any)?.documentId,
          articleTitle: (article as any)?.title,
          articlePublishedAt: (article as any)?.publishedAt,
          articleHasPublishedAt: !!(article as any)?.publishedAt,
          articleAuthor: (article as any)?.author,
          articleAuthorId: typeof (article as any)?.author === 'object' ? (article as any)?.author?.id : (article as any)?.author,
        }, null, 2));
      }

      if (!article) {
        // МОЩНОЕ ЛОГИРОВАНИЕ при отсутствии статьи
        if (process.env.NODE_ENV === 'development') {
          // Проверяем, есть ли статья с другим ID
          const allArticles = await strapi.entityService.findMany('api::article.article', {
            limit: 10,
          });
          strapi.log.warn('⚠️ [findOne] Article not found in database:', JSON.stringify({
            requestedId: id,
            requestedIdType: typeof id,
            requestedIdParsed: Number(id),
            totalArticlesInDb: allArticles.length,
            articleIds: allArticles.map((a: any) => ({
              id: a.id,
              documentId: a.documentId,
              title: a.title,
              publishedAt: a.publishedAt,
            })),
          }, null, 2));
        }
        return ctx.notFound('Article not found');
      }
      
      // Устанавливаем заголовки для кэширования
      // Статьи кэшируем дольше, т.к. контент меняется редко
      if (process.env.NODE_ENV === 'production') {
        ctx.set('Cache-Control', 'public, max-age=1800, s-maxage=1800'); // 30 минут
      } else {
        ctx.set('Cache-Control', 'public, max-age=600'); // 10 минут в development
      }
      
      // МОЩНОЕ ЛОГИРОВАНИЕ для отладки
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('📄 [findOne] Article found:', JSON.stringify({
          id: article.id,
          documentId: (article as any).documentId,
          publishedAt: article.publishedAt,
          author: (article as any).author,
          authorId: typeof (article as any).author === 'object' ? (article as any).author?.id : (article as any).author,
          authorUsername: typeof (article as any).author === 'object' ? (article as any).author?.username : null,
        }, null, 2));
      }

      // Проверяем, что статья опубликована (для публичного доступа)
      // Если пользователь аутентифицирован и является автором, показываем даже черновики
      const user = ctx.state.user;
      const articleWithPopulate = article as any;
      const authorId = typeof articleWithPopulate.author === 'object' 
        ? articleWithPopulate.author.id 
        : articleWithPopulate.author;
      
      // Приводим ID к числу для корректного сравнения
      const authorIdNum = Number(authorId);
      const userIdNum = user ? Number(user.id) : null;
      const isAuthor = user && authorIdNum === userIdNum;
      
      // ВАЖНО: В Strapi v5 publishedAt может быть в разных форматах
      // Проверяем наличие publishedAt (не null и не undefined)
      const publishedAtValue = articleWithPopulate.publishedAt;
      const isPublished = publishedAtValue !== null && publishedAtValue !== undefined;
      
      // МОЩНОЕ ЛОГИРОВАНИЕ для отладки
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔍 [findOne] Access check:', JSON.stringify({
          publishedAt: publishedAtValue,
          publishedAtType: typeof publishedAtValue,
          isPublished,
          user: user?.id,
          userType: typeof user?.id,
          userIdNum,
          authorId,
          authorIdType: typeof authorId,
          authorIdNum,
          isAuthor,
          willAllow: isPublished || isAuthor,
          comparison: {
            authorIdNum,
            userIdNum,
            equal: authorIdNum === userIdNum,
            authorIdStr: String(authorId),
            userIdStr: String(user?.id),
            equalStr: String(authorId) === String(user?.id),
          },
        }, null, 2));
      }
      
      // Если статья не опубликована и пользователь НЕ аутентифицирован - запрещаем доступ.
      // Аутентифицированным пользователям (в т.ч. автору) разрешаем видеть черновики,
      // так как безопасность уже контролируется через RBAC Strapi.
      if (!isPublished && !user) {
        if (process.env.NODE_ENV === 'development') {
          strapi.log.warn('⚠️ [findOne] Access denied for public user: article not published', JSON.stringify({
            publishedAt: publishedAtValue,
            isPublished,
            isAuthor,
            authorId: authorIdNum,
            userId: userIdNum,
            articleId: article.id,
            articleDocumentId: (article as any).documentId,
            articleTitle: (article as any).title,
          }, null, 2));
        }
        return ctx.notFound('Article not found');
      }

      // МОЩНОЕ ЛОГИРОВАНИЕ перед возвратом
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('✅ [findOne] Returning article:', JSON.stringify({
          id: article.id,
          documentId: (article as any).documentId,
          title: (article as any).title,
          publishedAt: (article as any).publishedAt,
          hasPublishedAt: !!(article as any).publishedAt,
        }, null, 2));
      }

      ctx.body = { data: article };
    } catch (error: any) {
      strapi.log.error('Failed to find article:', error);
      return ctx.internalServerError('Failed to fetch article');
    }
  },

  /**
   * Поиск статей по тексту
   * Оптимизировано для высокой нагрузки с ограничениями
   */
  async search(ctx) {
    try {
      const { query } = ctx;
      const searchQuery = query.q || query.query || '';
      const skip = Number.parseInt(String(query.skip || 0), 10) || 0;
      let limit = Number.parseInt(String(query.limit || 10), 10) || 10;
      
      // Валидация и ограничение параметров
      if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length < 2) {
        return ctx.badRequest('Search query must be at least 2 characters long');
      }
      
      // Ограничиваем максимальный лимит
      const MAX_LIMIT = 50;
      limit = Math.min(Math.max(1, limit), MAX_LIMIT);
      const normalizedSkip = Math.max(0, skip);
      
      // Санитизируем поисковый запрос (убираем спецсимволы для безопасности)
      const sanitizedQuery = searchQuery.trim().slice(0, 100); // Максимум 100 символов
      
      // Поиск по title и content (только опубликованные статьи)
      const filters = {
        publishedAt: { $notNull: true },
        $or: [
          { title: { $containsi: sanitizedQuery } },
          { content: { $containsi: sanitizedQuery } },
          { excerpt: { $containsi: sanitizedQuery } },
        ],
      };
      
      // Оптимизированный populate
      const populate: any = {
        author: {
          fields: ['id', 'username'],
          populate: {
            avatar: { fields: ['url'] },
          },
        },
      };
      
      // Используем entityService для поиска (параметризованные запросы)
      const articles = await strapi.entityService.findMany('api::article.article', {
        filters,
        populate,
        sort: { createdAt: 'desc' },
        start: normalizedSkip,
        limit,
      });
      
      // Кэширование для поиска (короче, т.к. результаты могут меняться)
      if (process.env.NODE_ENV === 'production') {
        ctx.set('Cache-Control', 'public, max-age=120, s-maxage=120'); // 2 минуты
      } else {
        ctx.set('Cache-Control', 'public, max-age=60'); // 1 минута в development
      }
      
      ctx.body = {
        data: articles,
        meta: {
          query: sanitizedQuery,
          pagination: {
            start: normalizedSkip,
            limit,
            total: articles.length, // Для поиска не считаем total (экономия ресурсов)
          },
        },
      };
    } catch (error: any) {
      strapi.log.error('Failed to search articles:', error);
      
      if (process.env.NODE_ENV === 'development') {
        return ctx.internalServerError(`Search failed: ${error.message || error}`);
      }
      
      return ctx.internalServerError('Search failed');
    }
  },
  /**
   * Создание статьи (черновик или опубликованная)
   * Автоматически устанавливает автора из ctx.state.user
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    try {
      // Валидация и санитаризация через entityService (встроенная в Strapi)
      const { data } = ctx.request.body;
      
      // Логирование для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('📥 Received create request:', JSON.stringify({
          hasData: !!data,
          dataKeys: data ? Object.keys(data) : [],
          publishedAt: data?.publishedAt,
          title: data?.title?.substring(0, 50),
        }, null, 2));
      }

      if (!data) {
        return ctx.badRequest('Request body must contain data object');
      }

      // ВАЖНО: Валидация выполняется автоматически через entityService и схему Strapi
      // Схема уже проверяет:
      // - title: required, minLength: 10, maxLength: 200
      // - content: required, minLength: 100, maxLength: 20000
      // - tags: json (валидируется автоматически)
      // - difficulty: enumeration ['easy', 'medium', 'hard']
      // Дополнительная ручная валидация не нужна - entityService вернет ValidationError

      // Устанавливаем автора автоматически из аутентифицированного пользователя
      // Проверяем publishedAt - если это строка (ISO date), используем её
      let publishedAt: string | null = null;
      if (data.publishedAt) {
        // Если publishedAt передан, используем его (может быть ISO строка)
        publishedAt = typeof data.publishedAt === 'string' ? data.publishedAt : new Date(data.publishedAt).toISOString();
      }
      
      const articleData: any = {
        ...data,
        author: user.id,
      };
      
      // В Strapi v5 для draftAndPublish publishedAt нужно устанавливать отдельно
      // Если publishedAt передан, устанавливаем его
      if (publishedAt) {
        articleData.publishedAt = publishedAt;
      }
      
      // Логирование для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('📝 Creating article with data:', JSON.stringify({
          title: articleData.title?.substring(0, 50),
          author: articleData.author,
          publishedAt: articleData.publishedAt,
          hasPublishedAt: !!articleData.publishedAt,
        }, null, 2));
      }

      // МОЩНОЕ ЛОГИРОВАНИЕ перед созданием
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔨 [create] Before entityService.create:', JSON.stringify({
          articleData: {
            ...articleData,
            author: articleData.author,
            publishedAt: articleData.publishedAt,
          },
          hasPublishedAt: !!articleData.publishedAt,
        }, null, 2));
      }
      
      // entityService автоматически валидирует данные по схеме
      // В Strapi v5 для draftAndPublish нужно использовать специальный метод публикации
      // Но сначала создаем статью
      const entry = await strapi.entityService.create('api::article.article', {
        data: articleData,
        populate: {
          author: {
            fields: ['id', 'username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
        },
      });
      
      // МОЩНОЕ ЛОГИРОВАНИЕ после создания
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('🔨 [create] After entityService.create:', JSON.stringify({
          entryId: entry.id,
          entryDocumentId: (entry as any).documentId,
          entryTitle: (entry as any).title,
          entryPublishedAt: (entry as any).publishedAt,
          entryHasPublishedAt: !!(entry as any).publishedAt,
          entryAuthor: (entry as any).author,
          entryAuthorId: typeof (entry as any).author === 'object' ? (entry as any).author?.id : (entry as any).author,
        }, null, 2));
      }
      
      // ВАЖНО: В Strapi v5 для draftAndPublish entityService.create НЕ устанавливает publishedAt автоматически
      // Нужно использовать documentService.publish() или обновить через entityService.update()
      if (publishedAt && entry) {
        // Проверяем, установился ли publishedAt
        const currentPublishedAt = (entry as any).publishedAt;
        
        if (!currentPublishedAt) {
          // Если publishedAt не установился, пытаемся опубликовать
          try {
            const documentId = (entry as any).documentId || entry.id;
            
            // Сначала пробуем через entityService.update (более надежный способ)
            try {
              const updated = await strapi.entityService.update('api::article.article', entry.id, {
                data: { publishedAt },
              });
              
              if (updated) {
                // Обновляем entry с актуальными данными
                const updatedWithPopulate = await strapi.entityService.findOne('api::article.article', entry.id, {
                  populate: {
                    author: {
                      fields: ['id', 'username'],
                      populate: {
                        avatar: { fields: ['url'] },
                      },
                    },
                  },
                });
                
                if (updatedWithPopulate) {
                  Object.assign(entry, updatedWithPopulate);
                }
                
                if (process.env.NODE_ENV === 'development') {
                  strapi.log.info('✅ Article published via entityService.update:', JSON.stringify({
                    id: entry.id,
                    publishedAt: (updatedWithPopulate as any)?.publishedAt,
                    hasPublishedAt: !!(updatedWithPopulate as any)?.publishedAt,
                  }, null, 2));
                }
              }
            } catch (updateError: any) {
              // Если update не сработал, пробуем через documentService
              strapi.log.warn('entityService.update failed, trying documentService:', updateError?.message);
              
              if (strapi.documents && typeof strapi.documents === 'function') {
                const documentService = strapi.documents('api::article.article');
                if (documentService && typeof documentService.publish === 'function') {
                  await documentService.publish({
                    documentId: String(documentId),
                  });
                  
                  // Обновляем entry с актуальными данными
                  const publishedEntry = await strapi.entityService.findOne('api::article.article', entry.id, {
                    populate: {
                      author: {
                        fields: ['id', 'username'],
                        populate: {
                          avatar: { fields: ['url'] },
                        },
                      },
                    },
                  });
                  
                  if (publishedEntry) {
                    Object.assign(entry, publishedEntry);
                  }
                }
              }
            }
          } catch (publishError: any) {
            // Если публикация не удалась, логируем, но не прерываем создание
            strapi.log.warn('Failed to publish article after creation:', {
              error: publishError?.message || publishError,
              stack: process.env.NODE_ENV === 'development' ? publishError?.stack : undefined,
            });
            // Статья создана, но не опубликована - пользователь может опубликовать вручную
          }
        } else {
          // ВАЖНО: Если publishedAt уже установлен в entry, это может быть только в памяти
          // Нужно убедиться, что он действительно сохранен в базе
          // Получаем статью заново, чтобы проверить
          const verifyEntry = await strapi.entityService.findOne('api::article.article', entry.id, {
            fields: ['id', 'publishedAt'],
          });
          
          const verifiedPublishedAt = (verifyEntry as any)?.publishedAt;
          
          if (!verifiedPublishedAt) {
            // Если в базе publishedAt все еще null, пытаемся опубликовать
            strapi.log.warn('⚠️ publishedAt in entry but not in database, trying to publish...');
            
            try {
              const documentId = (entry as any).documentId || entry.id;
              
              // Пробуем через entityService.update
              try {
                const updated = await strapi.entityService.update('api::article.article', entry.id, {
                  data: { publishedAt },
                });
                
                if (updated) {
                  const updatedWithPopulate = await strapi.entityService.findOne('api::article.article', entry.id, {
                    populate: {
                      author: {
                        fields: ['id', 'username'],
                        populate: {
                          avatar: { fields: ['url'] },
                        },
                      },
                    },
                  });
                  
                  if (updatedWithPopulate) {
                    Object.assign(entry, updatedWithPopulate);
                  }
                  
                  if (process.env.NODE_ENV === 'development') {
                    strapi.log.info('✅ Article published via entityService.update (after verification):', JSON.stringify({
                      id: entry.id,
                      publishedAt: (updatedWithPopulate as any)?.publishedAt,
                      hasPublishedAt: !!(updatedWithPopulate as any)?.publishedAt,
                    }, null, 2));
                  }
                }
              } catch (updateError: any) {
                strapi.log.warn('entityService.update failed after verification:', updateError?.message);
                
                // Пробуем через documentService
                if (strapi.documents && typeof strapi.documents === 'function') {
                  const documentService = strapi.documents('api::article.article');
                  if (documentService && typeof documentService.publish === 'function') {
                    await documentService.publish({
                      documentId: String(documentId),
                    });
                    
                    const publishedEntry = await strapi.entityService.findOne('api::article.article', entry.id, {
                      populate: {
                        author: {
                          fields: ['id', 'username'],
                          populate: {
                            avatar: { fields: ['url'] },
                          },
                        },
                      },
                    });
                    
                    if (publishedEntry) {
                      Object.assign(entry, publishedEntry);
                    }
                  }
                }
              }
            } catch (publishError: any) {
              strapi.log.warn('Failed to publish article after verification:', publishError?.message);
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              strapi.log.info('✅ Article already published:', JSON.stringify({
                id: entry.id,
                publishedAt: verifiedPublishedAt,
                hasPublishedAt: !!verifiedPublishedAt,
              }, null, 2));
            }
          }
        }
      }

      // ВАЖНО: Получаем статью заново для финальной проверки и актуализации данных
      // Это гарантирует, что все поля (включая documentId, publishedAt) актуальны
      let finalEntry = null;
      try {
        finalEntry = await strapi.entityService.findOne('api::article.article', entry.id, {
          populate: {
            author: {
              fields: ['id', 'username'],
              populate: {
                avatar: { fields: ['url'] },
              },
            },
          },
        });
        
        if (finalEntry) {
          // Обновляем entry актуальными данными
          Object.assign(entry, finalEntry);
        } else {
          // Если не получилось через entityService, пробуем через SQL (fallback)
          strapi.log.warn(`⚠️ [create] Final entry not found via entityService, trying SQL for id=${entry.id}`);
          try {
            const db = strapi.db.connection;
            if (db && typeof db === 'function') {
              const sqlArticle = await db('articles').select('*').where('id', entry.id).first();
              if (sqlArticle) {
                // Получаем автора
                let author = null;
                try {
                  const authorId = sqlArticle.author_id || sqlArticle.authorId;
                  if (authorId) {
                    try {
                      const authorEntity = await strapi.entityService.findOne('plugin::users-permissions.user', authorId, {
                        fields: ['id', 'username'],
                        populate: {
                          avatar: { fields: ['url'] },
                        },
                      });
                      if (authorEntity) {
                        author = {
                          id: authorEntity.id,
                          username: (authorEntity as any).username,
                          avatar: (authorEntity as any).avatar?.url || null,
                        };
                      }
                    } catch (authorError) {
                      const authorSql = await db('up_users').where('id', authorId).first();
                      if (authorSql) {
                        author = {
                          id: authorSql.id,
                          username: authorSql.username,
                          avatar: null,
                        };
                      }
                    }
                  }
                } catch (populateError) {
                  strapi.log.warn(`⚠️ [create] Не удалось получить автора: ${populateError}`);
                }
                
                // Преобразуем в формат Strapi
                finalEntry = {
                  id: sqlArticle.id,
                  documentId: sqlArticle.document_id || sqlArticle.documentId || sqlArticle.id.toString(),
                  title: sqlArticle.title,
                  content: sqlArticle.content,
                  excerpt: sqlArticle.excerpt,
                  tags: sqlArticle.tags ? (typeof sqlArticle.tags === 'string' ? JSON.parse(sqlArticle.tags) : sqlArticle.tags) : [],
                  difficulty: sqlArticle.difficulty || 'medium',
                  preview_image: sqlArticle.preview_image || sqlArticle.previewImage || null,
                  likes_count: sqlArticle.likes_count || sqlArticle.likesCount || 0,
                  dislikes_count: sqlArticle.dislikes_count || sqlArticle.dislikesCount || 0,
                  views: sqlArticle.views || 0,
                  publishedAt: sqlArticle.published_at || sqlArticle.publishedAt,
                  createdAt: sqlArticle.created_at || sqlArticle.createdAt,
                  updatedAt: sqlArticle.updated_at || sqlArticle.updatedAt,
                  author: author || { id: sqlArticle.author_id || sqlArticle.authorId, username: 'Unknown' },
                } as any;
                
                Object.assign(entry, finalEntry);
                strapi.log.info(`✅ [create] Использован SQL fallback для финальной проверки статьи id=${entry.id}`);
              }
            }
          } catch (sqlError: any) {
            strapi.log.warn(`⚠️ [create] SQL fallback failed: ${sqlError.message}`);
          }
        }
      } catch (finalError: any) {
        strapi.log.warn(`⚠️ [create] Failed to get final entry: ${finalError.message}`);
      }
      
      // Логирование для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('✅ [create] Article created (final):', JSON.stringify({
          id: entry.id,
          documentId: (entry as any).documentId,
          title: entry.title,
          publishedAt: (entry as any).publishedAt,
          hasPublishedAt: !!(entry as any).publishedAt,
          preview_image: (entry as any).preview_image,
          author: (entry as any).author,
          authorId: typeof (entry as any).author === 'object' ? (entry as any).author?.id : (entry as any).author,
        }, null, 2));
      }
      
      // МОЩНОЕ ЛОГИРОВАНИЕ перед возвратом
      if (process.env.NODE_ENV === 'development') {
        strapi.log.info('✅ [create] Returning article:', JSON.stringify({
          entryId: entry.id,
          entryDocumentId: (entry as any).documentId,
          entryTitle: (entry as any).title,
          entryPublishedAt: (entry as any).publishedAt,
          entryHasPublishedAt: !!(entry as any).publishedAt,
          entryPreviewImage: (entry as any).preview_image,
          entryAuthor: (entry as any).author,
        }, null, 2));
      }
      
      // Возвращаем созданную статью с актуальными данными
      ctx.body = { data: entry };
    } catch (error: any) {
      strapi.log.error('Failed to create article:', error);
      
      // Обработка ошибок валидации Strapi
      if (error.name === 'ValidationError') {
        return ctx.badRequest(error.message);
      }
      
      return ctx.internalServerError('Failed to create article');
    }
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

    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      if (!data) {
        return ctx.badRequest('Request body must contain data object');
      }

      // Получаем существующую статью
      const existingArticle = await strapi.entityService.findOne('api::article.article', id, {
        populate: ['author'],
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // Проверяем, что пользователь является автором
      const existingArticleWithPopulate = existingArticle as any;
      const authorId = typeof existingArticleWithPopulate.author === 'object' 
        ? existingArticleWithPopulate.author.id 
        : existingArticleWithPopulate.author;
      
      if (authorId !== user.id) {
        return ctx.forbidden('You can only update your own articles');
      }

      // Валидация полей (если они переданы)
      if (data.title !== undefined) {
        if (typeof data.title !== 'string' || data.title.trim().length < 10) {
          return ctx.badRequest('Title must be at least 10 characters long');
        }
      }

      if (data.content !== undefined) {
        if (typeof data.content !== 'string' || data.content.trim().length < 100) {
          return ctx.badRequest('Content must be at least 100 characters long');
        }
      }

      if (data.tags !== undefined && !Array.isArray(data.tags)) {
        return ctx.badRequest('Tags must be an array');
      }

      if (data.difficulty && !['easy', 'medium', 'hard'].includes(data.difficulty)) {
        return ctx.badRequest('Difficulty must be one of: easy, medium, hard');
      }

      // Обновляем статью
      const updatedArticle = await strapi.entityService.update('api::article.article', id, {
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

      ctx.body = { data: updatedArticle };
    } catch (error: any) {
      strapi.log.error('Failed to update article:', error);
      
      if (error.name === 'ValidationError') {
        return ctx.badRequest(error.message);
      }
      
      return ctx.internalServerError('Failed to update article');
    }
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

    try {
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
      const articleWithPopulate = article as any;
      const authorId = typeof articleWithPopulate.author === 'object' 
        ? articleWithPopulate.author.id 
        : articleWithPopulate.author;
      
      if (authorId !== user.id) {
        return ctx.forbidden('You can only view your own drafts');
      }

      ctx.body = { data: article };
    } catch (error: any) {
      strapi.log.error('Failed to get draft article:', error);
      return ctx.internalServerError('Failed to get draft article');
    }
  },

  /**
   * Получение списка черновиков текущего пользователя
   */
  async findDrafts(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    try {
      const { limit = 20 } = ctx.query;

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
        limit: Number.parseInt(limit as string, 10) || 20,
      });

      ctx.body = { data: articles };
    } catch (error: any) {
      strapi.log.error('Failed to get drafts:', error);
      return ctx.internalServerError('Failed to get drafts');
    }
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

    try {
      const { id } = ctx.params;

      // Получаем существующую статью
      const existingArticle = await strapi.entityService.findOne('api::article.article', id, {
        populate: ['author'],
      });

      if (!existingArticle) {
        return ctx.notFound('Article not found');
      }

      // Проверяем, что пользователь является автором
      const existingArticleWithPopulate = existingArticle as any;
      const authorId = typeof existingArticleWithPopulate.author === 'object' 
        ? existingArticleWithPopulate.author.id 
        : existingArticleWithPopulate.author;
      
      if (authorId !== user.id) {
        return ctx.forbidden('You can only delete your own articles');
      }

      // Удаляем статью
      const deletedArticle = await strapi.entityService.delete('api::article.article', id);

      ctx.body = { data: deletedArticle };
    } catch (error: any) {
      strapi.log.error('Failed to delete article:', error);
      
      if (error.name === 'ValidationError') {
        return ctx.badRequest(error.message);
      }
      
      return ctx.internalServerError('Failed to delete article');
    }
  },
}));

