/**
 * Bookmarks API using Supabase REST API
 * Замена для bookmarks-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Article } from '@/types/article';
import { transformArticle } from './articles';

/**
 * Валидация UUID
 */
function validateUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!id || (typeof id !== 'string') || !uuidRegex.test(id)) {
    throw new Error(`Invalid UUID format: ${id}`);
  }
  return id;
}

export interface Bookmark {
  id: string;
  article: Article;
  createdAt: string;
}

/**
 * Получить все закладки пользователя
 */
export async function getBookmarks(skip: number = 0, take: number = 100): Promise<Bookmark[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        article:articles!bookmarks_article_id_fkey (
          *,
          author:profiles!articles_author_id_fkey (
            id,
            username,
            avatar
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching bookmarks', error);
      throw error;
    }

    return (data || []).map((bookmark: any) => ({
      id: bookmark.id,
      article: transformArticle(bookmark.article, user.id),
      createdAt: bookmark.created_at,
    }));
  } catch (error: any) {
    logger.error('Error in getBookmarks', error);
    throw error;
  }
}

/**
 * Toggle закладки (добавить/удалить)
 */
export async function toggleBookmark(articleId: string): Promise<{ isBookmarked: boolean }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Валидируем UUID
    const validatedArticleId = validateUuid(articleId);

    // Используем Database Function
    const { data, error } = await supabase.rpc('toggle_bookmark', {
      p_article_id: validatedArticleId,
      p_user_id: user.id,
    });

    if (error) {
      logger.error('Error toggling bookmark', error);
      throw error;
    }

    return {
      isBookmarked: data?.[0]?.is_bookmarked || false,
    };
  } catch (error: any) {
    logger.error('Error in toggleBookmark', error);
    throw error;
  }
}

/**
 * Проверить, находится ли статья в избранном
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Валидируем UUID
    const validatedArticleId = validateUuid(articleId);

    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('article_id', validatedArticleId)
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking bookmark', error);
      return false;
    }

    return !!data;
  } catch (error: any) {
    logger.error('Error in isBookmarked', error);
    return false;
  }
}

/**
 * Получить количество закладок пользователя
 */
export async function getBookmarksCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      logger.error('Error fetching bookmarks count', error);
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    logger.error('Error in getBookmarksCount', error);
    return 0;
  }
}

// Для обратной совместимости
export async function addBookmark(articleId: string): Promise<Bookmark> {
  const result = await toggleBookmark(articleId);
  if (!result.isBookmarked) {
    throw new Error('Failed to add bookmark');
  }
  
  const bookmarks = await getBookmarks(0, 1000);
  const bookmark = bookmarks.find((b) => b.article.id === articleId);
  if (!bookmark) {
    throw new Error('Bookmark not found after creation');
  }
  return bookmark;
}

export async function removeBookmark(articleId: string): Promise<boolean> {
  const result = await toggleBookmark(articleId);
  return !result.isBookmarked;
}

