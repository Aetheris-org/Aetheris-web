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
export function extractTextFromSlateDocument(document: any): string {
  if (!document) return '';
  
  let text = '';
  
  if (Array.isArray(document)) {
    for (const node of document) {
      if (node.type === 'paragraph' || node.type === 'heading') {
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'object' && child.text) {
              text += child.text + ' ';
            }
          }
        }
      }
    }
  } else if (typeof document === 'object' && document.children) {
    // Если document это объект с children
    if (Array.isArray(document.children)) {
      for (const node of document.children) {
        if (node.type === 'paragraph' || node.type === 'heading') {
          if (Array.isArray(node.children)) {
            for (const child of node.children) {
              if (typeof child === 'object' && child.text) {
                text += child.text + ' ';
              }
            }
          }
        }
      }
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
  if (!searchQuery || !text) return true;
  
  const normalizedText = text.toLowerCase();
  const normalizedSearch = searchQuery.toLowerCase();
  
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
    // Маппинг старых значений на новые для обратной совместимости
    let difficultyValue = validatedArgs.difficulty;
    if (difficultyValue === 'beginner') {
      difficultyValue = 'easy';
    } else if (difficultyValue === 'intermediate') {
      difficultyValue = 'medium';
    } else if (difficultyValue === 'advanced') {
      difficultyValue = 'hard';
    }
    
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

  // Программная фильтрация по тегам и поиску
  let filteredArticles = allArticles;

  // Фильтрация по тегам
  if (validatedArgs.tags && validatedArgs.tags.length > 0) {
    filteredArticles = filteredArticles.filter(article => 
      hasAllTags(article.tags, validatedArgs.tags!)
    );
    logger.debug(`[searchArticles] After tags filter: ${filteredArticles.length} articles`);
  }

  // Фильтрация по поисковому запросу
  if (validatedArgs.search && validatedArgs.search.trim().length > 0) {
    const searchQuery = validatedArgs.search.trim();
    filteredArticles = filteredArticles.filter(article => {
      // Поиск по title
      const titleMatch = matchesSearch(article.title || '', searchQuery);
      
      // Поиск по excerpt
      const excerptMatch = matchesSearch(article.excerpt || '', searchQuery);
      
      // Поиск по содержимому (извлекаем текст из Slate document)
      let contentMatch = false;
      if (article.content && article.content.document) {
        const contentText = extractTextFromSlateDocument(article.content.document);
        contentMatch = matchesSearch(contentText, searchQuery);
      }
      
      return titleMatch || excerptMatch || contentMatch;
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

  // ИСПРАВЛЕНИЕ: Преобразуем ID в числа для правильной работы с Prisma
  // KeystoneJS GraphQL использует строковые ID, но Prisma ожидает числовые
  // Когда KeystoneJS автоматически загружает связанные данные, он использует ID из объектов
  // Поэтому нужно преобразовать ID в числа перед возвратом
  const serializedArticles = paginatedArticles.map(article => {
    const serialized: any = { ...article };
    
    // Преобразуем ID из строки в число для Prisma
    if (article.id !== null && article.id !== undefined) {
      const idNum = typeof article.id === 'string' 
        ? parseInt(article.id, 10) 
        : typeof article.id === 'number' 
          ? article.id 
          : null;
      
      if (idNum !== null && !isNaN(idNum)) {
        serialized.id = idNum;
      }
    }
    
    return serialized;
  });

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
          const result = await searchAndFilterArticles(context, args);
          return result.articles;
        } catch (error: any) {
          logger.error('[searchArticles] Error:', error);
          throw error;
        }
      },
    }),
  };
}
