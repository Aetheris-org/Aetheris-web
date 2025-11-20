/**
 * GraphQL API для работы с черновиками
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import type { Article } from '@/types/article';
import { logger } from '@/lib/logger';
import { transformArticle } from './articles-graphql';

/**
 * Получить все черновики пользователя
 */
export async function getDrafts(skip: number = 0, take: number = 100): Promise<Article[]> {
  const draftsQuery = `
    query GetDrafts($skip: Int!, $take: Int!) {
      articles(
        where: { publishedAt: { equals: null } }
        skip: $skip
        take: $take
        orderBy: { updatedAt: desc }
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
    const response = await query<{ articles: any[] }>(draftsQuery, {
      skip,
      take,
    });

    return response.articles.map(transformArticle);
  } catch (error) {
    logger.error('Failed to fetch drafts:', error);
    throw error;
  }
}

/**
 * Получить черновик по ID
 */
export async function getDraft(id: string): Promise<Article | null> {
  const draftQuery = `
    query GetDraft($id: ID!) {
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
    const response = await query<{ article: any }>(draftQuery, { id });

    if (!response.article) {
      return null;
    }

    // Проверяем, что это черновик (publishedAt === null)
    if (response.article.publishedAt !== null) {
      logger.warn(`Article ${id} is not a draft (has publishedAt)`);
      return null;
    }

    return transformArticle(response.article);
  } catch (error) {
    logger.error(`Failed to fetch draft ${id}:`, error);
    throw error;
  }
}

/**
 * Преобразует difficulty из формата frontend в формат backend
 */
function mapDifficultyToBackend(difficulty?: 'beginner' | 'intermediate' | 'advanced'): 'easy' | 'medium' | 'hard' {
  const mapping: Record<'beginner' | 'intermediate' | 'advanced', 'easy' | 'medium' | 'hard'> = {
    beginner: 'easy',
    intermediate: 'medium',
    advanced: 'hard',
  };
  return difficulty ? mapping[difficulty] : 'medium';
}

/**
 * Создать черновик
 */
export async function createDraft(data: {
  title: string;
  content: any; // Document field (Slate format)
  excerpt?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  previewImage?: string | null;
}): Promise<Article> {
  const createMutation = `
    mutation CreateDraft($data: ArticleCreateInput!) {
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
    // Формируем данные для мутации
    const mutationData: any = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || null,
      tags: data.tags || [],
      difficulty: mapDifficultyToBackend(data.difficulty),
      publishedAt: null, // Черновик не имеет publishedAt
    };

    // Добавляем previewImage только если он есть (не передаем null)
    if (data.previewImage) {
      mutationData.previewImage = data.previewImage;
    }

    const response = await mutate<{ createArticle: any }>(createMutation, {
      data: mutationData,
    });

    return transformArticle(response.createArticle);
  } catch (error: any) {
    logger.error('Failed to create draft:', {
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
 * Обновить черновик
 */
export async function updateDraft(
  id: string,
  data: Partial<{
    title: string;
    content: any;
    excerpt: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    previewImage: string | null;
  }>
): Promise<Article> {
  const updateMutation = `
    mutation UpdateDraft($id: ID!, $data: ArticleUpdateInput!) {
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
    // Формируем данные для мутации
    const updateData: any = {};

    // Копируем только переданные поля
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt || null;
    if (data.tags !== undefined) updateData.tags = data.tags || [];
    if (data.difficulty !== undefined) {
      updateData.difficulty = mapDifficultyToBackend(data.difficulty);
    }
    // Добавляем previewImage только если он явно передан (включая null для удаления)
    if (data.previewImage !== undefined) {
      if (data.previewImage === null) {
        // Для удаления previewImage передаем null
        updateData.previewImage = null;
      } else if (data.previewImage) {
        // Для установки previewImage передаем значение
        updateData.previewImage = data.previewImage;
      }
    }
    // Убеждаемся, что publishedAt остается null (черновик не должен быть опубликован при обновлении)
    updateData.publishedAt = null;

    const response = await mutate<{ updateArticle: any }>(updateMutation, {
      id,
      data: updateData,
    });

    return transformArticle(response.updateArticle);
  } catch (error) {
    logger.error(`Failed to update draft ${id}:`, error);
    throw error;
  }
}

/**
 * Удалить черновик
 */
export async function deleteDraft(id: string): Promise<boolean> {
  const deleteMutation = `
    mutation DeleteDraft($id: ID!) {
      deleteArticle(where: { id: $id }) {
        id
      }
    }
  `;

  try {
    await mutate(deleteMutation, { id });
    return true;
  } catch (error) {
    logger.error(`Failed to delete draft ${id}:`, error);
    throw error;
  }
}

