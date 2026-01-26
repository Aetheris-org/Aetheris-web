/**
 * Articles API using Supabase REST API
 * Замена для articles-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { slateToProseMirror } from '@/lib/slate-to-prosemirror';
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

const applyClientFilters = (articles: Article[], filters: Partial<ArticleQueryParams>): Article[] => {
  const filtered = articles.filter((article) => {
    // Если фильтр категории явно указан и не 'all', фильтруем по категории
    if (filters.category && filters.category !== 'all') {
      if (!article.category || article.category !== filters.category) {
        return false;
      }
    } else {
      // Если фильтр категории не указан (undefined, null, '') или равен 'all', показываем только статьи БЕЗ категории (обычные статьи)
      // Это нужно, чтобы статьи с категорией 'news' или 'changes' не попадали на главную страницу
      if (article.category) {
        // Исключаем статьи с категорией (news, changes и т.д.)
        return false;
      }
    }
    if (filters.language && filters.language !== 'all') {
      if (!article.language || article.language !== filters.language) return false;
    }
    if (filters.authorId && filters.authorId.trim()) {
      const target = filters.authorId.trim();
      const authorIdStr = String(article.author.id ?? '');
      if (authorIdStr !== target) return false;
    }
    if (filters.publishedFrom) {
      const publishedAt = article.publishedAt || article.createdAt;
      if (!publishedAt || new Date(publishedAt) < new Date(filters.publishedFrom)) return false;
    }
    if (filters.publishedTo) {
      const publishedAt = article.publishedAt || article.createdAt;
      if (!publishedAt || new Date(publishedAt) > new Date(filters.publishedTo)) return false;
    }
    if (typeof filters.minReadMinutes === 'number') {
      const readMinutes = article.readTimeMinutes ?? 0;
      if (readMinutes < filters.minReadMinutes) return false;
    }
    if (typeof filters.minReactions === 'number') {
      const reactions = article.reactionsCount ?? (article.likes || 0) + (article.dislikes || 0);
      if (reactions < filters.minReactions) return false;
    }
    if (typeof filters.minViews === 'number') {
      const views = article.views ?? 0;
      if (views < filters.minViews) return false;
    }
    return true;
  });
  
  return filtered;
};

const sortClientArticles = (articles: Article[], sort: ArticleSortOption): Article[] => {
  if (sort === 'popular') {
    return [...articles].sort((a, b) => {
      const viewsA = a.views ?? 0;
      const viewsB = b.views ?? 0;
      if (viewsA !== viewsB) return viewsB - viewsA;
      const reactionsA = (a.likes || 0) + (a.dislikes || 0);
      const reactionsB = (b.likes || 0) + (b.dislikes || 0);
      return reactionsB - reactionsA;
    });
  }
  return articles;
};

// --- Read time helpers ---
const stripHtml = (input: string): string =>
  input
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const extractReadMeta = (raw: any) => {
  const asString = (() => {
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') return JSON.stringify(raw);
    return '';
  })();

  const images = (asString.match(/<(img|picture|figure)\b/gi) || []).length;
  const codeBlocks = (asString.match(/<(pre|code)\b/gi) || []).length;
  const text = stripHtml(asString);
  const words = text ? text.split(/\s+/).length : 0;
  const longTokens =
    text && words > 0
      ? text.split(/\s+/).filter((token) => token.length > 12).length / words
      : 0;

  return { words, images, codeBlocks, longTokensRatio: longTokens };
};

const computeReadTimeMinutes = (article: any): number | undefined => {
  // prefer explicit field if backend provides
  if (typeof article.read_time_minutes === 'number' && article.read_time_minutes > 0) {
    return article.read_time_minutes;
  }

  // Extract content from various possible formats
  let contentToAnalyze = '';
  if (article.content) {
    if (typeof article.content === 'string') {
      contentToAnalyze = article.content;
    } else if (Array.isArray(article.content)) {
      // Handle Slate.js content array
      contentToAnalyze = article.content.map((block: any) =>
        typeof block === 'object' && block.children
          ? block.children.map((child: any) => child.text || '').join(' ')
          : typeof block === 'string' ? block : ''
      ).join(' ');
    } else if (typeof article.content === 'object' && article.content.document) {
      // Handle TipTap/ProseMirror content
      contentToAnalyze = JSON.stringify(article.content);
    }
  }

  // Fallback to excerpt if content is empty
  if (!contentToAnalyze && article.excerpt) {
    contentToAnalyze = article.excerpt;
  }

  const { words, images, codeBlocks, longTokensRatio } = extractReadMeta(contentToAnalyze);

  // Debug logging

  // Ensure we have at least some words to work with
  if (!words || Number.isNaN(words) || words < 10) {
    // For very short content, use a minimum read time based on content length
    if (contentToAnalyze.length > 100) {
      // If there's content but few words (maybe it's code or images), estimate based on length
      const estimatedWords = Math.max(10, contentToAnalyze.length / 6); // rough estimate
      const language = article.language || article.locale;
      const wpm = language === 'ru' ? 180 : 200;
      const minutes = Math.max(1, Math.round((estimatedWords / wpm) * 2) / 2);
      return Math.min(minutes, 10); // cap at 10 minutes for safety
    }
    // For very short content, use a minimum read time
    return 1;
  }

  const language = article.language || article.locale;
  const wpm = language === 'ru' ? 180 : 200;

  let baseSeconds = (words / wpm) * 60;
  baseSeconds += images * 10; // average glance per image
  baseSeconds += codeBlocks * 25; // code takes longer

  if (longTokensRatio > 0.12) {
    baseSeconds *= 1.1; // technical/long words bump
  }

  const minutes = baseSeconds / 60;

  // round to nearest 0.5, min 1 min, max reasonable limit
  const rounded = Math.max(1, Math.min(60, Math.round(minutes * 2) / 2));
  return Number.isFinite(rounded) ? rounded : 1;
};

// Трансформация данных из Supabase в формат Article
export function transformArticle(article: any, _userId?: string): Article {
  const rawContent = article.content ?? { document: [] };

  // Пытаемся распарсить JSON-строку, если content приходит строкой
  let contentJSON: any = null;
  let content: any = '';


  if (typeof rawContent === 'string') {
    try {
      const parsed = JSON.parse(rawContent);
      // Проверяем формат - если это уже ProseMirror формат (type: 'doc'), используем как есть
      if (parsed && typeof parsed === 'object' && parsed.type === 'doc') {
        contentJSON = parsed;
      } else if (Array.isArray(parsed)) {
        // Это массив - проверяем, Slate это или нет
        const isSlateFormat = parsed.length > 0 && parsed.some((block: any) => 
          block && typeof block === 'object' && block.type && Array.isArray(block.children) && !block.content
        );
        
      if (isSlateFormat) {
        contentJSON = slateToProseMirror(parsed);
      } else {
        // Не Slate - оборачиваем как есть
        contentJSON = { type: 'doc', content: parsed };
      }
      } else {
        contentJSON = parsed;
      }
      content = rawContent; // сохраняем оригинал для HTML fallback
    } catch {
      content = rawContent; // обычный HTML
      contentJSON = null;
    }
  } else if (Array.isArray(rawContent)) {
    // Массив может быть либо Slate форматом, либо нужно обернуть в ProseMirror doc
    // Проверяем, есть ли уже тип 'doc' в первом элементе (не должно быть)
    if (rawContent.length > 0 && rawContent[0] && rawContent[0].type === 'doc') {
      // Уже ProseMirror формат, но в массиве
      contentJSON = rawContent[0];
    } else {
      // Это Slate формат - нужно конвертировать в ProseMirror
      // Проверяем, является ли это Slate форматом (есть type и children вместо content)
      const isSlateFormat = rawContent.length > 0 && rawContent.some((block: any) => 
        block && typeof block === 'object' && block.type && Array.isArray(block.children) && !block.content
      );
      
      if (isSlateFormat) {
        try {
          contentJSON = slateToProseMirror(rawContent);
        } catch (e) {
          // Fallback: оборачиваем в ProseMirror doc без конвертации
          contentJSON = { type: 'doc', content: rawContent };
        }
      } else {
        // Не Slate формат - оборачиваем как есть
        contentJSON = { type: 'doc', content: rawContent };
      }
    }
    content = rawContent;
  } else if (rawContent && typeof rawContent === 'object') {
    // Если это уже ProseMirror формат (type: 'doc'), используем как есть
    if (rawContent.type === 'doc') {
      contentJSON = rawContent;
    } else if (rawContent.document && Array.isArray(rawContent.document)) {
      // Старый формат KeystoneJS { document: [...] }
      contentJSON = { type: 'doc', content: rawContent.document };
    } else {
      // Другой объект - возможно уже правильный формат
      contentJSON = rawContent;
    }
    content = rawContent;
  } else {
    content = '';
    contentJSON = null;
  }

  // Преобразуем author из JSONB объекта/строки
  let parsedAuthor: any = null;
  if (typeof article.author === 'string') {
    try {
      parsedAuthor = JSON.parse(article.author);
    } catch {
      parsedAuthor = null;
    }
  }

  const authorSource = parsedAuthor || article.author;
  const authorSourceString = typeof article.author === 'string' && !parsedAuthor ? article.author : '';

  const author = typeof authorSource === 'object' && authorSource !== null
    ? authorSource
    : {
        id: article.author_id,
        username: article.author_username || '',
        nickname: article.author_nickname || '',
        tag: article.author_tag || '',
        avatar: null,
      };

  // Fallbacks: RPC/joins may surface username under different nested keys
  const pickUsername = (source: any): string => {
    if (!source || typeof source !== 'object') return '';
    return (
      source.username ||
      source.full_name ||
      source.display_name ||
      source.user_name || // alt casing
      source.profile_username ||
      source.handle ||
      source.name ||
      ''
    );
  };

  const authorUsername =
    (typeof authorSource === 'string' ? authorSourceString : '') ||
    pickUsername(author) ||
    article.author_username ||
    article.author_full_name ||
    article.author_fullname ||
    article.author_display_name ||
    pickUsername(article.author_profile) ||
    pickUsername(article.profile) ||
    pickUsername(article.profiles) ||
    pickUsername(article.user) ||
    pickUsername(article.users) ||
    pickUsername(article.created_by) ||
    article.username ||
    '';

  // author.id из Supabase - это UUID (строка)
  const authorId = author.id || article.author_id;

  const publishedAt =
    article.published_at
      ? new Date(article.published_at).toISOString()
      : article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined;

  const reactionsCount = (article.likes_count || 0) + (article.dislikes_count || 0);

  // Приоритет: поле из базы > расчет
  const readTimeMinutes = (() => {
    // Сначала проверяем поле из базы данных
    const dbMinutes = article.read_time_minutes;
    if (typeof dbMinutes === 'number' && dbMinutes > 0 && dbMinutes <= 60) {
      return dbMinutes;
    }
    // Если поле пустое или некорректное, рассчитываем
    return computeReadTimeMinutes(article);
  })();
  const views =
    article.views ??
    article.views_count ??
    (article as any)?.view_count ??
    (article as any)?.viewsCount ??
    (article as any)?.stats?.views ??
    0;



  return {
    id: String(article.id),
    title: article.title || '',
    content: content,
    contentJSON: contentJSON,
    excerpt: article.excerpt || '',
    author: {
      id: authorId, // UUID из базы данных
      uuid: typeof authorId === 'string' ? authorId : undefined, // Сохраняем UUID для навигации
      username: authorUsername,
      nickname: author.nickname || '',
      tag: author.tag || '',
      avatar: author.avatar || null,
    },
    previewImage: article.preview_image || article.previewImage || article.cover_url || null,
    tags: Array.isArray(article.tags) ? article.tags : [],
    difficulty: (article.difficulty || 'medium') as ArticleDifficulty,
    likes: article.likes_count || 0,
    dislikes: article.dislikes_count || 0,
    views,
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

    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      logger.error('[getArticles] Auth error:', authError);
    }
    const userId = user?.id;

    // Используем Database Function для поиска

    // Supabase RPC currently supports only these parameters
    const rpcPayload: Record<string, any> = {
      p_search: search || null,
      p_tags: tags || null,
      p_difficulty: difficulty || null,
      p_sort: sort,
      p_skip: (page - 1) * pageSize,
      p_take: pageSize,
      p_user_id: userId || null,
    };

    const { data, error } = await supabase.rpc('search_articles', rpcPayload as any);


    if (error) {
      logger.error('Error fetching articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    }

    // Извлекаем total_count из первой строки результата (COUNT(*) OVER() возвращает одинаковое значение для всех строк)
    const totalCountFromRPC = data[0]?.total_count ? Number(data[0].total_count) : 0;

    // Трансформируем данные
    const articles = data.map((item: any) => {
      return transformArticle(item, userId);
    });


    const filtered = applyClientFilters(articles, {
      category,
      authorId,
      language,
      publishedFrom,
      publishedTo,
      minReadMinutes,
      minReactions,
      minViews,
    });


    const sorted = sortClientArticles(filtered, sort);

    // Используем total_count из RPC, но если после клиентской фильтрации количество изменилось,
    // используем большее значение для корректной пагинации
    // Примечание: total_count из RPC показывает количество ДО клиентской фильтрации,
    // но для пагинации это более точное значение, так как пагинация работает на уровне сервера
    const finalTotal = totalCountFromRPC > 0 ? totalCountFromRPC : sorted.length;


    return {
      data: sorted,
      total: finalTotal,
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

    // Поддерживаем UUID и числовые ID
    const normalizeId = (rawId: string): string | number => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      const numericRegex = /^\d+$/;
      if (!rawId || typeof rawId !== 'string') {
        throw new Error(`Invalid article ID: ${rawId}`);
      }
      if (uuidRegex.test(rawId) || uuidNoDashesRegex.test(rawId)) return rawId;
      if (numericRegex.test(rawId)) return Number(rawId);
      throw new Error(`Invalid article ID format (expected UUID or numeric): ${rawId}`);
    };

    const articleId = normalizeId(id);

    // Если id числовой, пытаемся вызвать RPC (без инкремента просмотров)
    if (typeof articleId === 'number') {
      const { data, error } = await supabase.rpc('get_article_with_details', {
        p_article_id: articleId,
        p_user_id: userId,
        p_increment_views: false,
      })

      if (error) {
        logger.warn('RPC get_article_with_details failed, falling back to direct select', error)
      } else if (data && data.length > 0) {
        return transformArticle(data[0], userId)
      }
    }

    // Фолбэк: прямой select без инкремента
    const { data, error } = await supabase
      .from('articles')
      .select(
        `
          *,
          author:profiles!articles_author_id_fkey (
            id,
            username,
            nickname,
            tag,
            avatar
          )
        `
      )
      .eq('id', articleId)
      .single()

    if (error) {
      logger.error('Error fetching article', error)
      throw error
    }

    if (!data) {
      throw new Error('Article not found')
    }

    // Проверяем, что черновики видны только автору
    if (!data.published_at) {
      // Если статья - черновик, проверяем, что текущий пользователь - автор
      if (!userId || data.author_id !== userId) {
        throw new Error('Article not found')
      }
    }


    return transformArticle(data, userId)
  } catch (error: any) {
    logger.error('Error in getArticle', error);
    throw error;
  }
}

/**
 * Отдельно инкрементирует просмотры статьи после порога времени
 */
export async function incrementArticleView(
  id: string | number | undefined,
  userId?: string | number | undefined
): Promise<void> {
  try {
    if (id === undefined || id === null) {
      return;
    }

    const normalizeId = (rawId: string | number): number | null => {
      const raw = typeof rawId === 'number' ? rawId.toString() : rawId
      const numericRegex = /^\d+$/;
      if (numericRegex.test(raw)) return Number(raw);
      return null; // RPC принимает только int4
    };

    const articleId = normalizeId(id);

    if (articleId === null) {
      return;
    }

    const userIdStr =
      userId === undefined || userId === null
        ? undefined
        : typeof userId === 'number'
          ? String(userId)
          : userId

    const { error } = await supabase.rpc('get_article_with_details', {
      p_article_id: articleId,
      p_user_id: userIdStr,
      p_increment_views: true,
    });

    if (error) {
      logger.warn('[incrementArticleView] RPC failed', error);
    }
  } catch (error) {
    logger.warn('[incrementArticleView] unexpected error', error);
  }
}

/**
 * Инкремент просмотров статьи (+1 к views)
 * Каждый пользователь может инкрементить только 1 раз в час для каждой статьи
 * Защита от накрутки просмотров
 */
export async function incrementArticleViews(
  id: string | number | undefined,
  userId: string | number | undefined
): Promise<void> {
  try {
    if (id === undefined || id === null) {
      return;
    }

    const normalizeId = (rawId: string | number): string | null => {
      const raw = typeof rawId === 'number' ? rawId.toString() : rawId
      // Проверяем, является ли строка UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(raw)) return raw;
      return null;
    };

    const articleId = normalizeId(id);

    if (articleId === null) {
      return;
    }

    const userIdStr =
      userId === undefined || userId === null
        ? null
        : typeof userId === 'number'
          ? String(userId)
          : userId

    // Вызываем RPC функцию для инкремента просмотров
    try {
      const { error } = await supabase.rpc('increment_article_views', {
        p_article_id: articleId,
        p_user_id: userIdStr,
      });

      if (error) {
        logger.warn('[incrementArticleViews] RPC failed', error);
      }
    } catch (rpcError) {
      logger.warn('[incrementArticleViews] RPC call failed - function may not exist yet', rpcError);
    }
  } catch (error) {
    logger.warn('[incrementArticleViews] unexpected error', error);
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
  category?: string | null;
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
    const insertData = {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      tags: input.tags,
      difficulty: input.difficulty,
      preview_image: input.previewImage || null,
      published_at: input.publishedAt || null,
      category: input.category || null,
      author_id: user.id,
    };


    const { data, error } = await supabase
      .from('articles')
      .insert(insertData)
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          nickname,
          tag,
          avatar
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
    category?: string | null;
  }
): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }
    // Разрешаем UUID и числовые ID
    const normalizeId = (rawId: string): string | number => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const uuidNoDashesRegex = /^[0-9a-f]{32}$/i;
      const numericRegex = /^\d+$/;
      if (!rawId || typeof rawId !== 'string') {
        throw new Error(`Invalid article ID: ${rawId}`);
      }
      if (uuidRegex.test(rawId) || uuidNoDashesRegex.test(rawId)) return rawId;
      if (numericRegex.test(rawId)) return Number(rawId);
      throw new Error(`Invalid article ID format (expected UUID or numeric): ${rawId}`);
    };

    const articleId = normalizeId(id);

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
    if (input.category !== undefined) updateData.category = input.category;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar
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

    // Проверяем текущую реакцию
    const { data: existing, error: existingError } = await supabase
      .from('article_reactions')
      .select('reaction')
      .eq('article_id', validatedArticleId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error('Error fetching existing article reaction', existingError);
      throw existingError;
    }

    let finalUserReaction: 'like' | 'dislike' | null = null;

    if (existing && existing.reaction === reaction) {
      // Удаляем реакцию (toggle off)
      const { error: deleteError } = await supabase
        .from('article_reactions')
        .delete()
        .eq('article_id', validatedArticleId)
        .eq('user_id', user.id);

      if (deleteError) {
        logger.error('Error deleting article reaction', deleteError);
        throw deleteError;
      }
      finalUserReaction = null;
    } else {
      // Добавляем или изменяем реакцию
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
      finalUserReaction = reaction;
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

    // Возвращаем свежую статью с обновленными значениями
    const article = await getArticle(articleId);

    return {
      ...article,
      likes: likesCount,
      dislikes: dislikesCount,
      userReaction: finalUserReaction,
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

export type TrendingPeriod = 'day' | 'week' | 'month' | 'year';

const TRENDING_PERIOD_DAYS: Record<TrendingPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

function getSinceForPeriod(period: TrendingPeriod): string {
  const days = TRENDING_PERIOD_DAYS[period];
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Получить трендовые статьи за выбранный период (день, неделя, месяц, год).
 * Ранжирование: просмотры и реакции (опубликованные статьи).
 */
export async function getTrendingArticles(
  _userId?: string | number,
  limit: number = 25,
  period: TrendingPeriod = 'week'
): Promise<Article[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const since = getSinceForPeriod(period);

    const { data, error } = await supabase
      .from('articles')
      .select(
        `
          *,
          author:profiles!articles_author_id_fkey (
            id,
            username,
            nickname,
            tag,
            avatar
          )
        `
      )
      .not('published_at', 'is', null)
      .gte('published_at', since)
      .order('views', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching trending articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Доп. сортировка по просмотрам + реакции для более точного тренда
    const withScore = data.map((a: any) => ({
      ...a,
      _score: (a.views || 0) + ((a.likes_count || 0) + (a.dislikes_count || 0)) * 2,
    }));
    withScore.sort((a: any, b: any) => (b._score || 0) - (a._score || 0));

    return withScore.map((item: any) => {
      const { _score, ...rest } = item;
      return transformArticle(rest, userId);
    });
  } catch (error: any) {
    logger.error('Error in getTrendingArticles', error);
    throw error;
  }
}

/**
 * Получить самые популярные теги за период по статьям, опубликованным в этом периоде.
 */
export async function getTrendingPopularTags(
  period: TrendingPeriod = 'week',
  limit: number = 12
): Promise<{ tag: string; count: number }[]> {
  try {
    const since = getSinceForPeriod(period);

    const { data, error } = await supabase
      .from('articles')
      .select('tags')
      .not('published_at', 'is', null)
      .gte('published_at', since)
      .limit(500);

    if (error) {
      logger.error('Error fetching articles for tags', error);
      return [];
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      const tags = Array.isArray(row?.tags) ? row.tags : [];
      for (const t of tags) {
        const tag = String(t || '').trim();
        if (tag) counts[tag] = (counts[tag] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  } catch (error: any) {
    logger.error('Error in getTrendingPopularTags', error);
    return [];
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
    };

    const { data, error } = await supabase.rpc('search_articles', rpcPayload as any);

    if (error) {
      logger.error('Error searching articles', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return { data: [], total: 0 };
    }

    const articles = data.map((item: any) => transformArticle(item, userId));
    const filtered = applyClientFilters(articles, extraFilters || {});
    const sorted = sortClientArticles(filtered, 'popular');

    return {
      data: sorted,
      total: Number(sorted.length),
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

