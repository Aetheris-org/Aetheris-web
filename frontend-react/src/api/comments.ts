/**
 * Comments API using Supabase REST API
 * Замена для comments-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { TrendingPeriod } from '@/api/articles';

function validateUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numericRegex = /^\d+$/;

  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ID: ${id}`);
  }

  if (uuidRegex.test(id) || numericRegex.test(id)) {
    return id;
  }

  throw new Error(`Invalid ID format: ${id}`);
}

export interface CommentAuthor {
  id: number | string; // Может быть UUID (string) или числовой ID
  username: string;
  avatar?: string;
  uuid?: string; // UUID для навигации к профилю
  tag?: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
  author: CommentAuthor;
  parentId?: string | null;
  likes?: number;
  dislikes?: number;
  userReaction?: 'like' | 'dislike' | null;
}

interface CommentMeta {
  total?: number;
  start?: number;
  limit?: number;
}

function transformComment(raw: any, _userId?: string): Comment {
  const author = typeof raw.author === 'object' && raw.author !== null
    ? raw.author
    : { id: raw.author_id, username: '', avatar: null };

  // author.id из Supabase - это UUID (строка)
  const authorId = author.id || raw.author_id;

  return {
    id: String(raw.id),
    text: raw.text || raw.content || '',
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || undefined,
    author: {
      id: authorId, // UUID из базы данных
      uuid: typeof authorId === 'string' ? authorId : undefined, // Сохраняем UUID для навигации
      username: author.username || '',
      avatar: author.avatar || undefined,
      tag: author.tag || undefined,
    },
    parentId: raw.parent_id ? String(raw.parent_id) : null,
    likes: raw.likes_count || 0,
    dislikes: raw.dislikes_count || 0,
    userReaction: raw.user_reaction || null,
  };
}

/**
 * Получить комментарии к статье
 */
export async function getArticleComments(
  articleId: string,
  options: { start?: number; limit?: number } = {}
): Promise<{ comments: Comment[]; meta: CommentMeta }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const skip = options.start || 0;
    const take = options.limit || 1000;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar,
          tag
        )
      `)
      .eq('article_id', validateUuid(articleId))
      .order('created_at', { ascending: true })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching comments', error);
      throw error;
    }

    // Получаем реакции пользователя для каждого комментария
    const commentsWithReactions = await Promise.all(
      (data || []).map(async (comment: any) => {
        if (!user) {
          return { ...comment, user_reaction: null };
        }

        const { data: reaction } = await supabase
          .from('comment_reactions')
          .select('reaction')
          .eq('comment_id', comment.id)
          .eq('user_id', user.id)
          .single();

        return {
          ...comment,
          user_reaction: reaction?.reaction || null,
        };
      })
    );

    const comments = commentsWithReactions.map((c: any) => transformComment(c, user?.id));

    return {
      comments,
      meta: {
        total: comments.length,
        start: skip,
        limit: take,
      },
    };
  } catch (error: any) {
    logger.error('Error in getArticleComments', error);
    throw error;
  }
}

/**
 * Создать комментарий
 */
export async function createComment(data: {
  articleId: string;
  text: string;
  parentId?: string | null;
}): Promise<Comment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        // Некоторые схемы используют "content" как not-null; дублируем в оба поля на всякий случай
        text: data.text,
        content: data.text,
        article_id: validateUuid(data.articleId),
        author_id: user.id,
        parent_id: data.parentId ? validateUuid(data.parentId) : null,
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar,
          tag
        )
      `)
      .single();

    if (error) {
      logger.error('Error creating comment', error);
      throw error;
    }

    return transformComment(comment, user.id);
  } catch (error: any) {
    logger.error('Error in createComment', error);
    throw error;
  }
}

/**
 * Обновить комментарий
 */
export async function updateComment(
  id: string,
  data: { text: string }
): Promise<Comment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Проверяем права доступа
    const { data: existingComment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', validateUuid(id))
      .single();

    if (!existingComment) {
      throw new Error('Comment not found');
    }

    if (existingComment.author_id !== user.id) {
      throw new Error('You can only edit your own comments');
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ text: data.text })
      .eq('id', validateUuid(id))
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      logger.error('Error updating comment', error);
      throw error;
    }

    return transformComment(comment, user.id);
  } catch (error: any) {
    logger.error('Error in updateComment', error);
    throw error;
  }
}

/**
 * Удалить комментарий
 */
export async function deleteComment(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Проверяем права доступа
    const { data: existingComment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', validateUuid(id))
      .single();

    if (!existingComment) {
      throw new Error('Comment not found');
    }

    if (existingComment.author_id !== user.id) {
      throw new Error('You can only delete your own comments');
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', validateUuid(id));

    if (error) {
      logger.error('Error deleting comment', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    logger.error('Error in deleteComment', error);
    throw error;
  }
}

/**
 * Реакция на комментарий (like/dislike)
 */
export async function reactToComment(
  commentId: string,
  reaction: 'like' | 'dislike'
): Promise<Comment> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const validatedCommentId = validateUuid(commentId);

    // Получаем текущие агрегаты, обновляем локально без дополнительных count-запросов
    const { data: commentRow, error: fetchCommentError } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar
        )
        `
      )
      .eq('id', validatedCommentId)
      .maybeSingle()

    if (fetchCommentError || !commentRow) {
      logger.warn('Comment not found after reaction, returning fallback', fetchCommentError);
      return transformComment({
        id: validatedCommentId,
        text: '',
        created_at: new Date().toISOString(),
        author: { id: user.id, username: user.email || '' },
        parent_id: null,
        likes_count: 0,
        dislikes_count: 0,
        user_reaction: reaction,
      }, user.id);
    }

    // Пробуем вызвать серверную функцию для установки реакции и пересчёта
    const { data: rpcData, error: rpcError } = await supabase.rpc('set_comment_reaction', {
      p_comment_id: validatedCommentId,
      p_user_id: user.id,
      p_reaction: reaction,
    })

    console.log('[reactToComment] RPC call result:', {
      rpcData,
      rpcError,
      rpcDataType: typeof rpcData,
      isArray: Array.isArray(rpcData),
      arrayLength: Array.isArray(rpcData) ? rpcData.length : 'N/A'
    })

    if (!rpcError && rpcData) {
      // RPC возвращает JSON объект, а не массив
      const rpc = rpcData
      const userReaction = rpc.user_reaction as 'like' | 'dislike' | null

      console.log('[reactToComment] Processing RPC response:', {
        likes_count: rpc.likes_count,
        dislikes_count: rpc.dislikes_count,
        user_reaction: userReaction
      })

      return transformComment(
        {
          ...commentRow,
          likes_count: rpc.likes_count ?? commentRow.likes_count ?? 0,
          dislikes_count: rpc.dislikes_count ?? commentRow.dislikes_count ?? 0,
          user_reaction: userReaction,
        },
        user.id
      )
    }

    if (rpcError) {
      logger.warn('RPC set_comment_reaction failed, falling back to local toggle', rpcError)
    }

    // Фолбэк: локально пересчитываем (если RPC недоступен)
    const prev = commentRow.user_reaction as 'like' | 'dislike' | null
    let newLikes = commentRow.likes_count || 0
    let newDislikes = commentRow.dislikes_count || 0

    if (prev === 'like') newLikes -= 1
    else if (prev === 'dislike') newDislikes -= 1

    if (prev !== reaction) {
      if (reaction === 'like') newLikes += 1
      else newDislikes += 1
    }

    return transformComment(
      {
        ...commentRow,
        likes_count: newLikes,
        dislikes_count: newDislikes,
        user_reaction: prev === reaction ? null : reaction,
      },
      user.id
    )
  } catch (error: any) {
    logger.error('Error in reactToComment', error);
    throw error;
  }
}

const TOP_COMMENT_PERIOD_DAYS: Record<TrendingPeriod, number> = {
  day: 1,
  week: 7,
  month: 30,
  year: 365,
};

/**
 * Получить самый популярный комментарий за период (по лайкам).
 * Возвращает комментарий и данные статьи для перехода.
 */
export async function getTopComment(
  period: TrendingPeriod = 'week'
): Promise<{ comment: Comment; article: { id: string; title: string } } | null> {
  try {
    const days = TOP_COMMENT_PERIOD_DAYS[period];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar,
          tag
        ),
        article:articles!comments_article_id_fkey (
          id,
          title
        )
      `
      )
      .gte('created_at', since)
      .order('likes_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching top comment', error);
      return null;
    }

    if (!data || !data.article) {
      return null;
    }

    const article = data.article as { id: string; title: string };
    const comment = transformComment(data, undefined);

    return {
      comment,
      article: { id: String(article.id), title: article.title || '' },
    };
  } catch (error: any) {
    logger.error('Error in getTopComment', error);
    return null;
  }
}

