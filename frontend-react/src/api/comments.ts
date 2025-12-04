/**
 * Comments API using Supabase REST API
 * Замена для comments-graphql.ts
 */
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface CommentAuthor {
  id: number | string;
  username: string;
  avatar?: string;
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

  return {
    id: String(raw.id),
    text: raw.text || '',
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || undefined,
    author: {
      id: author.id || raw.author_id,
      username: author.username || '',
      avatar: author.avatar || undefined,
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
        author:users!comments_author_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .eq('article_id', parseInt(articleId))
      .order('created_at', { ascending: true })
      .range(skip, skip + take - 1);

    if (error) {
      logger.error('Error fetching comments', error);
      throw error;
    }

    // Получаем реакции пользователя для каждого комментария
    const commentsWithReactions = await Promise.all(
      (data || []).map(async (comment) => {
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

    const comments = commentsWithReactions.map((c) => transformComment(c, user?.id));

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
        text: data.text,
        article_id: parseInt(data.articleId),
        author_id: user.id,
        parent_id: data.parentId ? parseInt(data.parentId) : null,
      })
      .select(`
        *,
        author:users!comments_author_id_fkey (
          id,
          username,
          avatar
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
      .eq('id', parseInt(id))
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
      .eq('id', parseInt(id))
      .select(`
        *,
        author:users!comments_author_id_fkey (
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
      .eq('id', parseInt(id))
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
      .eq('id', parseInt(id));

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

    // Проверяем существующую реакцию
    const { data: existing } = await supabase
      .from('comment_reactions')
      .select('reaction')
      .eq('comment_id', parseInt(commentId))
      .eq('user_id', user.id)
      .single();

    if (existing && existing.reaction === reaction) {
      // Удаляем реакцию (toggle off)
      await supabase
        .from('comment_reactions')
        .delete()
        .eq('comment_id', parseInt(commentId))
        .eq('user_id', user.id);
    } else {
      // Создаем или обновляем реакцию
      await supabase
        .from('comment_reactions')
        .upsert({
          comment_id: parseInt(commentId),
          user_id: user.id,
          reaction: reaction,
        }, {
          onConflict: 'comment_id,user_id',
        });
    }

    // Получаем обновленный комментарий
    const { data: comment } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey (
          id,
          username,
          avatar
        )
      `)
      .eq('id', parseInt(commentId))
      .single();

    if (!comment) {
      throw new Error('Comment not found');
    }

    // Получаем реакцию пользователя
    const { data: userReaction } = await supabase
      .from('comment_reactions')
      .select('reaction')
      .eq('comment_id', parseInt(commentId))
      .eq('user_id', user.id)
      .single();

    return transformComment({
      ...comment,
      user_reaction: userReaction?.reaction || null,
    }, user.id);
  } catch (error: any) {
    logger.error('Error in reactToComment', error);
    throw error;
  }
}

