/**
 * Drafts API using Supabase REST API
 * Работает с отдельной таблицей drafts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Article } from '@/types/article';

/**
 * Преобразование черновика из базы данных в формат Article
 * Структура таблицы drafts:
 * - id: uuid
 * - author_id: uuid
 * - title: text
 * - content: text
 * - summary: text (соответствует excerpt)
 * - cover_url: text (соответствует preview_image)
 * - tags: _text (массив текста)
 * - created_at: timestamptz
 * - updated_at: timestamptz
 */
function transformDraft(draft: any, userId: string): Article {
  // Преобразуем content из text в массив, если это JSON строка
  let contentArray: any[] = [];
  if (typeof draft.content === 'string') {
    try {
      const parsed = JSON.parse(draft.content);
      contentArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Если не JSON, создаем простой массив из текста
      contentArray = [
        {
          type: 'paragraph',
          children: [{ text: draft.content || '' }],
        },
      ];
    }
  } else if (Array.isArray(draft.content)) {
    contentArray = draft.content;
  }

  return {
    id: String(draft.id),
    title: draft.title || '',
    content: contentArray,
    excerpt: draft.summary || '', // summary -> excerpt
    tags: draft.tags || [],
    difficulty: draft.difficulty || 'intermediate', // Если нет в БД, используем дефолт
    previewImage: draft.cover_url || null, // cover_url -> preview_image
    author: draft.author || {
      id: draft.author_id,
      username: draft.author?.username || '',
      avatar: draft.author?.avatar || null,
    },
    likesCount: 0, // Черновики не имеют лайков
    dislikesCount: 0,
    views: 0, // Черновики не имеют просмотров
    createdAt: draft.created_at || new Date().toISOString(),
    updatedAt: draft.updated_at || draft.created_at || new Date().toISOString(),
    publishedAt: null, // Черновики не опубликованы
    isLiked: false,
    isDisliked: false,
    isBookmarked: false,
  };
}

/**
 * Получить все черновики пользователя
 */
export async function getDrafts(skip: number = 0, take: number = 100): Promise<Article[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('drafts')
      .select(`
        *,
        author:profiles (
          id,
          username,
          avatar
        )
      `)
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching drafts', error);
      throw error;
    }

    return (data || []).map((draft: any) => transformDraft(draft, user.id));
  } catch (error: any) {
    logger.error('Error in getDrafts', error);
    throw error;
  }
}

/**
 * Получить черновик по ID
 */
export async function getDraft(id: string): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('drafts')
      .select(`
        *,
        author:profiles (
          id,
          username,
          avatar
        )
      `)
      .eq('id', id)
      .eq('author_id', user.id)
      .single();

    if (error) {
      logger.error('Error fetching draft', error);
      throw error;
    }

    if (!data) {
      throw new Error('Draft not found');
    }

    return transformDraft(data, user.id);
  } catch (error: any) {
    logger.error('Error in getDraft', error);
    throw error;
  }
}

/**
 * Создать черновик
 */
export async function createDraft(data: {
  title: string;
  content: any;
  excerpt: string;
  tags: string[];
  difficulty: string;
  previewImage?: string | null;
}): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Преобразуем content в JSON строку, если это массив
    const contentString = Array.isArray(data.content) 
      ? JSON.stringify(data.content) 
      : (typeof data.content === 'string' ? data.content : JSON.stringify(data.content || []));

    const { data: draft, error } = await supabase
      .from('drafts')
      .insert({
        title: data.title,
        content: contentString, // content как text (JSON строка)
        summary: data.excerpt, // excerpt -> summary
        tags: data.tags,
        cover_url: data.previewImage || null, // preview_image -> cover_url
        author_id: user.id,
      })
      .select(`
        *,
        author:profiles (
          id,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      logger.error('Error creating draft', error);
      throw error;
    }

    return transformDraft(draft, user.id);
  } catch (error: any) {
    logger.error('Error in createDraft', error);
    throw error;
  }
}

/**
 * Обновить черновик
 */
export async function updateDraft(
  id: string,
  data: {
    title?: string;
    content?: any;
    excerpt?: string;
    tags?: string[];
    difficulty?: string;
    previewImage?: string | null;
  }
): Promise<Article> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Проверяем права доступа
    const { data: existingDraft } = await supabase
      .from('drafts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingDraft) {
      throw new Error('Draft not found');
    }

    if (existingDraft.author_id !== user.id) {
      throw new Error('You can only edit your own drafts');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) {
      // Преобразуем content в JSON строку, если это массив
      updateData.content = Array.isArray(data.content) 
        ? JSON.stringify(data.content) 
        : (typeof data.content === 'string' ? data.content : JSON.stringify(data.content || []));
    }
    if (data.excerpt !== undefined) updateData.summary = data.excerpt; // excerpt -> summary
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.previewImage !== undefined) updateData.cover_url = data.previewImage; // preview_image -> cover_url

    const { data: draft, error } = await supabase
      .from('drafts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles (
          id,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      logger.error('Error updating draft', error);
      throw error;
    }

    return transformDraft(draft, user.id);
  } catch (error: any) {
    logger.error('Error in updateDraft', error);
    throw error;
  }
}

/**
 * Удалить черновик
 */
export async function deleteDraft(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Проверяем права доступа
    const { data: existingDraft } = await supabase
      .from('drafts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (!existingDraft) {
      throw new Error('Draft not found');
    }

    if (existingDraft.author_id !== user.id) {
      throw new Error('You can only delete your own drafts');
    }

    const { error } = await supabase
      .from('drafts')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting draft', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    logger.error('Error in deleteDraft', error);
    throw error;
  }
}

