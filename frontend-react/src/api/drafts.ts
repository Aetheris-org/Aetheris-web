/**
 * Drafts API using Supabase REST API
 * Замена для drafts-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { Article } from '@/types/article';
import { transformArticle } from './articles';

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
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .eq('author_id', user.id)
      .is('published_at', null)
      .order('updated_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching drafts', error);
      throw error;
    }

    return (data || []).map((article: any) => transformArticle(article, user.id));
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
      .from('articles')
      .select(`
        *,
        author:profiles!articles_author_id_fkey (
          id,
          username,
          avatar,
          name
        )
      `)
      .eq('id', parseInt(id))
      .eq('author_id', user.id)
      .is('published_at', null)
      .single();

    if (error) {
      logger.error('Error fetching draft', error);
      throw error;
    }

    if (!data) {
      throw new Error('Draft not found');
    }

    return transformArticle(data, user.id);
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

    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        difficulty: data.difficulty,
        preview_image: data.previewImage || null,
        author_id: user.id,
        published_at: null, // Черновик
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
      logger.error('Error creating draft', error);
      throw error;
    }

    return transformArticle(article, user.id);
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
      .from('articles')
      .select('author_id, published_at')
      .eq('id', parseInt(id))
      .single();

    if (!existingDraft) {
      throw new Error('Draft not found');
    }

    if (existingDraft.author_id !== user.id) {
      throw new Error('You can only edit your own drafts');
    }

    if (existingDraft.published_at !== null) {
      throw new Error('Cannot update published article as draft');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
    if (data.previewImage !== undefined) updateData.preview_image = data.previewImage;

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', parseInt(id))
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
      logger.error('Error updating draft', error);
      throw error;
    }

    return transformArticle(article, user.id);
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
      .from('articles')
      .select('author_id, published_at')
      .eq('id', parseInt(id))
      .single();

    if (!existingDraft) {
      throw new Error('Draft not found');
    }

    if (existingDraft.author_id !== user.id) {
      throw new Error('You can only delete your own drafts');
    }

    if (existingDraft.published_at !== null) {
      throw new Error('Cannot delete published article');
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', parseInt(id));

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

