/**
 * Articles API using Supabase REST API
 * Замена для articles-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Article, ArticleDifficulty, ArticleSortOption } from '@/types/article';

// Re-export types
export type { ArticleDifficulty, ArticleSortOption } from '@/types/article';

interface ArticlesResponse {
  data: Article[];
  total: number;
}

export interface ArticleQueryParams {
  page?: number;
  pageSize?: number;
  sort?: ArticleSortOption;
  difficulty?: ArticleDifficulty | 'all';
  tags?: string[];
  search?: string;
  category?: string;
  authorId?: string;
  language?: string;
  publishedFrom?: string;
  publishedTo?: string;
  minReadMinutes?: number;
  minReactions?: number;
  minViews?: number;
}

// Трансформация данных из Supabase в формат Article
export function transformArticle(article: any, _userId?: string): Article {
  const rawContent = article.content ?? { document: [] };

  // Пытаемся распарсить JSON-строку, если content приходит строкой
  let contentJSON: any = null;
  let content: any = '';

  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent);
      contentJSON = parsed;
      content = rawContent; // сохраняем оригинал для HTML fallback
    } catch {
      content = rawContent; // обычный HTML
      contentJSON = null;
    }
  } else if (Array.isArray(rawContent)) {
    contentJSON = { document: rawContent };
    content = rawContent;
  } else if (rawContent && typeof rawContent === 'object') {
    contentJSON = rawContent;
    content = rawContent;
  } else {
    content = '';
    contentJSON = null;
  }

  // Преобразуем author из JSONB объекта
  const author = typeof article.author === 'object' && article.author !== null
    ? article.author
    : { id: article.author_id, username: article.author_username || article.author_name || '', avatar: null, name: article.author_name || '' };

  // author.id из Supabase - это UUID (строка)
  const authorId = author.id || article.author_id;

  const publishedAt =
    article.published_at
      ? new Date(article.published_at).toISOString()
      : article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined;

  const readTimeMinutes =
    typeof article.read_time_minutes === 'number'
      ? article.read_time_minutes
      : typeof article.read_time === 'number'
        ? article.read_time
        : undefined;

  const reactionsCount = (article.likes_count || 0) + (article.dislikes_count || 0);

  return {
    id: String(article.id),
    title: article.title || '',
    content: content,
    contentJSON: contentJSON,
    excerpt: article.excerpt || '',
    author: {
      id: authorId, // UUID из базы данных
      uuid: typeof authorId === 'string' ? authorId : undefined, // Сохраняем UUID для навигации
      username: author.username || author.name || '',
      avatar: author.avatar || null,
    },
    previewImage: article.preview_image || article.previewImage || article.cover_url || null,
    tags: Array.isArray(article.tags) ? article.tags : [],
    difficulty: (article.difficulty || 'medium') as ArticleDifficulty,
    likes: article.likes_count || 0,
    dislikes: article.dislikes_count || 0,
    views: article.views || 0,
    createdAt: article.created_at ? new Date(article.created_at).toISOString() : new Date().toISOString(),
    updatedAt: article.updated_at ? new Date(article.updated_at).toISOString() : new Date().toISOString(),
    publishedAt,
    category: article.category || (Array.isArray(article.categories) ? article.categories[0] : undefined),
    language: article.language || article.locale || undefined,
    readTimeMinutes,
    reactionsCount,
    commentsCount: 0, // Будет загружено отдельно если нужно
    userReaction: article.user_reaction || null,
    isBookmarked: false, // Будет загружено отдельно если нужно
    status: article.published_at ? 'published' : 'draft',
  };
}

/**
 * Получение статей с фильтрацией и поиском
 * Использует Database Function search_articles
 */
export async function getArticles(params?: ArticleQueryParams): Promise<ArticlesResponse> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const sort = params?.sort || 'newest';
  const difficulty = params?.difficulty === 'all' ? undefined : params?.difficulty;
  const tags = params?.tags && params.tags.length > 0 ? params.tags : undefined;
  const search = params?.search && params.search.trim().length >= 2 ? params.search.trim() : undefined;
  const category = params?.category?.trim() || undefined;
  const authorId = params?.authorId?.trim() || undefined;
  const language = params?.language?.trim() || undefined;
  const publishedFrom = params?.publishedFrom || undefined;
  const publishedTo = params?.publishedTo || undefined;
  const minReadMinutes = typeof params?.minReadMinutes === 'number' ? params?.minReadMinutes : undefined;
  const minReactions = typeof params?.minReactions === 'number' ? params?.minReactions : undefined;
  const minViews = typeof params?.minViews === 'number' ? params?.minViews : undefined;

  try {
    logger.debug('[getArticles] Starting fetch with params:', {
      page,
      pageSize,
      sort,
      difficulty,
      tags,
      search,
      category,
      authorId,
      language,
      publishedFrom,
      publishedTo,
      minReadMinutes,
      minReactions,
      minViews,
    });

    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      logger.error('[getArticles] Auth error:', authError);
    }
    const userId = user?.id;
    logger.debug('[getArticles] User ID:', userId);

    // Используем Database Function для поиска
    logger.debug('[getArticles] Calling search_articles RPC with:', {
      p_search: search || null,
      p_tags: tags || null,
      p_difficulty: difficulty || null,
      p_sort: sort,
      p_skip: (page - 1) * pageSize,
      p_take: pageSize,
      p_user_id: userId || null,
    });

    const rpcPayload: Record<string, any> = {
      p_search: search || null,
      p_tags: tags || null,
      p_difficulty: difficulty || null,
      p_sort: sort,
      p_skip: (page - 1) * pageSize,
      p_take: pageSize,
      p_user_id: userId || null,
      p_category: category || null,
      p_author_id: authorId || null,
      p_language: language || null,
      p_published_from: publishedFrom || null,
      p_published_to: publishedTo || null,
      p_min_read_minutes: minReadMinutes ?? null,
      p_min_reactions: minReactions ?? null,
      p_min_views: minViews ?? null,
    };

    const { data, error } = await supabase.rpc('search_articles', rpcPayload as any);

    logger.debug('[getArticles] RPC response:', { hasData: !!data, dataLength: data?.length, error });

    if (error) {
      logger.error('Error fetching articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    }

    // Первая запись содержит total_count
    const total = data[0]?.total_count || 0;
    
    // Трансформируем данные
    const articles = data.map((item: any) => transformArticle(item, userId));

    return {
      data: articles,
      total: Number(total),
    };
  } catch (error: any) {
    logger.error('Error in getArticles', error);
    throw error;
  }
}

/**
 * Получение одной статьи по ID
 */
export async function getArticle(id: string): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Валидация ID (UUID)
    const articleId = (() => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      
      if (!id || (typeof id !== 'string')) {
        throw new Error(`Invalid article ID: ${id}`);
      }
      
      if (!uuidRegex.test(id) && !uuidNoDashesRegex.test(id)) {
        throw new Error(`Invalid article ID format (expected UUID): ${id}`);
      }
      
      return id;
    })();

    // Используем Database Function для получения статьи с деталями
    const { data, error } = await supabase.rpc('get_article_with_details', {
      p_article_id: articleId,
      p_user_id: userId || null,
      p_increment_views: true,
    });

    if (error) {
      logger.error('Error fetching article', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Article not found');
    }

    return transformArticle(data[0], userId);
  } catch (error: any) {
    logger.error('Error in getArticle', error);
    throw error;
  }
}

/**
 * Создание статьи
 */
export async function createArticle(input: {
  title: string;
  content: any;
  excerpt: string;
  tags: string[];
  difficulty: ArticleDifficulty;
  previewImage?: string | null;
  publishedAt?: string | null;
}): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Валидация
    if (input.title.length < 10 || input.title.length > 200) {
      throw new Error('Title must be between 10 and 200 characters');
    }
    if (input.excerpt.length > 500) {
      throw new Error('Excerpt must be 500 characters or less');
    }

    // Создаем статью
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt,
        tags: input.tags,
        difficulty: input.difficulty,
        preview_image: input.previewImage || null,
        published_at: input.publishedAt || null,
        author_id: user.id,
      })
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .single();

    if (error) {
      logger.error('Error creating article', error);
      throw error;
    }

    return transformArticle(data, user.id);
  } catch (error: any) {
    logger.error('Error in createArticle', error);
    throw error;
  }
}

/**
 * Обновление статьи
 */
export async function updateArticle(
  id: string,
  input: {
    title?: string;
    content?: any;
    excerpt?: string;
    tags?: string[];
    difficulty?: ArticleDifficulty;
    previewImage?: string | null;
    publishedAt?: string | null;
  }
): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Валидация ID (UUID)
    const articleId = (() => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      
      if (!id || (typeof id !== 'string')) {
        throw new Error(`Invalid article ID: ${id}`);
      }
      
      if (!uuidRegex.test(id) && !uuidNoDashesRegex.test(id)) {
        throw new Error(`Invalid article ID format (expected UUID): ${id}`);
      }
      
      return id;
    })();

    // Проверяем права доступа (RLS сделает это автоматически, но лучше проверить)
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (existingArticle.author_id !== user.id) {
      throw new Error('You can only edit your own articles');
    }

    // Валидация
    if (input.title !== undefined) {
      if (input.title.length < 10 || input.title.length > 200) {
        throw new Error('Title must be between 10 and 200 characters');
      }
    }
    if (input.excerpt !== undefined && input.excerpt.length > 500) {
      throw new Error('Excerpt must be 500 characters or less');
    }

    // Обновляем статью
    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.previewImage !== undefined) updateData.preview_image = input.previewImage;
    if (input.publishedAt !== undefined) updateData.published_at = input.publishedAt;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .single();

    if (error) {
      logger.error('Error updating article', error);
      throw error;
    }

    return transformArticle(data, user.id);
  } catch (error: any) {
    logger.error('Error in updateArticle', error);
    throw error;
  }
}

/**
 * Удаление статьи
 */
export async function deleteArticle(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Валидация ID (UUID)
    const articleId = (() => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      
      if (!id || (typeof id !== 'string')) {
        throw new Error(`Invalid article ID: ${id}`);
      }
      
      if (!uuidRegex.test(id) && !uuidNoDashesRegex.test(id)) {
        throw new Error(`Invalid article ID format (expected UUID): ${id}`);
      }
      
      return id;
    })();

    // Проверяем права доступа
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('author_id')
      .eq('id', articleId)
      .single();

    if (!existingArticle) {
      throw new Error('Article not found');
    }

    if (existingArticle.author_id !== user.id) {
      throw new Error('You can only delete your own articles');
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      logger.error('Error deleting article', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    logger.error('Error in deleteArticle', error);
    throw error;
  }
}

/**
 * Реакция на статью (like/dislike)
 */
type NormalizedArticleId = string | number;

function normalizeArticleId(id: string): NormalizedArticleId {
  // Поддерживаем UUID и числовые ID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
  const numericRegex = /^\d+$/;

  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid article ID: ${id}`);
  }

  if (uuidRegex.test(id) || uuidNoDashesRegex.test(id)) {
    return id;
  }

  if (numericRegex.test(id)) {
    return Number(id);
  }

  throw new Error(`Invalid article ID format (expected UUID or numeric): ${id}`);
}

export async function reactToArticle(
  articleId: string,
  reaction: 'like' | 'dislike'
): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const validatedArticleId = normalizeArticleId(articleId);

    // Упрощённо: прямой toggle + возврат статьи с актуальными данными
    const { data: existing, error: existingError } = await supabase
      .from('article_reactions')
      .select('reaction')
      .eq('article_id', validatedArticleId)
      .eq('user_id', user.id)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Error fetching existing article reaction', existingError);
      throw existingError;
    }

    if (existing && existing.reaction === reaction) {
      const { error: deleteError } = await supabase
        .from('article_reactions')
        .delete()
        .eq('article_id', validatedArticleId)
        .eq('user_id', user.id);

      if (deleteError) {
        logger.error('Error deleting article reaction', deleteError);
        throw deleteError;
      }
    } else {
      const { error: upsertError } = await supabase
        .from('article_reactions')
        .upsert(
          {
            article_id: validatedArticleId,
            user_id: user.id,
            reaction,
          },
          { onConflict: 'article_id,user_id' }
        );

      if (upsertError) {
        logger.error('Error upserting article reaction', upsertError);
        throw upsertError;
      }
    }

    // Пересчёт лайков/дизлайков и обновление агрегатов в articles
    const [
      { count: likesCountRaw, error: likesError },
      { count: dislikesCountRaw, error: dislikesError },
    ] = await Promise.all([
      supabase
        .from('article_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', validatedArticleId)
        .eq('reaction', 'like'),
      supabase
        .from('article_reactions')
        .select('*', { count: 'exact', head: true })
        .eq('article_id', validatedArticleId)
        .eq('reaction', 'dislike'),
    ]);

    if (likesError) {
      logger.error('Error fetching likes count', likesError);
      throw likesError;
    }
    if (dislikesError) {
      logger.error('Error fetching dislikes count', dislikesError);
      throw dislikesError;
    }

    const likesCount = likesCountRaw ?? 0;
    const dislikesCount = dislikesCountRaw ?? 0;

    const { error: updateAggError } = await supabase
      .from('articles')
      .update({
        likes_count: likesCount,
        dislikes_count: dislikesCount,
      })
      .eq('id', validatedArticleId);

    if (updateAggError) {
      logger.error('Error updating article aggregates', updateAggError);
      throw updateAggError;
    }

    // Возвращаем свежую статью, но поверх ставим пересчитанные значения,
    // чтобы UI сразу увидел актуальные лайки/дизлайки.
    const article = await getArticle(articleId);
    return {
      ...article,
      likes: likesCount,
      dislikes: dislikesCount,
    };
  } catch (error: any) {
    logger.error('Error in reactToArticle', error);
    throw error;
  }
}

/**
 * Toggle закладки
 */
export async function toggleBookmark(articleId: string): Promise<{ isBookmarked: boolean }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Валидация ID (UUID)
    const validatedArticleId = (() => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      
      if (!articleId || (typeof articleId !== 'string')) {
        throw new Error(`Invalid article ID: ${articleId}`);
      }
      
      if (!uuidRegex.test(articleId) && !uuidNoDashesRegex.test(articleId)) {
        throw new Error(`Invalid article ID format (expected UUID): ${articleId}`);
      }
      
      return articleId;
    })();

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
 * Получить трендовые статьи (по просмотрам)
 */
export async function getTrendingArticles(
  _userId?: string | number,
  limit: number = 5
): Promise<Article[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const { data, error } = await supabase.rpc('search_articles', {
      p_search: null,
      p_tags: null,
      p_difficulty: null,
      p_sort: 'popular',
      p_skip: 0,
      p_take: limit,
      p_user_id: userId || null,
    });

    if (error) {
      logger.error('Error fetching trending articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => transformArticle(item, userId));
  } catch (error: any) {
    logger.error('Error in getTrendingArticles', error);
    throw error;
  }
}

/**
 * Поиск статей (для обратной совместимости)
 */
export async function searchArticles(
  searchQuery: string,
  _userId?: string | number,
  start: number = 0,
  limit: number = 10,
  extraFilters?: Partial<Omit<ArticleQueryParams, 'page' | 'pageSize' | 'search'>>
): Promise<ArticlesResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const rpcPayload: Record<string, any> = {
      p_search: searchQuery && searchQuery.trim().length >= 2 ? searchQuery.trim() : null,
      p_tags: null,
      p_difficulty: null,
      p_sort: 'newest',
      p_skip: start,
      p_take: limit,
      p_user_id: userId || null,
      p_category: extraFilters?.category?.trim() || null,
      p_author_id: extraFilters?.authorId?.trim() || null,
      p_language: extraFilters?.language?.trim() || null,
      p_published_from: extraFilters?.publishedFrom || null,
      p_published_to: extraFilters?.publishedTo || null,
      p_min_read_minutes: typeof extraFilters?.minReadMinutes === 'number' ? extraFilters?.minReadMinutes : null,
      p_min_reactions: typeof extraFilters?.minReactions === 'number' ? extraFilters?.minReactions : null,
      p_min_views: typeof extraFilters?.minViews === 'number' ? extraFilters?.minViews : null,
    };

    const { data, error } = await supabase.rpc('search_articles', rpcPayload as any);

    if (error) {
      logger.error('Error searching articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    }

    const total = data[0]?.total_count || 0;
    const articles = data.map((item: any) => transformArticle(item, userId));

    return {
      data: articles,
      total: Number(total),
    };
  } catch (error: any) {
    logger.error('Error in searchArticles', error);
    throw error;
  }
}

/**
 * Реакция на статью (для обратной совместимости)
 */
export async function reactArticle(
  articleId: string,
  reaction: 'like' | 'dislike'
): Promise<Article> {
  return reactToArticle(articleId, reaction);
}

