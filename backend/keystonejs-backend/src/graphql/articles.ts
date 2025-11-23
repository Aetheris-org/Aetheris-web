/**
 * Custom GraphQL queries for articles filtering and search
 * Кастомные GraphQL queries для фильтрации и поиска статей
 */
import { graphql } from '@keystone-6/core';
import logger from '../lib/logger';
import { z } from 'zod';

// Валидация входных параметров через Zod
export const SearchArticlesInputSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced']).optional(),
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
  skip: z.number().int().min(0).optional(),
  take: z.number().int().min(1).max(100).optional(),
});

// Функция для извлечения текста из Slate document
// Рекурсивно извлекает весь текст из всех узлов документа
export function extractTextFromSlateDocument(document: any): string {
  if (!document) return '';
  
  let text = '';
  
  // Рекурсивная функция для обхода узлов
  const extractTextFromNode = (node: any): void => {
    if (!node) return;
    
    // Если узел содержит текст напрямую
    if (typeof node === 'string') {
      text += node + ' ';
      return;
    }
    
    // Если узел - это объект с текстом
    if (typeof node === 'object') {
      if (node.text && typeof node.text === 'string') {
        text += node.text + ' ';
      }
      
      // Рекурсивно обрабатываем children
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          extractTextFromNode(child);
        }
      } else if (node.children) {
        extractTextFromNode(node.children);
      }
    }
  };
  
  // Обрабатываем document
  if (Array.isArray(document)) {
    for (const node of document) {
      extractTextFromNode(node);
    }
  } else if (typeof document === 'object') {
    // Если document это объект с children
    if (Array.isArray(document.children)) {
      for (const node of document.children) {
        extractTextFromNode(node);
      }
    } else {
      extractTextFromNode(document);
    }
  }
  
  return text.trim();
}

// Функция для проверки, содержит ли массив тегов все указанные теги
export function hasAllTags(articleTags: any, filterTags: string[]): boolean {
  if (!Array.isArray(articleTags) || filterTags.length === 0) {
    return filterTags.length === 0;
  }
  
  // Нормализуем теги (приводим к нижнему регистру для сравнения)
  const normalizedArticleTags = articleTags.map((tag: string) => 
    String(tag).toLowerCase().trim()
  );
  const normalizedFilterTags = filterTags.map(tag => tag.toLowerCase().trim());
  
  // Проверяем, что все теги из фильтра присутствуют в статье
  return normalizedFilterTags.every(filterTag => 
    normalizedArticleTags.includes(filterTag)
  );
}

// Функция для проверки, содержит ли текст поисковый запрос
export function matchesSearch(text: string, searchQuery: string): boolean {
  // Если поисковый запрос пустой, не фильтруем (возвращаем true)
  if (!searchQuery || searchQuery.trim().length === 0) return true;
  
  // Если текст пустой, он не может совпадать с поисковым запросом (возвращаем false)
  if (!text || text.trim().length === 0) return false;
  
  const normalizedText = text.toLowerCase().trim();
  const normalizedSearch = searchQuery.toLowerCase().trim();
  
  // Проверяем, содержит ли текст поисковый запрос
  return normalizedText.includes(normalizedSearch);
}

// Вспомогательная функция для фильтрации и поиска статей
export async function searchAndFilterArticles(
  context: any,
  args: {
    search?: string;
    tags?: string[];
    difficulty?: string;
    sort?: string;
    skip?: number;
    take?: number;
  }
) {
  // Валидация входных параметров
  const validatedArgs = SearchArticlesInputSchema.parse({
    search: args.search || undefined,
    tags: args.tags || undefined,
    difficulty: args.difficulty || undefined,
    sort: args.sort || 'newest',
    skip: args.skip || 0,
    take: args.take || 10,
  });

  logger.info('[searchArticles] Query received:', {
    search: validatedArgs.search,
    tags: validatedArgs.tags,
    difficulty: validatedArgs.difficulty,
    sort: validatedArgs.sort,
    skip: validatedArgs.skip,
    take: validatedArgs.take,
  });

  // Строим базовый where фильтр для KeystoneJS
  const where: any = {
    publishedAt: { not: null },
  };

  // Фильтрация по difficulty (если указана)
  if (validatedArgs.difficulty) {
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Маппинг старых значений на новые для обратной совместимости
    // На фронтенде уже происходит маппинг (beginner -> easy, etc.), но на случай если придет старое значение
    let difficultyValue = validatedArgs.difficulty;
    const originalValue = difficultyValue;
    
    // Маппинг для обратной совместимости (если придет старое значение)
    if (difficultyValue === 'beginner') {
      difficultyValue = 'easy';
    } else if (difficultyValue === 'intermediate') {
      difficultyValue = 'medium';
    } else if (difficultyValue === 'advanced') {
      difficultyValue = 'hard';
    }
    // Если значение уже замаплено (easy, medium, hard), оставляем как есть
    
    logger.debug(`[searchArticles] Difficulty filter:`, {
      original: originalValue,
      mapped: difficultyValue,
      whereFilter: { equals: difficultyValue },
    });
    
    where.difficulty = { equals: difficultyValue };
  }

  // Получаем все опубликованные статьи с базовыми фильтрами
  // Для фильтрации по тегам и поиску по содержимому используем программную фильтрацию
  // ВАЖНО: Используем sudo() для обхода access control и получения всех полей
  // ИСПРАВЛЕНИЕ: Явно запрашиваем author в query, чтобы избежать автоматической загрузки с неправильным полем
  // KeystoneJS пытается использовать articlesId для загрузки авторов, но такого поля нет в Prisma
  // Явный запрос author предотвращает эту проблему
  const allArticles = await context.sudo().query.Article.findMany({
    where,
    query: `
      id
      title
      content {
        document
      }
      excerpt
      author {
        id
        username
        avatar
      }
      previewImage
      tags
      difficulty
      likes_count
      dislikes_count
      views
      publishedAt
      createdAt
      updatedAt
      userReaction
    `,
  });

  logger.debug(`[searchArticles] Found ${allArticles.length} articles before filtering`);
  
  // Логирование для отладки difficulty фильтра
  if (validatedArgs.difficulty) {
    const difficultyCounts = allArticles.reduce((acc: any, article: any) => {
      const diff = article.difficulty || 'unknown';
      acc[diff] = (acc[diff] || 0) + 1;
      return acc;
    }, {});
    logger.debug(`[searchArticles] Articles by difficulty before filter:`, difficultyCounts);
  }

  // Программная фильтрация по тегам и поиску
  let filteredArticles = allArticles;

  // Фильтрация по тегам
  if (validatedArgs.tags && validatedArgs.tags.length > 0) {
    filteredArticles = filteredArticles.filter((article: any) => 
      hasAllTags(article.tags, validatedArgs.tags!)
    );
    logger.debug(`[searchArticles] After tags filter: ${filteredArticles.length} articles`);
  }

  // Фильтрация по поисковому запросу
  if (validatedArgs.search && validatedArgs.search.trim().length > 0) {
    const searchQuery = validatedArgs.search.trim();
    logger.debug(`[searchArticles] Filtering by search query: "${searchQuery}"`);
    
    filteredArticles = filteredArticles.filter((article: any) => {
      // Поиск по title
      const titleMatch = matchesSearch(article.title || '', searchQuery);
      
      // Поиск по excerpt
      const excerptMatch = matchesSearch(article.excerpt || '', searchQuery);
      
      // Поиск по содержимому (извлекаем текст из Slate document)
      let contentMatch = false;
      let contentText = '';
      if (article.content && article.content.document) {
        contentText = extractTextFromSlateDocument(article.content.document);
        contentMatch = matchesSearch(contentText, searchQuery);
      }
      
      const matches = titleMatch || excerptMatch || contentMatch;
      
      // Логирование для отладки (только для первых нескольких статей)
      if (filteredArticles.indexOf(article) < 3) {
        logger.debug(`[searchArticles] Article "${article.title?.substring(0, 50)}...":`, {
          titleMatch,
          excerptMatch,
          contentMatch,
          contentTextLength: contentText.length,
          matches,
        });
      }
      
      return matches;
    });
    logger.debug(`[searchArticles] After search filter: ${filteredArticles.length} articles`);
  }

  // Сортировка
  let sortedArticles = [...filteredArticles];
  if (validatedArgs.sort === 'newest') {
    sortedArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
  } else if (validatedArgs.sort === 'oldest') {
    sortedArticles.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateA - dateB;
    });
  } else if (validatedArgs.sort === 'popular') {
    sortedArticles.sort((a, b) => {
      const likesA = (a.likes_count || 0) - (a.dislikes_count || 0);
      const likesB = (b.likes_count || 0) - (b.dislikes_count || 0);
      return likesB - likesA;
    });
  }

  // Пагинация
  const total = sortedArticles.length;
  const skip = validatedArgs.skip || 0;
  const take = validatedArgs.take || 10;
  const paginatedArticles = sortedArticles.slice(skip, skip + take);

  // ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
  logger.debug('[searchArticles] Paginated articles:', {
    count: paginatedArticles.length,
    firstArticle: paginatedArticles[0] ? {
      id: paginatedArticles[0].id,
      idType: typeof paginatedArticles[0].id,
      hasAuthor: !!paginatedArticles[0].author,
      authorId: paginatedArticles[0].author?.id,
      authorIdType: typeof paginatedArticles[0].author?.id,
    } : null,
  });

  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Загружаем полные объекты статей через context.query.Article.findOne
  // Это заставляет KeystoneJS использовать правильные связи для загрузки всех связанных данных
  // Вместо того, чтобы возвращать частичные объекты и позволять KeystoneJS автоматически загружать связанные данные
  // (что приводит к ошибке с articlesId), мы загружаем полные объекты через правильные связи
  
  const serializedArticles = await Promise.all(
    paginatedArticles.map(async (article) => {
      const articleId = typeof article.id === 'string' 
        ? parseInt(article.id, 10) 
        : article.id;
      
      if (!articleId || isNaN(articleId)) {
        logger.warn(`[searchArticles] Invalid article ID: ${article.id}`);
        return null;
      }
      
      try {
        // Загружаем полный объект статьи через правильную связь
        // KeystoneJS автоматически загрузит author через правильную связь (articles relation filter)
        const fullArticle = await context.sudo().query.Article.findOne({
          where: { id: String(articleId) },
          query: `
            id
            title
            content {
              document
            }
            excerpt
            author {
              id
              username
              avatar
            }
            previewImage
            tags
            difficulty
            likes_count
            dislikes_count
            views
            publishedAt
            createdAt
            updatedAt
            comments {
              id
            }
            userReaction
          `,
        });
        
        if (!fullArticle) {
          logger.warn(`[searchArticles] Article ${articleId} not found`);
          return null;
        }
        
        // Преобразуем ID в число для правильной работы с Prisma
        const serialized: any = {
          ...fullArticle,
          id: articleId,
        };
        
        // Преобразуем author.id в число, если он есть
        if (serialized.author && serialized.author.id) {
          const authorId = typeof serialized.author.id === 'string' 
            ? parseInt(serialized.author.id, 10) 
            : serialized.author.id;
          if (!isNaN(authorId)) {
            serialized.author = {
              ...serialized.author,
              id: authorId,
            };
          }
        }
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Преобразуем DateTime поля в объекты Date
        // GraphQL DateTime scalar ожидает объекты Date, а не строки ISO
        // KeystoneJS возвращает строки ISO, но GraphQL DateTime scalar может не принимать их напрямую
        // Преобразуем в Date объекты, которые GraphQL правильно сериализует
        if (serialized.publishedAt && typeof serialized.publishedAt === 'string') {
          serialized.publishedAt = new Date(serialized.publishedAt);
        }
        if (serialized.createdAt && typeof serialized.createdAt === 'string') {
          serialized.createdAt = new Date(serialized.createdAt);
        }
        if (serialized.updatedAt && typeof serialized.updatedAt === 'string') {
          serialized.updatedAt = new Date(serialized.updatedAt);
        }
        
        // Преобразуем comments.id в числа
        if (serialized.comments && Array.isArray(serialized.comments)) {
          serialized.comments = serialized.comments.map((comment: any) => {
            if (comment && comment.id) {
              const commentId = typeof comment.id === 'string' 
                ? parseInt(comment.id, 10) 
                : comment.id;
              if (!isNaN(commentId)) {
                return { id: commentId };
              }
            }
            return comment;
          });
        }
        
        return serialized;
      } catch (error) {
        logger.error(`[searchArticles] Failed to load article ${articleId}:`, error);
        return null;
      }
    })
  );
  
  // Фильтруем null значения
  const validArticles = serializedArticles.filter((article): article is any => article !== null);
  
  logger.debug(`[searchArticles] Loaded ${validArticles.length} full articles from ${paginatedArticles.length} filtered articles`);

  logger.info(`[searchArticles] Returning ${serializedArticles.length} articles (total: ${total})`);

  // Убеждаемся, что articles - это массив
  if (!Array.isArray(serializedArticles)) {
    logger.error('[searchArticles] serializedArticles is not an array:', typeof serializedArticles);
    return {
      articles: [],
      total: 0,
    };
  }

  return {
    articles: serializedArticles,
    total,
  };
}

// Функция для получения query полей для articles
// Используется в keystone.ts для объединения с reactions resolver
export function getArticlesQueries(base: any) {
  return {
    searchArticles: graphql.field({
      type: graphql.list(base.object('Article')),
      args: {
        search: graphql.arg({ type: graphql.String }),
        tags: graphql.arg({ type: graphql.list(graphql.String) }),
        difficulty: graphql.arg({ type: graphql.String }),
        sort: graphql.arg({ type: graphql.String }),
        skip: graphql.arg({ type: graphql.Int }),
        take: graphql.arg({ type: graphql.Int }),
      },
      async resolve(root, args, context) {
        try {
          // Преобразуем null значения в undefined для совместимости с searchAndFilterArticles
          const normalizedArgs = {
            search: args.search ?? undefined,
            tags: args.tags ? args.tags.filter((tag): tag is string => tag !== null) : undefined,
            difficulty: args.difficulty ?? undefined,
            sort: args.sort ?? undefined,
            skip: args.skip ?? undefined,
            take: args.take ?? undefined,
          };
          const result = await searchAndFilterArticles(context, normalizedArgs);
          return result.articles;
        } catch (error: any) {
          logger.error('[searchArticles] Error:', error);
          throw error;
        }
      },
    }),
  };
}
