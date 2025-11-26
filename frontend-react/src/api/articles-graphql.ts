import { query, mutate } from '@/lib/graphql';
import { logger } from '@/lib/logger';
import type { Article, ArticleDifficulty, ArticleSortOption } from '@/types/article';

// Re-export types for use in other files
export type { ArticleDifficulty, ArticleSortOption } from '@/types/article';

interface ArticlesResponse {
  data: Article[];
  total: number;
}

// Трансформация данных статьи из GraphQL в формат Article
export function transformArticle(article: any): Article {
  // Обрабатываем content - может быть объектом Slate document или строкой
  const content = article.content || { document: [] };
  
  // Оставляем Slate формат { document: [...] } для конвертации через slateToProseMirror в ArticleContent
  // ArticleContent сам определит формат и конвертирует Slate в ProseMirror при необходимости
  let contentJSON: any = null;
  if (content && typeof content === 'object' && content.document) {
    // Передаем оригинальный Slate формат - ArticleContent конвертирует его в ProseMirror
    contentJSON = content;
  }

  return {
    id: String(article.id),
    title: article.title || '',
    content: content, // Может быть объектом Slate или строкой для обратной совместимости
    contentJSON: contentJSON, // Slate JSON для использования с TipTap/ArticleContent
    excerpt: article.excerpt || '',
    author: {
      id: Number(article.author?.id) || 0,
      username: article.author?.username || '',
      avatar: article.author?.avatar || null,
    },
    previewImage: article.previewImage || null,
    tags: Array.isArray(article.tags) ? article.tags : [],
    difficulty: article.difficulty || 'beginner',
    likes: article.likes_count || 0,
    dislikes: article.dislikes_count || 0,
    views: article.views || 0,
    createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
    commentsCount: Array.isArray(article.comments) ? article.comments.length : 0,
    userReaction: article.userReaction || null,
    isBookmarked: false, // TODO: добавить bookmarks
    status: article.status || 'published',
  };
}

/**
 * Получение статей с фильтрацией и поиском
 * Использует кастомный GraphQL resolver searchArticles для фильтрации и поиска
 */
export async function getArticles(params?: {
  page?: number;
  pageSize?: number;
  sort?: ArticleSortOption;
  difficulty?: ArticleDifficulty | 'all';
  tags?: string[];
  search?: string;
}): Promise<ArticlesResponse> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const sort = params?.sort || 'newest';
  const difficulty = params?.difficulty === 'all' ? undefined : params?.difficulty;
  const tags = params?.tags && params.tags.length > 0 ? params.tags : undefined;
  const search = params?.search;

  // Используем кастомный GraphQL resolver searchArticles для фильтрации и поиска
  // Если есть фильтры (tags, search, difficulty) - используем searchArticles, иначе стандартный articles
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем search правильно - он должен быть строкой длиной >= 2
  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Также используем searchArticles когда есть только difficulty фильтр
  const hasSearch = search && typeof search === 'string' && search.trim().length >= 2;
  const hasTags = tags && tags.length > 0;
  const hasDifficulty = !!difficulty;
  const needsCustomResolver = hasTags || hasSearch || hasDifficulty;
  
  // Логирование для отладки
  if (import.meta.env.DEV) {
    logger.debug('[getArticles] Resolver selection:', {
      hasSearch,
      searchQuery: search,
      hasTags,
      tags,
      hasDifficulty,
      difficulty,
      needsCustomResolver,
    });
  }
  
  if (needsCustomResolver) {
    // Используем кастомный resolver searchArticles
    const searchQuery = `
      query SearchArticles(
        $search: String
        $tags: [String!]
        $difficulty: String
        $sort: String
        $skip: Int
        $take: Int
      ) {
        searchArticles(
          search: $search
          tags: $tags
          difficulty: $difficulty
          sort: $sort
          skip: $skip
          take: $take
        ) {
          articles {
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
          }
          total
        }
      }
    `;

    try {
      // Маппинг difficulty для обратной совместимости
      let difficultyValue: 'easy' | 'medium' | 'hard' | undefined = undefined;
      if (difficulty === 'beginner') {
        difficultyValue = 'easy';
      } else if (difficulty === 'intermediate') {
        difficultyValue = 'medium';
      } else if (difficulty === 'advanced') {
        difficultyValue = 'hard';
      }

    const response = await query<{
        searchArticles: {
          articles: any[];
          total: number;
        };
      }>(searchQuery, {
        search: search && search.trim().length >= 2 ? search.trim() : undefined,
        tags: tags && tags.length > 0 ? tags : undefined,
        difficulty: difficultyValue,
        sort: sort,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: searchArticles теперь возвращает объект с articles и total
      const articles = response.searchArticles.articles.map(transformArticle);
      const total = response.searchArticles.total;
      
      // Логирование для отладки
      if (import.meta.env.DEV) {
        logger.debug('[getArticles] SearchArticles response:', {
          articlesCount: articles.length,
          total,
          searchQuery: search,
          hasTags: !!(tags && tags.length > 0),
        });
      }

    return {
      data: articles,
      total, // Используем правильный total из бэкенда
    };
  } catch (error) {
      logger.error('Failed to search articles:', error);
    throw error;
  }
  } else {
    // Используем стандартный GraphQL query articles без фильтров
  const articlesQuery = `
      query GetArticles($skip: Int!, $take: Int!, $orderBy: [ArticleOrderByInput!], $where: ArticleWhereInput) {
        articlesCount(where: $where)
      articles(
          where: $where
        skip: $skip
        take: $take
        orderBy: $orderBy
      ) {
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
      }
    }
  `;

    // Строим where фильтр
    const where: any = {
      publishedAt: { not: null },
    };

    // Фильтр по difficulty (с маппингом для обратной совместимости)
    if (difficulty) {
      // Маппинг difficulty для обратной совместимости
      let difficultyValue: 'easy' | 'medium' | 'hard' | undefined = undefined;
      if (difficulty === 'beginner') {
        difficultyValue = 'easy';
      } else if (difficulty === 'intermediate') {
        difficultyValue = 'medium';
      } else if (difficulty === 'advanced') {
        difficultyValue = 'hard';
      }
      if (difficultyValue) {
        where.difficulty = { equals: difficultyValue };
      }
    }

  // Определяем сортировку
  let orderBy: any[] = [];
  if (sort === 'newest') {
    orderBy = [{ publishedAt: 'desc' }];
  } else if (sort === 'oldest') {
    orderBy = [{ publishedAt: 'asc' }];
  } else if (sort === 'popular') {
    orderBy = [{ likes_count: 'desc' }];
  }

  try {
    const response = await query<{
      articlesCount: number;
      articles: any[];
    }>(articlesQuery, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
        where,
    });

    const articles = response.articles.map(transformArticle);

    return {
      data: articles,
      total: response.articlesCount,
    };
  } catch (error) {
    logger.error('Failed to fetch articles:', error);
      throw error;
    }
  }
}

/**
 * Получение одной статьи по ID
 */
export async function getArticle(
  id: string,
  _options?: { userId?: string | number }
): Promise<Article | null> {
  const queryString = `
    query GetArticle($id: ID!) {
      article(where: { id: $id }) {
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
          text
          author {
            id
            username
            avatar
          }
          parent {
            id
          }
          likes_count
          dislikes_count
          createdAt
          userReaction
        }
        userReaction
      }
    }
  `;

  try {
    const response = await query<{ article: any }>(queryString, { id });
    if (!response.article) {
      return null;
    }
    return transformArticle(response.article);
  } catch (error) {
    logger.error('Failed to fetch article:', error);
    throw error;
  }
}

/**
 * Получение трендовых статей
 */
export async function getTrendingArticles(
  _userId?: string | number,
  limit: number = 10
): Promise<Article[]> {
  const queryString = `
    query GetTrendingArticles($take: Int!, $where: ArticleWhereInput) {
      articles(
        where: $where
        take: $take
        orderBy: { views: desc }
      ) {
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
      }
    }
  `;

  const where: any = { publishedAt: { not: null } };

  try {
    const response = await query<{ articles: any[] }>(queryString, {
      take: limit,
      where,
    });

    return response.articles.map(transformArticle);
  } catch (error) {
    logger.error('Failed to fetch trending articles:', error);
    throw error;
  }
}

/**
 * Поиск статей
 * Использует кастомный GraphQL resolver searchArticles
 */
export async function searchArticles(
  searchQuery: string,
  _userId?: string | number,
  start: number = 0,
  limit: number = 10
): Promise<ArticlesResponse> {
  // Используем кастомный GraphQL resolver searchArticles
  const queryString = `
    query SearchArticles(
      $search: String
      $skip: Int
      $take: Int
    ) {
      searchArticles(
        search: $search
        skip: $skip
        take: $take
        sort: "newest"
      ) {
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
      }
    }
  `;

  try {
    const response = await query<{
      searchArticles: any[];
    }>(queryString, {
      search: searchQuery && searchQuery.trim().length >= 2 ? searchQuery.trim() : undefined,
      skip: start,
      take: limit,
    });

    const articles = response.searchArticles.map(transformArticle);

    return {
      data: articles,
      total: articles.length, // TODO: Получить точный total через отдельный запрос
    };
  } catch (error) {
    logger.error('Failed to search articles:', error);
    throw error;
  }
}

/**
 * Реакция на статью (лайк/дизлайк)
 */
export async function reactArticle(articleId: string, reaction: 'like' | 'dislike'): Promise<Article> {
  const mutation = `
    mutation ReactToArticle($articleId: ID!, $reaction: ReactionType!) {
      reactToArticle(articleId: $articleId, reaction: $reaction) {
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
      }
    }
  `;

  try {
    const response = await mutate<{
      reactToArticle: any;
    }>(mutation, {
      articleId,
      reaction,
    }, undefined, 'reaction'); // Используем специальный rate limit для реакций (3/5 сек)

    return transformArticle(response.reactToArticle);
  } catch (error) {
    logger.error('Failed to react to article:', error);
    throw error;
  }
}

/**
 * Создать статью (опубликовать)
 */
export async function createArticle(data: {
  title: string;
  content: any;
  excerpt?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  previewImage?: string | null;
  publishedAt: string;
}): Promise<Article> {
  const createMutation = `
    mutation CreateArticle($data: ArticleCreateInput!) {
      createArticle(data: $data) {
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
      }
    }
  `;

  try {
    // Маппинг difficulty для обратной совместимости
    const mapDifficulty = (difficulty?: 'beginner' | 'intermediate' | 'advanced'): string => {
      if (!difficulty) return 'medium';
      if (difficulty === 'beginner') return 'easy';
      if (difficulty === 'intermediate') return 'medium';
      if (difficulty === 'advanced') return 'hard';
      return difficulty;
    };

    // Формируем данные для мутации
    const mutationData: any = {
        title: data.title,
      content: data.content,
      excerpt: data.excerpt || null,
      tags: data.tags || [],
      difficulty: mapDifficulty(data.difficulty),
      previewImage: data.previewImage || null,
        publishedAt: data.publishedAt,
    };

    const response = await mutate<{ createArticle: any }>(createMutation, {
      data: mutationData,
    }, undefined, 'article-mutation'); // Используем специальный rate limit для создания статей (1/60 сек)

    return transformArticle(response.createArticle);
  } catch (error: any) {
    logger.error('Failed to create article:', {
      error: error.message,
      stack: error.stack,
      data: {
        title: data.title,
        contentType: Array.isArray(data.content) ? 'array' : typeof data.content,
        contentLength: Array.isArray(data.content) ? data.content.length : 'N/A',
        difficulty: data.difficulty,
        previewImage: data.previewImage,
      },
    });
    throw error;
  }
}

/**
 * Обновить статью
 */
export async function updateArticle(
  id: string,
  data: Partial<{
    title: string;
    content: any;
    excerpt: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    previewImage: string | null;
    publishedAt: string | null;
  }>
): Promise<Article> {
  const updateMutation = `
    mutation UpdateArticle($id: ID!, $data: ArticleUpdateInput!) {
      updateArticle(where: { id: $id }, data: $data) {
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
      }
    }
  `;

  try {
    // Маппинг difficulty для обратной совместимости
    const mapDifficulty = (difficulty?: 'beginner' | 'intermediate' | 'advanced'): string | undefined => {
      if (!difficulty) return undefined;
      if (difficulty === 'beginner') return 'easy';
      if (difficulty === 'intermediate') return 'medium';
      if (difficulty === 'advanced') return 'hard';
      return difficulty;
    };

    // Формируем данные для мутации
    const updateData: any = {};

    // Копируем только переданные поля
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.tags !== undefined) updateData.tags = data.tags || [];
    if (data.difficulty !== undefined) {
      const mapped = mapDifficulty(data.difficulty);
      if (mapped) updateData.difficulty = mapped;
    }
    if (data.previewImage !== undefined) {
      updateData.previewImage = data.previewImage;
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt;
    }

    const response = await mutate<{ updateArticle: any }>(updateMutation, {
      id,
      data: updateData,
    }, undefined, 'article-mutation'); // Используем специальный rate limit для обновления статей (1/60 сек)

    return transformArticle(response.updateArticle);
  } catch (error) {
    logger.error(`Failed to update article ${id}:`, error);
    throw error;
  }
}
