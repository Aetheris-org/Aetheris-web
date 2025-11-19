/**
 * GraphQL API для работы со статьями
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import type { Article } from '@/types/article';
import { logger } from '@/lib/logger';
import { slateToHtml } from '@/lib/slate-to-html';

function transformArticle(raw: any): Article {
  const numericId = typeof raw.id === 'number' ? raw.id : Number.parseInt(raw.id, 10) || 0;

  // KeystoneJS document field возвращает объект с полем `document` в формате Slate
  // Преобразуем Slate JSON в HTML для отображения
  let content = '';
  if (raw.content) {
    try {
      // Логируем формат данных для отладки (только в development)
      if (import.meta.env.DEV) {
        logger.debug('[transformArticle] Raw content type:', {
          type: typeof raw.content,
          isString: typeof raw.content === 'string',
          isArray: Array.isArray(raw.content),
          isObject: typeof raw.content === 'object' && raw.content !== null,
          hasDocument: typeof raw.content === 'object' && raw.content?.document !== undefined,
          preview: typeof raw.content === 'string' 
            ? raw.content.substring(0, 100)
            : JSON.stringify(raw.content).substring(0, 100),
        });
      }

      // Логируем структуру контента для отладки
      if (import.meta.env.DEV) {
        logger.debug('[transformArticle] Raw content structure:', {
          type: typeof raw.content,
          isString: typeof raw.content === 'string',
          isArray: Array.isArray(raw.content),
          isObject: typeof raw.content === 'object' && raw.content !== null,
          hasDocument: typeof raw.content === 'object' && raw.content?.document !== undefined,
          documentType: typeof raw.content?.document,
          documentIsArray: Array.isArray(raw.content?.document),
          fullContent: JSON.stringify(raw.content).substring(0, 500),
        });
      }

      if (typeof raw.content === 'string') {
        // Если это уже HTML строка, используем как есть
        // Проверяем, не является ли это JSON строкой
        if (raw.content.trim().startsWith('[') || raw.content.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(raw.content);
            content = slateToHtml(parsed);
            if (import.meta.env.DEV) {
              logger.debug('[transformArticle] Parsed JSON string and converted to HTML');
            }
          } catch (e) {
            // Если не JSON, используем как HTML
            if (import.meta.env.DEV) {
              logger.debug('[transformArticle] Using string as HTML (not JSON)');
            }
            content = raw.content;
          }
        } else {
          content = raw.content;
        }
      } else if (raw.content && typeof raw.content === 'object' && raw.content.document !== undefined) {
        // Document field возвращает структуру с полем `document` (Slate формат)
        // raw.content.document может быть массивом блоков или объектом с полем children
        if (import.meta.env.DEV) {
          logger.debug('[transformArticle] Converting document field to HTML', {
            documentType: typeof raw.content.document,
            isArray: Array.isArray(raw.content.document),
            hasChildren: typeof raw.content.document === 'object' && raw.content.document?.children !== undefined,
            documentPreview: JSON.stringify(raw.content.document).substring(0, 500),
            fullDocument: JSON.stringify(raw.content.document), // Полный документ для отладки
            documentLength: Array.isArray(raw.content.document) ? raw.content.document.length : 'not array',
            firstBlock: Array.isArray(raw.content.document) && raw.content.document[0] 
              ? JSON.stringify(raw.content.document[0]).substring(0, 500) 
              : 'N/A',
          });
        }
        // Передаем весь объект raw.content в slateToHtml, он сам разберется с форматом
        content = slateToHtml(raw.content);
        
        if (import.meta.env.DEV) {
          logger.debug('[transformArticle] HTML conversion result:', {
            htmlLength: content.length,
            htmlPreview: content.substring(0, 500),
            fullHTML: content, // Полный HTML для отладки
          });
        }
      } else if (Array.isArray(raw.content)) {
        // Если это массив блоков Slate напрямую
        if (import.meta.env.DEV) {
          logger.debug('[transformArticle] Converting array to HTML', {
            arrayLength: raw.content.length,
            firstBlock: JSON.stringify(raw.content[0]).substring(0, 200),
          });
        }
        content = slateToHtml(raw.content);
      } else if (typeof raw.content === 'object' && raw.content !== null) {
        // Попытка преобразовать объект в HTML
        if (import.meta.env.DEV) {
          logger.debug('[transformArticle] Converting object to HTML', {
            objectKeys: Object.keys(raw.content),
            objectPreview: JSON.stringify(raw.content).substring(0, 300),
          });
        }
        content = slateToHtml(raw.content);
      }
    } catch (error) {
      // В случае ошибки логируем и возвращаем пустой контент
      logger.error('Failed to convert Slate to HTML:', {
        error,
        content: typeof raw.content === 'string' 
          ? raw.content.substring(0, 200) 
          : JSON.stringify(raw.content).substring(0, 200),
      });
      content = '';
    }
  }

  return {
    id: String(numericId),
    title: raw.title || '',
    content: content,
    excerpt: raw.excerpt || undefined,
    author: {
      id: raw.author?.id || 0,
      username: raw.author?.username || 'Anonymous',
      avatar: raw.author?.avatar || undefined,
    },
    author_id: raw.author?.id || 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    previewImage: raw.previewImage || undefined,
    status: raw.publishedAt ? 'published' : 'draft',
    difficulty: raw.difficulty || 'medium',
    likes: raw.likes_count || 0,
    dislikes: raw.dislikes_count || 0,
    commentsCount: raw.comments?.length || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || undefined,
    userReaction: raw.userReaction || null,
    isBookmarked: false, // TODO: добавить bookmarks
    views: raw.views || 0,
    previewImageId: null,
  };
}

export interface ArticlesResponse {
  data: Article[];
  total: number;
}

export type ArticleDifficulty = 'easy' | 'medium' | 'hard';
export type ArticleSortOption = 'newest' | 'oldest' | 'popular';

/**
 * Получить список статей
 */
export async function getArticles(params?: {
  page?: number;
  pageSize?: number;
  sort?: ArticleSortOption;
  difficulty?: ArticleDifficulty;
  search?: string;
}): Promise<ArticlesResponse> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const sort = params?.sort || 'newest';
  const difficulty = params?.difficulty;
  const search = params?.search;

  // GraphQL query для получения статей
  const articlesQuery = `
    query GetArticles($skip: Int!, $take: Int!, $orderBy: [ArticleOrderByInput!]) {
      articlesCount(where: { publishedAt: { not: null } })
      articles(
        skip: $skip
        take: $take
        orderBy: $orderBy
        where: { publishedAt: { not: null } }
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
      }
    }
  `;

  // Определяем сортировку
  let orderBy: any[] = [];
  if (sort === 'newest') {
    orderBy = [{ publishedAt: 'desc' }];
  } else if (sort === 'oldest') {
    orderBy = [{ publishedAt: 'asc' }];
  } else if (sort === 'popular') {
    orderBy = [{ likes_count: 'desc' }];
  }

  // TODO: Добавить фильтрацию по difficulty и search

  try {
    const response = await query<{
      articlesCount: number;
      articles: any[];
    }>(articlesQuery, {
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
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

/**
 * Получить трендовые статьи (по количеству лайков)
 */
export async function getTrendingArticles(
  userId?: string | number,
  limit: number = 5
): Promise<Article[]> {
  const trendingQuery = `
    query GetTrendingArticles($take: Int!) {
      articles(
        where: { publishedAt: { not: null } }
        orderBy: { likes_count: desc }
        take: $take
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
      }
    }
  `;

  try {
    const response = await query<{ articles: any[] }>(trendingQuery, {
      take: limit,
    });

    return response.articles.map(transformArticle);
  } catch (error) {
    logger.error('Failed to fetch trending articles:', error);
    return [];
  }
}

/**
 * Поиск статей
 */
export async function searchArticles(
  query: string,
  userId?: string | number,
  start: number = 0,
  limit: number = 10
): Promise<ArticlesResponse> {
  // TODO: Реализовать полнотекстовый поиск в GraphQL
  // Пока используем простой фильтр по title и excerpt
  const searchQuery = `
    query SearchArticles($skip: Int!, $take: Int!, $searchTerm: String!) {
      articlesCount(
        where: {
          AND: [
            { publishedAt: { not: null } }
            {
              OR: [
                { title: { contains: $searchTerm } }
                { excerpt: { contains: $searchTerm } }
              ]
            }
          ]
        }
      )
      articles(
        where: {
          AND: [
            { publishedAt: { not: null } }
            {
              OR: [
                { title: { contains: $searchTerm } }
                { excerpt: { contains: $searchTerm } }
              ]
            }
          ]
        }
        skip: $skip
        take: $take
        orderBy: { publishedAt: desc }
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
      }
    }
  `;

  try {
    const response = await query<{
      articlesCount: number;
      articles: any[];
    }>(searchQuery, {
      skip: start,
      take: limit,
      searchTerm: query,
    });

    const articles = response.articles.map(transformArticle);

    return {
      data: articles,
      total: response.articlesCount,
    };
  } catch (error) {
    logger.error('Failed to search articles:', error);
    return { data: [], total: 0 };
  }
}

/**
 * Получить статью по ID
 */
export async function getArticle(id: string): Promise<Article | null> {
  const articleQuery = `
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
        }
      }
    }
  `;

  try {
    const response = await query<{ article: any }>(articleQuery, { id });

    if (!response.article) {
      return null;
    }

    // TODO: Получить userReaction отдельным запросом, если пользователь аутентифицирован
    const article = transformArticle(response.article);

    return article;
  } catch (error) {
    logger.error(`Failed to fetch article ${id}:`, error);
    throw error;
  }
}

/**
 * Реакция на статью (like/dislike)
 */
export async function reactArticle(
  articleId: string,
  reaction: 'like' | 'dislike'
): Promise<Article> {
  const reactMutation = `
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
      }
    }
  `;

  try {
    const response = await mutate<{ reactToArticle: any }>(reactMutation, {
      articleId,
      reaction,
    });

    const article = transformArticle(response.reactToArticle);
    // userReaction добавляется в кастомной mutation
    article.userReaction = (response.reactToArticle as any).userReaction || null;

    return article;
  } catch (error) {
    logger.error(`Failed to react to article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Создать статью
 */
export async function createArticle(data: {
  title: string;
  content: any; // Document field
  excerpt?: string;
  tags?: string[];
  difficulty?: ArticleDifficulty;
  previewImage?: string;
  publishedAt?: string | null;
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
      }
    }
  `;

  try {
    // Логируем данные перед отправкой (только в development)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[createArticle] Sending data:', {
        title: data.title,
        contentLength: Array.isArray(data.content) ? data.content.length : 'not array',
        contentPreview: Array.isArray(data.content) 
          ? JSON.stringify(data.content[0]).substring(0, 200) 
          : typeof data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        difficulty: data.difficulty,
        previewImage: data.previewImage,
        publishedAt: data.publishedAt,
      });
    }

    const response = await mutate<{ createArticle: any }>(createMutation, {
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        difficulty: data.difficulty || 'medium',
        previewImage: data.previewImage,
        publishedAt: data.publishedAt || null,
      },
    });

    return transformArticle(response.createArticle);
  } catch (error: any) {
    // Подробное логирование ошибки
    logger.error('Failed to create article:', {
      error: error.message,
      stack: error.stack,
      response: error.response?.data || error.response,
      graphQLErrors: error.response?.errors || error.errors,
      data: {
        title: data.title,
        contentType: Array.isArray(data.content) ? 'array' : typeof data.content,
        contentLength: Array.isArray(data.content) ? data.content.length : 'N/A',
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
    difficulty: ArticleDifficulty;
    previewImage: string;
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
      }
    }
  `;

  try {
    const response = await mutate<{ updateArticle: any }>(updateMutation, {
      id,
      data,
    });

    return transformArticle(response.updateArticle);
  } catch (error) {
    logger.error(`Failed to update article ${id}:`, error);
    throw error;
  }
}

/**
 * Удалить статью
 */
export async function deleteArticle(id: string): Promise<boolean> {
  const deleteMutation = `
    mutation DeleteArticle($id: ID!) {
      deleteArticle(where: { id: $id }) {
        id
      }
    }
  `;

  try {
    await mutate(deleteMutation, { id });
    return true;
  } catch (error) {
    logger.error(`Failed to delete article ${id}:`, error);
    throw error;
  }
}

