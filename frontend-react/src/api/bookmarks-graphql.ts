/**
 * GraphQL API для работы с закладками (избранным)
 * Использует KeystoneJS GraphQL API
 */
import { query, mutate } from '@/lib/graphql';
import type { Article } from '@/types/article';
import { logger } from '@/lib/logger';
import { transformArticle } from './articles-graphql';

export interface Bookmark {
  id: string;
  article: Article;
  createdAt: string;
}

/**
 * Получить все закладки пользователя
 */
export async function getBookmarks(skip: number = 0, take: number = 100): Promise<Bookmark[]> {
  const bookmarksQuery = `
    query GetBookmarks($skip: Int!, $take: Int!) {
      bookmarks(
        skip: $skip
        take: $take
        orderBy: { createdAt: desc }
      ) {
        id
        createdAt
        article {
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
    }
  `;

  try {
    const response = await query<{ bookmarks: any[] }>(bookmarksQuery, {
      skip,
      take,
    });

    return response.bookmarks.map((bookmark) => ({
      id: bookmark.id,
      article: transformArticle(bookmark.article),
      createdAt: bookmark.createdAt,
    }));
  } catch (error) {
    logger.error('Failed to fetch bookmarks:', error);
    throw error;
  }
}

/**
 * Добавить статью в избранное
 */
export async function addBookmark(articleId: string): Promise<Bookmark> {
  const addBookmarkMutation = `
    mutation AddBookmark($articleId: ID!) {
      createBookmark(data: { article: { connect: { id: $articleId } } }) {
        id
        createdAt
        article {
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
    }
  `;

  try {
    const response = await mutate<{ createBookmark: any }>(addBookmarkMutation, {
      articleId,
    });

    return {
      id: response.createBookmark.id,
      article: transformArticle(response.createBookmark.article),
      createdAt: response.createBookmark.createdAt,
    };
  } catch (error: any) {
    // Если закладка уже существует, возвращаем существующую
    if (error.message?.includes('Unique constraint') || error.message?.includes('already exists')) {
      logger.debug('Bookmark already exists, fetching existing bookmark');
      // Находим существующую закладку
      const existingBookmarks = await getBookmarks(0, 1000);
      const existing = existingBookmarks.find((b) => b.article.id === articleId);
      if (existing) {
        return existing;
      }
    }
    logger.error(`Failed to add bookmark for article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Удалить статью из избранного
 */
export async function removeBookmark(articleId: string): Promise<boolean> {
  // Сначала находим закладку по articleId
  const findBookmarkQuery = `
    query FindBookmark($articleId: ID!) {
      bookmarks(
        where: { article: { id: { equals: $articleId } } }
        take: 1
      ) {
        id
      }
    }
  `;

  try {
    const findResponse = await query<{ bookmarks: any[] }>(findBookmarkQuery, {
      articleId,
    });

    if (!findResponse.bookmarks || findResponse.bookmarks.length === 0) {
      // Закладки нет - это нормально, просто возвращаем true (уже удалено)
      logger.debug(`Bookmark not found for article ${articleId} - already removed or never existed`);
      return true;
    }

    const bookmarkId = findResponse.bookmarks[0].id;

    const deleteBookmarkMutation = `
      mutation DeleteBookmark($id: ID!) {
        deleteBookmark(where: { id: $id }) {
          id
        }
      }
    `;

    await mutate(deleteBookmarkMutation, { id: bookmarkId });
    logger.debug(`Bookmark ${bookmarkId} for article ${articleId} successfully removed.`);
    return true;
  } catch (error: any) {
    // Если ошибка "Access denied" или "may not exist" - закладки уже нет, это нормально
    if (error.message?.includes('Access denied') || error.message?.includes('may not exist')) {
      logger.debug(`Bookmark already removed or doesn't exist for article ${articleId}`);
      return true;
    }
    logger.error(`Failed to remove bookmark for article ${articleId}:`, error);
    throw error;
  }
}

/**
 * Проверить, находится ли статья в избранном
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем bookmarks с take: 1 вместо bookmarksCount,
 * чтобы гарантировать, что фильтр по пользователю применяется через access control
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  const checkBookmarkQuery = `
    query CheckBookmark($articleId: ID!) {
      bookmarks(
        where: { article: { id: { equals: $articleId } } }
        take: 1
      ) {
        id
      }
    }
  `;

  try {
    const response = await query<{ bookmarks: { id: string }[] }>(checkBookmarkQuery, {
      articleId,
    });

    return response.bookmarks && response.bookmarks.length > 0;
  } catch (error) {
    logger.error(`Failed to check bookmark for article ${articleId}:`, error);
    return false;
  }
}

/**
 * Получить количество закладок пользователя
 */
export async function getBookmarksCount(): Promise<number> {
  const countQuery = `
    query GetBookmarksCount {
      bookmarksCount
    }
  `;

  try {
    const response = await query<{ bookmarksCount: number }>(countQuery);
    return response.bookmarksCount;
  } catch (error) {
    logger.error('Failed to fetch bookmarks count:', error);
    return 0;
  }
}

