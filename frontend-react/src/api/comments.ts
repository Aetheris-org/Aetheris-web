/**
 * Comments API using Supabase REST API
 * Замена для comments-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

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

    // Проверяем существующую реакцию
    const { data: existing } = await supabase
      .from('comment_reactions')
      .select('reaction')
      .eq('comment_id', validatedCommentId)
      .eq('user_id', user.id)
      .single();

    if (existing && existing.reaction === reaction) {
      // Удаляем реакцию (toggle off)
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', validatedCommentId)
        .eq('user_id', user.id);
    } else {
      // Создаем или обновляем реакцию
      await supabase
        .from('comment_reactions')
        .upsert({
          comment_id: validatedCommentId,
          user_id: user.id,
          reaction: reaction,
        }, {
          onConflict: 'comment_id,user_id',
        });
    }

    // Пересчёт лайков/дизлайков и обновление агрегатов в comments
    const [
      { count: likesCountRaw, error: likesError },
      { count: dislikesCountRaw, error: dislikesError },
    ] = await Promise.all([
      supabase
        .from('comment_reactions')
        .select('id', { head: true, count: 'exact' })
        .eq('comment_id', validatedCommentId)
        .eq('reaction', 'like'),
      supabase
        .from('comment_reactions')
        .select('id', { head: true, count: 'exact' })
        .eq('comment_id', validatedCommentId)
        .eq('reaction', 'dislike'),
    ]);

    if (likesError) {
      logger.error('Error fetching comment likes count', likesError);
      throw likesError;
    }
    if (dislikesError) {
      logger.error('Error fetching comment dislikes count', dislikesError);
      throw dislikesError;
    }

    const likesCount = likesCountRaw ?? 0;
    const dislikesCount = dislikesCountRaw ?? 0;

    const { error: updateAggError } = await supabase
      .from('comments')
      .update({
        likes_count: likesCount,
        dislikes_count: dislikesCount,
      })
      .eq('id', validatedCommentId);

    if (updateAggError) {
      logger.error('Error updating comment aggregates', updateAggError);
      throw updateAggError;
    }

    // Получаем обновленный комментарий
    const { data: comment } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .eq('id', validatedCommentId)
      .single();

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Текущая реакция пользователя после операции
    const userReaction =
      existing && existing.reaction === reaction ? null : reaction;

    return transformComment({
      ...comment,
      likes_count: likesCount,
      dislikes_count: dislikesCount,
      user_reaction: userReaction,
    }, user.id);
  } catch (error: any) {
    logger.error('Error in reactToComment', error);
    throw error;
  }
}

