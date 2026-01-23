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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:75',message:'toggleBookmark called',data:{articleId},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
    // #endregion
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:82',message:'Not authenticated',data:{articleId},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
      // #endregion
      throw new Error('Not authenticated');
    }

    // Валидируем UUID
    let validatedArticleId: string;
    try {
      validatedArticleId = validateUuid(articleId);
    } catch (validationError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:92',message:'UUID validation failed',data:{articleId,error:validationError?.message},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
      // #endregion
      throw validationError;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:97',message:'Calling RPC toggle_bookmark',data:{articleId:validatedArticleId,userId:user.id},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
    // #endregion

    // Используем Database Function
    const { data, error } = await supabase.rpc('toggle_bookmark', {
      p_article_id: validatedArticleId,
      p_user_id: user.id,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:105',message:'RPC toggle_bookmark response',data:{articleId:validatedArticleId,hasData:!!data,dataLength:data?.length,isBookmarked:data?.[0]?.is_bookmarked,error:error?.message,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
    // #endregion

    if (error) {
      logger.error('Error toggling bookmark', error);
      throw error;
    }

    const result = {
      isBookmarked: data?.[0]?.is_bookmarked || false,
    };
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:115',message:'toggleBookmark success',data:{articleId:validatedArticleId,result},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
    // #endregion
    
    return result;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:120',message:'toggleBookmark error',data:{articleId,error:error?.message,errorCode:error?.code,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{})
    // #endregion
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
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:169',message:'addBookmark called',data:{articleId},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Проверяем текущее состояние перед toggle
    const currentlyBookmarked = await isBookmarked(articleId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:175',message:'Current bookmark state checked',data:{articleId,currentlyBookmarked},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    
    // Если уже добавлена, просто возвращаем существующую закладку
    if (currentlyBookmarked) {
      const bookmarks = await getBookmarks(0, 1000);
      const bookmark = bookmarks.find((b) => b.article.id === articleId);
      if (bookmark) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:183',message:'Bookmark already exists, returning existing',data:{articleId,bookmarkId:bookmark.id},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
        // #endregion
        return bookmark;
      }
    }
    
    // Если не добавлена, добавляем через toggle
    const result = await toggleBookmark(articleId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:192',message:'toggleBookmark result',data:{articleId,isBookmarked:result.isBookmarked},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    
    if (!result.isBookmarked) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:196',message:'Toggle returned false, bookmark not added',data:{articleId,result},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
      // #endregion
      throw new Error('Failed to add bookmark');
    }
    
    // Небольшая задержка для синхронизации базы данных
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const bookmarks = await getBookmarks(0, 1000);
    const bookmark = bookmarks.find((b) => b.article.id === articleId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:206',message:'Searching for bookmark after creation',data:{articleId,bookmarksCount:bookmarks.length,found:!!bookmark},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    
    if (!bookmark) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:210',message:'Bookmark not found after creation',data:{articleId,bookmarksCount:bookmarks.length,allArticleIds:bookmarks.map(b=>b.article.id)},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
      // #endregion
      throw new Error('Bookmark not found after creation');
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:216',message:'addBookmark success',data:{articleId,bookmarkId:bookmark.id},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    
    return bookmark;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:220',message:'addBookmark error',data:{articleId,error:error?.message,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'A'})}).catch(()=>{})
    // #endregion
    logger.error('Error in addBookmark', error);
    throw error;
  }
}

export async function removeBookmark(articleId: string): Promise<boolean> {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:228',message:'removeBookmark called',data:{articleId},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    
    const result = await toggleBookmark(articleId);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:233',message:'removeBookmark result',data:{articleId,isBookmarked:result.isBookmarked,removed:!result.isBookmarked},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    
    return !result.isBookmarked;
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ebafe3e3-0264-4f10-b0b2-c1951d9e2325',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/bookmarks.ts:238',message:'removeBookmark error',data:{articleId,error:error?.message},timestamp:Date.now(),sessionId:'debug-bookmark',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    logger.error('Error in removeBookmark', error);
    throw error;
  }
}

